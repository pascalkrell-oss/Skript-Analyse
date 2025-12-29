/**
 * Skript-Analyse App 4.75.9 (Wave Preview & Audio Refinement)
 * Fixes: Rhythm Wave Sentence Preview, Optimized Audio Phrasing, Closer Label Alignment
 */

(function () {
    'use strict';

    // CONFIG
    const SA_CONFIG = {
        STORAGE_KEY: 'skriptanalyse_autosave_v4_99', 
        UI_KEY_HIDDEN: 'skriptanalyse_hidden_cards',
        UI_KEY_EXCLUDED: 'skriptanalyse_excluded_cards',
        UI_KEY_SETTINGS: 'skriptanalyse_settings_global',
        PRO_MODE: Boolean(window.SKA_CONFIG_PHP && SKA_CONFIG_PHP.pro),
        WORKER_TEXT_THRESHOLD: 12000,
        COLORS: { success: '#16a34a', warn: '#ea580c', error: '#dc2626', blue: '#1a93ee', text: '#0f172a', muted: '#94a3b8', disabled: '#cbd5e1' },
        
        WPM: { werbung: 170, imagefilm: 155, erklaer: 145, hoerbuch: 115, podcast: 150, ansage: 160, elearning: 135, social: 170, buch: 120, default: 150 },
        SPS: { werbung: 4.6, imagefilm: 4.0, erklaer: 3.8, hoerbuch: 3.4, podcast: 3.8, ansage: 3.9, elearning: 3.5, social: 4.8, buch: 3.2, default: 3.8 },

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
            fillers: 'In {focus} unnötige Füllwörter konsequent streichen.',
            passive: '{focus} profitiert von aktivem Sprachfluss.',
            nominal: '{focus}: Verben statt Nominalstil einsetzen.',
            nominal_chain: '{focus}: Nominalketten auflösen, damit der Fluss bleibt.',
            anglicism: '{focus}: Fremdwörter nur dort, wo sie wirklich nötig sind.',
            echo: '{focus}: Wortwiederholungen bewusst variieren.',
            breath: '{focus}: Atemstellen einplanen, Satzbögen nicht überziehen.',
            stumble: '{focus}: sprecherfreundliche Wörter bevorzugen.',
            cta: '{focus}: Handlungsaufforderung klar und direkt platzieren.',
            adjective: '{focus}: Adjektive sparsam setzen, starke Bilder wählen.',
            rhythm: '{focus}: Satzlängen variieren, damit der Rhythmus lebt.',
            dialog: '{focus}: Dialoganteile passend zur Szene dosieren.',
            gender: '{focus}: inklusive Begriffe nutzen, ohne den Flow zu brechen.',
            start_var: '{focus}: Satzanfänge variieren für Dynamik.',
            role_dist: '{focus}: Rollenwechsel klar markieren.',
            vocabulary: '{focus}: Wortschatz kontrolliert variieren.',
            pronunciation: '{focus}: schwierige Wörter früh glätten.',
            keyword_focus: '{focus}: Fokusbegriffe konsistent einsetzen.',
            spread_index: '{focus}: Streuung der Satzlängen bewusst steuern.',
            plosive: '{focus}: Plosiv-Cluster entschärfen.',
            redundancy: '{focus}: Wiederholungen nur als Stilmittel.',
            bpm: '{focus}: Taktgefühl an Stimmung koppeln.',
            easy_language: '{focus}: einfache Wörter, kurze Sätze.',
            teleprompter: '{focus}: Zeilen so setzen, dass der Flow ruhig bleibt.',
            arousal: '{focus}: Energie gezielt auf Peaks setzen.',
            bullshit: '{focus}: Floskeln durch konkrete Aussagen ersetzen.',
            metaphor: '{focus}: Bildsprache frisch halten.',
            audience: '{focus}: Komplexität sauber an die Zielgruppe anpassen.',
            verb_balance: '{focus}: Verben als Treiber nutzen.',
            rhet_questions: '{focus}: Fragen gezielt für Aufmerksamkeit einsetzen.',
            depth_check: '{focus}: Schachtelsätze kürzen.',
            sentiment_intensity: '{focus}: Emotionen dosiert einsetzen.',
            naming_check: '{focus}: Namen konsistent halten.'
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
        PROFILE_CARDS: {
            sprecher: ['overview', 'char', 'rhythm', 'spread_index', 'arousal', 'coach', 'pronunciation', 'plosive', 'breath', 'teleprompter', 'bpm', 'rhet_questions'],
            autor: ['overview', 'char', 'vocabulary', 'keyword_focus', 'verb_balance', 'rhet_questions', 'depth_check', 'sentiment_intensity', 'naming_check', 'redundancy', 'bullshit', 'metaphor', 'audience', 'easy_language'],
            regie: ['overview', 'char', 'coach', 'role_dist', 'dialog', 'marker', 'teleprompter', 'arousal', 'bpm', 'breath'],
            agentur: ['overview', 'char', 'keyword_focus', 'vocabulary', 'bullshit', 'metaphor', 'audience', 'cta', 'adjective', 'anglicism', 'echo'],
            marketing: ['overview', 'char', 'keyword_focus', 'cta', 'bullshit', 'metaphor', 'audience', 'vocabulary', 'adjective', 'echo', 'anglicism']
        },
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
            marker: '🖍️ Struktur & Marker', 
            cta: '📣 Call to Action', 
            compare: '⚖️ Versions-Vergleich', 
            adjective: '🌸 Adjektiv-Dichte',
            rhythm: '🌊 Satz-Rhythmus',
            dialog: '💬 Dialog-Balance',
            gender: '🌈 Gender-Neutralität',
            start_var: '🔄 Satzanfang-Varianz',
            role_dist: '👥 Rollen-Verteilung',
            vocabulary: '📚 Wortschatz-Reichtum',
            pronunciation: '🗣️ Aussprache-Check',
            keyword_focus: '🎯 Keyword-Fokus',
            spread_index: '📈 Satz-Spreizungs-Index',
            plosive: '💥 Plosiv-Check',
            redundancy: '🧠 Semantische Redundanz',
            bpm: '🎵 Audio-BPM-Matching',
            easy_language: '🧩 Leichte Sprache',
            teleprompter: '🪄 Teleprompter',
            arousal: '⚡ Arousal-Map',
            bullshit: '🧨 Buzzword-Check',
            metaphor: '🪞 Metaphern & Phrasen',
            audience: '🎯 Zielgruppen-Filter',
            verb_balance: '⚖️ Verb-Fokus',
            rhet_questions: '❓ Rhetorische Fragen',
            depth_check: '🧵 Satz-Verschachtelung',
            sentiment_intensity: '🌡️ Stimmungs-Intensität',
            naming_check: '🧩 Naming-Check'
        },

        CARD_DESCRIPTIONS: {
            overview: 'Die wichtigsten Zahlen: Zeit, Wörter und Flesch-Index.',
            char: 'Prüft, wie dein Text wirkt: Persönlich? Positiv? Verständlich?',
            stumble: 'Findet Zungenbrecher (Phonetik), S-Laut-Häufungen und lange Wortungetüme.',
            breath: 'Findet Sätze, die den natürlichen Atemfluss unterbrechen könnten.', 
            echo: 'Findet unschöne Wortwiederholungen auf engem Raum.',
            passive: 'Prüft das Verhältnis von aktiver zu passiver Sprache.',
            fillers: 'Findet Wörter, die man oft streichen kann.',
            nominal: 'Markiert einzelne Wörter im "Papierdeutsch" (-ung, -heit).',
            nominal_chain: 'Findet ganze Passagen mit hoher Dichte an "Behördensprache".',
            anglicism: 'Findet englische Begriffe im deutschen Text.',
            coach: 'Deine persönliche Regie-Assistenz für Tempo, Dynamik und Haltung.',
            marker: 'Hilft dir, den Text visuell zu strukturieren und Audio-Marker zu exportieren.',
            cta: 'Prüft, ob am Ende eine klare Handlungsaufforderung steht (Conversion-Fokus).',
            compare: 'Vergleich mit der gespeicherten Version.',
            adjective: 'Prüft, ob der Text durch zu viele Adjektive (Endungen wie -ig, -lich) überladen wirkt.',
            rhythm: 'Visualisiert die Abfolge von kurzen und langen Sätzen (Short-Short-Long Prinzip).',
            dialog: 'Zeigt das Verhältnis zwischen Erzähler-Text und wörtlicher Rede (Dialog).',
            gender: 'Findet generische Maskuline und schlägt neutrale Alternativen vor.',
            start_var: 'Findet monotone Satzanfänge (z.B. "Dann... Dann...").',
            role_dist: 'Erkennt Rollen anhand von Großbuchstaben (z.B. "TOM:") und berechnet deren Anteil.',
            vocabulary: 'Berechnet die Type-Token-Ratio (TTR) um den Wortreichtum zu bestimmen.',
            pronunciation: 'Zeigt Wörter mit besonderer Aussprache.',
            keyword_focus: 'Analysiert dominante Substantive und prüft die Fokus-Schärfe.',
            spread_index: 'Misst die Streuung der Satzlängen für den Rhythmus-Check.',
            plosive: 'Warnt vor harten Plosiv-Folgen am Wortanfang.',
            redundancy: 'Findet inhaltliche Dopplungen in aufeinanderfolgenden Sätzen.',
            bpm: 'Schlägt ein passendes Musiktempo (BPM) für den Text vor.',
            easy_language: 'Prüft Verständlichkeit nach Leichte-Sprache-Kriterien.',
            teleprompter: 'Erstellt eine scrollende Ansicht im berechneten Tempo.',
            arousal: 'Visualisiert Energieverlauf im Skript.',
            bullshit: 'Findet Buzzwords und hohle Phrasen im Text.',
            metaphor: 'Zählt bekannte Redewendungen, um Klischees sichtbar zu machen.',
            audience: 'Prüft den Text gegen den gewählten Zielgruppen-Level.',
            verb_balance: 'Vergleicht Verben und Substantive für mehr Handlungsfokus.',
            rhet_questions: 'Zeigt die Verteilung rhetorischer Fragen im Text.',
            depth_check: 'Markiert Sätze mit zu vielen Nebensatz-Ebenen.',
            sentiment_intensity: 'Zeigt den emotionalen Vibe-Verlauf im Skript.',
            naming_check: 'Findet ähnliche Eigennamen mit Tippfehlern.'
        },

        CARD_ORDER: ['char', 'rhythm', 'spread_index', 'arousal', 'coach', 'vocabulary', 'keyword_focus', 'role_dist', 'pronunciation', 'plosive', 'redundancy', 'bpm', 'easy_language', 'bullshit', 'metaphor', 'audience', 'verb_balance', 'rhet_questions', 'depth_check', 'sentiment_intensity', 'naming_check', 'teleprompter', 'gender', 'dialog', 'start_var', 'stumble', 'breath', 'adjective', 'echo', 'passive', 'fillers', 'anglicism', 'nominal_chain', 'nominal', 'marker', 'cta'],
        
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
        
        TIPS: {
            fillers: ["Hoch-Gewichtete Wörter sind 'Semantisches Rauschen'.", "Wörter like 'eigentlich' suggerieren Unsicherheit. Sei konkret!", "Nutze Füllwörter nur bewusst für einen sehr lockeren Umgangston.", "Je kürzer der Spot (Werbung), desto tödlicher ist jedes 'vielleicht'.", "Prüfe bei jedem Füllwort: Ändert sich der Sinn, wenn es fehlt? Wenn nein: Weg damit."],
            nominal: ["Wörter auf -ung, -heit, -keit ersticken den Sprachfluss.", "Nominalstil klingt nach Behörde. Ein Skript sollte so klingen, wie Menschen wirklich reden.", "Suche nach dem 'versteckten Verb' in Substantiven wie 'die Bearbeitung' -> 'wir bearbeiten'.", "Textdichte durch Nominalstil ermüdet das Ohr deines Hörers sehr schnell.", "Verben sind die Motoren deiner Sprache – sie bringen Bewegung und Leben in das Skript."],
            nominal_chain: ["Behördensprache ist der Feind von Audio.", "Löse diese Cluster auf, indem du sie in zwei einfachere Sätze mit Verben verwandelst.", "Ketten von Substantiven (-ung, -heit, -ät) machen den Text atemlos und hölzern.", "Baue mehr Verben ein: Sie ziehen den Satz nach vorn und klingen natürlicher.", "Vermeide Genitiv-Ketten – lieber mit Präpositionen auflösen."],
            role_dist: ["Nutze die Rollenerkennung für Zeit-Kalkulation.", "Zu viele kurze Einwürfe können den Fluss stören, zu lange Monologe ermüden.", "Achte auf ein ausgewogenes Verhältnis, wenn es ein Dialog sein soll.", "Wechsle zwischen Erzähler und Dialog, um Monotonie zu vermeiden.", "Achte auf klare Sprecherwechsel, damit der Hörer sofort folgt."],
            passive: ["Aktivsprache erzeugt Bilder im Kopf.", "Passiv versteckt den Handelnden ('Es wurde entschieden' vs 'Wir entschieden').", "Der Passiv-Killer sucht nach 'werden' + 'gemacht/getan' (Partizip II).", "Vermeide 'wurde/werden', wenn du Dynamik und Verantwortung transportieren willst.", "Aktive Sätze sind meist kürzer, prägnanter und überzeugender."],
            anglicism: ["Bleib verständlich.", "Prüfe kritisch: Gibt es ein einfacheres deutsches Wort, das jeder sofort versteht?", "Anglizismen können modern wirken, aber auch eine Barriere zwischen dir und dem Hörer bauen.", "Nutze englische Begriffe nur dort, wo sie als etablierter Fachbegriff unverzichtbar sind.", "In Audio-Medien zählen vertraute Wörter mehr, da der Hörer nicht zurückblättern kann."],
            echo: ["Variiere deine Wortwahl für mehr Lebendigkeit.", "Suche nach Synonymen, um den Text für den Sprecher lebendig zu halten.", "Echos innerhalb von zwei Sätzen fallen im Audio sofort als 'Sprechfehler' auf.", "Wortwiederholungen ermüden das Gehör. Nutze ein Thesaurus-Tool für Abwechslung.", "Ein reicher Wortschatz wirkt kompetenter und hält die Aufmerksamkeit des Hörers hoch."],
            breath: ["Ein Gedanke pro Satz. Das gibt Raum zum Atmen.", "Viele Kommas sind oft ein Zeichen für Schachtelsätze. Trenne sie mit einem Punkt.", "Lange Sätze zwingen den Sprecher zu hohem Tempo – das stresst den Hörer.", "Prüfe: Kannst du den Satz laut lesen, ohne am Ende außer Atem zu sein?", "Kurze Sätze erhöhen die Textverständlichkeit bei komplexen Themen drastisch."],
            stumble: ["Einfache Phonetik hilft der Emotion.", "Vermeide Bandwurmwörter – sie sind schwer zu betonen und fehleranfällig.", "Lies kritische Stellen dreimal schnell hintereinander laut. Klappt es? Dann ist es okay.", "CamelCase Wörter wie 'SoftwareLösung' sind visuelle Marker, aber akustische Hürden.", "Achte auf 'Zisch-Gewitter' (S, Z, Sch), die am Mikrofon oft unangenehm knallen."],
            cta: ["Der CTA gehört in die letzten 10% des Textes.", "Verwende den Imperativ ('Sichere dir...'), um eine direkte Handlung auszulösen.", "Vermeide Konjunktive im CTA. 'Du könntest' ist viel schwächer als 'Mach es jetzt'.", "Wenn der CTA versteckt in der Mitte liegt, verpufft die Wirkung oft.", "Formuliere den CTA aktiv und eindeutig – ein Ziel pro Satz."],
            adjective: ["Streiche Adjektive, die im Substantiv stecken.", "Show, don't tell: Statt 'es war ein gefährlicher Hund', beschreibe das Knurren.", "Zu viele Adjektive wirken oft 'blumig' und schwächen starke Substantive und Verben.", "Nutze Adjektive sparsam, um echte Highlights zu setzen.", "Wörter auf -lich oder -ig klingen in Häufung oft nach Werbesprache."],
            rhythm: ["Short-Short-Long ist ein klassischer Rhythmus.", "Monotonie tötet die Aufmerksamkeit. Vermeide viele gleich lange Sätze hintereinander.", "Nutze kurze Sätze für Fakten und Tempo. Nutze längere für Erklärungen.", "Ein guter Text tanzt: Variiere zwischen kurzen und mittellangen Sätzen.", "Die visuelle Welle zeigt dir sofort, wo dein Text ins Stocken gerät."],
            dialog: ["Achte auf klare Sprecherwechsel.", "Werbespots wirken durch Dialoge ('Szenen') oft authentischer als reine Ansagen.", "Zu viel Dialog ohne Erzähler kann den Hörer orientierungslos machen.", "Hörbücher brauchen lebendige Figuren. Zu wenig Dialog wirkt oft trocken.", "Dialoge lockern lange Erklär-Passagen auf und erhöhen die Aufmerksamkeit."],
            gender: ["Sprache schafft Wirklichkeit.", "Oft sind Partizipien ('Mitarbeitende') eine elegante Lösung.", "Vermeide das generische Maskulinum in Corporate Communications.", "Neutrale Sprache wirkt moderner und professioneller.", "Überprüfe, ob 'Kunden' wirklich nur Männer meint, oder ob 'Kundschaft' besser passt."],
            start_var: ["Variiere den Satzanfang für mehr Dynamik.", "Variiere die Satzstruktur: Stell mal das Objekt oder eine Zeitangabe an den Anfang.", "Monotonie im Satzbau überträgt sich sofort auf die Sprechmelodie.", "Wiederholungen sind nur okay, wenn sie als rhetorisches Stilmittel (Anapher) gewollt sind.", "Verbinde kurze Sätze logisch miteinander, statt sie nur aneinanderzureihen."],
            vocabulary: ["Ein hoher TTR-Wert (>60) zeigt Reichtum.", "Ein niedriger Wert (<40) ist typisch für fokussierte Werbebotschaften oder Claims.", "Wiederholungen senken den Wortwert, sind aber für Audio-Branding oft gewollt.", "Überprüfe bei niedrigem Wert: Ist die Wiederholung Absicht oder Faulheit?", "Variiere Wortfelder bewusst, statt Synonyme wahllos zu streuen."],
            pronunciation: ["Standarddeutsch: -ig wird wie -ich gesprochen.", "Fremdwörter wie 'Chance' oder 'Engagement' stolperfrei auszusprechen, wirkt professionell.", "Achte bei 'sp' und 'st' am Wortanfang immer auf den 'Sch'-Laut (Schtein, Schpiel).", "Schwierige Wörter früh erkennen und alternative Formulierungen bereithalten.", "Eigennamen: Schreibweise für Aussprache notieren (z.B. phonetisch)."],
            keyword_focus: ["Ein starkes Kernwort sollte klar dominieren.", "Wenn die Top-Begriffe gleich stark sind, wirkt die Botschaft diffus.", "Produktname & Nutzen sollten in den Top-Keywords sichtbar sein.", "Setze Keywords an Satzanfänge – dort wirken sie am stärksten.", "Zu viele Fokuswörter verwässern die Botschaft – priorisieren."],
            spread_index: ["Rhythmus entsteht durch Variation.", "Baue kurze Sätze ein, um lange Passagen aufzubrechen.", "Zu gleichmäßige Satzlängen wirken monoton.", "Gleichmäßige Satzlängen wirken ruhiger – Ausreißer gezielt einsetzen.", "Nutze kurze Sätze als Zäsur nach komplexen Informationen."],
            plosive: ["P- und B-Laute können am Mikrofon knallen.", "Entzerrung hilft: Zwischen Plosiv-Wörtern kurze Pausen setzen.", "Bei Nahbesprechung (z. B. im Podcast) leicht seitlich sprechen, um Pop-Geräusche zu vermeiden.", "Bei harten Plosiven (P/T/K) ggf. umformulieren oder mit weicherem Wort ersetzen.", "Sprecherfreundlich schreiben: Konsonanten-Cluster reduzieren."],
            redundancy: ["Wiederholungen direkt hintereinander wirken unfreiwillig.", "Formuliere den zweiten Satz mit anderem Fokus oder streiche ihn.", "Achte auf doppelte Bedeutungen ('weißer Schimmel').", "Streiche Dopplungen: Eine Aussage, ein Bild, ein Satz.", "Wiederholungen nur als Stilmittel – sonst kürzen."],
            bpm: ["Je schneller der Text, desto höher darf das Musiktempo sein.", "Eine ruhige Musik mit 60–90 BPM passt zu erklärenden Passagen.", "Für dynamische Texte sind 100–120 BPM oft stimmig.", "Längere Sätze mit Kommas strukturieren, damit die Atmung mitkommt.", "Tempo entsteht durch Variation – nicht durch dauerhafte Beschleunigung."],
            easy_language: ["Kurze Sätze und einfache Wörter erhöhen die Zugänglichkeit.", "Vermeide Passiv und Genitiv für Leichte Sprache.", "Prüfe Begriffe mit vielen Silben und ersetze sie durch Einfacheres.", "Ein Gedanke pro Satz – das erhöht Verständlichkeit sofort.", "Fachbegriffe nur, wenn nötig – sonst erklären oder ersetzen."],
            teleprompter: ["Nutze den Teleprompter im Vollbild für einen ruhigen Blick.", "Passe die Schriftgröße an die Distanz zum Screen an.", "Der Scroll folgt dem berechneten Tempo.", "Halte Zeilen kurz, damit die Augen ruhiger springen.", "Setze sinnvolle Pausenmarker, damit der Vortrag natürlicher bleibt."],
            arousal: ["Hohe Peaks markieren emotionale Stellen im Skript.", "Low-Energy-Zonen bewusst ruhiger sprechen.", "Variiere Energie, damit der Text lebendig bleibt.", "Baue Spannungswechsel ein: ruhig erklären, dann punktuell betonen.", "Zu hohe Dauerintensität ermüdet – Peaks gezielt setzen."],
            bullshit: ["Buzzwords klingen schnell nach Floskel.", "Formuliere konkret und messbar.", "Hass-Wörter in der Blacklist helfen beim Aufräumen.", "Konkrete Beispiele schlagen Buzzwords – ersetze Floskeln durch Nutzen.", "Wenn ein Satz nichts messbar sagt, streichen oder präzisieren."],
            metaphor: ["Klischees wirken vorhersehbar – prüfe Alternativen.", "Ein frisches Bild bleibt länger im Kopf als bekannte Sprüche.", "Metaphern sind stark, wenn sie zur Zielgruppe passen.", "Ein einziges gutes Bild schlägt fünf Floskeln.", "Originalität steigert die Sprecher-Wirkung spürbar."],
            audience: ["Für Kinder sind kurze Sätze und einfache Wörter Pflicht.", "News brauchen klare, direkte Formulierungen.", "Fachtexte dürfen komplexer sein, aber nicht verschachtelt.", "Sprich die Zielgruppe direkt an (Du/Sie) und bleibe konsistent.", "Teste jeden Satz: Würde die Zielgruppe das so sagen?"],
            verb_balance: ["Verben bringen Bewegung in den Text.", "Nominalstil bremst das Tempo.", "Mehr Verben = mehr Handlung.", "Mehr starke Verben, weniger Hilfsverben – das klingt entschlossener.", "Verben machen Audio lebendig: Aktiv statt Zustand."],
            rhet_questions: ["Fragen binden das Publikum ein.", "Zu viele Fragen wirken verhörend.", "Setze Fragen gezielt für Interaktion.", "Rhetorische Fragen sparsam einsetzen – sonst wirkt es unsicher.", "Beantworte die Frage unmittelbar, damit kein Leerlauf entsteht."],
            depth_check: ["Mehr als zwei Nebensatz-Ebenen überfordern beim Sprechen.", "Teile lange Schachtelsätze auf.", "Ein Gedanke pro Satz erhöht die Klarheit.", "Prüfe: Liefert der Satz neue Information oder nur Wiederholung?", "Details nur dort, wo sie die Aussage wirklich stützen."],
            sentiment_intensity: ["Emotionaler Wechsel hält die Aufmerksamkeit hoch.", "Achte auf harte Brüche im Vibe.", "Nutze positive Peaks als Highlights.", "Emotionalität dosieren: neutral erklären, dann gezielt färben.", "Vermeide extreme Superlative ohne Beleg – wirkt unglaubwürdig."],
            naming_check: ["Unklare Namensvarianten wirken unprofessionell.", "Prüfe Eigennamen auf Tippfehler.", "Konsistenz schafft Vertrauen.", "Begriffe einheitlich verwenden: nicht 'Produkt' und später 'Tool' mischen.", "Schreibe Abkürzungen beim ersten Auftreten aus."]
        },

        MARKERS: window.SKA_CONFIG_PHP && window.SKA_CONFIG_PHP.markers ? window.SKA_CONFIG_PHP.markers : []
    };

    const SA_Utils = {
        debounce: (func, delay) => { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; },
        formatMin: (sec) => { if (!sec || sec <= 0) return '0:00'; let m = Math.floor(sec / 60), s = Math.round(sec % 60); if(s===60){m++;s=0} return `${m}:${s < 10 ? '0' : ''}${s}`; },
        escapeRegex: (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        cleanTextForCounting: (text) => text
            .replace(/\s*\|[0-9\.]+S?\|\s*/g, ' ')
            .replace(/\s*\[PAUSE:.*?\]\s*/g, ' ')
            .replace(/\s*\[[A-ZÄÖÜ]{2,}\]\s*/g, ' ')
            .replace(/\s*\|\s*/g, ' ')
            .replace(/\s+/g, ' ')
            .trim(),
        getPausenTime: (text, settings = {}) => {
            let total = 0;
            const safeText = text || '';
            const cleaned = SA_Utils.cleanTextForCounting(safeText);
            const legacy = safeText.match(/\|([0-9\.]+)S?\|/g) || [];
            total += legacy.reduce((acc, m) => acc + (parseFloat(m.replace(/[^0-9.]/g, '')) || 0), 0);
            const newFormat = safeText.match(/\[PAUSE\s*:\s*([0-9]+(?:\.[0-9]+)?)(?:s)?\]/gi) || [];
            total += newFormat.reduce((acc, m) => {
                const val = m.match(/([0-9]+(?:\.[0-9]+)?)/);
                return acc + (val ? parseFloat(val[1]) : 0);
            }, 0);
            total += ((safeText.match(/\|/g) || []).length - legacy.length * 2) * 0.5;
            const commaPause = parseFloat(settings.commaPause ?? 0);
            const periodPause = parseFloat(settings.periodPause ?? 0);
            if (commaPause > 0) {
                total += (cleaned.match(/,/g) || []).length * commaPause;
            }
            if (periodPause > 0) {
                total += (cleaned.match(/[.!?]/g) || []).length * periodPause;
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
        downloadJSON: (data, filename) => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = filename;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
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
                        padding: 1rem 1.25rem !important;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
                        margin-top: auto !important; 
                        padding-top: 20px !important;
                        position: relative;
                        transition: all 0.3s ease;
                    }
                    .ska-card-body {
                        display: flex;
                        flex-direction: column;
                        gap: 20px; /* Space between content and the footer tip box */
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
                `;
                document.head.appendChild(style);
            }
        },

        storage: { save: (k,v)=>localStorage.setItem(k,v), load: k=>localStorage.getItem(k), clear: k=>localStorage.removeItem(k) }
    };

    const SA_Logic = {
        getHyphenator: () => {
            if (SA_Logic._hyphenatorChecked) return SA_Logic._hyphenator;
            SA_Logic._hyphenatorChecked = true;
            if (!SA_CONFIG.PRO_MODE) return null;
            const Hypher = window.Hypher;
            const patterns = window.hyphenationPatternsDe
                || window.hyphenationPatterns
                || (window.HyphenationPatterns && (window.HyphenationPatterns.de || window.HyphenationPatterns.de_DE))
                || window.HypherPatternsDe
                || window.HypherPatternsDE;
            if (Hypher && patterns) {
                SA_Logic._hyphenator = new Hypher(patterns);
            }
            return SA_Logic._hyphenator;
        },
        getSentimentEngine: () => {
            if (SA_Logic._sentimentChecked) return SA_Logic._sentimentEngine;
            SA_Logic._sentimentChecked = true;
            if (!SA_CONFIG.PRO_MODE) return null;
            const Sentiment = window.Sentiment;
            if (Sentiment) SA_Logic._sentimentEngine = new Sentiment();
            return SA_Logic._sentimentEngine;
        },
        getTokenData: (text) => {
            const tokens = text.toLowerCase().match(/[a-zäöüß]+/g) || [];
            const negations = new Set(SA_CONFIG.SENTIMENT_NEGATIONS);
            const negated = new Array(tokens.length).fill(false);
            let windowSize = 0;
            for (let i = 0; i < tokens.length; i++) {
                if (negations.has(tokens[i])) {
                    windowSize = SA_CONFIG.NEGATION_WINDOW;
                    continue;
                }
                if (windowSize > 0) {
                    negated[i] = true;
                    windowSize -= 1;
                }
            }
            return { tokens, negated };
        },
        getSentimentLexicon: () => {
            const lexicon = {};
            SA_CONFIG.SENTIMENT.positive.forEach(word => { lexicon[word] = 2; });
            SA_CONFIG.SENTIMENT.negative.forEach(word => { lexicon[word] = -2; });
            return lexicon;
        },
        countSyllables: (word) => {
            const clean = word.toLowerCase().replace(/[^a-zäöüß]/g, '');
            if (!clean) return 0;
            if (clean.length <= 3) return 1;
            const hyphenator = SA_Logic.getHyphenator();
            if (hyphenator) {
                const syllables = hyphenator.hyphenate(clean);
                if (syllables && syllables.length) return syllables.length;
            }
            const normalized = clean.replace(/(?:eu|au|ei|ie|äu|oi)/g, 'a');
            const matches = normalized.match(/[aeiouäöü]/g);
            return matches ? matches.length : 1;
        },
        analyzeReadability: (text, settings = {}) => {
            let clean = SA_Utils.cleanTextForCounting(text).trim();
            if (settings.numberMode === 'word') {
                clean = SA_Logic.expandNumbersForAudio(clean);
            }
            if(!clean) return { score: 0, avgSentence: 0, syllablesPerWord: 0, wordCount: 0, speakingWordCount: 0, words: [], sentences: [], paragraphs: 0, maxSentenceWords: 0, totalSyllables: 0 };
            
            let tempText = clean;
            const abbrevs = ['z.B.', 'ca.', 'bzw.', 'vgl.', 'inkl.', 'max.', 'min.', 'Dr.', 'Prof.', 'Hr.', 'Fr.', 'Nr.'];
            abbrevs.forEach(abbr => { tempText = tempText.split(abbr).join(abbr.replace('.', '@@')); });

            const sentences = tempText
                .split(/[.!?]+(?=\s|$)/)
                .filter(s => s.trim().length > 0)
                .map(s => s.replace(/@@/g, '.'));
            const words = clean.split(/\s+/).filter(w => w.length > 0);
            const wc = words.length;

            let speakingWordCount = 0;
            words.forEach(w => {
                if (/[0-9]/.test(w)) {
                    const digits = (w.match(/[0-9]/g) || []).length;
                    if (digits >= 5) speakingWordCount += 4;
                    else if (digits === 4) speakingWordCount += 3;
                    else if (digits === 3) speakingWordCount += 2;
                    else speakingWordCount += 1;
                } else {
                    speakingWordCount += 1;
                }
            });

            const paragraphs = clean.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
            let maxSentenceWords = 0;
            sentences.forEach(s => {
                const l = s.trim().split(/\s+/).length;
                if(l > maxSentenceWords) maxSentenceWords = l;
            });

            let totalSyllables = 0;
            words.forEach(w => { totalSyllables += SA_Logic.countSyllables(w); });

            const avgS = wc / (sentences.length || 1);
            const avgW = wc > 0 ? totalSyllables / wc : 0;
            const score = 180 - avgS - (58.5 * avgW);

            return { score: Math.max(0, Math.min(100, score)), avgSentence: avgS, syllablesPerWord: avgW, wordCount: wc, speakingWordCount, words, sentences, cleanedText: clean, paragraphs, maxSentenceWords, totalSyllables };
        },
        expandNumbersForAudio: (text) => {
            const toWords = (num) => {
                const units = ['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn'];
                const tens = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
                if (num < 20) return units[num];
                if (num < 100) {
                    const t = Math.floor(num / 10);
                    const u = num % 10;
                    if (u === 0) return tens[t];
                    const unit = u === 1 ? 'ein' : units[u];
                    return `${unit}und${tens[t]}`;
                }
                if (num < 1000) {
                    const h = Math.floor(num / 100);
                    const r = num % 100;
                    const head = h === 1 ? 'einhundert' : `${units[h]}hundert`;
                    return r === 0 ? head : `${head}${toWords(r)}`;
                }
                if (num < 10000) {
                    const th = Math.floor(num / 1000);
                    const r = num % 1000;
                    const head = th === 1 ? 'eintausend' : `${units[th]}tausend`;
                    return r === 0 ? head : `${head}${toWords(r)}`;
                }
                return String(num).split('').map(d => units[parseInt(d, 10)]).join(' ');
            };

            const normalize = (match) => {
                const cleaned = match.replace(/\./g, '').replace(',', '.');
                const hasPercent = /%$/.test(match);
                const numeric = parseFloat(cleaned.replace('%', ''));
                if (Number.isNaN(numeric)) return match;
                const [intPart, decPart] = cleaned.replace('%', '').split('.');
                let spoken = toWords(parseInt(intPart, 10));
                if (decPart) {
                    const decWords = decPart.split('').map(d => toWords(parseInt(d, 10))).join(' ');
                    spoken = `${spoken} komma ${decWords}`;
                }
                if (hasPercent) spoken += ' prozent';
                return spoken;
            };

            return text.replace(/(\d{1,3}(?:\.\d{3})+|\d+)([.,]\d+)?%?/g, (m) => normalize(m));
        },
        analyzeVocabulary: (words) => {
            if(!words || words.length === 0) return { ttr: 0, unique: 0, total: 0 };
            const normalized = words.map(w => w.toLowerCase().replace(/[.,;!?":()]/g, ''));
            const unique = new Set(normalized);
            const ttr = (unique.size / normalized.length) * 100;
            return { ttr: ttr, unique: unique.size, total: normalized.length };
        },
        analyzeKeywordClusters: (text, settings = {}) => {
            if(!text || !text.trim()) return { top: [], total: 0, focusScore: 0, focusKeywords: [], focusCounts: [], focusTotalCount: 0, focusDensity: 0, focusLimit: 0, focusOverLimit: false, totalWords: 0 };
            const stopwords = new Set(SA_CONFIG.STOPWORDS);
            const counts = new Map();
            let total = 0;

            const cleanedText = SA_Utils.cleanTextForCounting(text);
            const totalWords = cleanedText.match(/[A-Za-zÄÖÜäöüß0-9]+/g) || [];
            const focusKeywords = (settings.focusKeywords || '')
                .split(/[,|\n]/)
                .map(k => k.trim())
                .filter(Boolean);
            const focusCounts = [];
            let focusTotalCount = 0;

            focusKeywords.forEach(keyword => {
                const parts = keyword.split(/\s+/).filter(Boolean).map(SA_Utils.escapeRegex);
                const pattern = parts.length ? parts.join('\\s+') : '';
                if (!pattern) return;
                const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
                const matches = cleanedText.match(regex) || [];
                const count = matches.length;
                focusTotalCount += count;
                focusCounts.push({ keyword, count });
            });

            const focusDensity = totalWords.length > 0 ? (focusTotalCount / totalWords.length) * 100 : 0;
            const focusLimit = Number.isFinite(parseFloat(settings.keywordDensityLimit)) ? parseFloat(settings.keywordDensityLimit) : 0;
            const focusOverLimit = focusLimit > 0 && focusDensity > focusLimit;

            const sentences = text.split(/[.!?]+/);
            sentences.forEach(sentence => {
                const words = sentence.match(/[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß0-9-]*/g) || [];
                words.forEach((word, idx) => {
                    let clean = word.replace(/^[^A-Za-zÄÖÜäöüß]+|[^A-Za-zÄÖÜäöüß0-9-]+$/g, '');
                    if (!clean || clean.length < 3) return;

                    const parts = clean.split('-').filter(Boolean);
                    parts.forEach(part => {
                        if (!part || part.length < 3) return;
                        const lower = part.toLowerCase();
                        if (stopwords.has(lower)) return;

                        const isAllCaps = /^[A-ZÄÖÜ0-9]+$/.test(part) && part.length > 2;
                        const hasUpperStart = /^[A-ZÄÖÜ]/.test(part);
                        const hasInnerUpper = /[A-ZÄÖÜ].*[A-ZÄÖÜ]/.test(part);
                        const isNounCandidate = isAllCaps || hasUpperStart || hasInnerUpper;
                        if (!isNounCandidate) return;

                        if (idx === 0 && stopwords.has(lower)) return;

                        const display = isAllCaps ? part : part.charAt(0).toUpperCase() + part.slice(1);
                        const key = lower;
                        const entry = counts.get(key) || { word: display, count: 0 };
                        entry.count += 1;
                        counts.set(key, entry);
                        total += 1;
                    });
                });
            });

            const top = [...counts.values()].sort((a, b) => {
                if (b.count !== a.count) return b.count - a.count;
                return a.word.localeCompare(b.word);
            });
            const topCount = top.length > 0 ? top[0].count : 0;
            const focusScore = total > 0 ? topCount / total : 0;
            return { top, total, focusScore, focusKeywords, focusCounts, focusTotalCount, focusDensity, focusLimit, focusOverLimit, totalWords: totalWords.length };
        },
        getWpm: (s) => {
            if (s.manualWpm && s.manualWpm > 0) return s.manualWpm;
            return (SA_CONFIG.WPM[s.usecase] || 150);
        },
        getSps: (s) => (SA_CONFIG.SPS[s.usecase] || 3.8),
        getTrafficLight: (read) => {
            if (!read || read.wordCount === 0) return { color: 'gray', label: 'Leer', class: 'neutral' };
            if (read.score < 40 || read.maxSentenceWords > 40) return { color: SA_CONFIG.COLORS.error, label: 'Kritisch', class: 'red' };
            if (read.score < 60 || read.maxSentenceWords > 30) return { color: SA_CONFIG.COLORS.warn, label: 'Optimierbar', class: 'yellow' };
            return { color: SA_CONFIG.COLORS.success, label: 'Optimal', class: 'green' };
        },
        findFillers: (text) => { 
            const l = text.toLowerCase(); 
            const f = {}; 
            Object.keys(SA_CONFIG.FILLER_DB).forEach(w => { 
                const r = new RegExp(`\\b${w}\\b`,'gi'); 
                const m = l.match(r); 
                if(m) f[w] = { count: m.length, weight: SA_CONFIG.FILLER_DB[w] }; 
            }); 
            return f; 
        },
        removeFillers: (text) => {
            if (!text) return '';
            const phrases = Object.keys(SA_CONFIG.FILLER_DB).sort((a, b) => b.length - a.length);
            let cleaned = text;
            phrases.forEach(phrase => {
                const pattern = phrase
                    .split(/\s+/)
                    .filter(Boolean)
                    .map(SA_Utils.escapeRegex)
                    .join('\\s+');
                const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
                cleaned = cleaned.replace(regex, '');
            });
            return cleaned
                .replace(/\s{2,}/g, ' ')
                .replace(/\s+([.,!?;:])/g, '$1')
                .replace(/([.,!?;:])(?=[A-Za-zÄÖÜäöüß])/g, '$1 ')
                .replace(/\s+\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        },
        findNominalStyle: (text) => {
            const regex = /\b([a-zA-ZäöüÄÖÜß]+(?:ung|heit|keit|tion|schaft|tum|ismus|ling|nis))\b/gi;
            const matches = text.match(regex) || [];
            const whitelist = new Set(SA_CONFIG.NOMINAL_WHITELIST);
            const filtered = matches.filter(word => !whitelist.has(word.toLowerCase()));
            return [...new Set(filtered)];
        },
        
        findNominalChains: (text) => {
            const sentences = text.split(/[.!?]+(?=\s|$)/);
            const chains = [];
            const nominalRegex = /\b([a-zA-ZäöüÄÖÜß]+(?:ung|heit|keit|tion|schaft|tum|ismus|ling|nis|ät))\b/i;
            const whitelist = new Set(SA_CONFIG.NOMINAL_WHITELIST);

            sentences.forEach(s => {
                const words = s.trim().split(/\s+/);
                let count = 0;
                words.forEach(w => {
                    const cleaned = w.toLowerCase().replace(/[^a-zäöüß]/g, '');
                    if (!cleaned || whitelist.has(cleaned)) return;
                    if (nominalRegex.test(w)) count++;
                });
                
                if ((words.length < 15 && count >= 2) || (words.length >= 15 && count >= 3)) {
                     if (count / words.length > 0.15) {
                         chains.push(s.trim());
                     }
                }
            });
            return chains;
        },

        findAdjectives: (text) => { const regex = /\b([a-zA-ZäöüÄÖÜß]+(?:ig|lich|isch|haft|bar|sam|los))\b/gi; const matches = text.match(regex) || []; return [...new Set(matches)]; },
        findAnglicisms: (text) => { if(!SA_CONFIG.ANGLICISMS.length) return []; const regex = new RegExp(`\\b(${SA_CONFIG.ANGLICISMS.join('|')})\\b`, 'gi'); const matches = text.match(regex) || []; return [...new Set(matches.map(w => w.toLowerCase()))]; },
        findGenderBias: (text) => {
            const l = text.toLowerCase();
            const matches = [];
            Object.keys(SA_CONFIG.GENDER_DB).forEach(m => {
                const r = new RegExp(`\\b${m}\\b`, 'gi');
                if (r.test(l)) {
                    matches.push({ word: m, suggestion: SA_CONFIG.GENDER_DB[m] });
                }
            });
            return matches;
        },
        findBreathKillers: (sentences) => {
            const killers = [];
            sentences.forEach(s => {
                const commas = (s.match(/,/g) || []).length;
                const words = s.split(/\s+/).length;
                const hardSegment = (words > 20 && commas === 0);
                if(commas >= 4 || words > 25 || hardSegment) {
                    killers.push({ text: s, commas: commas, words: words, hardSegment: hardSegment });
                }
            });
            return killers.sort((a,b) => (b.words + b.commas*2) - (a.words + a.commas*2));
        },
        findPlosiveClusters: (text) => {
            const words = text.match(/[A-Za-zÄÖÜäöüß]+/g) || [];
            const clusters = [];
            let current = [];

            words.forEach(word => {
                const clean = word.replace(/[^A-Za-zÄÖÜäöüß]/g, '');
                if (!clean) return;
                const lower = clean.toLowerCase();
                if (/^[pbtk]/.test(lower)) {
                    current.push(clean);
                } else {
                    if (current.length >= 2) clusters.push([...current]);
                    current = [];
                }
            });
            if (current.length >= 2) clusters.push([...current]);

            const aggregated = new Map();
            clusters.forEach(cluster => {
                const phrase = cluster.join(' ');
                const entry = aggregated.get(phrase) || { phrase, words: cluster.length, occurrences: 0 };
                entry.occurrences += 1;
                aggregated.set(phrase, entry);
            });

            return [...aggregated.values()].sort((a, b) => {
                if (b.words !== a.words) return b.words - a.words;
                if (b.occurrences !== a.occurrences) return b.occurrences - a.occurrences;
                return a.phrase.localeCompare(b.phrase);
            });
        },
        findWordEchoes: (text) => {
            const words = text.toLowerCase().match(/\b[a-zäöüß]+\b/g) || [];
            const echoes = new Set();
            const minLen = 5; const range = 35; 
            const ignore = ['nicht', 'eine', 'einer', 'einem', 'einen', 'eines', 'diese', 'dieser', 'dieses', 'dass', 'wenn', 'aber', 'oder', 'und', 'denn', 'doch', 'auch', 'noch', 'schon', 'sich', 'mich', 'dich', 'uns', 'euch', 'ihnen', 'mein', 'dein', 'sein', 'ihr', 'sein', 'haben', 'werden', 'können', 'müssen', 'wollen', 'sollen', 'dürfen', 'mögen', 'sind', 'wird', 'wurde', 'war', 'hat', 'hatte', 'wäre', 'hätte', 'habe', 'kann', 'muss', 'über', 'unter', 'nach', 'vor', 'aus', 'bei', 'mit', 'von', 'seit', 'durch', 'gegen', 'ohne', 'für', 'weil', 'trotz', 'wegen', 'dabei', 'dafür', 'damit', 'daran', 'hier', 'dort', 'dann', 'jetzt', 'heute', 'morgen', 'gestern', 'immer', 'nie', 'oft', 'alles', 'etwas', 'nichts', 'viel', 'wenig', 'manche', 'einige', 'viele', 'machen', 'macht', 'getan', 'sehen', 'sieht', 'gehen', 'geht', 'kommen', 'kommt', 'sagen', 'sagt', 'gesagt', 'geben', 'gibt', 'nehmen', 'nimmt', 'lassen', 'lässt'];
            const lastSeen = new Map();
            for(let i=0; i < words.length; i++) {
                const current = words[i];
                if(current.length < minLen || ignore.includes(current)) continue;
                if(lastSeen.has(current)) {
                    if((i - lastSeen.get(current)) <= range) echoes.add(current);
                }
                lastSeen.set(current, i);
            }
            return [...echoes];
        },
        analyzeMetaphorPhrases: (text) => {
            if (!text || !text.trim()) return { total: 0, matches: [] };
            const cleaned = text.toLowerCase();
            const results = [];
            let total = 0;
            SA_CONFIG.METAPHOR_DB.forEach((phrase) => {
                const pattern = phrase
                    .split(/\s+/)
                    .filter(Boolean)
                    .map(SA_Utils.escapeRegex)
                    .join('\\s+');
                const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
                const matches = cleaned.match(regex) || [];
                if (matches.length) {
                    total += matches.length;
                    results.push({ phrase, count: matches.length });
                }
            });
            results.sort((a, b) => {
                if (b.count !== a.count) return b.count - a.count;
                return a.phrase.localeCompare(b.phrase);
            });
            return { total, matches: results };
        },
        findPassive: (text) => { 
            const sentences = text.split(/[.!?]+(?=\s|$)/);
            const matches = new Set();
            const auxRegex = /\b(wurde|wurden|wird|werden|worden|geworden)\b/i;
            const partRegex = /\b(ge[a-zäöüß]{2,}(?:t|en)|[a-zäöüß]{3,}iert)\b/i;
            sentences.forEach(s => {
                if(auxRegex.test(s) && partRegex.test(s)) {
                    const auxMatch = s.match(auxRegex);
                    const partMatch = s.match(partRegex);
                    if(auxMatch && partMatch) matches.add(`${auxMatch[0]} ... ${partMatch[0]}`);
                    else matches.add(auxMatch ? auxMatch[0] : 'Passiv-Konstruktion');
                }
            });
            return [...matches];
        },
        findStumbles: (text) => { 
            const words = text.split(/\s+/).map(x=>x.replace(/[.,;!?:"()]/g,'')); 
            const result = { long: [], camel: [], phonetic: [], alliter: [], sibilant_warning: false, sibilant_density: 0 };
            const phoneticRegex = new RegExp(`(${SA_CONFIG.PHONETICS.join('|')})`, 'i');
            
            // Sibilant check
            const sibilants = (text.toLowerCase().match(/([szßcx]|sch)/g) || []).length;
            const density = text.length > 0 ? (sibilants / text.length) * 100 : 0;
            if(density > 15) { // Threshold > 15% is high
                result.sibilant_warning = true;
                result.sibilant_density = density.toFixed(1);
            }

            words.forEach(w => {
                if(w.length >= 16) result.long.push(w);
                if(/[a-zäöüß][A-ZÄÖÜ]/.test(w)) result.camel.push(w);
                if(phoneticRegex.test(w)) result.phonetic.push(w);
            });

            for(let i = 0; i < words.length - 1; i++) {
                const w1 = words[i], w2 = words[i+1];
                if(!w1 || !w2) continue;
                const l1 = w1.toLowerCase(), l2 = w2.toLowerCase();
                if(i < words.length - 2) {
                    const w3 = words[i+2];
                    if(w3) {
                        const l3 = w3.toLowerCase();
                        if(l1[0] === l2[0] && l2[0] === l3[0] && l1.length > 2) {
                            result.alliter.push(`${w1} ${w2} ${w3}`);
                        }
                    }
                }
                const cluster = /^(sch|st|sp|pf|ts|z)/;
                if(cluster.test(l1) && cluster.test(l2) && l1[0] === l2[0]) {
                     result.alliter.push(`${w1} ${w2}`);
                }
            }
            result.long = [...new Set(result.long)]; result.camel = [...new Set(result.camel)]; result.phonetic = [...new Set(result.phonetic)]; result.alliter = [...new Set(result.alliter)];
            return result; 
        },
        analyzePronunciation: (text) => {
            const clean = text.replace(/[.,;!?":()]/g, ' ').toLowerCase();
            const words = clean.split(/\s+/);
            const findings = [];
            const seen = new Set();
    
            // 1. Check Dictionary
            words.forEach(w => {
                if (SA_CONFIG.PRONUNCIATION_DB[w] && !seen.has(w)) {
                    findings.push({ word: w, hint: SA_CONFIG.PRONUNCIATION_DB[w], audio: w });
                    seen.add(w);
                }
            });
    
            // 2. Check Rules (-ig)
            words.forEach(w => {
                if (w.endsWith('ig') && !seen.has(w) && w.length > 3) {
                     findings.push({ word: w, hint: w.slice(0, -2) + 'ich', audio: w });
                     seen.add(w);
                }
            });
    
            return findings;
        },
        analyzeSentenceStarts: (sentences) => {
            if(!sentences || sentences.length < 2) return [];
            const starts = [];
            const result = [];
            
            sentences.forEach((s, idx) => {
                const words = s.trim().split(/\s+/);
                if(words.length >= 2) {
                    const startPhrase = (words[0] + ' ' + words[1]).toLowerCase().replace(/[.,;!?]/g, '');
                    starts.push({ phrase: startPhrase, original: words[0] + ' ' + words[1], idx: idx });
                } else if(words.length === 1) {
                    starts.push({ phrase: words[0].toLowerCase().replace(/[.,;!?]/g, ''), original: words[0], idx: idx });
                }
            });

            for(let i=0; i < starts.length - 1; i++) {
                if(starts[i].phrase === starts[i+1].phrase && starts[i].phrase.length > 2) {
                    result.push(`${starts[i].original}... -> ${starts[i+1].original}...`);
                }
            }
            return [...new Set(result)];
        },
        analyzeRoles: (text) => {
            const lines = text.split('\n');
            const roles = {};
            let currentRole = 'Erzähler/Unbekannt';
            let totalWords = 0;

            lines.forEach(line => {
                const match = line.match(/^([A-ZÄÖÜ][A-ZÄÖÜ0-9\s\-_]{1,}):/); // Uppercase role pattern at start
                if (match) {
                    currentRole = match[1].trim();
                    line = line.replace(match[0], ''); // Remove role tag from word count
                }
                const w = line.trim().split(/\s+/).filter(x => x.length > 0).length;
                if (w > 0) {
                    if (!roles[currentRole]) roles[currentRole] = 0;
                    roles[currentRole] += w;
                    totalWords += w;
                }
            });
            return { roles, total: totalWords };
        },
        analyzeDialog: (text) => {
             const matches = text.match(/([„"»].*?[“"«])/g) || [];
             let dialogLen = 0;
             matches.forEach(m => dialogLen += m.length);
             const ratio = text.length > 0 ? (dialogLen / text.length) * 100 : 0;
             return { ratio: ratio, count: matches.length };
        },
        analyzeSentiment: (text) => {
            const engine = SA_Logic.getSentimentEngine();
            let posScore = 0; let negScore = 0; let temp = 0;
            if (engine) {
                const result = engine.analyze(text, { extras: SA_Logic.getSentimentLexicon() });
                posScore = (result.positive || []).length;
                negScore = (result.negative || []).length;
                temp = Math.max(-100, Math.min(100, (result.comparative || 0) * 100));
            } else {
                const { tokens, negated } = SA_Logic.getTokenData(text);
                const positives = new Set(SA_CONFIG.SENTIMENT.positive);
                const negatives = new Set(SA_CONFIG.SENTIMENT.negative);
                tokens.forEach((token, idx) => {
                    if (positives.has(token)) {
                        if (negated[idx]) negScore += 1;
                        else posScore += 1;
                    }
                    if (negatives.has(token)) {
                        if (negated[idx]) posScore += 1;
                        else negScore += 1;
                    }
                });
                const total = posScore + negScore;
                if (total > 0) temp = ((posScore - negScore) / total) * 100;
            }
            let label = 'Neutral';
            if (temp > 30) label = 'Positiv / Warm';
            else if (temp < -30) label = 'Kritisch / Kühl';
            let color = SA_CONFIG.COLORS.muted;
            if(temp > 20) color = SA_CONFIG.COLORS.success;
            if(temp < -20) color = SA_CONFIG.COLORS.warn;
            return { label: label, color: color, temp: temp, pos: posScore, neg: negScore };
        },
        analyzeCtaFocus: (text) => {
            const len = text.length;
            const threshold = Math.floor(len * 0.9);
            const endPart = text.substring(threshold);
            const regex = /(ruf|kontakt|kauf|bestell|buch|sicher|jetzt|meld|klick|link|hier|anruf|termin|abonniere|folge|sichere|hol dir)/gi;
            const endMatches = [...new Set((endPart.match(regex)||[]).map(s=>s.toLowerCase()))];
            const allMatches = [...new Set((text.match(regex)||[]).map(s=>s.toLowerCase()))];
            return { end: endMatches, all: allMatches };
        },
        generateMarkerData: (text, settings) => {
            const parts = text.split(/\n\s*\n/);
            let currentTime = 0;
            const markers = [];
            const wpm = SA_Logic.getWpm(settings);
            const sps = SA_Logic.getSps(settings);
            const isSps = settings.timeMode === 'sps';

            parts.forEach((p, i) => {
                if(!p.trim()) return;
                const h = Math.floor(currentTime / 3600);
                const m = Math.floor((currentTime % 3600) / 60);
                const s = (currentTime % 60).toFixed(2);
                const timeStr = `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
                markers.push({ 
                    id: i + 1, 
                    time: timeStr, 
                    seconds: currentTime.toFixed(2),
                    label: p.substring(0, 30).replace(/\n/g, ' ') + '...' 
                });
                const read = SA_Logic.analyzeReadability(p, settings);
                const pause = SA_Utils.getPausenTime(p, settings);
                let dur = 0;
                if (isSps) dur = (read.totalSyllables / sps) + pause;
                else dur = (read.speakingWordCount / wpm * 60) + pause;
                currentTime += dur;
            });
            return markers;
        },
        analyzeTone: (text) => {
            const l = text.toLowerCase();
            let emoCount = 0; SA_CONFIG.SENTIMENT.emotional.forEach(w => { if(l.includes(w)) emoCount++; });
            const qs = (text.match(/\?/g)||[]).length; const exc = (text.match(/!/g)||[]).length;
            if (exc > 3 || emoCount > 3) return { label: 'Emotional & Dringend', icon: '🔥' };
            if (qs > 3) return { label: 'Dialogisch / Fragend', icon: '🤝' };
            if (text.length > 500 && exc === 0) return { label: 'Sachlich & Ruhig', icon: '🧊' };
            return { label: 'Ausgewogen', icon: '⚖️' };
        },
        estimateAudience: (score) => {
            // Flesch Interpretation for German
            if (score > 75) return 'Sehr leicht (Kinder / E-Learning)';
            if (score > 60) return 'Leicht (Allgemeinheit / Boulevard)';
            if (score > 50) return 'Mittel (Sachbuch / Presse)';
            if (score > 30) return 'Komplex (Fachpublikum / Business)';
            return 'Sehr schwer (Akademisch / Gesetz)';
        },
        analyzeRedundancy: (sentences) => {
            if (!sentences || sentences.length < 2) return [];
            const stemWord = (word) => {
                let w = word.toLowerCase().replace(/[^a-zäöüß]/g, '');
                const suffixes = ['chen', 'lein', 'ungen', 'ung', 'heit', 'keit', 'isch', 'lich', 'end', 'ern', 'er', 'en', 'e', 's'];
                suffixes.forEach(s => {
                    if (w.length > 4 && w.endsWith(s)) {
                        w = w.slice(0, -s.length);
                    }
                });
                return w;
            };
            const tokenize = (sentence) => {
                const words = sentence.match(/[A-Za-zÄÖÜäöüß]+/g) || [];
                return words.map(stemWord).filter(w => w.length > 2);
            };
            const levenshtein = (a, b) => {
                const m = a.length;
                const n = b.length;
                const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
                for (let i = 0; i <= m; i++) dp[i][0] = i;
                for (let j = 0; j <= n; j++) dp[0][j] = j;
                for (let i = 1; i <= m; i++) {
                    for (let j = 1; j <= n; j++) {
                        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                        dp[i][j] = Math.min(
                            dp[i - 1][j] + 1,
                            dp[i][j - 1] + 1,
                            dp[i - 1][j - 1] + cost
                        );
                    }
                }
                return dp[m][n];
            };

            const findings = [];
            for (let i = 0; i < sentences.length - 1; i++) {
                const first = sentences[i].trim();
                const second = sentences[i + 1].trim();
                const a = tokenize(first);
                const b = tokenize(second);
                if (a.length < 4 || b.length < 4) continue;
                const distance = levenshtein(a, b);
                const maxLen = Math.max(a.length, b.length);
                const similarity = maxLen > 0 ? 1 - (distance / maxLen) : 0;
                if (similarity >= 0.7) {
                    findings.push({ first, second, similarity });
                }
            }
            return findings;
        },
        analyzeBpmSuggestion: (read, settings) => {
            if (!read || read.wordCount === 0) return { bpm: 0, range: [0, 0], syllablesPerSecond: 0 };
            const wpm = SA_Logic.getWpm(settings);
            const sps = settings.timeMode === 'sps' ? SA_Logic.getSps(settings) : (read.totalSyllables / ((read.speakingWordCount / wpm) * 60));
            const bpm = Math.round(sps * 30);
            const min = Math.max(50, bpm - 10);
            const max = Math.min(140, bpm + 10);
            return { bpm, range: [min, max], syllablesPerSecond: sps };
        },
        analyzeEasyLanguage: (text, sentences) => {
            const words = text.match(/[A-Za-zÄÖÜäöüß]+/g) || [];
            const longWords = [];
            words.forEach(w => {
                const syllables = SA_Logic.countSyllables(w);
                if (syllables >= 4 && w.length > 6) longWords.push({ word: w, syllables });
            });
            const uniqueLong = [...new Map(longWords.map(item => [item.word.toLowerCase(), item])).values()];

            const genitiveRegex = /\b(des|eines|einer|eines|deren|dessen)\b/i;
            const genitiveHits = [];
            (sentences || []).forEach(s => {
                if (genitiveRegex.test(s)) genitiveHits.push(s.trim());
            });
            return { longWords: uniqueLong, genitives: genitiveHits };
        },
        analyzeVerbNounBalance: (text, sentences) => {
            const words = text.match(/[A-Za-zÄÖÜäöüß]+/g) || [];
            const stop = new Set(SA_CONFIG.STOPWORDS);
            let verbs = 0;
            let nouns = 0;
            const verbRegex = /\b[a-zäöüß]+(en|ern|eln|ierst|iert|st|t|te|test|ten|tet)\b/i;

            words.forEach((word, idx) => {
                const lower = word.toLowerCase();
                if (stop.has(lower)) return;
                if (/^[a-zäöüß]/.test(word) && verbRegex.test(word)) {
                    verbs += 1;
                    return;
                }
                const isSentenceStart = sentences && sentences.some(s => s.trim().startsWith(word));
                if (/^[A-ZÄÖÜ]/.test(word) && !isSentenceStart) {
                    nouns += 1;
                }
            });
            const ratio = nouns > 0 ? verbs / nouns : verbs;
            return { verbs, nouns, ratio };
        },
        analyzeRhetoricalQuestions: (text, sentences = []) => {
            const cleaned = SA_Utils.cleanTextForCounting(text || '').trim();
            const source = cleaned.length ? cleaned : (sentences || []).join(' ');
            if (!source) return [];
            const parts = source.match(/[^.!?]+[!?]?/g) || [];
            return parts.map(segment => {
                const trimmed = segment.trim();
                if (!trimmed) return null;
                const firstWord = trimmed.split(/\s+/)[0] ? trimmed.split(/\s+/)[0].toLowerCase() : '';
                const isQuestion = /\?\s*$/.test(trimmed);
                const startsWithQWord = SA_CONFIG.QUESTION_WORDS.includes(firstWord);
                return { sentence: trimmed, isQuestion, isRhetorical: isQuestion && startsWithQWord };
            }).filter(Boolean);
        },
        analyzeDepthCheck: (sentences) => {
            if (!sentences || sentences.length === 0) return [];
            return sentences.map(sentence => {
                const commaCount = (sentence.match(/,/g) || []).length;
                const depth = commaCount + 1;
                return { sentence: sentence.trim(), depth, isDeep: depth > 3 };
            });
        },
        analyzeSentimentIntensity: (sentences) => {
            if (!sentences || sentences.length === 0) return [];
            const pos = SA_CONFIG.SENTIMENT_INTENSITY.positive;
            const neg = SA_CONFIG.SENTIMENT_INTENSITY.negative;
            return sentences.map(sentence => {
                const words = sentence.toLowerCase().match(/[a-zäöüß]+/g) || [];
                let score = 0;
                words.forEach(word => {
                    if (pos[word]) score += pos[word];
                    if (neg[word]) score += neg[word];
                });
                const normalized = Math.max(-1, Math.min(1, score));
                return { sentence: sentence.trim(), score: normalized };
            });
        },
        analyzeNamingInconsistency: (sentences) => {
            if (!sentences || sentences.length === 0) return [];
            const names = [];
            sentences.forEach(sentence => {
                const tokens = sentence.match(/[A-ZÄÖÜ][a-zäöüß]+/g) || [];
                tokens.forEach(token => {
                    if (token.length < 3) return;
                    names.push({ name: token, sentence: sentence.trim() });
                });
            });
            const levenshtein = (a, b) => {
                const m = a.length;
                const n = b.length;
                const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
                for (let i = 0; i <= m; i++) dp[i][0] = i;
                for (let j = 0; j <= n; j++) dp[0][j] = j;
                for (let i = 1; i <= m; i++) {
                    for (let j = 1; j <= n; j++) {
                        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                        dp[i][j] = Math.min(
                            dp[i - 1][j] + 1,
                            dp[i][j - 1] + 1,
                            dp[i - 1][j - 1] + cost
                        );
                    }
                }
                return dp[m][n];
            };
            const issues = [];
            for (let i = 0; i < names.length; i++) {
                for (let j = i + 1; j < names.length; j++) {
                    const a = names[i].name;
                    const b = names[j].name;
                    if (a.toLowerCase() === b.toLowerCase()) continue;
                    const distance = levenshtein(a.toLowerCase(), b.toLowerCase());
                    if (distance > 0 && distance <= 2) {
                        issues.push({ first: names[i].name, second: names[j].name, distance });
                    }
                }
            }
            const unique = new Map();
            issues.forEach(item => {
                const key = [item.first, item.second].sort().join('|');
                if (!unique.has(key)) unique.set(key, item);
            });
            return [...unique.values()];
        },
        analyzeBullshitIndex: (text, customList = []) => {
            const combined = [...SA_CONFIG.BUZZWORDS, ...customList].filter(Boolean);
            const findings = {};
            if (!combined.length) return findings;
            combined.forEach(term => {
                const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
                const matches = text.match(regex);
                if (matches && matches.length) {
                    findings[term.toLowerCase()] = matches.length;
                }
            });
            return findings;
        },
        evaluateAudienceTarget: (read, targetKey) => {
            const target = SA_CONFIG.AUDIENCE_TARGETS[targetKey];
            if (!target || !read) return { status: 'neutral', message: 'Kein Zielgruppen-Level gewählt.' };
            const issues = [];
            if (read.score < target.minScore) issues.push(`Flesch ${read.score.toFixed(0)} < ${target.minScore}`);
            if (read.maxSentenceWords > target.maxSentence) issues.push(`Satzlänge ${read.maxSentenceWords} > ${target.maxSentence}`);
            if (issues.length) {
                return { status: 'warn', message: `⚠️ Ziel verfehlt: ${issues.join(' · ')}`, target };
            }
            return { status: 'ok', message: `✅ Passend für ${target.label}`, target };
        },
        analyzeArousalMap: (sentences) => {
            if (!sentences || sentences.length === 0) return [];
            const high = new Set(SA_CONFIG.AROUSAL.high);
            const low = new Set(SA_CONFIG.AROUSAL.low);
            return sentences.map(sentence => {
                let score = 0;
                const { tokens, negated } = SA_Logic.getTokenData(sentence);
                tokens.forEach((token, idx) => {
                    if (high.has(token)) score += negated[idx] ? -1 : 2;
                    if (low.has(token)) score += negated[idx] ? 1 : -1;
                });
                const normalized = Math.max(-4, Math.min(6, score));
                return { sentence: sentence.trim(), score: normalized };
            });
        },
        calculateVariance: (sentences) => {
            if(!sentences || sentences.length < 2) return 0;
            const lengths = sentences.map(s => s.trim().split(/\s+/).length);
            const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
            const variance = lengths.map(val => Math.pow(val - mean, 2)).reduce((a, b) => a + b, 0) / lengths.length;
            return Math.sqrt(variance); 
        }
    };

    const SA_PDF = {
        generate: function(text, data, settings, options, btnElement) {
            if (!window.jspdf || !window.jspdf.jsPDF) { alert('PDF-Bibliothek nicht geladen.'); return; }
            const originalText = btnElement.textContent; btnElement.textContent = 'Erstelle...'; btnElement.disabled = true;

            setTimeout(() => {
                try {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const margin = 20;
                    const contentWidth = pageWidth - (margin * 2);
                    let y = 25;

                    const checkPage = (heightIfNeeded) => {
                        if (y + heightIfNeeded >= 280) {
                            doc.addPage();
                            y = 20;
                        }
                    };

                    const addSectionTitle = (title) => {
                        checkPage(15);
                        doc.setFontSize(12);
                        doc.setTextColor(26, 147, 238); // Blue
                        doc.setFont(undefined, 'bold');
                        doc.text(title.toUpperCase(), margin, y);
                        doc.setDrawColor(226, 232, 240); // Light gray
                        doc.line(margin, y + 2, margin + contentWidth, y + 2);
                        doc.setFont(undefined, 'normal');
                        doc.setTextColor(0);
                        y += 12;
                    };

                    const addRow = (label, value) => {
                        checkPage(8);
                        doc.setFontSize(10);
                        doc.setFont(undefined, 'bold');
                        doc.text(label, margin, y);
                        doc.setFont(undefined, 'normal');
                        if(Array.isArray(value) && value.length > 0) {
                             const vText = doc.splitTextToSize(value.join(', '), contentWidth - 50);
                             doc.text(vText, margin + 50, y);
                             y += (vText.length * 5) + 2;
                        } else if (value) {
                             doc.text(String(value), margin + 50, y);
                             y += 6;
                        } else {
                            doc.setTextColor(150);
                            doc.text("-", margin + 50, y);
                            doc.setTextColor(0);
                            y += 6;
                        }
                    };

                    // --- HEADER ---
                    doc.setFontSize(22); doc.setTextColor(26, 147, 238); doc.setFont(undefined, 'bold');
                    doc.text("Skript-Analyse Report", margin, y);
                    y += 8;
                    doc.setFontSize(10); doc.setTextColor(100); doc.setFont(undefined, 'normal');
                    doc.text("Erstellt am: " + new Date().toLocaleDateString() + " um " + new Date().toLocaleTimeString(), margin, y);
                    y += 15;

                    const read = SA_Logic.analyzeReadability(text, settings);
                    const stumbles = SA_Logic.findStumbles(text);
                    const fillers = SA_Logic.findFillers(read.cleanedText);
                    const passive = SA_Logic.findPassive(read.cleanedText);
                    const nominal = SA_Logic.findNominalStyle(read.cleanedText);
                    const adjectives = SA_Logic.findAdjectives(read.cleanedText);
                    const anglicisms = SA_Logic.findAnglicisms(read.cleanedText);
                    const echoes = SA_Logic.findWordEchoes(read.cleanedText);
                    const breath = SA_Logic.findBreathKillers(read.sentences);
                    const sentiment = SA_Logic.analyzeSentiment(text);
                    const tone = SA_Logic.analyzeTone(text);
                    const variance = SA_Logic.calculateVariance(read.sentences);
                    const ctaData = SA_Logic.analyzeCtaFocus(text);
                    const genderIssues = SA_Logic.findGenderBias(read.cleanedText);
                    const startIssues = SA_Logic.analyzeSentenceStarts(read.sentences);
                    const roleData = SA_Logic.analyzeRoles(text);
                    const nominalChains = SA_Logic.findNominalChains(read.cleanedText);
                    const vocab = SA_Logic.analyzeVocabulary(read.words);
                    const pronunc = SA_Logic.analyzePronunciation(read.cleanedText);
                    const keywordFocus = SA_Logic.analyzeKeywordClusters(text, settings);
                    const spreadIndex = SA_Logic.calculateVariance(read.sentences);
                    const plosiveClusters = SA_Logic.findPlosiveClusters(text);
                    const redundancy = SA_Logic.analyzeRedundancy(read.sentences);
                    const bpmSuggestion = SA_Logic.analyzeBpmSuggestion(read, settings);
                    const easyLanguage = SA_Logic.analyzeEasyLanguage(read.cleanedText, read.sentences);
                    const bullshit = SA_Logic.analyzeBullshitIndex(read.cleanedText, (settings.bullshitBlacklist || '').split(/[,|\n]/).map(s => s.trim()).filter(Boolean));
                    const audienceCheck = SA_Logic.evaluateAudienceTarget(read, settings.audienceTarget);
                    const depthCheck = SA_Logic.analyzeDepthCheck(read.sentences);
                    const sentimentIntensity = SA_Logic.analyzeSentimentIntensity(read.sentences);
                    const namingCheck = SA_Logic.analyzeNamingInconsistency(read.sentences);
                    const verbBalance = SA_Logic.analyzeVerbNounBalance(read.cleanedText, read.sentences);
                    const rhetoricalQuestions = SA_Logic.analyzeRhetoricalQuestions(text, read.sentences);

                    if(options.metrics) {
                        doc.setFillColor(245, 247, 250); 
                        doc.rect(margin, y, contentWidth, 35, 'F'); 
                        doc.setTextColor(0);
                        let startY = y + 10;
                        doc.setFontSize(16); doc.setFont(undefined, 'bold'); doc.setTextColor(26, 147, 238);
                        doc.text(data.duration + " Min", margin + 5, startY);
                        doc.setFontSize(9); doc.setTextColor(100); doc.setFont(undefined, 'normal');
                        doc.text(`Dauer (${data.wpm} WPM / ${data.mode || 'Auto'})`, margin + 5, startY + 6);
                        doc.setFontSize(16); doc.setFont(undefined, 'bold'); doc.setTextColor(15, 23, 42);
                        doc.text(String(data.wordCount), margin + 60, startY);
                        doc.setFontSize(9); doc.setTextColor(100); doc.setFont(undefined, 'normal');
                        doc.text("Wörter", margin + 60, startY + 6);
                        const scoreCol = parseInt(data.score) > 60 ? [22, 163, 74] : [234, 88, 12];
                        doc.setFontSize(16); doc.setFont(undefined, 'bold'); doc.setTextColor(scoreCol[0], scoreCol[1], scoreCol[2]);
                        doc.text(data.score + "/100", margin + 110, startY);
                        doc.setFontSize(9); doc.setTextColor(100); doc.setFont(undefined, 'normal');
                        doc.text("Flesch-Index", margin + 110, startY + 6);
                        y += 45;
                    }

                    if(options.compare && data.savedVersion && data.savedVersion !== text) {
                        const oldRead = SA_Logic.analyzeReadability(data.savedVersion, settings);
                        const oldSec = (oldRead.wordCount / data.wpm * 60) + SA_Utils.getPausenTime(data.savedVersion, settings);
                        const newSec = (read.speakingWordCount / data.wpm * 60) + SA_Utils.getPausenTime(text, settings);
                        const diffSec = newSec - oldSec;
                        const diffWords = read.wordCount - oldRead.wordCount;
                        addSectionTitle("Versions-Vergleich");
                        let compText = `Änderung zur gespeicherten Version: \n`;
                        compText += `Zeit: ${diffSec > 0 ? '+' : ''}${Math.round(diffSec)} Sek | Wörter: ${diffWords > 0 ? '+' : ''}${diffWords}`;
                        doc.setFontSize(10);
                        doc.setTextColor(diffSec <= 0 ? 22 : 234, diffSec <= 0 ? 163 : 88, diffSec <= 0 ? 74 : 12); 
                        doc.text(compText, margin, y);
                        doc.setTextColor(0);
                        y += 15;
                    }

                    if(options.details) {
                        addSectionTitle("Detail-Analyse");
                        doc.setFontSize(10);
                        addRow("Stimmung:", sentiment.label);
                        addRow("Zielgruppe:", SA_Logic.estimateAudience(read.score));
                        addRow("Wortschatz-Ratio:", `${vocab.ttr.toFixed(1)}%`);
                        if (keywordFocus.top.length) {
                            const focusTop = keywordFocus.top.slice(0, 3).map(k => `${k.word} (${k.count}x)`).join(', ');
                            addRow("Keyword-Fokus:", focusTop);
                            addRow("- Dominanz:", `${(keywordFocus.focusScore * 100).toFixed(1)}%`);
                        }
                        addRow("Satz-Spreizung:", spreadIndex.toFixed(2));
                        if (bpmSuggestion.bpm > 0) addRow("Audio-BPM:", `${bpmSuggestion.bpm} BPM (${bpmSuggestion.range[0]}–${bpmSuggestion.range[1]})`);
                        if (audienceCheck && settings.audienceTarget) addRow("Zielgruppen-Check:", audienceCheck.message);
                        if (verbBalance) addRow("Verb-Fokus:", `Verben ${verbBalance.verbs} / Substantive ${verbBalance.nouns}`);
                        if (rhetoricalQuestions.length) {
                            const questionCount = rhetoricalQuestions.filter(q => q.isQuestion).length;
                            const rhetoricalCount = rhetoricalQuestions.filter(q => q.isRhetorical).length;
                            addRow("Rhetorische Fragen:", `${rhetoricalCount} rhetorisch · ${questionCount} Fragen`);
                        }
                        if (depthCheck.length) addRow("Satz-Verschachtelung:", `${depthCheck.filter(d => d.isDeep).length} kritisch`);
                        if (sentimentIntensity.length) {
                            const start = sentimentIntensity[0]?.score ?? 0;
                            const end = sentimentIntensity[sentimentIntensity.length - 1]?.score ?? 0;
                            addRow("Stimmungs-Intensität:", `Start ${start.toFixed(2)} → Ende ${end.toFixed(2)}`);
                        }
                        if (namingCheck.length) addRow("Naming-Check:", namingCheck.slice(0, 3).map(n => `${n.first}/${n.second}`));
                        y += 4;
                        doc.setFont(undefined, 'bold'); doc.text("Regie / Coach:", margin, y); doc.setFont(undefined, 'normal'); y+=6;
                        let dynText = "Lebendig & Abwechslungsreich";
                        if(variance < 2.5) dynText = "Eher monoton (Satzlängen variieren!)";
                        let tempoText = "Optimal";
                        if(data.wpm > 165) tempoText = "Sehr sportlich/schnell";
                        else if(data.wpm < 125) tempoText = "Ruhig / Getragen";
                        addRow("- Sprech-Haltung:", tone.label);
                        addRow("- Dynamik:", dynText);
                        addRow("- Tempo-Einschätzung:", tempoText);
                        y += 4;
                        
                        // Add Role Info if detected
                        const roles = Object.keys(roleData.roles);
                        if(roles.length > 1 || (roles.length === 1 && roles[0] !== 'Erzähler/Unbekannt')) {
                             const roleInfo = roles.map(r => `${r}: ${roleData.roles[r]} W`).join(', ');
                             addRow("Rollen:", roleInfo);
                        }

                        if(Object.keys(fillers).length) addRow("Füllwörter:", Object.keys(fillers));
                        if(passive.length) addRow("Passiv-Formen:", passive);
                        if(nominalChains.length) addRow("Nominal-Ketten (Kritisch):", nominalChains);
                        else if(nominal.length) addRow("Nominalstil:", nominal);
                        
                        if(pronunc.length > 0) {
                            const pText = pronunc.map(p => `${p.word} (${p.hint})`).join(', ');
                            addRow("Aussprache:", pText);
                        }
                        if(Object.keys(bullshit).length) addRow("Buzzword-Check:", Object.keys(bullshit));
                        if(redundancy.length > 0) {
                            const rText = redundancy.slice(0, 2).map(r => `"${r.first}" -> "${r.second}"`).join(' | ');
                            addRow("Redundanz:", rText);
                        }
                        if(easyLanguage.longWords.length) addRow("Leichte Sprache: lange Wörter", easyLanguage.longWords.slice(0, 5).map(w => w.word));
                        if(easyLanguage.genitives.length) addRow("Leichte Sprache: Genitiv", easyLanguage.genitives.slice(0, 2));

                        if(genderIssues.length) {
                            const gText = genderIssues.map(g => `${g.word} -> ${g.suggestion}`).join(', ');
                            addRow("Gender-Check:", gText);
                        }
                        if(startIssues.length) addRow("Satzanfänge (Wdh):", startIssues);
                        if(adjectives.length) addRow("Adjektive (blumig):", adjectives);
                        if(anglicisms.length) addRow("Anglizismen:", anglicisms);
                        if(echoes.length) addRow("Wort-Wiederholungen:", echoes);
                        const stumbleArr = [...stumbles.phonetic, ...stumbles.camel, ...stumbles.long, ...stumbles.alliter];
                        if(stumbleArr.length) addRow("Stolpersteine:", stumbleArr);
                        if(stumbles.sibilant_warning) addRow("Warnung:", `Hohe Zischlaut-Dichte (${stumbles.sibilant_density}%)`);
                        if(plosiveClusters.length) {
                            const pText = plosiveClusters.slice(0, 3).map(p => `${p.phrase} (${p.words}x)`).join(', ');
                            addRow("Plosiv-Folgen:", pText);
                        }
                        if(ctaData.all.length > 0) {
                            addRow("Call to Action (gefunden):", ctaData.all);
                        } else {
                            addRow("Call to Action:", "Keine direkten Signale gefunden");
                        }
                        if(breath.length > 0) {
                            checkPage(20);
                            y += 4;
                            doc.setFont(undefined, 'bold');
                            doc.text(`Auffällige Sätze (${breath.length}):`, margin, y);
                            y += 6;
                            doc.setFont(undefined, 'normal');
                            doc.setFontSize(9);
                            doc.setTextColor(80);
                            breath.slice(0, 5).forEach(b => {
                                let issue = [];
                                if(b.words > 25) issue.push(`${b.words} Wörter`);
                                if(b.commas >= 4) issue.push(`${b.commas} Kommas`);
                                if(b.hardSegment) issue.push('Keine Pause / Atemnot');
                                const line = `• "${b.text.substring(0, 70)}..." (${issue.join(', ')})`;
                                checkPage(6);
                                doc.text(line, margin + 5, y);
                                y += 5;
                            });
                            doc.setTextColor(0);
                            y += 5;
                        }
                    }

                    if(options.tips) {
                        addSectionTitle("Tipps & Hinweise");
                        doc.setFontSize(9);
                        doc.setTextColor(80);
                        const printTip = (txt) => {
                             checkPage(6);
                             const split = doc.splitTextToSize("• " + txt, contentWidth);
                             doc.text(split, margin, y);
                             y += (split.length * 4.5) + 2;
                        };
                        if(Object.keys(fillers).length > 3) printTip("Viele Füllwörter gefunden. Versuche, Sätze prägnanter zu formulieren.");
                        if(passive.length > 2) printTip("Passiv-Konstruktionen wirken distanziert. Nutze aktive Verben.");
                        if(read.maxSentenceWords > 30) printTip("Einige Sätze sind sehr lang (>30 Wörter). Teile sie auf.");
                        if(nominalChains.length > 0) printTip("Vermeide Nominal-Ketten (-ung, -heit), um den Text sprechbarer zu machen.");
                        if(genderIssues.length > 0) printTip("Prüfe, ob du generische Maskuline durch neutrale Begriffe ersetzen kannst.");
                        if(startIssues.length > 1) printTip("Vermeide gleiche Satzanfänge hintereinander (Monotonie).");
                        if(stumbles.sibilant_warning) printTip("Achtung Zischlaute! Der Text könnte im Mikrofon zischen/pfeifen.");
                        if(spreadIndex < 2.2) printTip("Rhythmus-Check: Satzlängen sind sehr ähnlich. Füge kurze Sätze für mehr Dynamik ein.");
                        if(plosiveClusters.length > 0) printTip("Plosiv-Alarm: P/B/T/K am Wortanfang häufen sich. Etwas Abstand oder Umformulieren hilft.");
                        if(keywordFocus.focusScore > 0 && keywordFocus.focusScore < 0.14) printTip("Keyword-Fokus: Die Kernbotschaft wirkt verteilt. Wiederhole den Hauptbegriff bewusst.");
                        if(redundancy.length > 0) printTip("Redundanz-Check: Entferne doppelte Aussagen in direkt aufeinanderfolgenden Sätzen.");
                        if(easyLanguage.genitives.length > 0) printTip("Leichte Sprache: Genitiv vermeiden, um verständlicher zu bleiben.");
                        if(adjectives.length > 5) printTip("Text wirkt 'blumig'. Prüfe, ob du alle Adjektive wirklich brauchst.");
                        if(pronunc.length > 0) printTip("Achte auf die korrekte Aussprache bei Lehnwörtern und '-ig' Endungen.");
                        if(echoes.length > 3) printTip("Achte auf Wortwiederholungen auf engem Raum (Wort-Echos).");
                        if(y == 25) { 
                             printTip("Dein Text sieht technisch sehr sauber aus! Achte beim Sprechen auf Betonung.");
                        }
                        y += 10;
                        doc.setTextColor(0);
                    }

                    if(options.script) {
                        doc.addPage();
                        y = 20;
                        doc.setFontSize(14); doc.setTextColor(26, 147, 238); doc.setFont(undefined, 'bold');
                        doc.text("Dein Skript", margin, y);
                        y += 10;
                        doc.setFontSize(11); 
                        doc.setTextColor(0); 
                        doc.setFont(undefined, 'normal');
                        const splitScript = doc.splitTextToSize(text, contentWidth);
                        for(let i=0; i < splitScript.length; i++) {
                            if (y > 280) {
                                doc.addPage();
                                y = 20;
                            }
                            doc.text(splitScript[i], margin, y);
                            y += 6;
                        }
                    }

                    doc.save('Skript-Analyse-Report.pdf'); 
                    
                    btnElement.textContent = 'Fertig ✔';
                    
                    // AUTO CLOSE
                    setTimeout(() => { 
                        btnElement.textContent = originalText; 
                        btnElement.disabled = false; 
                        // Close Modal
                        const modal = document.getElementById('ska-pdf-modal');
                        if(modal) {
                            modal.classList.remove('is-open');
                            document.body.classList.remove('ska-modal-open');
                        }
                    }, 1500);

                } catch(e) { 
                    console.error(e); 
                    btnElement.textContent = 'Fehler'; 
                    alert("Fehler beim Erstellen des PDFs. Bitte Konsole prüfen.");
                    btnElement.disabled = false;
                }
            }, 100);
        },
    };

    class SkriptAnalyseWidget {
        constructor(root) {
            this.root = root;
            this.initElements();
            if (!this.textarea) return;

            // Sort tips by length (ascending) to ensure short tips are shown first
            Object.keys(SA_CONFIG.TIPS).forEach(key => {
                SA_CONFIG.TIPS[key].sort((a, b) => a.length - b.length);
            });

            if (this.textarea) {
                this.textarea.setAttribute('data-placeholder', "Dein Skript hier einfügen...\n\nWir analysieren Sprechdauer, Lesbarkeit und Stil in Echtzeit.\nEinfach tippen oder Text reinkopieren.");
            }

            this.settings = { usecase: 'auto', lastGenre: '', charMode: 'spaces', numberMode: 'digit', branch: 'all', targetSec: 0, role: '', manualWpm: 0, timeMode: 'wpm', audienceTarget: '', bullshitBlacklist: '', commaPause: 0.2, periodPause: 0.5, focusKeywords: '', keywordDensityLimit: 2 };
            
            this.state = { 
                savedVersion: '', 
                currentData: {}, 
                hiddenCards: new Set(), 
                tipIndices: { fillers: 0, passive: 0, nominal: 0, anglicism: 0, echo: 0, breath: 0, stumble: 0, cta: 0, adjective: 0, rhythm: 0, dialog: 0, gender: 0, start_var: 0, role_dist: 0, nominal_chain: 0, vocabulary: 0, pronunciation: 0, keyword_focus: 0, spread_index: 0, plosive: 0, redundancy: 0, bpm: 0, easy_language: 0, teleprompter: 0, arousal: 0, bullshit: 0, audience: 0, verb_balance: 0, rhet_questions: 0, depth_check: 0, sentiment_intensity: 0, naming_check: 0 }, 
                excludedCards: new Set(),
                filterCollapsed: true,
                benchmark: { running: false, start: 0, elapsed: 0, wpm: 0, timerId: null },
                teleprompter: { playing: false, rafId: null, start: 0, duration: 0, startScroll: 0, words: [], activeIndex: -1 },
                analysisToken: 0,
                readabilityCache: []
            };
            
            this.analysisWorker = null;
            this.workerRequests = new Map();
            this.workerRequestId = 0;
            this.isRestoring = false;

            this.loadUIState();
            this.initMarkerDropdown();
            this.renderSettingsModal();
            this.renderBenchmarkModal();
            this.renderTeleprompterModal();
            this.initAnalysisWorker();
            this.bindEvents();
            
            this.injectGlobalStyles(); // CSS Overrides

            const saved = SA_Utils.storage.load(SA_CONFIG.STORAGE_KEY);
            if (saved && saved.trim().length > 0) {
                this.root.classList.add('is-restoring-now');
                this.isRestoring = true;
                this.setText(saved);
                this.analyze(saved);
                this.isRestoring = false;
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        this.root.classList.remove('is-restoring-now');
                    }, 200);
                });
            } else {
                this.root.querySelector('.ska-grid').classList.add('is-empty');
            }
        }

        initElements() {
            const q = s => this.root.querySelector(s);
            this.textarea = q('.skriptanalyse-textarea');
            this.topPanel = q('.skriptanalyse-analysis-top'); 
            this.bottomGrid = q('.skriptanalyse-analysis-bottom-grid');
            this.compareRow = q('.skriptanalyse-compare-row');
            this.hiddenPanel = q('.skriptanalyse-hidden-panel'); 
            this.legendContainer = q('.skriptanalyse-legend-container'); 
            this.roleSelect = q('[data-role-select]');
            this.targetInput = q('[data-target-input]');
            this.filterBar = q('.ska-analysis-filterbar');
            
            // Add settings button if missing
            const headerActions = this.root.querySelector('.skriptanalyse-input-actions');
            if(headerActions && !this.root.querySelector('[data-action="open-settings"]')) {
                 const btn = document.createElement('button');
                 btn.className = 'ska-tool-btn';
                 btn.style.display = 'inline-flex';
                 btn.style.alignItems = 'center';
                 btn.style.justifyContent = 'center';
                 btn.dataset.action = 'open-settings';
                 btn.innerHTML = `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
                 headerActions.appendChild(btn);
            }

            // PORTAL LOGIC
            const modals = this.root.querySelectorAll('.skriptanalyse-modal');
            modals.forEach(m => {
                if (m.parentNode !== document.body) {
                    document.body.appendChild(m);
                }
            });
            this.pdfModal = document.getElementById('ska-pdf-modal');
        }
        
        injectGlobalStyles() { SA_Utils.injectGlobalStyles(); }

        getText() {
            if (!this.textarea) return '';
            if (this.textarea.isContentEditable) return this.textarea.innerText || '';
            return this.textarea.value || '';
        }

        setText(value) {
            if (!this.textarea) return;
            if (this.textarea.isContentEditable) this.textarea.innerText = value;
            else this.textarea.value = value;
        }
        
        renderSettingsModal() {
            // Force removal of existing modal to ensure update
            let m = document.getElementById('ska-settings-modal');
            if (m) m.remove();

            // Convert TargetSec back to Min:Sec string for input
            let targetVal = '';
            if(this.settings.targetSec > 0) {
                const mm = Math.floor(this.settings.targetSec / 60);
                const ss = this.settings.targetSec % 60;
                targetVal = `${mm}:${ss < 10 ? '0'+ss : ss}`;
            }

            const wpm = SA_Logic.getWpm(this.settings);
            const isManualWpm = this.settings.manualWpm && this.settings.manualWpm > 0;
            const manualLabel = isManualWpm ? `${this.settings.manualWpm} WPM` : 'Auto';
            const sliderValue = isManualWpm ? this.settings.manualWpm : wpm;

            m = document.createElement('div');
            m.className = 'skriptanalyse-modal';
            m.id = 'ska-settings-modal';
            m.ariaHidden = 'true';
            m.innerHTML = `
            <div class="skriptanalyse-modal-overlay" data-action="close-settings"></div>
            <div class="skriptanalyse-modal-content">
                <div class="ska-modal-header"><h3>Einstellungen</h3></div>
                <div class="skriptanalyse-modal-body">
                    
                    <div style="margin-bottom:1.5rem;">
                        <label style="display:block; font-weight:700; color:#334155; margin-bottom:0.5rem;">Zeichen zählen</label>
                        <div class="ska-settings-option-group">
                            <label class="ska-settings-option">
                                <input type="radio" name="ska-char-mode" value="spaces" ${this.settings.charMode === 'spaces' ? 'checked' : ''}>
                                <span style="font-size:0.9rem;">Inkl. Leerzeichen</span>
                            </label>
                            <label class="ska-settings-option">
                                <input type="radio" name="ska-char-mode" value="no-spaces" ${this.settings.charMode === 'no-spaces' ? 'checked' : ''}>
                                <span style="font-size:0.9rem;">Ohne Leerzeichen</span>
                            </label>
                        </div>
                    </div>

                    <div style="margin-bottom:1.5rem;">
                        <label style="display:block; font-weight:700; color:#334155; margin-bottom:0.5rem;">Zahlen Interpretation</label>
                        <div class="ska-settings-option-group">
                            <label class="ska-settings-option">
                                <input type="radio" name="ska-num-mode" value="digit" ${this.settings.numberMode === 'digit' ? 'checked' : ''}>
                                <div>
                                    <span style="font-size:0.9rem; display:block;">Als Zahl</span>
                                    <span class="ska-settings-option-subtext">12 = 2 Zeichen</span>
                                </div>
                            </label>
                            <label class="ska-settings-option">
                                <input type="radio" name="ska-num-mode" value="word" ${this.settings.numberMode === 'word' ? 'checked' : ''}>
                                <div>
                                    <span style="font-size:0.9rem; display:block;">Als Wort</span>
                                    <span class="ska-settings-option-subtext">Zwölf = 5 Zeichen</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div style="border-top:1px solid #f1f5f9; margin:1.5rem 0;"></div>

                    <div style="margin-bottom:1.5rem;">
                        <label style="display:block; font-weight:700; color:#334155; margin-bottom:0.5rem;">Zielzeit (Min:Sek)</label>
                        <input type="text" id="ska-set-target" value="${targetVal}" placeholder="z.B. 1:30" style="width:100%; padding:0.6rem; border:1px solid #cbd5e1; border-radius:6px;">
                    </div>

                    <div style="margin-bottom:1.5rem;">
                        <label style="display:block; font-weight:700; color:#334155; margin-bottom:0.5rem;">Zeit-Berechnung (Timer)</label>
                        <div class="ska-settings-option-group">
                            <label class="ska-settings-option">
                                <input type="radio" name="ska-time-mode" value="wpm" ${this.settings.timeMode === 'wpm' ? 'checked' : ''}>
                                <div>
                                    <strong style="display:block; font-size:0.9rem;">WPM (Standard)</strong>
                                    <span class="ska-settings-option-subtext is-muted">Wörter pro Minute</span>
                                </div>
                            </label>
                            <label class="ska-settings-option">
                                <input type="radio" name="ska-time-mode" value="sps" ${this.settings.timeMode === 'sps' ? 'checked' : ''}>
                                <div>
                                    <strong style="display:block; font-size:0.9rem;">SPS (Präzise)</strong>
                                    <span class="ska-settings-option-subtext is-muted">Silben pro Sekunde</span>
                                </div>
                            </label>
                        </div>
                        <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.5rem;">SPS bietet eine höhere Genauigkeit für Synchronsprecher, da lange Wörter (z.B. "Donaudampfschifffahrt") korrekt als länger berechnet werden als kurze.</p>
                    </div>

                    <div style="margin-bottom:1.5rem;">
                        <label style="display:block; font-weight:700; color:#334155; margin-bottom:0.5rem;">Pausen-Automatik (Punkt & Komma)</label>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                            <div>
                                <span style="font-size:0.85rem; color:#64748b; display:block; margin-bottom:0.35rem;">Komma-Pause (Sekunden)</span>
                                <input type="number" step="0.1" min="0" id="ska-set-comma-pause" value="${this.settings.commaPause ?? 0.2}" style="width:100%; padding:0.5rem; border:1px solid #cbd5e1; border-radius:6px;">
                            </div>
                            <div>
                                <span style="font-size:0.85rem; color:#64748b; display:block; margin-bottom:0.35rem;">Punkt-Pause (Sekunden)</span>
                                <input type="number" step="0.1" min="0" id="ska-set-period-pause" value="${this.settings.periodPause ?? 0.5}" style="width:100%; padding:0.5rem; border:1px solid #cbd5e1; border-radius:6px;">
                            </div>
                        </div>
                        <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.5rem;">Diese Mikro-Pausen werden zur Gesamtzeit addiert – ideal für Voice-Optimierung.</p>
                    </div>

                    <div class="ska-wpm-calibration">
                        <div class="ska-wpm-header">
                            <span>Persönliches WPM</span>
                            <strong>${manualLabel}</strong>
                        </div>
                        <input type="range" min="90" max="200" step="1" value="${sliderValue}" data-action="wpm-slider">
                        <div class="ska-wpm-actions">
                            <button class="ska-btn ska-btn--secondary" data-action="open-benchmark">Kalibrieren</button>
                            <button class="ska-btn ska-btn--ghost" data-action="reset-wpm">Auto</button>
                        </div>
                    </div>

                    <div style="margin-top:1.5rem; margin-bottom:1.5rem; border-top:1px solid #f1f5f9;"></div>

                    <div style="margin-bottom:1.5rem;">
                        <label style="display:block; font-weight:700; color:#334155; margin-bottom:0.5rem;">Zielgruppe (Komplexität)</label>
                        <select id="ska-set-audience" style="width:100%; padding:0.6rem; border:1px solid #cbd5e1; border-radius:6px;">
                            <option value="">Keine Auswahl</option>
                            <option value="kinder" ${this.settings.audienceTarget === 'kinder' ? 'selected' : ''}>Kindersendung</option>
                            <option value="news" ${this.settings.audienceTarget === 'news' ? 'selected' : ''}>Abendnachrichten</option>
                            <option value="fach" ${this.settings.audienceTarget === 'fach' ? 'selected' : ''}>Fachpublikum</option>
                        </select>
                        <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.5rem;">Das System warnt, wenn Flesch-Score oder Satzlänge das Ziel überschreitet.</p>
                    </div>

                    <div style="margin-bottom:1.5rem;">
                        <label style="display:block; font-weight:700; color:#334155; margin-bottom:0.5rem;">Keyword-Dichte (SEO vs. Voice)</label>
                        <textarea id="ska-set-focus-keywords" style="width:100%; padding:0.6rem; border:1px solid #cbd5e1; border-radius:6px; min-height:70px;" placeholder="z.B. Produktname, Kernbegriff">${this.settings.focusKeywords || ''}</textarea>
                        <div style="display:flex; gap:0.75rem; align-items:center; margin-top:0.6rem;">
                            <span style="font-size:0.85rem; color:#64748b;">Dichte-Limit (%)</span>
                            <input type="number" step="0.1" min="0" id="ska-set-keyword-limit" value="${this.settings.keywordDensityLimit ?? 2}" style="width:120px; padding:0.4rem; border:1px solid #cbd5e1; border-radius:6px;">
                        </div>
                        <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.5rem;">Zu hohe Keyword-Dichte klingt beim Vorlesen schnell repetitiv.</p>
                    </div>

                    <div style="margin-bottom:0.5rem;">
                        <label style="display:block; font-weight:700; color:#334155; margin-bottom:0.5rem;">Buzzword-Blacklist</label>
                        <textarea id="ska-set-bullshit" style="width:100%; padding:0.6rem; border:1px solid #cbd5e1; border-radius:6px; min-height:90px;" placeholder="z.B. synergetisch, agil, lösungsorientiert">${this.settings.bullshitBlacklist || ''}</textarea>
                        <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.5rem;">Hier definierst du Phrasen, die du vermeiden willst. Kommagetrennt oder zeilenweise – wird rot markiert.</p>
                    </div>
                </div>
                <div class="ska-modal-footer">
                     <button type="button" class="ska-btn ska-btn--primary" style="display:inline-flex; align-items:center; justify-content:center; height:40px; padding:0 1.5rem; line-height:1; padding-top:1px;" data-action="close-settings">Speichern & Schließen</button>
                </div>
            </div>`;
            document.body.appendChild(m);
            
            const wpmSlider = m.querySelector('[data-action="wpm-slider"]');
            if (wpmSlider) {
                wpmSlider.addEventListener('input', (e) => {
                    const val = parseInt(e.target.value, 10);
                    this.settings.manualWpm = val;
                    this.saveUIState();
                    this.updateWpmUI();
                });
                wpmSlider.addEventListener('change', () => this.analyze(this.getText()));
            }

            const benchmarkBtn = m.querySelector('[data-action="open-benchmark"]');
            if (benchmarkBtn) {
                benchmarkBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.renderBenchmarkModal();
                    const modal = document.getElementById('ska-benchmark-modal');
                    if (modal) {
                        modal.classList.add('is-open');
                        document.body.classList.add('ska-modal-open');
                    }
                });
            }

            const resetWpmBtn = m.querySelector('[data-action="reset-wpm"]');
            if (resetWpmBtn) {
                resetWpmBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleAction('reset-wpm', resetWpmBtn);
                    this.updateWpmUI();
                });
            }

            // Bind radio changes
            m.querySelectorAll('input[type="radio"]').forEach(r => r.addEventListener('change', (e) => {
                if(e.target.name === 'ska-time-mode') this.settings.timeMode = e.target.value;
                if(e.target.name === 'ska-char-mode') this.settings.charMode = e.target.value;
                if(e.target.name === 'ska-num-mode') {
                    this.settings.numberMode = e.target.value;
                    this.state.readabilityCache = [];
                }
                this.saveUIState(); 
                this.analyze(this.getText());
            }));

            // Bind Target Change
            const targetInput = m.querySelector('#ska-set-target');
            if(targetInput) {
                targetInput.addEventListener('input', (e) => {
                    // Sync with main UI if present
                    if(this.targetInput) this.targetInput.value = e.target.value;
                    
                    const v = e.target.value.trim().split(':');
                    this.settings.targetSec = v.length > 1 ? (parseInt(v[0]||0)*60)+parseInt(v[1]||0) : parseInt(v[0]||0);
                    this.analyze(this.getText());
                });
            }

            const audienceSelect = m.querySelector('#ska-set-audience');
            if (audienceSelect) {
                audienceSelect.addEventListener('change', (e) => {
                    this.settings.audienceTarget = e.target.value;
                    this.saveUIState();
                    this.analyze(this.getText());
                });
            }

            const commaPauseInput = m.querySelector('#ska-set-comma-pause');
            if (commaPauseInput) {
                commaPauseInput.addEventListener('input', (e) => {
                    this.settings.commaPause = Math.max(0, parseFloat(e.target.value) || 0);
                    this.saveUIState();
                    this.analyze(this.getText());
                });
            }

            const periodPauseInput = m.querySelector('#ska-set-period-pause');
            if (periodPauseInput) {
                periodPauseInput.addEventListener('input', (e) => {
                    this.settings.periodPause = Math.max(0, parseFloat(e.target.value) || 0);
                    this.saveUIState();
                    this.analyze(this.getText());
                });
            }

            const focusInput = m.querySelector('#ska-set-focus-keywords');
            if (focusInput) {
                focusInput.addEventListener('input', (e) => {
                    this.settings.focusKeywords = e.target.value;
                    this.saveUIState();
                    this.analyze(this.getText());
                });
            }

            const keywordLimitInput = m.querySelector('#ska-set-keyword-limit');
            if (keywordLimitInput) {
                keywordLimitInput.addEventListener('input', (e) => {
                    this.settings.keywordDensityLimit = Math.max(0, parseFloat(e.target.value) || 0);
                    this.saveUIState();
                    this.analyze(this.getText());
                });
            }

            const bullshitInput = m.querySelector('#ska-set-bullshit');
            if (bullshitInput) {
                bullshitInput.addEventListener('input', (e) => {
                    this.settings.bullshitBlacklist = e.target.value;
                    this.saveUIState();
                    this.analyze(this.getText());
                });
            }
        }

        updateWpmUI() {
            const modal = document.getElementById('ska-settings-modal');
            if (!modal) return;
            const isManualWpm = this.settings.manualWpm && this.settings.manualWpm > 0;
            const wpm = SA_Logic.getWpm(this.settings);
            const sliderValue = isManualWpm ? this.settings.manualWpm : wpm;
            const manualLabel = isManualWpm ? `${this.settings.manualWpm} WPM` : 'Auto';
            const label = modal.querySelector('.ska-wpm-header strong');
            const slider = modal.querySelector('[data-action="wpm-slider"]');
            if (label) label.textContent = manualLabel;
            if (slider) slider.value = sliderValue;
        }

        initAnalysisWorker() {
            const workerUrl = window.SKA_CONFIG_PHP && SKA_CONFIG_PHP.workerUrl;
            if (!workerUrl || !window.Worker) return;
            try {
                this.analysisWorker = new Worker(workerUrl);
                this.analysisWorker.onmessage = (event) => {
                    const { id, results } = event.data || {};
                    if (!id || !this.workerRequests.has(id)) return;
                    const { resolve } = this.workerRequests.get(id);
                    this.workerRequests.delete(id);
                    resolve(results || []);
                };
                this.analysisWorker.onerror = () => {
                    this.analysisWorker = null;
                    this.workerRequests.clear();
                };
            } catch (err) {
                this.analysisWorker = null;
            }
        }

        requestWorkerReadability(paragraphs) {
            if (!this.analysisWorker) return Promise.resolve([]);
            const id = ++this.workerRequestId;
            return new Promise((resolve) => {
                this.workerRequests.set(id, { resolve });
                this.analysisWorker.postMessage({
                    id,
                    type: 'paragraphs',
                    paragraphs,
                    settings: { numberMode: this.settings.numberMode }
                });
            });
        }

        buildReadabilityFromCache(paragraphs) {
            const combinedSentences = [];
            const combinedWords = [];
            let totalSyllables = 0;
            let wordCount = 0;
            let speakingWordCount = 0;
            let maxSentenceWords = 0;
            let paragraphsCount = 0;
            const cleanedParts = [];

            paragraphs.forEach((entry) => {
                if (!entry || !entry.result) return;
                const res = entry.result;
                if (res.wordCount > 0) paragraphsCount += 1;
                totalSyllables += res.totalSyllables;
                wordCount += res.wordCount;
                speakingWordCount += res.speakingWordCount;
                maxSentenceWords = Math.max(maxSentenceWords, res.maxSentenceWords || 0);
                if (res.sentences && res.sentences.length) combinedSentences.push(...res.sentences);
                if (res.words && res.words.length) combinedWords.push(...res.words);
                if (res.cleanedText) cleanedParts.push(res.cleanedText);
            });

            const avgS = wordCount / (combinedSentences.length || 1);
            const avgW = wordCount > 0 ? totalSyllables / wordCount : 0;
            const score = 180 - avgS - (58.5 * avgW);

            return {
                score: Math.max(0, Math.min(100, score)),
                avgSentence: avgS,
                syllablesPerWord: avgW,
                wordCount,
                speakingWordCount,
                words: combinedWords,
                sentences: combinedSentences,
                cleanedText: cleanedParts.join('\n\n'),
                paragraphs: paragraphsCount,
                maxSentenceWords,
                totalSyllables
            };
        }

        getReadabilityWithDiff(text) {
            const parts = text.split(/\n\s*\n/);
            const cache = this.state.readabilityCache;
            const updates = [];

            parts.forEach((part, index) => {
                const cached = cache[index];
                if (!cached || cached.text !== part) {
                    updates.push({ index, text: part });
                }
            });

            cache.length = parts.length;

            if (!updates.length) {
                return Promise.resolve(this.buildReadabilityFromCache(cache));
            }

            return this.requestWorkerReadability(updates).then((results) => {
                results.forEach((item) => {
                    cache[item.index] = { text: item.text, result: item.result };
                });
                return this.buildReadabilityFromCache(cache);
            });
        }

        renderBenchmarkModal() {
            let m = document.getElementById('ska-benchmark-modal');
            if (m) m.remove();

            const testText = 'Bitte lies diesen kurzen Testtext laut vor. Sprich deutlich und in deinem natürlichen Tempo. Wir messen die Zeit und berechnen daraus dein persönliches WPM. Du kannst den Test jederzeit wiederholen, um ein präzises Ergebnis zu erhalten.';
            const wordCount = (testText.match(/\S+/g) || []).length;

            m = document.createElement('div');
            m.className = 'skriptanalyse-modal';
            m.id = 'ska-benchmark-modal';
            m.ariaHidden = 'true';
            m.innerHTML = `
                <div class="skriptanalyse-modal-overlay" data-action="close-benchmark"></div>
                <div class="skriptanalyse-modal-content">
                    <div class="ska-modal-header"><h3>WPM-Kalibrierung</h3></div>
                    <div class="skriptanalyse-modal-body">
                        <p style="font-size:0.85rem; color:#64748b; margin-top:0;">Lies den Text einmal durch. Starte dann die Stoppuhr und lies ihn laut vor. <strong>Kein Mikrofon nötig</strong> – die Messung ist manuell.</p>
                        <div class="ska-benchmark-text">${testText}</div>
                        <div class="ska-benchmark-stats">
                            <div><span>Wörter:</span> <strong>${wordCount}</strong></div>
                            <div><span>Zeit:</span> <strong data-role-benchmark-time>0:00</strong></div>
                            <div><span>WPM:</span> <strong data-role-benchmark-wpm>-</strong></div>
                        </div>
                        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                            <button type="button" class="ska-btn ska-btn--primary" data-action="benchmark-toggle">Stoppuhr starten</button>
                            <button type="button" class="ska-btn ska-btn--secondary" data-action="benchmark-reset">Reset</button>
                            <button type="button" class="ska-btn ska-btn--secondary" data-action="benchmark-apply" disabled>Übernehmen</button>
                        </div>
                    </div>
                    <div class="ska-modal-footer">
                         <button type="button" class="ska-btn ska-btn--secondary" data-action="close-benchmark">Schließen</button>
                    </div>
                </div>`;
            document.body.appendChild(m);
            m.dataset.wordCount = String(wordCount);
        }

        renderTeleprompterModal() {
            let m = document.getElementById('ska-teleprompter-modal');
            if (m) m.remove();

            m = document.createElement('div');
            m.className = 'skriptanalyse-modal';
            m.id = 'ska-teleprompter-modal';
            m.ariaHidden = 'true';
            m.innerHTML = `
                <div class="skriptanalyse-modal-overlay" data-action="close-teleprompter"></div>
                <div class="ska-teleprompter-modal">
                    <div class="ska-teleprompter-header">
                        <strong>Teleprompter</strong>
                        <div class="ska-teleprompter-controls">
                            <button class="ska-btn ska-btn--secondary" data-action="teleprompter-smaller">A-</button>
                            <button class="ska-btn ska-btn--secondary" data-action="teleprompter-bigger">A+</button>
                            <button class="ska-btn ska-btn--primary" data-action="teleprompter-toggle">Start</button>
                            <button class="ska-btn ska-btn--secondary" data-action="teleprompter-reset">Reset</button>
                            <button class="ska-btn ska-btn--ghost" data-action="close-teleprompter">Schließen</button>
                        </div>
                    </div>
                    <div class="ska-teleprompter-body">
                        <div class="ska-teleprompter-text" data-role-teleprompter-text></div>
                    </div>
                    <div class="ska-teleprompter-footer">
                        <span data-role-teleprompter-meta>Berechne Geschwindigkeit...</span>
                    </div>
                </div>`;
            document.body.appendChild(m);
        }

        updateTeleprompterMeta(read) {
            const meta = document.querySelector('[data-role-teleprompter-meta]');
            if (!meta || !read) return;
            const isSps = this.settings.timeMode === 'sps';
            const wpm = SA_Logic.getWpm(this.settings);
            const sps = SA_Logic.getSps(this.settings);
            const seconds = isSps ? (read.totalSyllables / sps) : (read.speakingWordCount / wpm) * 60;
            const rateLabel = isSps ? `${sps} SPS` : `${wpm} WPM`;
            meta.textContent = `Tempo: ${rateLabel} • Dauer: ${SA_Utils.formatMin(seconds)}`;
        }

        buildTeleprompterContent(text) {
            const container = document.querySelector('[data-role-teleprompter-text]');
            if (!container) return [];
            const tokens = text.trim().split(/(\s+)/);
            let wordIndex = 0;
            const fragments = tokens.map(token => {
                if (!token.trim()) {
                    return token;
                }
                const span = `<span class="ska-teleprompter-word" data-word-index="${wordIndex++}">${token}</span>`;
                return span;
            });
            container.innerHTML = fragments.join('');
            return Array.from(container.querySelectorAll('.ska-teleprompter-word'));
        }

        updateTeleprompterHighlight(progress) {
            const words = this.state.teleprompter.words || [];
            if (!words.length) return;
            const index = Math.min(words.length - 1, Math.floor(progress * words.length));
            if (this.state.teleprompter.activeIndex !== index) {
                if (this.state.teleprompter.activeIndex >= 0 && words[this.state.teleprompter.activeIndex]) {
                    words[this.state.teleprompter.activeIndex].classList.remove('is-active');
                    words[this.state.teleprompter.activeIndex].classList.add('is-past');
                }
                words[index].classList.add('is-active');
                this.state.teleprompter.activeIndex = index;
            }
        }

        startTeleprompter(read) {
            const modal = document.getElementById('ska-teleprompter-modal');
            if (!modal || !read) return false;
            const body = modal.querySelector('.ska-teleprompter-body');
            if (!body) return false;
            const isSps = this.settings.timeMode === 'sps';
            const wpm = SA_Logic.getWpm(this.settings);
            const sps = SA_Logic.getSps(this.settings);
            const seconds = isSps ? (read.totalSyllables / sps) : (read.speakingWordCount / wpm) * 60;
            const duration = seconds * 1000;
            const distance = body.scrollHeight - body.clientHeight;
            if (distance <= 0) {
                this.state.teleprompter.playing = false;
                return false;
            }

            this.state.teleprompter.playing = true;
            this.state.teleprompter.duration = duration;
            this.state.teleprompter.start = performance.now();
            this.state.teleprompter.startScroll = body.scrollTop;
            this.state.teleprompter.activeIndex = -1;

            const step = (ts) => {
                if (!this.state.teleprompter.playing) return;
                const elapsed = ts - this.state.teleprompter.start;
                const progress = Math.min(1, elapsed / duration);
                body.scrollTop = this.state.teleprompter.startScroll + (distance * progress);
                this.updateTeleprompterHighlight(progress);
                if (progress < 1) {
                    this.state.teleprompter.rafId = requestAnimationFrame(step);
                } else {
                    this.state.teleprompter.playing = false;
                }
            };
            this.state.teleprompter.rafId = requestAnimationFrame(step);
            return true;
        }

        pauseTeleprompter() {
            this.state.teleprompter.playing = false;
            if (this.state.teleprompter.rafId) cancelAnimationFrame(this.state.teleprompter.rafId);
            this.state.teleprompter.rafId = null;
        }

        resetTeleprompter() {
            const modal = document.getElementById('ska-teleprompter-modal');
            if (!modal) return;
            const body = modal.querySelector('.ska-teleprompter-body');
            if (body) body.scrollTop = 0;
            if (this.state.teleprompter.words) {
                this.state.teleprompter.words.forEach(word => {
                    word.classList.remove('is-active', 'is-past');
                });
            }
            this.state.teleprompter.activeIndex = -1;
            this.pauseTeleprompter();
        }

        parseBullshitList() {
            if (!this.settings.bullshitBlacklist) return [];
            return this.settings.bullshitBlacklist
                .split(/[,|\n]/)
                .map(item => item.trim())
                .filter(Boolean);
        }

        handleAction(act, btn) {
            if (act.startsWith('format-')) {
                this.applyFormatting(act);
                return true;
            }
            if (act === 'toggle-card') {
                const id = btn.dataset.card;
                if (id) {
                    this.toggleCard(id, !!btn.checked);
                    this.renderFilterBar();
                }
                return true;
            }
            if (act === 'toggle-filter-view') {
                this.state.showAllCards = !this.state.showAllCards;
                this.renderFilterBar();
                return true;
            }
            if (act === 'toggle-filter-collapse') {
                this.state.filterCollapsed = !this.state.filterCollapsed;
                if (this.filterBar) {
                    this.filterBar.classList.toggle('is-collapsed', this.state.filterCollapsed);
                    const btn = this.filterBar.querySelector('[data-action="toggle-filter-collapse"]');
                    if (btn) btn.textContent = this.state.filterCollapsed ? 'Ausklappen' : 'Einklappen';
                }
                return true;
            }
            if (act === 'filter-select-all') {
                SA_CONFIG.CARD_ORDER.forEach(id => {
                    if (id === 'overview') return;
                    if (this.state.hiddenCards.has(id)) this.state.hiddenCards.delete(id);
                });
                this.saveUIState();
                this.renderHiddenPanel();
                this.analyze(this.getText());
                this.renderFilterBar();
                return true;
            }
            if (act === 'filter-deselect-all') {
                SA_CONFIG.CARD_ORDER.forEach(id => {
                    if (id === 'overview') return;
                    if (!this.state.hiddenCards.has(id)) this.state.hiddenCards.add(id);
                });
                if (this.bottomGrid) {
                    this.bottomGrid.querySelectorAll('.skriptanalyse-card').forEach(c => {
                        const cid = c.dataset.cardId;
                        if (cid && this.state.hiddenCards.has(cid)) c.remove();
                    });
                }
                this.saveUIState();
                this.renderHiddenPanel();
                this.analyze(this.getText());
                this.renderFilterBar();
                return true;
            }
            if (act === 'benchmark-toggle') {
                const modal = document.getElementById('ska-benchmark-modal');
                if (!modal) return true;
                const wordCount = parseInt(modal.dataset.wordCount || '0', 10);
                const timeEl = modal.querySelector('[data-role-benchmark-time]');
                const wpmEl = modal.querySelector('[data-role-benchmark-wpm]');
                const applyBtn = modal.querySelector('[data-action="benchmark-apply"]');
                if (!this.state.benchmark.running) {
                    this.state.benchmark.running = true;
                    this.state.benchmark.start = Date.now() - this.state.benchmark.elapsed;
                    btn.textContent = 'Stoppuhr stoppen';
                    this.state.benchmark.timerId = setInterval(() => {
                        this.state.benchmark.elapsed = Date.now() - this.state.benchmark.start;
                        const sec = Math.floor(this.state.benchmark.elapsed / 1000);
                        if (timeEl) timeEl.textContent = SA_Utils.formatMin(sec);
                    }, 200);
                } else {
                    this.state.benchmark.running = false;
                    btn.textContent = 'Stoppuhr starten';
                    if (this.state.benchmark.timerId) clearInterval(this.state.benchmark.timerId);
                    const sec = Math.max(1, Math.round(this.state.benchmark.elapsed / 1000));
                    const wpm = Math.round((wordCount / sec) * 60);
                    this.state.benchmark.wpm = wpm;
                    if (wpmEl) wpmEl.textContent = `${wpm} WPM`;
                    if (applyBtn) applyBtn.disabled = false;
                }
                return true;
            }

            if (act === 'benchmark-reset') {
                const modal = document.getElementById('ska-benchmark-modal');
                if (!modal) return true;
                const timeEl = modal.querySelector('[data-role-benchmark-time]');
                const wpmEl = modal.querySelector('[data-role-benchmark-wpm]');
                const toggleBtn = modal.querySelector('[data-action="benchmark-toggle"]');
                const applyBtn = modal.querySelector('[data-action="benchmark-apply"]');
                if (this.state.benchmark.timerId) clearInterval(this.state.benchmark.timerId);
                this.state.benchmark = { running: false, start: 0, elapsed: 0, wpm: 0, timerId: null };
                if (timeEl) timeEl.textContent = '0:00';
                if (wpmEl) wpmEl.textContent = '-';
                if (toggleBtn) toggleBtn.textContent = 'Stoppuhr starten';
                if (applyBtn) applyBtn.disabled = true;
                return true;
            }

            if (act === 'benchmark-apply') {
                const wpm = this.state.benchmark.wpm;
                if (wpm && wpm > 0) {
                    this.settings.manualWpm = wpm;
                    this.saveUIState();
                    this.updateWpmUI();
                    this.analyze(this.getText());
                }
                return true;
            }

            if (act === 'teleprompter-toggle') {
                const modal = document.getElementById('ska-teleprompter-modal');
                if (!modal) return true;
                if (this.state.teleprompter.playing) {
                    this.pauseTeleprompter();
                    btn.textContent = 'Start';
                } else {
                    const read = SA_Logic.analyzeReadability(this.getText(), this.settings);
                    const started = this.startTeleprompter(read);
                    btn.textContent = started ? 'Pause' : 'Start';
                }
                return true;
            }

            if (act === 'teleprompter-reset') {
                this.resetTeleprompter();
                const startBtn = document.querySelector('[data-action="teleprompter-toggle"]');
                if (startBtn) startBtn.textContent = 'Start';
                return true;
            }

            if (act === 'teleprompter-bigger' || act === 'teleprompter-smaller') {
                const textEl = document.querySelector('[data-role-teleprompter-text]');
                if (textEl) {
                    const current = parseFloat(window.getComputedStyle(textEl).fontSize);
                    const next = act === 'teleprompter-bigger' ? current + 2 : current - 2;
                    textEl.style.fontSize = `${Math.max(16, Math.min(36, next))}px`;
                }
                return true;
            }

            if (act === 'crunch-fillers') {
                const current = this.getText();
                if (!current.trim()) return true;
                const cleaned = SA_Logic.removeFillers(current);
                this.setText(cleaned);
                this.analyze(this.getText());
                return true;
            }

            if (act === 'reset-wpm') {
                this.settings.manualWpm = 0;
                this.saveUIState();
                this.updateWpmUI();
                this.analyze(this.getText());
                return true;
            }
            return false;
        }

        applyFormatting(action) {
            if (!this.textarea) return;
            const textarea = this.textarea;
            const isEditable = textarea.isContentEditable;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = isEditable ? window.getSelection().toString() : textarea.value.substring(start, end);

            const wrapSelection = (prefix, suffix) => {
                const insertText = selected || 'Text';
                const newText = `${prefix}${insertText}${suffix}`;
                if (isEditable) {
                    document.execCommand('insertHTML', false, newText);
                } else {
                    textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
                    const cursorStart = start + prefix.length;
                    const cursorEnd = cursorStart + insertText.length;
                    textarea.setSelectionRange(cursorStart, cursorEnd);
                }
            };

            const applyTag = (tag, styleLabel) => {
                const insertText = selected || styleLabel;
                wrapSelection(`<${tag}>`, `</${tag}>`);
                if (!isEditable) {
                    textarea.value = textarea.value.replace(`<${tag}>${styleLabel}</${tag}>`, `<${tag}>${insertText}</${tag}>`);
                    textarea.setSelectionRange(start + (`<${tag}>`).length, start + (`<${tag}>`).length + insertText.length);
                }
            };

            switch (action) {
                case 'format-bold':
                    if (isEditable) textarea.focus();
                    if (isEditable) document.execCommand('bold');
                    else applyTag('b', 'Fett');
                    break;
                case 'format-italic':
                    if (isEditable) textarea.focus();
                    if (isEditable) document.execCommand('italic');
                    else applyTag('i', 'Kursiv');
                    break;
                case 'format-underline':
                    if (isEditable) textarea.focus();
                    if (isEditable) document.execCommand('underline');
                    else applyTag('u', 'Unterstrichen');
                    break;
                case 'format-highlight':
                    if (isEditable) textarea.focus();
                    if (isEditable) {
                        document.execCommand('hiliteColor', false, '#fde68a');
                    } else {
                        applyTag('mark', 'Textmarker');
                    }
                    break;
                case 'format-strike':
                    if (isEditable) textarea.focus();
                    if (isEditable) document.execCommand('strikeThrough');
                    else applyTag('s', 'Durchgestrichen');
                    break;
            }
            textarea.focus();
            this.analyze(this.getText());
        }


        loadUIState() {
            const h = SA_Utils.storage.load(SA_CONFIG.UI_KEY_HIDDEN);
            if(h) this.state.hiddenCards = new Set(JSON.parse(h));
            const e = SA_Utils.storage.load(SA_CONFIG.UI_KEY_EXCLUDED);
            if(e) this.state.excludedCards = new Set(JSON.parse(e));
            
            const g = SA_Utils.storage.load(SA_CONFIG.UI_KEY_SETTINGS);
            if(g) {
                const global = JSON.parse(g);
                if(global.timeMode) this.settings.timeMode = global.timeMode;
                if(global.charMode) this.settings.charMode = global.charMode;
                if(global.numberMode) this.settings.numberMode = global.numberMode;
                if(global.manualWpm) this.settings.manualWpm = global.manualWpm;
                if(global.audienceTarget) this.settings.audienceTarget = global.audienceTarget;
                if(global.bullshitBlacklist) this.settings.bullshitBlacklist = global.bullshitBlacklist;
                if(typeof global.lastGenre !== 'undefined') this.settings.lastGenre = global.lastGenre;
                if(typeof global.commaPause !== 'undefined') this.settings.commaPause = global.commaPause;
                if(typeof global.periodPause !== 'undefined') this.settings.periodPause = global.periodPause;
                if(typeof global.focusKeywords !== 'undefined') this.settings.focusKeywords = global.focusKeywords;
                if(typeof global.keywordDensityLimit !== 'undefined') this.settings.keywordDensityLimit = global.keywordDensityLimit;
                
                // Sync Radio
                const m = document.getElementById('ska-settings-modal');
                if(m) {
                    const r = m.querySelector(`input[name="ska-time-mode"][value="${this.settings.timeMode}"]`);
                    if(r) r.checked = true;
                }
            }
        }

        saveUIState() {
            SA_Utils.storage.save(SA_CONFIG.UI_KEY_HIDDEN, JSON.stringify([...this.state.hiddenCards]));
            SA_Utils.storage.save(SA_CONFIG.UI_KEY_EXCLUDED, JSON.stringify([...this.state.excludedCards]));
            SA_Utils.storage.save(SA_CONFIG.UI_KEY_SETTINGS, JSON.stringify({ 
                timeMode: this.settings.timeMode, 
                lastGenre: this.settings.lastGenre,
                charMode: this.settings.charMode,
                numberMode: this.settings.numberMode,
                manualWpm: this.settings.manualWpm,
                audienceTarget: this.settings.audienceTarget,
                bullshitBlacklist: this.settings.bullshitBlacklist,
                commaPause: this.settings.commaPause,
                periodPause: this.settings.periodPause,
                focusKeywords: this.settings.focusKeywords,
                keywordDensityLimit: this.settings.keywordDensityLimit
            }));
        }

        initMarkerDropdown() {
            const container = this.root.querySelector('.ska-formatting-actions') || this.root.querySelector('.skriptanalyse-input-actions');
            if (!container) return;
            const wrap = document.createElement('div'); wrap.style.position = 'relative'; wrap.style.display = 'inline-block';
            const btn = document.createElement('button'); btn.className = 'ska-tool-btn'; 
            
            btn.innerHTML = `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin-right:4px; transform:translateY(1px)"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> Marker <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin-left:6px; opacity:0.6;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" /></svg>`;
            
            btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); menu.classList.toggle('is-open'); };
            const menu = document.createElement('div'); menu.className = 'skriptanalyse-dropdown-menu';
            SA_CONFIG.MARKERS.forEach(m => {
                const item = document.createElement('button'); item.className = 'skriptanalyse-dropdown-item';
                item.innerHTML = `<strong>${m.label.split(' ')[0]}</strong>`;
                item.setAttribute('data-tooltip', m.desc);
                item.onclick = (e) => { e.preventDefault(); SA_Utils.insertAtCursor(this.textarea, m.val); this.analyze(this.getText()); menu.classList.remove('is-open'); };
                menu.appendChild(item);
            });
            document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) menu.classList.remove('is-open'); });
            wrap.appendChild(btn); wrap.appendChild(menu); container.appendChild(wrap);
        }

        bindEvents() {
            this.textarea.addEventListener('input', SA_Utils.debounce(() => this.analyze(this.getText()), 250));
            this.root.addEventListener('input', (e) => {
                const slider = e.target.closest('[data-action="wpm-slider"]');
                if (slider) {
                    const val = parseInt(slider.value, 10);
                    this.settings.manualWpm = val;
                    this.saveUIState();
                    const wrap = slider.closest('.ska-wpm-calibration');
                    if (wrap) {
                        const label = wrap.querySelector('.ska-wpm-header strong');
                        if (label) label.textContent = `${val} WPM`;
                    }
                }
            });
            this.root.addEventListener('change', (e) => {
                const slider = e.target.closest('[data-action="wpm-slider"]');
                if (slider) {
                    this.analyze(this.getText());
                }
            });
            window.addEventListener('resize', SA_Utils.debounce(() => this.syncEditorHeight(), 150));
            this.root.querySelectorAll('select').forEach(s => s.addEventListener('change', (e) => {
                const k = e.target.dataset.filter || (e.target.hasAttribute('data-role-select') ? 'role' : null);
                if(k) {
                    this.settings[k] = e.target.value;
                    if (k === 'usecase' && e.target.value !== 'auto') {
                        this.settings.lastGenre = e.target.value;
                        this.saveUIState();
                    }
                }
                this.analyze(this.getText());
            }));
            if(this.targetInput) this.targetInput.addEventListener('input', (e) => {
                const v = e.target.value.trim().split(':');
                this.settings.targetSec = v.length > 1 ? (parseInt(v[0]||0)*60)+parseInt(v[1]||0) : parseInt(v[0]||0);
                this.analyze(this.getText());
            });
            
            this.root.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                const hideBtn = e.target.closest('.ska-hide-btn');
                const restoreChip = e.target.closest('.ska-restore-chip');
                const whitelistBtn = e.target.closest('.ska-whitelist-toggle');

                if(hideBtn) { this.toggleCard(hideBtn.closest('.skriptanalyse-card').dataset.cardId, false); return; }
                if(restoreChip) { this.toggleCard(restoreChip.dataset.restoreId, true); return; }
                
                if(whitelistBtn) {
                    const card = whitelistBtn.closest('.skriptanalyse-card');
                    if(card) {
                        const id = card.dataset.cardId;
                        if(this.state.excludedCards.has(id)) this.state.excludedCards.delete(id);
                        else this.state.excludedCards.add(id);
                        this.saveUIState();
                        this.analyze(this.getText());
                    }
                    return;
                }

                if(!btn) return;
                const act = btn.dataset.action;

                if(act.startsWith('open-')) { 
                    const modalId = 'ska-' + act.replace('open-', '') + '-modal';
                    const m = document.getElementById(modalId);
                    if(m){ 
                        m.classList.add('is-open'); 
                        document.body.classList.add('ska-modal-open');
                        
                        // If it's settings modal, re-render to ensure latest state (target time etc)
                        if(modalId === 'ska-settings-modal') {
                            this.renderSettingsModal();
                            const newM = document.getElementById('ska-settings-modal');
                            if(newM) newM.classList.add('is-open');
                        }

                        if (modalId === 'ska-benchmark-modal') {
                            this.renderBenchmarkModal();
                            const newM = document.getElementById('ska-benchmark-modal');
                            if (newM) newM.classList.add('is-open');
                        }

                        if (modalId === 'ska-teleprompter-modal') {
                            this.renderTeleprompterModal();
                            const newM = document.getElementById('ska-teleprompter-modal');
                            if (newM) {
                                newM.classList.add('is-open');
                                this.state.teleprompter.words = this.buildTeleprompterContent(this.getText());
                                const read = SA_Logic.analyzeReadability(this.getText(), this.settings);
                                this.updateTeleprompterMeta(read);
                                this.resetTeleprompter();
                            }
                        }
                        
                        e.preventDefault(); 
                    } 
                }

                if (this.handleAction(act, btn)) return;

                if(act === 'next-tip') {
                    const card = btn.closest('.skriptanalyse-card');
                    if(card) {
                        const id = card.dataset.cardId;
                        const tips = SA_CONFIG.TIPS[id];
                        if(tips && tips.length > 0) {
                            const tipP = card.querySelector('.ska-tip-content');
                            const badge = card.querySelector('.ska-tip-badge span'); 
                            
                            if(tipP) {
                                tipP.classList.add('is-changing');
                                setTimeout(() => {
                                    if(typeof this.state.tipIndices[id] === 'undefined') this.state.tipIndices[id] = 0;
                                    this.state.tipIndices[id] = (this.state.tipIndices[id] + 1) % tips.length;
                                    tipP.textContent = tips[this.state.tipIndices[id]];
                                    if(badge) badge.textContent = `${this.state.tipIndices[id] + 1}/${tips.length}`;
                                    tipP.classList.remove('is-changing');
                                }, 300);
                            }
                        }
                    }
                    e.preventDefault();
                    return; 
                }

            if(act === 'toggle-breath-more') {
                 const hiddenBox = this.root.querySelector('#ska-breath-hidden');
                 if(hiddenBox) {
                     const isHidden = !hiddenBox.classList.contains('is-expanded');
                     hiddenBox.classList.toggle('is-expanded');
                     const total = parseInt(btn.dataset.total || 0);
                     btn.textContent = isHidden ? 'Weniger anzeigen' : `...und ${total} weitere anzeigen`;
                 }
                 e.preventDefault();
            }

            if(act === 'toggle-rhet-questions') {
                const hiddenBox = this.root.querySelector('#ska-rhet-questions-hidden');
                if(hiddenBox) {
                    const isHidden = !hiddenBox.classList.contains('is-expanded');
                    hiddenBox.classList.toggle('is-expanded');
                    const total = parseInt(btn.dataset.total || 0);
                    btn.textContent = isHidden ? 'Weniger anzeigen' : `...und ${total} weitere anzeigen`;
                }
                e.preventDefault();
            }

            if(act === 'toggle-plosive') {
                const hiddenBox = this.root.querySelector('#ska-plosive-hidden');
                if(hiddenBox) {
                    const isHidden = !hiddenBox.classList.contains('is-expanded');
                    hiddenBox.classList.toggle('is-expanded');
                    const total = parseInt(btn.dataset.total || 0);
                    btn.textContent = isHidden ? 'Weniger anzeigen' : `...und ${total} weitere anzeigen`;
                }
                e.preventDefault();
            }

                if(act === 'clean') { 
                    this.setText(this.getText().replace(/[\t\u00A0]/g,' ').replace(/ +/g,' ').replace(/\n{3,}/g,'\n\n')); 
                    this.analyze(this.getText()); 
                }
                if(act === 'save-version') { 
                    this.state.savedVersion = this.getText(); 
                    const h=this.root.querySelector('[data-role-toast]'); if(h){ h.classList.add('is-visible'); setTimeout(()=>h.classList.remove('is-visible'),2500); }
                    this.analyze(this.getText()); 
                    setTimeout(() => {
                        if (this.compareRow && this.compareRow.classList.contains('is-active')) {
                            this.compareRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 150);
                }

                if(act === 'export-marker-json') {
                    const markers = SA_Logic.generateMarkerData(this.getText(), this.settings);
                    SA_Utils.downloadJSON(markers, 'skript-marker-export.json');
                }
            });

            document.body.addEventListener('click', (e) => {
                const modal = e.target.closest('.skriptanalyse-modal');
                if(!modal) return; 

                const btn = e.target.closest('[data-action]');
                const overlay = e.target.classList.contains('skriptanalyse-modal-overlay');
                
                if(overlay) {
                    modal.classList.remove('is-open');
                    document.body.classList.remove('ska-modal-open');
                    if (modal.id === 'ska-teleprompter-modal') this.resetTeleprompter();
                    if (modal.id === 'ska-benchmark-modal' && this.state.benchmark.timerId) {
                        clearInterval(this.state.benchmark.timerId);
                        this.state.benchmark.timerId = null;
                        this.state.benchmark.running = false;
                    }
                    return;
                }

                if(!btn) return;
                const act = btn.dataset.action;

                if(act.startsWith('close-')) { 
                    modal.classList.remove('is-open'); 
                    document.body.classList.remove('ska-modal-open');
                    if (modal.id === 'ska-teleprompter-modal') this.resetTeleprompter();
                    if (modal.id === 'ska-benchmark-modal' && this.state.benchmark.timerId) {
                        clearInterval(this.state.benchmark.timerId);
                        this.state.benchmark.timerId = null;
                        this.state.benchmark.running = false;
                    }
                    e.preventDefault(); 
                }

                if (this.handleAction(act, btn)) return;

                if(act === 'generate-pdf-final') {
                    const opts = { 
                        metrics: modal.querySelector('#pdf-opt-overview')?.checked, 
                        details: modal.querySelector('#pdf-opt-details')?.checked, 
                        tips: modal.querySelector('#pdf-opt-tips')?.checked, 
                        compare: modal.querySelector('#pdf-opt-compare')?.checked, 
                        script: modal.querySelector('#pdf-opt-script')?.checked 
                    };
                    const pdfData = { ...this.state.currentData, savedVersion: this.state.savedVersion };
                    SA_PDF.generate(this.getText(), pdfData, this.settings, opts, btn);
                }

                if(act === 'confirm-reset') {
                    this.setText(''); 
                    this.settings={usecase:'auto',lastGenre:'',charMode:'spaces',numberMode:'digit',branch:'all',targetSec:0,role:'',manualWpm:0, timeMode:'wpm', audienceTarget:'', bullshitBlacklist:'', commaPause:0.2, periodPause:0.5, focusKeywords:'', keywordDensityLimit:2}; 
                    this.state.savedVersion=''; 
                    this.state.hiddenCards.clear(); 
                    this.state.excludedCards.clear();
                    this.state.readabilityCache = [];
                    this.saveUIState();
                    this.renderHiddenPanel();
                    this.root.querySelectorAll('select').forEach(s=>s.selectedIndex=0); 
                    if(this.targetInput)this.targetInput.value='';
                    this.analyze('');
                    modal.classList.remove('is-open'); document.body.classList.remove('ska-modal-open');
                }
            });
        }

        toggleCard(id, visible) {
            if(!visible) {
                const c = this.bottomGrid.querySelector(`[data-card-id="${id}"]`);
                if(c) { 
                    c.classList.add('is-hidden'); 
                    setTimeout(() => { 
                        this.state.hiddenCards.add(id); 
                        this.saveUIState();
                        c.remove(); 
                        this.renderHiddenPanel(); 
                        this.renderFilterBar();
                    }, 500); 
                }
            } else {
                this.state.hiddenCards.delete(id); 
                this.saveUIState();
                this.renderHiddenPanel(); 
                this.analyze(this.getText());
            }
        }

        renderHiddenPanel() {
            this.hiddenPanel.innerHTML = '';
            const sorted = SA_CONFIG.CARD_ORDER.filter(id => this.state.hiddenCards.has(id));
            if(sorted.length) {
                this.hiddenPanel.innerHTML = '<div class="ska-hidden-label">Ausgeblendet (Klicken zum Wiederherstellen):</div>';
                sorted.forEach(id => {
                    const b = document.createElement('div'); b.className = 'ska-restore-chip'; b.dataset.restoreId = id;
                    b.innerHTML = `<span>+</span> ${SA_CONFIG.CARD_TITLES[id]||id}`; this.hiddenPanel.appendChild(b);
                });
            }
        }

        renderLegend() {
            if(this.legendContainer) {
                this.legendContainer.innerHTML = `<div class="ska-legend-box"><div class="ska-card-header" style="padding-bottom:0; border:none; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;"><h3>Legende & Hilfe</h3><button class="ska-legend-help-btn" data-action="open-help">Anleitung öffnen</button></div><div class="ska-legend-body" style="padding-top:0;"><div class="ska-legend-grid"><div class="ska-legend-def"><strong>Auffällige Sätze:</strong> Zeigt Sätze > 25 Wörter oder viele Kommas.</div><div class="ska-legend-def"><strong>Wort-Echos:</strong> Markiert Wiederholungen auf engem Raum.</div><div class="ska-legend-def"><strong>Dynamik-Check:</strong> Findet Passiv-Formulierungen.</div><div class="ska-legend-def"><strong>Bürokratie:</strong> Markiert Nominalstil (Ung/Heit/Keit).</div><div class="ska-legend-def"><strong>Denglisch:</strong> Findet unnötige Anglizismen.</div><div class="ska-legend-def"><strong>Buzzword-Check:</strong> Markiert Phrasen aus der Blacklist.</div><div class="ska-legend-def"><strong>Verb-Fokus:</strong> Warnt bei nominalem Stil.</div><div class="ska-legend-def"><strong>Teleprompter:</strong> Scrollt im Tempo der Analyse.</div><div class="ska-legend-def" style="grid-column: 1 / -1; border-top:1px solid #f1f5f9; padding-top:0.8rem; margin-top:0.4rem;"><strong>🔒 Datenschutz:</strong> Die Analyse erfolgt zu 100% lokal in deinem Browser. Kein Text wird an einen Server gesendet.</div><div class="ska-legend-def" style="grid-column: 1 / -1;"><strong>⏱️ Methodik:</strong> Zeitberechnung basiert auf Genre-WPM, Pausenmarkern und Zahlen-zu-Wort-Logik.</div></div></div></div>`;
            }
        }

        renderFilterBar() {
            if (!this.filterBar) return;
            const profile = this.settings.role;
            const allowed = profile && SA_CONFIG.PROFILE_CARDS[profile] ? new Set(SA_CONFIG.PROFILE_CARDS[profile]) : null;
            const items = SA_CONFIG.CARD_ORDER.filter(id => SA_CONFIG.CARD_TITLES[id]);
            const showAll = this.state.showAllCards || !allowed;
            const title = allowed ? 'Analyseboxen individuell auswählen' : 'Analyseboxen auswählen';
            const toggleLabel = showAll ? 'Profilansicht' : 'Alle Boxen';
            this.filterBar.classList.toggle('is-expanded', showAll);
            this.filterBar.classList.toggle('is-collapsed', this.state.filterCollapsed);
            const collapseLabel = this.state.filterCollapsed ? 'Ausklappen' : 'Einklappen';
            const html = `
                <div class="ska-filterbar-header">
                    <span>${title}</span>
                    <div class="ska-filterbar-actions">
                        <button class="ska-filterbar-toggle" data-action="toggle-filter-collapse">${collapseLabel}</button>
                        ${allowed ? `<button class="ska-filterbar-toggle" data-action="toggle-filter-view">${toggleLabel}</button>` : ''}
                    </div>
                </div>
                <div class="ska-filterbar-body">
                    <div class="ska-filterbar-bulk">
                        <button class="ska-filterbar-bulk-btn" data-action="filter-select-all">Alle auswählen</button>
                        <button class="ska-filterbar-bulk-btn" data-action="filter-deselect-all">Alle abwählen</button>
                    </div>
                    ${items.map(id => {
                        if (allowed && !showAll && !allowed.has(id) && id !== 'overview') return '';
                        const checked = !this.state.hiddenCards.has(id);
                        return `<label class="ska-filter-pill ${checked ? '' : 'is-off'} ${checked ? 'checked' : ''}"><input type="checkbox" data-action="toggle-card" data-card="${id}" ${checked ? 'checked' : ''}><span>${SA_CONFIG.CARD_TITLES[id]}</span></label>`;
                    }).join('')}
                </div>`;
            this.filterBar.innerHTML = html;
        }

        analyze(text) {
            const raw = text || '';
            this.state.analysisToken += 1;
            const token = this.state.analysisToken;
            if (this.analysisWorker && raw.length >= SA_CONFIG.WORKER_TEXT_THRESHOLD) {
                this.getReadabilityWithDiff(raw).then((read) => {
                    if (token !== this.state.analysisToken) return;
                    this.performAnalysis(raw, read);
                });
                return;
            }
            this.performAnalysis(raw, SA_Logic.analyzeReadability(raw, this.settings));
        }

        performAnalysis(raw, read) {
            SA_Utils.storage.save(SA_CONFIG.STORAGE_KEY, raw);
            const wpm = SA_Logic.getWpm(this.settings);
            const sps = SA_Logic.getSps(this.settings);
            
            const pause = SA_Utils.getPausenTime(raw, this.settings);
            
            // TIME CALCULATION SWITCH
            let dur = 0;
            if (this.settings.timeMode === 'sps') {
                // Total Syllables / SPS = Seconds
                const seconds = read.totalSyllables / sps;
                dur = seconds + pause;
            } else {
                // Default WPM
                dur = (read.speakingWordCount / wpm * 60) + pause;
            }
            
            // CHAR COUNT LOGIC
            let countText = raw;
            if (this.settings.numberMode === 'word') {
                // Expand numbers roughly to text length equivalent
                // Heuristic: multiply number length by 4 (e.g. 12 -> 2 digits * 4 = 8 chars ~ "zwölf")
                // A bit more precise: 0-12 map, else factor 4.5
                const numMap = ['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn','elf','zwölf'];
                countText = countText.replace(/\d+/g, (match) => {
                    const n = parseInt(match);
                    if(n <= 12 && n >= 0) return numMap[n]; 
                    return 'x'.repeat(Math.ceil(match.length * 4.5));
                });
            }
            countText = SA_Utils.cleanTextForCounting(countText);
            
            if (this.settings.charMode === 'no-spaces') {
                countText = countText.replace(/\s/g, '');
            }
            
            const charC = countText.length;

            if (!raw.trim()) {
                this.root.querySelector('.ska-grid').classList.add('is-empty');
                if (this.filterBar) {
                    this.filterBar.classList.add('is-hidden');
                    this.filterBar.innerHTML = '';
                }
            } else {
                this.root.querySelector('.ska-grid').classList.remove('is-empty');
                if (this.filterBar) {
                    this.filterBar.classList.remove('is-hidden');
                }
            }

            this.state.currentData = { duration: SA_Utils.formatMin(dur), wordCount: read.wordCount, wpm, score: read.score.toFixed(0), mode: this.settings.timeMode === 'sps' ? `${sps} SPS` : `${wpm} WPM` };
            this.renderOverview(dur, read.wordCount, charC, wpm, pause, read);

            if (read.wordCount === 0) {
                this.bottomGrid.innerHTML = ''; this.compareRow.innerHTML = ''; this.compareRow.classList.remove('is-active');
                this.renderHiddenPanel();
                if(this.legendContainer) this.legendContainer.innerHTML = '';
                if (this.filterBar) {
                    this.filterBar.classList.add('is-hidden');
                    this.filterBar.innerHTML = '';
                }
                this.syncEditorHeight(true);
                return;
            }

            const isActive = (id) => !this.state.excludedCards.has(id);

            const profile = this.settings.role;
            const allowed = profile && SA_CONFIG.PROFILE_CARDS[profile] ? new Set(SA_CONFIG.PROFILE_CARDS[profile]) : null;
            SA_CONFIG.CARD_ORDER.forEach((id, idx) => {
                if(this.state.hiddenCards.has(id)) return;
                if (allowed && !allowed.has(id) && id !== 'overview') return;
                const active = isActive(id);

                switch(id) {
                    case 'char': this.renderCharCard(read, raw, active); break;
                    case 'coach': this.renderCoachCard(dur, read.score, raw, read.sentences, active); break;
                    case 'stumble': this.renderStumbleCard(SA_Logic.findStumbles(raw), active); break;
                    case 'fillers': this.renderFillerCard(SA_Logic.findFillers(read.cleanedText), active); break;
                    case 'nominal': this.renderNominalCard(SA_Logic.findNominalStyle(read.cleanedText), active); break;
                    case 'nominal_chain': this.renderNominalChainCard(SA_Logic.findNominalChains(read.cleanedText), active); break;
                    case 'anglicism': this.renderAnglicismCard(SA_Logic.findAnglicisms(read.cleanedText), active); break;
                    case 'breath': this.renderBreathCard(SA_Logic.findBreathKillers(read.sentences), active); break;
                    case 'echo': this.renderEchoCard(SA_Logic.findWordEchoes(read.cleanedText), active); break;
                    case 'passive': this.renderPassiveCard(SA_Logic.findPassive(read.cleanedText), read.wordCount, active); break;
                    case 'marker': this.renderMarkerCard(read.sentences, active); break;
                    case 'cta': this.renderCtaCard(raw, active); break;
                    case 'adjective': this.renderAdjectiveCard(SA_Logic.findAdjectives(read.cleanedText), read.wordCount, active); break;
                    case 'rhythm': this.renderRhythmCard(read.sentences, read.maxSentenceWords, active); break;
                    case 'dialog': this.renderDialogCard(SA_Logic.analyzeDialog(raw), active); break;
                    case 'gender': this.renderGenderCard(SA_Logic.findGenderBias(raw), active); break;
                    case 'start_var': this.renderRepetitiveStartsCard(SA_Logic.analyzeSentenceStarts(read.sentences), active); break;
                    case 'role_dist': this.renderRoleCard(SA_Logic.analyzeRoles(raw), active); break;
                    case 'vocabulary': this.renderVocabularyCard(SA_Logic.analyzeVocabulary(read.words), active); break;
                    case 'pronunciation': this.renderPronunciationCard(SA_Logic.analyzePronunciation(read.cleanedText), active); break;
                    case 'keyword_focus': this.renderKeywordFocusCard(SA_Logic.analyzeKeywordClusters(raw, this.settings), active); break;
                    case 'spread_index': this.renderSpreadIndexCard(read.sentences, active); break;
                    case 'arousal': this.renderArousalCard(SA_Logic.analyzeArousalMap(read.sentences), active); break;
                    case 'plosive': this.renderPlosiveCard(SA_Logic.findPlosiveClusters(raw), active); break;
                    case 'redundancy': this.renderRedundancyCard(SA_Logic.analyzeRedundancy(read.sentences), active); break;
                    case 'bpm': this.renderBpmCard(SA_Logic.analyzeBpmSuggestion(read, this.settings), active); break;
                    case 'easy_language': this.renderEasyLanguageCard(SA_Logic.analyzeEasyLanguage(read.cleanedText, read.sentences), active); break;
                    case 'bullshit': this.renderBullshitCard(SA_Logic.analyzeBullshitIndex(read.cleanedText, this.parseBullshitList()), active); break;
                    case 'metaphor': this.renderMetaphorCard(SA_Logic.analyzeMetaphorPhrases(raw), active); break;
                    case 'audience': this.renderAudienceCard(SA_Logic.evaluateAudienceTarget(read, this.settings.audienceTarget), active); break;
                    case 'verb_balance': this.renderVerbBalanceCard(SA_Logic.analyzeVerbNounBalance(read.cleanedText, read.sentences), active); break;
                    case 'rhet_questions': this.renderRhetoricalQuestionsCard(SA_Logic.analyzeRhetoricalQuestions(raw, read.sentences), active); break;
                    case 'depth_check': this.renderDepthCheckCard(SA_Logic.analyzeDepthCheck(read.sentences), active); break;
                    case 'sentiment_intensity': this.renderSentimentIntensityCard(SA_Logic.analyzeSentimentIntensity(read.sentences), active); break;
                    case 'naming_check': this.renderNamingCheckCard(SA_Logic.analyzeNamingInconsistency(read.sentences), active); break;
                    case 'teleprompter': this.renderTeleprompterCard(read, active); break;
                }
                const c = this.bottomGrid.querySelector(`[data-card-id="${id}"]`); if(c) c.style.order = idx;
            });

            this.renderHiddenPanel();
            this.renderFilterBar();
            if(this.state.savedVersion) this.renderComparison(dur, read.wordCount, read.score);
            else { this.compareRow.innerHTML = ''; this.compareRow.classList.remove('is-active'); }
            this.renderLegend();
            this.syncEditorHeight();
        }

        syncEditorHeight(reset = false) {
            const editorPanel = this.root.querySelector('.ska-editor-panel');
            const overviewPanel = this.root.querySelector('.skriptanalyse-analysis-top');
            if (!editorPanel) return;
            if (reset || !overviewPanel) {
                editorPanel.style.height = '';
                editorPanel.style.maxHeight = '';
                return;
            }
            const overviewCard = overviewPanel.querySelector('.skriptanalyse-card--overview');
            if (!overviewCard) return;
            const height = overviewCard.getBoundingClientRect().height;
            if (height > 0) {
                editorPanel.style.height = `${Math.round(height)}px`;
                editorPanel.style.maxHeight = `${Math.round(height)}px`;
            }
        }
        
        renderPronunciationCard(issues, active) {
            if(!active) return this.updateCard('pronunciation', this.renderDisabledState(), this.bottomGrid, '', '', true);
            let h = '';
            if(!issues || issues.length === 0) {
                 h = `<p style="color:#64748b; font-size:0.9rem;">Keine schwierigen Aussprachen gefunden.</p>`;
            } else {
                 h += `<div class="ska-section-title">Gefundene Wörter: <strong>${issues.length}</strong></div>`;
                 
                 // Use Grid only if multiple items
                 const gridStyle = issues.length > 1 ? 'display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;' : '';
                 
                 h += `<div class="ska-problem-list" style="${gridStyle}">`;
                 // Remove duplicates
                 const unique = [...new Map(issues.map(item => [item.word, item])).values()];
                 unique.forEach(item => {
                     h += `<div class="ska-problem-item" style="display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #e2e8f0; padding:0.5rem; border-radius:6px;">
                            <span style="font-weight:600; color:#334155; font-size:0.85rem;">${item.word}</span>
                            <span style="color:#2563eb; font-size:0.8rem;">${item.hint}</span>
                           </div>`;
                 });
                 h += `</div>`;
                 h += this.renderTipSection('pronunciation', true);
            }
            this.updateCard('pronunciation', h);
        }

        renderKeywordFocusCard(data, active) {
            if(!active) return this.updateCard('keyword_focus', this.renderDisabledState(), this.bottomGrid, '', '', true);

            const total = data.total || 0;
            const top = data.top || [];
            const focusKeywords = data.focusKeywords || [];
            const focusCounts = data.focusCounts || [];
            const focusDensity = data.focusDensity || 0;
            const focusLimit = data.focusLimit || 0;
            const focusOverLimit = data.focusOverLimit;
            const focusTotalCount = data.focusTotalCount || 0;
            let h = '';

            if(total === 0 || top.length === 0) {
                h = `<p style="color:#64748b; font-size:0.9rem;">Keine aussagekräftigen Substantive erkannt.</p>`;
                return this.updateCard('keyword_focus', h);
            }

            if (focusKeywords.length) {
                const statusLabel = focusLimit > 0
                    ? (focusOverLimit ? 'Keyword-Stuffing möglich' : 'Im grünen Bereich')
                    : 'Keine Limitierung gesetzt';
                const statusColor = focusOverLimit ? SA_CONFIG.COLORS.error : (focusLimit > 0 ? SA_CONFIG.COLORS.success : SA_CONFIG.COLORS.muted);
                const barWidth = focusLimit > 0 ? Math.min(100, (focusDensity / focusLimit) * 100) : Math.min(100, focusDensity * 10);

                h += `
                    <div style="margin-bottom:1rem;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.5rem;">
                            <span style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase;">Keyword-Dichte</span>
                            <span style="font-weight:700; color:${statusColor};">${statusLabel}</span>
                        </div>
                        <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                            <div style="width:${barWidth}%; height:100%; background:linear-gradient(90deg, #dbeafe, ${statusColor}); transition:width 0.5s;"></div>
                        </div>
                        <div style="margin-top:0.4rem; font-size:0.8rem; color:#94a3b8;">Fokus-Keywords: <strong style="color:#334155;">${focusTotalCount} Treffer</strong> (${focusDensity.toFixed(2)}% von ${data.totalWords || 0} Wörtern)</div>
                    </div>`;

                if (focusCounts.length) {
                    const nonZero = focusCounts.filter(item => item.count > 0);
                    h += `<div class="ska-section-title">Fokus-Keywords</div>`;
                    if (!nonZero.length) {
                        h += `<p style="font-size:0.85rem; color:#94a3b8;">Keine Treffer für die hinterlegten Keywords.</p>`;
                    } else {
                        h += `<div class="ska-filler-list">`;
                        const maxFocus = Math.max(...nonZero.map(item => item.count), 1);
                        nonZero
                            .sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword))
                            .forEach(item => {
                                const pct = (item.count / maxFocus) * 100;
                                h += `<div class="ska-filler-item">
                                        <span class="ska-filler-word" style="font-weight:600;">${item.keyword}</span>
                                        <div class="ska-filler-bar-bg"><div class="ska-filler-bar-fill" style="width:${pct}%; background:linear-gradient(90deg, #dbeafe, #1a93ee);"></div></div>
                                        <span class="ska-filler-count">${item.count}x</span>
                                      </div>`;
                            });
                        h += `</div>`;
                    }
                }
            }

            const dominant = top[0];
            const ratio = total > 0 ? (dominant.count / total) * 100 : 0;
            let label = 'Fokus verteilt';
            let color = SA_CONFIG.COLORS.warn;
            if (ratio >= 24) { label = 'Klarer Fokus'; color = SA_CONFIG.COLORS.success; }
            else if (ratio >= 14) { label = 'Solide Dominanz'; color = SA_CONFIG.COLORS.blue; }

            h += `
                <div style="margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.5rem;">
                        <span style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase;">Fokus-Score</span>
                        <span style="font-weight:700; color:${color};">${label}</span>
                    </div>
                    <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                        <div style="width:${Math.min(100, ratio)}%; height:100%; background:linear-gradient(90deg, #dbeafe, ${color}); transition:width 0.5s;"></div>
                    </div>
                    <div style="margin-top:0.4rem; font-size:0.8rem; color:#94a3b8;">Top-Begriff: <strong style="color:#334155;">${dominant.word}</strong> (${ratio.toFixed(1)}% aller Substantive)</div>
                </div>
                <div style="font-size:0.8rem; color:#64748b; margin-bottom:0.6rem;">Substantive gesamt: <strong>${total}</strong></div>
                <div class="ska-filler-list">`;

            const maxVal = top[0].count || 1;
            top.slice(0, 6).forEach(item => {
                const pct = (item.count / maxVal) * 100;
                h += `<div class="ska-filler-item">
                        <span class="ska-filler-word" style="font-weight:600;">${item.word}</span>
                        <div class="ska-filler-bar-bg"><div class="ska-filler-bar-fill" style="width:${pct}%; background:linear-gradient(90deg, #dbeafe, #1a93ee);"></div></div>
                        <span class="ska-filler-count">${item.count}x</span>
                      </div>`;
            });
            h += `</div>`;
            if (!focusKeywords.length) {
                h += `<div style="margin:0.8rem 0 0.6rem; font-size:0.85rem; color:#94a3b8;">Hinterlege Fokus-Keywords in den Einstellungen, um die Keyword-Dichte (SEO vs. Voice) zu prüfen.</div>`;
            }
            h += this.renderTipSection('keyword_focus', true);
            this.updateCard('keyword_focus', h);
        }

        renderSpreadIndexCard(sentences, active) {
            if(!active) return this.updateCard('spread_index', this.renderDisabledState(), this.bottomGrid, '', '', true);
            if(!sentences || sentences.length < 3) return this.updateCard('spread_index', '<p style="color:#94a3b8; font-size:0.9rem;">Zu wenig Sätze für eine Analyse.</p>');

            const spread = SA_Logic.calculateVariance(sentences);
            let label = 'Ausgewogen';
            let color = SA_CONFIG.COLORS.blue;
            let hint = 'Guter Wechsel zwischen kurzen und langen Sätzen.';
            if (spread < 2.2) {
                label = 'Einschlafgefahr';
                color = SA_CONFIG.COLORS.warn;
                hint = 'Hier einen kurzen Satz einfügen, um den Rhythmus zu brechen.';
            } else if (spread > 5) {
                label = 'Sehr dynamisch';
                color = SA_CONFIG.COLORS.success;
                hint = 'Hohe Varianz – achte darauf, dass der Flow dennoch zusammenhängt.';
            }

            const h = `
                <div style="margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.5rem;">
                        <span style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase;">Standardabweichung</span>
                        <span style="font-weight:700; color:${color};">${label}</span>
                    </div>
                    <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                        <div style="width:${Math.min(100, spread * 12)}%; height:100%; background:linear-gradient(90deg, #e2e8f0, ${color}); transition:width 0.5s;"></div>
                    </div>
                    <div style="margin-top:0.4rem; font-size:0.85rem; color:#334155;">Satz-Spreizungs-Index: <strong>${spread.toFixed(2)}</strong></div>
                </div>
                <div style="font-size:0.85rem; color:#64748b;">${hint}</div>
                ${this.renderTipSection('spread_index', spread < 3)}`;
            this.updateCard('spread_index', h);
        }

        renderPlosiveCard(clusters, active) {
            if(!active) return this.updateCard('plosive', this.renderDisabledState(), this.bottomGrid, '', '', true);
            let h = '';

            if(!clusters || clusters.length === 0) {
                h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">🎙️ Keine Plosiv-Alarmstellen erkannt.</div>`;
            } else {
                h += `<div style="font-size:0.85rem; color:#64748b; margin-bottom:0.8rem;">Gefundene Folgen: <strong>${clusters.length}</strong></div>`;
                const initial = clusters.slice(0, 4);
                const remaining = clusters.slice(4);
                h += `<div class="ska-problem-list">`;
                initial.forEach(cluster => {
                    h += `<div class="ska-problem-item" style="border-left:3px solid #f97316;">
                            ${cluster.phrase}
                            <div class="ska-problem-meta">⚠️ ${cluster.words} Plosive in Folge${cluster.occurrences > 1 ? ` &bull; ${cluster.occurrences}x` : ''}</div>
                          </div>`;
                });
                h += `</div>`;
                if (remaining.length) {
                    h += `<div id="ska-plosive-hidden" class="ska-hidden-content ska-hidden-content--compact">`;
                    h += `<div class="ska-problem-list">`;
                    remaining.forEach(cluster => {
                        h += `<div class="ska-problem-item" style="border-left:3px solid #f97316;">
                                ${cluster.phrase}
                                <div class="ska-problem-meta">⚠️ ${cluster.words} Plosive in Folge${cluster.occurrences > 1 ? ` &bull; ${cluster.occurrences}x` : ''}</div>
                              </div>`;
                    });
                    h += `</div></div>`;
                    h += `<button class="ska-expand-link ska-more-toggle" data-action="toggle-plosive" data-total="${remaining.length}">...und ${remaining.length} weitere anzeigen</button>`;
                }
                h += this.renderTipSection('plosive', true);
            }
            this.updateCard('plosive', h);
        }

        renderArousalCard(data, active) {
            if(!active) return this.updateCard('arousal', this.renderDisabledState(), this.bottomGrid, '', '', true);
            if(!data || data.length === 0) return this.updateCard('arousal', '<p style="color:#94a3b8; font-size:0.9rem;">Zu wenig Text für eine Arousal-Map.</p>');

            const maxScore = Math.max(...data.map(d => d.score));
            const minScore = Math.min(...data.map(d => d.score));
            const range = Math.max(1, maxScore - minScore);
            let h = `<div class="ska-arousal-map">`;
            data.slice(0, 12).forEach(item => {
                const normalized = (item.score - minScore) / range;
                const height = Math.max(10, Math.round(normalized * 100));
                const color = item.score >= 3 ? '#f97316' : (item.score <= -2 ? '#38bdf8' : '#94a3b8');
                h += `<div class="ska-arousal-bar" style="height:${height}%;">
                        <span style="background:${color};"></span>
                      </div>`;
            });
            h += `</div>`;
            h += `<div class="ska-arousal-legend"><span>Low</span><span>High</span></div>`;
            h += this.renderTipSection('arousal', true);
            this.updateCard('arousal', h);
        }

        renderBullshitCard(findings, active) {
            if(!active) return this.updateCard('bullshit', this.renderDisabledState(), this.bottomGrid, '', '', true);
            const keys = Object.keys(findings || {});
            let h = '';
            if(!keys.length) {
                h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">✨ Kein Buzzword-Alarm.</div>`;
            } else {
                const sorted = keys.sort((a, b) => findings[b] - findings[a]);
                h += `<div style="font-size:0.85rem; color:#64748b; margin-bottom:0.8rem;">Gefundene Buzzwords: <strong>${sorted.length}</strong></div>`;
                h += `<div style="display:flex; flex-wrap:wrap; gap:0.35rem;">`;
                sorted.slice(0, 16).forEach(word => {
                    h += `<span class="skriptanalyse-badge" style="background:#fee2e2; color:#b91c1c; border:1px solid #fecaca;">${word} (${findings[word]}x)</span>`;
                });
                h += `</div>`;
                h += this.renderTipSection('bullshit', true);
            }
            this.updateCard('bullshit', h);
        }

        renderMetaphorCard(data, active) {
            if(!active) return this.updateCard('metaphor', this.renderDisabledState(), this.bottomGrid, '', '', true);
            const matches = data.matches || [];
            let h = '';
            if(!matches.length) {
                h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">✨ Keine Klischee-Phrasen entdeckt.</div>`;
            } else {
                h += `<div style="font-size:0.85rem; color:#64748b; margin-bottom:0.8rem;">Gefundene Redewendungen: <strong>${data.total}</strong></div>`;
                h += `<div style="display:flex; flex-wrap:wrap; gap:0.35rem;">`;
                matches.slice(0, 16).forEach(item => {
                    h += `<span class="skriptanalyse-badge" style="background:#eef2ff; color:#4338ca; border:1px solid #c7d2fe;">${item.phrase} (${item.count}x)</span>`;
                });
                h += `</div>`;
                if(matches.length > 16) h += `<div style="margin-top:0.4rem; font-size:0.8rem; color:#94a3b8;">...und ${matches.length - 16} weitere</div>`;
                h += this.renderTipSection('metaphor', true);
            }
            this.updateCard('metaphor', h);
        }

        renderAudienceCard(result, active) {
            if(!active) return this.updateCard('audience', this.renderDisabledState(), this.bottomGrid, '', '', true);
            let h = '';
            if (!this.settings.audienceTarget) {
                h = `<p style="color:#94a3b8; font-size:0.9rem;">Keine Zielgruppe ausgewählt.</p>`;
            } else if (result.status === 'ok') {
                h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">${result.message}</div>`;
            } else {
                h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.warn}; background:#fff7ed; border-radius:8px;">${result.message}</div>`;
                h += this.renderTipSection('audience', true);
            }
            this.updateCard('audience', h);
        }

        renderVerbBalanceCard(data, active) {
            if(!active) return this.updateCard('verb_balance', this.renderDisabledState(), this.bottomGrid, '', '', true);
            const verbs = data.verbs || 0;
            const nouns = data.nouns || 0;
            const ratio = data.ratio || 0;
            let label = 'Ausgewogen';
            let color = SA_CONFIG.COLORS.blue;
            if (nouns > verbs * 1.3) { label = 'Nominalstil-Lastig'; color = SA_CONFIG.COLORS.warn; }
            if (verbs > nouns * 1.3) { label = 'Verben treiben'; color = SA_CONFIG.COLORS.success; }

            const total = verbs + nouns || 1;
            const verbPct = Math.round((verbs / total) * 100);
            const h = `
                <div style="margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.5rem;">
                        <span style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase;">Verb-Fokus</span>
                        <span style="font-weight:700; color:${color};">${label}</span>
                    </div>
                    <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                        <div style="width:${verbPct}%; height:100%; background:linear-gradient(90deg, #dbeafe, ${color}); transition:width 0.5s;"></div>
                    </div>
                    <div style="margin-top:0.4rem; font-size:0.8rem; color:#94a3b8;">Verben: <strong>${verbs}</strong> · Substantive: <strong>${nouns}</strong></div>
                </div>
                ${this.renderTipSection('verb_balance', true)}`;
            this.updateCard('verb_balance', h);
        }

        renderRhetoricalQuestionsCard(data, active) {
            if(!active) return this.updateCard('rhet_questions', this.renderDisabledState(), this.bottomGrid, '', '', true);
            if(!data || data.length === 0) return this.updateCard('rhet_questions', '<p style="color:#94a3b8; font-size:0.9rem;">Zu wenig Text für Fragen-Analyse.</p>');

            const total = data.length;
            const questions = data.filter(item => item.isQuestion);
            const rhetorical = data.filter(item => item.isRhetorical);
            const ratio = total > 0 ? (questions.length / total) * 100 : 0;
            let label = 'Ausgewogen';
            let color = SA_CONFIG.COLORS.blue;
            if (ratio > 40) { label = 'Viele Fragen'; color = SA_CONFIG.COLORS.warn; }
            if (ratio < 10) { label = 'Kaum Fragen'; color = SA_CONFIG.COLORS.muted; }

            let h = `<div class="ska-questions-map">`;
            data.slice(0, 12).forEach(item => {
                const cls = item.isQuestion ? 'is-question' : 'is-normal';
                h += `<span class="ska-question-dot ${cls}"></span>`;
            });
            h += `</div>`;
            h += `<div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b; margin-bottom:0.6rem;">
                    <span>${questions.length} Fragen</span>
                    <span>${label}</span>
                  </div>`;
            const listItems = rhetorical.length ? rhetorical : questions;
            if (listItems.length) {
                const initial = listItems.slice(0, 3);
                const remaining = listItems.slice(3);
                h += `<div class="ska-problem-list">`;
                initial.forEach(item => {
                    h += `<div class="ska-problem-item">${item.sentence}</div>`;
                });
                h += `</div>`;
                if (remaining.length) {
                    h += `<div id="ska-rhet-questions-hidden" class="ska-hidden-content ska-hidden-content--compact">`;
                    h += `<div class="ska-problem-list">`;
                    remaining.forEach(item => {
                        h += `<div class="ska-problem-item">${item.sentence}</div>`;
                    });
                    h += `</div></div>`;
                    h += `<button class="ska-expand-link ska-more-toggle" data-action="toggle-rhet-questions" data-total="${remaining.length}">...und ${remaining.length} weitere anzeigen</button>`;
                }
            }
            h += this.renderTipSection('rhet_questions', true);
            this.updateCard('rhet_questions', h);
        }

        renderDepthCheckCard(data, active) {
            if(!active) return this.updateCard('depth_check', this.renderDisabledState(), this.bottomGrid, '', '', true);
            if(!data || data.length === 0) return this.updateCard('depth_check', '<p style="color:#94a3b8; font-size:0.9rem;">Zu wenig Text für eine Analyse.</p>');
            const deep = data.filter(item => item.isDeep);
            let h = '';
            if (!deep.length) {
                h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">👍 Keine Sprecher-Albträume erkannt.</div>`;
            } else {
                h += `<div style="font-size:0.85rem; color:#64748b; margin-bottom:0.8rem;">Kritische Sätze: <strong>${deep.length}</strong></div>`;
                h += `<div class="ska-problem-list">`;
                deep.slice(0, 3).forEach(item => {
                    h += `<div class="ska-problem-item">"${item.sentence}"<div class="ska-problem-meta">⚠️ ${item.depth} Ebenen</div></div>`;
                });
                h += `</div>`;
                h += this.renderTipSection('depth_check', true);
            }
            this.updateCard('depth_check', h);
        }

        renderSentimentIntensityCard(data, active) {
            if(!active) return this.updateCard('sentiment_intensity', this.renderDisabledState(), this.bottomGrid, '', '', true);
            if(!data || data.length === 0) return this.updateCard('sentiment_intensity', '<p style="color:#94a3b8; font-size:0.9rem;">Zu wenig Text für einen Vibe-Check.</p>');

            const start = data[0]?.score || 0;
            const end = data[data.length - 1]?.score || 0;
            const trend = end - start;
            let trendLabel = 'Stabil';
            if (trend > 0.3) trendLabel = 'Steigende Energie';
            if (trend < -0.3) trendLabel = 'Abkühlend';

            let h = `<div class="ska-intensity-map">`;
            data.slice(0, 12).forEach(item => {
                const val = Math.round((item.score + 1) * 50);
                const color = item.score >= 0.4 ? '#22c55e' : (item.score <= -0.4 ? '#ef4444' : '#94a3b8');
                h += `<div class="ska-intensity-bar" style="height:${Math.max(10, val)}%;">
                        <span style="background:${color};"></span>
                      </div>`;
            });
            h += `</div>`;
            h += `<div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b; margin-bottom:0.6rem;">
                    <span>Start ${start.toFixed(2)}</span>
                    <span>${trendLabel}</span>
                    <span>Ende ${end.toFixed(2)}</span>
                  </div>`;
            h += this.renderTipSection('sentiment_intensity', true);
            this.updateCard('sentiment_intensity', h);
        }

        renderNamingCheckCard(data, active) {
            if(!active) return this.updateCard('naming_check', this.renderDisabledState(), this.bottomGrid, '', '', true);
            if(!data || data.length === 0) {
                return this.updateCard('naming_check', `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">✅ Keine Namens-Inkonsistenzen gefunden.</div>`);
            }
            let h = `<div style="font-size:0.85rem; color:#64748b; margin-bottom:0.8rem;">Ähnliche Namen: <strong>${data.length}</strong></div>`;
            h += `<div class="ska-problem-list">`;
            data.slice(0, 3).forEach(item => {
                h += `<div class="ska-problem-item">${item.first} ↔ ${item.second}<div class="ska-problem-meta">⚠️ Distanz ${item.distance}</div></div>`;
            });
            h += `</div>`;
            h += this.renderTipSection('naming_check', true);
            this.updateCard('naming_check', h);
        }

        renderTeleprompterCard(read, active) {
            if(!active) return this.updateCard('teleprompter', this.renderDisabledState(), this.bottomGrid, '', '', true);
            const wpm = SA_Logic.getWpm(this.settings);
            const secs = (read.speakingWordCount / wpm) * 60;
            const hint = read.wordCount > 0 ? `Scroll-Dauer: ${SA_Utils.formatMin(secs)} (${wpm} WPM)` : 'Zu wenig Text für den Teleprompter.';
            const h = `
                <div style="display:flex; flex-direction:column; gap:0.8rem;">
                    <p style="color:#64748b; font-size:0.9rem; margin:0;">${hint}</p>
                    <button class="ska-btn ska-btn--primary" style="justify-content:center;" data-action="open-teleprompter">Teleprompter öffnen</button>
                </div>
                ${this.renderTipSection('teleprompter', read.wordCount > 0)}`;
            this.updateCard('teleprompter', h);
        }

        renderRedundancyCard(issues, active) {
            if(!active) return this.updateCard('redundancy', this.renderDisabledState(), this.bottomGrid, '', '', true);
            let h = '';
            if(!issues || issues.length === 0) {
                h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">✅ Keine inhaltlichen Dopplungen erkannt.</div>`;
            } else {
                h += `<div style="font-size:0.85rem; color:#64748b; margin-bottom:0.8rem;">Ähnliche Satzfolgen: <strong>${issues.length}</strong></div>`;
                h += `<div class="ska-problem-list">`;
                issues.slice(0, 3).forEach(item => {
                    h += `<div class="ska-problem-item" style="border-left:3px solid #f59e0b;">
                            <div style="font-weight:600; color:#0f172a; margin-bottom:0.35rem;">"${item.first}"</div>
                            <div style="color:#64748b;">"${item.second}"</div>
                            <div class="ska-problem-meta">⚠️ Ähnlichkeit ${(item.similarity * 100).toFixed(0)}%</div>
                          </div>`;
                });
                if (issues.length > 3) {
                    h += `<div style="font-size:0.75rem; color:#94a3b8; text-align:center; margin-top:0.4rem;">...und ${issues.length - 3} weitere</div>`;
                }
                h += `</div>`;
                h += this.renderTipSection('redundancy', true);
            }
            this.updateCard('redundancy', h);
        }

        renderBpmCard(data, active) {
            if(!active) return this.updateCard('bpm', this.renderDisabledState(), this.bottomGrid, '', '', true);
            if(!data || data.bpm === 0) return this.updateCard('bpm', '<p style="color:#94a3b8; font-size:0.9rem;">Zu wenig Text für eine BPM-Empfehlung.</p>');

            const bpm = data.bpm;
            const [min, max] = data.range;
            let paceLabel = 'Ausgewogen';
            let color = SA_CONFIG.COLORS.blue;
            if (bpm < 80) { paceLabel = 'Ruhig'; color = SA_CONFIG.COLORS.success; }
            if (bpm > 110) { paceLabel = 'Dynamisch'; color = SA_CONFIG.COLORS.warn; }

            const h = `
                <div style="margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.5rem;">
                        <span style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase;">Empfohlenes Tempo</span>
                        <span style="font-weight:700; color:${color};">${paceLabel}</span>
                    </div>
                    <div style="font-size:2rem; font-weight:800; color:${SA_CONFIG.COLORS.blue};">${bpm} BPM</div>
                    <div style="font-size:0.85rem; color:#64748b;">Range: ${min}–${max} BPM</div>
                    <div style="margin-top:0.4rem; font-size:0.8rem; color:#94a3b8;">Ø ${data.syllablesPerSecond.toFixed(2)} Silben/Sekunde</div>
                </div>
                ${this.renderTipSection('bpm', true)}`;
            this.updateCard('bpm', h);
        }

        renderEasyLanguageCard(data, active) {
            if(!active) return this.updateCard('easy_language', this.renderDisabledState(), this.bottomGrid, '', '', true);
            const longWords = data.longWords || [];
            const genitives = data.genitives || [];
            const issues = longWords.length + genitives.length;

            let h = '';
            if (issues === 0) {
                h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">🌟 Sehr leicht verständlich.</div>`;
            } else {
                h += `<div style="font-size:0.85rem; color:#64748b; margin-bottom:0.8rem;">Gefundene Hürden: <strong>${issues}</strong></div>`;
                if (longWords.length) {
                    h += `<div class="ska-section-title">Lange Wörter (≥4 Silben)</div>`;
                    h += `<div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-bottom:0.8rem;">`;
                    longWords.slice(0, 12).forEach(item => {
                        h += `<span class="skriptanalyse-badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a;">${item.word} (${item.syllables})</span>`;
                    });
                    h += `</div>`;
                }
                if (genitives.length) {
                    h += `<div class="ska-section-title">Genitiv-Stellen</div>`;
                    h += `<div class="ska-problem-list">`;
                    genitives.slice(0, 2).forEach(g => {
                        h += `<div class="ska-problem-item">${g}</div>`;
                    });
                    h += `</div>`;
                }
                h += this.renderTipSection('easy_language', true);
            }
            this.updateCard('easy_language', h);
        }
        
        renderVocabularyCard(data, active) {
            if(!active) return this.updateCard('vocabulary', this.renderDisabledState(), this.bottomGrid, '', '', true);
            
            const ttr = data.ttr;
            let label = "Ausgewogen";
            let color = SA_CONFIG.COLORS.blue;
            let bg = "#eff6ff";
            
            if (ttr < 40) {
                label = "Repetitiv / Fokussiert";
                 color = SA_CONFIG.COLORS.warn;
                 bg = "#fff7ed";
            } else if (ttr > 60) {
                 label = "Reichhaltig / Literarisch";
                 color = SA_CONFIG.COLORS.success;
                 bg = "#f0fdf4";
            }

            let h = `
                <div style="margin-bottom:1.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.5rem;">
                        <span style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase;">Wort-Vielfalt (TTR)</span>
                        <span style="font-weight:700; color:${color};">${label}</span>
                    </div>
                    <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                        <div style="width:${Math.min(100, ttr)}%; height:100%; background:linear-gradient(90deg, #dbeafe, ${color}); transition:width 0.5s;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:0.4rem; font-size:0.75rem; color:#94a3b8;">
                         <span>${data.unique} einzigartige Wörter</span>
                         <span>${ttr.toFixed(1)}% Ratio</span>
                    </div>
                </div>`;
            
            h += this.renderTipSection('vocabulary', true);
            this.updateCard('vocabulary', h);
        }

        renderRepetitiveStartsCard(issues, active) {
            if(!active) return this.updateCard('start_var', this.renderDisabledState(), this.bottomGrid, '', '', true);
            let h = '';
            if(!issues || issues.length === 0) {
                 h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">👍 Abwechslungsreiche Satzanfänge!</div>`;
            } else {
                 h += `<div class="ska-section-title">Monotone Wiederholungen</div><div class="ska-problem-list">`;
                 issues.forEach(txt => {
                     h += `<div class="ska-problem-item">${txt}</div>`;
                 });
                 h += `</div>`;
                 h += this.renderTipSection('start_var', true);
            }
            this.updateCard('start_var', h);
        }
        
        renderRoleCard(data, active) {
            if(!active) return this.updateCard('role_dist', this.renderDisabledState(), this.bottomGrid, '', '', true);
            
            const roles = Object.keys(data.roles);
            let h = '';
            
            if(roles.length === 0 || (roles.length === 1 && roles[0] === 'Erzähler/Unbekannt')) {
                h = `<p style="color:#64748b; font-size:0.9rem;">Keine spezifischen Rollen (Großbuchstaben am Zeilenanfang) erkannt.</p>`;
            } else {
                h += `<div style="font-size:0.85rem; color:#64748b; margin-bottom:0.8rem;">Gesamtwörter: <strong>${data.total}</strong></div>`;
                h += `<div class="ska-filler-list">`;
                
                // Sort by word count desc
                roles.sort((a,b) => data.roles[b] - data.roles[a]);
                
                roles.forEach(r => {
                    const count = data.roles[r];
                    const pct = data.total > 0 ? (count / data.total) * 100 : 0;
                    h += `<div class="ska-filler-item">
                            <span class="ska-filler-word" style="font-weight:600;">${r}</span>
                            <div class="ska-filler-bar-bg"><div class="ska-filler-bar-fill" style="width:${pct}%; background:linear-gradient(90deg, #dbeafe, #1a93ee);"></div></div>
                            <span class="ska-filler-count">${count} W (${pct.toFixed(0)}%)</span>
                          </div>`;
                });
                h += `</div>`;
                h += this.renderTipSection('role_dist', true);
            }
            this.updateCard('role_dist', h);
        }

        renderNominalChainCard(chains, active) {
            if(!active) return this.updateCard('nominal_chain', this.renderDisabledState(), this.bottomGrid, '', '', true);
            
            let h = '';
            if(!chains || chains.length === 0) {
                 h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">👍 Kein Behördendeutsch-Alarm!</div>`;
            } else {
                 h += `<div class="ska-section-title">Kritische Passagen</div><div class="ska-problem-list">`;
                 chains.forEach(txt => {
                     h += `<div class="ska-problem-item" style="border-left:3px solid #ef4444;">${txt}</div>`;
                 });
                 h += `</div>`;
                 h += this.renderTipSection('nominal_chain', true);
            }
            this.updateCard('nominal_chain', h);
        }

        renderOverview(sec, words, chars, wpm, pause, r) {
            let meterHtml = '';
            let targetStatusHtml = '';

            const traffic = SA_Logic.getTrafficLight(r);
            const scorePct = r ? Math.min(100, Math.max(0, r.score)) : 0;

            // AMPELSLIDER Tied to Flesch Score (Quality indicator)
            meterHtml = `
                <div style="margin: 1.5rem 0 1rem 0;">
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#64748b; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.03em; font-weight:600;">
                        <span>Verständlichkeit</span>
                        <span style="color:${traffic.color}">${traffic.label}</span>
                    </div>
                    <div class="skriptanalyse-meter-scale">
                        <div class="skriptanalyse-meter-marker" style="left:${scorePct}%; background:${traffic.color};"></div>
                    </div>
                </div>`;

            if (this.settings.targetSec > 0) {
                // Calculate Words Delta logic is tricky with SPS, use approximate WPM for delta text or seconds
                const diffSec = this.settings.targetSec - sec;
                const statusColor = diffSec < 0 ? SA_CONFIG.COLORS.error : SA_CONFIG.COLORS.success;
                const statusBg = diffSec < 0 ? '#fee2e2' : '#dcfce7';
                const statusBorder = diffSec < 0 ? '#fecaca' : '#bbf7d0';
                
                let msg = '';
                if(diffSec < 0) msg = `⚠️ Ca. ${Math.abs(Math.round(diffSec))} Sekunden zu lang.`;
                else if(diffSec > 0) msg = `✅ Noch ca. ${Math.round(diffSec)} Sekunden Platz.`;
                else msg = `✅ Punktlandung!`;

                targetStatusHtml = `<div style="color:${statusColor}; font-size:0.8rem; font-weight:600; margin-top:0.8rem; background:${statusBg}; padding:0.6rem; border-radius:8px; text-align:center; border:1px solid ${statusBorder};">${msg}</div>`;
            }
            
            let sCol = (r && r.score > 60) ? SA_CONFIG.COLORS.success : SA_CONFIG.COLORS.warn;
            let maxSCol = (r && r.maxSentenceWords > 30) ? SA_CONFIG.COLORS.warn : SA_CONFIG.COLORS.text;
            let maxSVal = r ? r.maxSentenceWords : 0;

            const isSps = this.settings.timeMode === 'sps';
            const rateLabel = isSps ? `${SA_Logic.getSps(this.settings)} SPS` : `${wpm} WPM`;

            let genreList = '<div class="ska-overview-genre-box"><h4>Sprechdauer im Vergleich</h4><div class="ska-genre-grid-layout">';
            const cP = r ? SA_Utils.getPausenTime(this.getText(), this.settings) : 0;
            const curWord = r ? r.wordCount : 0;
            const curSyl = r ? r.totalSyllables : 0;

            ['werbung', 'imagefilm', 'erklaer', 'hoerbuch', 'podcast', 'ansage', 'elearning', 'social'].forEach(g => {
                 if(g === this.settings.usecase) return;
                 let d = 0;
                 if(isSps) {
                     const gSps = SA_CONFIG.SPS[g];
                     d = (curSyl / gSps) + cP;
                 } else {
                     d = (curWord / SA_CONFIG.WPM[g] * 60) + cP;
                 }
                 genreList += `<div class="ska-genre-item"><span>${SA_CONFIG.GENRE_LABELS[g]||g}</span> <strong>${SA_Utils.formatMin(d)}</strong></div>`;
            });
            genreList += '</div></div>';

            const gLbl = this.settings.usecase !== 'auto' ? (SA_CONFIG.GENRE_LABELS[this.settings.usecase] || this.settings.usecase).toUpperCase() : 'AUTO-DETECT';
            const pauseText = pause > 0 ? ` &bull; ${pause.toFixed(1)}s Pause` : '';
            const genreContext = SA_CONFIG.GENRE_CONTEXT[this.settings.usecase];
            const genreNote = genreContext ? `<div class="ska-genre-context">${genreContext.overviewNote}</div>` : '';

            const trafficBadgeHtml = `<div class="ska-traffic-badge ska-traffic-badge--${traffic.class}">${traffic.label}</div>`;

            let scoreHintHtml = '';
            if (r && r.score < 60 && traffic.class !== 'neutral') {
                let hintText = 'Text vereinfachen.';
                if (r.avgSentence > 15 && r.syllablesPerWord > 1.6) hintText = 'Sätze kürzen & einfachere Wörter nutzen.';
                else if (r.avgSentence > 15) hintText = 'Sätze sind zu lang (Ø > 15 Wörter).';
                else if (r.syllablesPerWord > 1.6) hintText = 'Viele komplexe/lange Wörter.';
                
                scoreHintHtml = `<span class="ska-info-badge ska-info-badge--${traffic.class}"><span class="ska-tool-tooltip">${hintText}</span>INFO</span>`;
            }

            const isManualWpm = this.settings.manualWpm && this.settings.manualWpm > 0;
            const manualLabel = isManualWpm ? `${this.settings.manualWpm} WPM` : 'Auto';
            const sliderValue = isManualWpm ? this.settings.manualWpm : wpm;
            const html = `<div style="display:flex; flex-direction:column; gap:1.5rem; height:100%;">
                <div>
                    <div style="font-size:3.2rem; font-weight:800; color:${SA_CONFIG.COLORS.blue}; line-height:1; letter-spacing:-0.03em;">${SA_Utils.formatMin(sec)} <span style="font-size:1.1rem; font-weight:500; color:#94a3b8; margin-left:-5px;">Min</span></div>
                    <div style="font-size:0.75rem; text-transform:uppercase; color:#64748b; font-weight:700; margin-top:0.4rem; letter-spacing:0.05em; margin-bottom:0.2rem;">SPRECHDAUER &bull; ${gLbl}</div>
                    <div style="font-size:0.8rem; color:#64748b; font-weight:500;">Ø ${rateLabel}${pauseText}</div>
                    ${genreNote}
                </div>
                ${meterHtml}
                ${targetStatusHtml}
                <div class="ska-overview-stats">
                    <div class="ska-stat-item"><span>Wörter</span><strong>${words}</strong></div>
                    <div class="ska-stat-item"><span>Zeichen</span><strong>${chars}</strong></div>
                    <div class="ska-stat-item"><span>Sätze</span><strong>${r ? r.sentences.length : 0}</strong></div>
                    <div class="ska-stat-item"><span>Silben</span><strong>${r ? r.totalSyllables : 0}</strong></div>
                    <div class="ska-stat-item"><span>Längster Satz</span><strong style="color:${maxSCol}">${maxSVal} W</strong></div>
                    <div class="ska-stat-item" style="white-space:nowrap; align-items:center;"><span>Flesch-Index</span><strong style="color:${sCol}; display:flex; align-items:center; gap:6px;">${scoreHintHtml} ${r ? r.score.toFixed(0) : 0}</strong></div>
                </div>
                ${genreList}</div>`;
            
            this.updateCard('overview', html, this.topPanel, 'skriptanalyse-card--overview', trafficBadgeHtml);
        }

        renderDisabledState(id) {
            return `<div class="ska-disabled-state">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p>Analyse pausiert</p>
            </div>`;
        }

        renderTipSection(id, hasIssues) {
            if(!hasIssues) return '';
            const tips = SA_CONFIG.TIPS[id];
            if(!tips || !tips.length) return '';

            if(typeof this.state.tipIndices[id] === 'undefined') this.state.tipIndices[id] = 0;
            
            const cI = this.state.tipIndices[id];
            const tip = tips[cI];
            const tT = tips.length;
            const genreKey = this.settings.usecase !== 'auto' ? this.settings.usecase : this.settings.lastGenre;
            const genreContext = genreKey ? SA_CONFIG.GENRE_CONTEXT[genreKey] : null;
            const cardTemplate = SA_CONFIG.GENRE_CARD_TIPS[id];
            const genreNote = genreContext && cardTemplate
                ? `<div class="ska-tip-genre">${genreContext.tipPrefix}: ${cardTemplate.replace('{focus}', genreContext.tipFocus)}</div>`
                : '';

            return `<div class="ska-card-tips"><div class="ska-tip-header"><span class="ska-tip-badge">💡 Profi-Tipp <span style="opacity:0.6; font-weight:400; margin-left:4px;">${cI+1}/${tT}</span></span><button class="ska-tip-next-btn" data-action="next-tip">Nächster Tipp &rarr;</button></div><p class="ska-tip-content">${tip}</p>${genreNote}</div>`;
        }

        renderGenderCard(issues, active) {
            if(!active) return this.updateCard('gender', this.renderDisabledState(), this.bottomGrid, '', '', true);

            let h = '';
            if(!issues || issues.length === 0) {
                 h = `<div style="text-align:center; padding:1rem; color:#6366f1; background:#eef2ff; border-radius:8px;">🌈 Sprache wirkt inklusiv!</div>`;
            } else {
                h += `<div class="ska-section-title">Gefundene Begriffe</div><div class="ska-problem-list">`;
                const uniqueIssues = [...new Map(issues.map(item => [item.word, item])).values()];
                uniqueIssues.forEach(item => {
                    h += `<div class="ska-problem-item" style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:#ef4444; text-decoration:line-through; opacity:0.8;">${item.word}</span>
                            <span style="font-weight:bold; color:#6366f1;">➔ ${item.suggestion}</span>
                          </div>`;
                });
                h += `</div>`;
                h += this.renderTipSection('gender', true);
            }
            this.updateCard('gender', h);
        }

        renderCharCard(r, raw, active) {
            if(!active) return this.updateCard('char', this.renderDisabledState(), this.bottomGrid, '', '', true);

            const f = (raw.match(/\bsie\b/gi)||[]).length, i = (raw.match(/\bdu\b/gi)||[]).length;
            const addr = f > i ? 'Siezen' : (i > f ? 'Duzen' : 'Neutral');
            
            const sentiment = SA_Logic.analyzeSentiment(raw);
            const audience = SA_Logic.estimateAudience(r.score);

            const col = r.score > 60 ? SA_CONFIG.COLORS.success : (r.score > 40 ? SA_CONFIG.COLORS.warn : SA_CONFIG.COLORS.error);
            const txt = r.score > 60 ? 'Leicht verständlich' : (r.score > 40 ? 'Mittelschwer' : 'Komplex / Schwer');
            
            // Temperature gradient calculation (mapped from -100..100 to 0..100%)
            const tempPct = Math.min(100, Math.max(0, (sentiment.temp + 100) / 2));
            
            const h = `
                <div style="margin-bottom:1.5rem; text-align:center;">
                    <div style="font-size:0.75rem; color:#64748b; margin-bottom:0.3rem;">VERSTÄNDLICHKEIT (Flesch)</div>
                    <div style="font-weight:700; color:${col}; font-size:1.4rem;">${txt}</div>
                    <div style="font-size:0.8rem; opacity:0.7;">Score: ${r.score.toFixed(0)} / 100</div>
                    <div style="width:100%; height:8px; background:#e2e8f0; border-radius:4px; margin-top:0.8rem; overflow:hidden;">
                        <div style="width:${r.score}%; height:100%; background:linear-gradient(90deg, #f1f5f9, ${col}); transition:width 0.5s;"></div>
                    </div>
                </div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; border-top:1px solid #f1f5f9; padding-top:1rem;">
                    <div>
                        <div style="font-size:0.7rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.3rem;">Ansprache</div>
                        <div class="ska-info-badge" style="background:#f1f5f9; color:#475569; font-size:14.4px; padding:4px 10px;">${addr}</div>
                    </div>
                    <div>
                        <div style="font-size:0.7rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.3rem;">Stimmung</div>
                        <div class="ska-info-badge" style="color:${sentiment.color}; background:${sentiment.color}20; font-size:14.4px; padding:4px 10px;">${sentiment.label}</div>
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <div style="font-size:0.7rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.3rem;">Zielgruppe</div>
                        <div style="font-size:0.9rem; font-weight:500; color:#334155;">${audience}</div>
                    </div>
                    <div style="grid-column: 1 / -1; margin-top:0.5rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                             <div style="font-size:0.7rem; text-transform:uppercase; color:#94a3b8; font-weight:700;">Emotionale Farbtemperatur</div>
                             <div style="font-size:0.8rem; font-weight:600; color:${sentiment.color}">${sentiment.label}</div>
                        </div>
                        <div style="position:relative; width:100%; height:12px; background:#e2e8f0; border-radius:6px; overflow:hidden;">
                            <div style="position:absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(90deg, #3b82f6 0%, #e2e8f0 50%, #ef4444 100%); opacity:0.6;"></div>
                            <div style="position:absolute; top:0; bottom:0; left:${tempPct}%; width:4px; background:#0f172a; transform:translateX(-50%); box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.65rem; color:#94a3b8; margin-top:4px;">
                            <span>Kühl / Sachlich</span>
                            <span>Warm / Emotional</span>
                        </div>
                    </div>
                </div>`;
            
            this.updateCard('char', h);
        }

        renderCoachCard(sec, sc, raw, sentences, active) {
            if(!active) return this.updateCard('coach', this.renderDisabledState(), this.bottomGrid, '', '', true);
            
            const wpm = SA_Logic.getWpm(this.settings);
            const variance = SA_Logic.calculateVariance(sentences);
            const tone = SA_Logic.analyzeTone(raw);

            // 1. Dynamics
            let dynText = "Lebendig & Abwechslungsreich";
            let dynCol = SA_CONFIG.COLORS.success;
            if(variance < 2.5) { dynText = "Eher monoton (Satzlängen variieren!)"; dynCol = SA_CONFIG.COLORS.warn; }
            
            // 2. Tempo
            let tempoText = "Optimales Tempo";
            let tempoCol = SA_CONFIG.COLORS.success;
            if(wpm > 165) { tempoText = "Sehr sportlich/schnell"; tempoCol = SA_CONFIG.COLORS.warn; }
            else if(wpm < 125) { tempoText = "Ruhig / Getragen"; tempoCol = SA_CONFIG.COLORS.blue; }

            const genreKey = this.settings.usecase !== 'auto' ? this.settings.usecase : this.settings.lastGenre;
            const genreContext = genreKey ? SA_CONFIG.GENRE_CONTEXT[genreKey] : null;
            const genreCoachNote = genreContext ? `<div class="ska-genre-context">${genreContext.tipPrefix}: ${genreContext.tipFocus}.</div>` : '';
            const h = `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.8rem; margin-bottom:1rem;">
                    <div style="background:#f8fafc; padding:0.8rem; border-radius:8px; border-top:3px solid ${tempoCol}; text-align:center;">
                        <div style="font-size:0.65rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.2rem;">Tempo</div>
                        <div style="font-size:0.8rem; font-weight:600; color:#334155;">${tempoText}</div>
                    </div>
                    <div style="background:#f8fafc; padding:0.8rem; border-radius:8px; border-top:3px solid ${dynCol}; text-align:center;">
                        <div style="font-size:0.65rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.2rem;">Dynamik</div>
                        <div style="font-size:0.8rem; font-weight:600; color:#334155;">${dynText}</div>
                    </div>
                </div>

                <div style="background:#eff6ff; padding:1rem; border-radius:8px; border-left:4px solid ${SA_CONFIG.COLORS.blue}; display:flex; align-items:center; gap:1rem;">
                    <div style="font-size:1.8rem;">${tone.icon}</div>
                    <div>
                        <div style="font-size:0.7rem; text-transform:uppercase; color:#1e40af; font-weight:700;">Sprech-Haltung</div>
                        <div style="font-weight:600; color:#1e3a8a; font-size:0.95rem;">${tone.label}</div>
                    </div>
                </div>
                <div style="margin-top:0.8rem; padding:0.9rem; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0;">
                    <div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Regie-Hilfen</div>
                    <ul style="margin:0; padding-left:1.1rem; color:#475569; font-size:0.85rem; line-height:1.5;">
                        <li>Betonung planen: markiere Schlüsselsätze für klare Peaks.</li>
                        <li>Atmung führen: nach Sinnabschnitten bewusst Pausen setzen.</li>
                        <li>Subtexte notieren: Was soll der Satz beim Hörer auslösen?</li>
                        <li>Tempo variieren: kurze Sätze = Punch, lange Sätze = Atmosphäre.</li>
                    </ul>
                    ${genreCoachNote}
                </div>`;
            
            this.updateCard('coach', h);
        }

        renderPassiveCard(matches, totalWords, active) {
            if(!active) return this.updateCard('passive', this.renderDisabledState(), this.bottomGrid, '', '', true);

            // Calculate rough ratio based on matches count vs sentences/words 
            // Simple heuristic: > 2 passive sentences per 100 words is "too much"
            const scoreVal = Math.max(0, 100 - (matches.length * 15)); 
            
            // Fixed Blue for Text to match style, regardless of score (user preference)
            const col = SA_CONFIG.COLORS.blue; 
            
            let label = "Sehr Aktiv";
            if(scoreVal < 60) label = "Zu Passiv";
            else if(scoreVal < 85) label = "Geht so";

            let h = `
                <div style="margin-bottom:1.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.5rem;">
                        <span style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase;">Stil-Check</span>
                        <span style="font-weight:700; color:${col};">${label}</span>
                    </div>
                    <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                        <div style="width:${scoreVal}%; height:100%; background:linear-gradient(90deg, #eff6ff, ${col}); transition:width 0.5s;"></div>
                    </div>
                </div>`;

            if(!matches.length) {
                 h += `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px; border:1px solid #bbf7d0;">
                        <div style="font-size:1.5rem; margin-bottom:0.2rem;">🚀</div>
                        <div style="font-weight:600; color:#166534;">Perfekt!</div>
                        <div style="font-size:0.8rem; color:#166534;">Keine Passiv-Bremser gefunden.</div>
                       </div>`;
            } else {
                h += `<div class="ska-section-title">Gefundene Phrasen</div><div style="display:flex; flex-wrap:wrap; gap:0.35rem;">`;
                matches.slice(0, 5).forEach(m => {
                    h+=`<div class="skriptanalyse-badge skriptanalyse-badge--passive" style="display:block; width:auto; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m}</div>`;
                });
                h += `</div>`;
                if(matches.length > 5) h += `<div style="font-size:0.75rem; color:#94a3b8; width:100%; text-align:center; margin-top:0.4rem;">...und ${matches.length - 5} weitere</div>`;
                
                h += this.renderTipSection('passive', true);
            }
            this.updateCard('passive', h);
        }

        renderAdjectiveCard(words, totalWords, active) {
            if(!active) return this.updateCard('adjective', this.renderDisabledState(), this.bottomGrid, '', '', true);

            const ratio = totalWords > 0 ? (words.length / totalWords) * 100 : 0;
            let status = 'Optimal';
            let color = SA_CONFIG.COLORS.success;
            if(ratio > 10) { status = 'Sehr blumig'; color = SA_CONFIG.COLORS.error; }
            else if(ratio > 6) { status = 'Viele Adjektive'; color = SA_CONFIG.COLORS.warn; }

            let h = `
                <div style="margin-bottom:1.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.5rem;">
                        <span style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase;">Dichte-Check</span>
                        <span style="font-weight:700; color:${color};">${status} (${ratio.toFixed(1)}%)</span>
                    </div>
                    <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                        <div style="width:${Math.min(100, ratio * 5)}%; height:100%; background:linear-gradient(90deg, #fce7f3, ${color}); transition:width 0.5s;"></div>
                    </div>
                </div>`;

            if(!words.length) {
                 h += `<p style="color:#64748b; font-size:0.9rem;">Keine auffälligen Adjektive gefunden.</p>`;
            } else {
                h += `<div class="ska-section-title">Gefundene Wörter</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem;">`;
                words.slice(0, 20).forEach(w => {
                    h+=`<span class="skriptanalyse-badge" style="background:#fdf2f8; color:#be185d; border:1px solid #fbcfe8;">${w}</span>`;
                });
                h += `</div>`;
                if(words.length > 20) h += `<span style="font-size:0.8rem; color:#94a3b8; align-self:center;">...und ${words.length - 20} weitere</span>`;
                h += this.renderTipSection('adjective', true);
            }
            this.updateCard('adjective', h);
        }

        renderFillerCard(fillers, active) {
            if(!active) return this.updateCard('fillers', this.renderDisabledState(), this.bottomGrid, '', '', true);

            // Sort by Impact (Weight * Count) desc
            const k = Object.keys(fillers).sort((a,b) => (fillers[b].count * fillers[b].weight) - (fillers[a].count * fillers[a].weight));
            let h = '';
            h += `<div style="display:flex; justify-content:flex-end; margin-bottom:0.75rem;">
                    <button class="ska-btn ska-btn--secondary" data-action="crunch-fillers" ${k.length ? '' : 'disabled'}>Füllwörter markieren & löschen</button>
                  </div>`;
            
            if(!k.length) {
                h += `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">✨ Sauber!</div>`;
            } else {
                const maxVal = k.length > 0 ? (fillers[k[0]].count * fillers[k[0]].weight) : 1;
                h += '<div class="ska-filler-list">';
                k.forEach(w => { 
                    const item = fillers[w];
                    const impact = item.count * item.weight;
                    const p = (impact / maxVal) * 100; 

                    h += `<div class="ska-filler-item" title="Gewichtung: ${item.weight}">
                            <span class="ska-filler-word">${w}</span>
                            <div class="ska-filler-bar-bg"><div class="ska-filler-bar-fill" style="width:${p}%; background:linear-gradient(90deg, #dbeafe, #1a93ee);"></div></div>
                            <span class="ska-filler-count">${item.count}x</span>
                          </div>`; 
                });
                h += '</div>';
                h += this.renderTipSection('fillers', true);
            }
            this.updateCard('fillers', h);
        }

        renderNominalCard(words, active) {
            if(!active) return this.updateCard('nominal', this.renderDisabledState(), this.bottomGrid, '', '', true);

            let h = '';
            if(!words.length) {
                 h = `<p style="color:#64748b; font-size:0.9rem;">Kein auffälliger Nominalstil.</p>`;
            } else {
                h += `<div class="ska-section-title">Gefundene Wörter</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem;">`;
                words.forEach(w => {
                    h+=`<span class="skriptanalyse-badge skriptanalyse-badge--nominal">${w}</span>`;
                });
                h += `</div>`;
                h += this.renderTipSection('nominal', true);
            }
            this.updateCard('nominal', h);
        }

        renderAnglicismCard(words, active) {
            if(!active) return this.updateCard('anglicism', this.renderDisabledState(), this.bottomGrid, '', '', true);

            let h = '';
            if(!words.length) {
                 h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">🇩🇪 Rein deutsch!</div>`;
            } else {
                h += `<div class="ska-section-title">Gefundene Begriffe</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem;">`;
                words.forEach(w => {
                    h+=`<span class="skriptanalyse-badge skriptanalyse-badge--anglicism">${w}</span>`;
                });
                h += `</div>`;
                h += this.renderTipSection('anglicism', true);
            }
            this.updateCard('anglicism', h);
        }

        renderBreathCard(killers, active) {
            if(!active) return this.updateCard('breath', this.renderDisabledState(), this.bottomGrid, '', '', true);

            let h = '';
            if(!killers || killers.length === 0) {
                 h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">🫁 Alles flüssig!</div>`;
            } else {
                h += `<div style="font-size:0.85rem; color:#64748b; margin-bottom:0.8rem;">Gefundene Stellen: <strong>${killers.length}</strong></div><div class="ska-problem-list">`;
                const renderItem = (k) => {
                    let reasons = [];
                    if(k.words > 25) reasons.push(`${k.words} Wörter`);
                    if(k.commas >= 4) reasons.push(`${k.commas} Kommas`);
                    if(k.hardSegment) reasons.push(`Keine Pause / Atemnot`);
                    return `<div class="ska-problem-item">${k.text.replace(/(\r\n|\n|\r)/gm, " ")}<div class="ska-problem-meta">⚠️ ${reasons.join(' &bull; ')}</div></div>`;
                };
                killers.slice(0, 3).forEach(k => { h += renderItem(k); });
                if(killers.length > 3) {
                    const hiddenCount = killers.length - 3;
                    h += `<div id="ska-breath-hidden" class="ska-hidden-content ska-hidden-content--compact">`;
                    killers.slice(3).forEach(k => { h += renderItem(k); });
                    h += `</div><button class="ska-expand-link ska-more-toggle" data-action="toggle-breath-more" data-total="${hiddenCount}">...und ${hiddenCount} weitere anzeigen</button>`;
                }
                h += `</div>`;
                h += this.renderTipSection('breath', true);
            }
            this.updateCard('breath', h);
        }

        renderEchoCard(words, active) {
            if(!active) return this.updateCard('echo', this.renderDisabledState(), this.bottomGrid, '', '', true);

            let h = '';
            if(!words.length) {
                 h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">✨ Abwechslungsreich!</div>`;
            } else {
                h += `<div class="ska-section-title">Gefundene Wiederholungen</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem;">`;
                words.forEach(w => {
                    h+=`<span class="skriptanalyse-badge skriptanalyse-badge--echo">${w}</span>`;
                });
                h += `</div>`;
                h += this.renderTipSection('echo', true);
            }
            this.updateCard('echo', h);
        }

        renderStumbleCard(s, active) {
            if(!active) return this.updateCard('stumble', this.renderDisabledState(), this.bottomGrid, '', '', true);

            let h = '';
            const hasIssues = (s.long.length > 0 || s.camel.length > 0 || s.phonetic.length > 0 || s.alliter.length > 0);

            if(!hasIssues) h = `<p style="color:#64748b; font-size:0.9rem;">Keine Auffälligkeiten.</p>`;
            else {
                if(s.phonetic.length) { 
                    h += `<div class="ska-section-title">Zungenbrecher</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:0.8rem;">`; 
                    s.phonetic.forEach(w => {
                        h+=`<span class="skriptanalyse-badge" style="background:#f3e8ff; color:#6b21a8; border:1px solid #e9d5ff;">${w}</span>`;
                    });
                    h+='</div>'; 
                }
                if(s.camel.length) { 
                    h += `<div class="ska-section-title">Fachbegriffe</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:0.8rem;">`; 
                    s.camel.forEach(w => {
                        h+=`<span class="skriptanalyse-badge skriptanalyse-badge--camel">${w}</span>`;
                    });
                    h+='</div>'; 
                }
                if(s.long.length) { 
                    h += `<div class="ska-section-title">Lange Wörter</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:0.8rem;">`; 
                    s.long.forEach(w => {
                        h+=`<span class="skriptanalyse-badge skriptanalyse-badge--long">${w}</span>`;
                    });
                    h+='</div>'; 
                }
                if(s.alliter.length) {
                    h += `<div class="ska-section-title">Zungenbrecher & Alliterationen</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:0.8rem;">`; 
                    s.alliter.forEach(w => {
                        h+=`<span class="skriptanalyse-badge" style="background:#fff1f2; color:#be123c; border:1px solid #fda4af;">${w}</span>`;
                    });
                    h+='</div>'; 
                }
                h += this.renderTipSection('stumble', true);
            }
            this.updateCard('stumble', h);
        }

        renderCtaCard(raw, active) {
            if(!active) return this.updateCard('cta', this.renderDisabledState(), this.bottomGrid, '', '', true);
            
            const ctaData = SA_Logic.analyzeCtaFocus(raw);
            const globalCount = ctaData.all.length;
            const endCount = ctaData.end.length;
            
            let h = '';
            
            if (endCount > 0) {
                // Perfect scenario
                h += `<div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:0.8rem; border-radius:8px; margin-bottom:1rem;">
                        <div style="font-weight:600; color:#166534; display:flex; align-items:center; gap:6px;">✅ Starker Abschluss</div>
                        <p style="margin:0.4rem 0 0 0; font-size:0.85rem; color:#166534;">CTA in den letzten 10% gefunden: <strong>${ctaData.end[0]}</strong></p>
                      </div>`;
            } else if (globalCount > 0) {
                // Found but not at end
                h += `<div style="background:#fff7ed; border:1px solid #fed7aa; padding:0.8rem; border-radius:8px; margin-bottom:1rem;">
                        <div style="font-weight:600; color:#9a3412; display:flex; align-items:center; gap:6px;">⚠️ Verstecktes Potenzial</div>
                        <p style="margin:0.4rem 0 0 0; font-size:0.85rem; color:#9a3412;">${globalCount} Signale gefunden, aber keines am Ende. Schiebe den CTA in die "Hotzone" (letzte 10%).</p>
                      </div>`;
            } else {
                h += `<p style="font-size:0.9rem; color:#ea580c;">⚠️ Keine klare Handlungsaufforderung gefunden.</p>`;
            }

            if(globalCount > 0) {
                h += `<div class="ska-section-title">Gefundene Signale (Gesamt)</div><div style="display:flex; gap:0.35rem; flex-wrap:wrap;">`; 
                ctaData.all.forEach(x => h += `<span class="skriptanalyse-badge skriptanalyse-badge--cta">${x}</span>`);
                h += `</div>`;
            }
            
            h += this.renderTipSection('cta', true);
            this.updateCard('cta', h);
        }

        renderMarkerCard(s, active) {
            if(!active) return this.updateCard('marker', this.renderDisabledState(), this.bottomGrid, '', '', true);
            
            let h = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                        <p style="font-size:0.85rem; color:#64748b; margin:0;">Struktur-Vorschlag:</p>
                        <button class="ska-tool-btn" style="font-size:0.75rem; padding:4px 8px; display:inline-flex; align-items:center; justify-content:center; line-height:1;" data-action="export-marker-json">📍 DAW-Marker exportieren (.json)</button>
                     </div>`;
            
            if(s.length < 2) {
                h += '<p style="color:#94a3b8; font-size:0.9rem;">Zu wenig Text.</p>';
            } else {
                h += `<div style="font-family:monospace; background:#f8fafc; padding:0.8rem; border-radius:6px; font-size:0.85rem; color:#334155; border:1px solid #e2e8f0;">${s[0].replace(/[,]/g,', | ').replace(/ und /g,' und | ')} ...</div>`;
            }
            this.updateCard('marker', h);
        }

        renderRhythmCard(sentences, maxW, active) {
            if(!active) return this.updateCard('rhythm', this.renderDisabledState(), this.bottomGrid, '', '', true);
            if(!sentences || sentences.length < 3) return this.updateCard('rhythm', '<p style="color:#94a3b8; font-size:0.9rem;">Zu wenig Sätze für eine Analyse.</p>');

            let h = `<div class="ska-rhythm-section"><div style="height:100px; display:flex; align-items:flex-end; gap:2px; margin-bottom:2px; border-bottom:1px solid #e2e8f0; padding-bottom:2px;">`;
            
            // Limit to last 40 sentences for readability
            const slice = sentences.length > 40 ? sentences.slice(sentences.length - 40) : sentences;
            
            slice.forEach((s, idx) => {
                const words = s.trim().split(/\s+/);
                const len = words.length;
                const hPct = Math.max(10, Math.min(100, (len / 30) * 100)); // Cap at 30 words visual max
                let col = '#cbd5e1';
                if(len > 25) col = '#fca5a5'; // Red-ish for long
                else if(len < 8) col = '#86efac'; // Green-ish for short
                else col = '#93c5fd'; // Blue-ish for medium
                
                // Escape sentence for data-attribute
                const safeSentence = s.trim().replace(/"/g, '&quot;');
                h += `<div class="ska-rhythm-bar" data-words="${len}" data-sentence="${safeSentence}" style="flex:1; background:${col}; height:${hPct}%; border-radius:2px 2px 0 0;"></div>`;
            });
            h += `</div><div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600; color:#94a3b8; margin-top:0px;"><span>Start</span><span>Ende</span></div>`;
            
            // ADD PREVIEW BOX
            h += `<div class="ska-rhythm-preview" id="ska-preview-rhythm">Balkendiagramm mit der Maus überfahren...</div></div>`;

            const spreadIndex = SA_Logic.calculateVariance(sentences);
            let spreadLabel = 'Ausgewogen';
            let spreadColor = SA_CONFIG.COLORS.blue;
            if (spreadIndex < 2.2) { spreadLabel = 'Sehr gleichmäßig'; spreadColor = SA_CONFIG.COLORS.warn; }
            else if (spreadIndex > 6) { spreadLabel = 'Stark variierend'; spreadColor = SA_CONFIG.COLORS.success; }
            h += `
                <div style="margin-top:0.75rem; padding:0.75rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">
                        <span>Satz-Spreizungs-Index</span>
                        <span style="color:${spreadColor}; font-weight:700;">${spreadLabel}</span>
                    </div>
                    <div style="margin-top:0.4rem; font-size:0.9rem; color:#334155;">${spreadIndex.toFixed(2)}</div>
                </div>`;

            h += this.renderTipSection('rhythm', true);
            this.updateCard('rhythm', h);

            // BIND HOVER LOGIC TO BARS
            const card = this.bottomGrid.querySelector('[data-card-id="rhythm"]');
            if(card) {
                 const preview = card.querySelector('#ska-preview-rhythm');
                 const bars = card.querySelectorAll('.ska-rhythm-bar');
                 bars.forEach(b => {
                     b.onmouseenter = () => {
                         preview.textContent = `"${b.dataset.sentence}"`;
                         preview.classList.add('is-active');
                     };
                     b.onmouseleave = () => {
                         preview.textContent = 'Balkendiagramm mit der Maus überfahren...';
                         preview.classList.remove('is-active');
                     };
                 });
            }
        }

        renderDialogCard(d, active) {
            if(!active) return this.updateCard('dialog', this.renderDisabledState(), this.bottomGrid, '', '', true);

            const ratio = d.ratio; 
            const col = SA_CONFIG.COLORS.blue;
            
            let label = "Ausgewogen";
            if(ratio > 70) label = "Sehr viel Dialog";
            else if(ratio < 10) label = "Hauptsächlich Erzähler";

            let h = `
                <div style="margin-bottom:1.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.5rem;">
                        <span style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase;">Verteilung</span>
                        <span style="font-weight:700; color:${col};">${ratio.toFixed(0)}% Dialog</span>
                    </div>
                    <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                        <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #eff6ff, ${col}); transition:width 0.5s;"></div>
                    </div>
                </div>`;

            h += `<div style="display:flex; gap:1rem; margin-bottom:0.8rem;">
                    <div style="flex:1; background:#f8fafc; padding:0.6rem; border-radius:8px; text-align:center; border:1px solid #e2e8f0;">
                        <div style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Dialog-Passagen</div>
                        <div style="font-weight:700; color:#334155; font-size:1.1rem;">${d.count}</div>
                    </div>
                    <div style="flex:1; background:#f8fafc; padding:0.6rem; border-radius:8px; text-align:center; border:1px solid #e2e8f0;">
                        <div style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Erzähler-Anteil</div>
                        <div style="font-weight:700; color:#334155; font-size:1.1rem;">${(100 - ratio).toFixed(0)}%</div>
                    </div>
                  </div>`;
            
            h += this.renderTipSection('dialog', true);
            this.updateCard('dialog', h);
        }

        renderComparison(sec, w, sc) {
            const oldRaw = this.state.savedVersion;
            const oldRead = SA_Logic.analyzeReadability(oldRaw, this.settings);
            const oldWpm = SA_Logic.getWpm(this.settings);
            const oldSec = (oldRead.speakingWordCount / oldWpm * 60) + SA_Utils.getPausenTime(oldRaw, this.settings);
            
            const curRead = SA_Logic.analyzeReadability(this.getText(), this.settings);
            const curWpm = SA_Logic.getWpm(this.settings);
            
            // Helper to get total weight for comparison
            const getFillerWeight = (fillers) => {
                return Object.keys(fillers).reduce((acc, word) => acc + (fillers[word].count * fillers[word].weight), 0);
            };

            const countObj = (r, raw) => ({
                fillers: getFillerWeight(SA_Logic.findFillers(r.cleanedText)),
                passive: SA_Logic.findPassive(r.cleanedText).length,
                stumbles: (() => { const s = SA_Logic.findStumbles(raw); return s.long.length + s.camel.length + s.phonetic.length; })()
            });

            const oldMetrics = { ...countObj(oldRead, oldRaw), score: oldRead.score, words: oldRead.wordCount, time: oldSec };
            const curMetrics = { ...countObj(curRead, this.getText()), score: parseFloat(sc), words: w, time: sec };

            const createDeltaPill = (v, label, betterIsLower = true) => {
                let cls = 'ska-pill--neutral';
                if (Math.abs(v) > 0.01) {
                    const better = betterIsLower ? (v < 0) : (v > 0);
                    cls = better ? 'ska-pill--pos' : 'ska-pill--neg';
                }
                // For floats like weight, round carefully
                const displayV = Math.abs(v) < 10 ? v.toFixed(1) : Math.round(v);
                return `<span class="ska-pill ${cls}">${v > 0 ? '+' : ''}${displayV} ${label}</span>`;
            };

            const neutralRow = (label, val, unit = '') => `<div class="ska-compare-attr-row" style="color: #64748b;"><span>${label}</span><strong>${val}${unit}</strong></div>`;
            const attrRow = (label, cur, old, unit = '', betterIsLower = true) => {
                const color = (Math.abs(cur - old) < 0.01) ? '#64748b' : ((betterIsLower ? cur < old : cur > old) ? SA_CONFIG.COLORS.success : SA_CONFIG.COLORS.error);
                // For filler weight which is a float
                const displayCur = (typeof cur === 'number' && cur % 1 !== 0) ? cur.toFixed(1) : cur;
                return `<div class="ska-compare-attr-row" style="color: ${color};"><span>${label}</span><strong>${displayCur}${unit}</strong></div>`;
            };

            let targetFazitHtml = '';
            if (this.settings.targetSec > 0) {
                // Adjust fazit logic for SPS if needed, but seconds comparison is safer
                const diffSec = this.settings.targetSec - sec;
                if (diffSec < 0) {
                    targetFazitHtml = `<span class="ska-pill ska-pill--neg">${Math.abs(Math.round(diffSec))}s zu lang</span>`;
                } else if (diffSec > 0) {
                    targetFazitHtml = `<span class="ska-pill ska-pill--pos">${Math.round(diffSec)}s Spielraum</span>`;
                } else {
                    targetFazitHtml = `<span class="ska-pill ska-pill--pos">Punktlandung!</span>`;
                }
            }

            this.compareRow.innerHTML = `
                <div class="skriptanalyse-card" style="width:100%; border-color:#93c5fd;">
                    <div class="ska-card-header"><h3>${SA_CONFIG.CARD_TITLES.compare}</h3></div>
                    <div class="ska-card-body">
                        <div class="skriptanalyse-compare-grid">
                            <div style="background:#f8fafc; padding:1.2rem; border-radius:12px; border:1px solid #e2e8f0;">
                                <div style="font-size:0.7rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.8rem; letter-spacing:0.05em;">Gespeichert</div>
                                <div style="font-weight:700; font-size:1.6rem; color:#64748b; line-height:1; margin-bottom:1rem;">${SA_Utils.formatMin(oldMetrics.time)}</div>
                                ${neutralRow('Wörter', oldMetrics.words)}
                                ${neutralRow('Lesbarkeit', oldMetrics.score.toFixed(0))}
                                ${neutralRow('Füllwort-Last', oldMetrics.fillers.toFixed(1))}
                                ${neutralRow('Passiv-Formen', oldMetrics.passive)}
                                ${neutralRow('Stolpersteine', oldMetrics.stumbles)}
                            </div>
                            <div style="background:#fff; border:2px solid #1a93ee; padding:1.2rem; border-radius:12px; box-shadow: 0 4px 15px rgba(26,147,238,0.1);">
                                <div style="font-size:0.7rem; text-transform:uppercase; color:#1a93ee; font-weight:700; margin-bottom:0.8rem; letter-spacing:0.05em;">Aktuell</div>
                                <div style="font-weight:800; font-size:1.6rem; color:#0f172a; line-height:1; margin-bottom:1rem;">${SA_Utils.formatMin(curMetrics.time)}</div>
                                ${attrRow('Wörter', curMetrics.words, oldMetrics.words)}
                                ${attrRow('Lesbarkeit', curMetrics.score.toFixed(0), oldMetrics.score, '', false)}
                                ${attrRow('Füllwort-Last', curMetrics.fillers, oldMetrics.fillers)}
                                ${attrRow('Passiv-Formen', curMetrics.passive, oldMetrics.passive)}
                                ${attrRow('Stolpersteine', curMetrics.stumbles, oldMetrics.stumbles)}
                            </div>
                        </div>
                        <div style="margin-top:1.5rem; display:flex; gap:1.5rem; align-items:center; font-size:0.9rem; padding-top:1.2rem; border-top:1px dashed #e2e8f0;">
                            <strong style="color:#64748b;">Änderungen:</strong> 
                            <div style="display:flex; gap:0.6rem; flex-wrap:wrap; flex:1;">
                                ${createDeltaPill(curMetrics.time - oldMetrics.time, 's Zeit')}
                                ${createDeltaPill(curMetrics.words - oldMetrics.words, 'Wörter')}
                                ${createDeltaPill(curMetrics.score - oldMetrics.score, 'Score', false)}
                                ${createDeltaPill(curMetrics.fillers - oldMetrics.fillers, 'Last')}
                                ${targetFazitHtml}
                            </div>
                        </div>
                    </div>
                </div>`;
            this.compareRow.classList.add('is-active');
        }

        updateCard(id, html, parent = this.bottomGrid, extraClass = '', headerExtraHtml = '', isToggleable = true) {
            if (!parent) return; 
            let card = parent.querySelector(`[data-card-id="${id}"]`);
            const isExcluded = this.state.excludedCards.has(id);
            const toggleStateClass = isExcluded ? 'is-off' : 'is-on';

            const toggleIcon = isExcluded 
                ? `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color:#94a3b8"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>` 
                : `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color:#16a34a"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

            const toggleBtnHtml = (id !== 'overview' && isToggleable) ? `<button class="ska-whitelist-toggle ${toggleStateClass}" title="${isExcluded ? 'Analyse aktivieren' : 'Analyse deaktivieren'}">${toggleIcon}</button>` : '';

            // UPDATED HEADER WITH INFO BADGE
            const infoText = SA_CONFIG.CARD_DESCRIPTIONS[id];
            const infoHtml = infoText ? `<div class="ska-card-info-icon">
                <span class="ska-info-dot">i</span>
                <div class="ska-card-info-tooltip">${infoText}</div>
            </div>` : '';

            const buildHeader = () => {
                return `<div class="ska-card-header">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <h3>${SA_CONFIG.CARD_TITLES[id]}</h3>
                                ${infoHtml}
                            </div>
                            <div style="display:flex; gap:0.5rem; align-items:center;">
                                ${headerExtraHtml}${toggleBtnHtml}${id!=='overview' ? '<button class="ska-hide-btn" title="Ausblenden"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></button>' : ''}
                            </div>
                        </div>`;
            };

            if(!card) {
                card = document.createElement('div'); 
                card.className = `skriptanalyse-card ${extraClass||''}`; 
                card.dataset.cardId = id;
                card.classList.toggle('is-minimized', false);
                if(!this.isRestoring) { card.classList.add('ska-animate-enter'); }
                let h = ''; if(SA_CONFIG.CARD_TITLES[id]) h = buildHeader();
                
                // IMPORTANT: Use Flex column to allow sticky footer
                const b = document.createElement('div'); 
                b.className = 'ska-card-body'; 
                b.style.display = 'flex';
                b.style.flexDirection = 'column';
                b.style.flex = '1';
                b.innerHTML = html; 
                
                // HEADER FIRST, THEN BODY
                card.innerHTML = h;
                card.appendChild(b);
                
                parent.appendChild(card);
            } else {
                 card.classList.toggle('is-minimized', false);
                 const body = card.querySelector('.ska-card-body');
                 body.innerHTML = html;
                 // Re-apply flex style just in case
                 body.style.display = 'flex';
                 body.style.flexDirection = 'column';
                 body.style.flex = '1';

                 if(SA_CONFIG.CARD_TITLES[id]) {
                     const oldHeader = card.querySelector('.ska-card-header');
                     if(oldHeader) oldHeader.outerHTML = buildHeader();
                 }
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('.skriptanalyse-app').forEach(el => new SkriptAnalyseWidget(el)));
})();
