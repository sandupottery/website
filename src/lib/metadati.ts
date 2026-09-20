import type { Metadata } from "next";
import type { Collezione, Lingua } from "@/content/collezioni";
import { collezioni } from "@/content/collezioni";
import { sito } from "@/content/sito";
import { altraLingua, percorsoStanza } from "@/lib/percorsi";

/** I parametri statici delle stanze: gli stessi slug nelle due lingue. */
export const parametriStanze = () => collezioni.map((c) => ({ collezione: c.slug }));

const senzaSegni = (t: string) => t.replace(/\*/g, "").replace("\n", " ");

export function metadatiStanza(c: Collezione, lingua: Lingua): Metadata {
	const titolo = `${senzaSegni(c.titolo[lingua])} — ${sito.nome}`;
	const qui = `${sito.url}${percorsoStanza(lingua, c.slug)}`;
	const la = `${sito.url}${percorsoStanza(altraLingua(lingua), c.slug)}`;

	return {
		title: titolo,
		description: c.guida[lingua],
		alternates: {
			canonical: qui,
			languages: lingua === "it" ? { it: qui, en: la } : { it: la, en: qui },
		},
		openGraph: {
			type: "article",
			siteName: sito.nome,
			title: titolo,
			description: c.guida[lingua],
			url: qui,
			locale: lingua === "it" ? "it_IT" : "en_GB",
			images: [{ url: c.eroe.foto, alt: c.eroe.alt[lingua] }],
		},
	};
}
