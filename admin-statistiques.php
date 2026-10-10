<?php
/**
 * Missiona — Fréquentation du site
 * ------------------------------------------------------------------
 * Réservé à l'administrateur principal : ces données concernent
 * l'ensemble des visiteurs, y compris non inscrits.
 *
 * Les graphiques sont produits en SVG côté serveur : ils s'affichent
 * même sans JavaScript et ne dépendent d'aucune bibliothèque.
 */
require_once __DIR__ . '/includes/functions.php';
require_admin_principal();

/* ---------- Actions ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();

    if (isset($_POST['purger'])) {
        stats_purge();
        flash("Données antérieures à la durée de conservation supprimées.", 'success');
        header('Location: ' . u('/admin-statistiques')); exit;
    }
    if (isset($_POST['tout_effacer'])) {
        db()->exec("DELETE FROM visites");
        db()->exec("DELETE FROM evenements");
        flash("Historique de fréquentation entièrement effacé.", 'success');
        header('Location: ' . u('/admin-statistiques')); exit;
    }
    if (isset($_POST['reglages'])) {
        set_param('stats_actif', isset($_POST['stats_actif']) ? 1 : 0);
        set_param('stats_retention', max(30, min(1200, (int) ($_POST['stats_retention'] ?? 395))));
        flash("Réglages enregistrés.", 'success');
        header('Location: ' . u('/admin-statistiques')); exit;
    }
}

/* ---------- Export CSV ---------- */
if (isset($_GET['export'])) {
    $j = max(1, (int) ($_GET['jours'] ?? 30));
    while (ob_get_level() > 0) { ob_end_clean(); }
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="frequentation-' . date('Ymd') . '.csv"');
    $out = fopen('php://output', 'w');
    fprintf($out, "\xEF\xBB\xBF");            // BOM, pour qu'Excel lise les accents
    fputcsv($out, ['Date', 'Pages vues', 'Visiteurs'], ';');
    foreach (stats_par_jour($j) as $p) {
        fputcsv($out, [$p['date'], $p['pages'], $p['visiteurs']], ';');
    }
    fclose($out);
    exit;
}

$jours = (int) ($_GET['jours'] ?? 30);
if (!in_array($jours, [7, 30, 90, 365], true)) { $jours = 30; }

$resume   = stats_resume($jours);
$serie    = stats_par_jour($jours);
$pages    = stats_top_pages($jours);
$actions  = stats_top_actions($jours);
$appareil = stats_repartition('appareil', $jours);
$source   = stats_repartition('source', $jours);
$heures   = stats_par_heure(min($jours, 30));

$titre = "Fréquentation";
require_once __DIR__ . '/includes/header.php';
?>
<div class="app">
<?php require __DIR__ . '/includes/sidebar.php'; ?>
<main class="main">

    <div class="page-head">
      <div>
        <h1>Fréquentation du site</h1>
        <p class="muted">Pages consultées et actions des visiteurs, mesurées sans service externe.</p>
      </div>
    </div>

    <?php if ($f = flash()): ?>
      <div class="alert alert-<?= e($f['t']) ?>"><?= e($f['m']) ?></div>
    <?php endif; ?>

    <?php if (!stats_actif()): ?>
      <div class="alert alert-amber mb-3">
        La mesure est <strong>désactivée</strong> : aucune nouvelle visite n'est enregistrée.
      </div>
    <?php endif; ?>

    <!-- Période -->
    <div class="mb-3">
      <?php foreach ([7 => '7 jours', 30 => '30 jours', 90 => '3 mois', 365 => '1 an'] as $k => $lib): ?>
        <a class="btn btn-sm <?= $jours === $k ? 'btn-primary' : 'btn-ghost' ?>"
           href="<?= u('/admin-statistiques?jours=' . $k) ?>" data-suivi-non><?= $lib ?></a>
      <?php endforeach; ?>
      <a class="btn btn-sm btn-ghost" style="float:right"
         href="<?= u('/admin-statistiques?export=csv&jours=' . $jours) ?>">Exporter en CSV</a>
    </div>

    <!-- Chiffres clés -->
    <div class="grid grid-5 mb-3">
      <div class="stat">
        <div class="lbl">Visiteurs</div>
        <div class="val"><?= number_format($resume['visiteurs'], 0, ',', ' ') ?></div>
        <div class="sub">personnes distinctes</div>
      </div>
      <div class="stat">
        <div class="lbl">Pages vues</div>
        <div class="val"><?= number_format($resume['pages'], 0, ',', ' ') ?></div>
        <div class="sub"><?= $resume['par_visiteur'] ?> par visiteur</div>
      </div>
      <div class="stat">
        <div class="lbl">Actions</div>
        <div class="val"><?= number_format($resume['actions'], 0, ',', ' ') ?></div>
        <div class="sub">clics et envois</div>
      </div>
      <div class="stat">
        <div class="lbl">Connectés</div>
        <div class="val"><?= number_format($resume['connectes'], 0, ',', ' ') ?></div>
        <div class="sub">comptes actifs</div>
      </div>
      <div class="stat">
        <div class="lbl">Robots</div>
        <div class="val"><?= number_format($resume['robots'], 0, ',', ' ') ?></div>
        <div class="sub">exclus des chiffres</div>
      </div>
    </div>

    <!-- Évolution -->
    <div class="panel mb-3">
      <div class="panel-head">
        <h3>Évolution</h3>
        <span class="small muted">
          <span class="lg lg-bleu"></span> pages vues
          <span class="lg lg-vert"></span> visiteurs
        </span>
      </div>
      <div class="panel-body"><?= svg_courbe($serie) ?></div>
    </div>

    <div class="grid grid-2 mb-3">
      <div class="panel">
        <div class="panel-head"><h3>Pages les plus consultées</h3></div>
        <div class="panel-body"><?= svg_barres($pages, 'chemin', 'n') ?></div>
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Boutons et liens cliqués</h3></div>
        <div class="panel-body">
          <?php if (!$actions): ?>
            <p class="muted small">
              Aucune action pour l'instant. Les clics sont enregistrés dès qu'un
              visiteur utilise le site avec JavaScript actif.
            </p>
          <?php else: ?>
            <?= svg_barres($actions, 'cible', 'n') ?>
          <?php endif; ?>
        </div>
      </div>
    </div>

    <div class="grid grid-2 mb-3">
      <div class="panel">
        <div class="panel-head"><h3>Appareils</h3></div>
        <div class="panel-body"><?= svg_barres($appareil, 'k', 'n') ?></div>
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Provenance</h3></div>
        <div class="panel-body"><?= svg_barres($source, 'k', 'n') ?></div>
      </div>
    </div>

    <div class="panel mb-3">
      <div class="panel-head"><h3>Heures de fréquentation</h3></div>
      <div class="panel-body"><?= svg_heures($heures) ?></div>
    </div>

    <!-- Détail des actions -->
    <?php if ($actions): ?>
    <div class="panel mb-3">
      <div class="panel-head"><h3>Détail des actions</h3></div>
      <div class="panel-body">
        <table class="table">
          <thead><tr><th>Type</th><th>Élément</th><th class="right">Nombre</th></tr></thead>
          <tbody>
            <?php foreach ($actions as $a): ?>
              <tr>
                <td><span class="badge badge-gray"><?= e($a['type']) ?></span></td>
                <td class="small"><?= e($a['cible']) ?></td>
                <td class="right strong"><?= (int) $a['n'] ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
    <?php endif; ?>

    <!-- Réglages et vie privée -->
    <div class="panel">
      <div class="panel-head"><h3>Réglages et vie privée</h3></div>
      <div class="panel-body">
        <p class="small mb-3">
          Aucune adresse IP n'est conservée : seul un condensé, salé avec une valeur
          qui change chaque jour, permet de distinguer deux visiteurs. Il est donc
          impossible de suivre quelqu'un d'un jour sur l'autre, ni de l'identifier.
          Aucune donnée ne sort du serveur. Dans ces conditions, la CNIL dispense la
          mesure d'audience de bandeau de consentement.
        </p>

        <form method="post" class="mb-3">
          <?= csrf_field() ?>
          <input type="hidden" name="reglages" value="1">
          <label class="check mb-2">
            <input type="checkbox" name="stats_actif" value="1" <?= stats_actif() ? 'checked' : '' ?>>
            <span>Mesurer la fréquentation</span>
          </label>
          <div class="field" style="max-width:280px">
            <label for="stats_retention">Conservation (jours)</label>
            <input type="number" name="stats_retention" id="stats_retention" class="input"
                   min="30" max="1200" step="1" value="<?= (int) stats_retention() ?>">
            <div class="hint">La CNIL recommande de ne pas dépasser 25 mois (760 jours).</div>
          </div>
          <button class="btn btn-primary btn-sm mt-2" type="submit">Enregistrer</button>
        </form>

        <div class="sep"></div>

        <form method="post" style="display:inline">
          <?= csrf_field() ?>
          <button class="btn btn-ghost btn-sm" type="submit" name="purger" value="1">
            Purger au-delà de la durée de conservation
          </button>
        </form>
        <form method="post" style="display:inline"
              onsubmit="return confirm('Effacer définitivement tout l\'historique de fréquentation ?');">
          <?= csrf_field() ?>
          <button class="btn btn-ghost btn-sm" type="submit" name="tout_effacer" value="1">
            Tout effacer
          </button>
        </form>
      </div>
    </div>

</main>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
