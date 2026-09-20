import { ViewTransition } from "react";
import type { Blocco, Collezione, Lingua } from "@/content/collezioni";
import { collezioni, prezzo, romano, voci } from "@/content/collezioni";
import { frase } from "@/lib/testo";
import { Cima } from "./Cima";
import { Dati } from "./Dati";
import { Contatti, Mercati } from "./Dove";
import { Immagine } from "./Immagine";
import { Margine } from "./Margine";
import { ScriptFreschezza } from "./ScriptFreschezza";

function Pezzi({ pezzi, lingua }: { pezzi: readonly Pezzo[]; lingua: Lingua }) {
	return (
		<div className={`gruppo ${pezzi.length === 2 ? "due" : "uno"}`}>
			<div className="scatti">
				{pezzi.map((p) => (
					<div className="pz" key={p.foto + p.nome.it}>
						<figure>
							<Immagine
								foto={p.foto}
								alt={p.nome[lingua]}
								fuoco={p.fuoco}
								sizes="(max-width: 880px) 100vw, 44vw"
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
							<span className="dato">{prezzo}</span>
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

type Pezzo = Extract<Blocco, { tipo: "pezzi" }>["pezzi"][number];

/** Un blocco per volta. Il tipo discrimina, così aggiungerne uno è un caso in più. */
function Corpo({ blocco, lingua }: { blocco: Blocco; lingua: Lingua }) {
	switch (blocco.tipo) {
		case "prosa":
			return (
				<div className="blocco">
					<p className="occhiello">{blocco.etichetta[lingua]}</p>
					<div>
						{blocco.paragrafi.map((p) => (
							<p key={p.it.slice(0, 40)}>{frase(p[lingua])}</p>
						))}
					</div>
				</div>
			);
		case "pezzi":
			return <Pezzi pezzi={blocco.pezzi} lingua={lingua} />;
		case "mercati":
			return <Mercati locale={lingua} />;
		case "contatti":
			return <Contatti locale={lingua} />;
	}
}

const chiaveBlocco = (b: Blocco, i: number): string =>
	b.tipo === "prosa" ? b.etichetta.it : b.tipo === "pezzi" ? b.pezzi[0].foto : `${b.tipo}${i}`;

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
	const indice = collezioni.findIndex((x) => x.slug === c.slug);
	const conDate = c.blocchi.some((b) => b.tipo === "mercati");

	return (
		<>
			<Cima />
			<style>{`:root{--ground:${c.fondo}}`}</style>

			<a className="salta" href="#contenuto">
				{voci.saltaAlContenuto[lingua]}
			</a>

			<Margine lingua={lingua} slug={c.slug} />

			<Dati lingua={lingua} stanza={c} />

			<main className="in-stanza" id="contenuto">
				<div className="st-testa">
					<p className="numero" aria-hidden="true">
						{romano(indice)}
					</p>
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
						<Immagine
							foto={c.eroe.foto}
							alt={c.eroe.alt[lingua]}
							fuoco={c.eroe.fuoco}
							subito
							sizes="(max-width: 880px) 100vw, 92vw"
						/>
					</figure>
				</ViewTransition>

				{c.blocchi.map((b, i) => (
					<Corpo blocco={b} key={chiaveBlocco(b, i)} lingua={lingua} />
				))}

				{/* Subito dopo il markup che tocca, non nel layout: deve girare
				    quando le righe delle date esistono già. */}
				{conDate && <ScriptFreschezza />}

				{c.incontri ? (
					<div className="incontri">
						<p className="occhiello">{voci.incontri[lingua]}</p>
						<div>
							{c.incontri.map((i) => (
								<blockquote key={i.testo.it.slice(0, 40)}>
									{frase(i.testo[lingua])}
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
