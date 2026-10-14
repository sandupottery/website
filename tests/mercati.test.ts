import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import calendario from "@/content/calendario.json";
import { mercati } from "@/content/mercati";
import { ricorrenze } from "@/content/ricorrenze";
import {
	type DatiCalendario,
	eDataVera,
	nuovoId,
	occorrenze,
	type RicorrenzaDati,
	regolaEn,
	regolaIt,
	rrule,
	serializza,
	valida,
} from "@/lib/calendario";

/*
 * Il calendario lo scrive la cliente, quindi qui non si controlla *che cosa*
 * contiene — quante date, che giorno cade piazza Diaz — ma che sia ben fatto.
 * Un test sul contenuto fallirebbe al suo primo salvataggio legittimo e
 * bloccherebbe la pubblicazione proprio della data che ha appena aggiunto.
 */

describe("il calendario salvato", () => {
	test("è valido", () => {
		expect(valida(calendario)).toEqual([]);
	});

	test("è scritto nella forma canonica, così un salvataggio non riscrive il file", () => {
		const testo = readFileSync("src/content/calendario.json", "utf8");
		expect(serializza(calendario as DatiCalendario)).toBe(testo);
	});

	test("il sito lo legge in ordine e con la mappa", () => {
		const date = mercati.map((m) => m.inizio);
		expect([...date].sort()).toEqual(date);
		for (const m of mercati) {
			expect(m.mappa.startsWith("https://www.google.com/maps/search/?api=1&query=")).toBe(true);
		}
	});
});

describe("valida", () => {
	const buono = (): DatiCalendario => ({
		mercati: [
			{
				id: "2026-10-17-monza-italia",
				inizio: "2026-10-17",
				citta: "Monza",
				luogo: "corso Italia",
			},
		],
		ricorrenze: [],
	});

	test("accetta un calendario corretto", () => {
		expect(valida(buono())).toEqual([]);
	});

	test("rifiuta date che non esistono, fini prima degli inizi, campi vuoti", () => {
		const d = buono();
		d.mercati.push({ id: "a", inizio: "2026-02-30", citta: "", luogo: "x" });
		d.mercati.push({ id: "b", inizio: "2026-10-20", fine: "2026-10-19", citta: "x", luogo: " " });
		const dove = valida(d).map((p) => p.dove);
		expect(dove).toEqual([
			"mercati.1.inizio",
			"mercati.1.citta",
			"mercati.2.fine",
			"mercati.2.luogo",
		]);
	});

	test("rifiuta id ripetuti e id che non sono nomi di file", () => {
		const d = buono();
		d.mercati.push({
			...d.mercati[0],
			id: "2026-10-17-monza-italia",
		} as DatiCalendario["mercati"][number]);
		d.mercati.push({ id: "../etc", inizio: "2026-10-17", citta: "x", luogo: "y" });
		expect(valida(d).map((p) => p.messaggio)).toEqual(["Id ripetuto.", "Id non valido."]);
	});

	test("rifiuta una forma qualunque", () => {
		expect(valida(null)).toHaveLength(1);
		expect(valida({ mercati: "no" })).toHaveLength(1);
	});
});

describe("le ricorrenze", () => {
	const r = (
		settimana: number,
		giorno: RicorrenzaDati["giorno"],
		mesi: number[],
	): RicorrenzaDati => ({
		id: "x",
		luogo: "x",
		citta: "x",
		indirizzo: "x",
		settimana,
		giorno,
		mesi,
	});
	const tutti = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

	test("le tre di oggi escono con le frasi e le regole scritte a mano finora", () => {
		expect(ricorrenze.map((x) => [x.regolaIt, x.regolaEn, x.regola, x.inizio])).toEqual([
			[
				"la 2ª domenica — da marzo a giugno, e da ottobre a dicembre",
				"2nd Sunday — March to June, and October to December",
				"FREQ=MONTHLY;BYDAY=SU;BYSETPOS=2;BYMONTH=3,4,5,6,10,11,12",
				"2026-03-08",
			],
			[
				"la 4ª domenica — da aprile a giugno, e da settembre a dicembre",
				"4th Sunday — April to June, and September to December",
				"FREQ=MONTHLY;BYDAY=SU;BYSETPOS=4;BYMONTH=4,5,6,9,10,11,12",
				"2026-04-26",
			],
			[
				"il 4° giovedì di ogni mese",
				"4th Thursday of every month",
				"FREQ=MONTHLY;BYDAY=TH;BYSETPOS=4",
				"2026-01-22",
			],
		]);
	});

	test("l'ultima, un mese solo, e i mesi a cavallo d'anno", () => {
		expect(regolaIt(r(-1, "SA", tutti))).toBe("l'ultimo sabato di ogni mese");
		expect(regolaIt(r(-1, "SU", [5]))).toBe("l'ultima domenica — a maggio");
		expect(regolaIt(r(1, "SU", [11, 12, 1, 2]))).toBe("la 1ª domenica — da novembre a febbraio");
		expect(regolaEn(r(3, "WE", [1, 2, 6, 12]))).toBe(
			"3rd Wednesday — June, and December to February",
		);
		expect(rrule(r(-1, "SU", [5]))).toBe("FREQ=MONTHLY;BYDAY=SU;BYSETPOS=-1;BYMONTH=5");
	});

	test("le prossime date cadono sulla regola", () => {
		expect(occorrenze(r(2, "SU", [3, 10]), "2026-03-09", 3)).toEqual([
			"2026-10-11",
			"2027-03-14",
			"2027-10-10",
		]);
		expect(occorrenze(r(-1, "FR", tutti), "2026-10-01", 2)).toEqual(["2026-10-30", "2026-11-27"]);
	});
});

describe("gli id nuovi", () => {
	test("hanno la forma di quelli scritti a mano, e non si ripetono", () => {
		const m = { inizio: "2026-11-15", citta: "Monza", luogo: "corso Italia" };
		expect(nuovoId(m, [])).toBe("2026-11-15-monza-italia");
		expect(nuovoId(m, ["2026-11-15-monza-italia"])).toBe("2026-11-15-monza-italia-2");
		expect(nuovoId({ inizio: "2026-11-21", citta: "Milano", luogo: "via Marconi" }, [])).toBe(
			"2026-11-21-milano-marconi",
		);
	});

	test("una data deve esistere davvero", () => {
		expect(eDataVera("2028-02-29")).toBe(true);
		expect(eDataVera("2026-02-29")).toBe(false);
	});
});
