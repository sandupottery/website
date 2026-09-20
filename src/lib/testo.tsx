import type { ReactNode } from "react";

/**
 * Marcatura minima per i testi di `src/content/collezioni.ts`.
 *
 * Esiste per una ragione sola: la prosa delle stanze è scritta dalla cliente e
 * verrà riscritta più volte. Se l'unico modo di mettere una parola in corsivo
 * fosse spezzare la frase in un array di nodi React, ogni riscrittura sarebbe
 * un intervento sul codice. Con due segni la frase resta una stringa leggibile.
 *
 *   *così*   → corsivo
 *   **così** → rilievo (peso 500, non grassetto: il grassetto qui è chiassoso)
 *   \n       → a capo (serve nei titoli, dove il punto di rottura è una
 *              scelta di impaginazione e non può essere lasciata al browser)
 *
 * Niente HTML nelle stringhe, quindi niente `dangerouslySetInnerHTML`.
 */
const SEGNI = /(\*\*[^*]+\*\*|\*[^*]+\*|\n)/g;

export function frase(testo: string): ReactNode[] {
	return testo.split(SEGNI).map((pezzo, i) => {
		const chiave = `${i}`;
		if (pezzo === "\n") return <br key={chiave} />;
		if (pezzo.startsWith("**")) {
			return (
				<b className="rilievo" key={chiave}>
					{pezzo.slice(2, -2)}
				</b>
			);
		}
		if (pezzo.startsWith("*")) return <em key={chiave}>{pezzo.slice(1, -1)}</em>;
		return pezzo;
	});
}
