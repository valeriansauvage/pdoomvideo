// Planches 14–16 — the portrait, the dinner, what Cris saw.

// the dinner: Louise at the left end, Thibaut behind the table, Cris at the right end
const DIN = { y: 900, top: 695 };
const dinner = (o = {}) => {
  livingRoom({ night: true, piano: false, couch: false });
  panelWash('#2A2050', 40);
  for (const [x, f] of [[700, false], [1400, true]]) chair(x, 900, 1, { flip: f, col: '#6E4A34' });
  fig('thibaut', 1050, 790, { at: 'hip', outfit: 'farm', view: 'f', skip: ['legN', 'legF', 'hips'], shadow: false, armN: [.3, -1.3], armF: [.3, -1.3], ...o.t });
  dinnerTable(1050, 900, 1, true);
  fig('louise', 730, 782, { at: 'hip', pose: 'sit', view: 'r', shadow: false, armN: [1.2, .2], armF: [1.3, .3], ...o.l });
  fig('cris', 1370, 782, { at: 'hip', pose: 'sit', view: 'l', outfit: 'farm', shadow: false, armN: [1.2, .2], armF: [1.3, .3], ...o.c });
  glow(1050, 640, 700, 320, '#FFC870', 40);
};
const headShot = (who, x, y, o = {}) => { fig(who, x, y, { at: 'head', ...o }); };

// ----------------------------------------------------------------------------------- Planche 14 — le portrait
page(14, [
  [1.05, [{
    w: .8,
    draw(w, h) {
      cam(220, 800, 1.0);
      farmyard({ table: false });
      goat(80, 1040, .85, { graze: true }); goat(-120, 1020, .8, { flip: true }); chicken(520, 1070, .9, { peck: true });
      fig('cris', 330, 1060, { outfit: 'farm', view: 'r', ex: 'suspicious', look: [1, -.2], reachN: [270, 900], holdN: (u) => bucket(2 * u, 10 * u, u / 4.4 * .55, false) });
    },
    cap: [{ t: 'Fin de matinée.', at: 'tl' }],
  }, {
    w: 1.2,
    draw(w, h) {
      cam(1650, 700, 1.0);
      farmyard({ table: false });
      fig('thibaut', 1500, 1020, { outfit: 'sheet', view: 'r', ex: 'smirk', nk: -.12, armF: [2.6, .25], handF: 'open', reachN: 'hip' });
      easel(1800, 1030, .95, { portrait: true, flip: true });
      fig('louise', 1990, 1030, { outfit: 'smock', view: 'l', ex: 'love', blush: true, reachN: [1890, 740], holdN: hBrush });
      paint(heartPts(1720, 560, 14), { wash: '#E2476E', ink: PAL.ink, sw: .35 });
    },
  }]],
  [1, [{
    w: .8,
    draw(w, h) {
      cam(860, 650, .95);
      farmyard({ table: false, doorOpen: true });
      fig('cris', 820, 1010, { outfit: 'farm', view: 'b', pose: 'walk', ph: .3, tor: .1, nk: .25 });
    },
  }, {
    w: 1.2,
    draw(w, h) {
      cam(700, 430, 1.15);
      kitchen({});
      fig('cris', 470, 920, { outfit: 'farm', view: 'r', ex: 'sadtalk', look: [1, 0], reachN: [560, 685], holdN: hKnife, reachF: [520, 690] });
      fig('louise', 900, 925, { view: 'l', ex: 'smile', armN: [.6, 1.4], handN: 'open' });
    },
    cap: [{ t: 'L’après-midi.', at: 'tl' }],
    bub: [{ s: 'cris', t: 'Has he let you see exactly what he’s writing?', tr: 'Il t’a montré ce qu’il écrit, exactement ?', x: .28, y: .33, mw: 250, size: .92 }, { s: 'louise', t: 'We’ll have to ask him. I’ve invited him to eat with us.', tr: 'Il faudra le lui demander. Je l’ai invité à dîner avec nous.', x: .75, y: .27, mw: 250, size: .92 }],
  }]],
  [1.1, [{
    draw(w, h) { cam(1050, 595, .95); dinner({ l: { ex: 'smile', armN: [1.0, .9], handN: 'open' }, t: { ex: 'smile' }, c: { ex: 'suspicious' } }); },
    cap: [{ t: 'Le soir.', at: 'tl' }],
    bub: [{ s: 'louise', t: 'Could you tell us about what you’re writing? Is it a novel?', tr: 'Vous nous parlez de ce que vous écrivez ? C’est un roman ?', x: .3, y: .18, mw: 440, size: .92 }],
  }]],
  [1, [{
    w: .8,
    draw(w, h) { cam(1050, 600, 2.4); dinner({ t: { eyes: 'dot', brows: 'worried', mouth: 'flat', sweat: true, look: [-.6, 0] } }); },
    sfx: [{ t: '…', x: .7, y: .25, size: 60, col: PAL.cream }],
  }, {
    w: 1.2,
    draw(w, h) { cam(1050, 610, 1.6); dinner({ t: { ex: 'talk', armN: [.5, -1.9], handN: 'open' }, l: { ex: 'smile' }, c: { ex: 'blank' } }); },
    bub: [{ s: 'thibaut', t: 'It’s about a robbery… But it’s also a love story.', tr: 'C’est l’histoire d’un braquage… Mais c’est aussi une histoire d’amour.', x: .5, y: .2, mw: 330 }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planches 15–16 — le dîner
// heads at the table: Louise ~ (735, 595), Thibaut ~ (1050, 587), Cris ~ (1366, 579)
const closeUp = (cx, cy, z = 2.3) => cam(cx, cy - .12 * 470 / z, z);
page(15, [
  [1, [{
    w: .75,
    draw(w, h) { closeUp(1350, 579); dinner({ c: { ex: 'talk', look: [-1, 0] } }); },
    bub: [{ s: 'cris', t: 'Tell us more.', tr: 'Racontez-nous.', x: .4, y: .17 }],
  }, {
    w: 1.25,
    draw(w, h) { cam(1180, 541, 1.4); dinner({ c: { ex: 'neutral', look: [-1, 0] }, t: { ex: 'smile', look: [1, 0] } }); },
    bub: [{ s: 'thibaut', t: 'I haven’t gotten far beyond the robbery…', tr: 'Je ne suis pas allé beaucoup plus loin que le braquage…', x: .42, y: .2, mw: 330 }],
  }]],
  [1, [{
    w: .9,
    draw(w, h) { closeUp(1350, 579); dinner({ c: { ex: 'suspicious', eyes: 'narrow', mouth: 'open', look: [-1, 0] } }); },
    bub: [{ s: 'cris', t: 'Does anyone get killed?', tr: 'Quelqu’un se fait tuer ?', x: .36, y: .17 }],
  }, {
    w: 1.1,
    draw(w, h) { closeUp(1050, 587); dinner({ t: { ex: 'smirk', look: [1, 0] } }); },
    bub: [{ s: 'thibaut', t: 'Well it wouldn’t hold much interest these days if someone didn’t die.', tr: 'Ça n’aurait pas grand intérêt aujourd’hui si personne ne mourait.', x: .5, y: .2, mw: 380 }],
  }]],
  [1.05, [{
    w: .8,
    draw(w, h) { closeUp(760, 595); dinner({ l: { ex: 'talk', look: [1, 0], armN: [1.0, .9], handN: 'open' } }); },
    bub: [{ s: 'louise', t: 'How does the love story fit into the novel?', tr: 'Et l’histoire d’amour, comment s’intègre-t-elle au roman ?', x: .58, y: .2, mw: 260 }],
  }, {
    w: 1.2,
    draw(w, h) { closeUp(1050, 595, 2.0); dinner({ t: { ex: 'dreamy', armF: [.6, -2.2], handF: 'open' } }); },
    bub: [{ s: 'thibaut', t: 'Well crime brings people together… the plans, the secrets, the dreams of money… running off to some distant foreign place to spend it all.', tr: 'Le crime rapproche les gens… les plans, les secrets, les rêves d’argent… s’enfuir dans un pays lointain pour tout dépenser.', x: .5, y: .25, mw: 470, size: .95 }],
  }]],
  [1, [{
    draw(w, h) { closeUp(1350, 579); dinner({ c: { ex: 'sly', look: [-1, 0] } }); },
    bub: [{ s: 'cris', t: 'But something always goes wrong doesn’t it?', tr: 'Mais il y a toujours quelque chose qui tourne mal, non ?', x: .36, y: .2, mw: 270 }],
  }, {
    draw(w, h) { closeUp(1050, 587); dinner({ t: { ex: 'smile', eyes: 'half', look: [1, 0] } }); },
    bub: [{ s: 'thibaut', t: 'Seems like it always does… in the movies.', tr: 'On dirait bien… au cinéma.', x: .5, y: .18, mw: 300 }],
  }]],
]);

page(16, [
  [1, [{
    w: 1.15,
    draw(w, h) { cam(1050, 525, 1.05); dinner({ l: { ex: 'smile', look: [1, 0] }, c: { ex: 'talk', look: [-1, 0] }, t: { ex: 'worried', look: [1, 0] } }); },
    bub: [{ s: 'louise', t: 'I have a printer if you’d like to print it out to read it over.', tr: 'J’ai une imprimante si vous voulez l’imprimer pour le relire.', x: .2, y: .22, mw: 230, size: .92 },
          { s: 'cris', t: 'Can’t you give us some more specifics to the story?', tr: 'Vous ne pouvez pas nous en dire un peu plus ?', x: .8, y: .2, mw: 220, size: .92 }],
  }, {
    w: .85,
    draw(w, h) { closeUp(1050, 587, 2.5); dinner({ t: { ex: 'talk', brows: 'worried', look: [1, 0] } }); },
    bub: [{ s: 'thibaut', t: 'I couldn’t have anyone read it until it’s near finished.', tr: 'Personne ne doit le lire avant qu’il soit presque fini.', x: .5, y: .2, mw: 260 }],
  }]],
  [1, [{
    draw(w, h) { closeUp(760, 595); dinner({ l: { ex: 'talk', blush: true, look: [1, 0] } }); },
    bub: [{ s: 'louise', t: 'I meant a printed version just for you to read.', tr: 'Je parlais d’une version imprimée, rien que pour vous.', x: .62, y: .18, mw: 270 }],
  }, {
    draw(w, h) { closeUp(1050, 587); dinner({ t: { ex: 'smile', look: [-1, 0] } }); },
    bub: [{ s: 'thibaut', t: 'Ok. Thanks, I’ll see.', tr: 'D’accord. Merci, je verrai.', x: .5, y: .18 }],
  }]],
  [1, [{
    w: 1.1,
    draw(w, h) { closeUp(1340, 579, 2.1); dinner({ c: { ex: 'angrytalk', look: [-1, 0] } }); },
    bub: [{ s: 'cris', t: 'The lovers? And their crime? At least you can tell us that.', tr: 'Les amants ? Et leur crime ? Ça, au moins, vous pouvez nous le dire.', x: .36, y: .2, mw: 300 }],
  }, {
    w: .9,
    draw(w, h) { closeUp(1050, 587, 2.3); dinner({ t: { ex: 'talk', look: [1, 0], armF: [.5, -2.0], handF: 'open' } }); },
    bub: [{ s: 'thibaut', t: 'I want you to experience it from beginning to end without giving away the plot twists.', tr: 'Je veux que vous le viviez du début à la fin, sans rien dévoiler des rebondissements.', x: .5, y: .22, mw: 300, size: .92 }],
  }]],
  [1.1, [{
    w: .85,
    draw(w, h) { closeUp(1350, 579); dinner({ c: { ex: 'sly', eyes: 'half', look: [-1, 0] } }); },
    bub: [{ s: 'cris', t: 'Always the plot twists. Isn’t that a cliche?', tr: 'Toujours les rebondissements. Ce n’est pas un cliché ?', x: .38, y: .2, mw: 260 }],
  }, {
    w: 1.15,
    draw(w, h) {
      closeUp(1050, 595, 3.3);
      dinner({ t: { eyes: 'narrow', brows: 'angry', mouth: 'smirk', look: [1, 0] } });
      glow(1050, 700, 160, 90, '#FFB84A', 90);
      panelVignette('#3A2430', 120, .5);
    },
    bub: [{ s: 'thibaut', t: 'Just wait till the plot twist hits you. You won’t find it cliche.', tr: 'Attendez que le rebondissement vous frappe. Vous ne le trouverez pas cliché.', x: .5, y: .18, mw: 380 }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 17 — ce que Cris a vu
page(17, [
  [1, [{
    draw(w, h) {
      cam(560, 450, 2.0);
      kitchen({ cross: false, outside: (wx, wy, ww, wh) => {
        paint(rectPts(wx, wy + wh * .55, ww, wh * .45), { wash: '#D8C39C', ink: null });
        treeRound(wx + ww * .85, wy + wh * .7, .4, { ink: false });
        fig('thibaut', wx + ww * .3, wy + wh * .92, { outfit: 'towel', view: 'r', s: .22, armF: [2.4, .3], swk: .5 });
        easel(wx + ww * .62, wy + wh * .93, .2, { flip: true });
        fig('louise', wx + ww * .72, wy + wh * .93, { outfit: 'smock', view: 'l', s: .21, armN: [1.3, .3], swk: .5 });
      } });
      fig('cris', 610, 590, { at: 'head', outfit: 'farm', view: 'b', s: 1.15 });
    },
    cap: [{ t: 'Le lendemain matin.', at: 'tl' }],
  }, {
    draw(w, h) {
      cam(1950, 720, .95);
      farmyard({ table: false });
      fig('thibaut', 2150, 1010, { outfit: 'towel', view: 'r', pose: 'run', ph: .2, ex: 'laugh', look: [-1, 0] });
      fig('louise', 1840, 1020, { outfit: 'smock', view: 'r', pose: 'run', ph: .6, ex: 'laugh', armN: [1.4, .3], handN: 'open' });
    },
  }]],
  [1, [{
    w: .7,
    draw(w, h) {
      cam(1500, 740, 1.0);
      farmyard({ table: false });
      fig('cris', 1450, 1020, { outfit: 'farm', view: 'r', pose: 'walk', ph: .3, ex: 'determined', s: .95 });
    },
  }, {
    w: 1.3,
    draw(w, h) {
      cam(1000, 760, 1.0);
      paint(rectPts(-200, -200, 2400, 1500), { wash: '#6E9A50', ink: null });
      for (let i = 0; i < 6; i++) treeRound(150 + i * 340, 900, 2.0, {});
      paint([[200, 880], [1800, 860], [1900, 1300], [100, 1300]], { wash: '#8DB063', fill: '#5E8C47', fillOp: 70, ink: null });
      paint([[640, 930], [820, 890], [930, 960], [770, 1000]], { wash: '#F4F1EA', ink: PAL.ink, sw: .5, curv: .3 });                       // the towel
      paint([[1060, 945], [1240, 925], [1290, 990], [1090, 1005]], { wash: '#F1EADB', ink: PAL.ink, sw: .5, curv: .3 });                // the smock
      for (const [d, k] of [[0, .9], [3, 1.6]]) paint(blobPts(1100 + d * 4, 980 + d * 3, 7, 6, 8, .3, d), { wash: [PAL.rose, PAL.teal][d % 2], ink: null });
      for (const [x, y, c] of [[880, 905, CAST.thibaut.skin], [905, 925, CAST.thibaut.skin], [990, 910, CAST.louise.skin], [1010, 930, CAST.louise.skin]]) paint(capsule(x, y, x + 60, y + 12, 13, 11, 4), { wash: c, ink: PAL.ink, sw: .5 });
      for (let i = 0; i < 3; i++) paint(heartPts(900 + i * 80, 800 - i * 45, 18 - i * 3), { wash: '#E2476E', ink: PAL.ink, sw: .35 });
      // leaves in the foreground frame the view
      for (const [x, y, rx, ry] of [[250, 520, 420, 340], [1750, 540, 420, 340], [1000, 400, 700, 180], [200, 1160, 380, 200], [1800, 1160, 380, 200]]) paint(scallopPts(x, y, rx, ry, 9, .28, x + y), { wash: '#3C6638', fill: '#2A4A2C', fillOp: 80, ink: PAL.ink, sw: .7 });
    },
  }]],
  [1, [{
    w: .7,
    draw(w, h) {
      cam(900, 600, 2.4);
      paint(rectPts(0, 0, 2000, 1400), { wash: '#4F7E46', ink: null });
      fig('cris', 900, 590, { at: 'head', outfit: 'farm', view: 'r', ex: 'cry', tears: true });
      paint(scallopPts(1080, 600, 120, 200, 7, .3, 4), { wash: '#3C6638', ink: PAL.ink, sw: .6 });
    },
  }, {
    w: 1.3,
    draw(w, h) {
      cam(1150, 800, 1.0);
      treeWorld('day', { mound: true, leaves: true });
      fig('cris', 1220, 1010, { outfit: 'farm', pose: 'crouch', view: 'r', tor: .8, ex: 'angry', reachN: [1310, 1000], reachF: [1350, 990], handN: 'open', handF: 'open', dirt: true });
      dirtClumps(1420, 930, 80, 30, 9, 4);
      for (let i = 0; i < 4; i++) inkLine([[1380 + i * 22, 900], [1400 + i * 25, 860]], .6, PAL.ink, 'inkfine', .3);
    },
  }]],
  [1.05, [{
    draw(w, h) {
      cam(1370, 820, 1.35);
      treeWorld('day', { hole: true });
      paint(capsule(1300, 990, 1250, 950, 13, 11, 4), { wash: '#9AA88A', ink: PAL.ink, sw: .5 });
      for (let i = 0; i < 4; i++) paint(capsule(1250, 950, 1230 - i * 6, 925 + i * 5, 4, 3.5, 3), { wash: '#9AA88A', ink: PAL.ink, sw: .35 });
      fly(1210, 880, 1.2); fly(1290, 860, 1);
      fig('cris', 1450, 1000, { outfit: 'farm', pose: 'kneel', view: 'l', tor: -.35, ex: 'scared', reachN: 'mouth', handN: 'open', dirt: true });
    },
    sfx: [{ t: 'BZZ', x: .2, y: .2, size: 34, rot: -.1, col: PAL.ink }],
  }, {
    draw(w, h) {
      cam(1380, 830, 1.35);
      treeWorld('day', { hole: true });
      suitcase(1300, 1000, .95, { open: 'gold', col: '#3E4C6E' });
      fig('cris', 1480, 1010, { outfit: 'farm', pose: 'kneel', view: 'l', ex: 'surprised', look: [-1, .6], reachN: [1330, 930], holdN: (u) => goldBar(3 * u, 0, u / 4.3 * .9), dirt: true });
    },
  }, {
    draw(w, h) {
      cam(1320, 760, .85);
      treeWorld('day', { mound: true, leaves: true });
      fig('cris', 1470, 1010, { outfit: 'farm', view: 'r', pose: 'walk', ph: .4, ex: 'determined', dirt: true });
    },
  }]],
]);
