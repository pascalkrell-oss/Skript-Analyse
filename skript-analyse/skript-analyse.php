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
        ['label' => '| (Kurze Pause)', 'val' => ' | ', 'desc' => 'Natürliche Atempause (~0.5 Sek)'],
        ['label' => '1 Sekunde', 'val' => ' |1S| ', 'desc' => 'Feste Pause von einer Sekunde'],
        ['label' => '2 Sekunden', 'val' => ' |2S| ', 'desc' => 'Feste Pause von zwei Sekunden'],
        ['label' => '[ATMEN]', 'val' => ' [ATMEN] ', 'desc' => 'Regieanweisung: Hörbares Einatmen'],
        ['label' => '[BETONUNG]', 'val' => ' [BETONUNG] ', 'desc' => 'Das folgende Wort stark hervorheben'],
        ['label' => '[SZENE]', 'val' => "\n\n[SZENE]\n", 'desc' => 'Neuer Abschnitt / Szenenwechsel'],
        ['label' => '[LAUT]', 'val' => ' [LAUT] ', 'desc' => 'Dynamik steigern / Lauter werden'],
        ['label' => '[LEISE]', 'val' => ' [LEISE] ', 'desc' => 'Dynamik senken / Leiser werden'],
        ['label' => '[SCHNELL]', 'val' => ' [SCHNELL] ', 'desc' => 'Tempo deutlich anziehen'],
        ['label' => '[LANGSAM]', 'val' => ' [LANGSAM] ', 'desc' => 'Tempo drosseln / Getragen sprechen']
    ];
    
    wp_localize_script( 'skript-analyse-js', 'SKA_CONFIG_PHP', array('markers' => $markers_config));

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
                 <span class="ska-status-badge"><span class="ska-dot"></span>100% Kostenlos & Sicher</span>
            </div>
        </header>

        <div class="ska-toolbar">
            <div class="ska-toolbar-group">
                <div class="ska-select-wrapper">
                    <label>Profil</label>
                    <div class="ska-custom-select-wrapper">
                        <select class="ska-select" data-role-select>
                            <option value="">Automatisch</option>
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
                            <option value="werbung">Werbespot</option>
                            <option value="imagefilm">Imagefilm</option>
                            <option value="erklaer">Erklärvideo</option>
                            <option value="hoerbuch">Hörbuch</option>
                            <option value="podcast">Podcast</option>
                            <option value="social">Social Media</option>
                            <option value="elearning">E-Learning</option>
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
                    <h3>Dein Skript</h3>
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
                    <button type="button" class="ska-format-btn" data-action="format-bullet">Aufzählung</button>
                    <button type="button" class="ska-format-btn" data-action="format-numbered">Nummerierung</button>
                    <button type="button" class="ska-format-btn" data-action="format-uppercase">GROSS</button>
                    <button type="button" class="ska-format-btn" data-action="format-lowercase">klein</button>
                </div>
                <div class="ska-textarea-wrapper">
                    <textarea class="skriptanalyse-textarea" placeholder="Hier Text einfügen oder tippen..."></textarea>
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
            <div class="skriptanalyse-analysis-bottom-grid"></div>
            <div class="skriptanalyse-hidden-panel"></div>
            <div class="skriptanalyse-legend-container"></div>
        </div>

        <div class="ska-footer">
            <div class="ska-footer-intro">
                <p>Nutze die Analyse als Startpunkt. Wenn du möchtest, übernehme ich als professioneller Sprecher das Feintuning und die Aufnahme deines Skripts.</p>
            </div>
            <div class="ska-footer-actions">
                <button type="button" class="ska-btn ska-btn--primary" data-action="open-pdf">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                    Skript-Report als PDF herunterladen
                </button>
                <a href="#kontakt" class="ska-btn ska-btn--secondary">
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
                   <p style="margin-bottom:2rem; color:#64748b; line-height:1.6;">Willkommen im Profi-Tool für Autoren, Sprecher und Redakteure. Die Analyse läuft lokal im Browser und liefert dir in Echtzeit klare Hinweise für Tempo, Verständlichkeit und Wirkung.</p>

                   <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:2rem;">
                       <div class="ska-help-card">
                           <h4>🚀 Schnellstart</h4>
                           <p>Text einfügen → Genre wählen → Hinweise lesen → optimieren → PDF exportieren. Die Analyse aktualisiert sich automatisch.</p>
                       </div>
                       <div class="ska-help-card">
                           <h4>🎯 Zielgruppe & Zielzeit</h4>
                           <p>Im Einstellungs-Menü kannst du Zielzeit, Zielgruppe (z.B. Kindersendung) und eine Buzzword-Blacklist festlegen.</p>
                       </div>
                       <div class="ska-help-card">
                           <h4>⏱️ WPM-Kalibrierung</h4>
                           <p>Starte die Stoppuhr im WPM-Test. Kein Mikrofon nötig – die Messung ist manuell. Danach kannst du das Tempo als Standard setzen.</p>
                       </div>
                       <div class="ska-help-card">
                           <h4>🪄 Teleprompter</h4>
                           <p>Öffne den Teleprompter aus der Analyse. Der Text scrollt im berechneten Tempo und markiert die Wörter dezent.</p>
                       </div>
                   </div>

                   <h4 style="margin-bottom:1rem; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:0.5rem;">Analysebereiche (Auswahl)</h4>
                   <ul style="list-style:none; padding:0; display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:2rem; color:#64748b; font-size:0.9rem;">
                       <li><strong>🌊 Satz-Rhythmus & Spreizung:</strong> zeigt Abwechslung der Satzlängen.</li>
                       <li><strong>⚡ Arousal-Map:</strong> visualisiert Energieverlauf für Betonung.</li>
                       <li><strong>🧠 Redundanz-Check:</strong> findet doppelte Aussagen in Satzfolgen.</li>
                       <li><strong>🎵 Audio-BPM:</strong> schlägt Musiktempo passend zum Sprechtempo vor.</li>
                       <li><strong>🧩 Leichte Sprache:</strong> prüft lange Wörter und Genitive.</li>
                       <li><strong>🧨 Bullshit-Index:</strong> markiert Buzzwords und deine Blacklist.</li>
                       <li><strong>⚖️ Verb-Fokus:</strong> warnt vor Nominalstil, wenn Substantive dominieren.</li>
                       <li><strong>❓ Fragen-Heatmap:</strong> zeigt rhetorische Fragen im Text.</li>
                       <li><strong>🧵 Satz-Verschachtelung:</strong> markiert zu tiefe Nebensatz-Struktur.</li>
                       <li><strong>🌡️ Vibe-Check:</strong> zeigt Stimmungs-Intensität über den Text.</li>
                       <li><strong>🧩 Naming-Check:</strong> erkennt ähnliche Namen mit Tippfehlern.</li>
                   </ul>

                   <h4 style="margin-bottom:1rem; color:#0f172a;">🖍️ Marker & Regieanweisungen</h4>
                   <p style="font-size:0.85rem; color:#64748b; margin-bottom:1rem;">Diese Marker beeinflussen Timing und Regie. Einfach in den Text einsetzen:</p>
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

                   <div style="margin-top:2rem; padding:1rem; border-radius:10px; background:#eff6ff; color:#1e3a8a;">
                       <strong>Hinweis:</strong> Alle Analysen laufen lokal. Dein Text wird nicht an Server gesendet.
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
                                    <span>Score, WPM & Zeiten</span>
                                </div>
                            </div>
                        </label>

                        <label class="ska-compact-option">
                            <input type="checkbox" id="pdf-opt-details" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Detail-Analyse</strong>
                                    <span>Stil, Fehler & Listen</span>
                                </div>
                            </div>
                        </label>

                        <label class="ska-compact-option">
                            <input type="checkbox" id="pdf-opt-tips" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Tipps & Hinweise</strong>
                                    <span>Optimierungsvorschläge</span>
                                </div>
                            </div>
                        </label>

                        <label class="ska-compact-option">
                            <input type="checkbox" id="pdf-opt-compare" checked>
                            <div class="ska-compact-option-inner">
                                <div class="ska-option-check"></div>
                                <div class="ska-option-text">
                                    <strong>Versions-Vergleich</strong>
                                    <span>Delta zur Vorversion</span>
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
