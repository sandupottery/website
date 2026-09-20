import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import type { Lingua } from "@/content/collezioni";
import { sito } from "@/content/sito";
import { boska } from "@/lib/fonts";
import { Cursore } from "./Cursore";
import { Transizione } from "./Transizione";

export const metadataRadice: Metadata = {
	title: sito.nome,
	metadataBase: new URL(sito.url),
	robots: { index: true, follow: true },
	/**
	 * L'anteprima predefinita per chi condivide un legame. Una fotografia
	 * ritagliata a 1200×630 e non una delle immagini del sito: quelle sono quasi
	 * tutte verticali, e un verticale dentro una scheda orizzontale viene
	 * tagliato dai social a metà soggetto.
	 */
	openGraph: {
		type: "website",
		siteName: sito.nome,
		images: [{ url: "/og.jpg", width: 1200, height: 630 }],
	},
	twitter: { card: "summary_large_image" },
};

export const viewportRadice: Viewport = {
	themeColor: "#F5F2EB",
	colorScheme: "light",
};

/**
 * Il guscio della pagina, condiviso dai due tronchi di rotte.
 *
 * Esistono **due** layout radice — `(it)` e `(en)` — perché `<html lang>` si
 * scrive una volta sola per documento e la radice dell'App Router non conosce
 * la rotta. Prima l'inglese era un `<div lang="en">` dentro un documento
 * dichiarato italiano: il contenuto veniva letto nella lingua giusta, ma il
 * `<title>` no, e il documento mentiva sulla propria lingua a chiunque non
 * guardasse dentro. Con i gruppi di rotte di Next ogni lingua ha il suo
 * documento, e qui resta una sola copia di tutto il resto.
 */
export function Radice({ lingua, children }: { lingua: Lingua; children: React.ReactNode }) {
	return (
		<html lang={lingua} className={boska.variable}>
			<body>
				{children}
				<Cursore />
				<Transizione />
			</body>
		</html>
	);
}
