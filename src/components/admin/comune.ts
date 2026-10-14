import type { DatiCalendario, Problema } from "@/lib/calendario";
import type { Operazione, Stato } from "@/server/calendario-remoto";

export type { Operazione, Stato };

/** Una data scritta come si dice: «sabato 17 ottobre». */
export function data(iso: string, opzioni: Intl.DateTimeFormatOptions): string {
	return new Intl.DateTimeFormat("it-IT", { ...opzioni, timeZone: "UTC" }).format(
		new Date(`${iso}T12:00:00Z`),
	);
}

/** Il primo problema di ogni campo, per mostrarlo accanto al campo. */
export function perCampo(problemi: Problema[]): Record<string, string> {
	const fuori: Record<string, string> = {};
	for (const p of problemi) {
		const campo = p.dove.split(".").at(-1) ?? p.dove;
		fuori[campo] ??= p.messaggio;
	}
	return fuori;
}

export class Scollegata extends Error {}

async function risposta<T>(r: Response): Promise<T> {
	if (r.status === 401 || r.status === 403) throw new Scollegata();
	const j = (await r.json().catch(() => ({}))) as T & { errore?: string };
	if (!r.ok) throw new Error(j.errore ?? "Qualcosa non ha funzionato. Riprova fra poco.");
	return j;
}

/**
 * Le chiamate alla funzione. Un errore di rete qui di solito non è la rete:
 * è la sessione di Access scaduta, che risponde con un rimando alla pagina di
 * entrata — e un rimando a un altro dominio, per `fetch`, è un errore e basta.
 */
async function chiama<T>(url: string, init?: RequestInit): Promise<T> {
	let r: Response;
	try {
		r = await fetch(url, { ...init, cache: "no-store", redirect: "manual" });
	} catch {
		throw new Scollegata();
	}
	if (r.type === "opaqueredirect") throw new Scollegata();
	return risposta<T>(r);
}

export const carica = () => chiama<{ dati: DatiCalendario; email: string }>("/api/calendario");

export const invia = (op: Operazione) =>
	chiama<{ dati: DatiCalendario; commit: string }>("/api/calendario", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(op),
	});

export const statoDi = (commit: string) =>
	chiama<{ stato: Stato }>(`/api/stato?commit=${encodeURIComponent(commit)}`);
