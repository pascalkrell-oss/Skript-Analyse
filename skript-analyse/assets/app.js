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
        UI_KEY_PLAN: 'skriptanalyse_plan_mode',
        UI_KEY_UPGRADE_DISMISSED: 'skriptanalyse_upgrade_dismissed',
        SAVED_VERSION_KEY: 'skriptanalyse_saved_version_v1',
        PRO_MODE: Boolean(window.SKA_CONFIG_PHP && SKA_CONFIG_PHP.pro),
        IS_ADMIN: Boolean(window.SKA_CONFIG_PHP && SKA_CONFIG_PHP.isAdmin),
        IS_LOGGED_IN: Boolean(window.SKA_CONFIG_PHP && SKA_CONFIG_PHP.isLoggedIn),
        WORKER_TEXT_THRESHOLD: 12000,
        FREE_TEXT_LIMIT: 20000,
        COLORS: { success: '#16a34a', warn: '#ea580c', error: '#dc2626', blue: '#1a93ee', text: '#0f172a', muted: '#94a3b8', disabled: '#cbd5e1' },
        
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
        PROFILE_CARDS: {
            sprecher: ['overview', 'char', 'rhythm', 'syllable_entropy', 'chapter_calc', 'coach', 'pronunciation', 'plosive', 'breath', 'pacing', 'teleprompter', 'bpm', 'rhet_questions'],
            autor: ['overview', 'char', 'vocabulary', 'keyword_focus', 'verb_balance', 'rhet_questions', 'depth_check', 'sentiment_intensity', 'redundancy', 'bullshit', 'metaphor', 'audience', 'easy_language', 'adverb', 'chapter_calc', 'syllable_entropy', 'compliance_check'],
            regie: ['overview', 'char', 'coach', 'role_dist', 'dialog', 'marker', 'pacing', 'teleprompter', 'bpm', 'breath', 'chapter_calc', 'syllable_entropy'],
            agentur: ['overview', 'char', 'keyword_focus', 'vocabulary', 'bullshit', 'metaphor', 'audience', 'cta', 'adjective', 'adverb', 'anglicism', 'echo', 'chapter_calc', 'syllable_entropy', 'compliance_check'],
            marketing: ['overview', 'char', 'keyword_focus', 'cta', 'bullshit', 'metaphor', 'audience', 'vocabulary', 'adjective', 'adverb', 'echo', 'anglicism', 'chapter_calc', 'syllable_entropy', 'compliance_check']
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
            marker: 'Hilft dir, den Text visuell zu strukturieren und Audio-Marker zu exportieren.',
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
            bullshit: 'Findet Buzzwords und hohle Phrasen im Text.',
            metaphor: 'Zählt bekannte Redewendungen, um Klischees sichtbar zu machen.',
            audience: 'Prüft den Text gegen den gewählten Zielgruppen-Level.',
            verb_balance: 'Vergleicht Verben und Substantive für mehr Handlungsfokus.',
            rhet_questions: 'Zeigt die Verteilung rhetorischer Fragen im Text.',
            depth_check: 'Markiert Sätze mit zu vielen Nebensatz-Ebenen.',
            sentiment_intensity: 'Zeigt den emotionalen Vibe-Verlauf im Skript.',
            compliance_check: 'Prüft, ob Pflichtpassagen exakt im Skript enthalten sind.'
        },

        CARD_ORDER: ['char', 'rhythm', 'coach', 'chapter_calc', 'syllable_entropy', 'keyword_focus', 'role_dist', 'pronunciation', 'plosive', 'easy_language', 'redundancy', 'bullshit', 'metaphor', 'audience', 'rhet_questions', 'depth_check', 'start_var', 'compliance_check', 'pacing', 'breath', 'stumble', 'gender', 'echo', 'adjective', 'adverb', 'passive', 'fillers', 'nominal', 'nominal_chain', 'anglicism', 'marker', 'cta', 'sentiment_intensity', 'verb_balance', 'bpm', 'vocabulary', 'dialog', 'teleprompter'],
        PREMIUM_CARDS: [
            'rhythm',
            'syllable_entropy',
            'plosive',
            'redundancy',
            'depth_check',
            'sentiment_intensity',
            'teleprompter',
            'pacing',
            'chapter_calc',
            'role_dist',
            'bpm',
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
            'marker',
            'pronunciation'
        ],
        PREMIUM_TEASERS: ['teleprompter', 'pacing', 'syllable_entropy', 'keyword_focus', 'bpm', 'rhythm'],

        GENRE_CARDS: {
            werbung: ['char', 'coach', 'cta', 'adjective', 'adverb', 'keyword_focus', 'bullshit', 'metaphor', 'bpm', 'vocabulary', 'rhythm', 'syllable_entropy', 'pacing', 'echo', 'passive', 'fillers', 'anglicism', 'start_var', 'compliance_check', 'dialog', 'teleprompter'],
            imagefilm: ['char', 'coach', 'rhythm', 'syllable_entropy', 'breath', 'pacing', 'teleprompter', 'bpm', 'vocabulary', 'metaphor', 'pronunciation', 'plosive', 'compliance_check', 'dialog'],
            erklaer: ['char', 'coach', 'rhythm', 'syllable_entropy', 'verb_balance', 'easy_language', 'depth_check', 'audience', 'keyword_focus', 'pronunciation', 'stumble', 'pacing', 'compliance_check', 'sentiment_intensity', 'dialog', 'teleprompter', 'bpm', 'vocabulary'],
            hoerbuch: ['char', 'rhythm', 'syllable_entropy', 'chapter_calc', 'coach', 'breath', 'pacing', 'teleprompter', 'pronunciation', 'plosive', 'stumble', 'dialog', 'bpm', 'vocabulary', 'compliance_check', 'sentiment_intensity', 'verb_balance'],
            podcast: ['char', 'coach', 'rhythm', 'syllable_entropy', 'dialog', 'pacing', 'teleprompter', 'breath', 'bpm', 'vocabulary', 'pronunciation', 'compliance_check', 'sentiment_intensity', 'verb_balance'],
            ansage: ['char', 'coach', 'rhythm', 'syllable_entropy', 'pacing', 'teleprompter', 'pronunciation', 'stumble', 'breath', 'bpm', 'vocabulary', 'compliance_check', 'sentiment_intensity', 'verb_balance', 'dialog'],
            elearning: ['char', 'coach', 'rhythm', 'syllable_entropy', 'easy_language', 'audience', 'verb_balance', 'pacing', 'teleprompter', 'pronunciation', 'stumble', 'compliance_check', 'sentiment_intensity', 'bpm', 'vocabulary', 'dialog'],
            social: ['char', 'coach', 'cta', 'keyword_focus', 'bullshit', 'metaphor', 'bpm', 'vocabulary', 'rhythm', 'syllable_entropy', 'pacing', 'adjective', 'adverb', 'echo', 'anglicism', 'start_var', 'compliance_check', 'dialog', 'teleprompter', 'sentiment_intensity', 'verb_balance'],
            buch: ['char', 'rhythm', 'syllable_entropy', 'dialog', 'vocabulary', 'metaphor', 'depth_check', 'sentiment_intensity', 'redundancy', 'pacing', 'start_var', 'compliance_check', 'teleprompter', 'bpm', 'verb_balance']
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
            stumble: ["Einfache Phonetik hilft der Emotion.", "Vermeide Bandwurmwörter – sie sind schwer zu betonen und fehleranfällig.", "Lies kritische Stellen dreimal schnell hintereinander laut. Klappt es? Dann ist es okay.", "Hiatus (Vokal trifft Vokal) klingt oft holprig – glätten oder verbinden.", "Konsonanten-Cluster an Wortgrenzen können haken: lieber entkoppeln oder umstellen."],
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
            teleprompter: ["Nutze den Teleprompter im Vollbild für einen ruhigen Blick.", "Passe die Schriftgröße an die Distanz zum Screen an.", "Der Scroll folgt dem berechneten Tempo.", "Halte Zeilen kurz, damit die Augen ruhiger springen.", "Setze sinnvolle Pausenmarker, damit der Vortrag natürlicher bleibt."],
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

    const SA_Utils = {
        debounce: (func, delay) => { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; },
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
            const str = String(value ?? '');
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
            modal.setAttribute('aria-hidden', 'false');
            requestAnimationFrame(() => {
                modal.classList.add('is-open');
            });
        },
        isPremiumFeatureEnabled: () => {
            const planMode = typeof window !== 'undefined' ? window.SKA_PLAN_MODE : null;
            return (SA_CONFIG.PRO_MODE || SA_CONFIG.IS_ADMIN) && planMode === 'premium';
        },
        closeModal: (modal, onClosed) => {
            if (!modal) return;
            modal.classList.remove('is-open');
            modal.classList.remove('is-closing');
            modal.setAttribute('aria-hidden', 'true');
            if (typeof onClosed === 'function') onClosed();
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

    const SA_Logic = {
        getHyphenator: () => {
            if (SA_Logic._hyphenatorChecked) return SA_Logic._hyphenator;
            SA_Logic._hyphenatorChecked = true;
            if (!SA_Utils.isPremiumFeatureEnabled()) return null;
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
            if (!SA_Utils.isPremiumFeatureEnabled()) return null;
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
        getBenchmarkPercentile: (value, metric) => {
            if (!Number.isFinite(value)) return null;
            const table = SA_CONFIG.BENCHMARK_PERCENTILES && SA_CONFIG.BENCHMARK_PERCENTILES[metric];
            if (!Array.isArray(table) || !table.length) return null;

            const points = table
                .map(entry => ({
                    p: Number(entry.p),
                    value: Number(entry.value),
                    label: entry.label || ''
                }))
                .filter(entry => Number.isFinite(entry.p) && Number.isFinite(entry.value))
                .sort((a, b) => a.value - b.value);

            if (!points.length) return null;
            if (value <= points[0].value) return { percentile: points[0].p, label: points[0].label };
            if (value >= points[points.length - 1].value) {
                const last = points[points.length - 1];
                return { percentile: last.p, label: last.label };
            }

            for (let i = 0; i < points.length - 1; i += 1) {
                const left = points[i];
                const right = points[i + 1];
                if (value >= left.value && value <= right.value) {
                    const span = right.value - left.value || 1;
                    const ratio = (value - left.value) / span;
                    const percentile = left.p + (right.p - left.p) * ratio;
                    const label = ratio < 0.5 ? left.label : right.label;
                    return { percentile, label };
                }
            }
            return null;
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
        splitIntoSections: (text) => {
            const sections = (text || '')
                .split(/\n\s*\n/)
                .map(part => part.trim())
                .filter(Boolean);
            if (!sections.length && text && text.trim()) return [text.trim()];
            return sections;
        },
        analyzePacingSections: (text, settings = {}, timeMode = 'wpm') => {
            const sections = SA_Logic.splitIntoSections(text);
            if (!sections.length) return [];
            const wpm = SA_Logic.getWpm(settings);
            const sps = SA_Logic.getSps(settings);
            return sections
                .map((section, index) => {
                    const read = SA_Logic.analyzeReadability(section, settings);
                    if (!read.wordCount) return null;
                    const pause = SA_Utils.getPausenTime(section, settings);
                    let duration = 0;
                    let rate = 0;
                    if (timeMode === 'sps') {
                        duration = (read.totalSyllables / sps) + pause;
                        rate = duration > 0 ? read.totalSyllables / duration : 0;
                    } else {
                        duration = (read.speakingWordCount / wpm * 60) + pause;
                        rate = duration > 0 ? read.speakingWordCount / (duration / 60) : 0;
                    }
                    return {
                        index: index + 1,
                        text: section,
                        wordCount: read.wordCount,
                        syllables: read.totalSyllables,
                        pause,
                        duration,
                        rate
                    };
                })
                .filter(Boolean);
        },
        analyzeSyllableStretches: (text) => {
            const source = text || '';
            if (!source.trim()) return { stretches: [], avgSyllables: 0, maxSyllables: 0, threshold: 0 };
            const normalized = source.replace(/\|([0-9.]+S?)\|/g, '|');
            const parts = normalized.split(/[.!?;:\n|]+/g).map(part => part.trim()).filter(Boolean);
            const stretches = parts.map(segment => {
                const words = segment.match(/[A-Za-zÄÖÜäöüß]+/g) || [];
                const syllables = words.reduce((sum, word) => sum + Math.max(1, SA_Logic.countSyllables(word)), 0);
                return { segment, syllables, words: words.length };
            }).filter(item => item.words > 0);
            if (!stretches.length) return { stretches: [], avgSyllables: 0, maxSyllables: 0, threshold: 0 };
            const totalSyllables = stretches.reduce((sum, item) => sum + item.syllables, 0);
            const avgSyllables = totalSyllables / stretches.length;
            const maxSyllables = Math.max(...stretches.map(item => item.syllables));
            const threshold = Math.max(18, Math.round(avgSyllables * 1.6));
            const flagged = stretches
                .filter(item => item.syllables >= threshold)
                .sort((a, b) => b.syllables - a.syllables)
                .slice(0, 5);
            return { stretches: flagged, avgSyllables, maxSyllables, threshold };
        },
        analyzeReadability: (text, settings = {}) => {
            let clean = SA_Utils.cleanTextForCounting(text).trim();
            if (settings.numberMode === 'word') {
                clean = SA_Logic.expandNumbersForAudio(clean);
            }
            if(!clean) return { score: 0, avgSentence: 0, syllablesPerWord: 0, wordCount: 0, speakingWordCount: 0, words: [], sentences: [], paragraphs: 0, maxSentenceWords: 0, totalSyllables: 0, longWordCount: 0, lix: 0 };
            
            let tempText = clean;
            const abbrevs = ['z.B.', 'ca.', 'bzw.', 'vgl.', 'inkl.', 'max.', 'min.', 'Dr.', 'Prof.', 'Hr.', 'Fr.', 'Nr.'];
            abbrevs.forEach(abbr => { tempText = tempText.split(abbr).join(abbr.replace('.', '@@')); });

            const sentences = tempText
                .split(/[.!?]+(?=\s|$)/)
                .filter(s => s.trim().length > 0)
                .map(s => s.replace(/@@/g, '.'));
            const words = clean.split(/\s+/).filter(w => w.length > 0);
            const wc = words.length;
            const longWordCount = words.filter(w => w.replace(/[^a-zäöüß]/gi, '').length > 6).length;

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
            const lix = wc > 0 ? avgS + (longWordCount * 100 / wc) : 0;

            return { score: Math.max(0, Math.min(100, score)), avgSentence: avgS, syllablesPerWord: avgW, wordCount: wc, speakingWordCount, words, sentences, cleanedText: clean, paragraphs, maxSentenceWords, totalSyllables, longWordCount, lix };
        },
        analyzeStyleDimensions: (read, raw = '') => {
            const clamp = (value) => Math.max(0, Math.min(100, value));
            if (!read || !read.wordCount) {
                return { simplicity: 0, structure: 0, brevity: 0, precision: 0, contentRatio: 0, lexicalShare: 0, variance: 0 };
            }

            const sentenceEase = clamp(100 - (read.avgSentence - 10) * 4);
            const syllableEase = clamp(100 - (read.syllablesPerWord - 1.4) * 60);
            const lixEase = clamp(100 - (read.lix - 30) * 2.2);
            const simplicity = clamp((sentenceEase * 0.35) + (syllableEase * 0.35) + (lixEase * 0.3));

            const maxSentenceScore = clamp(100 - (read.maxSentenceWords - 20) * 3);
            const brevity = clamp((sentenceEase * 0.7) + (maxSentenceScore * 0.3));

            const sentences = read.sentences ? read.sentences.length : 0;
            const idealParagraphs = Math.max(1, Math.round(sentences / 4));
            const paragraphScore = clamp((read.paragraphs / idealParagraphs) * 100);
            const variance = SA_Logic.calculateVariance(read.sentences || []);
            const varianceScore = clamp(100 - Math.abs(variance - 3.5) * 22);
            const structure = clamp((paragraphScore * 0.6) + (varianceScore * 0.4));

            const stopwords = new Set(SA_CONFIG.STOPWORDS);
            const normalizedWords = (read.words || [])
                .map(word => word.toLowerCase().replace(/[^a-zäöüß]/gi, ''))
                .filter(Boolean);
            const contentCount = normalizedWords.filter(word => !stopwords.has(word)).length;
            const uniqueWords = new Set(normalizedWords);
            const lexicalShare = normalizedWords.length ? (uniqueWords.size / normalizedWords.length) * 100 : 0;
            const contentRatio = normalizedWords.length ? (contentCount / normalizedWords.length) * 100 : 0;
            const contentScore = clamp((contentRatio - 25) * 2.5);
            const precision = clamp((contentScore * 0.6) + (lexicalShare * 0.4));

            return { simplicity, structure, brevity, precision, contentRatio, lexicalShare, variance };
        },
        getDimensionSummary: (score) => {
            if (score >= 80) return { label: 'Sehr stark', color: SA_CONFIG.COLORS.success };
            if (score >= 60) return { label: 'Solide', color: SA_CONFIG.COLORS.blue };
            if (score >= 40) return { label: 'Ausbaufähig', color: SA_CONFIG.COLORS.warn };
            return { label: 'Schwach', color: SA_CONFIG.COLORS.error };
        },
        getLixSummary: (lix) => {
            if (lix <= 30) return { label: 'Sehr leicht', color: SA_CONFIG.COLORS.success };
            if (lix <= 40) return { label: 'Leicht', color: SA_CONFIG.COLORS.blue };
            if (lix <= 50) return { label: 'Mittel', color: SA_CONFIG.COLORS.warn };
            if (lix <= 60) return { label: 'Schwer', color: SA_CONFIG.COLORS.error };
            return { label: 'Sehr schwer', color: '#7f1d1d' };
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
        normalizeKeyword: (word) => {
            if (!word) return '';
            return word
                .toLowerCase()
                .replace(/[äÄ]/g, 'ae')
                .replace(/[öÖ]/g, 'oe')
                .replace(/[üÜ]/g, 'ue')
                .replace(/ß/g, 'ss')
                .replace(/[^a-z0-9]/g, '');
        },
        stemKeyword: (word) => {
            const clean = SA_Logic.normalizeKeyword(word);
            if (clean.length <= 4) return clean;
            const suffixes = ['chen', 'lein', 'ungen', 'ungen', 'ungen', 'ung', 'heit', 'keit', 'tion', 'sion', 'ment', 'schaft', 'lich', 'isch', 'ismus', 'isten', 'ist', 'ieren', 'ierung', 'ungen', 'ern', 'er', 'en', 'es', 'e', 's', 'n'];
            for (const suffix of suffixes) {
                if (clean.length - suffix.length <= 3) continue;
                if (clean.endsWith(suffix)) {
                    return clean.slice(0, -suffix.length);
                }
            }
            return clean;
        },
        buildKeywordNgrams: (word, size = 3) => {
            const clean = SA_Logic.normalizeKeyword(word);
            if (clean.length <= size) return new Set([clean]);
            const grams = new Set();
            for (let i = 0; i <= clean.length - size; i += 1) {
                grams.add(clean.slice(i, i + size));
            }
            return grams;
        },
        keywordSimilarity: (a, b) => {
            if (!a || !b) return 0;
            if (a.stem && b.stem && a.stem === b.stem) return 1;
            const gramsA = a.ngrams || new Set();
            const gramsB = b.ngrams || new Set();
            const union = new Set([...gramsA, ...gramsB]);
            if (!union.size) return 0;
            let intersect = 0;
            gramsA.forEach((g) => {
                if (gramsB.has(g)) intersect += 1;
            });
            const jaccard = intersect / union.size;
            const prefixLength = (() => {
                const aNorm = a.normalized || '';
                const bNorm = b.normalized || '';
                let i = 0;
                while (i < aNorm.length && i < bNorm.length && aNorm[i] === bNorm[i]) i += 1;
                return i;
            })();
            const prefixBoost = prefixLength >= 4 ? 0.2 : 0;
            return Math.min(1, jaccard + prefixBoost);
        },
        getKeywordIdf: (word) => {
            const normalized = SA_Logic.normalizeKeyword(word);
            const freq = SA_CONFIG.KEYWORD_REFERENCE_FREQ[normalized] || SA_CONFIG.KEYWORD_REFERENCE_FREQ_FALLBACK;
            const total = SA_CONFIG.KEYWORD_REFERENCE_TOTAL;
            return Math.log((total + 1) / (freq + 1)) + 1;
        },
        clusterKeywords: (entries, limit = 18) => {
            const selected = (entries || []).slice(0, limit);
            const clusters = [];
            selected.forEach((entry) => {
                const normalized = SA_Logic.normalizeKeyword(entry.word);
                const stem = SA_Logic.stemKeyword(normalized);
                const ngrams = SA_Logic.buildKeywordNgrams(normalized);
                const candidate = { normalized, stem, ngrams };
                let bestCluster = null;
                let bestScore = 0;
                clusters.forEach((cluster) => {
                    const score = SA_Logic.keywordSimilarity(candidate, cluster.representative);
                    if (score > 0.42 && score > bestScore) {
                        bestScore = score;
                        bestCluster = cluster;
                    }
                });
                if (!bestCluster) {
                    clusters.push({
                        representative: candidate,
                        terms: [{ word: entry.word, count: entry.count, tfidf: entry.tfidf }],
                        totalTfidf: entry.tfidf || 0
                    });
                } else {
                    bestCluster.terms.push({ word: entry.word, count: entry.count, tfidf: entry.tfidf });
                    bestCluster.totalTfidf += entry.tfidf || 0;
                }
            });
            return clusters
                .map((cluster) => {
                    const sortedTerms = cluster.terms.sort((a, b) => b.tfidf - a.tfidf || b.count - a.count || a.word.localeCompare(b.word));
                    return {
                        label: sortedTerms[0]?.word || '',
                        terms: sortedTerms,
                        totalTfidf: cluster.totalTfidf
                    };
                })
                .sort((a, b) => b.totalTfidf - a.totalTfidf);
        },
        analyzeKeywordClusters: (text, settings = {}) => {
            if(!text || !text.trim()) return { top: [], tfIdfTop: [], clusters: [], total: 0, focusScore: 0, focusKeywords: [], focusCounts: [], focusTotalCount: 0, focusDensity: 0, focusLimit: 0, focusOverLimit: false, totalWords: 0, tfIdfTotal: 0 };
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
            const enriched = top.map((entry) => {
                const tf = total > 0 ? entry.count / total : 0;
                const idf = SA_Logic.getKeywordIdf(entry.word);
                return { ...entry, tf, idf, tfidf: tf * idf };
            });
            const tfIdfTop = [...enriched].sort((a, b) => {
                if (b.tfidf !== a.tfidf) return b.tfidf - a.tfidf;
                if (b.count !== a.count) return b.count - a.count;
                return a.word.localeCompare(b.word);
            });
            const tfIdfTotal = enriched.reduce((sum, entry) => sum + (entry.tfidf || 0), 0);
            const topCount = top.length > 0 ? top[0].count : 0;
            const focusScore = total > 0 ? topCount / total : 0;
            const clusters = SA_Logic.clusterKeywords(tfIdfTop, 20);
            return { top, tfIdfTop, clusters, total, focusScore, focusKeywords, focusCounts, focusTotalCount, focusDensity, focusLimit, focusOverLimit, totalWords: totalWords.length, tfIdfTotal };
        },
        getWpm: (s) => {
            if (s.manualWpm && s.manualWpm > 0) return s.manualWpm;
            return (SA_CONFIG.WPM[s.usecase] || 150);
        },
        getSps: (s) => (SA_CONFIG.SPS[s.usecase] || 3.8),
        getReadabilityScore: (read) => {
            if (!read || read.wordCount === 0) return 0;
            const base = Number.isFinite(read.score) ? read.score : 0;
            const avgSentence = Number.isFinite(read.avgSentence) ? read.avgSentence : 0;
            const maxSentence = Number.isFinite(read.maxSentenceWords) ? read.maxSentenceWords : 0;

            let penalty = 0;
            if (avgSentence > 18) penalty += (avgSentence - 18) * 2.5;
            if (maxSentence > 30) penalty += (maxSentence - 30) * 2.5;

            const score = Math.max(0, Math.min(100, base - penalty));
            return score;
        },
        getTrafficLight: (read) => {
            if (!read || read.wordCount === 0) return { color: 'gray', label: 'Leer', class: 'neutral', score: 0 };
            const score = SA_Logic.getReadabilityScore(read);
            if (score < 40) return { color: SA_CONFIG.COLORS.error, label: 'Kritisch', class: 'red', score };
            if (score < 55) return { color: SA_CONFIG.COLORS.error, label: 'Schwer verständlich', class: 'red', score };
            if (score < 70) return { color: SA_CONFIG.COLORS.warn, label: 'Optimierbar', class: 'yellow', score };
            if (score < 85) return { color: SA_CONFIG.COLORS.success, label: 'Gut', class: 'green', score };
            return { color: SA_CONFIG.COLORS.success, label: 'Sehr gut', class: 'green', score };
        },
        analyzeCompliance: (text, phrases) => {
            const normalizedText = SA_Utils.normalizeWhitespace(text).toLowerCase();
            const normalizedPhrases = phrases
                .map((phrase) => SA_Utils.normalizeWhitespace(phrase))
                .filter(Boolean);
            const results = normalizedPhrases.map((phrase) => {
                const normalizedPhrase = phrase.toLowerCase();
                const found = normalizedText.includes(normalizedPhrase);
                return { phrase, found };
            });
            const matched = results.filter((item) => item.found);
            const missing = results.filter((item) => !item.found);
            return { total: normalizedPhrases.length, matched, missing, results };
        },
        analyzeSyllableEntropy: (sentences) => {
            const syllablePattern = [];
            const sentenceResults = [];
            const collectPattern = (text) => {
                const words = text.match(/[A-Za-zÄÖÜäöüß]+/g) || [];
                words.forEach((word) => {
                    const syllables = Math.max(1, SA_Logic.countSyllables(word));
                    syllablePattern.push(1);
                    for (let i = 1; i < syllables; i += 1) syllablePattern.push(0);
                });
            };

            if (Array.isArray(sentences)) {
                sentences.forEach((sentence) => {
                    collectPattern(sentence);
                    const local = SA_Logic.calculateSyllableEntropy(sentence);
                    const wordCount = sentence.trim().split(/\s+/).filter(Boolean).length;
                    if (local.stumble && wordCount >= 8) {
                        sentenceResults.push({ sentence, entropy: local.entropy, wordCount });
                    }
                });
            }

            const entropy = SA_Logic.calculateEntropyFromPattern(syllablePattern);
            const label = entropy > 0.72 ? 'Unruhig / Stolpernd' : (entropy > 0.48 ? 'Ausgewogen' : 'Monoton');
            const issues = sentenceResults
                .sort((a, b) => b.entropy - a.entropy)
                .slice(0, 12)
                .map(({ sentence, entropy: issueEntropy }) => ({ sentence, entropy: issueEntropy }));
            return { entropy, label, issues };
        },
        calculateSyllableEntropy: (text) => {
            const pattern = [];
            const words = text.match(/[A-Za-zÄÖÜäöüß]+/g) || [];
            words.forEach((word) => {
                const syllables = Math.max(1, SA_Logic.countSyllables(word));
                pattern.push(1);
                for (let i = 1; i < syllables; i += 1) pattern.push(0);
            });
            const entropy = SA_Logic.calculateEntropyFromPattern(pattern);
            return { entropy, stumble: entropy > 0.78 };
        },
        calculateEntropyFromPattern: (pattern) => {
            if (!pattern.length) return 0;
            const counts = { '00': 0, '01': 0, '10': 0, '11': 0 };
            for (let i = 0; i < pattern.length - 1; i += 1) {
                const key = `${pattern[i]}${pattern[i + 1]}`;
                counts[key] += 1;
            }
            const total = Object.values(counts).reduce((sum, val) => sum + val, 0);
            if (!total) return 0;
            const entropy = Object.values(counts).reduce((sum, val) => {
                if (!val) return sum;
                const p = val / total;
                return sum - (p * Math.log2(p));
            }, 0);
            return entropy / 2;
        },
        generateTeleprompterExport: (text, settings) => {
            const parts = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
            const markers = [];
            let currentTime = 0;
            const wpm = SA_Logic.getWpm(settings);
            const sps = SA_Logic.getSps(settings);
            const isSps = settings.timeMode === 'sps';

            parts.forEach((p, idx) => {
                const read = SA_Logic.analyzeReadability(p, settings);
                const pause = SA_Utils.getPausenTime(p, settings);
                const dur = isSps ? (read.totalSyllables / sps) + pause : (read.speakingWordCount / wpm * 60) + pause;
                const timeStr = SA_Utils.formatMarkerTime(currentTime);
                markers.push({ id: idx + 1, time: timeStr, seconds: Number(currentTime.toFixed(2)), text: p });
                currentTime += dur;
            });
            return markers;
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
        getPosTagger: () => {
            return window.SkaPosTagger || null;
        },
        getPosTags: (text) => {
            const tagger = SA_Logic.getPosTagger();
            if (!tagger || typeof tagger.tag !== 'function') return null;
            return tagger.tag(text || '');
        },
        // Regex-Heuristik dominiert, wenn kein POS verfügbar ist.
        findNominalStyleRegex: (text) => {
            const regex = /\b([a-zA-ZäöüÄÖÜß]+(?:ung|heit|keit|tion|schaft|tum|ismus|ling|nis))\b/gi;
            const matches = text.match(regex) || [];
            const whitelist = new Set(SA_CONFIG.NOMINAL_WHITELIST);
            const filtered = matches.filter(word => !whitelist.has(word.toLowerCase()));
            return [...new Set(filtered)];
        },
        findNominalStyle: (text) => {
            const whitelist = new Set(SA_CONFIG.NOMINAL_WHITELIST);
            const pos = SA_Logic.getPosTags(text);
            if (!pos || !pos.terms || !pos.terms.length) return SA_Logic.findNominalStyleRegex(text);
            const nouns = pos.terms
                .filter(term => term.tags && term.tags.Noun)
                .map(term => term.text)
                .filter(word => !whitelist.has(word.toLowerCase()));
            if (!nouns.length) return SA_Logic.findNominalStyleRegex(text);
            return [...new Set(nouns)];
        },
        
        // Regex-Heuristik dominiert, wenn kein POS verfügbar ist.
        findNominalChainsRegex: (text) => {
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
        findNominalChains: (text) => {
            const pos = SA_Logic.getPosTags(text);
            if (!pos || !pos.terms || !pos.terms.length) return SA_Logic.findNominalChainsRegex(text);
            const whitelist = new Set(SA_CONFIG.NOMINAL_WHITELIST);
            const chains = [];
            const termsBySentence = new Map();

            pos.terms.forEach(term => {
                if (!termsBySentence.has(term.sentenceIndex)) {
                    termsBySentence.set(term.sentenceIndex, []);
                }
                termsBySentence.get(term.sentenceIndex).push(term);
            });

            const sentences = text.split(/[.!?]+(?=\s|$)/);
            sentences.forEach((sentence, index) => {
                const trimmed = sentence.trim();
                if (!trimmed) return;
                const words = trimmed.split(/\s+/);
                const wordCount = words.length;
                const terms = termsBySentence.get(index) || [];
                const nominalCount = terms.filter(term => term.tags && term.tags.Noun && !whitelist.has(term.normal)).length;

                if ((wordCount < 15 && nominalCount >= 2) || (wordCount >= 15 && nominalCount >= 3)) {
                    if (nominalCount / wordCount > 0.15) {
                        chains.push(trimmed);
                    }
                }
            });
            return chains;
        },

        findAdjectives: (text) => { const regex = /\b([a-zA-ZäöüÄÖÜß]+(?:ig|lich|isch|haft|bar|sam|los))\b/gi; const matches = text.match(regex) || []; return [...new Set(matches)]; },
        findAdverbs: (text) => {
            const regex = /\b([a-zA-ZäöüÄÖÜß]{4,}(?:erweise|weise))\b/gi;
            const matches = text.match(regex) || [];
            const blacklist = new Set(['weise']);
            const cleaned = matches.filter(word => !blacklist.has(word.toLowerCase()));
            return [...new Set(cleaned)];
        },
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
            const plosives = [...aggregated.values()].sort((a, b) => {
                if (b.words !== a.words) return b.words - a.words;
                if (b.occurrences !== a.occurrences) return b.occurrences - a.occurrences;
                return a.phrase.localeCompare(b.phrase);
            });
            const boundaryIssues = SA_Logic.analyzeWordBoundaries(text);
            return { plosives, consonantClusters: boundaryIssues.consonantClusters };
        },
        findWordEchoes: (text) => {
            const words = text.toLowerCase().match(/\b[a-zäöüß]+\b/g) || [];
            const echoes = new Set();
            const minLen = 5;
            const range = 35;
            const ignore = new Set(SA_CONFIG.ECHO_STOPWORDS || SA_CONFIG.STOPWORDS);
            const lastSeen = new Map();
            const stemToLabel = new Map();
            for(let i=0; i < words.length; i++) {
                const current = words[i];
                if(ignore.has(current)) continue;
                const stem = SA_Utils.stemWord(current);
                if(stem.length < minLen) continue;
                if(!stemToLabel.has(stem)) stemToLabel.set(stem, current);
                if(lastSeen.has(stem)) {
                    if((i - lastSeen.get(stem)) <= range) echoes.add(stem);
                }
                lastSeen.set(stem, i);
            }
            return [...echoes].map((stem) => stemToLabel.get(stem) || stem);
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
        // Regex-Heuristik dominiert, wenn kein POS verfügbar ist.
        findPassiveRegex: (text) => { 
            const sentences = text.split(/[.!?]+(?=\s|$)/);
            const matches = new Set();
            const auxForms = new Set(['wurde', 'wurden', 'wird', 'werden', 'worden', 'geworden']);
            const partRegex = /\b(ge[a-zäöüß]{2,}(?:t|en)|[a-zäöüß]{3,}iert)\b/i;
            const skipTokens = new Set(['nicht', 'nie', 'kaum', 'schon', 'auch', 'nur', 'noch', 'gerade', 'eben', 'wohl', 'sehr', 'mehr', 'weniger', 'ganz', 'eher', 'immer', 'oft', 'wieder', 'erst', 'dann', 'jetzt', 'hier', 'dort', 'sofort', 'schnell', 'langsam', 'gerne', 'gern', 'heute', 'morgen']);
            const stateAdjectives = new Set(['dunkel', 'hell', 'kalt', 'warm', 'klar', 'laut', 'leise', 'ruhig', 'still', 'besser', 'schlimmer', 'schwer', 'leicht', 'müde', 'satt', 'froh']);
            const modifierSuffix = /(lich|ig|weise|erweise|sam|bar)$/i;

            sentences.forEach(s => {
                const tokens = s.match(/[A-Za-zÄÖÜäöüß]+/g) || [];
                const lower = tokens.map(t => t.toLowerCase());
                for (let i = 0; i < lower.length; i += 1) {
                    if (!auxForms.has(lower[i])) continue;
                    let found = null;
                    for (let j = i + 1; j < Math.min(lower.length, i + 7); j += 1) {
                        const token = lower[j];
                        if (skipTokens.has(token) || modifierSuffix.test(token)) continue;
                        if (stateAdjectives.has(token) && !found) break;
                        if (partRegex.test(token)) { found = tokens[j]; break; }
                        break;
                    }
                    if (found) matches.add(`${tokens[i]} ... ${found}`);
                }
            });
            return [...matches];
        },
        getWordBoundaryPairs: (text) => {
            const normalized = (text || '').replace(/[–—-]/g, ' ');
            const words = normalized.match(/[A-Za-zÄÖÜäöüß]+/g) || [];
            const pairs = [];
            for (let i = 0; i < words.length - 1; i++) {
                const left = words[i];
                const right = words[i + 1];
                if (!left || !right) continue;
                const pattern = new RegExp(`${SA_Utils.escapeRegex(left)}([\\s\\-–—]+)${SA_Utils.escapeRegex(right)}`, 'i');
                const match = (text || '').match(pattern);
                const separator = match ? (match[1].match(/[-–—]/) || [' '])[0] : ' ';
                const phrase = `${left}${separator}${right}`;
                pairs.push({ left, right, phrase });
            }
            return pairs;
        },
        analyzeWordBoundaries: (text) => {
            const vowelChars = SA_CONFIG.WORD_BOUNDARY_VOWELS.join('');
            const vowels = new Set(SA_CONFIG.WORD_BOUNDARY_VOWELS);
            const consonantStart = new RegExp(`^[^${vowelChars}]+`, 'i');
            const consonantEnd = new RegExp(`[^${vowelChars}]+$`, 'i');
            const pairs = SA_Logic.getWordBoundaryPairs(text);
            const hiatus = new Set();
            const consonantClusters = new Set();

            pairs.forEach(({ left, right, phrase }) => {
                const leftClean = left.replace(/[^A-Za-zÄÖÜäöüß]/g, '');
                const rightClean = right.replace(/[^A-Za-zÄÖÜäöüß]/g, '');
                if (!leftClean || !rightClean) return;
                const leftLast = leftClean.slice(-1).toLowerCase();
                const rightFirst = rightClean.slice(0, 1).toLowerCase();
                if (vowels.has(leftLast) && vowels.has(rightFirst)) {
                    hiatus.add(phrase);
                }
                const endCluster = (leftClean.toLowerCase().match(consonantEnd) || [''])[0];
                const startCluster = (rightClean.toLowerCase().match(consonantStart) || [''])[0];
                if (endCluster && startCluster) {
                    const clusterScore = endCluster.length + startCluster.length;
                    const isHardCluster = (endCluster.length >= 2 && startCluster.length >= 2)
                        || (endCluster.length >= 3 && startCluster.length >= 1)
                        || (startCluster.length >= 3 && endCluster.length >= 1)
                        || clusterScore >= 5;
                    if (isHardCluster) consonantClusters.add(phrase);
                }
            });

            return { hiatus: [...hiatus], consonantClusters: [...consonantClusters] };
        },
        findStumbles: (text) => { 
            const sharedUtils = typeof window !== 'undefined' ? window.SA_ANALYSIS_UTILS : null;
            if (sharedUtils && sharedUtils.findStumbles) {
                return sharedUtils.findStumbles(text, SA_CONFIG.PHONETICS);
            }
            const words = text.split(/\s+/).map(x=>x.replace(/[.,;!?:"()]/g,'')); 
            const result = { long: [], camel: [], phonetic: [], alliter: [], hiatus: [], consonant_clusters: [], sibilant_warning: false, sibilant_density: 0 };
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
            const boundaryIssues = SA_Logic.analyzeWordBoundaries(text);
            result.hiatus = boundaryIssues.hiatus;
            result.consonant_clusters = boundaryIssues.consonantClusters;
            result.long = [...new Set(result.long)];
            result.camel = [...new Set(result.camel)];
            result.phonetic = [...new Set(result.phonetic)];
            result.alliter = [...new Set(result.alliter)];
            return result; 
        },
        analyzePronunciation: (text) => {
            const clean = text.replace(/[.,;!?":()]/g, ' ').toLowerCase();
            const words = clean.split(/\s+/);
            const findings = [];
            const seen = new Set();
            const boundaryIssues = SA_Logic.analyzeWordBoundaries(text);
    
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
    
            return { words: findings, hiatuses: boundaryIssues.hiatus };
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
                    seconds: Number(currentTime.toFixed(2)),
                    label: SA_Utils.normalizeWhitespace(p).substring(0, 30) + '...' 
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
        formatMarkerCsv: (markers = []) => {
            const header = ['Marker', 'Timecode', 'Seconds', 'Label'];
            const rows = markers.map((marker) => ([
                marker.id ?? '',
                marker.time ?? '',
                (marker.seconds ?? '').toString(),
                marker.label ?? ''
            ]));
            const allRows = [header, ...rows];
            return allRows
                .map((row) => row.map(SA_Utils.escapeCsvValue).join(','))
                .join('\r\n');
        },
        formatEdlTimecode: (seconds, fps = 25) => {
            const total = Math.max(0, Number(seconds) || 0);
            const hours = Math.floor(total / 3600);
            const minutes = Math.floor((total % 3600) / 60);
            const secs = Math.floor(total % 60);
            const frames = Math.floor((total - Math.floor(total)) * fps);
            const pad = (val) => String(val).padStart(2, '0');
            return `${pad(hours)}:${pad(minutes)}:${pad(secs)}:${pad(frames)}`;
        },
        formatMarkerEdl: (markers = [], options = {}) => {
            const fps = options.fps || 25;
            const title = options.title || 'Skript Marker Export';
            const lines = [`TITLE: ${title}`, 'FCM: NON-DROP FRAME'];
            markers.forEach((marker, idx) => {
                const tc = SA_Logic.formatEdlTimecode(marker.seconds, fps);
                const number = String(idx + 1).padStart(3, '0');
                lines.push(`${number}  001      V     C        ${tc} ${tc} ${tc} ${tc}`);
                lines.push(`* LOC: ${tc}`);
                lines.push(`* COMMENT: ${marker.label || `Marker ${marker.id || idx + 1}`}`);
            });
            return lines.join('\r\n');
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
            const sharedUtils = typeof window !== 'undefined' ? window.SA_ANALYSIS_UTILS : null;
            if (sharedUtils && sharedUtils.analyzeRedundancy) {
                return sharedUtils.analyzeRedundancy(sentences);
            }
            if (!sentences || sentences.length < 2) return [];
            const tokenize = (sentence) => {
                const words = sentence.match(/[A-Za-zÄÖÜäöüß]+/g) || [];
                const stopwords = new Set(SA_CONFIG.STOPWORDS);
                return words.map((word) => {
                    const lower = word.toLowerCase();
                    return { lower, stem: SA_Utils.stemWord(lower) };
                }).filter(({ lower, stem }) => stem.length > 2 && !stopwords.has(lower) && !stopwords.has(stem))
                    .map(({ stem }) => stem);
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
                    const adverbs = SA_Logic.findAdverbs(read.cleanedText);
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
                    const syllableEntropy = SA_Logic.analyzeSyllableEntropy(read.sentences);
                    const compliancePhrases = (settings.complianceText || '')
                        .split(/\n+/)
                        .map(line => line.trim())
                        .filter(Boolean);
                    const complianceResult = compliancePhrases.length
                        ? SA_Logic.analyzeCompliance(text, compliancePhrases)
                        : null;

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
                        if (options.syllableEntropy && syllableEntropy) {
                            addRow("Silben-Entropie:", `${(syllableEntropy.entropy * 100).toFixed(0)}% (${syllableEntropy.label})`);
                        }
                        if (options.compliance && complianceResult) {
                            const status = complianceResult.missing.length ? `Fehlt ${complianceResult.missing.length}` : 'Alles vorhanden';
                            addRow("Pflichttext-Check:", `${status} (${complianceResult.matched.length}/${complianceResult.total})`);
                        }
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
                        
                        if(pronunc.words.length > 0) {
                            const pText = pronunc.words.map(p => `${p.word} (${p.hint})`).join(', ');
                            addRow("Aussprache:", pText);
                        }
                        if(pronunc.hiatuses.length > 0) {
                            addRow("Hiatus (Wortgrenzen):", pronunc.hiatuses);
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
                        if(adverbs.length) addRow("Adverbien (-weise):", adverbs);
                        if(anglicisms.length) addRow("Anglizismen:", anglicisms);
                        if(echoes.length) addRow("Wort-Wiederholungen:", echoes);
                        const stumbleArr = [...stumbles.phonetic, ...stumbles.camel, ...stumbles.long, ...stumbles.alliter, ...stumbles.hiatus, ...stumbles.consonant_clusters];
                        if(stumbleArr.length) addRow("Stolpersteine:", stumbleArr);
                        if(stumbles.sibilant_warning) addRow("Warnung:", `Hohe Zischlaut-Dichte (${stumbles.sibilant_density}%)`);
                        if(plosiveClusters.plosives.length) {
                            const pText = plosiveClusters.plosives.slice(0, 3).map(p => `${p.phrase} (${p.words}x)`).join(', ');
                            addRow("Plosiv-Folgen:", pText);
                        }
                        if(plosiveClusters.consonantClusters.length) {
                            addRow("Konsonanten-Cluster:", plosiveClusters.consonantClusters.slice(0, 5));
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
                                if(b.hardSegment) issue.push('Keine Pause / Atemdruck');
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
                        if(plosiveClusters.plosives.length > 0) printTip("Plosiv-Alarm: P/B/T/K am Wortanfang häufen sich. Etwas Abstand oder Umformulieren hilft.");
                        if(plosiveClusters.consonantClusters.length > 0) printTip("Harte Konsonanten-Cluster: Wortgrenzen mit starken Konsonantenketten glätten.");
                        if(keywordFocus.focusScore > 0 && keywordFocus.focusScore < 0.14) printTip("Keyword-Fokus: Die Kernbotschaft wirkt verteilt. Wiederhole den Hauptbegriff bewusst.");
                        if(redundancy.length > 0) printTip("Redundanz-Check: Entferne doppelte Aussagen in direkt aufeinanderfolgenden Sätzen.");
                        if(easyLanguage.genitives.length > 0) printTip("Leichte Sprache: Genitiv vermeiden, um verständlicher zu bleiben.");
                        if(adjectives.length > 5) printTip("Text wirkt 'blumig'. Prüfe, ob du alle Adjektive wirklich brauchst.");
                        if(pronunc.words.length > 0 || pronunc.hiatuses.length > 0) printTip("Achte auf die korrekte Aussprache bei Lehnwörtern und '-ig' Endungen.");
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

                    if (options.notesColumn) {
                        doc.addPage();
                        const notesMargin = 15;
                        const notesGap = 8;
                        const pageHeight = doc.internal.pageSize.getHeight();
                        const notesContentWidth = pageWidth - (notesMargin * 2);
                        const scriptWidth = (notesContentWidth - notesGap) * 0.62;
                        const notesWidth = notesContentWidth - notesGap - scriptWidth;
                        const scriptX = notesMargin;
                        const notesX = notesMargin + scriptWidth + notesGap;
                        const lineHeight = 6;
                        const headerOffset = 10;
                        const bottomLimit = pageHeight - notesMargin;

                        const renderNotesHeader = () => {
                            doc.setFontSize(12);
                            doc.setTextColor(26, 147, 238);
                            doc.setFont(undefined, 'bold');
                            doc.text("Skript", scriptX, y);
                            doc.text("Notizen", notesX, y);
                            doc.setDrawColor(226, 232, 240);
                            doc.line(notesMargin, y + 2, notesMargin + notesContentWidth, y + 2);
                            y += headerOffset;
                            doc.setFontSize(11);
                            doc.setTextColor(0);
                            doc.setFont(undefined, 'normal');
                        };

                        y = 20;
                        renderNotesHeader();

                        const splitNotesScript = doc.splitTextToSize(text, scriptWidth);
                        splitNotesScript.forEach((line) => {
                            if (y + lineHeight > bottomLimit) {
                                doc.addPage();
                                y = 20;
                                renderNotesHeader();
                            }
                            doc.text(line, scriptX, y);
                            doc.setDrawColor(226, 232, 240);
                            doc.line(notesX, y + 1, notesX + notesWidth, y + 1);
                            y += lineHeight;
                        });
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
                        SA_Utils.closeModal(modal, () => {
                            document.body.classList.remove('ska-modal-open');
                        });
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

            this.settings = { usecase: 'auto', lastGenre: '', charMode: 'spaces', numberMode: 'digit', branch: 'all', targetSec: 0, role: '', manualWpm: 0, timeMode: 'wpm', audienceTarget: '', bullshitBlacklist: '', commaPause: 0.2, periodPause: 0.5, focusKeywords: '', keywordDensityLimit: 2, complianceText: '', teleprompterMirror: false };
            
            this.state = { 
                savedVersion: '', 
                currentData: {}, 
                hiddenCards: new Set(), 
                tipIndices: { fillers: 0, passive: 0, nominal: 0, anglicism: 0, echo: 0, breath: 0, stumble: 0, cta: 0, adjective: 0, adverb: 0, rhythm: 0, syllable_entropy: 0, dialog: 0, gender: 0, start_var: 0, role_dist: 0, nominal_chain: 0, vocabulary: 0, pronunciation: 0, keyword_focus: 0, plosive: 0, redundancy: 0, bpm: 0, easy_language: 0, teleprompter: 0, pacing: 0, bullshit: 0, audience: 0, verb_balance: 0, rhet_questions: 0, depth_check: 0, sentiment_intensity: 0, compliance_check: 0 }, 
                excludedCards: new Set(),
                selectedExtraCards: new Set(),
                filterCollapsed: true,
                planMode: SA_CONFIG.PRO_MODE ? 'premium' : 'free',
                premiumPricePlan: 'pro',
                benchmark: { running: false, start: 0, elapsed: 0, wpm: 0, timerId: null },
                teleprompter: { playing: false, rafId: null, start: 0, duration: 0, startScroll: 0, words: [], wordTokens: [], activeIndex: -1, speechRecognition: null, speechActive: false, speechIndex: 0, speechTranscript: '', speechWordCount: 0, speechWarningShown: false },
                pacing: { playing: false, rafId: null, start: 0, duration: 0, elapsed: 0 },
                clickTrack: { playing: false, bpm: 0, timerId: null, context: null },
                syllableEntropyIssues: [],
                analysisToken: 0,
                readabilityCache: [],
                limitReached: false,
                premiumUpgradeDismissed: false,
                markerData: []
            };
            this.synonymCache = new Map();
            this.synonymHoverState = { activeWord: null, activeTarget: null, hideTimer: null, requestId: 0 };
            if (typeof window !== 'undefined') {
                window.SKA_PLAN_MODE = this.state.planMode;
            }
            
            this.analysisWorker = null;
            this.workerRequests = new Map();
            this.workerRequestId = 0;
            this.analysisUtilsRequested = false;
            this.isRestoring = false;
            this.overviewResizeObserver = null;

            this.loadUIState();
            this.updatePlanUI();
            this.initMarkerDropdown();
            this.renderSettingsModal();
            this.renderBenchmarkModal();
            this.renderTeleprompterModal();
            this.initAnalysisWorker();
            this.bindEvents();
            
            this.injectGlobalStyles(); // CSS Overrides
            this.initSynonymTooltip();

            const savedVersion = SA_Utils.storage.load(SA_CONFIG.SAVED_VERSION_KEY);
            if (savedVersion && savedVersion.trim().length > 0) {
                this.state.savedVersion = savedVersion;
            }

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
            if (this.textarea.isContentEditable) {
                this.textarea.innerHTML = SA_Utils.renderMarkersToHtml(value);
                return;
            }
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

            const isPremium = this.isPremiumActive();
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
                    <div class="ska-settings-section">
                        <div class="ska-settings-section-header">
                            <h4>Text-Zählung</h4>
                            <p>Bestimme, wie Zeichen und Zahlen gewichtet werden.</p>
                        </div>
                        <div class="ska-settings-field">
                            <label class="ska-settings-label">Zeichen zählen</label>
                            <div class="ska-settings-option-group">
                                <label class="ska-settings-option">
                                    <input type="radio" name="ska-char-mode" value="spaces" ${this.settings.charMode === 'spaces' ? 'checked' : ''}>
                                    <span>Inkl. Leerzeichen</span>
                                </label>
                                <label class="ska-settings-option">
                                    <input type="radio" name="ska-char-mode" value="no-spaces" ${this.settings.charMode === 'no-spaces' ? 'checked' : ''}>
                                    <span>Ohne Leerzeichen</span>
                                </label>
                            </div>
                        </div>
                        <div class="ska-settings-field">
                            <label class="ska-settings-label">Zahlen-Interpretation</label>
                            <div class="ska-settings-option-group">
                                <label class="ska-settings-option">
                                    <input type="radio" name="ska-num-mode" value="digit" ${this.settings.numberMode === 'digit' ? 'checked' : ''}>
                                    <div>
                                        <span class="ska-settings-option-title">Als Zahl</span>
                                        <span class="ska-settings-option-subtext">12 = 2 Zeichen</span>
                                    </div>
                                </label>
                                <label class="ska-settings-option">
                                    <input type="radio" name="ska-num-mode" value="word" ${this.settings.numberMode === 'word' ? 'checked' : ''}>
                                    <div>
                                        <span class="ska-settings-option-title">Als Wort</span>
                                        <span class="ska-settings-option-subtext">Zwölf = 5 Zeichen</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="ska-settings-section">
                        <div class="ska-settings-section-header">
                            <h4>Timing & Pausen</h4>
                            <p>Kalibriere Zieldauer, Tempo und Pausenlogik.</p>
                        </div>
                        <div class="ska-settings-field">
                            <label class="ska-settings-label">Zielzeit (Min:Sek)</label>
                            <input type="text" id="ska-set-target" value="${targetVal}" placeholder="z.B. 1:30" class="ska-settings-input">
                        </div>
                        <div class="ska-settings-field">
                            <label class="ska-settings-label">Zeit-Berechnung</label>
                            <div class="ska-settings-option-group">
                        <label class="ska-settings-option">
                                    <input type="radio" name="ska-time-mode" value="wpm" ${this.settings.timeMode === 'wpm' ? 'checked' : ''}>
                                    <div>
                                        <span class="ska-settings-option-title">WPM (Standard)</span>
                                        <span class="ska-settings-option-subtext is-muted">Wörter pro Minute</span>
                                    </div>
                                </label>
                                <label class="ska-settings-option ${isPremium ? '' : 'is-locked'}">
                                    <input type="radio" name="ska-time-mode" value="sps" ${this.settings.timeMode === 'sps' ? 'checked' : ''} ${isPremium ? '' : 'disabled'}>
                                    <div>
                                        <span class="ska-settings-option-title">SPS (Präzise)</span>
                                        ${isPremium ? '' : '<span class="ska-premium-pill">Premium</span>'}
                                        <span class="ska-settings-option-subtext is-muted">Silben pro Sekunde</span>
                                    </div>
                                </label>
                            </div>
                            <p class="ska-settings-help">SPS eignet sich für präzise Synchron-Strecken mit langen Wörtern.</p>
                        </div>
                        <div class="ska-settings-field ${isPremium ? '' : 'is-locked'}">
                            <label class="ska-settings-label">Pausen-Automatik ${isPremium ? '' : '<span class="ska-premium-pill">Premium</span>'}</label>
                            <div class="ska-settings-grid-two">
                                <div>
                                    <span class="ska-settings-helper-label">Komma-Pause (Sekunden)</span>
                                    <input type="number" step="0.1" min="0" id="ska-set-comma-pause" value="${this.settings.commaPause ?? 0.2}" class="ska-settings-input" ${isPremium ? '' : 'disabled'}>
                                </div>
                                <div>
                                    <span class="ska-settings-helper-label">Punkt-Pause (Sekunden)</span>
                                    <input type="number" step="0.1" min="0" id="ska-set-period-pause" value="${this.settings.periodPause ?? 0.5}" class="ska-settings-input" ${isPremium ? '' : 'disabled'}>
                                </div>
                            </div>
                            <p class="ska-settings-help">Mikro-Pausen werden zur Gesamtzeit addiert – ideal für Voice-Optimierung.</p>
                        </div>
                        <div class="ska-wpm-calibration ${isPremium ? '' : 'is-locked'}">
                            <div class="ska-wpm-header">
                                <span>Persönliches WPM ${isPremium ? '' : '<span class="ska-premium-pill">Premium</span>'}</span>
                                <strong>${manualLabel}</strong>
                            </div>
                            <input type="range" min="90" max="200" step="1" value="${sliderValue}" data-action="wpm-slider" ${isPremium ? '' : 'disabled'}>
                            <div class="ska-wpm-actions">
                                <button class="ska-btn ska-btn--secondary" data-action="open-benchmark" ${isPremium ? '' : 'disabled'}>Kalibrieren</button>
                                <button class="ska-btn ska-btn--ghost" data-action="reset-wpm" ${isPremium ? '' : 'disabled'}>Auto</button>
                            </div>
                        </div>
                    </div>

                    <div class="ska-settings-section">
                        <div class="ska-settings-section-header">
                            <h4>Inhalt & Zielgruppe</h4>
                            <p>Verfeinere Lesbarkeit und Keyword-Fokus.</p>
                        </div>
                        <div class="ska-settings-field ${isPremium ? '' : 'is-locked'}">
                            <label class="ska-settings-label">Zielgruppe (Komplexität) ${isPremium ? '' : '<span class="ska-premium-pill">Premium</span>'}</label>
                            <select id="ska-set-audience" class="ska-settings-select" ${isPremium ? '' : 'disabled'}>
                                <option value="">Keine Auswahl</option>
                                <option value="kinder" ${this.settings.audienceTarget === 'kinder' ? 'selected' : ''}>Kindersendung</option>
                                <option value="news" ${this.settings.audienceTarget === 'news' ? 'selected' : ''}>Abendnachrichten</option>
                                <option value="fach" ${this.settings.audienceTarget === 'fach' ? 'selected' : ''}>Fachpublikum</option>
                            </select>
                            <p class="ska-settings-help">Warnung bei zu langen Sätzen oder geringer Lesbarkeit für die Zielgruppe.</p>
                        </div>
                        <div class="ska-settings-field ${isPremium ? '' : 'is-locked'}">
                            <label class="ska-settings-label">Keyword-Dichte (SEO vs. Voice) ${isPremium ? '' : '<span class="ska-premium-pill">Premium</span>'}</label>
                            <textarea id="ska-set-focus-keywords" class="ska-settings-textarea" placeholder="z.B. Produktname, Kernbegriff" ${isPremium ? '' : 'disabled'}>${this.settings.focusKeywords || ''}</textarea>
                            <div class="ska-settings-inline">
                                <span class="ska-settings-helper-label">Dichte-Limit (%)</span>
                                <input type="number" step="0.1" min="0" id="ska-set-keyword-limit" value="${this.settings.keywordDensityLimit ?? 2}" class="ska-settings-input ska-settings-input--compact" ${isPremium ? '' : 'disabled'}>
                            </div>
                            <p class="ska-settings-help">Zu hohe Keyword-Dichte klingt beim Vorlesen schnell repetitiv.</p>
                        </div>
                        <div class="ska-settings-field ${isPremium ? '' : 'is-locked'}">
                            <label class="ska-settings-label">Buzzword-Blacklist ${isPremium ? '' : '<span class="ska-premium-pill">Premium</span>'}</label>
                            <textarea id="ska-set-bullshit" class="ska-settings-textarea ska-settings-textarea--lg" placeholder="z.B. synergetisch, agil, lösungsorientiert" ${isPremium ? '' : 'disabled'}>${this.settings.bullshitBlacklist || ''}</textarea>
                            <p class="ska-settings-help">Kommagetrennt oder zeilenweise – wird rot markiert.</p>
                        </div>
                    </div>

                    <div class="ska-settings-section">
                        <div class="ska-settings-section-header">
                            <h4>Rechtliche Pflichttexte</h4>
                            <p>Hinterlege Pflichtpassagen (eine Passage pro Zeile).</p>
                        </div>
                        <div class="ska-settings-field ${isPremium ? '' : 'is-locked'}">
                            <label class="ska-settings-label">Pflichtpassagen (exakter Wortlaut) ${isPremium ? '' : '<span class="ska-premium-pill">Premium</span>'}</label>
                            <textarea id="ska-set-compliance" class="ska-settings-textarea ska-settings-textarea--lg" placeholder="z.B. Dies ist keine Anlageberatung." ${isPremium ? '' : 'disabled'}>${this.settings.complianceText || ''}</textarea>
                            <p class="ska-settings-help">Der Check gibt nur grünes Licht, wenn jede Passage exakt im Skript vorkommt.</p>
                        </div>
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
                    if (!isPremium) return;
                    const val = parseInt(e.target.value, 10);
                    this.settings.manualWpm = val;
                    this.saveUIState();
                    this.updateWpmUI();
                });
                wpmSlider.addEventListener('change', () => {
                    if (!isPremium) return;
                    this.analyze(this.getText());
                });
            }

            const benchmarkBtn = m.querySelector('[data-action="open-benchmark"]');
            if (benchmarkBtn) {
                benchmarkBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isPremium) {
                        this.showPremiumNotice('Die WPM-Kalibrierung ist in der Premium-Version verfügbar.');
                        return;
                    }
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
                    if (!isPremium) {
                        this.showPremiumNotice('Die WPM-Kalibrierung ist in der Premium-Version verfügbar.');
                        return;
                    }
                    this.handleAction('reset-wpm', resetWpmBtn);
                    this.updateWpmUI();
                });
            }

            // Bind radio changes
            m.querySelectorAll('input[type="radio"]').forEach(r => r.addEventListener('change', (e) => {
                if(e.target.name === 'ska-time-mode') {
                    if (!isPremium && e.target.value === 'sps') {
                        this.showPremiumNotice('Die SPS-Berechnung ist Teil der Premium-Version.');
                        e.target.checked = false;
                        return;
                    }
                    this.settings.timeMode = e.target.value;
                }
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
                    if (!isPremium) {
                        this.showPremiumNotice('Die Zielgruppen-Analyse ist in der Premium-Version verfügbar.');
                        e.target.value = '';
                        return;
                    }
                    this.settings.audienceTarget = e.target.value;
                    this.saveUIState();
                    this.analyze(this.getText());
                });
            }

            const commaPauseInput = m.querySelector('#ska-set-comma-pause');
            if (commaPauseInput) {
                commaPauseInput.addEventListener('input', (e) => {
                    if (!isPremium) {
                        this.showPremiumNotice('Die Pausen-Automatik ist in der Premium-Version verfügbar.');
                        return;
                    }
                    this.settings.commaPause = Math.max(0, parseFloat(e.target.value) || 0);
                    this.saveUIState();
                    this.analyze(this.getText());
                });
            }

            const periodPauseInput = m.querySelector('#ska-set-period-pause');
            if (periodPauseInput) {
                periodPauseInput.addEventListener('input', (e) => {
                    if (!isPremium) {
                        this.showPremiumNotice('Die Pausen-Automatik ist in der Premium-Version verfügbar.');
                        return;
                    }
                    this.settings.periodPause = Math.max(0, parseFloat(e.target.value) || 0);
                    this.saveUIState();
                    this.analyze(this.getText());
                });
            }

            const focusInput = m.querySelector('#ska-set-focus-keywords');
            if (focusInput) {
                focusInput.addEventListener('input', (e) => {
                    if (!isPremium) {
                        this.showPremiumNotice('Die Keyword-Analyse ist in der Premium-Version verfügbar.');
                        return;
                    }
                    this.settings.focusKeywords = e.target.value;
                    this.saveUIState();
                    this.analyze(this.getText());
                });
            }

            const keywordLimitInput = m.querySelector('#ska-set-keyword-limit');
            if (keywordLimitInput) {
                keywordLimitInput.addEventListener('input', (e) => {
                    if (!isPremium) {
                        this.showPremiumNotice('Die Keyword-Analyse ist in der Premium-Version verfügbar.');
                        return;
                    }
                    this.settings.keywordDensityLimit = Math.max(0, parseFloat(e.target.value) || 0);
                    this.saveUIState();
                    this.analyze(this.getText());
                });
            }

            const bullshitInput = m.querySelector('#ska-set-bullshit');
            if (bullshitInput) {
                bullshitInput.addEventListener('input', (e) => {
                    if (!isPremium) {
                        this.showPremiumNotice('Die Buzzword-Blacklist ist in der Premium-Version verfügbar.');
                        return;
                    }
                    this.settings.bullshitBlacklist = e.target.value;
                    this.saveUIState();
                    this.analyze(this.getText());
                });
            }

            const complianceInput = m.querySelector('#ska-set-compliance');
            if (complianceInput) {
                complianceInput.addEventListener('input', (e) => {
                    if (!isPremium) {
                        this.showPremiumNotice('Der Pflichttext-Check ist in der Premium-Version verfügbar.');
                        return;
                    }
                    this.settings.complianceText = e.target.value;
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
            this.loadAnalysisUtils(workerUrl);
            try {
                this.analysisWorker = new Worker(workerUrl);
                this.analysisWorker.onmessage = (event) => {
                    const { id, result } = event.data || {};
                    if (!id || !this.workerRequests.has(id)) return;
                    const { resolve } = this.workerRequests.get(id);
                    this.workerRequests.delete(id);
                    resolve(result);
                };
                this.analysisWorker.onerror = () => {
                    this.analysisWorker = null;
                    this.workerRequests.clear();
                };
            } catch (err) {
                this.analysisWorker = null;
            }
        }

        loadAnalysisUtils(workerUrl) {
            if (this.analysisUtilsRequested || !workerUrl || typeof document === 'undefined' || !document.head) return;
            const utilsUrl = workerUrl.replace(/analysis-worker\.js(\?.*)?$/, 'analysis-utils.js');
            if (!utilsUrl || utilsUrl === workerUrl) return;
            if (window.SA_ANALYSIS_UTILS) {
                this.analysisUtilsRequested = true;
                return;
            }
            this.analysisUtilsRequested = true;
            const script = document.createElement('script');
            script.src = utilsUrl;
            script.async = true;
            script.onerror = () => {
                this.analysisUtilsRequested = false;
            };
            document.head.appendChild(script);
        }

        requestWorkerTask(type, payload) {
            if (!this.analysisWorker) return Promise.resolve(null);
            const id = ++this.workerRequestId;
            return new Promise((resolve) => {
                this.workerRequests.set(id, { resolve });
                this.analysisWorker.postMessage({
                    id,
                    type,
                    payload
                });
            });
        }

        requestWorkerReadability(paragraphs) {
            if (!this.analysisWorker) return Promise.resolve([]);
            return this.requestWorkerTask('paragraphs', {
                paragraphs,
                settings: { numberMode: this.settings.numberMode }
            }).then((result) => result || []);
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

        renderBenchmarkBadge(metric, value, label = 'Benchmark') {
            const result = SA_Logic.getBenchmarkPercentile(value, metric);
            if (!result) return '';

            const percentile = Math.round(result.percentile);
            const labelText = result.label ? `${result.label}` : `Perzentil ${percentile}`;

            return `
                <div class="ska-overview-benchmark" style="margin-top:0.55rem; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
                    <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">${label}</span>
                    <span style="background:#e0f2fe; color:#0369a1; font-weight:700; font-size:0.75rem; padding:0.25rem 0.6rem; border-radius:999px;">${labelText}</span>
                    <span style="font-size:0.75rem; color:#94a3b8;">P${percentile}</span>
                </div>`;
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
                            <label class="ska-teleprompter-toggle">
                                <input type="checkbox" data-action="teleprompter-mirror" ${this.settings.teleprompterMirror ? 'checked' : ''}>
                                <span>Spiegeln</span>
                            </label>
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
            this.applyTeleprompterMirror(m);
        }

        applyTeleprompterMirror(modal = null) {
            const target = modal || document.getElementById('ska-teleprompter-modal');
            if (!target) return;
            target.classList.toggle('is-mirrored', !!this.settings.teleprompterMirror);
            const toggle = target.querySelector('[data-action="teleprompter-mirror"]');
            if (toggle) toggle.checked = !!this.settings.teleprompterMirror;
        }

        updateTeleprompterMeta(read) {
            const meta = document.querySelector('[data-role-teleprompter-meta]');
            if (!meta || !read) return;
            const effectiveSettings = this.getEffectiveSettings();
            const isSps = this.getEffectiveTimeMode() === 'sps';
            const wpm = SA_Logic.getWpm(effectiveSettings);
            const sps = SA_Logic.getSps(effectiveSettings);
            const seconds = isSps ? (read.totalSyllables / sps) : (read.speakingWordCount / wpm) * 60;
            const rateLabel = isSps ? `${sps} SPS` : `${wpm} WPM`;
            meta.textContent = `Tempo: ${rateLabel} • Dauer: ${SA_Utils.formatMin(seconds)}`;
        }

        getSpeechRecognitionCtor() {
            if (typeof window === 'undefined') return null;
            return window.SpeechRecognition || window.webkitSpeechRecognition || null;
        }

        normalizeSpeechToken(token) {
            return token
                .toLowerCase()
                .replace(/['’‘]/g, "'")
                .replace(/[^a-z0-9äöüß'-]+/gi, '')
                .trim();
        }

        buildTeleprompterContent(text) {
            const container = document.querySelector('[data-role-teleprompter-text]');
            if (!container) return [];
            const tokens = text.trim().split(/(\s+)/);
            let wordIndex = 0;
            const wordTokens = [];
            const fragments = tokens.map(token => {
                if (!token.trim()) {
                    return token;
                }
                const normalized = this.normalizeSpeechToken(token);
                wordTokens.push(normalized);
                const span = `<span class="ska-teleprompter-word" data-word-index="${wordIndex++}">${token}</span>`;
                return span;
            });
            container.innerHTML = fragments.join('');
            this.state.teleprompter.wordTokens = wordTokens;
            return Array.from(container.querySelectorAll('.ska-teleprompter-word'));
        }

        applyTeleprompterActiveWord(index) {
            const words = this.state.teleprompter.words || [];
            if (!words.length || index < 0 || index >= words.length) return;
            if (this.state.teleprompter.activeIndex !== index) {
                if (this.state.teleprompter.activeIndex >= 0 && words[this.state.teleprompter.activeIndex]) {
                    words[this.state.teleprompter.activeIndex].classList.remove('is-active');
                    words[this.state.teleprompter.activeIndex].classList.add('is-past');
                }
                words[index].classList.add('is-active');
                this.state.teleprompter.activeIndex = index;
            }
        }

        updateTeleprompterHighlight(progress) {
            const words = this.state.teleprompter.words || [];
            if (!words.length) return;
            if (this.state.teleprompter.speechActive && this.state.teleprompter.activeIndex >= 0) return;
            const index = Math.min(words.length - 1, Math.floor(progress * words.length));
            this.applyTeleprompterActiveWord(index);
        }

        startTeleprompterSpeechRecognition() {
            const ctor = this.getSpeechRecognitionCtor();
            if (!ctor) {
                if (!this.state.teleprompter.speechWarningShown) {
                    this.state.teleprompter.speechWarningShown = true;
                    alert('Live-Spracherkennung wird von deinem Browser nicht unterstützt. Bitte nutze Chrome oder Edge.');
                }
                return false;
            }
            if (!this.state.teleprompter.wordTokens || !this.state.teleprompter.wordTokens.length) return false;
            if (this.state.teleprompter.speechActive) return true;

            const recognition = this.state.teleprompter.speechRecognition || new ctor();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'de-DE';

            this.state.teleprompter.speechTranscript = '';
            this.state.teleprompter.speechWordCount = 0;
            this.state.teleprompter.speechIndex = Math.max(0, this.state.teleprompter.activeIndex);

            recognition.onresult = (event) => {
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; i += 1) {
                    const res = event.results[i];
                    if (res.isFinal) {
                        this.state.teleprompter.speechTranscript += `${res[0].transcript} `;
                    } else {
                        interim += res[0].transcript;
                    }
                }

                const combined = `${this.state.teleprompter.speechTranscript} ${interim}`.trim();
                if (!combined) return;
                const spokenWords = combined
                    .split(/\s+/)
                    .map(word => this.normalizeSpeechToken(word))
                    .filter(Boolean);
                if (spokenWords.length <= this.state.teleprompter.speechWordCount) return;

                const newWords = spokenWords.slice(this.state.teleprompter.speechWordCount);
                this.state.teleprompter.speechWordCount = spokenWords.length;

                const tokens = this.state.teleprompter.wordTokens || [];
                let currentIndex = this.state.teleprompter.speechIndex || 0;
                newWords.forEach((word) => {
                    if (!word) return;
                    let matchIndex = -1;
                    for (let i = currentIndex; i < tokens.length; i += 1) {
                        if (tokens[i] === word) {
                            matchIndex = i;
                            break;
                        }
                    }
                    if (matchIndex >= 0) {
                        currentIndex = matchIndex + 1;
                        this.applyTeleprompterActiveWord(matchIndex);
                    }
                });
                this.state.teleprompter.speechIndex = currentIndex;
            };

            recognition.onerror = () => {
                if (!this.state.teleprompter.speechWarningShown) {
                    this.state.teleprompter.speechWarningShown = true;
                    alert('Live-Spracherkennung konnte nicht gestartet werden. Bitte Mikrofon-Freigabe prüfen oder einen unterstützten Browser nutzen.');
                }
                this.stopTeleprompterSpeechRecognition();
            };

            recognition.onend = () => {
                if (this.state.teleprompter.speechActive && this.state.teleprompter.playing) {
                    try {
                        recognition.start();
                    } catch (err) {
                        this.stopTeleprompterSpeechRecognition();
                    }
                }
            };

            this.state.teleprompter.speechRecognition = recognition;
            this.state.teleprompter.speechActive = true;
            try {
                recognition.start();
            } catch (err) {
                this.state.teleprompter.speechActive = false;
                return false;
            }
            return true;
        }

        stopTeleprompterSpeechRecognition() {
            this.state.teleprompter.speechActive = false;
            const recognition = this.state.teleprompter.speechRecognition;
            if (!recognition) return;
            try {
                recognition.stop();
            } catch (err) {
                // no-op
            }
        }

        startTeleprompter(read) {
            const modal = document.getElementById('ska-teleprompter-modal');
            if (!modal || !read) return false;
            const body = modal.querySelector('.ska-teleprompter-body');
            if (!body) return false;
            const effectiveSettings = this.getEffectiveSettings();
            const isSps = this.getEffectiveTimeMode() === 'sps';
            const wpm = SA_Logic.getWpm(effectiveSettings);
            const sps = SA_Logic.getSps(effectiveSettings);
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
            this.startTeleprompterSpeechRecognition();

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
                    this.stopTeleprompterSpeechRecognition();
                    const startBtn = document.querySelector('[data-action="teleprompter-toggle"]');
                    if (startBtn) startBtn.textContent = 'Start';
                }
            };
            this.state.teleprompter.rafId = requestAnimationFrame(step);
            return true;
        }

        pauseTeleprompter() {
            this.state.teleprompter.playing = false;
            if (this.state.teleprompter.rafId) cancelAnimationFrame(this.state.teleprompter.rafId);
            this.state.teleprompter.rafId = null;
            this.stopTeleprompterSpeechRecognition();
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
            this.state.teleprompter.speechIndex = 0;
            this.state.teleprompter.speechTranscript = '';
            this.state.teleprompter.speechWordCount = 0;
            this.pauseTeleprompter();
        }

        updatePacingUI(progress = null) {
            const card = this.bottomGrid?.querySelector('[data-card-id="pacing"]');
            if (!card) return;
            const fill = card.querySelector('[data-role="pacing-fill"]');
            const marker = card.querySelector('[data-role="pacing-marker"]');
            const timeLabel = card.querySelector('[data-role="pacing-time"]');
            const targetLabel = card.querySelector('[data-role="pacing-target"]');
            const preview = card.querySelector('[data-role="pacing-preview"]');
            const duration = this.state.pacing.duration || 0;
            const currentProgress = progress === null ? (duration > 0 ? this.state.pacing.elapsed / duration : 0) : progress;
            const clamped = Math.max(0, Math.min(1, currentProgress));

            if (fill) fill.style.width = `${clamped * 100}%`;
            if (marker) marker.style.left = `${clamped * 100}%`;

            if (timeLabel) {
                const elapsedSec = Math.round((duration * clamped) / 1000);
                timeLabel.textContent = `${SA_Utils.formatMin(elapsedSec)} / ${SA_Utils.formatMin(duration / 1000)}`;
            }
            if (targetLabel) {
                const targetPct = Math.round(clamped * 100);
                targetLabel.textContent = `${targetPct}% Soll-Position`;
            }
            if (preview) {
                const maxScroll = Math.max(0, preview.scrollHeight - preview.clientHeight);
                preview.scrollTop = maxScroll * clamped;
            }
        }

        startPacing(durationSec) {
            if (!durationSec || durationSec <= 0) return false;
            this.state.pacing.duration = durationSec * 1000;
            this.state.pacing.start = performance.now() - (this.state.pacing.elapsed || 0);
            this.state.pacing.playing = true;
            const step = (ts) => {
                if (!this.state.pacing.playing) return;
                const elapsed = ts - this.state.pacing.start;
                this.state.pacing.elapsed = Math.min(elapsed, this.state.pacing.duration);
                const progress = this.state.pacing.duration > 0 ? this.state.pacing.elapsed / this.state.pacing.duration : 0;
                this.updatePacingUI(progress);
                if (progress < 1) {
                    this.state.pacing.rafId = requestAnimationFrame(step);
                } else {
                    this.state.pacing.playing = false;
                }
            };
            if (this.state.pacing.rafId) cancelAnimationFrame(this.state.pacing.rafId);
            this.state.pacing.rafId = requestAnimationFrame(step);
            return true;
        }

        pausePacing() {
            this.state.pacing.playing = false;
            if (this.state.pacing.rafId) cancelAnimationFrame(this.state.pacing.rafId);
            this.state.pacing.rafId = null;
        }

        resetPacing() {
            this.pausePacing();
            this.state.pacing.elapsed = 0;
            this.updatePacingUI(0);
            this.stopClickTrack();
        }

        ensureClickTrackContext() {
            if (this.state.clickTrack.context) return this.state.clickTrack.context;
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return null;
            this.state.clickTrack.context = new AudioCtx();
            return this.state.clickTrack.context;
        }

        playClickTrackTick() {
            const ctx = this.ensureClickTrackContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = 1000;
            gain.gain.setValueAtTime(0.0001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.09);
        }

        startClickTrack(bpm) {
            if (!bpm || bpm <= 0) return false;
            const ctx = this.ensureClickTrackContext();
            if (!ctx) return false;
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            this.stopClickTrack();
            this.state.clickTrack.playing = true;
            this.state.clickTrack.bpm = bpm;
            this.playClickTrackTick();
            const intervalMs = Math.max(200, Math.round(60000 / bpm));
            this.state.clickTrack.timerId = setInterval(() => {
                if (!this.state.clickTrack.playing) return;
                this.playClickTrackTick();
            }, intervalMs);
            this.updateClickTrackButton();
            return true;
        }

        stopClickTrack() {
            if (this.state.clickTrack.timerId) clearInterval(this.state.clickTrack.timerId);
            this.state.clickTrack.timerId = null;
            this.state.clickTrack.playing = false;
            this.updateClickTrackButton();
        }

        updateClickTrackButton() {
            const btn = this.bottomGrid?.querySelector('[data-action="pacing-clicktrack"]');
            if (!btn) return;
            const bpm = parseFloat(btn.dataset.bpm || '0');
            if (this.state.clickTrack.playing) {
                btn.textContent = 'Click-Track stoppen';
            } else if (bpm > 0) {
                btn.textContent = `Click-Track ${bpm} BPM`;
            } else {
                btn.textContent = 'Click-Track (BPM fehlt)';
            }
        }

        parseBullshitList() {
            if (!this.settings.bullshitBlacklist) return [];
            return this.settings.bullshitBlacklist
                .split(/[,|\n]/)
                .map(item => item.trim())
                .filter(Boolean);
        }

        parseComplianceList() {
            if (!this.settings.complianceText) return [];
            return this.settings.complianceText
                .split(/\n+/)
                .map((item) => item.trim())
                .filter(Boolean);
        }

        handleAction(act, btn) {
            if (act.startsWith('format-')) {
                this.applyFormatting(act);
                return true;
            }
            if (act === 'toggle-plan') {
                if (!SA_CONFIG.IS_ADMIN) return true;
                const isPremium = btn.checked;
                this.state.planMode = isPremium ? 'premium' : 'free';
                if (!isPremium) {
                    this.stopClickTrack();
                }
                this.saveUIState();
                this.updatePlanUI();
                this.renderFilterBar();
                this.renderHiddenPanel();
                this.analyze(this.getText());
                return true;
            }
            if (act === 'premium-price-plan') {
                const plan = btn.dataset.plan;
                if (plan) {
                    this.state.premiumPricePlan = plan;
                    this.updatePremiumPlanUI();
                }
                return true;
            }
            if (act === 'premium-info') {
                this.showPremiumNotice('Mehr Informationen zu Premium folgen in Kürze.');
                return true;
            }
            if (act === 'toggle-premium-cards') {
                this.state.showPremiumCards = !this.state.showPremiumCards;
                this.renderUpgradePanel();
                return true;
            }
            if (act === 'close-premium-upgrade') {
                this.state.premiumUpgradeDismissed = true;
                this.saveUIState();
                this.renderUpgradePanel();
                return true;
            }
            if (act === 'open-pdf') {
                const modal = document.getElementById('ska-pdf-modal');
                if (modal) {
                    this.syncPdfOptions();
                    SA_Utils.openModal(modal);
                    document.body.classList.add('ska-modal-open');
                }
                return true;
            }
            if (act === 'open-teleprompter') {
                if (!this.isPremiumActive()) {
                    this.showPremiumNotice('Der Teleprompter ist in der Premium-Version verfügbar.');
                    return true;
                }
                const modal = document.getElementById('ska-teleprompter-modal');
                if (modal) {
                    this.applyTeleprompterMirror(modal);
                    SA_Utils.openModal(modal);
                    document.body.classList.add('ska-modal-open');
                    this.state.teleprompter.words = this.buildTeleprompterContent(this.getText());
                    this.updateTeleprompterMeta(SA_Logic.analyzeReadability(this.getText(), this.settings));
                    this.resetTeleprompter();
                }
                return true;
            }
            if (act === 'toggle-card') {
                const id = btn.dataset.card;
                if (id) {
                    if (!this.isCardUnlocked(id)) {
                        this.showPremiumNotice();
                        btn.checked = false;
                        return true;
                    }
                    const profile = this.settings.role;
                    const allowed = profile && SA_CONFIG.PROFILE_CARDS[profile] ? new Set(SA_CONFIG.PROFILE_CARDS[profile]) : null;
                    if (allowed && !allowed.has(id)) {
                        if (btn.checked) this.state.selectedExtraCards.add(id);
                        else this.state.selectedExtraCards.delete(id);
                    }
                    this.toggleCard(id, !!btn.checked);
                    this.renderFilterBar();
                }
                return true;
            }
            if (act === 'toggle-filter-view') {
                if (this.settings.role) {
                    this.state.showAllCards = !this.state.showAllCards;
                    this.renderFilterBar();
                }
                return true;
            }
            if (act === 'toggle-filter-collapse') {
                this.state.filterCollapsed = !this.state.filterCollapsed;
                if (this.filterBar) {
                    this.filterBar.classList.toggle('is-collapsed', this.state.filterCollapsed);
                    this.filterBar.classList.toggle('is-expanded', !this.state.filterCollapsed);
                    const btn = this.filterBar.querySelector('[data-action="toggle-filter-collapse"]');
                    if (btn) btn.textContent = this.state.filterCollapsed ? 'Ausklappen' : 'Einklappen';
                }
                return true;
            }
            if (act === 'filter-select-all') {
                const profile = this.settings.role;
                const allowed = profile && SA_CONFIG.PROFILE_CARDS[profile] ? new Set(SA_CONFIG.PROFILE_CARDS[profile]) : null;
                const showAll = profile ? this.state.showAllCards : true;
                SA_CONFIG.CARD_ORDER.forEach(id => {
                    if (id === 'overview') return;
                    if (!this.isCardUnlocked(id)) return;
                    if (allowed && !showAll && !allowed.has(id)) return;
                    if (this.state.hiddenCards.has(id)) this.state.hiddenCards.delete(id);
                    if (allowed && showAll && !allowed.has(id)) this.state.selectedExtraCards.add(id);
                });
                this.saveUIState();
                this.renderHiddenPanel();
                this.analyze(this.getText());
                this.renderFilterBar();
                return true;
            }
            if (act === 'filter-deselect-all') {
                const profile = this.settings.role;
                const allowed = profile && SA_CONFIG.PROFILE_CARDS[profile] ? new Set(SA_CONFIG.PROFILE_CARDS[profile]) : null;
                const showAll = profile ? this.state.showAllCards : true;
                SA_CONFIG.CARD_ORDER.forEach(id => {
                    if (id === 'overview') return;
                    if (!this.isCardUnlocked(id)) return;
                    if (allowed && !showAll && !allowed.has(id)) return;
                    if (!this.state.hiddenCards.has(id)) this.state.hiddenCards.add(id);
                    if (allowed && showAll && !allowed.has(id)) this.state.selectedExtraCards.delete(id);
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
                if (!this.isPremiumActive()) {
                    this.showPremiumNotice('Die WPM-Kalibrierung ist in der Premium-Version verfügbar.');
                    return true;
                }
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
                if (!this.isPremiumActive()) {
                    this.showPremiumNotice('Die WPM-Kalibrierung ist in der Premium-Version verfügbar.');
                    return true;
                }
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
                if (!this.isPremiumActive()) {
                    this.showPremiumNotice('Die WPM-Kalibrierung ist in der Premium-Version verfügbar.');
                    return true;
                }
                const modal = document.getElementById('ska-benchmark-modal');
                const wpm = this.state.benchmark.wpm;
                if (wpm && wpm > 0) {
                    this.settings.manualWpm = wpm;
                    this.saveUIState();
                    this.updateWpmUI();
                    this.analyze(this.getText());
                }
                if (modal) {
                    modal.classList.remove('is-open');
                    document.body.classList.remove('ska-modal-open');
                    if (this.state.benchmark.timerId) {
                        clearInterval(this.state.benchmark.timerId);
                        this.state.benchmark.timerId = null;
                    }
                    this.state.benchmark.running = false;
                }
                return true;
            }

            if (act === 'teleprompter-toggle') {
                if (!this.isPremiumActive()) {
                    this.showPremiumNotice('Der Teleprompter ist in der Premium-Version verfügbar.');
                    return true;
                }
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
                if (!this.isPremiumActive()) {
                    this.showPremiumNotice('Der Teleprompter ist in der Premium-Version verfügbar.');
                    return true;
                }
                this.resetTeleprompter();
                const startBtn = document.querySelector('[data-action="teleprompter-toggle"]');
                if (startBtn) startBtn.textContent = 'Start';
                return true;
            }

            if (act === 'teleprompter-bigger' || act === 'teleprompter-smaller') {
                if (!this.isPremiumActive()) {
                    this.showPremiumNotice('Der Teleprompter ist in der Premium-Version verfügbar.');
                    return true;
                }
                const textEl = document.querySelector('[data-role-teleprompter-text]');
                if (textEl) {
                    const current = parseFloat(window.getComputedStyle(textEl).fontSize);
                    const next = act === 'teleprompter-bigger' ? current + 2 : current - 2;
                    textEl.style.fontSize = `${Math.max(16, Math.min(36, next))}px`;
                }
                return true;
            }

            if (act === 'teleprompter-export-txt' || act === 'teleprompter-export-json') {
                if (!this.isPremiumActive()) {
                    this.showPremiumNotice('Der Teleprompter-Export ist in der Premium-Version verfügbar.');
                    return true;
                }
                const text = this.getText();
                if (!text.trim()) return true;
                const exportData = SA_Logic.generateTeleprompterExport(text, this.settings);
                if (act === 'teleprompter-export-txt') {
                    const lines = exportData.map(item => `[${item.time}] ${item.text}`);
                    SA_Utils.downloadText(lines.join('\n\n'), 'teleprompter-export.txt');
                } else {
                    SA_Utils.downloadJSON(exportData, 'teleprompter-export.json');
                }
                return true;
            }

            if (act === 'pacing-toggle') {
                if (!this.isPremiumActive()) {
                    this.showPremiumNotice('Das Sprech-Pacing ist in der Premium-Version verfügbar.');
                    return true;
                }
                const btnLabel = btn;
                if (this.state.pacing.playing) {
                    this.pausePacing();
                    if (btnLabel) btnLabel.textContent = 'Start';
                } else {
                    const durationSec = parseFloat(btn.dataset.duration || '0');
                    const started = this.startPacing(durationSec);
                    if (btnLabel) btnLabel.textContent = started ? 'Pause' : 'Start';
                }
                return true;
            }

            if (act === 'pacing-clicktrack') {
                if (!this.isPremiumActive()) {
                    this.showPremiumNotice('Der Click-Track ist in der Premium-Version verfügbar.');
                    return true;
                }
                const bpm = parseFloat(btn.dataset.bpm || '0');
                if (!bpm || bpm <= 0) {
                    this.showPremiumNotice('Kein BPM-Wert verfügbar. Ergänze mehr Text für eine Analyse.');
                    return true;
                }
                if (this.state.clickTrack.playing) {
                    this.stopClickTrack();
                } else {
                    this.startClickTrack(bpm);
                }
                return true;
            }

            if (act === 'pacing-reset') {
                this.resetPacing();
                const startBtn = this.bottomGrid?.querySelector('[data-action="pacing-toggle"]');
                if (startBtn) startBtn.textContent = 'Start';
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
            if (SA_CONFIG.IS_ADMIN) {
                const p = SA_Utils.storage.load(SA_CONFIG.UI_KEY_PLAN);
                if (p === 'premium' || p === 'free') this.state.planMode = p;
            }
            if (!SA_CONFIG.PRO_MODE) {
                this.state.planMode = 'free';
            }

            if (this.isPremiumActive()) {
                const upgradeDismissed = SA_Utils.storage.load(SA_CONFIG.UI_KEY_UPGRADE_DISMISSED);
                if (upgradeDismissed) {
                    this.state.premiumUpgradeDismissed = upgradeDismissed === 'true';
                }
            } else {
                this.state.premiumUpgradeDismissed = false;
            }
            
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
                if(typeof global.complianceText !== 'undefined') this.settings.complianceText = global.complianceText;
                if(typeof global.teleprompterMirror !== 'undefined') this.settings.teleprompterMirror = global.teleprompterMirror;
                
                // Sync Radio
                const m = document.getElementById('ska-settings-modal');
                if(m) {
                    const r = m.querySelector(`input[name="ska-time-mode"][value="${this.settings.timeMode}"]`);
                    if(r) r.checked = true;
                }
            }
            this.enforceFreeSettings();
            if (!this.isPremiumActive()) {
                this.saveUIState();
            }
        }

        saveUIState() {
            SA_Utils.storage.save(SA_CONFIG.UI_KEY_HIDDEN, JSON.stringify([...this.state.hiddenCards]));
            SA_Utils.storage.save(SA_CONFIG.UI_KEY_EXCLUDED, JSON.stringify([...this.state.excludedCards]));
            if (SA_CONFIG.IS_ADMIN) {
                SA_Utils.storage.save(SA_CONFIG.UI_KEY_PLAN, this.state.planMode);
            }
            const upgradeDismissed = this.isPremiumActive() ? false : this.state.premiumUpgradeDismissed;
            SA_Utils.storage.save(SA_CONFIG.UI_KEY_UPGRADE_DISMISSED, String(upgradeDismissed));
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
                keywordDensityLimit: this.settings.keywordDensityLimit,
                complianceText: this.settings.complianceText,
                teleprompterMirror: this.settings.teleprompterMirror
            }));
        }

        updatePlanUI() {
            const label = document.querySelector('[data-role-plan-label]');
            if (label) {
                label.textContent = this.isPremiumActive() ? 'Premium freigeschaltet' : '100% Kostenlos & Sicher';
            }
            const toggle = document.querySelector('[data-action="toggle-plan"]');
            if (toggle && toggle instanceof HTMLInputElement) {
                toggle.checked = this.isPremiumActive();
                toggle.disabled = !SA_CONFIG.PRO_MODE && !SA_CONFIG.IS_ADMIN;
            }
            const saveBtn = document.querySelector('[data-action="save-version"]');
            if (saveBtn && saveBtn instanceof HTMLButtonElement) {
                const isPremium = this.isPremiumActive();
                saveBtn.disabled = !isPremium;
                saveBtn.classList.toggle('is-disabled', !isPremium);
                saveBtn.setAttribute('aria-disabled', String(!isPremium));
                const tooltip = saveBtn.closest('.ska-tool-wrapper')?.querySelector('.ska-tool-tooltip--premium');
                if (tooltip) {
                    tooltip.textContent = isPremium
                        ? 'Premium: Versionen speichern & vergleichen.'
                        : 'Nur mit Premium verfügbar.';
                }
            }
            document.body.classList.toggle('ska-plan-premium', this.isPremiumActive());
            if (typeof window !== 'undefined') {
                window.SKA_PLAN_MODE = this.state.planMode;
            }
            this.enforceFreeSettings();
            this.syncPdfOptions();
            this.renderSettingsModal();
        }

        enforceFreeSettings() {
            if (this.isPremiumActive()) return;
            this.state.planMode = 'free';
            this.settings.timeMode = 'wpm';
            this.settings.manualWpm = 0;
            this.settings.commaPause = 0.2;
            this.settings.periodPause = 0.5;
            this.settings.audienceTarget = '';
            this.settings.focusKeywords = '';
            this.settings.complianceText = '';
            this.settings.keywordDensityLimit = 2;
            this.settings.bullshitBlacklist = '';
        }

        syncPdfOptions() {
            const modal = document.getElementById('ska-pdf-modal');
            if (!modal) return;
            this.ensurePdfNotesOption();
            const isPremium = this.isPremiumActive();
            const premiumOptionIds = [
                'pdf-opt-details',
                'pdf-opt-tips',
                'pdf-opt-compare',
                'pdf-opt-syllable-entropy',
                'pdf-opt-compliance',
                'pdf-opt-notes'
            ];
            const allOptionIds = [
                'pdf-opt-overview',
                'pdf-opt-details',
                'pdf-opt-syllable-entropy',
                'pdf-opt-compliance',
                'pdf-opt-tips',
                'pdf-opt-compare',
                'pdf-opt-notes',
                'pdf-opt-script'
            ];
            premiumOptionIds.forEach((id) => {
                const input = modal.querySelector(`#${id}`);
                if (!input) return;
                input.disabled = !isPremium;
                if (!isPremium) {
                    input.checked = false;
                }
            });
            if (isPremium) {
                allOptionIds.forEach((id) => {
                    const input = modal.querySelector(`#${id}`);
                    if (input) input.checked = true;
                });
            }
        }

        ensurePdfNotesOption() {
            const modal = document.getElementById('ska-pdf-modal');
            if (!modal) return;
            const grid = modal.querySelector('.ska-compact-options-grid');
            if (!grid) return;
            if (grid.querySelector('#pdf-opt-notes')) return;

            const label = document.createElement('label');
            label.className = 'ska-compact-option ska-compact-option--premium ska-full-width-option';
            label.innerHTML = `
                <input type="checkbox" id="pdf-opt-notes" checked>
                <div class="ska-compact-option-inner">
                    <div class="ska-option-check"></div>
                    <div class="ska-option-text">
                        <strong>Skript mit Notizspalte <span class="ska-premium-pill">Premium</span></strong>
                        <span>Links Skript, rechts Platz für Notizen.</span>
                    </div>
                </div>
            `;

            const scriptOption = grid.querySelector('#pdf-opt-script')?.closest('label');
            if (scriptOption) {
                grid.insertBefore(label, scriptOption);
            } else {
                grid.appendChild(label);
            }
        }

        showPremiumNotice(message = 'Diese Funktion ist in der Premium-Version verfügbar.') {
            alert(message);
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
                item.onclick = (e) => {
                    e.preventDefault();
                    SA_Utils.insertMarkerAtCursor(this.textarea, m.val);
                    this.analyze(this.getText());
                    menu.classList.remove('is-open');
                };
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
                    if (k === 'role') {
                        this.state.showAllCards = false;
                        this.state.selectedExtraCards.clear();
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
                const upgradeLink = e.target.closest('[href="#ska-premium-upgrade"]');
                const hideBtn = e.target.closest('.ska-hide-btn');
                const restoreChip = e.target.closest('.ska-restore-chip');
                const whitelistBtn = e.target.closest('.ska-whitelist-toggle');

                if (upgradeLink && this.state.premiumUpgradeDismissed) {
                    this.state.premiumUpgradeDismissed = false;
                    this.saveUIState();
                    this.renderUpgradePanel();
                }

                if (this.handleSynonymQuickAction(e.target)) {
                    return;
                }

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
                    if (act === 'open-syllable-entropy' && !this.isPremiumActive()) {
                        e.preventDefault();
                        return;
                    }
                    const modalId = 'ska-' + act.replace('open-', '') + '-modal';
                    const m = document.getElementById(modalId);
                    if(m){ 
                        if (modalId === 'ska-settings-modal') {
                            this.renderSettingsModal();
                            const newM = document.getElementById('ska-settings-modal');
                            if (newM) {
                                SA_Utils.openModal(newM);
                                document.body.classList.add('ska-modal-open');
                            }
                            e.preventDefault();
                            return;
                        }

                        if (modalId === 'ska-benchmark-modal') {
                            this.renderBenchmarkModal();
                            const newM = document.getElementById('ska-benchmark-modal');
                            if (newM) {
                                SA_Utils.openModal(newM);
                                document.body.classList.add('ska-modal-open');
                            }
                            e.preventDefault();
                            return;
                        }

                        if (modalId === 'ska-teleprompter-modal') {
                            this.renderTeleprompterModal();
                            const newM = document.getElementById('ska-teleprompter-modal');
                            if (newM) {
                                SA_Utils.openModal(newM);
                                document.body.classList.add('ska-modal-open');
                                this.state.teleprompter.words = this.buildTeleprompterContent(this.getText());
                                const read = SA_Logic.analyzeReadability(this.getText(), this.settings);
                                this.updateTeleprompterMeta(read);
                                this.resetTeleprompter();
                            }
                            e.preventDefault();
                            return;
                        }

                        SA_Utils.openModal(m);
                        document.body.classList.add('ska-modal-open');
                        
                        // If it's settings modal, re-render to ensure latest state (target time etc)
                        if (modalId === 'ska-syllable-entropy-modal') {
                            this.renderSyllableEntropyModal(this.state.syllableEntropyIssues || []);
                            const newM = document.getElementById('ska-syllable-entropy-modal');
                            if (newM) SA_Utils.openModal(newM);
                        }
                        
                        e.preventDefault(); 
                    } else if (modalId === 'ska-syllable-entropy-modal') {
                        this.renderSyllableEntropyModal(this.state.syllableEntropyIssues || []);
                        const newM = document.getElementById('ska-syllable-entropy-modal');
                        if (newM) {
                            SA_Utils.openModal(newM);
                            document.body.classList.add('ska-modal-open');
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
                 if (!this.isPremiumActive()) {
                     e.preventDefault();
                     return;
                 }
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
                if (!this.isPremiumActive()) {
                    e.preventDefault();
                    return;
                }
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
                if (!this.isPremiumActive()) {
                    e.preventDefault();
                    return;
                }
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
                    if (!this.isPremiumActive()) {
                        this.showPremiumNotice('Die Funktion „Version merken“ ist in der Premium-Version verfügbar.');
                        return;
                    }
                    this.state.savedVersion = this.getText(); 
                    SA_Utils.storage.save(SA_CONFIG.SAVED_VERSION_KEY, this.state.savedVersion);
                    const h=this.root.querySelector('[data-role-toast]'); if(h){ h.classList.add('is-visible'); setTimeout(()=>h.classList.remove('is-visible'),2500); }
                    this.analyze(this.getText()); 
                    setTimeout(() => {
                        if (this.compareRow && this.compareRow.classList.contains('is-active')) {
                            this.compareRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 150);
                }

                if(act === 'export-marker-json') {
                    const markers = this.state.markerData || SA_Logic.generateMarkerData(this.getText(), this.getEffectiveSettings());
                    const filename = SA_Utils.buildExportFilename('skript-marker-export', 'json');
                    SA_Utils.downloadJSON(markers, filename);
                }

                if(act === 'export-marker-csv') {
                    const markers = this.state.markerData || SA_Logic.generateMarkerData(this.getText(), this.getEffectiveSettings());
                    const csv = SA_Logic.formatMarkerCsv(markers);
                    const filename = SA_Utils.buildExportFilename('skript-marker-export', 'csv');
                    SA_Utils.downloadText(csv, filename, { bom: true, mime: 'text/csv;charset=utf-8' });
                }

                if(act === 'export-marker-edl') {
                    const markers = this.state.markerData || SA_Logic.generateMarkerData(this.getText(), this.getEffectiveSettings());
                    const edl = SA_Logic.formatMarkerEdl(markers, { title: 'Skript Marker Export' });
                    const filename = SA_Utils.buildExportFilename('skript-marker-export', 'edl');
                    SA_Utils.downloadText(edl, filename, { bom: true, mime: 'text/plain;charset=utf-8' });
                }
            });

            document.body.addEventListener('change', (e) => {
                const mirrorToggle = e.target.closest('[data-action="teleprompter-mirror"]');
                if (mirrorToggle) {
                    this.settings.teleprompterMirror = mirrorToggle.checked;
                    this.saveUIState();
                    this.applyTeleprompterMirror();
                }
            });

            document.body.addEventListener('click', (e) => {
                const modal = e.target.closest('.skriptanalyse-modal');
                if(!modal) return; 

                const btn = e.target.closest('[data-action]');
                const overlay = e.target.classList.contains('skriptanalyse-modal-overlay');
                
                if(overlay) {
                    SA_Utils.closeModal(modal, () => {
                        document.body.classList.remove('ska-modal-open');
                        if (modal.id === 'ska-teleprompter-modal') this.resetTeleprompter();
                        if (modal.id === 'ska-benchmark-modal' && this.state.benchmark.timerId) {
                            clearInterval(this.state.benchmark.timerId);
                            this.state.benchmark.timerId = null;
                            this.state.benchmark.running = false;
                        }
                    });
                    return;
                }

                if(!btn) return;
                const act = btn.dataset.action;

                if(act.startsWith('close-')) { 
                    SA_Utils.closeModal(modal, () => {
                        document.body.classList.remove('ska-modal-open');
                        if (modal.id === 'ska-teleprompter-modal') this.resetTeleprompter();
                        if (modal.id === 'ska-benchmark-modal' && this.state.benchmark.timerId) {
                            clearInterval(this.state.benchmark.timerId);
                            this.state.benchmark.timerId = null;
                            this.state.benchmark.running = false;
                        }
                    });
                    e.preventDefault(); 
                }

                if (this.handleAction(act, btn)) return;

                if(act === 'generate-pdf-final') {
                    const isPremium = this.isPremiumActive();
                    const opts = { 
                        metrics: modal.querySelector('#pdf-opt-overview')?.checked, 
                        details: isPremium && modal.querySelector('#pdf-opt-details')?.checked, 
                        tips: isPremium && modal.querySelector('#pdf-opt-tips')?.checked, 
                        compare: isPremium && modal.querySelector('#pdf-opt-compare')?.checked, 
                        script: modal.querySelector('#pdf-opt-script')?.checked,
                        notesColumn: isPremium && modal.querySelector('#pdf-opt-notes')?.checked,
                        syllableEntropy: isPremium && modal.querySelector('#pdf-opt-syllable-entropy')?.checked,
                        compliance: isPremium && modal.querySelector('#pdf-opt-compliance')?.checked
                    };
                    const pdfData = { ...this.state.currentData, savedVersion: this.state.savedVersion };
                    const pdfSettings = this.getEffectiveSettings();
                    SA_PDF.generate(this.getText(), pdfData, pdfSettings, opts, btn);
                }

                if(act === 'confirm-reset') {
                    this.setText(''); 
                    this.settings={usecase:'auto',lastGenre:'',charMode:'spaces',numberMode:'digit',branch:'all',targetSec:0,role:'',manualWpm:0, timeMode:'wpm', audienceTarget:'', bullshitBlacklist:'', commaPause:0.2, periodPause:0.5, focusKeywords:'', keywordDensityLimit:2, complianceText:''}; 
                    this.state.savedVersion=''; 
                    SA_Utils.storage.clear(SA_CONFIG.SAVED_VERSION_KEY);
                    this.state.hiddenCards.clear(); 
                    this.state.excludedCards.clear();
                    this.state.readabilityCache = [];
                    this.state.premiumUpgradeDismissed = false;
                    this.saveUIState();
                    this.renderHiddenPanel();
                    this.root.querySelectorAll('select').forEach(s=>s.selectedIndex=0); 
                    if(this.targetInput)this.targetInput.value='';
                    this.analyze('');
                    SA_Utils.closeModal(modal, () => {
                        document.body.classList.remove('ska-modal-open');
                    });
                }
            });
        }

        initSynonymTooltip() {
            if (this.synonymTooltip) return;
            const tooltip = document.createElement('div');
            tooltip.className = 'ska-synonym-tooltip';
            tooltip.setAttribute('aria-hidden', 'true');
            tooltip.innerHTML = '<div class="ska-synonym-tooltip-header">Synonyme</div>';
            tooltip.addEventListener('click', (e) => {
                if (this.handleSynonymQuickAction(e.target)) {
                    e.preventDefault();
                }
            });
            tooltip.addEventListener('mouseenter', () => {
                if (this.synonymHoverState.hideTimer) {
                    clearTimeout(this.synonymHoverState.hideTimer);
                    this.synonymHoverState.hideTimer = null;
                }
            });
            tooltip.addEventListener('mouseleave', () => {
                this.scheduleSynonymTooltipHide();
            });
            document.body.appendChild(tooltip);
            this.synonymTooltip = tooltip;
        }

        handleSynonymQuickAction(target) {
            const synonymInsert = target.closest('[data-action="synonym-insert"]');
            const synonymCopy = target.closest('[data-action="synonym-copy"]');
            if (synonymInsert && this.textarea) {
                const synonym = synonymInsert.dataset.synonym || '';
                if (synonym) {
                    SA_Utils.insertAtCursor(this.textarea, synonym);
                    this.analyze(this.getText());
                }
                this.hideSynonymTooltip(true);
                return true;
            }
            if (synonymCopy) {
                const list = synonymCopy.dataset.synonyms || '';
                const originalText = synonymCopy.textContent;
                SA_Utils.copyToClipboard(list).then((success) => {
                    synonymCopy.textContent = success ? 'Kopiert!' : 'Kopieren fehlgeschlagen';
                    setTimeout(() => { synonymCopy.textContent = originalText; }, 1200);
                });
                return true;
            }
            return false;
        }

        scheduleSynonymTooltipHide() {
            if (!this.synonymTooltip) return;
            if (this.synonymHoverState.hideTimer) {
                clearTimeout(this.synonymHoverState.hideTimer);
            }
            this.synonymHoverState.hideTimer = setTimeout(() => {
                this.hideSynonymTooltip();
            }, 120);
        }

        hideSynonymTooltip(force = false) {
            if (!this.synonymTooltip) return;
            if (this.synonymHoverState.hideTimer) {
                clearTimeout(this.synonymHoverState.hideTimer);
                this.synonymHoverState.hideTimer = null;
            }
            if (force || !this.synonymTooltip.matches(':hover')) {
                this.synonymTooltip.classList.remove('is-visible');
                this.synonymTooltip.setAttribute('aria-hidden', 'true');
                this.synonymHoverState.activeWord = null;
                this.synonymHoverState.activeTarget = null;
            }
        }

        showSynonymTooltip(target) {
            if (!target || !this.synonymTooltip) return;
            const rawWord = target.dataset.synonymWord || target.textContent || '';
            const word = SA_Utils.normalizeWord(rawWord);
            if (!word) return;
            if (this.synonymHoverState.hideTimer) {
                clearTimeout(this.synonymHoverState.hideTimer);
                this.synonymHoverState.hideTimer = null;
            }
            this.synonymHoverState.activeWord = word;
            this.synonymHoverState.activeTarget = target;
            this.renderSynonymTooltipContent({ state: 'loading', word });
            this.positionSynonymTooltip(target);
            this.synonymTooltip.classList.add('is-visible');
            this.synonymTooltip.setAttribute('aria-hidden', 'false');

            const requestId = ++this.synonymHoverState.requestId;
            this.getSynonymsForWord(word).then((data) => {
                if (this.synonymHoverState.activeWord !== word || requestId !== this.synonymHoverState.requestId) return;
                this.renderSynonymTooltipContent(data);
                this.positionSynonymTooltip(target);
            });
        }

        positionSynonymTooltip(target) {
            if (!this.synonymTooltip || !target) return;
            const rect = target.getBoundingClientRect();
            const tooltipRect = this.synonymTooltip.getBoundingClientRect();
            const spacing = 10;
            const top = rect.top - tooltipRect.height - spacing;
            const fallbackTop = rect.bottom + spacing;
            const finalTop = (top > 8) ? top : fallbackTop;
            const left = Math.min(
                window.innerWidth - tooltipRect.width - 12,
                Math.max(12, rect.left + (rect.width / 2) - (tooltipRect.width / 2))
            );
            this.synonymTooltip.style.top = `${finalTop}px`;
            this.synonymTooltip.style.left = `${left}px`;
        }

        async getSynonymsForWord(word) {
            const normalized = SA_Utils.normalizeWord(word);
            if (!normalized) {
                return { word: '', synonyms: [], source: 'none', fallback: true, premiumLocked: false };
            }
            if (this.synonymCache.has(normalized)) {
                return this.synonymCache.get(normalized);
            }

            const localSynonyms = SA_Utils.uniqueList(SA_CONFIG.THESAURUS_DB[normalized] || []);
            const hasLocal = localSynonyms.length > 0;
            const allowRemote = this.isPremiumActive() && SA_CONFIG.THESAURUS_SOURCE.apiUrl;
            const premiumLocked = !this.isPremiumActive() && Boolean(SA_CONFIG.THESAURUS_SOURCE.apiUrl);

            if (!allowRemote) {
                const result = { word: normalized, synonyms: localSynonyms, source: hasLocal ? 'local' : 'none', fallback: !hasLocal, premiumLocked };
                this.synonymCache.set(normalized, result);
                return result;
            }

            if (typeof navigator !== 'undefined' && navigator.onLine === false) {
                const result = { word: normalized, synonyms: localSynonyms, source: hasLocal ? 'local' : 'offline', fallback: true, premiumLocked };
                this.synonymCache.set(normalized, result);
                return result;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), SA_CONFIG.THESAURUS_SOURCE.timeoutMs);
            try {
                const response = await fetch(`${SA_CONFIG.THESAURUS_SOURCE.apiUrl}${encodeURIComponent(normalized)}`, { signal: controller.signal });
                if (!response.ok) throw new Error('Thesaurus API error');
                const data = await response.json();
                const remoteSynonyms = [];
                (data.synsets || []).forEach((set) => {
                    (set.terms || []).forEach((term) => {
                        const value = SA_Utils.normalizeWord(term.term || term.word || '');
                        if (value && value !== normalized) {
                            remoteSynonyms.push(value);
                        }
                    });
                });
                const merged = SA_Utils.uniqueList(remoteSynonyms.length ? remoteSynonyms : localSynonyms)
                    .slice(0, SA_CONFIG.THESAURUS_SOURCE.maxResults);
                const result = {
                    word: normalized,
                    synonyms: merged,
                    source: remoteSynonyms.length ? 'api' : (hasLocal ? 'local' : 'none'),
                    fallback: !remoteSynonyms.length,
                    premiumLocked
                };
                this.synonymCache.set(normalized, result);
                return result;
            } catch (err) {
                const result = { word: normalized, synonyms: localSynonyms, source: hasLocal ? 'local' : 'error', fallback: true, premiumLocked };
                this.synonymCache.set(normalized, result);
                return result;
            } finally {
                clearTimeout(timeoutId);
            }
        }

        renderSynonymTooltipContent(data) {
            if (!this.synonymTooltip) return;
            const word = data.word || '';
            if (data.state === 'loading') {
                this.synonymTooltip.innerHTML = `
                    <div class="ska-synonym-tooltip-header">Synonyme</div>
                    <div class="ska-synonym-tooltip-note">Suche nach Vorschlägen...</div>`;
                return;
            }
            const synonyms = (data.synonyms || []).slice(0, SA_CONFIG.THESAURUS_SOURCE.maxResults);
            const sourceLabels = {
                api: 'Online-Thesaurus',
                local: 'Lokaler Thesaurus',
                offline: 'Offline',
                none: 'Keine Daten',
                error: 'Fallback'
            };
            const sourceLabel = sourceLabels[data.source] || 'Thesaurus';
            const chipsHtml = synonyms.length
                ? `<div class="ska-synonym-list">${synonyms.map((syn) => `<button type="button" class="ska-synonym-chip" data-action="synonym-insert" data-synonym="${SA_Utils.escapeHtml(syn)}">${SA_Utils.escapeHtml(syn)}</button>`).join('')}</div>`
                : `<div class="ska-synonym-tooltip-note">Keine Synonyme gefunden.</div>`;
            const copyText = synonyms.join(', ');
            const premiumNote = data.premiumLocked ? '<div class="ska-synonym-tooltip-note">Premium: Online-Thesaurus freischalten.</div>' : '';
            const fallbackNote = data.fallback && synonyms.length ? '<div class="ska-synonym-tooltip-note">Fallback aktiv (lokale Daten).</div>' : '';

            this.synonymTooltip.innerHTML = `
                <div class="ska-synonym-tooltip-header">
                    <span>Synonyme zu "${SA_Utils.escapeHtml(word)}"</span>
                    <span class="ska-synonym-tooltip-source">${sourceLabel}</span>
                </div>
                ${chipsHtml}
                <div class="ska-synonym-actions">
                    <button type="button" class="ska-synonym-action-btn" data-action="synonym-copy" data-synonyms="${SA_Utils.escapeHtml(copyText)}" ${copyText ? '' : 'disabled'}>Synonyme kopieren</button>
                </div>
                ${premiumNote}
                ${fallbackNote}
            `;
        }

        toggleCard(id, visible) {
            if(!visible) {
                const c = this.bottomGrid.querySelector(`[data-card-id="${id}"]`);
                if(c) { 
                    this.state.hiddenCards.add(id); 
                    this.saveUIState();
                    c.remove(); 
                    this.renderHiddenPanel(); 
                    this.renderFilterBar();
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
            const profile = this.settings.role;
            const allowed = profile && SA_CONFIG.PROFILE_CARDS[profile] ? new Set(SA_CONFIG.PROFILE_CARDS[profile]) : null;
            const sorted = SA_CONFIG.CARD_ORDER.filter(id => {
                if (!this.state.hiddenCards.has(id) || !this.isCardAvailable(id) || !this.isCardUnlocked(id)) return false;
                if (!allowed) return true;
                return allowed.has(id) || this.state.selectedExtraCards.has(id);
            });
            if(sorted.length) {
                this.hiddenPanel.innerHTML = '<div class="ska-hidden-label">Ausgeblendet (Klicken zum Wiederherstellen):</div>';
                sorted.forEach(id => {
                    const b = document.createElement('div'); b.className = 'ska-restore-chip'; b.dataset.restoreId = id;
                    b.innerHTML = `<span>+</span> ${SA_CONFIG.CARD_TITLES[id]||id}`; this.hiddenPanel.appendChild(b);
                });
            }
        }

        renderLegend() {
            if (this.legendContainer) {
                const isPremium = this.isPremiumActive();
                const legendItems = [
                    { title: 'Auffällige Sätze', text: 'Zeigt Sätze > 25 Wörter oder viele Kommas.' },
                    { title: 'Wort-Echos', text: 'Markiert Wiederholungen auf engem Raum.' },
                    { title: 'Dynamik-Check', text: 'Findet Passiv-Formulierungen.' },
                    { title: 'Bürokratie', text: 'Markiert Nominalstil (Ung/Heit/Keit).' },
                    { title: 'Denglisch', text: 'Findet unnötige Anglizismen.' },
                    { title: 'Buzzword-Check', text: 'Markiert Phrasen aus der Blacklist.', premium: true },
                    { title: 'Verb-Fokus', text: 'Warnt bei nominalem Stil.', premium: true },
                    { title: 'Teleprompter', text: 'Scrollt im Tempo der Analyse.', premium: true },
                    { title: 'Profilansicht', text: 'Zeigt nur die Boxen des ausgewählten Profils.' },
                    { title: 'Alle Boxen', text: 'Ermöglicht zusätzliche Boxen im Profil.' },
                    { title: 'Ausklappen/Einklappen', text: 'Blendet die Auswahl kompakt ein oder aus.' },
                    { title: 'Export', text: 'Teleprompter als .txt/.json exportieren für Cutter & Sprecher.', premium: true }
                ];
                const filteredItems = legendItems.filter(item => isPremium || !item.premium);
                const legendHtml = filteredItems.map(item => `<div class="ska-legend-def"><strong>${item.title}:</strong> ${item.text}</div>`).join('');
                const footerHtml = `
                    <div class="ska-legend-def" style="grid-column: 1 / -1; border-top:1px solid #f1f5f9; padding-top:0.8rem; margin-top:0.4rem;"><strong>🔒 Datenschutz:</strong> Die Analyse erfolgt zu 100% lokal in deinem Browser. Kein Text wird an einen Server gesendet.</div>
                    <div class="ska-legend-def" style="grid-column: 1 / -1;"><strong>⏱️ Methodik:</strong> Zeitberechnung basiert auf Genre-WPM, Pausenmarkern und Zahlen-zu-Wort-Logik.</div>
                    <div class="ska-legend-def" style="grid-column: 1 / -1;"><strong>💡 Tipp:</strong> Kürzere Sätze & aktive Formulierungen verbessern den Flesch-Index spürbar.</div>`;
                this.legendContainer.innerHTML = `<div class="ska-legend-box"><div class="ska-card-header" style="padding-bottom:0; border:none; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;"><h3>Legende & Hilfe</h3><button class="ska-legend-help-btn" data-action="open-help">Anleitung öffnen</button></div><div class="ska-legend-body" style="padding-top:0;"><div class="ska-legend-grid">${legendHtml}${footerHtml}</div></div></div>`;
            }
        }

        renderFilterBar() {
            if (!this.filterBar) return;
            const profile = this.settings.role;
            const allowed = profile && SA_CONFIG.PROFILE_CARDS[profile] ? new Set(SA_CONFIG.PROFILE_CARDS[profile]) : null;
            const items = SA_CONFIG.CARD_ORDER.filter(id => SA_CONFIG.CARD_TITLES[id]);
            const showAll = profile ? this.state.showAllCards : true;
            const title = 'Analyseboxen auswählen';
            const isExpanded = !this.state.filterCollapsed;
            this.filterBar.classList.toggle('is-expanded', isExpanded);
            this.filterBar.classList.toggle('is-collapsed', this.state.filterCollapsed);
            const collapseLabel = this.state.filterCollapsed ? 'Ausklappen' : 'Einklappen';
            const filteredItems = items.filter((id) => {
                if (!allowed) return true;
                if (showAll) return true;
                return allowed.has(id);
            });
            const isPremium = this.isPremiumActive();
            const freeItems = !isPremium ? filteredItems.filter(id => this.isCardUnlocked(id)) : filteredItems;
            const premiumItems = !isPremium ? [...new Set(filteredItems.filter(id => !this.isCardUnlocked(id)))] : [];
            const premiumLabel = !isPremium && premiumItems.length ? `
                <div class="ska-filterbar-premium-label">
                    <span>Premium-Vorschau</span>
                </div>` : '';
            const premiumPreview = !isPremium && premiumItems.length ? `
                <div class="ska-filterbar-premium-preview">
                    ${premiumItems.map(id => {
                        return `<label class="ska-filter-pill is-off is-locked"><input type="checkbox" disabled><span>${SA_CONFIG.CARD_TITLES[id]}</span></label>`;
                    }).join('')}
                </div>` : '';
            const viewToggle = profile ? `<button class="ska-filterbar-toggle ska-filterbar-toggle-view" data-action="toggle-filter-view">${showAll ? 'Profilansicht' : 'Alle Boxen'}</button>` : '';
            const html = `
                <div class="ska-filterbar-header">
                    <span>${title}</span>
                    <div class="ska-filterbar-actions">
                        <button class="ska-filterbar-toggle ska-filterbar-collapse" data-action="toggle-filter-collapse">${collapseLabel}</button>
                        ${viewToggle}
                    </div>
                </div>
                <div class="ska-filterbar-body">
                    <div class="ska-filterbar-bulk">
                        <button class="ska-filterbar-bulk-btn" data-action="filter-select-all">Alle auswählen</button>
                        <button class="ska-filterbar-bulk-btn" data-action="filter-deselect-all">Alle abwählen</button>
                    </div>
                    ${freeItems.map(id => {
                        const locked = !this.isCardUnlocked(id);
                        let checked = !this.state.hiddenCards.has(id);
                        if (allowed && !allowed.has(id)) {
                            checked = checked && this.state.selectedExtraCards.has(id);
                        }
                        if (locked) checked = false;
                        return `<label class="ska-filter-pill ${checked ? '' : 'is-off'} ${checked ? 'checked' : ''} ${locked ? 'is-locked' : ''}"><input type="checkbox" data-action="toggle-card" data-card="${id}" ${checked ? 'checked' : ''} ${locked ? 'disabled' : ''}><span>${SA_CONFIG.CARD_TITLES[id]}</span></label>`;
                    }).join('')}
                    ${premiumLabel}
                    ${premiumPreview}
                </div>`;
            this.filterBar.innerHTML = html;
        }

        analyze(text) {
            const raw = text || '';
            this.enforceFreeSettings();
            this.state.analysisToken += 1;
            const token = this.state.analysisToken;
            if (!this.isPremiumActive() && raw.length > SA_CONFIG.FREE_TEXT_LIMIT) {
                if (!this.state.limitReached) {
                    this.showPremiumNotice('Free-Version: Bitte kürzere Texte analysieren oder Premium freischalten.');
                }
                this.state.limitReached = true;
                return;
            }
            this.state.limitReached = false;
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
            const token = this.state.analysisToken;
            SA_Utils.storage.save(SA_CONFIG.STORAGE_KEY, raw);
            const effectiveSettings = this.getEffectiveSettings();
            const wpm = SA_Logic.getWpm(effectiveSettings);
            const sps = SA_Logic.getSps(effectiveSettings);
            
            const pause = SA_Utils.getPausenTime(raw, effectiveSettings);
            const timeMode = this.getEffectiveTimeMode();
            const sectionStats = SA_Logic.analyzePacingSections(raw, effectiveSettings, timeMode);
            const syllableStretches = SA_Logic.analyzeSyllableStretches(raw);
            
            // TIME CALCULATION SWITCH
            let dur = 0;
            if (timeMode === 'sps') {
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

            const bpmSuggestion = SA_Logic.analyzeBpmSuggestion(read, this.settings);
            const previousBpm = this.state.clickTrack?.bpm || 0;
            this.state.clickTrack.bpm = bpmSuggestion.bpm;
            if (!this.isPremiumActive() && this.state.clickTrack.playing) {
                this.stopClickTrack();
            } else if (this.state.clickTrack.playing && bpmSuggestion.bpm > 0 && bpmSuggestion.bpm !== previousBpm) {
                this.startClickTrack(bpmSuggestion.bpm);
            }

            this.state.currentData = { duration: SA_Utils.formatMin(dur), wordCount: read.wordCount, wpm, score: read.score.toFixed(0), mode: this.getEffectiveTimeMode() === 'sps' ? `${sps} SPS` : `${wpm} WPM` };
            this.state.markerData = raw.trim() ? SA_Logic.generateMarkerData(raw, effectiveSettings) : [];
            this.renderOverview(dur, read.wordCount, charC, wpm, pause, read);

            if (read.wordCount === 0) {
                this.resetPacing();
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
            const useWorker = Boolean(this.analysisWorker);

            const profile = this.settings.role;
            const allowed = profile && SA_CONFIG.PROFILE_CARDS[profile] ? new Set(SA_CONFIG.PROFILE_CARDS[profile]) : null;
            let availableCards = SA_CONFIG.CARD_ORDER.filter((id) => this.isCardAvailable(id));
            if (!this.isPremiumActive()) {
                const freeCards = SA_CONFIG.CARD_ORDER.filter((id) => SA_CONFIG.FREE_CARDS.includes(id));
                const teaserCards = SA_CONFIG.PREMIUM_TEASERS.filter((id) => this.isCardAvailable(id));
                availableCards = [...freeCards, ...teaserCards.filter(id => !freeCards.includes(id))];
            }
            SA_CONFIG.CARD_ORDER.forEach((id) => {
                if (this.isCardAvailable(id) && this.isCardUnlocked(id)) return;
                const existing = this.bottomGrid.querySelector(`[data-card-id="${id}"]`);
                if (existing) existing.remove();
            });
            if (allowed) {
                SA_CONFIG.CARD_ORDER.forEach((id) => {
                    if (allowed.has(id) || this.state.selectedExtraCards.has(id) || id === 'overview') return;
                    const existing = this.bottomGrid.querySelector(`[data-card-id="${id}"]`);
                    if (existing) existing.remove();
                });
            }
            if (!this.isPremiumActive()) {
                SA_CONFIG.CARD_ORDER.forEach((id) => {
                    if (this.isCardUnlocked(id) || this.isCardTeaser(id) || id === 'overview') return;
                    const existing = this.bottomGrid.querySelector(`[data-card-id="${id}"]`);
                    if (existing) existing.remove();
                });
            }
            availableCards.forEach((id, idx) => {
                if(this.state.hiddenCards.has(id)) return;
                if (allowed && !allowed.has(id) && !this.state.selectedExtraCards.has(id) && id !== 'overview') return;
                if (!this.isCardUnlocked(id) && !this.isCardTeaser(id)) return;
                const active = isActive(id);

                switch(id) {
                    case 'char': this.renderCharCard(read, raw, active); break;
                    case 'coach': this.renderCoachCard(dur, read, raw, read.sentences, active, sectionStats, syllableStretches); break;
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
                    case 'adverb': this.renderAdverbCard(SA_Logic.findAdverbs(read.cleanedText), read.wordCount, active); break;
                    case 'rhythm': this.renderRhythmCard(read.sentences, read.maxSentenceWords, active); break;
                    case 'syllable_entropy': this.renderSyllableEntropyCard(SA_Logic.analyzeSyllableEntropy(read.sentences), active); break;
                    case 'chapter_calc': this.renderChapterCalculatorCard(raw, active); break;
                    case 'dialog': this.renderDialogCard(SA_Logic.analyzeDialog(raw), active); break;
                    case 'gender': this.renderGenderCard(SA_Logic.findGenderBias(raw), active); break;
                    case 'start_var': this.renderRepetitiveStartsCard(SA_Logic.analyzeSentenceStarts(read.sentences), active); break;
                    case 'role_dist': this.renderRoleCard(SA_Logic.analyzeRoles(raw), active); break;
                    case 'vocabulary': this.renderVocabularyCard(SA_Logic.analyzeVocabulary(read.words), active); break;
                    case 'pronunciation': this.renderPronunciationCard(SA_Logic.analyzePronunciation(read.cleanedText), active); break;
                    case 'keyword_focus':
                        if (!active) {
                            this.renderKeywordFocusCard(null, false);
                            break;
                        }
                        if (useWorker) {
                            this.updateCard('keyword_focus', this.renderLoadingState('Keyword-Fokus wird berechnet...'), this.bottomGrid, '', '', true);
                            this.requestWorkerTask('keyword_focus', {
                                text: raw,
                                settings: {
                                    focusKeywords: this.settings.focusKeywords,
                                    keywordDensityLimit: this.settings.keywordDensityLimit
                                },
                                stopwords: SA_CONFIG.STOPWORDS
                            }).then((result) => {
                                if (token !== this.state.analysisToken || !isActive('keyword_focus')) return;
                                this.renderKeywordFocusCard(result || { top: [], total: 0, focusScore: 0, focusKeywords: [], focusCounts: [], focusTotalCount: 0, focusDensity: 0, focusLimit: 0, focusOverLimit: false, totalWords: 0 }, true);
                            });
                            break;
                        }
                        this.renderKeywordFocusCard(SA_Logic.analyzeKeywordClusters(raw, this.settings), true);
                        break;
                    case 'plosive': this.renderPlosiveCard(SA_Logic.findPlosiveClusters(raw), active); break;
                    case 'redundancy':
                        if (!active) {
                            this.renderRedundancyCard(null, false);
                            break;
                        }
                        if (useWorker) {
                            this.updateCard('redundancy', this.renderLoadingState('Redundanz wird geprüft...'), this.bottomGrid, '', '', true);
                            this.requestWorkerTask('redundancy', { sentences: read.sentences })
                                .then((result) => {
                                    if (token !== this.state.analysisToken || !isActive('redundancy')) return;
                                    this.renderRedundancyCard(result || [], true);
                                });
                            break;
                        }
                        this.renderRedundancyCard(SA_Logic.analyzeRedundancy(read.sentences), true);
                        break;
                    case 'bpm': this.renderBpmCard(SA_Logic.analyzeBpmSuggestion(read, this.settings), active); break;
                    case 'easy_language': this.renderEasyLanguageCard(SA_Logic.analyzeEasyLanguage(read.cleanedText, read.sentences), active); break;
                    case 'bullshit': this.renderBullshitCard(SA_Logic.analyzeBullshitIndex(read.cleanedText, this.parseBullshitList()), active); break;
                    case 'metaphor': this.renderMetaphorCard(SA_Logic.analyzeMetaphorPhrases(raw), active); break;
                    case 'audience': this.renderAudienceCard(SA_Logic.evaluateAudienceTarget(read, this.settings.audienceTarget), active); break;
                    case 'verb_balance': this.renderVerbBalanceCard(SA_Logic.analyzeVerbNounBalance(read.cleanedText, read.sentences), active); break;
                    case 'rhet_questions': this.renderRhetoricalQuestionsCard(SA_Logic.analyzeRhetoricalQuestions(raw, read.sentences), active); break;
                    case 'depth_check': this.renderDepthCheckCard(SA_Logic.analyzeDepthCheck(read.sentences), active); break;
                    case 'sentiment_intensity': this.renderSentimentIntensityCard(SA_Logic.analyzeSentimentIntensity(read.sentences), active); break;
                    case 'pacing': this.renderPacingCard(dur, raw, active, sectionStats); break;
                    case 'teleprompter': this.renderTeleprompterCard(read, active); break;
                    case 'compliance_check': this.renderComplianceCard(raw, active); break;
                }
                const c = this.bottomGrid.querySelector(`[data-card-id="${id}"]`); if(c) c.style.order = idx;
            });

            this.renderUpgradePanel();
            this.renderHiddenPanel();
            this.renderFilterBar();
            this.renderPremiumTeaserNote();
            if (this.state.savedVersion && this.isPremiumActive()) {
                this.renderComparison(dur, read.wordCount, read.score);
            } else {
                if (this.compareRow) {
                    this.compareRow.innerHTML = '';
                    this.compareRow.classList.remove('is-active');
                }
            }
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

        observeOverviewHeight() {
            const overviewCard = this.topPanel?.querySelector('.skriptanalyse-card--overview');
            if (!overviewCard || typeof ResizeObserver === 'undefined') return;
            if (!this.overviewResizeObserver) {
                this.overviewResizeObserver = new ResizeObserver(() => this.syncEditorHeight());
            }
            this.overviewResizeObserver.disconnect();
            this.overviewResizeObserver.observe(overviewCard);
        }
        
        renderPronunciationCard(data, active) {
            if(!active) return this.updateCard('pronunciation', this.renderDisabledState(), this.bottomGrid, '', '', true);
            let h = '';
            const issues = data?.words || [];
            const hiatuses = data?.hiatuses || [];
            if((!issues || issues.length === 0) && (!hiatuses || hiatuses.length === 0)) {
                 h = `<p style="color:#64748b; font-size:0.9rem;">Keine schwierigen Aussprachen gefunden.</p>`;
            } else {
                 if (issues.length) {
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
                 }
                 if (hiatuses.length) {
                     h += `<div class="ska-section-title" style="margin-top:0.8rem;">Hiatus an Wortgrenzen</div>`;
                     h += `<div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-bottom:10px;">`;
                     hiatuses.forEach((phrase) => {
                         h += `<span class="skriptanalyse-badge" style="background:#eef2ff; color:#4338ca; border:1px solid #c7d2fe;">${phrase}</span>`;
                     });
                     h += `</div>`;
                 }
                 h += this.renderTipSection('pronunciation', true);
            }
            this.updateCard('pronunciation', h);
        }

        renderKeywordFocusCard(data, active) {
            if(!active) return this.updateCard('keyword_focus', this.renderDisabledState(), this.bottomGrid, '', '', true);

            const total = data.total || 0;
            const top = data.top || [];
            const tfIdfTop = data.tfIdfTop || [];
            const clusters = data.clusters || [];
            const focusKeywords = data.focusKeywords || [];
            const focusCounts = data.focusCounts || [];
            const focusDensity = data.focusDensity || 0;
            const focusLimit = data.focusLimit || 0;
            const focusOverLimit = data.focusOverLimit;
            const focusTotalCount = data.focusTotalCount || 0;
            const tfIdfTotal = data.tfIdfTotal || 0;
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

            const dominant = tfIdfTop[0] || top[0];
            const tfIdfRatio = tfIdfTotal > 0 ? (dominant.tfidf / tfIdfTotal) * 100 : 0;
            let label = 'Fokus verteilt';
            let color = SA_CONFIG.COLORS.warn;
            if (tfIdfRatio >= 22) { label = 'Klarer Fokus'; color = SA_CONFIG.COLORS.success; }
            else if (tfIdfRatio >= 12) { label = 'Solide Dominanz'; color = SA_CONFIG.COLORS.blue; }

            h += `
                <div style="margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.5rem;">
                        <span style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase;">TF-IDF Fokus-Score</span>
                        <span style="font-weight:700; color:${color};">${label}</span>
                    </div>
                    <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                        <div style="width:${Math.min(100, tfIdfRatio)}%; height:100%; background:linear-gradient(90deg, #dbeafe, ${color}); transition:width 0.5s;"></div>
                    </div>
                    <div style="margin-top:0.4rem; font-size:0.8rem; color:#94a3b8;">Top-Begriff: <strong style="color:#334155;">${dominant.word}</strong> (${tfIdfRatio.toFixed(1)}% TF-IDF-Anteil)</div>
                </div>
                <div style="font-size:0.8rem; color:#64748b; margin-bottom:0.6rem;">Substantive gesamt: <strong>${total}</strong></div>`;

            const tfIdfMax = tfIdfTop[0]?.tfidf || 1;
            h += `<div class="ska-section-title">TF-IDF Highlights</div>`;
            h += `<div class="ska-filler-list">`;
            tfIdfTop.slice(0, 6).forEach(item => {
                const pct = (item.tfidf / tfIdfMax) * 100;
                h += `<div class="ska-filler-item">
                        <span class="ska-filler-word" style="font-weight:600;">${item.word}</span>
                        <div class="ska-filler-bar-bg"><div class="ska-filler-bar-fill" style="width:${pct}%; background:linear-gradient(90deg, #dbeafe, #1a93ee);"></div></div>
                        <span class="ska-filler-count">${item.count}x</span>
                      </div>`;
            });
            h += `</div>`;

            const palette = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0f766e', '#1d4ed8', '#9333ea'];
            const clusterColors = new Map();
            clusters.forEach((cluster, idx) => {
                clusterColors.set(cluster.label, palette[idx % palette.length]);
            });

            if (tfIdfTop.length) {
                h += `<div class="ska-section-title">Semantische Cluster & Wordcloud</div>`;
                h += `<div style="display:flex; flex-wrap:wrap; gap:0.4rem; padding:0.7rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; min-height:88px;">`;
                const minSize = 12;
                const maxSize = 26;
                tfIdfTop.slice(0, 18).forEach(item => {
                    const size = minSize + ((item.tfidf || 0) / tfIdfMax) * (maxSize - minSize);
                    const cluster = clusters.find(group => group.terms.some(term => term.word === item.word));
                    const color = cluster ? clusterColors.get(cluster.label) : '#334155';
                    h += `<span style="font-size:${size.toFixed(0)}px; font-weight:600; color:${color};">#${item.word}</span>`;
                });
                h += `</div>`;
            }

            if (clusters.length) {
                h += `<div style="margin-top:0.8rem;">`;
                clusters.slice(0, 6).forEach(cluster => {
                    const color = clusterColors.get(cluster.label) || '#334155';
                    h += `<div style="margin-bottom:0.6rem;">
                            <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; font-weight:700; color:${color};">
                                <span style="display:inline-flex; width:10px; height:10px; border-radius:50%; background:${color};"></span>
                                ${cluster.label}
                            </div>
                            <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-top:0.35rem;">`;
                    cluster.terms.slice(0, 6).forEach(term => {
                        h += `<span class="skriptanalyse-badge" style="background:#f8fafc; border:1px solid #e2e8f0; color:#334155;">${term.word} (${term.count}x)</span>`;
                    });
                    h += `</div></div>`;
                });
                h += `</div>`;
            }

            h += `<div class="ska-section-title">Häufigkeit (Substantive)</div>`;
            h += `<div class="ska-filler-list">`;
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

        renderPlosiveCard(data, active) {
            if(!active) return this.updateCard('plosive', this.renderDisabledState(), this.bottomGrid, '', '', true);
            let h = '';
            const isPremium = this.isPremiumActive();
            const clusters = data?.plosives || [];
            const consonantClusters = data?.consonantClusters || [];

            if((!clusters || clusters.length === 0) && (!consonantClusters || consonantClusters.length === 0)) {
                h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">🎙️ Keine Plosiv-Alarmstellen erkannt.</div>`;
            } else {
                if (clusters.length) {
                    h += `<div style="font-size:0.85rem; color:#64748b; margin-bottom:0.8rem;">Gefundene Plosiv-Folgen: <strong>${clusters.length}</strong></div>`;
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
                    if (remaining.length && isPremium) {
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
                    } else if (remaining.length) {
                        h += `<button class="ska-expand-link ska-more-toggle is-locked" data-action="toggle-plosive" data-total="${remaining.length}" data-premium-hint="Mehr Plosiv-Details gibt es in Premium." aria-disabled="true">...und ${remaining.length} weitere anzeigen</button>`;
                    }
                }
                if (consonantClusters.length) {
                    h += `<div class="ska-section-title" style="margin-top:0.8rem;">Harte Konsonanten-Cluster</div>`;
                    h += `<div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-bottom:10px;">`;
                    consonantClusters.forEach((phrase) => {
                        h += `<span class="skriptanalyse-badge" style="background:#fff7ed; color:#9a3412; border:1px solid #fed7aa;">${phrase}</span>`;
                    });
                    h += `</div>`;
                }
                h += this.renderTipSection('plosive', true);
            }
            this.updateCard('plosive', h);
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

            const isPremium = this.isPremiumActive();
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
                    <span>${questions.length} Fragen • ${rhetorical.length} rhetorisch</span>
                    <span>${label}</span>
                  </div>`;
            const listItems = questions;
            if (listItems.length) {
                const initial = listItems.slice(0, 3);
                const remaining = listItems.slice(3);
                h += `<div class="ska-problem-list">`;
                initial.forEach(item => {
                    const badge = item.isRhetorical ? '<span class="ska-question-badge">Rhetorisch</span>' : '';
                    h += `<div class="ska-problem-item">${item.sentence}${badge}</div>`;
                });
                h += `</div>`;
                if (remaining.length && isPremium) {
                    h += `<div id="ska-rhet-questions-hidden" class="ska-hidden-content ska-hidden-content--compact">`;
                    h += `<div class="ska-problem-list">`;
                    remaining.forEach(item => {
                        const badge = item.isRhetorical ? '<span class="ska-question-badge">Rhetorisch</span>' : '';
                        h += `<div class="ska-problem-item">${item.sentence}${badge}</div>`;
                    });
                    h += `</div></div>`;
                    h += `<button class="ska-expand-link ska-more-toggle" data-action="toggle-rhet-questions" data-total="${remaining.length}">...und ${remaining.length} weitere anzeigen</button>`;
                } else if (remaining.length) {
                    h += `<button class="ska-expand-link ska-more-toggle is-locked" data-action="toggle-rhet-questions" data-total="${remaining.length}" data-premium-hint="Mehr Fragen-Auswertung gibt es in Premium." aria-disabled="true">...und ${remaining.length} weitere anzeigen</button>`;
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
            const avgScore = data.reduce((acc, item) => acc + (item.score || 0), 0) / (data.length || 1);
            const trend = end - start;
            let trendLabel = 'Stabil';
            if (trend > 0.3) trendLabel = 'Steigende Energie';
            if (trend < -0.3) trendLabel = 'Abkühlend';
            let avgLabel = 'Neutral';
            let avgColor = SA_CONFIG.COLORS.muted;
            if (avgScore > 0.25) { avgLabel = 'Eher positiv'; avgColor = SA_CONFIG.COLORS.success; }
            if (avgScore < -0.25) { avgLabel = 'Eher kritisch'; avgColor = SA_CONFIG.COLORS.warn; }

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
            h += `
                <div class="ska-intensity-summary">
                    <div class="ska-intensity-summary-item">
                        <span>Durchschnitt</span>
                        <strong style="color:${avgColor};">${avgLabel} (${avgScore.toFixed(2)})</strong>
                    </div>
                    <div class="ska-intensity-summary-item">
                        <span>Skala</span>
                        <strong>-1 (kritisch) bis +1 (positiv)</strong>
                    </div>
                </div>
                <div class="ska-intensity-legend">
                    <span class="ska-intensity-chip is-positive">Positiv</span>
                    <span class="ska-intensity-chip is-neutral">Neutral</span>
                    <span class="ska-intensity-chip is-negative">Kritisch</span>
                    <span class="ska-intensity-note">Tipp: Schwankungen zeigen Stimmungswechsel in den Sätzen.</span>
                </div>`;
            h += this.renderTipSection('sentiment_intensity', true);
            this.updateCard('sentiment_intensity', h);
        }

        renderTeleprompterCard(read, active) {
            if(!active) return this.updateCard('teleprompter', this.renderDisabledState(), this.bottomGrid, '', '', true);
            const effectiveSettings = this.getEffectiveSettings();
            const wpm = SA_Logic.getWpm(effectiveSettings);
            const secs = (read.speakingWordCount / wpm) * 60;
            const hint = read.wordCount > 0 ? `Scroll-Dauer: ${SA_Utils.formatMin(secs)} (${wpm} WPM)` : 'Zu wenig Text für den Teleprompter.';
            const isPremium = this.isPremiumActive();
            const h = `
                <div style="display:flex; flex-direction:column; gap:0.8rem;">
                    <p style="color:#64748b; font-size:0.9rem; margin:0;">${hint}</p>
                    <button class="ska-btn ska-btn--primary" style="justify-content:center;" data-action="open-teleprompter" ${isPremium ? '' : 'disabled'}>Teleprompter öffnen</button>
                    <div class="ska-teleprompter-export">
                        <button class="ska-btn ska-btn--secondary ska-btn--compact" data-action="teleprompter-export-txt" ${isPremium ? '' : 'disabled'}>Export .txt</button>
                        <button class="ska-btn ska-btn--secondary ska-btn--compact" data-action="teleprompter-export-json" ${isPremium ? '' : 'disabled'}>Export .json</button>
                    </div>
                </div>
                ${this.renderTipSection('teleprompter', read.wordCount > 0)}`;
            this.updateCard('teleprompter', h);
        }

        renderPacingCard(durationSec, raw, active, sectionStats) {
            if (!active) return this.updateCard('pacing', this.renderDisabledState(), this.bottomGrid, '', '', true);
            if (!durationSec || durationSec <= 0) {
                this.resetPacing();
                return this.updateCard('pacing', '<p style="color:#94a3b8; font-size:0.9rem;">Zu wenig Text für den Pacing-Takt.</p>');
            }

            const totalMs = durationSec * 1000;
            if (!this.state.pacing.playing && Math.abs((this.state.pacing.duration || 0) - totalMs) > 500) {
                this.state.pacing.duration = totalMs;
                this.state.pacing.elapsed = 0;
            }

            const progress = this.state.pacing.duration > 0 ? (this.state.pacing.elapsed / this.state.pacing.duration) : 0;
            const clamped = Math.max(0, Math.min(1, progress));
            const effectiveSettings = this.getEffectiveSettings();
            const isSps = this.getEffectiveTimeMode() === 'sps';
            const paceLabel = isSps
                ? `${SA_Logic.getSps(effectiveSettings)} SPS`
                : `${SA_Logic.getWpm(effectiveSettings)} WPM`;
            const btnLabel = this.state.pacing.playing ? 'Pause' : 'Start';
            const bpmValue = this.state.clickTrack?.bpm || 0;
            const clickTrackLabel = this.state.clickTrack?.playing
                ? 'Click-Track stoppen'
                : (bpmValue > 0 ? `Click-Track ${bpmValue} BPM` : 'Click-Track (BPM fehlt)');
            const clickTrackDisabled = !this.isPremiumActive() || bpmValue <= 0;
            const checkpoints = [0, 0.25, 0.5, 0.75, 1].map((step) => ({
                pct: Math.round(step * 100),
                time: SA_Utils.formatMin(durationSec * step)
            }));
            const sectionPacingHtml = this.renderSectionPacing(sectionStats, isSps ? 'sps' : 'wpm', {
                title: 'Abschnitts-Pacing',
                compact: true,
                maxItems: 4
            });

            const previewHtml = SA_Utils.escapeHtml(raw || '').replace(/\n/g, '<br>');
            const h = `
                <div class="ska-pacing-head">
                    <div>
                        <div class="ska-pacing-title">Soll-Fortschritt (Genre-Takt)</div>
                        <div class="ska-pacing-sub">Tempo: ${paceLabel} • Zielzeit ${SA_Utils.formatMin(durationSec)}</div>
                    </div>
                </div>
                <div class="ska-pacing-meter">
                    <div class="ska-pacing-bar">
                        <div class="ska-pacing-fill" data-role="pacing-fill" style="width:${clamped * 100}%"></div>
                        <div class="ska-pacing-marker" data-role="pacing-marker" style="left:${clamped * 100}%"></div>
                    </div>
                    <div class="ska-pacing-scale">
                        ${checkpoints.map(item => `
                            <div class="ska-pacing-tick" style="left:${item.pct}%">
                                <span>${item.time}</span>
                            </div>`).join('')}
                    </div>
                </div>
                <div class="ska-pacing-meta">
                    <span class="ska-info-badge" data-role="pacing-target">${Math.round(clamped * 100)}% Soll-Position</span>
                    <span class="ska-info-badge" data-role="pacing-time">${SA_Utils.formatMin(durationSec * clamped)} / ${SA_Utils.formatMin(durationSec)}</span>
                </div>
                ${sectionPacingHtml}
                <div class="ska-pacing-preview" data-role="pacing-preview">${previewHtml || 'Kein Text vorhanden.'}</div>
                <div class="ska-pacing-actions">
                    <button class="ska-btn ska-btn--secondary ska-btn--compact" data-action="pacing-toggle" data-duration="${durationSec}">${btnLabel}</button>
                    <button class="ska-btn ska-btn--secondary ska-btn--compact" data-action="pacing-clicktrack" data-bpm="${bpmValue}" ${clickTrackDisabled ? 'disabled' : ''}>${clickTrackLabel}</button>
                    <button class="ska-btn ska-btn--secondary ska-btn--compact" data-action="pacing-reset">Reset</button>
                </div>
                ${this.renderTipSection('pacing', true)}`;

            this.updateCard('pacing', h);
            this.updatePacingUI(clamped);
        }

        renderSyllableEntropyCard(data, active) {
            if (!active) return this.updateCard('syllable_entropy', this.renderDisabledState(), this.bottomGrid, '', '', true);
            if (!data) return this.updateCard('syllable_entropy', '<p style="color:#94a3b8; font-size:0.9rem;">Zu wenig Text für eine Analyse.</p>');

            const entropyPct = Math.round((data.entropy || 0) * 100);
            let color = SA_CONFIG.COLORS.success;
            if (entropyPct > 65) color = SA_CONFIG.COLORS.warn;
            if (entropyPct < 35) color = SA_CONFIG.COLORS.blue;

            this.state.syllableEntropyIssues = data.issues || [];
            let h = `
                <div style="margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.4rem;">
                        <span style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase;">Silben-Entropie</span>
                        <span style="font-weight:700; color:${color};">${data.label}</span>
                    </div>
                    <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                        <div style="width:${entropyPct}%; height:100%; background:linear-gradient(90deg, #dbeafe, ${color}); transition:width 0.5s;"></div>
                    </div>
                    <div style="margin-top:0.4rem; font-size:0.75rem; color:#94a3b8;">${entropyPct}% Entropie</div>
                </div>`;

            if (data.issues && data.issues.length) {
                const totalIssues = data.issues.length;
                h += `<div class="ska-section-title">Stolperstellen</div><div class="ska-problem-list">`;
                data.issues.slice(0, 3).forEach((item) => {
                    h += `<div class="ska-problem-item">${item.sentence}<div class="ska-problem-meta">⚠️ Entropie ${(item.entropy * 100).toFixed(0)}%</div></div>`;
                });
                h += `</div>`;
                h += `<button class="ska-expand-link ska-more-toggle" data-action="open-syllable-entropy">Alle ${totalIssues} anzeigen</button>`;
            } else {
                h += `<p style="color:#64748b; font-size:0.9rem;">Keine auffälligen Rhythmus-Brüche erkannt.</p>`;
            }

            h += this.renderTipSection('syllable_entropy', true);
            this.updateCard('syllable_entropy', h);
        }

        renderSyllableEntropyModal(issues) {
            const existing = document.getElementById('ska-syllable-entropy-modal');
            if (existing) existing.remove();

            const modal = document.createElement('div');
            modal.className = 'skriptanalyse-modal';
            modal.id = 'ska-syllable-entropy-modal';
            modal.ariaHidden = 'true';
            const listHtml = (issues || [])
                .map(item => `<div class="ska-compliance-item is-missing"><span class="ska-compliance-icon">⚠️</span><span class="ska-compliance-text">${SA_Utils.escapeHtml(item.sentence)}<br><small>Entropie ${(item.entropy * 100).toFixed(0)}%</small></span></div>`)
                .join('');

            modal.innerHTML = `
                <div class="skriptanalyse-modal-overlay" data-action="close-syllable-entropy-modal"></div>
                <div class="skriptanalyse-modal-content" style="max-width:640px;">
                    <button type="button" class="ska-close-icon" data-action="close-syllable-entropy-modal">&times;</button>
                    <div class="ska-modal-header">
                        <h3>Silben-Entropie – Stolperstellen</h3>
                        <p style="margin:0.2rem 0 0 0; color:#64748b; font-size:0.9rem; font-weight:normal;">Alle auffälligen Passagen im Überblick.</p>
                    </div>
                    <div class="skriptanalyse-modal-body">
                        <div class="ska-entropy-modal-list">
                            ${listHtml || '<p style="color:#94a3b8; font-size:0.9rem;">Keine Auffälligkeiten.</p>'}
                        </div>
                    </div>
                    <div class="ska-modal-footer">
                        <button type="button" class="ska-btn ska-btn--secondary" data-action="close-syllable-entropy-modal">Schließen</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
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

        renderComplianceCard(raw, active) {
            if (!active) return this.updateCard('compliance_check', this.renderDisabledState(), this.bottomGrid, '', '', true);
            const phrases = this.parseComplianceList();
            if (!phrases.length) {
                return this.updateCard('compliance_check', '<p style="color:#94a3b8; font-size:0.9rem;">Keine Pflichtpassagen hinterlegt.</p>');
            }
            const result = SA_Logic.analyzeCompliance(raw, phrases);
            const isClear = result.missing.length === 0;
            const statusColor = isClear ? SA_CONFIG.COLORS.success : SA_CONFIG.COLORS.warn;
            const statusText = isClear ? 'Grünes Licht' : `Fehlt noch: ${result.missing.length}`;
            let h = `
                <div class="ska-compliance-status" style="color:${statusColor};">
                    <span>${statusText}</span>
                    <span>${result.matched.length}/${result.total} gefunden</span>
                </div>
                <div class="ska-compliance-list">`;
            result.results.forEach((item) => {
                const itemClass = item.found ? 'is-ok' : 'is-missing';
                const badge = item.found ? '✅' : '⚠️';
                h += `<div class="ska-compliance-item ${itemClass}">
                        <span class="ska-compliance-icon">${badge}</span>
                        <span class="ska-compliance-text">"${SA_Utils.escapeHtml(item.phrase)}"</span>
                      </div>`;
            });
            h += `</div>`;
            h += this.renderTipSection('compliance_check', true);
            this.updateCard('compliance_check', h);
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
            let genreHint = 'Cinematic / Chill';
            if (bpm < 70) genreHint = 'Ambient / Lo-Fi';
            else if (bpm < 90) genreHint = 'Ballade / Downtempo';
            else if (bpm < 110) genreHint = 'Pop / Indie';
            else if (bpm < 130) genreHint = 'Dance / Elektro';
            else genreHint = 'EDM / Rock';

            const h = `
                <div style="margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.5rem;">
                        <span style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase;">Empfohlenes Tempo</span>
                        <span style="font-weight:700; color:${color};">${paceLabel}</span>
                    </div>
                    <div style="font-size:2rem; font-weight:800; color:${SA_CONFIG.COLORS.blue};">${bpm} BPM</div>
                    <div class="ska-bpm-meta-row">
                        <span>Range: ${min}–${max} BPM</span>
                        <span>Ø ${data.syllablesPerSecond.toFixed(2)} Silben/Sekunde</span>
                    </div>
                    <div class="ska-bpm-genre-badge">Genre-Hinweis: ${genreHint}</div>
                </div>
                ${this.renderTipSection('bpm', true)}`;
            this.updateCard('bpm', h, this.bottomGrid, '', '', true);
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
            const infoBox = this.renderFooterInfo('So funktioniert die Rollen-Erkennung', 'Zeilen mit CHARACKTERNAME: in Großbuchstaben werden als Rollen erkannt und vom restlichen Text getrennt gezählt.');
            
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
                h += `<div class="ska-card-footer">${this.renderTipSection('role_dist', true)}${infoBox}</div>`;
                this.updateCard('role_dist', h);
                return;
            }
            h += `<div class="ska-card-footer">${infoBox}</div>`;
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

        renderSectionPacing(sectionStats, mode, options = {}) {
            const sections = (sectionStats || []).filter(item => item.duration > 0 && item.wordCount > 0);
            if (sections.length <= 1) return '';
            const maxItems = options.maxItems || sections.length;
            const unit = mode === 'sps' ? 'SPS' : 'WPM';
            const rates = sections.map(item => item.rate);
            const minRate = Math.min(...rates);
            const maxRate = Math.max(...rates);
            const span = Math.max(0.01, maxRate - minRate);
            const totalDuration = sections.reduce((sum, item) => sum + item.duration, 0);
            const diffLabel = mode === 'sps' ? (maxRate - minRate).toFixed(2) : Math.round(maxRate - minRate);
            const title = options.title || 'Abschnitts-Tempo';
            const layoutStyle = options.compact ? 'margin-top:0.6rem;' : 'margin-top:1rem;';

            let html = `<div class="ska-overview-genre-box" style="${layoutStyle}">
                <h4>${title} <span style="font-size:0.75rem; font-weight:600; color:#94a3b8;">(Δ ${diffLabel} ${unit})</span></h4>
                <div class="ska-filler-list">`;
            sections.slice(0, maxItems).forEach((item) => {
                const rateLabel = mode === 'sps' ? item.rate.toFixed(2) : Math.round(item.rate);
                const pct = span > 0 ? ((item.rate - minRate) / span) * 100 : 100;
                const width = Math.max(12, Math.min(100, pct));
                const durationLabel = SA_Utils.formatMin(item.duration);
                const shareLabel = totalDuration > 0 ? ` • ${(item.duration / totalDuration * 100).toFixed(0)}%` : '';
                html += `
                    <div class="ska-filler-item">
                        <span class="ska-filler-word" style="font-weight:600;">Abschnitt ${item.index}</span>
                        <div class="ska-filler-bar-bg">
                            <div class="ska-filler-bar-fill" style="width:${width}%; background:linear-gradient(90deg, #dbeafe, ${SA_CONFIG.COLORS.blue});"></div>
                        </div>
                        <span class="ska-filler-count">${rateLabel} ${unit} · ${durationLabel}${shareLabel}</span>
                    </div>`;
            });
            html += `</div></div>`;
            return html;
        }

        renderOverview(sec, words, chars, wpm, pause, r, sectionStats) {
            let meterHtml = '';
            let targetStatusHtml = '';

            const traffic = SA_Logic.getTrafficLight(r);
            const scorePct = r ? Math.min(100, Math.max(0, traffic.score)) : 0;

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
            
            let sCol = SA_CONFIG.COLORS.warn;
            if (traffic.class === 'green') sCol = SA_CONFIG.COLORS.success;
            if (traffic.class === 'red') sCol = SA_CONFIG.COLORS.error;
            let maxSCol = (r && r.maxSentenceWords > 30) ? SA_CONFIG.COLORS.warn : SA_CONFIG.COLORS.text;
            let maxSVal = r ? r.maxSentenceWords : 0;

            const effectiveSettings = this.getEffectiveSettings();
            const isSps = this.getEffectiveTimeMode() === 'sps';
            const rateLabel = isSps ? `${SA_Logic.getSps(effectiveSettings)} SPS` : `${wpm} WPM`;
            const benchmarkMetric = isSps ? 'sps' : 'wpm';
            const benchmarkValue = isSps ? SA_Logic.getSps(effectiveSettings) : wpm;
            const benchmarkLabel = isSps ? 'Benchmark (SPS)' : 'Benchmark (WPM)';
            const benchmarkHtml = this.renderBenchmarkBadge(benchmarkMetric, benchmarkValue, benchmarkLabel);

            let genreList = '<div class="ska-overview-genre-box"><h4>Sprechdauer im Vergleich</h4><div class="ska-genre-grid-layout">';
            const cP = r ? SA_Utils.getPausenTime(this.getText(), effectiveSettings) : 0;
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
            if (r && traffic.score < 70 && traffic.class !== 'neutral') {
                let hintText = 'Text vereinfachen.';
                if (r.avgSentence > 15 && r.syllablesPerWord > 1.6) hintText = 'Sätze kürzen & einfachere Wörter nutzen.';
                else if (r.avgSentence > 15) hintText = 'Sätze sind zu lang (Ø > 15 Wörter).';
                else if (r.syllablesPerWord > 1.6) hintText = 'Viele komplexe/lange Wörter.';
                
                scoreHintHtml = `<span class="ska-info-badge ska-info-badge--${traffic.class}"><span class="ska-tool-tooltip">${hintText}</span>INFO</span>`;
            }

            const dimensions = r ? SA_Logic.analyzeStyleDimensions(r, this.getText()) : null;
            const dimensionHints = {
                simplicity: 'Hoher Wert = kurze Sätze + einfache Wörter. Beispiel: „Der Hund läuft.“ (hoch) vs. „Aufgrund der Komplexität…“ (niedrig).',
                structure: 'Misst Absatz-Gliederung + Satzrhythmus. Beispiel: kurze Abschnitte mit klaren Übergängen (hoch) vs. Textblock ohne Pausen (niedrig).',
                brevity: 'Bewertet, wie kompakt Sätze formuliert sind. Beispiel: „Kurz. Klar.“ (hoch) vs. „Es sollte erwähnt werden, dass…“ (niedrig).',
                precision: 'Mehr Inhaltswörter, weniger Füllung. Beispiel: „Preis sinkt um 20%.“ (hoch) vs. „In gewisser Weise könnte…“ (niedrig).'
            };
            const dimensionItems = dimensions ? [
                { key: 'simplicity', label: 'Einfachheit', score: dimensions.simplicity },
                { key: 'structure', label: 'Gliederung', score: dimensions.structure },
                { key: 'brevity', label: 'Kürze', score: dimensions.brevity },
                { key: 'precision', label: 'Prägnanz', score: dimensions.precision }
            ] : [];

            const lixSummary = r ? SA_Logic.getLixSummary(r.lix) : { label: '–', color: SA_CONFIG.COLORS.muted };
            const lixHintHtml = `<span class="ska-info-badge"><span class="ska-tool-tooltip">LIX = Satzlänge + Anteil langer Wörter (≥7 Buchstaben). Beispiel: „Kurz und klar.“ (LIX ~ 25) vs. „In Anbetracht der Komplexität…“ (LIX > 50).</span>INFO</span>`;

            const isManualWpm = this.settings.manualWpm && this.settings.manualWpm > 0;
            const manualLabel = isManualWpm ? `${this.settings.manualWpm} WPM` : 'Auto';
            const sliderValue = isManualWpm ? this.settings.manualWpm : wpm;
            const sectionPacingHtml = this.renderSectionPacing(sectionStats, isSps ? 'sps' : 'wpm', { title: 'Abschnitts-Tempo' });
            const html = `<div style="display:flex; flex-direction:column; gap:1.5rem; height:100%;">
                <div>
                    <div style="font-size:3.2rem; font-weight:800; color:${SA_CONFIG.COLORS.blue}; line-height:1; letter-spacing:-0.03em;">${SA_Utils.formatMin(sec)} <span style="font-size:1.1rem; font-weight:500; color:#94a3b8; margin-left:-5px;">Min</span></div>
                    <div style="font-size:0.75rem; text-transform:uppercase; color:#64748b; font-weight:700; margin-top:0.4rem; letter-spacing:0.05em; margin-bottom:0.2rem;">SPRECHDAUER &bull; ${gLbl}</div>
                    <div style="font-size:0.8rem; color:#64748b; font-weight:500;">Ø ${rateLabel}${pauseText}</div>
                    ${benchmarkHtml}
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
                    <div class="ska-stat-item" style="white-space:nowrap; align-items:center;"><span>LIX-Index</span><strong style="color:${lixSummary.color}; display:flex; align-items:center; gap:6px;">${lixHintHtml} ${r ? r.lix.toFixed(0) : 0}</strong></div>
                </div>
                ${sectionPacingHtml}
                ${genreList}</div>`;
            
            this.updateCard('overview', html, this.topPanel, 'skriptanalyse-card--overview', trafficBadgeHtml);
            this.observeOverviewHeight();
        }

        renderDisabledState(id) {
            return `<div class="ska-disabled-state">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p>Analyse pausiert</p>
            </div>`;
        }

        renderLoadingState(label = 'Analyse läuft...') {
            return `<div class="ska-disabled-state">
                <div style="font-size:1.4rem;">⏳</div>
                <p>${label}</p>
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
                ? `<div class="ska-tip-genre">${genreContext.tipPrefix}: ${cardTemplate} (${genreContext.tipFocus}).</div>`
                : '';

            return `<div class="ska-card-tips"><div class="ska-tip-header"><span class="ska-tip-badge">💡 Profi-Tipp <span style="opacity:0.6; font-weight:400; margin-left:4px;">${cI+1}/${tT}</span></span><button class="ska-tip-next-btn" data-action="next-tip">Nächster Tipp &rarr;</button></div><p class="ska-tip-content">${tip}</p>${genreNote}</div>`;
        }

        renderFooterInfo(title, text) {
            return `
                <div class="ska-card-info">
                    <div class="ska-card-info-title">${title}</div>
                    <p class="ska-card-info-text">${text}</p>
                </div>`;
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
            const sentenceLengths = (r.sentences || [])
                .map((s) => s.trim().split(/\s+/).filter(Boolean).length)
                .filter((len) => len > 0);
            const minSentence = sentenceLengths.length ? Math.min(...sentenceLengths) : 0;
            const maxSentence = sentenceLengths.length ? Math.max(...sentenceLengths) : 0;
            const variance = SA_Logic.calculateVariance(r.sentences || []);
            const uniqueWords = new Set((r.words || []).map((word) => word.toLowerCase())).size;
            const lexicalShare = r.wordCount ? (uniqueWords / r.wordCount) * 100 : 0;
            const dimensions = SA_Logic.analyzeStyleDimensions(r, raw);
            const lixSummary = SA_Logic.getLixSummary(r.lix);
            const dimensionHints = {
                simplicity: 'Hoher Wert = kurze Sätze + einfache Wörter. Beispiel: „Der Hund läuft.“ (hoch) vs. „Aufgrund der Komplexität…“ (niedrig).',
                structure: 'Misst Absatz-Gliederung + Satzrhythmus. Beispiel: kurze Abschnitte mit klaren Übergängen (hoch) vs. Textblock ohne Pausen (niedrig).',
                brevity: 'Bewertet, wie kompakt Sätze formuliert sind. Beispiel: „Kurz. Klar.“ (hoch) vs. „Es sollte erwähnt werden, dass…“ (niedrig).',
                precision: 'Mehr Inhaltswörter, weniger Füllung. Beispiel: „Preis sinkt um 20%.“ (hoch) vs. „In gewisser Weise könnte…“ (niedrig).'
            };

            const traffic = SA_Logic.getTrafficLight(r);
            const col = traffic.class === 'green' ? SA_CONFIG.COLORS.success : (traffic.class === 'red' ? SA_CONFIG.COLORS.error : SA_CONFIG.COLORS.warn);
            const txt = traffic.label;
            const benchmarkFlesch = this.renderBenchmarkBadge('flesch', r.score, 'Benchmark (Flesch)');
            
            // Temperature gradient calculation (mapped from -100..100 to 0..100%)
            const tempPct = Math.min(100, Math.max(0, (sentiment.temp + 100) / 2));
            
            const h = `
                <div style="margin-bottom:1.5rem; text-align:center;">
                    <div style="font-size:0.75rem; color:#64748b; margin-bottom:0.3rem;">VERSTÄNDLICHKEIT (Flesch)</div>
                    <div style="font-weight:700; color:${col}; font-size:1.4rem;">${txt}</div>
                    <div style="font-size:0.8rem; opacity:0.7;">Score: ${r.score.toFixed(0)} / 100</div>
                    ${benchmarkFlesch}
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
                </div>
                <div style="margin-top:1rem; padding:0.9rem; border-radius:10px; background:#f8fafc; border:1px solid #e2e8f0;">
                    <div style="font-size:0.7rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.6rem;">Stil-Tiefe</div>
                    <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:0.6rem;">
                        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:0.6rem;">
                            <div style="font-size:0.65rem; text-transform:uppercase; color:#94a3b8; font-weight:700;">Satzlänge Ø</div>
                            <div style="font-size:0.95rem; font-weight:700; color:#0f172a;">${r.avgSentence.toFixed(1)} Wörter</div>
                        </div>
                        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:0.6rem;">
                            <div style="font-size:0.65rem; text-transform:uppercase; color:#94a3b8; font-weight:700;">Spannweite</div>
                            <div style="font-size:0.95rem; font-weight:700; color:#0f172a;">${minSentence}–${maxSentence} Wörter</div>
                        </div>
                        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:0.6rem;">
                            <div style="font-size:0.65rem; text-transform:uppercase; color:#94a3b8; font-weight:700;">Wortvielfalt</div>
                            <div style="font-size:0.95rem; font-weight:700; color:#0f172a;">${lexicalShare.toFixed(0)}%</div>
                        </div>
                    </div>
                    <div style="margin-top:0.6rem; font-size:0.8rem; color:#475569;">
                        Rhythmus-Varianz: <strong style="color:${variance < 2.5 ? SA_CONFIG.COLORS.warn : SA_CONFIG.COLORS.success};">${variance.toFixed(2)}</strong> (höher = abwechslungsreicher).
                    </div>
                </div>
                <div style="margin-top:1rem; padding:0.9rem; border-radius:10px; background:#ffffff; border:1px solid #e2e8f0;">
                    <div style="font-size:0.7rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.6rem;">Stil-Dimensionen</div>
                    <div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:0.6rem;">
                        ${[
                            { key: 'simplicity', label: 'Einfachheit', score: dimensions.simplicity },
                            { key: 'structure', label: 'Gliederung', score: dimensions.structure },
                            { key: 'brevity', label: 'Kürze', score: dimensions.brevity },
                            { key: 'precision', label: 'Prägnanz', score: dimensions.precision }
                        ].map(item => {
                            const summary = SA_Logic.getDimensionSummary(item.score);
                            return `
                                <div style="border:1px solid #e2e8f0; border-radius:8px; padding:0.6rem; background:#f8fafc;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                                        <span style="font-size:0.65rem; text-transform:uppercase; color:#94a3b8; font-weight:700;">${item.label}</span>
                                        <span class="ska-info-badge" style="font-size:10px; padding:2px 6px; background:${summary.color}1a; color:${summary.color};">${summary.label}<span class="ska-tool-tooltip">${dimensionHints[item.key]}</span></span>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:0.5rem;">
                                        <strong style="color:${summary.color}; font-size:0.95rem;">${Math.round(item.score)}</strong>
                                        <div style="flex:1; height:6px; background:#e2e8f0; border-radius:999px; overflow:hidden;">
                                            <div style="width:${Math.min(100, Math.round(item.score))}%; height:100%; background:linear-gradient(90deg, #e2e8f0, ${summary.color});"></div>
                                        </div>
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>
                </div>`;
            
            this.updateCard('char', h);
        }

        renderCoachCard(sec, read, raw, sentences, active, sectionStats, syllableStretches) {
            if(!active) return this.updateCard('coach', this.renderDisabledState(), this.bottomGrid, '', '', true);
            
            const effectiveSettings = this.getEffectiveSettings();
            const isSps = this.getEffectiveTimeMode() === 'sps';
            const wpm = SA_Logic.getWpm(effectiveSettings);
            const sps = SA_Logic.getSps(effectiveSettings);
            const variance = SA_Logic.calculateVariance(sentences);
            const tone = SA_Logic.analyzeTone(raw);
            const effectiveRate = isSps
                ? (sec > 0 ? (read.totalSyllables / sec) : 0)
                : (sec > 0 ? (read.speakingWordCount / (sec / 60)) : 0);

            // 1. Dynamics
            let dynText = "Lebendig & Abwechslungsreich";
            let dynCol = SA_CONFIG.COLORS.success;
            if(variance < 2.5) { dynText = "Eher monoton (Satzlängen variieren!)"; dynCol = SA_CONFIG.COLORS.warn; }
            
            // 2. Tempo
            let tempoText = "Optimales Tempo";
            let tempoCol = SA_CONFIG.COLORS.success;
            if (isSps) {
                if (effectiveRate > 4.2) { tempoText = "Sehr sportlich/schnell"; tempoCol = SA_CONFIG.COLORS.warn; }
                else if (effectiveRate < 3.3) { tempoText = "Ruhig / Getragen"; tempoCol = SA_CONFIG.COLORS.blue; }
                else tempoText = `Ausgewogen (${effectiveRate.toFixed(2)} SPS)`;
            } else {
                if(effectiveRate > 165) { tempoText = "Sehr sportlich/schnell"; tempoCol = SA_CONFIG.COLORS.warn; }
                else if(effectiveRate < 125) { tempoText = "Ruhig / Getragen"; tempoCol = SA_CONFIG.COLORS.blue; }
                else tempoText = `Ausgewogen (${Math.round(effectiveRate)} WPM)`;
            }

            const sections = (sectionStats || []).filter(item => item.duration > 0);
            let sectionTip = 'Abschnitts-Tempo wirkt stabil.';
            if (sections.length > 1) {
                const rates = sections.map(item => item.rate);
                const minRate = Math.min(...rates);
                const maxRate = Math.max(...rates);
                const diff = maxRate - minRate;
                const diffLabel = isSps ? diff.toFixed(2) : Math.round(diff);
                const unit = isSps ? 'SPS' : 'WPM';
                if (diff > (isSps ? 0.5 : 15)) {
                    sectionTip = `Tempo schwankt spürbar (Δ ${diffLabel} ${unit}). Übergänge glätten.`;
                } else {
                    sectionTip = `Abschnitts-Tempo gleichmäßig (Δ ${diffLabel} ${unit}).`;
                }
            }

            const stretch = syllableStretches && syllableStretches.stretches ? syllableStretches.stretches[0] : null;
            const stretchThreshold = syllableStretches ? syllableStretches.threshold : 0;
            const stretchLabel = stretch
                ? `Langer Atembogen: ${stretch.syllables} Silben ohne Pause (Ziel < ${stretchThreshold}).`
                : 'Atembögen wirken natürlich gesetzt.';

            const genreKey = this.settings.usecase !== 'auto' ? this.settings.usecase : this.settings.lastGenre;
            const genreContext = genreKey ? SA_CONFIG.GENRE_CONTEXT[genreKey] : null;
            const genreCoachNote = genreContext ? `<div class="ska-genre-context">${genreContext.tipPrefix}: ${genreContext.tipFocus}.</div>` : '';
            const rateLabel = isSps ? `${sps} SPS` : `${wpm} WPM`;
            const h = `
                <div class="ska-mini-grid">
                    <div class="ska-mini-card" style="border-top:3px solid ${tempoCol};">
                        <div class="ska-mini-card-label">Tempo</div>
                        <div class="ska-mini-card-sub">${tempoText} • Ziel ${rateLabel}</div>
                    </div>
                    <div class="ska-mini-card" style="border-top:3px solid ${dynCol};">
                        <div class="ska-mini-card-label">Dynamik</div>
                        <div class="ska-mini-card-sub">${dynText}</div>
                    </div>
                    <div class="ska-mini-card" style="border-top:3px solid ${stretch ? SA_CONFIG.COLORS.warn : SA_CONFIG.COLORS.success};">
                        <div class="ska-mini-card-label">Atembogen</div>
                        <div class="ska-mini-card-sub">${stretch ? `${stretch.syllables} Silben` : 'Im grünen Bereich'}</div>
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
                        <li>${sectionTip}</li>
                        <li>${stretchLabel}</li>
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
                h += `<div class="ska-section-title">Gefundene Phrasen</div><div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-bottom:10px;">`;
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
                h += `<div class="ska-section-title">Gefundene Wörter</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:10px;">`;
                words.slice(0, 20).forEach(w => {
                    h+=`<span class="skriptanalyse-badge" style="background:#fdf2f8; color:#be185d; border:1px solid #fbcfe8;">${w}</span>`;
                });
                h += `</div>`;
                if(words.length > 20) h += `<span style="font-size:0.8rem; color:#94a3b8; align-self:center;">...und ${words.length - 20} weitere</span>`;
                h += this.renderTipSection('adjective', true);
            }
            this.updateCard('adjective', h);
        }

        renderAdverbCard(words, totalWords, active) {
            if(!active) return this.updateCard('adverb', this.renderDisabledState(), this.bottomGrid, '', '', true);

            const ratio = totalWords > 0 ? (words.length / totalWords) * 100 : 0;
            let status = 'Ausgewogen';
            let color = SA_CONFIG.COLORS.success;
            if(ratio > 8) { status = 'Sehr adverb-lastig'; color = SA_CONFIG.COLORS.error; }
            else if(ratio > 4) { status = 'Viele Adverbien'; color = SA_CONFIG.COLORS.warn; }

            let h = `
                <div style="margin-bottom:1.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.5rem;">
                        <span style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase;">Dichte-Check</span>
                        <span style="font-weight:700; color:${color};">${status} (${ratio.toFixed(1)}%)</span>
                    </div>
                    <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                        <div style="width:${Math.min(100, ratio * 8)}%; height:100%; background:linear-gradient(90deg, #ecfeff, ${color}); transition:width 0.5s;"></div>
                    </div>
                </div>`;

            if(!words.length) {
                 h += `<p style="color:#64748b; font-size:0.9rem;">Keine auffälligen Adverbien gefunden.</p>`;
            } else {
                h += `<div class="ska-section-title">Gefundene Wörter</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:10px;">`;
                words.slice(0, 20).forEach(w => {
                    h+=`<span class="skriptanalyse-badge" style="background:#ecfeff; color:#0e7490; border:1px solid #a5f3fc;">${w}</span>`;
                });
                h += `</div>`;
                if(words.length > 20) h += `<span style="font-size:0.8rem; color:#94a3b8; align-self:center;">...und ${words.length - 20} weitere</span>`;
                h += this.renderTipSection('adverb', true);
            }
            this.updateCard('adverb', h);
        }

        renderFillerCard(fillers, active) {
            if(!active) return this.updateCard('fillers', this.renderDisabledState(), this.bottomGrid, '', '', true);

            // Sort by Impact (Weight * Count) desc
            const k = Object.keys(fillers).sort((a,b) => (fillers[b].count * fillers[b].weight) - (fillers[a].count * fillers[a].weight));
            let h = '';
            
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
                h += `<div class="ska-section-title">Gefundene Wörter</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:10px;">`;
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
                h += `<div class="ska-section-title">Gefundene Begriffe</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:10px;">`;
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
            const isPremium = this.isPremiumActive();
            if(!killers || killers.length === 0) {
                 h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">🫁 Alles flüssig!</div>`;
            } else {
                h += `<div style="font-size:0.85rem; color:#64748b; margin-bottom:0.8rem;">Gefundene Stellen: <strong>${killers.length}</strong></div><div class="ska-problem-list">`;
                const renderItem = (k) => {
                    let reasons = [];
                    if(k.words > 25) reasons.push(`${k.words} Wörter`);
                    if(k.commas >= 4) reasons.push(`${k.commas} Kommas`);
                    if(k.hardSegment) reasons.push(`Keine Pause / Atemdruck`);
                    return `<div class="ska-problem-item">${k.text.replace(/(\r\n|\n|\r)/gm, " ")}<div class="ska-problem-meta">⚠️ ${reasons.join(' &bull; ')}</div></div>`;
                };
                if (isPremium) {
                    killers.slice(0, 3).forEach(k => { h += renderItem(k); });
                } else {
                    killers.forEach(k => { h += renderItem(k); });
                }
                if(killers.length > 3 && isPremium) {
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
                h += `<div class="ska-section-title">Gefundene Wiederholungen</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:10px;">`;
                words.forEach(w => {
                    const safeWord = SA_Utils.escapeHtml(w);
                    h+=`<span class="skriptanalyse-badge skriptanalyse-badge--echo ska-synonym-target" data-synonym-word="${safeWord}">${safeWord}</span>`;
                });
                h += `</div>`;
                h += this.renderTipSection('echo', true);
            }
            this.updateCard('echo', h);
        }

        renderStumbleCard(s, active) {
            if(!active) return this.updateCard('stumble', this.renderDisabledState(), this.bottomGrid, '', '', true);

            let h = '';
            const hasIssues = (s.long.length > 0 || s.camel.length > 0 || s.phonetic.length > 0 || s.alliter.length > 0 || s.hiatus.length > 0 || s.consonant_clusters.length > 0);

            if(!hasIssues) h = `<p style="color:#64748b; font-size:0.9rem;">Keine Auffälligkeiten.</p>`;
            else {
                if(s.phonetic.length) { 
                    h += `<div class="ska-section-title">Zungenbrecher</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:10px;">`; 
                    s.phonetic.forEach(w => {
                        h+=`<span class="skriptanalyse-badge" style="background:#f3e8ff; color:#6b21a8; border:1px solid #e9d5ff;">${w}</span>`;
                    });
                    h+='</div>'; 
                }
                if(s.camel.length) { 
                    h += `<div class="ska-section-title">Fachbegriffe</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:10px;">`; 
                    s.camel.forEach(w => {
                        h+=`<span class="skriptanalyse-badge skriptanalyse-badge--camel">${w}</span>`;
                    });
                    h+='</div>'; 
                }
                if(s.long.length) { 
                    h += `<div class="ska-section-title">Lange Wörter</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:10px;">`; 
                    s.long.forEach(w => {
                        h+=`<span class="skriptanalyse-badge skriptanalyse-badge--long">${w}</span>`;
                    });
                    h+='</div>'; 
                }
                if(s.alliter.length) {
                    h += `<div class="ska-section-title">Zungenbrecher & Alliterationen</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:10px;">`; 
                    s.alliter.forEach(w => {
                        h+=`<span class="skriptanalyse-badge" style="background:#fff1f2; color:#be123c; border:1px solid #fda4af;">${w}</span>`;
                    });
                    h+='</div>'; 
                }
                if(s.hiatus.length) {
                    h += `<div class="ska-section-title">Hiatus an Wortgrenzen</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:10px;">`; 
                    s.hiatus.forEach(w => {
                        h+=`<span class="skriptanalyse-badge" style="background:#eef2ff; color:#4338ca; border:1px solid #c7d2fe;">${w}</span>`;
                    });
                    h+='</div>'; 
                }
                if(s.consonant_clusters.length) {
                    h += `<div class="ska-section-title">Harte Konsonanten-Cluster</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:10px;">`; 
                    s.consonant_clusters.forEach(w => {
                        h+=`<span class="skriptanalyse-badge" style="background:#fff7ed; color:#9a3412; border:1px solid #fed7aa;">${w}</span>`;
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
                h += `<div class="ska-section-title">Gefundene Signale (Gesamt)</div><div style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-bottom:10px;">`; 
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
                        <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
                            <button class="ska-tool-btn" style="font-size:0.75rem; padding:4px 8px; display:inline-flex; align-items:center; justify-content:center; line-height:1;" data-action="export-marker-json">📍 Export .json</button>
                            <button class="ska-tool-btn" style="font-size:0.75rem; padding:4px 8px; display:inline-flex; align-items:center; justify-content:center; line-height:1;" data-action="export-marker-csv">📍 Export .csv</button>
                            <button class="ska-tool-btn" style="font-size:0.75rem; padding:4px 8px; display:inline-flex; align-items:center; justify-content:center; line-height:1;" data-action="export-marker-edl">📍 Export .edl</button>
                        </div>
                     </div>`;
            
            if(s.length < 2) {
                h += '<p style="color:#94a3b8; font-size:0.9rem;">Zu wenig Text.</p>';
            } else {
                h += `<div style="font-family:monospace; background:#f8fafc; padding:0.8rem; border-radius:6px; font-size:0.85rem; color:#334155; border:1px solid #e2e8f0;">${s[0].replace(/[,]/g,', | ').replace(/ und /g,' und | ')} ...</div>`;
            }
            h += this.renderFooterInfo('So funktioniert die Marker-Analyse', 'Wir erkennen sinnvolle Schnittpunkte an Satzenden und Absätzen. Exportiere die Marker direkt für DAWs oder schnelles Editing.');
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
            let spreadHint = 'Guter Wechsel zwischen kurzen und langen Sätzen.';
            if (spreadIndex < 2.2) {
                spreadLabel = 'Einschlafgefahr';
                spreadColor = SA_CONFIG.COLORS.warn;
                spreadHint = 'Hier einen kurzen Satz einfügen, um den Rhythmus zu brechen.';
            } else if (spreadIndex > 5) {
                spreadLabel = 'Sehr dynamisch';
                spreadColor = SA_CONFIG.COLORS.success;
                spreadHint = 'Hohe Varianz – achte darauf, dass der Flow dennoch zusammenhängt.';
            }
            h += `
                <div style="margin-top:0.75rem; padding:0.75rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.5rem;">
                        <span style="font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase;">Standardabweichung</span>
                        <span style="font-weight:700; color:${spreadColor};">${spreadLabel}</span>
                    </div>
                    <div style="width:100%; height:6px; background:#e2e8f0; border-radius:999px; overflow:hidden;">
                        <div style="width:${Math.min(100, spreadIndex * 12)}%; height:100%; background:linear-gradient(90deg, #e2e8f0, ${spreadColor});"></div>
                    </div>
                    <div style="margin-top:0.4rem; font-size:0.9rem; color:#334155;">Satz-Spreizungs-Index: <strong>${spreadIndex.toFixed(2)}</strong></div>
                    <div style="margin-top:0.35rem; font-size:0.85rem; color:#64748b;">${spreadHint}</div>
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

        renderChapterCalculatorCard(raw, active) {
            if(!active) return this.updateCard('chapter_calc', this.renderDisabledState(), this.bottomGrid, '', '', true);
            const isHoerbuch = this.settings.usecase === 'hoerbuch' || this.settings.usecase === 'auto';
            const infoBox = this.renderFooterInfo('So funktioniert der Kapitel-Kalkulator', 'Kapitelüberschriften wie „Kapitel 1“ oder „Chapter I“ werden erkannt und pro Abschnitt in Minuten geschätzt.');
            if (!isHoerbuch) {
                return this.updateCard('chapter_calc', `<p style="color:#94a3b8; font-size:0.9rem;">Nur relevant für Hörbuch-Texte. Wähle im Genre „Hörbuch“, um Kapitel zu berechnen.</p><div class="ska-card-footer">${infoBox}</div>`);
            }

            const chapters = this.extractChapters(raw);
            if (!chapters.length) {
                return this.updateCard('chapter_calc', `<p style="color:#94a3b8; font-size:0.9rem;">Keine Kapitelüberschriften gefunden. Nutze z. B. „Kapitel 1“ oder „Kapitel I“ als eigene Zeile.</p><div class="ska-card-footer">${infoBox}</div>`);
            }

            let total = 0;
            const rows = chapters.map((chapter, index) => {
                const duration = this.calculateDurationForText(chapter.content);
                total += duration;
                return `
                    <div class="ska-chapter-row">
                        <div class="ska-chapter-title">${index + 1}. ${SA_Utils.escapeHtml(chapter.title)}</div>
                        <div class="ska-chapter-meta">
                            <span>${chapter.wordCount} Wörter</span>
                            <strong>${SA_Utils.formatMin(duration)}</strong>
                        </div>
                    </div>`;
            }).join('');

            const html = `
                <div class="ska-chapter-summary">
                    <span>Gefundene Kapitel: <strong>${chapters.length}</strong></span>
                    <span>Gesamtzeit: <strong>${SA_Utils.formatMin(total)}</strong></span>
                </div>
                <div class="ska-chapter-list">${rows}</div>
                <div class="ska-card-footer">${infoBox}</div>`;
            this.updateCard('chapter_calc', html);
        }

        extractChapters(raw) {
            const lines = (raw || '').split(/\r?\n/);
            const chapters = [];
            let current = null;

            const headingRegex = /^\s*(?:#+\s*)?(kapitel|chapter)\s+([0-9ivxlcdm]+|[0-9]+|[a-zäöü]+)\b.*$/i;

            lines.forEach((line) => {
                const trimmed = line.trim();
                const isHeading = headingRegex.test(trimmed);

                if (isHeading) {
                    if (current) chapters.push(current);
                    current = { title: trimmed, lines: [trimmed] };
                    return;
                }

                if (!current) {
                    if (trimmed.length > 0) {
                        current = { title: 'Vorspann', lines: [line] };
                    }
                    return;
                }

                current.lines.push(line);
            });

            if (current) chapters.push(current);

            return chapters
                .map((chapter) => {
                    const content = chapter.lines.join('\n').trim();
                    const read = SA_Logic.analyzeReadability(content, this.settings);
                    return {
                        title: chapter.title,
                        content,
                        wordCount: read.wordCount
                    };
                })
                .filter((chapter) => chapter.content.length > 0);
        }

        calculateDurationForText(text) {
            const effectiveSettings = this.getEffectiveSettings();
            const read = SA_Logic.analyzeReadability(text, effectiveSettings);
            const pause = SA_Utils.getPausenTime(text, effectiveSettings);
            const wpm = SA_Logic.getWpm(effectiveSettings);
            const sps = SA_Logic.getSps(effectiveSettings);
            if (this.getEffectiveTimeMode() === 'sps') {
                return (read.totalSyllables / sps) + pause;
            }
            return (read.speakingWordCount / wpm * 60) + pause;
        }

        isPremiumActive() {
            return (SA_CONFIG.PRO_MODE || SA_CONFIG.IS_ADMIN) && this.state.planMode === 'premium';
        }

        getEffectiveTimeMode() {
            return this.isPremiumActive() && this.settings.timeMode === 'sps' ? 'sps' : 'wpm';
        }

        getEffectiveSettings() {
            if (this.isPremiumActive()) return this.settings;
            return {
                ...this.settings,
                timeMode: 'wpm',
                manualWpm: 0,
                commaPause: 0.2,
                periodPause: 0.5,
                audienceTarget: '',
                focusKeywords: '',
                complianceText: ''
            };
        }

        isPremiumCard(id) {
            return SA_CONFIG.PREMIUM_CARDS.includes(id);
        }

        isCardAvailable(id) {
            if (this.settings.usecase === 'auto') return true;
            const genreCards = SA_CONFIG.GENRE_CARDS[this.settings.usecase];
            if (Array.isArray(genreCards)) {
                return genreCards.includes(id);
            }
            return true;
        }

        isCardUnlocked(id) {
            return this.isPremiumActive() || SA_CONFIG.FREE_CARDS.includes(id);
        }

        isCardTeaser(id) {
            return !this.isPremiumActive() && SA_CONFIG.PREMIUM_TEASERS.includes(id);
        }

        renderDialogCard(d, active) {
            if(!active) return this.updateCard('dialog', this.renderDisabledState(), this.bottomGrid, '', '', true);

            const ratio = d.ratio; 
            const col = SA_CONFIG.COLORS.blue;
            const infoBox = this.renderFooterInfo('Kurz erklärt', 'Mehr wörtliche Rede in Anführungszeichen erhöht den Dialog-Anteil. Erzählerpassagen ohne direkte Rede senken ihn.');
            
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

            h += `<div class="ska-mini-grid">
                    <div class="ska-mini-card">
                        <div class="ska-mini-card-label">Dialog-Passagen</div>
                        <div class="ska-mini-card-value">${d.count}</div>
                    </div>
                    <div class="ska-mini-card">
                        <div class="ska-mini-card-label">Erzähler-Anteil</div>
                        <div class="ska-mini-card-value">${(100 - ratio).toFixed(0)}%</div>
                    </div>
                  </div>`;
            
            h += `<div class="ska-card-footer">${infoBox}${this.renderTipSection('dialog', true)}</div>`;
            this.updateCard('dialog', h);
        }

        applyFreeLimit(container) {
            if (this.isPremiumActive() || !container) return;
            const items = Array.from(container.querySelectorAll('.ska-problem-item'));
            if (items.length <= 5) return;
            items.slice(5).forEach(item => item.classList.add('is-hidden-premium'));
            if (!container.querySelector('.ska-premium-note')) {
                const note = document.createElement('div');
                note.className = 'ska-premium-note';
                note.textContent = 'Free zeigt 5 Ergebnisse – mehr Details in Premium.';
                container.appendChild(note);
            }
        }

        getPremiumPlans() {
            return [
                { id: 'flex', label: 'Monatlich', price: '24,00 EUR', note: 'Volle Flexibilität, monatlich kündbar', savings: '' },
                { id: 'pro', label: 'Jährlich', price: '144,00 EUR', note: 'Volles Studio-Setup für nur 12 € im Monat', savings: '50% gegenüber Flex', badge: 'Bestseller' },
                { id: 'studio', label: 'Lifetime', price: '399,00 EUR', note: 'Einmal zahlen, für immer nutzen (inkl. Updates)', savings: '', badge: 'Limitierter Deal' }
            ];
        }

        updatePremiumPlanUI() {
            if (!this.legendContainer) return;
            const card = this.legendContainer.parentElement?.querySelector('.ska-premium-upgrade-card');
            if (!card) return;
            const premiumPlans = this.getPremiumPlans();
            const selectedPlan = premiumPlans.find(plan => plan.id === this.state.premiumPricePlan) || premiumPlans[0];
            const priceLabel = selectedPlan.id === 'studio' ? 'einmalig' : 'Abo ab';
            const priceValueEl = card.querySelector('.ska-premium-upgrade-price-value');
            if (priceValueEl) {
                priceValueEl.textContent = selectedPlan.price;
            }
            const priceLabelEl = card.querySelector('.ska-premium-upgrade-price-label');
            if (priceLabelEl) {
                priceLabelEl.textContent = priceLabel;
            }
            const noteEl = card.querySelector('[data-role="premium-note"]');
            if (noteEl) {
                const savings = selectedPlan.savings ? `Du sparst ${selectedPlan.savings}` : '';
                noteEl.innerHTML = `${selectedPlan.note} <span class="ska-premium-upgrade-savings${selectedPlan.savings ? '' : ' is-hidden'}">${savings}</span>`;
            }
            const planButtons = card.querySelectorAll('[data-role="premium-plan"]');
            planButtons.forEach((button) => {
                button.classList.toggle('is-active', button.dataset.plan === selectedPlan.id);
            });
        }

        renderUpgradePanel() {
            if (!this.bottomGrid || !this.legendContainer) return;
            const container = this.legendContainer.parentElement;
            if (!container) return;
            const existing = container.querySelector('.ska-premium-upgrade-card');
            if (this.isPremiumActive()) {
                if (existing) existing.remove();
                return;
            }
            if (this.state.premiumUpgradeDismissed) {
                if (existing) existing.remove();
                return;
            }
            const freeCards = SA_CONFIG.FREE_CARDS.map(id => SA_CONFIG.CARD_TITLES[id]).filter(Boolean);
            const lockedCardIds = SA_CONFIG.CARD_ORDER.filter((id) => this.isCardAvailable(id) && !this.isCardUnlocked(id));
            const premiumCards = lockedCardIds
                .map(id => SA_CONFIG.CARD_TITLES[id])
                .filter(Boolean);
            const freeFunctions = [
                'WPM-Modus',
                'Genre-Presets',
                'Autosave (lokal)',
                'PDF-Export (Basis)'
            ];
            const premiumFunctions = [
                'Alles aus Free',
                'SPS-Modus',
                'Pausen-Automatik',
                'WPM-Kalibrierung',
                'Pro-PDF-Report',
                'Textvergleich (Versionen)',
                'Premium-Analyseboxen',
                'Cloud-Speicher (sofern verfügbar)'
            ];
            const premiumPlans = this.getPremiumPlans();
            const selectedPlan = premiumPlans.find(plan => plan.id === this.state.premiumPricePlan) || premiumPlans[0];
            const priceLabel = selectedPlan.id === 'studio' ? 'einmalig' : 'Abo ab';
            const renderSavingsBadge = (plan) => `
                <span class="ska-premium-upgrade-savings${plan.savings ? '' : ' is-hidden'}">
                    ${plan.savings ? `Du sparst ${plan.savings}` : ''}
                </span>`;
            const renderPlanNote = (plan) => `${plan.note} ${renderSavingsBadge(plan)}`;
            const stripBoxIcon = (label) => label.replace(/^[^\p{L}\p{N}]+\s*/u, '');
            const renderList = (items, options = {}) => items.map(item => `
                <li>
                    <span class="ska-upgrade-check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                    </span>
                    <span>${options.stripIcons ? stripBoxIcon(item) : item}</span>
                </li>`).join('');
            const html = `
                <div class="ska-premium-upgrade-ribbon">UPGRADE!</div>
                <button class="ska-premium-upgrade-close" type="button" data-action="close-premium-upgrade" aria-label="Upgrade-Box schließen">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6L6 18"></path>
                        <path d="M6 6l12 12"></path>
                    </svg>
                </button>
                <div class="ska-premium-upgrade-header">
                    <div class="ska-premium-upgrade-titleline">
                        <span class="ska-premium-upgrade-icon" aria-hidden="true">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M13 2L3 14h7l-1 8 12-14h-7l1-6z"></path>
                            </svg>
                        </span>
                        <strong>Erhalte Premium Zugriff</strong>
                    </div>
                    <span>Mehr Analysen, Reports & Vergleich:<br>Premium lohnt sich besonders für Autoren, Sprecher, Teams und Agenturen, die tiefer optimieren wollen.</span>
                </div>
                <div class="ska-premium-upgrade-grid">
                    <div class="ska-premium-upgrade-col is-free">
                        <div class="ska-premium-upgrade-title">Basis</div>
                        <div class="ska-premium-upgrade-price ska-premium-upgrade-price--free">0,00 EUR</div>
                        <div class="ska-premium-upgrade-price-note">für immer</div>
                        <div class="ska-premium-upgrade-section">
                            <div class="ska-premium-upgrade-subtitle">Funktionen</div>
                            <ul class="ska-premium-upgrade-listing">
                                ${renderList(freeFunctions)}
                            </ul>
                        </div>
                        <div class="ska-premium-upgrade-section">
                            <div class="ska-premium-upgrade-subtitle">Analyseboxen</div>
                            <ul class="ska-premium-upgrade-listing">
                                ${renderList(freeCards, { stripIcons: true })}
                            </ul>
                        </div>
                    </div>
                    <div class="ska-premium-upgrade-col is-premium">
                        <div class="ska-premium-upgrade-header-row">
                            <div class="ska-premium-upgrade-title">Premium</div>
                            <span class="ska-premium-upgrade-badge">Monatlich kündbar</span>
                        </div>
                        <div class="ska-premium-upgrade-price" data-role="premium-price">
                            <span class="ska-premium-upgrade-price-label">${priceLabel}</span>
                            <span class="ska-premium-upgrade-price-value">${selectedPlan.price}</span>
                        </div>
                        <div class="ska-premium-upgrade-price-note" data-role="premium-note">${renderPlanNote(selectedPlan)}</div>
                        <div class="ska-premium-upgrade-switch">
                            ${premiumPlans.map(plan => `
                                <button class="ska-premium-plan-btn ${plan.id === selectedPlan.id ? 'is-active' : ''}" data-action="premium-price-plan" data-role="premium-plan" data-plan="${plan.id}">
                                    <span>${plan.label}</span>
                                    ${plan.badge ? `<em>${plan.badge}</em>` : ''}
                                </button>
                            `).join('')}
                        </div>
                        <div class="ska-premium-upgrade-section ska-premium-upgrade-section--plans">
                            <div class="ska-premium-upgrade-subtitle">Funktionen</div>
                            <ul class="ska-premium-upgrade-listing ska-premium-upgrade-listing--grid">
                                ${renderList(premiumFunctions)}
                            </ul>
                        </div>
                        <div class="ska-premium-upgrade-section ska-premium-upgrade-section--analysis">
                            <div class="ska-premium-upgrade-subtitle">Analyseboxen</div>
                            <ul class="ska-premium-upgrade-listing ska-premium-upgrade-listing--grid">
                                ${renderList(premiumCards, { stripIcons: true })}
                            </ul>
                        </div>
                        <div class="ska-premium-upgrade-cta">
                            <a class="ska-btn ska-btn--primary" href="#ska-premium-upgrade">Jetzt Premium freischalten</a>
                            <button class="ska-btn ska-btn--secondary" data-action="premium-info">Mehr Informationen</button>
                        </div>
                    </div>
                </div>`;
            if (existing) {
                existing.id = 'ska-premium-upgrade';
                existing.innerHTML = html;
            } else {
                const card = document.createElement('div');
                card.className = 'ska-premium-upgrade-card';
                card.id = 'ska-premium-upgrade';
                card.innerHTML = html;
                container.insertBefore(card, this.legendContainer);
            }
        }

        renderPremiumTeaserNote() {
            if (!this.legendContainer) return;
            const container = this.legendContainer.parentElement;
            if (!container) return;
            const existing = container.querySelector('.ska-premium-teaser-note');
            if (existing) existing.remove();
            if (this.isPremiumActive()) return;
            const profile = this.settings.role;
            const allowed = profile && SA_CONFIG.PROFILE_CARDS[profile] ? new Set(SA_CONFIG.PROFILE_CARDS[profile]) : null;
            const showAll = profile ? this.state.showAllCards : true;
            const filteredItems = new Set(SA_CONFIG.CARD_ORDER.filter((id) => {
                if (!allowed || showAll) return true;
                return allowed.has(id);
            }));
            const teaserCards = SA_CONFIG.PREMIUM_TEASERS.filter((id) => this.isCardAvailable(id) && filteredItems.has(id));
            const availablePremiumCards = SA_CONFIG.PREMIUM_CARDS.filter((id) => this.isCardAvailable(id) && filteredItems.has(id));
            const remainingCount = availablePremiumCards.filter((id) => !teaserCards.includes(id)).length;
            if (!remainingCount) return;
            const note = document.createElement('div');
            note.className = 'ska-premium-teaser-note';
            note.textContent = `+ ${remainingCount} weitere Analyseboxen`;
            const upgradeCard = container.querySelector('.ska-premium-upgrade-card');
            if (upgradeCard) {
                container.insertBefore(note, upgradeCard);
            } else {
                container.insertBefore(note, this.legendContainer);
            }
        }

        renderComparison(sec, w, sc) {
            const oldRaw = this.state.savedVersion;
            const effectiveSettings = this.getEffectiveSettings();
            const oldRead = SA_Logic.analyzeReadability(oldRaw, effectiveSettings);
            const oldWpm = SA_Logic.getWpm(effectiveSettings);
            const oldSec = (oldRead.speakingWordCount / oldWpm * 60) + SA_Utils.getPausenTime(oldRaw, effectiveSettings);
            
            const curRead = SA_Logic.analyzeReadability(this.getText(), effectiveSettings);
            const curWpm = SA_Logic.getWpm(effectiveSettings);
            
            // Helper to get total weight for comparison
            const getFillerWeight = (fillers) => {
                return Object.keys(fillers).reduce((acc, word) => acc + (fillers[word].count * fillers[word].weight), 0);
            };

            const countObj = (r, raw) => ({
                fillers: getFillerWeight(SA_Logic.findFillers(r.cleanedText)),
                passive: SA_Logic.findPassive(r.cleanedText).length,
                stumbles: (() => { const s = SA_Logic.findStumbles(raw); return s.long.length + s.camel.length + s.phonetic.length + s.hiatus.length + s.consonant_clusters.length; })()
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

            const diff = SA_Utils.generateWordDiff(oldRaw, this.getText());
            const diffHtml = diff.tooLarge
                ? `<div class="ska-diff-warning">Diff-Ansicht deaktiviert (Text zu lang). Tipp: kürzere Abschnitte vergleichen.</div>`
                : (diff.html
                    ? `<div class="ska-diff-panel">
                            <div class="ska-diff-header">Diff-Ansicht (Wortbasis)</div>
                            <div class="ska-diff-body">${diff.html}</div>
                            <div class="ska-diff-legend">
                                <span class="ska-diff-added">Hinzugefügt</span>
                                <span class="ska-diff-removed">Entfernt</span>
                            </div>
                        </div>`
                    : '');

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
                        ${diffHtml}
                    </div>
                </div>`;
            this.compareRow.classList.add('is-active');
        }

        updateCard(id, html, parent = this.bottomGrid, extraClass = '', headerExtraHtml = '', isToggleable = true) {
            if (!parent) return; 
            let card = parent.querySelector(`[data-card-id="${id}"]`);
            const isExcluded = this.state.excludedCards.has(id);
            const toggleStateClass = isExcluded ? 'is-off' : 'is-on';
            const isLocked = !this.isCardUnlocked(id);
            const toggleIcon = isExcluded 
                ? `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color:#94a3b8"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>` 
                : `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color:#16a34a"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

            const toggleBtnHtml = (id !== 'overview' && isToggleable) ? `<button class="ska-whitelist-toggle ${toggleStateClass}" title="${isExcluded ? 'Analyse aktivieren' : 'Analyse deaktivieren'}">${toggleIcon}</button>` : '';
            const resolvedHtml = html;

            // UPDATED HEADER WITH INFO BADGE
            const infoText = SA_CONFIG.CARD_DESCRIPTIONS[id];
            const infoHtml = infoText ? `<div class="ska-card-info-icon">
                <span class="ska-info-dot">i</span>
                <div class="ska-card-info-tooltip">${infoText}</div>
            </div>` : '';

            const buildHeader = () => {
                const lockBadge = isLocked ? '<span class="ska-premium-badge">Premium</span>' : '';
                return `<div class="ska-card-header">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <h3>${SA_CONFIG.CARD_TITLES[id]}</h3>
                                ${infoHtml}
                            </div>
                            <div style="display:flex; gap:0.5rem; align-items:center;">
                                ${headerExtraHtml}${lockBadge}${toggleBtnHtml}${id!=='overview' ? '<button class="ska-hide-btn" title="Ausblenden"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></button>' : ''}
                            </div>
                        </div>`;
            };

            if(!card) {
                card = document.createElement('div'); 
                card.className = `skriptanalyse-card ${extraClass||''}`; 
                card.dataset.cardId = id;
                card.classList.toggle('is-minimized', false);
                card.classList.toggle('is-locked', isLocked);
                if(!this.isRestoring) { card.classList.add('ska-animate-enter'); }
                let h = ''; if(SA_CONFIG.CARD_TITLES[id]) h = buildHeader();
                
                // IMPORTANT: Use Flex column to allow sticky footer
                const b = document.createElement('div'); 
                b.className = 'ska-card-body'; 
                b.style.display = 'flex';
                b.style.flexDirection = 'column';
                b.style.flex = '1';
                b.innerHTML = `<div class="ska-card-body-content">${resolvedHtml}</div>`;
                
                // HEADER FIRST, THEN BODY
                card.innerHTML = h;
                card.appendChild(b);
                if (isLocked) {
                    const lock = document.createElement('div');
                    lock.className = 'ska-premium-inline';
                    lock.innerHTML = '<strong>Premium-Funktionen</strong><span>Upgrade für volle Ergebnisse.</span><a class="ska-btn ska-btn--secondary ska-btn--compact" href="#ska-premium-upgrade">Premium freischalten</a>';
                    card.appendChild(lock);
                }
                
                parent.appendChild(card);
            } else {
                 card.classList.toggle('is-minimized', false);
                 card.classList.toggle('is-locked', isLocked);
                 const body = card.querySelector('.ska-card-body');
                 body.innerHTML = `<div class="ska-card-body-content">${resolvedHtml}</div>`;
                 // Re-apply flex style just in case
                 body.style.display = 'flex';
                 body.style.flexDirection = 'column';
                 body.style.flex = '1';

                 if(SA_CONFIG.CARD_TITLES[id]) {
                     const oldHeader = card.querySelector('.ska-card-header');
                     if(oldHeader) oldHeader.outerHTML = buildHeader();
                 }
                 const lock = card.querySelector('.ska-premium-inline');
                 if (isLocked) {
                    if (!lock) {
                        const lockEl = document.createElement('div');
                        lockEl.className = 'ska-premium-inline';
                        lockEl.innerHTML = '<strong>Premium-Funktionen</strong><span>Upgrade für volle Ergebnisse.</span><a class="ska-btn ska-btn--secondary ska-btn--compact" href="#ska-premium-upgrade">Premium freischalten</a>';
                        card.appendChild(lockEl);
                    }
                 } else {
                    if (lock) lock.remove();
                    body.querySelectorAll('.ska-problem-item.is-hidden-premium').forEach(item => item.classList.remove('is-hidden-premium'));
                    const note = body.querySelector('.ska-premium-note');
                    if (note) note.remove();
                 }
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('.skriptanalyse-app').forEach(el => new SkriptAnalyseWidget(el)));
})();
