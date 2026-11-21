// model sheet (dev only)
const bgPlain = (w, h, c = '#EFE6D6') => paint(rectPts(-30, -30, w + 60, h + 60), { wash: c, ink: null });
page(98, [
  [1.25, [{ draw(w, h) {
      bgPlain(w, h);
      const ks = ['cris', 'thibaut', 'jose', 'valerian', 'vlad', 'louise', 'mari'];
      ks.forEach((k, i) => fig(k, 110 + i * 205, h - 30, { s: .95, ex: ['smile', 'neutral', 'happy', 'suspicious', 'talk', 'smile', 'angry'][i] }));
    } }]],
  [1, [{ draw(w, h) {
      bgPlain(w, h, '#E9EEF0');
      const ks = ['cris', 'thibaut', 'jose', 'valerian', 'vlad', 'louise'];
      ks.forEach((k, i) => fig(k, 120 + i * 240, h * .55, { at: 'head', s: 2.0, ex: ['cry', 'smirk', 'pain', 'shock', 'worried', 'love'][i], tears: i === 0, blackEye: i === 0, crumbs: i === 3, blood: i === 2 }));
    } }]],
  [1.1, [{ draw(w, h) {
      bgPlain(w, h, '#EFE3D3');
      fig('thibaut', 140, h - 30, { pose: 'walk', ph: .25, s: .8 });
      fig('cris', 330, h - 30, { pose: 'run', ph: .3, s: .8, outfit: 'manif' });
      fig('louise', 560, h - 30, { pose: 'sit', s: .8, at: 'hip', view: 'r' });
      fig('jose', 760, h - 30, { pose: 'kneel', s: .8, ex: 'pain', blood: true });
      fig('thibaut', 960, h - 30, { pose: 'crouch', s: .8, outfit: 'farm' });
      fig('vlad', 1150, h - 30, { view: 'f', s: .8 });
      fig('valerian', 1320, h - 30, { view: 'pl', s: .8, ex: 'talk' });
      fig('louise', 1430, h - 30, { view: 'b', s: .8, outfit: 'smock' });
    } }]],
]);
