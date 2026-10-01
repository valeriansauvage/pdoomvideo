// logo.js : le logo FRONTIS (frontis/assets/logo/) découpé en calques animables : murs, toit, mot « FRONTIS », signature.
//   - l'icône est le premier bloc à gauche, séparé du texte par une colonne vide ;
//   - dans l'icône, les pixels orange forment le toit, tout le reste les murs ;
//   - le texte est coupé à la première ligne vide : au-dessus le mot FRONTIS, en dessous la signature.
// Un SVG est préféré s'il est fourni. Un PNG sur fond blanc (sans transparence) est détouré automatiquement.
// Un calque est une image posée dans le repère du logo : { img, x, y, w, h }, en unités de logo.
const FICHIERS_LOGO = ['assets/logo/logo.svg', 'assets/logo/logo.png'];
const HAUTEUR_LOGO = 168;                                    // hauteur du logo en unités de logo (le carton le met à l'échelle)

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

// k = pixels rendus par unité de logo.
async function chargerLogo(k) {
  let img = null;
  for (const url of FICHIERS_LOGO) if ((img = await chargerImage(url))) break;
  if (!img) throw new Error('logo introuvable : déposer logo.svg ou logo.png dans frontis/assets/logo/');
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
  return { calques: L, w: (texte[1] - icone[0]) * e, h: HAUTEUR_LOGO };
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

