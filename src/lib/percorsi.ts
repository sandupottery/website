import type { Lingua } from "@/content/collezioni";

/**
 * Le rotte del sito, in un posto solo.
 *
 * Italiano alla radice, inglese sotto `/en` — la stessa convenzione del sito
 * temporaneo. Gli slug NON sono tradotti: `/tettazze` e `/en/tettazze` sono
 * la stessa stanza in due lingue, e il cambio lingua resta un solo legame
 * calcolabile senza tabelle di corrispondenza.
 */
export const casa = (lingua: Lingua): string => (lingua === "it" ? "/" : "/en");

export const percorsoStanza = (lingua: Lingua, slug: string): string =>
	lingua === "it" ? `/${slug}` : `/en/${slug}`;

export const altraLingua = (lingua: Lingua): Lingua => (lingua === "it" ? "en" : "it");
