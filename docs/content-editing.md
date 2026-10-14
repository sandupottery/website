# Le date dei mercatini

## Per Stefania: dal telefono

1. Apri **anteprima.sandupottery.com/admin** (conviene salvarla nella schermata
   Home: dal browser, «Condividi» → «Aggiungi a Home»).
2. La prima volta scrivi la tua email: ti arriva un codice, lo inserisci e sei
   dentro. Il telefono se lo ricorda per un mese.
3. **Aggiungere una data:** «+ Aggiungi una data» → scegli il giorno → tocca uno
   dei posti dove sei già stata (oppure scrivi città e luogo) →
   «Aggiungi al calendario».
4. **Cambiare o togliere una data:** toccala nell'elenco. In fondo trovi anche
   «Stesso posto, un'altra data», per ripetere un mercato senza riscriverlo.
5. **I mercati di ogni mese** (Bergamo Alta, piazza Diaz…) stanno nella scheda
   «Ogni mese»: si sceglie la settimana, il giorno e i mesi, e sotto compaiono le
   prossime date per controllare.

Dopo ogni salvataggio il sito si aggiorna da solo in circa 3 minuti: in cima
alla pagina vedi «Il sito si aggiorna…» e poi «✓ Il sito è aggiornato». Puoi
anche chiudere la pagina subito. Le date passate spariscono dal sito da sole.

## Per chi tiene il codice

Le date stanno in `src/content/calendario.json`, che di norma scrive la pagina
`/admin` (vedi `docs/admin.md`). Si può anche modificare a mano, con due
regole:

- La forma del file è quella di `serializza()` in `src/lib/calendario.ts`
  (tabulazioni, campi in quell'ordine, mercati ordinati). Il test
  «è scritto nella forma canonica» lo controlla; per rimetterlo in forma:
  `bun -e 'import {serializza} from "./src/lib/calendario"; import d from "./src/content/calendario.json"; await Bun.write("src/content/calendario.json", serializza(d))'`.
- Biome non lo formatta, di proposito: se lo facesse, ogni salvataggio della
  pagina farebbe fallire il lint.

Un mercato:

```json
{
	"id": "2027-03-14-bergamo-cavour",
	"inizio": "2027-03-14",
	"fine": "2027-03-15",
	"citta": "Bergamo",
	"luogo": "Bergamo centro, piazza Cavour",
	"dettaglio": "facoltativo",
	"indirizzo": "facoltativo: se manca vale «luogo, città»"
}
```

Un mercato fisso: `settimana` è 1–4 o -1 (l'ultima), `giorno` è `MO`…`SU`,
`mesi` 1–12. Le due frasi del sito, la RRULE dei `.ics` e il primo giorno si
ricavano da questi tre campi.

Poi `bun test` (valida il file) e `bun run build`.
