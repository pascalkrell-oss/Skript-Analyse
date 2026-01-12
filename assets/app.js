/**
 * Skript-Analyse App 4.75.9 (Wave Preview & Audio Refinement)
 * Fixes: Rhythm Wave Sentence Preview, Optimized Audio Phrasing, Closer Label Alignment
 */

(function () {
    'use strict';

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event && event.reason;
        const message = typeof reason === 'object' && reason !== null && 'message' in reason ? String(reason.message) : String(reason || '');
        if (message.includes('A listener indicated an asynchronous response by returning true')) {
            event.preventDefault();
        }
    });

    const resolveNumericSetting = (value, fallback) => {
        const numberValue = Number(value);
        if (!Number.isFinite(numberValue) || numberValue <= 0) return fallback;
        return numberValue;
    };

    const SKRIPT_ANALYSE_CONFIG = (typeof window !== 'undefined' && window.skriptAnalyseConfig)
        ? window.skriptAnalyseConfig
        : {};
    const CURRENT_USER_PLAN = SKRIPT_ANALYSE_CONFIG.currentUserPlan === 'premium' ? 'premium' : 'basis';
    const ALGORITHM_TUNING_CONFIG = SKRIPT_ANALYSE_CONFIG.algorithmTuning || {};

    // CONFIG
    const SA_CONFIG = {
        STORAGE_KEY: 'skriptanalyse_autosave_v4_99', 
        UI_KEY_HIDDEN: 'skriptanalyse_hidden_cards',
        UI_KEY_EXCLUDED: 'skriptanalyse_excluded_cards',
        UI_KEY_SETTINGS: 'skriptanalyse_settings_global',
        UI_KEY_PLAN: 'skriptanalyse_plan_mode',
        UI_KEY_UPGRADE_DISMISSED: 'skriptanalyse_upgrade_dismissed',
        UI_KEY_ANNOUNCEMENT_DISMISSED: 'skriptanalyse_announcement_dismissed',
        UI_KEY_ANNOUNCEMENT_SYNC: 'skriptanalyse_announcement_sync',
        UI_KEY_UNLOCK_SYNC: 'skriptanalyse_unlock_sync',
        SAVED_VERSION_KEY: 'skriptanalyse_saved_version_v1',
        PRO_MODE: Boolean(window.SKA_CONFIG_PHP && SKA_CONFIG_PHP.pro),
        IS_ADMIN: Boolean(window.SKA_CONFIG_PHP && SKA_CONFIG_PHP.isAdmin),
        IS_LOGGED_IN: Boolean(window.SKA_CONFIG_PHP && SKA_CONFIG_PHP.isLoggedIn),
        WORKER_TEXT_THRESHOLD: 12000,
        FREE_TEXT_LIMIT: 20000,
        COLORS: { success: '#16a34a', warn: '#ea580c', error: '#dc2626', blue: '#1a93ee', text: '#0f172a', muted: '#94a3b8', disabled: '#cbd5e1' },
        ALGORITHM_TUNING: {
            longSentenceThreshold: resolveNumericSetting(ALGORITHM_TUNING_CONFIG.longSentenceThreshold, 20),
            nominalChainThreshold: resolveNumericSetting(ALGORITHM_TUNING_CONFIG.nominalChainThreshold, 3),
            passiveVoiceStrictness: resolveNumericSetting(ALGORITHM_TUNING_CONFIG.passiveVoiceStrictness, 15),
        },
        
        WPM: { werbung: 170, imagefilm: 155, erklaer: 145, hoerbuch: 115, podcast: 150, ansage: 160, elearning: 135, social: 170, buch: 120, default: 150 },
        SPS: { werbung: 4.6, imagefilm: 4.0, erklaer: 3.8, hoerbuch: 3.4, podcast: 3.8, ansage: 3.9, elearning: 3.5, social: 4.8, buch: 3.2, default: 3.8 },
        BENCHMARK_PERCENTILES: {
            wpm: [
                { p: 10, value: 115, label: 'Ruhig' },
                { p: 25, value: 135, label: 'Gemächlich' },
                { p: 50, value: 155, label: 'Standard' },
                { p: 75, value: 175, label: 'Sportlich' },
                { p: 90, value: 195, label: 'Sehr schnell' }
            ],
            sps: [
                { p: 10, value: 3.2, label: 'Ruhig' },
                { p: 25, value: 3.6, label: 'Gemächlich' },
                { p: 50, value: 4.0, label: 'Standard' },
                { p: 75, value: 4.6, label: 'Sportlich' },
                { p: 90, value: 5.1, label: 'Sehr schnell' }
            ],
            flesch: [
                { p: 10, value: 45, label: 'Komplex' },
                { p: 25, value: 55, label: 'Anspruchsvoll' },
                { p: 50, value: 65, label: 'Ausgewogen' },
                { p: 75, value: 75, label: 'Leicht' },
                { p: 90, value: 85, label: 'Sehr leicht' }
            ]
        },

        GENRE_LABELS: { werbung: 'Werbung', imagefilm: 'Imagefilm', erklaer: 'Erklärvideo', hoerbuch: 'Hörbuch', podcast: 'Podcast', ansage: 'Telefonansage', elearning: 'E-Learning', social: 'Social Media', buch: 'Buch/Roman' },
        GENRE_CONTEXT: {
            werbung: { tipPrefix: 'Werbespot', tipFocus: 'kurz, pointiert, CTA-nah formulieren', overviewNote: 'Werbespot: Tempo darf höher sein, Formulierungen kurz halten.' },
            imagefilm: { tipPrefix: 'Imagefilm', tipFocus: 'ruhige Bilder, klare Markenbotschaft', overviewNote: 'Imagefilm: ruhiger Flow, klare Bildsprache priorisieren.' },
            erklaer: { tipPrefix: 'Erklärvideo', tipFocus: 'logisch führen, Schritt für Schritt', overviewNote: 'Erklärvideo: kurze Sätze, didaktische Struktur.' },
            hoerbuch: { tipPrefix: 'Hörbuch', tipFocus: 'Atempausen setzen, Bögen halten', overviewNote: 'Hörbuch: längere Bögen, mehr Pausen einplanen.' },
            podcast: { tipPrefix: 'Podcast', tipFocus: 'locker sprechen, natürlich bleiben', overviewNote: 'Podcast: natürlicher Sprachfluss, nicht zu schnell.' },
            ansage: { tipPrefix: 'Ansage', tipFocus: 'präzise, klar und schnell erfassbar', overviewNote: 'Ansage: klare Betonung, keine unnötigen Schachteln.' },
            elearning: { tipPrefix: 'E-Learning', tipFocus: 'didaktisch gliedern, Ruhe bewahren', overviewNote: 'E-Learning: Lernpausen und klare Struktur.' },
            social: { tipPrefix: 'Social Media', tipFocus: 'schnell zum Punkt, snackable', overviewNote: 'Social Media: kurzer Spannungsbogen, hohe Dichte.' },
            buch: { tipPrefix: 'Buch/Roman', tipFocus: 'bildhaft erzählen, Rhythmus halten', overviewNote: 'Buch/Roman: längere Satzbögen, ruhiger Rhythmus.' }
        },
        GENRE_CARD_TIPS: {
            fillers: 'Füllwörter konsequent streichen, damit die Aussage fokussiert bleibt.',
            passive: 'Passiv nur gezielt einsetzen, sonst wirkt der Text distanziert.',
            nominal: 'Nominalstil reduzieren und Verben nach vorn holen.',
            nominal_chain: 'Nominalketten auflösen, damit der Satz luftiger wirkt.',
            anglicism: 'Fremdwörter nur dort nutzen, wo sie wirklich nötig sind.',
            echo: 'Wortwiederholungen variieren, damit es lebendig bleibt.',
            breath: 'Atemstellen einplanen und Satzbögen nicht überziehen.',
            stumble: 'Sprecherfreundliche Wörter bevorzugen und Zungenbrecher glätten.',
            cta: 'Handlungsaufforderung klar und direkt platzieren.',
            adjective: 'Adjektive sparsam setzen und starke Bilder wählen.',
            adverb: 'Adverbien gezielt einsetzen, damit der Satz klar bleibt.',
            rhythm: 'Satzlängen variieren, damit der Rhythmus trägt.',
            syllable_entropy: 'Unruhige Silbenfolgen glätten, damit der Flow sauber bleibt.',
            dialog: 'Dialoganteile passend zur Szene dosieren.',
            gender: 'Inklusive Begriffe nutzen, ohne den Flow zu brechen.',
            start_var: 'Satzanfänge variieren, damit Dynamik entsteht.',
            role_dist: 'Rollenwechsel klar markieren, damit es sofort verständlich ist.',
            vocabulary: 'Wortschatz kontrolliert variieren, ohne den Fokus zu verlieren.',
            pronunciation: 'Schwierige Wörter früh glätten und gut aussprechbar machen.',
            keyword_focus: 'Fokusbegriffe konsistent einsetzen und Wiederholungen dosieren.',
            plosive: 'Plosiv-Cluster entschärfen, damit es weich klingt.',
            redundancy: 'Wiederholungen nur gezielt als Stilmittel einsetzen.',
            bpm: 'Taktgefühl an die Stimmung und den Textfluss koppeln.',
            easy_language: 'Einfache Wörter und kurze Sätze priorisieren.',
            teleprompter: 'Zeilen so setzen, dass der Flow ruhig bleibt.',
            pacing: 'Timing mit dem Scroll-Takt trainieren, bis der Rhythmus sitzt.',
            bullshit: 'Floskeln durch konkrete Aussagen ersetzen.',
            metaphor: 'Bildsprache frisch halten und Klischees vermeiden.',
            audience: 'Komplexität sauber an die Zielgruppe anpassen.',
            verb_balance: 'Verben als Treiber nutzen, Nominalstil bremsen.',
            rhet_questions: 'Fragen gezielt für Aufmerksamkeit einsetzen.',
            depth_check: 'Schachtelsätze kürzen, damit es klar bleibt.',
            sentiment_intensity: 'Emotionen dosiert einsetzen.',
            compliance_check: 'Pflichttexte exakt hinterlegen und im Skript prüfen.'
        },

        ANGLICISMS: [
            'meeting', 'call', 'download', 'workflow', 'brainstorming', 'feedback',
            'deadline', 'briefing', 'content', 'community', 'influencer', 'location',
            'mindset', 'performance', 'recruiting', 'roadmap', 'skill', 'support',
            'task', 'tool', 'update', 'workshop', 'checken', 'liken', 'posten',
            'canceln', 'managen', 'cool', 'nice', 'easy', 'random', 'fine',
            'gamechanger', 'learnings', 'commitment', 'human resources', 'asap', 'to do', 'social media', 'storytelling'
        ],

        PHONETICS: [
            'tzsch', 'tschs', 'zsch', 'pfsch', 'rststr', 'ngsts', 'chtschr', 'bststr', 'mpfst', 'rchsch'
        ],
        WORD_BOUNDARY_VOWELS: ['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü', 'y'],

        PRONUNCIATION_DB: {
            'accessoire': 'Ak-sess-oar',
            'abonnement': 'A-bonn-mong',
            'balance': 'Ba-longs',
            'budget': 'Bü-dschee',
            'chance': 'Schongs',
            'engagement': 'Ong-gasch-mong',
            'genie': 'Sche-nie',
            'genre': 'Schong-re',
            'gnocchi': 'Njok-ki',
            'ingenieur': 'In-sche-njör',
            'restaurant': 'Res-to-rong',
            'zucchini': 'Zu-ki-ni',
            'könig': 'Kö-nich',
            'honig': 'Ho-nich',
            'wenig': 'We-nich',
            'wichtig': 'Wich-tich',
            'fertig': 'Fer-tich',
            'günstig': 'Güns-tich'
        },
        TTS_SERVICES: [],

        THESAURUS_SOURCE: {
            mode: 'local',
            apiUrl: 'https://www.openthesaurus.de/synonyme/search?format=application/json&query=',
            timeoutMs: 4000,
            maxResults: 8
        },
        THESAURUS_DB: {
            gut: ['positiv', 'stark', 'solide', 'hervorragend', 'gelungen'],
            schnell: ['rasch', 'zügig', 'flink', 'fix'],
            wichtig: ['entscheidend', 'bedeutend', 'maßgeblich', 'zentral'],
            klar: ['verständlich', 'deutlich', 'präzise', 'sauber'],
            einfach: ['simpel', 'leicht', 'unkompliziert'],
            groß: ['riesig', 'umfangreich', 'mächtig', 'gewaltig'],
            klein: ['winzig', 'kompakt', 'gering'],
            machen: ['erstellen', 'erzeugen', 'umsetzen', 'realisieren'],
            sagen: ['äußern', 'berichten', 'erklären', 'mitteilen'],
            nutzen: ['verwenden', 'einsetzen', 'gebrauchen', 'anwenden'],
            zeigen: ['darstellen', 'präsentieren', 'vorführen', 'aufzeigen'],
            beginnen: ['starten', 'anfangen', 'einleiten'],
            verbessern: ['optimieren', 'steigern', 'verfeinern', 'ausbauen'],
            ändern: ['anpassen', 'modifizieren', 'variieren', 'aktualisieren'],
            schnellstmöglich: ['sofort', 'umgehend', 'zeitnah']
        },

        GENDER_DB: {
            'mitarbeiter': 'Mitarbeitende',
            'teilnehmer': 'Teilnehmende',
            'kunden': 'Kundschaft / Auftraggebende',
            'jeder': 'alle',
            'keiner': 'niemand',
            'sprecher': 'Sprechende',
            'experten': 'Fachkräfte',
            'studenten': 'Studierende',
            'ärzte': 'Medizinisches Personal',
            'lehrer': 'Lehrkräfte',
            'zuschauer': 'Publikum',
            'besucher': 'Gäste',
            'unternehmer': 'Unternehmensführung',
            'chef': 'Führungskraft',
            'nutzer': 'Nutzende',
            'anfänger': 'Neulinge'
        },

        SENTIMENT: {
            positive: ['erfolg', 'gewinn', 'lösung', 'spaß', 'freude', 'glück', 'sicher', 'stark', 'best', 'gut', 'perfekt', 'innovativ', 'einfach', 'lieben', 'gerne', 'wirksam', 'vorteil', 'chance', 'ja', 'super', 'klasse', 'toll', 'meister', 'strahlend', 'begeistert'],
            negative: ['problem', 'fehler', 'gefahr', 'risiko', 'schlecht', 'verlust', 'angst', 'sorge', 'schwierig', 'nein', 'leider', 'kritik', 'störung', 'kosten', 'teuer', 'falsch', 'warnung', 'schaden', 'krise', 'düster', 'traurig'],
            emotional: ['!', 'wirklich', 'absolut', 'nie', 'immer', 'sofort', 'jetzt', 'unglaublich', 'wahnsinn', 'liebe', 'hass', 'dringend', 'herz', 'leidenschaft', 'feuer', 'eis']
        },
        SENTIMENT_NEGATIONS: ['nicht', 'kein', 'keine', 'keiner', 'keinem', 'keinen', 'keines', 'nie', 'nichts', 'ohne', 'niemals'],
        NEGATION_WINDOW: 3,
        AROUSAL: {
            high: ['explosion', 'jetzt', 'sofort', 'sofortig', 'sofortige', 'boom', 'krass', 'schnell', 'dringend', 'extrem', 'feuer', 'stark', 'power', 'heftig', 'wow', 'unglaublich', 'alarm', 'laut', 'aufwachen', 'action'],
            low: ['sanft', 'ruhig', 'leise', 'vielleicht', 'behutsam', 'sicher', 'sachte', 'entspannt', 'gelassen', 'still', 'warm', 'weich', 'sorgfältig', 'bedacht', 'gemächlich', 'leise', 'harmonie']
        },
        QUESTION_WORDS: ['wie', 'was', 'warum', 'wieso', 'weshalb', 'wann', 'wo', 'wer', 'wem', 'wen', 'welche', 'welcher', 'welches', 'wozu', 'wodurch', 'wohin'],
        SENTIMENT_INTENSITY: {
            positive: { euphorisch: 1.0, begeistert: 0.9, großartig: 0.9, fantastisch: 0.8, wunderbar: 0.8, stark: 0.6, erfreulich: 0.6, angenehm: 0.5, positiv: 0.5, schön: 0.4, gut: 0.3 },
            negative: { schlimm: -1.0, katastrophal: -0.9, furchtbar: -0.9, traurig: -0.7, unerquicklich: -0.6, ärgerlich: -0.5, kritisch: -0.5, schlecht: -0.4, mühsam: -0.3, kompliziert: -0.2 }
        },
        BUZZWORDS: [
            'synergetisch', 'agil', 'lösungsorientiert', 'innovativ', 'disruptiv', 'ganzheitlich', 'skalierbar', 'wertschöpfend',
            'kundenfokussiert', 'state of the art', 'best practice', 'low hanging fruits', 'win-win', 'touchpoint', 'mindset'
        ],
        NOMINAL_WHITELIST: [
            'zeitung', 'kleidung', 'meinung', 'wohnung', 'nutzung', 'rechnung', 'bedienung', 'förderung', 'lösung', 'beziehung',
            'erfahrung', 'meinungen', 'zeitungen', 'kleidungen', 'wohnungen', 'nutzungen', 'rechnungen', 'lösungen', 'beziehungen', 'erfahrungen'
        ],
        PROFILE_DEFAULTS: {
            general: { label: 'Allgemein', wpm: 180, numberMode: 'digit', commaPause: 0.2, periodPause: 0.5, paragraphPause: 1, sentenceWarningLimit: 25, hardSegmentLimit: 20, features: { keywordFocus: true, phonetics: true } },
            author: { label: 'Autor:in', wpm: 230, numberMode: 'digit', ignorePauseMarkers: true, commaPause: 0, periodPause: 0, paragraphPause: 0.5, sentenceWarningLimit: 25, criticalSentenceLimit: 30, hardSegmentLimit: 24, features: { keywordFocus: true, phonetics: false, immersion: true } },
            speaker: { label: 'Sprecher:in', wpm: 145, numberMode: 'word', commaPause: 0.35, periodPause: 0.7, paragraphPause: 1, sentenceWarningLimit: 22, hardSegmentLimit: 18, breathLabel: 'Keine Atempunkte', features: { keywordFocus: false, phonetics: true } },
            director: { label: 'Regie', wpm: 140, numberMode: 'word', commaPause: 0.3, periodPause: 0.6, paragraphPause: 1, pauseUnit: 'ms', sentenceWarningLimit: 25, hardSegmentLimit: 18, features: { keywordFocus: false, phonetics: true } },
            agency: { label: 'Agentur', wpm: 160, numberMode: 'digit', commaPause: 0.2, periodPause: 0.5, paragraphPause: 1, sentenceWarningLimit: 25, hardSegmentLimit: 20, features: { keywordFocus: false, phonetics: false } },
            marketing: { label: 'Marketing', wpm: 200, numberMode: 'digit', commaPause: 0.15, periodPause: 0.4, paragraphPause: 0.8, sentenceWarningLimit: 16, criticalSentenceLimit: 20, hardSegmentLimit: 18, sentimentTarget: 'positive', powerWordsCheck: true, features: { keywordFocus: true, phonetics: false } }
        },
        PROFILE_CARDS: {
            general: ['overview', 'char', 'coach', 'rhythm', 'chapter_calc', 'syllable_entropy', 'pronunciation', 'role_dist', 'keyword_focus', 'plosive', 'easy_language', 'redundancy', 'bullshit', 'metaphor', 'immersion', 'audience', 'rhet_questions', 'depth_check', 'start_var', 'compliance_check', 'breath', 'stumble', 'gender', 'echo', 'adjective', 'adverb', 'passive', 'fillers', 'nominal', 'nominal_chain', 'sentiment_intensity', 'cta', 'anglicism', 'verb_balance', 'bpm', 'vocabulary', 'dialog', 'teleprompter', 'word_sprint', 'pacing'],
            author: ['overview', 'char', 'vocabulary', 'keyword_focus', 'verb_balance', 'rhet_questions', 'depth_check', 'sentiment_intensity', 'redundancy', 'bullshit', 'metaphor', 'immersion', 'audience', 'easy_language', 'adverb', 'chapter_calc', 'syllable_entropy', 'compliance_check', 'word_sprint', 'start_var', 'gender', 'echo', 'nominal', 'nominal_chain'],
            speaker: ['overview', 'char', 'rhythm', 'syllable_entropy', 'chapter_calc', 'coach', 'pronunciation', 'plosive', 'breath', 'pacing', 'teleprompter', 'bpm', 'rhet_questions', 'stumble', 'dialog', 'role_dist'],
            director: ['overview', 'char', 'coach', 'role_dist', 'dialog', 'pacing', 'teleprompter', 'bpm', 'breath', 'chapter_calc', 'syllable_entropy', 'sentiment_intensity', 'rhythm'],
            agency: ['overview', 'char', 'chapter_calc', 'sentiment_intensity', 'vocabulary', 'bullshit', 'metaphor', 'audience', 'cta', 'adjective', 'adverb', 'anglicism', 'echo', 'compliance_check', 'keyword_focus'],
            marketing: ['overview', 'char', 'keyword_focus', 'cta', 'bullshit', 'metaphor', 'audience', 'vocabulary', 'adjective', 'adverb', 'echo', 'anglicism', 'chapter_calc', 'syllable_entropy', 'compliance_check', 'sentiment_intensity', 'easy_language', 'rhythm']
        },
        TOOLS_ALWAYS_VISIBLE: ['teleprompter', 'word_sprint', 'pacing'],
        TOOL_CARDS: ['teleprompter', 'word_sprint', 'pacing'],
        AUDIENCE_TARGETS: {
            kinder: { label: 'Kindersendung', minScore: 70, maxSentence: 14 },
            news: { label: 'Abendnachrichten', minScore: 55, maxSentence: 20 },
            fach: { label: 'Fachpublikum', minScore: 35, maxSentence: 28 }
        },

        CARD_TITLES: {
            overview: 'Schnell-Überblick',
            char: '🎭 Tonalität & Stil',
            stumble: '🚧 Stolpersteine & Phonetik',
            breath: '🚩 Auffällige Sätze',
            echo: '🔊 Wort-Echos',
            passive: '💤 Passiv-Indikator',
            fillers: '✂️ Füllwörter',
            nominal: '🏢 Bürokratie-Filter',
            nominal_chain: '⛓️ Nominal-Ketten',
            anglicism: '🇬🇧 Denglisch-Detektor',
            coach: '💡 Regie-Anweisung',
            immersion: 'Immersion & "Show, don\'t tell"',
            cta: '📣 Call to Action',
            compare: '⚖️ Versions-Vergleich',
            adjective: '🌸 Adjektiv-Dichte',
            adverb: '🌀 Adverbien-Check',
            rhythm: '🌊 Satz-Rhythmus',
            syllable_entropy: '🎼 Silben-Entropie',
            dialog: '💬 Dialog-Balance',
            gender: '🌈 Gender-Neutralität',
            start_var: '🔄 Satzanfang-Varianz',
            role_dist: '👥 Rollen-Verteilung',
            vocabulary: '📚 Wortschatz-Reichtum',
            pronunciation: '🗣️ Aussprache-Check',
            keyword_focus: '🎯 Keyword-Fokus',
            chapter_calc: '📚 Hörbuch-Kapitel-Kalkulator',
            plosive: '💥 Plosiv-Check',
            redundancy: '🧠 Semantische Redundanz',
            bpm: '🎵 Audio-BPM-Matching',
            easy_language: '🧩 Leichte Sprache',
            teleprompter: '🪄 Teleprompter',
            pacing: '⏱️ Sprech-Pacing',
            word_sprint: '✍️ Schreib-Sprint & Fokus',
            bullshit: '🧨 Buzzword-Check',
            metaphor: '🪞 Metaphern & Phrasen',
            audience: '🎯 Zielgruppen-Filter',
            verb_balance: '⚖️ Verb-Fokus',
            rhet_questions: '❓ Rhetorische Fragen',
            depth_check: '🧵 Satz-Verschachtelung',
            sentiment_intensity: '🌡️ Stimmungs-Intensität',
            compliance_check: '✅ Pflichttext-Check'
        },

        CARD_DESCRIPTIONS: {
            overview: 'Die wichtigsten Zahlen: Zeit, Wörter sowie Flesch- & LIX-Index plus Stil-Dimensionen.',
            char: 'Prüft, wie dein Text wirkt: Persönlich? Positiv? Verständlich?',
            stumble: 'Findet Zungenbrecher (Phonetik), S-Laut-Häufungen und lange Wortungetüme.',
            breath: 'Findet Sätze, die den natürlichen Atemfluss unterbrechen könnten.',
            echo: 'Findet unschöne Wortwiederholungen auf engem Raum.',
            passive: 'Prüft Passiv-Konstruktionen (Hilfsverb + Partizip II) und ignoriert Zustandsformen wie "Es wird dunkel".',
            fillers: 'Findet Wörter, die man oft streichen kann.',
            nominal: 'Markiert einzelne Wörter im "Papierdeutsch" (-ung, -heit).',
            nominal_chain: 'Findet ganze Passagen mit hoher Dichte an "Behördensprache".',
            anglicism: 'Findet englische Begriffe im deutschen Text.',
            coach: 'Deine persönliche Regie-Assistenz für Tempo, Dynamik und Haltung.',
            immersion: 'Vermeide "Filter-Wörter". Statt "Er sah, wie der Bus kam" schreibe lieber "Der Bus kam". Das zieht den Leser tiefer in die Geschichte.',
            cta: 'Prüft, ob am Ende eine klare Handlungsaufforderung steht (Conversion-Fokus).',
            compare: 'Vergleich mit der gespeicherten Version.',
            adjective: 'Prüft, ob der Text durch zu viele Adjektive (Endungen wie -ig, -lich) überladen wirkt.',
            adverb: 'Prüft Adverbien (z.B. -weise/-erweise) als eigenständigen Stil-Indikator.',
            rhythm: 'Visualisiert die Abfolge von kurzen und langen Sätzen (Short-Short-Long Prinzip).',
            syllable_entropy: 'Analysiert betonte/unbetonte Silbenfolgen für Rhythmus-Stolperstellen.',
            dialog: 'Zeigt das Verhältnis zwischen Erzähler-Text und wörtlicher Rede (Dialog).',
            gender: 'Findet generische Maskuline und schlägt neutrale Alternativen vor.',
            start_var: 'Findet monotone Satzanfänge (z.B. "Dann... Dann...").',
            role_dist: 'Erkennt Rollen anhand von Großbuchstaben (z.B. "CHARACKTERNAME:") und berechnet deren Anteil.',
            vocabulary: 'Berechnet die Type-Token-Ratio (TTR) um den Wortreichtum zu bestimmen.',
            pronunciation: 'Zeigt Wörter mit besonderer Aussprache.',
            keyword_focus: 'Analysiert dominante Substantive und prüft die Fokus-Schärfe.',
            chapter_calc: 'Erkennt Kapitel-Überschriften und berechnet die Dauer je Kapitel.',
            plosive: 'Warnt vor harten Plosiv-Folgen am Wortanfang.',
            redundancy: 'Findet inhaltliche Dopplungen in aufeinanderfolgenden Sätzen.',
            bpm: 'Schlägt ein passendes Musiktempo (BPM) für den Text vor.',
            easy_language: 'Prüft Verständlichkeit nach Leichte-Sprache-Kriterien.',
            teleprompter: 'Erstellt eine scrollende Ansicht im berechneten Tempo.',
            pacing: 'Visualisiert den Soll-Fortschritt fürs Timing-Training.',
            word_sprint: 'Motiviert dich mit Fokus-Timer, Wortziel und Countdown für deinen Schreib-Sprint.',
            bullshit: 'Findet Buzzwords und hohle Phrasen im Text.',
            metaphor: 'Zählt bekannte Redewendungen, um Klischees sichtbar zu machen.',
            audience: 'Prüft den Text gegen den gewählten Zielgruppen-Level.',
            verb_balance: 'Vergleicht Verben und Substantive für mehr Handlungsfokus.',
            rhet_questions: 'Zeigt die Verteilung rhetorischer Fragen im Text.',
            depth_check: 'Markiert Sätze mit zu vielen Nebensatz-Ebenen.',
            sentiment_intensity: 'Zeigt den emotionalen Vibe-Verlauf im Skript.',
            compliance_check: 'Prüft, ob Pflichtpassagen exakt im Skript enthalten sind.'
        },

        CARD_ORDER: ['char', 'coach', 'rhythm', 'chapter_calc', 'syllable_entropy', 'pronunciation', 'role_dist', 'keyword_focus', 'plosive', 'easy_language', 'redundancy', 'bullshit', 'metaphor', 'immersion', 'audience', 'rhet_questions', 'depth_check', 'start_var', 'compliance_check', 'breath', 'stumble', 'gender', 'echo', 'adjective', 'adverb', 'passive', 'fillers', 'nominal', 'nominal_chain', 'sentiment_intensity', 'cta', 'anglicism', 'verb_balance', 'bpm', 'vocabulary', 'dialog', 'teleprompter', 'word_sprint', 'pacing'],
        PREMIUM_CARDS: [
            'rhythm',
            'syllable_entropy',
            'plosive',
            'redundancy',
            'immersion',
            'depth_check',
            'sentiment_intensity',
            'teleprompter',
            'pacing',
            'chapter_calc',
            'role_dist',
            'bpm',
            'word_sprint',
            'compliance_check',
            'keyword_focus',
            'audience',
            'bullshit',
            'metaphor',
            'compare'
        ],
        FREE_CARDS: [
            'overview',
            'char',
            'fillers',
            'anglicism',
            'breath',
            'stumble',
            'pronunciation'
        ],
        PREMIUM_TEASERS: ['teleprompter', 'word_sprint', 'pacing', 'syllable_entropy', 'keyword_focus', 'bpm', 'rhythm'],

        GENRE_CARDS: {
            werbung: ['char', 'coach', 'cta', 'adjective', 'adverb', 'keyword_focus', 'bullshit', 'metaphor', 'immersion', 'bpm', 'vocabulary', 'rhythm', 'syllable_entropy', 'pacing', 'echo', 'passive', 'fillers', 'anglicism', 'start_var', 'compliance_check', 'dialog', 'teleprompter', 'word_sprint'],
            imagefilm: ['char', 'coach', 'rhythm', 'syllable_entropy', 'breath', 'pacing', 'teleprompter', 'bpm', 'vocabulary', 'metaphor', 'immersion', 'pronunciation', 'plosive', 'compliance_check', 'dialog', 'word_sprint'],
            erklaer: ['char', 'coach', 'rhythm', 'syllable_entropy', 'verb_balance', 'easy_language', 'depth_check', 'audience', 'keyword_focus', 'pronunciation', 'stumble', 'pacing', 'compliance_check', 'sentiment_intensity', 'dialog', 'teleprompter', 'bpm', 'vocabulary', 'immersion', 'word_sprint'],
            hoerbuch: ['char', 'rhythm', 'syllable_entropy', 'chapter_calc', 'coach', 'breath', 'pacing', 'teleprompter', 'pronunciation', 'plosive', 'stumble', 'dialog', 'bpm', 'vocabulary', 'compliance_check', 'sentiment_intensity', 'verb_balance', 'immersion', 'word_sprint'],
            podcast: ['char', 'coach', 'rhythm', 'syllable_entropy', 'dialog', 'pacing', 'teleprompter', 'breath', 'bpm', 'vocabulary', 'pronunciation', 'compliance_check', 'sentiment_intensity', 'verb_balance', 'immersion', 'word_sprint'],
            ansage: ['char', 'coach', 'rhythm', 'syllable_entropy', 'pacing', 'teleprompter', 'pronunciation', 'stumble', 'breath', 'bpm', 'vocabulary', 'compliance_check', 'sentiment_intensity', 'verb_balance', 'dialog', 'immersion', 'word_sprint'],
            elearning: ['char', 'coach', 'rhythm', 'syllable_entropy', 'easy_language', 'audience', 'verb_balance', 'pacing', 'teleprompter', 'pronunciation', 'stumble', 'compliance_check', 'sentiment_intensity', 'bpm', 'vocabulary', 'dialog', 'immersion', 'word_sprint'],
            social: ['char', 'coach', 'cta', 'keyword_focus', 'bullshit', 'metaphor', 'immersion', 'bpm', 'vocabulary', 'rhythm', 'syllable_entropy', 'pacing', 'adjective', 'adverb', 'echo', 'anglicism', 'start_var', 'compliance_check', 'dialog', 'teleprompter', 'sentiment_intensity', 'verb_balance', 'word_sprint'],
            buch: ['char', 'rhythm', 'syllable_entropy', 'dialog', 'vocabulary', 'metaphor', 'immersion', 'depth_check', 'sentiment_intensity', 'redundancy', 'pacing', 'start_var', 'compliance_check', 'teleprompter', 'bpm', 'verb_balance', 'word_sprint']
        },

        FILLER_DB: {
            'eigentlich': 1.0, 'sozusagen': 1.0, 'irgendwie': 1.0, 'quasi': 1.0,
            'im prinzip': 1.0, 'gewissermaßen': 1.0, 'halt': 0.8, 'eben': 0.8,
            'wirklich': 0.6, 'einfach': 0.6, 'doch': 0.4, 'mal': 0.4,
            'vielleicht': 0.5, 'schon': 0.4, 'glaube ich': 0.8, 'wohl': 0.5,
            'natürlich': 0.4, 'letztendlich': 0.9, 'absolut': 0.5
        },

        METAPHOR_DB: [
            'das rad nicht neu erfinden',
            'zwei fliegen mit einer klappe',
            'ins kalte wasser springen',
            'mit offenen karten spielen',
            'auf dem richtigen weg',
            'der rote faden',
            'die kirche im dorf lassen',
            'unter den teppich kehren',
            'am selben strang ziehen',
            'den nagel auf den kopf treffen',
            'das kind beim namen nennen',
            'die sprichwörtliche nadel im heuhaufen',
            'den stein ins rollen bringen',
            'den ball ins rollen bringen',
            'im gleichen boot sitzen',
            'auf wolke sieben',
            'jemandem den spiegel vorhalten',
            'der elefant im raum',
            'auf ganzer linie',
            'die sache auf den punkt bringen',
            'den teufel an die wand malen',
            'den faden verlieren',
            'auf der leitung stehen',
            'den roten faden verlieren',
            'in den sauren apfel beißen'
        ],

        STOPWORDS: [
            'der', 'die', 'das', 'ein', 'eine', 'einer', 'eines', 'einem', 'einen', 'und', 'oder', 'aber', 'denn', 'weil', 'als', 'wenn', 'dass', 'damit',
            'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'mich', 'dich', 'uns', 'euch', 'ihnen', 'mein', 'dein', 'sein', 'ihr', 'unser', 'euer',
            'mit', 'von', 'für', 'auf', 'an', 'in', 'im', 'am', 'zum', 'zur', 'bei', 'aus', 'nach', 'vor', 'über', 'unter', 'zwischen', 'durch', 'gegen', 'ohne',
            'ist', 'sind', 'war', 'waren', 'wird', 'werden', 'hat', 'haben', 'hatte', 'hätte', 'kann', 'können', 'muss', 'müssen', 'soll', 'sollen', 'darf', 'dürfen',
            'auch', 'noch', 'schon', 'nur', 'hier', 'dort', 'heute', 'morgen', 'gestern', 'immer', 'nie', 'jetzt', 'gleich', 'so', 'wie', 'was', 'wer', 'wo', 'wann',
            'sehr', 'mehr', 'weniger', 'viel', 'viele', 'wenig', 'etwas', 'nichts', 'alles', 'jeder', 'jede', 'jedes', 'dieser', 'diese', 'dieses', 'jener', 'jene', 'jenes',
            'kein', 'keine', 'keiner', 'keines', 'keinem', 'keinen', 'bitte', 'danke', 'okay', 'ok', 'ja', 'nein'
        ],

        KEYWORD_REFERENCE_TOTAL: 1000000,
        KEYWORD_REFERENCE_FREQ_FALLBACK: 2,
        KEYWORD_REFERENCE_FREQ: {
            zeit: 4800,
            jahr: 3200,
            mensch: 2600,
            menschen: 2400,
            arbeit: 1800,
            unternehmen: 1700,
            kunden: 1400,
            kunde: 1300,
            produktion: 900,
            produkt: 850,
            service: 820,
            markt: 760,
            daten: 720,
            projekt: 700,
            angebot: 680,
            idee: 650,
            qualität: 620,
            lösung: 600,
            system: 590,
            team: 560,
            marke: 520,
            sicherheit: 480,
            energie: 460,
            technik: 440,
            zukunft: 420,
            erfolg: 400,
            preis: 380,
            video: 200,
            software: 180,
            compliance: 90
        },

        TIPS: {
            fillers: ["Hoch-Gewichtete Wörter sind 'Semantisches Rauschen'.", "Wörter like 'eigentlich' suggerieren Unsicherheit. Sei konkret!", "Nutze Füllwörter nur bewusst für einen sehr lockeren Umgangston.", "Je kürzer der Spot (Werbung), desto tödlicher ist jedes 'vielleicht'.", "Prüfe bei jedem Füllwort: Ändert sich der Sinn, wenn es fehlt? Wenn nein: Weg damit."],
            nominal: ["Wörter auf -ung, -heit, -keit ersticken den Sprachfluss.", "Nominalstil klingt nach Behörde. Ein Skript sollte so klingen, wie Menschen wirklich reden.", "Suche nach dem 'versteckten Verb' in Substantiven wie 'die Bearbeitung' -> 'wir bearbeiten'.", "Textdichte durch Nominalstil ermüdet das Ohr deines Hörers sehr schnell.", "Verben sind die Motoren deiner Sprache – sie bringen Bewegung und Leben in das Skript."],
            nominal_chain: ["Behördensprache ist der Feind von Audio.", "Löse diese Cluster auf, indem du sie in zwei einfachere Sätze mit Verben verwandelst.", "Ketten von Substantiven (-ung, -heit, -ät) machen den Text atemlos und hölzern.", "Baue mehr Verben ein: Sie ziehen den Satz nach vorn und klingen natürlicher.", "Vermeide Genitiv-Ketten – lieber mit Präpositionen auflösen."],
            role_dist: ["Nutze die Rollenerkennung für Zeit-Kalkulation.", "Zu viele kurze Einwürfe können den Fluss stören, zu lange Monologe ermüden.", "Achte auf ein ausgewogenes Verhältnis, wenn es ein Dialog sein soll.", "Wechsle zwischen Erzähler und Dialog, um Monotonie zu vermeiden.", "Achte auf klare Sprecherwechsel, damit der Hörer sofort folgt."],
            passive: ["Aktivsprache erzeugt Bilder im Kopf.", "Passiv versteckt den Handelnden ('Es wurde entschieden' vs 'Wir entschieden').", "Passiv wird nur bei Hilfsverb + Partizip II markiert (nicht: 'Es wird dunkel').", "Vermeide 'wurde/werden', wenn du Dynamik und Verantwortung transportieren willst.", "Aktive Sätze sind meist kürzer, prägnanter und überzeugender."],
            anglicism: ["Bleib verständlich.", "Prüfe kritisch: Gibt es ein einfacheres deutsches Wort, das jeder sofort versteht?", "Anglizismen können modern wirken, aber auch eine Barriere zwischen dir und dem Hörer bauen.", "Nutze englische Begriffe nur dort, wo sie als etablierter Fachbegriff unverzichtbar sind.", "In Audio-Medien zählen vertraute Wörter mehr, da der Hörer nicht zurückblättern kann."],
            echo: ["Variiere deine Wortwahl für mehr Lebendigkeit.", "Suche nach Synonymen, um den Text für den Sprecher lebendig zu halten.", "Echos innerhalb von zwei Sätzen fallen im Audio sofort als 'Sprechfehler' auf.", "Wortwiederholungen ermüden das Gehör. Nutze ein Thesaurus-Tool für Abwechslung.", "Ein reicher Wortschatz wirkt kompetenter und hält die Aufmerksamkeit des Hörers hoch."],
            breath: ["Ein Gedanke pro Satz. Das gibt Raum zum Atmen.", "Viele Kommas sind oft ein Zeichen für Schachtelsätze. Trenne sie mit einem Punkt.", "Lange Sätze zwingen den Sprecher zu hohem Tempo – das stresst den Hörer.", "Prüfe: Kannst du den Satz laut lesen, ohne am Ende außer Atem zu sein?", "Kurze Sätze erhöhen die Textverständlichkeit bei komplexen Themen drastisch."],
            stumble: ["Einfache Phonetik hilft der Emotion.", "Vermeide Bandwurmwörter – sie sind schwer zu betonen und fehleranfällig.", "Lies kritische Stellen dreimal schnell hintereinander laut. Klappt es? Dann ist es okay."],
            cta: ["Der CTA gehört in die letzten 10% des Textes.", "Verwende den Imperativ ('Sichere dir...'), um eine direkte Handlung auszulösen.", "Vermeide Konjunktive im CTA. 'Du könntest' ist viel schwächer als 'Mach es jetzt'.", "Wenn der CTA versteckt in der Mitte liegt, verpufft die Wirkung oft.", "Formuliere den CTA aktiv und eindeutig – ein Ziel pro Satz."],
            adjective: ["Streiche Adjektive, die im Substantiv stecken.", "Show, don't tell: Statt 'es war ein gefährlicher Hund', beschreibe das Knurren.", "Zu viele Adjektive wirken oft 'blumig' und schwächen starke Substantive und Verben.", "Nutze Adjektive sparsam, um echte Highlights zu setzen.", "Wörter auf -lich oder -ig klingen in Häufung oft nach Werbesprache."],
            adverb: ["Adverbien auf -weise sind schnell Füllmaterial. Prüfe, ob sie wirklich nötig sind.", "Adverbien sollen Bedeutung schärfen, nicht den Satz verwässern.", "Statt 'glücklicherweise' lieber den Effekt beschreiben.", "Ein starkes Verb ersetzt oft zwei Adverbien.", "Adverbien gezielt als Rhythmus- oder Tonalitäts-Tool nutzen."],
            rhythm: ["Short-Short-Long ist ein klassischer Rhythmus.", "Monotonie tötet die Aufmerksamkeit. Vermeide viele gleich lange Sätze hintereinander.", "Nutze kurze Sätze für Fakten und Tempo. Nutze längere für Erklärungen.", "Ein guter Text tanzt: Variiere zwischen kurzen und mittellangen Sätzen.", "Die visuelle Welle zeigt dir sofort, wo dein Text ins Stocken gerät."],
            syllable_entropy: ["Betonte und unbetonte Silben sollten rhythmisch balanciert sein.", "Viele Silben-Klumpen erzeugen Stolpern im Vortrag.", "Kürze Bandwurmwörter, wenn der Rhythmus hart bricht.", "Nutze Silbenwechsel als Taktgefühl für Claims.", "Glätte harte Übergänge durch Umstellen oder Kürzen."],
            dialog: ["Achte auf klare Sprecherwechsel.", "Werbespots wirken durch Dialoge ('Szenen') oft authentischer als reine Ansagen.", "Zu viel Dialog ohne Erzähler kann den Hörer orientierungslos machen.", "Hörbücher brauchen lebendige Figuren. Zu wenig Dialog wirkt oft trocken.", "Dialoge lockern lange Erklär-Passagen auf und erhöhen die Aufmerksamkeit."],
            gender: ["Sprache schafft Wirklichkeit.", "Oft sind Partizipien ('Mitarbeitende') eine elegante Lösung.", "Vermeide das generische Maskulinum in Corporate Communications.", "Neutrale Sprache wirkt moderner und professioneller.", "Überprüfe, ob 'Kunden' wirklich nur Männer meint, oder ob 'Kundschaft' besser passt."],
            start_var: ["Variiere den Satzanfang für mehr Dynamik.", "Variiere die Satzstruktur: Stell mal das Objekt oder eine Zeitangabe an den Anfang.", "Monotonie im Satzbau überträgt sich sofort auf die Sprechmelodie.", "Wiederholungen sind nur okay, wenn sie als rhetorisches Stilmittel (Anapher) gewollt sind.", "Verbinde kurze Sätze logisch miteinander, statt sie nur aneinanderzureihen."],
            vocabulary: ["Ein hoher TTR-Wert (>60) zeigt Reichtum.", "Ein niedriger Wert (<40) ist typisch für fokussierte Werbebotschaften oder Claims.", "Wiederholungen senken den Wortwert, sind aber für Audio-Branding oft gewollt.", "Überprüfe bei niedrigem Wert: Ist die Wiederholung Absicht oder Faulheit?", "Variiere Wortfelder bewusst, statt Synonyme wahllos zu streuen."],
            pronunciation: ["Standarddeutsch: -ig wird wie -ich gesprochen.", "Hiatus prüfen: Vokal auf Vokal (z.B. „bei Ingo“) kann stocken.", "Achte bei 'sp' und 'st' am Wortanfang immer auf den 'Sch'-Laut (Schtein, Schpiel).", "Schwierige Wörter früh erkennen und alternative Formulierungen bereithalten.", "Eigennamen: Schreibweise für Aussprache notieren (z.B. phonetisch)."],
            keyword_focus: ["Ein starkes Kernwort sollte klar dominieren.", "Wenn die Top-Begriffe gleich stark sind, wirkt die Botschaft diffus.", "Produktname & Nutzen sollten in den Top-Keywords sichtbar sein.", "Setze Keywords an Satzanfänge – dort wirken sie am stärksten.", "Zu viele Fokuswörter verwässern die Botschaft – priorisieren."],
            plosive: ["P- und B-Laute können am Mikrofon knallen.", "Entzerrung hilft: Zwischen Plosiv-Wörtern kurze Pausen setzen.", "Bei Nahbesprechung (z. B. im Podcast) leicht seitlich sprechen, um Pop-Geräusche zu vermeiden.", "Harte Konsonanten-Cluster (z.B. „Herbst‑Sturm“) können knacken – Entkopplung hilft.", "Sprecherfreundlich schreiben: Konsonanten-Cluster reduzieren."],
            redundancy: ["Wiederholungen direkt hintereinander wirken unfreiwillig.", "Formuliere den zweiten Satz mit anderem Fokus oder streiche ihn.", "Achte auf doppelte Bedeutungen ('weißer Schimmel').", "Streiche Dopplungen: Eine Aussage, ein Bild, ein Satz.", "Wiederholungen nur als Stilmittel – sonst kürzen."],
            bpm: ["Je schneller der Text, desto höher darf das Musiktempo sein.", "Eine ruhige Musik mit 60–90 BPM passt zu erklärenden Passagen.", "Für dynamische Texte sind 100–120 BPM oft stimmig.", "Längere Sätze mit Kommas strukturieren, damit die Atmung mitkommt.", "Tempo entsteht durch Variation – nicht durch dauerhafte Beschleunigung."],
            easy_language: ["Kurze Sätze und einfache Wörter erhöhen die Zugänglichkeit.", "Vermeide Passiv und Genitiv für Leichte Sprache.", "Prüfe Begriffe mit vielen Silben und ersetze sie durch Einfacheres.", "Ein Gedanke pro Satz – das erhöht Verständlichkeit sofort.", "Fachbegriffe nur, wenn nötig – sonst erklären oder ersetzen."],
            teleprompter: ["Nutze den Teleprompter im großen Fenster für einen ruhigen Blick.", "Passe die Schriftgröße an die Distanz zum Screen an.", "Der Scroll folgt dem berechneten Tempo.", "Halte Zeilen kurz, damit die Augen ruhiger springen.", "Setze sinnvolle Pausenmarker, damit der Vortrag natürlicher bleibt."],
            pacing: ["Starte den Pacing-Takt und sprich synchron zum Balken.", "Der Soll-Fortschritt zeigt dir, wo du nach X Sekunden sein solltest.", "Trainiere mit verschiedenen Genres, um Tempo-Gefühl zu entwickeln.", "Halte Pausen sichtbar – sie zählen in die Timing-Logik ein.", "Nutze den Takt als Metronom für Sprecher-Rhythmus."],
            bullshit: ["Buzzwords klingen schnell nach Floskel.", "Formuliere konkret und messbar.", "Hass-Wörter in der Blacklist helfen beim Aufräumen.", "Konkrete Beispiele schlagen Buzzwords – ersetze Floskeln durch Nutzen.", "Wenn ein Satz nichts messbar sagt, streichen oder präzisieren."],
            metaphor: ["Klischees wirken vorhersehbar – prüfe Alternativen.", "Ein frisches Bild bleibt länger im Kopf als bekannte Sprüche.", "Metaphern sind stark, wenn sie zur Zielgruppe passen.", "Ein einziges gutes Bild schlägt fünf Floskeln.", "Originalität steigert die Sprecher-Wirkung spürbar."],
            audience: ["Für Kinder sind kurze Sätze und einfache Wörter Pflicht.", "News brauchen klare, direkte Formulierungen.", "Fachtexte dürfen komplexer sein, aber nicht verschachtelt.", "Sprich die Zielgruppe direkt an (Du/Sie) und bleibe konsistent.", "Teste jeden Satz: Würde die Zielgruppe das so sagen?"],
            verb_balance: ["Verben bringen Bewegung in den Text.", "Nominalstil bremst das Tempo.", "Mehr Verben = mehr Handlung.", "Mehr starke Verben, weniger Hilfsverben – das klingt entschlossener.", "Verben machen Audio lebendig: Aktiv statt Zustand."],
            rhet_questions: ["Fragen binden das Publikum ein.", "Zu viele Fragen wirken verhörend.", "Setze Fragen gezielt für Interaktion.", "Rhetorische Fragen sparsam einsetzen – sonst wirkt es unsicher.", "Beantworte die Frage unmittelbar, damit kein Leerlauf entsteht."],
            depth_check: ["Mehr als zwei Nebensatz-Ebenen überfordern beim Sprechen.", "Teile lange Schachtelsätze auf.", "Ein Gedanke pro Satz erhöht die Klarheit.", "Prüfe: Liefert der Satz neue Information oder nur Wiederholung?", "Details nur dort, wo sie die Aussage wirklich stützen."],
            sentiment_intensity: ["Emotionaler Wechsel hält die Aufmerksamkeit hoch.", "Achte auf harte Brüche im Vibe.", "Nutze positive Peaks als Highlights.", "Emotionalität dosieren: neutral erklären, dann gezielt färben.", "Vermeide extreme Superlative ohne Beleg – wirkt unglaubwürdig."],
            compliance_check: ["Pflichttexte genau wie vorgegeben einfügen.", "Jede Passage separat prüfen (eine pro Zeile).", "Kleine Abweichungen führen zu Rot – Wortlaut exakt halten.", "Vermeide zusätzliche Satzzeichen im Pflichttext.", "Prüfe die Passagen vor dem finalen Export."]
        },

        MARKERS: window.SKA_CONFIG_PHP && window.SKA_CONFIG_PHP.markers ? window.SKA_CONFIG_PHP.markers : []
    };

    const UPGRADE_CONTENT = {
        basic: {
            tools: [
                { name: "WPM-Modus", desc: "Berechnet deine Lese- und Sprechgeschwindigkeit basierend auf Wortanzahl und Standard-Werten." },
                { name: "Genre-Presets", desc: "Wähle aus Voreinstellungen (z.B. Werbespot, Hörbuch, Podcast, E-Learning), um die Analyse anzupassen." },
                { name: "Zeichen-Zählung", desc: "Präzise Zählung aller Zeichen (mit und ohne Leerzeichen) für die Abrechnung." },
                { name: "Wort- & Satzstatistik", desc: "Detaillierte Aufschlüsselung der Wortanzahl und der durchschnittlichen Satzlänge." },
                { name: "Lesbarkeits-Score", desc: "Ermittelt den Flesch-Index, um zu prüfen, wie verständlich dein Text geschrieben ist." },
                { name: "Füllwort-Analyse (Basis)", desc: "Findet die häufigsten überflüssigen Füllwörter, die deinen Text unnötig aufblähen." },
                { name: "Autosave", desc: "Dein Fortschritt wird automatisch lokal in deinem Browser gespeichert, damit nichts verloren geht." },
                { name: "PDF-Export (Basis)", desc: "Lade dein Skript als einfaches PDF herunter, um es zu drucken oder zu teilen." }
            ],
            analysis: [
                { name: "Schnell-Überblick", desc: "Erhalte sofort alle relevanten Metriken wie Gesamtdauer und Status auf einen Blick." },
                { name: "Tonalität & Stil", desc: "Analysiert die emotionale Wirkung (positiv/negativ) und den Schreibstil deines Textes." },
                { name: "Füllwörter", desc: "Markiert Wörter, die keine Information tragen und den Text schwächen." },
                { name: "Denglisch-Detektor", desc: "Findet unnötige Anglizismen und schlägt oft bessere deutsche Alternativen vor." },
                { name: "Auffällige Sätze", desc: "Markiert extrem lange Schachtelsätze oder abgehackte Phrasen, die den Fluss stören." },
                { name: "Stolpersteine & Phonetik", desc: "Identifiziert Zungenbrecher und Wortfolgen, die beim Sprechen schwierig sind." },
                { name: "Aussprache-Check", desc: "Prüft Zahlen, Abkürzungen und Sonderzeichen auf ihre Sprechbarkeit." }
            ]
        },
        premium: {
            tools: [
                { name: "Alles aus der Basis-Version", desc: "Du erhältst selbstverständlich Zugriff auf alle Funktionen des kostenlosen Plans." },
                { name: "SPS-Modus", desc: "Analyse basierend auf 'Silben pro Sekunde' – der Standard für professionelle Sprachaufnahmen." },
                { name: "Pausen-Automatik", desc: "Berechnet automatisch realistische Atem- und Sprechpausen an Satzzeichen." },
                { name: "WPM-Kalibrierung", desc: "Miss deine persönliche Sprechgeschwindigkeit und eiche das System auf deine Stimme." },
                { name: "Pro-PDF-Report", desc: "Erstellt einen detaillierten Report für Regie und Kunden mit allen Analyse-Daten." },
                { name: "Textvergleich (Versionen)", desc: "Vergleiche verschiedene Versionen deines Skripts und sieh Änderungen sofort." },
                { name: "Premium-Analyseboxen", desc: "Schalte die erweiterte Tiefenanalyse frei für maximale Textqualität." },
                { name: "Cloud-Speicher", desc: "Speichere deine Projekte sicher & Ende-zu-Ende verschlüsselt in deiner persönlichen Cloud." },
                { name: "Teleprompter", desc: "Ein professioneller, browserbasierter Teleprompter mit Sprachsteuerung und Geschwindigkeitsregelung." },
                { name: "Schreib-Sprint & Fokus", desc: "Steigere deine Produktivität mit dem ablenkungsfreien Fokus-Modus und Wortzielen." },
                { name: "Sprech-Pacing", desc: "Ein visuelles Tool, das dir hilft, das exakte Timing für Takes zu üben." }
            ],
            analysis: [
                { name: "Regie-Anweisung", desc: "Erkennt technische Anweisungen und formatiert sie korrekt für Sprecher." },
                { name: "Satz-Rhythmus", desc: "Visualisiert den Flow deines Textes, um monotone Satzstrukturen zu vermeiden." },
                { name: "Hörbuch-Kapitel-Kalkulator", desc: "Berechnet die voraussichtliche Laufzeit ganzer Kapitel basierend auf Wortzahlen." },
                { name: "Silben-Entropie", desc: "Misst die Informationsdichte pro Silbe – wichtig für Werbung und Nachrichten." },
                { name: "Rollen-Verteilung", desc: "Analysiert, wie viel Sprechanteil verschiedene Charaktere oder Rollen haben." },
                { name: "Keyword-Fokus", desc: "Prüft, ob deine definierten Keywords oft genug (oder zu oft) vorkommen." },
                { name: "Plosiv-Check", desc: "Warnt vor harten P-, T-, K-Lauten, die im Mikrofon Popp-Geräusche erzeugen." },
                { name: "Leichte Sprache", desc: "Prüft deinen Text auf Barrierefreiheit (B1/B2 Level) und Verständlichkeit." },
                { name: "Semantische Redundanz", desc: "Findet inhaltliche Wiederholungen, bei denen das Gleiche mit anderen Worten gesagt wird." },
                { name: "Buzzword-Check", desc: "Entlarvt abgedroschene Marketing-Phrasen und leere Worthülsen." },
                { name: "Metaphern & Phrasen", desc: "Analysiert die Bildsprache und prüft, ob Metaphern stimmig sind." },
                { name: "Immersion & Show, don't tell", desc: "Findet Distanz-Wörter ('er sah', 'sie hörte'), die die Immersion schwächen." },
                { name: "Zielgruppen-Filter", desc: "Passt die Analyse-Parameter speziell auf deine definierte Zielgruppe an." },
                { name: "Rhetorische Fragen", desc: "Zählt Fragen im Text und bewertet deren Wirkung auf den Zuhörer." },
                { name: "Satz-Verschachtelung", desc: "Warnt vor zu komplexen Schachtelsätzen, die beim Hören schwer verständlich sind." },
                { name: "Satzanfang-Varianz", desc: "Prüft, ob zu viele Sätze mit dem gleichen Wort beginnen (z.B. 'Dann... Dann...')." },
                { name: "Pflichttext-Check", desc: "Validiert, ob rechtliche Disclaimer (z.B. Gewinnspiel-Infos) enthalten sind." },
                { name: "Gender-Neutralität", desc: "Prüft den Text auf inklusive Sprache und macht neutrale Vorschläge." },
                { name: "Wort-Echos", desc: "Findet unfreiwillige Wortwiederholungen auf engem Raum." },
                { name: "Adjektiv-Dichte", desc: "Warnt vor übermäßigem Adjektiv-Gebrauch, der den Text schwammig macht." },
                { name: "Adverbien-Check", desc: "Hilft dir, schwache Verben durch starke Verben (statt Adverbien) zu ersetzen." },
                { name: "Passiv-Indikator", desc: "Markiert passive Formulierungen und hilft dir, aktiver zu schreiben." },
                { name: "Bürokratie-Filter", desc: "Findet typisches Beamtendeutsch und Nominalstil, der schwer zu hören ist." },
                { name: "Nominal-Ketten", desc: "Warnt vor aneinandergereihten Substantiven ('Donaudampfschifffahrt...')." },
                { name: "Stimmungs-Intensität", desc: "Misst die emotionale Stärke deiner Worte auf einer Skala." },
                { name: "Call to Action", desc: "Prüft, ob eine klare Handlungsaufforderung am Ende des Textes steht." },
                { name: "Verb-Fokus", desc: "Analysiert die Kraft deiner Verben – das Herzstück guter Texte." },
                { name: "Audio-BPM-Matching", desc: "Hilft dir, den Text rhythmisch auf einen Musik-Takt (BPM) zu schreiben." },
                { name: "Wortschatz-Reichtum", desc: "Misst die Diversität deines Vokabulars (Type-Token-Ratio)." },
                { name: "Dialog-Balance", desc: "Prüft das Verhältnis von erzählendem Text zu wörtlicher Rede." }
            ]
        }
    };

    const getSharedAnalysisUtils = () => (typeof window !== 'undefined' ? window.SA_ANALYSIS_UTILS : null);

    const SA_Utils = {
        debounce: (func, delay) => { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; },
        throttle: (func) => {
            let ticking = false;
            return function(...args) {
                if (ticking) return;
                ticking = true;
                window.requestAnimationFrame(() => {
                    ticking = false;
                    func.apply(this, args);
                });
            };
        },
        formatMin: (sec) => { if (!sec || sec <= 0) return '0:00'; let m = Math.floor(sec / 60), s = Math.round(sec % 60); if(s===60){m++;s=0} return `${m}:${s < 10 ? '0' : ''}${s}`; },
        escapeRegex: (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        normalizeWord: (text) => String(text || '').toLowerCase().replace(/[^a-zäöüß]/gi, '').trim(),
        uniqueList: (list) => Array.from(new Set(list.filter(Boolean))),
        escapeHtml: (text) => text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;'),
        escapeCsvValue: (value) => {
            const str = String(value == null ? '' : value);
            if (/[",\n\r]/.test(str)) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        },
        normalizeWhitespace: (text) => String(text || '').replace(/\s+/g, ' ').trim(),
        formatMarkerTime: (sec) => {
            const total = Math.max(0, sec || 0);
            const h = Math.floor(total / 3600);
            const m = Math.floor((total % 3600) / 60);
            const s = (total % 60).toFixed(2);
            return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        },
        buildExportFilename: (base, ext) => {
            const safeBase = String(base || 'skript-export')
                .toLowerCase()
                .replace(/[^a-z0-9_-]+/g, '-')
                .replace(/^-+|-+$/g, '') || 'skript-export';
            const now = new Date();
            const pad = (val) => String(val).padStart(2, '0');
            const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
            return `${safeBase}-${stamp}.${ext}`;
        },
        cleanTextForCounting: (text) => {
            const markerTokens = (SA_CONFIG.MARKERS || [])
                .map((marker) => String(marker.val || '').trim())
                .filter(Boolean)
                .sort((a, b) => b.length - a.length);
            const sharedUtils = getSharedAnalysisUtils();
            if (sharedUtils && sharedUtils.cleanTextForCounting) {
                return sharedUtils.cleanTextForCounting(text, { markerTokens });
            }
            let cleaned = text;
            markerTokens.forEach((marker) => {
                cleaned = cleaned.replace(new RegExp(`\\s*${SA_Utils.escapeRegex(marker)}\\s*`, 'g'), ' ');
            });
            return cleaned
                .replace(/\s*\|[^|]*\|\s*/g, ' ')
                .replace(/\s*\|[0-9\.]+S?\|\s*/g, ' ')
                .replace(/\s*\[PAUSE:.*?\]\s*/g, ' ')
                .replace(/\s*\[[^\]]+\]\s*/g, ' ')
                .replace(/\s*\|\s*/g, ' ')
                .replace(/[\u200B\uFEFF]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        },
        stemWord: (word) => {
            if (!word) return '';
            let w = String(word).toLowerCase().replace(/[^a-zäöüß]/g, '');
            if (w.length < 3) return w;
            if (w.startsWith('ge') && w.length > 5) w = w.slice(2);
            const suffixes = ['chen', 'lein', 'ungen', 'ung', 'heit', 'keit', 'isch', 'lich', 'igkeit', 'igkeiten', 'ig', 'end', 'ern', 'er', 'en', 'e', 's', 'n'];
            suffixes.forEach((suffix) => {
                if (w.length > 4 && w.endsWith(suffix)) {
                    w = w.slice(0, -suffix.length);
                }
            });
            return w;
        },
        renderMarkersToHtml: (text) => {
            const safeText = SA_Utils.escapeHtml(String(text || ''));
            return safeText
                .replace(/\n/g, '<br>')
                .replace(/\[([^\]]+)\]/g, (_, label) => `<span class="ska-inline-marker" contenteditable="false" data-marker="${label}">[${label}]</span>`)
                .replace(/\|([0-9.]+S?)\|/g, (_, val) => `<span class="ska-inline-marker" contenteditable="false" data-marker="pause">|${val}|</span>`)
                .replace(/\|/g, `<span class="ska-inline-marker" contenteditable="false" data-marker="pause">|</span>`);
        },
        generateWordDiff: (oldText, newText, maxWords = 260) => {
            const oldWords = (oldText || '').trim().split(/\s+/).filter(Boolean);
            const newWords = (newText || '').trim().split(/\s+/).filter(Boolean);
            if (!oldWords.length || !newWords.length) return { html: '', additions: 0, deletions: 0, tooLarge: false };
            if (oldWords.length > maxWords || newWords.length > maxWords) {
                return { html: '', additions: 0, deletions: 0, tooLarge: true };
            }

            const rows = oldWords.length + 1;
            const cols = newWords.length + 1;
            const dp = Array.from({ length: rows }, () => Array(cols).fill(0));

            for (let i = rows - 2; i >= 0; i -= 1) {
                for (let j = cols - 2; j >= 0; j -= 1) {
                    dp[i][j] = oldWords[i] === newWords[j]
                        ? dp[i + 1][j + 1] + 1
                        : Math.max(dp[i + 1][j], dp[i][j + 1]);
                }
            }

            let i = 0;
            let j = 0;
            let additions = 0;
            let deletions = 0;
            const htmlParts = [];

            while (i < oldWords.length && j < newWords.length) {
                if (oldWords[i] === newWords[j]) {
                    htmlParts.push(SA_Utils.escapeHtml(oldWords[i]));
                    i += 1;
                    j += 1;
                } else if (dp[i + 1][j] >= dp[i][j + 1]) {
                    deletions += 1;
                    htmlParts.push(`<span class="ska-diff-removed">${SA_Utils.escapeHtml(oldWords[i])}</span>`);
                    i += 1;
                } else {
                    additions += 1;
                    htmlParts.push(`<span class="ska-diff-added">${SA_Utils.escapeHtml(newWords[j])}</span>`);
                    j += 1;
                }
            }

            while (i < oldWords.length) {
                deletions += 1;
                htmlParts.push(`<span class="ska-diff-removed">${SA_Utils.escapeHtml(oldWords[i])}</span>`);
                i += 1;
            }

            while (j < newWords.length) {
                additions += 1;
                htmlParts.push(`<span class="ska-diff-added">${SA_Utils.escapeHtml(newWords[j])}</span>`);
                j += 1;
            }

            return { html: htmlParts.join(' '), additions, deletions, tooLarge: false };
        },
        getPausenTime: (text, settings = {}) => {
            let total = 0;
            const safeText = text || '';
            const cleaned = SA_Utils.cleanTextForCounting(safeText);
            const profileConfig = settings.profileConfig || {};
            const ignoreMarkers = Boolean(profileConfig.ignorePauseMarkers || settings.ignorePauseMarkers);
            const pauseUnit = profileConfig.pauseUnit || 's';
            if (!ignoreMarkers) {
                const legacy = safeText.match(/\|([0-9\.]+)S?\|/g) || [];
                total += legacy.reduce((acc, m) => acc + (parseFloat(m.replace(/[^0-9.]/g, '')) || 0), 0);
                const newFormat = safeText.match(/\[PAUSE\s*:\s*([0-9]+(?:\.[0-9]+)?)(?:ms|s)?\]/gi) || [];
                total += newFormat.reduce((acc, m) => {
                    const val = m.match(/([0-9]+(?:\.[0-9]+)?)/);
                    if (!val) return acc;
                    const rawVal = parseFloat(val[1]);
                    if (Number.isNaN(rawVal)) return acc;
                    const hasMs = /ms/i.test(m);
                    const hasSec = /s/i.test(m);
                    const seconds = hasMs ? rawVal / 1000 : (pauseUnit === 'ms' && !hasSec ? rawVal / 1000 : rawVal);
                    return acc + seconds;
                }, 0);
                total += ((safeText.match(/\|/g) || []).length - legacy.length * 2) * 0.5;
            }
            const commaPause = parseFloat(settings.commaPause != null ? settings.commaPause : (profileConfig.commaPause ?? 0));
            const periodPause = parseFloat(settings.periodPause != null ? settings.periodPause : (profileConfig.periodPause ?? 0));
            const paragraphPause = parseFloat(settings.paragraphPause != null ? settings.paragraphPause : (profileConfig.paragraphPause ?? 1));
            if (commaPause > 0) {
                total += (cleaned.match(/,/g) || []).length * commaPause;
            }
            if (periodPause > 0) {
                total += (cleaned.match(/[.!?]/g) || []).length * periodPause;
            }
            if (paragraphPause > 0) {
                const paragraphBreaks = safeText.split(/\n\s*\n+/).length - 1;
                if (paragraphBreaks > 0) total += paragraphBreaks * paragraphPause;
            }
            return total;
        },
        insertAtCursor: (field, value) => {
            if (field.isContentEditable) {
                field.focus();
                document.execCommand('insertText', false, value);
                return;
            }
            if (field.selectionStart || field.selectionStart === 0) {
                var startPos = field.selectionStart; var endPos = field.selectionEnd;
                field.value = field.value.substring(0, startPos) + value + field.value.substring(endPos, field.value.length);
                field.selectionStart = startPos + value.length; field.selectionEnd = startPos + value.length;
            } else { field.value += value; }
            field.focus();
        },
        insertMarkerAtCursor: (field, marker) => {
            if (!marker) return;
            if (!field.isContentEditable) {
                SA_Utils.insertAtCursor(field, marker);
                return;
            }
            field.focus();
            const safeMarker = String(marker);
            const markerId = `ska-marker-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            const caretId = `ska-caret-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            const html = safeMarker
                .replace(/\n/g, '<br>')
                .replace(/\[([^\]]+)\]/g, (_, label) => `<span class="ska-inline-marker" contenteditable="false" data-marker="${label}" data-marker-id="${markerId}">[${label}]</span>`)
                .replace(/\|([0-9.]+S?)\|/g, (_, val) => `<span class="ska-inline-marker" contenteditable="false" data-marker="pause" data-marker-id="${markerId}">|${val}|</span>`)
                .replace(/\|/g, `<span class="ska-inline-marker" contenteditable="false" data-marker="pause" data-marker-id="${markerId}">|</span>`);
            document.execCommand('insertHTML', false, `${html}<span data-marker-caret="${caretId}" contenteditable="false">\u200B</span>`);
            const caretSpan = field.querySelector(`[data-marker-caret="${caretId}"]`);
            if (caretSpan) {
                const range = document.createRange();
                range.setStartAfter(caretSpan);
                range.collapse(true);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                caretSpan.removeAttribute('data-marker-caret');
            }
        },
        downloadJSON: (data, filename) => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = filename;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        },
        downloadText: (text, filename, options = {}) => {
            const bom = options.bom ? '\uFEFF' : '';
            const mime = options.mime || 'text/plain;charset=utf-8';
            const blob = new Blob([bom + text], { type: mime });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = filename;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        },
        openModal: (modal) => {
            if (!modal) return;
            modal.classList.remove('is-closing');
            modal.removeAttribute('data-closing');
            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('is-open');
            window.setTimeout(() => {
                modal.classList.add('is-visible');
            }, 25);
        },
        isPremiumFeatureEnabled: () => CURRENT_USER_PLAN === 'premium',
        closeModal: (modal, onClosed) => {
            if (!modal || modal.dataset.closing === 'true') return;
            modal.dataset.closing = 'true';
            modal.classList.remove('is-visible');
            modal.classList.add('is-closing');
            modal.setAttribute('aria-hidden', 'true');

            const transitionTarget = modal.querySelector('.skriptanalyse-modal-content') || modal;
            let finished = false;

            const finalize = () => {
                if (finished) return;
                finished = true;
                modal.classList.remove('is-open', 'is-closing');
                modal.removeAttribute('data-closing');
                if (modal.dataset.removeOnClose === 'true') {
                    modal.remove();
                }
                if (typeof onClosed === 'function') onClosed();
            };

            const onTransitionEnd = (event) => {
                if (event && event.target !== transitionTarget) return;
                transitionTarget.removeEventListener('transitionend', onTransitionEnd);
                finalize();
            };

            transitionTarget.addEventListener('transitionend', onTransitionEnd);
            window.setTimeout(finalize, 450);
        },
        copyToClipboard: async (text) => {
            const value = String(text || '').trim();
            if (!value) return false;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(value);
                    return true;
                } catch (err) {
                    // fallback below
                }
            }
            const textarea = document.createElement('textarea');
            textarea.value = value;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.top = '-999px';
            document.body.appendChild(textarea);
            textarea.select();
            let success = false;
            try {
                success = document.execCommand('copy');
            } catch (err) {
                success = false;
            }
            document.body.removeChild(textarea);
            return success;
        },

        getPhoneticSpelling: (word) => {
            if (SA_CONFIG.PRONUNCIATION_DB[word]) return SA_CONFIG.PRONUNCIATION_DB[word];
            if (word.endsWith('ig')) return word.slice(0, -2) + 'ich';
            return word;
        },

        injectGlobalStyles: () => {
            const styleId = 'ska-style-overrides';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.innerHTML = `
                    .ska-help-card:hover { transform: none !important; box-shadow: 0 2px 4px rgba(0,0,0,0.03) !important; }
                    .skriptanalyse-badge:hover { transform: none !important; box-shadow: none !important; }

                    /* Rhythm Bars */
                    .ska-rhythm-bar { transition: all 0.2s; opacity: 0.8; cursor: pointer; position: relative; }
                    .ska-rhythm-bar:hover { z-index: 1000; opacity: 1; transform: scaleY(1.1); background-color: #1a93ee !important; filter: brightness(1.1); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

                    /* Sentence Preview Box */
                    .ska-rhythm-preview {
                        margin-top: 25px;
                        padding: 0.85rem;
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 10px;
                        font-size: 0.85rem;
                        line-height: 1.5;
                        color: #334155;
                        min-height: 4.5rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        transition: all 0.25s ease;
                        font-style: italic;
                    }
                    .ska-rhythm-preview.is-active {
                        background: #eff6ff;
                        border-color: #1a93ee;
                        color: #0f172a;
                        font-style: normal;
                        box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
                    }

                    /* Immediate Modern Tooltip for Rhythm Bars */
                    .ska-rhythm-bar::before {
                        content: attr(data-words) " Wörter";
                        position: absolute;
                        top: -30px;
                        left: 50%;
                        transform: translateX(-50%) translateY(5px);
                        background: #0f172a;
                        color: #ffffff;
                        font-size: 10px;
                        font-weight: 700;
                        padding: 4px 8px;
                        border-radius: 6px;
                        white-space: nowrap;
                        pointer-events: none;
                        z-index: 100;
                        opacity: 0;
                        transition: opacity 0.15s ease, transform 0.15s ease;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
                    }
                    .ska-rhythm-bar:hover::before {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }

                    /* Modernized Tip Box Fixed at Footer */
                    .ska-card-tips {
                        background: #ffffff !important;
                        border: 1px solid #e2e8f0 !important;
                        border-radius: 12px !important;
                        padding: 1.1rem 1.3rem !important;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
                        margin-top: auto !important;
                        position: relative;
                        transition: all 0.3s ease;
                    }
                    .ska-card-body {
                        display: flex;
                        flex-direction: column;
                    }
                    .ska-card-body-content {
                        display: flex;
                        flex-direction: column;
                        gap: 1.2rem;
                        flex: 1;
                        min-height: 100%;
                    }
                    .ska-search-hit {
                        background: #fde68a;
                        padding: 0 2px;
                        border-radius: 4px;
                    }
                    .ska-search-hit.is-active {
                        background: #f97316;
                        color: #ffffff;
                    }
                    .ska-tip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
                    .ska-tip-badge {
                        background: #eff6ff !important;
                        color: #1a93ee !important;
                        padding: 4px 10px !important;
                        border-radius: 20px !important;
                        font-weight: 700 !important;
                        font-size: 0.75rem !important;
                        letter-spacing: 0.02em;
                        text-transform: uppercase;
                    }
                    .ska-tip-next-btn {
                        background: none !important;
                        border: none !important;
                        color: #64748b !important;
                        font-size: 0.75rem !important;
                        font-weight: 600 !important;
                        cursor: pointer !important;
                        padding: 4px 8px !important;
                        border-radius: 6px;
                        transition: all 0.2s;
                    }
                    .ska-tip-next-btn:hover { background: #f1f5f9 !important; color: #1a93ee !important; }
                    .ska-tip-content { margin: 0 !important; color: #334155 !important; font-size: 0.9rem !important; line-height: 1.5 !important; }

                    .ska-synonym-tooltip {
                        position: fixed;
                        z-index: 9999;
                        min-width: 220px;
                        max-width: 320px;
                        background: #0f172a;
                        color: #e2e8f0;
                        border-radius: 12px;
                        padding: 0.75rem;
                        box-shadow: 0 18px 35px rgba(15, 23, 42, 0.25);
                        font-size: 0.78rem;
                        opacity: 0;
                        transform: translateY(6px);
                        transition: opacity 0.15s ease, transform 0.15s ease;
                        pointer-events: none;
                    }
                    .ska-synonym-tooltip.is-visible {
                        opacity: 1;
                        transform: translateY(0);
                        pointer-events: auto;
                    }
                    .ska-synonym-tooltip-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 0.5rem;
                        font-weight: 700;
                    }
                    .ska-synonym-tooltip-source {
                        font-size: 0.68rem;
                        color: #94a3b8;
                    }
                    .ska-synonym-list {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.35rem;
                        margin: 0.4rem 0 0.6rem;
                    }
                    .ska-synonym-chip {
                        background: rgba(148, 163, 184, 0.2);
                        color: #e2e8f0;
                        border: 1px solid rgba(148, 163, 184, 0.4);
                        border-radius: 999px;
                        padding: 0.18rem 0.55rem;
                        font-size: 0.7rem;
                        cursor: pointer;
                        transition: all 0.15s ease;
                    }
                    .ska-synonym-chip:hover {
                        background: rgba(59, 130, 246, 0.2);
                        border-color: rgba(59, 130, 246, 0.5);
                        color: #e0f2fe;
                    }
                    .ska-synonym-actions {
                        display: flex;
                        gap: 0.4rem;
                        flex-wrap: wrap;
                    }
                    .ska-synonym-action-btn {
                        background: #1e293b;
                        color: #e2e8f0;
                        border: 1px solid #334155;
                        border-radius: 8px;
                        padding: 0.2rem 0.55rem;
                        font-size: 0.68rem;
                        cursor: pointer;
                        transition: all 0.15s ease;
                    }
                    .ska-synonym-action-btn:hover {
                        border-color: #38bdf8;
                        color: #e0f2fe;
                    }
                    .ska-synonym-tooltip-note {
                        margin-top: 0.4rem;
                        font-size: 0.68rem;
                        color: #94a3b8;
                    }
                `;
                document.head.appendChild(style);
            }
        },

        storage: { save: (k,v)=>localStorage.setItem(k,v), load: k=>localStorage.getItem(k), clear: k=>localStorage.removeItem(k) }
    };

    // ... (SA_Logic, SkriptAnalyseWidget, etc. - skipping for brevity if not modifying) ...
    // Since I'm appending, I need to keep the file structure.
    // However, `read_file` returned only part of `assets/app.js` (it was truncated or I just see a part in the thought).
    // The `write_file` overwrites the file. I must be careful not to lose existing code.
    // I should use `read_file` to get the full content first, then append.
    // But `read_file` output in the previous turn was huge and truncated in display ("...6712 lines omitted...").
    // I should not overwrite with truncated content.
    // Better to use `run_in_bash_session` to append to the file.

})();


/* --- PROJEKT MANAGER LOGIK (UPDATED) --- */
(function() {
    // Hilfsfunktion: Modals erstellen
    const createModalHTML = (id, title, bodyContent) => `
        <div id="${id}" class="skriptanalyse-modal">
            <div class="skriptanalyse-modal-overlay" onclick="document.getElementById('${id}').classList.remove('is-visible')"></div>
            <div class="skriptanalyse-modal-content">
                <div class="ska-modal-header">
                    <h3>${title}</h3>
                    <button class="ska-close-icon" onclick="document.getElementById('${id}').classList.remove('is-visible')">&times;</button>
                </div>
                <div class="skriptanalyse-modal-body">${bodyContent}</div>
            </div>
        </div>
    `;

    // 1. UI Initialisieren (Sicherer Start)
    function initProjectUI() {
        try {
            // A. Entferne alte Sektion falls vorhanden
            const oldSection = document.querySelector('.project-manager-ui');
            if(oldSection) oldSection.remove();

            // B. Button Einfügen (Sicherheits-Check)
            const clearBtn = document.querySelector('button[data-action="clean"]') || document.querySelector('.btn-clear-script');

            // Nur einfügen wenn clearBtn existiert und noch kein Load-Button da ist
            if (clearBtn && clearBtn.parentNode && !document.querySelector('.ska-btn-brand-blue')) {
                // Wrapper für saubere Ausrichtung
                const wrapper = document.createElement('div');
                wrapper.className = 'project-manager-ui ska-tool-wrapper';
                wrapper.style.display = 'inline-flex';
                wrapper.style.gap = '5px';
                wrapper.style.marginRight = '10px';

                const loadBtn = document.createElement('button');
                loadBtn.className = 'ska-btn ska-btn-brand-blue ska-tool-btn'; // ska-tool-btn für einheitlichen Style
                loadBtn.innerHTML = '<span class="dashicons dashicons-portfolio" style="font-family:dashicons; margin-right:4px;"></span> Projekte laden';
                loadBtn.type = "button";
                loadBtn.onclick = function(e) {
                    e.preventDefault();
                    if(typeof openLoadModal === 'function') openLoadModal();
                };

                const saveBtn = document.createElement('button');
                saveBtn.className = 'ska-tool-btn';
                saveBtn.innerHTML = '<span class="dashicons dashicons-saved" style="font-family:dashicons; margin-right:4px;"></span> Speichern';
                saveBtn.type = "button";
                saveBtn.onclick = function(e) {
                    e.preventDefault();
                    if(typeof openSaveModal === 'function') openSaveModal();
                };

                wrapper.appendChild(loadBtn);
                wrapper.appendChild(saveBtn);

                // Insert logic
                const cleanWrapper = clearBtn.closest('.ska-tool-wrapper');
                if (cleanWrapper) {
                    cleanWrapper.parentNode.insertBefore(wrapper, cleanWrapper);
                } else {
                    clearBtn.parentNode.insertBefore(wrapper, clearBtn);
                }
            }

            // 2. Editor Value Helper (Global verfügbar machen)
            window.getSkriptContent = function() {
                const editorDiv = document.querySelector('.skriptanalyse-textarea') || document.querySelector('.skript-editor');
                if (editorDiv) {
                    // Bevorzugt innerText für Zeilenumbrüche, value fallback
                    return editorDiv.value !== undefined ? editorDiv.value : editorDiv.innerText;
                }
                return '';
            };

            // 3. Editor Set Helper
            window.setSkriptContent = function(text) {
                 const editorDiv = document.querySelector('.skriptanalyse-textarea') || document.querySelector('.skript-editor');
                 if (editorDiv) {
                     if (editorDiv.value !== undefined) {
                         editorDiv.value = text;
                     } else {
                         editorDiv.innerText = text;
                     }
                     // Trigger Input Event for analysis update
                     editorDiv.dispatchEvent(new Event('input', { bubbles: true }));
                 }
            };

        } catch (err) {
            console.error('SKA Project UI Error:', err);
        }
    }

    // Global Functions for Modal Access
    window.openSaveModal = function() {
        if (window.skriptAnalyseConfig.currentUserPlan !== 'premium') {
            alert('Nur für Premium-Nutzer verfügbar.');
            return;
        }

        let modal = document.getElementById('ska-save-modal');
        if (!modal) {
            const body = `
                <div class="ska-save-controls" style="margin-bottom:1.5rem;">
                    <label style="display:block; margin-bottom:0.5rem; font-weight:600;">Neues Projekt anlegen</label>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="ska-new-project-name" placeholder="Projektname eingeben..." class="ska-input" style="flex:1;">
                        <button id="ska-btn-save-new" class="ska-btn ska-btn--primary">Speichern</button>
                    </div>
                </div>
                <div style="border-top:1px solid #e2e8f0; margin:1.5rem 0; padding-top:1.5rem;">
                    <h4 style="margin-top:0; margin-bottom:1rem;">Oder bestehendes Projekt überschreiben:</h4>
                    <div id="ska-save-list" class="ska-project-list" style="max-height:300px; overflow-y:auto;">Lade...</div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', createModalHTML('ska-save-modal', 'Projekt speichern', body));
            modal = document.getElementById('ska-save-modal');

            const saveBtn = document.getElementById('ska-btn-save-new');
            if (saveBtn) {
                saveBtn.onclick = () => {
                    const titleInput = document.getElementById('ska-new-project-name');
                    const title = titleInput ? titleInput.value : '';
                    if(!title) return alert('Bitte Namen eingeben');
                    saveProjectAjax(title, 0);
                };
            }
        }

        loadProjectsForList('ska-save-list', 'save-mode');
        modal.classList.add('is-visible');
    }

    window.openLoadModal = function() {
        if (window.skriptAnalyseConfig.currentUserPlan !== 'premium') {
            alert('Nur für Premium-Nutzer verfügbar.');
            return;
        }

        let modal = document.getElementById('ska-load-modal');
        if (!modal) {
            const body = `<div id="ska-load-list" class="ska-project-list" style="max-height:400px; overflow-y:auto;">Lade...</div>`;
            document.body.insertAdjacentHTML('beforeend', createModalHTML('ska-load-modal', 'Projekt laden', body));
            modal = document.getElementById('ska-load-modal');
        }

        loadProjectsForList('ska-load-list', 'load-mode');
        modal.classList.add('is-visible');
    }

    // AJAX: Liste laden & Rendern
    function loadProjectsForList(containerId, mode) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '<div class="ska-spinner">Lade Daten...</div>';

        const formData = new FormData();
        formData.append('action', 'ska_list_projects');
        formData.append('nonce', window.skriptAnalyseConfig.nonce);

        fetch(window.skriptAnalyseConfig.ajaxUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(res => {
            if (!res.success || !res.data || !res.data.length) {
                container.innerHTML = '<p class="text-muted" style="color:#64748b; font-style:italic;">Noch keine Projekte gespeichert.</p>';
                return;
            }

            let html = '<div style="display:flex; flex-direction:column; gap:8px;">';
            res.data.forEach(p => {
                html += `
                    <div class="ska-project-item" style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px;">
                        <div class="ska-project-info">
                            <strong style="display:block; color:#0f172a;">${p.title}</strong>
                            <span style="font-size:0.8rem; color:#64748b;">${p.date} (${p.ago})</span>
                        </div>
                        <div class="ska-project-actions" style="display:flex; gap:5px;">
                            ${mode === 'save-mode'
                                ? `<button class="ska-btn ska-btn--secondary ska-btn--compact" onclick="window.skaOverwriteProject(${p.id}, '${p.title.replace(/'/g, "\'")}')">Überschreiben</button>`
                                : `<button class="ska-btn ska-btn--primary ska-btn--compact" onclick="window.skaLoadProject(${p.id})">Laden</button>`
                            }
                            <button class="ska-btn ska-btn--ghost ska-btn--compact" style="color:#ef4444;" onclick="window.skaDeleteProject(${p.id}, '${containerId}', '${mode}')" title="Löschen">&times;</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        })
        .catch(err => {
            container.innerHTML = '<p style="color:red;">Fehler beim Laden.</p>';
            console.error(err);
        });
    }

    // Globale Funktionen für Onclick
    window.skaOverwriteProject = (id, title) => {
        if(confirm(`Projekt "${title}" wirklich überschreiben?`)) {
            saveProjectAjax(title, id);
        }
    };

    window.skaLoadProject = (id) => {
        const formData = new FormData();
        formData.append('action', 'ska_get_project');
        formData.append('nonce', window.skriptAnalyseConfig.nonce);
        formData.append('id', id);

        fetch(window.skriptAnalyseConfig.ajaxUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(res => {
            if(res.success) {
                if(window.setSkriptContent) {
                    window.setSkriptContent(res.data.content);
                } else {
                    // Fallback
                    const editor = document.querySelector('.skriptanalyse-textarea');
                    if(editor) editor.innerText = res.data.content;
                }

                const loadModal = document.getElementById('ska-load-modal');
                if (loadModal) loadModal.classList.remove('is-visible');
            } else {
                alert('Fehler: ' + (res.data || 'Unbekannter Fehler'));
            }
        })
        .catch(err => {
            console.error(err);
            alert('Netzwerkfehler beim Laden.');
        });
    };

    window.skaDeleteProject = (id, containerId, mode) => {
        if(!confirm('Wirklich löschen?')) return;

        const formData = new FormData();
        formData.append('action', 'ska_delete_project');
        formData.append('nonce', window.skriptAnalyseConfig.nonce);
        formData.append('id', id);

        fetch(window.skriptAnalyseConfig.ajaxUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(res => {
            loadProjectsForList(containerId, mode);
        });
    };

    function saveProjectAjax(title, id) {
        // Use the safe getter
        const content = window.getSkriptContent ? window.getSkriptContent() : '';

        const formData = new FormData();
        formData.append('action', 'ska_save_project');
        formData.append('nonce', window.skriptAnalyseConfig.nonce);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('id', id);

        fetch(window.skriptAnalyseConfig.ajaxUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(res => {
            if(res.success) {
                alert(res.data.message);
                const saveModal = document.getElementById('ska-save-modal');
                if (saveModal) saveModal.classList.remove('is-visible');
            } else {
                alert('Fehler: ' + (res.data || 'Unbekannter Fehler'));
            }
        })
        .catch(err => {
            console.error(err);
            alert('Netzwerkfehler beim Speichern.');
        });
    }

    // Starte UI sicher
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectUI);
    } else {
        initProjectUI();
    }

})();
