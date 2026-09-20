"use client";

import { useLayoutEffect } from "react";
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

	return null;
}
