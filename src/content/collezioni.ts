/**
 * Il contenuto del sito, in una struttura sola.
 *
 * Tre consumatori leggono da qui: la home (soglie), le stanze (prosa, pezzi,
 * incontri) e i metadati delle pagine. Le fotografie e i testi sono materiale
 * di lavoro — verranno rifatti dalla cliente — quindi tutto quello che lei
 * cambierà sta in questo file e in nessun altro.
 *
 * I prezzi sono `[prezzo]` di proposito: è un dato che la cliente non ha
 * ancora dato. Vedi la regola sui segnaposto in AGENTS.md.
 *
 * Per la marcatura `*corsivo*` / `**rilievo**` / `\n` vedi `src/lib/testo.tsx`.
 */

export type Lingua = "it" | "en";
export type Testo = Record<Lingua, string>;

export type Pezzo = {
	foto: string;
	nome: Testo;
	anno: string;
};

export type Blocco =
	| { tipo: "prosa"; etichetta: Testo; paragrafi: Testo[] }
	| { tipo: "pezzi"; pezzi: [Pezzo] | [Pezzo, Pezzo] };

export type Incontro = { testo: Testo; chi: Testo };

export type Collezione = {
	slug: string;
	/** Ordine di percorrenza: è anche il "prossimo" del margine in basso. */
	etichetta: Testo;
	/** Il titolo grande. `*…*` è la parte in corsivo, `\n` il punto di rottura. */
	titolo: Testo;
	/** La riga sotto il titolo in home: una frase, non un sommario. */
	riga: Testo;
	/** La frase d'apertura della stanza, accanto al titolo. */
	guida: Testo;
	/** Il fondo verso cui la home sfuma mentre si scorre questa soglia. */
	fondo: string;
	soglia: { foto: string; alt: Testo };
	eroe: { foto: string; alt: Testo };
	blocchi: Blocco[];
	incontri?: Incontro[];
};

const PREZZO = "[prezzo]";
export const prezzo = PREZZO;

export const collezioni: readonly Collezione[] = [
	{
		slug: "tettazze",
		etichetta: { it: "Collezione uno", en: "Collection one" },
		titolo: { it: "Le *Tettazze*", en: "The *Tettazze*" },
		riga: {
			it: "Tutte diverse, perché noi siamo tutte diverse.",
			en: "All different, because we are all different.",
		},
		guida: {
			it: "Una collezione di tazze che ho creato per le donne. È un lavoro sul corpo, e apre a moltissime cose che mi stanno a cuore.",
			en: "A collection of cups I made for women. It is a work about the body, and it opens onto a great many things I care about.",
		},
		fondo: "#DCE3DD",
		soglia: {
			foto: "/opere/tettazza-margherita.jpg",
			alt: {
				it: "Una tazza con il seno modellato sopra, decorata a margherite",
				en: "A cup with a breast modelled on it, decorated with daisies",
			},
		},
		eroe: {
			foto: "/opere/tettazza-papaveri.jpg",
			alt: {
				it: "Una tazza decorata a papaveri rossi",
				en: "A cup decorated with red poppies",
			},
		},
		blocchi: [
			{
				tipo: "prosa",
				etichetta: { it: "Il lavoro", en: "The work" },
				paragrafi: [
					{
						it: "La forma della tazza è la forma del corpo, e il seno è modellato sopra ogni tazza. Sono tutte diverse, **perché noi siamo tutte diverse**.",
						en: "The shape of the cup is the shape of the body, and the breast is modelled onto every cup. They are all different, **because we are all different**.",
					},
					{
						it: "Il nostro mondo porta modelli corporei spesso lontani dalla realtà. Quotidianamente ci vengono proposti corpi magri, dove la magrezza spesso è anoressia, dove l'assenza di rughe ignora lo scorrere del tempo, dove l'essere muscolosi è fondamento per sentirsi uomo.",
						en: "Our world carries models of the body that are often far from real. Every day we are shown thin bodies, where thinness is often anorexia, where the absence of wrinkles ignores the passing of time, where being muscular is the ground for feeling like a man.",
					},
					{
						it: "In mezzo a questa continua sollecitazione di immagini e messaggi, il fermarsi a guardare come siamo credo sia un passo verso il nostro benessere. Le Tettazze esistono prima di tutto per farci pensare al nostro corpo, e magari ci propongono un lavoro di auto accettazione — *con ironia e leggerezza*.",
						en: "In the middle of this constant pressure of images and messages, stopping to look at how we are is, I believe, a step towards our own wellbeing. The Tettazze exist first of all to make us think about our body, and perhaps they offer a work of self-acceptance — *with irony and lightness*.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/tettazza-margherita.jpg",
						nome: { it: "Boccale", en: "Mug" },
						anno: "2023",
					},
					{
						foto: "/opere/t-d.jpg",
						nome: { it: "Tazzina fiore", en: "Flower cup" },
						anno: "2024",
					},
				],
			},
			{
				tipo: "prosa",
				etichetta: { it: "Le reazioni", en: "The reactions" },
				paragrafi: [
					{
						it: "Per me è sempre un'occasione di riflessione osservare le reazioni di chi guarda queste tazze per la prima volta. Il più delle volte aprono un sorriso: alcune volte è un sorriso di divertimento, altre volte è un sorriso di imbarazzo. **Chi si imbarazza di più sono le donne**, e questo mi fa molto pensare.",
						en: "Watching how people react the first time they see these cups is always an occasion for reflection. Most of the time they open a smile: sometimes it is a smile of amusement, sometimes one of embarrassment. **The ones who are most embarrassed are women**, and that gives me a great deal to think about.",
					},
					{
						it: "Mi accorgo che spesso vengono fraintese. «Compriamola per il papà» è la frase che talvolta sento dire. Sono semplicemente un oggetto: una tazza con due seni sopra. L'equazione seno uguale sesso può essere automatica, ma è riduttiva, e descrive una società che si rifà a un modello maschile.",
						en: "I notice they are often misunderstood. «Let's buy it for dad» is the phrase I sometimes hear. They are simply an object: a cup with two breasts on it. The equation breast equals sex may be automatic, but it is reductive, and it describes a society that still measures itself against a male model.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/t-c.jpg",
						nome: { it: "Portacandela", en: "Candle holder" },
						anno: "2023",
					},
				],
			},
			{
				tipo: "prosa",
				etichetta: { it: "Fiore e cuore", en: "Flower and heart" },
				paragrafi: [
					{
						it: "All'interno della collezione c'è una serie che ho chiamato Tazze Fiore e Tazze Cuore. Fra le donne c'è anche chi incontra il cancro e ne esce con il corpo e l'anima segnati: è un fatto così profondo e intimo che non ho voluto ignorarlo.",
						en: "Inside the collection there is a series I called Flower Cups and Heart Cups. Among women there are those who meet cancer and come out of it with body and soul marked: it is something so deep and so intimate that I did not want to ignore it.",
					},
					{
						it: "Dedico queste tazze a tutte le donne ferite, con l'augurio che da ogni ferita *possa nascere un fiore*.",
						en: "I dedicate these cups to every wounded woman, with the wish that from every wound *a flower may grow*.",
					},
					{
						it: "Quando le espongo non affianco mai un testo che racconti da quale pensiero vengano. Spesso chi le sceglie non pensa al cancro: le acquista d'impulso, perché semplicemente sono piaciute, e io non mi sento di aggiungere altro. Anzi, sono felice — trovo che l'armonia delle forme esista anche in queste tazze.",
						en: "When I show them I never put a text beside them explaining the thought they come from. Often whoever chooses one is not thinking about cancer: they buy it on impulse, simply because they liked it, and I do not feel the need to add anything. On the contrary, I am glad — I find that the harmony of the shapes lives in these cups too.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/t-a.jpg",
						nome: { it: "Tazza fiore", en: "Flower cup" },
						anno: "2024",
					},
					{
						foto: "/opere/t-b.jpg",
						nome: { it: "Tazzine cuore", en: "Heart cups" },
						anno: "2024",
					},
				],
			},
		],
		incontri: [
			{
				testo: {
					it: "Una donna si è fermata a parlarmi della simmetria del corpo, di come l'operazione al seno gliela avesse tolta. Si percepiva diversa, ma non sbagliata. Mi spiegò che la simmetria come canone di bellezza non è reale, ma funziona nella mente delle donne come una regola non detta, e può essere causa di sofferenza.",
					en: "A woman stopped to talk to me about the symmetry of the body, and how breast surgery had taken hers away. She felt different, but not wrong. She explained that symmetry as a canon of beauty is not real, but that it works in women's minds as an unspoken rule, and can be a cause of suffering.",
				},
				chi: { it: "In piazza", en: "In the square" },
			},
			{
				testo: {
					it: "Camminava accanto al figlio di otto, dieci anni. Quando ha visto le Tettazze ha avuto un'espressione di stupore e d'istinto se lo è tirato vicino, mettendogli entrambe le mani sulle orecchie, in un gesto di affetto e protezione.",
					en: "She was walking beside her son, eight or ten years old. When she saw the Tettazze her face filled with surprise and she instinctively pulled him close, putting both hands over his ears, in a gesture of affection and protection.",
				},
				chi: { it: "A un mercatino", en: "At a market" },
			},
			{
				testo: {
					it: "Trovo bellissimo che ci sia una tazza che ha le mie forme.",
					en: "I find it beautiful that there is a cup with my own shape.",
				},
				chi: { it: "Una ragazza, al banco", en: "A young woman, at the stall" },
			},
		],
	},

	{
		slug: "foglie",
		etichetta: { it: "Collezione due", en: "Collection two" },
		titolo: { it: "Le *Foglie*", en: "The *Leaves*" },
		riga: {
			it: "L'impronta, e il colore che le corre dentro.",
			en: "The imprint, and the colour that runs through it.",
		},
		guida: {
			it: "La collezione più dichiaratamente incentrata sulla natura.",
			en: "The collection most openly centred on nature.",
		},
		fondo: "#C9CFBE",
		soglia: {
			foto: "/opere/foglie.jpg",
			alt: {
				it: "Tazze con l'impronta di una foglia, smaltate di verde",
				en: "Cups bearing the imprint of a leaf, glazed green",
			},
		},
		eroe: {
			foto: "/opere/f-a.jpg",
			alt: {
				it: "Il dettaglio di una foglia impressa nell'argilla",
				en: "Close-up of a leaf pressed into the clay",
			},
		},
		blocchi: [
			{
				tipo: "prosa",
				etichetta: { it: "Il lavoro", en: "The work" },
				paragrafi: [
					{
						it: "Le foglie hanno forme semplici, ma quando le osserviamo da vicino possiamo notare geometrie e **una ricchezza di particolari sorprendenti**.",
						en: "Leaves have simple shapes, but when we look at them closely we find geometries and **a surprising richness of detail**.",
					},
					{
						it: "Ho sempre amato quell'aspetto dell'arte informale in cui c'è una forte attrazione verso la natura primordiale, dove l'idea di traccia e di impronta sono essenziali e diventano il motore di opere per me affascinanti.",
						en: "I have always loved the side of art informel drawn towards primordial nature, where the idea of the trace and of the imprint is essential and becomes the engine of works I find fascinating.",
					},
					{
						it: "Le foglie che decorano queste tazze non sono l'esercizio di stile di un bravo decoratore. Riporto semplicemente sull'argilla ancora morbida la traccia che lasciano le foglie: è un'impronta naturale, a cui aggiungo poi il colore.",
						en: "The leaves that decorate these cups are not the stylistic exercise of a skilled decorator. I simply carry onto the still-soft clay the trace the leaves leave: it is a natural imprint, to which I then add colour.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/foglie.jpg",
						nome: { it: "Tazze foglia", en: "Leaf cups" },
						anno: "2023",
					},
					{
						foto: "/opere/f-b.jpg",
						nome: { it: "Zuccheriere", en: "Sugar bowls" },
						anno: "2023",
					},
				],
			},
			{
				tipo: "prosa",
				etichetta: { it: "Lo stupore", en: "The wonder" },
				paragrafi: [
					{
						it: "Anche questo passaggio è per me ogni volta un momento di grande stupore: quando il colore corre lungo i minuscoli interstizi di quell'impronta, l'immagine della foglia *emerge come d'incanto*. È la natura che mi stupisce con la sua semplicità e bellezza.",
						en: "This step too is, every time, a moment of great wonder for me: when the colour runs along the tiny crevices of that imprint, the image of the leaf *emerges as if by magic*. It is nature astonishing me with its simplicity and its beauty.",
					},
					{
						it: "In questo tempo in cui il Pianeta continua a trasformarsi sotto l'azione spesso indiscriminata dell'uomo, propongo un momento di fermo, un momento di sola contemplazione.",
						en: "In a time when the Planet keeps being transformed by the often indiscriminate action of human beings, I offer a moment of stillness, a moment of pure contemplation.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/tettazza-radicchio.jpg",
						nome: { it: "Tazza, smalto verde", en: "Cup, green glaze" },
						anno: "2024",
					},
				],
			},
		],
	},

	{
		slug: "animali",
		etichetta: { it: "Collezione tre", en: "Collection three" },
		titolo: { it: "Gli *Animali*", en: "The *Animals*" },
		riga: {
			it: "Vicini e lontani, e tutti in pericolo per causa nostra.",
			en: "Near and far, and all of them endangered because of us.",
		},
		guida: {
			it: "Le prime nate sono state le Gattetazze. In tanti mi chiedevano tazze a forma di gatto, e mi sono lasciata contagiare.",
			en: "The first to be born were the Cat-cups. So many people asked me for cat-shaped cups that I let myself be won over.",
		},
		fondo: "#DBC3AC",
		soglia: {
			foto: "/opere/procione.jpg",
			alt: {
				it: "Una tazza a forma di procione",
				en: "A raccoon-shaped cup",
			},
		},
		eroe: {
			foto: "/opere/a-a.jpg",
			alt: {
				it: "Tazze a forma di animale allineate su un piano",
				en: "Animal-shaped cups lined up on a surface",
			},
		},
		blocchi: [
			{
				tipo: "prosa",
				etichetta: { it: "Il lavoro", en: "The work" },
				paragrafi: [
					{
						it: "Cani e gatti ci ispirano affetto, vivono la nostra quotidianità e diventano parte del nucleo familiare. Ma questa riflessione ha voluto estendersi **a tutto il mondo animale**.",
						en: "Dogs and cats stir affection in us, they live our daily life and become part of the family. But this reflection wanted to reach out **to the whole animal world**.",
					},
					{
						it: "Ognuno ha il proprio animale. Questi sono i miei, e sicuramente ne arriveranno altri: li sento tutti con una grande forza. In molti di loro riecheggiano antichi miti dai quali, credo, neppure oggi siamo immuni.",
						en: "Everyone has their own animal. These are mine, and others will surely come: I feel all of them with great force. In many of them ancient myths still echo, and I do not think we are immune to them even now.",
					},
					{
						it: "Oltre a queste suggestioni vorrei ricordare che tutti questi animali sono in pericolo, e sono in pericolo a causa dell'uomo. Se si parla di natura, come si fa a ignorare l'impatto che ha l'uomo su di essa?",
						en: "Beyond these suggestions I would like to remember that all these animals are in danger, and they are in danger because of us. If we speak of nature, how can we ignore the impact human beings have on it?",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/procione.jpg",
						nome: { it: "Tazza procione", en: "Raccoon cup" },
						anno: "2024",
					},
					{
						foto: "/opere/a-b.jpg",
						nome: { it: "Gattetazze", en: "Cat-cups" },
						anno: "2024",
					},
				],
			},
			{
				tipo: "prosa",
				etichetta: { it: "Le galline", en: "The hens" },
				paragrafi: [
					{
						it: "Fra di loro, cosa c'entrano galline e pulcini? Come cani e gatti, credo facciano parte in un certo senso della nostra quotidianità. A cani e gatti diamo un amore incondizionato, mentre spesso ignoriamo come galline e pulcini vengano allevati senza nessun riguardo per la loro condizione di vita.",
						en: "What are hens and chicks doing among them? Like dogs and cats, I believe they are part, in a certain sense, of our daily life. To dogs and cats we give unconditional love, while we often ignore how hens and chicks are raised with no regard at all for the conditions they live in.",
					},
					{
						it: "Credo che questa sia *una grossa contraddizione del nostro tempo*, e le mie Galline vorrebbero parlare anche un po' di questo. Vorrei ridare dignità a questi animali, vicini e lontani.",
						en: "I think this is *a great contradiction of our time*, and my Hens would like to speak a little about it too. I would like to give these animals back their dignity, the near ones and the far ones alike.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/pulcini.jpg",
						nome: { it: "Pulcini", en: "Chicks" },
						anno: "2024",
					},
				],
			},
		],
	},

	{
		slug: "ciondoli",
		etichetta: { it: "Collezione quattro", en: "Collection four" },
		titolo: { it: "Ciondoli e\n*Orecchini*", en: "Pendants and\n*Earrings*" },
		riga: {
			it: "Forme essenziali, e tutto lo spazio lasciato al colore.",
			en: "Essential shapes, and all the room left to colour.",
		},
		guida: {
			it: "Si inseriscono nello stesso quadro di ricerca di bellezza che muove tutto il lavoro.",
			en: "They belong to the same search for beauty that moves all the rest of the work.",
		},
		fondo: "#C3D0CD",
		soglia: {
			foto: "/opere/gioielli.jpg",
			alt: {
				it: "Ciondoli e orecchini in ceramica smaltata",
				en: "Glazed ceramic pendants and earrings",
			},
		},
		eroe: {
			foto: "/opere/g-b.jpg",
			alt: {
				it: "Orecchini in ceramica, dal vicino",
				en: "Ceramic earrings, close up",
			},
		},
		blocchi: [
			{
				tipo: "prosa",
				etichetta: { it: "Il lavoro", en: "The work" },
				paragrafi: [
					{
						it: "Le forme sono volutamente semplici, direi **essenziali**. Sono spesso morbide e armoniose: si lascia così spazio ai colori.",
						en: "The shapes are deliberately simple, I would say **essential**. They are often soft and harmonious: that way, room is left for the colours.",
					},
					{
						it: "La cura dei colori è in primo piano ed è ciò che cattura l'attenzione quando si osservano queste ceramiche. Prevalgono giochi di trasparenze e di contrasto. Gli accostamenti variano spesso, e ogni volta nascono oggetti nuovi, perfetti per la stagione o per un momento particolare.",
						en: "The care given to colour comes first, and it is what holds the attention when you look at these pieces. Plays of transparency and of contrast prevail. The pairings change often, and each time new objects are born, right for the season or for a particular moment.",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/gioielli.jpg",
						nome: {
							it: "Trischele, pendente e orecchini",
							en: "Triskelion, pendant and earrings",
						},
						anno: "2024",
					},
					{
						foto: "/opere/gioielli2.jpg",
						nome: { it: "Anelli e orecchini", en: "Rings and earrings" },
						anno: "2024",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/g-a.jpg",
						nome: {
							it: "Orecchini, smalto turchese",
							en: "Earrings, turquoise glaze",
						},
						anno: "2024",
					},
				],
			},
		],
	},

	{
		slug: "chi-sono",
		etichetta: { it: "L'atelier", en: "The studio" },
		titolo: { it: "Chi *Sono*", en: "Who I *Am*" },
		riga: {
			it: "Stefania Casto, e Uwe, che ha iniziato tutto con me.",
			en: "Stefania Casto, and Uwe, who started all of it with me.",
		},
		guida: {
			it: "Sono Stefania Casto. Sandu Pottery è nata con Uwe, e continua.",
			en: "I am Stefania Casto. Sandu Pottery was born with Uwe, and it continues.",
		},
		fondo: "#F5F2EB",
		soglia: {
			foto: "/opere/t-g.jpg",
			alt: {
				it: "Pezzi appena smaltati, in attesa della cottura",
				en: "Freshly glazed pieces, waiting to be fired",
			},
		},
		eroe: {
			foto: "/opere/candeliere.jpg",
			alt: {
				it: "Un candeliere in ceramica sul piano di lavoro",
				en: "A ceramic candle holder on the workbench",
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
						it: "Nel 2018 ho conosciuto Uwe e ho iniziato una nuova vita. Con lui ho avuto la fortuna di rallentare i miei ritmi frenetici per poter riflettere su quello che volevo fare davvero.",
						en: "In 2018 I met Uwe and began a new life. With him I had the good fortune to slow down my frantic pace, and to think about what I really wanted to do.",
					},
					{
						it: "L'idea di lavorare la ceramica è nata perché volevo realizzare oggetti belli e funzionali, adatti all'uso quotidiano. Ancora oggi vedere come una palla di argilla diventa un oggetto della tavola è un processo che mi entusiasma ogni volta: mi sembra una vera magia.",
						en: "The idea of working with clay came because I wanted to make objects that were beautiful and useful, made for everyday life. Even today, watching a ball of clay become something you put on a table thrills me every time: it seems like real magic.",
					},
					{
						it: "Uwe Rasmussen era nato in Danimarca. Si era trasferito in Italia per amore e qui aveva deciso di rimanere, perché adorava le montagne. Lui era l'altra parte di Sandu Pottery: curava l'aspetto più tecnico, seguiva le cotture, sperimentava gli smalti e assemblava con pazienza i gioielli.",
						en: "Uwe Rasmussen was born in Denmark. He had moved to Italy for love and decided to stay, because he adored the mountains. He was the other half of Sandu Pottery: he looked after the technical side, watched the firings, experimented with glazes and patiently assembled the jewellery.",
					},
					{
						it: "Nel marzo del 2023 un improvviso attacco di cuore l'ha portato via. **Sandu Pottery ha continuato a vivere, perché è il nostro progetto.**",
						en: "In March 2023 a sudden heart attack took him away. **Sandu Pottery has gone on living, because it is our project.**",
					},
				],
			},
			{
				tipo: "pezzi",
				pezzi: [
					{
						foto: "/opere/t-f.jpg",
						nome: { it: "Al banco", en: "At the stall" },
						anno: "2024",
					},
					{
						foto: "/opere/t-e.jpg",
						nome: { it: "In attesa della cottura", en: "Waiting to be fired" },
						anno: "2024",
					},
				],
			},
		],
	},
] as const;

export const perSlug = (slug: string): Collezione | undefined =>
	collezioni.find((c) => c.slug === slug);

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
		it: "Ceramica fatta a mano  ·  Bergamo",
		en: "Handmade ceramics  ·  Bergamo",
	},
	uno: { it: "Faccio oggetti", en: "I make things" },
	due: { it: "da usare", en: "made to be used" },
	tre: { it: "tutti i giorni.", en: "every day." },
	mezzo: {
		it: "quattro collezioni, una cosa sola",
		en: "four collections, one single thing",
	},
	quattro: { it: "La natura", en: "Nature" },
	cinque: { it: ", e noi dentro.", en: ", and us inside it." },
} satisfies Record<string, Testo>;

export const voci = {
	torna: { it: "Torna", en: "Back" },
	incontri: { it: "Gli incontri", en: "Encounters" },
	altraLingua: { it: "English", en: "Italiano" },
	descrizione: {
		it: "Ceramica fatta a mano a Bergamo: tazze, foglie, animali, ciondoli e orecchini. Ogni pezzo è modellato e decorato uno per volta.",
		en: "Handmade ceramics from Bergamo: cups, leaves, animals, pendants and earrings. Every piece is shaped and decorated one at a time.",
	},
} satisfies Record<string, Testo>;
