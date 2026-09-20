"use client";

import { useEffect, useLayoutEffect } from "react";
import { prendiQuota, segnaQuota, segnaStanza } from "@/lib/provenienza";

const esadecimale = (h: string): [number, number, number] => [
	Number.parseInt(h.slice(1, 3), 16),
	Number.parseInt(h.slice(3, 5), 16),
	Number.parseInt(h.slice(5, 7), 16),
];

const mescola = (a: number[], b: number[], t: number) =>
	`rgb(${a.map((v, i) => Math.round(v + ((b[i] ?? v) - v) * t)).join(",")})`;

/**
 * Il moto della home. Cinque cose, tutte legate allo scorrimento, tutte
 * inutili altrove — per questo vivono qui e non nel layout.
 *
 * 1. Il fondo. Ogni soglia porta il colore di uno smalto e il fondo scivola
 *    da un colore all'altro **per tutta l'altezza della soglia**: la rampa è
 *    piena, non una coda concentrata negli ultimi centimetri. Scrive
 *    `--ground` in linea su <html>: lo leggono sia il corpo sia il margine
 *    (vedi globals.css). Alla smontatura lo rimuove, perché nelle stanze il
 *    colore è fisso e arriva già dal server — se restasse in linea
 *    vincerebbe lui.
 * 2. Il glifo dello scorri, che svanisce ai primi centimetri di pagina.
 * 3. La voce corrente nell'indice del margine.
 * 4. L'indice come via d'ingresso: scorre fino alla soglia e *poi* ci entra.
 * 5. Il ritorno da una stanza, che dev'essere il rovescio dell'andata: la
 *    home si rimette alla quota esatta da cui si era partiti — annotata
 *    lasciandola, vedi `provenienza.ts` — e lo fa *prima* della pittura, così
 *    la soglia è già al suo posto quando il browser fotografa la pagina
 *    nuova. Senza questo il titolo non avrebbe nulla in cui ritrasformarsi e
 *    la transizione diventerebbe una dissolvenza sopra un salto in cima.
 */
export function Scorrimento() {
	useLayoutEffect(() => {
		// Tornati a casa, il prossimo ingresso in una stanza non arriva da
		// un'altra stanza: ha la sua transizione e non gli serve la dissolvenza.
		segnaStanza(false);

		// Prima cosa: rimettersi dov'eravamo. La quota esatta è l'unica che fa
		// del ritorno il rovescio dell'andata — la fotografia si rimpicciolisce
		// nel titolo che l'aveva aperta, e quel titolo è dove l'abbiamo lasciato.
		const quota = prendiQuota();
		if (quota !== null) scrollTo({ top: quota, behavior: "instant" });

		// Poi, solo se serve, l'àncora. Serve quando la quota non c'è (si arriva
		// da fuori) o quando non basta: da una stanza raggiunta da un'altra
		// stanza il «Torna» punta a una soglia che alla quota di prima può
		// essere lontana. Quello che deve trovarsi in campo è il *titolo* — è
		// lui la metà di casa della coppia, e fuori campo React gli toglie il
		// nome — quindi si misura lui e non la soglia, che è alta uno schermo e
		// risulterebbe «in vista» anche mostrando solo il suo bordo superiore.
		// Se il titolo c'è già non si tocca nulla: spostarsi di un altro po'
		// sarebbe proprio il salto da evitare.
		const id = decodeURIComponent(location.hash.slice(1));
		const meta = id ? document.getElementById(id) : null;
		if (!meta) return;
		const r = (meta.querySelector(".soglia-a") ?? meta).getBoundingClientRect();
		if (r.bottom < 0 || r.top > innerHeight) {
			meta.scrollIntoView({ behavior: "instant", block: "start" });
		}
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
				// La rampa piena: quanto della soglia è passato sopra la fascia
				// centrale *è* la mescolanza. Al confine `corrente` avanza e `t`
				// riparte da zero, dove `mescola(dopo, dopo+1, 0)` vale esattamente
				// il colore a cui la mescolanza precedente era arrivata — quindi il
				// passaggio è continuo senza bisogno di alcuna transizione CSS.
				t = Math.min(Math.max((mezzo - r.top) / Math.max(r.height, 1), 0), 1);
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

		// Il glifo dell'apertura: ha detto la sua cosa nel momento in cui si
		// comincia a scorrere, e da lì in poi è rumore.
		const glifo = document.querySelector<HTMLElement>(".scorri");
		const sfuma = () => {
			if (glifo) glifo.style.opacity = String(Math.max(0, 1 - scrollY / 260));
		};

		const alloScorrere = () => {
			if (inCoda) return;
			inCoda = true;
			requestAnimationFrame(() => {
				tingi();
				sfuma();
				inCoda = false;
			});
		};

		tingi();
		sfuma();
		addEventListener("scroll", alloScorrere, { passive: true });

		// La voce corrente: la soglia che occupa la fascia centrale dello schermo.
		const voci = document.querySelectorAll<HTMLElement>("#margine .indice a");
		const osservatore = new IntersectionObserver(
			(entrate) => {
				for (const e of entrate) {
					if (!e.isIntersecting) continue;
					const sez = (e.target as HTMLElement).dataset.sez;
					for (const v of voci) {
						// `aria-current="false"` sarebbe valido, ma resta un attributo da
						// annunciare: dove non è corrente si toglie.
						if (v.dataset.sez !== sez) {
							v.removeAttribute("aria-current");
							continue;
						}
						v.setAttribute("aria-current", "true");
						// Su telefono l'indice è una striscia che scorre in orizzontale:
						// senza questo la voce corrente può restare fuori campo, e chi
						// guarda non ha modo di accorgersi che ce ne sono altre.
						v.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
					}
				}
			},
			{ rootMargin: "-45% 0px -45% 0px" },
		);
		for (const s of soglie) osservatore.observe(s);

		// ─── la quota da cui si esce ───
		// Si annota al clic, e non smontando la home, perché quando React smonta
		// questo albero la stanza che entra ha già chiamato il suo `scrollTo(0)`
		// (vedi `Cima`) e `scrollY` vale zero: verificato, la pulizia registrava
		// sempre 0 e il ritorno finiva in cima. Al clic invece la pagina è
		// ancora ferma dov'è, ed è quella l'altezza a cui deve tornare.
		//
		// In cattura, così il valore è già scritto quando React comincia la
		// navigazione. Un clic che non apre niente non fa danno: il valore si
		// consuma solo rientrando in casa.
		const nastro = document.querySelector<HTMLElement>(".nastro");
		const esci = () => segnaQuota(scrollY);
		nastro?.addEventListener("click", esci, true);

		// ─── l'indice come via d'ingresso ───
		// Una voce dell'indice non porta più soltanto *davanti* a una soglia: ci
		// entra. Lo scorrimento prima non è una cortesia, è la condizione perché
		// l'ingresso sia una crescita e non una dissolvenza — React toglie il
		// `view-transition-name` da qualunque elemento fuori campo al momento del
		// commit, e senza scorrere la fotografia non c'è.
		//
		// L'`href="#slug"` resta nel marcato: senza JavaScript l'indice continua
		// a scorrere, che è il comportamento degradato giusto.
		const indice = document.querySelector<HTMLElement>("#margine .indice");
		const ridotto = matchMedia("(prefers-reduced-motion: reduce)");
		/** Le attese in corso, da annullare alla smontatura: un ingresso già
		 *  avvenuto non deve trascinarsi dietro un secondo clic. */
		const annulla: Array<() => void> = [];

		const entra = (e: MouseEvent) => {
			// Un cmd-clic deve continuare ad aprire una scheda.
			if (e.defaultPrevented || e.button !== 0) return;
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

			const voce = (e.target as Element | null)?.closest<HTMLAnchorElement>("a[data-sez]");
			const sez = voce?.dataset.sez ? document.getElementById(voce.dataset.sez) : null;
			const porta = sez?.querySelector<HTMLAnchorElement>(".soglia-a");
			if (!sez || !porta) return;

			e.preventDefault();

			// Un clic vero, non `router.push`: così l'ingresso prende esattamente
			// la stessa strada che prenderebbe il dito di chi legge.
			if (Math.abs(sez.getBoundingClientRect().top) < 8) {
				porta.click();
				return;
			}

			sez.scrollIntoView({ behavior: ridotto.matches ? "instant" : "smooth", block: "start" });

			// Si entra quando lo scorrimento si è fermato, e fermo vuol dire
			// fermo: tre fotogrammi alla stessa quota. Un `setTimeout` a occhio
			// scatterebbe a metà corsa quando la soglia è lontana — e sarebbe
			// proprio il caso in cui entrare senza la fotografia in campo rovina
			// la transizione. `scrollend` farebbe lo stesso lavoro ma non c'è su
			// Safari prima della 18.2, e questo non ha bisogno di saperlo.
			let fermo = 0;
			let ultimo = Number.NaN;
			let rif = 0;
			const smetti = () => cancelAnimationFrame(rif);
			const guarda = () => {
				if (scrollY === ultimo) fermo += 1;
				else {
					fermo = 0;
					ultimo = scrollY;
				}
				if (fermo >= 3) {
					porta.click();
					return;
				}
				rif = requestAnimationFrame(guarda);
			};
			rif = requestAnimationFrame(guarda);
			annulla.push(smetti);
		};

		indice?.addEventListener("click", entra);

		return () => {
			removeEventListener("scroll", alloScorrere);
			nastro?.removeEventListener("click", esci, true);
			indice?.removeEventListener("click", entra);
			for (const a of annulla) a();
			osservatore.disconnect();
			radice.style.removeProperty("--ground");
		};
	}, []);

	return null;
}
