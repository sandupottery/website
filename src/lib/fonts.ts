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
 */
export const boska = localFont({
	src: [
		{ path: "../fonts/Boska-300.woff2", weight: "300", style: "normal" },
		{ path: "../fonts/Boska-300i.woff2", weight: "300", style: "italic" },
		{ path: "../fonts/Boska-400.woff2", weight: "400", style: "normal" },
		{ path: "../fonts/Boska-400i.woff2", weight: "400", style: "italic" },
		{ path: "../fonts/Boska-500.woff2", weight: "500", style: "normal" },
		{ path: "../fonts/Boska-500i.woff2", weight: "500", style: "italic" },
		{ path: "../fonts/Boska-700.woff2", weight: "700", style: "normal" },
		{ path: "../fonts/Boska-700i.woff2", weight: "700", style: "italic" },
	],
	variable: "--font-boska",
	display: "swap",
	fallback: ["Georgia", "serif"],
});
