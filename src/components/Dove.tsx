import { dizionari } from "@/content/dizionario";
import { mercati } from "@/content/mercati";
import { ricorrenze } from "@/content/ricorrenze";
import { sito } from "@/content/sito";
import type { Locale } from "@/lib/date";
import { giorniBrevi, raggruppaPerMese, ultimoGiorno } from "@/lib/date";

/**
 * Le date dei mercatini.
 *
 * La riga è quella del catalogo dei pezzi — un nome, un filetto, e all'altro
 * capo il dato — ma pesata al contrario: lì il nome del pezzo è la voce e il
 * prezzo è la postilla, qui la data e il luogo sono *l'unica* cosa che
 * qualcuno è venuto a leggere. Il filetto quindi si assottiglia e i due capi
 * si scuriscono; con il segno pieno del catalogo la riga più leggibile era la
 * linea che divide le due che contano.
 *
 * Il mese sta in verticale accanto al suo gruppo, come il marchio nel margine:
 * un numero in colonna non si legge come una data finché non si risale al mese
 * scritto sopra, e un filetto che abbraccia il gruppo dice a colpo d'occhio
 * quali giorni appartengono a quale mese.
 *
 * Una regola sola per i legami, in tutte e due le liste: **il dove apre la
 * mappa, il quando va nel calendario.**
 *
 * I `data-*` non sono decorazione: li legge `ScriptFreschezza`.
 */
export function Mercati({ locale }: { locale: Locale }) {
	const d = dizionari[locale];
	const gruppi = raggruppaPerMese(mercati, locale);

	return (
		<>
			<div className="blocco elenco">
				<p className="occhiello">{d.ogniMeseSempre}</p>
				<div>
					{ricorrenze.map((r) => (
						<p className="voce" key={r.id}>
							<a className="nome" href={r.mappa} target="_blank" rel="noreferrer">
								{r.luogo}
							</a>
							<span className="tratto" aria-hidden="true" />
							{/* Una regola salvata una volta vale per tutti i mesi che
							    verranno: il .ics porta una RRULE, non una data. */}
							<a className="dato" href={`/calendario/${r.id}.ics`}>
								{locale === "it" ? r.regolaIt : r.regolaEn}
							</a>
						</p>
					))}
					<p className="nota">{d.ogniMeseNota}</p>
				</div>
			</div>

			<div className="blocco elenco">
				<p className="occhiello">{d.prossimeDate}</p>
				<div data-elenco-date>
					<p className="nota" data-suggerimento>
						{d.suggerimentoDate}
					</p>

					{gruppi.map((g) => (
						<div className="mese" data-gruppo-mese key={g.chiave}>
							<p className="occhiello">{g.etichetta}</p>
							<ul>
								{g.voci.map((m) => (
									<li className="voce" data-fine={ultimoGiorno(m)} key={m.id}>
										<a className="nome" href={`/calendario/${m.id}.ics`}>
											{giorniBrevi(m, locale)}
										</a>
										<span className="tratto" aria-hidden="true" />
										<a className="dato" href={m.mappa} target="_blank" rel="noreferrer">
											{m.citta}, {m.luogo}
											{m.dettaglio ? ` (${m.dettaglio})` : ""}
										</a>
									</li>
								))}
							</ul>
						</div>
					))}

					{/* Nascosto finché lo script non accerta che non resta nessuna data. */}
					<p className="nota" data-nessuna-data>
						{d.nessunaData}
					</p>

					<a className="scarica" data-tutte-le-date href="/calendario/mercatini.ics">
						{d.tutteLeDate}
					</a>
				</div>
			</div>
		</>
	);
}

export function Contatti({ locale }: { locale: Locale }) {
	const d = dizionari[locale];

	return (
		<div className="blocco contatti">
			<p className="occhiello">{d.scrivimi}</p>
			<div>
				<p>{d.scrivimiTesto}</p>
				<a className="email" href={`mailto:${sito.email}`}>
					{sito.email}
				</a>
				<ul className="profili">
					{sito.profili.map((p) => (
						<li key={p.url}>
							<a href={p.url} target="_blank" rel="me noreferrer">
								Instagram <span aria-hidden="true">·</span> {p.etichetta}
							</a>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
