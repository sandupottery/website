import { ViewTransition } from "react";
import type { Blocco, Collezione, Lingua } from "@/content/collezioni";
import { prezzo, voci } from "@/content/collezioni";
import { frase } from "@/lib/testo";
import { Cima } from "./Cima";
import { Margine } from "./Margine";

function Pezzi({ blocco, lingua }: { blocco: Blocco; lingua: Lingua }) {
	if (blocco.tipo !== "pezzi") return null;
	return (
		<div className={`gruppo ${blocco.pezzi.length === 2 ? "due" : "uno"}`}>
			<div className="scatti">
				{blocco.pezzi.map((p) => (
					<div className="pz" key={p.foto + p.nome.it}>
						<figure>
							<img
								src={p.foto}
								alt={p.nome[lingua]}
								style={{ objectPosition: p.fuoco }}
								loading="lazy"
								decoding="async"
							/>
						</figure>
						{/* La didascalia da catalogo: nome, filetto, prezzo. Una riga
						    sola, perché è così che si legge un catalogo d'arte. */}
						<p className="voce">
							<span className="nome">
								{p.nome[lingua]}
								<i>{p.anno}</i>
							</span>
							<span className="tratto" aria-hidden="true" />
							<span className="prezzo">{prezzo}</span>
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

/**
 * Una stanza: la prosa lunga della collezione, i pezzi con il loro prezzo e,
 * dove ci sono, gli incontri — scene osservate al banco, non didascalie.
 *
 * Il fondo è servito già colorato da un <style> in pagina, non da JavaScript:
 * chi arriva qui da un legame esterno deve vedere il colore giusto alla prima
 * pittura. In home invece il colore è mobile e lo scrive `Scorrimento`, che
 * alla smontatura toglie la propria dichiarazione in linea per non coprire
 * questa. È l'unico punto in cui le due cose si incontrano.
 */
export function Stanza({ collezione, lingua }: { collezione: Collezione; lingua: Lingua }) {
	const c = collezione;
	return (
		<>
			<Cima />
			<style>{`:root{--ground:${c.fondo}}`}</style>

			<Margine lingua={lingua} slug={c.slug} />

			<main className="in-stanza">
				<div className="st-testa">
					<p className="occhiello">{c.etichetta[lingua]}</p>
					<div className="riga2">
						<ViewTransition
							name={`titolo-${c.slug}`}
							share="titolo-morph"
							enter="pagina"
							exit="pagina"
							update="pagina"
							default="none"
						>
							<h1>{frase(c.titolo[lingua].replace("\n", " "))}</h1>
						</ViewTransition>
						<p className="guida">{c.guida[lingua]}</p>
					</div>
				</div>

				<ViewTransition
					name={`eroe-${c.slug}`}
					share="morph"
					enter="pagina"
					exit="pagina"
					update="pagina"
					default="none"
				>
					<figure className="st-eroe">
						<img
							src={c.eroe.foto}
							alt={c.eroe.alt[lingua]}
							style={{ objectPosition: c.eroe.fuoco }}
							decoding="async"
						/>
					</figure>
				</ViewTransition>

				{c.blocchi.map((b) =>
					b.tipo === "prosa" ? (
						<div className="blocco" key={b.etichetta.it}>
							<p className="occhiello">{b.etichetta[lingua]}</p>
							<div>
								{b.paragrafi.map((p) => (
									<p key={p.it.slice(0, 40)}>{frase(p[lingua])}</p>
								))}
							</div>
						</div>
					) : (
						<Pezzi blocco={b} key={b.pezzi[0].foto} lingua={lingua} />
					),
				)}

				{c.incontri ? (
					<div className="incontri">
						<p className="occhiello">{voci.incontri[lingua]}</p>
						<div>
							{c.incontri.map((i) => (
								<blockquote key={i.testo.it.slice(0, 40)}>
									{i.testo[lingua]}
									<footer>{i.chi[lingua]}</footer>
								</blockquote>
							))}
						</div>
					</div>
				) : (
					<div className="coda-stanza" />
				)}
			</main>
		</>
	);
}
