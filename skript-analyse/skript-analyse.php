<?php
/**
 * Plugin Name: Skript-Analyse
 * Description: Modernes Analyse-Tool für Sprecher & Autoren. Version 4.75.9 (Final Polish).
 * Version: 4.75.9
 * Author: Pascal Krell
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'SKA_URL', plugin_dir_url( __FILE__ ) );
define( 'SKA_VER', '4.75.9' );

function ska_register_assets() {
    if ( is_admin() ) return;

    $jspdf_url = SKA_URL . 'assets/jspdf.umd.min.js';
    $pos_url = SKA_URL . 'assets/pos-tagger.js';
    $js_deps = array();

    if ( file_exists( plugin_dir_path( __FILE__ ) . 'assets/jspdf.umd.min.js' ) ) {
        wp_register_script( 'jspdf', $jspdf_url, array(), '2.5.1', true );
        $js_deps[] = 'jspdf';
    }

    if ( file_exists( plugin_dir_path( __FILE__ ) . 'assets/pos-tagger.js' ) ) {
        wp_register_script( 'skript-analyse-pos', $pos_url, array(), SKA_VER, true );
        $js_deps[] = 'skript-analyse-pos';
    }

    wp_register_style( 'skript-analyse-css', SKA_URL . 'assets/style.css', array(), SKA_VER );
    wp_register_script( 'skript-analyse-js', SKA_URL . 'assets/app.js', $js_deps, SKA_VER, true );
}
add_action( 'wp_enqueue_scripts', 'ska_register_assets' );

function ska_shortcode() {
    wp_enqueue_style( 'skript-analyse-css' );
    wp_enqueue_script( 'skript-analyse-js' );

    $markers_config = [
        ['label' => '| (Kurze Pause)', 'val' => '|', 'desc' => 'Natürliche Atempause (~0.5 Sek)'],
        ['label' => '1 Sekunde', 'val' => '|1S|', 'desc' => 'Feste Pause von einer Sekunde'],
        ['label' => '2 Sekunden', 'val' => '|2S|', 'desc' => 'Feste Pause von zwei Sekunden'],
        ['label' => '[ATMEN]', 'val' => '[ATMEN]', 'desc' => 'Regieanweisung: Hörbares Einatmen'],
        ['label' => '[BETONUNG]', 'val' => '[BETONUNG]', 'desc' => 'Das folgende Wort stark hervorheben'],
        ['label' => '[SZENE]', 'val' => "\n\n[SZENE]\n", 'desc' => 'Neuer Abschnitt / Szenenwechsel'],
        ['label' => '[LAUT]', 'val' => '[LAUT]', 'desc' => 'Dynamik steigern / Lauter werden'],
        ['label' => '[LEISE]', 'val' => '[LEISE]', 'desc' => 'Dynamik senken / Leiser werden'],
        ['label' => '[SCHNELL]', 'val' => '[SCHNELL]', 'desc' => 'Tempo deutlich anziehen'],
        ['label' => '[LANGSAM]', 'val' => '[LANGSAM]', 'desc' => 'Tempo drosseln / Getragen sprechen']
    ];
    
    $pro_mode = apply_filters( 'ska_pro_mode', false );
    $pro_mode = filter_var( $pro_mode, FILTER_VALIDATE_BOOLEAN );

    wp_localize_script( 'skript-analyse-js', 'SKA_CONFIG_PHP', array(
        'markers' => $markers_config,
        'pro' => $pro_mode,
        'isAdmin' => current_user_can( 'manage_options' ),
        'isLoggedIn' => is_user_logged_in(),
        'workerUrl' => SKA_URL . 'assets/analysis-worker.js',
    ));

    ob_start();
    ?>
    <div class="skriptanalyse-app">
        
        <header class="ska-header">
            <div class="ska-header-content">
                <h2>Jetzt Skript analysieren</h2>
                <p class="ska-intro-text">Füge Deinen Text ein und erhalte eine professionelle Einschätzung zu Länge, Tempo, Zielgruppe, Füllwörtern und Struktur. Optimiere Dein Skript für wirkungsvolles Sprechen oder bessere Lesbarkeit – perfekt für Autoren, Sprecher und Redakteure.</p>
                <div class="ska-header-separator"></div>
                <div class="ska-bookmark-hint">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="opacity:0.7"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    Tipp: Speichere diese Seite als Lesezeichen (Strg+D), um jederzeit schnellen Zugriff zu haben.
                </div>
            </div>
            <div class="ska-status-bar">
                 <span class="ska-status-badge"><span class="ska-dot"></span><span data-role-plan-label>100% Kostenlos & Sicher</span></span>
                 <?php if ( current_user_can( 'manage_options' ) ) : ?>
                    <div class="ska-admin-plan-toggle" data-role-admin-toggle>
                        <span>Free</span>
                        <label class="ska-switch">
                            <input type="checkbox" data-action="toggle-plan">
                            <span class="ska-switch-slider"></span>
                        </label>
                        <span>Premium</span>
                    </div>
                 <?php endif; ?>
            </div>
        </header>

        <div class="ska-toolbar">
            <div class="ska-toolbar-group">
                <div class="ska-select-wrapper">
                    <label>Profil</label>
                    <div class="ska-custom-select-wrapper">
                        <select class="ska-select" data-role-select>
                            <option value="">🧭 Allgemein</option>
                            <option value="sprecher">🎙️ Sprecher:in</option>
                            <option value="autor">✍️ Autor:in</option>
                            <option value="regie">🎬 Regie</option>
                            <option value="agentur">🏢 Agentur</option>
                            <option value="marketing">📈 Marketing</option>
                        </select>
                    </div>
                </div>
                <div class="ska-select-wrapper">
                    <label>Genre</label>
                    <div class="ska-custom-select-wrapper">
                        <select class="ska-select" data-filter="usecase">
                            <option value="auto">⚡ Auto-Detect</option>
                            <option value="werbung">📣 Werbespot</option>
                            <option value="imagefilm">🎞️ Imagefilm</option>
                            <option value="erklaer">🧠 Erklärvideo</option>
                            <option value="hoerbuch">🎧 Hörbuch</option>
                            <option value="podcast">🎙️ Podcast</option>
                            <option value="social">📱 Social Media</option>
                            <option value="elearning">🧑‍🏫 E-Learning</option>
                            <option value="buch">📖 Buch/Roman</option>
                        </select>
                    </div>
                </div>
                
                <button type="button" class="ska-btn ska-btn--ghost ska-settings-btn-inline" data-action="open-settings" title="Einstellungen">
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </button>
            </div>
            
            <div class="ska-toolbar-actions">
                <button type="button" class="ska-btn ska-btn--secondary" data-action="open-help">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin-right:6px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Anleitung & Hilfe
                </button>
                <button type="button" class="ska-btn ska-btn--primary" data-action="open-reset">Analyse zurücksetzen</button>
            </div>
        </div>

        <div class="ska-grid is-empty">
            <div class="ska-editor-panel">
                <div class="ska-panel-header">
                    <h3>Skript Editor</h3>
                    <div class="ska-editor-tools">
                        <div class="ska-tool-wrapper">
                            <button type="button" class="ska-tool-btn" data-action="clean">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10M12 21V7M7 11h10l-2 10H9l-2-10Z" />
                                </svg>
                                Skript aufräumen
                            </button>
                            <div class="ska-tool-tooltip">Entfernt doppelte Leerzeichen, Zeilenumbrüche und Formatierungsfehler.</div>
                        </div>

                        <div class="ska-tool-wrapper">
                            <button type="button" class="ska-tool-btn" data-action="save-version">
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin-right:3px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                Version merken
                            </button>
                            <div class="ska-tool-tooltip ska-tool-tooltip--premium">Premium: Versionen speichern & vergleichen.</div>
                        </div>
                        <div class="skriptanalyse-input-actions"></div> 
                    </div>
                </div>
                <div class="ska-editor-formatting" role="toolbar" aria-label="Textformatierung">
                    <button type="button" class="ska-format-btn" data-action="format-bold">Fett</button>
                    <button type="button" class="ska-format-btn" data-action="format-italic">Kursiv</button>
                    <button type="button" class="ska-format-btn" data-action="format-underline">Unterstrichen</button>
                    <button type="button" class="ska-format-btn" data-action="format-highlight">Textmarker</button>
                    <button type="button" class="ska-format-btn" data-action="format-strike">Durchgestrichen</button>
                    <div class="ska-formatting-actions"></div>
                </div>
                <div class="ska-textarea-wrapper">
                    <div class="skriptanalyse-textarea" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="Hier Text einfügen oder tippen..."></div>
                    <div class="ska-save-hint" data-role-save-hint></div>
                    <div class="ska-toast-notification" data-role-toast>Version gespeichert!</div>
                </div>
                <div class="ska-editor-footer"><span data-role-hint></span></div>
            </div>

            <div class="ska-dashboard-panel skriptanalyse-analysis-top-col">
                 <div class="skriptanalyse-analysis-top"></div>
            </div>
        </div>

        <div class="skriptanalyse-compare-row"></div>

        <div class="skriptanalyse-analysis-bottom">
            <div class="ska-tools-panel is-hidden">
                <div class="ska-tools-header">
                    <div class="ska-tools-title">
                        <h3><span class="ska-tools-title-icon">🧰</span>Werkzeuge</h3>
                        <p>Teleprompter, Pacing & Marker für die Umsetzung.</p>
                    </div>
                </div>
                <div class="ska-tools-grid"></div>
            </div>
            <div class="ska-analysis-filterbar"></div>
            <div class="skriptanalyse-analysis-bottom-grid"></div>
            <div class="skriptanalyse-hidden-panel"></div>
            <div class="skriptanalyse-legend-container"></div>
            <div class="ska-rating-box">
                <div class="ska-card-header">
                    <h3>Analyse-System bewerten</h3>
                </div>
                <p>Wie hilfreich sind die Auswertungen? Dein Feedback hilft, die Analyse weiter zu verbessern.</p>
                <div class="ska-rating-form">
                    <?php if (function_exists('do_shortcode')) : ?>
                        <?php echo do_shortcode('[fluentform id="7"]'); ?>
                    <?php else : ?>
                        <div class="ska-rating-fallback">
                            Das Bewertungsformular ist aktuell nicht verfügbar.
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <div class="ska-footer">
            <div class="ska-footer-intro">
                <p>Nutze die Skriptanalyse als Startpunkt für Buch, Imagefilm, Erklärvideo, Hörbuch, Werbung & mehr - inklusive PDF-Export für Dein Feintuning. Wenn Du möchtest, kannst Du mich auch direkt als Sprecher für Dein Skript anfragen.</p>
            </div>
            <div class="ska-footer-actions">
                <div class="ska-tool-wrapper">
                    <button type="button" class="ska-btn ska-btn--primary" data-action="open-pdf">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                        Skript-Report als PDF herunterladen
                    </button>
                </div>
                <a href="/kontakt/" class="ska-btn ska-btn--secondary">
                    Sprachaufnahme anfragen
                </a>
            </div>
        </div>

        <div class="skriptanalyse-modal" id="ska-settings-modal" aria-hidden="true">
            <div class="skriptanalyse-modal-overlay" data-action="close-settings"></div>
            <div class="skriptanalyse-modal-content">
                <div class="ska-modal-header"><h3>Einstellungen</h3><button class="ska-close-icon" data-action="close-settings">&times;</button></div>
                <div class="skriptanalyse-modal-body">
                    <div class="ska-settings-grid">
                        <div class="ska-setting-item"><label>Zählweise</label><div class="ska-custom-select-wrapper"><select class="ska-select" data-filter="char"><option value="spaces">Inkl. Leerzeichen</option><option value="no-spaces">Ohne Leerzeichen</option></select></div></div>
                        <div class="ska-setting-item"><label>Zahlen</label><div class="ska-custom-select-wrapper"><select class="ska-select" data-filter="number"><option value="one">Als Ziffer (123 = 3)</option><option value="spoken">Als Wort (123 = einhundert...)</option></select></div></div>
                        <div class="ska-setting-item"><label>Zielgruppe</label><div class="ska-custom-select-wrapper"><select class="ska-select" data-filter="branch"><option value="all">Gemischt</option><option value="b2b">B2B / Business</option><option value="consumer">B2C / Lifestyle</option></select></div></div>
                        <div class="ska-setting-item"><label>Zielzeit (Min:Sek)</label><input type="text" class="ska-input ska-input--time" data-target-input placeholder="0:00" inputmode="numeric"></div>
                    </div>
                </div>
                <div class="ska-modal-footer"><button class="ska-btn ska-btn--primary" data-action="close-settings">Speichern</button></div>
            </div>
        </div>
        
        <div class="skriptanalyse-modal" id="ska-help-modal" aria-hidden="true">
            <div class="skriptanalyse-modal-overlay" data-action="close-help"></div>
            <div class="skriptanalyse-modal-content" style="max-width:880px;">
                <button type="button" class="ska-close-icon" data-action="close-help">&times;</button>
                <div class="ska-modal-header"><h3>Anleitung & Hilfe</h3></div>
                <div class="skriptanalyse-modal-body">
                    <div class="ska-help-hero">
                        <div>
                            <h4>Alles, was du für eine perfekte Skriptanalyse brauchst</h4>
                            <p>Die Skript-Analyse arbeitet live im Browser: Texte, Timing, Wirkung und Sprechbarkeit werden automatisch ausgewertet. Hier findest du alle Funktionen, Werkzeuge und Tipps – kompakt, verständlich und sofort anwendbar.</p>
                        </div>
                        <div class="ska-help-hero-card">
                            <strong>Quick-Flow</strong>
                            <ol>
                                <li>Text einfügen & Genre wählen.</li>
                                <li>Zielzeit/Settings setzen.</li>
                                <li>Analyse-Karten abarbeiten.</li>
                                <li>Teleprompter & Export nutzen.</li>
                            </ol>
                        </div>
                    </div>

                    <nav class="ska-help-toc" aria-label="Inhaltsverzeichnis">
                        <h5>Inhaltsverzeichnis</h5>
                        <div class="ska-help-toc-grid">
                            <a href="#ska-help-start">Schnellstart</a>
                            <a href="#ska-help-layout">Oberfläche & Navigation</a>
                            <a href="#ska-help-input">Text & Einstellungen</a>
                            <a href="#ska-help-analysis">Analyse verstehen</a>
                            <a href="#ska-help-cards">Analyse-Karten</a>
                            <a href="#ska-help-tools">Werkzeuge</a>
                            <a href="#ska-help-markers">Marker & Regie</a>
                            <a href="#ska-help-export">Export & Ergebnisse</a>
                            <a href="#ska-help-premium">Premium-Funktionen</a>
                            <a href="#ska-help-privacy">Datenschutz & Support</a>
                        </div>
                    </nav>

                    <section id="ska-help-start" class="ska-help-section">
                        <header>
                            <h4>🚀 Schnellstart</h4>
                            <p>In wenigen Schritten von Text zu sendefertigem Skript.</p>
                        </header>
                        <div class="ska-help-grid">
                            <div class="ska-help-card">
                                <h4>1. Text einfügen</h4>
                                <p>Füge dein Skript in das Eingabefeld ein. Änderungen werden automatisch gespeichert und live analysiert.</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>2. Genre wählen</h4>
                                <p>Wähle den Einsatzzweck (z. B. Werbung, Erklärvideo, Hörbuch). Tempo & Tipps passen sich an.</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>3. Analyse lesen</h4>
                                <p>Bearbeite die wichtigsten Karten von oben nach unten. Jede Karte zeigt konkrete Optimierungen.</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>4. Ergebnis nutzen</h4>
                                <p>Starte den Teleprompter, prüfe das Timing und exportiere den PDF-Report.</p>
                            </div>
                        </div>
                        <div class="ska-help-box ska-help-box--hint">
                            <strong>Hinweis:</strong> Die Analyse ist live. Jeder Tipp aktualisiert sich sofort, wenn du Text oder Einstellungen änderst.
                        </div>
                    </section>

                    <section id="ska-help-layout" class="ska-help-section">
                        <header>
                            <h4>🧭 Oberfläche & Navigation</h4>
                            <p>So findest du dich sofort zurecht.</p>
                        </header>
                        <ul class="ska-help-list ska-help-list--arrows">
                            <li><strong>Steuerleiste:</strong> Genre, Tempo (WPM/SPS) und Zielzeit – steuert das Timing der Analyse.</li>
                            <li><strong>Analyse-Karten:</strong> Jede Karte zeigt ein Thema. Nutze die Filterleiste, um Karten an- oder auszuschalten.</li>
                            <li><strong>Tools-Bereich:</strong> Teleprompter, Marker und Pacing-Training befinden sich im Werkzeugbereich.</li>
                            <li><strong>Legende & Hilfe:</strong> Erklärt Marker, Badges und bietet den direkten Einstieg in diese Anleitung.</li>
                        </ul>
                        <div class="ska-help-box ska-help-box--help">
                            <strong>Tipp:</strong> Nutze die Filter-Schalter, damit deine wichtigsten Karten dauerhaft sichtbar bleiben.
                        </div>
                    </section>

                    <section id="ska-help-input" class="ska-help-section">
                        <header>
                            <h4>📝 Text & Einstellungen</h4>
                            <p>Steuere Zielzeit, Tonalität und die Analyse-Schärfe.</p>
                        </header>
                        <div class="ska-help-tabs">
                            <input class="ska-help-tab-input" type="radio" name="ska-help-tabs" id="ska-help-tab-1" checked>
                            <input class="ska-help-tab-input" type="radio" name="ska-help-tabs" id="ska-help-tab-2">
                            <input class="ska-help-tab-input" type="radio" name="ska-help-tabs" id="ska-help-tab-3">
                            <div class="ska-help-tabs-nav">
                                <label for="ska-help-tab-1">Timing</label>
                                <label for="ska-help-tab-2">Wirkung & Zielgruppe</label>
                                <label for="ska-help-tab-3">Sprache & Regeln</label>
                            </div>
                            <div class="ska-help-tabs-content">
                                <div class="ska-help-tab-panel" data-tab="ska-help-tab-1">
                                    <ul class="ska-help-list ska-help-list--arrows">
                                        <li><strong>WPM/SPS:</strong> Standard-Tempo oder Silben pro Sekunde für längere Wörter.</li>
                                        <li><strong>Zielzeit:</strong> Die Analyse zeigt, wie nah du am gewünschten Timing bist.</li>
                                        <li><strong>Pausen-Automatik <span class="ska-premium-badge">Premium</span>:</strong> Berechnet Pausen automatisch anhand von Satzstruktur & Markern.</li>
                                        <li><strong>Persönliches WPM <span class="ska-premium-badge">Premium</span>:</strong> Nutze dein eigenes Sprecher-Tempo als Standard.</li>
                                    </ul>
                                </div>
                                <div class="ska-help-tab-panel" data-tab="ska-help-tab-2">
                                    <ul class="ska-help-list ska-help-list--arrows">
                                        <li><strong>Zielgruppe (Komplexität) <span class="ska-premium-badge">Premium</span>:</strong> Passt Verständlichkeits-Checks an das Publikum an.</li>
                                        <li><strong>Keyword-Dichte <span class="ska-premium-badge">Premium</span>:</strong> Zeigt, ob Kernbegriffe dominant genug sind.</li>
                                        <li><strong>Sentiment & Emotion:</strong> Ermittelt, wie positiv/negativ/emotional der Text wirkt.</li>
                                        <li><strong>Archetypen & Tonalität:</strong> Stellt Stil und Stimmung transparent dar.</li>
                                    </ul>
                                </div>
                                <div class="ska-help-tab-panel" data-tab="ska-help-tab-3">
                                    <ul class="ska-help-list ska-help-list--arrows">
                                        <li><strong>Buzzword-Blacklist <span class="ska-premium-badge">Premium</span>:</strong> Markiert Floskeln und austauschbare Phrasen.</li>
                                        <li><strong>Pflichtpassagen <span class="ska-premium-badge">Premium</span>:</strong> Prüft, ob Pflichttexte exakt enthalten sind.</li>
                                        <li><strong>Zahlenverarbeitung:</strong> Zahlen als Wort oder Ziffer zählen – passend zum Einsatzzweck.</li>
                                        <li><strong>Synonyme/Thesaurus:</strong> Liefert Alternativen für Wiederholungen (online <span class="ska-premium-badge">Premium</span>).</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="ska-help-box ska-help-box--guide">
                            <strong>Tipp:</strong> Stelle zuerst Genre + Zielzeit ein, optimiere dann die Karten – so bleibt das Timing stabil.
                        </div>
                    </section>

                    <section id="ska-help-analysis" class="ska-help-section">
                        <header>
                            <h4>📊 Analyse verstehen</h4>
                            <p>Diese Kennzahlen bestimmen die Qualität deines Skripts.</p>
                        </header>
                        <div class="ska-help-grid">
                            <div class="ska-help-card">
                                <h4>Tempo & Dauer</h4>
                                <p>Reale Sprechzeit inkl. Pausenmarker, Zielzeit und Tempo-Trend.</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>Rhythmus & Satzlänge</h4>
                                <p>Zu lange Sätze, monotone Passagen und Rhythmusbrüche werden markiert.</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>Verständlichkeit</h4>
                                <p>Schachtelsätze, Komplexität und Flesch-Werte zeigen, wie leicht der Text ist.</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>Wirkung & Emotion</h4>
                                <p>Sentiment, Intensität und Wortwahl zeigen, wie der Text ankommt.</p>
                            </div>
                        </div>
                    </section>

                    <section id="ska-help-cards" class="ska-help-section">
                        <header>
                            <h4>🧩 Analyse-Karten (Themenübersicht)</h4>
                            <p>Jede Karte gibt dir konkrete Hinweise zur Optimierung.</p>
                        </header>
                        <div class="ska-help-columns">
                            <div>
                                <h5>Struktur & Verständlichkeit</h5>
                                <ul class="ska-help-list ska-help-list--checks">
                                    <li>Schnell-Überblick</li>
                                    <li>Textlänge, Kapitel & Struktur</li>
                                    <li>Rhythmus, Satzanfänge, Satzlängen</li>
                                    <li>Schachtelsätze / Depth-Check</li>
                                    <li>Einfache Sprache</li>
                                    <li>Dialog- und Rollenverteilung</li>
                                </ul>
                            </div>
                            <div>
                                <h5>Wortwahl & Wirkung</h5>
                                <ul class="ska-help-list ska-help-list--checks">
                                    <li>Keyword-Fokus</li>
                                    <li>Wortschatz & Wiederholungen</li>
                                    <li>Buzzwords <span class="ska-premium-badge">Premium</span></li>
                                    <li>Metaphern & Bildsprache</li>
                                    <li>Anglizismen, Füllwörter, Adjektive/Adverbien</li>
                                    <li>CTA / Handlungsaufforderungen</li>
                                </ul>
                            </div>
                            <div>
                                <h5>Sprecherlichkeit</h5>
                                <ul class="ska-help-list ska-help-list--checks">
                                    <li>Stolpersteine & Phonetik</li>
                                    <li>Plosive & Atemführung</li>
                                    <li>Pronunciation-Hilfen</li>
                                    <li>Silben-Entropie</li>
                                    <li>Tempo-Training (Pacing)</li>
                                </ul>
                            </div>
                            <div>
                                <h5>Recht & Tonalität</h5>
                                <ul class="ska-help-list ska-help-list--checks">
                                    <li>Pflichttexte & rechtliche Passagen sauber prüfen</li>
                                    <li>Warnhinweise früh erkennen und absichern</li>
                                    <li>Tonalität & Stil konsistent halten</li>
                                    <li>Emotionale Wirkung gezielt steuern</li>
                                </ul>
                            </div>
                        </div>
                        <div class="ska-help-box ska-help-box--hint">
                            <strong>Tipp:</strong> Karten mit ⚠️ zeigen konkrete Stellen im Text – klicke sie an und optimiere direkt.
                        </div>
                    </section>

                    <section id="ska-help-tools" class="ska-help-section">
                        <header>
                            <h4>🛠️ Werkzeuge</h4>
                            <p>Praktische Tools für Produktion, Aufnahme und Export.</p>
                        </header>
                        <div class="ska-help-grid">
                            <div class="ska-help-card">
                                <h4>Teleprompter <span class="ska-premium-badge">Premium</span></h4>
                                <p>Scrollt automatisch im Analyse-Tempo – perfekt für Aufnahme oder Proben.</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>Pacing-Training <span class="ska-premium-badge">Premium</span></h4>
                                <p>Zeigt Tempo-Abweichungen und hilft, gleichmäßige Sprecherleistung zu trainieren.</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>Marker-Manager</h4>
                                <p>Fügt Pausen und Regie-Hinweise ein. Marker beeinflussen Timing, nicht die Wortzahl.</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>Benchmark-Modal</h4>
                                <p>Vergleicht Tempo und Lesbarkeit mit Referenzwerten (z. B. Standard, sportlich).</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>PDF-Report</h4>
                                <p>Exportiere Zusammenfassung, Karten & Text – ideal fürs Team oder Kunden.</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>Export (Teleprompter) <span class="ska-premium-badge">Premium</span></h4>
                                <p>Teleprompter-Text als TXT/JSON exportieren für Cutter oder Sprecher.</p>
                            </div>
                        </div>
                    </section>

                    <section id="ska-help-markers" class="ska-help-section">
                        <header>
                            <h4>🖍️ Marker & Regieanweisungen</h4>
                            <p>Steuere Pausen, Dynamik und Sprecherführung ohne den Text zu verändern.</p>
                        </header>
                        <p class="ska-help-text">Marker beeinflussen die Dauer, werden aber nicht als gesprochener Text gezählt.</p>
                        <table class="ska-help-table">
                            <thead><tr><th>Marker / Code</th><th>Funktion</th></tr></thead>
                            <tbody>
                                <?php foreach ($markers_config as $marker): ?>
                                    <tr>
                                        <td><code><?php echo esc_html($marker['val']); ?></code></td>
                                        <td><?php echo esc_html($marker['desc']); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                        <div class="ska-help-box ska-help-box--guide">
                            <strong>Tipp:</strong> Setze Pausen nach Sinnabschnitten und verwende Regie-Marker sparsam – zu viele Marker verlangsamen die Performance.
                        </div>
                    </section>

                    <section id="ska-help-export" class="ska-help-section">
                        <header>
                            <h4>📦 Export & Ergebnisse</h4>
                            <p>So nutzt du das Ergebnis in der Produktion.</p>
                        </header>
                        <ul class="ska-help-list">
                            <li><strong>PDF-Report:</strong> Zusammenfassung, Analyse-Karten und Textansicht.</li>
                            <li><strong>Skript mit Notizspalte <span class="ska-premium-badge">Premium</span>:</strong> Für Korrekturen & Regiekommentare.</li>
                            <li><strong>Text-Export <span class="ska-premium-badge">Premium</span>:</strong> Teleprompter als TXT/JSON für Cutter oder Sprecher.</li>
                            <li><strong>Benchmark-Check:</strong> Einordnen, ob Tempo/Lesbarkeit zur Branche passen.</li>
                        </ul>
                    </section>

                    <section id="ska-help-premium" class="ska-help-section">
                        <header>
                            <h4>💎 Premium-Funktionen</h4>
                            <p>Premium-Themen sind mit dem Badge markiert.</p>
                        </header>
                        <div class="ska-help-grid">
                            <div class="ska-help-card">
                                <h4>Erweiterte Analyse</h4>
                                <p>Buzzword-Check, Keyword-Dichte, Pflichttexte, tiefergehende Detail-Listen.</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>Profi-Werkzeuge</h4>
                                <p>Teleprompter, Pacing-Training, Export-Formate, Online-Thesaurus.</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>Personalisierung</h4>
                                <p>Pausen-Automatik, persönliches WPM, Zielgruppen-Komplexität.</p>
                            </div>
                            <div class="ska-help-card">
                                <h4>Premium-Analysen</h4>
                                <p>Weitere Details in Karten wie Plosive, Fragen, Rhythmus und Silben-Entropie.</p>
                            </div>
                        </div>
                        <div class="ska-help-box ska-help-box--hint">
                            <strong>Hinweis:</strong> Premium-Karten bleiben sichtbar, sind aber in der freien Version begrenzt. Das Badge zeigt, welche Funktionen freigeschaltet werden.
                        </div>
                    </section>

                    <section id="ska-help-privacy" class="ska-help-section">
                        <header>
                            <h4>🔒 Datenschutz & Support</h4>
                            <p>Dein Text bleibt bei dir, Hilfe ist immer erreichbar.</p>
                        </header>
                        <div class="ska-help-columns">
                            <div>
                                <h5>Datenschutz</h5>
                                <p class="ska-help-text">Alle Analysen laufen lokal im Browser. Dein Skript wird nicht an externe Server gesendet.</p>
                            </div>
                            <div>
                                <h5>Support</h5>
                                <p class="ska-help-text">Fragen? Nutze den Kontakt-Link im Footer oder starte eine Sprecher-Anfrage.</p>
                            </div>
                        </div>
                    </section>
                </div>
                 <div class="ska-modal-footer" style="display:flex; justify-content:flex-end; gap:0.75rem;">
                     <button type="button" class="ska-btn ska-btn--secondary" data-action="close-help">Fenster schließen</button>
                 </div>
            </div>
        </div>

        <div class="skriptanalyse-modal" id="ska-pdf-modal" aria-hidden="true">
            <div class="skriptanalyse-modal-overlay" data-action="close-pdf-modal"></div>
            <div class="skriptanalyse-modal-content" style="max-width:550px;">
                <button type="button" class="ska-close-icon" data-action="close-pdf-modal">&times;</button>
                <div class="ska-modal-header" style="border:none; padding-bottom:0.5rem;">
                    <h3>PDF Report Inhalte</h3>
                    <p style="margin:0.2rem 0 0 0; color:#64748b; font-size:0.9rem; font-weight:normal;">Was soll im PDF enthalten sein?</p>
                </div>
                <div class="skriptanalyse-modal-body" style="padding-top:1rem;">
                    
                    <div class="ska-compact-options-grid">
                        
                        <label class="ska-compact-option">
                            <input type="checkbox" id="pdf-opt-overview" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Schnell-Überblick</strong>
                                    <span>Score, Tempo, Zielzeit & WPM</span>
                                </div>
                            </div>
                        </label>

                        <label class="ska-compact-option ska-compact-option--premium">
                            <input type="checkbox" id="pdf-opt-details" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Detail-Analyse <span class="ska-premium-pill">Premium</span></strong>
                                    <span>Stil, Struktur, Fokus, Checks</span>
                                </div>
                            </div>
                        </label>

                        <label class="ska-compact-option ska-compact-option--premium">
                            <input type="checkbox" id="pdf-opt-syllable-entropy" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Silben-Entropie <span class="ska-premium-pill">Premium</span></strong>
                                    <span>Rhythmus-Analyse im Detailteil</span>
                                </div>
                            </div>
                        </label>

                        <label class="ska-compact-option ska-compact-option--premium">
                            <input type="checkbox" id="pdf-opt-compliance" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Pflichttext-Check <span class="ska-premium-pill">Premium</span></strong>
                                    <span>Legal-Status im Detailteil</span>
                                </div>
                            </div>
                        </label>

                        <label class="ska-compact-option ska-compact-option--premium">
                            <input type="checkbox" id="pdf-opt-tips" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Tipps & Hinweise <span class="ska-premium-pill">Premium</span></strong>
                                    <span>konkrete Optimierungstipps</span>
                                </div>
                            </div>
                        </label>

                        <label class="ska-compact-option ska-compact-option--premium">
                            <input type="checkbox" id="pdf-opt-compare" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Versions-Vergleich <span class="ska-premium-pill">Premium</span></strong>
                                    <span>Änderungen zur Vorversion</span>
                                </div>
                            </div>
                        </label>

                        <label class="ska-compact-option ska-full-width-option">
                            <input type="checkbox" id="pdf-opt-script" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Gesamtes Skript anhängen</strong>
                                    <span>Druckt den vollständigen Text auf Folgeseiten.</span>
                                </div>
                            </div>
                        </label>

                    </div>

                </div>
                <div class="ska-modal-footer" style="border-top:1px solid #f1f5f9; padding-top:1.5rem;">
                    <button type="button" class="ska-btn ska-btn--primary" style="width:100%; justify-content:center;" data-action="generate-pdf-final">PDF herunterladen</button>
                </div>
            </div>
        </div>

        <div class="skriptanalyse-modal" id="ska-reset-modal" aria-hidden="true">
            <div class="skriptanalyse-modal-overlay" data-action="close-reset"></div>
            <div class="skriptanalyse-modal-content">
                <div class="ska-modal-header">
                    <h3>Analyse zurücksetzen?</h3>
                </div>
                <div class="skriptanalyse-modal-body">
                    <p style="margin-bottom:2rem; color:#64748b;">Möchtest du wirklich neu starten? Dein aktueller Text und alle Einstellungen werden dabei zurückgesetzt.</p>
                </div>
                <div class="ska-modal-footer">
                    <button type="button" class="ska-btn ska-btn--secondary" data-action="close-reset">Abbrechen</button>
                    <button type="button" class="ska-btn ska-btn--primary" data-action="confirm-reset">Ja, zurücksetzen</button>
                </div>
            </div>
        </div>

    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'skript_analyse', 'ska_shortcode' );
?>
