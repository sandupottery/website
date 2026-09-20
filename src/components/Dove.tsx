import { dizionari } from "@/content/dizionario";
import { mercati } from "@/content/mercati";
import { ricorrenze } from "@/content/ricorrenze";
import { sito } from "@/content/sito";
import type { Locale } from "@/lib/date";
import { giorniBrevi, raggruppaPerMese, ultimoGiorno } from "@/lib/date";

/**
 * Le date dei mercatini, nello stesso segno del catalogo dei pezzi: un nome,
 * un filetto, e all'altro capo il dato. È la stessa riga che altrove porta il
 * prezzo — qui porta un luogo o una regola.
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
						<p className="voce" key={r.luogo}>
							<span className="nome">{r.luogo}</span>
							<span className="tratto" aria-hidden="true" />
							<span className="dato">{locale === "it" ? r.regolaIt : r.regolaEn}</span>
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
											{giorniBrevi(m)}
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
