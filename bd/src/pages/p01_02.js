// Planches 1–2 — Paris: the bedroom, then the protest.

// someone sitting up in bed, seen from the foot of the bed (legs under the duvet)
const inBed = (who, x, o = {}) => fig(who, x, BED.hip, { at: 'hip', view: 'f', outfit: 'bed', shadow: false, skip: ['legN', 'legF', 'hips', ...(o.skip || [])], ...o, skip: ['legN', 'legF', 'hips', ...(o.skip || [])] });
const goldenHour = (w, h, k = 1) => { glow(w * .5, h * .45, w * .7, h * .7, '#FFD98A', 70 * k); };
const sparkles = (pts, s = 1) => { for (const [x, y, r] of pts) paint(starPts(x, y, r * s, .3, 4), { wash: '#FFF3C4', ink: PAL.goldDk, sw: .3 }); };

page(1, [
  [1.2, [{
    draw(w, h) {
      cam(900, 650, .9);
      bedroom({ guitar: true, door: 0 });
      inBed('cris', 790, { ex: 'dreamy', blush: true, nk: .12, tor: .06, armN: [.15, -1.6], armF: [.1, -1.5] });
      inBed('thibaut', 1120, { ex: 'smile', look: [1, -.2], tor: .16, nk: -.08, armN: [.2, -1.5], armF: [1.25, .2], handF: 'open' });
      duvet({ y: 770, bumps: [[790, 10, 120], [1120, 14, 120]] });
    },
    cap: [{ t: 'Paris.', at: 'tl' }],
  }]],
  [1, [{
    w: 1.3,
    draw(w, h) {
      cam(985, 660, 1.45);
      bedroom({ door: 0 });
      inBed('cris', 885, { ex: 'dreamy', blush: true, tor: .2, nk: .32, armN: [.15, -1.6], armF: [.6, -2.2] });
      inBed('thibaut', 1090, { ex: 'smile', eyes: 'closed', tor: -.04, nk: -.1, skip: ['armN', 'armF'] });
      guitar(1048, 770, 1.0, -.38);
      inBed('thibaut', 1090, { tor: -.04, only: ['armN', 'armF'], armN: [.35, -1.05], armF: [1.2, .5], handF: 'fist' });
      duvet({ y: 790, bumps: [[885, 8, 100], [1090, 10, 100]] });
      musicNotes(1150, 535, 1.1, 3);
    },
  }, {
    w: .7,
    draw(w, h) {
      cam(1690, 570, 2.1);
      bedroom({ door: .33, slabLater: true });
      fig('jose', 1672, 560, { at: 'head', view: 'l', outfit: 'bed', eyes: 'half', brows: 'worried', mouth: 'flat', look: [-1, 0] });
      doorLeaf(.33);
      for (let i = 0; i < 4; i++) paint(ellPts(1688, 612 + i * 13, 8, 6, 10), { wash: CAST.jose.skin, ink: PAL.ink, sw: .4 });
    },
  }]],
  [1.05, [{
    draw(w, h) {
      cam(955, 568, .92);
      bedroom({ door: .5 });
      inBed('cris', 760, { ex: 'surprised', look: [.8, -1], tor: -.08, armN: [.3, -1.4], armF: [.9, .9], handF: 'open' });
      inBed('thibaut', 1150, { ex: 'laugh', look: [-.8, -1], tor: .06, armN: [.9, .9], armF: [.2, -1.4], handN: 'open' });
      duvet({ y: 775, bumps: [[760, 8, 110], [1150, 10, 110], [955, -12, 90]] });
      fig('jose', 955, 625, { at: 'hip', view: 'f', outfit: 'bed', ex: 'laugh', armN: [2.5, .35], armF: [2.5, .35], handN: 'open', handF: 'open', legN: [1.05, 2.3], legF: [1.05, 2.3], shadow: false });
      for (const k of [-1, 1]) inkLine([[955 + k * 70, 750], [955 + k * 95, 785], [955 + k * 100, 805]], .6, PAL.ink, 'inkfine', .5);
    },
    bub: [{ s: 'jose', t: 'Estamos a fazê-lo?', tr: 'On le fait ?', x: .2, y: .14, mw: 230 }],
    sfx: [{ t: 'BOÏNG !', x: .8, y: .22, size: 64, rot: .1, col: PAL.sky }],
  }, {
    draw(w, h) {
      cam(1000, 655, 1.35);
      bedroom({ door: .5 });
      inBed('cris', 780, { ex: 'laugh', tor: .1, armN: [.2, -1.5], armF: [.4, -1.8] });
      inBed('jose', 975, { ex: 'laugh', eyes: 'shut', tor: .2, nk: -.15, armN: [.3, -1.3], armF: [.7, -1.6] });
      inBed('thibaut', 1150, { ex: 'laugh', tor: -.1, nk: -.12, skip: ['armN'] });
      inBed('thibaut', 1150, { tor: -.1, only: ['armN'], reachN: [968, 668], bendN: -1, handN: 'fist' });
      duvet({ y: 790, bumps: [[780, 8, 100], [965, 10, 100], [1150, 10, 100]] });
    },
    bub: [{ s: 'thibaut', t: 'Estamos fazendo isso.', tr: 'On le fait.', x: .7, y: .16 }],
  }]],
  [1.1, [{
    draw(w, h) {
      cam(955, 650, 1.18);
      bedroom({ door: .5 });
      goldenHour(1900, 1400, 1);
      inBed('jose', 955, { only: ['armN', 'armF'], reachN: [820, 700], reachF: [1090, 700] });
      inBed('cris', 790, { ex: 'dreamy', blush: true, tor: .14, nk: .24, armN: [.2, -1.5], skip: ['armF'] });
      inBed('thibaut', 1120, { ex: 'dreamy', tor: -.14, nk: -.24, armF: [.2, -1.5], skip: ['armN'] });
      inBed('jose', 955, { ex: 'happy', blush: true, skip: ['armN', 'armF'] });
      inBed('cris', 790, { tor: .14, only: ['armF'], reachF: [905, 690], handF: 'open' });
      inBed('thibaut', 1120, { tor: -.14, only: ['armN'], reachN: [1003, 690], handN: 'open' });
      duvet({ y: 790, bumps: [[780, 8, 100], [955, 12, 100], [1130, 8, 100]] });
      sparkles([[640, 520, 16], [1270, 500, 20], [700, 420, 10], [1220, 410, 12], [960, 400, 14]]);
    },
    bub: [{ s: 'cris', t: 'Um momento de ouro.', tr: 'Un moment en or.', x: .2, y: .2 }],
  }]],
]);

page(2, [
  [1.25, [{
    draw(w, h) {
      cam(1000, 560, .62);
      parisStreet({ smoke: 1.1 });
      crowd({ rows: [[860, .48, 34], [930, .62, 22]], banner: [180, 560, 'ON LÂCHE RIEN !'], seed: 2 });
      fig('valerian', 900, 1030, { s: 1.05, holdN: hCroissant, armN: [.35, 1.5], holdF: hCoffee, armF: [.4, 1.45], ex: 'talk' });
      fig('vlad', 1140, 1030, { s: 1.05, view: 'l', ex: 'talk', armN: [.2, .9] });
      crowd({ rows: [[1190, .95, 7]], x0: -200, x1: 2300, seed: 5, props: false });
    },
    cap: [{ t: 'Au même moment, une manifestation traverse Paris.', at: 'tl' }],
    bub: [{ s: 'valerian', t: '… ?', x: .4, y: .34, size: 1.1 }, { s: 'vlad', t: '… !', x: .62, y: .3, size: 1.1 }],
    sfx: [{ t: 'ON LÂCHE RIEN !', x: .5, y: .42, size: 92, rot: -.06, col: '#E8553E' }, { t: 'HOU ! HOU !', x: .86, y: .18, size: 54, rot: .1, col: PAL.ochre }],
  }]],
  [1, [{
    draw(w, h) {
      cam(905, 600, 2.3);
      parisStreet({ smoke: .8 });
      crowd({ rows: [[860, .48, 30]], seed: 3 });
      fig('valerian', 905, 590, { at: 'head', ex: 'happy', eyes: 'closed', mouth: 'smile', crumbs: true, holdN: hCroissant, armN: [.95, 2.15], holdF: hCoffee, armF: [.3, 1.4] });
    },
    sfx: [{ t: 'CROC', x: .8, y: .26, size: 50, rot: .12, col: PAL.ochre }],
  }, {
    draw(w, h) {
      cam(985, 610, 1.75);
      parisStreet({ smoke: .8 });
      crowd({ rows: [[860, .48, 30]], seed: 4 });
      fig('valerian', 900, 1020, { ex: 'smile', blush: true, crumbs: true, look: [.6, -.2], holdN: hCroissant, armN: [.2, 1.2], holdF: hCoffee, armF: [.3, 1.4] });
      fig('vlad', 1095, 1020, { view: 'l', ex: 'neutral', look: [-.4, .3], tor: .1, reachN: [938, 602], handN: 'open' });
    },
    bub: [{ s: 'valerian', t: 'Où est la femme qui fera ça pour moi ?', x: .28, y: .2, mw: 300 }],
  }]],
  [1.05, [{
    draw(w, h) {
      cam(1005, 548, 1.45);
      parisStreet({ smoke: .9 });
      crowd({ rows: [[860, .48, 30], [920, .6, 16]], seed: 6 });
      fig('valerian', 900, 1020, { ex: 'blank', look: [-1, 0], holdF: hCoffee, armF: [.3, 1.4] });
      fig('vlad', 1110, 1020, { view: 'l', ex: 'smile', armN: [.3, .9] });
    },
    bub: [{ s: 'vlad', t: 'Je fais ça pour que tu puisses trouver une femme qui le fasse pour toi.', x: .62, y: .19, mw: 360 }, { s: 'valerian', t: 'Pas ici.', x: .15, y: .45 }],
  }, {
    draw(w, h) {
      cam(1005, 548, 1.45);
      parisStreet({ smoke: .9 });
      crowd({ rows: [[860, .48, 30], [920, .6, 16]], seed: 7 });
      fig('vlad', 1110, 1020, { view: 'r', ex: 'smile', look: [1, -.2], armF: [1.4, .25], handF: 'open' });
      fig('valerian', 900, 1020, { ex: 'neutral', look: [1, -.3], blush: true, holdF: hCoffee, armF: [.3, 1.4] });
    },
    bub: [{ s: 'vlad', t: 'Tant de jeunes femmes.', x: .74, y: .14 }, { s: 'valerian', t: 'Aucun de ceux que je voudrais ne serait ici.', x: .28, y: .2, mw: 300 }],
  }]],
  [1.1, [{
    draw(w, h) {
      cam(1000, 690, .95);
      parisStreet({ smoke: 1.3 });
      crowd({ rows: [[860, .48, 34], [930, .62, 22], [1000, .78, 12]], banner: [1290, 400, 'TOUS ENSEMBLE !'], seed: 8 });
      smokeLayer(.8, '#E2DCE4', 700);
      fig('vlad', 1060, 1160, { view: 'b', s: 1.05 });
      fig('valerian', 905, 1160, { view: 'b', s: 1.05, holdN: hCoffee, armN: [.3, 1.3] });
    },
    bub: [{ s: 'vlad', t: 'Et nous voilà.', x: .72, y: .17 }, { s: 'valerian', t: 'Et nous voilà.', x: .3, y: .25 }],
  }]],
]);
