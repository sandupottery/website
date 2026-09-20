/**
 * Da dove si arriva. Una variabile sola, di modulo, perché deve sopravvivere
 * allo smontaggio di una pagina e farsi leggere dalla successiva nello stesso
 * commit — cosa che uno stato di React, che vive dentro l'albero che sta
 * sparendo, non può fare.
 *
 * Serve a distinguere l'unico passaggio che il browser non anima da solo:
 * stanza → stanza. Vedi `Cima`.
 */
let ultimaEraStanza = false;

export const segnaStanza = (valore: boolean): void => {
	ultimaEraStanza = valore;
};

export const veniamoDaUnaStanza = (): boolean => ultimaEraStanza;

/**
 * A che altezza era la home quando l'abbiamo lasciata.
 *
 * Tornando indietro la pagina deve ritrovarsi esattamente lì: non è una
 * comodità, è la condizione perché il ritorno sia il rovescio dell'andata. La
 * fotografia della stanza si rimpicciolisce fino a ridiventare il titolo della
 * soglia, e il titolo della soglia esiste solo alla quota da cui si è partiti —
 * altrove React lo trova fuori campo, gli toglie il nome e non resta che una
 * dissolvenza sopra una pagina che nel frattempo salta in cima.
 *
 * Sta qui e non in `sessionStorage` per lo stesso motivo del valore sopra: deve
 * farsi leggere dalla pagina successiva *dentro lo stesso commit*, e sta in
 * piedi finché sta in piedi la navigazione — che è esattamente quanto dura il
 * viaggio di andata e ritorno.
 */
let quotaDiCasa: number | null = null;

export const segnaQuota = (y: number): void => {
	quotaDiCasa = y;
};

/** Si legge una volta sola: la quota vale per il ritorno, non per sempre. */
export const prendiQuota = (): number | null => {
	const q = quotaDiCasa;
	quotaDiCasa = null;
	return q;
};
