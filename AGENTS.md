<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Context

The permanent showcase site for Sandu Pottery, an artisan potter in Bergamo, Italy. It replaces a cancelled Shopify store and, in time, the temporary "lavori in corso" site that still lives on `main` and serves the apex domain. No shop, no cart, no shipping.

**The design thesis, which every change should be measured against: the design is severe, the warmth is the content.** Hairline rules, huge quiet type, empty space, no ornament, no colour that did not come from one of her glazes. The warmth arrives through her photographs and her first-person voice. Trying to make the *design* warm ends at *carino*, which is the failure the client named first.

Texts and photographs in `src/content/collezioni.ts` are working material: the client will rewrite the copy and reshoot most of the images. They are placed so she can see the shape, not because they are final.

## Architecture

- Fourteen routes, all prerendered: `/` and `/en` (the home), plus `/<collezione>` and `/en/<collezione>` for the six rooms. Slugs are **not** translated, so the language toggle is one computed link — see `src/lib/percorsi.ts`.
- `output: "export"` — fully static, no server, no middleware
- **Two root layouts**, one per language, under the route groups `src/app/(it)` and `src/app/(en)`. Both render `src/components/Radice.tsx`, which is the only copy of the shell. See "Rules that will bite you".
- One content model in `src/content/collezioni.ts` feeds the home, the rooms, the sitemap, the per-page metadata and the JSON-LD. Six entries: four collections, `chi-sono`, and `dove`. Only the first four are collections; the other two are rooms of the same shape, which is what makes the index, the bottom-bar cycle and `generateStaticParams` need no special cases.
- The market calendar lives in the `dove` room as two content blocks (`{tipo:"mercati"}`, `{tipo:"contatti"}`) rendered by `src/components/Dove.tsx`, reading `mercati.ts`, `ricorrenze.ts`, `sito.ts` and `dizionario.ts`. The `.ics` files and the `Event` JSON-LD come from the same data.
- The home→room transition is the browser's View Transitions API through React's `<ViewTransition>`. **No animation library.** See "Rules that will bite you".
- Photographs are served as AVIF at two widths with a JPEG fallback, through `src/components/Immagine.tsx`. Every `<img>` on the site goes through it.

## Tech & Tooling

- Bun for everything. Never `npm` or `yarn`.
- Biome for lint + format (no ESLint, no Prettier)
- Lefthook for git hooks; commitlint enforcing conventional commits
- Tailwind CSS v4 via PostCSS, CSS-first `@theme` — there is no `tailwind.config.ts`
- `bun test` for the pure functions in `src/lib/`
- **No animation library, and none is needed.** Motion is the View Transitions API, CSS transitions, and one `requestAnimationFrame` loop for the scrolling background.
- `src/app/globals.css` is hand-written CSS with named classes, not utilities. The home is five distinct compositions, not a grid; in utilities that becomes forty arbitrary values per element. Tailwind stays for the `@theme` tokens and for whatever comes next (the market calendar).

## Commands

| Command             | Purpose                        |
| ------------------- | ------------------------------ |
| `bun install`       | Install deps                   |
| `bun run dev`       | Dev server                     |
| `bun run build`     | Static build + generate `.ics` |
| `bun run lint`      | Lint check                     |
| `bunx tsc --noEmit` | Type check                     |
| `bun test`          | Unit tests                     |

## Rules that will bite you

- **`::view-transition-old/new` inherit their group's `animation-duration`.** Setting a long duration on `::view-transition-group(x)` silently stretches the cross-fade of its contents to match. For `margine` that meant the old left-hand column — the vertical wordmark and its rule — hung stretched across the middle of the page for half a second, over the text of the room that was arriving. The box has to move slowly; its contents must not. `globals.css` sets `old(margine)` and `new(margine)` explicitly, and any new group with a duration over ~0.3s needs the same treatment.
- **The home titles no longer sit on the photographs, and the bands behind them are gone.** They existed for contrast — the title crossed the image, and an image can be dark, light or busy exactly there — but in the ribbon the caption lives in its own column and never touches a photograph, so the band had nothing left to correct. `righe()` in `src/lib/testo.tsx` still produces one block per line: the line breaks are chosen, and the link's accessible name has to match what is read. **If a title ever goes back over an image, the answer is still not a gradient and not `mix-blend-mode`** — both were tried and rejected by the client, and both depend on what happens to be in the photograph.
- **Two root layouts, not one.** `<html lang>` is per document and the App Router root cannot see the route, so the English tree used to be a `<div lang="en">` inside a document declaring itself Italian — which left the `<title>` in the wrong language. The route groups `(it)` and `(en)` each own a root layout; there is deliberately **no** `src/app/layout.tsx`. Adding one back collapses both groups into it and the bug returns.
- **React strips `view-transition-name` from any element that is off-screen at commit time.** `measureInstance().view` in `react-dom` checks the element against the viewport; if it fails, React removes the name and no pair forms, so a shared element silently cross-fades instead of morphing. This is why `src/components/Cima.tsx` scrolls the room to the top in a `useLayoutEffect` (which runs inside the commit, before React measures) and why `Scorrimento` restores the home's scroll the same way on the way back. **If a morph ever "stops working", check that both elements are on screen at commit time before suspecting anything else.**
- **Navigating between two rooms does not start a view transition at all.** The route (`[collezione]`) does not change, so React commits an update rather than an enter/exit pair, and `startViewTransition` is never called — `enter`/`exit`/`update` props and a `key` on `<Stanza>` all fail to force it. That one passage is covered by a scoped CSS fade (`main.in-stanza.appena-entrata`), armed by `src/lib/provenienza.ts`. Do not "fix" this by adding a global page fade: it would fight the home→room morph, which is the site's most important movement.
- **The room's background colour is server-rendered in a `<style>` tag, the home's is written to `--ground` inline by JavaScript.** They meet in one place: `Scorrimento` removes its inline declaration on unmount, because an inline custom property on `<html>` beats a stylesheet rule and the room would otherwise inherit the home's last scroll colour. Change one, re-check the other.
- **Nothing painted with `--ground` may carry a `background-color` transition.** This is the inverse of an earlier rule, and the inversion is the fix. `--ground` is rewritten every animation frame while the home scrolls, so a transition on top of it can only lag the scroll: the old `0.9s` on `body` and `#margine`, combined with a ramp squeezed into the last 30% of each threshold, is what made the colour appear to snap at a y value. The ramp now runs the full height of a threshold (`Scorrimento.tsx`) and every surface takes the per-frame value directly. A new surface that reads `--ground` gets no transition, or it drags behind the others.
- **`ViewTransition` is typed in `src/types/view-transition.d.ts`, not by `@types/react`.** Next.js bundles a React that exports it; the public types have not caught up. Delete that file once they do — leaving it will produce a duplicate-declaration error, which is the intended alarm.

- **The sticky caption needs an explicit height on `.soglia`, `align-self: start` and a `margin-bottom` on `.testo`, and losing any of the three fails silently.** A sticky element's travel is its containing block's height minus its own margin box. The height on the threshold is the box the caption stops inside — without it the containing block collapses to the content and all six captions pile up at the top of the page, which looks like a z-index bug and is not one. Without `align-self: start` the caption stretches to the full row and drags ~200px of empty, clickable nothing below the text. The `margin-bottom: calc(var(--alt) * 0.45)` is what makes it let go halfway down its photograph; `45%` would be wrong, because percentage margins resolve against inline size.
- **The home's scroll on the way back is recorded at click time, not at unmount, and the «Torna» link carries `scroll={false}`.** Coming back from a room the home must land at the exact height it was left at: that is what makes the return the reverse of the entrance — the photograph shrinks back into the title that opened it, and that title only exists at that height. Two things fight it. First, a `useLayoutEffect` cleanup in `Scorrimento` is *too late*: by the time React unmounts the home, the arriving room has already run `Cima`'s `scrollTo(0)` and `scrollY` reads 0 — measured, the cleanup recorded 0 every time and the return landed at the top. The height is therefore taken by a capturing `click` listener on `.nastro`, while the page is still standing where it is, and handed over through `src/lib/provenienza.ts`. Second, without `scroll={false}` Next scrolls to the `#slug` fragment *after* the commit, undoing the restore and letting the page visibly settle once the transition has ended. The `href` keeps its fragment regardless: with no JavaScript it is the only thing that leads back to the right threshold.
- **Browser «back» out of a room gets no morph, and that is Next's, not ours.** `ACTION_RESTORE` — the action a popstate dispatches — is deliberately kept off the slow path, and React never opens a view transition for it; verified in a production build, `document.startViewTransition` is simply not called. The scroll still lands exactly where it was, because that part is ours. Do not go looking for a bug in the transition code when the browser's own back button cross-fades.

- **On the home, the link is the title and nothing else, and the photograph sits outside it.** The custom cursor turns into a disc meaning "you can enter here"; stretched over a threshold 80vh tall that would be true for one line and false for everything else, and over the photograph it would replace the mark that says "this is a photograph". The phone has no cursor and needs a big target, so there `.soglia-a::after` stretches the same single link over the whole threshold — a pseudo-element rather than a link wrapping everything, so the accessible name stays the title instead of growing to include every word inside.

- **`ScriptFreschezza.tsx` may touch only `element.style`.** It is the parse-time inline script that hides past market dates before first paint, and it is rendered inside the `dove` room right after the markup it touches — not in the layout, which would run it before the rows exist. Never an attribute, never `textContent`, never a class: anything else is a hydration mismatch, and React 19 answers one by discarding the server HTML for that subtree and rebuilding it, which silently undoes the script. Two rounds of debugging went into finding that.
- **`.ics` `DTEND` is exclusive; schema.org `endDate` is inclusive.** A market running 2026-09-19–20 gets `DTEND;VALUE=DATE:20260921` in the `.ics` (the day *after* the last day, per RFC 5545) but `endDate: "2026-09-20"` in the JSON-LD (the last day itself, per schema.org). They differ by one day **on purpose** — collapsing them to match would make one of the two wrong. `tests/ics.test.ts` ("scrive un evento di due giorni con DTEND al terzo giorno") and `tests/jsonld.test.ts` ("un evento lungo ha endDate all'ultimo giorno, non al giorno dopo") both pin this; if you ever see them disagree about what "the end date" should be, that is the asymmetry, not a bug.
- **Never compute "today" with `toISOString()`.** If you need "today" in TypeScript, use `oggiRoma()` from `src/lib/date.ts`. `toISOString()` reports UTC, and Rome is UTC+1/+2 — between midnight and 1am (winter) or 2am (summer) local time, `toISOString()` still names the previous day, which would make the freshness script hide today's market as if it had already passed. Note that `ScriptFreschezza.tsx` itself does **not** call `oggiRoma()` — it deliberately duplicates the same Rome-timezone logic inline, in plain ES5, because it must run before any bundle (and therefore before `src/lib/date.ts`) loads. That duplication is intentional, not a missed import; keep both copies and their tests in sync if the Rome-timezone logic ever changes.
- **The English date format is pinned to Bun's bundled ICU, and that pin is deliberate.** `Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" })` yields `"Thursday 24 September"` under Bun's ICU and `"Thursday, 24 September"` (with a comma) under Node's full-ICU. `tests/date.test.ts` asserts the no-comma Bun form. If a Bun upgrade changes the bundled CLDR data, that test failing is the alarm working as designed, not a false positive — it means the live site's date labels just changed shape. Fix it by updating the expected string to match the new correct output, or by composing the label from `formatToParts` if the format starts churning across Bun versions. Never "fix" a failure here by loosening or deleting the assertion — that turns off the alarm instead of answering it.
- **Bracketed placeholders (e.g. `[EMAIL DA CONFERMARE]`) are load-bearing.** They mark a fact the client has not yet supplied. Never invent a value to make one go away — leave the placeholder and note what is still needed. (None remain in this repo as of Task 12; every open fact was resolved. If you introduce new client-facing copy before all facts are in, use this convention rather than a guess.)
- **The two inks are measured, and `--color-sp-tenue` (`#5C5247`) is the tight one.** It gives 4.51:1 on the worst of the seven grounds (`--color-sp-animali`, `#DBC3AC`), which clears WCAG AA with nothing to spare. Lightening it, or darkening any ground, breaks contrast on pages nobody will think to re-check. Re-measure against **all seven** grounds before touching either. The temp site's palette (`terracotta`, `rosa`, `glassa`) is documented in `docs/brand.md` and is not used here.

## Changing the client's words or photographs

Everything she can change lives in `src/content/collezioni.ts` — collection names, the one-line captions, the prose of each room, the piece names, the encounters. Photographs go in `public/opere/` and are referenced from the same file. Inline emphasis uses `*corsivo*` / `**rilievo**` / `\n`; see `src/lib/testo.tsx`. No HTML in the strings, so no `dangerouslySetInnerHTML`.

## Adding a market date

See `docs/content-editing.md`. It is one edit to `src/content/mercati.ts` plus a push. (The page that displays them is not part of this design yet — the edit still feeds the `.ics` files and the JSON-LD.)

## Learned Patterns

| Pattern | Reference | Date |
| ------- | --------- | ---- |
| `biome migrate --write` on this Biome version (2.5.10) rewrote `linter.rules.recommended: true` to `linter.rules.preset: "none"`, which silently disables the entire recommended ruleset — verified empirically, an unused variable stopped being flagged. The correct migration is `preset: "recommended"`. Never trust a codemod's output without re-running the check it claims to fix. | Task 12 | 2026-08-26 |
