/**
 * Il calendario come dato che la cliente modifica da sola.
 *
 * Le date vivono in `src/content/calendario.json`, che scrive la pagina
 * `/admin` attraverso la funzione `functions/api/calendario.ts`. Questo file
 * è l'unica copia delle regole su quel dato: lo leggono il sito (per
 * ricavare quello che nel JSON non si scrive), i test, la funzione prima di
 * salvare e il modulo prima di inviare. Una regola cambiata qui vale in tutti
 * e quattro i posti.
 *
 * Niente import con `@/`: lo compila anche wrangler, che quegli alias non li
 * conosce.
 */

export type GiornoSettimana = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

/** Una data singola, così come la salva il modulo. */
export type MercatoDati = {
	/** Slug stabile, nome del file .ics e UID dell'evento: non cambia più. */
	id: string;
	inizio: string;
	fine?: string;
	citta: string;
	luogo: string;
	/** Il nome della manifestazione, o il quartiere: tra parentesi dopo il luogo. */
	dettaglio?: string;
	/** Scritto perché una mappa lo trovi. Se manca vale «luogo, città». */
	indirizzo?: string;
};

/** Un mercato che torna ogni mese: «la 2ª domenica, da marzo a giugno». */
export type RicorrenzaDati = {
	id: string;
	luogo: string;
	citta: string;
	indirizzo: string;
	/** 1–4, oppure -1 per «l'ultima». */
	settimana: number;
	giorno: GiornoSettimana;
	/** 1–12. Tutti e dodici vuol dire «ogni mese». */
	mesi: number[];
};

export type DatiCalendario = { mercati: MercatoDati[]; ricorrenze: RicorrenzaDati[] };

export type Problema = { dove: string; messaggio: string };

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z0-9-]+$/;
const GIORNI: GiornoSettimana[] = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export const NOMI_GIORNO: Record<GiornoSettimana, { it: string; en: string; femminile: boolean }> =
	{
		MO: { it: "lunedì", en: "Monday", femminile: false },
		TU: { it: "martedì", en: "Tuesday", femminile: false },
		WE: { it: "mercoledì", en: "Wednesday", femminile: false },
		TH: { it: "giovedì", en: "Thursday", femminile: false },
		FR: { it: "venerdì", en: "Friday", femminile: false },
		SA: { it: "sabato", en: "Saturday", femminile: false },
		SU: { it: "domenica", en: "Sunday", femminile: true },
	};

export const NOMI_MESE = {
	it: [
		"gennaio",
		"febbraio",
		"marzo",
		"aprile",
		"maggio",
		"giugno",
		"luglio",
		"agosto",
		"settembre",
		"ottobre",
		"novembre",
		"dicembre",
	],
	en: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	],
};

/** Una data ISO esistente davvero: «2026-02-30» ha la forma giusta ma non c'è. */
export function eDataVera(iso: string): boolean {
	if (!ISO.test(iso)) return false;
	const d = new Date(`${iso}T12:00:00Z`);
	return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

/** «Bergamo Alta, passaggio Torre Adalberto» → «bergamo-alta-passaggio-torre-adalberto». */
export function slug(testo: string): string {
	return testo
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * Un id nuovo per una data: giorno, città e la prima parola utile del luogo,
 * come quelli scritti a mano finora («2026-10-14-milano-garibaldi»). Se è
 * già preso si aggiunge un numero.
 */
export function nuovoId(
	m: Pick<MercatoDati, "inizio" | "citta" | "luogo">,
	presi: Iterable<string>,
): string {
	const occupati = new Set(presi);
	const vuote = new Set(["piazza", "corso", "via", "viale", "largo", "parco", "bergamo", "milano"]);
	const parola = slug(m.luogo)
		.split("-")
		.find((p) => p.length > 2 && !vuote.has(p));
	const base = [m.inizio, slug(m.citta), parola].filter(Boolean).join("-") || "mercato";
	let id = base;
	for (let n = 2; occupati.has(id); n++) id = `${base}-${n}`;
	return id;
}

export const indirizzoDi = (m: MercatoDati): string =>
	m.indirizzo?.trim() || `${m.luogo}, ${m.citta}`;

export const mappaDi = (indirizzo: string): string =>
	`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(indirizzo)}`;

export const ordina = (mercati: readonly MercatoDati[]): MercatoDati[] =>
	[...mercati].sort((a, b) => a.inizio.localeCompare(b.inizio) || a.id.localeCompare(b.id));

// ─── le ricorrenze ───

/** Il giorno della settimana di una data ISO, nel formato RRULE. */
export function giornoDi(iso: string): GiornoSettimana {
	return GIORNI[new Date(`${iso}T12:00:00Z`).getUTCDay()] as GiornoSettimana;
}

/** La `settimana`-esima `giorno` del mese (o l'ultima, con -1), oppure null. */
function nelMese(
	anno: number,
	mese: number,
	settimana: number,
	giorno: GiornoSettimana,
): string | null {
	const voluto = GIORNI.indexOf(giorno);
	const giorni: number[] = [];
	const ultimo = new Date(Date.UTC(anno, mese, 0)).getUTCDate();
	for (let g = 1; g <= ultimo; g++) {
		if (new Date(Date.UTC(anno, mese - 1, g, 12)).getUTCDay() === voluto) giorni.push(g);
	}
	const g = settimana === -1 ? giorni.at(-1) : giorni[settimana - 1];
	if (g === undefined) return null;
	return `${anno}-${String(mese).padStart(2, "0")}-${String(g).padStart(2, "0")}`;
}

/** Le prossime `quante` date della ricorrenza a partire da `da` (inclusa). */
export function occorrenze(r: RicorrenzaDati, da: string, quante: number): string[] {
	const fuori: string[] = [];
	if (r.mesi.length === 0) return fuori;
	let anno = Number(da.slice(0, 4));
	let mese = Number(da.slice(5, 7));
	for (let giri = 0; giri < 60 && fuori.length < quante; giri++) {
		if (r.mesi.includes(mese)) {
			const d = nelMese(anno, mese, r.settimana, r.giorno);
			if (d && d >= da) fuori.push(d);
		}
		mese += 1;
		if (mese > 12) {
			mese = 1;
			anno += 1;
		}
	}
	return fuori;
}

/**
 * Il DTSTART dei .ics ricorrenti: la prima occorrenza vera dal 1° gennaio
 * 2026. Un punto fisso e non «oggi», così due build sullo stesso dato danno
 * file identici; e deve cadere *sulla* regola, se no Google aggiunge una data
 * in più e Apple ne salta una.
 */
const ANCORA = "2026-01-01";

/** Mesi consecutivi raggruppati, anche a cavallo d'anno: [11,12,1,2] è un tratto solo. */
function tratti(mesi: number[]): [number, number][] {
	const m = [...new Set(mesi)].sort((a, b) => a - b);
	const fuori: [number, number][] = [];
	for (const x of m) {
		const ultimo = fuori.at(-1);
		if (ultimo && ultimo[1] === x - 1) ultimo[1] = x;
		else fuori.push([x, x]);
	}
	const primo = fuori[0];
	const ultimo = fuori.at(-1);
	if (fuori.length > 1 && primo && ultimo && primo[0] === 1 && ultimo[1] === 12) {
		fuori.shift();
		ultimo[1] = primo[1];
	}
	return fuori;
}

const elenca = (parti: string[], e: string) =>
	parti.length < 2 ? (parti[0] ?? "") : `${parti.slice(0, -1).join(", ")}, ${e} ${parti.at(-1)}`;

/** «la 2ª domenica — da marzo a giugno, e da ottobre a dicembre». */
export function regolaIt(r: RicorrenzaDati): string {
	const g = NOMI_GIORNO[r.giorno];
	const quale =
		r.settimana === -1
			? `${g.femminile ? "l'ultima" : "l'ultimo"} ${g.it}`
			: `${g.femminile ? "la" : "il"} ${r.settimana}${g.femminile ? "ª" : "°"} ${g.it}`;
	if (new Set(r.mesi).size === 12) return `${quale} di ogni mese`;
	const parti = tratti(r.mesi).map(([a, b]) =>
		a === b ? `a ${NOMI_MESE.it[a - 1]}` : `da ${NOMI_MESE.it[a - 1]} a ${NOMI_MESE.it[b - 1]}`,
	);
	return `${quale} — ${elenca(parti, "e")}`;
}

/** «2nd Sunday — March to June, and October to December». */
export function regolaEn(r: RicorrenzaDati): string {
	const g = NOMI_GIORNO[r.giorno];
	const n = r.settimana;
	const ordinale =
		n === -1 ? "Last" : `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
	const quale = `${ordinale} ${g.en}`;
	if (new Set(r.mesi).size === 12) return `${quale} of every month`;
	const parti = tratti(r.mesi).map(([a, b]) =>
		a === b ? (NOMI_MESE.en[a - 1] ?? "") : `${NOMI_MESE.en[a - 1]} to ${NOMI_MESE.en[b - 1]}`,
	);
	return `${quale} — ${elenca(parti, "and")}`;
}

/** La regola RFC 5545 senza «RRULE:». `BYSETPOS` e non `BYDAY=2SU`: vedi ricorrenze.ts. */
export function rrule(r: RicorrenzaDati): string {
	const mesi = [...new Set(r.mesi)].sort((a, b) => a - b);
	const base = `FREQ=MONTHLY;BYDAY=${r.giorno};BYSETPOS=${r.settimana}`;
	return mesi.length === 12 ? base : `${base};BYMONTH=${mesi.join(",")}`;
}

export const primaOccorrenza = (r: RicorrenzaDati): string => occorrenze(r, ANCORA, 1)[0] ?? ANCORA;

// ─── la validazione ───

/**
 * Tutto quello che non va, in parole sue: la funzione rifiuta di salvare se
 * la lista non è vuota, il modulo lo mostra accanto al campo, i test fanno
 * fallire la build. Non controlla l'ordine: il sito ordina da sé.
 */
export function valida(dati: unknown): Problema[] {
	const p: Problema[] = [];
	const d = dati as Partial<DatiCalendario> | null;
	if (!d || !Array.isArray(d.mercati) || !Array.isArray(d.ricorrenze)) {
		return [{ dove: "calendario", messaggio: "Il calendario non ha la forma attesa." }];
	}

	const ids = new Set<string>();
	const testo = (v: unknown) => typeof v === "string" && v.trim().length > 0;
	const lungo = (v: unknown) => typeof v === "string" && v.length > 160;

	d.mercati.forEach((m, i) => {
		const dove = `mercati.${i}`;
		if (!m || typeof m !== "object") {
			p.push({ dove, messaggio: "Riga vuota." });
			return;
		}
		if (typeof m.id !== "string" || !ID.test(m.id))
			p.push({ dove: `${dove}.id`, messaggio: "Id non valido." });
		else if (ids.has(m.id)) p.push({ dove: `${dove}.id`, messaggio: "Id ripetuto." });
		else ids.add(m.id);
		if (!eDataVera(m.inizio)) p.push({ dove: `${dove}.inizio`, messaggio: "Manca il giorno." });
		if (m.fine !== undefined) {
			if (!eDataVera(m.fine))
				p.push({ dove: `${dove}.fine`, messaggio: "L'ultimo giorno non è una data." });
			else if (eDataVera(m.inizio) && m.fine < m.inizio)
				p.push({ dove: `${dove}.fine`, messaggio: "L'ultimo giorno viene prima del primo." });
		}
		if (!testo(m.citta)) p.push({ dove: `${dove}.citta`, messaggio: "Manca la città." });
		if (!testo(m.luogo)) p.push({ dove: `${dove}.luogo`, messaggio: "Manca il luogo." });
		for (const k of ["citta", "luogo", "dettaglio", "indirizzo"] as const) {
			if (m[k] !== undefined && typeof m[k] !== "string")
				p.push({ dove: `${dove}.${k}`, messaggio: "Deve essere testo." });
			if (lungo(m[k])) p.push({ dove: `${dove}.${k}`, messaggio: "Troppo lungo." });
		}
	});

	d.ricorrenze.forEach((r, i) => {
		const dove = `ricorrenze.${i}`;
		if (!r || typeof r !== "object") {
			p.push({ dove, messaggio: "Riga vuota." });
			return;
		}
		if (typeof r.id !== "string" || !ID.test(r.id))
			p.push({ dove: `${dove}.id`, messaggio: "Id non valido." });
		else if (ids.has(r.id)) p.push({ dove: `${dove}.id`, messaggio: "Id ripetuto." });
		else ids.add(r.id);
		if (!testo(r.luogo)) p.push({ dove: `${dove}.luogo`, messaggio: "Manca il nome." });
		if (!testo(r.citta)) p.push({ dove: `${dove}.citta`, messaggio: "Manca la città." });
		if (!testo(r.indirizzo)) p.push({ dove: `${dove}.indirizzo`, messaggio: "Manca l'indirizzo." });
		for (const k of ["luogo", "citta", "indirizzo"] as const) {
			if (lungo(r[k])) p.push({ dove: `${dove}.${k}`, messaggio: "Troppo lungo." });
		}
		if (![1, 2, 3, 4, -1].includes(r.settimana))
			p.push({ dove: `${dove}.settimana`, messaggio: "Scegli quale settimana." });
		if (!GIORNI.includes(r.giorno))
			p.push({ dove: `${dove}.giorno`, messaggio: "Scegli il giorno." });
		if (!Array.isArray(r.mesi) || r.mesi.length === 0)
			p.push({ dove: `${dove}.mesi`, messaggio: "Scegli almeno un mese." });
		else if (r.mesi.some((m) => !Number.isInteger(m) || m < 1 || m > 12))
			p.push({ dove: `${dove}.mesi`, messaggio: "Mese non valido." });
	});

	return p;
}

/**
 * Il JSON come si scrive su disco: tabulazioni e un a capo finale, i mercati
 * in ordine, solo i campi pieni. Sempre la stessa forma, così il diff di un
 * salvataggio mostra la data cambiata e nient'altro.
 */
export function serializza(d: DatiCalendario): string {
	const pulito = (o: Record<string, unknown>) =>
		Object.fromEntries(
			Object.entries(o)
				.map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
				.filter(([, v]) => v !== undefined && v !== ""),
		);
	const forma = {
		mercati: ordina(d.mercati).map((m) =>
			pulito({
				id: m.id,
				inizio: m.inizio,
				fine: m.fine && m.fine !== m.inizio ? m.fine : undefined,
				citta: m.citta,
				luogo: m.luogo,
				dettaglio: m.dettaglio,
				indirizzo:
					m.indirizzo && m.indirizzo.trim() !== `${m.luogo.trim()}, ${m.citta.trim()}`
						? m.indirizzo
						: undefined,
			}),
		),
		ricorrenze: d.ricorrenze.map((r) =>
			pulito({
				id: r.id,
				luogo: r.luogo,
				citta: r.citta,
				indirizzo: r.indirizzo,
				settimana: r.settimana,
				giorno: r.giorno,
				mesi: [...new Set(r.mesi)].sort((a, b) => a - b),
			}),
		),
	};
	return `${JSON.stringify(forma, null, "\t")}\n`;
}
