// Planches 17–19 — music and confidences, the detectives arrive, Louise's flashback.

const kitchenPair = (o = {}) => {
  kitchen({ groceries: true, board: false, outside: o.outside });
  fig('cris', o.cx ?? 560, 1010, { outfit: 'farm2', view: 'r', ...o.c });
  fig('louise', o.lx ?? 900, 1010, { view: 'l', ...o.l });
};
const sleepyThibautOutside = (wx, wy, ww, wh) => {
  paint(rectPts(wx, wy + wh * .55, ww, wh * .45), { wash: '#D8C39C', ink: null });
  chair(wx + ww * .45, wy + wh * .96, .16);
  fig('thibaut', wx + ww * .45, wy + wh * .82, { at: 'hip', outfit: 'farm', pose: 'sit', view: 'r', s: .17, tor: -.35, nk: -.3, ex: 'sleep', armN: [-.1, .1], armF: [-.1, .1], swk: .5 });
  table(wx + ww * .7, wy + wh * .97, 50, .16, { col: '#C9A26E' }); laptop(wx + ww * .7, wy + wh * .8, .2);
};
const silhouette = { skinTone: '#2A2442', top: '#2A2442', pants: '#2A2442', shoes: '#2A2442', hair: '#2A2442', hairHi: '#2A2442', brow: '#2A2442', cardigan: null, smock: null, eyes: 'closed', mouth: 'flat', swk: .5 };

// ----------------------------------------------------------------------------------- Planche 18 — confidences
page(18, [
  [1.1, [{
    draw(w, h) {
      cam(1180, 600, .7);
      livingRoom({ night: true, fire: true, winOpen: false });
      louiseAtPiano({ ex: 'love', blush: true, nk: .1 });
      chair(1330, 900, 1, { flip: true });
      fig('thibaut', 1330, 782, { at: 'hip', outfit: 'farm', pose: 'sit', view: 'pl', ex: 'smile', look: [-1, 0], skip: ['armN', 'armF'] });
      guitar(1290, 740, .95, Math.PI + .45);
      fig('thibaut', 1330, 782, { at: 'hip', outfit: 'farm', pose: 'sit', view: 'pl', only: ['armN', 'armF'], reachN: [1250, 735], reachF: [1130, 650] });
      fig('cris', 1700, 770, { at: 'hip', outfit: 'farm2', pose: 'sit', view: 'l', ex: 'suspicious', look: [-1, 0], reachN: [1600, 600], holdN: hBook, reachF: [1610, 640] });
      musicNotes(1050, 470, 1.1, 3, '#F6E6C0'); musicNotes(1380, 500, .9, 2, '#F6E6C0');
    },
    cap: [{ t: 'Le soir.', at: 'tl' }],
  }]],
  [1, [{
    w: 1.2,
    draw(w, h) {
      cam(640, 520, 1.05);
      kitchenPair({ outside: sleepyThibautOutside, c: { ex: 'talk', look: [-.3, -1], nk: -.1 }, l: { ex: 'neutral', reachN: [800, 640], holdN: (u) => paint(ellPts(3 * u, -1 * u, 3 * u, 2.6 * u, 12), { wash: '#D8394E', ink: PAL.ink, sw: .4 }) } });
    },
    cap: [{ t: 'Le lendemain matin.', at: 'tl' }],
    bub: [{ s: 'cris', t: 'I’d really like to read what he’s writing out there. How long did he say he’s staying?', tr: 'J’aimerais vraiment lire ce qu’il écrit dehors. Il a dit qu’il restait combien de temps ?', x: .74, y: .2, mw: 300, size: .92 }],
  }, {
    w: .8,
    draw(w, h) { cam(880, 600, 2.3); kitchen({ groceries: true, board: false }); fig('louise', 890, 590, { at: 'head', view: 'l', ex: 'talk' }); },
    bub: [{ s: 'louise', t: 'We have to respect his privacy. As long as he’s paying, he has an open ended invitation to stay here as long as he wants.', tr: 'On doit respecter sa vie privée. Tant qu’il paie, il peut rester autant qu’il veut.', x: .45, y: .3, mw: 300, size: .9 }],
  }]],
  [1, [{
    draw(w, h) { cam(730, 520, 1.35); kitchenPair({ c: { ex: 'sly' }, l: { ex: 'smile', look: [-1, 0] } }); },
    bub: [{ s: 'cris', t: 'He doesn’t seem to spend a lot of time writing.', tr: 'Il ne passe pas beaucoup de temps à écrire.', x: .24, y: .17, mw: 230 }, { s: 'louise', t: 'He’s composing ideas in his head… I don’t think you like him.', tr: 'Il compose dans sa tête… Je crois qu’il ne te plaît pas.', x: .75, y: .2, mw: 230 }],
  }, {
    draw(w, h) { cam(560, 600, 2.3); kitchen({ groceries: true, board: false }); fig('cris', 560, 590, { at: 'head', outfit: 'farm2', view: 'r', ex: 'sad', look: [.5, .5] }); },
    bub: [{ s: 'cris', t: 'I don’t know him. Do you?… I’m sorry. I guess I don’t really trust men.', tr: 'Je ne le connais pas. Et toi ?… Pardon. Je crois que je ne fais pas vraiment confiance aux hommes.', x: .5, y: .22, mw: 330 }],
  }]],
  [1.1, [{
    draw(w, h) {
      cam(740, 520, 1.25);
      kitchenPair({ c: { ex: 'sad', look: [1, 0] }, l: { ex: 'sad', eyes: 'half', look: [-.5, .5], reachN: [640, 700], handN: 'open' } });
    },
    bub: [{ s: 'louise', t: 'I know how you must feel… I was abused too… I got rid of him… I made him leave. It was so hard to do. We don’t know what we’re doing… when we are inside all that… violence.', tr: 'Je sais ce que tu dois ressentir… Moi aussi, on m’a maltraitée… Je me suis débarrassée de lui… Je l’ai fait partir. C’était si dur. On ne sait plus ce qu’on fait… quand on est au milieu de toute cette… violence.', x: .5, y: .24, mw: 560, size: .95 }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 19 — des inspecteurs
page(19, [
  [1, [{
    w: 1.15,
    draw(w, h) { cam(730, 520, 1.3); kitchenPair({ c: { ex: 'sadtalk', look: [1, 0] }, l: { ex: 'worried' } }); },
    bub: [{ s: 'cris', t: 'I don’t know if I even recognized it when it was happening to me. Don’t tell him I’m leaving…', tr: 'Je ne sais même pas si je m’en rendais compte quand ça m’arrivait. Ne lui dis pas que je pars…', x: .3, y: .24, mw: 330, size: .95 }],
  }, {
    w: .85,
    draw(w, h) { cam(890, 610, 2.3); kitchen({ groceries: true, board: false }); fig('louise', 890, 600, { at: 'head', view: 'l', ex: 'shock', reachN: 'mouth', handN: 'open' }); },
    bub: [{ s: 'louise', t: 'You can’t leave! He’s just a guest!', tr: 'Tu ne peux pas partir ! Ce n’est qu’un client !', x: .45, y: .18, mw: 250 }],
  }]],
  [1, [{
    draw(w, h) { cam(730, 515, 1.25); kitchenPair({ c: { ex: 'sadtalk', look: [1, 0] }, l: { ex: 'determined', reachN: [640, 700], handN: 'open' } }); },
    bub: [{ s: 'cris', t: 'And your lover. I don’t belong here.', tr: 'Et ton amant. Je n’ai pas ma place ici.', x: .22, y: .18, mw: 250 }, { s: 'louise', t: 'You stay. He’ll leave. He is nothing to me.', tr: 'Toi, tu restes. Lui, il partira. Il n’est rien pour moi.', x: .76, y: .22, mw: 260 }],
  }]],
  [1.1, [{
    draw(w, h) {
      cam(1500, 720, .7);
      farmyard({});
      laptop(1790, 716, .8);
      fig('thibaut', 1700, 793, { at: 'hip', outfit: 'farm', pose: 'sit', view: 'r', ex: 'surprised', look: [1, 0], armN: [.3, .9], armF: [.2, .8] });
      car(2350, 1010, 1, { col: '#6E7F92', dust: true, siren: true });
      fig('vlad', 2000, 1030, { view: 'l', pose: 'walk', ph: .1, outfit: 'plain' });
      fig('valerian', 2150, 1040, { view: 'l', pose: 'walk', ph: .6, armband: null, holdF: hCroissant, armF: [.3, 1.2] });
    },
    cap: [{ t: 'Dans la cour.', at: 'tl' }],
    sfx: [{ t: 'VROUM…', x: .88, y: .3, size: 46, rot: .05, col: PAL.cream }],
  }]],
  [1, [{
    draw(w, h) {
      cam(470, 590, 1.9);
      farmyard({ kitchenInside: '#6E7E96' });
      fig('cris', 430, 590, { at: 'head', outfit: 'farm2', view: 'r', ex: 'scared', look: [1, 0], s: .9 });
      fig('louise', 515, 575, { at: 'head', view: 'r', ex: 'shock', look: [1, 0], s: .9 });
      paint(rectPts(380, 470, 180, 190), { wash: '#DCE8EE', washOp: 50, ink: null });
      windowFrame(380, 470, 180, 190, { t: 10 });
      paint(rectPts(330, 672, 280, 260), { wash: '#E6D6B8', ink: null });
    },
    bub: [{ s: 'louise', t: 'They’re police detectives!', tr: 'Ce sont des inspecteurs de police !', x: .72, y: .14, mw: 230 }, { s: 'cris', t: 'Police detectives?', tr: 'Des inspecteurs ?', kind: 'whisper', x: .2, y: .24 }],
  }, {
    w: .62,
    draw(w, h) { cam(890, 600, 2.6); kitchen({ board: false }); panelWash('#3A2E50', 70); fig('louise', 890, 590, { at: 'head', view: 'l', ex: 'determined', eyes: 'half', look: [-1, 0] }); },
    bub: [{ s: 'louise', t: 'Look. I didn’t tell you. My bastard husband. I killed him.', tr: 'Écoute. Je ne te l’ai pas dit. Mon salaud de mari. Je l’ai tué.', x: .5, y: .26, mw: 230, size: .92 }],
  }, {
    w: .5,
    draw(w, h) { cam(560, 600, 2.8); kitchen({ board: false }); fig('cris', 560, 590, { at: 'head', outfit: 'farm2', view: 'r', eyes: 'wide', brows: 'up', mouth: 'flat', sweat: true }); },
    sfx: [{ t: '…', x: .5, y: .18, size: 70, col: PAL.ink }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 20 — flash-back
const night = (op = 120) => panelWash('#1A1E44', op);
page(20, [
  [1, [{
    w: 1.1,
    draw(w, h) {
      cam(800, 620, .95);
      nightBedroom({});
      fig('louise', 560, 700, { at: 'hip', outfit: 'night', view: 'pr', pose: 'lie', rot: -Math.PI / 2 + .3, ex: 'scared', armN: [1.4, .3], armF: [1.6, .2], handN: 'open', handF: 'open' });
      fig('mari', 850, 1010, { view: 'l', tor: .55, ex: 'angry', blush: true, reachN: [660, 620], handN: 'open', holdF: hBottle, armF: [.4, .5] });
      night(70);
      glow(1450, 300, 260, 260, '#9FB0E0', 60);
    },
    cap: [{ t: 'Il y a quelques mois…', at: 'tl', col: '#D9DCF0' }],
  }, {
    w: .9,
    draw(w, h) {
      cam(760, 620, 1.1);
      nightBedroom({});
      fig('mari', 820, 1010, { view: 'l', tor: -.35, nk: -.3, ex: 'pain', armN: [1.2, .4], armF: [1.5, .4], handN: 'open', handF: 'open' });
      fig('louise', 600, 1010, { outfit: 'night', view: 'r', tor: .1, ex: 'angry', reachN: [810, 560], holdN: hLamp, reachF: [740, 600] });
      paint(starPts(800, 560, 80, .4, 9, .3), { wash: '#FFE27A', ink: PAL.ink, sw: .5 });
      night(60);
    },
    sfx: [{ t: 'CRAC !', x: .62, y: .2, size: 80, rot: -.12, col: '#F2B23A' }],
  }]],
  [1, [{
    w: .8,
    draw(w, h) {
      cam(800, 560, 1.0);
      paint(rectPts(0, 0, 1800, 1200), { wash: '#C9A66B', ink: null });
      glow(800, 520, 600, 420, '#FFE2A0', 120);
      fig('mari', 900, 1000, { view: 'l', tor: -.4, nk: -.4, ...silhouette, armN: [1.6, .5], armF: [2.2, .3], handN: 'open', handF: 'open' });
      fig('louise', 640, 1000, { view: 'r', tor: .35, ...silhouette, reachN: [850, 640], reachF: [820, 650], holdN: hLamp });
    },
  }, {
    w: 1.2,
    draw(w, h) {
      cam(900, 700, .85);
      farmyard({ time: 'night', table: false, livingOpen: false });
      night(100);
      fig('mari', 1100, 1050, { at: 'hip', view: 'pr', pose: 'lie', rot: -Math.PI / 2, ...silhouette, armN: [2.9, 0], armF: [2.8, .1] });
      fig('louise', 850, 1050, { outfit: 'night', view: 'l', tor: -.35, ex: 'pain', sweat: true, reachN: [1010, 980], reachF: [990, 990] });
    },
  }]],
  [1.05, [{
    w: .7,
    draw(w, h) {
      cam(800, 600, 1.0);
      paint(rectPts(0, 0, 1800, 1300), { wash: '#1E2450', ink: null });
      paint(ellPts(800, 420, 300, 300, 40), { wash: '#F3EBC8', ink: null });
      glow(800, 420, 420, 420, '#9FB0E0', 70);
      fig('louise', 800, 1050, { view: 'r', ...silhouette, reachN: [760, 520], reachF: [800, 540], holdN: (u) => { xPush(); xR(-Math.PI / 2 - .3); hAxe(u, .5); xPop(); } });
    },
  }, {
    w: 1.3,
    draw(w, h) {
      cam(900, 680, .9);
      barnNight({ pit: true, lantern: [400, 520] });
      goat(1500, 1000, .9, { col: '#C9C0D6' });
      fig('louise', 1000, 1010, { outfit: 'night', view: 'l', tor: .6, ex: 'determined', reachN: [880, 960], reachF: [930, 860], holdN: (u) => {} });
      shovel(870, 980, .95, .6);
      night(40);
    },
  }]],
  [1, [{
    draw(w, h) {
      cam(1000, 700, .9);
      barnNight({ lantern: [300, 520] });
      for (let i = 0; i < 6; i++) paint(blobPts(700 + i * 90, 1030 + (i % 2) * 20, 120, 24, 10, .3, i), { wash: '#8EC3E6', washOp: 120, ink: null });
      goat(1250, 1030, .9, { col: '#E8DFF0' }); goat(1450, 1060, .85, { col: '#C9C0D6', flip: true }); goat(1050, 1080, .8, { graze: true, col: '#DDD4E6' });
      fig('louise', 760, 1020, { outfit: 'night', view: 'r', tor: .35, ex: 'angry', sweat: true, reachN: [880, 880], reachF: [860, 820], holdN: (u) => bucket(4 * u, 6 * u, u / 4.4 * .7) });
      for (let i = 0; i < 5; i++) inkLine([[930 + i * 20, 900], [990 + i * 30, 980]], .6, '#BFE0F4', 'inkfine', .3);
      night(40);
    },
    sfx: [{ t: 'MÊÊÊ !', x: .8, y: .25, size: 50, rot: .1, col: PAL.cream }, { t: 'SPLASH', x: .45, y: .6, size: 46, rot: -.1, col: '#BFE0F4' }],
  }]],
]);
