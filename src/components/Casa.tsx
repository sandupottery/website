import Link from "next/link";
import { Fragment, ViewTransition } from "react";
import type { Lingua } from "@/content/collezioni";
import { apertura, collezioni } from "@/content/collezioni";
import { percorsoStanza } from "@/lib/percorsi";
import { frase } from "@/lib/testo";
import { Margine } from "./Margine";
import { Scorrimento } from "./Scorrimento";

/** Il fondo di partenza: la carta. Lo stesso valore di `--color-sp-carta`. */
const CARTA = "#F5F2EB";

/**
 * La home: un percorso di fotografie e cinque soglie.
 *
 * Poche parole in tutto. Il discorso lungo sta nelle stanze; qui ogni
 * collezione ha una fotografia, il suo nome che le attraversa sopra e una
 * riga sola. Le cinque impaginazioni (`c1`…`c5`) sono diverse di proposito:
 * un'alternanza destra/sinistra si legge come una griglia, e la pagina
 * tornerebbe immobile.
 *
 * Ogni soglia è anche la metà di casa di una transizione: la fotografia e il
 * titolo hanno lo stesso `name` degli omologhi nella stanza, quindi il
 * browser li fa crescere l'uno nell'altro invece di scambiarli.
 */
export function Casa({ lingua }: { lingua: Lingua }) {
	return (
		<>
			<Margine lingua={lingua} />

			<main>
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
							<p className="occhiello">{c.etichetta[lingua]}</p>

							<ViewTransition name={`eroe-${c.slug}`} share="morph" default="none">
								<figure>
									{/* next/image è disattivato (`images.unoptimized`): con un
									    export statico non ottimizza nulla e aggiungerebbe solo
									    un wrapper. Le altezze le fissa il CSS, quindi non c'è
									    salto di impaginazione. */}
									<img
										src={c.soglia.foto}
										alt={c.soglia.alt[lingua]}
										loading={i === 0 ? "eager" : "lazy"}
										decoding="async"
									/>
								</figure>
							</ViewTransition>

							<ViewTransition name={`titolo-${c.slug}`} share="titolo-morph" default="none">
								<Link className="titolo" href={percorsoStanza(lingua, c.slug)} data-glifo="↗">
									{frase(c.titolo[lingua])}
								</Link>
							</ViewTransition>

							<p className="riga">{c.riga[lingua]}</p>
						</section>
						<div className="respiro" />
					</Fragment>
				))}
			</main>

			<Scorrimento />
		</>
	);
}
