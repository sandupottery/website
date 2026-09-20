import Link from "next/link";
import { Fragment, ViewTransition } from "react";
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
 * La home: un percorso di fotografie e sei soglie.
 *
 * Poche parole in tutto. Il discorso lungo sta nelle stanze; qui ogni stanza ha
 * una fotografia, il suo nome che le attraversa sopra e una riga sola. Le
 * impaginazioni (`c1`…`c6`) sono diverse di proposito: un'alternanza
 * destra/sinistra si legge come una griglia, e la pagina tornerebbe immobile.
 *
 * Fotografia e titolo stanno **dentro lo stesso legame**, e non è un dettaglio:
 * su un telefono il cursore non esiste e senza questo nulla direbbe che la
 * soglia si apre. Un legame solo, non due che puntano allo stesso posto, perché
 * due voci identiche in un lettore di schermo sono rumore.
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
				</section>

				{collezioni.map((c, i) => (
					<Fragment key={c.slug}>
						<section
							id={c.slug}
							className={`soglia c${i + 1}`}
							data-fondo={c.fondo}
							data-sez={c.slug}
						>
							{/* Il numero romano al posto di «Collezione uno»: dice la stessa
							    cosa — a che punto del percorso siamo — senza fingere di
							    essere un'informazione. */}
							<p className="numero" aria-hidden="true">
								{romano(i)}
							</p>

							{/* Nessun `aria-label`: il nome del legame se lo dànno la
							    descrizione della fotografia e il titolo che contiene. Una
							    etichetta esplicita sarebbe più breve, ma su un titolo che
							    va a capo non combacerebbe mai con il testo che si vede —
							    e chi comanda il browser a voce pronuncia quello. */}
							<Link className="soglia-a" href={percorsoStanza(lingua, c.slug)} data-glifo="↗">
								<ViewTransition name={`eroe-${c.slug}`} share="morph" default="none">
									<figure>
										<Immagine
											foto={c.soglia.foto}
											alt={c.soglia.alt[lingua]}
											fuoco={c.soglia.fuoco}
											subito={i === 0}
										/>
									</figure>
								</ViewTransition>

								<ViewTransition name={`titolo-${c.slug}`} share="titolo-morph" default="none">
									<h2 className="titolo">
										{righe(c.titolo[lingua]).map((riga, n, tutte) => (
											<span className="linea" key={riga.chiave}>
												{riga.nodi}
												{/* Uno spazio vero fra una riga e l'altra. Due blocchi
												    adiacenti senza spazio danno «Ciondoli eOrecchini»
												    come testo dell'elemento, e il nome accessibile del
												    legame non corrisponderebbe più a quello che si
												    legge. In fine di riga lo spazio non si vede: il CSS
												    lo lascia cadere. */}
												{n < tutte.length - 1 ? " " : null}
											</span>
										))}
									</h2>
								</ViewTransition>
							</Link>

							<p className="riga">{c.riga[lingua]}</p>
						</section>
						<div className="respiro" />
					</Fragment>
				))}
			</main>

			<Piede lingua={lingua} />

			<Scorrimento />
		</>
	);
}
