# WITH YOU INSTANT PRINT

Web app separata per iPad/Safari. Nessuna dipendenza esterna, Apps Script, backend, Drive, QR, mosaico o server MacBook. Giro Frame non è stato modificato.

## Pubblicazione semplice

1. Estrai lo ZIP. La cartella `with-you-instant-print` contiene tutti i file.
2. Su un hosting statico con HTTPS, crea un NUOVO sito o una NUOVA cartella dedicata. Carica insieme index.html, style.css, app.js, sw.js, manifest.webmanifest e icon.png, mantenendo i nomi. Non sostituire file di Giro Frame.
3. Apri su iPad l'indirizzo HTTPS che termina con la cartella dell'app (con `/` finale) o con index.html. Non aprire index.html direttamente da File: fotocamera e offline richiedono un'origine web sicura.
4. Non servono installazioni, compilazioni o servizi per ricevere foto. L'hosting serve solo a distribuire i file statici. Eventuali normali log dell'hosting non contengono le immagini, che l'app non invia.

## Installazione e preparazione iPad

1. Apri l'indirizzo in Safari con Internet disponibile.
2. Condividi → Aggiungi alla schermata Home (se richiesto abilita “Apri come app web”). Avvia l'app dalla nuova icona.
3. Aspetta “App pronta offline”. Safari e app dalla Home possono avere archivi distinti: configura la grafica nella modalità che userai durante l'evento.
4. Impostazioni → scegli cornice PNG trasparente 1200 × 1800 e logo PNG trasparente. Regola larghezza e posizione del logo. Non sono inclusi asset ufficiali di branding: carica i tuoi originali. Se la cornice contiene già il logo, lascia vuoto il logo separato.
5. Consenti la fotocamera quando richiesto. La fotocamera posteriore è preferita; “Cambia fotocamera” richiede quella frontale. La disponibilità dipende dal dispositivo.
6. Collega iPad e stampante AirPrint alla stessa rete Wi-Fi. Il router può funzionare senza Internet, purché consenta la comunicazione locale e AirPrint/Bonjour.

## Uso

APRI FOTOCAMERA → SCATTA FOTO → anteprima del JPEG → RIFAI FOTO oppure STAMPA FOTO → seleziona stampante, carta e copie e conferma manualmente → NUOVA FOTO.

La foto viene centrata e ritagliata in 2:3. La cornice viene adattata all'intero formato; il logo viene applicato sopra la cornice. Il composito è JPEG 1200 × 1800, qualità 95%. Il foglio di stampa contiene solo quel JPEG. Il formato CSS suggerito è 4 × 6 pollici (300 ppi); non è un comando obbligatorio per la stampante. Nessun download e nessun salvataggio automatico in Foto.

La foto resta nella memoria della pagina fino a RIFAI FOTO, NUOVA FOTO o chiusura/ricaricamento. L'app non la conserva in IndexedDB, cache o localStorage. Il sistema operativo e la stampante possono mantenere temporaneamente dati di anteprima o coda di stampa: l'app non può controllarli.

Cornice, logo e impostazioni vengono conservati in IndexedDB locale. Non usare navigazione privata. La cancellazione dei dati del sito rimuove grafica e offline. Il cambio indirizzo crea un archivio distinto. iPadOS può liberare memoria e cache: conserva gli originali della grafica per ricaricarli.

## Safari / AirPrint: fattibilità e limiti

La strada tecnica è standard: canvas → composizione JPEG → immagine già decodificata nel documento → window.print() con CSS di stampa. Il pulsante viene abilitato solo quando il JPEG è pronto. Safari supporta la stampa di pagine con immagini tramite AirPrint.

Non è possibile scegliere in modo silenzioso una stampante, saltare la conferma, conoscere l'esito fisico, assicurare il numero di copie o forzare carta e stampa senza bordi. Dopo aver richiesto la stampa l'app NON dichiara “stampata”: annullamento e successo non sono distinguibili in modo affidabile.

La richiesta @page 4 × 6 pollici può essere ignorata o adattata da Safari/driver. Scegli carta fotografica compatibile, verticale, una copia e controlla l'anteprima. Margini, tagli e colori dipendono dalla stampante. Una stampante USB priva di AirPrint nativo non è sufficiente con questa architettura.

Se la finestra non appare nella versione installata, prova lo stesso sito direttamente in Safari e ripeti STAMPA FOTO. Come ulteriore percorso manuale, Safari → Condividi → Stampa usa lo stesso foglio di stampa. Non scegliere NUOVA FOTO prima di aver concluso la finestra.

## Offline

Il service worker conserva solo i file dell'app; cornice e logo sono locali. Dopo il primo caricamento completato, l'app può riaprirsi senza Internet. L'installazione non garantisce che iPadOS conservi i file per sempre. La rete Wi-Fi locale resta necessaria per AirPrint anche quando Internet è spento. Prova riapertura, fotocamera e stampa nelle condizioni reali dell'evento.

Per un aggiornamento, modifica anche il numero CACHE in sw.js (es. v2); pubblica tutti i file insieme, chiudi ogni finestra dell'app e riapri dopo il download. Non cancellare i dati del sito se vuoi mantenere la grafica.

## Verifiche prima dell'evento

- Controlli di sintassi JavaScript superati; apertura interfaccia e impostazioni locali verificate in browser desktop, cache offline risultata pronta.
- Non è stata eseguita una stampa fisica da iPad/AirPrint in questo ambiente. Non considerare verificati margini, foglio singolo o compatibilità della tua stampante senza la prova seguente.
- Su iPad scatta una foto con dettagli agli angoli. Verifica sovrapposizione cornice/logo e orientamento. Stampa una copia: l'anteprima deve contenere un solo foglio con la sola foto.
- Prova annullamento stampa, RIFAI FOTO e NUOVA FOTO. Verifica che la foto precedente sparisca.
- Chiudi e riapri dalla Home: grafica e impostazioni devono restare. Disattiva Internet mantenendo il Wi-Fi locale e ripeti uno scatto e una stampa.
- Prova anche dopo blocco schermo: al ritorno la fotocamera richiede APRI FOTOCAMERA.

## Fonti tecniche

- Apple, uso AirPrint da iPad: https://support.apple.com/en-ie/109349
- MDN, window.print(): https://developer.mozilla.org/en-US/docs/Web/API/Window/print
- MDN, fotocamera e HTTPS: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

Istruzioni aggiornate al 21 ottobre 2026. File realizzati senza dipendenze da CDN, font remoti o strumenti di analisi.

## Aggiornamento stampa v2 — pagina piena 4×6

Il foglio di stampa ora richiede 4×6 pollici e la foto occupa l'intera pagina logica esposta da Safari. Questo evita il riquadro fisso 10×15 dentro una pagina A4, che può produrre una foto piccola quando AirPrint riduce il documento. Il riempimento usa un ritaglio centrale: se Safari mantiene una pagina di proporzioni diverse da 2:3, una parte della cornice può essere tagliata. Non forza la stampa senza bordi né il formato comunicato dal dispositivo AirPrint.

Per aggiornare GitHub carica tutti i file della nuova cartella sopra quelli esistenti e conferma Commit changes. Attendi la pubblicazione Pages. Con Internet attivo, apri l'app e poi chiudi TUTTE le sue finestre, sia Safari sia quella dalla Home. Riapri; se necessario ripeti apertura e chiusura perché il nuovo service worker si attivi. Non cancellare i dati del sito: perderesti cornice e logo. La cache v2 sostituisce la v1 dopo l'attivazione.

Esegui una sola stampa di prova. Controlla dimensioni, bordi, taglio della cornice e numero di pagine. Questa modifica non è stata verificata fisicamente su RX1H2/iPad. Se resta piccola, occorre controllare la configurazione del dispositivo che espone la stampante ad AirPrint; un ulteriore ingrandimento arbitrario può solo tagliare l'immagine.
