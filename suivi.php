<?php
/**
 * Missiona — Réception des actions mesurées côté navigateur
 * ------------------------------------------------------------------
 * Appelé par assets/js/app.js à chaque clic suivi. Répond toujours
 * « 204 sans contenu » : la mesure ne doit rien changer à la navigation.
 */
require_once __DIR__ . '/includes/functions.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    // Garde-fou : on n'accepte que des actions venant de nos propres pages.
    $ref  = parse_url($_SERVER['HTTP_REFERER'] ?? '', PHP_URL_HOST);
    $hote = preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? '');
    if ($ref === null || $ref === $hote) {
        // Limite simple : pas plus de 40 actions par visiteur et par minute.
        $cle = 'suivi_' . date('YmdHi');
        $n   = (int) ($_SESSION[$cle] ?? 0);
        if ($n < 40) {
            $_SESSION[$cle] = $n + 1;
            stats_action($_POST['type'] ?? 'clic', $_POST['cible'] ?? '', $_POST['detail'] ?? '');
        }
    }
}

http_response_code(204);
