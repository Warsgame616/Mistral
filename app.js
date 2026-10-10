/* Missiona — JavaScript pur, aucune librairie externe */

/* ---------- Notifications ---------- */
function toggleNotif(ev){
  ev.stopPropagation();
  var p = document.getElementById('notifPanel');
  if (p) p.classList.toggle('open');
}
document.addEventListener('click', function(){
  var p = document.getElementById('notifPanel');
  if (p) p.classList.remove('open');
});

/* ---------- Onglets ---------- */
function initTabs(){
  document.querySelectorAll('[data-tabs]').forEach(function(group){
    var tabs = group.querySelectorAll('.tab');
    tabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        var target = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('[data-panel]').forEach(function(p){
          p.classList.toggle('active', p.dataset.panel === target);
        });
      });
    });
  });

  // Ouverture directe d'un onglet via l'URL : /profil?onglet=fiscal
  var cle = new URLSearchParams(location.search).get('onglet');
  if (cle) {
    var carte = { fiscal: 'p7', versements: 'p6', portfolio: 'p4',
                  forfaits: 'p5', securite: 'p2', rgpd: 'p3' };
    var cible = carte[cle];
    if (cible) {
      var onglet = document.querySelector('.tab[data-tab="' + cible + '"]');
      if (onglet) { onglet.click(); }
    }
  }
}

/* ---------- Sélection de rôle ---------- */
function initRoles(){
  document.querySelectorAll('.role-opt').forEach(function(opt){
    opt.addEventListener('click', function(){
      var name = opt.dataset.target;
      document.querySelectorAll('.role-opt[data-target="'+name+'"]').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      var input = document.getElementById(name);
      if (input) { input.value = opt.dataset.value; }
      // Affiche les champs conditionnels
      document.querySelectorAll('[data-role-block]').forEach(function(b){
        var actif = b.dataset.roleBlock === opt.dataset.value;
        b.style.display = actif ? '' : 'none';
        // Sur l'inscription, les blocs sont des fieldset : un champ caché
        // ne doit ni être soumis ni bloquer la validation HTML.
        if (b.tagName === 'FIELDSET') b.disabled = !actif;
        b.querySelectorAll('input,select,textarea').forEach(function(f){
          if (f.dataset.req === '1') f.required = actif;
        });
      });
    });
  });
}

/* ---------- Tags de compétences ---------- */
function initTags(){
  document.querySelectorAll('.tagbox, .skills-box').forEach(function(box){
    var hidden = document.getElementById(box.dataset.input);
    if (!hidden) return;
    var current = hidden.value ? hidden.value.split(',').map(s=>s.trim()).filter(Boolean) : [];
    var compteur = box.querySelector('[data-skills-count]');
    var vide     = box.querySelector('[data-skills-vide]');
    var valeur = function(tag){ return tag.dataset.value || tag.textContent.trim(); };

    function selection(){
      var vus = {};
      box.querySelectorAll('.tag-opt.on').forEach(function(tag){ vus[valeur(tag)] = true; });
      return Object.keys(vus);
    }
    function majCompteur(){
      var n = selection().length;
      if (compteur) compteur.textContent = n ? (n + (n > 1 ? ' sélectionnées' : ' sélectionnée')) : '';
      box.querySelectorAll('.skills-group').forEach(function(g){
        var vus = {};
        g.querySelectorAll('.tag-opt.on').forEach(function(tag){ vus[valeur(tag)] = true; });
        var b = g.querySelector('[data-skills-actifs]');
        if (b) b.textContent = Object.keys(vus).length || '';
      });
    }

    box.querySelectorAll('.tag-opt').forEach(function(tag){
      if (current.indexOf(valeur(tag)) > -1) tag.classList.add('on');
      tag.addEventListener('click', function(){
        var choisi = !tag.classList.contains('on');
        var v = valeur(tag);
        // Les suggestions du domaine peuvent aussi exister dans le catalogue
        // complet : une seule interaction garde les deux vues synchronisées.
        box.querySelectorAll('.tag-opt').forEach(function(autre){
          if (valeur(autre) === v) autre.classList.toggle('on', choisi);
        });
        hidden.value = selection().join(',');
        majCompteur();
      });
    });

    box.querySelectorAll('[data-skills-toggle]').forEach(function(t){
      t.addEventListener('click', function(){ t.parentNode.classList.toggle('ouvert'); });
    });

    var champ = box.querySelector('[data-skills-search]');
    if (champ) {
      champ.addEventListener('input', function(){
        var q = champ.value.trim().toLowerCase(), total = 0;
        box.querySelectorAll('.skills-group').forEach(function(g){
          var vus = 0;
          g.querySelectorAll('.tag-opt').forEach(function(tag){
            var ok = !q || tag.textContent.trim().toLowerCase().indexOf(q) > -1;
            tag.hidden = !ok;
            if (ok) vus++;
          });
          g.hidden = (q && vus === 0);
          if (q) g.classList.toggle('ouvert', vus > 0);
          total += vus;
        });
        if (vide) vide.hidden = !(q && total === 0);
        if (!q) box.querySelectorAll('.skills-group').forEach(function(g){
          g.classList.toggle('ouvert', g.querySelectorAll('.tag-opt.on').length > 0);
        });
      });
    }
    majCompteur();
  });
}

/* ---------- Domaine compact + compétences adaptées ---------- */
function initProjectDomain(){
  var picker = document.getElementById('projectDomainPicker');
  var toggle = document.getElementById('projectDomainToggle');
  if (!picker || !toggle) return;
  var current = document.getElementById('projectDomainCurrent');
  var currentBox = document.getElementById('projectDomainCurrentBox');
  var empty = document.getElementById('projectSkillsEmpty');
  var radios = document.querySelectorAll('input[name="categorie"]');

  function selected(){
    var checked = document.querySelector('input[name="categorie"]:checked');
    return checked ? checked.value : '';
  }
  function ouvrir(ouvert){
    picker.hidden = !ouvert;
    toggle.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    toggle.textContent = ouvert ? 'Fermer' : (selected() ? 'Modifier' : 'Choisir');
  }
  function rendre(){
    var domaine = selected();
    if (current) current.textContent = domaine || 'Choisir';
    if (currentBox) currentBox.classList.toggle('has-value', !!domaine);
    if (empty) empty.hidden = !!domaine;
    document.querySelectorAll('[data-project-domain-skills]').forEach(function(section){
      section.hidden = section.dataset.projectDomainSkills !== domaine;
    });
  }

  toggle.addEventListener('click', function(){ ouvrir(picker.hidden); });
  radios.forEach(function(radio){
    radio.addEventListener('change', function(){ rendre(); ouvrir(false); });
  });
  // Si le visiteur passe trop vite, la validation ouvre directement le
  // seul choix manquant au lieu de lui laisser chercher où cliquer.
  window.missionaAfficherDomaines = function(){ ouvrir(true); };
  rendre();
  ouvrir(false);
}

/* ---------- Assistant multi-étapes ---------- */
var wzIndex = 0;
function initWizard(){
  var wiz = document.getElementById('wizard');
  if (!wiz) return;
  var panels = wiz.querySelectorAll('.wz-panel');
  var steps  = wiz.querySelectorAll('.wz-step');
  var btnPrev = document.getElementById('wzPrev');
  var btnNext = document.getElementById('wzNext');
  var btnSubmit = document.getElementById('wzSubmit');
  var start = parseInt(wiz.dataset.startStep || '0', 10);
  wzIndex = isNaN(start) ? 0 : Math.max(0, Math.min(start, panels.length - 1));

  function render(){
    panels.forEach((p,i) => p.classList.toggle('active', i === wzIndex));
    steps.forEach(function(s,i){ s.classList.toggle('active', i === wzIndex); s.classList.toggle('done', i < wzIndex); });
    btnPrev.style.visibility = wzIndex === 0 ? 'hidden' : 'visible';
    var last = wzIndex === panels.length - 1;
    btnNext.style.display = last ? 'none' : '';
    btnSubmit.style.display = last ? '' : 'none';
    if (last) buildRecap();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function validate(){
    var panel = panels[wzIndex], ok = true, radios = {};
    panel.querySelectorAll('[required]').forEach(function(f){
      if (f.type === 'radio') { radios[f.name] = true; return; }
      if (!String(f.value || '').trim()) { f.style.borderColor = 'var(--red)'; ok = false; }
      else f.style.borderColor = '';
    });
    Object.keys(radios).forEach(function(name){
      var checked = panel.querySelector('input[type="radio"][name="' + name + '"]:checked');
      panel.querySelectorAll('input[type="radio"][name="' + name + '"]').forEach(function(r){
        var card = r.closest('.project-choice');
        if (card) card.classList.toggle('invalid', !checked);
      });
      if (!checked) {
        ok = false;
        if (name === 'categorie' && typeof window.missionaAfficherDomaines === 'function') window.missionaAfficherDomaines();
      }
    });
    if (!ok) alert('Merci de compléter les informations indispensables avant de continuer.');
    return ok;
  }

  function valeurRadio(name){
    var checked = wiz.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : '—';
  }
  function valeurSelect(id){
    var el = document.getElementById(id);
    return el && el.value ? el.value : '—';
  }
  function buildRecap(){
    var box = document.getElementById('recapBox');
    if (!box) return;
    var v = id => (document.getElementById(id) || {}).value || '—';
    var txt = id => (document.getElementById(id) || {}).textContent || '—';
    var skills = v('competences');
    box.innerHTML = [
      ['Projet', v('titre')],
      ['Domaine', valeurRadio('categorie')],
      ['Compétences', skills === '—' ? 'À définir ensemble' : skills],
      ['Budget', txt('budgetMinTxt') + ' — ' + txt('budgetMaxTxt')],
      ['Durée', valeurSelect('delai')],
      ['Date souhaitée', v('date_limite')]
    ].map(r => '<div class="recap-row"><span>'+r[0]+'</span><strong>'+escapeHtml(r[1])+'</strong></div>').join('');
  }

  wiz.querySelectorAll('.project-choice input').forEach(function(input){
    input.addEventListener('change', function(){
      wiz.querySelectorAll('input[name="' + input.name + '"]').forEach(function(other){
        var card = other.closest('.project-choice');
        if (card) { card.classList.toggle('selected', other.checked); card.classList.remove('invalid'); }
      });
    });
  });
  btnNext.addEventListener('click', function(){ if (validate() && wzIndex < panels.length-1){ wzIndex++; render(); } });
  btnPrev.addEventListener('click', function(){ if (wzIndex > 0){ wzIndex--; render(); } });
  render();
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ---------- Compteur de caractères ---------- */
function initCounters(){
  document.querySelectorAll('[data-counter]').forEach(function(ta){
    var out = document.getElementById(ta.dataset.counter);
    if (!out) return;
    var upd = () => out.textContent = ta.value.length + ' caractères';
    ta.addEventListener('input', upd); upd();
  });
}

/* ---------- Connexion démo en un clic ---------- */
function fillLogin(email, pass){
  var e = document.getElementById('email'), p = document.getElementById('password');
  if (e && p){ e.value = email; p.value = pass; e.form.submit(); }
}

/* ---------- Scroll to bottom messagerie ---------- */
function initChat(){
  var b = document.getElementById('chatBody');
  if (b) b.scrollTop = b.scrollHeight;
}

/* ---------- Filtre de tableau ---------- */
function filterTable(input, tableId){
  var q = input.value.toLowerCase();
  document.querySelectorAll('#'+tableId+' tbody tr').forEach(function(tr){
    tr.style.display = tr.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none';
  });
}

/* ---------- Confirmation de dépôt ---------- */
function initProjectSuccessModal(){
  var modal = document.getElementById('projectSuccessModal');
  if (!modal) return;
  var close = function(){ modal.hidden = true; };
  modal.querySelectorAll('[data-project-success-close]').forEach(function(btn){
    btn.addEventListener('click', close);
  });
  modal.addEventListener('click', function(ev){ if (ev.target === modal) close(); });
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && !modal.hidden) close();
  });
}

document.addEventListener('DOMContentLoaded', function(){
  initTabs(); initRoles(); initTags(); initProjectDomain(); initWizard(); initCounters(); initChat(); initBudgetRange(); initProjectSuccessModal();
});

/* ---------- Double curseur de budget (1 € – 5 000 €) ---------- */
function euroFmt(n, max){
  var v = Number(n);
  var plus = (max !== undefined && v >= Number(max)) ? '+' : '';
  return v.toLocaleString('fr-FR') + ' \u20AC' + plus;
}

function initBudgetRange(){
  var wrap = document.getElementById('budgetRange');
  if (!wrap) return;

  // Les curseurs ne servent qu'au réglage à la main. La valeur réellement
  // envoyée vit dans les champs cachés : elle peut donc être n'importe
  // quel montant, y compris hors du pas du curseur.
  var rgMin = document.getElementById('rgMin');
  var rgMax = document.getElementById('rgMax');
  var vMin  = document.getElementById('budget_min');
  var vMax  = document.getElementById('budget_max');
  var fill  = document.getElementById('budgetFill');
  var tMin  = document.getElementById('budgetMinTxt');
  var tMax  = document.getElementById('budgetMaxTxt');
  if (!rgMin || !rgMax || !vMin || !vMax) return;

  var LO = parseInt(rgMin.min, 10), HI = parseInt(rgMin.max, 10);

  function borne(n){
    n = Math.round(Number(n));
    if (!isFinite(n)) { n = LO; }
    return Math.min(HI, Math.max(LO, n));
  }

  function dessiner(){
    var a = borne(vMin.value), b = borne(vMax.value);
    if (a > b) { b = a; }               // le minimum ne dépasse jamais le maximum
    vMin.value = a; vMax.value = b;

    // Le curseur se cale au cran le plus proche : c'est un repère visuel,
    // la valeur exacte reste dans le champ caché.
    rgMin.value = a; rgMax.value = b;

    if (tMin) { tMin.textContent = euroFmt(a, HI); }
    if (tMax) { tMax.textContent = euroFmt(b, HI); }

    var p1 = ((a - LO) / (HI - LO)) * 100;
    var p2 = ((b - LO) / (HI - LO)) * 100;
    fill.style.left  = Math.max(0, Math.min(100, p1)) + '%';
    fill.style.width = Math.max(0, Math.min(100, p2 - p1)) + '%';
  }

  // Déplacement d'un curseur
  rgMin.addEventListener('input', function(){
    vMin.value = rgMin.value;
    if (Number(vMin.value) > Number(vMax.value)) { vMax.value = vMin.value; }
    dessiner();
  });
  rgMax.addEventListener('input', function(){
    vMax.value = rgMax.value;
    if (Number(vMax.value) < Number(vMin.value)) { vMin.value = vMax.value; }
    dessiner();
  });

  // Saisie du montant exact : un clic sur l'un des deux prix ouvre un champ
  function saisir(bouton, champ, autre, estMin){
    if (!bouton) { return; }
    bouton.addEventListener('click', function(){
      if (bouton.dataset.ouvert === '1') { return; }
      bouton.dataset.ouvert = '1';

      var saisie = document.createElement('input');
      saisie.type = 'number';
      saisie.className = 'range-saisie';
      saisie.min = LO; saisie.max = HI; saisie.step = 1;
      saisie.value = champ.value;
      saisie.setAttribute('aria-label', estMin ? 'Montant minimum exact' : 'Montant maximum exact');

      bouton.style.display = 'none';
      bouton.parentNode.insertBefore(saisie, bouton);
      saisie.focus();
      saisie.select();

      function fermer(valider){
        if (valider) {
          var n = borne(saisie.value);
          champ.value = n;
          // On garde une fourchette cohérente sans écraser la saisie
          if (estMin && Number(n) > Number(autre.value)) { autre.value = n; }
          if (!estMin && Number(n) < Number(autre.value)) { autre.value = n; }
        }
        saisie.remove();
        bouton.style.display = '';
        bouton.dataset.ouvert = '0';
        dessiner();
      }

      saisie.addEventListener('keydown', function(e){
        if (e.key === 'Enter')  { e.preventDefault(); fermer(true); }
        if (e.key === 'Escape') { e.preventDefault(); fermer(false); }
      });
      saisie.addEventListener('blur', function(){ fermer(true); });
    });
  }

  saisir(tMin, vMin, vMax, true);
  saisir(tMax, vMax, vMin, false);

  dessiner();
}

/* ---------- Aperçu d'image avant envoi ---------- */
function previewImg(input, targetId){
  var img = document.getElementById(targetId);
  if (!img || !input.files || !input.files[0]) return;
  var r = new FileReader();
  r.onload = function(ev){ img.src = ev.target.result; img.classList.add('on'); };
  r.readAsDataURL(input.files[0]);
}

/* ---------- Avancement : la barre suit le statut ---------- */
(function(){
  var sel  = document.getElementById('statut');
  var num  = document.getElementById('avancement');
  var auto = document.getElementById('avancement_auto');
  if (!sel || !num || !auto) return;

  var TABLE = {
    nouveau: 0, analyse: 10, attribue: 15,
    en_cours: 50, livraison: 85, termine: 100, annule: 0
  };

  // Au chargement : si la valeur affichée ne correspond pas au statut,
  // c'est qu'elle a été fixée à la main. On respecte ce choix.
  var attendu = TABLE[sel.value];
  if (attendu !== undefined && parseInt(num.value, 10) !== attendu) {
    auto.checked = false;
  }

  function appliquer(){
    if (!auto.checked) return;
    var v = TABLE[sel.value];
    if (v !== undefined) { num.value = v; }
  }

  function refleter(){
    num.readOnly = auto.checked;
    num.style.opacity = auto.checked ? '.6' : '1';
  }

  sel.addEventListener('change', appliquer);
  auto.addEventListener('change', function(){ refleter(); appliquer(); });
  // L'utilisateur tape une valeur : il reprend la main.
  num.addEventListener('input', function(){ if (!num.readOnly) auto.checked = false; refleter(); });

  refleter();
})();

/* ------------------------------------------------------------------
 * Mesure d'audience : enregistrement des clics significatifs.
 * Envoi non bloquant (sendBeacon) : la navigation n'est jamais retardée.
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  function libelle(el) {
    var t = el.getAttribute('data-suivi')
         || el.getAttribute('aria-label')
         || (el.textContent || '').trim().replace(/\s+/g, ' ');
    if (!t && el.tagName === 'A') { t = el.getAttribute('href') || 'lien'; }
    return t.slice(0, 120) || el.tagName.toLowerCase();
  }

  function envoyer(type, cible, detail) {
    try {
      var d = new FormData();
      d.append('type', type);
      d.append('cible', cible);
      d.append('detail', detail || '');
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/suivi.php', d);
      } else {
        fetch('/suivi.php', { method: 'POST', body: d, keepalive: true }).catch(function () {});
      }
    } catch (e) { /* la mesure ne doit jamais gêner l'utilisateur */ }
  }

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('a, button, [data-suivi]');
    if (!el) { return; }
    if (el.hasAttribute('data-suivi-non')) { return; }

    var type = 'clic';
    if (el.tagName === 'A') {
      var href = el.getAttribute('href') || '';
      if (href.indexOf('mailto:') === 0) { type = 'email'; }
      else if (href.indexOf('tel:') === 0) { type = 'telephone'; }
      else if (/\.(pdf|zip|docx?|xlsx?|csv)(\?|$)/i.test(href)) { type = 'telechargement'; }
      else if (el.hostname && el.hostname !== location.hostname) { type = 'sortie'; }
    } else if (el.type === 'submit') {
      type = 'formulaire';
    }
    envoyer(type, libelle(el), location.pathname);
  }, true);
})();

/* ------------------------------------------------------------------
 * Application installable sur téléphone.
 * ------------------------------------------------------------------
 * Elle n'est proposée que si la page porte <meta name="app-installable">,
 * posée par le serveur uniquement pour les personnes autorisées.
 * Sinon, on retire ce qui aurait pu être installé auparavant : sans
 * cela, un visiteur ayant déjà reçu le service worker le garderait
 * indéfiniment.
 * ------------------------------------------------------------------ */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) { return; }

  var autorise = !!document.querySelector('meta[name="app-installable"]');

  if (!autorise) {
    navigator.serviceWorker.getRegistrations().then(function (liste) {
      liste.forEach(function (r) { r.unregister(); });
    }).catch(function () {});
    if (window.caches && caches.keys) {
      caches.keys().then(function (noms) {
        noms.forEach(function (n) {
          if (n.indexOf('missiona-') === 0) { caches.delete(n); }
        });
      }).catch(function () {});
    }
    return;
  }

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });

  // Android déclenche cet événement quand l'installation est possible
  var invite = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    invite = e;
    if (sessionStorage.getItem('installMasque') === '1') { return; }
    afficherBandeau();
  });

  function afficherBandeau() {
    if (document.getElementById('bandeau-install')) { return; }
    var d = document.createElement('div');
    d.id = 'bandeau-install';
    d.className = 'bandeau-install';
    d.innerHTML =
      '<span>Installer Missiona sur votre téléphone</span>' +
      '<button type="button" data-suivi-non id="btn-install">Installer</button>' +
      '<button type="button" data-suivi-non id="btn-install-non" aria-label="Fermer">&times;</button>';
    document.body.appendChild(d);

    document.getElementById('btn-install').addEventListener('click', function () {
      if (!invite) { return; }
      invite.prompt();
      invite.userChoice.then(function () { invite = null; d.remove(); });
    });
    document.getElementById('btn-install-non').addEventListener('click', function () {
      sessionStorage.setItem('installMasque', '1');
      d.remove();
    });
  }

  window.addEventListener('appinstalled', function () {
    var d = document.getElementById('bandeau-install');
    if (d) { d.remove(); }
  });
})();


/* ------------------------------------------------------------------
 * Notifications sur telephone — activation par l'administrateur.
 * Le bouton n'existe que dans le back-office.
 * ------------------------------------------------------------------ */
(function () {
  'use strict';
  var btn = document.getElementById('btn-notifs');
  if (!btn) { return; }

  var meta = document.querySelector('meta[name="push-cle"]');
  var etat = document.getElementById('etat-notifs');

  function dire(t, err) {
    if (etat) { etat.textContent = t; etat.style.color = err ? '#B42318' : '#067647'; }
  }

  if (!meta || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    btn.disabled = true;
    dire("Ce navigateur ne gère pas les notifications.", true);
    return;
  }

  // La cle VAPID doit etre fournie en octets bruts
  function versOctets(b64) {
    var s = (b64 + '='.repeat((4 - b64.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/');
    var brut = atob(s), t = new Uint8Array(brut.length);
    for (var i = 0; i < brut.length; i++) { t[i] = brut.charCodeAt(i); }
    return t;
  }

  function envoyer(action, endpoint) {
    var d = new FormData();
    d.append('action', action);
    d.append('endpoint', endpoint);
    d.append('csrf', btn.getAttribute('data-csrf') || '');
    return fetch('/push-abonner.php', { method: 'POST', body: d, credentials: 'same-origin' })
      .then(function (r) { return r.json(); });
  }

  // Etat au chargement
  navigator.serviceWorker.ready.then(function (reg) {
    return reg.pushManager.getSubscription();
  }).then(function (ab) {
    if (ab) { btn.textContent = 'Desactiver sur ce telephone'; dire('Notifications actives sur cet appareil.'); }
  }).catch(function () {});

  btn.addEventListener('click', function () {
    btn.disabled = true;
    dire('Patientez...');

    navigator.serviceWorker.ready.then(function (reg) {
      return reg.pushManager.getSubscription().then(function (ab) {

        // Deja abonne : on se desabonne
        if (ab) {
          var url = ab.endpoint;
          return ab.unsubscribe().then(function () {
            return envoyer('desabonner', url);
          }).then(function () {
            btn.textContent = 'Activer sur ce telephone';
            dire('Notifications desactivees sur cet appareil.');
          });
        }

        // Sinon on demande l'autorisation puis on s'abonne
        return Notification.requestPermission().then(function (p) {
          if (p !== 'granted') {
            dire("Autorisation refusee. Reactivez-la dans les reglages du navigateur.", true);
            return;
          }
          return reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: versOctets(meta.getAttribute('content')),
          }).then(function (nouvel) {
            return envoyer('abonner', nouvel.endpoint);
          }).then(function (r) {
            if (r && r.ok) {
              btn.textContent = 'Desactiver sur ce telephone';
              dire('Notifications actives sur cet appareil.');
            } else {
              dire((r && r.erreur) || "Echec de l'abonnement.", true);
            }
          });
        });
      });
    }).catch(function (e) {
      dire('Erreur : ' + (e && e.message ? e.message : 'inconnue'), true);
    }).then(function () { btn.disabled = false; });
  });
})();

/* ------------------------------------------------------------------
 * Aperçu protégé des livrables
 * ------------------------------------------------------------------
 * AVERTISSEMENT : aucune page web ne peut empêcher une capture
 * d'écran. Le système d'exploitation et un appareil photo passeront
 * toujours. Ce qui suit décourage la copie facile et, surtout, appose
 * un filigrane nominatif : une capture qui circule désigne alors
 * celui qui l'a prise.
 * ------------------------------------------------------------------ */
(function () {
  'use strict';
  var boite = document.getElementById('apercu');
  if (!boite) { return; }

  var scene    = document.getElementById('apercuScene');
  var contenu  = document.getElementById('apercuContenu');
  var titre    = document.getElementById('apercuNom');
  var voile    = document.getElementById('apercuVoile');
  var filigrane = boite.querySelector('.apercu-filigrane');
  var ouvert   = false;

  // Le filigrane est construit une fois, en assez d'exemplaires pour
  // couvrir l'écran quelle que soit sa taille.
  (function poserFiligrane(){
    if (!filigrane) { return; }
    var texte = filigrane.dataset.texte || 'Missiona';
    var qui   = filigrane.dataset.qui || '';
    var html  = '';
    for (var i = 0; i < 60; i++) {
      html += '<span>' + texte + (qui ? '<i>' + qui + '</i>' : '') + '</span>';
    }
    filigrane.innerHTML = html;
  })();

  function ouvrir(url, nom) {
    titre.textContent = nom;
    contenu.innerHTML = '';

    var ext = (nom.split('.').pop() || '').toLowerCase();
    var code = ['txt','csv','md','json','js','css','php','py','sh','sql','log',
                'yml','yaml','ini','xml'];

    if (ext === 'pdf') {
      var cadre = document.createElement('iframe');
      cadre.src = url + '#toolbar=0&navpanes=0';   // masque la barre du lecteur
      cadre.setAttribute('title', nom);
      contenu.appendChild(cadre);
    } else if (ext === 'html' || ext === 'htm') {
      // On montre la PAGE rendue, jamais le code : cadre totalement isolé
      // (sandbox sans scripts ni même origine) qui affiche le document.
      var page = document.createElement('iframe');
      page.src = url;
      page.setAttribute('sandbox', '');            // aucun script, origine unique
      page.setAttribute('referrerpolicy', 'no-referrer');
      page.setAttribute('title', nom);
      contenu.appendChild(page);
    } else if (code.indexOf(ext) !== -1) {
      // Code / texte : lecture seule dans la boîte, jamais exécutable.
      var pre = document.createElement('pre');
      pre.className = 'apercu-code';
      pre.textContent = 'Chargement…';
      contenu.appendChild(pre);
      fetch(url).then(function (r) { return r.text(); }).then(function (t) {
        pre.textContent = t;
      }).catch(function () { pre.textContent = 'Aperçu indisponible.'; });
    } else {
      var img = document.createElement('img');
      img.src = url;
      img.alt = nom;
      img.draggable = false;
      contenu.appendChild(img);
    }

    boite.hidden = false;
    boite.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    ouvert = true;
  }

  function fermer() {
    boite.hidden = true;
    boite.setAttribute('aria-hidden', 'true');
    contenu.innerHTML = '';          // libère le document de la mémoire
    document.body.style.overflow = '';
    ouvert = false;
  }

  // Livrables d'un projet
  document.querySelectorAll('[data-apercu]').forEach(function (b) {
    b.addEventListener('click', function () {
      ouvrir('/download?id=' + encodeURIComponent(b.getAttribute('data-apercu')) + '&vue=1',
             b.getAttribute('data-nom') || 'Document');
    });
  });
  // Pièces jointes des conversations
  document.querySelectorAll('[data-apercu-msg]').forEach(function (b) {
    b.addEventListener('click', function () {
      ouvrir('/message-fichier.php?id=' + encodeURIComponent(b.getAttribute('data-apercu-msg')) + '&vue=1',
             b.getAttribute('data-nom') || 'Document');
    });
  });

  var btnFermer = document.getElementById('apercuFermer');
  if (btnFermer) { btnFermer.addEventListener('click', fermer); }
  boite.addEventListener('click', function (e) { if (e.target === boite || e.target === scene) { fermer(); } });
  document.addEventListener('keydown', function (e) { if (ouvert && e.key === 'Escape') { fermer(); } });

  /* ---- Freins à la copie ---- */

  // Menu contextuel et glisser-déposer désactivés sur le document
  boite.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  boite.addEventListener('dragstart',   function (e) { e.preventDefault(); });

  // Le document est masqué dès que la fenêtre passe en arrière-plan :
  // beaucoup d'outils de capture déclenchent cette perte de focus.
  function masquer(v) { if (voile) { voile.hidden = !v; } }
  document.addEventListener('visibilitychange', function () {
    if (ouvert) { masquer(document.hidden); }
  });
  window.addEventListener('blur',  function () { if (ouvert) { masquer(true); } });
  window.addEventListener('focus', function () { if (ouvert) { masquer(false); } });

  // Impression et raccourcis de copie : refusés pendant l'aperçu
  document.addEventListener('keydown', function (e) {
    if (!ouvert) { return; }
    var k = (e.key || '').toLowerCase();
    if (e.key === 'PrintScreen') { masquer(true); setTimeout(function(){ masquer(false); }, 1200); }
    if ((e.ctrlKey || e.metaKey) && (k === 'p' || k === 's' || k === 'c')) { e.preventDefault(); }
  });
  window.addEventListener('beforeprint', function () { if (ouvert) { fermer(); } });
})();


/* Nom du document joint, affiché avant l'envoi du message. */
(function () {
  'use strict';
  var champ = document.getElementById('chatPiece');
  if (!champ) { return; }
  champ.addEventListener('change', function () {
    var lbl = champ.closest('.chat-joindre');
    if (!lbl) { return; }
    var f = champ.files && champ.files[0];
    lbl.classList.toggle('chargee', !!f);
    lbl.title = f ? 'Joint : ' + f.name : 'Joindre un document';
  });
})();
