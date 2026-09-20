"use client";

import { useEffect, useLayoutEffect } from "react";
import { segnaStanza } from "@/lib/provenienza";

const esadecimale = (h: string): [number, number, number] => [
	Number.parseInt(h.slice(1, 3), 16),
	Number.parseInt(h.slice(3, 5), 16),
	Number.parseInt(h.slice(5, 7), 16),
];

const mescola = (a: number[], b: number[], t: number) =>
	`rgb(${a.map((v, i) => Math.round(v + ((b[i] ?? v) - v) * t)).join(",")})`;

/** Nell'ultimo 30% di una soglia il fondo inizia a diventare quello dopo. */
const CODA = 0.3;

/**
 * Il moto della home. Tre cose, tutte legate allo scorrimento, tutte inutili
 * altrove — per questo vivono qui e non nel layout.
 *
 * 1. Il fondo. Ogni soglia porta il colore di uno smalto e il fondo scivola
 *    da un colore all'altro mentre si scorre. Scrive `--ground` in linea su
 *    <html>: lo leggono sia il corpo sia il margine (vedi globals.css). Alla
 *    smontatura lo rimuove, perché nelle stanze il colore è fisso e arriva
 *    già dal server — se restasse in linea vincerebbe lui.
 * 2. La voce corrente nell'indice del margine.
 * 3. Il ritorno da una stanza. Il legame «Torna» punta a `/#foglie`: qui lo
 *    si onora *prima* della pittura, così la fotografia della soglia è già
 *    al suo posto quando il browser fotografa la pagina nuova. Senza questo
 *    il titolo non avrebbe nulla in cui ritrasformarsi e la transizione
 *    diventerebbe una dissolvenza.
 */
export function Scorrimento() {
	useLayoutEffect(() => {
		// Tornati a casa, il prossimo ingresso in una stanza non arriva da
		// un'altra stanza: ha la sua transizione e non gli serve la dissolvenza.
		segnaStanza(false);

		const id = decodeURIComponent(location.hash.slice(1));
		const meta = id ? document.getElementById(id) : null;
		if (meta) meta.scrollIntoView({ behavior: "instant", block: "start" });
	}, []);

	useEffect(() => {
		const radice = document.documentElement;
		const soglie = [...document.querySelectorAll<HTMLElement>("[data-fondo]")];
		if (soglie.length === 0) return;

		let inCoda = false;
		const tingi = () => {
			const mezzo = innerHeight * 0.46;
			let corrente = soglie[0];
			let prossima = soglie[0];
			let t = 0;
			soglie.forEach((s, i) => {
				const r = s.getBoundingClientRect();
				if (r.top > mezzo) return;
				corrente = s;
				prossima = soglie[i + 1] ?? s;
				const p = Math.min(Math.max((mezzo - r.top) / Math.max(r.height, 1), 0), 1);
				t = p > 1 - CODA ? (p - (1 - CODA)) / CODA : 0;
			});
			if (!corrente || !prossima) return;
			radice.style.setProperty(
				"--ground",
				mescola(
					esadecimale(corrente.dataset.fondo ?? "#F5F2EB"),
					esadecimale(prossima.dataset.fondo ?? "#F5F2EB"),
					t,
				),
			);
		};

		const alloScorrere = () => {
			if (inCoda) return;
			inCoda = true;
			requestAnimationFrame(() => {
				tingi();
				inCoda = false;
			});
		};

		tingi();
		addEventListener("scroll", alloScorrere, { passive: true });

		// La voce corrente: la soglia che occupa la fascia centrale dello schermo.
		const voci = document.querySelectorAll<HTMLElement>("#margine .indice a");
		const osservatore = new IntersectionObserver(
			(entrate) => {
				for (const e of entrate) {
					if (!e.isIntersecting) continue;
					const sez = (e.target as HTMLElement).dataset.sez;
					for (const v of voci) {
						v.setAttribute("aria-current", String(v.dataset.sez === sez));
					}
				}
			},
			{ rootMargin: "-45% 0px -45% 0px" },
		);
		for (const s of soglie) osservatore.observe(s);

		return () => {
			removeEventListener("scroll", alloScorrere);
			osservatore.disconnect();
			radice.style.removeProperty("--ground");
		};
	}, []);

	return null;
}
