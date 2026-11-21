// Planches 20–23 — the interrogation in the farmyard, and "we outwitted them!".

// farmyard interrogation: Thibaut by the garden table, the detectives facing him
const yardInterview = (o = {}) => {
  farmyard({});
  car(2500, 1010, 1, { col: '#6E7F92', siren: true });
  fig('thibaut', o.tx ?? 1650, 1030, { outfit: 'farm', view: 'r', ...o.t });
  fig('valerian', o.vx ?? 1880, 1030, { view: 'l', armband: null, ...o.v });
  fig('vlad', o.dx ?? 2060, 1030, { view: 'l', outfit: 'plain', ...o.d });
  if (o.cris) fig('cris', o.cris[0], 1030, { outfit: 'farm2', view: 'r', ...o.cris[1] });
};
const phoneScreen = (u, sw) => {
  xPush(); xT(3 * u, -1.4 * u); xR(-Math.atan2(XM[1], XM[0]) * Math.sign(XM[0] * XM[3] - XM[1] * XM[2] || 1));   // hold it upright, screen to the reader
  paint(rrPts(-2.4 * u, -4.4 * u, 4.8 * u, 8.8 * u, .8 * u), { wash: '#2E2C36', ink: PAL.ink, sw: sw * .45 });
  paint(rrPts(-2 * u, -3.9 * u, 4 * u, 7.8 * u, .4 * u), { wash: '#F5F2EA', ink: null });
  paint(rectPts(-1.8 * u, -3.7 * u, 3.6 * u, 1.4 * u), { wash: '#E2626B', ink: null });
  worldText('airbnb', 0, -3 * u, 1 * u, PAL.cream, { font: 'hand', bold: true });
  worldText('MAI', 0, -.4 * u, 1.3 * u, PAL.ink, { font: 'hand', bold: true });
  worldText('payé ✓', 0, 1.6 * u, .9 * u, '#3A8A5A', { font: 'hand', bold: true });
  xPop();
};

// ----------------------------------------------------------------------------------- Planche 21 — l'interrogatoire
page(21, [
  [1, [{
    w: .9,
    draw(w, h) {
      cam(900, 520, .9);
      kitchen({ groceries: true, board: false });
      fig('louise', 1180, 940, { view: 'r', pose: 'run', ph: .3, ex: 'scared', look: [-1, 0], armN: [.6, .9], handN: 'open' });
      fig('cris', 600, 940, { outfit: 'farm2', view: 'r', ex: 'worried', look: [1, 0] });
    },
    bub: [{ s: 'louise', t: 'I reported him missing… They must have figured it out. Tell them I’m not here!', tr: 'J’ai signalé sa disparition… Ils ont dû comprendre. Dis-leur que je ne suis pas là !', x: .5, y: .2, mw: 300, size: .92 }],
  }, {
    w: 1.1,
    draw(w, h) { cam(1860, 540, 1.1); yardInterview({ t: { ex: 'happy', armN: [.9, .9], handN: 'open', armF: [1.1, .5], handF: 'open' }, v: { ex: 'suspicious' }, d: { ex: 'neutral', reachN: [1980, 830], holdN: hNotebook } }); },
    bub: [{ s: 'thibaut', t: 'J’écris un roman policier ! Pourrais-je vous poser quelques questions sur le travail de détective ?', x: .3, y: .22, mw: 290 }],
  }]],
  [1, [{
    draw(w, h) { cam(1880, 520, 1.15); yardInterview({ t: { ex: 'smile' }, v: { ex: 'angrytalk', armN: [.8, .9], handN: 'open' }, d: { ex: 'suspicious', look: [1, -.4], nk: -.1, reachN: [1990, 830], holdN: hNotebook } }); },
    bub: [{ s: 'valerian', t: 'Nous posons les questions. Depuis combien de temps êtes-vous ici… à écrire ?', x: .46, y: .18, mw: 380 }],
  }]],
  [1, [{
    w: 1.1,
    draw(w, h) { cam(1760, 555, 1.6); yardInterview({ t: { ex: 'smile', reachN: [1735, 650], holdN: phoneScreen }, v: { ex: 'suspicious', look: [-1, .5] } }); },
    bub: [{ s: 'thibaut', t: 'Je suis ici depuis le début du mois. Je suis locataire.', x: .3, y: .2, mw: 260 }],
  }, {
    w: .9,
    draw(w, h) { cam(1770, 525, 1.5); yardInterview({ t: { ex: 'smile', eyes: 'happy' }, v: { ex: 'sly' } }); },
    bub: [{ s: 'valerian', t: 'Donc… tu es seul ?', x: .74, y: .15 }, { s: 'thibaut', t: 'Tout seul.', x: .22, y: .3 }],
  }]],
  [1.15, [{
    draw(w, h) { cam(1860, 470, 1.15); yardInterview({ t: { ex: 'dreamy', look: [-1, -1], armF: [1.6, .4], handF: 'open' }, v: { ex: 'blank' }, d: { ex: 'suspicious', reachN: [1990, 830], holdN: hNotebook } }); },
    bub: [{ s: 'vlad', t: 'Et pourquoi êtes-vous ici ?', x: .8, y: .1, mw: 300 },
          { s: 'thibaut', t: 'Pour s’évader…', x: .2, y: .2 },
          { s: 'vlad', t: 'Pour s’évader ?', x: .86, y: .3 },
          { s: 'thibaut', t: 'Oui, pour s’évader… de la ville… de Paris.', x: .32, y: .4, mw: 380 }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 22 — « Vous me dites quelque chose »
page(22, [
  [1, [{
    w: .8,
    draw(w, h) { cam(1200, 560, .75); farmyard({ doorOpen: true }); fig('cris', 855, 905, { outfit: 'farm2', view: 'r', s: .9, ex: 'worried' }); fig('vlad', 1500, 1060, { view: 'l', outfit: 'plain', ex: 'suspicious', look: [-1, -.3], s: 1.1 }); },
    bub: [{ s: 'vlad', t: 'Seul ? Qui est-ce ?', x: .72, y: .14 }],
  }, {
    w: 1.2,
    draw(w, h) { cam(1860, 530, 1.1); yardInterview({ t: { ex: 'smile', armN: [1.6, .3], handN: 'open' }, v: { ex: 'neutral', look: [-1, 0] } }); },
    bub: [{ s: 'thibaut', t: 'Voici Cris. Elle travaille ici au nettoyage. Elle nourrit tous les animaux… moi y compris. De quoi s’agissait-il exactement, ce vol ?', x: .3, y: .24, mw: 330, size: .92 }],
  }]],
  [1, [{
    w: 1.1,
    draw(w, h) { cam(1900, 520, 1.25); yardInterview({ t: { ex: 'blank' }, v: { ex: 'suspicious' }, d: { ex: 'talk', reachN: [2000, 830], holdN: hNotebook } }); },
    bub: [{ s: 'vlad', t: 'En quoi consiste un vol ? Nous avons prélevé de l’ADN sur le sang retrouvé sur les lieux du crime. Avez-vous des blessures récentes ?', x: .42, y: .24, mw: 400, size: .92 }],
  }, {
    w: .9,
    draw(w, h) {
      cam(1760, 560, 1.35);
      farmyard({});
      fig('thibaut', 1650, 1030, { outfit: 'farm', topStyle: 'bare', view: 'b', ex: 'smirk', reachN: [1600, 668], reachF: [1705, 668], handN: 'fist', handF: 'fist' });
      paint([[1585, 650], [1715, 650], [1722, 700], [1650, 712], [1578, 700]], { wash: '#EDE6D8', fill: '#C9C2B4', fillOp: 60, ink: PAL.ink, sw: .6, curv: .25 });
      fig('valerian', 1880, 1030, { view: 'l', armband: null, ex: 'love', blush: true, look: [-1, .3] });
    },
    bub: [{ s: 'thibaut', t: 'Toutes mes cicatrices sont psychologiques. Mon corps est impeccable. Tu veux voir mes fesses ?', x: .38, y: .22, mw: 270, size: .95 }],
  }]],
  [1, [{
    draw(w, h) { cam(1500, 560, .82); yardInterview({ t: { ex: 'smirk' }, v: { ex: 'smile', blush: true, look: [-1, 0], armN: [1.4, .5], handN: 'open' }, d: { ex: 'neutral' }, cris: [1250, { ex: 'worried', view: 'r' }] }); },
    bub: [{ s: 'valerian', t: 'J’aimerais beaucoup, mais une autre fois.', x: .3, y: .13, mw: 260 }, { s: 'valerian', t: 'Bonjour. Pourriez-vous nous rejoindre ? Nous sommes des détectives, enquêtant sur un vol.', x: .68, y: .2, mw: 300, link: true }],
  }]],
  [1.1, [{
    draw(w, h) { cam(1820, 515, 1.05); yardInterview({ tx: 1450, t: { ex: 'blank' }, v: { ex: 'talk' }, d: { ex: 'suspicious', look: [-1, 0] }, cris: [1640, { ex: 'worried' }] }); },
    bub: [{ s: 'valerian', t: 'Qui êtes-vous ? … Votre nom et votre fonction ici.', x: .36, y: .16, mw: 250 }, { s: 'vlad', t: 'Vous me dites quelque chose. Est-ce qu’on s’est déjà rencontrés ?', x: .79, y: .22, mw: 220, size: .9 }],
  }, {
    draw(w, h) { cam(1760, 490, 1.2); yardInterview({ tx: 1450, t: { ex: 'blank' }, v: { ex: 'talk', reachN: [1800, 760], handN: 'open' }, d: { ex: 'suspicious' }, cris: [1640, { ex: 'smile' }] }); },
    bub: [{ s: 'cris', t: 'Je parle un petit peu français. English is better. I don’t know you.', tr: 'L’anglais, c’est mieux. Je ne vous connais pas.', x: .24, y: .21, mw: 260, size: .88 },
          { s: 'valerian', t: 'Nom et carte d’identité, s’il vous plaît.', x: .76, y: .13, mw: 230, size: .88 },
          { s: 'cris', t: 'Je m’appelle Cristina Martinez.', x: .7, y: .4, mw: 220, size: .88 }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 23 — le sang
page(23, [
  [1, [{
    draw(w, h) { cam(1760, 470, 1.1); yardInterview({ tx: 1450, t: { ex: 'blank' }, v: { ex: 'neutral' }, d: { ex: 'talk' }, cris: [1640, { ex: 'talk' }] }); },
    bub: [{ s: 'vlad', t: 'This man has been here all the time, all this month?', tr: 'Cet homme a été là tout le temps, tout ce mois-ci ?', x: .76, y: .14, mw: 330 },
          { s: 'cris', t: 'Sir, I cook, clean and tend the animals. He’s been here every day of May. This man, I don’t know where he is at night.', tr: 'Monsieur, je cuisine, je fais le ménage et je m’occupe des bêtes. Il a été là tous les jours de mai. La nuit, cet homme, je ne sais pas où il est.', x: .33, y: .38, mw: 560, size: .88 }],
  }]],
  [1, [{
    draw(w, h) { cam(1760, 470, 1.3); yardInterview({ tx: 1450, t: { ex: 'blank' }, v: { ex: 'talk' }, d: { ex: 'neutral' }, cris: [1640, { ex: 'sly' }] }); },
    bub: [{ s: 'valerian', t: 'Where’s the owner of the place?', tr: 'Où est la propriétaire ?', x: .66, y: .13 }, { s: 'cris', t: 'She stays in Paris most of the time.', tr: 'Elle est à Paris la plupart du temps.', x: .27, y: .4, mw: 260 }],
  }, {
    draw(w, h) { cam(1840, 470, 1.3); yardInterview({ tx: 1450, t: { ex: 'blank' }, v: { ex: 'neutral' }, d: { ex: 'smile', look: [-1, 0] }, cris: [1640, { ex: 'suspicious' }] }); },
    bub: [{ s: 'vlad', t: 'Are you ever in Paris?', tr: 'Vous allez parfois à Paris ?', x: .7, y: .13 }, { s: 'cris', t: 'I’m not interested.', tr: 'Ça ne m’intéresse pas.', x: .26, y: .4 }],
  }]],
  [1, [{
    w: 1.1,
    draw(w, h) { cam(1840, 465, 1.25); yardInterview({ tx: 1450, t: { ex: 'blank' }, v: { ex: 'smirk' }, d: { ex: 'worried', blush: true }, cris: [1640, { ex: 'sly', eyes: 'half' }] }); },
    bub: [{ s: 'vlad', t: 'I didn’t mean that. You don’t have any injuries or wounds do you?', tr: 'Ce n’est pas ce que je voulais dire. Vous n’avez pas de blessures, n’est-ce pas ?', x: .64, y: .17, mw: 380, size: .9 }, { s: 'cris', t: 'But you’re interested in my body.', tr: 'Mais mon corps vous intéresse.', x: .22, y: .45, mw: 250, size: .9 }],
  }, {
    w: .9,
    draw(w, h) { cam(1840, 470, 1.3); yardInterview({ tx: 1450, t: { ex: 'blank' }, v: { ex: 'neutral' }, d: { ex: 'talk' }, cris: [1640, { ex: 'blank', eyes: 'wide' }] }); },
    bub: [{ s: 'vlad', t: 'There was a crime and there was blood. We’re doing an investigation.', tr: 'Il y a eu un crime et du sang. Nous menons une enquête.', x: .62, y: .17, mw: 330, size: .9 }, { s: 'cris', t: 'I don’t understand.', tr: 'Je ne comprends pas.', x: .22, y: .46 }],
  }]],
  [1.15, [{
    w: 1.15,
    draw(w, h) { cam(1880, 500, 1.15); yardInterview({ tx: 1450, t: { ex: 'smile' }, v: { ex: 'blank' }, d: { ex: 'talk', reachN: [2010, 830], holdN: hNotebook }, cris: [1640, { ex: 'blank' }] }); },
    bub: [{ s: 'vlad', t: 'Alright. Thank you. That will be all for now. We may be back. Nous reviendrons peut-être. N’hésitez pas à nous contacter si vous avez des informations concernant un crime ou si vous remarquez quelque chose de suspect.', tr: 'D’accord. Merci. Ce sera tout pour l’instant.', x: .55, y: .26, mw: 520, size: .9 }],
  }, {
    w: .85,
    draw(w, h) { cam(1560, 520, 1.4); yardInterview({ tx: 1450, t: { ex: 'happy' }, cris: [1640, { ex: 'surprised', look: [-1, 0] }], dx: 2500, vx: 2500 }); },
    bub: [{ s: 'thibaut', t: 'D’accord.', x: .2, y: .14 }, { s: 'cris', t: 'What?', tr: 'Quoi ?', x: .8, y: .24 }],
  }]],
]);

// ----------------------------------------------------------------------------------- Planche 24 — « On les a eus ! »
page(24, [
  [1, [{
    w: 1.15,
    draw(w, h) { cam(1870, 500, .95); yardInterview({ tx: 1500, t: { ex: 'happy', armF: [2.2, .3], handF: 'open' }, v: { view: 'r', ex: 'blank', pose: 'walk', ph: .3 }, d: { view: 'r', ex: 'angrytalk', pose: 'walk', ph: .7 }, vx: 2050, dx: 2230, cris: [1680, { ex: 'blank' }] }); },
    bub: [{ s: 'thibaut', t: 'Au revoir. Merci messieurs les agents. Je lui expliquerai tout ce que vous dites. Pourriez-vous maintenant répondre à quelques questions sur le travail de détective vu de l’intérieur ?', x: .28, y: .26, mw: 360, size: .9 },
          { s: 'vlad', t: 'Lisez un roman policier.', x: .8, y: .14, mw: 200 }],
  }, {
    w: .85,
    draw(w, h) { cam(1500, 560, 1.4); farmyard({}); fig('thibaut', 1500, 1030, { outfit: 'farm', view: 'r', ex: 'shout', armN: [1.8, .6], handN: 'open', armF: [2.4, .3], handF: 'open' }); },
    bub: [{ s: 'thibaut', t: 'J’écris un roman policier !', kind: 'shout', x: .55, y: .17, mw: 230 }],
  }]],
  [1, [{
    w: .85,
    draw(w, h) { cam(2200, 760, .6); farmyard({}); car(2500, 1000, 1.1, { col: '#6E7F92', dust: true, siren: true }); fig('thibaut', 1860, 1030, { outfit: 'farm', view: 'r', s: .9, ex: 'happy', armF: [2.6, .2], handF: 'open' }); },
    sfx: [{ t: 'VROUM !', x: .72, y: .25, size: 60, rot: -.08, col: PAL.ochre }],
  }, {
    w: 1.15,
    draw(w, h) { cam(1600, 560, 1.4); farmyard({}); fig('cris', 1700, 1030, { outfit: 'farm2', view: 'l', tor: -.2, ex: 'scared' }); fig('thibaut', 1480, 1030, { outfit: 'farm', view: 'r', tor: .25, ex: 'laugh', reachN: [1660, 690], reachF: [1700, 700] }); },
    bub: [{ s: 'thibaut', t: 'Nós os superamos em astúcia!', tr: 'On les a bien eus !', kind: 'shout', x: .3, y: .17, mw: 240 }],
  }]],
  [1, [{
    draw(w, h) {
      cam(1590, 770, .85);
      farmyard({});
      fig('thibaut', 1470, 1030, { outfit: 'farm', view: 'f', ex: 'laugh', armN: [2.6, .4], armF: [2.4, .6], handN: 'open', handF: 'open', legN: [.4, .5], tor: .1 });
      fig('cris', 1700, 1040, { outfit: 'farm2', view: 'l', pose: 'sitFloor', ex: 'pain', armN: [-.6, .1], armF: [-.45, .2], handN: 'open', handF: 'open' });
      musicNotes(1360, 640, .9, 3);
    },
    sfx: [{ t: 'BOUM !', x: .78, y: .3, size: 54, rot: .12, col: PAL.ochre }],
  }, {
    w: .7,
    draw(w, h) { cam(880, 700, .95); farmyard({ doorOpen: true }); fig('cris', 860, 1000, { outfit: 'farm2', view: 'b', pose: 'walk', ph: .2, s: .95, dirt: true }); },
  }, {
    w: 1.3,
    draw(w, h) {
      cam(600, 540, .95);
      closet({});
      fig('louise', 680, 900, { pose: 'crouch', view: 'l', ex: 'scared', look: [-1, -.3], tor: .3, reachN: 'mouth', handN: 'open' });
      fig('cris', 360, 1080, { outfit: 'farm2', view: 'r', ex: 'talk', s: 1.05 });
    },
    bub: [{ s: 'cris', t: 'They’ve left. It was about some robbery somewhere.', tr: 'Ils sont partis. C’était pour un vol, quelque part.', x: .3, y: .17, mw: 260 }],
  }]],
  [1.1, [{
    draw(w, h) {
      cam(650, 590, 1.6);
      closet({});
      fig('louise', 600, 1010, { view: 'r', eyes: 'closed', brows: 'worried', mouth: 'smile', nk: .12, skip: ['armN', 'armF'] });
      fig('cris', 705, 1010, { outfit: 'farm2', view: 'l', eyes: 'closed', brows: 'up', mouth: 'smile', nk: .12, skip: ['armN', 'armF'] });
      fig('louise', 600, 1010, { view: 'r', nk: .12, only: ['armF'], reachF: [738, 690] });
      fig('cris', 705, 1010, { outfit: 'farm2', view: 'l', nk: .12, only: ['armF'], reachF: [572, 668] });
    },
    bub: [{ s: 'louise', t: 'Thibaut. He doesn’t matter.', tr: 'Thibaut. Il ne compte pas.', x: .2, y: .2, mw: 220 }, { s: 'cris', t: 'He doesn’t matter to me. I’ll stay. I think you need him. I will be alright.', tr: 'Pour moi non plus. Je reste. Je crois que tu as besoin de lui. Ça ira, pour moi.', x: .73, y: .26, mw: 300 }],
  }]],
]);
