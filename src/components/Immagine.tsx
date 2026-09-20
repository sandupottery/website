/**
 * Ogni fotografia del sito passa da qui.
 *
 * `next/image` è disattivato (`images.unoptimized`): con un export statico non
 * ottimizza nulla e aggiungerebbe soltanto un involucro. L'ottimizzazione la
 * facciamo prima, una volta sola: accanto a ogni `.jpg` in `public/opere/`
 * stanno due AVIF — lato lungo 1600 e 800 — generati con ffmpeg. Il `.jpg`
 * resta come ripiego per i pochi browser senza AVIF, ed è anche il file che
 * leggono gli scrapers dei social.
 *
 * Il risparmio non è marginale: le stesse ventisette fotografie pesano 3,6 MB
 * in JPEG e 2,6 MB in AVIF **a due misure**, e un telefono scarica la misura
 * piccola — circa un quinto del JPEG corrispondente.
 *
 * Le altezze le fissa il CSS, quindi non serve `width`/`height` sull'elemento:
 * la scatola è già nota prima che l'immagine arrivi e l'impaginazione non salta.
 */
type Props = {
	foto: string;
	alt: string;
	/** `object-position`, quando il ritaglio centrale taglia via il soggetto. */
	fuoco?: string;
	/** La sola immagine sopra la piega: niente `lazy`, priorità alta. */
	subito?: boolean;
	/** Quanto sarà larga in pagina, per far scegliere al browser la misura. */
	sizes?: string;
};

const PREDEFINITO = "(max-width: 880px) 100vw, 80vw";

export function Immagine({ foto, alt, fuoco, subito, sizes = PREDEFINITO }: Props) {
	const base = foto.replace(/\.jpg$/, "");

	return (
		<picture>
			<source type="image/avif" srcSet={`${base}-s.avif 800w, ${base}.avif 1600w`} sizes={sizes} />
			<img
				src={foto}
				alt={alt}
				style={{ objectPosition: fuoco }}
				loading={subito ? "eager" : "lazy"}
				fetchPriority={subito ? "high" : undefined}
				decoding="async"
			/>
		</picture>
	);
}
