import { describe, expect, test } from "bun:test";
import type { DatiCalendario } from "@/lib/calendario";
import { applica, modifica } from "@/server/calendario-remoto";

const base = (): DatiCalendario => ({
	mercati: [
		{ id: "2026-10-17-monza-italia", inizio: "2026-10-17", citta: "Monza", luogo: "corso Italia" },
		{ id: "2026-09-01-milano-diaz", inizio: "2026-09-01", citta: "Milano", luogo: "piazza Diaz" },
	],
	ricorrenze: [],
});

describe("le modifiche dalla pagina /admin", () => {
	test("una data nuova riceve un id suo, e il commit dice che cosa è cambiato", () => {
		const { dati, messaggio } = applica(base(), {
			tipo: "mercato",
			voce: { id: "", inizio: "2026-11-15", citta: "Monza", luogo: "corso Italia" },
		});
		expect(dati.mercati.at(-1)?.id).toBe("2026-11-15-monza-italia");
		expect(messaggio).toBe("aggiunge 2026-11-15 Monza, corso Italia");
	});

	test("una data esistente si cambia senza cambiare id: il .ics resta lo stesso evento", () => {
		const { dati } = applica(base(), {
			tipo: "mercato",
			voce: {
				id: "2026-10-17-monza-italia",
				inizio: "2026-10-18",
				citta: "Monza",
				luogo: "corso Italia",
			},
		});
		expect(dati.mercati[0]).toMatchObject({ id: "2026-10-17-monza-italia", inizio: "2026-10-18" });
		expect(dati.mercati).toHaveLength(2);
	});

	test("togliere una data che non c'è più dice perché", () => {
		expect(() => applica(base(), { tipo: "elimina-mercato", id: "nessuna" })).toThrow(
			"non c'è più",
		);
	});

	test("le date passate si tolgono tutte insieme, comprese quelle che finiscono ieri", () => {
		const { dati, messaggio } = applica(base(), { tipo: "pulisci-passate", oggi: "2026-10-01" });
		expect(dati.mercati.map((m) => m.id)).toEqual(["2026-10-17-monza-italia"]);
		expect(messaggio).toBe("toglie 1 date passate");
	});

	test("un mercato fisso nuovo prende l'id dal nome", () => {
		const { dati } = applica(base(), {
			tipo: "ricorrenza",
			voce: {
				id: "",
				luogo: "Monza centro",
				citta: "Monza",
				indirizzo: "x",
				settimana: 1,
				giorno: "SA",
				mesi: [5],
			},
		});
		expect(dati.ricorrenze[0]?.id).toBe("monza-centro");
	});

	test("in locale salva in memoria e rifiuta i dati sbagliati prima di scriverli", async () => {
		const env = { SVILUPPO: "1" };
		const r = await modifica(env, {
			tipo: "mercato",
			voce: { id: "", inizio: "2026-12-05", citta: "Lecco", luogo: "piazza Cermenati" },
		});
		expect(r.dati.mercati.some((m) => m.id === "2026-12-05-lecco-cermenati")).toBe(true);
		await expect(
			modifica(env, {
				tipo: "mercato",
				voce: { id: "", inizio: "2026-02-30", citta: "", luogo: "x" },
			}),
		).rejects.toThrow("Manca il giorno.");
	});
});
