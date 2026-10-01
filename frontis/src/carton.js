// carton.js : le plan d'ouverture et le plan de fin FRONTIS (le même carton), en plusieurs styles.
//   ouverture : la maison du logo se construit (le tracé vert monte du sol, le trait orange du toit se pose), FRONTIS
//               surgit, puis les savoir-faire ; ensuite le film prend le relais.
//   fin : le même carton se construit sur la dernière image du film, tient, puis fondu au noir.
// Styles :
//   creme   carton sur fond crème ; le monteur fait le fondu enchaîné avec le film ;
//   portail carton sur fond ardoise pris dans les tons du portail : le fondu enchaîné vers le premier plan ne se voit pas ;
//   image   logo incrusté sur le film, un halo sombre derrière lui pour qu'il se lise ;
//   flou    logo incrusté sur le film flouté au montage, sous un voile sombre uniforme.
// En incrustation, le logo de l'ouverture s'efface tout seul sur le film, et la fin descend elle-même au noir.
// Chaque image est une fonction pure du temps : on peut les rendre dans le désordre et en parallèle.
const PLANS = {
  intro: { nom: 'OUVERTURE', dur: 5.0, debut: 0.35, sortie: [4.2, 5.0] },
  fin: { nom: 'FIN', dur: 7.0, debut: 0.75, noir: [6.0, 7.0] },
};
const STYLES = {
  creme: { fond: 'creme' },
  portail: { fond: 'portail', clair: true },
  image: { clair: true, voile: 'halo' },
  flou: { clair: true, voile: 'plein', sansOmbre: true },   // le voile suffit ; l'ombre doublerait le poids des fichiers
};
const SAVOIR_FAIRE = ['Ravalement traditionnel', 'Isolation thermique par l’extérieur', 'Couverture'];
const COULEURS = { creme: '#F3EFE4', texte: '#333333', orange: '#EA6B49', clair: '#FFFFFF' };   // crème de la charte ; gris et orange du logo
const FONTE = '"Barlow Condensed"';
const W = 1920, H = 1080, CY = 410, LARGEUR_LOGO = 900;   // maquette 1920 × 1080 (rendu jusqu'en 4K) ; CY = centre du logo

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeInOut = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const backOut = (x, s = 1.4) => { x = clamp(x) - 1; return 1 + (s + 1) * x * x * x + s * x * x; };

let CAN, G, K, E, LOGO;                                       // E : unités de logo → pixels de maquette

// Capitales espacées lettre à lettre. Le crénage est perdu, ce qui ne se voit pas sur des capitales très espacées.
function largeurEspacee(g, txt, esp) { let w = 0; for (const ch of txt) w += g.measureText(ch).width + esp; return w - esp; }
function texteEspace(g, txt, x, y, esp) { for (const ch of txt) { g.fillText(ch, x, y); x += g.measureText(ch).width + esp; } }

function fond(g, type) {
  if (type === 'creme') {
    g.fillStyle = COULEURS.creme; g.fillRect(0, 0, W, H);
    const r = g.createRadialGradient(W / 2, CY + 60, 80, W / 2, CY + 60, 1250);
    r.addColorStop(0, 'rgba(255, 253, 247, .4)'); r.addColorStop(.5, 'rgba(255, 253, 247, 0)'); r.addColorStop(1, 'rgba(110, 92, 60, .07)');
    g.fillStyle = r;
  } else {                                                    // ardoise du portail, éclairée au centre
    const r = g.createRadialGradient(W / 2, CY + 70, 40, W / 2, CY + 70, 1300);
    r.addColorStop(0, '#34444F'); r.addColorStop(.55, '#222D35'); r.addColorStop(1, '#10161B');
    g.fillStyle = r;
  }
  g.fillRect(0, 0, W, H);
}

// Assombrit le film derrière le logo incrusté : halo diffus autour du carton, ou voile uniforme.
function voile(type, k) {
  if (k <= 0) return;
  if (type === 'plein') { G.fillStyle = `rgba(0, 0, 0, ${.32 * k})`; G.fillRect(0, 0, W, H); return; }
  G.save(); G.translate(W / 2, CY + 70); G.scale(1, .5);
  const r = G.createRadialGradient(0, 0, 0, 0, 0, 900);
  r.addColorStop(0, `rgba(0, 0, 0, ${.55 * k})`); r.addColorStop(.6, `rgba(0, 0, 0, ${.3 * k})`); r.addColorStop(1, 'rgba(0, 0, 0, 0)');
  G.fillStyle = r; G.fillRect(-1000, -1000, 2000, 2000);
  G.restore();
}

// Ombre douce sous le logo clair, pour qu'il se détache du film. shadowBlur ne suit pas l'échelle du canvas : × K.
function ombre(on) {
  G.shadowColor = on ? 'rgba(0, 0, 0, .4)' : 'transparent';
  G.shadowBlur = on ? 22 * K : 0; G.shadowOffsetY = on ? 3 * K : 0;
}

// Pose un calque du logo (décalé de dy vers le bas), avec l'opacité a.
function poser(c, dy, a) {
  if (a <= 0 || !c.w || !c.h) return;
  G.globalAlpha = a; G.drawImage(c.img, c.x, c.y + dy, c.w, c.h); G.globalAlpha = 1;
}

// Fait surgir un calque de derrière une ligne invisible (son bord bas), comme un rang de maçonnerie qui monte.
function surgir(c, k, a) {
  if (k <= 0 || a <= 0) return;
  const e = easeOut(k);
  G.save(); G.beginPath(); G.rect(c.x - 20, c.y - 40, c.w + 40, c.h + 40); G.clip();
  poser(c, (c.h + 6) * (1 - e), a * clamp(e * 2.5));
  G.restore();
}

// Le carton à l'instant s (secondes depuis le début de la construction), opacité générale a ; clair : logo sur fond sombre.
function carton(s, a, clair, ombrer) {
  const L = LOGO.calques;
  ombre(ombrer);
  G.save(); G.translate(W / 2 - LOGO.w * E / 2, CY - LOGO.h * E / 2); G.scale(E, E);   // repère du logo

  // 1. le tracé vert monte depuis le sol, comme une maçonnerie
  const km = easeOut(seg(s, 0, .7));
  if (km > 0) {
    const m = L.murs, hv = (m.h + 2) * km;
    G.save(); G.beginPath(); G.rect(m.x - 4, m.y + m.h + 1 - hv, m.w + 8, hv); G.clip(); poser(m, 0, a); G.restore();
  }
  // 2. le trait orange du toit se pose, avec un petit rebond
  const kt = seg(s, .55, 1.15);
  if (kt > 0) poser(L.toit, -64 * (1 - backOut(kt)), a * easeOut(seg(s, .55, .75)));
  // 3. FRONTIS surgit de sa ligne de base (la signature du logo laisse la place aux savoir-faire)
  surgir(clair ? L.motClair : L.mot, seg(s, 1.05, 1.75), a);
  G.restore();

  // 4. un filet orange s'ouvre depuis le centre, puis les savoir-faire surgissent un par un, une ligne chacun
  const yFilet = CY + LOGO.h * E / 2 + 58, yTexte = yFilet + 62, interligne = 52;
  const kf = easeInOut(seg(s, 1.7, 2.2));
  if (kf > 0) { G.globalAlpha = a; G.fillStyle = COULEURS.orange; const lw = 76 * kf; G.fillRect(W / 2 - lw / 2, yFilet - 1.5, lw, 3); G.globalAlpha = 1; }
  G.font = `600 36px ${FONTE}`;
  const esp = 7, cap = G.measureText('H').actualBoundingBoxAscent;
  SAVOIR_FAIRE.forEach((txt, i) => {
    const e = easeOut(seg(s, 2.0 + i * .3, 2.6 + i * .3));
    if (e <= 0) return;
    txt = txt.toUpperCase();
    const l = largeurEspacee(G, txt, esp), x = W / 2 - l / 2, y = yTexte + i * interligne;
    G.save(); G.beginPath(); G.rect(x - 10, y - cap - 20, l + 20, cap + 26); G.clip();
    G.globalAlpha = a * clamp(e * 2.5); G.fillStyle = clair ? COULEURS.clair : COULEURS.texte;
    texteEspace(G, txt, x, y + (cap + 8) * (1 - e), esp);
    G.restore();
  });
  ombre(false);
}

// Peint l'image du plan au temps t, dans le style demandé.
function image(plan, t, style = 'creme') {
  const P = PLANS[plan], S = STYLES[style], s = t - P.debut;
  G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = 1; G.globalCompositeOperation = 'source-over'; ombre(false);
  G.clearRect(0, 0, CAN.width, CAN.height);
  G.setTransform(K, 0, 0, K, 0, 0);
  if (S.fond) fond(G, S.fond);
  const a = !S.fond && P.sortie ? 1 - easeInOut(seg(t, P.sortie[0], P.sortie[1])) : 1;   // incrusté : s'efface sur le film
  if (S.voile) voile(S.voile, easeInOut(seg(s, -.3, .9)) * a);
  const z = 1 + .025 * easeInOut(t / P.dur);                                   // très lente poussée vers le logo
  G.setTransform(K * z, 0, 0, K * z, CAN.width / 2 * (1 - z), CAN.height / 2 * (1 - z));
  carton(s, a, S.clair, S.clair && !S.sansOmbre);
  const noir = P.noir ? easeInOut(seg(t, P.noir[0], P.noir[1])) : 0;
  if (noir > 0) { G.setTransform(1, 0, 0, 1, 0, 0); G.fillStyle = `rgba(0, 0, 0, ${noir})`; G.fillRect(0, 0, CAN.width, CAN.height); }
}

// ---------- branchements : rendu hors écran (render.mjs) et studio interactif ----------
window.renderAt = (plan, t, style, type = 'image/png', q) => { image(plan, t, style); return CAN.toDataURL(type, q); };
window.renderSheet = (plan, style, times, cols = 3, cell = 640) => {
  const ch = Math.round(cell * 9 / 16), pad = 6, rows = Math.ceil(times.length / cols), damier = !STYLES[style].fond;
  const S = document.createElement('canvas'); S.width = cols * cell + (cols + 1) * pad; S.height = rows * ch + (rows + 1) * pad;
  const g = S.getContext('2d'); g.fillStyle = '#6b6b6b'; g.fillRect(0, 0, S.width, S.height);
  times.forEach((t, i) => {
    const x = pad + (i % cols) * (cell + pad), y = pad + Math.floor(i / cols) * (ch + pad);
    if (damier) for (let a = 0; a < cell; a += 16) for (let b = 0; b < ch; b += 16) { g.fillStyle = ((a + b) / 16) % 2 ? '#8a8a8a' : '#9c9c9c'; g.fillRect(x + a, y + b, Math.min(16, cell - a), Math.min(16, ch - b)); }
    image(plan, t, style); g.drawImage(CAN, x, y, cell, ch);
    g.fillStyle = '#E8473B'; g.font = 'bold 15px sans-serif'; g.fillText(`${plan} ${style} ${t.toFixed(2)} s`, x + 8, y + ch - 10);
  });
  return S.toDataURL('image/jpeg', .9);
};

// Version blanche du mot FRONTIS, pour les fonds sombres et le film.
function blanchir(c) {
  const out = document.createElement('canvas'); out.width = c.img.width; out.height = c.img.height;
  const g = out.getContext('2d'); g.drawImage(c.img, 0, 0);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = COULEURS.clair; g.fillRect(0, 0, out.width, out.height);
  return { ...c, img: out };
}

(async () => {
  const q = new URLSearchParams(location.search), w = +(q.get('w') || 1920);
  CAN = document.getElementById('out'); CAN.width = w; CAN.height = Math.round(w * 9 / 16);
  G = CAN.getContext('2d'); K = CAN.width / W;
  if (!(await document.fonts.load(`600 100px ${FONTE}`)).length) throw new Error('police introuvable : vérifier assets/fonts/');
  E = LARGEUR_LOGO / (await chargerLogo(1)).w;                                  // le logo occupe LARGEUR_LOGO de large
  LOGO = await chargerLogo(K * E * 1.05);                                       // calques nets, avec une marge pour la poussée
  LOGO.calques.motClair = blanchir(LOGO.calques.mot);
  window.PLANS = PLANS; window.STYLES = STYLES; window.ready = true;

  // studio : choix du plan et du style, curseur de temps, lecture
  const $ = id => document.getElementById(id), plan = $('plan'), style = $('style'), scrub = $('scrub'), tt = $('tt'), lire = $('lire');
  if (!plan) return;
  const maj = () => { scrub.max = PLANS[plan.value].dur - 1 / 25; image(plan.value, +scrub.value, style.value); tt.textContent = `${(+scrub.value).toFixed(2)} s`; };
  [plan, style, scrub].forEach(e => e.addEventListener('input', maj));
  let t0 = null;
  const boucle = now => { if (t0 === null) return; const t = (now - t0) / 1000; if (t >= PLANS[plan.value].dur) { t0 = null; lire.textContent = 'Lecture'; return; } scrub.value = t; maj(); requestAnimationFrame(boucle); };
  lire.addEventListener('click', () => { if (t0 === null) { t0 = performance.now(); lire.textContent = 'Stop'; requestAnimationFrame(boucle); } else { t0 = null; lire.textContent = 'Lecture'; } });
  maj();
})();
