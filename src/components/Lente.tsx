"use client";

import { useEffect, useRef } from "react";
import type { Lingua } from "@/content/collezioni";
import { voci } from "@/content/collezioni";

/** La stessa curva della crescita casa → stanza: è lo stesso gesto, più breve. */
const CURVA = "cubic-bezier(0.62, 0, 0.12, 1)";
const DURATA = 520;
/** Oltre, la fotografia grande (1600px) si sgrana. */
const MASSIMO = 3;
const DOPPIO = 2.5;

type Rett = { x: number; y: number; w: number; h: number };

/** `object-position` calcolato → frazioni. Parole chiave comprese: «center 26%». */
function posizione(valore: string): [number, number] {
	const parola: Record<string, number> = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };
	const [a = "50%", b = "50%"] = valore.split(" ");
	const leggi = (v: string) => (v.endsWith("%") ? Number.parseFloat(v) / 100 : (parola[v] ?? 0.5));
	return [leggi(a), leggi(b)];
}

/**
 * La lente: una fotografia della stanza, quasi a tutto schermo, da guardare
 * da vicino.
 *
 * **La miniatura cresce, non viene sostituita.** All'apertura l'immagine parte
 * esattamente dov'era la miniatura — con lo stesso ritaglio, ricostruito con
 * un `clip-path` — e mentre si allarga il ritaglio si apre fino alla
 * fotografia intera. Alla chiusura fa il percorso inverso; se nel frattempo si
 * è passati a un'altra fotografia, la pagina sotto si sposta (senza che si
 * veda) per riportarla in campo, così si richiude sempre nel suo posto.
 * Animazioni del browser (`element.animate`), niente libreria: è la regola
 * del sito.
 *
 * **I gesti.** Rotella e pizzico ingrandiscono attorno al punto che si sta
 * guardando; il doppio tocco (o doppio clic) passa da 1× a 2,5× e indietro;
 * ingrandita, la si trascina. A 1× il trascinamento orizzontale cambia
 * fotografia e quello verso il basso chiude, come in ogni galleria del
 * telefono. Da tastiera: frecce, + e −, Esc.
 *
 * Il `<dialog>` modale dà gratis quello che altrimenti andrebbe scritto: la
 * messa a fuoco intrappolata, il resto della pagina inerte, Esc.
 *
 * Tutto quello che si muove a ogni fotogramma è scritto direttamente nello
 * stile, non in uno stato di React: un pizzico non deve far ridisegnare
 * niente.
 */
export function Lente({ lingua }: { lingua: Lingua }) {
	const finestra = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dlg = finestra.current;
		const palco = dlg?.querySelector<HTMLElement>(".lente-palco");
		const img = dlg?.querySelector<HTMLImageElement>(".lente-img");
		const fondo = dlg?.querySelector<HTMLElement>(".lente-fondo");
		const didascalia = dlg?.querySelector<HTMLElement>(".lente-didascalia");
		const conta = dlg?.querySelector<HTMLElement>(".lente-conta");
		if (!dlg || !palco || !img || !fondo || !didascalia || !conta) return;

		const ridotto = matchMedia("(prefers-reduced-motion: reduce)");

		/*
		 * Il cursore personalizzato è un elemento qualunque, e il dialogo modale
		 * sta nello strato superiore: senza questo il cursore resterebbe sotto la
		 * lente, invisibile, mentre quello di sistema è nascosto. Per il tempo
		 * in cui la lente è aperta diventa anche lui un popover — strato
		 * superiore pure lui, e mostrato *dopo* il dialogo, quindi sopra.
		 */
		const cursore = document.getElementById("cursore");
		const promuovi = () => {
			if (!cursore || !document.body.classList.contains("cursore-attivo")) return;
			cursore.popover = "manual";
			cursore.showPopover();
		};
		const congeda = () => {
			if (!cursore?.popover) return;
			cursore.hidePopover();
			cursore.removeAttribute("popover");
		};
		const durata = (ms: number) => (ridotto.matches ? 0 : ms);

		let porte: HTMLButtonElement[] = [];
		let i = 0;
		let fit: Rett = { x: 0, y: 0, w: 1, h: 1 };
		// Lo zoom: scala e spostamento rispetto alla posizione di riposo.
		let s = 1;
		let tx = 0;
		let ty = 0;
		let occupato = false;

		const miniatura = (k: number) => porte[k]?.querySelector("img") ?? null;

		/** La scatola in cui la fotografia sta intera: quasi tutto lo schermo,
		 *  meno la fascia dei comandi. */
		const adatta = (aspetto: number): Rett => {
			const stretto = innerWidth < 881;
			const mx = stretto ? 0 : 64;
			const sopra = stretto ? 56 : 72;
			const sotto = stretto ? 124 : 112;
			const W = innerWidth - 2 * mx;
			const H = innerHeight - sopra - sotto;
			const w = Math.min(W, H * aspetto);
			const h = w / aspetto;
			return { x: (innerWidth - w) / 2, y: sopra + (H - h) / 2, w, h };
		};

		const riposo = () => `translate(${fit.x}px, ${fit.y}px) scale(1)`;
		const applica = () => {
			img.style.transform = `translate(${fit.x + tx}px, ${fit.y + ty}px) scale(${s})`;
			const dentro = s > 1.01;
			dlg.classList.toggle("zoomata", dentro);
			// Il disco del cursore dice che cosa farà il prossimo clic.
			img.dataset.glifo = dentro ? "−" : "+";
		};
		const disponi = () => {
			img.style.width = `${fit.w}px`;
			img.style.height = `${fit.h}px`;
			applica();
		};

		/** Tiene la fotografia ingrandita dentro lo schermo: dove è più piccola
		 *  dello schermo resta centrata, dove è più grande non mostra mai vuoto
		 *  oltre il suo bordo. */
		const trattieni = () => {
			if (s <= 1) {
				s = 1;
				tx = 0;
				ty = 0;
				return;
			}
			const asse = (t: number, lato: number, origine: number, schermo: number) => {
				const largo = lato * s;
				if (largo <= schermo) return (lato / 2) * (1 - s) + (schermo / 2 - origine - lato / 2);
				return Math.min(-origine, Math.max(schermo - largo - origine, t));
			};
			tx = asse(tx, fit.w, fit.x, innerWidth);
			ty = asse(ty, fit.h, fit.y, innerHeight);
		};

		/** Ingrandisce a `nuova` tenendo fermo il punto (px, py) dello schermo. */
		const zooma = (nuova: number, px: number, py: number) => {
			const n = Math.min(Math.max(nuova, 1), MASSIMO);
			const lx = (px - fit.x - tx) / s;
			const ly = (py - fit.y - ty) / s;
			tx = px - fit.x - lx * n;
			ty = py - fit.y - ly * n;
			s = n;
			trattieni();
			applica();
		};

		const dolce = (fn: () => void) => {
			img.style.transition = `transform ${durata(340)}ms ${CURVA}`;
			fn();
			setTimeout(() => {
				img.style.transition = "";
			}, durata(360));
		};

		/** Il fotogramma di partenza: la fotografia intera, scalata come la
		 *  copertura della miniatura e ritagliata alla sua scatola. */
		const daMiniatura = (k: number): Keyframe | null => {
			const porta = porte[k];
			const mini = miniatura(k);
			if (!porta || !mini) return null;
			const r = porta.getBoundingClientRect();
			const [px, py] = posizione(getComputedStyle(mini).objectPosition);
			const scala = Math.max(r.width / fit.w, r.height / fit.h);
			const cw = fit.w * scala;
			const ch = fit.h * scala;
			const cx = r.left + (r.width - cw) * px;
			const cy = r.top + (r.height - ch) * py;
			return {
				transform: `translate(${cx}px, ${cy}px) scale(${scala})`,
				clipPath: `inset(${(r.top - cy) / scala}px ${(cx + cw - r.right) / scala}px ${(cy + ch - r.bottom) / scala}px ${(r.left - cx) / scala}px)`,
			};
		};

		const nascondi = (k: number, si: boolean) => {
			const p = porte[k]?.querySelector("picture");
			if (p) p.style.visibility = si ? "hidden" : "";
		};

		const aspettoDi = (el: HTMLImageElement | null) =>
			el?.naturalWidth ? el.naturalWidth / el.naturalHeight : 0.75;

		/** Dalla misura che la pagina ha già scaricato a quella grande: la
		 *  miniatura appare subito, la definizione arriva appena c'è. */
		const grande = (src: string) => src.replace(/-s\.avif$/, ".avif");
		const caricaGrande = (k: number) => {
			const mini = miniatura(k);
			if (!mini) return;
			const alta = grande(mini.currentSrc || mini.src);
			if (alta === img.src) return;
			const pronta = new Image();
			pronta.src = alta;
			pronta
				.decode()
				.then(() => {
					if (k === i && dlg.open) img.src = alta;
				})
				.catch(() => {});
		};

		const scrivi = (k: number) => {
			const mini = miniatura(k);
			img.src = mini?.currentSrc || mini?.src || "";
			img.alt = mini?.alt ?? "";
			didascalia.textContent = mini?.alt ?? "";
			conta.textContent = porte.length > 1 ? `${k + 1} / ${porte.length}` : "";
			dlg.classList.toggle("sola", porte.length < 2);
		};

		const apri = (porta: HTMLButtonElement) => {
			if (occupato) return;
			porte = [...document.querySelectorAll<HTMLButtonElement>("main .lente-apri")];
			i = Math.max(porte.indexOf(porta), 0);
			smetti();
			s = 1;
			tx = 0;
			ty = 0;
			scrivi(i);
			fit = adatta(aspettoDi(miniatura(i)));
			disponi();
			dlg.showModal();
			promuovi();
			// Sul «Chiudi», non sulla prima freccia: è l'unico comando che c'è
			// sempre, ed Esc e le frecce funzionano comunque da qui.
			dlg.querySelector<HTMLElement>(".lente-chiudi")?.focus();

			const partenza = daMiniatura(i);
			occupato = true;
			nascondi(i, true);
			fondo.animate([{ opacity: 0 }, { opacity: 1 }], {
				duration: durata(DURATA * 0.8),
				easing: "ease",
			});
			dlg.classList.add("aperta");
			const a = img.animate(
				partenza
					? [partenza, { transform: riposo(), clipPath: "inset(0px 0px 0px 0px)" }]
					: [{ opacity: 0 }, { opacity: 1 }],
				{ duration: durata(DURATA), easing: CURVA },
			);
			a.finished
				.catch(() => {})
				.then(() => {
					occupato = false;
					caricaGrande(i);
				});
		};

		const chiudi = () => {
			if (occupato || !dlg.open) return;
			occupato = true;
			const k = i;
			const porta = porte[k];
			// Si richiude nel suo posto, anche se nel frattempo si era passati a
			// una fotografia fuori campo: la pagina sotto si sposta senza farsi
			// vedere, la lente la copre.
			if (porta) {
				const r = porta.getBoundingClientRect();
				if (r.bottom < 0 || r.top > innerHeight)
					porta.scrollIntoView({ block: "center", behavior: "instant" });
			}
			const arrivo = daMiniatura(k);
			const ora = img.style.transform;
			nascondi(k, true);
			dlg.classList.remove("aperta");
			fondo.animate([{ opacity: 1 }, { opacity: 0 }], {
				duration: durata(DURATA * 0.8),
				easing: "ease",
				fill: "forwards",
			});
			const a = img.animate(
				arrivo
					? [{ transform: ora, clipPath: "inset(0px 0px 0px 0px)" }, arrivo]
					: [{ opacity: 1 }, { opacity: 0 }],
				{ duration: durata(DURATA * 0.85), easing: CURVA, fill: "forwards" },
			);
			a.finished
				.catch(() => {})
				.then(() => {
					nascondi(k, false);
					dlg.close();
					congeda();
					for (const an of [...img.getAnimations(), ...fondo.getAnimations()]) an.cancel();
					img.removeAttribute("src");
					occupato = false;
					porta?.focus({ preventScroll: true });
				});
		};

		const vai = (passo: number) => {
			if (occupato || porte.length < 2) return;
			occupato = true;
			const k = (i + passo + porte.length) % porte.length;
			const esci = img.animate(
				[
					{ opacity: 1, translate: "0 0" },
					{ opacity: 0, translate: `${-passo * 40}px 0` },
				],
				{ duration: durata(160), easing: "ease-in", fill: "forwards" },
			);
			esci.finished
				.catch(() => {})
				.then(() => {
					// Il buco nella pagina segue la fotografia: è lì che si richiuderà.
					nascondi(i, false);
					nascondi(k, true);
					i = k;
					smetti();
					s = 1;
					tx = 0;
					ty = 0;
					scrivi(k);
					const pronto = () => {
						fit = adatta(aspettoDi(img));
						disponi();
						esci.cancel();
						img
							.animate(
								[
									{ opacity: 0, translate: `${passo * 40}px 0` },
									{ opacity: 1, translate: "0 0" },
								],
								{
									duration: durata(260),
									easing: "ease-out",
								},
							)
							.finished.catch(() => {})
							.then(() => {
								occupato = false;
								caricaGrande(k);
							});
					};
					// Una miniatura mai caricata (era fuori campo, e pigra) non sa
					// ancora le proprie proporzioni: si aspetta la fotografia.
					if (img.complete && img.naturalWidth) pronto();
					else img.addEventListener("load", pronto, { once: true });
				});
		};

		// ─── il clic sulle miniature, delegato ───
		const alClic = (e: MouseEvent) => {
			const porta = (e.target as Element | null)?.closest<HTMLButtonElement>(".lente-apri");
			if (porta) apri(porta);
		};
		document.addEventListener("click", alClic);

		// ─── i comandi ───
		const alComando = (e: MouseEvent) => {
			const b = (e.target as Element | null)?.closest<HTMLButtonElement>("[data-lente]");
			if (!b) return;
			const cosa = b.dataset.lente;
			if (cosa === "chiudi") chiudi();
			else if (cosa === "prima") vai(-1);
			else if (cosa === "dopo") vai(1);
		};
		dlg.addEventListener("click", alComando);

		const alTasto = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") vai(1);
			else if (e.key === "ArrowLeft") vai(-1);
			else if (e.key === "+" || e.key === "=")
				dolce(() => zooma(s * 1.6, innerWidth / 2, innerHeight / 2));
			else if (e.key === "-") dolce(() => zooma(s / 1.6, innerWidth / 2, innerHeight / 2));
			else return;
			e.preventDefault();
		};
		dlg.addEventListener("keydown", alTasto);

		// Esc: il dialogo si chiuderebbe di colpo; si chiude invece con il suo gesto.
		const annulla = (e: Event) => {
			e.preventDefault();
			chiudi();
		};
		dlg.addEventListener("cancel", annulla);

		// ─── rotella ───
		const allaRotella = (e: WheelEvent) => {
			e.preventDefault();
			if (occupato) return;
			// Il pizzico del trackpad arriva come rotella con ctrl: va più veloce.
			const forza = e.ctrlKey ? 0.01 : 0.0022;
			smetti();
			zooma(s * Math.exp(-e.deltaY * forza), e.clientX, e.clientY);
		};
		palco.addEventListener("wheel", allaRotella, { passive: false });

		// ─── dita e mouse ───
		const dita = new Map<number, { x: number; y: number }>();
		let inizio = { x: 0, y: 0, t: 0, tx: 0, ty: 0, s: 1, d: 1, mx: 0, my: 0 };
		let mosso = false;
		// Il bersaglio va letto alla pressione: con la cattura del puntatore
		// il rilascio arriva sempre al palco, mai alla fotografia.
		let sullaFoto = false;
		let ultimoTocco = { t: 0, x: 0, y: 0 };

		const distanza = () => {
			const [a, b] = [...dita.values()];
			return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 1;
		};
		const centro = () => {
			const v = [...dita.values()];
			return {
				x: v.reduce((n, p) => n + p.x, 0) / v.length,
				y: v.reduce((n, p) => n + p.y, 0) / v.length,
			};
		};
		const ricomincia = (t: number) => {
			const c = centro();
			inizio = { x: c.x, y: c.y, t, tx, ty, s, d: distanza(), mx: c.x, my: c.y };
		};

		/**
		 * Col mouse non si trascina: un clic avvicina la fotografia nel punto
		 * cliccato, e poi basta muoversi — la fotografia scorre sotto il
		 * puntatore, il bordo sinistro dello schermo è il suo bordo sinistro.
		 * Un altro clic la rimette intera. È il gesto dei cataloghi d'arte in
		 * rete, e non chiede di sapere nulla.
		 */
		let segue = false;
		const esplora = (x: number, y: number) => {
			const asse = (p: number, lato: number, origine: number, schermo: number) => {
				const largo = lato * s;
				if (largo <= schermo) return (lato / 2) * (1 - s) + (schermo / 2 - origine - lato / 2);
				const f = Math.min(Math.max((p - schermo * 0.1) / (schermo * 0.8), 0), 1);
				return -(largo - schermo) * f - origine;
			};
			tx = asse(x, fit.w, fit.x, innerWidth);
			ty = asse(y, fit.h, fit.y, innerHeight);
			applica();
		};
		const alMouse = (e: PointerEvent) => {
			if (e.pointerType !== "mouse" || !segue || occupato) return;
			esplora(e.clientX, e.clientY);
		};
		palco.addEventListener("pointermove", alMouse);
		const smetti = () => {
			segue = false;
			img.classList.remove("segue");
		};

		const giu = (e: PointerEvent) => {
			if (occupato || (e.target as Element).closest("button")) return;
			if (e.pointerType === "mouse") {
				sullaFoto = e.target === img;
				inizio = { ...inizio, x: e.clientX, y: e.clientY };
				return;
			}
			palco.setPointerCapture(e.pointerId);
			dita.set(e.pointerId, { x: e.clientX, y: e.clientY });
			if (dita.size === 1) {
				mosso = false;
				sullaFoto = e.target === img;
			}
			ricomincia(e.timeStamp);
		};

		const muovi = (e: PointerEvent) => {
			if (!dita.has(e.pointerId)) return;
			dita.set(e.pointerId, { x: e.clientX, y: e.clientY });
			const c = centro();
			const dx = c.x - inizio.x;
			const dy = c.y - inizio.y;
			if (Math.hypot(dx, dy) > 6) mosso = true;

			if (dita.size >= 2) {
				// Pizzico: la scala segue la distanza fra le dita, attorno al loro
				// punto medio di partenza, e il punto medio trascina.
				const n = Math.min(Math.max((inizio.s * distanza()) / inizio.d, 1), MASSIMO);
				const lx = (inizio.mx - fit.x - inizio.tx) / inizio.s;
				const ly = (inizio.my - fit.y - inizio.ty) / inizio.s;
				s = n;
				tx = c.x - fit.x - lx * n;
				ty = c.y - fit.y - ly * n;
				trattieni();
				applica();
				return;
			}

			if (s > 1) {
				tx = inizio.tx + dx;
				ty = inizio.ty + dy;
				trattieni();
				applica();
				return;
			}

			// A 1×: la fotografia segue il dito, in orizzontale per cambiare,
			// verso il basso per chiudere.
			if (!mosso) return;
			if (Math.abs(dx) > Math.abs(dy)) {
				img.style.transform = `translate(${fit.x + dx}px, ${fit.y}px)`;
				fondo.style.opacity = "";
			} else if (dy > 0) {
				img.style.transform = `translate(${fit.x}px, ${fit.y + dy}px) scale(${1 - Math.min(dy / innerHeight, 0.3)})`;
				fondo.style.opacity = String(1 - Math.min(dy / (innerHeight * 0.6), 0.7));
			}
		};

		const su = (e: PointerEvent) => {
			if (e.pointerType === "mouse") {
				if (e.type !== "pointerup" || occupato || (e.target as Element).closest("button")) return;
				if (Math.hypot(e.clientX - inizio.x, e.clientY - inizio.y) > 6) return;
				if (!sullaFoto) {
					chiudi();
					return;
				}
				if (s > 1.01) {
					smetti();
					dolce(() => zooma(1, e.clientX, e.clientY));
				} else {
					s = DOPPIO;
					segue = true;
					img.classList.add("segue");
					esplora(e.clientX, e.clientY);
				}
				return;
			}
			if (!dita.has(e.pointerId)) return;
			const c = centro();
			dita.delete(e.pointerId);
			if (dita.size > 0) {
				ricomincia(e.timeStamp);
				return;
			}
			const dx = c.x - inizio.x;
			const dy = c.y - inizio.y;

			if (!mosso) {
				// Un tocco. Fuori dalla fotografia chiude; due tocchi vicini sulla
				// fotografia ingrandiscono o tornano a 1×.
				if (!sullaFoto) {
					chiudi();
					return;
				}
				const doppio =
					e.timeStamp - ultimoTocco.t < 320 &&
					Math.hypot(c.x - ultimoTocco.x, c.y - ultimoTocco.y) < 30;
				ultimoTocco = doppio ? { t: 0, x: 0, y: 0 } : { t: e.timeStamp, x: c.x, y: c.y };
				if (doppio) dolce(() => (s > 1.01 ? zooma(1, c.x, c.y) : zooma(DOPPIO, c.x, c.y)));
				return;
			}

			if (s > 1 || inizio.s > 1) return;

			fondo.style.opacity = "";
			if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
				applica();
				vai(dx < 0 ? 1 : -1);
			} else if (dy > 110 && dy > Math.abs(dx)) {
				chiudi();
			} else {
				dolce(applica);
			}
		};

		palco.addEventListener("pointerdown", giu);
		palco.addEventListener("pointermove", muovi);
		palco.addEventListener("pointerup", su);
		palco.addEventListener("pointercancel", su);

		const alRidimensionare = () => {
			if (!dlg.open) return;
			fit = adatta(aspettoDi(img));
			smetti();
			s = 1;
			tx = 0;
			ty = 0;
			disponi();
		};
		addEventListener("resize", alRidimensionare);

		return () => {
			document.removeEventListener("click", alClic);
			dlg.removeEventListener("click", alComando);
			dlg.removeEventListener("keydown", alTasto);
			dlg.removeEventListener("cancel", annulla);
			palco.removeEventListener("wheel", allaRotella);
			palco.removeEventListener("pointerdown", giu);
			palco.removeEventListener("pointermove", muovi);
			palco.removeEventListener("pointerup", su);
			palco.removeEventListener("pointercancel", su);
			palco.removeEventListener("pointermove", alMouse);
			congeda();
			removeEventListener("resize", alRidimensionare);
		};
	}, []);

	return (
		<dialog ref={finestra} className="lente" aria-label={voci.ingrandisci[lingua]}>
			<div className="lente-fondo" />
			<div className="lente-palco" data-glifo="×">
				{/* biome-ignore lint/performance/noImgElement: la sorgente cambia a mano a ogni fotografia, next/image qui sarebbe solo un involucro. */}
				<img className="lente-img" alt="" draggable={false} data-glifo="+" />
			</div>
			<div className="lente-comandi">
				<p className="lente-didascalia" />
				<p className="lente-aiuto" aria-hidden="true">
					<span className="col-mouse">{voci.aiutoMouse[lingua]}</span>
					<span className="col-dito">{voci.aiutoDito[lingua]}</span>
				</p>
				<p className="lente-conta" aria-hidden="true" />
				<div className="lente-passi">
					<button
						type="button"
						data-lente="prima"
						data-glifo="←"
						aria-label={voci.precedente[lingua]}
					>
						←
					</button>
					<button
						type="button"
						data-lente="dopo"
						data-glifo="→"
						aria-label={voci.successiva[lingua]}
					>
						→
					</button>
				</div>
			</div>
			<button type="button" className="lente-chiudi" data-lente="chiudi" data-glifo="×">
				{voci.chiudi[lingua]}
				<span aria-hidden="true"> ×</span>
			</button>
		</dialog>
	);
}
