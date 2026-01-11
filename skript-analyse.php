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

function ska_get_simulation_mode() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return '';
    }

    $mode = get_user_meta( get_current_user_id(), 'sa_simulation_mode', true );
    if ( $mode === 'basis' || $mode === 'premium' ) {
        return $mode;
    }

    return 'premium';
}

function ska_handle_simulation_mode_request() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    if ( ! isset( $_GET['simulated_role'] ) ) {
        return;
    }

    $role = strtolower( sanitize_text_field( wp_unslash( $_GET['simulated_role'] ) ) );
    if ( $role === 'basis' || $role === 'premium' ) {
        update_user_meta( get_current_user_id(), 'sa_simulation_mode', $role );
    }
}
add_action( 'init', 'ska_handle_simulation_mode_request' );

function ska_add_simulation_admin_bar( $wp_admin_bar ) {
    if ( ! is_admin_bar_showing() || ! current_user_can( 'manage_options' ) ) {
        return;
    }

    $wp_admin_bar->add_node(
        array(
            'id' => 'skript-analyse-mode',
            'title' => 'Skript-Analyse Modus',
        )
    );

    $wp_admin_bar->add_node(
        array(
            'id' => 'skript-analyse-mode-basis',
            'parent' => 'skript-analyse-mode',
            'title' => 'Als Basis anzeigen',
            'href' => add_query_arg( 'simulated_role', 'basis' ),
        )
    );

    $wp_admin_bar->add_node(
        array(
            'id' => 'skript-analyse-mode-premium',
            'parent' => 'skript-analyse-mode',
            'title' => 'Als Premium anzeigen',
            'href' => add_query_arg( 'simulated_role', 'premium' ),
        )
    );
}
add_action( 'admin_bar_menu', 'ska_add_simulation_admin_bar', 90 );

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

add_action( 'template_redirect', function() {
    $is_checkout_modal = isset( $_GET['view'] ) && $_GET['view'] === 'checkout_modal';
    if ( ! $is_checkout_modal ) {
        return;
    }

    remove_all_actions( 'wp_head' );
    remove_all_actions( 'wp_footer' );

    $checkout_html = '';
    if ( function_exists( 'do_shortcode' ) ) {
        $checkout_html = do_shortcode( '[woocommerce_checkout]' );
    }

    $style_url = esc_url( SKA_URL . 'assets/style.css?ver=' . SKA_VER );
    $script_url = esc_url( SKA_URL . 'assets/app.js?ver=' . SKA_VER );

    echo '<!doctype html>';
    echo '<html lang="de">';
    echo '<head>';
    echo '<meta charset="utf-8">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<link rel="stylesheet" href="' . $style_url . '">';
    echo '</head>';
    echo '<body class="ska-clean-checkout">';
    echo $checkout_html;
    echo '<script src="' . $script_url . '" defer></script>';
    echo '</body></html>';
    exit;
} );

function ska_has_manual_access( $user_id ) {
    $until = (int) get_user_meta( $user_id, 'ska_manual_access_until', true );
    if ( ! $until ) {
        return false;
    }
    return $until >= current_time( 'timestamp' );
}

function ska_get_user_plan( $user_id ) {
    if ( ska_has_manual_access( $user_id ) ) {
        return 'premium';
    }
    $plan = get_user_meta( $user_id, 'ska_plan', true );
    return $plan === 'premium' ? 'premium' : 'free';
}

function ska_get_global_announcement() {
    $announcement = get_option( 'ska_global_announcement', '' );
    return is_string( $announcement ) ? $announcement : '';
}

function ska_is_unlock_button_enabled() {
    $enabled = get_option( 'ska_unlock_button_enabled', '1' );
    return filter_var( $enabled, FILTER_VALIDATE_BOOLEAN );
}

function ska_get_algorithm_tuning_defaults() {
    return array(
        'long_sentence_threshold' => 20,
        'nominal_chain_threshold' => 3,
        'passive_voice_strictness' => 15,
    );
}

function ska_get_algorithm_tuning_settings() {
    $defaults = ska_get_algorithm_tuning_defaults();
    $long_sentence = (int) get_option( 'ska_long_sentence_threshold', $defaults['long_sentence_threshold'] );
    $nominal_chain = (int) get_option( 'ska_nominal_chain_threshold', $defaults['nominal_chain_threshold'] );
    $passive_strictness = (float) get_option( 'ska_passive_voice_strictness', $defaults['passive_voice_strictness'] );

    if ( $long_sentence <= 0 ) {
        $long_sentence = $defaults['long_sentence_threshold'];
    }
    if ( $nominal_chain <= 0 ) {
        $nominal_chain = $defaults['nominal_chain_threshold'];
    }
    if ( $passive_strictness <= 0 ) {
        $passive_strictness = $defaults['passive_voice_strictness'];
    }

    return array(
        'longSentenceThreshold' => $long_sentence,
        'nominalChainThreshold' => $nominal_chain,
        'passiveVoiceStrictness' => $passive_strictness,
    );
}

function ska_get_algorithm_tuning_localized_config() {
    return array(
        'algorithmTuning' => ska_get_algorithm_tuning_settings(),
        'globalAnnouncement' => ska_get_global_announcement(),
    );
}

function ska_localize_algorithm_tuning_config( $handle ) {
    wp_localize_script( $handle, 'skriptAnalyseConfig', ska_get_algorithm_tuning_localized_config() );
}

function ska_get_localized_config() {
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

    $masquerade_admin_id = get_current_user_id() ? get_user_meta( get_current_user_id(), 'ska_masquerade_admin_id', true ) : '';
    $masquerade = array( 'active' => false );
    if ( $masquerade_admin_id ) {
        $admin_user = get_user_by( 'id', (int) $masquerade_admin_id );
        if ( $admin_user && user_can( $admin_user, 'manage_options' ) ) {
            $current_user = wp_get_current_user();
            $masquerade = array(
                'active' => true,
                'adminId' => (int) $admin_user->ID,
                'adminName' => $admin_user->display_name,
                'userName' => $current_user ? $current_user->display_name : '',
            );
        }
    }

    $plan_mode = '';
    if ( current_user_can( 'manage_options' ) ) {
        $simulation_mode = ska_get_simulation_mode();
        $plan_mode = $simulation_mode === 'premium' ? 'premium' : 'free';
    }

    return array(
        'markers' => $markers_config,
        'pro' => $pro_mode,
        'isAdmin' => current_user_can( 'manage_options' ),
        'isLoggedIn' => is_user_logged_in(),
        'workerUrl' => SKA_URL . 'assets/analysis-worker.js',
        'adminApiBase' => rest_url( 'ska/v1' ),
        'adminNonce' => wp_create_nonce( 'wp_rest' ),
        'masquerade' => $masquerade,
        'globalAnnouncement' => ska_get_global_announcement(),
        'unlockButtonEnabled' => ska_is_unlock_button_enabled(),
        'algorithmTuning' => ska_get_algorithm_tuning_settings(),
        'planMode' => $plan_mode,
    );
}

function ska_shortcode() {
    wp_enqueue_style( 'skript-analyse-css' );
    wp_enqueue_script( 'skript-analyse-js' );

    wp_localize_script( 'skript-analyse-js', 'SKA_CONFIG_PHP', ska_get_localized_config() );
    ska_localize_algorithm_tuning_config( 'skript-analyse-js' );

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
        </div>

        <div class="ska-footer">
            <div class="ska-footer-intro">
                <p data-role="footer-plan-note">Nutze die Skriptanalyse als Startpunkt für Buch, Imagefilm, Erklärvideo, Hörbuch, Werbung & mehr - inklusive PDF-Export für Dein Feintuning. Wenn Du möchtest, kannst Du mich auch direkt als Sprecher für Dein Skript anfragen.</p>
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

add_filter( 'ska_pro_mode', function( $pro_mode ) {
    $user_id = get_current_user_id();
    if ( ! $user_id ) {
        return $pro_mode;
    }
    return ska_get_user_plan( $user_id ) === 'premium' ? true : $pro_mode;
} );

function ska_register_admin_menu() {
    add_menu_page(
        'Skript-Analyse',
        'Skript-Analyse',
        'manage_options',
        'skript-analyse-admin',
        'render_skript_analyse_admin_page',
        'dashicons-chart-area',
        26
    );
    add_submenu_page(
        'skript-analyse-admin',
        'Nutzer-Support',
        'Nutzer-Support',
        'manage_options',
        'skript-analyse-support',
        'render_skript_analyse_support_page'
    );
}
add_action( 'admin_menu', 'ska_register_admin_menu' );

function render_skript_analyse_admin_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    wp_enqueue_style( 'dashicons' );
    wp_enqueue_style( 'skript-analyse-admin-css', SKA_URL . 'assets/style.css', array(), SKA_VER );
    wp_enqueue_script( 'skript-analyse-admin-js', SKA_URL . 'assets/app.js', array(), SKA_VER, true );
    wp_localize_script( 'skript-analyse-admin-js', 'SKA_CONFIG_PHP', ska_get_localized_config() );
    ska_localize_algorithm_tuning_config( 'skript-analyse-admin-js' );
    ?>
    <div class="wrap">
        <div id="ska-admin-app" class="ska-admin-app" data-admin-view="dashboard"></div>
    </div>
    <?php
}

function render_skript_analyse_support_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    wp_enqueue_style( 'dashicons' );
    wp_enqueue_style( 'skript-analyse-admin-css', SKA_URL . 'assets/style.css', array(), SKA_VER );
    wp_enqueue_script( 'skript-analyse-admin-js', SKA_URL . 'assets/app.js', array(), SKA_VER, true );
    wp_localize_script( 'skript-analyse-admin-js', 'SKA_CONFIG_PHP', ska_get_localized_config() );
    ska_localize_algorithm_tuning_config( 'skript-analyse-admin-js' );
    ?>
    <div class="wrap">
        <div id="ska-admin-app" class="ska-admin-app" data-admin-view="support"></div>
    </div>
    <?php
}

function ska_register_admin_route() {
    add_rewrite_rule( '^admin/?$', 'index.php?ska_admin=1', 'top' );
}
add_action( 'init', 'ska_register_admin_route' );

add_filter( 'query_vars', function( $vars ) {
    $vars[] = 'ska_admin';
    return $vars;
} );

function ska_render_admin_page() {
    if ( (int) get_query_var( 'ska_admin' ) !== 1 ) {
        return;
    }

    if ( ! current_user_can( 'manage_options' ) ) {
        wp_safe_redirect( home_url( '/' ) );
        exit;
    }

    ska_register_assets();
    wp_enqueue_style( 'skript-analyse-css' );
    wp_enqueue_style( 'dashicons' );
    wp_enqueue_script( 'skript-analyse-js' );
    wp_localize_script( 'skript-analyse-js', 'SKA_CONFIG_PHP', ska_get_localized_config() );
    ska_localize_algorithm_tuning_config( 'skript-analyse-js' );

    status_header( 200 );
    nocache_headers();
    ?>
    <!doctype html>
    <html <?php language_attributes(); ?>>
    <head>
        <meta charset="<?php bloginfo( 'charset' ); ?>">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <?php wp_head(); ?>
    </head>
    <body class="ska-admin-page">
        <div id="ska-admin-app" class="ska-admin-app" data-admin-view="dashboard"></div>
        <?php wp_footer(); ?>
    </body>
    </html>
    <?php
    exit;
}
add_action( 'template_redirect', 'ska_render_admin_page' );

function ska_flush_rewrite_rules() {
    ska_register_admin_route();
    flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'ska_flush_rewrite_rules' );
register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );

function ska_admin_permission_check() {
    return current_user_can( 'manage_options' );
}

function ska_get_metrics() {
    $defaults = array(
        'unlock_clicks' => 0,
        'payment_success' => 0,
    );
    $metrics = get_option( 'ska_metrics', array() );
    if ( ! is_array( $metrics ) ) {
        $metrics = array();
    }
    return array_merge( $defaults, array_map( 'intval', $metrics ) );
}

function ska_increment_metric( $key ) {
    $metrics = ska_get_metrics();
    if ( ! isset( $metrics[ $key ] ) ) {
        $metrics[ $key ] = 0;
    }
    $metrics[ $key ] = (int) $metrics[ $key ] + 1;
    update_option( 'ska_metrics', $metrics );
}

function ska_track_payment_success( $order_id ) {
    if ( ! $order_id ) {
        return;
    }
    if ( ! function_exists( 'wc_get_order' ) ) {
        return;
    }
    $order = wc_get_order( $order_id );
    if ( ! $order ) {
        return;
    }
    if ( $order->get_meta( '_ska_payment_tracked' ) ) {
        return;
    }
    $order->update_meta_data( '_ska_payment_tracked', 1 );
    $order->save();
    ska_increment_metric( 'payment_success' );
}
add_action( 'woocommerce_payment_complete', 'ska_track_payment_success' );
add_action( 'woocommerce_order_status_completed', 'ska_track_payment_success' );

function ska_get_feature_usage() {
    $usage = get_option( 'ska_feature_usage', array() );
    return is_array( $usage ) ? $usage : array();
}

function ska_update_feature_usage( $feature ) {
    $usage = ska_get_feature_usage();
    if ( ! isset( $usage[ $feature ] ) ) {
        $usage[ $feature ] = 0;
    }
    $usage[ $feature ] = (int) $usage[ $feature ] + 1;
    update_option( 'ska_feature_usage', $usage );
}

function ska_get_cancelled_subscribers() {
    if ( ! function_exists( 'wcs_get_subscriptions' ) ) {
        return array();
    }
    $subs = wcs_get_subscriptions( array(
        'subscription_status' => 'cancelled',
        'subscriptions_per_page' => 50,
    ) );
    $users = array();
    foreach ( $subs as $subscription ) {
        $user_id = $subscription->get_user_id();
        if ( ! $user_id || isset( $users[ $user_id ] ) ) {
            continue;
        }
        $user = get_user_by( 'id', $user_id );
        if ( ! $user ) {
            continue;
        }
        $cancelled_at = $subscription->get_date( 'cancelled' );
        $users[ $user_id ] = array(
            'id' => (int) $user_id,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'cancelledAt' => $cancelled_at ? $cancelled_at->date_i18n( 'Y-m-d H:i' ) : '',
        );
    }
    return array_values( $users );
}

function ska_parse_user_agent( $ua ) {
    $ua = (string) $ua;
    $browser = 'Unbekannt';
    $os = 'Unbekannt';

    if ( preg_match( '/Firefox\/([0-9\.]+)/i', $ua, $match ) ) {
        $browser = 'Firefox ' . $match[1];
    } elseif ( preg_match( '/Edg\/([0-9\.]+)/i', $ua, $match ) ) {
        $browser = 'Edge ' . $match[1];
    } elseif ( preg_match( '/Chrome\/([0-9\.]+)/i', $ua, $match ) ) {
        $browser = 'Chrome ' . $match[1];
    } elseif ( preg_match( '/Safari\/([0-9\.]+)/i', $ua, $match ) ) {
        $browser = 'Safari ' . $match[1];
    }

    if ( preg_match( '/Windows NT ([0-9\.]+)/i', $ua, $match ) ) {
        $os = 'Windows ' . $match[1];
    } elseif ( preg_match( '/Mac OS X ([0-9_]+)/i', $ua, $match ) ) {
        $os = 'macOS ' . str_replace( '_', '.', $match[1] );
    } elseif ( preg_match( '/Android ([0-9\.]+)/i', $ua, $match ) ) {
        $os = 'Android ' . $match[1];
    } elseif ( preg_match( '/iPhone OS ([0-9_]+)/i', $ua, $match ) ) {
        $os = 'iOS ' . str_replace( '_', '.', $match[1] );
    } elseif ( preg_match( '/Linux/i', $ua ) ) {
        $os = 'Linux';
    }

    return array(
        'browser' => $browser,
        'os' => $os,
    );
}

function ska_track_user_login( $user_login, $user ) {
    if ( ! $user || ! isset( $user->ID ) ) {
        return;
    }
    $timestamp = current_time( 'timestamp' );
    $ua = isset( $_SERVER['HTTP_USER_AGENT'] ) ? wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) : '';
    $parsed = ska_parse_user_agent( $ua );
    update_user_meta( $user->ID, 'last_login', $timestamp );
    update_user_meta( $user->ID, 'ska_last_login', current_time( 'mysql' ) );
    update_user_meta( $user->ID, 'ska_last_login_browser', $parsed['browser'] );
    update_user_meta( $user->ID, 'ska_last_login_os', $parsed['os'] );
    update_user_meta( $user->ID, 'ska_last_login_ua', $ua );
}
add_action( 'wp_login', 'ska_track_user_login', 10, 2 );

function ska_get_admin_users( WP_REST_Request $request ) {
    $search = sanitize_text_field( $request->get_param( 'search' ) );
    $args = array(
        'number' => 200,
        'orderby' => 'registered',
        'order' => 'DESC',
    );

    if ( $search ) {
        $args['search'] = '*' . $search . '*';
        $args['search_columns'] = array( 'user_email', 'display_name', 'user_login' );
    }

    $query = new WP_User_Query( $args );
    $users = array();
    foreach ( $query->get_results() as $user ) {
        $plan = ska_get_user_plan( $user->ID );
        $users[] = array(
            'id' => (int) $user->ID,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'plan' => $plan,
            'planLabel' => $plan === 'premium' ? 'Premium' : 'Basis',
            'registered' => $user->user_registered,
        );
    }

    return rest_ensure_response( array( 'users' => $users ) );
}

function ska_get_user_subscription_status( $user_id ) {
    if ( function_exists( 'wcs_get_users_subscriptions' ) ) {
        $subs = wcs_get_users_subscriptions( $user_id );
        foreach ( $subs as $subscription ) {
            if ( $subscription->has_status( array( 'active', 'on-hold', 'pending-cancel' ) ) ) {
                return 'active';
            }
            if ( $subscription->has_status( 'cancelled' ) ) {
                return 'cancelled';
            }
        }
    }
    return 'none';
}

function ska_get_user_support_summary( $user ) {
    $plan = ska_get_user_plan( $user->ID );
    $manual_until = (int) get_user_meta( $user->ID, 'ska_manual_access_until', true );
    $subscription_status = ska_get_user_subscription_status( $user->ID );
    $status = ( $plan === 'premium' || $subscription_status === 'active' ) ? 'Aktiv' : 'Abgelaufen';

    return array(
        'id' => (int) $user->ID,
        'name' => $user->display_name,
        'email' => $user->user_email,
        'status' => $status,
        'plan' => $plan,
        'planLabel' => $plan === 'premium' ? 'Premium' : 'Basis',
        'manualAccessUntil' => $manual_until ? date_i18n( 'Y-m-d H:i', $manual_until ) : '',
    );
}

function ska_get_support_user_detail( $user_id ) {
    $user = get_user_by( 'id', $user_id );
    if ( ! $user ) {
        return null;
    }
    $summary = ska_get_user_support_summary( $user );
    $projects = (int) get_user_meta( $user_id, 'ska_project_count', true );
    $storage = (float) get_user_meta( $user_id, 'ska_storage_used', true );
    $last_login_timestamp = (int) get_user_meta( $user_id, 'last_login', true );
    $last_login = $last_login_timestamp ? date_i18n( 'Y-m-d H:i', $last_login_timestamp ) : '';
    if ( ! $last_login ) {
        $last_login = get_user_meta( $user_id, 'ska_last_login', true );
    }
    $last_browser = get_user_meta( $user_id, 'ska_last_login_browser', true );
    $last_os = get_user_meta( $user_id, 'ska_last_login_os', true );

    $summary['quota'] = array(
        'projects' => $projects,
        'storage' => $storage,
    );
    $summary['lastLogin'] = array(
        'time' => $last_login ? $last_login : '',
        'browser' => $last_browser ? $last_browser : '',
        'os' => $last_os ? $last_os : '',
    );

    return $summary;
}

function ska_admin_update_plan( WP_REST_Request $request ) {
    $user_id = (int) $request->get_param( 'id' );
    $user = get_user_by( 'id', $user_id );
    if ( ! $user ) {
        return new WP_Error( 'ska_user_missing', 'User not found', array( 'status' => 404 ) );
    }

    $plan = sanitize_text_field( $request->get_param( 'plan' ) );
    if ( ! in_array( $plan, array( 'premium', 'free' ), true ) ) {
        return new WP_Error( 'ska_invalid_plan', 'Invalid plan', array( 'status' => 400 ) );
    }

    update_user_meta( $user_id, 'ska_plan', $plan );

    return rest_ensure_response( array(
        'id' => $user_id,
        'plan' => $plan,
        'planLabel' => $plan === 'premium' ? 'Premium' : 'Basis',
    ) );
}

function ska_admin_masquerade_user( WP_REST_Request $request ) {
    $user_id = (int) $request->get_param( 'id' );
    $user = get_user_by( 'id', $user_id );
    if ( ! $user ) {
        return new WP_Error( 'ska_user_missing', 'User not found', array( 'status' => 404 ) );
    }

    $admin_id = get_current_user_id();
    update_user_meta( $user_id, 'ska_masquerade_admin_id', $admin_id );

    wp_clear_auth_cookie();
    wp_set_current_user( $user_id );
    wp_set_auth_cookie( $user_id, true );

    return rest_ensure_response( array(
        'success' => true,
        'redirect' => home_url( '/' ),
    ) );
}

function ska_admin_exit_masquerade( WP_REST_Request $request ) {
    $current_user_id = get_current_user_id();
    $admin_id = $current_user_id ? get_user_meta( $current_user_id, 'ska_masquerade_admin_id', true ) : '';
    if ( ! $admin_id ) {
        return new WP_Error( 'ska_not_masquerading', 'Not in masquerade mode', array( 'status' => 400 ) );
    }

    $admin_user = get_user_by( 'id', (int) $admin_id );
    if ( ! $admin_user || ! user_can( $admin_user, 'manage_options' ) ) {
        return new WP_Error( 'ska_invalid_admin', 'Admin not found', array( 'status' => 403 ) );
    }

    delete_user_meta( $current_user_id, 'ska_masquerade_admin_id' );

    wp_clear_auth_cookie();
    wp_set_current_user( $admin_user->ID );
    wp_set_auth_cookie( $admin_user->ID, true );

    return rest_ensure_response( array(
        'success' => true,
        'redirect' => home_url( '/admin' ),
    ) );
}

function ska_admin_get_analytics( WP_REST_Request $request ) {
    $metrics = ska_get_metrics();
    $unlock = (int) $metrics['unlock_clicks'];
    $success = (int) $metrics['payment_success'];
    $dropoff = $unlock > 0 ? round( ( ( $unlock - $success ) / $unlock ) * 100, 1 ) : 0;

    return rest_ensure_response( array(
        'conversion' => array(
            'unlockClicks' => $unlock,
            'paymentSuccess' => $success,
            'dropoffRate' => $dropoff,
        ),
        'churnedUsers' => ska_get_cancelled_subscribers(),
    ) );
}

function ska_get_churn_radar_users() {
    $now = current_time( 'timestamp' );
    $cutoff_days = 14;
    $cutoff_timestamp = $now - ( DAY_IN_SECONDS * $cutoff_days );
    $args = array(
        'number' => 500,
        'orderby' => 'registered',
        'order' => 'DESC',
    );
    $query = new WP_User_Query( $args );
    $inactive = array();

    foreach ( $query->get_results() as $user ) {
        $plan = ska_get_user_plan( $user->ID );
        $subscription_status = ska_get_user_subscription_status( $user->ID );
        $is_premium = ( $plan === 'premium' || $subscription_status === 'active' );
        if ( ! $is_premium ) {
            continue;
        }

        $last_login = get_user_meta( $user->ID, 'last_login', true );
        $last_login_ts = 0;
        if ( $last_login ) {
            $last_login_ts = is_numeric( $last_login ) ? (int) $last_login : (int) strtotime( $last_login );
        }
        if ( ! $last_login_ts ) {
            $fallback = $user->user_registered ? strtotime( $user->user_registered ) : 0;
            $last_login_ts = $fallback ? $fallback : 0;
        }
        if ( ! $last_login_ts || $last_login_ts >= $cutoff_timestamp ) {
            continue;
        }
        $days_inactive = (int) floor( ( $now - $last_login_ts ) / DAY_IN_SECONDS );
        if ( $days_inactive <= $cutoff_days ) {
            continue;
        }
        $inactive[] = array(
            'id' => (int) $user->ID,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'daysInactive' => $days_inactive,
        );
    }

    usort( $inactive, function( $a, $b ) {
        return $b['daysInactive'] <=> $a['daysInactive'];
    } );

    return $inactive;
}

function ska_admin_get_churn_radar( WP_REST_Request $request ) {
    return rest_ensure_response( array(
        'inactiveUsers' => ska_get_churn_radar_users(),
    ) );
}

function ska_admin_get_announcement( WP_REST_Request $request ) {
    return rest_ensure_response( array(
        'message' => ska_get_global_announcement(),
    ) );
}

function ska_admin_update_announcement( WP_REST_Request $request ) {
    $message = wp_kses_post( (string) $request->get_param( 'message' ) );
    update_option( 'ska_global_announcement', $message );
    return rest_ensure_response( array( 'message' => $message ) );
}

function ska_admin_get_settings( WP_REST_Request $request ) {
    return rest_ensure_response( array(
        'unlockButtonEnabled' => ska_is_unlock_button_enabled(),
        'algorithmTuning' => ska_get_algorithm_tuning_settings(),
    ) );
}

function ska_admin_update_settings( WP_REST_Request $request ) {
    $enabled = filter_var( $request->get_param( 'unlockButtonEnabled' ), FILTER_VALIDATE_BOOLEAN );
    update_option( 'ska_unlock_button_enabled', $enabled ? '1' : '0' );

    $defaults = ska_get_algorithm_tuning_defaults();
    $long_sentence = $request->get_param( 'longSentenceThreshold' );
    if ( null !== $long_sentence ) {
        $long_sentence = (int) $long_sentence;
        if ( $long_sentence <= 0 ) {
            $long_sentence = $defaults['long_sentence_threshold'];
        }
        update_option( 'ska_long_sentence_threshold', $long_sentence );
    }

    $nominal_chain = $request->get_param( 'nominalChainThreshold' );
    if ( null !== $nominal_chain ) {
        $nominal_chain = (int) $nominal_chain;
        if ( $nominal_chain <= 0 ) {
            $nominal_chain = $defaults['nominal_chain_threshold'];
        }
        update_option( 'ska_nominal_chain_threshold', $nominal_chain );
    }

    $passive_strictness = $request->get_param( 'passiveVoiceStrictness' );
    if ( null !== $passive_strictness ) {
        $passive_strictness = (float) $passive_strictness;
        if ( $passive_strictness <= 0 ) {
            $passive_strictness = $defaults['passive_voice_strictness'];
        }
        update_option( 'ska_passive_voice_strictness', $passive_strictness );
    }

    return rest_ensure_response( array(
        'unlockButtonEnabled' => $enabled,
        'algorithmTuning' => ska_get_algorithm_tuning_settings(),
    ) );
}

function ska_admin_get_feature_usage( WP_REST_Request $request ) {
    $usage = ska_get_feature_usage();
    arsort( $usage );
    return rest_ensure_response( array( 'usage' => $usage ) );
}

function ska_admin_support_search( WP_REST_Request $request ) {
    $search = sanitize_text_field( $request->get_param( 'search' ) );
    $args = array(
        'number' => 50,
        'orderby' => 'registered',
        'order' => 'DESC',
    );
    if ( $search ) {
        $args['search'] = '*' . $search . '*';
        $args['search_columns'] = array( 'user_email', 'display_name', 'user_login' );
    }
    $query = new WP_User_Query( $args );
    $results = array();
    foreach ( $query->get_results() as $user ) {
        $results[] = ska_get_user_support_summary( $user );
    }
    return rest_ensure_response( array( 'users' => $results ) );
}

function ska_admin_support_detail( WP_REST_Request $request ) {
    $user_id = (int) $request->get_param( 'id' );
    $detail = ska_get_support_user_detail( $user_id );
    if ( ! $detail ) {
        return new WP_Error( 'ska_user_missing', 'User not found', array( 'status' => 404 ) );
    }
    return rest_ensure_response( $detail );
}

function ska_admin_support_clear_cache( WP_REST_Request $request ) {
    $user_id = (int) $request->get_param( 'id' );
    $user = get_user_by( 'id', $user_id );
    if ( ! $user ) {
        return new WP_Error( 'ska_user_missing', 'User not found', array( 'status' => 404 ) );
    }
    delete_user_meta( $user_id, 'ska_user_cache' );
    delete_user_meta( $user_id, 'ska_cached_analysis' );

    return rest_ensure_response( array( 'success' => true ) );
}

function ska_admin_support_extend_plan( WP_REST_Request $request ) {
    $user_id = (int) $request->get_param( 'id' );
    $user = get_user_by( 'id', $user_id );
    if ( ! $user ) {
        return new WP_Error( 'ska_user_missing', 'User not found', array( 'status' => 404 ) );
    }
    $days = (int) $request->get_param( 'days' );
    if ( $days <= 0 ) {
        $days = 30;
    }
    $now = current_time( 'timestamp' );
    $current_until = (int) get_user_meta( $user_id, 'ska_manual_access_until', true );
    $base = $current_until > $now ? $current_until : $now;
    $new_until = $base + ( DAY_IN_SECONDS * $days );
    update_user_meta( $user_id, 'ska_manual_access_until', $new_until );
    update_user_meta( $user_id, 'ska_plan', 'premium' );

    return rest_ensure_response( array(
        'success' => true,
        'manualAccessUntil' => date_i18n( 'Y-m-d H:i', $new_until ),
    ) );
}

function ska_admin_support_password_reset( WP_REST_Request $request ) {
    $user_id = (int) $request->get_param( 'id' );
    $user = get_user_by( 'id', $user_id );
    if ( ! $user ) {
        return new WP_Error( 'ska_user_missing', 'User not found', array( 'status' => 404 ) );
    }
    $key = get_password_reset_key( $user );
    if ( is_wp_error( $key ) ) {
        return $key;
    }
    $reset_url = network_site_url( 'wp-login.php?action=rp&key=' . $key . '&login=' . rawurlencode( $user->user_login ), 'login' );
    $message = "Hallo {$user->display_name},\n\n"
        . "nutze den folgenden Link, um dein Passwort zurückzusetzen:\n"
        . $reset_url . "\n\n"
        . "Wenn du die Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.";
    wp_mail( $user->user_email, 'Passwort zurücksetzen', $message );

    return rest_ensure_response( array( 'success' => true ) );
}

function ska_track_metric( WP_REST_Request $request ) {
    $event = sanitize_text_field( $request->get_param( 'event' ) );
    $feature = sanitize_text_field( $request->get_param( 'feature' ) );
    if ( $event === 'unlock_click' ) {
        ska_increment_metric( 'unlock_clicks' );
    }
    if ( $event === 'feature_usage' && $feature ) {
        ska_update_feature_usage( $feature );
    }
    return rest_ensure_response( array( 'success' => true ) );
}

function ska_register_admin_rest_routes() {
    register_rest_route( 'ska/v1', '/admin/users', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_get_admin_users',
    ) );

    register_rest_route( 'ska/v1', '/admin/users/(?P<id>\d+)/plan', array(
        'methods' => WP_REST_Server::CREATABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_update_plan',
    ) );

    register_rest_route( 'ska/v1', '/admin/users/(?P<id>\d+)/masquerade', array(
        'methods' => WP_REST_Server::CREATABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_masquerade_user',
    ) );

    register_rest_route( 'ska/v1', '/admin/masquerade/exit', array(
        'methods' => WP_REST_Server::CREATABLE,
        'permission_callback' => 'is_user_logged_in',
        'callback' => 'ska_admin_exit_masquerade',
    ) );

    register_rest_route( 'ska/v1', '/admin/analytics', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_get_analytics',
    ) );

    register_rest_route( 'ska/v1', '/admin/churn', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_get_churn_radar',
    ) );

    register_rest_route( 'ska/v1', '/admin/announcement', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_get_announcement',
    ) );

    register_rest_route( 'ska/v1', '/admin/announcement', array(
        'methods' => WP_REST_Server::EDITABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_update_announcement',
    ) );

    register_rest_route( 'ska/v1', '/admin/settings', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_get_settings',
    ) );

    register_rest_route( 'ska/v1', '/admin/settings', array(
        'methods' => WP_REST_Server::EDITABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_update_settings',
    ) );

    register_rest_route( 'ska/v1', '/admin/feature-usage', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_get_feature_usage',
    ) );

    register_rest_route( 'ska/v1', '/admin/support/users', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_support_search',
    ) );

    register_rest_route( 'ska/v1', '/admin/support/users/(?P<id>\d+)', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_support_detail',
    ) );

    register_rest_route( 'ska/v1', '/admin/support/users/(?P<id>\d+)/clear-cache', array(
        'methods' => WP_REST_Server::CREATABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_support_clear_cache',
    ) );

    register_rest_route( 'ska/v1', '/admin/support/users/(?P<id>\d+)/extend-plan', array(
        'methods' => WP_REST_Server::CREATABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_support_extend_plan',
    ) );

    register_rest_route( 'ska/v1', '/admin/support/users/(?P<id>\d+)/reset-password', array(
        'methods' => WP_REST_Server::CREATABLE,
        'permission_callback' => 'ska_admin_permission_check',
        'callback' => 'ska_admin_support_password_reset',
    ) );

    register_rest_route( 'ska/v1', '/metrics', array(
        'methods' => WP_REST_Server::CREATABLE,
        'permission_callback' => '__return_true',
        'callback' => 'ska_track_metric',
    ) );
}
add_action( 'rest_api_init', 'ska_register_admin_rest_routes' );
?>
