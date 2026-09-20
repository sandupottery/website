import type { Collezione, Lingua } from "@/content/collezioni";
import { collezioni } from "@/content/collezioni";
import { mercati } from "@/content/mercati";
import { sito } from "@/content/sito";
import { costruisciAttivita, costruisciEventi } from "@/lib/jsonld";
import { casa, percorsoStanza } from "@/lib/percorsi";

const senzaSegni = (t: string) => t.replace(/\*/g, "").replace("\n", " ");

/** Gli `<` vengono neutralizzati: uno non sfuggito chiuderebbe il tag script. */
const serializza = (grafo: object) => JSON.stringify(grafo).replace(/</g, "\\u003c");

/**
 * I dati strutturati.
 *
 * Tre cose, e nessuna di queste è ornamento per i motori di ricerca: il
 * mestiere e la persona (`Person` dentro `LocalBusiness`, perché qui l'attività
 * *è* una persona), l'elenco delle stanze come sommario del sito, e — solo
 * nella stanza delle date — gli `Event` dei mercatini, che sono l'unica cosa
 * del sito con un dove e un quando.
 *
 * Il grafo è costruito dallo stesso contenuto che si vede in pagina: se un
 * mercato cambia data, cambia in tutte e tre le uscite (pagina, `.ics`, JSON-LD)
 * perché ce n'è una copia sola.
 */
export function Dati({ lingua, stanza }: { lingua: Lingua; stanza?: Collezione }) {
	const locale = lingua;
	const conMercati = stanza?.blocchi.some((b) => b.tipo === "mercati") ?? false;

	const attivita = {
		...costruisciAttivita(locale),
		founder: {
			"@type": "Person",
			name: "Stefania Casto",
			jobTitle: locale === "it" ? "Ceramista" : "Ceramicist",
		},
	};

	const sommario = {
		"@type": "ItemList",
		name: sito.nome,
		itemListElement: collezioni.map((c, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: senzaSegni(c.titolo[locale]),
			url: `${sito.url}${percorsoStanza(locale, c.slug)}`,
		})),
	};

	const briciole = stanza
		? {
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: sito.nome,
						item: `${sito.url}${casa(locale)}`,
					},
					{
						"@type": "ListItem",
						position: 2,
						name: senzaSegni(stanza.titolo[locale]),
						item: `${sito.url}${percorsoStanza(locale, stanza.slug)}`,
					},
				],
			}
		: undefined;

	const grafo = {
		"@context": "https://schema.org",
		"@graph": [
			attivita,
			...(stanza ? [] : [sommario]),
			...(briciole ? [briciole] : []),
			...(conMercati ? costruisciEventi(mercati, locale) : []),
		],
	};

	return (
		<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializza(grafo) }} />
	);
}
