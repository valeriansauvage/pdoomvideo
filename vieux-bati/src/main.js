// main.js — scene registry, timeline dispatch, chapter cards, subtitles, transitions, render API.
'use strict';
const SCENES = {};
// Register a scene. fn(ctx, S) draws the whole 1920×1080 frame.
// S = { t, d, T, cue(i), cueEnd(i), line, lineK, talk, title, index }
//   t: seconds since scene start, d: scene duration, T: absolute time
//   cue(i): local time when narration line i starts (cueEnd(i): when it ends)
//   line: index of the line being spoken (or last spoken), lineK: 0..1 progress through it
function scene(id, fn) { SCENES[id] = fn; }

const XFADE = .6;
const TT = () => window.TIMING;

function sceneState(si, T) {
  const sc = TT().scenes[si], t = T - sc.start;
  const cue = i => (sc.lines[Math.min(i, sc.lines.length - 1)] || { start: sc.start }).start - sc.start;
  const cueEnd = i => (sc.lines[Math.min(i, sc.lines.length - 1)] || { end: sc.start }).end - sc.start;
  let line = -1; sc.lines.forEach((l, i) => { if (T >= l.start - .05) line = i; });
  const L = sc.lines[Math.max(0, line)];
  const lineK = line < 0 ? 0 : inv(L.start, L.end, T);
  return { t, d: sc.end - sc.start, T, cue, cueEnd, line, lineK, talk: talkAt(T), title: sc.title, index: si, id: sc.id };
}
function drawScene(ctx, si, T) {
  const sc = TT().scenes[si], fn = SCENES[sc.id];
  ctx.save();
  if (fn) fn(ctx, sceneState(si, T));
  else { paperBg(ctx); text(ctx, `[${sc.id}]`, W / 2, H / 2, { size: 80 }); presenter(ctx, { x: 1500, y: 1000, T, pose: 'explain' }); }
  ctx.restore();
}

// ---- chapter card (big ribbon at the start of chapters 2..n) and corner tag ----
function chapterCard(ctx, si, T) {
  const sc = TT().scenes[si]; if (si === 0) return;
  const t = T - sc.start;
  // ribbon
  const kin = easeOutBack(inv(.05, .6, t), 1.2), kout = easeIn(inv(2.3, 2.75, t));
  if (t < 2.8) {
    ctx.save();
    const y = 470, x = lerp(-W, 0, kin) + lerp(0, W * 1.1, kout);
    ctx.translate(x, 0);
    ctx.fillStyle = 'rgba(43,38,35,.92)'; ctx.beginPath(); ctx.moveTo(180, y - 120); ctx.lineTo(W - 140, y - 140); ctx.lineTo(W - 180, y + 120); ctx.lineTo(140, y + 140); ctx.closePath(); ctx.fill();
    circle(ctx, 330, y, 92, C.ochre, C.paper, 8);
    text(ctx, String(si), 330, y + 6, { size: 110, font: FONT.title, weight: 700, color: C.ink });
    text(ctx, 'CHAPITRE ' + si, 470, y - 52, { size: 40, font: FONT.title, weight: 600, color: C.ochre, align: 'left' });
    text(ctx, sc.title, 470, y + 28, { size: 88, font: FONT.title, weight: 700, color: C.paper, align: 'left', maxW: 1250 });
    ctx.restore();
  }
  // corner tag
  const last = si === TT().scenes.length - 1, lastEnd = last ? sc.lines[sc.lines.length - 1].end - sc.start : 1e9;
  const kt = appear(t, 2.6, .5) * (1 - appear(t, Math.min(sc.end - sc.start - .6, lastEnd + .3), .4));
  if (kt > 0) {
    ctx.save(); ctx.globalAlpha = kt; ctx.translate(lerp(-40, 0, kt), 0);
    setFont(ctx, 30, FONT.title, 600); const w = ctx.measureText(sc.title).width;
    fillRR(ctx, 30, 28, w + 110, 56, 28, 'rgba(43,38,35,.82)');
    circle(ctx, 58, 56, 20, C.ochre); text(ctx, String(si), 58, 58, { size: 26, font: FONT.title, weight: 700 });
    text(ctx, sc.title, 92, 58, { size: 30, font: FONT.title, weight: 600, color: C.paper, align: 'left' });
    ctx.restore();
  }
}

// ---- subtitles: long lines are split into readable chunks timed by character count ----
const _subCache = new Map();
function subChunks(l) {
  if (_subCache.has(l)) return _subCache.get(l);
  const parts = l.t.match(/[^.?!:;…]+[.?!:;…»]*\s*/g) || [l.t];
  const merged = [];
  for (const p of parts) { const last = merged[merged.length - 1]; if (last && (last.length + p.length < 95)) merged[merged.length - 1] = last + p; else merged.push(p); }
  const out = []; const total = merged.reduce((a, b) => a + b.length, 0); let acc = 0;
  for (const m of merged) { const s = l.start + (l.end - l.start) * acc / total; acc += m.length; out.push({ s, e: l.start + (l.end - l.start) * acc / total, t: m.trim() }); }
  _subCache.set(l, out); return out;
}
function subtitles(ctx, T) {
  for (const sc of TT().scenes) for (const l of sc.lines) {
    if (T < l.start - .1 || T > l.end + .35) continue;
    const ch = subChunks(l); let c = ch.find(c => T < c.e + .02) || ch[ch.length - 1];
    const a = Math.min(appear(T, c.s - .1, .15), 1 - appear(T, l.end + .2, .15));
    if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha = a; setFont(ctx, 42, FONT.body, 800);
    const ls = wrap(ctx, c.t, 1480), lh = 54, bw = Math.max(...ls.map(s => ctx.measureText(s).width)) + 60, bh = ls.length * lh + 26;
    const y0 = H - 38 - bh;
    fillRR(ctx, W / 2 - bw / 2, y0, bw, bh, 18, 'rgba(25,22,20,.78)');
    ls.forEach((s, i) => text(ctx, s, W / 2, y0 + 13 + lh / 2 + i * lh + 2, { size: 42, color: '#FFFFFF', font: FONT.body, weight: 800 }));
    ctx.restore();
    return;
  }
}

// ---- frame ----
let _A, _B;
function offscreen() { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
function frame(ctx, T) {
  const sc = TT().scenes; let si = sc.findIndex(s => T < s.end); if (si < 0) si = sc.length - 1;
  const start = sc[si].start;
  ctx.save(); ctx.clearRect(0, 0, W, H);
  if (si > 0 && T < start + XFADE / 2) {
    // crossfade from previous scene
    _A = _A || offscreen(); _B = _B || offscreen();
    const a = _A.getContext('2d'), b = _B.getContext('2d');
    a.clearRect(0, 0, W, H); b.clearRect(0, 0, W, H);
    drawScene(a, si - 1, T); drawScene(b, si, T);
    const k = smooth(inv(start - XFADE / 2, start + XFADE / 2, T));
    ctx.drawImage(_A, 0, 0); ctx.globalAlpha = k; ctx.drawImage(_B, 0, 0); ctx.globalAlpha = 1;
  } else if (si < sc.length - 1 && T > sc[si].end - XFADE / 2) {
    _A = _A || offscreen(); _B = _B || offscreen();
    const a = _A.getContext('2d'), b = _B.getContext('2d');
    a.clearRect(0, 0, W, H); b.clearRect(0, 0, W, H);
    drawScene(a, si, T); drawScene(b, si + 1, T);
    const k = smooth(inv(sc[si].end - XFADE / 2, sc[si].end + XFADE / 2, T));
    ctx.drawImage(_A, 0, 0); ctx.globalAlpha = k; ctx.drawImage(_B, 0, 0); ctx.globalAlpha = 1;
  } else drawScene(ctx, si, T);
  chapterCard(ctx, si, T);
  if (!window.NO_SUBS) subtitles(ctx, T);
  // progress bar
  const D = TT().duration, lastLine = sc[sc.length - 1].lines.slice(-1)[0];
  ctx.globalAlpha = 1 - appear(T, lastLine.end + .3, .4);
  ctx.fillStyle = 'rgba(43,38,35,.25)'; ctx.fillRect(0, H - 8, W, 8);
  ctx.fillStyle = C.ochre; ctx.fillRect(0, H - 8, W * T / D, 8);
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ---- API used by render.mjs and the preview page ----
const out = document.getElementById('out'), octx = out.getContext('2d');
window.renderAt = (T, type = 'image/jpeg', q = .92) => { frame(octx, T); return out.toDataURL(type, q); };
window.drawAt = T => frame(octx, T);
window.renderSheet = (times, cols = 3, w = 640) => {
  const h = w * 9 / 16, rows = Math.ceil(times.length / cols), c = document.createElement('canvas'); c.width = cols * w; c.height = rows * (h + 34);
  const g = c.getContext('2d'); g.fillStyle = '#222'; g.fillRect(0, 0, c.width, c.height); const ms = [];
  times.forEach((t, i) => { const t0 = performance.now(); frame(octx, t); ms.push(Math.round(performance.now() - t0)); const x = (i % cols) * w, y = Math.floor(i / cols) * (h + 34); g.drawImage(out, x, y, w, h); g.fillStyle = '#fff'; g.font = '22px sans-serif'; g.fillText(t.toFixed(2) + 's', x + 8, y + h + 25); });
  return { url: c.toDataURL('image/jpeg', .85), ms };
};
Promise.all(['600 10px Fredoka', '700 10px Fredoka', '700 10px Nunito', '800 10px Nunito', '700 10px Caveat'].map(f => document.fonts.load(f))).then(() => {
  window.ready = true;
  if (!location.search.includes('render')) preview();
});

function preview() {
  const scrub = document.getElementById('scrub'), tt = document.getElementById('tt'), audio = document.getElementById('aud');
  scrub.max = TT().duration;
  const draw = () => { const T = audio && !audio.paused ? audio.currentTime : +scrub.value; if (audio && !audio.paused) scrub.value = T; frame(octx, T); tt.textContent = T.toFixed(2) + ' s'; requestAnimationFrame(draw); };
  scrub.oninput = () => { if (audio) audio.currentTime = +scrub.value; };
  document.getElementById('play').onclick = () => { if (!audio) return; audio.currentTime = +scrub.value; audio.paused ? audio.play() : audio.pause(); };
  draw();
}
