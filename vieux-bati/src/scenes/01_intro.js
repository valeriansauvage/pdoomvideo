scene('intro', (ctx, S) => {
  skyBg(ctx, S.t);
  house(ctx, 760, 900, 820, { finish: 'plastic', color: '#F2E6CE', blisters: .8, peel: .6, algae: .5, dirt: .5, moisture: .6, salt: .4, cracks: .5, t: S.t });
  presenter(ctx, { x: 1550, y: 1000, T: S.T, pose: poseAt(S.t, [[0, 'wave'], [4, 'point'], [8, 'explain'], [12, 'think']]), expr: 'happy' });
});
