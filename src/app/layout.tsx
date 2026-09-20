import type { Metadata, Viewport } from "next";
import { Cursore } from "@/components/Cursore";
import { Transizione } from "@/components/Transizione";
import { sito } from "@/content/sito";
import { boska } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
	title: sito.nome,
	metadataBase: new URL(sito.url),
	robots: { index: true, follow: true },
};

export const viewport: Viewport = {
	themeColor: "#F5F2EB",
	colorScheme: "light",
};

/**
 * `lang="it"` qui e `lang="en"` sul sottoalbero inglese (src/app/en/layout.tsx):
 * la radice dell'App Router è una sola e non conosce la rotta, quindi la
 * lingua della pagina inglese si dichiara un livello più sotto. È la stessa
 * convenzione già usata dal sito temporaneo.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="it" className={boska.variable}>
			<body>
				{children}
				<Cursore />
				<Transizione />
			</body>
		</html>
	);
}
