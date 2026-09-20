import { describe, expect, test } from "bun:test";
import type { ReactElement } from "react";
import { frase } from "@/lib/testo";

const tipi = (nodi: ReturnType<typeof frase>) =>
	nodi.map((n) => (typeof n === "string" ? n : (n as ReactElement).type));

describe("frase", () => {
	test("lascia intatto un testo senza segni", () => {
		expect(frase("una tazza")).toEqual(["una tazza"]);
	});

	test("riconosce il corsivo e il rilievo, e non li confonde", () => {
		expect(tipi(frase("con *ironia* e **leggerezza**"))).toEqual(["con ", "em", " e ", "b", ""]);
	});

	test("il rilievo vince sul corsivo: ** non diventa due corsivi vuoti", () => {
		const nodi = frase("**tutte diverse**");
		expect(tipi(nodi)).toEqual(["", "b", ""]);
		expect((nodi[1] as ReactElement<{ children: string }>).props.children).toBe("tutte diverse");
	});

	test("\\n diventa un a capo, non uno spazio", () => {
		expect(tipi(frase("Ciondoli e\n*Orecchini*"))).toEqual(["Ciondoli e", "br", "", "em", ""]);
	});
});
