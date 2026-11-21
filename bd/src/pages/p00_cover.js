// Couverture — the big tree on its hill; the lovers asleep in its shade; a shovel in fresh earth; a glint of gold.
page(0, [], {
  full: {
    draw(w, h) {
      cam(1060, 700, 1.0);
      countryside({ time: 'afternoon', hy: 980, farm: [1900, 1060, .55] });
      paint([[-600, 1500], [300, 1290], [1050, 1240], [1800, 1280], [2800, 1500], [2800, 2600], [-600, 2600]], { wash: '#A9C46E', fill: '#6E8A4E', fillOp: 60, tex: .7, ink: PAL.ink, sw: .8, curv: .4 });
      bigTree(1000, 1330, 1.55, { mound: [1640, 1350] });
      shovel(1760, 1300, 1.1, .2);
      suitcase(820, 1395, .95, { open: 'gold', col: '#3E4C6E' });
      fig('thibaut', 1170, 1400, { outfit: 'heist', view: 'r', pose: 'sitFloor', tor: -.22, nk: .32, eyes: 'closed', mouth: 'smile', dirt: true, s: 1.2, armN: [-.25, .3], armF: [.4, 1.2] });
      fig('cris', 1260, 1420, { outfit: 'heist', view: 'r', pose: 'sitFloor', tor: -.28, nk: -.38, eyes: 'closed', mouth: 'smile', blush: true, dirt: true, s: 1.2, armN: [.35, 1.35], armF: [.5, 1.5] });
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
