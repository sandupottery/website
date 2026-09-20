import type { Lingua } from "@/content/collezioni";
import { dizionari } from "@/content/dizionario";
import { sito } from "@/content/sito";

/**
 * L'anno è calcolato alla compilazione, non nel browser.
 *
 * Aggiornarlo a runtime vorrebbe dire toccare il testo di un nodo prima
 * dell'idratazione, che è esattamente la cosa che in questo progetto non si fa
 * (vedi `ScriptFreschezza`): React 19 butterebbe via il sottoalbero servito dal
 * server e lo rifarebbe senza la modifica. Ogni pubblicazione ricompila, quindi
 * l'anno si rinfresca da solo a ogni deploy — non è scritto a mano da nessuna
 * parte, che è quello che conta.
 */
const ANNO = new Date().getFullYear();

/**
 * Il piede della home. In fondo al percorso, non in cima: chi è arrivato qui
 * ha già visto tutto e le due cose che può volere sono scrivere o sapere di
 * chi è il sito.
 *
 * I contatti tornano qui anche se stanno già nella stanza «Dove»: sono
 * l'unica azione possibile su tutto il sito, e farli cercare in una pagina
 * interna vorrebbe dire nasconderli.
 */
export function Piede({ lingua }: { lingua: Lingua }) {
	const d = dizionari[lingua];

	return (
		<footer id="piede">
			<div className="colonna">
				<p className="insegna">
					© {ANNO} {sito.nome}
				</p>
				<p>
					Stefania Casto · {sito.citta}, {lingua === "it" ? "Italia" : "Italy"}
				</p>
			</div>

			<div className="colonna">
				<p className="occhiello">{d.scrivimi}</p>
				<a href={`mailto:${sito.email}`} data-glifo="✉">
					{sito.email}
				</a>
				{sito.profili.map((p) => (
					<a key={p.url} href={p.url} target="_blank" rel="me noreferrer" data-glifo="↗">
						Instagram <span aria-hidden="true">·</span> {p.etichetta}
					</a>
				))}
			</div>

			<p className="firma">
				<a href="https://eneascaccabarozzi.xyz/it/" target="_blank" rel="noreferrer" data-glifo="↗">
					{/* Il cuore è i due caratteri, non il simbolo e non l'emoji: è una
					    scelta, non una mancanza. Non «correggerlo» in ♥. */}
					made with &lt;3 by Enea
				</a>
			</p>
		</footer>
	);
}
