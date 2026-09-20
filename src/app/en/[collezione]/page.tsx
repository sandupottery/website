import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Stanza } from "@/components/Stanza";
import { perSlug } from "@/content/collezioni";
import { metadatiStanza, parametriStanze } from "@/lib/metadati";

type Parametri = { params: Promise<{ collezione: string }> };

/**
 * Le cinque stanze inglesi. `dynamicParams = false` perché l'export statico
 * non ha un server che possa generare uno slug non previsto: meglio un 404
 * in fase di build che una rotta muta in produzione.
 */
export const dynamicParams = false;
export const generateStaticParams = parametriStanze;

export async function generateMetadata({ params }: Parametri): Promise<Metadata> {
	const { collezione } = await params;
	const c = perSlug(collezione);
	return c ? metadatiStanza(c, "en") : {};
}

export default async function PaginaStanza({ params }: Parametri) {
	const { collezione } = await params;
	const c = perSlug(collezione);
	if (!c) notFound();
	/* `key`: passando da una stanza all'altra la rotta è la stessa
	   (`[collezione]`), quindi React riuserebbe gli stessi elementi e
	   tratterebbe il cambio come un aggiornamento — niente transizione e
	   niente ritorno in cima. La chiave lo rende un vero smontaggio. */
	return <Stanza key={c.slug} collezione={c} lingua="en" />;
}
