// carton.js : le plan d'ouverture et le plan de fin FRONTIS, qui sont le même carton.
//   ouverture : fond crème, les murs de la maison montent, le toit se pose, FRONTIS se révèle, puis les savoir-faire ;
//               le carton tient pour laisser la place au fondu enchaîné vers la première image du film.
//   fin : quelques images de fond crème dans lesquelles le film vient se fondre, le même carton se construit,
//         tient, puis fondu au noir.
// Chaque image est une fonction pure du temps : on peut les rendre dans le désordre et en parallèle.
const PLANS = {
  intro: { nom: 'OUVERTURE', dur: 5.0, debut: 0.35 },
  fin: { nom: 'FIN', dur: 7.0, debut: 0.75, noir: [6.0, 7.0] },
};
const SAVOIR_FAIRE = ['Enduits à la chaux', 'Couverture & zinguerie'];
const W = 1920, H = 1080, CY = 450, E = 1.18;   // maquette en 1920 × 1080 (rendu réel jusqu'en 4K) ; CY = centre du logo, E = échelle du logo

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeInOut = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const backOut = (x, s = 1.4) => { x = clamp(x) - 1; return 1 + (s + 1) * x * x * x + s * x * x; };

let CAN, G, K, LOGO;

function fond(g) {
  g.fillStyle = CHARTE.creme; g.fillRect(0, 0, W, H);
  const r = g.createRadialGradient(W / 2, CY + 60, 80, W / 2, CY + 60, 1250);
  r.addColorStop(0, 'rgba(255, 253, 247, .4)'); r.addColorStop(.5, 'rgba(255, 253, 247, 0)'); r.addColorStop(1, 'rgba(110, 92, 60, .07)');
  g.fillStyle = r; g.fillRect(0, 0, W, H);
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

function losange(x, y, k, a) {
  if (k <= 0) return;
  const r = 6.5 * backOut(k, 2.2);
  G.globalAlpha = a; G.fillStyle = CHARTE.orange;
  G.beginPath(); G.moveTo(x, y - r); G.lineTo(x + r, y); G.lineTo(x, y + r); G.lineTo(x - r, y); G.closePath(); G.fill();
  G.globalAlpha = 1;
}

// Le carton à l'instant s (secondes depuis le début de la construction), opacité générale a.
function carton(s, a) {
  const L = LOGO.calques;
  G.save(); G.translate(W / 2 - LOGO.w * E / 2, CY - LOGO.h * E / 2); G.scale(E, E);   // repère du logo

  // 1. les murs montent depuis le sol, comme une maçonnerie
  const km = easeOut(seg(s, 0, .7));
  if (km > 0) {
    const m = L.murs, hv = (m.h + 2) * km;
    G.save(); G.beginPath(); G.rect(m.x - 4, m.y + m.h + 1 - hv, m.w + 8, hv); G.clip(); poser(m, 0, a); G.restore();
  }
  // 2. le toit se pose, avec un petit rebond
  const kt = seg(s, .55, 1.15);
  if (kt > 0) poser(L.toit, -64 * (1 - backOut(kt)), a * easeOut(seg(s, .55, .75)));
  // 3. FRONTIS surgit de sa ligne de base, puis la signature du logo
  surgir(L.mot, seg(s, 1.05, 1.75), a);
  surgir(L.signature, seg(s, 1.4, 2.05), a);
  G.restore();

  // 4. un filet orange s'ouvre depuis le centre, puis les savoir-faire arrivent un par un
  const yFilet = CY + LOGO.h * E / 2 + 72, yTexte = yFilet + 68;
  const kf = easeInOut(seg(s, 2.1, 2.6));
  if (kf > 0) { G.globalAlpha = a; G.fillStyle = CHARTE.orange; const lw = 76 * kf; G.fillRect(W / 2 - lw / 2, yFilet - 1.5, lw, 3); G.globalAlpha = 1; }
  G.font = `600 42px ${FONTES.sous}`;
  const esp = 9, ecart = 38, cap = G.measureText('H').actualBoundingBoxAscent;
  const items = SAVOIR_FAIRE.map(t => t.toUpperCase()), larg = items.map(t => largeurEspacee(G, t, esp));
  let x = W / 2 - (larg.reduce((p, q) => p + q, 0) + (items.length - 1) * 2 * ecart) / 2;
  items.forEach((txt, i) => {
    const t0 = 2.45 + i * .3, e = easeOut(seg(s, t0, t0 + .6));
    if (e > 0) {                                                                 // surgit de sa ligne de base, lui aussi
      G.save(); G.beginPath(); G.rect(x - 10, yTexte - cap - 30, larg[i] + 20, cap + 36); G.clip();
      G.globalAlpha = a * clamp(e * 2.5); G.fillStyle = CHARTE.vertFonce; texteEspace(G, txt, x, yTexte + (cap + 8) * (1 - e), esp);
      G.restore();
    }
    x += larg[i];
    if (i < items.length - 1) { x += ecart; losange(x, yTexte - cap / 2, seg(s, t0 + .2, t0 + .5), a); x += ecart; }
  });
}

function mentionProvisoire() {
  G.setTransform(K, 0, 0, K, 0, 0); G.globalAlpha = 1;
  G.font = `600 20px ${FONTES.sous}`; G.fillStyle = CHARTE.orange;
  texteEspace(G, 'LOGO PROVISOIRE · EN ATTENTE DU FICHIER OFFICIEL', 48, 64, 3);
}

// Peint l'image du plan au temps t. mode : 'plein' (fond crème, fondu au noir) ou 'alpha' (fond transparent).
function image(plan, t, mode = 'plein') {
  const P = PLANS[plan];
  G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = 1; G.globalCompositeOperation = 'source-over';
  G.clearRect(0, 0, CAN.width, CAN.height);
  if (mode === 'plein') { G.setTransform(K, 0, 0, K, 0, 0); fond(G); }
  const z = 1 + .025 * easeInOut(t / P.dur);                                   // très lente poussée vers le logo
  G.setTransform(K * z, 0, 0, K * z, CAN.width / 2 * (1 - z), CAN.height / 2 * (1 - z));
  const noir = P.noir ? easeInOut(seg(t, P.noir[0], P.noir[1])) : 0;
  carton(t - P.debut, mode === 'alpha' ? 1 - noir : 1);
  if (mode === 'plein' && noir > 0) { G.setTransform(1, 0, 0, 1, 0, 0); G.fillStyle = `rgba(0, 0, 0, ${noir})`; G.fillRect(0, 0, CAN.width, CAN.height); }
  if (LOGO.provisoire) mentionProvisoire();
}

// ---------- branchements : rendu hors écran (render.mjs) et studio interactif ----------
window.renderAt = (plan, t, mode, type = 'image/png', q) => { image(plan, t, mode); return CAN.toDataURL(type, q); };
window.renderSheet = (plan, mode, times, cols = 3, cell = 640) => {
  const ch = Math.round(cell * 9 / 16), pad = 6, rows = Math.ceil(times.length / cols);
  const S = document.createElement('canvas'); S.width = cols * cell + (cols + 1) * pad; S.height = rows * ch + (rows + 1) * pad;
  const g = S.getContext('2d'); g.fillStyle = '#6b6b6b'; g.fillRect(0, 0, S.width, S.height);
  times.forEach((t, i) => {
    const x = pad + (i % cols) * (cell + pad), y = pad + Math.floor(i / cols) * (ch + pad);
    if (mode === 'alpha') for (let a = 0; a < cell; a += 16) for (let b = 0; b < ch; b += 16) { g.fillStyle = ((a + b) / 16) % 2 ? '#bbb' : '#ddd'; g.fillRect(x + a, y + b, Math.min(16, cell - a), Math.min(16, ch - b)); }
    image(plan, t, mode); g.drawImage(CAN, x, y, cell, ch);
    g.fillStyle = '#E8473B'; g.font = 'bold 15px sans-serif'; g.fillText(`${plan} ${t.toFixed(2)} s`, x + 8, y + ch - 10);
  });
  return S.toDataURL('image/jpeg', .9);
};

(async () => {
  const q = new URLSearchParams(location.search), w = +(q.get('w') || 1920);
  CAN = document.getElementById('out'); CAN.width = w; CAN.height = Math.round(w * 9 / 16);
  G = CAN.getContext('2d'); K = CAN.width / W;
  const fontes = await Promise.all([`100px ${FONTES.titre}`, `600 100px ${FONTES.sous}`].map(f => document.fonts.load(f)));
  if (fontes.some(f => !f.length)) throw new Error('police introuvable : vérifier assets/fonts/');
  LOGO = await chargerLogo(K * E * 1.05);                                      // un peu de marge pour la poussée
  window.PLANS = PLANS; window.ready = true;

  // studio : choix du plan et du fond, curseur de temps, lecture
  const $ = id => document.getElementById(id), plan = $('plan'), mode = $('mode'), scrub = $('scrub'), tt = $('tt'), lire = $('lire');
  if (!plan) return;
  const maj = () => { scrub.max = PLANS[plan.value].dur - 1 / 25; image(plan.value, +scrub.value, mode.value); tt.textContent = `${(+scrub.value).toFixed(2)} s`; };
  [plan, mode, scrub].forEach(e => e.addEventListener('input', maj));
  let t0 = null;
  const boucle = now => { if (t0 === null) return; const t = (now - t0) / 1000; if (t >= PLANS[plan.value].dur) { t0 = null; lire.textContent = 'Lecture'; return; } scrub.value = t; maj(); requestAnimationFrame(boucle); };
  lire.addEventListener('click', () => { if (t0 === null) { t0 = performance.now(); lire.textContent = 'Stop'; requestAnimationFrame(boucle); } else { t0 = null; lire.textContent = 'Lecture'; } });
  maj();
})();
