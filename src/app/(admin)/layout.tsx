import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import "./admin.css";
import { segno, serif } from "@/lib/fonts";

/**
 * Il terzo layout radice, per la sola pagina `/admin`. Non usa `Radice`: lì
 * ci sono il cursore personalizzato e le transizioni fra le stanze, che in un
 * modulo sono d'intralcio. Restano i caratteri e i colori, perché è sempre il
 * suo sito.
 */
export const metadata: Metadata = {
	title: "Il calendario · Sandu Pottery",
	robots: { index: false, follow: false },
};

export const viewport: Viewport = {
	themeColor: "#F5F2EB",
	colorScheme: "light",
	// Il modulo non deve ingrandirsi da solo quando si tocca un campo: i campi
	// sono già a 16px o più, che è la soglia sotto la quale iOS ingrandisce.
	width: "device-width",
	initialScale: 1,
};

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
	return (
		<html lang="it" className={`${serif.variable} ${segno.variable}`}>
			<body className="ad">{children}</body>
		</html>
	);
}
