# La pagina del calendario (`/admin`) — come si accende

La pagina con cui la cliente aggiunge e cambia le date da sola. Il sito resta
statico: la pagina è una pagina della build, e l'unica cosa che gira su un
server è una Pages Function (`functions/api/`) che fa due cose — controlla chi
è entrato e scrive `src/content/calendario.json` nel repository con l'API di
GitHub. Quel commit fa partire la pubblicazione come qualunque altro: dal
salvataggio al sito passano circa 3 minuti, e la pagina lo dice mentre succede.

```
telefono ──► Cloudflare Access (email + codice) ──► /admin (statica)
                                                     │  fetch /api/calendario
                                                     ▼
                                     Pages Function: verifica il token di Access,
                                     applica la modifica, valida, commit su GitHub
                                                     │
                                                     ▼
                              GitHub Actions: test, build, deploy (≈ 3 min)
```

Perché un commit e non un database (KV/D1): il sito resta interamente
prerenderizzato — elenco, `.ics`, JSON-LD — senza una seconda copia dei dati
da tenere allineata, e la storia di git è l'«annulla». Il prezzo sono i 3
minuti.

## Da fare una volta (serve un account con i permessi: solo Enea)

### 1. Il token GitHub

github.com → Settings → Developer settings → **Fine-grained tokens** → Generate:

- Resource owner: `sandupottery`; Repository access: **solo** `sandupottery/website`
- Permissions → Repository: **Contents: Read and write**, **Actions: Read-only**
- Scadenza: la più lunga concessa. Segnarsi la data: quando scade, la pagina
  risponde «GitHub non risponde (401)» e basta rigenerarlo (passo 4).

I commit della pagina risultano fatti dal proprietario del token, che riceve
anche l'email di GitHub se una pubblicazione fallisce.

### 2. Cloudflare Access (gratis fino a 50 persone)

Menu della dashboard verificati sulla documentazione di Cloudflare a ottobre
2026; se cambiano ancora, i nomi delle cose restano questi.

1. dash.cloudflare.com → **Zero Trust**. La prima volta: nome del team (es.
   `sandupottery`) e piano **Free** — chiede una carta anche per il gratuito,
   non addebita nulla.
2. **Integrations → Identity providers → Add new identity provider →
   One-time PIN**. Non c'è più di serie: senza, lei non ha modo di entrare.
3. **Access controls → Applications → Create new application → Self-hosted
   and private**:
   - nome `Calendario`;
   - **Add public hostname** due volte: `anteprima` · `sandupottery.com` ·
     path `admin`, e `anteprima` · `sandupottery.com` · path `api`;
   - Access policies → nuova policy `Calendario`: Action **Allow**, Include →
     **Emails** → la sua email e la tua;
   - Identity providers: **One-time PIN**;
   - Session Duration: **1 month** → **Create**.
4. Applications → **Configure** su `Calendario` → **Additional settings** →
   copiare l'**Application Audience (AUD) Tag**. Il dominio del team è in
   **Settings**.

Se la dashboard non lascia due percorsi nella stessa applicazione, se ne fa
una seconda identica per `api`, e in `ACCESS_AUD` vanno entrambi i tag
separati da una virgola.

### 3. Le variabili del progetto Pages

Workers & Pages → `sandupottery-anteprima` → **Settings → Variables and
Secrets → Add** (ambiente Production):

| Nome | Valore | Tipo |
| --- | --- | --- |
| `ACCESS_TEAM` | `<team>.cloudflareaccess.com` | Text |
| `ACCESS_AUD` | l'AUD tag del passo 2 (più d'uno: separati da virgole) | Text |
| `GITHUB_TOKEN` | il token del passo 1 | **Encrypt** |
| `GITHUB_BRANCH` | `feat/sito-definitivo` (poi `main`) | Text |

`GITHUB_REPO` vale `sandupottery/website` se non lo si scrive.
**Non** impostare mai `SVILUPPO` qui: spegne Access e GitHub, esiste solo per
la prova in locale.

### 4. Una pubblicazione

Le variabili valgono dal deploy successivo: basta un push sul ramo (o
«Run workflow» su *Anteprima*). Poi aprire
`https://anteprima.sandupottery.com/admin`, entrare con l'email, e aggiungere
e togliere una data di prova.

## La sicurezza, in breve

- Access sta davanti a `/admin` e `/api`. Ma il progetto risponde anche su
  `sandupottery-anteprima.pages.dev`, dove Access non c'è: per questo la
  Function **non si fida di essere stata raggiunta** e verifica da sé il token
  firmato di Access (firma RS256 sulle chiavi del team, destinatario, emittente,
  scadenza). Senza `ACCESS_TEAM` e `ACCESS_AUD` non entra nessuno.
- La pagina `/admin` in sé non contiene dati: senza entrare mostra soltanto
  «Entra».
- Ogni modifica viene validata con le stesse regole dei test
  (`src/lib/calendario.ts`) prima del commit: un dato che farebbe fallire la
  build non arriva nel repository.
- Il repository è pubblico: nei messaggi di commit non finisce l'email di chi ha
  modificato.

## Quando il sito definitivo andrà su `main`

1. In Access aggiungere le destinazioni `sandupottery.com/admin` e
   `sandupottery.com/api` (o farne un'applicazione nuova, e cambiare `ACCESS_AUD`).
2. Sul progetto Pages di produzione, le stesse variabili, con `GITHUB_BRANCH=main`.
3. In `release.yml` aggiungere `actions/checkout` prima del deploy, come in
   `anteprima.yml`: senza, le Functions non vengono pubblicate.

## Provare in locale

```bash
bun run build
bunx wrangler@4 pages dev out --binding SVILUPPO=1 --port 8788
# http://localhost:8788/admin
```

Con `SVILUPPO=1` non c'è Access e il calendario vive in memoria: si può
aggiungere e togliere senza toccare il repository, e la «pubblicazione» risulta
fatta dopo 8 secondi.
