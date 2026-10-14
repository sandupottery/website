import { indirizzoDi, mappaDi, ordina } from "@/lib/calendario";
import calendario from "./calendario.json";

/**
 * Le date dei mercatini.
 *
 * Non si scrivono qui: le scrive la cliente dalla pagina `/admin`, che salva
 * `calendario.json` nel repository e fa ripartire la pubblicazione (vedi
 * docs/content-editing.md). Qui si ricava soltanto quello che il JSON non
 * porta — il legame alla mappa — e si ordina, perché il JSON non promette
 * nessun ordine.
 */
export type Mercato = {
	/** Slug stabile: diventa anche il nome del file .ics. */
	id: string;
	/** Data ISO YYYY-MM-DD. */
	inizio: string;
	/** Ultimo giorno, se il mercato dura più di una giornata. */
	fine?: string;
	citta: string;
	luogo: string;
	dettaglio?: string;
	mappa: string;
};

export const mercati: readonly Mercato[] = ordina(calendario.mercati).map((m) => ({
	id: m.id,
	inizio: m.inizio,
	fine: m.fine,
	citta: m.citta,
	luogo: m.luogo,
	dettaglio: m.dettaglio,
	mappa: mappaDi(indirizzoDi(m)),
}));
