"use client";

import { useEffect, useRef, useState } from "react";
import {
	type GiornoSettimana,
	mappaDi,
	NOMI_GIORNO,
	NOMI_MESE,
	occorrenze,
	type RicorrenzaDati,
	regolaIt,
	valida,
} from "@/lib/calendario";
import { oggiRoma } from "@/lib/date";
import { data, perCampo } from "./comune";

type Props = {
	/** `id` vuoto: è un mercato fisso nuovo. */
	voce: RicorrenzaDati;
	onSalva: (v: RicorrenzaDati) => Promise<string | null>;
	onElimina: (id: string) => Promise<string | null>;
	onChiudi: () => void;
};

const SETTIMANE: [number, string][] = [
	[1, "1ª"],
	[2, "2ª"],
	[3, "3ª"],
	[4, "4ª"],
	[-1, "Ultima"],
];
const GIORNI: GiornoSettimana[] = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const TUTTI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * Un mercato che torna ogni mese. Non si scrive la frase: si sceglie la
 * regola — quale settimana, che giorno, quali mesi — e la frase del sito, la
 * regola del calendario e le prossime date si vedono comporsi mentre si
 * sceglie. Le prossime date sono la verifica: se non sono quelle giuste, la
 * regola è sbagliata, e lo si vede prima di salvare.
 */
export function SchedaFisso({ voce, onSalva, onElimina, onChiudi }: Props) {
	const finestra = useRef<HTMLDialogElement>(null);
	const nuova = voce.id === "";
	const [v, setV] = useState<RicorrenzaDati>(voce);
	const [errori, setErrori] = useState<Record<string, string>>({});
	const [errore, setErrore] = useState<string | null>(null);
	const [occupata, setOccupata] = useState(false);
	const [conferma, setConferma] = useState(false);

	useEffect(() => {
		finestra.current?.showModal();
		// Sul titolo, non sul primo campo: sul telefono aprirebbe subito la
		// tastiera, e su «Annulla» il primo tocco sbagliato chiuderebbe tutto.
		finestra.current?.querySelector<HTMLElement>("h2")?.focus();
	}, []);

	const modificata = JSON.stringify(v) !== JSON.stringify(voce);
	const cambia = <K extends keyof RicorrenzaDati>(k: K, x: RicorrenzaDati[K]) => {
		setV((p) => ({ ...p, [k]: x }));
		setErrori((e) => ({ ...e, [k]: "" }));
	};
	const mese = (m: number) =>
		cambia(
			"mesi",
			v.mesi.includes(m) ? v.mesi.filter((x) => x !== m) : [...v.mesi, m].sort((a, b) => a - b),
		);

	const chiudi = () => {
		if (modificata && !occupata && !window.confirm("Chiudere senza salvare?")) return;
		onChiudi();
	};

	const salva = async (e: React.SyntheticEvent) => {
		e.preventDefault();
		const problemi = valida({ mercati: [], ricorrenze: [{ ...v, id: v.id || "nuovo" }] });
		if (problemi.length > 0) {
			setErrori(perCampo(problemi));
			return;
		}
		setOccupata(true);
		setErrore(await onSalva(v));
		setOccupata(false);
	};

	const elimina = async () => {
		if (!conferma) {
			setConferma(true);
			return;
		}
		setOccupata(true);
		setErrore(await onElimina(v.id));
		setOccupata(false);
	};

	const prossime = v.mesi.length > 0 ? occorrenze(v, oggiRoma(), 4) : [];

	return (
		<dialog
			ref={finestra}
			className="ad-scheda"
			aria-labelledby="titolo-fisso"
			onCancel={(e) => {
				e.preventDefault();
				chiudi();
			}}
		>
			<form onSubmit={salva} noValidate>
				<header className="ad-scheda-testa">
					<button type="button" className="ad-testo-bottone" onClick={chiudi}>
						Annulla
					</button>
					<h2 id="titolo-fisso" tabIndex={-1}>
						{nuova ? "Nuovo mercato fisso" : "Mercato fisso"}
					</h2>
					<span />
				</header>

				<div className="ad-scheda-corpo">
					<fieldset className="ad-gruppo">
						<legend>Quale</legend>
						<label className="ad-campo">
							<span>Nome, come lo legge chi visita</span>
							<input
								value={v.luogo}
								onChange={(e) => cambia("luogo", e.target.value)}
								placeholder="Bergamo Alta"
								autoComplete="off"
								aria-invalid={Boolean(errori.luogo)}
							/>
							{errori.luogo && <small className="ad-errore">{errori.luogo}</small>}
						</label>
						<label className="ad-campo">
							<span>Città</span>
							<input
								value={v.citta}
								onChange={(e) => cambia("citta", e.target.value)}
								placeholder="Bergamo"
								autoComplete="off"
								aria-invalid={Boolean(errori.citta)}
							/>
							{errori.citta && <small className="ad-errore">{errori.citta}</small>}
						</label>
						<label className="ad-campo">
							<span>Indirizzo per la mappa</span>
							<input
								value={v.indirizzo}
								onChange={(e) => cambia("indirizzo", e.target.value)}
								placeholder="Colle Aperto, Bergamo Alta"
								autoComplete="off"
								aria-invalid={Boolean(errori.indirizzo)}
							/>
							{errori.indirizzo && <small className="ad-errore">{errori.indirizzo}</small>}
							{v.indirizzo && (
								<a
									className="ad-mappa"
									href={mappaDi(v.indirizzo)}
									target="_blank"
									rel="noreferrer"
								>
									Controlla sulla mappa ↗
								</a>
							)}
						</label>
					</fieldset>

					<fieldset className="ad-gruppo">
						<legend>Quando torna</legend>

						<fieldset className="ad-campo ad-insieme" aria-labelledby="et-settimana">
							<span id="et-settimana">Quale settimana del mese</span>
							<div className="ad-scelte">
								{SETTIMANE.map(([n, t]) => (
									<button
										type="button"
										key={n}
										className="ad-scelta"
										aria-pressed={v.settimana === n}
										onClick={() => cambia("settimana", n)}
									>
										{t}
									</button>
								))}
							</div>
						</fieldset>

						<fieldset className="ad-campo ad-insieme" aria-labelledby="et-giorno">
							<span id="et-giorno">Che giorno</span>
							<div className="ad-scelte ad-scelte-sette">
								{GIORNI.map((g) => (
									<button
										type="button"
										key={g}
										className="ad-scelta"
										aria-pressed={v.giorno === g}
										aria-label={NOMI_GIORNO[g].it}
										onClick={() => cambia("giorno", g)}
									>
										{NOMI_GIORNO[g].it.slice(0, 3)}
									</button>
								))}
							</div>
						</fieldset>

						<fieldset className="ad-campo ad-insieme" aria-labelledby="et-mesi">
							<span id="et-mesi" className="ad-etichetta-riga">
								In quali mesi
								<button
									type="button"
									className="ad-testo-bottone"
									onClick={() => cambia("mesi", v.mesi.length === 12 ? [] : TUTTI)}
								>
									{v.mesi.length === 12 ? "Nessuno" : "Tutti"}
								</button>
							</span>
							<div className="ad-scelte ad-scelte-mesi">
								{TUTTI.map((m) => (
									<button
										type="button"
										key={m}
										className="ad-scelta"
										aria-pressed={v.mesi.includes(m)}
										aria-label={NOMI_MESE.it[m - 1]}
										onClick={() => mese(m)}
									>
										{NOMI_MESE.it[m - 1]?.slice(0, 3)}
									</button>
								))}
							</div>
							{errori.mesi && <small className="ad-errore">{errori.mesi}</small>}
						</fieldset>
					</fieldset>

					<div className="ad-anteprima" aria-live="polite">
						<p className="ad-aiuto">Sul sito apparirà così:</p>
						<p className="ad-riga-sito">
							<span>{v.luogo || "Nome"}</span>
							<span className="ad-tratto" aria-hidden="true" />
							<span>{v.mesi.length > 0 ? regolaIt(v) : "scegli almeno un mese"}</span>
						</p>
						{prossime.length > 0 && (
							<p className="ad-prossime">
								Le prossime volte:{" "}
								{prossime
									.map((d) => data(d, { weekday: "short", day: "numeric", month: "long" }))
									.join(" · ")}
							</p>
						)}
					</div>

					{!nuova && (
						<div className="ad-altre">
							<button
								type="button"
								className="ad-bottone ad-pericolo"
								onClick={elimina}
								disabled={occupata}
							>
								{conferma ? "Sicura? Tocca di nuovo per togliere" : "Togli questo mercato fisso"}
							</button>
						</div>
					)}
				</div>

				<footer className="ad-scheda-piede">
					{errore && (
						<p className="ad-errore ad-errore-grande" role="alert">
							{errore}
						</p>
					)}
					<button
						type="submit"
						className="ad-bottone ad-primario"
						disabled={occupata || (!nuova && !modificata)}
					>
						{occupata ? "Salvo…" : nuova ? "Aggiungi" : "Salva le modifiche"}
					</button>
				</footer>
			</form>
		</dialog>
	);
}
