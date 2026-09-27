// Lecteur interactif : chapitres, bulles « En savoir plus », quiz « ciment ou chaux ? » et écran de fin.
// Tout le contenu (temps, textes, liens) vient de cues.js.
(() => {
  const C = CUES, $ = id => document.getElementById(id);
  const video = $('vc-video'), player = $('vc-lecteur'), stage = $('vc-stage'), bar = $('vc-bar');
  const DUR = C.duree, integre = window.self !== window.top || /[?&]integre\b/.test(location.search);
  if (integre) {
    document.body.classList.add('vc-integre');
    // intégré dans une iframe : on donne sa hauteur à la page parente pour qu'elle ajuste le cadre
    // hauteur réelle du contenu (scrollHeight ne descend jamais sous la hauteur actuelle du cadre)
    const dire = () => parent.postMessage({ videoChauxHauteur: Math.ceil(document.querySelector('.vc').getBoundingClientRect().bottom) + 4 }, '*');
    new ResizeObserver(dire).observe(document.querySelector('.vc')); addEventListener('load', dire);
  }

  // Vidéo 1080p quand le lecteur est affiché en grand (ordinateur), 720p sinon (plus légère sur mobile et tablette)
  const grand = window.innerWidth >= 900;
  video.src = grand ? 'media/chaux-1080.mp4' : 'media/chaux-720.mp4';
  // si une des deux qualités manque sur le serveur, on bascule sur l'autre
  video.addEventListener('error', () => { video.src = video.src.includes('1080') ? 'media/chaux-720.mp4' : 'media/chaux-1080.mp4'; if (started) video.play().catch(() => {}); }, { once: true });

  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let started = false, quizAnswered = false, overlay = null, resumeAfter = false;

  // ---------- chapitres et barre de progression ----------
  const chapBtns = C.chapitres.map(ch => {
    const b = el('button', 'vc-chap', `<b>${esc(ch.titre)}</b><small>${fmt(ch.debut)}</small>`);
    b.type = 'button'; b.addEventListener('click', () => seek(ch.debut + .01, true));
    $('vc-chapitres').append(b); return b;
  });
  const segs = C.chapitres.map(ch => {
    const s = el('div', 'vc-seg'); s.style.left = `calc(${ch.debut / DUR * 100}% + 2px)`; s.style.width = `calc(${(ch.fin - ch.debut) / DUR * 100}% - 4px)`;
    s.title = ch.titre; s.append(el('i')); bar.append(s); return s;
  });
  const qm = el('div', 'vc-quiz-mark', '?'); qm.style.left = `${C.quiz.t / DUR * 100}%`; bar.append(qm);
  const knob = el('div', 'vc-knob'); bar.append(knob);

  // ---------- bulles ----------
  const spots = C.bulles.map(b => {
    const h = el('button', 'vc-hotspot', `<span class="vc-dot" aria-hidden="true">+</span><span class="vc-hint">En savoir plus</span>`);
    h.type = 'button'; h.setAttribute('aria-label', `En savoir plus : ${b.titre}`); h.tabIndex = -1;
    h.style.left = b.x + '%'; h.style.top = b.y + '%';
    h.addEventListener('click', e => { e.stopPropagation(); ouvrirFiche(b); });
    $('vc-hotspots').append(h); return h;
  });

  // ---------- fenêtres ----------
  const etroit = () => $('vc-ecran').clientWidth <= 560;                   // la fenêtre s'affiche alors sous la vidéo
  function montrer(layer, focusEl) {
    overlay = layer; layer.hidden = false; requestAnimationFrame(() => layer.classList.add('on'));
    if (focusEl) setTimeout(() => focusEl.focus({ preventScroll: true }), 60);
    if (etroit()) setTimeout(() => layer.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 80);
  }
  function cacher(layer) { layer.classList.remove('on'); setTimeout(() => { layer.hidden = true; }, 250); if (overlay === layer) overlay = null; }

  function ouvrirFiche(b) {
    resumeAfter = !video.paused; video.pause();
    $('vc-fiche-titre').textContent = b.titre; $('vc-fiche-texte').textContent = b.texte;
    montrer($('vc-fiche'), $('vc-fiche-ok'));
  }
  function fermerFiche() { cacher($('vc-fiche')); if (resumeAfter) video.play(); player.focus({ preventScroll: true }); }
  $('vc-fiche-ok').addEventListener('click', fermerFiche);

  const SEAU = (corps, contenu) => `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 22 L50 22 L46 56 L18 56 Z" fill="${corps}" stroke="#2F2A2E" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="32" cy="22" rx="18" ry="5" fill="${contenu}" stroke="#2F2A2E" stroke-width="2.5"/><path d="M14 24 Q32 -4 50 24" fill="none" stroke="#2F2A2E" stroke-width="2.5"/></svg>`;
  function ouvrirQuiz() {
    video.pause(); video.currentTime = C.quiz.t;
    $('vc-quiz-q').textContent = C.quiz.question; $('vc-quiz-retour').textContent = '';
    const box = $('vc-quiz-choix'); box.innerHTML = '';
    C.quiz.choix.forEach(c => {
      const b = el('button', null, (c.id === 'chaux' ? SEAU('#F2EEE6', '#FFFFFF') : SEAU('#9AA0A4', '#7C8387')) + `<span>${esc(c.texte)}</span>`);
      b.type = 'button';
      b.addEventListener('click', () => {
        if (quizAnswered) return;
        quizAnswered = true;
        box.querySelectorAll('button').forEach(x => x.disabled = true);
        b.classList.add(c.id === 'chaux' ? 'bon' : 'faux');
        $('vc-quiz-retour').textContent = c.retour;
        setTimeout(() => { cacher($('vc-quiz')); video.play(); }, 2200);
      });
      box.append(b);
    });
    montrer($('vc-quiz'), box.querySelector('button'));
  }

  // ---------- écran de fin ----------
  const fin = $('vc-end');
  C.fin.boutons.forEach(bt => {
    let b;
    if (bt.lien) { b = el('a', 'vc-btn' + (bt.principal ? '' : ' vc-sec'), esc(bt.texte)); b.href = bt.lien; if (integre) b.target = '_top'; }
    else { b = el('button', 'vc-btn vc-sec', esc(bt.texte)); b.type = 'button'; }
    if (bt.action === 'revoir') b.addEventListener('click', () => { quizAnswered = false; seek(0, true); });
    fin.append(b);
  });
  function montrerFin() { fin.hidden = false; requestAnimationFrame(() => fin.classList.add('on')); }
  function cacherFin() { fin.classList.remove('on'); fin.hidden = true; }

  // ---------- lecture ----------
  function demarrer() { if (!started) { started = true; $('vc-start').hidden = true; } video.play().catch(() => {}); }
  function seek(t, jouer) {
    t = Math.max(0, Math.min(DUR - .05, t));
    if (overlay) cacher(overlay);
    cacherFin();
    video.currentTime = t;
    if (jouer) demarrer();
    maj();
  }
  function basculer() { if (overlay) return; if (video.paused || video.ended) { if (video.ended) seek(0); demarrer(); } else video.pause(); }
  $('vc-start').addEventListener('click', demarrer);
  video.addEventListener('click', basculer);
  $('vc-play').addEventListener('click', basculer);
  video.addEventListener('play', () => { cacherFin(); icones(); });
  video.addEventListener('pause', icones);
  video.addEventListener('ended', () => { icones(); montrerFin(); });
  function icones() {
    const p = video.paused;
    $('vc-play').querySelector('.i-play').toggleAttribute('hidden', !p);
    $('vc-play').querySelector('.i-pause').toggleAttribute('hidden', p);
    $('vc-play').setAttribute('aria-label', p ? 'Lecture' : 'Pause');
    const m = video.muted;
    $('vc-son').querySelector('.i-on').toggleAttribute('hidden', m);
    $('vc-son').querySelector('.i-off').toggleAttribute('hidden', !m);
    $('vc-son').setAttribute('aria-label', m ? 'Remettre le son' : 'Couper le son');
  }
  $('vc-son').addEventListener('click', () => { video.muted = !video.muted; icones(); });
  $('vc-plein').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (player.requestFullscreen) player.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  });

  // barre : cliquer ou glisser pour se déplacer
  const tAt = e => { const r = bar.getBoundingClientRect(); return (e.clientX - r.left) / r.width * DUR; };
  bar.addEventListener('pointerdown', e => { bar.setPointerCapture(e.pointerId); seek(tAt(e)); const mv = ev => seek(tAt(ev)); bar.addEventListener('pointermove', mv); bar.addEventListener('pointerup', () => bar.removeEventListener('pointermove', mv), { once: true }); });
  bar.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { seek(video.currentTime + 5); e.preventDefault(); } if (e.key === 'ArrowLeft') { seek(video.currentTime - 5); e.preventDefault(); } });

  // raccourcis clavier
  player.addEventListener('keydown', e => {
    if (e.target.closest('.vc-bar')) return;
    if (e.key === 'Escape' && overlay) { if (overlay === $('vc-fiche')) fermerFiche(); else if (overlay === $('vc-quiz')) { quizAnswered = true; cacher(overlay); video.play(); } return; }
    if (overlay || /^(BUTTON|A)$/.test(e.target.tagName) && (e.key === ' ' || e.key === 'Enter')) return;
    if (e.key === ' ' || e.key === 'k') { basculer(); e.preventDefault(); }
    else if (e.key === 'ArrowRight') seek(video.currentTime + 5);
    else if (e.key === 'ArrowLeft') seek(video.currentTime - 5);
    else if (e.key === 'm') $('vc-son').click();
    else if (e.key === 'f') $('vc-plein').click();
  });

  // ---------- boucle d'affichage ----------
  function maj() {
    const t = video.currentTime || 0;
    C.chapitres.forEach((ch, i) => {
      const k = Math.max(0, Math.min(1, (t - ch.debut) / (ch.fin - ch.debut)));
      segs[i].firstChild.style.width = (k * 100) + '%';
      const on = t >= ch.debut && (t < ch.fin || (i === C.chapitres.length - 1 && t >= ch.fin));
      if (chapBtns[i].classList.contains('on') !== on) { chapBtns[i].classList.toggle('on', on); if (on) chapBtns[i].setAttribute('aria-current', 'step'); else chapBtns[i].removeAttribute('aria-current'); }
    });
    knob.style.left = (t / DUR * 100) + '%';
    bar.setAttribute('aria-valuenow', Math.round(t)); bar.setAttribute('aria-valuetext', `${fmt(t)} sur ${fmt(DUR)}`);
    $('vc-time').textContent = `${fmt(t)} / ${fmt(DUR)}`;
    C.bulles.forEach((b, i) => { const on = started && !overlay && t >= b.debut && t < b.fin; spots[i].classList.toggle('on', on); spots[i].tabIndex = on ? 0 : -1; });
  }
  function boucle() {
    const t = video.currentTime;
    if (!video.paused && !quizAnswered && !overlay && t >= C.quiz.t - .03 && t < C.quiz.t + .6) ouvrirQuiz();
    maj();
    requestAnimationFrame(boucle);
  }
  requestAnimationFrame(boucle);
  icones(); maj();

  // ---------- texte de la vidéo (accessibilité et référencement) ----------
  const corps = $('vc-texte-corps');
  C.chapitres.forEach(ch => {
    corps.append(el('h3', null, esc(ch.titre)));
    C.legendes.filter(l => l[0] >= ch.debut && l[0] < ch.fin).forEach(l => corps.append(el('p', null, esc(l[2]))));
    C.bulles.filter(b => b.debut >= ch.debut && b.debut < ch.fin).forEach(b => corps.append(el('p', 'vc-plus', `<strong>${esc(b.titre)}</strong> ${esc(b.texte)}`)));
    if (ch.id === 'contact') corps.append(el('p', null, esc(C.fin.titre) + '.'));
  });
})();
