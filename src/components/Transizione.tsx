"use client";

import { useEffect } from "react";

type Avvio = typeof document.startViewTransition;

/**
 * Segna sul documento la classe `in-vt` per tutta la durata di una
 * transizione fra rotte.
 *
 * Serve a una cosa sola, ma visibile: durante il passaggio il margine deve
 * perdere il proprio fondo (`html.in-vt #margine` in globals.css). Altrimenti
 * quello che attraversa lo schermo non è la scritta che si sposta, è un
 * rettangolo di colore che si deforma, e il movimento diventa rumoroso.
 *
 * React avvia la transizione da dentro il suo commit, senza esporre un
 * aggancio: l'unico punto comune a navigazioni, ritorni del browser e
 * gesti di scorrimento è `document.startViewTransition`. Da qui la pezza,
 * che è deliberatamente l'unica riga di codice che tocca un'API globale.
 */
export function Transizione() {
	useEffect(() => {
		if (typeof document.startViewTransition !== "function") return;

		const radice = document.documentElement;
		const originale = document.startViewTransition.bind(document) as Avvio;

		document.startViewTransition = ((...argomenti: Parameters<Avvio>) => {
			radice.classList.add("in-vt");
			const transizione = originale(...argomenti);
			transizione.finished.finally(() => radice.classList.remove("in-vt"));
			return transizione;
		}) as Avvio;

		return () => {
			document.startViewTransition = originale;
			radice.classList.remove("in-vt");
		};
	}, []);

	return null;
}
