// Couverture — the big tree on its hill; the lovers asleep in its shade; a shovel in fresh earth; a glint of gold.
page(0, [], {
  full: {
    draw(w, h) {
      cam(1060, 700, 1.0);
      countryside({ time: 'afternoon', hy: 980, farm: [1900, 1060, .55] });
      paint([[-600, 1500], [300, 1290], [1050, 1240], [1800, 1280], [2800, 1500], [2800, 2600], [-600, 2600]], { wash: '#A9C46E', fill: '#6E8A4E', fillOp: 60, tex: .7, ink: PAL.ink, sw: .8, curv: .4 });
      bigTree(1000, 1330, 1.55, { mound: [1450, 1335] });
      suitcase(760, 1360, .85, { open: 'gold', col: '#3E4C6E' });
      shovel(1560, 1290, 1.1, .2);
      fig('cris', 860, 1440, { at: 'hip', outfit: 'heist', view: 'pr', pose: 'lie', rot: -Math.PI / 2 + .05, ex: 'sleep', dirt: true, shadow: false, armN: [.6, 1.5], legN: [.2, .4], s: 1.1 });
      fig('thibaut', 930, 1500, { at: 'hip', outfit: 'heist', view: 'pr', pose: 'lie', rot: -Math.PI / 2, ex: 'sleep', dirt: true, shadow: false, armN: [.3, 1.2], legF: [.3, .6], s: 1.1 });
      grassStrokes(-300, 2400, 1700, 120, 90, '#5E7A34', .9);
      flowers(-300, 2400, 1600, 1900, 60);
    },
  },
  over(c) {
    const line = (t, y, size) => {
      c.save(); c.font = `${size}px ${F_FX}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
      c.lineWidth = size * .16; c.strokeStyle = PAL.ink; c.strokeText(t, PW / 2 + size * .05, y + size * .06); c.fillStyle = PAL.ink; c.fillText(t, PW / 2 + size * .05, y + size * .06);
      c.lineWidth = size * .1; c.strokeStyle = PAL.ink; c.strokeText(t, PW / 2, y); c.fillStyle = PAL.cream; c.fillText(t, PW / 2, y); c.restore();
    };
    line('Sous un arbre', 190, 150); line('à la campagne', 350, 150);
    c.save(); c.font = `italic 600 34px ${F_DIAL}`; c.textAlign = 'center'; c.fillStyle = PAL.ink; c.globalAlpha = .85;
    c.fillText('Bande dessinée d’après le scénario original', PW / 2, PH - 90); c.restore();
  },
});
