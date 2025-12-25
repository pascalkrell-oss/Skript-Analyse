/**
 * Skript-Analyse App 4.75.40 (Wave Preview & Audio Refinement)
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
        COLORS: { success: '#16a34a', warn: '#ea580c', error: '#dc2626', blue: '#1a93ee', text: '#0f172a', muted: '#94a3b8', disabled: '#cbd5e1' },
        
        WPM: { werbung: 170, imagefilm: 155, erklaer: 145, hoerbuch: 115, podcast: 150, ansage: 160, elearning: 135, social: 170, default: 150 },
        SPS: { werbung: 4.6, imagefilm: 4.0, erklaer: 3.8, hoerbuch: 3.4, podcast: 3.8, ansage: 3.9, elearning: 3.5, social: 4.8, default: 3.8 },

        GENRE_LABELS: { werbung: 'Werbung', imagefilm: 'Imagefilm', erklaer: 'Erklärvideo', hoerbuch: 'Hörbuch', podcast: 'Podcast', ansage: 'Telefonansage', elearning: 'E-Learning', social: 'Social Media' },
        
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
            'notwendig': 'Not-wenn-dich',
            'notwendige': 'Not-wenn-di-ge',
            'notwendigkeit': 'Not-wenn-dich-keit',
            'notwendigerweise': 'Not-wenn-di-ger-wei-se',
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
            pronunciation: '🗣️ Aussprache-Check'
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
            pronunciation: 'Zeigt Wörter mit besonderer Aussprache und ermöglicht Audiowiedergabe.'
        },

        CARD_ORDER: ['char', 'rhythm', 'coach', 'vocabulary', 'role_dist', 'pronunciation', 'gender', 'dialog', 'start_var', 'stumble', 'breath', 'adjective', 'echo', 'passive', 'fillers', 'anglicism', 'nominal_chain', 'nominal', 'marker', 'cta'],
        
        FILLER_DB: {
            'eigentlich': 1.0, 'sozusagen': 1.0, 'irgendwie': 1.0, 'quasi': 1.0, 
            'im prinzip': 1.0, 'gewissermaßen': 1.0, 'halt': 0.8, 'eben': 0.8, 
            'wirklich': 0.6, 'einfach': 0.6, 'doch': 0.4, 'mal': 0.4, 
            'vielleicht': 0.5, 'schon': 0.4, 'glaube ich': 0.8, 'wohl': 0.5, 
            'natürlich': 0.4, 'letztendlich': 0.9, 'absolut': 0.5
        },
        
        TIPS: {
            fillers: ["Hoch-Gewichtete Wörter sind 'Semantisches Rauschen'.", "Wörter like 'eigentlich' suggerieren Unsicherheit. Sei konkret!", "Nutze Füllwörter nur bewusst für einen sehr lockeren Umgangston.", "Je kürzer der Spot (Werbung), desto tödlicher ist jedes 'vielleicht'.", "Prüfe bei jedem Füllwort: Ändert sich der Sinn, wenn es fehlt? Wenn nein: Weg damit."],
            nominal: ["Wörter auf -ung, -heit, -keit ersticken den Sprachfluss.", "Nominalstil klingt nach Behörde. Ein Skript sollte so klingen, wie Menschen wirklich reden.", "Suche nach dem 'versteckten Verb' in Substantiven wie 'die Bearbeitung' -> 'wir bearbeiten'.", "Textdichte durch Nominalstil ermüdet das Ohr deines Hörers sehr schnell.", "Verben sind die Motoren deiner Sprache – sie bringen Bewegung und Leben in das Skript."],
            nominal_chain: ["Behördensprache ist der Feind von Audio.", "Löse diese Cluster auf, indem du sie in zwei einfachere Sätze mit Verben verwandelst.", "Ketten von Substantiven (-ung, -heit, -ät) machen den Text atemlos und hölzern."],
            role_dist: ["Nutze die Rollenerkennung für Zeit-Kalkulation.", "Zu viele kurze Einwürfe können den Fluss stören, zu lange Monologe ermüden.", "Achte auf ein ausgewogenes Verhältnis, wenn es ein Dialog sein soll."],
            passive: ["Aktivsprache erzeugt Bilder im Kopf.", "Passiv versteckt den Handelnden ('Es wurde entschieden' vs 'Wir entschieden').", "Der Passiv-Killer sucht nach 'werden' + 'gemacht/getan' (Partizip II).", "Vermeide 'wurde/werden', wenn du Dynamik und Verantwortung transportieren willst.", "Aktive Sätze sind meist kürzer, prägnanter und überzeugender."],
            anglicism: ["Bleib verständlich.", "Prüfe kritisch: Gibt es ein einfacheres deutsches Wort, das jeder sofort versteht?", "Anglizismen können modern wirken, aber auch eine Barriere zwischen dir und dem Hörer bauen.", "Nutze englische Begriffe nur dort, wo sie als etablierter Fachbegriff unverzichtbar sind.", "In Audio-Medien zählen vertraute Wörter mehr, da der Hörer nicht zurückblättern kann."],
            echo: ["Variiere deine Wortwahl für mehr Lebendigkeit.", "Suche nach Synonymen, um den Text für den Sprecher lebendig zu halten.", "Echos innerhalb von zwei Sätzen fallen im Audio sofort als 'Sprechfehler' auf.", "Wortwiederholungen ermüden das Gehör. Nutze ein Thesaurus-Tool für Abwechslung.", "Ein reicher Wortschatz wirkt kompetenter und hält die Aufmerksamkeit des Hörers hoch."],
            breath: ["Ein Gedanke pro Satz. Das gibt Raum zum Atmen.", "Viele Kommas sind oft ein Zeichen für Schachtelsätze. Trenne sie mit einem Punkt.", "Lange Sätze zwingen den Sprecher zu hohem Tempo – das stresst den Hörer.", "Prüfe: Kannst du den Satz laut lesen, ohne am Ende außer Atem zu sein?", "Kurze Sätze erhöhen die Textverständlichkeit bei komplexen Themen drastisch."],
            stumble: ["Einfache Phonetik hilft der Emotion.", "Vermeide Bandwurmwörter – sie sind schwer zu betonen und fehleranfällig.", "Lies kritische Stellen dreimal schnell hintereinander laut. Klappt es? Dann ist es okay.", "CamelCase Wörter wie 'SoftwareLösung' sind visuelle Marker, aber akustische Hürden.", "Achte auf 'Zisch-Gewitter' (S, Z, Sch), die am Mikrofon oft unangenehm knallen."],
            cta: ["Der CTA gehört in die letzten 10% des Textes.", "Verwende den Imperativ ('Sichere dir...'), um eine direkte Handlung auszulösen.", "Vermeide Konjunktive im CTA. 'Du könntest' ist viel schwächer als 'Mach es jetzt'.", "Wenn der CTA versteckt in der Mitte liegt, verpufft die Wirkung oft."],
            adjective: ["Streiche Adjektive, die im Substantiv stecken.", "Show, don't tell: Statt 'es war ein gefährlicher Hund', beschreibe das Knurren.", "Zu viele Adjektive wirken oft 'blumig' und schwächen starke Substantive und Verben.", "Nutze Adjektive sparsam, um echte Highlights zu setzen.", "Wörter auf -lich oder -ig klingen in Häufung oft nach Werbesprache."],
            rhythm: ["Short-Short-Long ist ein klassischer Rhythmus.", "Monotonie tötet die Aufmerksamkeit. Vermeide viele gleich lange Sätze hintereinander.", "Nutze kurze Sätze für Fakten und Tempo. Nutze längere für Erklärungen.", "Ein guter Text tanzt: Variiere zwischen kurzen und mittellangen Sätzen.", "Die visuelle Welle zeigt dir sofort, wo dein Text ins Stocken gerät."],
            dialog: ["Achte auf klare Sprecherwechsel.", "Werbespots wirken durch Dialoge ('Szenen') oft authentischer als reine Ansagen.", "Zu viel Dialog ohne Erzähler kann den Hörer orientierungslos machen.", "Hörbücher brauchen lebendige Figuren. Zu wenig Dialog wirkt oft trocken.", "Dialoge lockern lange Erklär-Passagen auf und erhöhen die Aufmerksamkeit."],
            gender: ["Sprache schafft Wirklichkeit.", "Oft sind Partizipien ('Mitarbeitende') eine elegante Lösung.", "Vermeide das generische Maskulinum in Corporate Communications.", "Neutrale Sprache wirkt moderner und professioneller.", "Überprüfe, ob 'Kunden' wirklich nur Männer meint, oder ob 'Kundschaft' besser passt."],
            start_var: ["Variiere den Satzanfang für mehr Dynamik.", "Variiere die Satzstruktur: Stell mal das Objekt oder eine Zeitangabe an den Anfang.", "Monotonie im Satzbau überträgt sich sofort auf die Sprechmelodie.", "Wiederholungen sind nur okay, wenn sie als rhetorisches Stilmittel (Anapher) gewollt sind.", "Verbinde kurze Sätze logisch miteinander, statt sie nur aneinanderzureihen."],
            vocabulary: ["Ein hoher TTR-Wert (>60) zeigt Reichtum.", "Ein niedriger Wert (<40) ist typisch für fokussierte Werbebotschaften oder Claims.", "Wiederholungen senken den Wortwert, sind aber für Audio-Branding oft gewollt.", "Überprüfe bei niedrigem Wert: Ist die Wiederholung Absicht oder Faulheit?"],
            pronunciation: ["Standarddeutsch: -ig wird wie -ich gesprochen.", "Fremdwörter wie 'Chance' oder 'Engagement' stolperfrei auszusprechen, wirkt professionell.", "Achte bei 'sp' und 'st' am Wortanfang immer auf den 'Sch'-Laut (Schtein, Schpiel).", "Klicke auf das Lautsprecher-Symbol, um dir die Standard-Aussprache anzuhören."]
        },

        MARKERS: window.SKA_CONFIG_PHP && window.SKA_CONFIG_PHP.markers ? window.SKA_CONFIG_PHP.markers : []
    };

    const SA_Utils = {
        debounce: (func, delay) => { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; },
        formatMin: (sec) => { if (!sec || sec <= 0) return '0:00'; let m = Math.floor(sec / 60), s = Math.round(sec % 60); if(s===60){m++;s=0} return `${m}:${s < 10 ? '0' : ''}${s}`; },
        cleanTextForCounting: (text) => text.replace(/\|[0-9\.]+S?\|/g, '').replace(/\[PAUSE:.*?\]/g, '').replace(/\|/g, ''),
        getPausenTime: (text) => {
            let total = 0;
            const legacy = text.match(/\|([0-9\.]+)S?\|/g) || [];
            total += legacy.reduce((acc, m) => acc + (parseFloat(m.replace(/[^0-9.]/g, '')) || 0), 0);
            const newFormat = text.match(/\[PAUSE\s*:\s*([0-9]+(?:\.[0-9]+)?)(?:s)?\]/gi) || [];
            total += newFormat.reduce((acc, m) => {
                const val = m.match(/([0-9]+(?:\.[0-9]+)?)/);
                return acc + (val ? parseFloat(val[1]) : 0);
            }, 0);
            total += ((text.match(/\|/g) || []).length - legacy.length * 2) * 0.5;
            return total;
        },
        insertAtCursor: (field, value) => {
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
        
        speak: (text) => {
            if (!window.speechSynthesis) return;
            window.speechSynthesis.cancel();
            
            let spokenText = text.toLowerCase().trim();
            const dictWord = spokenText;
            
            if (SA_CONFIG.PRONUNCIATION_DB[dictWord]) {
                spokenText = SA_CONFIG.PRONUNCIATION_DB[dictWord];
            } else {
                spokenText = spokenText
                    .replace(/([^aeiouäöü])ig\b/g, '$1ich')
                    .replace(/\bver/g, 'fer')
                    .replace(/\bvor/g, 'for')
                    .replace(/\bviel/g, 'fiel')
                    .replace(/ph/g, 'f')
                    .replace(/qu/g, 'kw')
                    .replace(/chs/g, 'ks')
                    .replace(/\b([v])/g, 'f');
            }
            
            const u = new SpeechSynthesisUtterance(spokenText);
            u.lang = 'de-DE';
            u.rate = 0.82;
            u.pitch = 1.0;
            window.speechSynthesis.speak(u);
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
                        margin-top: 1rem;
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
        countSyllables: (word) => {
            word = word.toLowerCase();
            if (word.length <= 3) return 1; 
            word = word.replace(/(?:eu|au|ei|ie|äu|oi|ui)/g, 'a');
            const matches = word.match(/[aeiouäöü]/g);
            return matches ? matches.length : 1;
        },
        analyzeReadability: (text) => {
            const clean = SA_Utils.cleanTextForCounting(text).trim();
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
        analyzeVocabulary: (words) => {
            if(!words || words.length === 0) return { ttr: 0, unique: 0, total: 0 };
            const normalized = words.map(w => w.toLowerCase().replace(/[.,;!?":()]/g, ''));
            const unique = new Set(normalized);
            const ttr = (unique.size / normalized.length) * 100;
            return { ttr: ttr, unique: unique.size, total: normalized.length };
        },
        getWpm: (s) => (SA_CONFIG.WPM[s.usecase] || 150),
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
        findNominalStyle: (text) => { const regex = /\b([a-zA-ZäöüÄÖÜß]+(?:ung|heit|keit|tion|schaft|tum|ismus|ling|nis))\b/gi; const matches = text.match(regex) || []; return [...new Set(matches)]; },
        
        findNominalChains: (text) => {
            const sentences = text.split(/[.!?]+(?=\s|$)/);
            const chains = [];
            const nominalRegex = /\b([a-zA-ZäöüÄÖÜß]+(?:ung|heit|keit|tion|schaft|tum|ismus|ling|nis|ät))\b/i;

            sentences.forEach(s => {
                const words = s.trim().split(/\s+/);
                let count = 0;
                words.forEach(w => {
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
                     const spoken = w.slice(0, -2) + 'ich';
                     findings.push({ word: w, hint: w.slice(0, -2) + 'ich (Standard)', audio: spoken });
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
            const l = text.toLowerCase(); 
            let posScore = 0; let negScore = 0;
            SA_CONFIG.SENTIMENT.positive.forEach(w => { if(l.includes(w)) posScore += (l.match(new RegExp(w, 'g')) || []).length; });
            SA_CONFIG.SENTIMENT.negative.forEach(w => { if(l.includes(w)) negScore += (l.match(new RegExp(w, 'g')) || []).length; });
            const total = posScore + negScore;
            let temp = 0;
            if(total > 0) temp = ((posScore - negScore) / total) * 100;
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
                const read = SA_Logic.analyzeReadability(p);
                const pause = SA_Utils.getPausenTime(p);
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

                    const read = SA_Logic.analyzeReadability(text);
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
                        const oldRead = SA_Logic.analyzeReadability(data.savedVersion);
                        const oldSec = (oldRead.wordCount / data.wpm * 60) + SA_Utils.getPausenTime(data.savedVersion);
                        const newSec = (read.speakingWordCount / data.wpm * 60) + SA_Utils.getPausenTime(text);
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

            this.textarea.placeholder = "Dein Skript hier einfügen... \n\nWir analysieren Sprechdauer, Lesbarkeit und Stil in Echtzeit. \nEinfach tippen oder Text reinkopieren.";

            this.settings = { usecase: 'auto', charMode: 'spaces', numberMode: 'digit', branch: 'all', targetSec: 0, role: '', manualWpm: 0, timeMode: 'wpm' };
            
            this.state = { 
                savedVersion: '', 
                currentData: {}, 
                hiddenCards: new Set(), 
                tipIndices: { fillers: 0, passive: 0, nominal: 0, anglicism: 0, echo: 0, breath: 0, stumble: 0, cta: 0, adjective: 0, rhythm: 0, dialog: 0, gender: 0, start_var: 0, role_dist: 0, nominal_chain: 0, vocabulary: 0, pronunciation: 0 }, 
                excludedCards: new Set() 
            };
            
            this.isRestoring = false;

            this.loadUIState();
            this.initMarkerDropdown();
            this.renderSettingsModal();
            this.bindEvents();
            
            this.injectGlobalStyles(); // CSS Overrides

            const saved = SA_Utils.storage.load(SA_CONFIG.STORAGE_KEY);
            if (saved && saved.trim().length > 0) {
                this.root.classList.add('is-restoring-now');
                this.isRestoring = true;
                this.textarea.value = saved;
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
                        <div style="display:flex; gap:1rem; align-items:stretch;">
                            <label style="flex:1; border:1px solid #e2e8f0; padding:1rem; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:0.5rem;">
                                <input type="radio" name="ska-char-mode" value="spaces" ${this.settings.charMode === 'spaces' ? 'checked' : ''}>
                                <span style="font-size:0.9rem;">Inkl. Leerzeichen</span>
                            </label>
                            <label style="flex:1; border:1px solid #e2e8f0; padding:1rem; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:0.5rem;">
                                <input type="radio" name="ska-char-mode" value="no-spaces" ${this.settings.charMode === 'no-spaces' ? 'checked' : ''}>
                                <span style="font-size:0.9rem;">Ohne Leerzeichen</span>
                            </label>
                        </div>
                    </div>

                    <div style="margin-bottom:1.5rem;">
                        <label style="display:block; font-weight:700; color:#334155; margin-bottom:0.5rem;">Zahlen Interpretation</label>
                        <div style="display:flex; gap:1rem; align-items:stretch;">
                            <label style="flex:1; border:1px solid #e2e8f0; padding:1rem; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:0.5rem;">
                                <input type="radio" name="ska-num-mode" value="digit" ${this.settings.numberMode === 'digit' ? 'checked' : ''}>
                                <div>
                                    <span style="font-size:0.9rem; display:block;">Als Zahl</span>
                                    <span style="font-size:0.75rem; color:#94a3b8;">12 = 2 Zeichen</span>
                                </div>
                            </label>
                            <label style="flex:1; border:1px solid #e2e8f0; padding:1rem; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:0.5rem;">
                                <input type="radio" name="ska-num-mode" value="word" ${this.settings.numberMode === 'word' ? 'checked' : ''}>
                                <div>
                                    <span style="font-size:0.9rem; display:block;">Als Wort</span>
                                    <span style="font-size:0.75rem; color:#94a3b8;">Zwölf = 5 Zeichen</span>
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
                        <div style="display:flex; gap:1rem; align-items:stretch;">
                            <label style="flex:1; border:1px solid #e2e8f0; padding:1rem; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:0.5rem;">
                                <input type="radio" name="ska-time-mode" value="wpm" ${this.settings.timeMode === 'wpm' ? 'checked' : ''}>
                                <div>
                                    <strong style="display:block; font-size:0.9rem;">WPM (Standard)</strong>
                                    <span style="font-size:0.75rem; color:#64748b;">Wörter pro Minute</span>
                                </div>
                            </label>
                            <label style="flex:1; border:1px solid #e2e8f0; padding:1rem; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:0.5rem;">
                                <input type="radio" name="ska-time-mode" value="sps" ${this.settings.timeMode === 'sps' ? 'checked' : ''}>
                                <div>
                                    <strong style="display:block; font-size:0.9rem;">SPS (Präzise)</strong>
                                    <span style="font-size:0.75rem; color:#64748b;">Silben pro Sekunde</span>
                                </div>
                            </label>
                        </div>
                        <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.5rem;">SPS bietet eine höhere Genauigkeit für Synchronsprecher, da lange Wörter (z.B. "Donaudampfschifffahrt") korrekt als länger berechnet werden als kurze.</p>
                    </div>
                </div>
                <div class="ska-modal-footer">
                     <button type="button" class="ska-btn ska-btn--primary" style="display:inline-flex; align-items:center; justify-content:center; height:40px; padding:0 1.5rem; line-height:1; padding-top:1px;" data-action="close-settings">Speichern & Schließen</button>
                </div>
            </div>`;
            document.body.appendChild(m);
            
            // Bind radio changes
            m.querySelectorAll('input[type="radio"]').forEach(r => r.addEventListener('change', (e) => {
                if(e.target.name === 'ska-time-mode') this.settings.timeMode = e.target.value;
                if(e.target.name === 'ska-char-mode') this.settings.charMode = e.target.value;
                if(e.target.name === 'ska-num-mode') this.settings.numberMode = e.target.value;
                this.saveUIState(); 
                this.analyze(this.textarea.value);
            }));

            // Bind Target Change
            const targetInput = m.querySelector('#ska-set-target');
            if(targetInput) {
                targetInput.addEventListener('input', (e) => {
                    // Sync with main UI if present
                    if(this.targetInput) this.targetInput.value = e.target.value;
                    
                    const v = e.target.value.trim().split(':');
                    this.settings.targetSec = v.length > 1 ? (parseInt(v[0]||0)*60)+parseInt(v[1]||0) : parseInt(v[0]||0);
                    this.analyze(this.textarea.value);
                });
            }
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
                charMode: this.settings.charMode,
                numberMode: this.settings.numberMode
            }));
        }

        initMarkerDropdown() {
            const container = this.root.querySelector('.skriptanalyse-input-actions');
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
                item.onclick = (e) => { e.preventDefault(); SA_Utils.insertAtCursor(this.textarea, m.val); this.analyze(this.textarea.value); menu.classList.remove('is-open'); };
                menu.appendChild(item);
            });
            document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) menu.classList.remove('is-open'); });
            wrap.appendChild(btn); wrap.appendChild(menu); container.appendChild(wrap);
        }

        bindEvents() {
            this.textarea.addEventListener('input', SA_Utils.debounce(() => this.analyze(this.textarea.value), 250));
            this.root.querySelectorAll('select').forEach(s => s.addEventListener('change', (e) => {
                const k = e.target.dataset.filter || (e.target.hasAttribute('data-role-select') ? 'role' : null);
                if(k) this.settings[k] = e.target.value; this.analyze(this.textarea.value);
            }));
            if(this.targetInput) this.targetInput.addEventListener('input', (e) => {
                const v = e.target.value.trim().split(':');
                this.settings.targetSec = v.length > 1 ? (parseInt(v[0]||0)*60)+parseInt(v[1]||0) : parseInt(v[0]||0);
                this.analyze(this.textarea.value);
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
                        this.analyze(this.textarea.value);
                    }
                    return;
                }

                if(!btn) return;
                const act = btn.dataset.action;
                
                if(act === 'play-word') {
                    const txt = btn.dataset.text;
                    if(txt) SA_Utils.speak(txt);
                    e.preventDefault();
                    return;
                }

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
                        
                        e.preventDefault(); 
                    } 
                }

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

                if(act === 'clean') { 
                    this.textarea.value = this.textarea.value.replace(/[\t\u00A0]/g,' ').replace(/ +/g,' ').replace(/\n{3,}/g,'\n\n'); 
                    this.analyze(this.textarea.value); 
                }
                if(act === 'save-version') { 
                    this.state.savedVersion = this.textarea.value; 
                    const h=this.root.querySelector('[data-role-toast]'); if(h){ h.classList.add('is-visible'); setTimeout(()=>h.classList.remove('is-visible'),2500); }
                    this.analyze(this.textarea.value); 
                }

                if(act === 'export-marker-json') {
                    const markers = SA_Logic.generateMarkerData(this.textarea.value, this.settings);
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
                    return;
                }

                if(!btn) return;
                const act = btn.dataset.action;

                if(act.startsWith('close-')) { 
                    modal.classList.remove('is-open'); 
                    document.body.classList.remove('ska-modal-open');
                    e.preventDefault(); 
                }

                if(act === 'generate-pdf-final') {
                    const opts = { 
                        metrics: modal.querySelector('#pdf-opt-overview')?.checked, 
                        details: modal.querySelector('#pdf-opt-details')?.checked, 
                        tips: modal.querySelector('#pdf-opt-tips')?.checked, 
                        compare: modal.querySelector('#pdf-opt-compare')?.checked, 
                        script: modal.querySelector('#pdf-opt-script')?.checked 
                    };
                    const pdfData = { ...this.state.currentData, savedVersion: this.state.savedVersion };
                    SA_PDF.generate(this.textarea.value, pdfData, this.settings, opts, btn);
                }

                if(act === 'confirm-reset') {
                    this.textarea.value=''; 
                    this.settings={usecase:'auto',charMode:'spaces',numberMode:'digit',branch:'all',targetSec:0,role:'',manualWpm:0, timeMode:'wpm'}; 
                    this.state.savedVersion=''; 
                    this.state.hiddenCards.clear(); 
                    this.state.excludedCards.clear();
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
                    }, 500); 
                }
            } else {
                this.state.hiddenCards.delete(id); 
                this.saveUIState();
                this.renderHiddenPanel(); 
                this.analyze(this.textarea.value);
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
                this.legendContainer.innerHTML = `<div class="ska-legend-box"><div class="ska-card-header" style="padding-bottom:0; border:none; margin-bottom:1rem;"><h3>Legende & Hilfe</h3></div><div class="ska-legend-body" style="padding-top:0;"><div class="ska-legend-grid"><div class="ska-legend-def"><strong>Auffällige Sätze:</strong> Zeigt Sätze > 25 Wörter oder viele Kommas.</div><div class="ska-legend-def"><strong>Wort-Echos:</strong> Markiert Wiederholungen auf engem Raum.</div><div class="ska-legend-def"><strong>Dynamik-Check:</strong> Findet Passiv-Formulierungen.</div><div class="ska-legend-def"><strong>Bürokratie:</strong> Markiert Nominalstil (Ung/Heit/Keit).</div><div class="ska-legend-def"><strong>Denglisch:</strong> Findet unnötige Anglizismen.</div><div class="ska-legend-def"><strong>Füllwörter:</strong> Erkennt Wörter ohne inhaltlichen Mehrwert.</div><div class="ska-legend-def"><strong>Absätze:</strong> Zeigt die Textdichte / Struktur an.</div><div class="ska-legend-def"><strong>Regie-Tipp:</strong> Hinweise zu Länge & Stil.</div><div class="ska-legend-def" style="grid-column: 1 / -1; border-top:1px solid #f1f5f9; padding-top:0.8rem; margin-top:0.4rem;"><strong>🔒 Datenschutz:</strong> Die Analyse erfolgt zu 100% lokal in deinem Browser. Kein Text wird an einen Server gesendet.</div><div class="ska-legend-def" style="grid-column: 1 / -1;"><strong>⏱️ Methodik:</strong> Die Zeitberechnung basiert auf dem gewählten Genre-WPM (Wörter pro Minute) plus Pausenzeichen.</div></div></div></div>`;
            }
        }

        analyze(text) {
            SA_Utils.storage.save(SA_CONFIG.STORAGE_KEY, text);
            const raw = text || '', read = SA_Logic.analyzeReadability(raw);
            const wpm = SA_Logic.getWpm(this.settings);
            const sps = SA_Logic.getSps(this.settings);
            
            const pause = SA_Utils.getPausenTime(raw);
            
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
            
            if (this.settings.charMode === 'no-spaces') {
                countText = countText.replace(/\s/g, '');
            }
            
            const charC = countText.length;

            if (!raw.trim()) {
                this.root.querySelector('.ska-grid').classList.add('is-empty');
            } else {
                this.root.querySelector('.ska-grid').classList.remove('is-empty');
            }

            this.state.currentData = { duration: SA_Utils.formatMin(dur), wordCount: read.wordCount, wpm, score: read.score.toFixed(0), mode: this.settings.timeMode === 'sps' ? `${sps} SPS` : `${wpm} WPM` };
            this.renderOverview(dur, read.wordCount, charC, wpm, pause, read);

            if (read.wordCount === 0) {
                this.bottomGrid.innerHTML = ''; this.compareRow.innerHTML = ''; this.compareRow.classList.remove('is-active');
                this.renderHiddenPanel();
                if(this.legendContainer) this.legendContainer.innerHTML = '';
                return;
            }

            const isActive = (id) => !this.state.excludedCards.has(id);

            SA_CONFIG.CARD_ORDER.forEach((id, idx) => {
                if(this.state.hiddenCards.has(id)) return;
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
                }
                const c = this.bottomGrid.querySelector(`[data-card-id="${id}"]`); if(c) c.style.order = idx;
            });

            this.renderHiddenPanel();
            if(this.state.savedVersion) this.renderComparison(dur, read.wordCount, read.score);
            else { this.compareRow.innerHTML = ''; this.compareRow.classList.remove('is-active'); }
            this.renderLegend();
        }
        
        renderPronunciationCard(issues, active) {
            if(!active) return this.updateCard('pronunciation', this.renderDisabledState(), this.bottomGrid, '', '', true);
            let h = '';
            if(!issues || issues.length === 0) {
                 h = `<p style="color:#64748b; font-size:0.9rem;">Keine schwierigen Aussprachen gefunden.</p>`;
            } else {
                 h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Gefundene Wörter: <strong>${issues.length}</strong></div>`;
                 
                 // Use Grid only if multiple items
                 const gridStyle = issues.length > 1 ? 'display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;' : '';
                 
                 h += `<div class="ska-problem-list" style="${gridStyle}">`;
                 // Remove duplicates
                 const unique = [...new Map(issues.map(item => [item.word, item])).values()];
                 unique.forEach(item => {
                     h += `<div class="ska-problem-item" style="display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #e2e8f0; padding:0.5rem; border-radius:6px;">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <button data-action="play-word" data-text="${item.audio}" title="Anhören" style="background:none; border:none; cursor:pointer; color:#1a93ee; padding:2px; display:flex; align-items:center; line-height:1;">
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                </button>
                                <span style="font-weight:600; color:#334155; font-size:0.85rem;">${item.word}</span>
                            </div>
                            <span style="color:#2563eb; font-size:0.8rem;">${item.hint}</span>
                           </div>`;
                 });
                 h += `</div>`;
                 h += this.renderTipSection('pronunciation', true);
            }
            this.updateCard('pronunciation', h);
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
                 h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Monotone Wiederholungen</div><div class="ska-problem-list">`;
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
                 h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Kritische Passagen</div><div class="ska-problem-list">`;
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

            let genreList = '<div class="ska-overview-genre-box"><h4>Zeiten im Vergleich</h4><div class="ska-genre-grid-layout">';
            const cP = r ? SA_Utils.getPausenTime(this.textarea.value) : 0;
            const curWord = r ? r.wordCount : 0;
            const curSyl = r ? r.totalSyllables : 0;

            ['werbung', 'imagefilm', 'erklaer', 'hoerbuch', 'podcast'].forEach(g => {
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

            const trafficBadgeHtml = `<div class="ska-traffic-badge ska-traffic-badge--${traffic.class}">${traffic.label}</div>`;

            let scoreHintHtml = '';
            if (r && r.score < 60 && traffic.class !== 'neutral') {
                let hintText = 'Text vereinfachen.';
                if (r.avgSentence > 15 && r.syllablesPerWord > 1.6) hintText = 'Sätze kürzen & einfachere Wörter nutzen.';
                else if (r.avgSentence > 15) hintText = 'Sätze sind zu lang (Ø > 15 Wörter).';
                else if (r.syllablesPerWord > 1.6) hintText = 'Viele komplexe/lange Wörter.';
                
                scoreHintHtml = `<span class="ska-info-badge ska-info-badge--${traffic.class}"><span class="ska-tool-tooltip">${hintText}</span>INFO</span>`;
            }

            const html = `<div style="display:flex; flex-direction:column; gap:1.5rem; height:100%;">
                <div>
                    <div style="font-size:3.2rem; font-weight:800; color:${SA_CONFIG.COLORS.blue}; line-height:1; letter-spacing:-0.03em;">${SA_Utils.formatMin(sec)} <span style="font-size:1.1rem; font-weight:500; color:#94a3b8; margin-left:-5px;">Min</span></div>
                    <div style="font-size:0.75rem; text-transform:uppercase; color:#64748b; font-weight:700; margin-top:0.4rem; letter-spacing:0.05em; margin-bottom:0.2rem;">SPRECHDAUER &bull; ${gLbl}</div>
                    <div style="font-size:0.8rem; color:#64748b; font-weight:500;">Ø ${rateLabel}${pauseText}</div>
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

            return `<div class="ska-card-tips"><div class="ska-tip-header"><span class="ska-tip-badge">💡 Profi-Tipp <span style="opacity:0.6; font-weight:400; margin-left:4px;">${cI+1}/${tT}</span></span><button class="ska-tip-next-btn" data-action="next-tip">Nächster Tipp &rarr;</button></div><p class="ska-tip-content">${tip}</p></div>`;
        }

        renderGenderCard(issues, active) {
            if(!active) return this.updateCard('gender', this.renderDisabledState(), this.bottomGrid, '', '', true);

            let h = '';
            if(!issues || issues.length === 0) {
                 h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">🌈 Sprache wirkt inklusiv!</div>`;
            } else {
                h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Gefundene Begriffe</div><div class="ska-problem-list">`;
                const uniqueIssues = [...new Map(issues.map(item => [item.word, item])).values()];
                uniqueIssues.forEach(item => {
                    h += `<div class="ska-problem-item" style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:#ef4444; text-decoration:line-through; opacity:0.8;">${item.word}</span>
                            <span style="font-weight:bold; color:#22c55e;">➔ ${item.suggestion}</span>
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
                h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Gefundene Phrasen</div><div style="display:flex; flex-wrap:wrap; gap:0.35rem;">`;
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
                h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Gefundene Wörter</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem;">`;
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
            
            if(!k.length) {
                h = `<div style="text-align:center; padding:1rem; color:${SA_CONFIG.COLORS.success}; background:#f0fdf4; border-radius:8px;">✨ Sauber!</div>`;
            } else {
                const maxVal = k.length > 0 ? (fillers[k[0]].count * fillers[k[0]].weight) : 1;
                h = '<div class="ska-filler-list">';
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
                h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Gefundene Wörter</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem;">`;
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
                h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Gefundene Begriffe</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem;">`;
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
                    h += `<div id="ska-breath-hidden" class="ska-hidden-content">`;
                    killers.slice(3).forEach(k => { h += renderItem(k); });
                    h += `</div><button class="ska-expand-link" data-action="toggle-breath-more" data-total="${hiddenCount}">...und ${hiddenCount} weitere anzeigen</button>`;
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
                h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Gefundene Wiederholungen</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem;">`;
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
                    h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Zungenbrecher</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:0.8rem;">`; 
                    s.phonetic.forEach(w => {
                        h+=`<span class="skriptanalyse-badge" style="background:#f3e8ff; color:#6b21a8; border:1px solid #e9d5ff;">${w}</span>`;
                    });
                    h+='</div>'; 
                }
                if(s.camel.length) { 
                    h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Fachbegriffe</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:0.8rem;">`; 
                    s.camel.forEach(w => {
                        h+=`<span class="skriptanalyse-badge skriptanalyse-badge--camel">${w}</span>`;
                    });
                    h+='</div>'; 
                }
                if(s.long.length) { 
                    h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Lange Wörter</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:0.8rem;">`; 
                    s.long.forEach(w => {
                        h+=`<span class="skriptanalyse-badge skriptanalyse-badge--long">${w}</span>`;
                    });
                    h+='</div>'; 
                }
                if(s.alliter.length) {
                    h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Zungenbrecher & Alliterationen</div><div style="display:flex; flex-wrap:wrap; gap: 0.35rem; margin-bottom:0.8rem;">`; 
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
                h += `<div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:0.4rem;">Gefundene Signale (Gesamt)</div><div style="display:flex; gap:0.35rem; flex-wrap:wrap;">`; 
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

            let h = `<div style="height:100px; display:flex; align-items:flex-end; gap:2px; margin-bottom:4px; border-bottom:1px solid #e2e8f0; padding-bottom:5px;">`;
            
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
            h += `</div><div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600; color:#94a3b8; margin-top:2px;"><span>Start</span><span>Ende</span></div>`;
            
            // ADD PREVIEW BOX
            h += `<div class="ska-rhythm-preview" id="ska-preview-rhythm">Satz mit der Maus überfahren...</div>`;

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
                         preview.textContent = 'Satz mit der Maus überfahren...';
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
            const oldRead = SA_Logic.analyzeReadability(oldRaw);
            const oldWpm = SA_Logic.getWpm(this.settings);
            const oldSec = (oldRead.speakingWordCount / oldWpm * 60) + SA_Utils.getPausenTime(oldRaw);
            
            const curRead = SA_Logic.analyzeReadability(this.textarea.value);
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
            const curMetrics = { ...countObj(curRead, this.textarea.value), score: parseFloat(sc), words: w, time: sec };

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
                            <strong style="color:#64748b; margin-top:0.4rem;">Fazit:</strong> 
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
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
