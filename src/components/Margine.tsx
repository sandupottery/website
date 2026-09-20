import Link from "next/link";
import type { Lingua } from "@/content/collezioni";
import { collezioni, dopo, voci } from "@/content/collezioni";
import { altraLingua, casa, percorsoStanza } from "@/lib/percorsi";
import { frase } from "@/lib/testo";

/**
 * Il margine. In home è una colonna a sinistra con l'indice delle stanze;
 * dentro una stanza è una barra in basso con il ritorno e la stanza dopo.
 *
 * È lo stesso disegno in due forme, e la forma cambia insieme alla rotta:
 * `view-transition-name: margine` (in globals.css) fa sì che il browser
 * animi da solo il passaggio da colonna a barra.
 *
 * I legami dell'indice restano àncore vere (`href="#foglie"`), così senza
 * JavaScript l'indice continua a portare alla soglia. Con JavaScript fanno
 * di più: `Scorrimento` li intercetta, scorre fino alla soglia e *poi* ci
 * entra — e sempre lui dice quale voce è quella corrente.
 *
 * Le frecce della coda stanno in uno `<span>` proprio invece di essere due
 * caratteri dentro il testo: i due legami hanno corpi diversi — «Torna» è un
 * maiuscoletto piccolo, il nome della stanza dopo è grande — e una freccia
 * che eredita il corpo del suo legame esce grande da una parte e piccola
 * dall'altra. Fuori dal testo la freccia ha una misura sola, e l'allineamento
 * alla linea di base fa il resto.
 */
export function Margine({ lingua, slug }: { lingua: Lingua; slug?: string }) {
	const dentro = slug !== undefined;
	const prossima = slug ? dopo(slug) : undefined;
	const altra = altraLingua(lingua);

	return (
		<nav id="margine" className={dentro ? "barra" : undefined} aria-label={voci.indice[lingua]}>
			<Link className="marchio" href={casa(lingua)} data-glifo="←">
				Sandu Pottery
			</Link>

			{!dentro && (
				<div className="indice">
					{collezioni.map((c) => (
						<a key={c.slug} href={`#${c.slug}`} data-sez={c.slug} data-glifo="↓">
							{c.breve[lingua]}
						</a>
					))}
				</div>
			)}

			{dentro && prossima && (
				<div className="coda">
					{/* Il ritorno punta alla soglia da cui si è entrati, non alla cima:
					    è quella la fotografia che deve ritrasformarsi nel titolo. E
					    `scroll={false}`, perché lo scorrimento se lo prende `Scorrimento`:
					    rimette la home alla quota esatta da cui si era partiti, che è più
					    precisa dell'àncora e — cosa che conta — arriva prima della
					    pittura. Lasciato a Next, il salto all'àncora arriverebbe dopo, e
					    si vedrebbe la pagina assestarsi a transizione finita. L'`href`
					    resta con l'àncora: senza JavaScript è l'unica cosa che riporta
					    alla soglia giusta. */}
					<Link className="torna" href={`${casa(lingua)}#${slug}`} scroll={false} data-glifo="←">
						<span className="freccia" aria-hidden="true">
							←
						</span>
						<span className="etichetta">{voci.torna[lingua]}</span>
					</Link>
					<Link className="avanti" href={percorsoStanza(lingua, prossima.slug)} data-glifo="→">
						<span className="etichetta">{frase(prossima.titolo[lingua].replace("\n", " "))}</span>
						<span className="freccia" aria-hidden="true">
							→
						</span>
					</Link>
				</div>
			)}

			<Link
				className="lingua"
				href={slug ? percorsoStanza(altra, slug) : casa(altra)}
				hrefLang={altra}
				data-glifo="↔"
			>
				{voci.altraLingua[lingua]}
			</Link>
		</nav>
	);
}
