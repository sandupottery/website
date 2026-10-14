import { type Ambiente, chiEntra } from "../../src/server/calendario-remoto";

type Contesto = {
	request: Request;
	env: Ambiente;
	data: { email?: string };
	next: () => Promise<Response>;
};

/** Ogni richiesta a /api passa di qui: senza un'entrata Access verificata, niente. */
export async function onRequest(ctx: Contesto): Promise<Response> {
	const email = await chiEntra(ctx.request, ctx.env);
	if (!email) return Response.json({ errore: "Devi entrare di nuovo." }, { status: 401 });
	ctx.data.email = email;
	const r = await ctx.next();
	r.headers.set("Cache-Control", "no-store");
	return r;
}
