"use client";

import { useEffect } from "react";

/** Elementi il cui contenuto è testo da leggere, non superficie da cliccare. */
const TESTO = new Set([
	"P",
	"BLOCKQUOTE",
	"H1",
	"H2",
	"LI",
	"EM",
	"I",
	"B",
	"STRONG",
	"SPAN",
	"FOOTER",
]);

/** L'altezza della barra segue la riga che sta toccando, entro limiti sani. */
function altezzaRiga(el: Element): number {
	const s = getComputedStyle(el);
	const h = Number.parseFloat(s.lineHeight);
	const base = Number.isFinite(h) ? h : Number.parseFloat(s.fontSize) * 1.3;
	return Math.min(Math.max(base, 16), 44);
}

/**
 * Il cursore.
 *
 * A riposo è un glifo che dice soltanto che cosa ha sotto: un rombo sul
 * vuoto, una barra sul testo (alta quanto la riga), una croce sulla
 * fotografia. Sopra un legame il glifo si ritira e si apre un disco con
 * dentro la freccia del movimento che si sta per fare: ↗ entrare, ↓ scendere,
 * ← tornare, → continuare, ↔ cambiare lingua.
 *
 * Tutti i cambi di forma usano la stessa curva (`--molla`), così i due stati
 * sembrano lo stesso oggetto che si apre e non due disegni che si scambiano.
 *
 * Compare solo dove ha senso: puntatore fine, schermo largo, movimento non
 * ridotto. Altrove resta il cursore di sistema e non si perde nulla.
 */
export function Cursore() {
	useEffect(() => {
		const fine = matchMedia("(pointer: fine)");
		const largo = matchMedia("(min-width: 881px)");
		const ridotto = matchMedia("(prefers-reduced-motion: reduce)");
		if (!fine.matches || !largo.matches || ridotto.matches) return;

		const cur = document.getElementById("cursore");
		const glifo = document.getElementById("segno-disco");
		if (!cur || !glifo) return;

		const corpo = document.body;
		corpo.classList.add("cursore-attivo");

		const muovi = (e: MouseEvent) => {
			cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
		};

		const sopra = (e: MouseEvent) => {
			const t = e.target as Element | null;
			if (!t || !("closest" in t)) return;

			const legame = t.closest("a");
			corpo.classList.toggle("tocca", !!legame);

			const suFoto = !legame && !!t.closest("figure");
			const suTesto =
				!legame && !suFoto && TESTO.has(t.tagName) && (t.textContent?.trim().length ?? 0) > 0;

			corpo.classList.toggle("su-foto", suFoto);
			corpo.classList.toggle("su-testo", suTesto);
			if (suTesto) {
				corpo.style.setProperty("--altezza-testo", `${altezzaRiga(t)}px`);
			}

			if (legame) glifo.textContent = legame.dataset.glifo || "↗";
		};

		// Fuori dalla finestra il cursore finto resterebbe incollato all'ultimo
		// punto: meglio nasconderlo e lasciare quello vero al resto del sistema.
		const esci = () => {
			cur.style.opacity = "0";
		};
		const entra = () => {
			cur.style.opacity = "1";
		};

		addEventListener("mousemove", muovi, { passive: true });
		addEventListener("mouseover", sopra, { passive: true });
		document.addEventListener("mouseleave", esci);
		document.addEventListener("mouseenter", entra);

		return () => {
			removeEventListener("mousemove", muovi);
			removeEventListener("mouseover", sopra);
			document.removeEventListener("mouseleave", esci);
			document.removeEventListener("mouseenter", entra);
			corpo.classList.remove("cursore-attivo", "tocca", "su-foto", "su-testo");
		};
	}, []);

	return (
		<div id="cursore" aria-hidden="true">
			<span className="forma" id="glifo">
				<i />
				<i />
			</span>
			<span className="forma" id="disco">
				<span id="segno-disco">↗</span>
			</span>
		</div>
	);
}
