import Link from "next/link";
import { ViewTransition } from "react";
import type { Lingua } from "@/content/collezioni";
import { apertura, collezioni, romano, voci } from "@/content/collezioni";
import { percorsoStanza } from "@/lib/percorsi";
import { righe } from "@/lib/testo";
import { Dati } from "./Dati";
import { Immagine } from "./Immagine";
import { Margine } from "./Margine";
import { Piede } from "./Piede";
import { Scorrimento } from "./Scorrimento";

/** Il fondo di partenza: la carta. Lo stesso valore di `--color-sp-carta`. */
const CARTA = "#F5F2EB";

/**
 * La home: un nastro di fotografie e sei soglie.
 *
 * Poche parole in tutto. Il discorso lungo sta nelle stanze; qui ogni stanza ha
 * una fotografia grande, il suo nome accanto e una riga sola.
 *
 * **Il nastro.** Le sei fotografie stanno in un canale solo, tutte della stessa
 * larghezza e della stessa altezza, staccate di un filo di colore: la
 * continuità fra una stanza e l'altra non è un segno aggiunto, è fisica. Tutta
 * la varietà passa sul testo, che esce dal canale a sinistra a quote e rientri
 * diversi e resta fermo mentre la sua fotografia gli scorre accanto.
 *
 * **Il legame avvolge tutta la soglia**, e non è un dettaglio: su un telefono
 * il cursore non esiste e senza questo nulla direbbe che la soglia si apre. Un
 * legame solo, non due che puntano allo stesso posto, perché due voci identiche
 * in un lettore di schermo sono rumore — e tenere insieme le due metà (la
 * didascalia a sinistra, la fotografia a destra) si può solo contenendole
 * entrambe.
 *
 * Ogni soglia è anche la metà di casa di una transizione: la fotografia e il
 * titolo hanno lo stesso `name` degli omologhi nella stanza, quindi il browser
 * li fa crescere l'uno nell'altro invece di scambiarli.
 */
export function Casa({ lingua }: { lingua: Lingua }) {
	return (
		<>
			{/* Primo elemento raggiungibile da tastiera: senza, si attraversa
			    l'indice intero prima di arrivare alla pagina. */}
			<a className="salta" href="#contenuto">
				{voci.saltaAlContenuto[lingua]}
			</a>

			<Margine lingua={lingua} />

			<Dati lingua={lingua} />

			<main id="contenuto">
				<section className="apertura" data-fondo={CARTA}>
					<p className="occhiello">{apertura.occhiello[lingua]}</p>
					<h1>
						<span className="p1">{apertura.uno[lingua]}</span>{" "}
						<span className="p2">{apertura.due[lingua]}</span> {apertura.tre[lingua]}
						<span className="p4">{apertura.mezzo[lingua]}</span>
						<span className="p5">{apertura.quattro[lingua]}</span>
						{apertura.cinque[lingua]}
					</h1>

					{/* Il primo schermo non contiene altro che la frase: questo dice che
					    sotto c'è dell'altro, ed è l'unica cosa che ha il diritto di
					    muoversi da sola in tutta la pagina. Nascosto ai lettori di
					    schermo — «scorri» non è un'informazione per chi non scorre. */}
					<p className="scorri" aria-hidden="true">
						{/* Disegnata, non composta: l'asta ha lo spessore di un filetto del
						    sito e la punta è due tratti stretti e lunghi che si assottigliano
						    verso l'alto, come le grazie del carattere. Una cuspide a
						    quarantacinque gradi — o peggio un carattere «↓» — porterebbe in
						    pagina il disegno di un'altra mano. */}
						<svg
							className="freccia"
							viewBox="0 0 14 80"
							width="14"
							height="80"
							fill="currentColor"
							aria-hidden="true"
						>
							<path d="M6.35 0 L7.65 0 L7.65 79.6 L6.35 79.6 Z" />
							<path d="M7 79.6 L1.1 62.6 L7 75.6 Z" />
							<path d="M7 79.6 L12.9 62.6 L7 75.6 Z" />
						</svg>
						<span className="parola">{voci.scorri[lingua]}</span>
					</p>
				</section>

				<div className="nastro">
					{collezioni.map((c, i) => (
						<section
							key={c.slug}
							id={c.slug}
							className={`soglia n${i + 1}`}
							data-fondo={c.fondo}
							data-sez={c.slug}
						>
							{/* Il legame è il titolo e nient'altro — nessun `aria-label`: il nome
							    se lo dà il testo che contiene. Una etichetta esplicita sarebbe più
							    breve, ma su un titolo che va a capo non combacerebbe mai con quello
							    che si vede — e chi comanda il browser a voce pronuncia quello. */}
							<div className="testo">
								{/* Il numero romano al posto di «Collezione uno»: dice la stessa
								    cosa — a che punto del percorso siamo — senza fingere di essere
								    un'informazione. */}
								<p className="numero" aria-hidden="true">
									{romano(i)}
								</p>

								<Link className="soglia-a" href={percorsoStanza(lingua, c.slug)} data-glifo="↗">
									<ViewTransition name={`titolo-${c.slug}`} share="titolo-morph" default="none">
										<h2 className="titolo">
											{righe(c.titolo[lingua]).map((riga, n, tutte) => (
												<span className="linea" key={riga.chiave}>
													{riga.nodi}
													{/* Uno spazio vero fra una riga e l'altra. Due blocchi
													    adiacenti senza spazio danno «Ciondoli eOrecchini» come
													    testo dell'elemento, e il nome accessibile del legame non
													    corrisponderebbe più a quello che si legge. In fine di
													    riga lo spazio non si vede: il CSS lo lascia cadere. */}
													{n < tutte.length - 1 ? " " : null}
												</span>
											))}
										</h2>
									</ViewTransition>
								</Link>

								<p className="riga">{c.riga[lingua]}</p>
							</div>

							{/* Fuori dal legame, e di proposito: su schermo largo si entra dal
							    titolo, non dalla fotografia. Così il cursore a disco compare solo
							    dove si può davvero entrare, e sopra la fotografia resta il segno
							    che dice «questa è una fotografia». Sul telefono, dove il cursore
							    non esiste e il bersaglio dev'essere grande, il legame si distende
							    su tutta la soglia — vedi `.soglia-a::after` in globals.css. */}
							<ViewTransition name={`eroe-${c.slug}`} share="morph" default="none">
								<figure>
									<Immagine
										foto={c.soglia.foto}
										alt={c.soglia.alt[lingua]}
										fuoco={c.soglia.fuoco}
										sizes="(max-width: 880px) 100vw, 60vw"
									/>
								</figure>
							</ViewTransition>
						</section>
					))}
				</div>
			</main>

			<Piede lingua={lingua} />

			<Scorrimento />
		</>
	);
}
