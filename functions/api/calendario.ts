import {
	type Ambiente,
	ErroreUtente,
	leggi,
	modifica,
	type Operazione,
} from "../../src/server/calendario-remoto";

type Contesto = { request: Request; env: Ambiente; data: { email?: string } };

const sbaglio = (e: unknown) =>
	e instanceof ErroreUtente
		? Response.json({ errore: e.message }, { status: e.stato })
		: Response.json({ errore: "Qualcosa non ha funzionato. Riprova fra poco." }, { status: 500 });

/** Il calendario più recente, letto dal repository e non dalla build. */
export async function onRequestGet({ env, data }: Contesto): Promise<Response> {
	try {
		const { dati } = await leggi(env);
		return Response.json({ dati, email: data.email });
	} catch (e) {
		return sbaglio(e);
	}
}

/** Una modifica: si applica all'ultima versione e diventa un commit. */
export async function onRequestPost({ request, env }: Contesto): Promise<Response> {
	try {
		const op = (await request.json()) as Operazione;
		if (!op || typeof op !== "object" || typeof op.tipo !== "string")
			throw new ErroreUtente("Richiesta vuota.");
		return Response.json(await modifica(env, op));
	} catch (e) {
		return sbaglio(e);
	}
}
