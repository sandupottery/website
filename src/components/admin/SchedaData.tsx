"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { indirizzoDi, type MercatoDati, mappaDi, valida } from "@/lib/calendario";
import { oggiRoma } from "@/lib/date";
import { data, perCampo } from "./comune";

export type Posto = { citta: string; luogo: string; dettaglio?: string; indirizzo?: string };

type Props = {
	/** `id` vuoto: è una data nuova. */
	voce: MercatoDati;
	posti: Posto[];
	tutte: readonly MercatoDati[];
	onSalva: (v: MercatoDati) => Promise<string | null>;
	onElimina: (id: string) => Promise<string | null>;
	onDuplica: (v: MercatoDati) => void;
	onChiudi: () => void;
};

/**
 * Una data, da aggiungere o da cambiare. Si apre a tutto schermo sul telefono
 * e come finestra sul computer; è un `<dialog>` vero, quindi Esc e il tasto
 * indietro di Android la chiudono come ci si aspetta.
 *
 * L'ordine dei campi è l'ordine in cui le arriva l'informazione: prima il
 * quando, poi il dove — e per il dove, prima i posti in cui è già stata,
 * perché quasi sempre è uno di quelli.
 */
export function SchedaData({ voce, posti, tutte, onSalva, onElimina, onDuplica, onChiudi }: Props) {
	const finestra = useRef<HTMLDialogElement>(null);
	const nuova = voce.id === "";
	const [v, setV] = useState<MercatoDati>(voce);
	const [piuGiorni, setPiuGiorni] = useState(Boolean(voce.fine && voce.fine !== voce.inizio));
	const [indirizzoMano, setIndirizzoMano] = useState(Boolean(voce.indirizzo));
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

	const cambia = <K extends keyof MercatoDati>(k: K, x: MercatoDati[K]) => {
		setV((p) => ({ ...p, [k]: x }));
		setErrori((e) => ({ ...e, [k]: "" }));
	};

	const finale: MercatoDati = {
		...v,
		fine: piuGiorni && v.fine ? v.fine : undefined,
		indirizzo: indirizzoMano ? v.indirizzo : undefined,
	};
	const modificata =
		JSON.stringify(finale) !==
		JSON.stringify({ ...voce, fine: voce.fine, indirizzo: voce.indirizzo });

	const oggi = oggiRoma();
	const passata = v.inizio !== "" && (finale.fine ?? v.inizio) < oggi;
	const stessoGiorno = useMemo(
		() =>
			tutte.filter(
				(m) =>
					m.id !== v.id &&
					m.inizio <= (finale.fine ?? v.inizio) &&
					(m.fine ?? m.inizio) >= v.inizio,
			),
		[tutte, v.id, v.inizio, finale.fine],
	);

	const chiudi = () => {
		if (modificata && !occupata && !window.confirm("Chiudere senza salvare?")) return;
		onChiudi();
	};

	const scegliPosto = (p: Posto) => {
		setV((x) => ({
			...x,
			citta: p.citta,
			luogo: p.luogo,
			dettaglio: p.dettaglio,
			indirizzo: p.indirizzo,
		}));
		setIndirizzoMano(Boolean(p.indirizzo));
		setErrori({});
	};

	const salva = async (e: React.SyntheticEvent) => {
		e.preventDefault();
		const problemi = valida({ mercati: [{ ...finale, id: finale.id || "nuova" }], ricorrenze: [] });
		if (problemi.length > 0) {
			setErrori(perCampo(problemi));
			return;
		}
		setOccupata(true);
		setErrore(await onSalva(finale));
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

	const sulSito = v.inizio
		? `${data(v.inizio, { weekday: "short", day: "numeric", month: "short" })}${
				finale.fine
					? ` – ${data(finale.fine, { weekday: "short", day: "numeric", month: "short" })}`
					: ""
			}`
		: "…";
	const dove =
		[v.citta || "Città", v.luogo || "luogo"].join(", ") + (v.dettaglio ? ` (${v.dettaglio})` : "");

	return (
		<dialog
			ref={finestra}
			className="ad-scheda"
			aria-labelledby="titolo-scheda"
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
					<h2 id="titolo-scheda" tabIndex={-1}>
						{nuova ? "Nuova data" : "Modifica la data"}
					</h2>
					<span />
				</header>

				<div className="ad-scheda-corpo">
					<fieldset className="ad-gruppo">
						<legend>Quando</legend>
						<label className="ad-campo">
							<span>{piuGiorni ? "Primo giorno" : "Giorno"}</span>
							<input
								type="date"
								value={v.inizio}
								required
								onChange={(e) => {
									cambia("inizio", e.target.value);
									if (v.fine && e.target.value > v.fine) cambia("fine", e.target.value);
								}}
								aria-invalid={Boolean(errori.inizio)}
							/>
							{v.inizio && (
								<small className="ad-eco">
									{data(v.inizio, {
										weekday: "long",
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
								</small>
							)}
							{errori.inizio && <small className="ad-errore">{errori.inizio}</small>}
						</label>

						<label className="ad-interruttore">
							<input
								type="checkbox"
								checked={piuGiorni}
								onChange={(e) => {
									setPiuGiorni(e.target.checked);
									if (e.target.checked && !v.fine && v.inizio) {
										const d = new Date(`${v.inizio}T12:00:00Z`);
										d.setUTCDate(d.getUTCDate() + 1);
										cambia("fine", d.toISOString().slice(0, 10));
									}
								}}
							/>
							<span>Dura più giorni</span>
						</label>

						{piuGiorni && (
							<label className="ad-campo">
								<span>Ultimo giorno</span>
								<input
									type="date"
									value={v.fine ?? ""}
									min={v.inizio || undefined}
									onChange={(e) => cambia("fine", e.target.value)}
									aria-invalid={Boolean(errori.fine)}
								/>
								{v.fine && (
									<small className="ad-eco">
										{data(v.fine, { weekday: "long", day: "numeric", month: "long" })}
									</small>
								)}
								{errori.fine && <small className="ad-errore">{errori.fine}</small>}
							</label>
						)}

						{passata && (
							<p className="ad-attenzione">Questa data è già passata: sul sito non si vedrà.</p>
						)}
						{stessoGiorno.length > 0 && (
							<p className="ad-attenzione">
								In quei giorni c'è già:{" "}
								{stessoGiorno
									.map(
										(m) =>
											`${data(m.inizio, { day: "numeric", month: "long" })}, ${m.citta} ${m.luogo}`,
									)
									.join("; ")}
								.
							</p>
						)}
					</fieldset>

					<fieldset className="ad-gruppo">
						<legend>Dove</legend>
						{posti.length > 0 && (
							<div className="ad-posti">
								<p className="ad-aiuto">Un posto dove sei già stata:</p>
								<div className="ad-posti-elenco">
									{posti.map((p) => {
										const scelto = p.citta === v.citta && p.luogo === v.luogo;
										return (
											<button
												type="button"
												key={`${p.citta}|${p.luogo}`}
												className="ad-posto"
												aria-pressed={scelto}
												onClick={() => scegliPosto(p)}
											>
												<b>{p.citta}</b> {p.luogo}
											</button>
										);
									})}
								</div>
								<p className="ad-aiuto">Oppure scrivilo qui sotto:</p>
							</div>
						)}

						<label className="ad-campo">
							<span>Città</span>
							<input
								value={v.citta}
								onChange={(e) => cambia("citta", e.target.value)}
								list="ad-citta"
								autoComplete="off"
								autoCapitalize="words"
								placeholder="Milano"
								aria-invalid={Boolean(errori.citta)}
							/>
							{errori.citta && <small className="ad-errore">{errori.citta}</small>}
						</label>
						<datalist id="ad-citta">
							{[...new Set(posti.map((p) => p.citta))].map((c) => (
								<option key={c} value={c} />
							))}
						</datalist>

						<label className="ad-campo">
							<span>Luogo</span>
							<input
								value={v.luogo}
								onChange={(e) => cambia("luogo", e.target.value)}
								autoComplete="off"
								placeholder="piazza Diaz"
								aria-invalid={Boolean(errori.luogo)}
							/>
							{errori.luogo && <small className="ad-errore">{errori.luogo}</small>}
						</label>

						<label className="ad-campo">
							<span>
								Nome dell'evento o zona <i>facoltativo</i>
							</span>
							<input
								value={v.dettaglio ?? ""}
								onChange={(e) => cambia("dettaglio", e.target.value || undefined)}
								autoComplete="off"
								placeholder="L'isola che c'è"
							/>
						</label>

						<div className="ad-campo">
							<span>Indirizzo per la mappa</span>
							{indirizzoMano ? (
								<input
									value={v.indirizzo ?? ""}
									onChange={(e) => cambia("indirizzo", e.target.value)}
									autoComplete="off"
									aria-label="Indirizzo per la mappa"
								/>
							) : (
								<p className="ad-eco ad-eco-riga">
									{v.luogo && v.citta
										? `${v.luogo}, ${v.citta}`
										: "Si compila da solo con luogo e città."}{" "}
									<button
										type="button"
										className="ad-testo-bottone"
										onClick={() => {
											setIndirizzoMano(true);
											cambia("indirizzo", v.luogo && v.citta ? `${v.luogo}, ${v.citta}` : "");
										}}
									>
										Cambia
									</button>
								</p>
							)}
							{v.luogo && v.citta && (
								<a
									className="ad-mappa"
									href={mappaDi(indirizzoDi(finale))}
									target="_blank"
									rel="noreferrer"
								>
									Controlla sulla mappa ↗
								</a>
							)}
						</div>
					</fieldset>

					<div className="ad-anteprima" aria-live="polite">
						<p className="ad-aiuto">Sul sito apparirà così:</p>
						<p className="ad-riga-sito">
							<span>{sulSito}</span>
							<span className="ad-tratto" aria-hidden="true" />
							<span>{dove}</span>
						</p>
					</div>

					{!nuova && (
						<div className="ad-altre">
							<button
								type="button"
								className="ad-bottone ad-secondario"
								onClick={() => onDuplica(finale)}
								disabled={occupata}
							>
								Stesso posto, un'altra data
							</button>
							<button
								type="button"
								className="ad-bottone ad-pericolo"
								onClick={elimina}
								disabled={occupata}
							>
								{conferma ? "Sicura? Tocca di nuovo per togliere" : "Togli questa data"}
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
						{occupata ? "Salvo…" : nuova ? "Aggiungi al calendario" : "Salva le modifiche"}
					</button>
				</footer>
			</form>
		</dialog>
	);
}
