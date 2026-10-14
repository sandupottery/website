/**
 * Il lato server della pagina `/admin`, usato dalle Pages Functions in
 * `functions/`. Tre cose: chi sta chiedendo (Cloudflare Access), dove sta il
 * calendario (un file nel repository, letto e scritto con l'API di GitHub),
 * e come applicarci una modifica.
 *
 * Gira dentro workerd, non dentro Next: solo API web (fetch, crypto.subtle),
 * e solo import relativi, perché wrangler gli alias `@/` non li conosce.
 */

import iniziale from "../content/calendario.json";
import {
	type DatiCalendario,
	type MercatoDati,
	nuovoId,
	type RicorrenzaDati,
	serializza,
	slug,
	valida,
} from "../lib/calendario";

export type Ambiente = {
	/** Il dominio del team Access, es. «sandupottery.cloudflareaccess.com». */
	ACCESS_TEAM?: string;
	/** L'«Application Audience (AUD) Tag» dell'applicazione Access di /admin (più d'uno: separati da virgole). */
	ACCESS_AUD?: string;
	/** Token a grana fine: Contents read/write e Actions read, solo su questo repository. */
	GITHUB_TOKEN?: string;
	GITHUB_REPO?: string;
	GITHUB_BRANCH?: string;
	/**
	 * «1» soltanto in locale (`wrangler pages dev`): niente Access, niente
	 * GitHub, il calendario vive in memoria. In produzione non va mai messo.
	 */
	SVILUPPO?: string;
};

export type Operazione =
	| { tipo: "mercato"; voce: MercatoDati }
	| { tipo: "elimina-mercato"; id: string }
	| { tipo: "ricorrenza"; voce: RicorrenzaDati }
	| { tipo: "elimina-ricorrenza"; id: string }
	| { tipo: "pulisci-passate"; oggi: string };

export class ErroreUtente extends Error {
	constructor(
		messaggio: string,
		readonly stato = 400,
	) {
		super(messaggio);
	}
}

const FILE = "src/content/calendario.json";

// ─── chi sta chiedendo ───

const b64url = (s: string) => {
	const b = atob(
		s
			.replace(/-/g, "+")
			.replace(/_/g, "/")
			.padEnd(Math.ceil(s.length / 4) * 4, "="),
	);
	return Uint8Array.from(b, (c) => c.charCodeAt(0));
};
const testoB64url = (s: string) => new TextDecoder().decode(b64url(s));

type Chiave = JsonWebKey & { kid?: string };
let chiavi: { quando: number; chiavi: Chiave[] } | null = null;

/**
 * La posta di chi è entrato, oppure null.
 *
 * Access sta davanti a /admin e /api, ma la funzione non si fida del solo
 * fatto di essere stata raggiunta: lo stesso sito risponde anche su
 * `*.pages.dev`, dove Access non c'è. Quindi verifica da sé il token firmato
 * che Access aggiunge a ogni richiesta — firma, destinatario, emittente,
 * scadenza. Senza le due variabili di Access configurate non entra nessuno.
 */
export async function chiEntra(richiesta: Request, env: Ambiente): Promise<string | null> {
	if (env.SVILUPPO === "1") return "prova@localhost";
	const team = env.ACCESS_TEAM;
	const aud = env.ACCESS_AUD;
	const token = richiesta.headers.get("Cf-Access-Jwt-Assertion");
	if (!team || !aud || !token) return null;

	const [h, p, s] = token.split(".");
	if (!h || !p || !s) return null;
	try {
		const testa = JSON.parse(testoB64url(h)) as { alg?: string; kid?: string };
		const corpo = JSON.parse(testoB64url(p)) as {
			aud?: string | string[];
			exp?: number;
			iss?: string;
			email?: string;
		};
		if (testa.alg !== "RS256") return null;

		if (!chiavi || Date.now() - chiavi.quando > 3_600_000) {
			const r = await fetch(`https://${team}/cdn-cgi/access/certs`);
			if (!r.ok) return null;
			chiavi = { quando: Date.now(), chiavi: ((await r.json()) as { keys: Chiave[] }).keys };
		}
		const jwk = chiavi.chiavi.find((k) => k.kid === testa.kid);
		if (!jwk) return null;

		const chiave = await crypto.subtle.importKey(
			"jwk",
			jwk,
			{ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
			false,
			["verify"],
		);
		const buona = await crypto.subtle.verify(
			"RSASSA-PKCS1-v1_5",
			chiave,
			b64url(s),
			new TextEncoder().encode(`${h}.${p}`),
		);
		const destinatari = Array.isArray(corpo.aud) ? corpo.aud : [corpo.aud];
		// Più tag separati da virgole: se /admin e /api finiscono in due
		// applicazioni Access diverse, ognuna ha il suo.
		const ammessi = aud.split(",").map((x) => x.trim());
		if (!buona || !destinatari.some((d) => d !== undefined && ammessi.includes(d))) return null;
		if (corpo.iss !== `https://${team}`) return null;
		if (!corpo.exp || corpo.exp * 1000 < Date.now()) return null;
		return corpo.email ?? null;
	} catch {
		return null;
	}
}

// ─── dove sta il calendario ───

/** In locale, al posto del repository. */
let memoria: { dati: DatiCalendario; versione: number; salvato: number } = {
	dati: iniziale as DatiCalendario,
	versione: 0,
	salvato: 0,
};

const gh = (env: Ambiente, percorso: string, init: RequestInit = {}) =>
	fetch(`https://api.github.com/repos/${env.GITHUB_REPO ?? "sandupottery/website"}${percorso}`, {
		...init,
		headers: {
			Authorization: `Bearer ${env.GITHUB_TOKEN}`,
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
			"User-Agent": "sandupottery-admin",
			...(init.body ? { "Content-Type": "application/json" } : {}),
		},
	});

const ramo = (env: Ambiente) => env.GITHUB_BRANCH ?? "feat/sito-definitivo";

const daBase64 = (s: string) =>
	new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g, "")), (c) => c.charCodeAt(0)));
const aBase64 = (s: string) => {
	let b = "";
	for (const x of new TextEncoder().encode(s)) b += String.fromCharCode(x);
	return btoa(b);
};

export async function leggi(env: Ambiente): Promise<{ dati: DatiCalendario; sha: string }> {
	if (env.SVILUPPO === "1")
		return { dati: structuredClone(memoria.dati), sha: String(memoria.versione) };
	if (!env.GITHUB_TOKEN)
		throw new ErroreUtente("Il collegamento con GitHub non è configurato.", 500);
	const r = await gh(env, `/contents/${FILE}?ref=${encodeURIComponent(ramo(env))}`);
	if (!r.ok) throw new ErroreUtente(`GitHub non risponde (${r.status}).`, 502);
	const j = (await r.json()) as { content: string; sha: string };
	return { dati: JSON.parse(daBase64(j.content)), sha: j.sha };
}

/** Scrive se nessuno ha scritto nel frattempo; altrimenti `null`, e si riprova. */
async function scrivi(
	env: Ambiente,
	dati: DatiCalendario,
	sha: string,
	messaggio: string,
): Promise<string | null> {
	if (env.SVILUPPO === "1") {
		if (sha !== String(memoria.versione)) return null;
		memoria = { dati, versione: memoria.versione + 1, salvato: Date.now() };
		return `locale-${memoria.versione}`;
	}
	const r = await gh(env, `/contents/${FILE}`, {
		method: "PUT",
		body: JSON.stringify({
			message: messaggio,
			content: aBase64(serializza(dati)),
			sha,
			branch: ramo(env),
		}),
	});
	if (r.status === 409 || r.status === 422) return null;
	if (!r.ok) throw new ErroreUtente(`GitHub ha rifiutato il salvataggio (${r.status}).`, 502);
	return ((await r.json()) as { commit: { sha: string } }).commit.sha;
}

// ─── come si applica una modifica ───

const breve = (m: MercatoDati) => `${m.inizio} ${m.citta}, ${m.luogo}`;

/** La modifica applicata al calendario più recente, e la riga del commit. */
export function applica(
	d: DatiCalendario,
	op: Operazione,
): { dati: DatiCalendario; messaggio: string } {
	const dati: DatiCalendario = { mercati: [...d.mercati], ricorrenze: [...d.ricorrenze] };
	switch (op.tipo) {
		case "mercato": {
			const v = { ...op.voce };
			const i = dati.mercati.findIndex((m) => m.id === v.id);
			if (i >= 0) {
				dati.mercati[i] = v;
				return { dati, messaggio: `modifica ${breve(v)}` };
			}
			v.id = nuovoId(
				v,
				[...dati.mercati, ...dati.ricorrenze].map((x) => x.id),
			);
			dati.mercati.push(v);
			return { dati, messaggio: `aggiunge ${breve(v)}` };
		}
		case "elimina-mercato": {
			const m = dati.mercati.find((x) => x.id === op.id);
			if (!m) throw new ErroreUtente("Questa data non c'è più: forse è già stata tolta.", 404);
			dati.mercati = dati.mercati.filter((x) => x.id !== op.id);
			return { dati, messaggio: `toglie ${breve(m)}` };
		}
		case "ricorrenza": {
			const v = { ...op.voce };
			const i = dati.ricorrenze.findIndex((r) => r.id === v.id);
			if (i >= 0) {
				dati.ricorrenze[i] = v;
				return { dati, messaggio: `modifica il fisso ${v.luogo}` };
			}
			const presi = new Set([...dati.mercati, ...dati.ricorrenze].map((x) => x.id));
			const base = slug(v.luogo) || "fisso";
			v.id = base;
			for (let n = 2; presi.has(v.id); n++) v.id = `${base}-${n}`;
			dati.ricorrenze.push(v);
			return { dati, messaggio: `aggiunge il fisso ${v.luogo}` };
		}
		case "elimina-ricorrenza": {
			const r = dati.ricorrenze.find((x) => x.id === op.id);
			if (!r) throw new ErroreUtente("Questo mercato fisso non c'è più.", 404);
			dati.ricorrenze = dati.ricorrenze.filter((x) => x.id !== op.id);
			return { dati, messaggio: `toglie il fisso ${r.luogo}` };
		}
		case "pulisci-passate": {
			const prima = dati.mercati.length;
			dati.mercati = dati.mercati.filter((m) => (m.fine ?? m.inizio) >= op.oggi);
			return { dati, messaggio: `toglie ${prima - dati.mercati.length} date passate` };
		}
		default:
			throw new ErroreUtente("Modifica sconosciuta.");
	}
}

/**
 * Legge l'ultima versione, applica, controlla, scrive. Se qualcuno ha scritto
 * in mezzo — lei da due telefoni, o un commit da terminale — si rilegge e si
 * riapplica: le modifiche sono per id, quindi riapplicarle è sicuro.
 */
export async function modifica(
	env: Ambiente,
	op: Operazione,
): Promise<{ dati: DatiCalendario; commit: string }> {
	for (let tentativo = 0; tentativo < 3; tentativo++) {
		const { dati, sha } = await leggi(env);
		const fatto = applica(dati, op);
		const problemi = valida(fatto.dati);
		if (problemi.length > 0) throw new ErroreUtente(problemi.map((p) => p.messaggio).join(" "));
		const commit = await scrivi(
			env,
			fatto.dati,
			sha,
			`chore(calendario): ${fatto.messaggio}`.slice(0, 120),
		);
		if (commit) return { dati: JSON.parse(serializza(fatto.dati)), commit };
	}
	throw new ErroreUtente("Il calendario è cambiato mentre salvavi. Riprova.", 409);
}

// ─── a che punto è la pubblicazione ───

export type Stato = "in-coda" | "in-corso" | "online" | "errore";

export async function statoPubblicazione(env: Ambiente, commit: string): Promise<Stato> {
	if (env.SVILUPPO === "1") return Date.now() - memoria.salvato > 8000 ? "online" : "in-corso";
	const r = await gh(env, `/actions/runs?head_sha=${encodeURIComponent(commit)}&per_page=10`);
	if (!r.ok) throw new ErroreUtente(`GitHub non risponde (${r.status}).`, 502);
	const corse = (
		(await r.json()) as {
			workflow_runs: { status: string; conclusion: string | null; event: string }[];
		}
	).workflow_runs.filter((c) => c.event === "push");
	if (corse.length === 0) return "in-coda";
	if (corse.some((c) => c.status !== "completed")) return "in-corso";
	// `cancelled` non è un errore: è una pubblicazione superata da un salvataggio più recente.
	if (corse.some((c) => c.conclusion === "failure" || c.conclusion === "timed_out"))
		return "errore";
	return "online";
}
