import type { MetadataRoute } from "next";
import { collezioni } from "@/content/collezioni";
import { sito } from "@/content/sito";
import { percorsoStanza } from "@/lib/percorsi";

export const dynamic = "force-static";

const coppia = (it: string, en: string) => ({
	languages: { it: `${sito.url}${it}`, en: `${sito.url}${en}` },
});

export default function sitemap(): MetadataRoute.Sitemap {
	const case_ = [
		{ it: "/", en: "/en", priorita: 1 },
		...collezioni.map((c) => ({
			it: percorsoStanza("it", c.slug),
			en: percorsoStanza("en", c.slug),
			priorita: 0.8,
		})),
	];

	return case_.flatMap(({ it, en, priorita }) => [
		{
			url: `${sito.url}${it}`,
			changeFrequency: "monthly" as const,
			priority: priorita,
			alternates: coppia(it, en),
		},
		{
			url: `${sito.url}${en}`,
			changeFrequency: "monthly" as const,
			priority: priorita * 0.9,
			alternates: coppia(it, en),
		},
	]);
}
