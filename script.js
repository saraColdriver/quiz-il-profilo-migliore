// CONFIGURAZIONE GOOGLE SHEETS
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx3j0bb_a4m4vG3g4LG_AZArwLkt2ebmXpy2u6_VR_sH-CsPdgl-dK-tJiFLnIKFC1tag/exec';

// DATI UTENTE
let userData = {
    nome: '',
    email: '',
    haLetto: '',
    risposte: {},
    esito: ''
};

// DOMANDE PER CHI HA LETTO IL LIBRO
const domandeLettoLibro = [
    {
        id: 1,
        domanda: "Che rapporto hai con il tuo passato?",
        opzioni: [
            { id: 'M', testo: "Mi fa male e non sono ancora riuscito a superarlo" },
            { id: 'C', testo: "Passato? Io vivo nel presente!" },
            { id: 'A', testo: "Il passato è una grande lezione" },
            { id: 'F', testo: "Non ho mai riflettuto su questo" }
        ]
    },
    {
        id: 2,
        domanda: "Che rapporto hai con il mondo esterno?",
        opzioni: [
            { id: 'M', testo: "La mia mente è il mio rifugio sicuro" },
            { id: 'C', testo: "Mi piace stare al centro dell'attenzione e relazionarmi con le persone" },
            { id: 'A', testo: "Ciò che succede fuori è importante, ma sono focalizzato su me stesso" },
            { id: 'F', testo: "Non seguo le tendenze, mi piace ispirare gli altri" }
        ]
    },
    {
        id: 3,
        domanda: "In quale di queste situazioni non vorresti mai trovarti?",
        opzioni: [
            { id: 'M', testo: "Fare un lavoro che detesto" },
            { id: 'C', testo: "Scegliere tra vita personale e carriera" },
            { id: 'A', testo: "Vivere un'esistenza fatta di compromessi" },
            { id: 'F', testo: "Rinunciare alla mia personalità e alle mie idee" }
        ]
    },
    {
        id: 4,
        domanda: "Quale frase, tra queste, ti rappresenta di più?",
        opzioni: [
            { id: 'M', testo: "Mi piace vivere con la testa fra le nuvole" },
            { id: 'C', testo: "Mi piace provare emozioni nuove" },
            { id: 'A', testo: "Mi piace coltivare le mie passioni" },
            { id: 'F', testo: "Mi piace rompere gli schemi" }
        ]
    },
    {
        id: 5,
        domanda: "Hai un ultimo tentativo per provare a risolvere un problema. Come ti comporti?",
        opzioni: [
            { id: 'M', testo: "Aspetti finché la situazione non è più rimandabile" },
            { id: 'C', testo: "Non esiste l'ultima volta!" },
            { id: 'A', testo: "Presterò attenzione a tutte le mie mosse" },
            { id: 'F', testo: "Nei problemi ci navigo, è un'abitudine" }
        ]
    }
];

// DOMANDE PER CHI NON HA LETTO IL LIBRO
const domandeNonLettoLibro = [
    {
        id: 1,
        domanda: "Ti reputi una persona:",
        opzioni: [
            { id: 'M', testo: "Introversa" },
            { id: 'C', testo: "Estroversa" },
            { id: 'Z', testo: "Dipende dalle situazioni" }
        ]
    },
    {
        id: 2,
        domanda: "Quale valore, tra questi, metteresti al primo posto?",
        opzioni: [
            { id: 'M', testo: "Lealtà" },
            { id: 'C', testo: "Realizzazione personale" },
            { id: 'Z', testo: "Amicizia" }
        ]
    },
    {
        id: 3,
        domanda: "Quale frase ti rappresenta di più?",
        opzioni: [
            { id: 'M', testo: "Essere, non apparire" },
            { id: 'C', testo: "La vita è fatta di occasioni da cogliere" },
            { id: 'Z', testo: "Senza i miei migliori amici, niente sarebbe lo stesso" }
        ]
    },
    {
        id: 4,
        domanda: "I cambiamenti:",
        opzioni: [
            { id: 'M', testo: "Non esistono" },
            { id: 'C', testo: "Rappresentano una sfida" },
            { id: 'Z', testo: "Mi spaventano" }
        ]
    },
    {
        id: 5,
        domanda: "Che rapporto hai con i social media?",
        opzioni: [
            { id: 'M', testo: "Social media? What?" },
            { id: 'C', testo: "Non potrei farne a meno" },
            { id: 'Z', testo: "Li uso, ma con moderazione" }
        ]
    }
];

// VARIABILI GLOBALI
let swiper;
let domande = [];
let buttonSubmitted = {};

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
function init() {
    generaSchermataWelcome();
    initSwiper();
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
                        <h1 style="margin-top: 30px;">Hai letto il libro<br>"Il profilo migliore?"</h1>
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

    // Event listener per il form
    document.getElementById('welcomeForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('username').value.trim();
        const email = document.getElementById('useremail').value.trim();
        const haLetto = document.querySelector('input[name="letto"]:checked').value;

        if (!nome || !email) {
            alert('Per favore, inserisci il tuo nome e la tua email.');
            return;
        }

        userData.nome = nome;
        userData.email = email;
        userData.haLetto = haLetto === 'si' ? 'Sì' : 'No';

        // Seleziona le domande giuste
        domande = haLetto === 'si' ? domandeLettoLibro : domandeNonLettoLibro;

        // Genera le slide delle domande
        generaDomandeSlides();

        // Vai alla prossima slide
        swiper.slideNext();
    });
}

// GENERA SLIDES DOMANDE
function generaDomandeSlides() {
    const wrapper = document.getElementById('swiperWrapper');

    domande.forEach((domanda, index) => {

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

    // Aggiungi slide esito
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

    // Aggiorna Swiper
    swiper.update();

    // Aggiungi event listeners
    aggiungiEventListeners();
}

// AGGIUNGI CLICK SULLE OPZIONI
function aggiungiClickOpzioni() {
    document.addEventListener('click', function (e) {
        const option = e.target.closest('.option');
        if (option) {
            const radio = option.querySelector('input[type="radio"]');
            if (radio && !radio.disabled) {
                radio.checked = true;

                radio.dispatchEvent(new Event('change'));
            }
        }
    });
}

// RIPRISTINA STATO MODIFICA
function ripristinaStatoModifica(domanda) {
    const radioInputs = document.querySelectorAll(`input[name="q${domanda.id}"]`);
    const submitBtn = document.getElementById(`btn-q${domanda.id}`);

    // Se la domanda era già stata risposta
    if (buttonSubmitted[`q${domanda.id}`]) {
        // Mantieni i radio DISABILITATI (bloccati)
        radioInputs.forEach(input => {
            input.disabled = true;
            // Forza il browser a riconoscere lo stato disabled
            input.parentElement.classList.add('disabled-option');
        });

        // Mostra bottone giallo "Modifica risposta"
        submitBtn.textContent = 'Modifica risposta';
        submitBtn.classList.remove('submitted');
        submitBtn.classList.add('modifica');
        submitBtn.disabled = false;

        // Ricontrolla il radio precedentemente selezionato
        const valoreSelezionato = userData.risposte[`domanda${domanda.id}`];
        if (valoreSelezionato) {
            const radioCorrente = document.querySelector(
                `input[name="q${domanda.id}"][value="${valoreSelezionato}"]`
            );
            if (radioCorrente) {
                radioCorrente.checked = true;
            }
        }

        // Mostra la freccia avanti (puoi proseguire senza modificare)
        const nextBtn = document.querySelector('.swiper-button-next');
        nextBtn.classList.remove('d-none');
    }
}

// AGGIUNGI EVENT LISTENERS
function aggiungiEventListeners() {
    const nextBtn = document.querySelector('.swiper-button-next');
    const prevBtn = document.querySelector('.swiper-button-prev');

    domande.forEach(domanda => {
        const radioInputs = document.querySelectorAll(`input[name="q${domanda.id}"]`);
        const submitBtn = document.getElementById(`btn-q${domanda.id}`);

        // Abilita bottone quando radio selezionato
        radioInputs.forEach(input => {
            input.addEventListener('change', () => {
                // Abilita sempre il bottone quando selezioni un radio
                submitBtn.disabled = false;

                // Se il bottone non è in modalità "Invia", cambialio
                if (!submitBtn.textContent.includes('Invia') || submitBtn.classList.contains('submitted')) {
                    submitBtn.textContent = 'Invia';
                    submitBtn.classList.remove('submitted', 'modifica');
                }
            });
        });

        // Click bottone
        submitBtn.addEventListener('click', () => {
            // CASO 1: Bottone in modalità "Modifica risposta"
            if (submitBtn.classList.contains('modifica')) {
                // Riabilita i radio per permettere modifica
                radioInputs.forEach(input => {
                    input.disabled = false;
                    // Rimuovi la classe che indica opzione disabilitata
                    input.parentElement.classList.remove('disabled-option');
                });

                // Cambia bottone in "Invia"
                submitBtn.textContent = 'Invia';
                submitBtn.classList.remove('modifica');
                buttonSubmitted[`q${domanda.id}`] = false;

                // Nascondi freccia avanti
                nextBtn.classList.add('d-none');

                return;
            }

            // CASO 2: Bottone in modalità "Invia"
            const selected = document.querySelector(`input[name="q${domanda.id}"]:checked`);
            if (!selected) return;

            // Previeni doppio submit
            if (buttonSubmitted[`q${domanda.id}`]) {
                return;
            }

            userData.risposte[`domanda${domanda.id}`] = selected.value;

            // Marca come inviato
            buttonSubmitted[`q${domanda.id}`] = true;
            submitBtn.classList.remove('modifica');
            submitBtn.classList.add('submitted');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Inviato';

            // Disabilita le opzioni
            radioInputs.forEach(input => input.disabled = true);

            // Mostra bottone next
            nextBtn.classList.remove('d-none');

            // Se è l'ultima domanda, calcola esito
            if (domanda.id === domande.length) {
                setTimeout(() => {
                    calcolaEsito();
                    salvaRisposte();
                }, 300);
            }
        });
    });

    // Nascondi bottone next quando si cambia slide
    nextBtn.addEventListener('click', () => {
        nextBtn.classList.add('d-none');
    });

    // Gestione cambio slide - Ripristina stato della slide corrente
    swiper.on('slideChange', function () {
        const currentIndex = swiper.activeIndex;

        // Nascondi sempre la freccia avanti quando cambi slide
        nextBtn.classList.add('d-none');

        // Se siamo su una slide di domanda (non welcome né esito)
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
        // Logica per chi HA letto
        const conteggioRisposte = {};
        risposte.forEach(risposta => {
            conteggioRisposte[risposta] = (conteggioRisposte[risposta] || 0) + 1;
        });

        const maxOccorrenze = Math.max(...Object.values(conteggioRisposte));
        const risposteMax = Object.keys(conteggioRisposte).filter(
            risposta => conteggioRisposte[risposta] === maxOccorrenze
        );

        // Converti lettere in nomi
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
                default:
                    testoEsito = "Errore nell'identificazione del personaggio";
                    break;
            }
            fraseEsito = `<strong>Sei sicuramente ${personaggi[0]}!</strong> <br> ${testoEsito}`;
        } else if (personaggi.length === 2) {
            if (personaggi.includes('Monica') && personaggi.includes('Carmen')) {
                testoEsito = "A seconda dei contesti e delle persone che hai attorno, sai essere una persona tanto timida quanto estroversa, tanto cauta quanto ribelle. Decidi quale lato mostrare e a chi.";
            } else if (personaggi.includes('Monica') && personaggi.includes('Angelo')) {
                testoEsito = "Passione ma anche tanta paura. Provi emozioni autentiche ma a volte hai paura a viverle fino in fondo. Che aspetti?";
            } else if (personaggi.includes('Monica') && personaggi.includes('Fluffy')) {
                testoEsito = "In continua tensione tra chi sei e chi vuoi essere, lotti ogni giorno per emergere e per non cedere a compromessi.";
            } else if (personaggi.includes('Carmen') && personaggi.includes('Angelo')) {
                testoEsito = "Una personalità imprevedibile, spesso troppo istintiva, ma a volte sorprendentemente troppo impulsiva. Le vie di mezzo sono rare.";
            } else if (personaggi.includes('Carmen') && personaggi.includes('Fluffy')) {
                testoEsito = "Hai scelta anche quando ti sembra di non avere più opzioni a disposizione. Non dimenticarlo mai.";
            } else if (personaggi.includes('Angelo') && personaggi.includes('Fluffy')) {
                testoEsito = "Sei disponibile ma riservato, la maggior parte del tempo la passi a cercare di conoscere te stesso e spesso questo ti porta a non vedere cosa succede fuori.";
            } else {
                testoEsito = "Errore nell'identificazione del personaggio";
            }
            fraseEsito = `<strong>Sei un mix tra ${personaggi[0]} e ${personaggi[1]}!</strong> <br> ${testoEsito}`;
        } else {
            testoEsito = "Il profilo migliore è il libro che fa per te perché potresti trovare una parte di te stesso in ognuno dei personaggi della storia. Non sei più curioso, ora?";
            fraseEsito = `<strong>Sei un po' di tutto! Hai caratteristiche di ${personaggi.join(', ')}.</strong> <br> ${testoEsito}`;
        }

        userData.esito = fraseEsito;

    } else {
        // Logica per chi NON ha letto
        const m = risposte.filter(el => el === 'M').length;
        const c = risposte.filter(el => el === 'C').length;
        const z = risposte.filter(el => el === 'Z').length;

        if (z >= c && z >= m) {
            userData.esito = "<strong>Sei un po' Monica e un po' Carmen.</strong> <br>A seconda dei contesti e delle persone che hai attorno, sai essere una persona tanto timida quanto estroversa, tanto cauta quanto ribelle. Decidi quale lato mostrare e a chi.";
        } else if (c > z && c >= m) {
            userData.esito = "<strong>Sei Carmen.</strong> <br>Una persona esuberante, fresca e socievole. L'ignoto non ti spaventa. Sei sempre alla ricerca di nuove sfide, nuove avventure, possibilmente lontano da casa e dalla tua comfort zone.";
        } else if (m > z && m >= c) {
            userData.esito = "<strong>Sei Monica</strong> <br>Una persona introversa e riflessiva, pronta a difendere a tutti i costi i propri valori e la propria identità. Non ti piace omologarti e trovi nei tuoi pensieri e nelle tue certezze un rifugio sicuro.";
        } else {
            userData.esito = "Errore nel calcolo";
        }
    }

    // Mostra esito con animazione
    document.getElementById('esito').innerHTML = userData.esito;

    caricaEventi();

    const esitoWrapper = document.getElementById('esito-wrapper');
    esitoWrapper.classList.add('fade-in');

    // Mostra il bottone eventi dopo 1 secondo
    setTimeout(() => {
        const btnEventi = document.getElementById('btn-eventi');
        btnEventi.classList.add('visible');

        // Aggiungi event listener al bottone eventi
        let mostraEventi = false;
        btnEventi.addEventListener('click', () => {
            const esitoWrapper = document.getElementById('esito-wrapper');
            const eventiWrapper = document.getElementById('eventi-wrapper');

            if (!mostraEventi) {
                // Mostra eventi, nascondi esito
                esitoWrapper.classList.add('d-none');
                eventiWrapper.classList.remove('d-none');
                btnEventi.textContent = 'Torna al risultato';
                mostraEventi = true;
            } else {
                // Mostra esito, nascondi eventi
                eventiWrapper.classList.add('d-none');
                esitoWrapper.classList.remove('d-none');
                btnEventi.textContent = 'Scopri le prossime presentazioni';
                mostraEventi = false;
            }
        });
    }, 1000);
}

// SALVA RISPOSTE SU GOOGLE SHEETS
async function salvaRisposte() {
    // Se l'URL non è configurato, salta il salvataggio
    if (GOOGLE_SCRIPT_URL === 'INSERISCI_QUI_IL_TUO_URL_GOOGLE_SCRIPT') {
        console.log('Google Sheets non configurato. Dati non salvati.');
        return;
    }

    try {
        const datiDaInviare = {
            nome: userData.nome,
            email: userData.email,
            haLetto: userData.haLetto,
            domanda1: userData.risposte.domanda1 || '',
            domanda2: userData.risposte.domanda2 || '',
            domanda3: userData.risposte.domanda3 || '',
            domanda4: userData.risposte.domanda4 || '',
            domanda5: userData.risposte.domanda5 || '',
            esito: userData.esito
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datiDaInviare)
        });

        console.log('Dati inviati a Google Sheets');

    } catch (error) {
        console.error('Errore nel salvataggio su Google Sheets:', error);
    }
}

// CARICA EVENTI
function caricaEventi() {
    const container = document.querySelector('.eventi-dettagli');
    if(!container) return;

    container.innerHTML = '<h3>Prossimi appuntamenti</h3><div id="loading-eventi" style="text-align:center; padding:20px;">Caricamento date...</div>';

    fetch(GOOGLE_SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            const loading = document.getElementById('loading-eventi');
            if(loading) loading.remove();

            if (data.length === 0) {
                container.insertAdjacentHTML('beforeend', '<p style="text-align:center">Nessun evento in programma.</p>');
                return;
            }

            data.forEach(evento => {
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
        })
        .catch(error => console.error('Errore eventi:', error));
}

// INIZIALIZZA SWIPER
function initSwiper() {
    swiper = new Swiper(".mySwiper", {
        cssMode: false,
        allowTouchMove: false,
        simulateTouch: false,
        touchRatio: 0,
        touchStartPreventDefault: false,
        pagination: {
            el: ".swiper-pagination",
            type: "progressbar",
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        keyboard: {
            enabled: false,
        },
        mousewheel: {
            enabled: false,
        }
    });
}

// AVVIO APPLICAZIONE
document.addEventListener('DOMContentLoaded', init);