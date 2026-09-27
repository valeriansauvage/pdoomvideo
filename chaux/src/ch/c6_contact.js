// c6_contact : 55 – 60 s. La maison rénovée à la chaux, dans la lumière du soir. L'artisan salue depuis la porte,
// le mur respire, et le message de fin s'écrit à gauche.
(() => {
  const HX = 1270, HY = 905, HS = .95;
  function soir() {
    paint(rectPts(-40, -40, W + 80, H + 80), { wash: '#F4D9B8', washOp: 255, ink: null });
    paint(rectPts(-40, -40, W + 80, 420), { wash: '#E9C9A8', washOp: 160, ink: null });
    paint(rectPts(-40, 380, W + 80, 460), { wash: '#F7C98E', washOp: 120, ink: null });
    paint(rectPts(-40, -40, W + 80, 860), { fill: '#EFB88A', fillOp: 60, bleed: .25, tex: .4, border: .2, ink: null });
    paint([[-40, 760], [400, 720], [900, 745], [1400, 700], [1960, 730], [1960, 1120], [-40, 1120]], { wash: '#C9C48E', washOp: 255, fill: '#A5A56A', fillOp: 90, bleed: .08, tex: .6, ink: null, curv: .5 });
    arbre(1780, 905, 1.5, { tex: true, seed: 12, col: '#9FB07A' });
    paint([[-40, 900], [1960, 890], [1960, 1120], [-40, 1120]], { wash: '#B9C28A', washOp: 255, fill: '#8FA062', fillOp: 90, bleed: .08, tex: .7, ink: PAL.ink, sw: .9 });
    maison(HX, HY, HS, { facade: 'chaux', fillTex: true });
    paint([[HX - 150, 1120], [HX - 165, HY], [HX - 95, HY], [HX - 40, 1120]], { wash: '#EAD9B6', washOp: 255, ink: PAL.ink, sw: .6 });
    fleurs(HX - 330, 915, 1.4, [PAL.rose, '#E9C46A', '#FFFFFF'], 7, 3); fleurs(HX + 360, 915, 1.4, ['#B895D6', '#FFFFFF', PAL.rose], 7, 6);
    for (let i = 0; i < 5; i++) touffe(900 + i * 60, 950 + hash(i) * 30, 1.2, PAL.olive, 7, i + 40);
    // un voile clair à gauche pour le texte
    for (let i = 0; i < 6; i++) paint(ellPts(430, 480, 640 - i * 55, 470 - i * 42, 36, 6), { wash: PAL.cream, washOp: 40 + i * 12, ink: null });
  }
  function fin(t, lt) {
    camBegin(960, 540, 1.0 + .02 * ease(lt / 5), 0);
    drawLayer('c6_soir', soir);
    soleil(1650, 470, 64, t, { col: '#F7B955', glow: '#F9D7A4' });
    // fumée de cheminée
    for (let i = 0; i < 5; i++) { const age = frac(t * .22 + i / 5), x = HX + 175 * HS + Math.sin(age * 5 + i) * 16 + age * 40, y = HY - 675 * HS - age * 170; paint(ellPts(x, y, 12 + age * 28, 9 + age * 18, 12), { wash: '#FFFFFF', washOp: 110 * (1 - age), ink: null }); }
    // le mur respire
    [[-40, -330], [260, -250], [-280, -230]].forEach(([dx, dy], i) => {
      const age = frac((t - 55) / 2.2 + i * .37), k = .8 * inOut(age, 0, 1, .3) * seg(t, 55.6, 56.2);
      if (k > .03) vapeur(HX + dx * HS + Math.sin(age * 4 + i) * 12, HY + dy * HS - 20 - age * 120, 24 + age * 8, { alpha: k, face: i === 0, mood: 'happy', seed: i });
    });
    for (let i = 0; i < 3; i++) oiseau(1100 - (t - 55) * 70 + i * 46, 200 + Math.sin(t * 2 + i) * 10 + (i % 2) * 26, 1.2 - i * .15, t, i * .3);
    // l'artisan salue depuis le pas de la porte
    const op = houseOpenings(HX, HY, HS);
    artisan(op.door.x + op.door.w / 2 + 40, HY + 6, 17, { aR: 1.2 + .35 * Math.sin(t * 7), aL: -1.1, eyes: 'happy', mouth: 'grin', dy: -.05 * pulse(t, 5), handL: (s, sw) => truelle(s, sw, { rot: -1.2 }) });
    // message
    letter('Redonnons du souffle', 430, 300, 92, PAL.ink, { font: 'title', pop: seg(t, 55.3, 55.7) });
    letter('à votre maison', 430, 400, 92, PAL.ink, { font: 'title', pop: seg(t, 55.5, 55.9) });
    const u = ease(seg(t, 55.9, 56.6));
    if (u > 0) inkLine(partial([[175, 458], [350, 450], [520, 456], [690, 446]], u), 2.8, PAL.ocre, 'ink', .5);
    letter('Valérian Sauvage', 430, 560, 84, PAL.ocreDk, { font: 'hand', pop: seg(t, 56.4, 56.8), rot: -.02 });
    letter('Enduits à la chaux · Bâti ancien', 430, 640, 40, PAL.ink, { font: 'text', weight: 700, pop: seg(t, 56.7, 57.1) });
    letter('valeriansauvage.fr', 430, 712, 46, PAL.tuileDk, { font: 'text', weight: 800, pop: seg(t, 57.0, 57.4) });
    camEnd();
  }
  chapter('contact', 55, 60, [[55, fin]]);
})();
