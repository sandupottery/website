import type { Metadata } from "next";
import { Casa } from "@/components/Casa";
import { voci } from "@/content/collezioni";
import { sito } from "@/content/sito";

export const metadata: Metadata = {
	title: `${sito.nome} — ceramica fatta a mano a Bergamo`,
	description: voci.descrizione.it,
	alternates: {
		canonical: sito.url,
		languages: { it: sito.url, en: `${sito.url}/en` },
	},
	openGraph: {
		type: "website",
		siteName: sito.nome,
		title: sito.nome,
		description: voci.descrizione.it,
		url: sito.url,
		locale: "it_IT",
		alternateLocale: ["en_GB"],
	},
};

export default function Home() {
	return <Casa lingua="it" />;
}
