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

/** L'indirizzo è scritto una volta sola: il legame alla mappa lo si ricava. */
const con = (r: Omit<Ricorrenza, "mappa">): Ricorrenza => ({
	...r,
	mappa: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.indirizzo)}`,
});

export const ricorrenze: readonly Ricorrenza[] = [
	con({
		id: "bergamo-bassa",
		luogo: "Bergamo Bassa",
		regolaIt: "la 2ª domenica — da marzo a giugno, e da ottobre a dicembre",
		regolaEn: "2nd Sunday — March to June, and October to December",
		regola: "FREQ=MONTHLY;BYDAY=SU;BYSETPOS=2;BYMONTH=3,4,5,6,10,11,12",
		// 1º marzo 2026 è domenica: la seconda è l'8.
		inizio: "2026-03-08",
		citta: "Bergamo",
		indirizzo: "Sentierone, Bergamo",
	}),
	con({
		id: "bergamo-alta",
		luogo: "Bergamo Alta",
		regolaIt: "la 4ª domenica — da aprile a giugno, e da settembre a dicembre",
		regolaEn: "4th Sunday — April to June, and September to December",
		regola: "FREQ=MONTHLY;BYDAY=SU;BYSETPOS=4;BYMONTH=4,5,6,9,10,11,12",
		// Aprile 2026: domeniche 5, 12, 19, 26.
		inizio: "2026-04-26",
		citta: "Bergamo",
		indirizzo: "Colle Aperto, Bergamo Alta",
	}),
	con({
		id: "milano-diaz",
		luogo: "Milano, piazza Diaz",
		regolaIt: "il 4° giovedì di ogni mese",
		regolaEn: "4th Thursday of every month",
		regola: "FREQ=MONTHLY;BYDAY=TH;BYSETPOS=4",
		// Gennaio 2026: giovedì 1, 8, 15, 22.
		inizio: "2026-01-22",
		citta: "Milano",
		indirizzo: "Piazza Diaz, Milano",
	}),
];
