import type { MetadataRoute } from "next";
import { voci } from "@/content/collezioni";
import { sito } from "@/content/sito";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: sito.nome,
		short_name: sito.nome,
		description: voci.descrizione.it,
		start_url: "/",
		display: "browser",
		background_color: "#F5F2EB",
		theme_color: "#F5F2EB",
		lang: "it",
		icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
	};
}
