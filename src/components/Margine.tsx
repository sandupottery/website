import Link from "next/link";
import type { Lingua } from "@/content/collezioni";
import { collezioni, dopo, voci } from "@/content/collezioni";
import { altraLingua, casa, percorsoStanza } from "@/lib/percorsi";
import { frase } from "@/lib/testo";

/** Il titolo senza la marcatura: serve dove va una riga sola e piatta. */
const piatto = (t: string) => t.replace(/\*/g, "").replace("\n", " ");

/**
 * Il margine. In home è una colonna a sinistra con l'indice delle stanze;
 * dentro una stanza è una barra in basso con il ritorno e la stanza dopo.
 *
 * È lo stesso disegno in due forme, e la forma cambia insieme alla rotta:
 * `view-transition-name: margine` (in globals.css) fa sì che il browser
 * animi da solo il passaggio da colonna a barra.
 *
 * I legami dell'indice sono àncore vere (`href="#foglie"`): lo scorrimento
 * dolce lo fa il CSS, non il JavaScript. L'unica cosa che resta al client è
 * dire quale voce è quella corrente, e lo fa `Scorrimento`.
 */
export function Margine({ lingua, slug }: { lingua: Lingua; slug?: string }) {
	const dentro = slug !== undefined;
	const prossima = slug ? dopo(slug) : undefined;
	const altra = altraLingua(lingua);

	return (
		<nav id="margine" className={dentro ? "barra" : undefined}>
			<Link className="marchio" href={casa(lingua)} data-glifo="←">
				Sandu Pottery
			</Link>

			{!dentro && (
				<div className="indice">
					{collezioni.map((c) => (
						<a key={c.slug} href={`#${c.slug}`} data-sez={c.slug} data-glifo="↓">
							{piatto(c.titolo[lingua])}
						</a>
					))}
				</div>
			)}

			{dentro && prossima && (
				<div className="coda">
					{/* Il ritorno punta alla soglia da cui si è entrati, non alla cima:
					    è quella la fotografia che deve ritrasformarsi nel titolo. */}
					<Link className="torna" href={`${casa(lingua)}#${slug}`} data-glifo="←">
						← {voci.torna[lingua]}
					</Link>
					<Link className="avanti" href={percorsoStanza(lingua, prossima.slug)} data-glifo="→">
						{frase(prossima.titolo[lingua].replace("\n", " "))} →
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
