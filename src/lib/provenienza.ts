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
