/**
 * Il contenuto del sito, in una struttura sola.
 *
 * Tre consumatori leggono da qui: la home (soglie), le stanze (prosa, pezzi,
 * incontri, mercatini, contatti) e i metadati delle pagine. Tutto quello che
 * la cliente cambierà sta in questo file e in nessun altro.
 *
 * **La prosa è sua.** Salvo dove indicato, i paragrafi vengono dai cinque
 * testi che Stefania ha scritto e dalle tre telefonate registrate: sono
 * ricuciti e accorciati, non riscritti. Quando c'è da tagliare si taglia una
 * frase intera — non si parafrasa, perché qui la voce è il contenuto.
 * Restano invece di chi scrive il codice, e vanno considerati segnaposto:
 * l'apertura della home, la `riga` di ogni soglia, i nomi e gli anni dei pezzi.
 *
 * I prezzi sono `[prezzo]` di proposito: è un dato che la cliente non ha
 * ancora dato. Vedi la regola sui segnaposto in AGENTS.md.
 *
 * Per la marcatura `*corsivo*` / `**rilievo**` / `\n` vedi `src/lib/testo.tsx`.
 */

export type Lingua = "it" | "en";
export type Testo = Record<Lingua, string>;

/**
 * `fuoco` è l'`object-position` del ritaglio, e si mette solo quando serve.
 * Le fotografie dell'archivio sono quasi tutte verticali mentre alcune
 * cornici del disegno sono orizzontali: il ritaglio centrale a volte taglia
 * via il soggetto. Con questo si sposta il fuoco senza toccare il CSS —
 * utile soprattutto quando la cliente sostituirà le immagini.
 */
export type Foto = { foto: string; alt: Testo; fuoco?: string };

export type Pezzo = {
	foto: string;
	nome: Testo;
	anno: string;
	fuoco?: string;
};

/**
 * `mercati` e `contatti` non portano testo: leggono da `src/content/mercati.ts`,
 * `ricorrenze.ts`, `sito.ts` e `dizionario.ts`. Esistono come blocchi perché
 * così «Dove mi trovi» è una stanza come le altre — stessa rotta, stesso
 * margine, stesso giro — invece di una pagina a parte con una sua
 * impaginazione da mantenere.
 */
export type Blocco =
	| { tipo: "prosa"; etichetta: Testo; paragrafi: Testo[] }
	| { tipo: "pezzi"; pezzi: [Pezzo] | [Pezzo, Pezzo] }
	| { tipo: "mercati" }
	| { tipo: "contatti" };

export type Incontro = { testo: Testo; chi: Testo };

/**
 * Una stanza. Si chiama `Collezione` per storia: due delle sei — «Chi sono» e
 * «Dove mi trovi» — non sono collezioni ma si comportano in tutto come tali, e
 * tenerle nello stesso elenco è ciò che fa funzionare da solo l'indice, il giro
 * del margine in basso, la sitemap e i parametri statici.
 *
 * L'ordine dell'elenco è l'ordine del percorso, e il numero romano sopra ogni
 * soglia viene da lì: non è un dato da scrivere, è la posizione.
 */
export type Collezione = {
	slug: string;
	/** Il titolo grande. `*…*` è la parte in corsivo, `\n` il punto di rottura. */
	titolo: Testo;
	/** Il titolo in una riga corta: l'indice del margine, su telefono. */
	breve: Testo;
	/** La riga sotto il titolo in home: una frase, non un sommario. */
	riga: Testo;
	/** La frase d'apertura della stanza, accanto al titolo. */
	guida: Testo;
	/** Il fondo verso cui la home sfuma mentre si scorre questa soglia. */
	fondo: string;
	soglia: Foto;
	eroe: Foto;
	blocchi: Blocco[];
	incontri?: Incontro[];
};

const PREZZO = "[prezzo]";
export const prezzo = PREZZO;

export const collezioni: readonly Collezione[] = [
	{
		slug: "tettazze",
		titolo: { it: "Le *Tettazze*", en: "The *Tettazze*" },
		breve: { it: "Tettazze", en: "Tettazze" },
		riga: {
			it: "Tutte diverse, perché noi siamo tutte diverse.",
			en: "All different, because we are all different.",
		},
		guida: {
			it: "Una collezione di tazze che ho creato per le donne. È un lavoro sul corpo della donna, e apre a molteplici argomenti, importanti per me.",
			en: "A collection of cups I made for women. It is a work about a woman's body, and it opens onto a great many subjects that matter to me.",
		},
		fondo: "#DCE3DD",
		soglia: {
			foto: "/opere/tettazze-scalogno.jpg",
			alt: {
				it: "Un boccale smaltato di verde, con il seno modellato sopra, accanto a uno scalogno",
				en: "A green-glazed mug with a breast modelled on it, beside a shallot",
			},
		},
		eroe: {
			foto: "/opere/tettazze-margherite.jpg",
			alt: {
				it: "Due tazze bianche affiancate, con due margherite posate davanti",
				en: "Two white cups side by side, with two daisies laid in front of them",
			},
		},
		blocchi: [
			{
				tipo: "prosa",
				etichetta: { it: "Il lavoro", en: "The work" },
				paragrafi: [
					{
						it: "In primo luogo le Tettazze sono tutte diverse come forma. La forma della tazza è la forma del corpo, e la forma del seno, che è modellato sopra ogni tazza. **Sono tutte diverse, perché noi siamo tutte diverse.**",
						en: "First of all, the Tettazze are all different in shape. The shape of the cup is the shape of the body, and the shape of the breast, which is modelled onto every cup. **They are all different, because we are all different.**",
					},
					{
						it: "Il nostro mondo porta dei modelli corporei spesso lontani dalla realtà. Quotidianamente ci vengono proposti corpi magri, dove la magrezza spesso è anoressia, dove l'assenza di rughe ignora lo scorrere del tempo, dove l'essere muscolosi è fondamento per sentirsi uomo.",
						en: "Our world carries models of the body that are often far from real. Every day we are shown thin bodies, where thinness is often anorexia, where the absence of wrinkles ignores the passing of time, where being muscular is the ground for feeling like a man.",
					},
					{
						it: "In mezzo a questa continua sollecitazione di immagini e messaggi, il fermarsi a guardare come siamo credo sia un passo verso il nostro benessere. Le Tettazze innanzitutto esistono per farci pensare al nostro corpo, e magari ci propongono un lavoro di auto accettazione: *con ironia e leggerezza*.",
						en: "In the middle of this constant pressure of images and messages, stopping to look at how we are is, I believe, a step towards our own wellbeing. The Tettazze exist first of all to make us think about our body, and perhaps they offer us a work of self-acceptance: *with irony, and lightly*.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/tettazze-scalogno.jpg",
						nome: { it: "Boccale, smalto verde", en: "Mug, green glaze" },
						anno: "2023",
					},
					{
						foto: "/opere/tettazze-smalti.jpg",
						nome: { it: "Tazzine, smalti diversi", en: "Small cups, assorted glazes" },
						anno: "2024",
					},
				],
			},
			{
				tipo: "prosa",
				etichetta: { it: "Le reazioni", en: "The reactions" },
				paragrafi: [
					{
						it: "Per me è sempre un'occasione di riflessione osservare le reazioni delle persone che guardano per la prima volta queste tazze. Le reazioni sono molto diverse: **potrei scrivere un libro parlando di questo**.",
						en: "Watching how people react the first time they see these cups is always, for me, an occasion to think. The reactions are very different: **I could write a book about this**.",
					},
					{
						it: "Il più delle volte aprono un sorriso; alcune volte è un sorriso di divertimento, altre volte è un sorriso di imbarazzo. Chi si imbarazza di più sono le donne, e questo mi fa molto pensare. Noto come il seno sia spesso legato solo alla sessualità: riconosco come questo argomento sia ancora un tabù, e ci imbarazzi.",
						en: "Most of the time they open a smile; sometimes it is a smile of amusement, sometimes one of embarrassment. The ones who are most embarrassed are women, and that makes me think a great deal. I notice how the breast is so often tied to sexuality alone: I recognise that this is still a taboo, and that it embarrasses us.",
					},
					{
						it: "Quando una donna ha un figlio piccolo e lo allatta, il seno è veicolo di nutrimento, esprime amore incondizionato e cura. Quando questa fase passa e il figlio cresce, noi madri siamo capaci ancora di comunicare ai nostri figli la stessa percezione del corpo femminile, nella sua semplice naturalità?",
						en: "When a woman has a small child and feeds him, the breast is a vehicle of nourishment; it expresses unconditional love, and care. When that phase passes and the child grows, are we mothers still able to pass on to our children the same sense of a woman's body, in its plain naturalness?",
					},
					{
						it: "Le Tettazze sono semplicemente un oggetto: una tazza con due seni sopra. L'equazione seno = sesso può essere automatica, ma è riduttiva, e descrive una società che si rifà a un modello maschile. **Posso dire patriarcale?**",
						en: "The Tettazze are simply an object: a cup with two breasts on it. The equation breast = sex may be automatic, but it is reductive, and it describes a society modelled on men. **May I say patriarchal?**",
					},
					{
						it: "Così le Tettazze aprono anche al grande tema della violenza sulle donne, perché l'educazione al rispetto del corpo è anche educazione al rispetto di ogni individuo.",
						en: "And so the Tettazze open onto the great subject of violence against women too, because teaching respect for the body is also teaching respect for every person.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/tettazze-fiori-campo.jpg",
						nome: { it: "Boccale, fiori di campo", en: "Mug, wild flowers" },
						anno: "2024",
					},
				],
			},
			{
				tipo: "prosa",
				etichetta: { it: "Fiore e cuore", en: "Flower and heart" },
				paragrafi: [
					{
						it: "All'interno della collezione c'è una serie che ho chiamato Tazze Fiore e Tazze Cuore. Fra le donne c'è anche chi incontra il cancro e ne esce con il corpo e l'anima segnati: è un fatto così profondo ed intimo che non ho voluto ignorare.",
						en: "Inside the collection there is a series I called Flower Cups and Heart Cups. Among women there are also those who meet cancer and come out of it marked in body and soul: it is something so deep and so private that I did not want to ignore it.",
					},
					{
						it: "**Dedico queste tazze a tutte le donne ferite, con l'augurio che da ogni ferita, qualunque tipo di ferita, possa nascere un fiore.** Non si parla mai abbastanza di prevenzione al cancro al seno, e questa serie dà lo spunto per parlare anche di questo.",
						en: "**I dedicate these cups to every wounded woman, with the wish that out of every wound — any kind of wound — a flower may grow.** We never speak enough about screening for breast cancer, and this series gives a way to speak about that too.",
					},
					{
						it: "Quando espongo queste tazze non affianco mai un testo che racconti da quale mio pensiero vengano. Anche qui mi piace osservare le reazioni di chi le guarda. Spesso chi le sceglie non pensa al cancro: le acquista d'impulso, perché semplicemente sono piaciute, e io non mi sento di aggiungere altro. Anzi, sono felice, perché trovo che l'armonia delle forme esista anche in queste tazze.",
						en: "When I show these cups I never put a text beside them explaining the thought they came from. Here too I like to watch how people react. Often the person who picks one is not thinking about cancer: she buys it on impulse, simply because she liked it, and I do not feel the need to add anything. In fact I am glad, because I find that the harmony of the shapes is in these cups as well.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/tettazze-fiore.jpg",
						nome: { it: "Tazza fiore", en: "Flower cup" },
						anno: "2024",
					},
					{
						foto: "/opere/tettazze-portacandela.jpg",
						nome: { it: "Portacandela", en: "Candle holder" },
						anno: "2023",
					},
				],
			},
			{
				tipo: "prosa",
				etichetta: { it: "Corpi creatori", en: "Creating bodies" },
				paragrafi: [
					{
						it: "L'essere femminile è anche maternità. Nella collezione Tettazze non poteva mancare una tazza che avesse le forme di un corpo gravido.",
						en: "To be female is also to be a mother. In the Tettazze there had to be a cup with the shape of a pregnant body.",
					},
					{
						it: "Non penso solo alla maternità come condizione dell'essere madre. Queste tazze celebrano ed auspicano la capacità di creare e nutrire: che sia un figlio, un progetto, un'opera. Celebrano, e vorrebbero propiziare, quell'energia creativa che feconda, cresce e trasforma per dare vita al nuovo. *Mi sembra sia un buon augurio per tutti.*",
						en: "I do not mean motherhood only as the state of being a mother. These cups celebrate, and wish for, the capacity to create and to nourish: a child, a project, a piece of work. They celebrate — and would like to bring about — that creative energy which quickens, grows and transforms to give life to something new. *It seems to me a good wish for everyone.*",
					},
				],
			},
		],
		incontri: [
			{
				testo: {
					it: "Una volta, durante un'esposizione in piazza, ho osservato una donna avvicinarsi al mio banco: camminava accanto al figlio di otto, dieci anni. Quando ha visto le Tettazze ha avuto un'espressione di stupore e d'istinto ha avvicinato a sé il bambino, mettendogli entrambe le mani sulle orecchie, in un gesto di affetto e protezione.",
					en: "Once, at a show in a public square, I watched a woman come up to my stall: she was walking beside her son, eight or ten years old. When she saw the Tettazze her face filled with astonishment and instinctively she pulled the boy close, putting both hands over his ears, in a gesture of affection and protection.",
				},
				chi: { it: "In piazza", en: "In the square" },
			},
			{
				testo: {
					it: "«Trovo bellissimo che ci sia una tazza che ha le mie forme.»",
					en: "“I think it's wonderful that there's a cup shaped like me.”",
				},
				chi: { it: "Una ragazza, al banco", en: "A young woman, at the stall" },
			},
			{
				testo: {
					it: "Una donna si è soffermata a parlarmi della simmetria del corpo, di come l'operazione al seno gliela avesse tolta. Si percepiva diversa, ma non sbagliata. Mi spiegò che la simmetria come canone di bellezza non è reale, ma funziona nella mente delle donne come una regola non detta, e può essere causa di sofferenza: **resta in noi come se fosse un pensiero innato**.",
					en: "A woman stopped to talk to me about the symmetry of the body, and how breast surgery had taken hers away. She saw herself as different, but not as wrong. Symmetry as a standard of beauty is not real, she explained, but it works in women's minds as an unspoken rule, and it can be a cause of suffering: **it stays in us as if it were an innate thought**.",
				},
				chi: { it: "Dopo l'operazione", en: "After the surgery" },
			},
			{
				testo: {
					it: "«Compriamola per il papà!» è la frase che talvolta sento dire. In effetti possono essere un regalo spiritoso per un uomo. Mi accorgo che spesso vengono fraintese.",
					en: "“Let's get it for dad!” is the line I sometimes hear. They can indeed be a funny present for a man. I notice that they are often misunderstood.",
				},
				chi: { it: "Una frase che torna", en: "A line that keeps coming back" },
			},
		],
	},

	{
		slug: "foglie",
		titolo: { it: "Le *Foglie*", en: "The *Leaves*" },
		breve: { it: "Foglie", en: "Leaves" },
		riga: {
			it: "L'impronta è già lì: io aggiungo soltanto il colore.",
			en: "The print is already there: all I add is the colour.",
		},
		guida: {
			it: "La collezione più dichiaratamente incentrata sulla Natura. Le foglie hanno forme semplici, ma da vicino sono geometrie e particolari sorprendenti.",
			en: "The collection most openly about Nature. Leaves have simple shapes, but up close they are geometry, and a surprising wealth of detail.",
		},
		fondo: "#C9CFBE",
		soglia: {
			foto: "/opere/foglie-fragole.jpg",
			alt: {
				it: "Una tazza con l'impronta di foglie di fragola, accanto a due fragole",
				en: "A cup printed with strawberry leaves, beside two strawberries",
			},
		},
		eroe: {
			foto: "/opere/foglie-coppia.jpg",
			alt: {
				it: "Due tazze con l'impronta della foglia, una accanto all'altra",
				en: "Two leaf-printed cups, one beside the other",
			},
		},
		blocchi: [
			{
				tipo: "prosa",
				etichetta: { it: "Il lavoro", en: "The work" },
				paragrafi: [
					{
						it: "Ho sempre amato quell'aspetto dell'arte informale in cui c'è una forte attrazione verso la natura primordiale, dove l'idea di traccia e di impronta sono essenziali e diventano il motore che ha prodotto opere per me affascinanti. Il processo creativo di questa collezione nasce anche da queste suggestioni.",
						en: "I have always loved the side of art informel drawn to primordial nature, where the idea of the trace and the imprint is essential and becomes the engine of work I find fascinating. The making of this collection comes partly from there.",
					},
					{
						it: "Le foglie che decorano queste tazze non sono l'esercizio di stile di un bravo decoratore. Riporto semplicemente sull'argilla ancora morbida la traccia che lasciano le foglie: è un'impronta naturale, a cui aggiungo poi il colore.",
						en: "The leaves on these cups are not a skilled decorator's exercise in style. I simply press into the soft clay the trace a leaf leaves behind: it is a natural print, and then I add the colour.",
					},
					{
						it: "**Appoggi la foglia, e la foglia è già lì.** Non devo stare a disegnarla. Anche questo passaggio è per me ogni volta un momento di grande stupore: quando il colore corre lungo i minuscoli interstizi di quell'impronta, l'immagine della foglia emerge come d'incanto.",
						en: "**You lay the leaf down, and the leaf is already there.** I don't have to draw it. That step astonishes me every single time: when the colour runs along the tiny channels of the print, the image of the leaf comes up as if by magic.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/foglie-menta.jpg",
						nome: { it: "Boccale, impronta di menta", en: "Mug, mint print" },
						anno: "2024",
					},
					{
						foto: "/opere/foglie-dettaglio.jpg",
						nome: { it: "Dettaglio dell'impronta", en: "The print, close up" },
						anno: "2024",
					},
				],
			},
			{
				tipo: "prosa",
				etichetta: { it: "Lo stupore", en: "The wonder" },
				paragrafi: [
					{
						it: "**È la Natura che mi stupisce con la sua semplicità e bellezza.**",
						en: "**It is Nature that astonishes me, with its simplicity and its beauty.**",
					},
					{
						it: "In questo tempo in cui il Pianeta continua a trasformarsi sotto l'azione spesso indiscriminata dell'uomo, propongo un momento di fermo, un momento di sola contemplazione.",
						en: "In a time when the planet goes on being changed by our often indiscriminate hand, what I offer is a pause: a moment of nothing but looking.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/foglie-gruppo.jpg",
						nome: { it: "Tazze foglia", en: "Leaf cups" },
						anno: "2024",
					},
					{
						foto: "/opere/foglie-terra.jpg",
						nome: { it: "Ciotola, smalto terra", en: "Bowl, earth glaze" },
						anno: "2023",
					},
				],
			},
		],
	},

	{
		slug: "animali",
		titolo: { it: "Gli *Animali*", en: "The *Animals*" },
		breve: { it: "Animali", en: "Animals" },
		riga: {
			it: "Ognuno ha il proprio animale. Questi sono i miei.",
			en: "Everyone has their own animal. These are mine.",
		},
		guida: {
			it: "Le prime nate sono state le Gattetazze. Poi questa riflessione ha voluto estendersi a tutto il mondo animale.",
			en: "The cat cups came first. Then the thought wanted to widen out to the whole animal world.",
		},
		fondo: "#DBC3AC",
		soglia: {
			foto: "/opere/animali-api.jpg",
			alt: {
				it: "Due tazze a forma di ape, impilate su un fondo verde",
				en: "Two bee-shaped cups, stacked on a green ground",
			},
			fuoco: "center 26%",
		},
		eroe: {
			foto: "/opere/animali-gatte.jpg",
			alt: {
				it: "Tazze a forma di gatto, allineate sul tavolo",
				en: "Cat-shaped cups, lined up on the table",
			},
		},
		blocchi: [
			{
				tipo: "prosa",
				etichetta: { it: "Il lavoro", en: "The work" },
				paragrafi: [
					{
						it: "In tanti mi chiedevano tazze a forma di gatto. Ispiravano simpatia, e così mi sono lasciata contagiare; dopo poco sono arrivate le tazze cane. Cani e gatti ci ispirano affetto, spesso vivono la nostra quotidianità e diventano parte del nostro nucleo familiare.",
						en: "So many people asked me for cat-shaped cups. They were endearing, and I let myself be won over; soon after came the dog cups. Cats and dogs draw affection out of us; they live our daily life and become part of the household.",
					},
					{
						it: "Le mie tazze animali ricordano quanto è importante la connessione che abbiamo con loro, ma questa riflessione in seguito ha voluto estendersi a tutto il mondo animale. **Ognuno ha il proprio animale.** Questi sono i miei, e sicuramente ne arriveranno altri. Li sento tutti con una grande forza: in molti di loro riecheggiano antichi miti, dai quali credo, neppure oggi, siamo immuni.",
						en: "My animal cups are a reminder of how much our connection with them matters, and then the thought wanted to widen out to the whole animal world. **Everyone has their own animal.** These are mine, and there will certainly be others. I feel all of them strongly: in many of them old myths still echo, and I don't think we are immune to those, even now.",
					},
					{
						it: "Queste tazze vogliono esprimere simpatia per gli animali, ma *non vogliono umanizzarli come se vivessimo in un cartone animato*.",
						en: "These cups mean to show fondness for animals, but *they do not mean to humanise them, as if we lived in a cartoon*.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/animali-gatte.jpg",
						nome: { it: "Gattetazze", en: "Cat cups" },
						anno: "2024",
					},
					{
						foto: "/opere/animali-orso.jpg",
						nome: { it: "Tazza orso polare", en: "Polar bear cup" },
						anno: "2024",
					},
				],
			},
			{
				tipo: "prosa",
				etichetta: { it: "In pericolo", en: "In danger" },
				paragrafi: [
					{
						it: "Oltre a queste svariate suggestioni, vorrei ricordare che tutti questi animali sono in pericolo; sono in pericolo a causa dell'uomo. Se si parla di Natura, come si fa ad ignorare l'impatto che ha l'uomo su di essa?",
						en: "Beyond all these suggestions, I would like to say that every one of these animals is in danger, and in danger because of us. If we are going to speak about Nature, how can we ignore the mark we leave on it?",
					},
					{
						it: "Orsi bianchi e bruni, pinguini, balene sono in pericolo per i cambiamenti del loro habitat, per i cambiamenti del clima, per la caccia indiscriminata.",
						en: "Polar bears and brown bears, penguins, whales are in danger from the changes to their habitat, from the changing climate, from indiscriminate hunting.",
					},
				],
			},
			{
				tipo: "prosa",
				etichetta: { it: "Le galline", en: "The hens" },
				paragrafi: [
					{
						it: "Fra di loro, cosa c'entrano galline e pulcini? Come cani e gatti, credo facciano parte, in un certo senso, della nostra quotidianità. A cani e gatti diamo un amore incondizionato, mentre spesso ignoriamo come galline e pulcini vengano allevati, senza nessun riguardo per la loro condizione di vita.",
						en: "And what are hens and chicks doing among them? Like cats and dogs, they are part of our daily life, in a way. We give cats and dogs unconditional love, while we often look away from how hens and chicks are raised, with no regard at all for the life they are given.",
					},
					{
						it: "Quando vengono allevati in modo intensivo producono grande inquinamento di acqua ed aria. Sono sì cibo per la nostra tavola, ma il maggior numero di loro viene allevato come se fosse già un oggetto della nostra tavola. Credo che questa sia una grossa contraddizione del nostro tempo, e le mie Galline vorrebbero parlare anche un po' di questo.",
						en: "Raised intensively, they pollute a great deal of water and air. They are food for our table, yes — but most of them are raised as if they were already an object on it. I think this is one of the great contradictions of our time, and my Hens would like to speak about that too.",
					},
					{
						it: "**Vorrei ridare dignità a questi animali, vicini e lontani.**",
						en: "**I would like to give these animals back their dignity — the near ones and the far ones alike.**",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/animali-galline.jpg",
						nome: { it: "Tazze gallina", en: "Hen cups" },
						anno: "2024",
					},
					{
						foto: "/opere/animali-pulcini.jpg",
						nome: { it: "Galline e pulcini", en: "Hens and chicks" },
						anno: "2024",
					},
				],
			},
		],
	},

	{
		slug: "ciondoli",
		titolo: { it: "Ciondoli e\n*Orecchini*", en: "Pendants and\n*Earrings*" },
		breve: { it: "Ciondoli", en: "Pendants" },
		riga: {
			it: "Forme essenziali, e tutto lo spazio lasciato al colore.",
			en: "Shapes pared back, and all the room left to the colour.",
		},
		guida: {
			it: "Si inseriscono nel quadro generale di ricerca di Bellezza e di Benessere personale che muove tutto il lavoro di Sandu Pottery.",
			en: "They belong to the same search for Beauty and personal Wellbeing that moves all the work of Sandu Pottery.",
		},
		fondo: "#C3D0CD",
		soglia: {
			foto: "/opere/ciondoli-verde.jpg",
			alt: {
				it: "Un pendente a trischele e due orecchini, smalto verde, su un tronco di legno",
				en: "A triskele pendant and two earrings, green glaze, on a wooden stump",
			},
		},
		eroe: {
			foto: "/opere/ciondoli-blu.jpg",
			alt: {
				it: "Ciondoli e orecchini smaltati di blu, disposti sul legno",
				en: "Blue-glazed pendants and earrings, laid out on wood",
			},
		},
		blocchi: [
			{
				tipo: "prosa",
				etichetta: { it: "Il lavoro", en: "The work" },
				paragrafi: [
					{
						it: "Le forme sono volutamente semplici, direi essenziali. Sono spesso morbide e armoniose: si lascia così spazio ai colori.",
						en: "The shapes are deliberately simple — essential, I would say. They are often soft and harmonious, and that leaves the room to the colours.",
					},
					{
						it: "La cura dei colori è in primo piano ed è ciò che cattura l'attenzione quando si osservano queste ceramiche. **Prevalgono giochi di trasparenze e di contrasto.** Gli accostamenti variano spesso e ogni volta nascono oggetti nuovi, perfetti per la stagione o per un momento particolare.",
						en: "The care of the colour comes first, and it is what holds your eye when you look at these pieces. **What prevails is a play of transparency and of contrast.** The pairings change often, and each time new pieces appear, right for a season or for a particular moment.",
					},
					{
						it: "Fra questi ci sono anche i pezzi con il trischele, nati per Celtica.",
						en: "Among them are the triskele pieces, made for Celtica.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/ciondoli-turchese.jpg",
						nome: { it: "Trischele, pendente e orecchini", en: "Triskele, pendant and earrings" },
						anno: "2024",
					},
					{
						foto: "/opere/ciondoli-lilla.jpg",
						nome: { it: "Orecchini, smalto lilla", en: "Earrings, lilac glaze" },
						anno: "2024",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/ciondoli-cuori.jpg",
						nome: { it: "Cuori e orecchini", en: "Hearts and earrings" },
						anno: "2024",
					},
					{
						foto: "/opere/ciondoli-foglia.jpg",
						nome: { it: "Pendente foglia", en: "Leaf pendant" },
						anno: "2024",
					},
				],
			},
		],
	},

	{
		slug: "chi-sono",
		titolo: { it: "Chi *Sono*", en: "Who I *Am*" },
		breve: { it: "Chi sono", en: "Who I am" },
		riga: {
			it: "Quattro collezioni distinte, ma dietro ci sono io.",
			en: "Four separate collections — but behind them there is me.",
		},
		guida: {
			it: "Sono Stefania Casto. Sandu Pottery è nata con Uwe, ed è il nostro progetto: continua a vivere perché continua a nutrirsi d'amore.",
			en: "I am Stefania Casto. Sandu Pottery began with Uwe, and it is our project: it goes on living because it goes on feeding on love.",
		},
		fondo: "#E8DCC9",
		soglia: {
			foto: "/opere/atelier-asciugatura.jpg",
			alt: {
				it: "Pezzi appena decorati, allineati sul tavolo ad asciugare",
				en: "Freshly decorated pieces, lined up on the table to dry",
			},
		},
		eroe: {
			foto: "/opere/atelier-banco.jpg",
			alt: {
				it: "Un boccale sul banco di lavoro, fra i pennelli e la carta di giornale",
				en: "A mug on the workbench, among the brushes and the newspaper",
			},
		},
		blocchi: [
			{
				tipo: "prosa",
				etichetta: { it: "La storia", en: "The story" },
				paragrafi: [
					{
						it: "Ho studiato all'Istituto d'arte di Bergamo e poi all'Accademia di Brera, a Milano, dove ho frequentato il corso di pittura. Con questa formazione ho lavorato come decoratrice per diversi anni, poi mi sono rimessa a studiare il Colore e l'Espressione e ho lavorato con bambini in laboratori esperienziali.",
						en: "I studied at the art institute in Bergamo and then at the Brera Academy in Milan, where I took the painting course. With that training I worked as a decorator for several years, then I went back to studying Colour and Expression and worked with children in experiential workshops.",
					},
					{
						it: "Nel 2018 ho conosciuto Uwe e ho iniziato una nuova vita. Con lui ho avuto la fortuna di rallentare i miei ritmi frenetici, per poter riflettere su quello che veramente volevo fare.",
						en: "In 2018 I met Uwe and began a new life. With him I had the good fortune to slow down my frantic pace, and to think about what I really wanted to do.",
					},
					{
						it: "L'idea di lavorare la ceramica è nata perché volevo realizzare oggetti belli e funzionali, adatti all'uso quotidiano. Ancora oggi il vedere come **una palla di argilla diventa un oggetto della tavola** è un processo che mi entusiasma ogni volta: mi sembra una vera magia.",
						en: "The idea of working with clay came because I wanted to make objects that were beautiful and useful, made for everyday life. Even now, watching **a ball of clay become something you put on a table** thrills me every time: it seems like real magic.",
					},
				],
			},
			{
				tipo: "prosa",
				etichetta: { it: "Uwe", en: "Uwe" },
				paragrafi: [
					{
						it: "Uwe Rasmussen era nato in Danimarca. Si era trasferito in Italia per amore e qui aveva deciso di rimanere, perché adorava le montagne. Lui era l'altra parte di Sandu Pottery: curava l'aspetto più tecnico, seguiva le cotture, sperimentava gli smalti e assemblava con pazienza i gioielli.",
						en: "Uwe Rasmussen was born in Denmark. He had moved to Italy for love and decided to stay, because he adored the mountains. He was the other half of Sandu Pottery: he looked after the technical side, watched the firings, experimented with glazes and patiently assembled the jewellery.",
					},
					{
						it: "Inoltre aveva il compito di riportarmi con i piedi per terra, quando mi perdevo nei processi creativi.",
						en: "He also had the job of bringing me back down to earth, when I got lost in the making.",
					},
					{
						it: "Nel marzo del 2023 un improvviso attacco di cuore l'ha portato via. **Sandu Pottery ha continuato a vivere, perché è il nostro progetto e continua a nutrirsi d'amore.**",
						en: "In March 2023 a sudden heart attack took him away. **Sandu Pottery has gone on living, because it is our project and it goes on feeding on love.**",
					},
					{
						it: "*La passione per questo lavoro mi salva ogni giorno dal dolore della sua perdita. Ogni pezzo che creo e che poi va in giro per il mondo è la conferma di quanto questo amore ha fatto per me.*",
						en: "*The love of this work saves me every day from the grief of losing him. Every piece I make, and that then goes off into the world, is proof of what that love has done for me.*",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/atelier-vasi.jpg",
						nome: { it: "Vasi, sul davanzale", en: "Planters, on the windowsill" },
						anno: "2024",
					},
					{
						foto: "/opere/foglie-terra.jpg",
						nome: { it: "In cucina", en: "In the kitchen" },
						anno: "2024",
					},
				],
			},
			{
				tipo: "prosa",
				etichetta: { it: "Il filo", en: "The thread" },
				paragrafi: [
					{
						it: "Sono quattro collezioni distinte, ma dietro ci sono io. Non sono nate a caso: perché faccio le Tettazze? Perché voglio parlare alle donne. Perché faccio gli Animali? Perché voglio parlare della connessione che abbiamo con loro.",
						en: "They are four separate collections, but behind them there is me. They did not come about by chance. Why do I make the Tettazze? Because I want to speak to women. Why do I make the Animals? Because I want to speak about the connection we have with them.",
					},
					{
						it: "**Il filo conduttore, quello che unisce tutto, è comunque un discorso sulla natura** — perché anche le Tettazze sono una cosa del corpo, e il corpo è natura.",
						en: "**The thread running through it, the thing that ties it all together, is still a conversation about nature** — because the Tettazze too are about the body, and the body is nature.",
					},
					{
						it: "Va bene far riflettere sulla profondità, sulla natura, su queste cose qua. Però io voglio portare *leggerezza e bellezza*.",
						en: "It is right to make people think — about depth, about nature, about all of this. But what I want to bring is *lightness, and beauty*.",
					},
				],
			},
		],
		incontri: [
			{
				testo: {
					it: "«Sai, Stefi, tutte le persone che si avvicinano al tuo banco sorridono. Alla fine, quando guardano, sorridono.»",
					en: "“You know, Stefi, everyone who comes up to your stall smiles. In the end, when they look, they smile.”",
				},
				chi: { it: "La mia amica Viva, dietro al banco", en: "My friend Viva, behind the stall" },
			},
		],
	},

	{
		slug: "dove",
		titolo: { it: "Dove mi\n*Trovi*", en: "Where to\n*Find Me*" },
		breve: { it: "Dove", en: "Where" },
		riga: {
			it: "Con i mercatini arrivo alle persone, ed entro nelle case.",
			en: "Through the markets I reach people, and I get into their homes.",
		},
		guida: {
			it: "Il mercatino resta l'incontro. Se una persona è interessata ad approfondire mi fa le domande, e il significato del mio lavoro arriva.",
			en: "The market is still where the meeting happens. If someone wants to go deeper they ask me, and the meaning of the work gets through.",
		},
		fondo: "#D5DCE0",
		soglia: {
			foto: "/opere/atelier-mercatino.jpg",
			alt: {
				it: "Il banco al mercatino, con le tazze allineate sul tavolo",
				en: "The market stall, with the cups lined up on the table",
			},
		},
		eroe: {
			foto: "/opere/atelier-mercatino.jpg",
			alt: {
				it: "Il banco al mercatino, con le tazze allineate sul tavolo",
				en: "The market stall, with the cups lined up on the table",
			},
		},
		blocchi: [
			{
				tipo: "prosa",
				etichetta: { it: "In strada", en: "On the road" },
				paragrafi: [
					{
						it: "La parola stessa, «mercatini», sminuisce il lavoro di un artigiano. Però è lì che il mio lavoro incontra davvero qualcuno: **con i mercatini io arrivo alle persone, ed entro nelle case.**",
						en: "The word itself — “markets” — makes an artisan's work sound smaller than it is. But that is where the work truly meets someone: **through the markets I reach people, and I get into their homes.**",
					},
					{
						it: "Al mercatino c'è sempre l'occasione. Se una persona è interessata ad approfondire mi fa le domande, e comunque il significato del mio lavoro arriva. È per questo che lo trovo molto prezioso, il mercatino come incontro con le persone.",
						en: "At a market there is always the chance. If someone wants to go deeper they ask me, and the meaning of the work gets through anyway. That is why I find it so precious — the market, as a meeting with people.",
					},
					{
						it: "Sto ancora sperimentando delle piazze: sono giovane in questo senso, a differenza di tanti colleghi che sono in strada da anni. *E fin quando fisicamente riesco a reggere questa cosa dei mercatini, io vado avanti.*",
						en: "I am still trying out squares: in that sense I am new to it, unlike many colleagues who have been on the road for years. *And for as long as I can physically keep this up, I will keep going.*",
					},
				],
			},
			{ tipo: "mercati" },
			{ tipo: "contatti" },
		],
	},
] as const;

export const perSlug = (slug: string): Collezione | undefined =>
	collezioni.find((c) => c.slug === slug);

/**
 * Il numero romano sopra la soglia. È la posizione nel percorso, non un dato
 * da scrivere: riordinare l'elenco rinumera tutto da solo.
 */
const ROMANI = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"] as const;
export const romano = (i: number): string => ROMANI[i] ?? String(i + 1);

/** Il "prossimo" del margine in basso: l'ultima stanza riporta alla prima. */
export const dopo = (slug: string): Collezione => {
	const i = collezioni.findIndex((c) => c.slug === slug);
	const prossima = collezioni[(i + 1) % collezioni.length];
	if (!prossima) throw new Error(`collezione sconosciuta: ${slug}`);
	return prossima;
};

/** L'apertura della home: poche parole, pesi diversi. */
export const apertura = {
	occhiello: {
		it: "Ceramica fatta a mano  ·  Bergamo",
		en: "Handmade ceramics  ·  Bergamo",
	},
	uno: { it: "Faccio oggetti belli", en: "I make things" },
	due: { it: "e da usare", en: "that are beautiful" },
	tre: { it: "tutti i giorni.", en: "and made to be used." },
	mezzo: {
		it: "quattro collezioni, un solo discorso",
		en: "four collections, one single subject",
	},
	quattro: { it: "La natura", en: "Nature" },
	cinque: { it: ", e noi dentro.", en: ", and us inside it." },
} satisfies Record<string, Testo>;

export const voci = {
	torna: { it: "Torna", en: "Back" },
	incontri: { it: "Gli incontri", en: "Encounters" },
	altraLingua: { it: "English", en: "Italiano" },
	saltaAlContenuto: { it: "Salta al contenuto", en: "Skip to content" },
	indice: { it: "Le stanze", en: "The rooms" },
	descrizione: {
		it: "Ceramica fatta a mano a Bergamo: tazze, foglie, animali, ciondoli e orecchini. Ogni pezzo è modellato e decorato uno per volta.",
		en: "Handmade ceramics from Bergamo: cups, leaves, animals, pendants and earrings. Every piece is shaped and decorated one at a time.",
	},
} satisfies Record<string, Testo>;
