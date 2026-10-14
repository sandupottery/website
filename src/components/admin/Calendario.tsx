"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	type DatiCalendario,
	type MercatoDati,
	ordina,
	type RicorrenzaDati,
	regolaIt,
} from "@/lib/calendario";
import { oggiRoma, raggruppaPerMese } from "@/lib/date";
import { carica, data, invia, type Operazione, Scollegata, type Stato, statoDi } from "./comune";
import { type Posto, SchedaData } from "./SchedaData";
import { SchedaFisso } from "./SchedaFisso";

type Scheda = { tipo: "data"; voce: MercatoDati } | { tipo: "fisso"; voce: RicorrenzaDati } | null;
type Pubblicazione = { commit: string; stato: Stato };

const MEMORIA = "sp-admin-pubblicazione";
const vuota = (): MercatoDati => ({ id: "", inizio: "", citta: "", luogo: "" });
const fissoVuoto = (): RicorrenzaDati => ({
	id: "",
	luogo: "",
	citta: "",
	indirizzo: "",
	settimana: 2,
	giorno: "SU",
	mesi: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
});

/**
 * La pagina con cui Stefania tiene il calendario. Scritta per un telefono
 * prima che per un computer, e per una persona che la apre una volta ogni
 * qualche settimana: tutto si legge da sé, niente gergo, e ogni azione dice
 * subito che cosa è successo e quando lo vedrà sul sito.
 *
 * Ogni salvataggio è un'operazione sola (aggiungi, cambia, togli) inviata
 * alla funzione, che la applica all'ultima versione del file nel repository:
 * non c'è un «pubblica» da ricordarsi di premere, e due telefoni aperti
 * insieme non si sovrascrivono.
 */
export function Calendario() {
	const [dati, setDati] = useState<DatiCalendario | null>(null);
	const [email, setEmail] = useState("");
	const [problema, setProblema] = useState<"scollegata" | string | null>(null);
	const [vista, setVista] = useState<"date" | "fissi">("date");
	const [scheda, setScheda] = useState<Scheda>(null);
	const [pubblicazione, setPubblicazione] = useState<Pubblicazione | null>(null);
	const [avviso, setAvviso] = useState<string | null>(null);
	const [vediPassate, setVediPassate] = useState(false);

	const ricarica = useCallback(async () => {
		setProblema(null);
		try {
			const r = await carica();
			setDati(r.dati);
			setEmail(r.email);
		} catch (e) {
			setProblema(e instanceof Scollegata ? "scollegata" : (e as Error).message);
		}
	}, []);

	useEffect(() => {
		ricarica();
		try {
			const p = JSON.parse(localStorage.getItem(MEMORIA) ?? "null") as Pubblicazione | null;
			if (p?.commit) setPubblicazione(p);
		} catch {}
	}, [ricarica]);

	// ─── a che punto è il sito ───
	useEffect(() => {
		try {
			localStorage.setItem(MEMORIA, JSON.stringify(pubblicazione));
		} catch {}
		if (!pubblicazione || pubblicazione.stato === "online" || pubblicazione.stato === "errore")
			return;
		const t = setTimeout(async () => {
			try {
				const { stato } = await statoDi(pubblicazione.commit);
				setPubblicazione((p) => (p && p.commit === pubblicazione.commit ? { ...p, stato } : p));
			} catch {
				// Si riprova al giro dopo: un controllo saltato non è un problema.
				setPubblicazione((p) => (p ? { ...p } : p));
			}
		}, 7000);
		return () => clearTimeout(t);
	}, [pubblicazione]);

	useEffect(() => {
		if (!avviso) return;
		const t = setTimeout(() => setAvviso(null), 6000);
		return () => clearTimeout(t);
	}, [avviso]);

	/** Una modifica: `null` se è andata, altrimenti il perché in parole sue. */
	const esegui = async (op: Operazione, fatto: string): Promise<string | null> => {
		try {
			const r = await invia(op);
			setDati(r.dati);
			setPubblicazione({ commit: r.commit, stato: "in-coda" });
			setScheda(null);
			setAvviso(fatto);
			return null;
		} catch (e) {
			if (e instanceof Scollegata)
				return "La sessione è scaduta. Ricarica la pagina ed entra di nuovo: quello che hai scritto qui va riscritto.";
			return (e as Error).message;
		}
	};

	const oggi = oggiRoma();
	const { future, passate, posti } = useMemo(() => {
		const tutte = ordina(dati?.mercati ?? []);
		// I posti più frequenti, poi i più recenti: quasi sempre è uno di questi.
		const conta = new Map<string, Posto & { n: number; ultima: string }>();
		for (const m of tutte) {
			const k = `${m.citta}|${m.luogo}`;
			const p = conta.get(k);
			conta.set(k, {
				citta: m.citta,
				luogo: m.luogo,
				dettaglio: m.dettaglio,
				indirizzo: m.indirizzo,
				n: (p?.n ?? 0) + 1,
				ultima: m.inizio,
			});
		}
		return {
			future: tutte.filter((m) => (m.fine ?? m.inizio) >= oggi),
			passate: tutte.filter((m) => (m.fine ?? m.inizio) < oggi).reverse(),
			posti: [...conta.values()]
				.sort((a, b) => b.n - a.n || b.ultima.localeCompare(a.ultima))
				.slice(0, 8),
		};
	}, [dati, oggi]);

	if (problema === "scollegata") {
		return (
			<main className="ad-pagina ad-centro">
				<h1>Il calendario</h1>
				<p>Per modificare le date devi entrare con la tua email.</p>
				<button type="button" className="ad-bottone ad-primario" onClick={() => location.reload()}>
					Entra
				</button>
			</main>
		);
	}

	return (
		<>
			<header className="ad-testa">
				<div className="ad-testa-riga">
					<a className="ad-marchio" href="/dove" target="_blank" rel="noreferrer">
						Sandu Pottery <span aria-hidden="true">↗</span>
					</a>
					{email && (
						<a className="ad-esci" href="/cdn-cgi/access/logout">
							Esci
						</a>
					)}
				</div>
				<h1>Il calendario</h1>
				<StatoSito p={pubblicazione} />
				<div className="ad-schede" role="tablist" aria-label="Che cosa modificare">
					<button
						type="button"
						role="tab"
						aria-selected={vista === "date"}
						onClick={() => setVista("date")}
					>
						Le date <span className="ad-conta">{future.length}</span>
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={vista === "fissi"}
						onClick={() => setVista("fissi")}
					>
						Ogni mese <span className="ad-conta">{dati?.ricorrenze.length ?? 0}</span>
					</button>
				</div>
			</header>

			<main className="ad-pagina">
				{problema && (
					<div className="ad-errore ad-errore-grande" role="alert">
						<p>{problema}</p>
						<button type="button" className="ad-bottone ad-secondario" onClick={ricarica}>
							Riprova
						</button>
					</div>
				)}
				{!dati && !problema && <p className="ad-attesa">Carico il calendario…</p>}

				{dati && vista === "date" && (
					<section aria-label="Le date">
						<button
							type="button"
							className="ad-bottone ad-primario ad-aggiungi"
							onClick={() => setScheda({ tipo: "data", voce: vuota() })}
						>
							<span aria-hidden="true">+</span> Aggiungi una data
						</button>

						{future.length === 0 && (
							<p className="ad-vuoto">Nessuna data in programma. Aggiungi la prossima.</p>
						)}

						{raggruppaPerMese(future, "it").map((g) => (
							<div className="ad-mese" key={g.chiave}>
								<h2>
									{g.etichetta} <span>{g.chiave.slice(0, 4)}</span>
								</h2>
								<ul>
									{g.voci.map((m) => (
										<li key={m.id}>
											<VoceData
												m={m}
												oggi={oggi}
												onApri={() => setScheda({ tipo: "data", voce: m })}
											/>
										</li>
									))}
								</ul>
							</div>
						))}

						{passate.length > 0 && (
							<div className="ad-passate">
								<button
									type="button"
									className="ad-testo-bottone"
									aria-expanded={vediPassate}
									onClick={() => setVediPassate((x) => !x)}
								>
									{vediPassate ? "Nascondi" : "Mostra"} le date passate ({passate.length})
								</button>
								{vediPassate && (
									<>
										<p className="ad-aiuto">
											Sul sito non si vedono già più. Toglierle tiene l'elenco ordinato, e non
											cambia nient'altro.
										</p>
										<button
											type="button"
											className="ad-bottone ad-secondario"
											onClick={async () => {
												if (!window.confirm(`Togliere le ${passate.length} date passate?`)) return;
												const e = await esegui(
													{ tipo: "pulisci-passate", oggi },
													"Date passate tolte.",
												);
												if (e) setAvviso(e);
											}}
										>
											Togli le date passate
										</button>
										<ul className="ad-elenco-passate">
											{passate.map((m) => (
												<li key={m.id}>
													<VoceData
														m={m}
														oggi={oggi}
														onApri={() => setScheda({ tipo: "data", voce: m })}
													/>
												</li>
											))}
										</ul>
									</>
								)}
							</div>
						)}
					</section>
				)}

				{dati && vista === "fissi" && (
					<section aria-label="I mercati di ogni mese">
						<p className="ad-aiuto ad-introduzione">
							I mercati che tornano sempre, con una regola: «la 2ª domenica del mese». Sul sito
							stanno sopra le date, e chi visita li può salvare nel calendario una volta per tutte.
						</p>
						<button
							type="button"
							className="ad-bottone ad-primario ad-aggiungi"
							onClick={() => setScheda({ tipo: "fisso", voce: fissoVuoto() })}
						>
							<span aria-hidden="true">+</span> Aggiungi un mercato fisso
						</button>
						<ul className="ad-fissi">
							{dati.ricorrenze.map((r) => (
								<li key={r.id}>
									<button
										type="button"
										className="ad-voce"
										onClick={() => setScheda({ tipo: "fisso", voce: r })}
									>
										<span className="ad-dove">
											<strong>{r.luogo}</strong>
											<span>{regolaIt(r)}</span>
										</span>
										<span className="ad-freccia" aria-hidden="true">
											›
										</span>
									</button>
								</li>
							))}
						</ul>
					</section>
				)}
			</main>

			{avviso && (
				<p className="ad-avviso" role="status">
					{avviso}
				</p>
			)}

			{scheda?.tipo === "data" && (
				<SchedaData
					key={scheda.voce.id || `nuova-${scheda.voce.inizio}-${scheda.voce.luogo}`}
					voce={scheda.voce}
					posti={posti}
					tutte={dati?.mercati ?? []}
					onChiudi={() => setScheda(null)}
					onSalva={(v) =>
						esegui(
							{ tipo: "mercato", voce: v },
							v.id
								? "Modifica salvata."
								: `Aggiunta: ${data(v.inizio, { day: "numeric", month: "long" })}, ${v.citta}.`,
						)
					}
					onElimina={(id) => esegui({ tipo: "elimina-mercato", id }, "Data tolta.")}
					onDuplica={(v) =>
						setScheda({ tipo: "data", voce: { ...v, id: "", inizio: "", fine: undefined } })
					}
				/>
			)}
			{scheda?.tipo === "fisso" && (
				<SchedaFisso
					key={scheda.voce.id || "nuovo"}
					voce={scheda.voce}
					onChiudi={() => setScheda(null)}
					onSalva={(v) =>
						esegui(
							{ tipo: "ricorrenza", voce: v },
							v.id ? "Modifica salvata." : "Mercato fisso aggiunto.",
						)
					}
					onElimina={(id) => esegui({ tipo: "elimina-ricorrenza", id }, "Mercato fisso tolto.")}
				/>
			)}
		</>
	);
}

function VoceData({ m, oggi, onApri }: { m: MercatoDati; oggi: string; onApri: () => void }) {
	const fine = m.fine && m.fine !== m.inizio ? m.fine : undefined;
	const adesso = m.inizio <= oggi && oggi <= (fine ?? m.inizio);
	return (
		<button type="button" className="ad-voce" onClick={onApri}>
			<span className="ad-quando">
				<b>
					{Number(m.inizio.slice(8))}
					{fine && `–${Number(fine.slice(8))}`}
				</b>
				<small>
					{data(m.inizio, { weekday: "short" })}
					{fine && `–${data(fine, { weekday: "short" })}`}
				</small>
			</span>
			<span className="ad-dove">
				<strong>{m.citta}</strong>
				<span>
					{m.luogo}
					{m.dettaglio && <em> · {m.dettaglio}</em>}
				</span>
				{adesso && <span className="ad-oggi">Oggi</span>}
			</span>
			<span className="ad-freccia" aria-hidden="true">
				›
			</span>
		</button>
	);
}

/**
 * Lo stato del sito dopo un salvataggio. È la risposta alla domanda che
 * altrimenti resterebbe: «l'ho salvato, ma si vede?».
 */
function StatoSito({ p }: { p: Pubblicazione | null }) {
	if (!p) return <p className="ad-stato">Tocca una data per cambiarla.</p>;
	if (p.stato === "online")
		return (
			<p className="ad-stato ad-stato-fatto" role="status">
				<span aria-hidden="true">✓</span> Il sito è aggiornato.{" "}
				<a href="/dove" target="_blank" rel="noreferrer">
					Guarda ↗
				</a>
			</p>
		);
	if (p.stato === "errore")
		return (
			<p className="ad-stato ad-stato-errore" role="status">
				Le modifiche sono salvate, ma il sito non si è aggiornato. Enea ne riceve l'avviso: non
				serve rifare niente.
			</p>
		);
	return (
		<p className="ad-stato ad-stato-corso" role="status">
			<span className="ad-pallino" aria-hidden="true" /> Salvato. Il sito si aggiorna in circa 3
			minuti: puoi chiudere la pagina.
		</p>
	);
}
