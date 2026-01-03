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
    $js_deps = array();

    if ( file_exists( plugin_dir_path( __FILE__ ) . 'assets/jspdf.umd.min.js' ) ) {
        wp_register_script( 'jspdf', $jspdf_url, array(), '2.5.1', true );
        $js_deps[] = 'jspdf';
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
    
    wp_localize_script( 'skript-analyse-js', 'SKA_CONFIG_PHP', array(
        'markers' => $markers_config,
        'pro' => (bool) apply_filters( 'ska_pro_mode', false ),
        'isAdmin' => current_user_can( 'manage_options' ),
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

                        <button type="button" class="ska-tool-btn" data-action="save-version" title="Version merken">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin-right:3px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                            Version merken
                        </button>
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
            <div class="ska-analysis-filterbar"></div>
            <div class="skriptanalyse-analysis-bottom-grid"></div>
            <div class="skriptanalyse-hidden-panel"></div>
            <div class="skriptanalyse-legend-container"></div>
        </div>

        <div class="ska-footer">
            <div class="ska-footer-intro">
                <p>Nutze die Skriptanalyse als Startpunkt für Buch, Imagefilm, Erklärvideo, Hörbuch, Werbung & mehr - inklusive PDF-Export für Dein Feintuning. Wenn Du möchtest, kannst Du mich auch direkt als Sprecher für Dein Skript anfragen.</p>
            </div>
            <div class="ska-footer-actions">
                <button type="button" class="ska-btn ska-btn--primary" data-action="open-pdf">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                    Skript-Report als PDF herunterladen
                </button>
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
            <div class="skriptanalyse-modal-content" style="max-width:750px;">
                <button type="button" class="ska-close-icon" data-action="close-help">&times;</button>
                <div class="ska-modal-header"><h3>Anleitung & Hilfe</h3></div>
                <div class="skriptanalyse-modal-body">
                   <p style="margin-bottom:1.5rem; color:#64748b; line-height:1.7;">Dieses Tool analysiert deinen Text live im Browser und erklärt dir verständlich, was am Tempo, an der Struktur und an der Wirkung optimiert werden kann. Keine Vorkenntnisse nötig – du bekommst konkrete Hinweise, was du ändern kannst und warum.</p>

                   <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:2rem;">
                       <div class="ska-help-card">
                           <h4>🚀 Schnellstart in 60 Sekunden</h4>
                           <p>Text einfügen → Genre auswählen → Analyse lesen → markierte Stellen anpassen → PDF exportieren. Alles aktualisiert sich automatisch.</p>
                       </div>
                       <div class="ska-help-card">
                           <h4>⏱️ Timing & Tempo</h4>
                           <p>Wähle WPM (Standard) oder SPS (präziser für lange Wörter). Zielzeit und Pausen werden in die Berechnung einbezogen.</p>
                       </div>
                       <div class="ska-help-card">
                           <h4>🎯 Zielgruppe & Wirkung</h4>
                           <p>Lege Zielgruppe, Keyword-Fokus und Blacklists fest. Das Tool warnt bei zu komplexen Sätzen oder zu hoher Dichte.</p>
                       </div>
                       <div class="ska-help-card">
                           <h4>🪄 Teleprompter</h4>
                           <p>Starte den Teleprompter aus der Analyse. Der Scroll folgt deiner berechneten Dauer und hilft beim Einsprechen.</p>
                       </div>
                   </div>

                   <h4 style="margin-bottom:0.75rem; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:0.5rem;">So liest du die Analyse</h4>
                   <ul style="list-style:none; padding:0; display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:2rem; color:#64748b; font-size:0.9rem;">
                       <li><strong>⚖️ Tempo & Dauer:</strong> reale Sprechzeit inkl. Pausenmarker.</li>
                       <li><strong>📏 Satzlänge & Rhythmus:</strong> zu lange oder monotone Abschnitte werden markiert.</li>
                       <li><strong>🎯 Fokus & Keywords:</strong> zeigt, ob Kernbegriffe dominant genug sind.</li>
                       <li><strong>🧠 Verständlichkeit:</strong> entdeckt Schachtelsätze und komplizierte Wörter.</li>
                       <li><strong>🎵 Audio-BPM:</strong> empfiehlt Musiktempo passend zur Lesegeschwindigkeit.</li>
                       <li><strong>🧨 Buzzwords:</strong> markiert Floskeln oder Blacklist-Begriffe.</li>
                       <li><strong>🗣️ Sprecherlichkeit:</strong> warnt bei schwierigen Kombinationen oder Betonungsfallen.</li>
                       <li><strong>📍 Marker-Übersicht:</strong> listet alle Marker und ihre Wirkung im Timing.</li>
                   </ul>

                   <h4 style="margin-bottom:0.75rem; color:#0f172a;">🖍️ Marker & Regieanweisungen</h4>
                   <p style="font-size:0.85rem; color:#64748b; margin-bottom:1rem;">Marker steuern Pausen, Dynamik und Sprecheranweisungen. Sie beeinflussen das Timing, werden aber nicht als Text gezählt:</p>
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

                   <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:2rem;">
                       <div class="ska-help-card">
                           <h4>💡 Tipps & Tricks</h4>
                           <p>Setze kurze Pausen nach Sinnabschnitten. Vermeide drei lange Sätze hintereinander. Wiederhole Kernwörter an Satzanfängen.</p>
                       </div>
                       <div class="ska-help-card">
                           <h4>✅ Best Practices</h4>
                           <p>Ein Gedanke pro Satz. Aktiv statt Passiv. Zahlen in Wörter umwandeln, wenn sie gesprochen werden sollen.</p>
                       </div>
                   </div>

                   <div style="margin-top:2rem; padding:1rem; border-radius:10px; background:#eff6ff; color:#1e3a8a;">
                       <strong>Datenschutz:</strong> Alle Analysen laufen lokal im Browser. Dein Text verlässt dein Gerät nicht.
                   </div>
                </div>
                 <div class="ska-modal-footer" style="display:flex; justify-content:flex-end;">
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

                        <label class="ska-compact-option">
                            <input type="checkbox" id="pdf-opt-details" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Detail-Analyse</strong>
                                    <span>Stil, Struktur, Fokus, Checks</span>
                                </div>
                            </div>
                        </label>

                        <label class="ska-compact-option">
                            <input type="checkbox" id="pdf-opt-syllable-entropy" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Silben-Entropie</strong>
                                    <span>Rhythmus-Analyse im Detailteil</span>
                                </div>
                            </div>
                        </label>

                        <label class="ska-compact-option">
                            <input type="checkbox" id="pdf-opt-compliance" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Pflichttext-Check</strong>
                                    <span>Legal-Status im Detailteil</span>
                                </div>
                            </div>
                        </label>

                        <label class="ska-compact-option">
                            <input type="checkbox" id="pdf-opt-tips" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Tipps & Hinweise</strong>
                                    <span>konkrete Optimierungstipps</span>
                                </div>
                            </div>
                        </label>

                        <label class="ska-compact-option">
                            <input type="checkbox" id="pdf-opt-compare" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Versions-Vergleich</strong>
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
