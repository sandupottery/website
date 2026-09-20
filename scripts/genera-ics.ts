import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { mercati } from "@/content/mercati";
import { ricorrenze } from "@/content/ricorrenze";
import { sito } from "@/content/sito";
import { creaICS, type EventoICS } from "@/lib/ics";

const USCITA = join(process.cwd(), "out", "calendario");

/**
 * DTSTAMP fisso rispetto all'ultima data del calendario, non a "adesso":
 * così due build sullo stesso contenuto producono file identici.
 */
const DTSTAMP = "20260826T120000Z";

/**
 * Il luogo scritto perché una mappa lo trovi, non perché si legga bene: via o
 * piazza, città, paese. Il nome della manifestazione («L'isola che c'è») sta
 * nel SUMMARY, dove serve a riconoscere l'evento; dentro LOCATION farebbe
 * fallire la geocodifica, e l'evento arriverebbe sul telefono senza mappa.
 */
function aEvento(m: (typeof mercati)[number]): EventoICS {
	const dove = m.dettaglio ? `${m.luogo} (${m.dettaglio})` : m.luogo;
	return {
		uid: m.id,
		inizio: m.inizio,
		fine: m.fine,
		titolo: `${sito.nome} — ${m.citta}, ${dove}`,
		luogo: `${m.luogo}, ${m.citta}, Italia`,
		url: sito.url,
	};
}

function daRicorrenza(r: (typeof ricorrenze)[number]): EventoICS {
	return {
		uid: r.id,
		inizio: r.inizio,
		titolo: `${sito.nome} — ${r.luogo}`,
		luogo: `${r.indirizzo}, Italia`,
		url: sito.url,
		regola: r.regola,
	};
}

async function main(): Promise<void> {
	const { existsSync } = await import("node:fs");
	if (!existsSync(join(process.cwd(), "out"))) {
		throw new Error("out/ non esiste: esegui prima `next build`.");
	}

	await mkdir(USCITA, { recursive: true });

	const eventi = mercati.map(aEvento);
	const fissi = ricorrenze.map(daRicorrenza);

	// Il calendario completo porta anche gli appuntamenti fissi: chi lo
	// sottoscrive vuole sapere dov'è Stefania, non distinguere fra una data
	// scritta a mano e una regola.
	await writeFile(
		join(USCITA, "mercatini.ics"),
		creaICS([...fissi, ...eventi], `${sito.nome} — mercatini`, DTSTAMP),
		"utf8",
	);

	await Promise.all(
		[...eventi, ...fissi].map((e) =>
			writeFile(join(USCITA, `${e.uid}.ics`), creaICS([e], e.titolo, DTSTAMP), "utf8"),
		),
	);

	console.log(
		`calendario: ${eventi.length + fissi.length + 1} file .ics scritti in out/calendario`,
	);
}

await main();
