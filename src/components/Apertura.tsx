"use client";

import { useEffect, useRef } from "react";
import type { Lingua } from "@/content/collezioni";
import { apertura, voci } from "@/content/collezioni";
import { SCRITTA, SEGNO } from "@/lib/logo";
import { frase } from "@/lib/testo";

/** I solchi del tornio intorno al segno, in multipli del suo raggio. */
const SOLCHI = [1.3, 1.62, 2.0, 2.5, 3.15, 4.0];

/**
 * I tempi, in frazioni del tratto in cui la scena sta ferma (`p` da 0 a 1).
 * La frase e la scritta circolare se ne vanno per prime; il segno cresce e si
 * spegne fino a 0.8, quando la prima stanza — che ha cominciato a salire a
 * metà — gli passa davanti e arriva a metà schermo.
 */
const T = { frase: [0, 0.32], giro: [0, 0.28], segno: [0.06, 0.8], solchi: [0, 0.9] } as const;

const limita = (v: number) => Math.min(Math.max(v, 0), 1);
const verso = (a: number, b: number, t: number) => a + (b - a) * t;
const tra = (p: number, [a, b]: readonly [number, number]) => limita((p - a) / (b - a));
const liscia = (t: number) => t * t * (3 - 2 * t);

/**
 * L'apertura della home: il segno del logo, intero, visto dall'alto come una
 * tazza sul tornio, con i solchi intorno; a sinistra la scritta e la frase.
 *
 * Scorrendo ci si entra dentro: il segno cresce attorno al suo centro, che
 * intanto va al centro dello schermo, e si spegne mentre cresce. La scena sta
 * ferma per l'80% di uno schermo e in quel tratto ogni pixel di scorrimento
 * cambia qualcosa. Poi la prima stanza sale *davanti* al segno che sta finendo
 * di spegnersi (`.nastro` ha `z-index: 1`, l'apertura un margine negativo):
 * niente le sta mai sopra, e non c'è un tratto vuoto prima di lei.
 *
 * La posizione di partenza è anche in CSS (`.segno`, con le unità del
 * contenitore): prima che arrivi JavaScript, o senza, il segno è già dove sarà.
 */
export function Apertura({ lingua }: { lingua: Lingua }) {
	const eroe = useRef<HTMLElement>(null);

	useEffect(() => {
		const sezione = eroe.current;
		const svg = sezione?.querySelector<SVGSVGElement>(".segni");
		const segno = sezione?.querySelector<HTMLElement>(".segno");
		const parole = sezione?.querySelector<HTMLElement>(".parole");
		const giro = sezione?.querySelector<SVGPathElement>("#giro");
		const testo = sezione?.querySelector<SVGTextElement>(".segni text");
		const cerchi = [...(sezione?.querySelectorAll<SVGCircleElement>(".anello") ?? [])];
		if (!sezione || !svg || !segno || !parole || !giro || !testo) return;

		const ridotto = matchMedia("(prefers-reduced-motion: reduce)");
		const punta = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
		let rif = 0;

		const disegna = () => {
			rif = 0;
			const fermo = ridotto.matches;
			punta.x = verso(punta.x, punta.tx, fermo ? 1 : 0.08);
			punta.y = verso(punta.y, punta.ty, fermo ? 1 : 0.08);

			const W = svg.clientWidth;
			const H = svg.clientHeight;
			const stretto = innerWidth < 881;
			const r0 = sezione.getBoundingClientRect();
			const p = limita(-r0.top / Math.max(r0.height - innerHeight, 1));

			// Il segno: lento all'inizio, poi accelera, come una discesa. Con il
			// movimento ridotto non cresce: si spegne soltanto.
			const dentro = fermo ? 0 : p ** 3;
			const c0x = stretto ? W * 0.5 : W * 0.68;
			const c0y = stretto ? H * 0.42 : H * 0.5;
			const verso0 = liscia(tra(p, [0, 0.7]));
			const cx = verso(c0x, W * 0.5, fermo ? 0 : verso0);
			const cy = verso(c0y, H * 0.5, fermo ? 0 : verso0);
			const R = stretto ? Math.min(W * 0.34, H * 0.2) : Math.min(H * 0.34, W * 0.23);
			const k = ((2 * R) / 221) * (1 + dentro * 9);
			const ox = (punta.x - 0.5) * (stretto ? 0 : -14) * (1 - p);
			const oy = (punta.y - 0.5) * (stretto ? 0 : -10) * (1 - p);
			const spento = liscia(tra(p, T.segno));
			segno.style.left = "0";
			segno.style.top = "0";
			segno.style.width = `${256 * k}px`;
			segno.style.transform = `translate(${cx - 110.5 * k + ox}px, ${cy - 110.5 * k + oy}px)`;
			segno.style.opacity = String(1 - spento);
			segno.style.visibility = spento >= 1 ? "hidden" : "";

			// I solchi: più vicini, più veloci.
			svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
			cerchi.forEach((c, i) => {
				const d = (i + 1) * (stretto ? 3 : 8);
				c.setAttribute("cx", String(cx - (punta.x - 0.5) * d * (1 - p)));
				c.setAttribute("cy", String(cy - (punta.y - 0.5) * d * (1 - p)));
				c.setAttribute("r", String(R * (SOLCHI[i] ?? 1) * (1 + dentro * (i + 2) * 2.2)));
				c.setAttribute("opacity", String((0.5 - i * 0.055) * (1 - liscia(tra(p, T.solchi)))));
			});

			const rg = R + (stretto ? 14 : 22);
			giro.setAttribute(
				"d",
				`M ${cx - rg} ${cy} a ${rg} ${rg} 0 1 1 ${rg * 2} 0 a ${rg} ${rg} 0 1 1 ${-rg * 2} 0`,
			);
			testo.setAttribute("transform", `rotate(${-8 + (fermo ? 0 : p * 160)} ${cx} ${cy})`);
			testo.style.opacity = String(1 - liscia(tra(p, T.giro)));

			const via = liscia(tra(p, T.frase));
			parole.style.opacity = String(1 - via);
			parole.style.translate = `0 ${-via * 50}px`;
			parole.style.visibility = via >= 1 ? "hidden" : "";

			// La parallasse rincorre il mouse per qualche fotogramma ancora.
			if (Math.abs(punta.x - punta.tx) + Math.abs(punta.y - punta.ty) > 0.001) chiedi();
		};
		const chiedi = () => {
			if (!rif) rif = requestAnimationFrame(disegna);
		};
		const muovi = (e: PointerEvent) => {
			if (e.pointerType !== "mouse") return;
			punta.tx = e.clientX / innerWidth;
			punta.ty = e.clientY / innerHeight;
			chiedi();
		};

		disegna();
		addEventListener("scroll", chiedi, { passive: true });
		addEventListener("resize", chiedi);
		addEventListener("pointermove", muovi, { passive: true });
		return () => {
			cancelAnimationFrame(rif);
			removeEventListener("scroll", chiedi);
			removeEventListener("resize", chiedi);
			removeEventListener("pointermove", muovi);
		};
	}, []);

	return (
		<section ref={eroe} className="apertura" data-fondo="#F5F2EB">
			<div className="palco">
				<svg className="segni" aria-hidden="true">
					<defs>
						<path id="giro" />
					</defs>
					<g>
						{SOLCHI.map((f) => (
							<circle key={f} className="anello" />
						))}
					</g>
					<text>
						<textPath href="#giro">{apertura.giro[lingua]}</textPath>
					</text>
				</svg>

				<div className="segno">
					<svg viewBox="452 21 256 222" aria-hidden="true">
						<g fill="currentColor">
							{SEGNO.map((d) => (
								<path key={d.slice(0, 24)} d={d} />
							))}
						</g>
					</svg>
				</div>

				<div className="parole">
					<svg className="parola" viewBox="16 21 416 222" role="img" aria-label="Sandu Pottery">
						<g fill="currentColor">
							{SCRITTA.map((d) => (
								<path key={d.slice(0, 24)} d={d} />
							))}
						</g>
					</svg>
					<p className="occhiello">{apertura.occhiello[lingua]}</p>
					<h1>{frase(apertura.frase[lingua])}</h1>
				</div>

				{/* Dice che sotto c'è dell'altro, e svanisce ai primi centimetri
				    (`Scorrimento`). Nascosto ai lettori di schermo: «scorri» non è
				    un'informazione per chi non scorre. */}
				<p className="scorri" aria-hidden="true">
					<span className="asta" />
					<span className="parola">{voci.scorri[lingua]}</span>
				</p>
			</div>
		</section>
	);
}
