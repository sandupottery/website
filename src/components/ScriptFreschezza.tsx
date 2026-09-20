/**
 * Nasconde le date passate PRIMA del primo paint.
 *
 * Deliberatamente non è React: uno useEffect girerebbe dopo l'idratazione e
 * mostrerebbe per un attimo le date scadute, e un filtro in fase di render
 * romperebbe l'idratazione contro l'HTML pre-renderizzato. Questo script viene
 * eseguito dal parser, subito dopo il markup che tocca.
 *
 * Nessuna dipendenza dal bundle: funziona anche se il JS di Next non arriva.
 *
 * La regola non è "non toccare `hidden`": è che lo script può toccare SOLO
 * `element.style`. Mai un attributo, mai il testo, mai una classe — tutto il
 * resto appartiene a React, che lo emette lui stesso in JSX. Qualsiasi altra
 * mutazione produce un mismatch in fase di idratazione, e React 19 risponde
 * scartando l'HTML lato server per quel sottoalbero e ricostruendolo da zero:
 * i nodi nuovi non portano lo stile in linea che lo script aveva impostato, e
 * le modifiche svaniscono un istante dopo essere apparse. `element.style` è
 * l'unica via sicura perché React non lo gestisce finché il componente non
 * passa una prop `style` — nessuno dei componenti coinvolti lo fa.
 *
 * Il fuso è quello di Roma e non UTC: fra mezzanotte e le due, `toISOString()`
 * nomina ancora il giorno prima e il mercato di oggi sparirebbe. È la stessa
 * regola di `oggiRoma()` in `src/lib/date.ts`, riscritta qui in ES5 perché
 * questo gira prima di qualunque bundle. La doppia copia è voluta.
 */
const SCRIPT = `(function(){
try{
var oggi=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Rome'});
var mostra=function(el){if(el){el.style.display='block';}};
var nascondi=function(el){if(el){el.style.display='none';}};

var righe=document.querySelectorAll('[data-elenco-date] li[data-fine]');
for(var i=0;i<righe.length;i++){if(righe[i].dataset.fine<oggi){nascondi(righe[i]);}}

var mesi=document.querySelectorAll('[data-gruppo-mese]');
var restano=0;
for(var j=0;j<mesi.length;j++){
  var viva=false, l=mesi[j].querySelectorAll('li[data-fine]');
  for(var m=0;m<l.length;m++){if(l[m].style.display!=='none'){viva=true;break;}}
  if(viva){restano++;}else{nascondi(mesi[j]);}
}

if(restano===0){
  mostra(document.querySelector('[data-nessuna-data]'));
  nascondi(document.querySelector('[data-tutte-le-date]'));
  nascondi(document.querySelector('[data-suggerimento]'));
}
}catch(e){}
})();`;

export function ScriptFreschezza() {
	// La regola noDangerouslySetInnerHtml è disattivata per questo file in
	// biome.json: lo script deve girare durante il parsing, prima dell'idratazione.
	return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
