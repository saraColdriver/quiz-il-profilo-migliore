# Il Profilo Migliore - Quiz Interattivo

Quiz interattivo web-based per scoprire a quale personaggio del libro "Il profilo migliore" assomigli di più. L'applicazione presenta due percorsi di domande differenti: uno per chi ha già letto il libro e uno per chi non lo conosce ancora.

## 🚀 Caratteristiche

- **Quiz Personalizzato**: due set di domande diversi in base alla familiarità con il libro
- **Interfaccia Mobile-First**: ottimizzata per dispositivi mobili
- **Randomizzazione Risposte**: le opzioni vengono mescolate casualmente per ogni utente
- **Sistema di Navigazione**: slider interattivo con possibilità di modificare le risposte
- **Calcolo Esito Dinamico**: algoritmo che determina il personaggio più affine
- **Sezione Eventi**: mostra i prossimi appuntamenti di presentazione del libro
- **Salvataggio Dati**: integrazione con Google Sheets per tracciare le risposte

## 🛠️ Tecnologie Utilizzate

- **HTML5**: struttura semantica della pagina
- **CSS3**: styling responsive con animazioni e transizioni
- **JavaScript (Vanilla)**: logica dell'applicazione
- **Swiper.js**: libreria per lo slider delle domande
- **Google Apps Script**: backend per il salvataggio dei dati

## 📋 Struttura del Progetto

```
.
├── index.html          # Struttura HTML principale
├── style.css           # Stili e responsive design
├── script.js           # Logica JavaScript
└── README.md           # Documentazione
```

## 🎮 Come Funziona

1. **Schermata Iniziale**: l'utente inserisce il nome e indica se ha letto il libro
2. **Quiz**: serie di 5 domande con opzioni randomizzate
3. **Invio Risposta**: ogni risposta viene confermata con feedback visivo
4. **Modifica**: possibilità di tornare indietro e modificare le risposte
5. **Risultato**: calcolo automatico del personaggio corrispondente
6. **Salvataggio**: dati salvati su Google Sheets
7. **Eventi**: visualizzazione dei prossimi appuntamenti con l'autrice

## 🎨 Personaggi del Libro

### Per chi ha letto:
- **Monica**: introversa, riflessiva, fedele ai propri valori
- **Carmen**: esuberante, socievole, amante delle sfide
- **Angelo**: attento, sensibile, aperto ai compromessi
- **Fluffy**: pigra, schietta, diretta

### Per chi non ha letto:
- **Monica**: introversa e riflessiva
- **Carmen**: esuberante e socievole
- **Mix**: equilibrio tra i due personaggi principali

## 🔧 Configurazione Google Sheets

Per abilitare il salvataggio dei dati:

1. Crea un nuovo Google Sheets
2. Vai su **Estensioni → Apps Script**
3. Incolla il seguente codice:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.nome,
      data.haLetto,
      data.domanda1,
      data.domanda2,
      data.domanda3,
      data.domanda4,
      data.domanda5,
      data.esito,
      new Date()
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Dati salvati con successo'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Pubblica come **Web App** con accesso "Chiunque"
5. Copia l'URL generato e inseriscilo in `script.js` nella variabile `GOOGLE_SCRIPT_URL`

## 📱 Responsive Design

L'applicazione è ottimizzata per:
- **Mobile**: Design principale, controlli touch-friendly
- **Tablet**: Layout intermedio (768px+)
- **Desktop**: Esperienza completa con effetti hover (992px+)
- **Landscape Mobile**: Adattamento per schermi orizzontali bassi

## 🎯 Funzionalità Avanzate

- **Animazioni Fluide**: Transizioni CSS per un'esperienza premium
- **Progressbar**: Indicatore visivo dell'avanzamento
- **Navigazione Sicura**: Controlli per prevenire doppi invii
- **Area Click Espansa**: Frecce di navigazione cliccabili su tutta l'altezza dello schermo

## 🌐 Browser Supportati

- Chrome/Edge
- Firefox
- Safari
- Opera

## 📄 Licenza

Questo progetto è stato creato per promuovere il libro "Il profilo migliore".
Questo progetto è libero da usare per scopi personali ed educativi.

## 🚀 Come Usare

1. Scarica o clona la repository
2. Apri `index.html` in un browser moderno
3. (Opzionale) Configura Google Sheets per il salvataggio dati
4. Condividi il link per far provare il quiz!

## 🐛 Risoluzione problemi

### Il quiz non funziona
- Controlla la console del browser (F12)
- Verifica che tutti e 3 i file siano caricati correttamente
- Controlla che i nomi dei file siano esatti: `index.html`, `style.css`, `script.js`

### Google Sheets non salva i dati
- Verifica di aver copiato l'URL corretto in `script.js`
- Controlla che l'app web sia configurata con "Chi ha accesso: Chiunque"
- Apri la console del browser per vedere eventuali errori