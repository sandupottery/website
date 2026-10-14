import localFont from "next/font/local";

/**
 * Due caratteri, entrambi liberi (SIL OFL) e serviti da noi: niente
 * richieste a terzi, niente dipendenza da un servizio esterno.
 *
 * **Source Serif 4** per titoli e prosa. Ha preso il posto di Boska, che era
 * un carattere da titolo: ai corpi del testo i suoi filetti sottilissimi si
 * spezzavano, e chi leggeva l'anteprima lo ha detto in molti. Questo è un
 * carattere da libro, a contrasto basso, ed è il parente libero più vicino
 * al Bradford di Emergence Magazine, che è il riferimento della cliente.
 * È variabile anche nella *dimensione ottica* (`opsz` 8–60): il browser la
 * regola da sé sul corpo, quindi lo stesso file è robusto nella prosa e
 * fine nei titoli grandi. Un file per il tondo e uno per il corsivo coprono
 * ogni peso fra 200 e 900.
 *
 * **Libre Franklin** solo per i segni piccoli in maiuscolo spaziato —
 * occhielli, numeri, prezzi, «Torna», il cambio lingua. Un maiuscoletto
 * graziato a 13px era la cosa meno leggibile del sito; un grottesco a quel
 * corpo regge. Fa la parte che in Emergence fa GT America.
 *
 * Le frecce (← → ↗ ↔) non sono in nessuno dei due: le disegna il carattere
 * di ripiego, come già succedeva con Boska.
 */
export const serif = localFont({
	src: [
		{ path: "../fonts/SourceSerif4.woff2", weight: "200 900", style: "normal" },
		{ path: "../fonts/SourceSerif4-Italic.woff2", weight: "200 900", style: "italic" },
	],
	variable: "--font-serif",
	display: "swap",
	fallback: ["Georgia", "serif"],
});

export const segno = localFont({
	src: [{ path: "../fonts/LibreFranklin.woff2", weight: "100 900", style: "normal" }],
	variable: "--font-segno",
	display: "swap",
	fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});
