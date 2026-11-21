// Planches 11–13 — Louise's farm: the arrival, Thibaut the paying guest, the night in the hallway.

const louiseAtPiano = (o = {}) => {
  pianoBench(1125, 900, 1);
  fig('louise', 1122, 772, { at: 'hip', pose: 'sit', view: 'pl', reachN: [985, 748], reachF: [960, 752], ex: o.ex || 'dreamy', ...o });
};
const tallGrass = (x0, x1, y, h, seed = 1) => {
  paint([[x0, y + 200], [x0, y - h * .5], [x1, y - h * .55], [x1, y + 200]], { wash: '#A3B85E', fill: '#6E8A3E', fillOp: 70, tex: .7, ink: null });
  for (let i = 0; i < 70; i++) { const x = lerp(x0, x1, hash(i * 3.7 + seed)), hh = h * (.6 + .6 * hash(i * 1.3 + seed)), lean = (hash(i * 2.9) - .5) * 60; inkLine([[x, y + 20], [x + lean * .4, y - hh * .5], [x + lean, y - hh]], .8, i % 3 ? '#5E7A34' : '#B9C46A', 'ink', .5); }
};

// ----------------------------------------------------------------------------------- Planche 11 — Louise
page(11, [
  [1.1, [{
    w: 1.2,
    draw(w, h) {
      cam(830, 560, .66);
      livingRoom({ winOpen: true });
      louiseAtPiano();
      musicNotes(330, 300, 1.3, 3, '#6A5A7A'); musicNotes(1150, 330, 1.0, 2, '#6A5A7A');
    },
    cap: [{ t: 'Non loin de là.', at: 'tl' }],
  }, {
    w: .8,
    draw(w, h) {
      cam(1000, 700, 1.0);
      countryside({ time: 'afternoon', hy: 560 });
      fig('cris', 1000, 1020, { outfit: 'heist', pose: 'walk', ph: .2, tor: .15, dirt: true, blackEye: true, faceBlood: true, ex: 'tired', look: [1, .3] });
      tallGrass(500, 1500, 1000, 240, 3);
    },
  }]],
  [1, [{
    draw(w, h) {
      cam(900, 640, .58);
      farmyard({ livingOpen: true, table: false });
      musicNotes(1200, 420, 1.2, 3, '#5A4A6A');
      fig('cris', 1120, 1010, { outfit: 'heist', view: 'b', pose: 'walk', ph: .5, s: .9, dirt: true });
    },
  }]],
  [1.05, [{
    draw(w, h) {
      cam(720, 520, .95);
      livingRoom({ winOpen: true });
      fig('cris', 330, 560, { at: 'head', outfit: 'heist', view: 'r', dirt: true, blackEye: true, faceBlood: true, ex: 'sadtalk', reachN: [400, 655], reachF: [440, 650] });
      livingWindowFront();
      louiseAtPiano({ ex: 'surprised', nk: -.1, look: [-1, 0] });
    },
    bub: [{ s: 'cris', t: 'Pourriez-vous m’aider ?', x: .42, y: .16 }],
  }]],
  [1.05, [{
    w: 1.2,
    draw(w, h) {
      cam(1450, 593, 1.15);
      livingRoom({ winOpen: true });
      fig('louise', 1340, 1010, { view: 'r', ex: 'worried', reachN: [1480, 700], handN: 'open' });
      fig('cris', 1560, 1010, { outfit: 'heist', view: 'l', tor: .12, dirt: true, blackEye: true, faceBlood: true, ex: 'sadtalk', reachN: 'chest' });
    },
    bub: [{ s: 'louise', t: 'Que vous est-il arrivé ?', x: .2, y: .14, mw: 190 }, { s: 'cris', t: 'Mon homme… He beat me up and threw me out of our car and drove away.', tr: 'Il m’a frappée, m’a jetée hors de la voiture et il est parti.', x: .65, y: .24, mw: 300, size: .9 }],
  }, {
    w: .8,
    draw(w, h) {
      cam(1565, 600, 2.6);
      livingRoom({ winOpen: true });
      fig('louise', 1570, 590, { at: 'head', view: 'l', ex: 'shock', look: [-1, 0], reachN: 'mouth', handN: 'open' });
    },
    bub: [{ s: 'louise', t: 'Votre homme qui a fait ça ?', x: .35, y: .18, mw: 190 }],
  }, {
    w: .8,
    draw(w, h) {
      cam(1500, 640, 1.25);
      livingRoom({ winOpen: true });
      fig('louise', 1450, 1010, { view: 'r', pose: 'run', ph: .25, ex: 'determined', reachN: [1580, 760], holdN: (u) => bowl(4 * u, 2 * u, u / 4.4 * .8), reachF: [1560, 700], holdF: (u) => paint(rectPts(1 * u, -3 * u, 8 * u, 6 * u), { wash: '#F4F1EA', ink: PAL.ink, sw: .4 }) });
      for (let i = 0; i < 3; i++) inkLine([[1250, 820 + i * 40], [1330, 820 + i * 40]], .6, PAL.ink, 'inkfine', 0);
    },
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 12 — la ferme
page(12, [
  [1.1, [{
    draw(w, h) {
      cam(420, 660, .69);
      farmyard({ table: false });
      goat(-20, 1010, .85); goat(150, 1050, .8, { graze: true, flip: true }); chicken(540, 1080, 1, { peck: true }); chicken(620, 1060, .9, { flip: true });
      fig('cris', 380, 1060, { outfit: 'farm', view: 'l', ex: 'neutral', reachN: [300, 890], holdN: (u) => bucket(2 * u, 10 * u, u / 4.4 * .55, false) });
      fig('louise', 700, 1050, { view: 'l', ex: 'talk', armN: [1.2, .5], handN: 'open' });
    },
    cap: [{ t: 'Le lendemain matin.', at: 'tl' }],
    bub: [{ s: 'louise', t: 'You could help around here. I have the room… Help me make up a room.', tr: 'Tu pourrais m’aider ici. J’ai de la place… Aide-moi à préparer une chambre.', x: .71, y: .22, mw: 320, size: .86 }],
  }, {
    draw(w, h) {
      cam(560, 560, 1.35);
      farmyard({ table: false });
      chicken(500, 1080, 1, {});
      fig('cris', 420, 1060, { outfit: 'farm', view: 'r', ex: 'blank', look: [1, -.3], reachN: [470, 900], holdN: (u) => bucket(2 * u, 10 * u, u / 4.4 * .55, false) });
      fig('louise', 690, 1050, { view: 'l', ex: 'smile', armN: [.5, 1.6], handN: 'open' });
    },
    bub: [{ s: 'louise', t: 'A guest is coming this afternoon. He’s a week late. He paid for the month. He’s writing a book or something. Most likely he’ll stay longer if we treat him right.', tr: 'Un client arrive cet après-midi. Il a une semaine de retard. Il a payé le mois. Il écrit un livre ou quelque chose comme ça. Il restera sûrement plus longtemps si on le soigne bien.', x: .48, y: .26, mw: 410, size: .86 }],
  }]],
  [1, [{
    w: .9,
    draw(w, h) {
      cam(745, 590, .62);
      kitchen({});
      fig('cris', 340, 920, { outfit: 'farm', view: 'r', ex: 'neutral', look: [.5, .5], reachN: [430, 685], holdN: hKnife, reachF: [470, 690] });
      fig('louise', 1150, 1010, { view: 'r', ex: 'surprised', look: [1, 0] });
    },
    cap: [{ t: 'L’après-midi.', at: 'tl' }],
    sfx: [{ t: 'TOC TOC', x: .86, y: .32, size: 56, rot: .1, col: PAL.ochre }],
  }, {
    w: 1.1,
    draw(w, h) {
      cam(-20, 620, 1.05);
      livingRoom({ frontDoor: 1 });
      suitcase(130, 1000, .95, { col: '#3E4C6E', handle: 1 });
      fig('thibaut', -40, 1000, { outfit: 'farm', view: 'r', ex: 'smile', armN: [.2, .4] });
      fig('louise', 300, 1010, { view: 'l', ex: 'smile', armN: [.9, .7], handN: 'open', blush: true });
    },
    bub: [{ s: 'louise', t: 'Bienvenue. Vous êtes Thibaut ? Entrez.', x: .68, y: .15, mw: 270 }],
  }]],
  [1.1, [{
    draw(w, h) {
      cam(560, 600, .9);
      livingRoom({ frontDoor: .3 });
      suitcase(180, 1000, .9, { col: '#3E4C6E' });
      fig('thibaut', 320, 1010, { outfit: 'farm', view: 'r', ex: 'blank', nk: .15, look: [1, 0] });
      fig('louise', 640, 1010, { view: 'r', ex: 'talk', look: [1, 0], armF: [1.1, .4], handF: 'open' });
      fig('cris', 960, 1010, { outfit: 'farm', view: 'l', ex: 'blank', nk: .12, look: [-1, 0], reachN: [880, 820], holdN: hKnife });
    },
    bub: [{ s: 'louise', t: 'Cris, come out and meet Thibaut.', tr: 'Cris, viens dire bonjour à Thibaut.', x: .5, y: .15, mw: 300 }],
    sfx: [{ t: '…', x: .3, y: .3, size: 54, col: PAL.cream }, { t: '…', x: .8, y: .3, size: 54, col: PAL.cream }],
  }]],
  [1, [{
    w: 1.1,
    draw(w, h) {
      cam(560, 600, 1.1);
      livingRoom({ frontDoor: .3 });
      fig('louise', 380, 1010, { view: 'l', ex: 'smile', pose: 'walk', ph: .2, armF: [1.0, .6], handF: 'open' });
      fig('thibaut', 600, 1010, { outfit: 'farm', view: 'l', pose: 'walk', ph: .6, ex: 'neutral', reachN: [760, 830], holdN: (u) => suitcase(3 * u, 30 * u, u / 4.78 * .9, { col: '#3E4C6E' }) });
      fig('cris', 940, 1010, { outfit: 'farm', view: 'b', ex: 'blank', reachN: [880, 820], holdN: hKnife });
    },
    bub: [{ s: 'louise', t: 'Permettez-moi de vous montrer votre chambre.', x: .3, y: .15, mw: 260 }],
  }, {
    w: .9,
    draw(w, h) {
      cam(900, 620, .75);
      livingRoom({ winOpen: true });
      glow(400, 700, 500, 300, '#FFF2D6', 50);
    },
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 13 — la nuit
page(13, [
  [1, [{
    w: 1.25,
    draw(w, h) {
      cam(1720, 700, 1.25);
      farmyard({});
      laptop(1790, 716, .8);
      fig('thibaut', 1700, 793, { at: 'hip', outfit: 'farm', pose: 'sit', view: 'r', ex: 'smile', blush: true, look: [-.5, -.4], reachN: [1770, 710], reachF: [1800, 712] });
      fig('louise', 1590, 1010, { view: 'r', tor: .3, nk: .1, ex: 'love', blush: true, reachN: [1690, 640], reachF: [1760, 700], holdF: hCoffee });
      paint(heartPts(1660, 520, 16), { wash: '#E2476E', ink: PAL.ink, sw: .4 }); paint(heartPts(1700, 480, 11), { wash: '#E2476E', ink: PAL.ink, sw: .35 });
    },
    cap: [{ t: 'Le lendemain matin.', at: 'tl' }],
  }, {
    w: .75,
    draw(w, h) {
      cam(470, 590, 2.3);
      farmyard({ kitchenInside: '#6E7E96' });
      fig('cris', 470, 570, { at: 'head', outfit: 'farm', view: 'r', ex: 'suspicious', look: [1, 0], reachN: [520, 640] });
      paint(rectPts(380, 470, 180, 190), { wash: '#DCE8EE', washOp: 50, ink: null });
      windowFrame(380, 470, 180, 190, { t: 10 });
      paint(rectPts(330, 672, 280, 260), { wash: '#E6D6B8', ink: null });
    },
  }]],
  [1.05, [{
    draw(w, h) {
      cam(565, 560, 1.2);
      hallway({ td: .28, ld: 0, lamp: 60 });
      fig('thibaut', 470, 1010, { outfit: 'night', view: 'r', ex: 'angry', armN: [.4, .4], handN: 'open' });
      fig('cris', 700, 1000, { outfit: 'night', view: 'l', pose: 'run', ph: .3, tor: .25, ex: 'angrytalk', armN: [1.3, .2], armF: [1.4, .3], handN: 'open', handF: 'open' });
    },
    cap: [{ t: 'Le soir.', at: 'tl' }],
    bub: [{ s: 'cris', t: 'O que você acha que está fazendo?!', tr: 'Qu’est-ce que tu crois faire ?!', kind: 'shout', x: .66, y: .15, mw: 230 }, { s: 'thibaut', t: 'Silêncio! Volte para o seu quarto.', tr: 'Silence ! Retourne dans ta chambre.', kind: 'whisper', x: .2, y: .36, mw: 220 }],
  }, {
    draw(w, h) {
      cam(560, 545, 1.7);
      hallway({ td: .28, ld: 0, lamp: 60 });
      fig('thibaut', 480, 1010, { outfit: 'night', view: 'r', ex: 'angrytalk', armN: [.9, .3], handN: 'open' });
      fig('cris', 640, 1010, { outfit: 'night', view: 'l', ex: 'sadtalk', reachN: [540, 650], handN: 'open' });
    },
    bub: [{ s: 'cris', t: 'Deixe-me entrar.', tr: 'Laisse-moi entrer.', x: .64, y: .13 }, { s: 'thibaut', t: 'Você está louco? Sai daqui.', tr: 'T’es fou ? Sors d’ici.', kind: 'whisper', x: .2, y: .3, mw: 200 }],
  }]],
  [1, [{
    w: 1.15,
    draw(w, h) {
      cam(560, 620, 1.55);
      hallway({ td: .28, ld: 0, lamp: 60 });
      fig('cris', 650, 1010, { outfit: 'night', view: 'l', tor: -.25, ex: 'sadtalk', armN: [1.2, .4], handN: 'open' });
      fig('thibaut', 470, 1010, { outfit: 'night', view: 'r', tor: .2, ex: 'angry', reachN: [600, 690], reachF: [620, 720], handN: 'open', handF: 'open' });
      for (let i = 0; i < 3; i++) inkLine([[720 + i * 10, 640 + i * 40], [770 + i * 10, 640 + i * 40]], .6, PAL.cream, 'inkfine', 0);
    },
    bub: [{ s: 'thibaut', t: '¡Vete!', tr: 'Va-t’en !', kind: 'shout', x: .2, y: .17 }, { s: 'cris', t: 'Não toque naquela mulher.', tr: 'Ne touche pas à cette femme.', x: .74, y: .2, mw: 220 }],
  }, {
    w: .85,
    draw(w, h) {
      cam(560, 600, 1.7);
      hallway({ td: .28, ld: .2, lamp: 60 });
      fig('cris', 640, 1010, { outfit: 'night', view: 'r', ex: 'shock', look: [1, 0] });
      fig('thibaut', 480, 1010, { outfit: 'night', view: 'r', ex: 'surprised', look: [1, 0] });
    },
    bub: [{ t: 'Thibaut ?', x: .72, y: .2, tail: [1.04, .4] }],
  }]],
  [1.15, [{
    draw(w, h) {
      cam(1050, 590, .74);
      hallway({ td: .28, ld: .55, lamp: 70 });
      fig('cris', 420, 1010, { outfit: 'night', view: 'r', ex: 'sad', look: [1, 0], s: .95 });
      panelVignette(PAL.night, 70, .55);
      fig('thibaut', 1100, 1010, { outfit: 'night', view: 'r', pose: 'walk', ph: .3, ex: 'smile' });
      fig('louise', 1575, 1010, { outfit: 'robe', view: 'l', ex: 'love', blush: true, armN: [2.2, .6], handN: 'open' });
    },
    bub: [{ s: 'louise', t: 'Je me demandais si vous pourriez m’aider à changer une ampoule que je n’arrive pas à atteindre. Cela ne prendra qu’un instant…', x: .6, y: .17, mw: 560, size: .95 }],
  }]],
]);
