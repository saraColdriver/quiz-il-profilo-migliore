// CONFIGURAZIONE GOOGLE SHEETS
// Sostituisci questo URL con quello generato dopo aver pubblicato la nuova versione dello script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw4QgK6jrdE-mba59bIRESCVUoSUsg-4bZjjZg8awjkwkwxt94C4MuqTwSeuLAAnm2FrA/exec';

// VARIABILI GLOBALI
let swiper;
let userData = {
    nome: '',
    email: '',
    haLetto: '',
    consenso: '', // Nuovo campo marketing
    risposte: {},
    esito: ''
};

// Variabili per i dati scaricati
let domande = []; // Le domande che l'utente sta affrontando (filtrate)
let domandeLettoLibro = []; // Cache domande "Letto"
let domandeNonLettoLibro = []; // Cache domande "Non Letto"
let eventiData = []; // Cache eventi

let buttonSubmitted = {}; // Tiene traccia delle risposte date

// ORDINE RANDOMIZZATO RISPOSTE
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// INIZIALIZZAZIONE
async function init() {
    // Mostra messaggio di caricamento
    const wrapper = document.getElementById('swiperWrapper');
    if(wrapper) {
        wrapper.innerHTML = '<div class="swiper-slide" style="color:white; font-size:1.2rem;">Caricamento Quiz...</div>';
    }

    try {
        await scaricaDatiDaGoogleSheet();
        generaSchermataWelcome();
        initSwiper();
    } catch (e) {
        console.error(e);
        if(wrapper) {
            wrapper.innerHTML = '<div class="swiper-slide" style="color:white; padding:20px; text-align:center;">Errore di caricamento dati.<br>Controlla la connessione o l\'URL dello script.</div>';
        }
    }
}

// SCARICA DATI DA GOOGLE SHEET (Backend)
async function scaricaDatiDaGoogleSheet() {
    // Se l'URL non è impostato, usa dati di fallback vuoti per non bloccare tutto (o mostra errore)
    if (GOOGLE_SCRIPT_URL.includes('INSERISCI_QUI')) {
        console.warn('URL Google Script non configurato.');
        return;
    }

    const response = await fetch(GOOGLE_SCRIPT_URL);
    if (!response.ok) throw new Error("Errore network");
    
    const data = await response.json();
    
    // 1. Salviamo gli eventi
    eventiData = data.eventi || []; 

    // 2. Processiamo le domande
    const tutteLeDomande = data.domande || [];
    
    // Filtriamo e ordiniamo per ID
    domandeLettoLibro = tutteLeDomande
        .filter(d => d.target === 'Letto')
        .sort((a, b) => a.id - b.id);
        
    domandeNonLettoLibro = tutteLeDomande
        .filter(d => d.target === 'NonLetto')
        .sort((a, b) => a.id - b.id);
        
    console.log("Dati scaricati con successo.");
}

// GENERA SCHERMATA WELCOME
function generaSchermataWelcome() {
    const wrapper = document.getElementById('swiperWrapper');

    const slideHTML = `
        <article class="swiper-slide">
            <div class="container">
                <div class="question-container">
                    <h3>Benvenuto nel quiz</h3>
                    <h4>Che personaggio de <br>"Il profilo migliore" sei?</h4>
                    <form id="welcomeForm">
                       <input type="text" id="username" placeholder="Inserisci il tuo nome" required>
                       <input type="email" id="useremail" placeholder="Inserisci la tua email" required>
                       
                       <div style="text-align: left; margin: 15px auto; max-width: 300px; font-size: 0.85rem; color: #fff;">
                           <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
                               <input type="checkbox" id="marketingConsent" style="width: 20px; height: 20px; accent-color: #dc3545; flex-shrink: 0; margin-top: 2px;">
                               <span style="line-height: 1.3;">Acconsento a essere ricontattato/a per futuri quiz, novità editoriali o iniziative legate al libro.</span>
                           </label>
                       </div>

                        <h1 style="margin-top: 25px;">Hai letto il libro<br>"Il profilo migliore?"</h1>
                        <div class="option">
                            <input type="radio" name="letto" id="si" value="si">
                            <label for="si">Sì</label>
                        </div>
                        <div class="option">
                            <input type="radio" name="letto" id="no" value="no" checked>
                            <label for="no">No</label>
                        </div>
                        <button type="submit">Inizia il Quiz</button>
                    </form>
                </div>
            </div>
        </article>
    `;

    wrapper.innerHTML = slideHTML;

    aggiungiClickOpzioni();

    // Event listener per il form iniziale
    document.getElementById('welcomeForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('username').value.trim();
        const email = document.getElementById('useremail').value.trim();
        const haLetto = document.querySelector('input[name="letto"]:checked').value;
        const consenso = document.getElementById('marketingConsent').checked;

        if (!nome || !email) {
            alert('Per favore, inserisci il tuo nome e la tua email.');
            return;
        }

        // Salvataggio dati utente
        userData.nome = nome;
        userData.email = email;
        userData.haLetto = haLetto === 'si' ? 'Sì' : 'No';
        userData.consenso = consenso ? 'Sì' : 'No';

        // Seleziona le domande in base alla scelta
        domande = haLetto === 'si' ? domandeLettoLibro : domandeNonLettoLibro;

        if (domande.length === 0) {
            alert("Nessuna domanda trovata per questa selezione. Controlla il Google Sheet.");
            return;
        }

        // Genera le slide successive
        generaDomandeSlides();

        // Vai alla prima domanda
        swiper.slideNext();
    });
}

// GENERA SLIDES DOMANDE
function generaDomandeSlides() {
    const wrapper = document.getElementById('swiperWrapper');

    domande.forEach((domanda) => {
        // Randomizza le opzioni per ogni domanda
        const opzioniShuffled = shuffleArray(domanda.opzioni);

        const opzioniHTML = opzioniShuffled.map(opzione => `
            <div class="option" data-value="${opzione.id}">
                <input type="radio" name="q${domanda.id}" id="q${domanda.id}-${opzione.id}" value="${opzione.id}">
                <label for="q${domanda.id}-${opzione.id}">${opzione.testo}</label>
            </div>
        `).join('');

        const slideHTML = `
            <article class="swiper-slide">
                <div class="container">
                    <div class="question-container">
                        <p>Domanda ${domanda.id}</p>
                        <h2>${domanda.domanda}</h2>
                        ${opzioniHTML}
                        <button id="btn-q${domanda.id}" disabled>Invia</button>
                    </div>
                </div>
            </article>
        `;

        wrapper.insertAdjacentHTML('beforeend', slideHTML);
    });

    // Slide Esito (Finale)
    const esitoSlideHTML = `
        <article class="swiper-slide">
            <div class="container">
                <div class="question-container">
                    <div id="esito-wrapper">
                        <div id="esito">Calcolo del risultato...</div>
                    </div>
                    <div id="eventi-wrapper" class="d-none">
                        <div class="eventi-dettagli">
                           </div>
                    </div>
                    <button id="btn-eventi" class="btn-eventi">Scopri le prossime presentazioni</button>
                </div>
            </div>
        </article>
    `;
    wrapper.insertAdjacentHTML('beforeend', esitoSlideHTML);

    // Aggiorna Swiper per riconoscere le nuove slide
    swiper.update();

    // Attiva la logica dei bottoni
    aggiungiEventListeners();
}

// AGGIUNGI CLICK SULLE OPZIONI (UX Migliorata)
function aggiungiClickOpzioni() {
    // Usiamo event delegation sul document per gestire anche elementi creati dinamicamente
    document.addEventListener('click', function (e) {
        const option = e.target.closest('.option');
        if (option) {
            const radio = option.querySelector('input[type="radio"]');
            if (radio && !radio.disabled) {
                radio.checked = true;
                // Dispara l'evento change manualmente
                radio.dispatchEvent(new Event('change'));
            }
        }
    });
}

// RIPRISTINA STATO MODIFICA (Quando torni indietro)
function ripristinaStatoModifica(domanda) {
    const radioInputs = document.querySelectorAll(`input[name="q${domanda.id}"]`);
    const submitBtn = document.getElementById(`btn-q${domanda.id}`);

    // Se la domanda era già stata risposta
    if (buttonSubmitted[`q${domanda.id}`]) {
        // Mantieni i radio DISABILITATI
        radioInputs.forEach(input => {
            input.disabled = true;
            input.parentElement.classList.add('disabled-option');
        });

        // Mostra bottone "Modifica"
        submitBtn.textContent = 'Modifica risposta';
        submitBtn.classList.remove('submitted');
        submitBtn.classList.add('modifica');
        submitBtn.disabled = false;

        // Ripristina la selezione visiva
        const valoreSelezionato = userData.risposte[`domanda${domanda.id}`];
        if (valoreSelezionato) {
            const radioCorrente = document.querySelector(
                `input[name="q${domanda.id}"][value="${valoreSelezionato}"]`
            );
            if (radioCorrente) {
                radioCorrente.checked = true;
            }
        }
        
        // Mostra freccia next (l'utente può andare avanti senza modificare)
        const nextBtn = document.querySelector('.swiper-button-next');
        nextBtn.classList.remove('d-none');
    }
}

// GESTIONE EVENT LISTENERS E NAVIGAZIONE
function aggiungiEventListeners() {
    const nextBtn = document.querySelector('.swiper-button-next');
    
    domande.forEach(domanda => {
        const radioInputs = document.querySelectorAll(`input[name="q${domanda.id}"]`);
        const submitBtn = document.getElementById(`btn-q${domanda.id}`);

        // Abilita bottone quando radio selezionato
        radioInputs.forEach(input => {
            input.addEventListener('change', () => {
                submitBtn.disabled = false;
                if (!submitBtn.textContent.includes('Invia') || submitBtn.classList.contains('submitted')) {
                    submitBtn.textContent = 'Invia';
                    submitBtn.classList.remove('submitted', 'modifica');
                }
            });
        });

        // Click Bottone Principale (Invia / Modifica)
        submitBtn.addEventListener('click', () => {
            
            // CASO 1: Modalità Modifica -> Riabilita tutto
            if (submitBtn.classList.contains('modifica')) {
                radioInputs.forEach(input => {
                    input.disabled = false;
                    input.parentElement.classList.remove('disabled-option');
                });
                submitBtn.textContent = 'Invia';
                submitBtn.classList.remove('modifica');
                buttonSubmitted[`q${domanda.id}`] = false;
                
                // Nascondi freccia avanti finché non riconferma
                nextBtn.classList.add('d-none');
                return;
            }

            // CASO 2: Invio Risposta
            const selected = document.querySelector(`input[name="q${domanda.id}"]:checked`);
            if (!selected) return;

            // Evita doppi click
            if (buttonSubmitted[`q${domanda.id}`]) return;

            // Salva risposta
            userData.risposte[`domanda${domanda.id}`] = selected.value;

            // UI Feedback
            buttonSubmitted[`q${domanda.id}`] = true;
            submitBtn.classList.remove('modifica');
            submitBtn.classList.add('submitted');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Inviato'; // ✓ aggiunto via CSS

            // Blocca opzioni
            radioInputs.forEach(input => input.disabled = true);

            // Logica Ultima Domanda
            if (domanda.id === domande.length) {
                calcolaEsito();
                salvaRisposte();
            }

            // --- NAVIGAZIONE AUTOMATICA ---
            // Aspetta 700ms per far vedere "Inviato" e poi vai avanti
            setTimeout(() => {
                swiper.slideNext();
            }, 700);
        });
    });

    // Nascondi bottone next manuale quando si cambia slide (reset UI)
    nextBtn.addEventListener('click', () => {
        nextBtn.classList.add('d-none');
    });

    // Gestione cambio slide
    swiper.on('slideChange', function () {
        const currentIndex = swiper.activeIndex;

        // Nascondi sempre la freccia avanti al cambio slide
        nextBtn.classList.add('d-none');

        // Se siamo su una slide domanda, gestisci lo stato (modifica/invia)
        if (currentIndex > 0 && currentIndex <= domande.length) {
            const domandaCorrente = domande[currentIndex - 1];
            ripristinaStatoModifica(domandaCorrente);
        }
    });
}

// CALCOLA ESITO
function calcolaEsito() {
    const risposte = Object.values(userData.risposte);

    if (userData.haLetto === 'Sì') {
        // --- LOGICA LETTO LIBRO ---
        const conteggioRisposte = {};
        risposte.forEach(risposta => {
            conteggioRisposte[risposta] = (conteggioRisposte[risposta] || 0) + 1;
        });

        const maxOccorrenze = Math.max(...Object.values(conteggioRisposte));
        const risposteMax = Object.keys(conteggioRisposte).filter(
            risposta => conteggioRisposte[risposta] === maxOccorrenze
        );

        const nomiPersonaggi = {
            'M': 'Monica',
            'C': 'Carmen',
            'A': 'Angelo',
            'F': 'Fluffy'
        };

        const personaggi = risposteMax.map(r => nomiPersonaggi[r]).filter(Boolean);
        let fraseEsito = "";
        let testoEsito = "";

        if (personaggi.length === 1) {
            switch (personaggi[0]) {
                case 'Monica':
                    testoEsito = "Una persona introversa e riflessiva, pronta a difendere a tutti i costi i propri valori e la propria identità. Non ti piace omologarti e trovi nei tuoi pensieri e nelle tue certezze un rifugio sicuro";
                    break;
                case 'Carmen':
                    testoEsito = "Una persona esuberante, fresca e socievole. L'ignoto non ti spaventa. Sei sempre alla ricerca di nuove sfide, nuove avventure, possibilmente lontano da casa e dalla tua comfort zone.";
                    break;
                case 'Angelo':
                    testoEsito = "Sei attento, sensibile e dolce. Non hai paura a mostrarti per ciò che sei, ma a volte sai che i compromessi, nella vita, sono necessari.";
                    break;
                case 'Fluffy':
                    testoEsito = "Inguaribilmente pigra, non badi all'apparenza. Sei una persona schietta e diretta, ma spesso non hai ben chiari i tuoi confini.";
                    break;
            }
            fraseEsito = `<strong>Sei sicuramente ${personaggi[0]}!</strong> <br> ${testoEsito}`;
        } else if (personaggi.length === 2) {
            // Logica combinazioni (semplificata per brevità, espandibile come originale)
            const p1 = personaggi[0];
            const p2 = personaggi[1];
            
            if (personaggi.includes('Monica') && personaggi.includes('Carmen')) {
                testoEsito = "A seconda dei contesti sai essere timida o estroversa, cauta o ribelle.";
            } else {
                testoEsito = "Un mix affascinante di personalità che ti rende unico.";
            }
            fraseEsito = `<strong>Sei un mix tra ${p1} e ${p2}!</strong> <br> ${testoEsito}`;
        } else {
            testoEsito = "Potresti trovare una parte di te stesso in ognuno dei personaggi della storia.";
            fraseEsito = `<strong>Sei un po' di tutto!</strong> <br> ${testoEsito}`;
        }
        userData.esito = fraseEsito;

    } else {
        // --- LOGICA NON LETTO LIBRO ---
        const m = risposte.filter(el => el === 'M').length;
        const c = risposte.filter(el => el === 'C').length;
        const z = risposte.filter(el => el === 'Z').length;

        if (z >= c && z >= m) {
            userData.esito = "<strong>Sei un po' Monica e un po' Carmen.</strong> <br>Sai essere timida quanto estroversa, cauta quanto ribelle.";
        } else if (c > z && c >= m) {
            userData.esito = "<strong>Sei Carmen.</strong> <br>Esuberante, fresca e socievole. L'ignoto non ti spaventa.";
        } else if (m > z && m >= c) {
            userData.esito = "<strong>Sei Monica.</strong> <br>Introversa e riflessiva, pronta a difendere i propri valori.";
        } else {
            userData.esito = "Profilo equilibrato.";
        }
    }

    // Render Esito
    const esitoEl = document.getElementById('esito');
    if(esitoEl) esitoEl.innerHTML = userData.esito;

    caricaEventi(); // Mostra gli eventi (da cache)

    const esitoWrapper = document.getElementById('esito-wrapper');
    if(esitoWrapper) esitoWrapper.classList.add('fade-in');

    // Gestione bottone eventi finale
    setTimeout(() => {
        const btnEventi = document.getElementById('btn-eventi');
        if(btnEventi) {
            btnEventi.classList.add('visible');
            let mostraEventi = false;
            
            btnEventi.addEventListener('click', () => {
                const esitoW = document.getElementById('esito-wrapper');
                const eventiW = document.getElementById('eventi-wrapper');
                
                if (!mostraEventi) {
                    esitoW.classList.add('d-none');
                    eventiW.classList.remove('d-none');
                    btnEventi.textContent = 'Torna al risultato';
                    mostraEventi = true;
                } else {
                    eventiW.classList.add('d-none');
                    esitoW.classList.remove('d-none');
                    btnEventi.textContent = 'Scopri le prossime presentazioni';
                    mostraEventi = false;
                }
            });
        }
    }, 1000);
}

// SALVA RISPOSTE (Invia al backend)
async function salvaRisposte() {
    if (GOOGLE_SCRIPT_URL.includes('INSERISCI_QUI')) return;

    try {
        const datiDaInviare = {
            nome: userData.nome,
            email: userData.email,
            haLetto: userData.haLetto,
            consenso: userData.consenso, // Invio consenso
            domanda1: userData.risposte.domanda1 || '',
            domanda2: userData.risposte.domanda2 || '',
            domanda3: userData.risposte.domanda3 || '',
            domanda4: userData.risposte.domanda4 || '',
            domanda5: userData.risposte.domanda5 || '',
            esito: userData.esito
        };

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datiDaInviare)
        });
        console.log('Dati salvati.');
    } catch (error) {
        console.error('Errore salvataggio:', error);
    }
}

// CARICA EVENTI (Dalla cache)
function caricaEventi() {
    const container = document.querySelector('.eventi-dettagli');
    if(!container) return;

    container.innerHTML = '<h3>Prossimi appuntamenti</h3>';

    if (!eventiData || eventiData.length === 0) {
        container.insertAdjacentHTML('beforeend', '<p style="text-align:center">Nessun evento in programma.</p>');
        return;
    }

    eventiData.forEach(evento => {
        if(!evento.luogo) return;
        const htmlEvento = `
            <article class="evento-item">
                <h4 class="luogo">
                    <a class="a-luogo" href="${evento.linkSito || '#'}" target="_blank">🏢 ${evento.luogo}</a>
                </h4>
                <p><strong>📍 ${evento.citta}</strong></p>
                <time>${evento.data}</time>
                <p class="p-luogo">
                    <a class="a-luogo" href="${evento.linkMappa || '#'}" target="_blank">${evento.indirizzo}</a>
                </p>
            </article>
        `;
        container.insertAdjacentHTML('beforeend', htmlEvento);
    });
}

// INIZIALIZZA SWIPER
function initSwiper() {
    swiper = new Swiper(".mySwiper", {
        cssMode: false,
        allowTouchMove: false,
        simulateTouch: false,
        touchRatio: 0,
        pagination: {
            el: ".swiper-pagination",
            type: "progressbar",
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        keyboard: false,
        speed: 500
    });
}

// AVVIO APPLICAZIONE
document.addEventListener('DOMContentLoaded', init);