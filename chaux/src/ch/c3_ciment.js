// c3_ciment : 22.5 – 35 s. La truelle plaque un enduit ciment sur le mur (CLAC !). Les gouttes qui montent butent
// contre lui et restent piégées : le mur se gorge d'eau, salpêtre et moisissures gagnent la pièce, qui se refroidit.
// L'hiver arrive, l'eau piégée gèle, le ciment se fissure (CRAC !) et une plaque tombe.
(() => {
  const coupeLayer = () => { coupeDecor({}); enduitExt('#EFE6D2'); };     // même calque que le chapitre 2
  const CX0 = 682, CX1 = 742, GS = 25;                                   // l'enduit ciment, plus épais que l'ancien
  const CLAC = 23.1, CRAC = 32.5, FALL = 33.3;
  // la plaque qui se détache
  const CHUNK_TOP = [[CX0, 398], [696, 386], [712, 392], [728, 376], [CX1, 372]];
  const CHUNK_BOT = [[CX1, 606], [726, 618], [708, 610], [694, 626], [CX0, 632]];
  const CHUNK = [...CHUNK_TOP, ...CHUNK_BOT];
  // gouttes piégées : [x, y, arrivée]
  const STUCK = [];
  for (let i = 0; i < 9; i++) STUCK.push({ path: trajet(i, 33, -1, 770), st: 23.9 + i * .42 });

  function ciment(t, alpha = 1) {
    const g = easeOut(seg(t, CLAC, CLAC + .6));
    if (g <= 0) return;
    const top = lerp(440, -60, g), bot = lerp(470, 860, g), col = PAL.ciment, o = { wash: col, washOp: 255 * alpha, ink: PAL.ink, sw: .9 };
    const falling = t >= FALL;
    if (g < 1) { paint(rectPts(CX0, top, CX1 - CX0, bot - top, 1), o); return; }
    paint([[CX0, -60], [CX1, -60], ...CHUNK_TOP.slice().reverse()], o);
    paint([[CX1, 606], [CX1, 860], [CX0, 860], ...CHUNK_BOT.slice().reverse()], o);
    if (!falling) paint(CHUNK, o);
    // traces de lissage
    for (let i = 0; i < 7; i++) { const y = 20 + i * 120 + hash(i) * 40; if (!(falling && y > 360 && y < 640)) inkLine([[CX0 + 8, y], [CX0 + 30, y + 14], [CX1 - 8, y + 6]], .5, PAL.cimentDk, 'inkfine', .6); }
  }
  const LAND = Math.sqrt(2 * (828 - 505) / 2600);                        // durée de la chute
  function plaqueQuiTombe(t) {
    const a = t - FALL; if (a < 0) return;
    const k = Math.min(a, LAND), dy = .5 * 2600 * k * k, dx = -150 * k / LAND, rot = -1.57 * ease(k / LAND);
    const bounce = a > LAND ? Math.exp(-(a - LAND) * 10) * Math.sin((a - LAND) * 30) * 10 : 0;
    push(); translate(712 + dx, 505 + dy - Math.abs(bounce)); rotate(rot); translate(-712, -505);
    paint(CHUNK, { wash: PAL.ciment, washOp: 255, ink: PAL.ink, sw: 1 });
    inkLine([[690, 450], [720, 470], [730, 520]], .6, PAL.cimentDk, 'inkfine', .5);
    pop();
    if (a > LAND) {                                                    // nuage de poussière à l'impact
      const d = a - LAND;
      for (let i = 0; i < 6; i++) { const r = 20 + d * 120 + i * 6, x = 562 + (i - 2.5) * 40 + d * (i - 2.5) * 60; paint(ellPts(x, 845 - d * 40 - i * 4, r, r * .55, 12), { wash: '#D8CBB5', washOp: 150 * (1 - clamp(d / .9)), ink: null }); }
    }
  }
  function fissures(t) {
    const k = seg(t, CRAC, CRAC + .45);
    if (k <= 0) return;
    const lines = [CHUNK_TOP, CHUNK_BOT.slice().reverse(), [[712, 90], [700, 170], [716, 230], [702, 330], [712, 386]], [[708, 626], [722, 700], [704, 760], [716, 850]], [[742, 250], [726, 280], [734, 320]]];
    lines.forEach((l, i) => { const u = seg(k, i * .12, i * .12 + .5); if (u > 0 && !(t >= FALL && i < 2)) inkLine(partial(l, u), 1.5, PAL.ink, 'ink', 0); });
  }
  // L'humidité monte dans le mur : voile sombre avec une ligne de sels en haut
  function tacheHumide(t, level) {
    if (level >= 855) return;
    const pts = [[COUPE.x0, 860]];
    for (let i = 0; i <= 12; i++) pts.push([lerp(COUPE.x0, COUPE.x1, i / 12), level + Math.sin(i * 1.3 + t * .8) * 14 + hash(i) * 10]);
    pts.push([COUPE.x1, 860]);
    paint(pts, { wash: '#50657A', washOp: 85, ink: null });
    for (let i = 0; i < 16; i++) { const x = lerp(COUPE.x0 + 14, COUPE.x1 - 14, i / 15), y = level + Math.sin(i * 1.3 * 12 / 15 + t * .8) * 14 - 4; paint(ellPts(x, y, 5 + hash(i) * 4, 3, 6), { wash: '#FFFFFF', washOp: 170, ink: null }); }
  }
  function degatsInterieur(t) {
    const m = seg(t, 28.4, 29.4), sel = seg(t, 28.2, 29.0), froid = ease(seg(t, 29.2, 30.6));
    if (froid > 0) paint(rectPts(COUPE.intX, -60, W - COUPE.intX + 40, 925), { wash: '#7FA4C4', washOp: 70 * froid, ink: null });
    if (m > 0) {
      paint([[COUPE.intX, 860], [COUPE.intX, 520], [1240, 560], [1275, 650], [1262, 760], [1300, 860]], { wash: '#8C957A', washOp: 110 * m, ink: null, curv: .5 });
      for (let i = 0; i < 26; i++) { const x = COUPE.intX + 6 + hash(i * 2.1) * 80, y = 560 + hash(i * 3.7) * 290, r = (4 + hash(i) * 7) * backOut(seg(m, hash(i + 9) * .5, hash(i + 9) * .5 + .5)); if (r > .5) paint(ellPts(x, y, r, r, 8), { wash: '#4E5E45', washOp: 200, ink: null }); }
    }
    if (sel > 0) for (let i = 0; i < 14; i++) { const x = COUPE.intX + 4 + hash(i * 5.1) * 70, y = 842 - hash(i * 1.9) * 50, r = (7 + hash(i + 2) * 8) * backOut(seg(sel, i / 20, i / 20 + .4)); if (r > .5) paint(cloudPts(x, y, r, r * .7, 4, 0, i), { wash: '#FFFFFF', washOp: 230, ink: PAL.cimentDk, sw: .35 }); }
    etiquette('salpêtre', 1470, 700, 1225, 800, seg(t, 28.5, 29.0), { bend: 20, size: 54, fromX: -60 });
    etiquette('moisissures', 1500, 560, 1245, 640, seg(t, 29.0, 29.5), { bend: -20, size: 54, fromX: -80 });
    if (froid > .3) letter('brrr…', 1815, 640 + Math.sin(t * 30) * 3, 64, PAL.eauDk, { font: 'hand', pop: seg(t, 30.0, 30.4), rot: -.1 + Math.sin(t * 40) * .02, halo: 'rgba(251,247,239,.8)' });
  }
  function hiver(t) {
    const k = ease(seg(t, 31.4, 32.2));
    if (k <= 0) return;
    paint(rectPts(-60, -60, CX0 + 60, 920), { wash: '#6F8FAE', washOp: 110 * k, ink: null });
    paint([[-60, 800], [300, 770], [CX0, 780], [CX0, 862], [-60, 862]], { wash: '#FFFFFF', washOp: 230 * k, ink: null, curv: .5 });
    for (let i = 0; i < 34; i++) {
      const x = (hash(i * 3.3) * (CX0 + 40) + Math.sin(t * 1.5 + i) * 20) - 20, y = ((hash(i * 7.9) * 900 + (t - 31.4) * (70 + hash(i) * 50)) % 900) - 20;
      if (x > CX0 - 10) continue;
      const r = 5 + hash(i + 4) * 5;
      paint(starPts(x, y, r, .35, 6, t + i), { wash: '#FFFFFF', washOp: 240 * k, ink: null });
    }
  }
  function goutteCoincee(g, t, frozen) {
    const a = t - g.st; if (a < 0) return;
    const CL = 2.1;
    if (a < CL + .2) { goutteSurTrajet(g.path, a, CL, GS, { mood: a > CL - .3 ? 'surprised' : 'normal', look: [-1, -.2] }); return; }
    const [x, y] = g.path[g.path.length - 1], b = a - CL - .2;
    const bump = Math.exp(-b * 6) * Math.sin(b * 30);                  // rebond contre le ciment
    const sink = Math.min(b * 6, 40) * hash(g.st * 7);                  // certaines glissent un peu
    const ice = frozen;
    if (ice > 0) paint(starPts(x, y + sink - 10, GS * 1.6 * ice, .45, 6, .3), { wash: '#E2F4FF', washOp: 200 * ice, ink: PAL.eauDk, sw: .5 });
    goutte(x + bump * 10, y + sink, GS, { mood: ice > .5 ? 'squish' : 'worried', sweat: ice > .5 ? 0 : clamp(b * 2), sq: .12 * Math.abs(bump) + .06 * pulse(t, 5), col: mixCol(PAL.eau, '#D6F0FF', ice), look: [-1, 0], shiver: ice });
  }

  // 3A · 22.5 – 27.8 : CLAC ! le ciment
  function clac(t, lt) {
    const k = ease(seg(t, 22.5, 23.4)), [sx, sy] = shakeXY(t, 10 * Math.exp(-Math.max(0, t - CLAC) * 8) * (t > CLAC ? 1 : 0));
    camBegin(lerp(910, 960, k) + sx, 530 + sy, lerp(1.06, 1.03, k), 0);
    drawLayer('c2_coupe', coupeLayer);
    soleil(150, 175, 60, t, { rays: true });
    ciment(t);
    // seaux qui disparaissent
    const out = ease(seg(t, 23.3, 23.9));
    if (out < 1) {
      seau(330, 850 + out * 260, 1.05, { label: 'CIMENT', col: '#9AA0A4', fill: PAL.ciment, labelCol: '#E4E6E7' });
      seau(575, 850 + out * 260, 1.05, { label: 'CHAUX', col: '#ECE8E0', fill: PAL.chaux, heap: true });
    }
    // la truelle : sort du seau chargée de ciment, frappe le mur à plat, lisse vers le bas puis repart
    const up = seg(t, 22.5, 22.85), hit = seg(t, 22.85, CLAC), smooth = seg(t, CLAC + .15, 24.1), gone = seg(t, 24.1, 24.6);
    if (gone < 1) {
      let x = lerp(300, 400, easeOut(up)), y = lerp(690, 540, easeOut(up)), r = lerp(.7, -.4, up);
      if (hit > 0) { x = lerp(400, 654, easeIn(hit)); y = lerp(540, 620, hit); r = lerp(-.4, -1.5708, easeIn(hit)); }
      if (smooth > 0) { y = lerp(620, 790, ease(smooth)); }
      if (gone > 0) { x = lerp(654, 380, ease(gone)); y = lerp(790, 1200, easeIn(gone)); r = lerp(-1.5708, -.6, gone); }
      push(); translate(x, y); rotate(r); truelle(40, 1.3, { rot: 0, load: t < CLAC ? 1 : 0, loadCol: PAL.ciment }); pop();
    }
    if (t > CLAC) for (let i = 0; i < 8; i++) {                         // éclaboussures
      const a = t - CLAC, ang = -Math.PI + (hash(i) - .5) * 2.2, v = 300 + hash(i + 3) * 380;
      const x = 690 + Math.cos(ang) * v * a, y = 480 + Math.sin(ang) * v * a + 900 * a * a;
      if (a < .7) paint(ellPts(x, y, 9 - i * .6, 7 - i * .5, 8), { wash: PAL.ciment, washOp: 255 * (1 - a / .7), ink: PAL.ink, sw: .4 });
    }
    sfx('CLAC !', 470, 360, 120, PAL.cimentDk, t - CLAC, { life: 1.1, rot: -.12 });
    etiquette('enduit ciment', 470, 560, 690, 610, seg(t, 23.9, 24.4), { bend: -10, size: 56, fromX: 60 });
    STUCK.forEach(g => goutteCoincee(g, t, 0));
    camEnd();
  }

  // 3B · 27.8 – 31.5 : l'eau reste piégée, les dégâts gagnent l'intérieur
  function degats(t, lt) {
    camBegin(960, 530, 1 + .02 * ease(lt / 3.7), 0);
    drawLayer('c2_coupe', coupeLayer);
    soleil(150, 175, 60, t, { rays: false, alpha: 1 - seg(t, 30, 31.5) * .6 });
    tacheHumide(t, lerp(860, 330, easeOut(seg(t, 26.2, 31.2))));
    ciment(t);
    degatsInterieur(t);
    etiquette('enduit ciment', 470, 560, 690, 610, 1 - seg(t, 27.8, 28.2), { bend: -10, size: 56, fromX: 60 });
    STUCK.forEach(g => goutteCoincee(g, t, 0));
    camEnd();
  }

  // 3C · 31.5 – 35 : le gel fait éclater l'enduit
  function gel(t, lt) {
    const sh = t > CRAC ? 12 * Math.exp(-(t - CRAC) * 7) : 0, sh2 = t > FALL + LAND ? 8 * Math.exp(-(t - FALL - LAND) * 9) : 0, [sx, sy] = shakeXY(t, sh + sh2);
    camBegin(960 + sx, 530 + sy, 1.02, 0);
    drawLayer('c2_coupe', coupeLayer);
    hiver(t);
    tacheHumide(t, 330);
    ciment(t);
    fissures(t);
    if (t >= FALL) {                                                   // pierres abîmées derrière la plaque
      paint([...CHUNK_TOP, ...CHUNK_BOT].map(([x, y]) => [x + 3, y]), { wash: '#6F665C', washOp: 150, ink: null });
      for (let i = 0; i < 6; i++) paint(stonePts(700 + hash(i) * 30, 420 + i * 36, 12, 9, i + 70, 7), { wash: '#8B8074', washOp: 255, ink: PAL.ink, sw: .5 });
    }
    plaqueQuiTombe(t);
    degatsInterieur(t);
    STUCK.forEach(g => goutteCoincee(g, t, ease(seg(t, 31.9, 32.4))));
    sfx('CRAC !', 480, 300, 130, PAL.tuileDk, t - CRAC, { life: 1.3, rot: -.1 });
    camEnd();
  }

  chapter('ciment', 22.5, 35, [[22.5, clac], [27.8, degats], [31.5, gel]]);
})();
