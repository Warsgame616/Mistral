/* ------------------------------------------------------------------
 * Missiona — Service worker
 * ------------------------------------------------------------------
 * Permet l'installation sur téléphone et un écran d'attente correct
 * hors connexion.
 *
 * RÈGLE DE SÉCURITÉ ABSOLUE : aucune page HTML n'est jamais mise en
 * cache. Ces pages contiennent des données de compte — profil,
 * messages, factures. Les conserver exposerait l'utilisateur suivant
 * du même appareil, ou afficherait le contenu d'une session périmée.
 * Seuls les fichiers publics et invariants sont gardés : styles,
 * scripts, images.
 * ------------------------------------------------------------------ */

const VERSION    = 'missiona-v2';
const CACHE_FIXE = VERSION + '-statique';
const HORS_LIGNE = '/hors-ligne.html';

// Ressources indispensables à l'affichage de l'écran hors connexion
const SOCLE = [
  HORS_LIGNE,
  '/assets/css/style.min.css',
  '/assets/img/icon-192.png',
  '/assets/img/logo.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_FIXE)
      .then((c) => c.addAll(SOCLE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())   // une ressource absente ne doit rien bloquer
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(
        noms.filter((n) => n.indexOf(VERSION) !== 0).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

/** Ressource publique et stable, sans données personnelles ? */
function estStatique(url) {
  return url.pathname.startsWith('/assets/')
      && !url.pathname.endsWith('.php');
}

self.addEventListener('fetch', (e) => {
  const req = e.request;

  // On ne touche ni aux envois de formulaire, ni aux autres domaines
  if (req.method !== 'GET') { return; }
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) { return; }

  // Jamais de cache pour les pages : elles peuvent être personnelles
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req).catch(() => caches.match(HORS_LIGNE))
    );
    return;
  }

  // Fichiers publics : on sert le cache, et on rafraîchit en arrière-plan
  if (estStatique(url)) {
    e.respondWith(
      caches.match(req).then((enCache) => {
        const reseau = fetch(req).then((rep) => {
          if (rep && rep.status === 200 && rep.type === 'basic') {
            const copie = rep.clone();
            caches.open(CACHE_FIXE).then((c) => c.put(req, copie));
          }
          return rep;
        }).catch(() => enCache);
        return enCache || reseau;
      })
    );
    return;
  }

  // Tout le reste passe directement par le réseau
  e.respondWith(fetch(req).catch(() => caches.match(HORS_LIGNE)));
});

/** Permet à la page de demander l'activation immédiate d'une mise à jour. */
self.addEventListener('message', (e) => {
  if (e.data === 'appliquer-maj') { self.skipWaiting(); }
});


/* ------------------------------------------------------------------
 * Notifications sur telephone
 * ------------------------------------------------------------------
 * L'impulsion recue est vide : on va chercher le message a afficher
 * aupres du site. Le contenu ne transite donc jamais par le service
 * de push, et reste sur nos serveurs.
 * ------------------------------------------------------------------ */
self.addEventListener('push', (e) => {
  e.waitUntil((async () => {
    let msg = { titre: 'Missiona', texte: 'Nouvelle activite sur votre plateforme.', lien: '/admin' };
    try {
      const ab = await self.registration.pushManager.getSubscription();
      if (ab) {
        const corps = new URLSearchParams({ endpoint: ab.endpoint });
        const rep = await fetch('/push-message.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: corps.toString(),
        });
        if (rep.ok) { msg = Object.assign(msg, await rep.json()); }
      }
    } catch (err) { /* on affichera le message par defaut */ }

    await self.registration.showNotification(msg.titre, {
      body: msg.texte,
      icon: '/assets/img/icon-192.png',
      badge: '/assets/img/icon-96.png',
      tag: 'missiona-activite',        // remplace la precedente au lieu d'empiler
      renotify: true,
      data: { lien: msg.lien || '/admin' },
    });
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const cible = (e.notification.data && e.notification.data.lien) || '/admin';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((fenetres) => {
      // Si le site est deja ouvert, on le reutilise
      for (const f of fenetres) {
        if (f.url.indexOf(self.location.origin) === 0 && 'focus' in f) {
          f.navigate(cible);
          return f.focus();
        }
      }
      return self.clients.openWindow(cible);
    })
  );
});
