import type { Metadata } from "next";
import { Casa } from "@/components/Casa";
import { voci } from "@/content/collezioni";
import { sito } from "@/content/sito";

export const metadata: Metadata = {
	title: `${sito.nome} — handmade ceramics from Bergamo`,
	description: voci.descrizione.en,
	alternates: {
		canonical: `${sito.url}/en`,
		languages: { it: sito.url, en: `${sito.url}/en` },
	},
	openGraph: {
		type: "website",
		siteName: sito.nome,
		title: sito.nome,
		description: voci.descrizione.en,
		url: `${sito.url}/en`,
		locale: "en_GB",
		alternateLocale: ["it_IT"],
	},
};

export default function HomeEn() {
	return <Casa lingua="en" />;
}
