// c1_vieux_bati : 0 – 10 s. Un village à l'aube, le titre se peint dans le ciel, puis on s'approche d'une vieille
// maison en pierre : ses volets s'ouvrent, et son mur « respire » de petites bouffées de vapeur.
(() => {
  const HX = 1395, HY = 905, HS = .62;                     // la maison dans le plan large
  const MX = 960, MY = 930, MS = 1.32;                     // la maison en gros plan

  // ---------- décors (calques) ----------
  function ciel(top = '#CFE3EE') {
    paint(rectPts(-40, -40, W + 80, H + 80), { wash: top, washOp: 255, ink: null });
    paint(rectPts(-40, 250, W + 80, 560), { wash: PAL.aube, washOp: 130, ink: null });
    paint(rectPts(-40, 430, W + 80, 380), { wash: '#F3C49A', washOp: 110, ink: null });
    paint(rectPts(-40, -40, W + 80, 820), { fill: '#A8CBE0', fillOp: 70, bleed: .25, tex: .4, border: .2, ink: null });
  }
  function petiteMaison(x, y, s, seed) {
    const w = (60 + hash(seed) * 30) * s, h = (40 + hash(seed + 1) * 16) * s, rh = (26 + hash(seed + 2) * 12) * s;
    const wall = pick(['#E7DCC6', '#E9D2A8', '#DCCDB2', '#EEDFC2'], seed), roofC = pick([PAL.tuile, '#B45C3C', '#A9543A', '#8C6B64'], seed + 3);
    paint(rectPts(x - w / 2, y - h, w, h, .5), { wash: wall, washOp: 255, ink: PAL.ink, sw: .55 });
    paint([[x - w / 2 - 6 * s, y - h], [x - w / 2 + 12 * s, y - h - rh], [x + w / 2 - 12 * s, y - h - rh], [x + w / 2 + 6 * s, y - h]], { wash: roofC, washOp: 255, ink: PAL.ink, sw: .55 });
    for (let i = 0; i < 2; i++) paint(rectPts(x - w * .3 + i * w * .38, y - h * .7, 9 * s, 12 * s), { wash: '#5C6F78', washOp: 255, ink: null });
  }
  function clocher(x, y, s) {
    paint(rectPts(x - 26 * s, y - 150 * s, 52 * s, 150 * s, .5), { wash: '#E3D7C0', washOp: 255, ink: PAL.ink, sw: .6 });
    paint([[x - 32 * s, y - 150 * s], [x, y - 235 * s], [x + 32 * s, y - 150 * s]], { wash: '#6E7C8C', washOp: 255, ink: PAL.ink, sw: .6 });
    inkLine([[x, y - 235 * s], [x, y - 262 * s]], .7, PAL.ink, 'inkfine', 0);
    inkLine([[x - 8 * s, y - 252 * s], [x + 8 * s, y - 252 * s]], .7, PAL.ink, 'inkfine', 0);
    paint(ellPts(x, y - 118 * s, 11 * s, 14 * s, 10), { wash: '#4E5A63', washOp: 255, ink: null });
  }
  function muret(x0, x1, y, s = 1) {
    let x = x0, i = 0;
    while (x < x1) { const w = (34 + hash(i * 3.7) * 30) * s; paint(stonePts(x + w / 2, y - 14 * s - (i % 2) * 18 * s, w / 2, 11 * s, i + 40, 9), { wash: pick(STONES, i + 9), washOp: 255, ink: PAL.ink, sw: .5 }); x += w * .82; i++; }
  }
  function village() {
    ciel();
    // collines lointaines, puis la colline du village
    paint([[-40, 600], [260, 540], [560, 575], [900, 520], [1260, 560], [1600, 515], [1960, 560], [1960, 760], [-40, 760]], { wash: '#BCCAC6', washOp: 255, fill: '#9CB1AD', fillOp: 70, bleed: .08, tex: .5, ink: null, curv: .5 });
    paint([[-40, 700], [200, 640], [480, 610], [760, 628], [1040, 600], [1320, 650], [1600, 640], [1960, 690], [1960, 860], [-40, 860]], { wash: '#C9D5AE', washOp: 255, fill: '#9FB585', fillOp: 90, bleed: .08, tex: .6, ink: null, curv: .5 });
    const vil = [[220, 650, .9], [300, 640, 1], [390, 628, .85], [470, 622, 1.05], [610, 628, .9], [690, 640, 1.1], [790, 634, .8], [880, 624, .95], [960, 618, 1]];
    clocher(545, 630, 1);
    vil.forEach(([x, y, s], i) => petiteMaison(x, y, s, i * 5 + 1));
    for (let i = 0; i < 9; i++) arbre(120 + i * 110 + hash(i) * 40, 655 + hash(i + 3) * 30, .28 + hash(i + 7) * .08, { col: pick([PAL.sauge, '#8FAA7A', '#A3B98C'], i), seed: i });
    // prairie du premier plan
    paint([[-40, 840], [400, 800], [900, 815], [1300, 790], [1960, 820], [1960, 1120], [-40, 1120]], { wash: '#B6CC98', washOp: 255, fill: PAL.sauge, fillOp: 110, bleed: .1, tex: .7, ink: PAL.ink, sw: .9, curv: .5 });
    paint([[980, 1120], [1180, 930], [1240, 925], [1250, 1120]], { wash: '#E4D5B5', washOp: 255, ink: null });           // chemin
    arbre(1000, 905, 1.25, { tex: true, seed: 2 });
    maison(HX, HY, HS, { facade: 'pierre', fillTex: true });
    muret(1030, 1960, 985, 1);
    for (let i = 0; i < 7; i++) touffe(80 + i * 150, 900 + hash(i) * 40, 1.1, PAL.olive, 7, i);
    fleurs(300, 930, 1.2, [PAL.rose, '#E9C46A', '#FFFFFF'], 7, 1); fleurs(760, 910, 1.1, ['#B895D6', '#FFFFFF', PAL.rose], 6, 5);
  }
  function maisonProche() {
    ciel('#D5E7F0');
    paint([[-40, 760], [500, 720], [1100, 745], [1960, 710], [1960, 1120], [-40, 1120]], { wash: '#C5D6A6', washOp: 255, fill: '#9FB585', fillOp: 80, bleed: .08, tex: .6, ink: null, curv: .5 });
    arbre(170, 880, 1.9, { tex: true, seed: 6 });
    arbre(1790, 870, 1.6, { tex: true, seed: 9, col: '#A3B98C' });
    paint([[-40, 900], [1960, 890], [1960, 1120], [-40, 1120]], { wash: '#B3C996', washOp: 255, fill: PAL.sauge, fillOp: 100, bleed: .08, tex: .7, ink: PAL.ink, sw: .9 });
    maison(MX, MY, MS, { facade: 'pierre', fillTex: true, noShutters: true });
    paint([[MX - 210, 1120], [MX - 175, MY], [MX - 75, MY], [MX - 30, 1120]], { wash: '#E6D8BA', washOp: 255, ink: PAL.ink, sw: .6 });       // allée
    for (let i = 0; i < 6; i++) touffe(40 + i * 90, 960 + hash(i) * 30, 1.3, PAL.olive, 7, i + 20);
    fleurs(520, 925, 1.5, [PAL.rose, '#E9C46A', '#FFFFFF'], 7, 2); fleurs(1480, 925, 1.5, ['#B895D6', '#FFFFFF', PAL.rose], 7, 8);
    touffe(1650, 950, 1.4, PAL.olive, 8, 30);
  }

  // ---------- éléments animés ----------
  function fumee(x, y, t, s = 1, n = 5) {
    for (let i = 0; i < n; i++) {
      const age = frac(t * .22 + i / n), yy = y - age * 190 * s, xx = x + Math.sin(age * 5 + i) * 18 * s + age * 40 * s;
      paint(ellPts(xx, yy, (14 + age * 30) * s, (10 + age * 20) * s, 12), { wash: '#FFFFFF', washOp: 110 * (1 - age), ink: null });
    }
  }
  function brume(t, y, a = 1) {
    for (let i = 0; i < 3; i++) {
      const x = ((t * 26 + i * 700) % 2600) - 400;
      paint(cloudPts(x, y + i * 18, 380, 26, 3, 0, i), { wash: '#FFFFFF', washOp: 70 * a, ink: null });
    }
  }
  function nuages(t, y0 = 150) {
    nuage(260 + t * 14, y0, .9, { seed: 1, op: 170 });
    nuage(1180 + t * 10, y0 - 50, .7, { seed: 3, op: 150 });
    nuage(1700 + t * 12, y0 + 40, .6, { seed: 5, op: 140 });
  }
  function oiseaux(t, x0, y0, sens = 1) {
    for (let i = 0; i < 3; i++) oiseau(x0 + sens * t * 90 + i * 46, y0 + Math.sin(t * 2 + i) * 10 + (i % 2) * 26, 1.2 - i * .15, t, i * .3);
  }
  // ---------- plans ----------
  // 1A · 0 – 4.6 : le village à l'aube, le titre se peint dans le ciel
  function aube(t, lt) {
    const push1 = ease(seg(t, 3.9, 4.6));
    const zoom = lerp(1 + .035 * ease(t / 3.9), 1.55, easeIn(push1));
    const cx = clamp(lerp(960, HX - 20, push1), 960 / zoom, W - 960 / zoom), cy = clamp(lerp(540, 700, push1), 540 / zoom, H - 540 / zoom);
    camBegin(cx, cy, zoom, 0);
    drawLayer('c1_village', village);
    const sy = lerp(470, 330, easeOut(t / 4.6));
    soleil(1580, sy, 58, t, { alpha: 1 });
    nuages(t);
    brume(t, 700, .8);
    fumee(HX + 175 * HS, HY - 675 * HS, t, .8);
    oiseaux(t, 700, 250);
    // titre
    const ta = 1 - ease(seg(t, 3.6, 4.1));
    letter('La chaux', 560, 190, 176, PAL.ink, { font: 'title', pop: seg(t, .75, 1.25), alpha: ta });
    letter('le souffle du vieux bâti', 575, 318, 90, PAL.ocreDk, { font: 'hand', pop: seg(t, 1.25, 1.7), alpha: ta, rot: -.03 });
    const u = ease(seg(t, 1.7, 2.5));
    if (u > 0 && ta > .05) inkLine(partial([[318, 378], [470, 370], [640, 376], [838, 366]], u), 2.6, mixCol(PAL.ocre, PAL.paper, 1 - ta), 'ink', .5);
    camEnd();
    revealBlob(t, .05, 1.45, 860, 500, PAL.paper, 1);                // l'image apparaît dans une tache de peinture
  }

  // 1B · 4.6 – 10 : la maison de près ; les volets s'ouvrent, le mur respire
  function maisonRespire(t, lt) {
    const zoom = lerp(1.1, 1.0, easeOut(lt / 1.2)) + .025 * ease(seg(t, 5.8, 10));
    camBegin(960, 520, zoom, 0);
    drawLayer('c1_maison', maisonProche);
    const op = houseOpenings(MX, MY, MS), sw = 1.05;
    op.win.forEach((wn, i) => {
      const o = ease(seg(t, 5.05 + i * .32, 5.6 + i * .32));
      volet(wn, -1, o, sw * .8, PAL.volet, 12 * MS); volet(wn, 1, o, sw * .8, PAL.volet, 12 * MS);
    });
    fumee(MX + 175 * MS, MY - 675 * MS, t, 1.4);
    nuages(t, 120);
    oiseaux(t - 4.6, 1180, 170, -1);
    // le mur respire : de la façade montent des volutes de vapeur (le pictogramme de la buée), au rythme d'un souffle
    const b = seg(t, 7.1, 7.7), SPOTS = [[-330, -170], [30, -150], [335, -40], [-345, -420], [0, -415], [335, -330], [30, -300]];
    if (b > 0) SPOTS.forEach(([dx, dy], i) => {
      const age = frac((t - 7.1) / 1.9 + i * .37), k = b * inOut(age, 0, 1, .3);
      if (k < .04) return;
      const x0 = MX + dx, y0 = MY + dy - age * 60;
      for (let j = -1; j <= 1; j++) {
        const pts = [];
        for (let q = 0; q <= 8; q++) { const u = q / 8; pts.push([x0 + j * 17 + Math.sin(u * 2 * TAU - t * 5 + j) * 7, y0 - u * (62 + 12 * (1 - Math.abs(j)))]); }
        inkLine(pts, 3.4 * k, '#FFFFFF', 'ink', .6);
        inkLine(pts, 1.5 * k, mixCol(PAL.eau, '#FFFFFF', 1 - k), 'inkfine', .6);
      }
    });
    // deux petites bouffées heureuses s'envolent au-dessus du toit
    for (let i = 0; i < 2; i++) {
      const age = (t - 7.6 - i * .9) / 2.2; if (age < 0 || age > 1) continue;
      vapeur(MX - 150 + i * 330 + Math.sin(age * 5) * 20, MY - 520 - age * 330, 34, { alpha: inOut(age, 0, 1, .2), face: true, mood: 'happy', seed: i + 3 });
    }
    camEnd();
  }

  chapter('vieux-bati', 0, 10, [[0, aube], [4.6, maisonRespire]]);
})();
