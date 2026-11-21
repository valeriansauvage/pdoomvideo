// Planches 8–10 — the grave under the tree, the morning after, the goodbye.

const TREE = [1000, 900];                                     // foot of the big tree in the countryside world
const HOLE = [1330, 985];                                     // the grave next to it
const treeWorld = (time = 'dusk', o = {}) => {
  countryside({ time, hy: 610, farm: o.farm });
  paint([[-500, 1000], [400, 870], [1000, 830], [1700, 860], [2900, 1000], [2900, 1500], [-500, 1500]],
    { wash: time === 'night' ? '#262C48' : time === 'dusk' ? '#8E9A62' : '#A9C46E', fill: time === 'night' ? null : '#6E8A4E', fillOp: 60, tex: .6, ink: PAL.ink, sw: .6, curv: .4 });
  bigTree(TREE[0], TREE[1], 1, { night: time === 'night', hole: o.hole ? HOLE : null, mound: o.mound ? [HOLE[0], HOLE[1] - 10] : null, leaves: o.leaves, shade: time !== 'night' });
  if (time === 'dusk') glow(1600, 700, 1600, 500, '#F4A070', 45);
};
const dirtClumps = (cx, cy, rx, ry, n = 14, seed = 1) => { for (let i = 0; i < n; i++) paint(blobPts(cx + (hash(i * 3.1 + seed) - .5) * 2 * rx, cy + (hash(i * 5.7 + seed) - .5) * 2 * ry, 14 + 12 * hash(i), 10 + 8 * hash(i * 2), 8, .35, i + seed), { wash: i % 3 ? PAL.earth : PAL.earthDk, ink: PAL.ink, sw: .3 }); };
// José lying in the grave, face up, head to the left
const joseInGrave = (o = {}) => {
  paint(ellPts(HOLE[0], HOLE[1], 230, 66, 24), { wash: '#3A281C', ink: PAL.ink, sw: .7 });
  fig('jose', HOLE[0] - 10, HOLE[1] + 8, { at: 'hip', outfit: 'heist', view: 'pr', pose: 'lie', rot: -Math.PI / 2, s: .78, ex: o.ex || 'sleep', blood: true, shadow: false, dirt: true, armN: [.2, .3], ...o.f });
  if (o.cover) dirtClumps(HOLE[0] + 40, HOLE[1] + 10, 150 * o.cover, 30, Math.round(26 * o.cover), 5);
  paint([[HOLE[0] - 240, HOLE[1] + 10], [HOLE[0] - 120, HOLE[1] + 62], [HOLE[0] + 120, HOLE[1] + 64], [HOLE[0] + 240, HOLE[1] + 8], [HOLE[0] + 250, HOLE[1] + 70], [HOLE[0] - 250, HOLE[1] + 72]], { wash: '#6E5236', ink: PAL.ink, sw: .6, curv: .2 });
};

// ----------------------------------------------------------------------------------- Planche 8 — sous l'arbre
page(8, [
  [1.15, [{
    draw(w, h) {
      cam(1150, 760, .78);
      treeWorld('dusk', { hole: true });
      joseInGrave({});
      suitcase(1540, 1010, .7, { col: '#4A3E5A' });
      fig('cris', 820, 1010, { outfit: 'heist', pose: 'kneel', view: 'r', ex: 'sad', dirt: true, look: [1, .5] });
      fig('thibaut', 1700, 1020, { outfit: 'heist', view: 'l', dirt: true, ex: 'blank', reachN: [1640, 760], reachF: [1600, 860], holdN: (u) => {} });
      shovel(1610, 1005, 1, .18);
    },
    cap: [{ t: 'Le soir tombe.', at: 'tl' }],
  }]],
  [1, [{
    w: .9,
    draw(w, h) {
      cam(1520, 810, 1.25);
      treeWorld('dusk', { hole: true });
      suitcase(1440, 1030, 1, { open: 'cash', col: '#4A3E5A' });
      fig('thibaut', 1610, 1040, { outfit: 'heist', view: 'l', pose: 'kneel', dirt: true, ex: 'sly', look: [-1, .5], reachN: [1470, 905], holdN: hCash, reachF: [1640, 840], holdF: hCash });
    },
  }, {
    w: 1.1,
    draw(w, h) {
      cam(1260, 980, 2.3);
      treeWorld('dusk', { hole: true });
      joseInGrave({ f: { eyes: 'half', brows: 'worried', mouth: 'flat' }, cover: .5 });
      for (let i = 0; i < 9; i++) { const x = 1150 + i * 17, y = 905 + hash(i) * 40; paint(blobPts(x, y, 6, 5, 7, .3, i), { wash: PAL.earth, ink: PAL.ink, sw: .25 }); }
      for (const k of [-1, 1]) inkLine([[1138 + k * 8, 950], [1140 + k * 14, 940]], .5, PAL.ink, 'inkfine', 0);
    },
  }]],
  [1, [{
    w: .8,
    draw(w, h) {
      cam(1030, 640, 1.35);
      treeWorld('dusk', { hole: true });
      fig('cris', 1030, 1000, { outfit: 'heist', pose: 'kneel', view: 'r', dirt: true, ex: 'shout', eyes: 'wide', armN: [1.4, .5], handN: 'open', armF: [1.2, .3], handF: 'open' });
    },
    bub: [{ s: 'cris', t: 'Ele ainda está vivo!', tr: 'Il est encore vivant !', kind: 'shout', x: .5, y: .18, mw: 200 }],
  }, {
    draw(w, h) {
      cam(1195, 930, 2.1);
      treeWorld('dusk', { hole: true });
      joseInGrave({ f: { eyes: 'half', mouth: 'open' }, cover: .45 });
      fig('cris', 1215, 880, { at: 'head', outfit: 'heist', view: 'pr', rot: 1.2, eyes: 'closed', brows: 'worried', mouth: 'flat', dirt: true, shadow: false, reachN: [1250, 990], reachF: [1130, 985] });
    },
    bub: [{ s: 'jose', t: 'Eu te amo.', tr: 'Je t’aime.', kind: 'whisper', x: .27, y: .18, mw: 170 }],
  }, {
    draw(w, h) {
      cam(1195, 930, 2.1);
      treeWorld('dusk', { hole: true });
      joseInGrave({ f: { eyes: 'closed', mouth: 'smile' }, cover: .45 });
      fig('cris', 1196, 930, { at: 'head', outfit: 'heist', view: 'pr', rot: 1.3, eyes: 'shut', brows: 'worried', mouth: 'kiss', dirt: true, shadow: false, reachN: [1250, 990], reachF: [1125, 990] });
      paint([[1166, 950], [1171, 962], [1166, 967], [1161, 962]], { wash: '#8EC3E6', ink: '#4A7FAF', sw: .3, curv: .5 });
    },
    bub: [{ s: 'jose', t: 'Eu te amo, Thibaut.', tr: 'Je t’aime, Thibaut.', kind: 'whisper', x: .27, y: .18, mw: 190 }],
  }]],
  [1.1, [{
    draw(w, h) {
      cam(1330, 735, .95);
      treeWorld('dusk', { hole: true });
      joseInGrave({ cover: .9 });
      shovel(1500, 935, .9, .9);
      dirtClumps(1490, 930, 30, 14, 5, 8);
      fig('thibaut', 1700, 1030, { outfit: 'heist', view: 'l', tor: .2, dirt: true, ex: 'sad', tears: true, reachN: [1640, 820], reachF: [1690, 785], handN: 'fist', handF: 'fist' });
      fig('cris', 930, 1010, { outfit: 'heist', pose: 'kneel', view: 'r', dirt: true, ex: 'cry', tears: true, reachN: 'eye' });
    },
    bub: [{ s: 'thibaut', t: 'Que Deus o tenha em Sua glória.', tr: 'Que Dieu l’ait en Sa gloire.', x: .55, y: .16, mw: 260 }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 9 — le réveil
const sleepers = (o = {}) => {
  fig('cris', 860, 985, { at: 'hip', outfit: 'heist', view: 'pr', pose: 'lie', rot: -Math.PI / 2 + .05, ex: 'sleep', dirt: true, sweat: o.sweat, shadow: false, armN: [.6, 1.5], legN: [.2, .4], ...o.c });
  fig('thibaut', 930, 1035, { at: 'hip', outfit: 'heist', view: 'pr', pose: 'lie', rot: -Math.PI / 2, ex: 'sleep', dirt: true, sweat: o.sweat, shadow: false, armN: [.3, 1.2], legF: [.3, .6], ...o.t });
};
page(9, [
  [1, [{
    draw(w, h) {
      cam(1250, 880, 1.15);
      treeWorld('dusk', { mound: true, leaves: true });
      fig('cris', 1120, 1010, { outfit: 'heist', pose: 'kneel', view: 'r', dirt: true, ex: 'tired', reachN: [1230, 990], reachF: [1260, 980] });
      fig('thibaut', 1480, 1020, { outfit: 'heist', pose: 'crouch', view: 'l', dirt: true, ex: 'tired', reachN: [1390, 990], holdN: (u) => { paint(capsule(0, 0, 40 * u, -6 * u, 1 * u, .6 * u, 3), { wash: '#6E4E36', ink: PAL.ink, sw: .3 }); for (let i = 0; i < 6; i++) paint(ellPts((10 + i * 5) * u, (-4 + (i % 2) * 5) * u, 3 * u, 1.6 * u, 8, 0, i), { wash: '#6E8A3E', ink: null }); } });
    },
  }, {
    draw(w, h) {
      cam(1000, 860, 1.05);
      treeWorld('night', { mound: true, leaves: true });
      sleepers({});
      panelWash('#1F2550', 70);
    },
    sfx: [{ t: 'Z z z', x: .4, y: .5, size: 40, rot: -.1, col: '#C9D2F0' }],
  }]],
  [1.1, [{
    draw(w, h) {
      cam(1200, 640, .55);
      treeWorld('afternoon', { mound: true, leaves: true, farm: [2350, 700, .5] });
      sleepers({});
      musicNotes(2050, 380, 1.4, 4, '#5A4A6A');
    },
    cap: [{ t: 'Le lendemain, un après-midi ensoleillé.', at: 'tl' }],
    sfx: [{ t: '♪', x: .86, y: .3, size: 50, rot: .1, col: PAL.cream }],
  }]],
  [1, [{
    w: 1.1,
    draw(w, h) {
      cam(930, 610, 2.6);
      treeWorld('afternoon', { mound: true, leaves: true });
      fig('thibaut', 900, 600, { at: 'head', outfit: 'heist', view: 'pr', pose: 'lie', rot: -Math.PI / 2, dirt: true, sweat: true, eyes: 'closed', brows: 'worried', mouth: 'wobble', shadow: false });
      fly(985, 560, 1.4);
    },
    sfx: [{ t: 'BZZZ', x: .72, y: .2, size: 50, rot: .14, col: PAL.cream }],
  }, {
    w: .9,
    draw(w, h) {
      cam(960, 760, .8);
      treeWorld('afternoon', { mound: true, leaves: true });
      fig('cris', 860, 985, { at: 'hip', outfit: 'heist', view: 'pr', pose: 'lie', rot: -Math.PI / 2 + .05, ex: 'sleep', dirt: true, shadow: false, armN: [.6, 1.5] });
      fig('thibaut', 1060, 1010, { outfit: 'heist', view: 'l', dirt: true, ex: 'blank', legN: [.75, .25], legF: [-.1, 0], tor: -.05 });
    },
    bub: [{ s: 'thibaut', t: 'Levante-se.', tr: 'Debout.', x: .28, y: .2 }],
  }]],
  [1.05, [{
    draw(w, h) {
      cam(960, 750, .85);
      treeWorld('afternoon', { mound: true, leaves: true });
      fig('cris', 850, 1000, { outfit: 'heist', pose: 'sitFloor', view: 'r', dirt: true, ex: 'sad', look: [1, -.8], reachN: [940, 860], holdN: hWallet, handN: 'fist' });
      fig('thibaut', 1080, 1010, { outfit: 'heist', view: 'l', dirt: true, ex: 'tired', armN: [.9, .5], handN: 'open' });
    },
    bub: [{ s: 'thibaut', t: 'Já está na hora. Sua carteira.', tr: 'C’est l’heure. Ton portefeuille.', x: .32, y: .18, mw: 260 }],
  }, {
    draw(w, h) {
      cam(975, 740, .9);
      treeWorld('afternoon', { mound: true, leaves: true });
      fig('cris', 860, 1000, { outfit: 'heist', pose: 'sitFloor', view: 'r', dirt: true, ex: 'sad', look: [1, -.8], reachN: [930, 850], holdN: hWallet });
      fig('thibaut', 1060, 1010, { outfit: 'heist', view: 'l', dirt: true, ex: 'blank', reachN: [1010, 700], holdN: hCash, reachF: [1050, 640] });
    },
    bub: [{ s: 'thibaut', t: 'Você não precisa de dinheiro.', tr: 'Tu n’as pas besoin d’argent.', x: .3, y: .18, mw: 250 }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 10 — l'adieu
const pairUnderTree = (o = {}) => {
  treeWorld('afternoon', { mound: true, leaves: true });
  fig('cris', 900, 1010, { outfit: 'heist', view: 'r', dirt: true, ...o.c });
  fig('thibaut', 1080, 1015, { outfit: 'heist', view: 'l', dirt: true, ...o.t });
};
page(10, [
  [1, [{
    w: 1.2,
    draw(w, h) { cam(990, 560, 1.5); pairUnderTree({ c: { ex: 'sadtalk', look: [1, -.3] }, t: { ex: 'smirk' } }); },
    bub: [{ s: 'cris', t: 'Um beijo de despedida?', tr: 'Un baiser d’adieu ?', x: .25, y: .15 }, { s: 'thibaut', t: 'Que tal um olho roxo?', tr: 'Et un œil au beurre noir ?', x: .75, y: .3 }],
  }, {
    w: .8,
    draw(w, h) { cam(905, 590, 2.6); treeWorld('afternoon', { mound: true }); fig('cris', 905, 590, { at: 'head', outfit: 'heist', view: 'r', dirt: true, eyes: 'closed', brows: 'worried', mouth: 'flat', nk: -.15 }); },
    bub: [{ s: 'cris', t: 'Então me bata.', tr: 'Alors frappe-moi.', x: .3, y: .17, mw: 180 }],
  }]],
  [1, [{
    draw(w, h) {
      cam(990, 580, 1.6);
      treeWorld('afternoon', { mound: true });
      fig('cris', 930, 1010, { outfit: 'heist', view: 'r', dirt: true, tor: -.25, nk: -.3, ex: 'pain', armN: [.6, .6], armF: [.8, .4], handF: 'open' });
      fig('thibaut', 1080, 1015, { outfit: 'heist', view: 'l', dirt: true, ex: 'angry', tor: .2, reachN: [955, 600], handN: 'fist' });
      paint(starPts(950, 600, 70, .45, 8, .2), { wash: '#FFE27A', ink: PAL.ink, sw: .5 });
    },
    sfx: [{ t: 'PAF !', x: .3, y: .22, size: 96, rot: -.18, col: '#F2B23A' }],
  }, {
    draw(w, h) {
      cam(990, 700, 1.4);
      treeWorld('afternoon', { mound: true });
      fig('cris', 900, 1010, { outfit: 'heist', view: 'r', dirt: true, tor: .75, nk: .5, ex: 'pain', blackEye: true, reachN: 'eye', armF: [.7, .5] });
      fig('thibaut', 1110, 1015, { outfit: 'heist', view: 'l', dirt: true, ex: 'blank' });
    },
    sfx: [{ t: 'AÏE…', x: .3, y: .25, size: 42, rot: -.1, col: PAL.cream }],
  }]],
  [1.05, [{
    w: 1.1,
    draw(w, h) {
      cam(990, 610, 2.3);
      treeWorld('afternoon', { mound: true });
      fig('thibaut', 1022, 588, { at: 'head', outfit: 'heist', view: 'pl', dirt: true, ex: 'kiss', nk: .28, reachN: [940, 660] });
      fig('cris', 960, 612, { at: 'head', outfit: 'heist', view: 'pr', dirt: true, blackEye: true, ex: 'kiss', nk: -.15, reachN: [1020, 650] });
      paint(heartPts(1000, 520, 16), { wash: '#E2476E', ink: PAL.ink, sw: .4 });
    },
  }, {
    w: .9,
    draw(w, h) {
      cam(1000, 610, 1.2);
      treeWorld('afternoon', { mound: true });
      fig('cris', 820, 1010, { outfit: 'heist', view: 'r', dirt: true, blackEye: true, eyes: 'wide', brows: 'worried', mouth: 'flat', look: [1, -.3], nk: -.1 });
      fig('thibaut', 1170, 1015, { outfit: 'heist', view: 'l', dirt: true, ex: 'sad', pose: 'walk', ph: .1 });
      for (let i = 0; i < 3; i++) inkLine([[1300 + i * 30, 900 - i * 40], [1340 + i * 30, 900 - i * 40]], .5, PAL.ink, 'inkfine', 0);
    },
  }]],
  [1.1, [{
    draw(w, h) {
      cam(1000, 640, .6);
      treeWorld('afternoon', { mound: true, leaves: true });
      for (let i = 0; i < 5; i++) treeRound(1700 + i * 120, 960 + (i % 2) * 20, 1.3, {});
      fig('thibaut', 1640, 1010, { outfit: 'heist', view: 'b', pose: 'walk', ph: .3, s: .55, dirt: true });
      fig('cris', 400, 1060, { outfit: 'heist', view: 'l', pose: 'walk', ph: .6, s: .6, dirt: true, blackEye: true, ex: 'sad' });
    },
  }]],
]);
