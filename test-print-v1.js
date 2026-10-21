'use strict';
const $=id=>document.getElementById(id);
const W=1200,H=1800;
let pdfURL=null,pdfWindow=null,pdfReady=false,pdfGeneration=0;
let stream=null,front=false,raw=null,jpeg=null,frame=null,logo=null,db=null,busy=false;
let config={logoWidth:28,logoPosition:'bottom'};
const ui=(id,visible)=>$(id).hidden=!visible;
function status(s){$('status').textContent=s;}
function stop(){if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;}
function decode(src){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Immagine non leggibile.'));i.src=src;});}
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('with-you-instant-print',1);r.onupgradeneeded=()=>r.result.createObjectStore('settings');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function read(key){return new Promise((resolve,reject)=>{const r=db.transaction('settings').objectStore('settings').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function write(key,value){return new Promise((resolve,reject)=>{const tx=db.transaction('settings','readwrite');tx.objectStore('settings').put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
function guides(){$('frameGuide').src=frame?frame.src:'';ui('frameGuide',!!frame&&!raw);$('logoGuide').src=logo?logo.src:'';ui('logoGuide',!!logo&&!raw);$('logoGuide').style.width=config.logoWidth+'%';$('logoGuide').style.top=config.logoPosition==='top'?'3%':'auto';$('logoGuide').style.bottom=config.logoPosition==='bottom'?'3%':'auto';}
function cover(ctx,img){const scale=Math.max(W/img.width,H/img.height);ctx.drawImage(img,(W-img.width*scale)/2,(H-img.height*scale)/2,img.width*scale,img.height*scale);}
function clearPDF(){pdfGeneration++;pdfReady=false;$('pdfPrintFrame').onload=null;$('pdfPrintFrame').src='about:blank';ui('openPDF',false);if(pdfWindow&&!pdfWindow.closed)pdfWindow.close();pdfWindow=null;if(pdfURL)URL.revokeObjectURL(pdfURL);pdfURL=null;}
async function compose(){if(!raw)return;clearPDF(); $('print').disabled=true;const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);cover(ctx,raw);if(frame)ctx.drawImage(frame,0,0,W,H);if(logo){let w=W*config.logoWidth/100,h=w*logo.height/logo.width;if(h>H*.25){w*=H*.25/h;h=H*.25;}ctx.drawImage(logo,(W-w)/2,config.logoPosition==='top'?H*.03:H-H*.03-h,w,h);}jpeg=c.toDataURL('image/jpeg',.95);$('preview').src=jpeg;$('printImage').src=jpeg;await $('printImage').decode();pdfURL=URL.createObjectURL(photoPDF(jpeg));prepareEmbeddedPDF();}
async function start(){if(busy)return;busy=true;$('start').disabled=true;$('snap').disabled=true;stop();try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('Apri l’app da un indirizzo HTTPS in Safari per usare la fotocamera.');stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:front?'user':'environment'},width:{ideal:1800},height:{ideal:2400}}});$('camera').srcObject=stream;await $('camera').play();ui('camera',true);ui('placeholder',false);ui('start',false);ui('snap',true);ui('flip',true);$('snap').disabled=!$('camera').videoWidth;$('step').textContent='01 / SCATTA';$('heading').textContent='Mettiti in posa.';status('La foto viene ritagliata come nell’anteprima.');guides();}catch(e){status(e.name==='NotAllowedError'?'Consenti l’accesso alla fotocamera nelle impostazioni di Safari, poi riprova.':e.message);ui('start',true);ui('snap',false);ui('flip',false);}finally{busy=false;$('start').disabled=false;}}
$('camera').addEventListener('loadeddata',()=>{$('snap').disabled=false;});
async function reset(){clearPDF();raw=null;jpeg=null;$('preview').removeAttribute('src');$('printImage').removeAttribute('src');ui('preview',false);for(const id of ['print','retake','next'])ui(id,false);await start();}
$('start').onclick=start;$('flip').onclick=()=>{front=!front;start();};
$('snap').onclick=async()=>{if(busy||!stream||!$('camera').videoWidth)return;busy=true;$('snap').disabled=true;try{const c=document.createElement('canvas');c.width=$('camera').videoWidth;c.height=$('camera').videoHeight;c.getContext('2d').drawImage($('camera'),0,0);raw=c;await compose();stop();ui('camera',false);ui('placeholder',false);for(const id of ['snap','flip','frameGuide','logoGuide'])ui(id,false);for(const id of ['preview','print','retake','next'])ui(id,true);$('step').textContent='02 / STAMPA';$('heading').textContent='Pronta da tenere.';status('TEST: attendo AirPrint dal PDF incorporato. Se non appare, premi RIPROVA AIRPRINT oppure APRI PDF · METODO SICURO.');}catch(e){status('Composizione non riuscita: '+e.message);}finally{busy=false;$('snap').disabled=false;}};
$('retake').onclick=reset;$('next').onclick=reset;
function tryEmbeddedPrint(){
 if(!pdfReady||!pdfURL){status('Il PDF non è ancora pronto. Usa APRI PDF · METODO SICURO se l’attesa continua.');return;}
 try{
  // Non stampare window: richiedi la stampa esclusivamente del PDF incorporato.
  $('pdfPrintFrame').contentWindow.print();
  status('Richiesta AirPrint inviata al PDF incorporato. Se non appare, usa APRI PDF · METODO SICURO. Controlla una pagina, 10×15 e assenza di intestazioni prima di confermare.');
 }catch(e){status('Safari non permette la stampa del PDF incorporato. Usa APRI PDF · METODO SICURO.');}
}
function prepareEmbeddedPDF(){
 const generation=pdfGeneration;
 ui('openPDF',true);
 const frame=$('pdfPrintFrame');
 frame.onload=()=>{
  if(generation!==pdfGeneration||!pdfURL)return;
  pdfReady=true;$('print').disabled=false;
  if($('autoPrint').checked)tryEmbeddedPrint();
 };
 frame.src=pdfURL;
 status('Preparazione PDF incorporato. Se AirPrint non compare, usa APRI PDF · METODO SICURO.');
}
$('print').onclick=tryEmbeddedPrint;
$('openPDF').onclick=()=>{if(!pdfURL)return;pdfWindow=window.open(pdfURL,'with-you-photo-pdf');if(!pdfWindow){status('Apertura bloccata. Consenti le finestre per questo sito in Safari e riprova.');return;}status('Nel PDF: Condividi → Stampa → carta 10×15 / 4×6, zoom 100%. Chiudi la scheda PDF per tornare qui. Nessun salvataggio richiesto.');};
$('settingsButton').onclick=()=>$('settings').showModal();
async function saveConfig(){try{if(!db)throw new Error();await write('config',config);$('settingsStatus').textContent='Impostazioni salvate su questo dispositivo.';}catch{$('settingsStatus').textContent='Memoria locale non disponibile: impostazioni valide solo fino alla chiusura.';}guides();await compose();}
$('logoWidth').oninput=()=>{config.logoWidth=Number($('logoWidth').value);$('widthValue').textContent=config.logoWidth+'%';guides();};$('logoWidth').onchange=saveConfig;
$('logoPosition').onchange=()=>{config.logoPosition=$('logoPosition').value;saveConfig();};
async function asset(kind,file){if(!file)return;try{if(file.type!=='image/png')throw new Error('Scegli un file PNG.');if(file.size>15*1024*1024)throw new Error('PNG troppo grande: massimo 15 MB.');const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});const img=await decode(src);if(kind==='frame')frame=img;else logo=img;await saveConfig();if(db)await write(kind,src);$('settingsStatus').textContent=kind==='frame'&&img.width/img.height!==2/3?'Cornice caricata. Attenzione: sarà adattata a 1200 × 1800; usa un PNG 2:3 per evitare deformazioni.':'Grafica caricata. '+(db?'Salvata su questo dispositivo.':'Valida fino alla chiusura.');}catch(e){$('settingsStatus').textContent=e.message||'Salvataggio non riuscito: grafica valida solo in questa sessione.';}}
for(const kind of ['frame','logo']){$(kind+'File').onchange=e=>{asset(kind,e.target.files[0]);e.target.value='';};$('remove'+kind[0].toUpperCase()+kind.slice(1)).onclick=async()=>{if(kind==='frame')frame=null;else logo=null;try{if(db)await write(kind,null);}catch{}await saveConfig();};}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(!raw&&$('camera').hidden===false){ui('camera',false);ui('start',true);ui('snap',false);ui('flip',false);status('Fotocamera sospesa. Tocca APRI FOTOCAMERA per riprendere.');}});
window.addEventListener('pagehide',stop);
async function init(){try{db=await openDB();config={...config,...await read('config')};const f=await read('frame'),l=await read('logo');if(f)frame=await decode(f);if(l)logo=await decode(l);}catch{$('settingsStatus').textContent='Memoria locale non disponibile. Le impostazioni potrebbero non restare dopo la chiusura.';}$('logoWidth').value=config.logoWidth;$('widthValue').textContent=config.logoWidth+'%';$('logoPosition').value=config.logoPosition;guides();if(false){try{const reg=await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;const worker=reg.active||navigator.serviceWorker.controller;const channel=new MessageChannel();channel.port1.onmessage=e=>{$('offline').textContent=e.data==='ready'?'App pronta offline · rete locale necessaria per AirPrint':'Offline non pronto: riapri con Internet';};worker.postMessage('check-cache',[channel.port2]);}catch{$('offline').textContent='Offline non disponibile: apri via HTTPS.';}}else $('offline').textContent='PROVA v1 · apri con Internet · nessuna cache offline dedicata';}
init();
