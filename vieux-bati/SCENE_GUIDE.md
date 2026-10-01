# Guide d'écriture des scènes — « Le vieux bâti doit respirer »

An ~8.4-minute French explainer video, rendered frame by frame from `index.html` (plain Canvas 2D, 1920×1080, 25 fps) by `render.mjs` in headless Chromium. Narration (French TTS) is already generated; its timing is in `src/timing.js`. Every scene is one file in `src/scenes/` that registers a draw function.

## The scene API

```js
scene('plastique', (ctx, S) => {
  // draw the WHOLE 1920×1080 frame (background included)
});
```

`S` gives you:
- `S.t` seconds since the scene started; `S.d` scene duration; `S.T` absolute time (pass it to `presenter`)
- `S.cue(i)` local time (s) when narration line *i* of this scene starts; `S.cueEnd(i)` when it ends
- `S.line` index of the line currently spoken; `S.lineK` 0..1 progress through it
- `S.talk` mouth amplitude now (presenter reads it herself from `S.T`)

**Sync visuals to narration with `S.cue(i)`**, never with hard-coded seconds: e.g. `const k = appear(S.t, S.cue(3), .6)` makes something appear when line 3 starts. The cue sheet (all lines with their local times) is in `out/cues.txt`; regenerate it is not needed. Use cues so the visuals still line up if the voice is regenerated.

Everything must be a **pure function of time** (frames render out of order across several pages): no `Math.random()`, no state carried between frames. Use `hash(n)`, `rng(seed)` (fresh per frame, same seed → same sequence), `noise(x)`.

## Helpers you should use (read `src/core.js`, `src/props.js`, `src/presenter.js` — they're short)

- Easing/timing: `clamp lerp inv smooth ease easeOut easeIn easeOutBack easeOutElastic appear(t,t0,dur,fn) windowed(t,t0,t1,fade)`
- Shapes: `rr fillRR circle ellipse line poly blob arrow(ctx,x1,y1,x2,y2,{color,lw,head,k,curve,dash}) drop puff cloud sun check cross`
- Text: `text(ctx,s,x,y,{size,font,weight,color,align,stroke,maxW})`, `textBlock`, `label(ctx,s,x,y,{k,size,bg,color})` (pop-in pill callout), `stamp(ctx,s,x,y,{k,color})`
- Backgrounds: `paperBg(ctx)` (warm paper), `skyBg(ctx,t,{groundY})`, `ground(ctx,gy)`
- Props: `house(ctx,cx,groundY,w,{finish:'stone'|'lime'|'plastic'|'rpe'|'cement', color, blisters, peel, dirt, algae, cracks, moisture, salt, faded, patina, sparkle, t})` (all damage params 0..1, animate them!), `stoneTexture(w,h,seed,{size})` (cached canvas of rubble stone with lime joints; draw with `ctx.drawImage`), `limeTexture`, `plasticFill`, `blister`, `peelPatch`, `crack`, `gauge`
- `cached(key,w,h,drawFn)` for anything expensive and static → offscreen canvas.
- Palette `C.*` (warm cream/ochre/terracotta/stone, `C.water`, `C.vapor`, `C.plastic`, `C.mold`, `C.danger`, `C.good`…). Fonts: `FONT.title` (Fredoka, rounded, for headings/labels), `FONT.body` (Nunito), `FONT.hand` (Caveat, handwritten annotations).

## The presenter: Margot

`presenter(ctx, {x, y, s, pose, T: S.T, look, lookY, expr, flip, trowel, alpha, tilt, bounce})` — (x,y) = her feet; ~620 px tall at `s:1`. Lip-sync and blinking are automatic from `T`.
- `pose`: a name from `POSES` (`idle explain open point pointL pointUp pointUpL pointDown wave think shrug cheer hold count stop`) or `poseAt(S.t, [[0,'explain'],[S.cue(2),'point'],[S.cue(4),'think']])` to blend between poses over time — **use poseAt keyed on cues so she gestures in rhythm with what she says**. `point` points to viewer-right, `pointL` to viewer-left.
- `expr`: `'happy' | 'worried' | 'surprised' | 'serious' | 'wink'` — match the content (worried when describing damage, happy for solutions…).
- `look` −1..1 gaze direction (look at what she's talking about).
- `presenterBubble(ctx, {x, y, r, k, T: S.T, pose, expr})` — Margot in a round picture-in-picture bubble, for diagram-heavy moments.

**Margot must be visible for most of every scene** (full body at the side, or in a bubble), reacting to the content. Move her around between beats (slide in/out, change side) to keep it lively.

## Layout rules

- **Bottom 170 px is reserved for subtitles** (drawn automatically, centred, ≤ 1560 px wide). Don't put important text/labels there; scenery (ground, the presenter's feet) is fine.
- **Chapter card**: for the first ~2.8 s of chapters 1–9 a dark ribbon crosses the centre of the screen showing the chapter title. Keep the first 2.5 s of your scene simple (establishing shot, things fading in) — it's mostly hidden.
- **Corner tag** top-left (x 30–750, y 28–84) shows the chapter name after 2.6 s: keep that area free of important content.
- Scenes crossfade into each other over 0.6 s, centred on the boundary: your scene's first and last 0.3 s are blended with neighbours. Make the scene's beginning and ending calm.
- Big, bold, readable. On-screen text is short keywords/numbers that reinforce the narration (e.g. « 60 % d'eau », « 10 à 15 L / jour », « Ca(OH)₂ + CO₂ → CaCO₃ »), never paragraphs. French, correct accents.

## Style

Warm, friendly, flat illustrated look with thick dark outlines (`C.ink`, lineWidth 4–6), soft drop shadows (`rgba(0,0,0,.15)` offset 6–10 px), rounded shapes, paper-grain backgrounds. Think a good French educational YouTube channel / "C'est pas sorcier" energy. Educational diagrams (wall cross-sections with layers, water drops/vapor moving through, arrows, gauges) are the heart of it: **the mechanism must be shown, not just named** — water drops travel through the wall and either escape (good) or get trapped and accumulate (bad); blisters grow; ice crystals expand; CO₂ molecules enter lime and turn it to stone, etc.

**Constant motion**: something should always be moving (particles of vapor/water drifting, gentle camera drift `ctx.translate/scale` over the scene, elements popping in on cues, Margot gesturing). No static slides. But keep motion smooth and readable, not frantic.

Physics conventions for wall cross-sections: interior (warm, lived-in, with a lamp/furniture hint) on the **left**, exterior (sky, rain, cold) on the **right**, unless a scene says otherwise. Vapor = soft light-blue puffs (`C.vapor`/`puff`), liquid water = blue drops (`drop`), trapped water = darker blue pooling, frost = white/cyan crystals.

## Performance

Aim < 40 ms per frame. Cache textures with `cached()` / `stoneTexture()` (key must include every parameter). Particle counts in the low hundreds max.

## Checking your work

From `vieux-bati/`:
```bash
node render.mjs --scene=<id> --n=12 --out=out/<id>.jpg      # contact sheet: 12 frames spread over the scene
node render.mjs --sheet=101.5,103,110 --out=out/x.jpg        # specific absolute times
node render.mjs --stills=110.2 --out=out/stills              # full-res PNG
```
Then look at the image (Read tool). Iterate until every beat reads clearly. Check: page errors in the console output, text overflow, overlap with subtitles/corner tag, the presenter not covering key content, sync with the cue sheet.

Only edit your own scene files in `src/scenes/`. Don't modify the shared files (`core.js`, `props.js`, `presenter.js`, `main.js`, `index.html`, `timing.js`); if you need a helper, define it inside your scene file with a scene-specific prefix (e.g. `keim_crystal()`), since all scene files share the global scope.
