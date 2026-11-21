// Planches 3–7 — the heist, the protest, the two policemen, the flight to the countryside.

const debris = (x, y, r, n = 14, seed = 1) => { for (let i = 0; i < n; i++) { const a = hash(i * 3.3 + seed) * TAU, d = r * (.4 + hash(i * 7.1 + seed)), px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * .7, k = 6 + 10 * hash(i + seed); paint([[px, py], [px + k * 1.6, py - k * .6], [px + k * .7, py + k]], { wash: i % 3 ? '#2B2233' : '#6E6470', ink: null }); } };
const speedLines = (x0, y0, x1, y1, n = 6, col = PAL.cream) => { for (let i = 0; i < n; i++) { const t = (i + .5) / n; inkLine([[lerp(x0, x1, t) - 60, y0 + (y1 - y0) * t], [lerp(x0, x1, t) + 60, y0 + (y1 - y0) * t + 8]], .5, col, 'inkfine', 0); } };
const street = (smoke = .8, o = {}) => { parisStreet({ smoke, ...o }); };

// ----------------------------------------------------------------------------------- Planche 3 — le casse
page(3, [
  [1.25, [{
    draw(w, h) {
      cam(1000, 650, .62);
      tunnel({ corner: 1500, blast: [1720, 520, 240] });
      suitcase(330, 1085, .9, { col: '#3E4C6E' }); suitcase(1030, 1095, .9, { col: '#6A5A44' });
      fig('thibaut', 560, 1080, { outfit: 'heist', pose: 'crouch', view: 'r', tor: .3, reachN: 'ear', reachF: 'earF', ex: 'pain' });
      fig('cris', 830, 1085, { outfit: 'heist', pose: 'crouch', view: 'r', tor: .4, reachN: 'ear', reachF: 'earF', ex: 'scared' });
      debris(1640, 560, 420, 22, 3);
    },
    cap: [{ t: 'Sous la ville, un sous-sol industriel.', at: 'tl' }],
    sfx: [{ t: 'BAOUM !!', x: .74, y: .3, size: 130, rot: -.1, col: '#F28C28' }],
  }]],
  [1, [{
    draw(w, h) {
      cam(1500, 700, 1.1);
      tunnel({ corner: 1500, blast: [1850, 560, 220] });
      fig('jose', 1470, 760, { at: 'hip', outfit: 'heist', view: 'r', rot: -.6, ex: 'shock', blood: .7, armN: [1.7, .3], armF: [2.1, .5], handN: 'open', handF: 'open', legN: [1.1, .4], legF: [.5, .9], shadow: false });
      debris(1600, 620, 300, 18, 9);
      speedLines(1700, 500, 1800, 900, 7, '#FFE2A0');
    },
  }, {
    w: 1.3,
    draw(w, h) {
      cam(1270, 740, .82);
      tunnel({ corner: 1500, blast: [1850, 560, 130] });
      fig('cris', 560, 1090, { outfit: 'heist', pose: 'crouch', view: 'l', ex: 'scared', look: [-1, 0], s: .9 });
      fig('thibaut', 1140, 1070, { outfit: 'heist', pose: 'run', ph: .3, view: 'r', ex: 'determined' });
      fig('jose', 1640, 1040, { outfit: 'heist', view: 'r', pose: 'walk', ph: .6, reachN: 'chest', ex: 'pain', blood: .6, tor: .22 });
    },
  }]],
  [1, [{
    w: .8,
    draw(w, h) {
      cam(560, 860, 1.55);
      tunnel({ corner: 1500 });
      suitcase(780, 1095, .9, { col: '#3E4C6E' });
      fig('cris', 560, 1085, { outfit: 'heist', pose: 'crouch', view: 'l', tor: .2, ex: 'worried', look: [-1, -.2], holdN: hFlashlight, armN: [1.45, .15] });
    },
  }, {
    w: 1.2,
    draw(w, h) {
      cam(920, 860, 1.0);
      tunnel({ corner: 1500 });
      fig('jose', 1190, 1075, { outfit: 'heist', view: 'l', reachN: 'chest', ex: 'pain', blood: .6, tor: .12 });
      suitcase(890, 1095, 1, { open: 'gold', col: '#3E4C6E' });
      glow(890, 1000, 300, 170, '#FFE08A', 55);
      fig('cris', 690, 1095, { outfit: 'heist', pose: 'kneel', view: 'r', ex: 'surprised', look: [.6, .6], blush: true });
      fig('thibaut', 1035, 1095, { outfit: 'heist', pose: 'crouch', view: 'l', reachN: [930, 980], reachF: [870, 975], ex: 'smirk' });
    },
    sfx: [{ t: '!!', x: .24, y: .25, size: 80, rot: .1, col: PAL.gold }],
  }]],
  [1.05, [{
    w: .7,
    draw(w, h) {
      cam(800, 615, 2.0);
      tunnel({});
      fig('jose', 800, 570, { at: 'head', outfit: 'heist', view: 'r', ex: 'pain', sweat: true, blood: 1, reachN: 'chest', reachF: [880, 720], bloodyHands: true, look: [-1, .2] });
    },
  }, {
    w: 1.3,
    draw(w, h) {
      cam(1150, 640, .78);
      tunnel({ daylight: true });
      const run = (who, x, y, s, ph, o = {}) => { suitcase(x + 55 * s, y + 70 * s, s * .95, { handle: 1, tilt: -.25, col: o.case || '#3E4C6E' }); fig(who, x, y, { view: 'b', outfit: 'heist', pose: 'run', ph, s, reachN: [x + 75 * s, y - 175 * s], ...o }); };
      run('thibaut', 1080, 860, .42, .1);
      run('cris', 1230, 925, .5, .45, { case: '#6A5A44' });
      run('jose', 960, 1010, .6, .7, { tor: .3, case: '#4A3E5A' });
    },
    sfx: [{ t: 'CLAC CLAC CLAC', x: .5, y: .88, size: 40, rot: -.03, col: PAL.cream }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 4 — dans la foule
page(4, [
  [1.15, [{
    w: 1.25,
    draw(w, h) {
      cam(800, 690, .68);
      street(.8, { gate: 380 });
      crowd({ rows: [[870, .5, 24]], x0: 650, x1: 2400, seed: 11 });
      dragger('jose', 400, 1000, { outfit: 'heist', bandana: '#C8423A', ex: 'pain', tor: .18, s: .92, case: '#4A3E5A' }, 1);
      dragger('cris', 800, 1030, { outfit: 'manif', s: .95, pose: 'run', ph: .4, case: '#6A5A44' }, 1);
      dragger('thibaut', 1190, 1045, { outfit: 'heist', bandana: '#3E3946', pose: 'run', ph: .1 }, 1);
    },
  }, {
    w: .75,
    draw(w, h) {
      cam(930, 680, .8);
      street(1);
      crowd({ rows: [[870, .5, 22], [950, .68, 10]], seed: 12 });
      fig('thibaut', 1180, 960, { view: 'b', outfit: 'heist', s: .7 });
      crowd({ rows: [[1000, .8, 4]], x0: 1000, x1: 1500, seed: 13, props: false });
      suitcase(500, 1090, .95, { handle: 1, col: '#4A3E5A' });
      fig('jose', 640, 1080, { outfit: 'heist', bandana: '#C8423A', view: 'r', tor: -.1, reachN: 'chest', ex: 'pain' });
    },
  }]],
  [1, [{
    draw(w, h) {
      cam(1010, 640, 1.15);
      street(.7);
      crowd({ rows: [[870, .5, 26], [930, .62, 14]], seed: 14 });
      fig('vlad', 1290, 1020, { view: 'l', ex: 'surprised', look: [-1, 0] });
      fig('valerian', 1080, 1020, { view: 'l', tor: -.12, ex: 'shock', holdN: hCoffeeSpill, armN: [1.25, 1.0], holdF: hCroissant, armF: [.3, 1.2] });
      dragger('cris', 860, 1030, { outfit: 'manif', ex: 'surprised', tor: .15, case: '#6A5A44' }, 1);
    },
    bub: [{ s: 'valerian', t: 'Hé ! Pourquoi es-tu si pressé ?', x: .58, y: .1 }, { s: 'cris', t: 'What?', tr: 'Quoi ?', x: .18, y: .33 }],
    sfx: [{ t: 'SPLATCH !', x: .43, y: .34, size: 58, rot: -.15, col: '#B97A4A' }],
  }]],
  [1.05, [{
    draw(w, h) {
      cam(1000, 515, 1.25);
      street(.8);
      crowd({ rows: [[870, .5, 26], [930, .62, 14]], seed: 15 });
      fig('cris', 880, 1020, { outfit: 'manif', view: 'r', ex: 'worried', look: [1, -.2], armN: [.25, .5] });
      fig('vlad', 1125, 1020, { view: 'l', ex: 'talk', armN: [.7, .9], handN: 'open' });
    },
    bub: [{ s: 'vlad', t: 'Are you ok? Can we help you?', tr: 'Ça va ? On peut vous aider ?', x: .63, y: .12, mw: 300 }, { s: 'cris', t: 'I’m just trying to get to my AirBnB in this craziness.', tr: 'J’essaie juste de rejoindre mon Airbnb dans cette folie.', x: .25, y: .39, mw: 310, size: .9 }],
  }, {
    draw(w, h) {
      cam(1020, 520, 1.25);
      street(.8);
      crowd({ rows: [[870, .5, 26], [930, .62, 14]], seed: 16 });
      fig('cris', 840, 1020, { outfit: 'manif', view: 'r', ex: 'worried', look: [1, 0] });
      fig('valerian', 1060, 1020, { view: 'l', ex: 'suspicious', look: [1, 0], nk: .1, holdF: hCroissant, armF: [.3, 1.2] });
      fig('vlad', 1240, 1020, { view: 'l', ex: 'talk', look: [-1, 0] });
    },
    bub: [{ s: 'valerian', t: 'Pourquoi se couvre-t-elle le visage ?', x: .27, y: .14, mw: 260 }, { s: 'vlad', t: 'Are you afraid? Hiding your face?', tr: 'Vous avez peur ? Vous cachez votre visage ?', x: .72, y: .2, mw: 250 }],
  }]],
  [1.15, [{
    w: 1.2,
    draw(w, h) {
      cam(1060, 520, 1.2);
      street(.9);
      crowd({ rows: [[870, .5, 28], [930, .62, 16]], seed: 17 });
      fig('cris', 860, 1020, { outfit: 'manif', view: 'r', ex: 'sadtalk', armN: [.4, 1.6], handN: 'open', armF: [.3, .6] });
      fig('valerian', 1150, 1020, { view: 'l', ex: 'neutral', holdF: hCroissant, armF: [.3, 1.2] });
      fig('vlad', 1330, 1020, { view: 'l', ex: 'talk', armN: [.5, 1.3], handN: 'open' });
    },
    bub: [{ s: 'cris', t: 'Oh I was afraid of tear gas… and I’m afraid of these protesters. Sorry.', tr: 'J’avais peur des lacrymos… et j’ai peur de ces manifestants. Pardon.', x: .25, y: .26, mw: 300, size: .95 },
          { s: 'vlad', t: 'We’re police.', tr: 'On est de la police.', x: .76, y: .16 }],
  }, {
    w: .8,
    draw(w, h) {
      cam(860, 610, 2.4);
      street(.6);
      fig('cris', 860, 600, { at: 'head', outfit: 'manif', view: 'r', eyes: 'half', brows: 'up', mouth: 'smirk', look: [1, 0] });
    },
    bub: [{ s: 'cris', t: 'Oh good. You’re earning your money today.', tr: 'Tant mieux. Vous ne volez pas votre salaire aujourd’hui.', x: .45, y: .2, mw: 240 }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 5 — « Attendez ! »
page(5, [
  [1, [{
    w: .9,
    draw(w, h) {
      cam(1000, 600, 1.15);
      street(.8);
      crowd({ rows: [[870, .5, 26], [930, .62, 14]], seed: 21 });
      fig('vlad', 760, 1020, { view: 'r', ex: 'neutral' });
      fig('valerian', 930, 1020, { view: 'r', ex: 'shout', reachN: [1100, 690], handN: 'open', holdF: hCroissant, armF: [.3, 1.2] });
      dragger('cris', 1230, 1030, { outfit: 'manif', look: [-1, 0], ex: 'scared', case: '#6A5A44' }, 1);
    },
    bub: [{ s: 'valerian', t: 'Attendez !', x: .3, y: .18, kind: 'shout' }],
  }, {
    w: 1.1,
    draw(w, h) {
      cam(1000, 590, 3.0);
      street(.5);
      fig('cris', 1010, 585, { at: 'head', outfit: 'manif', bandana: false, scarfDown: true, view: 'l', eyes: 'wide', brows: 'worried', mouth: 'flat', look: [-1, 0] });
      paint(capsule(880, 690, 950, 668, 13, 11, 4), { wash: CAST.valerian.skin, ink: PAL.ink, sw: .5 });
      for (let i = 0; i < 3; i++) paint(ellPts(955 + i * 3, 655 + i * 11, 8, 5.5, 8), { wash: CAST.valerian.skin, ink: PAL.ink, sw: .35 });
      paint(capsule(770, 760, 880, 694, 22, 15, 4), { wash: CAST.valerian.top, ink: PAL.ink, sw: .6 });
    },
  }]],
  [1.05, [{
    draw(w, h) {
      cam(1010, 555, 1.45);
      street(.8);
      crowd({ rows: [[870, .5, 26], [930, .62, 14]], seed: 22 });
      fig('valerian', 1150, 1020, { view: 'l', ex: 'suspicious', holdF: hCroissant, armF: [.3, 1.2] });
      fig('cris', 900, 1020, { outfit: 'manif', bandana: false, scarfDown: true, view: 'r', ex: 'sadtalk', armN: [.5, 1.7], handN: 'open' });
    },
    bub: [{ s: 'cris', t: 'These people are breaking things and making a mess. I just want to get to safety.', tr: 'Ces gens cassent tout et mettent le bazar. Je veux juste me mettre à l’abri.', x: .38, y: .2, mw: 330 }],
  }, {
    draw(w, h) {
      cam(1050, 478, 1.15);
      street(.8);
      crowd({ rows: [[870, .5, 26], [930, .62, 14]], seed: 23 });
      fig('valerian', 900, 1020, { view: 'r', ex: 'smirk', look: [1, .2], holdF: hCroissant, armF: [.3, 1.2] });
      fig('vlad', 1180, 1020, { view: 'l', ex: 'talk', armN: [.8, .7], handN: 'open', armF: [1.1, .4], handF: 'open' });
    },
    bub: [{ s: 'vlad', t: 'The people are marching in the streets. It’s their right. We’re here to protect everyone’s rights, safety and property.', tr: 'Les gens manifestent. C’est leur droit. Nous sommes là pour protéger les droits, la sécurité et les biens de chacun.', x: .5, y: .19, mw: 560, size: .86 },
          { s: 'valerian', t: 'Tous sont des casseurs.', kind: 'whisper', x: .14, y: .86, mw: 190 }],
  }]],
  [1, [{
    w: .8,
    draw(w, h) {
      cam(1090, 600, 2.4);
      street(.6);
      fig('vlad', 1100, 590, { at: 'head', view: 'l', ex: 'neutral', eyes: 'half', brows: 'up', mouth: 'smile', look: [-1, 0] });
    },
    bub: [{ s: 'vlad', t: 'Okay, get there safe. Be careful.', tr: 'D’accord, rentrez bien. Soyez prudente.', x: .32, y: .2, mw: 220 }],
  }, {
    w: 1.2,
    draw(w, h) {
      cam(1000, 690, .9);
      street(1);
      crowd({ rows: [[870, .5, 28], [940, .64, 16]], seed: 24 });
      suitcase(1060, 1100, .78, { handle: 1, tilt: -.3, col: '#6A5A44' });
      fig('cris', 1000, 1030, { outfit: 'manif', bandana: false, scarfDown: true, view: 'b', pose: 'run', ph: .3, s: .8, reachN: [1100, 870] });
      speedLines(860, 900, 900, 1000, 4, PAL.ink);
    },
  }]],
  [1.15, [{
    w: 1.4,
    draw(w, h) {
      cam(1010, 600, 1.1);
      street(.9);
      crowd({ rows: [[870, .5, 26], [930, .62, 14]], seed: 25 });
      fig('vlad', 760, 1020, { view: 'r', ex: 'worried', look: [1, .2] });
      fig('valerian', 960, 1020, { view: 'r', ex: 'shout', armN: [1.3, .3], handN: 'open', holdF: hCroissant, armF: [.3, 1.2] });
      dragger('jose', 1290, 1035, { outfit: 'heist', bandana: '#C8423A', tor: .32, ex: 'pain', reachF: 'chest', case: '#4A3E5A' }, 1);
    },
    bub: [{ s: 'valerian', t: 'Attendez ! Où allez-vous ?', x: .3, y: .17 }, { s: 'jose', t: 'I can’t help you.', tr: 'Je ne peux pas vous aider.', x: .78, y: .2 }],
    sfx: [{ t: 'CLAC CLAC', x: .62, y: .9, size: 40, rot: -.05, col: PAL.cream }],
  }, {
    w: .6,
    draw(w, h) {
      cam(818, 690, 2.5);
      street(.4);
      fig('jose', 800, 600, { at: 'head', outfit: 'heist', bandana: '#C8423A', view: 'r', tor: .12, nk: .35, blood: 1, reachN: 'chest', reachF: [850, 760], bloodyHands: true, ex: 'pain', look: [0, 1] });
    },
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 6 — José et les policiers
const copsAndJose = (o = {}) => {
  street(.8);
  crowd({ rows: [[870, .5, 26], [930, .62, 14]], seed: o.seed || 31 });
  fig('valerian', 820, 1020, { view: 'r', ex: o.v || 'neutral', holdF: hCroissant, armF: [.3, 1.2], ...(o.vo || {}) });
  fig('vlad', 1020, 1020, { view: 'r', ex: o.d || 'neutral', ...(o.do || {}) });
  suitcase(1420, 1030, .95, { col: '#4A3E5A' });
  fig('jose', 1250, 1025, { outfit: 'heist', bandana: false, scarfDown: '#C8423A', view: 'l', tor: .25, ex: o.j || 'pain', reachN: 'chest', ...(o.jo || {}) });
};
page(6, [
  [1, [{
    w: 1.15,
    draw(w, h) { cam(1040, 545, 1.2); copsAndJose({ v: 'angrytalk', j: 'sly', vo: { armN: [.9, .9], handN: 'open' } }); },
    bub: [{ s: 'valerian', t: 'Ce sont tous des étrangers ! We’re police.', tr: 'On est de la police.', x: .24, y: .17, mw: 270 },
          { s: 'jose', t: 'Bless you. There aren’t enough prisons to hold them all, are there?', tr: 'Dieu vous bénisse. Il n’y a pas assez de prisons pour tous les enfermer, hein ?', x: .73, y: .26, mw: 290, size: .95 }],
  }, {
    draw(w, h) { cam(1130, 545, 1.45); copsAndJose({ d: 'worried', j: 'sadtalk', seed: 32 }); },
    bub: [{ s: 'vlad', t: 'You need help?', tr: 'Besoin d’aide ?', x: .2, y: .14 },
          { s: 'jose', t: 'I need some fresh air, peace and sunshine. I’m heading to the airport.', tr: 'J’ai besoin d’air frais, de calme et de soleil. Je vais à l’aéroport.', x: .62, y: .32, mw: 270, size: .95 }],
  }]],
  [1.05, [{
    draw(w, h) { cam(1030, 500, 1.05); copsAndJose({ v: 'suspicious', d: 'talk', j: 'pain', seed: 33, vo: { nk: .1, look: [1, 0] } }); },
    bub: [{ s: 'valerian', t: 'Il y a quelque chose qui ne va pas chez lui.', kind: 'whisper', x: .16, y: .2, mw: 240 },
          { s: 'vlad', t: 'The trains to the airport aren’t running regularly and I don’t think you’ll be able to get a car around here. Are you ok?', tr: 'Les trains pour l’aéroport sont perturbés et vous ne trouverez pas de voiture par ici. Ça va ?', x: .66, y: .22, mw: 460, size: .95 }],
  }]],
  [1, [{
    w: 1.1,
    draw(w, h) { cam(1220, 555, 1.55); copsAndJose({ d: 'worried', j: 'pain', seed: 34, jo: { eyes: 'shut', mouth: 'O', tor: .4, nk: .2, reachF: 'mouth', handF: 'fist' } }); },
    bub: [{ s: 'jose', t: 'I think I breathed in some tear gas. I understand perfectly the need for it but I think I’m allergic to it.', tr: 'Je crois que j’ai respiré du gaz lacrymogène. J’en comprends parfaitement la nécessité, mais je crois que j’y suis allergique.', x: .4, y: .25, mw: 360, size: .92 }],
    sfx: [{ t: 'KOF ! KOF !', x: .86, y: .55, size: 44, rot: .12, col: PAL.cream }],
  }, {
    draw(w, h) { cam(1030, 545, 1.25); copsAndJose({ v: 'smirk', j: 'sly', seed: 35, vo: { look: [1, 0] } }); },
    bub: [{ s: 'valerian', t: 'Il y est allergique. J’aimerais lui infliger une affection permanente.', x: .26, y: .2, mw: 270 },
          { s: 'jose', t: 'Euh, je parle un peu français.', x: .78, y: .36, mw: 180 }],
  }]],
  [1.15, [{
    w: 1.2,
    draw(w, h) { cam(1040, 515, 1.2); copsAndJose({ v: 'talk', j: 'smile', seed: 36, vo: { blush: true, armN: [.9, .9], handN: 'open' } }); },
    bub: [{ s: 'valerian', t: 'Um, I speak a little English. Go back to England. The weather is better for you I think.', tr: 'Euh, je parle un peu anglais. Rentrez en Angleterre. Le climat vous ira mieux, je pense.', x: .26, y: .26, mw: 320, size: .95 },
          { s: 'jose', t: 'En fait, je suis portugais.', x: .76, y: .18, mw: 200 }],
  }, {
    w: .8,
    draw(w, h) { cam(830, 610, 2.4); street(.6); fig('valerian', 830, 600, { at: 'head', view: 'r', ex: 'angrytalk', look: [1, 0] }); },
    bub: [{ s: 'valerian', t: 'Tout le monde ne peut-il pas rester chez soi et parler sa propre langue ?', x: .45, y: .22, mw: 260 }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 7 — la fuite
page(7, [
  [1, [{
    w: .85,
    draw(w, h) { cam(1050, 515, 1.35); copsAndJose({ d: 'smile', v: 'blank', seed: 41, do: { armN: [.9, .4], handN: 'open' } }); },
    bub: [{ s: 'vlad', t: 'Well you better get going. Feel better. Travel safe.', tr: 'Bon, vous feriez mieux d’y aller. Soignez-vous. Bon voyage.', x: .4, y: .2, mw: 280, size: .95 }],
  }, {
    w: .6,
    draw(w, h) { cam(825, 620, 2.4); street(.6); fig('valerian', 825, 600, { at: 'head', view: 'r', ex: 'angrytalk', eyes: 'half', look: [1, 0], armN: [.3, 1.9] }); },
    bub: [{ s: 'valerian', t: 'On est payés pour ça ? Je me mets en grève.', x: .5, y: .2, mw: 190 }],
  }, {
    w: .75,
    draw(w, h) {
      cam(1000, 700, .8);
      street(1.2);
      crowd({ rows: [[870, .5, 24]], seed: 42 });
      suitcase(1140, 960, .62, { handle: 1, tilt: -.3, col: '#4A3E5A' });
      fig('jose', 1080, 910, { outfit: 'heist', view: 'b', pose: 'walk', ph: .3, s: .62, tor: .35, reachN: [1150, 800] });
      crowd({ rows: [[1080, .9, 5]], seed: 43, props: false });
    },
  }]],
  [1, [{
    w: 1.2,
    draw(w, h) {
      cam(880, 560, .82);
      carInterior({ col: '#5A3B40' });
      fig('thibaut', 430, 640, { at: 'hip', outfit: 'heist', pose: 'sit', view: 'pl', reachN: [300, 455], reachF: [290, 490], ex: 'determined' });
      fig('cris', 1360, 660, { at: 'hip', outfit: 'heist', pose: 'sit', view: 'pl', ex: 'worried', nk: .35, look: [0, 1], skip: ['armN', 'armF'] });
      fig('jose', 1080, 668, { at: 'hip', outfit: 'heist', view: 'pl', pose: 'lie', rot: Math.PI / 2, ex: 'pain', blood: true, legN: [1.3, 1.9], legF: [1.1, 1.7], shadow: false, armN: [.4, .8], s: .95 });
      fig('cris', 1360, 660, { at: 'hip', outfit: 'heist', pose: 'sit', view: 'pl', only: ['armN', 'armF'], reachN: [1150, 640], reachF: [1250, 600], bloodyHands: true });
    },
    cap: [{ t: 'Plus tard.', at: 'tl' }],
  }, {
    w: .8,
    draw(w, h) {
      cam(1000, 600, .7);
      countryside({ time: 'afternoon', hy: 520 });
      paint([[-500, 760], [3100, 700], [3100, 790], [-500, 860]], { wash: '#C9B48F', ink: PAL.ink, sw: .5 });
      car(1050, 820, 1, { col: '#7A8E9A', door: true });
      grassStrokes(500, 1600, 900, 40, 60, '#6E9447', .6);
    },
    cap: [{ t: 'La campagne.', at: 'tl' }],
  }]],
  [1, [{
    draw(w, h) {
      cam(950, 640, .95);
      countryside({ time: 'afternoon', hy: 470 });
      fig('cris', 760, 1010, { outfit: 'heist', pose: 'walk', ph: .1, ex: 'worried', armF: [.5, .5] });
      fig('jose', 900, 1000, { outfit: 'heist', pose: 'walk', ph: .5, tor: .35, ex: 'pain', blood: true, reachN: [770, 690], reachF: [1050, 690] });
      dragger('thibaut', 1100, 1015, { outfit: 'heist', ex: 'determined', case: '#3E4C6E' }, 1);
      grassStrokes(300, 1600, 1080, 50, 70, '#6E9447', .6);
    },
  }, {
    draw(w, h) {
      cam(950, 640, .95);
      countryside({ time: 'afternoon', hy: 470 });
      fig('thibaut', 1260, 1010, { outfit: 'heist', pose: 'walk', ph: .3, ex: 'blank', armN: [-.05, .1], armF: [.05, .1], holdN: (u) => suitcase(3 * u, 33 * u, u / 4.7 * .9, { col: '#3E4C6E' }), holdF: (u) => suitcase(3 * u, 33 * u, u / 4.7 * .9, { col: '#6A5A44' }) });
      dragger('cris', 760, 1015, { outfit: 'heist', ex: 'determined', case: '#4A3E5A', reachF: [860, 690] }, 1);
      fig('jose', 860, 1005, { outfit: 'heist', pose: 'walk', ph: .6, tor: .45, nk: .3, ex: 'pain', blood: true, reachN: [770, 700] });
      grassStrokes(300, 1600, 1080, 50, 70, '#6E9447', .6);
    },
  }]],
  [1.1, [{
    draw(w, h) {
      cam(1050, 560, .5);
      countryside({ time: 'afternoon', hy: 600, farm: [2350, 680, .45] });
      paint([[-500, 980], [400, 820], [1000, 760], [1700, 800], [2900, 1000], [2900, 1500], [-500, 1500]], { wash: '#A9C46E', fill: '#7FA35A', fillOp: 70, tex: .6, ink: PAL.ink, sw: .6, curv: .4 });
      bigTree(1050, 790, .95, {});
      for (const [who, x, o] of [['thibaut', 300, {}], ['cris', 120, {}], ['jose', 170, { tor: .4 }]]) fig(who, x, 1000, { outfit: 'heist', pose: 'walk', ph: hash(x), s: .32, ...o });
    },
  }]],
]);
