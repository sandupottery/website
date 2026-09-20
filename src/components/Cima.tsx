"use client";

import { useEffect, useLayoutEffect } from "react";
import { segnaStanza, veniamoDaUnaStanza } from "@/lib/provenienza";

/**
 * Due cose, entrambe legate all'ingresso in una stanza.
 *
 * **Porta in cima, prima della pittura.** Non è una comodità: è la
 * condizione perché la transizione funzioni. React toglie il
 * `view-transition-name` da qualunque elemento che al momento del commit sia
 * fuori dallo schermo (`measureInstance().view`, in react-dom). Entrando in
 * una stanza la finestra è ancora allo scorrimento della home, e il titolo
 * della stanza — che sta in cima al documento — risulterebbe fuori campo:
 * niente nome, niente coppia, e il titolo si limiterebbe a dissolversi
 * invece di crescere da quello di casa. `useLayoutEffect` gira dentro il
 * commit, prima che React misuri gli elementi che entrano; il viaggio di
 * ritorno (vedi `Scorrimento`) si regge sulla stessa proprietà.
 *
 * **Copre il taglio fra una stanza e l'altra.** Lì la rotta non cambia
 * (`[collezione]` resta sé stessa) e React non avvia nessuna transizione:
 * senza niente sarebbe uno stacco netto in mezzo a un sito che per il resto
 * scorre. Una dissolvenza breve basta, e va messa solo in quel caso —
 * arrivando da casa il movimento è già la crescita della fotografia, e una
 * dissolvenza sopra la annacquerebbe.
 *
 * **Segna l'uscita dal marchio.** Il «Torna» riporta alla soglia da cui si è
 * entrati e lì la fotografia ha in cosa rimpicciolirsi; il marchio invece
 * riporta in cima, dove di quella soglia non c'è niente. Senza dirlo a
 * nessuno, la fotografia e il titolo restano nomi senza compagno: il browser
 * li stacca dalla pagina e li lascia dissolvere *sopra* la home che nel
 * frattempo è già arrivata — misurato, un'immagine a tutta pagina sospesa
 * sopra la frase d'apertura per più di mezzo secondo. Marcata l'uscita, il
 * foglio di stile toglie i due nomi (vedi globals.css) e non resta che la
 * dissolvenza di tutta la pagina, che è poi quello che il marchio significa:
 * non si torna, si ricomincia.
 */
export function Cima() {
	useLayoutEffect(() => {
		scrollTo({ top: 0, behavior: "instant" });

		if (veniamoDaUnaStanza()) {
			document.querySelector("main.in-stanza")?.classList.add("appena-entrata");
		}
		segnaStanza(false);

		return () => segnaStanza(true);
	}, []);

	useEffect(() => {
		// In cattura: il segno dev'essere scritto prima che React cominci la
		// navigazione, perché è durante quel commit che il browser fotografa la
		// pagina. Lo cancella la home arrivando (vedi `Scorrimento`).
		const marchio = document.querySelector<HTMLElement>("#margine .marchio");
		const ricomincia = () => {
			document.documentElement.dataset.uscita = "marchio";
		};
		marchio?.addEventListener("click", ricomincia, true);
		return () => marchio?.removeEventListener("click", ricomincia, true);
	}, []);

	return null;
}
