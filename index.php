<?php
$titre = "Missiona — Vous décrivez le projet, on livre le résultat";
$page = 'accueil';
require_once __DIR__ . '/includes/header.php';
?>

<main class="landing">
<section class="lp-hero lp-hero-domains" aria-label="Présentation de Missiona">
  <div class="container">
    <h1>Vous avez un projet<br>Confiez-le à nos experts<br><span class="lp-title-note">(Choisissez votre domaine)</span></h1>
  </div>
</section>

<!-- Domaines : remontés sous le hero, avec la DA Missiona existante. -->
<section class="landing-domains-top" aria-label="Nos domaines d'expertise">
  <div class="container">
    <div class="landing-domains-grid">
      <?php
      $dom = [
        ['💻','Développement &amp; logiciel','developpement'],
        ['🤖','Intelligence artificielle','ia'],
        ['🎨','Design &amp; identité','design'],
        ['📈','Marketing &amp; acquisition','marketing'],
        ['🎬','Vidéo, son &amp; photo','video'],
        ['📊','Data &amp; automatisation','data'],
        ['💶','Finance &amp; pilotage','finance'],
        ['🏗️','Ingénierie &amp; architecture','ingenierie'],
        ['🗂️','Assistance &amp; relation client','assistance'],
        ['🧭','Conseil, RH &amp; formation','conseil'],
        ['🔐','Cybersécurité &amp; infrastructure','cybersecurite'],
        ['🌍','Traduction &amp; langues','traduction'],
      ];
      foreach ($dom as $d): ?>
        <a class="landing-domain-top" href="<?= e(lien_domaine_landing($d[2])) ?>" aria-label="Décrire un projet : <?= e(strip_tags($d[1])) ?>">
          <span class="card-icon" aria-hidden="true"><?= $d[0] ?></span>
          <strong><?= $d[1] ?></strong>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Méthode -->
<section class="section" id="methode">
  <div class="container">
    <div class="section-head">
      <h2>Notre méthode en 4 étapes</h2>
      <p>Un processus structuré, transparent, et le même niveau d'exigence pour chaque projet.</p>
    </div>
    <div class="steps">
      <div class="step">
        <h3>Vous décrivez</h3>
        <p>Un formulaire guidé en 5 minutes : objectif, périmètre, budget et délai. Aucun jargon technique requis.</p>
      </div>
      <div class="step">
        <h3>Nous cadrons</h3>
        <p>Votre chargé de compte valide le besoin, affine le périmètre et qualifie les critères de réussite du projet.</p>
      </div>
      <div class="step">
        <h3>Nous attribuons</h3>
        <p>Notre moteur de matching classe les experts selon des critères mesurables. Nous sélectionnons et engageons le meilleur profil.</p>
      </div>
      <div class="step">
        <h3>Nous livrons</h3>
        <p>Suivi d'avancement, contrôle qualité et livraison conforme. Vous validez, l'expert vous facture.</p>
      </div>
    </div>
  </div>
</section>


<!-- Deux publics -->
<section class="section bg-white">
  <div class="container grid grid-2">
    <div class="card" style="background:var(--blue-light);border-color:#C7D9FF">
      <span class="badge badge-blue mb-2">Entreprises</span>
      <h3 style="font-size:1.5rem">Un partenaire d'exécution, pas un annuaire</h3>
      <p class="mt-2">Confiez vos projets digitaux, marketing ou data. Nous mobilisons les bons experts et pilotons l'exécution, sans que vous ayez à recruter ni à manager.</p>
      <ul style="list-style:none;margin:20px 0;display:grid;gap:10px">
        <li>✓ Proposition d'expert sous 48 h</li>
        <li>✓ Interlocuteur unique dédié</li>
        <li>✓ Tableau de bord de suivi en temps réel</li>
        <li>✓ Un interlocuteur unique du début à la fin</li>
      </ul>
      <a href="/entreprises" class="btn btn-primary">Découvrir l'offre entreprise</a>
    </div>
    <div class="card">
      <span class="badge badge-gray mb-2">Freelances</span>
      <h3 style="font-size:1.5rem">Des missions qualifiées, sans prospection</h3>
      <p class="mt-2">Recevez uniquement des missions correspondant à vos compétences et à votre tarif. Le cadrage et la relation client sont gérés par nous. Vous facturez le client directement.</p>
      <ul style="list-style:none;margin:20px 0;display:grid;gap:10px">
        <li>✓ Missions pré-cadrées et pré-vendues</li>
        <li>✓ Zéro prospection commerciale</li>
        <li>✓ Tarif convenu par écrit avant le démarrage</li>
        <li>✓ Interlocuteur unique côté Missiona</li>
      </ul>
      <a href="/freelances" class="btn btn-ghost">Découvrir l'offre freelance</a>
    </div>
  </div>
</section>

<!-- Problème / solution -->
<section class="section bg-white">
  <div class="container">
    <div class="section-head">
      <h2>Gérer des prestataires ne devrait pas être un métier</h2>
      <p>La plupart des plateformes vous laissent seul face à des centaines de profils. Nous faisons l'inverse.</p>
    </div>
    <div class="grid grid-3">
      <div class="card card-hover">
        <div class="card-icon">🎯</div>
        <h3>Zéro recherche de votre côté</h3>
        <p>Vous ne parcourez aucun catalogue de freelances. Notre équipe identifie le profil adapté grâce à un scoring objectif sur les compétences, le budget et la disponibilité.</p>
      </div>
      <div class="card card-hover">
        <div class="card-icon">🧭</div>
        <h3>Un pilotage professionnel</h3>
        <p>Un chargé de compte Missiona suit chaque projet de bout en bout : cadrage, jalons, points d'avancement et recette du livrable.</p>
      </div>
      <div class="card card-hover">
        <div class="card-icon">🛡️</div>
        <h3>Un engagement de résultat</h3>
        <p>Périmètre contractualisé, tarif convenu par écrit et contrôle qualité avant livraison. Si le livrable ne convient pas, nous reprenons la main.</p>
      </div>
    </div>
  </div>
</section>

<!-- Tarifs -->
<section class="section bg-white" id="tarifs">
  <div class="container">
    <div class="section-head">
      <h2>Une tarification claire</h2>
      <p>Pas d'abonnement, pas de frais cachés. Vous ne payez que lorsque le projet est lancé.</p>
    </div>
    <div class="grid grid-3">
      <div class="card">
        <h3>Publication du besoin</h3>
        <p class="mt-1" style="font-size:2rem;font-weight:800;color:var(--ink)">Gratuit</p>
        <p class="small mt-2">Décrivez votre projet et recevez une proposition d'expert et une estimation budgétaire sous 48 h, sans engagement.</p>
      </div>
      <div class="card" style="border-color:var(--blue);box-shadow:var(--sh-md)">
        <span class="badge badge-blue mb-2">Le plus courant</span>
        <h3>Projet piloté</h3>
        <p class="mt-1" style="font-size:2rem;font-weight:800;color:var(--ink)">Devis <span style="font-size:1rem;font-weight:600;color:var(--muted)">clair et sans surprise</span></p>
        <p class="small mt-2">Sélection de l'expert, pilotage complet, contrôle qualité et livraison conforme.</p>
      </div>
      <div class="card">
        <h3>Programme sur mesure</h3>
        <p class="mt-1" style="font-size:2rem;font-weight:800;color:var(--ink)">Sur devis</p>
        <p class="small mt-2">Volume de projets récurrents, équipe dédiée, SLA contractuels et reporting consolidé pour les grands comptes.</p>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section" id="faq">
  <div class="container-sm">
    <div class="section-head">
      <h2>Questions fréquentes</h2>
      <p>Les réponses aux questions les plus posées avant de lancer un projet.</p>
    </div>
    <?php
    require_once __DIR__ . '/includes/contenu.php';
    foreach (array_slice(wc_faq(), 0, 6) as $f): ?>
      <details class="faq-item">
        <summary><h3 style="display:inline;font-size:1rem;font-weight:600"><?= e($f['q']) ?></h3></summary>
        <p><?= e($f['r']) ?></p>
      </details>
    <?php endforeach; ?>
    <p class="text-center" style="margin-top:22px">
      <a href="/faq" class="btn btn-ghost">Voir les 13 questions fréquentes</a>
    </p>
  </div>
</section>

<section class="section-sm">
  <div class="container">
    <div class="cta-band">
      <h2>Prêt à lancer votre prochain projet ?</h2>
      <p>Décrivez votre besoin en 5 minutes. Notre équipe revient vers vous sous 48 heures avec une proposition concrète.</p>
      <div class="cta-actions">
        <a href="/nouveau-projet" class="btn btn-white btn-lg">Décrire mon projet</a>
        <a href="/connexion" class="btn btn-outline-white btn-lg">Accéder à mon espace</a>
      </div>
    </div>
  </div>
</section>

</main>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
