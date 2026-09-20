import localFont from "next/font/local";

/**
 * Boska (Fontshare, licenza libera anche per uso commerciale) è l'unico
 * carattere del sito: titoli e prosa. Le differenze le fanno il peso,
 * il corsivo e la dimensione — non un secondo carattere.
 *
 * Il file è servito da noi, non dal CDN di Fontshare: niente richieste a
 * terzi, niente flash di carattere di sistema, niente dipendenza da un
 * servizio esterno per un sito che deve restare in piedi da solo.
 *
 * Nulla sotto il peso 300, e il 300 solo in corsivo e in grande (l'apertura
 * della home): ai corpi piccoli è illeggibile.
 *
 * Sei tagli e non otto. `next/font/local` mette in precarico ogni file che
 * gli si dà, e due di questi non erano usati da nessuna regola: il 300 tondo
 * (esiste solo il 300 corsivo, nell'apertura) e il 500 corsivo. Erano 60 KB
 * scaricati con priorità alta su ogni pagina per non disegnare niente.
 * Se un giorno servisse un rilievo dentro un corsivo il browser lo sintetizza
 * — e a quel punto, se si vede, si aggiunge il taglio vero.
 */
export const boska = localFont({
	src: [
		{ path: "../fonts/Boska-300i.woff2", weight: "300", style: "italic" },
		{ path: "../fonts/Boska-400.woff2", weight: "400", style: "normal" },
		{ path: "../fonts/Boska-400i.woff2", weight: "400", style: "italic" },
		{ path: "../fonts/Boska-500.woff2", weight: "500", style: "normal" },
		{ path: "../fonts/Boska-700.woff2", weight: "700", style: "normal" },
		{ path: "../fonts/Boska-700i.woff2", weight: "700", style: "italic" },
	],
	variable: "--font-boska",
	display: "swap",
	fallback: ["Georgia", "serif"],
});
