// logo.js : le logo FRONTIS découpé en calques animables : murs, toit, mot « FRONTIS » et signature.
// Le fichier officiel posé dans assets/logo/ est découpé tout seul (voir logoDepuisFichier). Sans lui, on dessine un logo
// PROVISOIRE d'après la charte, et la mention « logo provisoire » s'affiche à l'image pour qu'il ne parte pas par erreur.
const CHARTE = { vertFonce: '#24523A', vertVif: '#3FA24C', orange: '#D9622B', creme: '#F3EFE4', encre: '#23221F' };
const FONTES = { titre: '"Archivo Black"', sous: '"Barlow Condensed"' };

// Un calque est une image posée dans le repère du logo : { img, x, y, w, h }, en pixels de maquette (cadre de 1920 × 1080).
// k = pixels réels par pixel de maquette, pour que l'image reste nette en 4K.
function calque(x, y, w, h, k, draw) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * k); c.height = Math.ceil(h * k);
  const g = c.getContext('2d');
  g.scale(k, k); g.translate(-x, -y); draw(g);
  return { img: c, x, y, w, h };
}

// Capitales espacées lettre à lettre. Le crénage est perdu, ce qui ne se voit pas sur des capitales très espacées.
function largeurEspacee(g, txt, esp) { let w = 0; for (const ch of txt) w += g.measureText(ch).width + esp; return w - esp; }
function texteEspace(g, txt, x, y, esp) { for (const ch of txt) { g.fillText(ch, x, y); x += g.measureText(ch).width + esp; } }

function poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }

// Logo provisoire : maison au pignon vert sous un toit orange en chevron, porte en creux ; FRONTIS en Archivo Black,
// signature « ISOLATION | RAVALEMENT | TOITURES » en Barlow Condensed, justifiée sur la largeur du mot.
function logoProvisoire(k) {
  const m = document.createElement('canvas').getContext('2d');
  const cx = 72, demi = 72, pente = Math.tan(40 * Math.PI / 180), ep = 18 / Math.cos(40 * Math.PI / 180);
  const egout = demi * pente;
  const toit = [[cx, 0], [cx + demi, egout], [cx + demi, egout + ep], [cx, ep], [cx - demi, egout + ep], [cx - demi, egout]];
  const jeu = 10, mw = 54, haut = ep + jeu, sol = 168;
  const murs = [[cx, haut], [cx + mw, haut + mw * pente], [cx + mw, sol], [cx - mw, sol], [cx - mw, haut + mw * pente]];

  m.font = `100px ${FONTES.titre}`;
  const capT = m.measureText('H').actualBoundingBoxAscent / 100;
  m.font = `600 100px ${FONTES.sous}`;
  const capS = m.measureText('H').actualBoundingBoxAscent / 100;

  const x0 = 144 + 40, capMot = 96, capSig = 21;
  const fMot = `${capMot / capT}px ${FONTES.titre}`, fSig = `600 ${capSig / capS}px ${FONTES.sous}`;
  m.font = fMot;
  const mm = m.measureText('FRONTIS'), motW = mm.actualBoundingBoxLeft + mm.actualBoundingBoxRight;
  const baseSig = sol, baseMot = sol - capSig - 22;
  const sig = ['ISOLATION', 'RAVALEMENT', 'TOITURES'];
  m.font = fSig;
  // signature justifiée sur la largeur du mot : esp entre les lettres, 2 esp de part et d'autre de chaque barre orange
  const brut = sig.reduce((w, s) => w + largeurEspacee(m, s, 0), 0), barre = 3, autour = 2;
  const esp = (motW - brut - (sig.length - 1) * barre) / (sig.join('').length - sig.length + (sig.length - 1) * 2 * autour);

  const L = {};
  L.toit = calque(0, 0, 144, egout + ep, k, g => { poly(g, toit); g.fillStyle = CHARTE.orange; g.fill(); });
  L.murs = calque(cx - mw, haut, 2 * mw, sol - haut, k, g => {
    poly(g, murs); g.fillStyle = CHARTE.vertVif; g.fill();
    g.globalCompositeOperation = 'destination-out';
    const pl = 30, ph = 54;
    g.beginPath(); g.moveTo(cx - pl / 2, sol); g.lineTo(cx - pl / 2, sol - ph + pl / 2);
    g.arc(cx, sol - ph + pl / 2, pl / 2, Math.PI, 0); g.lineTo(cx + pl / 2, sol); g.closePath(); g.fill();
  });
  L.mot = calque(x0, baseMot - capMot - 4, motW, capMot + 8, k, g => {
    g.font = fMot; g.fillStyle = CHARTE.encre; g.fillText('FRONTIS', x0 + mm.actualBoundingBoxLeft, baseMot);
  });
  L.signature = calque(x0, baseSig - capSig - 6, motW, capSig + 12, k, g => {
    g.font = fSig; let x = x0;
    sig.forEach((s, i) => {
      g.fillStyle = CHARTE.vertFonce; texteEspace(g, s, x, baseSig, esp); x += largeurEspacee(g, s, esp);
      if (i < sig.length - 1) { x += autour * esp; g.fillStyle = CHARTE.orange; g.fillRect(x, baseSig - capSig - 2, barre, capSig + 4); x += barre + autour * esp; }
    });
  });
  return { calques: L, w: x0 + motW, h: sol, provisoire: true };
}

// ---------- logo officiel ----------
// Le fichier posé dans assets/logo/ (logo.svg de préférence, sinon logo.png) est découpé automatiquement :
//   - l'icône est le premier bloc à gauche, séparé du texte par une colonne vide ;
//   - dans l'icône, les pixels orange forment le toit, tout le reste les murs ;
//   - le texte est coupé à la première ligne vide : au-dessus le mot FRONTIS, en dessous la signature.
// Un PNG sur fond blanc (sans transparence) est détouré : le blanc devient transparent, bords adoucis compris.
const FICHIERS_LOGO = ['assets/logo/logo.svg', 'assets/logo/logo.png'];
const HAUTEUR_LOGO = 168;                                    // hauteur du logo en pixels de maquette, comme le provisoire

function chargerImage(url) {
  return new Promise(ok => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = url; });
}

function pixels(img, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h);
  return g.getImageData(0, 0, w, h);
}

// Fond opaque → transparence. Le logo n'a que quelques couleurs franches : chaque pixel est lu comme le mélange d'une
// de ces couleurs avec le fond, si bien que les aplats restent pleinement opaques et que seuls les bords s'adoucissent.
function detourer(d) {
  const p = d.data, n = p.length / 4;
  let opaque = 0; for (let i = 3; i < p.length; i += 4) if (p[i] === 255) opaque++;
  if (opaque < n * .98) return;                             // déjà transparent
  const coin = [0, d.width - 1, (d.height - 1) * d.width, d.width * d.height - 1].map(i => [p[i * 4], p[i * 4 + 1], p[i * 4 + 2]]);
  const F = [0, 1, 2].map(j => coin.reduce((s, c) => s + c[j], 0) / 4);
  const ecart = i => Math.max(Math.abs(p[i] - F[0]), Math.abs(p[i + 1] - F[1]), Math.abs(p[i + 2] - F[2])) / 255;
  // palette : les couleurs franches, regroupées par cases de 24 niveaux
  const cases = new Map(); let total = 0;
  for (let i = 0; i < p.length; i += 4) if (ecart(i) > .45) {
    const cle = `${p[i] / 24 | 0},${p[i + 1] / 24 | 0},${p[i + 2] / 24 | 0}`, c = cases.get(cle) || { n: 0, s: [0, 0, 0] };
    c.n++; for (let j = 0; j < 3; j++) c.s[j] += p[i + j]; cases.set(cle, c); total++;
  }
  const palette = [...cases.values()].filter(c => c.n > total * .003).map(c => ({ D: c.s.map((v, j) => v / c.n - F[j]) }));
  palette.forEach(P => { P.dd = P.D.reduce((s, v) => s + v * v, 0); });
  for (let i = 0; i < p.length; i += 4) {
    if (ecart(i) < .02) { p[i + 3] = 0; continue; }
    const dv = [p[i] - F[0], p[i + 1] - F[1], p[i + 2] - F[2]];
    let a = 1, err = Infinity;
    for (const P of palette) {
      if (!P.dd) continue;
      const k = clamp01((dv[0] * P.D[0] + dv[1] * P.D[1] + dv[2] * P.D[2]) / P.dd);
      const e = (dv[0] - k * P.D[0]) ** 2 + (dv[1] - k * P.D[1]) ** 2 + (dv[2] - k * P.D[2]) ** 2;
      if (e < err) { err = e; a = k; }
    }
    if (err > 3 * 40 * 40) continue;                        // pas un simple mélange avec le fond : gardé opaque, tel quel
    if (a < .02) { p[i + 3] = 0; continue; }
    for (let j = 0; j < 3; j++) p[i + j] = clampOctet(F[j] + dv[j] / a);
    p[i + 3] = Math.round(255 * a);
  }
}
const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const clampOctet = v => Math.max(0, Math.min(255, Math.round(v)));

function estOrange(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx < 90 || mx - mn < 60 || mx !== r) return false;
  const h = 60 * (g - b) / (mx - mn);                       // teinte entre rouge (0°) et jaune (60°)
  return h >= 4 && h <= 45;
}

// Plages pleines d'une projection : [[début, fin], …] (fin exclue), séparées par au moins `vide` cases vides.
function plages(proj, vide) {
  const out = []; let debut = -1, fin = -1;
  for (let i = 0; i < proj.length; i++) {
    if (!proj[i]) continue;
    if (debut >= 0 && i - fin >= vide) { out.push([debut, fin]); debut = -1; }
    if (debut < 0) debut = i;
    fin = i + 1;
  }
  if (debut >= 0) out.push([debut, fin]);
  return out;
}

async function logoDepuisFichier(k) {
  let img = null;
  for (const url of FICHIERS_LOGO) if ((img = await chargerImage(url))) break;
  if (!img) return null;
  // 1. analyse : détourage, repérage de l'icône (premier bloc à gauche) et des lignes de texte
  const iw = img.naturalWidth, ih = img.naturalHeight;
  if (!iw || !ih) throw new Error('logo : dimensions du fichier introuvables (SVG sans width/height ?)');
  const sA = 1600 / Math.max(iw, ih), A = pixels(img, Math.round(iw * sA), Math.round(ih * sA)); detourer(A);
  const { width: aw, height: ah, data: p } = A, plein = (x, y) => p[(y * aw + x) * 4 + 3] > 24;
  const col = new Array(aw).fill(0), lig = new Array(ah).fill(0);
  for (let y = 0; y < ah; y++) for (let x = 0; x < aw; x++) if (plein(x, y)) { col[x]++; lig[y]++; }
  const ly0 = lig.findIndex(v => v), ly1 = ah - [...lig].reverse().findIndex(v => v);
  const blocs = plages(col, Math.max(2, Math.round((ly1 - ly0) * .04)));
  if (blocs.length < 2) throw new Error("logo : impossible de séparer l'icône du texte (aucune colonne vide entre les deux)");
  const icone = blocs[0], texte = [blocs[1][0], blocs[blocs.length - 1][1]];
  const ligT = new Array(ah).fill(0);
  for (let y = 0; y < ah; y++) for (let x = texte[0]; x < texte[1]; x++) if (plein(x, y)) ligT[y]++;
  const lignes = plages(ligT, 1), mot = lignes[0], sig = lignes.length > 1 ? [lignes[1][0], lignes[lignes.length - 1][1]] : null;

  // 2. calques à la résolution de rendu : le logo mesure HAUTEUR_LOGO pixels de maquette de haut
  const e = HAUTEUR_LOGO / (ly1 - ly0), s = e * k;          // analyse → maquette, analyse → pixels rendus
  const R = pixels(img, Math.round(aw * s), Math.round(ah * s)); detourer(R);
  const q = R.data, rw = R.width, rh = R.height;
  const decoupe = (bx0, by0, bx1, by1, garder) => {
    const cx0 = Math.floor(bx0 * s), cy0 = Math.floor(by0 * s), cw = Math.min(rw, Math.ceil(bx1 * s)) - cx0, ch = Math.min(rh, Math.ceil(by1 * s)) - cy0;
    const out = document.createElement('canvas'); out.width = cw; out.height = ch;
    const o = out.getContext('2d'), od = o.createImageData(cw, ch);
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const i = ((cy0 + y) * rw + cx0 + x) * 4, j = (y * cw + x) * 4;
      if (q[i + 3] && garder(q[i], q[i + 1], q[i + 2])) for (let c = 0; c < 4; c++) od.data[j + c] = q[i + c];
    }
    o.putImageData(od, 0, 0);
    return rogner({ img: out, x: cx0 / k - icone[0] * e, y: cy0 / k - ly0 * e, w: cw / k, h: ch / k }, k);
  };
  const L = {
    toit: decoupe(icone[0], ly0, icone[1], ly1, estOrange),
    murs: decoupe(icone[0], ly0, icone[1], ly1, (r, g, b) => !estOrange(r, g, b)),
    mot: decoupe(texte[0], mot[0], texte[1], mot[1], () => true),
  };
  L.signature = sig ? decoupe(texte[0], sig[0], texte[1], sig[1], () => true) : { img: document.createElement('canvas'), x: 0, y: 0, w: 0, h: 0 };
  return { calques: L, w: (texte[1] - icone[0]) * e, h: HAUTEUR_LOGO, provisoire: false };
}

function rogner(c, k) {
  const g = c.img.getContext('2d', { willReadFrequently: true }), d = g.getImageData(0, 0, c.img.width, c.img.height), p = d.data;
  let x0 = d.width, y0 = d.height, x1 = -1, y1 = -1;
  for (let y = 0; y < d.height; y++) for (let x = 0; x < d.width; x++) if (p[(y * d.width + x) * 4 + 3] > 8) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 < 0) return c;
  const out = document.createElement('canvas'); out.width = x1 - x0 + 1; out.height = y1 - y0 + 1;
  out.getContext('2d').drawImage(c.img, -x0, -y0);
  return { img: out, x: c.x + x0 / k, y: c.y + y0 / k, w: out.width / k, h: out.height / k };
}

async function chargerLogo(k) { return (await logoDepuisFichier(k)) || logoProvisoire(k); }
