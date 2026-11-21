// set gallery (dev only)
page(97, [
  [1, [{ draw(w, h) { cam(950, 560, .62); bedroom({ door: .3, guitarStand: true }); fig('cris', 880, 690, { at: 'hip', outfit: 'bed', pose: 'sitFloor', tor: -.35, ex: 'smile', s: .95 }); fig('thibaut', 1060, 690, { at: 'hip', outfit: 'bed', pose: 'sitFloor', tor: -.2, ex: 'smile' }); duvet({ x0: 800, y: 700, bumps: [[1250, 40, 120], [1400, 30, 90]] }); } },
       { draw(w, h) { cam(1100, 560, .55); parisStreet({}); crowd({ rows: [[880, .5, 22], [960, .7, 12]], banner: [500, 520, 'ON LÂCHE RIEN !'] }); fig('valerian', 900, 1040, { s: .85, holdN: hCoffee, armN: [.5, 1.6], ex: 'talk' }); fig('vlad', 1120, 1040, { s: .85, view: 'l', holdN: hNotebook, armN: [.4, 1.3] }); } }]],
  [1, [{ draw(w, h) { cam(900, 520, .6); tunnel({ blast: [1500, 420, 160], corner: 1500 }); fig('cris', 600, 980, { pose: 'crouch', outfit: 'heist', armN: [2.6, .6], armF: [2.6, .6], ex: 'scared' }); } },
       { draw(w, h) { cam(850, 500, .55); carInterior({}); fig('thibaut', 430, 640, { at: 'hip', pose: 'sit', view: 'pl', armN: [1.4, .2], armF: [1.4, .2] }); fig('cris', 1100, 660, { at: 'hip', pose: 'sit', view: 'pl', outfit: 'heist', ex: 'worried' }); } }]],
  [1.1, [{ draw(w, h) { cam(1100, 520, .45); countryside({ time: 'afternoon', farm: [1900, 640, .6] }); bigTree(1050, 880, .9, { mound: [1250, 900] }); fig('thibaut', 700, 1000, { pose: 'walk', ph: .2, s: .7 }); } },
         { draw(w, h) { cam(1000, 560, .5); farmyard({}); goat(200, 1000, .8); goat(-60, 980, .7, { graze: true, flip: true }); chicken(500, 1020, .9); fig('louise', 1250, 1000, { s: .8, outfit: 'smock', holdN: hBrush, armN: [1.1, .5] }); easel(1450, 1000, .8, { portrait: true }); } }]],
]);
page(96, [
  [1, [{ draw(w, h) { cam(1000, 560, .55); livingRoom({ winOpen: true }); fig('louise', 1110, 900, { at: 'hip', pose: 'sit', view: 'pl', s: .9, y: 0, armN: [1.2, .4], armF: [1.1, .5], ex: 'dreamy' }); } },
       { draw(w, h) { cam(950, 560, .55); kitchen({ groceries: true }); fig('cris', 420, 1000, { outfit: 'farm', holdN: hKnife, armN: [.9, .7], ex: 'neutral', view: 'b' }); } }]],
  [1, [{ draw(w, h) { cam(1000, 560, .55); livingRoom({ night: true, fire: true, dinner: true, piano: false, couch: false }); } },
       { draw(w, h) { cam(1000, 560, .55); hallway({ td: .25, ld: .6 }); } }]],
  [1.1, [{ draw(w, h) { cam(1100, 500, .5); nightWoods({ mound: [1350, 905] }); } },
         { draw(w, h) { cam(1100, 600, .5); nightRoad({}); car(900, 900, .9, { lights: true, night: true, col: '#7A8E9A' }); car(1700, 760, .7, { view: 'front', lights: true, col: '#5A6070' }); } },
         { w: .6, draw(w, h) { cam(600, 500, .7); closet({}); fig('louise', 640, 900, { pose: 'crouch', view: 'f', ex: 'scared', armN: [1.0, 1.2], armF: [1.0, 1.2] }); } }]],
]);
