// Planches 24–26 — Vlad comes back, the gold, the end. (After the script's outline of the ending.)

const nightTree = (o = {}) => { nightWoods({ tree: [1200, 900], mound: o.mound ? [1450, 905] : null, hole: o.hole ? [1450, 960] : null, moon: [300, 60] }); };

// ----------------------------------------------------------------------------------- Planche 25 — Vlad revient
page(25, [
  [1, [{
    w: .8,
    draw(w, h) { cam(1500, 700, .7); farmyard({ time: 'dusk', table: false }); glow(1500, 600, 1600, 600, '#F4A070', 50); car(2250, 1010, 1, { col: '#6E7F92' }); fig('vlad', 1900, 1040, { view: 'l', outfit: 'plain', pose: 'walk', ph: .3, ex: 'neutral' }); fig('cris', 1100, 1030, { outfit: 'farm2', view: 'r', ex: 'worried', reachN: [1050, 900], holdN: (u) => bucket(2 * u, 10 * u, u / 4.4 * .55, false) }); },
    cap: [{ t: 'Peu après, en fin d’après-midi.', at: 'tl' }],
  }, {
    w: 1.2,
    draw(w, h) { cam(1380, 540, 1.4); farmyard({ time: 'dusk', table: false }); glow(1500, 600, 1600, 600, '#F4A070', 50); fig('cris', 1260, 1030, { outfit: 'farm2', view: 'r', ex: 'scared', look: [1, 0] }); fig('vlad', 1500, 1040, { view: 'l', outfit: 'plain', ex: 'talk', armN: [.8, .9], handN: 'open' }); },
    bub: [{ s: 'vlad', t: 'I recognized you. The protest, in Paris.', tr: 'Je vous ai reconnue. La manif, à Paris.', x: .5, y: .13, mw: 300 }, { s: 'vlad', t: 'You and the man with the suitcase — there’s a connection.', tr: 'Vous et l’homme à la valise : il y a un lien.', x: .8, y: .4, mw: 230, link: true }],
  }]],
  [1, [{
    draw(w, h) { cam(1260, 600, 2.3); farmyard({ time: 'dusk', table: false }); glow(1500, 600, 1600, 600, '#F4A070', 50); fig('cris', 1260, 590, { at: 'head', outfit: 'farm2', view: 'r', ex: 'cry', tears: true }); },
    bub: [{ s: 'cris', t: 'José… He made me go along with the burglary. Then he left me and ran off with the gold.', tr: 'José… Il m’a forcée à participer au cambriolage. Puis il m’a laissée tomber et il est parti avec l’or.', x: .5, y: .22, mw: 340, size: .95 }],
  }, {
    draw(w, h) { cam(1390, 560, 1.75); farmyard({ time: 'dusk', table: false }); glow(1500, 600, 1600, 600, '#F4A070', 50); fig('vlad', 1500, 1040, { view: 'l', outfit: 'plain', ex: 'love', blush: true, look: [-1, .2] }); fig('cris', 1330, 1030, { outfit: 'farm2', view: 'r', ex: 'sly', eyes: 'half', blush: true, tor: .12, reachN: [1460, 720], reachF: [1440, 640], handF: 'open' }); },
    bub: [{ s: 'cris', t: 'He’s hurt. He can’t get too far too fast. I’ll do anything I can to help you find him.', tr: 'Il est blessé. Il ne peut pas aller bien loin, ni bien vite. Je ferai tout pour vous aider à le retrouver.', x: .4, y: .22, mw: 320, size: .92 }],
  }]],
  [1, [{
    w: .6,
    draw(w, h) { cam(530, 600, 1.35); hallway({ td: .12, ld: 0, lamp: 70 }); paint(ellPts(460, 610, 14, 14, 10), { wash: CAST.cris.skin, ink: PAL.ink, sw: .4 }); paint(rectPts(300, 880, 120, 30), { wash: '#7B4F34', ink: PAL.ink, sw: .4 }); paint(rectPts(330, 860, 90, 24), { wash: '#E7D9B8', ink: PAL.ink, sw: .4 }); },
    sfx: [{ t: 'CLIC', x: .7, y: .35, size: 46, rot: .1, col: PAL.cream }],
  }, {
    w: 1.4,
    draw(w, h) {
      cam(1500, 560, .95);
      livingRoom({ night: true, fire: true, piano: false });
      fig('louise', 1450, 772, { at: 'hip', pose: 'sit', view: 'r', ex: 'kiss', blush: true, nk: .15, reachN: [1540, 640] });
      fig('thibaut', 1690, 772, { at: 'hip', outfit: 'farm', pose: 'sit', view: 'l', ex: 'kiss', nk: .2, skip: ['armN', 'armF'] });
      guitar(1660, 720, .85, Math.PI + .5);
      fig('thibaut', 1690, 772, { at: 'hip', outfit: 'farm', pose: 'sit', view: 'l', only: ['armN', 'armF'], reachN: [1640, 715], reachF: [1520, 640] });
      musicNotes(1450, 420, 1, 3, '#F6E6C0');
      paint(heartPts(1580, 470, 18), { wash: '#E2476E', ink: PAL.ink, sw: .4 });
    },
    cap: [{ t: 'Pendant ce temps…', at: 'tl' }],
  }]],
  [1.05, [{
    draw(w, h) {
      cam(900, 620, .95);
      nightBedroom({});
      fig('vlad', 720, 700, { at: 'hip', outfit: 'plain', topStyle: 'bare', view: 'pr', pose: 'lie', rot: -Math.PI / 2, ex: 'sleep', armN: [2.6, .5] });
      paint([[300, 700], [1200, 690], [1210, 790], [300, 800]], { wash: '#C9CCE6', fill: '#8E92C0', fillOp: 70, ink: PAL.ink, sw: .6, curv: .2 });
      fig('cris', 1350, 1010, { outfit: 'night', view: 'r', pose: 'walk', ph: .15, tor: .1, ex: 'determined', look: [1, 0], armN: [.6, .9], handN: 'open' });
      panelWash('#1A1E44', 50);
    },
    cap: [{ t: 'Tard dans la soirée.', at: 'tl', col: '#D9DCF0' }],
    sfx: [{ t: 'RRR… PSCHH…', x: .25, y: .3, size: 40, rot: -.05, col: '#C9D2F0' }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 26 — l'or
page(26, [
  [1.05, [{
    w: 1.1,
    draw(w, h) { cam(1300, 760, .9); nightTree({ hole: true }); fig('cris', 1640, 1040, { outfit: 'night', view: 'l', tor: .4, ex: 'determined', sweat: true, reachN: [1540, 930], reachF: [1570, 820], dirt: true }); shovel(1530, 930, .9, -2.0); suitcase(1450, 980, .8, { col: '#3E4C6E' }); },
    cap: [{ t: 'Dans les bois, la nuit.', at: 'tl', col: '#D9DCF0' }],
  }, {
    w: .9,
    draw(w, h) {
      cam(1420, 930, 1.6);
      nightTree({ hole: true });
      suitcase(1500, 1000, 1, { open: 'gold', col: '#3E4C6E' });
      fig('cris', 1380, 1000, { at: 'hip', outfit: 'night', view: 'pl', pose: 'lie', rot: Math.PI / 2 - .25, ex: 'dreamy', dirt: true, armN: [2.2, .4], armF: [1.0, 1.2] });
    },
  }]],
  [1, [{
    w: .9,
    draw(w, h) {
      cam(1300, 700, 1.0);
      nightTree({ hole: true });
      suitcase(1500, 1000, .9, { open: 'gold', col: '#3E4C6E' });
      fig('cris', 1430, 1010, { outfit: 'night', view: 'r', pose: 'kneel', ex: 'shock', look: [-1, 0], dirt: true });
      fig('thibaut', 1060, 1030, { outfit: 'night', view: 'r', ex: 'shock', reachN: [1160, 760], holdN: hFlashlight });
    },
    sfx: [{ t: '!', x: .3, y: .25, size: 90, col: PAL.ochre }, { t: '!', x: .78, y: .3, size: 90, col: PAL.ochre }],
  }, {
    w: 1.1,
    draw(w, h) {
      cam(1300, 640, 1.9);
      nightTree({ hole: true });
      fig('thibaut', 1335, 590, { at: 'head', outfit: 'night', view: 'pl', ex: 'kiss', nk: .25, reachN: [1250, 690] });
      fig('cris', 1272, 612, { at: 'head', outfit: 'night', view: 'pr', ex: 'kiss', blackEye: true, nk: -.15, reachN: [1360, 660], reachF: [1340, 620] });
      paint(heartPts(1300, 500, 18), { wash: '#E2476E', ink: PAL.ink, sw: .4 });
    },
  }]],
  [1, [{
    w: .9,
    draw(w, h) {
      cam(1450, 900, 1.5);
      nightTree({ hole: true });
      paint(capsule(1420, 990, 1370, 950, 13, 11, 4), { wash: '#7E8A7A', ink: PAL.ink, sw: .5 });
      for (let i = 0; i < 4; i++) paint(capsule(1370, 950, 1350 - i * 6, 925 + i * 5, 4, 3.5, 3), { wash: '#7E8A7A', ink: PAL.ink, sw: .35 });
      fig('cris', 1600, 1020, { outfit: 'night', view: 'l', tor: -.35, ex: 'scared', reachN: 'mouth', dirt: true });
      fig('thibaut', 1250, 1030, { outfit: 'night', view: 'r', tor: -.3, ex: 'shock' });
    },
  }, {
    w: 1.1,
    draw(w, h) {
      cam(1300, 610, 1.7);
      nightTree({ hole: true });
      fig('cris', 1200, 1020, { outfit: 'night', view: 'r', ex: 'happy', blackEye: true, dirt: true });
      fig('thibaut', 1420, 1030, { outfit: 'night', view: 'l', ex: 'smirk', reachN: [1340, 610], holdN: hKeys });
    },
    bub: [{ s: 'thibaut', t: 'Portugal.', x: .78, y: .17 }],
    sfx: [{ t: 'CLING', x: .48, y: .2, size: 44, rot: -.1, col: PAL.gold }],
  }]],
  [1.05, [{
    draw(w, h) {
      cam(1150, 720, .62);
      farmyard({ time: 'night', table: false, livingOpen: false });
      panelWash('#1A1E44', 120);
      paint([[1300, 900], [1700, 900], [2400, 1400], [900, 1400]], { wash: '#4A4058', ink: null });
      car(1500, 1030, 1, { col: '#B5654F', night: true });
      suitcase(1180, 1040, .8, { col: '#3E4C6E' }); suitcase(1260, 1050, .8, { col: '#6A5A44' });
      fig('thibaut', 1120, 1040, { outfit: 'night', view: 'r', s: .9, reachN: [1250, 860], holdN: (u) => suitcase(3 * u, 30 * u, u / 4.3 * .8, { col: '#4A3E5A' }) });
      fig('cris', 960, 1040, { outfit: 'night', view: 'r', s: .85, ex: 'happy', reachN: [1100, 890] });
    },
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 27 — fin
page(27, [
  [1, [{
    w: 1.1,
    draw(w, h) {
      cam(900, 560, 1.15);
      paint(rectPts(-200, -200, 2200, 1500), { wash: '#1A1E3C', ink: null });
      paint([[150, 180], [1650, 180], [1750, 760], [50, 760]], { wash: '#2E3A5E', fill: '#1F2550', fillOp: 70, ink: PAL.ink, sw: 1.2 });
      fig('thibaut', 760, 640, { at: 'head', outfit: 'night', view: 'r', ex: 'kiss', nk: .3, s: .95 });
      fig('cris', 860, 660, { at: 'head', outfit: 'night', view: 'l', ex: 'kiss', blush: true, blackEye: true, nk: .2, s: .95 });
      paint(rectPts(-200, 760, 2200, 400), { wash: '#2A2440', ink: PAL.ink, sw: 1 });
      paint(ellPts(560, 830, 130, 40, 18, 0, .2), { ink: '#4A4058', sw: 2.2 });
      paint(heartPts(810, 470, 18), { wash: '#E2476E', ink: PAL.ink, sw: .4 });
    },
  }, {
    w: .9,
    draw(w, h) {
      cam(900, 560, 1.4);
      paint(rectPts(-200, -200, 2200, 1500), { wash: '#1A1E3C', ink: null });
      for (let k = 0; k < 3; k++) paint([[300, 180], [1500, 180], [1600, 760], [200, 760]], { wash: '#FFF0B8', washOp: 60, ink: null });
      paint([[150, 180], [1650, 180], [1750, 760], [50, 760]], { ink: PAL.ink, sw: 1.2 });
      fig('thibaut', 760, 640, { at: 'head', outfit: 'night', view: 'f', ex: 'shock', s: .95 });
      fig('cris', 1020, 650, { at: 'head', outfit: 'night', view: 'f', ex: 'shock', blackEye: true, s: .95 });
      paint(rectPts(-200, 760, 2200, 400), { wash: '#2A2440', ink: PAL.ink, sw: 1 });
    },
    sfx: [{ t: '!!', x: .5, y: .2, size: 90, col: PAL.ochre }],
  }]],
  [1.65, [{
    draw(w, h) {
      cam(1100, 560, .8);
      nightRoad({});
      car(1150, 690, 1.1, { col: '#6E7F92', view: 'front', lights: true, siren: true, sirenOn: true });
      fig('valerian', 1060, 1060, { view: 'f', armband: null, ex: 'smile', crumbs: true, s: 1.15, reachN: [880, 640], holdN: hBadge, reachF: [1250, 640], holdF: hCuffs, handN: 'fist', handF: 'fist' });
      glow(1060, 700, 500, 500, '#FFF0B8', 40);
    },
  }]],
  [.85, [{
    draw(w, h) {
      cam(1050, 640, .55);
      countryside({ time: 'morning', hy: 600 });
      paint([[-500, 1000], [400, 870], [1000, 830], [1700, 860], [2900, 1000], [2900, 1500], [-500, 1500]], { wash: '#A9C46E', fill: '#6E8A4E', fillOp: 60, tex: .6, ink: PAL.ink, sw: .6, curv: .4 });
      bigTree(1050, 900, 1, { mound: [1330, 895], leaves: true });
    },
    sfx: [{ t: 'FIN', x: .5, y: .5, size: 110, rot: -.04, col: PAL.cream }],
  }]],
]);
