import type { RicorrenzaDati } from "@/lib/calendario";
import { mappaDi, primaOccorrenza, regolaEn, regolaIt, rrule } from "@/lib/calendario";
import calendario from "./calendario.json";

export type Ricorrenza = {
	/** Slug stabile: diventa anche il nome del file .ics. */
	id: string;
	luogo: string;
	regolaIt: string;
	regolaEn: string;
	/**
	 * La stessa regola in RFC 5545, senza il prefisso `RRULE:`.
	 * `BYSETPOS` conta le occorrenze del `BYDAY` dentro il mese: la seconda
	 * domenica è `BYDAY=SU;BYSETPOS=2`, non `BYDAY=2SU` — il secondo funziona
	 * con FREQ=MONTHLY ma non sopravvive a un BYMONTH in tutti i calendari.
	 */
	regola: string;
	/**
	 * La prima occorrenza vera della regola. Il DTSTART di un evento
	 * ricorrente deve cadere *sulla* regola: se non ci cade, Google Calendar
	 * aggiunge una data in più e Apple ne salta una.
	 */
	inizio: string;
	citta: string;
	/** Scritto perché una mappa lo trovi: è la chiave della ricerca e del LOCATION. */
	indirizzo: string;
	mappa: string;
};

/**
 * I mercati che tornano ogni mese. Nel JSON c'è soltanto la regola in forma
 * di scelta («2ª domenica, questi mesi»), che è quello che la cliente compila;
 * le due frasi, la RRULE e il primo giorno si ricavano — vedi
 * `src/lib/calendario.ts`.
 */
export const ricorrenze: readonly Ricorrenza[] = (calendario.ricorrenze as RicorrenzaDati[]).map(
	(r) => ({
		id: r.id,
		luogo: r.luogo,
		regolaIt: regolaIt(r),
		regolaEn: regolaEn(r),
		regola: rrule(r),
		inizio: primaOccorrenza(r),
		citta: r.citta,
		indirizzo: r.indirizzo,
		mappa: mappaDi(r.indirizzo),
	}),
);
