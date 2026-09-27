// timeline.js : registre des chapitres, transitions au pinceau et légendes.
//
// Chaque fichier de chapitre appelle chapter(nom, début, fin, plans) avec plans = [[t0, fn], ...] dans l'ordre.
// Un plan est appelé fn(t, lt, dur) : t = temps de la vidéo, lt = t - t0, dur = durée du plan. Il peint toute l'image
// (fond compris) et doit être une fonction pure de t : les images sont rendues en parallèle et dans le désordre.

const CH = [];
function chapter(name, start, end, shots) { CH.push({ name, start, end, shots }); CH.sort((a, b) => a.start - b.start); }

// Coups de pinceau entre certains chapitres : [instant, couleur principale, couleur secondaire]
const WIPES = [[10, PAL.ocreLt, PAL.sable], [35, PAL.chaux, PAL.cream], [47.5, PAL.sable, PAL.ocreLt]];
const WIPE_TR = .32;

function drawWorld(t) {
  const ch = CH.find(c => t >= c.start && t < c.end) || (t >= DUR ? CH[CH.length - 1] : null);
  if (!ch) placeholder(t);
  else {
    let i = 0; while (i + 1 < ch.shots.length && t >= ch.shots[i + 1][0]) i++;
    const t0 = ch.shots[i][0], end = i + 1 < ch.shots.length ? ch.shots[i + 1][0] : ch.end;
    ch.shots[i][1](t, t - t0, end - t0);
    CAM = null;
  }
  WIPES.forEach(([b, c1, c2], j) => { if (Math.abs(t - b) < WIPE_TR) { flushLetters(); wipe((t - (b - WIPE_TR)) / (2 * WIPE_TR), j, c1, c2); } });
  caption(t);
}

function placeholder(t) {
  paint(ellPts(960, 460, 520, 260, 30, 20), { wash: PAL.ciel, washOp: 120, ink: null });
  letter('(chapitre pas encore peint)', 960, 440, 60, PAL.ink, { font: 'hand' });
}

// ---------- coup de pinceau ----------
// De larges traînées de chaux balaient l'image, la scène change sous la couverture complète (p = .5), puis elles repartent.
function wipe(p, idx, c1, c2) {
  const n = 5, bh = (H + 420) / n + 40;
  push(); translate(W / 2, H / 2); rotate(-.08); translate(-W / 2, -H / 2);
  for (let i = 0; i < n; i++) {
    const y0 = -230 + i * (H + 420) / n, d = [0, .14, .06, .18, .1][i];
    const q = p < .5 ? easeOut(clamp((p * 2 - d) / (1 - d))) : ease(clamp(((p - .5) * 2 - d) / (1 - d)));
    const x0 = p < .5 ? -300 : lerp(-300, W + 400, q), x1 = p < .5 ? lerp(-300, W + 400, q) : W + 400;
    if (x1 - x0 < 30) continue;
    const pts = [], rag = (k, side) => side * (40 + 50 * hash(idx * 7 + i * 31 + k)) + jit(10);
    for (let k = 0; k <= 8; k++) pts.push([lerp(x0, x1, k / 8), y0 + Math.sin(k * .9 + i) * 14 + jit(4)]);
    for (let k = 1; k < 9; k++) pts.push([x1 + rag(k, 1) - 40, y0 + bh * k / 9]);
    for (let k = 8; k >= 0; k--) pts.push([lerp(x0, x1, k / 8), y0 + bh + Math.sin(k * .8 + i * 2) * 14 + jit(4)]);
    if (p >= .5) for (let k = 8; k > 0; k--) pts.push([x0 - rag(k + 20, 1) + 40, y0 + bh * k / 9]);
    paint(pts, { wash: i % 2 ? c1 : c2, washOp: 255, ink: null });
    // traces de poils près du bord qui avance
    const edge = p < .5 ? x1 : x0, dirn = p < .5 ? -1 : 1;
    for (let s = 0; s < 4; s++) {
      const yy = y0 + bh * (.18 + s * .21) + jit(3), L = 120 + hash(idx * 3 + i * 7 + s) * 260;
      inkLine([[edge + dirn * 30, yy], [edge + dirn * (30 + L * .5), yy + 4 * Math.sin(s + i)], [edge + dirn * (30 + L), yy + jit(3)]], .5, mixCol(i % 2 ? c1 : c2, PAL.ocreDk, .15), 'dry', .4);
    }
  }
  pop();
}

// ---------- légendes ----------
// Un ruban de chaux en bas de l'image, le texte net par-dessus (dessiné après le grain du papier).
function caption(t) {
  const L = CUES.legendes.find(l => t >= l[0] && t < l[1]); if (!L) return;
  const [a, b, txt] = L;
  outX.font = `800 46px ${FONT.text}`;
  const tw = outX.measureText(txt).width, grow = easeOut((t - a) / .25) * (1 - ease((t - (b - .2)) / .2));
  if (grow < .02) return;
  const w = (tw + 120) * grow, x0 = 960 - w / 2, y0 = 958, h = 84;
  const pts = [[x0 + jit(5), y0 + jit(3)], [x0 + w * .3, y0 - 5 + jit(3)], [x0 + w * .7, y0 - 2 + jit(3)], [x0 + w + jit(5), y0 + jit(3)], [x0 + w + 16 + jit(5), y0 + h / 2],
    [x0 + w + jit(5), y0 + h + jit(3)], [x0 + w * .6, y0 + h + 4 + jit(3)], [x0 + jit(5), y0 + h + jit(3)], [x0 - 16 + jit(5), y0 + h / 2]];
  paint(pts, { wash: PAL.chaux, washOp: 238, ink: null });
  inkLine([[x0 + 30, y0 + h - 4 + jit(2)], [x0 + w - 30, y0 + h - 2 + jit(2)]], .55, PAL.ocre, 'inkfine', .3);
  CAPTION = { a, b, txt, grow };
}
function drawCaptionText(c, t) {
  if (!CAPTION || CAPTION.grow < .9) return;
  const { a, b, txt } = CAPTION, k = seg(t, a + .12, a + .4) * (1 - seg(t, b - .2, b - .05));
  c.save(); c.globalAlpha = k; c.font = `800 46px ${FONT.text}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = PAL.ink; c.fillText(txt, 960, 1001 + (1 - easeOut(k)) * 6);
  c.restore();
}
