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
    draw(w, h) { cam(1380, 500, 1.4); farmyard({ time: 'dusk', table: false }); glow(1500, 600, 1600, 600, '#F4A070', 50); fig('cris', 1260, 1030, { outfit: 'farm2', view: 'r', ex: 'scared', look: [1, 0] }); fig('vlad', 1500, 1040, { view: 'l', outfit: 'plain', ex: 'talk', armN: [.8, .9], handN: 'open' }); },
    bub: [{ s: 'vlad', t: 'I recognized you. The protest, in Paris.', tr: 'Je vous ai reconnue. La manif, à Paris.', x: .3, y: .19, mw: 320 }, { s: 'vlad', t: 'You and the man with the suitcase — there’s a connection.', tr: 'Vous et l’homme à la valise : il y a un lien.', x: .74, y: .29, mw: 320, link: true }],
  }]],
  [1, [{
    draw(w, h) { cam(1260, 545, 2.3); farmyard({ time: 'dusk', table: false }); glow(1500, 600, 1600, 600, '#F4A070', 50); fig('cris', 1260, 590, { at: 'head', outfit: 'farm2', view: 'r', ex: 'cry', tears: true }); },
    bub: [{ s: 'cris', t: 'José… He made me go along with the burglary. Then he left me and ran off with the gold.', tr: 'José… Il m’a forcée à participer au cambriolage. Puis il m’a laissée tomber et il est parti avec l’or.', x: .5, y: .2, mw: 420, size: .92 }],
  }, {
    draw(w, h) { cam(1390, 540, 1.75); farmyard({ time: 'dusk', table: false }); glow(1500, 600, 1600, 600, '#F4A070', 50); fig('vlad', 1500, 1040, { view: 'l', outfit: 'plain', ex: 'love', blush: true, look: [-1, .2] }); fig('cris', 1335, 1030, { outfit: 'farm2', view: 'r', ex: 'sly', eyes: 'half', blush: true, tor: .12, reachF: [1458, 730], handF: 'open' }); },
    bub: [{ s: 'cris', t: 'He’s hurt. He can’t get too far too fast. I’ll do anything I can to help you find him.', tr: 'Il est blessé. Il ne peut pas aller bien loin, ni bien vite. Je ferai tout pour vous aider à le retrouver.', x: .5, y: .2, mw: 560, size: .9 }],
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
      fig('louise', 1500, 772, { at: 'hip', pose: 'sit', view: 'r', tor: .35, nk: .1, ex: 'kiss', blush: true, reachN: [1640, 650] });
      fig('thibaut', 1720, 772, { at: 'hip', outfit: 'farm', pose: 'sit', view: 'l', tor: .35, nk: .1, ex: 'kiss', skip: ['armN', 'armF'] });
      guitar(1700, 740, .8, -.45);
      fig('thibaut', 1720, 772, { at: 'hip', outfit: 'farm', pose: 'sit', view: 'l', tor: .35, only: ['armN', 'armF'], reachN: [1690, 742], reachF: [1840, 660] });
      musicNotes(1450, 420, 1, 3, '#F6E6C0');
      paint(heartPts(1580, 470, 18), { wash: '#E2476E', ink: PAL.ink, sw: .4 });
    },
    cap: [{ t: 'Pendant ce temps…', at: 'tl' }],
  }]],
  [1.05, [{
    draw(w, h) {
      cam(950, 700, .8);
      nightBedroom({});
      paint(rectPts(1640, 300, 230, 610), { wash: '#4A3E5A', ink: PAL.ink, sw: .7 });
      paint(rectPts(1655, 315, 90, 595), { wash: '#FFE3A0', ink: null });
      glow(1700, 760, 260, 300, '#FFD98A', 90);
      paint([[1745, 315], [1860, 300], [1860, 920], [1745, 905]], { wash: '#5A4E6A', ink: PAL.ink, sw: .6 });
      paint(scallopPts(395, 652, 120, 34, 6, .12, 3), { wash: '#C9CCE6', ink: PAL.ink, sw: .6 });
      fig('vlad', 612, 612, { at: 'hip', outfit: 'plain', topStyle: 'bare', view: 'pr', pose: 'lie', rot: -Math.PI / 2, eyes: 'closed', mouth: 'O', shadow: false });
      paint([[470, 588], [640, 566], [860, 580], [1200, 640], [1210, 790], [462, 796]], { wash: '#8E92C0', fill: '#6E72A0', fillOp: 70, ink: PAL.ink, sw: .7, curv: .25 });
      fig('cris', 1490, 1010, { outfit: 'night', view: 'r', pose: 'walk', ph: .15, ex: 'determined', look: [-1, 0], nk: -.15, reachN: 'mouth', handN: 'fist' });
      panelWash('#1A1E44', 40);
    },
    cap: [{ t: 'Tard dans la soirée.', at: 'tl', col: '#D9DCF0' }],
    sfx: [{ t: 'RRR… PSCHH…', x: .26, y: .28, size: 40, rot: -.05, col: '#C9D2F0' }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 26 — l'or
page(26, [
  [1.05, [{
    w: 1.1,
    draw(w, h) { cam(1330, 760, .9); nightTree({ hole: true }); suitcase(1250, 985, .8, { col: '#3E4C6E' }); shovel(1470, 960, .79, .594); fig('cris', 1640, 1040, { outfit: 'night', view: 'l', tor: .4, ex: 'determined', sweat: true, reachN: [1560, 832], reachF: [1588, 792], handN: 'fist', handF: 'fist', dirt: true }); },
    cap: [{ t: 'Dans les bois, la nuit.', at: 'tl', col: '#D9DCF0' }],
  }, {
    w: .9,
    draw(w, h) {
      cam(1420, 930, 1.6);
      nightTree({ hole: true });
      suitcase(1500, 1000, 1, { open: 'gold', col: '#3E4C6E' });
      fig('cris', 1380, 1000, { at: 'hip', outfit: 'night', view: 'pl', pose: 'lie', rot: Math.PI / 2 - .25, ex: 'dreamy', dirt: true, armN: [.25, .5], armF: [.8, 1.7] });
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
      fig('cris', 1272, 612, { at: 'head', outfit: 'night', view: 'pr', ex: 'kiss', blackEye: true, nk: -.15, reachN: [1352, 702], reachF: [1335, 670] });
      paint(heartPts(1300, 500, 18), { wash: '#E2476E', ink: PAL.ink, sw: .4 });
    },
  }]],
  [1, [{
    w: .9,
    draw(w, h) {
      cam(1420, 770, .9);
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
// Louise's car seen from the front through the windshield, Thibaut driving, Cris next to him.
function windshield(o = {}) {
  const col = '#B5654F';
  paint(rectPts(-300, -300, 2400, 1600), { wash: '#141834', ink: null });
  for (let i = 0; i < 20; i++) paint(ellPts(lerp(-100, 1900, hash(i * 3.1)), lerp(-100, 200, hash(i * 7.7)), 3, 3, 5), { wash: '#F6F0D8', ink: null });
  paint([[300, 260], [1500, 260], [1620, 790], [180, 790]], { wash: '#2E3A5E', ink: null });
  paint(rrPts(560, 560, 160, 200, 30), { wash: '#4A4E66', ink: PAL.ink, sw: .5 });       // seat backs
  paint(rrPts(1010, 560, 160, 200, 30), { wash: '#4A4E66', ink: PAL.ink, sw: .5 });
  if (o.kiss) {
    fig('thibaut', 790, 560, { at: 'head', outfit: 'night', view: 'pr', ex: 'kiss', nk: .2 });
    fig('cris', 868, 572, { at: 'head', outfit: 'night', view: 'pl', ex: 'kiss', blush: true, blackEye: true, nk: -.1 });
    paint(heartPts(830, 430, 18), { wash: '#E2476E', ink: PAL.ink, sw: .4 });
  } else {
    fig('thibaut', 640, 560, { at: 'head', outfit: 'night', view: 'f', ex: 'shock' });
    fig('cris', 1110, 572, { at: 'head', outfit: 'night', view: 'f', ex: 'shock', blackEye: true });
  }
  paint(ellPts(640, 770, 150, 46, 26), { ink: '#26222E', sw: 2.6 });                    // steering wheel
  paint([[300, 260], [1500, 260], [1620, 790], [180, 790]], { wash: o.lit ? '#FFF6D8' : '#5A6A9A', washOp: o.lit ? 90 : 45, ink: null });
  inkLine([[420, 300], [330, 520]], 1.4, '#C9D2F0', 'inkfine', 0); inkLine([[1450, 330], [1500, 470]], 1, '#C9D2F0', 'inkfine', 0);
  paint([[150, 180], [1650, 180], [1520, 262], [280, 262]], { wash: col, fill: shade(col, .3), fillOp: 60, ink: PAL.ink, sw: 1 });   // roof edge
  paint([[280, 262], [305, 262], [190, 792], [140, 792]], { wash: shade(col, .2), ink: PAL.ink, sw: .8 });                        // pillars
  paint([[1495, 262], [1520, 262], [1660, 792], [1610, 792]], { wash: shade(col, .2), ink: PAL.ink, sw: .8 });
  paint(rrPts(850, 268, 100, 34, 10), { wash: '#2B2233', ink: PAL.ink, sw: .5 });         // rear-view mirror
  paint([[-300, 790], [2100, 790], [2200, 1400], [-400, 1400]], { wash: col, fill: shade(col, .3), fillOp: 70, tex: .6, ink: PAL.ink, sw: 1 });   // hood
  inkLine([[300, 860], [1500, 860]], .8, shade(col, .4), 'ink', .2);
  if (o.lit) { panelWash('#FFF6D8', 60); glow(900, 560, 900, 400, '#FFFBE8', 80); }
}
page(27, [
  [1, [{
    w: 1.1,
    draw(w, h) { cam(900, 560, 1.05); windshield({ kiss: true }); },
  }, {
    w: .9,
    draw(w, h) { cam(900, 560, 1.15); windshield({ lit: true }); },
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
