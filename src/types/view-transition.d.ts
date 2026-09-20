import "react";

/**
 * `<ViewTransition>` esiste nel React che Next.js impacchetta per l'App
 * Router (`next/dist/compiled/react`), ma non è ancora in `@types/react`.
 * Senza questa dichiarazione `bunx tsc --noEmit` non trova l'export.
 *
 * Da togliere quando `@types/react` la includerà: se a quel punto questo
 * file resta, l'augmentation e i tipi veri entrano in conflitto e il
 * compilatore lo dice subito. Vedi
 * node_modules/next/dist/docs/01-app/02-guides/view-transitions.md
 */
declare module "react" {
	type ClasseTransizione = "none" | "auto" | (string & {});
	type ClassePerTipo = Record<string, ClasseTransizione>;

	interface ProprietaViewTransition {
		children?: React.ReactNode;
		name?: string;
		default?: ClasseTransizione | ClassePerTipo;
		enter?: ClasseTransizione | ClassePerTipo;
		exit?: ClasseTransizione | ClassePerTipo;
		share?: ClasseTransizione | ClassePerTipo;
		update?: ClasseTransizione | ClassePerTipo;
	}

	const ViewTransition: React.FunctionComponent<ProprietaViewTransition>;
}
