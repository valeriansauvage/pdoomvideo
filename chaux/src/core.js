// core.js: constantes, outils de temps, papier, pinceaux, lettrage, calques mis en cache et rendu d'une image.
// Moteur repris de la vidéo « P(doom) » (p5.js + p5.brush), adapté pour une vidéo explicative de 60 s :
// légendes au lieu du karaoké, polices du site, et calques aquarelle peints une seule fois puis réutilisés.
const W = 1920, H = 1080;
const BPM = 96, BEAT = 60 / BPM, OFF = 0, BOIL = 8, DUR = 60;
const TAU = Math.PI * 2;
const PAL = {
  paper: '#F4EDE1', ink: '#2F2A2E', chaux: '#FBF7EF', cream: '#FFF8EC',
  sable: '#E6CD98', ocre: '#D4A35E', ocreDk: '#A8743A', ocreLt: '#EFD6A8',
  tuile: '#C0643F', tuileDk: '#8E4128', tuileLt: '#E08B63',
  pierre: '#CBBEA6', pierreDk: '#998A73', pierreLt: '#E4DACA',
  ciment: '#8E9396', cimentDk: '#626A6F', cimentLt: '#B7BBBD',
  eau: '#6FB1D6', eauDk: '#3F86B0', eauLt: '#C3E3F3',
  sauge: '#95AF80', olive: '#607F4A', ciel: '#C4DEEA', aube: '#F7D9B9',
  rose: '#E39A8B', bois: '#9B6A43', boisDk: '#6B4428', volet: '#7FA3A6', voletDk: '#4F7478', nuit: '#2C3552'
};
// Polices (fichiers locaux dans assets/fonts) : titres, écriture manuscrite pour les annotations, texte courant.
const FONT = { title: '"Fraunces", Georgia, serif', hand: '"Caveat", "Comic Sans MS", cursive', text: '"Nunito", system-ui, sans-serif' };

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => Math.pow(clamp(x), 3);
const backOut = x => { x = clamp(x); const s = 1.7; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const strHash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
// Tremblé du trait, réinitialisé BOIL fois par seconde : le dessin « vit » comme une animation faite main.
const jit = a => (random() * 2 - 1) * a;

// ---------- temps (tout est une fonction pure de t : aucune mémoire d'une image à l'autre) ----------
const bpOf = t => (t - OFF) / BEAT;
const seg = (t, a, b) => clamp((t - a) / (b - a));                 // progression 0..1 de t dans [a, b]
const frac = x => x - Math.floor(x);
const pulse = (t, k = 6) => Math.exp(-frac(bpOf(t)) * k);          // 1 sur chaque temps, puis décroît
// apparition (0→1) puis disparition (1→0) : in(t, a, b) pour [a, b] avec des fondus de d secondes
const inOut = (t, a, b, d = .35) => ease(seg(t, a, a + d)) * (1 - ease(seg(t, b - d, b)));
function mixCol(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = i => Math.round(lerp((pa >> i) & 255, (pb >> i) & 255, clamp(k)));
  return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
}
const shakeXY = (t, amt) => { const f = Math.floor(t * 24); return [(hash(f * 1.7) - .5) * 2 * amt, (hash(f * 2.3 + 9) - .5) * 2 * amt]; };

// ---------- caméra ----------
// camBegin(cx, cy, zoom, rot) : le point (cx, cy) du monde arrive au centre de l'écran. Toujours suivi de camEnd().
let CAM = null;
// Les décors couvrent exactement le cadre : sans rotation et avec zoom ≥ 1, la caméra ne montre jamais au-delà.
function camBegin(cx = W / 2, cy = H / 2, zoom = 1, rot = 0) {
  if (zoom >= 1 && !rot) { cx = clamp(cx, W / 2 / zoom, W - W / 2 / zoom); cy = clamp(cy, H / 2 / zoom, H - H / 2 / zoom); }
  push(); translate(W / 2, H / 2); rotate(rot); scale(zoom); translate(-cx, -cy); CAM = { cx, cy, zoom, rot };
}
function camEnd() { pop(); CAM = null; }
function toScreen(x, y) {
  if (!CAM) return [x, y];
  const c = Math.cos(CAM.rot), s = Math.sin(CAM.rot), dx = (x - CAM.cx) * CAM.zoom, dy = (y - CAM.cy) * CAM.zoom;
  return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c];
}

// ---------- transitions plein cadre (hors caméra) ----------
function irisShape(pts, col = PAL.ink, far = 4000) {
  const n = pts.length; let cx = 0, cy = 0; for (const p of pts) { cx += p[0]; cy += p[1]; } cx /= n; cy /= n;
  const out = p => { const dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy) || 1; return [cx + dx / d * far, cy + dy / d * far]; };
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], ex = (b[0] - a[0]) * .06, ey = (b[1] - a[1]) * .06;
    const a2 = [a[0] - ex, a[1] - ey], b2 = [b[0] + ex, b[1] + ey];
    paint([a2, b2, out(b2), out(a2)], { wash: col, washOp: 255, ink: null });
  }
}
// Transition « tache de peinture » : la nouvelle scène apparaît dans une tache qui s'étend (col autour).
function revealBlob(t, t0, dur, cx, cy, col = PAL.paper, seed = 1) {
  const k = ease(seg(t, t0, t0 + dur)); if (k >= 1) return;
  const r = lerp(30, 1500, Math.pow(k, 1.4)), pts = [];
  for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, q = r * (1 + .14 * Math.sin(a * 5 + seed) + .07 * Math.sin(a * 11 + seed * 2)); pts.push([cx + Math.cos(a) * q * 1.2, cy + Math.sin(a) * q * .8]); }
  irisShape(pts, col);
}

let T = 0, paperG = null, grainC = null, letG = null, outC = null, outX = null;
let LETTERS = [], CAPTION = null;

// ---------- géométrie ----------
function rectPts(x, y, w, h, j = 0) {
  return [[x + jit(j), y + jit(j)], [x + w / 2 + jit(j), y + jit(j) * .5], [x + w + jit(j), y + jit(j)],
          [x + w + jit(j) * .5, y + h / 2], [x + w + jit(j), y + h + jit(j)], [x + w / 2 + jit(j), y + h + jit(j) * .5],
          [x + jit(j), y + h + jit(j)], [x + jit(j) * .5, y + h / 2]];
}
function ellPts(cx, cy, rx, ry, n = 28, j = 0, rot = 0) {
  const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + Math.cos(a) * rx + jit(j), cy + Math.sin(a) * ry + jit(j)]); } return p;
}
function rrPts(x, y, w, h, r, j = 0) {
  const p = [], n = 5, corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; p.push([cx + Math.cos(a) * r + jit(j), cy + Math.sin(a) * r + jit(j)]); } };
  r = Math.min(r, w / 2, h / 2);
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  return p;
}
function starPts(cx, cy, r, inner = .38, n = 4, rot = -Math.PI / 2) {
  const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, q = i % 2 ? r * inner : r; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p;
}
// forme irrégulière de pierre (moellon) : ellipse bosselée, stable grâce à la graine
function stonePts(cx, cy, rx, ry, seed, n = 11, j = 0) {
  const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU + hash(seed * 3.1 + i) * .35, k = .78 + hash(seed * 7.3 + i * 1.9) * .3; p.push([cx + Math.cos(a) * rx * k + jit(j), cy + Math.sin(a) * ry * k + jit(j)]); } return p;
}
// portion d'une polyligne (0..1 de sa longueur) : pour les traits qui se dessinent
function partial(p, u) {
  const d = []; let L = 0;
  for (let i = 1; i < p.length; i++) { d.push(Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); L += d[i - 1]; }
  let s = clamp(u) * L; const out = [p[0]];
  for (let i = 1; i < p.length; i++) {
    if (s >= d[i - 1]) { out.push(p[i]); s -= d[i - 1]; }
    else { const f = s / d[i - 1]; out.push([lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f)]); break; }
  }
  return out;
}

// ---------- pinceau ----------
// Un appel = une forme peinte : aplat (wash), aquarelle (fill), hachures (hatch), contour à l'encre.
// Attention : l'aquarelle (fill) est lente. Dans les plans animés, n'en mettre que dans les calques mis en cache (layer()).
function paint(pts, o = {}) {
  if (o.wash || o.fill || o.hatch) {
    if (o.wash) brush.wash(o.wash, o.washOp ?? 255); else brush.noWash();
    if (o.fill) { brush.fill(o.fill, o.fillOp ?? 170); brush.fillBleed(o.bleed ?? .1); brush.fillTexture(o.tex ?? .4, o.border ?? .35); } else brush.noFill();
    if (o.hatch) { brush.hatch(o.hatch.d, o.hatch.a, o.hatch.o || { rand: .15 }); brush.hatchStyle(o.hatch.b || 'HB', o.hatch.c || PAL.ink, o.hatch.w || 1); } else brush.noHatch();
    brush.noStroke();
    if (o.curv) { brush.beginShape(o.curv); for (const p of pts) brush.vertex(p[0], p[1]); brush.endShape(true); }
    else brush.polygon(pts);
  }
  if (o.ink !== null) {
    brush.noWash(); brush.noFill(); brush.noHatch(); brush.set(o.br || 'ink', o.ink || PAL.ink, o.sw ?? 1);
    brush.beginShape(o.curv || 0); for (const p of pts) brush.vertex(p[0], p[1]); brush.endShape(true);
  }
}
function inkLine(pts, sw = 1, col = PAL.ink, br = 'ink', curv = .5) {
  brush.noFill(); brush.noWash(); brush.noHatch(); brush.set(br, col, sw); brush.spline(pts, curv);
}
// ---------- calques mis en cache ----------
// layer(clé, fn) : peint fn() une seule fois sur le papier (aquarelle comprise) et renvoie l'image, réutilisable par
// toutes les images de la vidéo. La clé contient un résumé du code de fn : modifier le dessin invalide le cache.
// Le cache vit dans la page et sur disque (out/layers) quand on rend avec render.mjs.
const LAYERS = new Map();
let LAYER_NEED = null, BUILD = null;
// La clé tient compte du code du calque, des fichiers partagés et du fichier du chapitre (préfixe c1_, c2_…) :
// render.mjs fournit ces empreintes dans window.LAYER_SALT, pour qu'une retouche du décor repeigne le calque.
function layerKey(name, fn) { const salt = window.LAYER_SALT || {}; return name + '_' + strHash(fn.toString() + (salt.shared || '') + (salt[name.slice(0, 2)] || '')).toString(36); }
function layer(name, fn) {
  const key = layerKey(name, fn), hit = LAYERS.get(key);
  if (hit) return hit;
  (LAYER_NEED ||= new Map()).set(key, fn);
  return null;
}
// drawLayer : pose le calque (à travers la caméra si elle est active). Couvre tout le cadre par défaut.
function drawLayer(name, fn, x = 0, y = 0, w = W, h = H) { const img = layer(name, fn); if (img) image(img, x, y, w, h); }
async function buildLayers(need) {
  for (const [key, fn] of need) {
    if (LAYERS.has(key)) continue;
    let img = null;
    if ((window.LAYER_FILES || []).includes(key)) { try { img = await loadImage(`${window.LAYER_DIR}/${key}.png`); } catch (e) { img = null; } }
    if (!img) {
      BUILD = { key, fn }; await redraw(); BUILD = null;
      const g = createGraphics(W, H); g.pixelDensity(1); g.drawingContext.drawImage(drawingContext.canvas, 0, 0, W, H);
      img = g;
      if (window.__saveLayer) await window.__saveLayer(key, g.elt.toDataURL('image/png').split(',')[1]);
    }
    LAYERS.set(key, img);
  }
}

// ---------- lettrage (sur le compositeur 2D, sous le grain du papier) ----------
// letter(texte, x, y, taille, couleur, { font: 'hand'|'title'|'text', weight, pop, rot, alpha, align, halo, shadow, screen })
function letter(txt, x, y, size, color, o = {}) {
  if (CAM && !o.screen) { [x, y] = toScreen(x, y); size *= CAM.zoom; o = { ...o, rot: (o.rot || 0) + CAM.rot }; }
  LETTERS.push({ txt, x, y, size, color, ...o });
}
// Onomatopée de BD : surgit à age 0, oscille puis s'efface après `life` secondes.
function sfx(txt, x, y, size, color, age, o = {}) {
  const life = o.life ?? 1.2; if (age < 0 || age > life) return;
  letter(txt, x, y, size, color, { font: 'title', pop: age * 5, alpha: 1 - seg(age, life - .25, life), halo: PAL.cream, shadow: PAL.ink, ...o,
    rot: (o.rot ?? -.08) + Math.sin(age * 20) * .03 * (1 - age / life) });
}
function drawLetters(c, list = LETTERS) {
  for (const L of list) {
    const k = L.pop != null ? backOut(L.pop) : 1; if (k <= .01 || (L.alpha ?? 1) <= .01) continue;
    c.save(); c.translate(L.x, L.y); c.rotate(L.rot || 0); c.scale(k, k); c.globalAlpha = clamp(L.alpha ?? 1);
    c.font = `${L.italic ? 'italic ' : ''}${L.weight || (L.font === 'text' ? 800 : 600)} ${L.size}px ${FONT[L.font || 'hand']}`;
    c.textAlign = L.align || 'center'; c.textBaseline = 'middle';
    if (L.spacing) c.letterSpacing = L.spacing + 'px';
    if (L.halo) { c.lineJoin = 'round'; c.lineWidth = L.size * .22; c.strokeStyle = L.halo; c.strokeText(L.txt, 0, 0); }
    if (L.shadow) { c.fillStyle = L.shadow; c.fillText(L.txt, L.size * .035, L.size * .045); }
    c.fillStyle = L.color; c.fillText(L.txt, 0, 0);
    c.restore();
  }
}
// Peint le lettrage en attente dans la scène elle-même (pour que les couches suivantes le recouvrent).
function flushLetters() {
  if (!LETTERS.length) return;
  letG.clear(); drawLetters(letG.drawingContext); LETTERS = [];
  // p5.brush diffère ses aplats et traits ; une minuscule aquarelle hors champ force leur dépôt avant les lettres.
  push(); resetMatrix(); translate(-W / 2, -H / 2);
  brush.noStroke(); brush.noHatch(); brush.noWash(); brush.fill('#000000', 1); brush.fillBleed(0); brush.fillTexture(0, 0);
  brush.polygon([[-50, -50], [-40, -50], [-40, -40]]); brush.noFill();
  image(letG, 0, 0); pop();
}

// ---------- papier ----------
function lcg(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function makePaper() {
  const g = createGraphics(W, H); g.pixelDensity(1); const c = g.drawingContext, rnd = lcg(11);
  c.fillStyle = PAL.paper; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const x = rnd() * W, y = rnd() * H, r = 120 + rnd() * 380, gr = c.createRadialGradient(x, y, 0, x, y, r), a = .04 * rnd(); gr.addColorStop(0, `rgba(160,130,90,${a})`); gr.addColorStop(1, 'rgba(160,130,90,0)'); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  c.lineWidth = 1;
  for (let i = 0; i < 1400; i++) { const x = rnd() * W, y = rnd() * H, l = 6 + rnd() * 26, a = rnd() * TAU; c.strokeStyle = `rgba(110,90,62,${.03 + rnd() * .05})`; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  return g;
}
// Grain et vignettage fixes, multipliés sur l'image peinte pour que le pigment soit « dans » le papier.
function makeGrain() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'), rnd = lcg(5);
  const id = c.createImageData(W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 255 - (rnd() < .5 ? rnd() * rnd() * 30 : 0); d[i] = v; d[i + 1] = v - 1; d[i + 2] = v - 3; d[i + 3] = 255; }
  c.putImageData(id, 0, 0);
  const g = c.createRadialGradient(W / 2, H / 2, H * .5, W / 2, H / 2, H * 1.1); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(125,100,75,.28)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  return cv;
}

function defineBrushes() {
  brush.add('ink', { type: 'default', weight: 5, scatter: .25, sharpness: .8, grain: 40, opacity: 230, spacing: .2, pressure: [1.15, .75], rotate: 'natural', noise: .15 });
  brush.add('inkfine', { type: 'default', weight: 2.6, scatter: .15, sharpness: .85, grain: 40, opacity: 225, spacing: .2, pressure: [1.1, .8], rotate: 'natural', noise: .1 });
  brush.add('dry', { type: 'default', weight: 14, scatter: 3, sharpness: .3, grain: 6, opacity: 90, spacing: .6, pressure: [1, .6], rotate: 'natural', noise: .4 });
}

// ---------- une image ----------
async function setup() {
  createCanvas(W, H, WEBGL); pixelDensity(1); noLoop();
  brush.scaleBrushes(5); defineBrushes();
  paperG = makePaper(); grainC = makeGrain(); letG = createGraphics(W, H); letG.pixelDensity(1);
  outC = document.getElementById('out'); outX = outC.getContext('2d');
  await Promise.all([`600 80px ${FONT.hand}`, `600 80px ${FONT.title}`, `italic 500 80px ${FONT.title}`, `800 80px ${FONT.text}`, `600 80px ${FONT.text}`].map(f => document.fonts.load(f)));
  window.ready = true;
  if (!location.search.includes('render')) devUI();
}
function draw() {
  if (!window.ready) return;
  LETTERS = []; CAPTION = null; CAM = null;
  push(); translate(-W / 2, -H / 2);
  if (BUILD) { randomSeed(strHash(BUILD.key) % 100000); noiseSeed(77); image(paperG, 0, 0); BUILD.fn(); CAM = null; flushLetters(); pop(); return; }
  randomSeed(1000 + Math.floor(T * BOIL)); noiseSeed(77);
  image(paperG, 0, 0);
  drawWorld(T);
  pop();
}
function composite(t) {
  const c = outX;
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.drawImage(drawingContext.canvas, 0, 0, W, H);
  drawLetters(c);
  c.globalCompositeOperation = 'multiply'; c.drawImage(grainC, 0, 0);
  c.globalCompositeOperation = 'source-over';
  drawCaptionText(c, t);
}
// Rendu d'une image : une première passe repère les calques manquants, on les peint, puis on repeint l'image.
async function frameAt(t) {
  T = t; LAYER_NEED = null;
  await redraw();
  if (LAYER_NEED) { const need = LAYER_NEED; LAYER_NEED = null; await buildLayers(need); T = t; await redraw(); }
  composite(t);
}
window.renderAt = async (t, type = 'image/png', q = .92) => { await frameAt(t); return outC.toDataURL(type, q); };
// Planche de contrôle : plusieurs instants sur une seule image. Renvoie { url, ms[] }.
window.renderSheet = async (times, cols = 3, w = 640) => {
  const h = Math.round(w * 9 / 16), rows = Math.ceil(times.length / cols), sc = document.createElement('canvas');
  sc.width = cols * w; sc.height = rows * h; const c = sc.getContext('2d'), ms = [];
  for (let i = 0; i < times.length; i++) {
    const t0 = performance.now(); await frameAt(times[i]); ms.push(Math.round(performance.now() - t0));
    const x = (i % cols) * w, y = Math.floor(i / cols) * h;
    c.drawImage(outC, x, y, w, h); c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(x, y, 96, 26); c.fillStyle = '#fff'; c.font = '16px sans-serif'; c.fillText(times[i].toFixed(2) + 's', x + 6, y + 18);
  }
  return { url: sc.toDataURL('image/jpeg', .88), ms };
};
window.gpuInfo = () => { const gl = drawingContext, e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); };

function devUI() {
  const s = document.getElementById('scrub'), lab = document.getElementById('tt');
  s.max = DUR;
  let busy = false, want = null;
  const go = async () => { if (busy) return; busy = true; while (want != null) { const t = want; want = null; const t0 = performance.now(); await frameAt(t); lab.textContent = `${t.toFixed(2)} s  ·  ${Math.round(performance.now() - t0)} ms/image`; } busy = false; };
  s.addEventListener('input', () => { want = +s.value; go(); });
  want = +(new URLSearchParams(location.search).get('t') || 0); s.value = want; go();
}
