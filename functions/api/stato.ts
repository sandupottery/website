import {
	type Ambiente,
	ErroreUtente,
	statoPubblicazione,
} from "../../src/server/calendario-remoto";

/** A che punto è la pubblicazione di un salvataggio: la pagina lo chiede ogni pochi secondi. */
export async function onRequestGet({
	request,
	env,
}: {
	request: Request;
	env: Ambiente;
}): Promise<Response> {
	const commit = new URL(request.url).searchParams.get("commit");
	if (!commit || !/^[\w-]{1,64}$/.test(commit))
		return Response.json({ errore: "Manca il commit." }, { status: 400 });
	try {
		return Response.json({ stato: await statoPubblicazione(env, commit) });
	} catch (e) {
		const stato = e instanceof ErroreUtente ? e.stato : 500;
		return Response.json({ errore: e instanceof Error ? e.message : "Errore" }, { status: stato });
	}
}
