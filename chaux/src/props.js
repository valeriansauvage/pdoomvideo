// props.js : décors et accessoires. Coordonnées du monde 1920x1080.
//
// maison(x, y, s, o)     vieille maison de pays vue de face. (x, y) = milieu du pied de façade, s = échelle (1 → façade de 620 px).
//                        o : { facade: 'pierre'|'chaux'|'ciment', light: couleur de la lumière, volets: 0..1 (ouverture), noShutters,
//                              fillTex: bool (aquarelle, seulement dans un calque) }. Renvoie les rectangles des ouvertures.
// coupe : décor de la coupe du mur (chapitres 2 à 4), voir COUPE pour les repères.
// seau(x, y, s, o)       seau de chantier avec étiquette. o : { label, col, fill (couleur du contenu), shine }
// soleil(x, y, r, t), nuage(x, y, s, o), oiseau(x, y, s, t), fleurs(...), chat(...)
// etiquette(txt, x, y, tx, ty, k, o) : annotation manuscrite avec flèche qui se dessine (k = 0..1).

function pick(arr, i) { return arr[Math.floor(hash(i) * arr.length) % arr.length]; }
const STONES = ['#CDBFA6', '#BFAF95', '#D8CCB6', '#B5A48A', '#C9B79B', '#D3C2A4', '#A99A82'];

// ---------- ciel, soleil, nuages, oiseaux ----------
function soleil(x, y, r, t, o = {}) {
  const k = o.alpha ?? 1;
  paint(ellPts(x, y, r * 2.3, r * 2.3, 30), { wash: o.glow || PAL.aube, washOp: 70 * k, ink: null });
  paint(ellPts(x, y, r * 1.55, r * 1.55, 30), { wash: o.glow || PAL.aube, washOp: 90 * k, ink: null });
  paint(ellPts(x, y, r, r, 30, r * .01), { wash: o.col || '#F6C766', washOp: 250 * k, ink: o.ink ? PAL.ink : null, sw: .8 });
  if (o.rays) for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU + t * .15, r0 = r * 1.3, r1 = r * (1.65 + .12 * Math.sin(t * 3 + i));
    inkLine([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], 1.1, PAL.ocre, 'inkfine', 0);
  }
}
function nuage(x, y, s, o = {}) {
  paint(cloudPts(x, y, 110 * s, 42 * s, 5, 2 * s, o.seed || 0), { wash: o.col || '#FFFFFF', washOp: (o.op ?? 190), ink: o.ink === false ? null : (o.inkCol || PAL.eauDk), sw: .5, curv: .4 });
}
function oiseau(x, y, s, t, ph = 0) {
  const f = Math.sin((t * 3.2 + ph) * TAU) * .5;
  inkLine([[x - 16 * s, y - 4 * s + f * 8 * s], [x - 7 * s, y - 6 * s * (1 - f)], [x, y]], .9, PAL.ink, 'inkfine', .5);
  inkLine([[x, y], [x + 7 * s, y - 6 * s * (1 - f)], [x + 16 * s, y - 4 * s + f * 8 * s]], .9, PAL.ink, 'inkfine', .5);
}

// ---------- annotation manuscrite ----------
function etiquette(txt, x, y, tx, ty, k, o = {}) {
  if (k <= 0) return;
  const size = o.size || 46, col = o.col || PAL.ink;
  letter(txt, x, y, size, col, { font: 'hand', pop: k * 1.6, rot: o.rot ?? -.04, halo: o.halo === false ? null : 'rgba(251,247,239,.85)' });
  if (tx != null) {
    const a = seg(k, .25, 1);
    if (a > 0) {
      const sx = x + (o.fromX ?? 0), sy = y + (o.fromY ?? size * .55);
      const mx = lerp(sx, tx, .5) + (o.bend ?? 30), my = lerp(sy, ty, .5) - (o.bendY ?? 10);
      const path = [[sx, sy], [mx, my], [tx, ty]];
      inkLine(partial(path, a), 1, col, 'inkfine', .6);
      if (a > .95) {
        const ang = Math.atan2(ty - my, tx - mx), L = 16;
        inkLine([[tx + Math.cos(ang + 2.6) * L, ty + Math.sin(ang + 2.6) * L], [tx, ty], [tx + Math.cos(ang - 2.6) * L, ty + Math.sin(ang - 2.6) * L]], 1, col, 'inkfine', 0);
      }
    }
  }
}

// ---------- seau ----------
function seau(x, y, s, o = {}) {
  const sw = clamp(s * 1.2, .6, 1.6), col = o.col || '#D9DDE0', inside = o.fill || PAL.chaux;
  if (o.shine) paint(ellPts(x, y - 70 * s, 190 * s, 170 * s, 30), { wash: PAL.aube, washOp: 110 * o.shine, ink: null });
  paint(ellPts(x, y + 4 * s, 95 * s, 16 * s, 18), { wash: PAL.ink, washOp: 45, ink: null });
  paint([[x - 80 * s, y - 150 * s], [x + 80 * s, y - 150 * s], [x + 64 * s, y], [x - 64 * s, y]].map(p => [p[0] + jit(1.5), p[1] + jit(1.5)]), { wash: col, washOp: 255, ink: PAL.ink, sw });
  paint([[x - 66 * s, y - 120 * s], [x - 50 * s, y - 120 * s], [x - 42 * s, y - 10 * s], [x - 56 * s, y - 10 * s]], { wash: '#FFFFFF', washOp: 90, ink: null });
  for (const yy of [-128, -30]) inkLine([[x - 78 * s + (yy + 150) * .1 * s, y + yy * s], [x + 78 * s - (yy + 150) * .1 * s, y + yy * s]], sw * .5, PAL.ink, 'inkfine', 0);
  paint(ellPts(x, y - 150 * s, 80 * s, 17 * s, 20), { wash: mixCol(col, PAL.ink, .25), washOp: 255, ink: PAL.ink, sw });
  paint(ellPts(x, y - 147 * s, 72 * s, 13 * s, 20), { wash: inside, washOp: 255, ink: null });
  if (o.heap) paint([[x - 60 * s, y - 150 * s], [x - 20 * s, y - 178 * s], [x + 25 * s, y - 184 * s], [x + 62 * s, y - 152 * s]], { wash: inside, washOp: 255, ink: PAL.ink, sw: sw * .6, curv: .6 });
  inkLine([[x - 80 * s, y - 145 * s], [x - 60 * s, y - 225 * s], [x + 60 * s, y - 225 * s], [x + 80 * s, y - 145 * s]], sw * 1.1, PAL.ink, 'ink', .8);   // anse
  if (o.label) {
    paint(rrPts(x - 56 * s, y - 102 * s, 112 * s, 50 * s, 8 * s, 1), { wash: o.labelCol || PAL.chaux, washOp: 255, ink: PAL.ink, sw: sw * .6 });
    letter(o.label, x, y - 76 * s, 30 * s, o.labelInk || PAL.ink, { font: 'text', weight: 900, spacing: 1 });
  }
}

// ---------- végétation ----------
function touffe(x, y, s, col = PAL.olive, n = 7, seed = 0) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / (n - 1) - .5) * 1.4, L = (26 + hash(seed + i) * 20) * s;
    inkLine([[x + (i - n / 2) * 2 * s, y], [x + Math.cos(a) * L * .5, y + Math.sin(a) * L * .6], [x + Math.cos(a) * L, y + Math.sin(a) * L]], 1.1, col, 'inkfine', .5);
  }
}
function fleurs(x, y, s, cols = [PAL.rose, '#E9C46A', '#FFFFFF'], n = 5, seed = 0) {
  for (let i = 0; i < n; i++) {
    const fx = x + (i - n / 2) * 18 * s + jit(2), fy = y - (18 + hash(seed + i * 3) * 26) * s;
    inkLine([[fx, y], [fx + 3 * s, fy + 10 * s], [fx, fy]], .8, PAL.olive, 'inkfine', .5);
    paint(ellPts(fx, fy, 7 * s, 7 * s, 8), { wash: pick(cols, seed + i), washOp: 240, ink: PAL.ink, sw: .45 });
    paint(ellPts(fx, fy, 2.5 * s, 2.5 * s, 6), { wash: PAL.ocre, ink: null });
  }
}
function arbre(x, y, s, o = {}) {
  paint([[x - 12 * s, y], [x - 7 * s, y - 120 * s], [x + 7 * s, y - 120 * s], [x + 12 * s, y]], { wash: PAL.boisDk, washOp: 230, ink: PAL.ink, sw: .8 });
  const c = o.col || PAL.sauge;
  paint(cloudPts(x, y - 170 * s, 85 * s, 75 * s, 7, 2, o.seed || 1), { wash: c, washOp: 235, fill: o.tex ? mixCol(c, PAL.olive, .5) : null, fillOp: 110, bleed: .12, tex: .6, ink: PAL.ink, sw: .8, curv: .5 });
  paint(ellPts(x - 25 * s, y - 195 * s, 40 * s, 28 * s, 14), { wash: '#FFFFFF', washOp: 45, ink: null });
}

// ---------- la maison ----------
const HOUSE = { w: 620, h: 420, roof: 175 };
function houseOpenings(x, y, s) {
  return {
    door: { x: x - 175 * s, y: y - 215 * s, w: 115 * s, h: 215 * s },
    win: [
      { x: x + 90 * s, y: y - 190 * s, w: 96 * s, h: 118 * s },
      { x: x - 190 * s, y: y - 385 * s, w: 88 * s, h: 110 * s },
      { x: x + 94 * s, y: y - 385 * s, w: 88 * s, h: 110 * s },
    ],
  };
}
function stoneWallArea(x0, y0, w, h, s, seed, holes = []) {
  const rowH = 30 * s; let row = 0;
  for (let yy = y0 + 4 * s; yy < y0 + h - 8 * s; yy += rowH, row++) {
    let xx = x0 + (row % 2 ? -18 : 4) * s + hash(seed + row) * 10 * s;
    let i = 0;
    while (xx < x0 + w - 10 * s) {
      const sw_ = (34 + hash(seed + row * 31 + i) * 38) * s, sh = rowH * (.78 + hash(seed + row * 17 + i * 3) * .22);
      const cx = xx + sw_ / 2, cy = yy + rowH / 2;
      const inHole = holes.some(o => cx > o.x - 14 * s && cx < o.x + o.w + 14 * s && cy > o.y - 14 * s && cy < o.y + o.h + 16 * s);
      if (!inHole && cx > x0 + 10 * s && cx < x0 + w - 10 * s) {
        const col = pick(STONES, seed + row * 13 + i);
        paint(stonePts(cx, cy, sw_ / 2 - 3 * s, sh / 2 - 2 * s, seed + row * 7 + i, 10), { wash: col, washOp: 255, ink: mixCol(PAL.ink, col, .45), sw: .45, curv: .35 });
        if (hash(seed + i + row) > .6) inkLine([[cx - sw_ * .2, cy + sh * .15], [cx + sw_ * .15, cy + sh * .2]], .35, PAL.pierreDk, 'inkfine', .3);
      }
      xx += sw_ + 3 * s; i++;
    }
  }
}
// Volet vu de face qui pivote sur sa charnière : open 0 = fermé sur la fenêtre, 1 = rabattu contre le mur.
function volet(win, side, open, sw, col = PAL.volet, fr = 12) {
  const hinge = side < 0 ? win.x - fr * .5 : win.x + win.w + fr * .5, span = (win.w / 2 + fr * .5) * Math.cos(clamp(open) * Math.PI);
  const a = side < 0 ? hinge : hinge - span, b = side < 0 ? hinge + span : hinge;
  const x0 = Math.min(a, b), ww = Math.abs(b - a), y = win.y - 2, h = win.h + 4;
  if (ww < 2) { inkLine([[hinge, y], [hinge, y + h]], sw * 1.4, PAL.voletDk, 'ink', 0); return; }
  const shade = Math.sin(clamp(open) * Math.PI);
  paint(rectPts(x0, y, ww, h, .6), { wash: mixCol(col, PAL.voletDk, shade * .5), washOp: 255, ink: PAL.ink, sw });
  if (ww > 12) {
    for (let k = 1; k < 4; k++) inkLine([[x0 + ww * k / 4, y + 3], [x0 + ww * k / 4, y + h - 3]], sw * .4, PAL.voletDk, 'inkfine', 0);
    inkLine([[x0 + 3, y + h * .22], [x0 + ww - 3, y + h * .22]], sw * .6, PAL.voletDk, 'inkfine', 0);
    inkLine([[x0 + 3, y + h * .78], [x0 + ww - 3, y + h * .78]], sw * .6, PAL.voletDk, 'inkfine', 0);
    inkLine([[x0 + 3, y + h * .78], [x0 + ww - 3, y + h * .22]], sw * .5, PAL.voletDk, 'inkfine', 0);
  }
}
function fenetre(o, s, sw, opts = {}) {
  const { x, y, w, h } = o, fr = 12 * s;
  // encadrement en pierre de taille
  paint(rectPts(x - fr, y - fr, w + 2 * fr, h + fr * 2.2, 1), { wash: PAL.pierreLt, washOp: 255, ink: PAL.ink, sw });
  paint(rectPts(x - fr * 1.6, y + h, w + fr * 3.2, fr * 1.3, 1), { wash: '#E9E1D1', washOp: 255, ink: PAL.ink, sw });         // appui
  paint(rectPts(x, y, w, h, .5), { wash: opts.night ? '#F2C46D' : '#4E6B7C', washOp: 255, ink: PAL.ink, sw });
  if (!opts.night) paint([[x + w * .1, y + h * .08], [x + w * .45, y + h * .08], [x + w * .15, y + h * .6], [x + w * .1, y + h * .6]], { wash: '#FFFFFF', washOp: 70, ink: null });
  inkLine([[x + w / 2, y], [x + w / 2, y + h]], sw * 1.1, '#F4EEE3', 'ink', 0);
  inkLine([[x, y + h * .42], [x + w, y + h * .42]], sw * 1.1, '#F4EEE3', 'ink', 0);
  if (!opts.noShutters) { volet(o, -1, 1, sw * .8, opts.voletCol, fr); volet(o, 1, 1, sw * .8, opts.voletCol, fr); }
}
function maison(x, y, s, o = {}) {
  const sw = clamp(1.1 * s, .6, 1.6), W2 = HOUSE.w * s / 2, Hh = HOUSE.h * s, R = HOUSE.roof * s, op = houseOpenings(x, y, s);
  const fac = o.facade || 'pierre';
  // toit (tuiles canal vues de face) + cheminée
  const roof = [[x - W2 - 34 * s, y - Hh], [x - W2 + 60 * s, y - Hh - R], [x + W2 - 60 * s, y - Hh - R], [x + W2 + 34 * s, y - Hh]];
  paint(rectPts(x + 150 * s, y - Hh - R - 70 * s, 50 * s, 110 * s, 1), { wash: PAL.pierre, washOp: 255, ink: PAL.ink, sw });
  paint(rectPts(x + 142 * s, y - Hh - R - 80 * s, 66 * s, 16 * s, 1), { wash: PAL.pierreDk, washOp: 255, ink: PAL.ink, sw: sw * .8 });
  paint(roof, { wash: PAL.tuile, washOp: 255, ink: PAL.ink, sw: sw * 1.1 });
  if (o.fillTex) paint(roof, { fill: PAL.tuileDk, fillOp: 80, bleed: .01, tex: .8, border: .5, ink: null });
  for (let r = 1; r <= 7; r++) {                                          // rangs de tuiles plates
    const k = r / 8, yy = lerp(y - Hh - R, y - Hh, k), xl = lerp(x - W2 + 60 * s, x - W2 - 34 * s, k), xr = lerp(x + W2 - 60 * s, x + W2 + 34 * s, k);
    inkLine([[xl, yy], [lerp(xl, xr, .5), yy + 1.5 * s], [xr, yy]], sw * .5, PAL.tuileDk, 'inkfine', .3);
    const n = Math.round((xr - xl) / (26 * s));
    for (let i = 0; i < n; i++) { const tx = lerp(xl, xr, (i + (r % 2 ? .5 : 0)) / n); if (tx < xr - 4) inkLine([[tx, yy - 3 * s], [tx, yy - R / 8 + 3 * s]], sw * .3, PAL.tuileDk, 'inkfine', 0); }
  }
  paint(rectPts(x - W2 + 55 * s, y - Hh - R - 10 * s, W2 * 2 - 110 * s, 18 * s, 1), { wash: PAL.tuileDk, washOp: 255, ink: PAL.ink, sw: sw * .8 });   // faîtage
  // façade
  const fx = x - W2, fy = y - Hh;
  const facCol = fac === 'chaux' ? PAL.sable : fac === 'ciment' ? PAL.cimentLt : '#E3D8C4';
  paint(rectPts(fx, fy, W2 * 2, Hh, 1.5), { wash: facCol, washOp: 255, ink: null });
  if (o.fillTex) paint(rectPts(fx, fy, W2 * 2, Hh, 1.5), { fill: fac === 'chaux' ? PAL.ocre : fac === 'ciment' ? PAL.ciment : PAL.pierreDk, fillOp: 70, bleed: .01, tex: .9, border: .3, ink: null });
  const holes = [op.door, ...op.win];
  if (fac === 'pierre') stoneWallArea(fx, fy, W2 * 2, Hh, s, 11, holes);
  if (fac === 'ciment') {
    paint([[fx, y - 10 * s], [fx, y - 120 * s], [fx + 120 * s, y - 95 * s], [fx + 260 * s, y - 150 * s], [fx + 420 * s, y - 105 * s], [fx + W2 * 2, y - 135 * s], [fx + W2 * 2, y - 10 * s]], { wash: PAL.cimentDk, washOp: 120, ink: null, curv: .5 });
    for (let c = 0; c < 6; c++) { const cx = fx + (60 + c * 95) * s, cy = fy + (80 + hash(c) * 240) * s, p = [[cx, cy]]; for (let k = 1; k < 5; k++) p.push([cx + (k * 18 + hash(c * 9 + k) * 10) * s, cy + (hash(c * 5 + k) - .3) * 40 * s]); inkLine(p, .6, PAL.ink, 'inkfine', 0); }
  }
  if (fac === 'chaux') for (let i = 0; i < 26; i++) { const tx = fx + hash(i * 3.3) * W2 * 2, ty = fy + hash(i * 7.1) * Hh; inkLine([[tx, ty], [tx + 22 * s, ty + 2 * s]], .35, PAL.ocre, 'inkfine', 0); }
  // chaînes d'angle
  for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
    const bw = (i % 2 ? 46 : 72) * s, bx = side < 0 ? fx : fx + W2 * 2 - bw, by = y - (i + 1) * 46 * s;
    paint(rectPts(bx, by + 2 * s, bw, 42 * s, 1), { wash: fac === 'chaux' ? '#EDE3D0' : PAL.pierreLt, washOp: 255, ink: PAL.ink, sw: sw * .6 });
  }
  // bandeau d'égout sous le toit
  paint(rectPts(fx - 10 * s, fy - 4 * s, W2 * 2 + 20 * s, 12 * s, 1), { wash: PAL.pierreLt, washOp: 255, ink: PAL.ink, sw: sw * .6 });
  // porte (bois, arc en pierre)
  const d = op.door;
  paint(rectPts(d.x - 14 * s, d.y - 16 * s, d.w + 28 * s, d.h + 16 * s, 1), { wash: fac === 'chaux' ? '#EDE3D0' : PAL.pierreLt, washOp: 255, ink: PAL.ink, sw });
  paint(rectPts(d.x, d.y, d.w, d.h, .5), { wash: o.doorCol || '#8C5A3A', washOp: 255, ink: PAL.ink, sw });
  for (let k = 1; k < 5; k++) inkLine([[d.x + d.w * k / 5, d.y + 4], [d.x + d.w * k / 5, d.y + d.h - 2]], sw * .4, PAL.boisDk, 'inkfine', 0);
  paint(ellPts(d.x + d.w * .8, d.y + d.h * .55, 5 * s, 5 * s, 8), { wash: PAL.ink, ink: null });
  // fenêtres
  op.win.forEach(wn => fenetre(wn, s, sw, { night: o.night, noShutters: o.noShutters, voletCol: o.voletCol }));
  // jardinières sous les fenêtres de l'étage
  for (const wn of op.win.slice(1)) {
    paint(rectPts(wn.x - 6 * s, wn.y + wn.h + 16 * s, wn.w + 12 * s, 20 * s, 1), { wash: PAL.tuileDk, washOp: 255, ink: PAL.ink, sw: sw * .7 });
    fleurs(wn.x + wn.w / 2 + 8 * s, wn.y + wn.h + 18 * s, s * .9, [PAL.rose, '#D9534F', '#FFFFFF'], 5, wn.x);
  }
  return op;
}

// ---------- la coupe du mur ----------
// Repères : mur de x 740 à 1180, du haut du cadre jusqu'au sol (y 860) ; fondations jusqu'à 940 ; enduit extérieur x 716–740,
// enduit intérieur x 1180–1198 ; pièce habitée à droite (sol en y 860), jardin à gauche.
const COUPE = { x0: 740, x1: 1180, top: -60, sol: 860, fond: 940, extX: 716, intX: 1198 };
function coupeStones(seed = 5) {
  const out = []; const rows = 13, rh = (COUPE.fond - COUPE.top) / rows;
  for (let r = 0; r < rows; r++) {
    const cols = 4 + (r % 2), cw = (COUPE.x1 - COUPE.x0) / cols;
    for (let c = 0; c < cols; c++) {
      const cx = COUPE.x0 + cw * (c + .5) + (hash(seed + r * 9 + c) - .5) * cw * .25, cy = COUPE.top + rh * (r + .5) + (hash(seed + r * 5 + c * 3) - .5) * rh * .2;
      out.push({ cx, cy, rx: cw * (.36 + hash(seed + r + c * 7) * .08), ry: rh * (.36 + hash(seed + r * 3 + c) * .08), seed: seed + r * 17 + c });
    }
  }
  return out;
}
const COUPE_STONES = coupeStones();
// Le décor fixe de la coupe (à peindre dans un calque). o : { saison: 'ete'|'hiver', interieur: 'chaud'|'froid' }
function coupeDecor(o = {}) {
  const { x0, x1, top, sol, fond, extX, intX } = COUPE;
  // ciel et jardin à gauche
  paint(rectPts(-40, -40, extX + 40, sol + 40), { wash: o.hiver ? '#CFDCE6' : PAL.ciel, washOp: 255, ink: null });
  paint(rectPts(-120, -120, x0 + 200, sol + 160), { fill: o.hiver ? '#9FB3C8' : '#9CC7DE', fillOp: 90, bleed: .2, tex: .5, border: .2, ink: null });
  paint([[-40, 700], [200, 640], [420, 668], [x0 + 40, 612], [x0 + 40, sol + 40], [-40, sol + 40]], { wash: o.hiver ? '#DDE6EC' : '#B9CFA3', washOp: 255, fill: o.hiver ? '#B8C8D6' : PAL.sauge, fillOp: 120, bleed: .1, tex: .6, ink: null });
  paint([[-40, 780], [300, 752], [extX, 770], [extX, sol], [-40, sol]], { wash: o.hiver ? '#EEF2F5' : PAL.sauge, washOp: 255, ink: PAL.ink, sw: .8 });
  if (!o.hiver) { arbre(250, 790, .8, { tex: true, seed: 3 }); fleurs(520, 800, 1.1, [PAL.rose, '#E9C46A', '#FFFFFF'], 6, 4); touffe(640, 800, 1.2); touffe(90, 800, 1); }
  else { paint([[150, 790], [158, 700], [168, 700], [176, 790]], { wash: PAL.boisDk, washOp: 230, ink: PAL.ink, sw: .8 }); for (const [bx, by, a] of [[163, 720, -.8], [163, 740, .7]]) inkLine([[bx, by], [bx + Math.cos(a - 1.57) * 60, by + Math.sin(a - 1.57) * 60]], 1, PAL.boisDk, 'ink', .4); }
  // pièce habitée à droite
  paint(rectPts(intX, -40, W - intX + 40, sol + 40), { wash: o.froid ? '#DCD7C9' : '#F1DDB8', washOp: 255, ink: null });
  paint(rectPts(x0, -160, W - x0 + 160, sol + 300), { fill: o.froid ? '#B8B8A8' : PAL.ocreLt, fillOp: 90, bleed: .15, tex: .6, border: .3, ink: null });
  paint(rectPts(1500, 330, 190, 150, 2), { wash: '#FFFFFF', washOp: 200, ink: PAL.ink, sw: 1 });                                      // cadre
  paint(rectPts(1515, 345, 160, 120, 1), { wash: '#A9C6D9', washOp: 255, ink: null });
  paint([[1515, 465], [1570, 395], [1610, 440], [1640, 405], [1675, 465]], { wash: PAL.sauge, washOp: 255, ink: PAL.ink, sw: .6 });
  paint(rectPts(intX, sol, W - intX + 40, 80), { wash: '#B98458', washOp: 255, ink: PAL.ink, sw: .9 });                           // parquet
  for (let i = 0; i < 8; i++) inkLine([[intX + i * 95, sol + 2], [intX + i * 95 - 10, sol + 78]], .5, PAL.boisDk, 'inkfine', 0);
  // fauteuil
  paint(rrPts(1330, 610, 230, 190, 40, 2), { wash: '#B5654A', washOp: 255, ink: PAL.ink, sw: 1.1 });
  paint(rrPts(1300, 700, 290, 110, 30, 2), { wash: '#C9785C', washOp: 255, ink: PAL.ink, sw: 1.1 });
  for (const lx of [1320, 1560]) paint(rectPts(lx, 805, 16, 55, 1), { wash: PAL.boisDk, washOp: 255, ink: PAL.ink, sw: .7 });
  // lampadaire
  inkLine([[1720, 860], [1720, 520]], 2, PAL.ink, 'ink', 0);
  paint(ellPts(1720, 858, 45, 9, 12), { wash: PAL.ink, washOp: 255, ink: null });
  paint([[1665, 520], [1775, 520], [1750, 440], [1690, 440]], { wash: '#F3D48E', washOp: 255, ink: PAL.ink, sw: 1 });
  // sol (terre) sous tout le décor
  paint(rectPts(-40, sol, intX + 40, 260), { wash: '#A07E5E', washOp: 255, ink: null });
  paint(rectPts(-40, sol + 8, intX + 40, 260), { fill: '#7E5E43', fillOp: 110, bleed: .02, tex: .8, border: .4, ink: null });
  paint(rectPts(intX, sol + 80, W - intX + 40, 200), { wash: '#8E6D50', washOp: 255, ink: null });
  inkLine([[-40, sol], [extX, sol]], 1.2, PAL.ink, 'ink', 0);
  for (let i = 0; i < 40; i++) { const px = hash(i * 1.3) * W, py = sol + 30 + hash(i * 2.7) * 170; if (px > x0 - 30 && px < x1 + 30 && py < fond + 10) continue; paint(ellPts(px, py, 6 + hash(i) * 8, 4 + hash(i + 1) * 5, 8), { wash: pick(['#8B6B4E', '#B79B7C', '#6F5440'], i), washOp: 255, ink: PAL.ink, sw: .35 }); }
  // mur : fond de mortier puis pierres
  paint(rectPts(x0, top, x1 - x0, fond - top, 1), { wash: '#E8DCC4', washOp: 255, ink: null });
  paint(rectPts(x0, top, x1 - x0, fond - top, 1), { fill: '#CDBB98', fillOp: 110, bleed: .05, tex: .9, border: .3, ink: null });
  for (const st of COUPE_STONES) {
    const col = pick(STONES, st.seed);
    paint(stonePts(st.cx, st.cy, st.rx, st.ry, st.seed, 12), { wash: col, washOp: 255, ink: PAL.ink, sw: .8, curv: .3 });
    paint(stonePts(st.cx - st.rx * .15, st.cy - st.ry * .15, st.rx * .55, st.ry * .45, st.seed + 50, 9), { wash: '#FFFFFF', washOp: 45, ink: null, curv: .3 });
    inkLine([[st.cx - st.rx * .4, st.cy + st.ry * .3], [st.cx + st.rx * .1, st.cy + st.ry * .45]], .4, PAL.pierreDk, 'inkfine', .4);
  }
  for (let i = 0; i < 70; i++) { const px = x0 + 10 + hash(i * 4.1) * (x1 - x0 - 20), py = top + 10 + hash(i * 6.3) * (fond - top - 20); paint(ellPts(px, py, 2.5, 2, 6), { wash: '#9C8A70', washOp: 200, ink: null }); }
  paint(rectPts(x0, top, x1 - x0, fond - top, .5), { ink: PAL.ink, sw: 1.3 });
  // enduit intérieur (plâtre à la chaux)
  paint(rectPts(x1, top, intX - x1, sol - top, .5), { wash: '#F6EEDD', washOp: 255, ink: PAL.ink, sw: .8 });
}
// Enduit extérieur d'origine (vieille chaux) : bande claire contre le mur
function enduitExt(col, op = 255, top = COUPE.top, bottom = COUPE.sol, x = COUPE.extX, w = COUPE.x0 - COUPE.extX + 2, ink = true) {
  const pts = []; for (let i = 0; i <= 10; i++) pts.push([x + jit(1.2), lerp(top, bottom, i / 10)]);
  pts.push([x + w, bottom], [x + w, top]);
  paint(pts, { wash: col, washOp: op, ink: ink ? PAL.ink : null, sw: .9 });
}
// position le long d'une polyligne (u = 0..1)
function along(p, u) { const q = partial(p, u); return q[q.length - 1]; }

// ---------- l'eau dans le mur ----------
// Trajet d'une goutte : elle naît dans le sol humide sous le mur, monte entre les pierres, puis rejoint une face.
// side -1 = face extérieure, 1 = face intérieure. faceX permet d'arrêter la goutte plus tôt (contre un enduit étanche).
function trajet(i, seed, side, faceX) {
  const x = 790 + hash(seed + i * 3.1) * 340, top = 150 + hash(seed + i * 5.7) * 470;
  const face = faceX ?? (side < 0 ? COUPE.extX - 4 : COUPE.intX + 4);
  return [[x, 912], [x + (hash(seed + i) - .5) * 60, lerp(912, top, .33)], [x + (hash(seed + i + 1) - .5) * 80, lerp(912, top, .66)],
    [lerp(x, face, .3), top], [lerp(x, face, .7), top + 10], [face, top + 16]];
}
// Une goutte le long de son trajet : a = âge (s). Renvoie { x, y, u } (u = avancement 0..1) ou null.
function goutteSurTrajet(path, a, dur, s, o = {}) {
  if (a < 0) return null;
  const pop = backOut(clamp(a / .35)), u = easeOut(clamp((a - .2) / dur) * .92 + (a > .2 ? .08 * clamp((a - .2) / dur) : 0));
  const [x, y] = along(path, u);
  const wig = Math.sin(a * 9) * .12 * (1 - u);
  goutte(x, y, s * pop, { rot: wig, sq: -.08 * Math.sin(a * 12) * (u < 1 ? 1 : 0), ...o });
  return { x, y, u };
}
// Petites gouttes qui s'échappent en vapeur d'une face du mur : age 0..1 sur la durée de vie
function evasion(x, y, side, age, s = 26, o = {}) {
  if (age < 0 || age > 1) return;
  const k = inOut(age, 0, 1, .2), xx = x + side * (30 + 170 * easeOut(age)), yy = y - 20 - 150 * age + Math.sin(age * 7) * 10;
  vapeur(xx, yy, s * (.7 + .5 * age), { alpha: k, face: o.face ?? true, mood: 'happy', seed: o.seed || 0 });
}
