# The home page, rebuilt as *il nastro* (the ribbon)

**Date:** 2026-09-20
**Status:** approved in brainstorm, ready for implementation planning
**Branch:** `feat/sito-definitivo`
**Supersedes:** the `.c1`–`.c6` home compositions in `src/app/globals.css`

## 1. Problem

The home reads as six unrelated sections stacked on top of each other. The
client (and author) named it precisely:

1. **It reads "sectiony".** Continuity is nearly dead; rhythm markers make it
   worse, not better.
2. **Space is used oddly.** The whitespace that should give breath instead
   boxes each section off. `.respiro { height: 9vh }` is a literal "this is
   over" marker between every pair.
3. **No vertical flow.** Each section reads horizontally and stops. Nothing
   links one to the next.
4. **The colour change is not progressive.** It snaps at a y value instead of
   ramping with the scroll.
5. **The bands behind the titles read as a patch,** not a decision.

Underlying all five: the six compositions have six arbitrary photo widths
(78/58/72/50/86/66%) and six arbitrary heights with nothing regular to depart
from, so they read as six attempts rather than six decisions.

**Constraint on the cure:** the answer is *not* to overdo the opposite. No
parallax, no motion for its own sake. The thesis stands — the design is severe,
the warmth is the content.

## 2. The direction: *il nastro*

Three directions were prototyped and compared in the browser (`.design/`,
gitignored). The chosen one is **C, the ribbon**, decided on the question *what
crosses the boundary between sections?* — for C, the answer is **the
photographs themselves**.

One channel of photographs, at constant x, running down the page without ever
stopping. All six the same width and the same height, separated by `1.1rem` — a
hairline of ground colour, not a gap. The continuity is not a drawn sign; it is
physical. The variety moves entirely onto the text, which sits in the left
column at different heights and indents, sticks while its photograph passes, and
releases halfway through it.

Direction A (*il filo*, a continuous thread down the rail) was prototyped and
**rejected** after seeing it: the rail's own `border-right` already does that
work, and a second line two centimetres away reads as an error.

### Settled values

Every one of these was chosen by the client against a live prototype with a dev
menu, not from a description.

| Decision | Value |
| --- | --- |
| Channel width | 60% of the content column |
| Photo heights | **all equal**, ~80vh (they are the content) |
| Gap between photos | 1.1rem |
| Channel's left edge | regular — no photo narrows |
| Text rhythm | `pari` — one type size throughout; only *where* it falls varies |
| Sticky caption | yes |
| Caption release | **halfway** down its own photograph |
| Text alignment in its column | `misto` — per-threshold indent (unchanged from the prototype default) |
| Opening screen | full height (`100svh`), the sentence and nothing else |
| Scroll glyph | a vertical arrow, "Scorri" set vertically beside it |
| Roman numerals | kept, moved into the caption block |
| Thread down the rail | **off** |
| Colour change | full ramp across the whole threshold |

**One thing the client did not answer:** the text alignment comparison
(`misto` / `sinistra` / `centro` / `destra`). The value in effect in the
prototype he called final is `misto`, so `misto` ships. It is a single CSS
custom-property switch (§4.2) and can be flipped in one line after he sees it
in the real page.

## 3. What dies

Deleting is most of this change.

- **`.respiro`** — the 9vh divider between thresholds, in `Casa.tsx` and
  `globals.css`. The 1.1rem row gap replaces it.
- **The six `.c1`–`.c6` compositions** (~105 lines of `globals.css`) — replaced
  by one grid plus six two-line offsets.
- **The bands behind the titles** (`.soglia .titolo .linea` background, padding
  and negative margins). In the ribbon no title ever crosses a photograph, so
  the contrast device they existed for has no job. `righe()` in
  `src/lib/testo.tsx` stays — multi-line titles still need one block per line —
  but `.linea` becomes `display: block` and nothing else.
- **The `--ground` transition** on `body` and `#margine` (§4.4).

This retires two "rules that will bite you" in `AGENTS.md`; both entries must be
rewritten, not merely deleted (§6).

## 4. The design

### 4.1 Structure

```
main#contenuto
  section.apertura            100svh, flex-centred, the sentence + p.scorri
  div.nastro                  grid: minmax(0,1fr) 60%, column-gap 3.2rem, row-gap 1.1rem
    section.soglia.n1         grid-column 1/-1, subgrid   [id, data-fondo, data-sez]
      a.soglia-a              grid-column 1/-1, subgrid, height: var(--alt)
        div.testo             column 1, position: sticky
          p.numero            roman numeral, aria-hidden
          h2.titolo           <ViewTransition name="titolo-{slug}">
          p.riga
        figure                column 2, height: var(--alt)
                              <ViewTransition name="eroe-{slug}">
    section.soglia.n2  …
```

Two nested subgrids. The section carries the identity (`id`, `data-fondo`,
`data-sez`) because `Scorrimento` reads its rect for the colour ramp and the
`IntersectionObserver`; the link carries the height because that is the box the
sticky caption must stop inside.

**Why the link wraps the whole threshold.** Today it wraps figure + title only,
with `.numero` and `.riga` outside it. In the ribbon the caption block must be
one sticky box containing all three, and it sits in a different grid column from
the photograph — so a single link can only hold both halves by wrapping
everything. This is deliberate and preserves the existing rule of **one link per
threshold, not two pointing at the same place** (two identical voices in a
screen reader are noise). Consequence: the accessible name becomes title + riga
+ image alt, which is longer than today but still describes exactly what the
link opens. The whole band becoming clickable is right for the ribbon.

`display: contents` on the `<a>` was considered and rejected: it is unnecessary
here (nested subgrid does the job) and its accessibility history is not worth
inheriting.

### 4.2 Measures

```css
.nastro {
  --alt: 80vh;              /* one height for all six */
  --canale: 60%;
  --salto: 1.1rem;
}
```

The six offsets are the only per-threshold values left, and they act against a
constant right edge, a constant left edge and a constant height:

| | `--quota` (top offset) | `--rientro` (left indent) |
| --- | --- | --- |
| I tettazze | 5vh | 0 |
| II foglie | 2vh | 20% |
| III animali | 7vh | 7% |
| IV ciondoli | 1vh | 28% |
| V chi-sono | 5vh | 3% |
| VI dove | 3vh | 16% |

Alignment switch (§2): `misto` honours `--rientro`; `sinistra` / `centro` /
`destra` zero it and set `text-align` plus the matching `margin-inline` on
`.linea`, `.riga` and `.numero`.

**The right edge of the channel never moves.** This is what holds the ribbon
together, and it is also what guarantees by construction that no photograph can
ever collide with the caption — verified numerically in the prototype (caption
right edge 640px against photo left edges 691–873px across all six).

### 4.3 The sticky caption and its release

```css
.soglia .testo {
  position: sticky;
  top: 30vh;
  margin-top: var(--quota);
  padding-left: var(--rientro);
  margin-bottom: calc(var(--alt) * 0.45);   /* release halfway */
}
```

A sticky element's travel is *its containing block's height minus its own margin
box*. Giving it 45% of the photo height as bottom margin is therefore what makes
it let go halfway down: the last half of each photograph is looked at alone.
Percentage margins resolve against inline size, hence `calc()` on the vh value
rather than `45%`.

**This is why `a.soglia-a` carries an explicit height.** In the first prototype
the threshold was `display: contents`, which left the caption no box of its own;
all six stuck to the top of the whole ribbon and piled up at 34vh. Verified and
fixed: tops went from `306, 306, 306, …` to `-1436, -780, 83, 270, 931, 1723`.

### 4.4 The colour ramp (the one real bug)

`src/components/Scorrimento.tsx` holds `CODA = 0.3`: the ground stays flat for
70% of a threshold, then races through the whole colour change in the last 30%.
On top of that `body`, `#margine` and `.linea` each carry a `0.9s`
`background-color` transition, which smears the change further. Together they
are exactly the "flashy at a y value" the client named.

Fix, in two parts:

1. `t = p` — the ramp runs the full height of the threshold. `CODA` and its
   conditional go.
2. **Remove the `0.9s background-color` transition** from `body` and `#margine`.
   With a per-frame `rAF` write, a transition can only lag behind it. The ramp
   is continuous across a boundary by construction: when `corrente` advances,
   `t` resets to 0 and `mescola(next, next+1, 0) === next`, which is exactly
   where the previous lerp ended.

The room pages are unaffected — their background is a fixed colour server-
rendered in a `<style>` tag and never animates.

### 4.5 The opening and the scroll glyph

`.apertura` becomes `min-height: 100svh`, flex column, centred. `svh` and not
`vh`: on a phone `vh` ignores the URL bar and the glyph would sit below the fold
on the one screen whose whole job is to say "this page scrolls".

The glyph, bottom-left, on the same left edge as the sentence:

- a **vertical hairline stem**, ~4.6rem, `var(--peso)` wide, in `--tenue`;
- a **chevron** at its lower end, pointing down;
- the word **"Scorri" / "Scroll" set vertically** (`writing-mode: vertical-rl`)
  to the right of the stem, in the `.occhiello` style. The site already has one
  vertical word — the wordmark in the rail — so this is its echo, not a new
  idea;
- the eye-catcher: a short **dark sliver travelling down the stem**, above the
  word, on a ~2.6s loop.

`aria-hidden="true"` on the whole thing: "scroll down" is not information for
someone who is not scrolling. Killed by `prefers-reduced-motion: reduce`.

It fades out over the first 260px of scroll, written from the `rAF` loop that
already exists in `Scorrimento` — no new listener.

New dictionary entry: `voci.scorri = { it: "Scorri", en: "Scroll" }`.

### 4.6 The index becomes a way in, not just a way down

Today `#margine .indice a` are real anchors (`href="#foglie"`) and the browser's
`scroll-behavior: smooth` does the rest. The client wants: **smooth-scroll to
the threshold, then automatically enter the room.**

The scroll is not cosmetic — it is load-bearing. React strips
`view-transition-name` from any element off-screen at commit time
(`measureInstance().view` in `react-dom`), so entering the room from a scroll
position where the threshold is not on screen would silently downgrade the morph
to a cross-fade. Scrolling first is what keeps the animation.

In `Scorrimento` (the home's existing client island), a delegated click handler
on `#margine .indice`:

1. Ignore modified clicks and non-primary buttons — cmd-click must still open a
   tab, and the `href` must keep working with JS off.
2. `preventDefault()`, `scrollIntoView({ block: "start" })` on the threshold —
   `instant` under `prefers-reduced-motion`, `smooth` otherwise.
3. Wait for the scroll to settle, then `.soglia-a.click()` — a real click event,
   so it takes the same React/Next path a user click takes.
4. If the threshold is already in position, skip straight to step 3.

Settling is detected with the `scrollend` event, with a `setTimeout` safety net
(and a plain timeout where `scrollend` is unsupported — Safari < 18.2).

The `href="#slug"` stays in the markup: with JavaScript off, the index still
scrolls, which is the correct degraded behaviour.

### 4.7 Mobile (≤880px)

The two columns collapse to one, as the six compositions already do today:

- photograph full width, one height for all six (~64svh);
- caption static below its photograph — no sticky, no indent, left-aligned;
- `--salto` grows to a real gap, since photographs edge-to-edge on a phone read
  as a single smear;
- opening at `86svh` so the bottom bar and the glyph both fit;
- the `↗` affordance on the last title line (`@media (hover: none)`) stays: it
  is the only thing that says the threshold opens where there is no cursor.

## 5. What must not regress

These are acceptance criteria, and every one is to be checked **by screenshot in
a real browser**, not by reading the CSS.

1. **Viewports.** 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 360×640.
   No horizontal scroll, no photograph overlapping a caption, no caption
   clipped.
2. **Home → room morph** stays as smooth as it is today, **from any scroll
   position**, including a threshold only partly in view. If a partly-visible
   figure loses its `view-transition-name`, the mitigation is the same
   scroll-then-click used by the index (§4.6), applied to `.soglia-a`.
3. **Room → home** returns to the right threshold with the photograph already
   in place (`Scorrimento`'s `useLayoutEffect` hash handling, plus a
   `scroll-margin-top` small enough that the whole photograph lands in view).
4. **Room → room** still cross-fades via `provenienza` — untouched, but verify.
5. **Colour ramp** is continuous through all six thresholds and across every
   boundary, with no rectangle of a different colour anywhere (the `#margine`
   surface is the one to watch).
6. **Lighthouse**: performance, accessibility, best practices and SEO all held
   at their current level. Accessibility specifically: one link per threshold,
   focus visible on it, the index still keyboard-reachable and its
   `aria-current` still correct.
7. `bun run lint`, `bunx tsc --noEmit`, `bun test`, `bun run build` all clean.

**Image loading.** With a 100svh opening, no photograph is above the fold any
more, so `subito={i === 0}` preloads something nobody sees yet and competes with
the font. It goes; lazy loading with Chrome's own margin covers it. LCP becomes
the `h1`, which is to be confirmed by Lighthouse rather than assumed.

`sizes` on the threshold images changes from the default `80vw` to
`(max-width: 880px) 100vw, 60vw`.

## 6. Documentation to update

`AGENTS.md` carries two rules that this change makes false. Both are rewritten,
not deleted — the reasoning is why the new shape is what it is:

- **"Each home title line carries a band of the ground colour"** → becomes: the
  bands existed because the title crossed the photograph; in the ribbon it never
  does, and the band is gone. Keep the note that gradients and `mix-blend-mode`
  were tried and rejected, so nobody re-proposes them for the room pages.
- **"Everything painted with `--ground` needs the same transition"** → inverts:
  `--ground` is written every frame and nothing that reads it may carry a
  `background-color` transition, or it lags the scroll.

New rule to add: **the caption's sticky release is `margin-bottom` on the sticky
element, against an explicit height on `.soglia-a`.** Removing either height or
margin does not fail loudly — it silently piles all six captions at the top of
the ribbon.

## 7. Out of scope

- **The photography brief.** The ribbon *is* a decision about photography — one
  ground, one light, margin around the subject, an agreed palette — because
  photographs at 1.1rem apart compare themselves directly. The client is
  writing that sheet himself.
- English copy, new content, the room pages, the market calendar.
- Any animation library. Motion stays: View Transitions, CSS, and the one
  existing `rAF` loop.
