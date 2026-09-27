// music.mjs : compose et mixe la bande-son originale de la vidéo (musique + bruitages), entièrement synthétisée.
//   node chaux/music.mjs            → chaux/assets/musique.wav (48 kHz, stéréo, 16 bits)
// Ré majeur, 96 BPM (une mesure = 2,5 s), calée sur les chapitres de site/cues.js :
//   vieux bâti (intro douce) · mur qui respire (arpèges + shaker) · ciment (si mineur, pincé et tendu, coupure au CRAC)
//   · chaux (lumineux, cloches, pulsation) · savoir-faire · fin (accord final qui s'éteint).
// Aucun échantillon : cordes pincées (Karplus-Strong), nappe additive, cloches, basse, percussions et bruitages
// sont calculés ici, avec une réverbération de type Freeverb. Le hasard est graîné : le résultat est reproductible.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = dirname(fileURLToPath(import.meta.url));
const CUES = createRequire(import.meta.url)(resolve(HERE, 'site/cues.js'));
const SR = 48000, DUR = CUES.duree, N = SR * DUR, BEAT = 60 / CUES.bpm, BAR = BEAT * 4;
const OUT = resolve(HERE, 'assets/musique.wav');

// ---------- outils ----------
let seed = 20260927;
const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const panG = p => [Math.cos((p + 1) * Math.PI / 4), Math.sin((p + 1) * Math.PI / 4)];   // -1 gauche … 1 droite
const bus = () => ({ L: new Float32Array(N), R: new Float32Array(N) });
const MUS = bus(), SFX = bus(), REV = bus();
function put(n, v, pan, send = 0, dst = MUS) {
  if (n < 0 || n >= N) return;
  const [gl, gr] = panG(pan);
  dst.L[n] += v * gl; dst.R[n] += v * gr;
  if (send) { REV.L[n] += v * gl * send; REV.R[n] += v * gr * send; }
}
// filtre biquad (RBJ) : 'lp', 'hp', 'bp' ; f.set(fréquence, q) permet de le faire glisser
function biquad(type, f, q = .707) {
  let b0, b1, b2, a1, a2, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const flt = x => { const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
  flt.set = (fr, qq = q) => {
    const w = 2 * Math.PI * Math.min(fr, SR * .45) / SR, c = Math.cos(w), sn = Math.sin(w), al = sn / (2 * qq), a0 = 1 + al;
    if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
    else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
    else { b0 = al; b1 = 0; b2 = -al; }
    b0 /= a0; b1 /= a0; b2 /= a0; a1 = -2 * c / a0; a2 = (1 - al) / a0;
  };
  flt.set(f, q);
  return flt;
}
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- instruments ----------
// Corde pincée (Karplus-Strong avec accord fin par passe-tout)
function pluck(t, midi, { amp = .22, t60 = 2.4, pan = 0, bright = .55, send = .35, len } = {}) {
  const f = mtof(midi), P = SR / f;
  let D = Math.floor(P - .5), d = P - D - .5; if (d < .15) { D--; d += 1; }
  const C = (1 - d) / (1 + d), buf = new Float32Array(D);
  let lp = 0, mean = 0;
  for (let i = 0; i < D; i++) { lp += (rnd() * 2 - 1 - lp) * (.2 + .7 * bright); buf[i] = lp; mean += lp; }
  mean /= D; for (let i = 0; i < D; i++) buf[i] -= mean;
  const rho = Math.pow(.001, 1 / (f * t60)), total = Math.round((len ?? t60 * 1.1) * SR), i0 = Math.round(t * SR);
  let idx = 0, prev = 0, ax = 0, ay = 0, tone = 0;
  const toneK = .25 + .6 * bright;
  for (let k = 0; k < total; k++) {
    const x = buf[idx], avg = .5 * (x + prev) * rho; prev = x;
    const y = C * avg + ax - C * ay; ax = avg; ay = y;
    buf[idx] = y; idx = (idx + 1) % D;
    tone += (x - tone) * toneK;
    const env = Math.min(1, k / 36) * (k > total - 960 ? (total - k) / 960 : 1);
    put(i0 + k, tone * amp * env, pan, send);
  }
}
// Cloche douce (partiels de lame de métallophone)
function bell(t, midi, { amp = .1, pan = 0, send = .5, decay = 1.8, dst = MUS } = {}) {
  const f = mtof(midi), parts = [[1, 1, 1], [2.756, .38, .5], [5.404, .16, .28], [8.933, .06, .18]];
  const total = Math.round(decay * 3.2 * SR), i0 = Math.round(t * SR);
  for (let k = 0; k < total; k++) {
    const s = k / SR; let v = 0;
    for (const [r, a, dk] of parts) if (f * r < SR / 2.2) v += a * Math.sin(2 * Math.PI * f * r * s) * Math.exp(-s / (decay * dk));
    const att = Math.min(1, k / 90);
    put(i0 + k, v * amp * att, pan, send, dst);
  }
}
// Nappe : quelques harmoniques désaccordées, attaque et relâchement lents
function pad(t0, t1, notes, { amp = .045, att = 1.0, rel = 1.4, bright = 1, send = .55 } = {}) {
  amp *= .82;
  const i0 = Math.round(t0 * SR), i1 = Math.round((t1 + rel) * SR);
  notes.forEach((m, j) => {
    const f = mtof(m), det = [-.0035, .0032], ph = [rnd() * 6.28, rnd() * 6.28], pan = (j / Math.max(1, notes.length - 1) - .5) * .8;
    for (let n = i0; n < i1 && n < N; n++) {
      const s = (n - i0) / SR, tt = n / SR;
      const env = clamp(s / att) * (tt > t1 ? Math.max(0, 1 - (tt - t1) / rel) : 1);
      if (env <= 0) continue;
      let v = 0;
      for (let q = 0; q < 2; q++) { const ff = f * (1 + det[q]) * (1 + .0015 * Math.sin(tt * 2 * Math.PI * (.2 + q * .07))); v += Math.sin(2 * Math.PI * ff * tt + ph[q]) + .22 * bright * Math.sin(4 * Math.PI * ff * tt + ph[q]) + .07 * bright * Math.sin(6 * Math.PI * ff * tt); }
      put(n, v * amp * env * .5, pan, send);
    }
  });
}
function bass(t, midi, { amp = .2, dur = 1.1, send = .08 } = {}) {
  amp *= .78;
  const f = mtof(midi), i0 = Math.round(t * SR), total = Math.round((dur + .3) * SR);
  for (let k = 0; k < total; k++) {
    const s = k / SR, env = Math.min(1, k / 120) * Math.exp(-s / (dur * .55)) * (s > dur ? Math.max(0, 1 - (s - dur) / .3) : 1);
    const v = Math.sin(2 * Math.PI * f * s) + .28 * Math.sin(4 * Math.PI * f * s) + .08 * Math.sin(6 * Math.PI * f * s);
    put(i0 + k, v * amp * env, 0, send);
  }
}
function shaker(t, { amp = .03, pan = .25 } = {}) {
  const bp = biquad('bp', 7000, 1.2), i0 = Math.round(t * SR), total = Math.round(.09 * SR);
  for (let k = 0; k < total; k++) { const s = k / SR, env = Math.min(1, k / 200) * Math.exp(-s / .025); put(i0 + k, bp(rnd() * 2 - 1) * amp * env * 3, pan, .1); }
}
function kick(t, { amp = .22 } = {}) {
  const i0 = Math.round(t * SR), total = Math.round(.35 * SR); let ph = 0;
  for (let k = 0; k < total; k++) { const s = k / SR, f = 45 + 70 * Math.exp(-s / .03); ph += 2 * Math.PI * f / SR; put(i0 + k, Math.sin(ph) * amp * Math.exp(-s / .12) * Math.min(1, k / 40), 0, 0); }
}
function tick(t, { amp = .05, f = 1800, pan = 0 } = {}) {
  const i0 = Math.round(t * SR), total = Math.round(.06 * SR);
  for (let k = 0; k < total; k++) { const s = k / SR; put(i0 + k, (Math.sin(2 * Math.PI * f * s) + .5 * Math.sin(2 * Math.PI * f * 2.3 * s)) * amp * Math.exp(-s / .012), pan, .15); }
}

// ---------- bruitages ----------
function noiseHit(t, { dur = .2, amp = .2, type = 'lp', f = 1500, q = .8, att = .003, decay = .06, pan = 0, send = .2, sweep = null } = {}) {
  const flt = biquad(type, f, q), i0 = Math.round(t * SR), total = Math.round(dur * SR);
  for (let k = 0; k < total; k++) {
    const s = k / SR;
    if (sweep && k % 32 === 0) flt.set(sweep(s / dur), q);
    const env = clamp(s / att) * Math.exp(-Math.max(0, s - att) / decay) * (k > total - 240 ? (total - k) / 240 : 1);
    put(i0 + k, flt(rnd() * 2 - 1) * amp * env, typeof pan === 'function' ? pan(s / dur) : pan, send, SFX);
  }
}
function tone(t, { f0 = 800, f1 = 800, dur = .1, amp = .1, decay = .05, att = .002, pan = 0, send = .2, harm = 0 } = {}) {
  const i0 = Math.round(t * SR), total = Math.round(dur * SR); let ph = 0;
  for (let k = 0; k < total; k++) {
    const s = k / SR, f = f0 * Math.pow(f1 / f0, s / dur); ph += 2 * Math.PI * f / SR;
    const env = clamp(s / att) * Math.exp(-Math.max(0, s - att) / decay) * (k > total - 120 ? (total - k) / 120 : 1);
    put(i0 + k, (Math.sin(ph) + harm * Math.sin(2 * ph)) * amp * env, pan, send, SFX);
  }
}
const S = {
  plip: (t, p = 0) => tone(t, { f0: 520 + rnd() * 120, f1: 1350 + rnd() * 250, dur: .09, amp: .085, decay: .035, pan: p, send: .3 }),
  pouf: (t, p = 0) => noiseHit(t, { dur: .35, amp: .07, type: 'bp', f: 1100, q: 1.1, att: .04, decay: .12, pan: p, send: .35 }),
  toc: (t, p = 0) => { tone(t, { f0: 560, f1: 470, dur: .09, amp: .09, decay: .03, pan: p, harm: .3, send: .15 }); noiseHit(t, { dur: .03, amp: .05, f: 3000, decay: .006, pan: p }); },
  bois: (t, p = 0) => { tone(t, { f0: 420, f1: 380, dur: .08, amp: .07, decay: .025, pan: p, harm: .4 }); tone(t + .045, { f0: 520, f1: 470, dur: .07, amp: .05, decay: .02, pan: p, harm: .4 }); },
  seau: (t, p = 0) => { tone(t, { f0: 180, f1: 120, dur: .2, amp: .16, decay: .06, pan: p }); bell(t, 81, { amp: .02, decay: .25, pan: p, send: .2, dst: SFX }); },
  clac: t => { noiseHit(t, { dur: .3, amp: .24, f: 2200, decay: .07, pan: -.35, send: .25 }); noiseHit(t + .01, { dur: .18, amp: .11, type: 'bp', f: 3200, q: 1.5, decay: .04, pan: -.35 }); tone(t, { f0: 120, f1: 55, dur: .25, amp: .22, decay: .09, pan: -.3 }); },
  plop: (t, p = 0) => { noiseHit(t, { dur: .2, amp: .12, f: 1200, decay: .05, pan: p }); tone(t, { f0: 300, f1: 160, dur: .12, amp: .1, decay: .05, pan: p }); },
  crac: t => { [0, .045, .1, .17, .24].forEach((d, i) => noiseHit(t + d, { dur: .08, amp: .24 * (1 - i * .15), type: 'hp', f: 1800, decay: .012, pan: -.3 + i * .05, send: .3 })); tone(t, { f0: 90, f1: 45, dur: .35, amp: .2, decay: .12, pan: -.2 }); },
  boum: t => { tone(t, { f0: 85, f1: 38, dur: .5, amp: .26, decay: .16, pan: -.35 }); noiseHit(t, { dur: .6, amp: .12, f: 500, decay: .16, pan: -.35, send: .3 }); for (let i = 0; i < 7; i++) noiseHit(t + .05 + rnd() * .4, { dur: .04, amp: .07, type: 'hp', f: 2500, decay: .008, pan: -.5 + rnd() * .4 }); },
  whoosh: (t, dur = .7) => noiseHit(t, { dur, amp: .2, type: 'bp', f: 400, q: 1.4, att: dur * .45, decay: dur * .22, send: .35, sweep: u => 300 + 2600 * Math.sin(Math.PI * clamp(u)), pan: u => -.8 + 1.6 * u }),
  oiseau: (t, p = .5) => { for (let i = 0; i < 3; i++) { const s = t + i * .11; const i0 = Math.round(s * SR), total = Math.round(.075 * SR); let ph = 0; for (let k = 0; k < total; k++) { const u = k / total, f = 3100 + 1300 * u + 180 * Math.sin(k / SR * 2 * Math.PI * 38); ph += 2 * Math.PI * f / SR; put(i0 + k, Math.sin(ph) * .025 * Math.sin(Math.PI * u), p, .3, SFX); } } },
  vent: (t, dur = 3) => noiseHit(t, { dur, amp: .11, f: 500, q: .7, att: dur * .4, decay: dur * .5, send: .3, sweep: u => 350 + 250 * Math.sin(u * 7), pan: u => -.6 + .3 * Math.sin(u * 5) }),
  glace: t => { for (let i = 0; i < 6; i++) bell(t + i * .05 + rnd() * .03, 96 + Math.floor(rnd() * 7), { amp: .018, decay: .3, pan: -.4 + rnd() * .3, send: .5, dst: SFX }); },
  pop: (t, p = 0) => tone(t, { f0: 900, f1: 600, dur: .07, amp: .06, decay: .025, pan: p, send: .2 }),
  bloop: (t, p = 0) => tone(t, { f0: 300, f1: 760, dur: .12, amp: .06, decay: .05, pan: p, send: .35 }),
  feu: (t, dur = 1.5) => { for (let i = 0; i < 16; i++) noiseHit(t + rnd() * dur, { dur: .03, amp: .045, type: 'hp', f: 2000, decay: .006, pan: .5 }); noiseHit(t, { dur, amp: .03, f: 700, att: .3, decay: dur * .5, pan: .5 }); },
  coche: (t, p = -.5) => noiseHit(t, { dur: .16, amp: .06, type: 'bp', f: 3500, q: 2, att: .02, decay: .05, pan: p, send: .1 }),
  flic: (t, p = 0) => { noiseHit(t, { dur: .12, amp: .09, f: 1400, decay: .03, pan: p }); tone(t, { f0: 200, f1: 120, dur: .08, amp: .05, decay: .03, pan: p }); },
  racle: (t, dur = .45, p = 0, f = 2200) => noiseHit(t, { dur, amp: .07, type: 'bp', f, q: 1.3, att: .08, decay: dur * .5, pan: p, send: .15, sweep: u => f * (1 + .25 * Math.sin(u * 40)) }),
  pas: (t, p = 0) => { noiseHit(t, { dur: .1, amp: .06, f: 600, decay: .025, pan: p }); tone(t, { f0: 110, f1: 70, dur: .08, amp: .06, decay: .03, pan: p }); },
  papier: (t, p = -.6) => noiseHit(t, { dur: .12, amp: .05, type: 'hp', f: 2500, att: .01, decay: .04, pan: p }),
  souffle: (t, dur = 1.5) => noiseHit(t, { dur, amp: .06, type: 'bp', f: 750, q: .8, att: dur * .45, decay: dur * .3, pan: u => -.2 + .4 * u, send: .45, sweep: u => 600 + 500 * Math.sin(Math.PI * u) }),
  pinceau: (t, dur = .9) => noiseHit(t, { dur, amp: .05, type: 'bp', f: 900, q: .9, att: dur * .3, decay: dur * .4, pan: u => -.3 + .6 * u, send: .3 }),
};

// ---------- musique ----------
// accords : [arpège (4 notes), nappe, basse]
const CH = {
  Dmaj7: [[62, 66, 69, 73], [50, 57, 61, 66], 38], Gmaj7: [[62, 66, 67, 71], [55, 59, 62, 66], 43], Bm7: [[62, 66, 69, 71], [54, 57, 59, 62], 35],
  Asus4: [[62, 64, 69, 74], [57, 62, 64], 45], A: [[61, 64, 69, 73], [57, 61, 64], 45], D: [[62, 66, 69, 74], [50, 57, 62, 66], 38],
  'A/C#': [[61, 64, 69, 73], [57, 61, 64], 37], Bm: [[62, 66, 71, 74], [54, 59, 62], 35], G: [[62, 67, 71, 74], [55, 59, 62], 43],
  A7sus4: [[62, 64, 67, 69], [55, 57, 62, 64], 45], Em: [[59, 64, 67, 71], [52, 55, 59, 64], 40], Em7: [[62, 64, 67, 71], [52, 55, 59, 62], 40],
  'F#7': [[58, 61, 64, 66], [54, 58, 61, 64], 42], 'F#m7': [[61, 64, 66, 69], [54, 57, 61, 64], 42],
};
// une entrée par mesure (24 mesures de 2,5 s) : [accord, style]
const BARS = [
  ['Dmaj7', 'intro'], ['Gmaj7', 'intro'], ['Bm7', 'intro'], ['Asus4', 'intro'],          // 0–10 s   vieux bâti
  ['D', 'doux'], ['A/C#', 'doux'], ['Bm', 'doux'], ['G', 'doux'], ['A7sus4', 'question'], // 10–22.5 mur qui respire
  ['Bm', 'tendu'], ['G', 'tendu'], ['Em', 'tendu'], ['F#7', 'tendu'], ['Bm', 'coupe'],    // 22.5–35  ciment
  ['D', 'clair'], ['Gmaj7', 'clair'], ['Em7', 'clair'], ['A', 'clair'], ['D', 'clair'],   // 35–47.5  chaux
  ['G', 'artisan'], ['A', 'artisan'], ['F#m7', 'artisan'],                                // 47.5–55  savoir-faire
  ['Gmaj7', 'fin'], ['D', 'final'],                                                         // 55–60    fin
];
const ARP = [0, 1, 2, 3, 4, 3, 2, 1];                                                      // montée et descente, en croches
BARS.forEach(([name, style], b) => {
  const [arp, pn, bn] = CH[name], t0 = b * BAR;
  const notes = [...arp, arp[0] + 12];
  // nappe
  const padAmp = { intro: .04, doux: .042, question: .045, tendu: .034, coupe: 0, clair: .048, artisan: .045, fin: .045, final: .05 }[style];
  if (padAmp) pad(t0 + (b === 0 ? .2 : 0), t0 + BAR - .05, pn, { amp: padAmp, att: b === 0 ? 2.2 : .6, rel: style === 'final' ? 1.5 : 1.0, bright: style === 'tendu' ? .35 : 1 });
  if (name === 'Asus4') pad(t0 + BAR / 2, t0 + BAR - .05, CH.A[1], { amp: .03, att: .4, rel: .8 });
  // arpèges
  const n8 = style === 'fin' ? 4 : style === 'final' ? 3 : style === 'coupe' ? 0 : 8;
  for (let i = 0; i < n8; i++) {
    const step = style === 'fin' ? i * 2 : style === 'final' ? i * 2 : i;
    let t = t0 + step * BEAT / 2 + (rnd() - .5) * .012;
    let m = notes[ARP[step % 8]];
    if (name === 'Asus4' && i >= 4) m = CH.A[0].concat(CH.A[0][0] + 12)[ARP[i]];
    if (style === 'tendu') m -= 12;
    if (style === 'intro' && b === 0 && i < 2) continue;                                   // l'image se peint encore
    const acc = i === 0 ? 1 : i % 2 ? .72 : .85;
    const amp = { intro: .16, doux: .17, question: .15, tendu: .15, clair: .19, artisan: .18, fin: .16, final: .15 }[style] * acc * (.92 + rnd() * .16);
    const t60 = style === 'tendu' ? .45 : style === 'question' ? 3 : 2.2;
    pluck(t, m, { amp, t60, pan: -.35 + (i % 4) * .22, bright: style === 'tendu' ? .35 : style === 'clair' ? .7 : .55, send: style === 'tendu' ? .2 : .35, len: style === 'tendu' ? .6 : undefined });
    if ((style === 'clair' || style === 'artisan') && i % 2 === 1) pluck(t + BEAT / 4, notes[ARP[(i + 2) % 8]] + 12, { amp: amp * .45, t60: 1.6, pan: .45, bright: .75, send: .45 });
  }
  // basse
  if (b >= 1 && style !== 'coupe') {
    if (style === 'tendu') for (let i = 0; i < 8; i++) bass(t0 + i * BEAT / 2, bn, { amp: i % 2 ? .1 : .15, dur: .25 });
    else if (style === 'question') bass(t0, bn, { amp: .17, dur: 2.2 });
    else if (style === 'final') bass(t0, bn, { amp: .19, dur: 2.4 });
    else { bass(t0, bn, { amp: .18, dur: 1.1 }); bass(t0 + 2 * BEAT, style === 'clair' || style === 'artisan' ? bn + 7 : bn, { amp: .13, dur: .9 }); }
  }
  // percussions
  for (let i = 0; i < 8; i++) {
    const t = t0 + i * BEAT / 2 + (rnd() - .5) * .008;
    if (style === 'doux' || style === 'clair' || style === 'artisan') shaker(t, { amp: (i % 2 ? .034 : .02) * (style === 'doux' ? .8 : 1) });
    if ((style === 'clair' || style === 'artisan') && i % 4 === 0) kick(t, { amp: .16 });
    if (style === 'tendu' && (i === 2 || i === 6)) tick(t, { amp: .035, f: 1500, pan: .3 });
  }
});
// coupure dramatique au CRAC (32.5 s) : un accord pincé sec, puis une tenue grave qui retient son souffle
[47, 54, 59, 62, 66].forEach((m, i) => pluck(32.5 + i * .012, m, { amp: .16, t60: 1.4, pan: -.3 + i * .15, bright: .4, send: .5 }));
pad(32.6, 34.6, [35, 42, 47], { amp: .05, att: .3, rel: .5, bright: .3, send: .6 });
bass(32.5, 35, { amp: .2, dur: 2 });

// mélodies de cloches
const MEL = [
  // titre (La chaux… le souffle du vieux bâti)
  [1.25, 81], [1.875, 83], [2.5, 86, 1.2], [3.75, 78], [4.375, 76], [5.0, 74, 1.4],
  // le mur respire
  [12.5, 78, .5], [13.75, 81, .5], [15.0, 76, .5], [16.25, 74, .5],
  // la question « ? »
  [19.8, 76], [20.12, 81], [21.0, 79, .6],
  // la chaux : ta-da !
  [35.35, 74], [35.43, 78], [35.51, 81], [35.59, 86, 1.3],
  [37.5, 83], [38.75, 81, .8], [39.375, 78, .8], [40.0, 79], [41.25, 78, .8], [41.875, 76, .8],
  [42.5, 76, .8], [43.125, 78, .8], [43.75, 81], [45.0, 78], [45.9375, 76, .7], [46.25, 74, 1.2],
  // les trois couches, puis « c'est fini ! »
  [49.0, 86, .6], [50.6, 88, .6], [52.2, 90, .6], [53.8, 74, .7], [53.88, 78, .7], [53.96, 81, .7], [54.04, 86, .9],
  // fin
  [57.5, 81, .8], [57.9, 78, .8], [58.3, 74, 1.1], [58.75, 86, .5],
];
MEL.forEach(([t, m, a = 1]) => bell(t, m, { amp: .085 * a, pan: .15, send: .55, decay: 1.6 }));

// ---------- bruitages calés sur l'animation ----------
S.pinceau(0.05, 1.3);
[1.8, 2.7, 3.4].forEach((t, i) => S.oiseau(t, .4 - i * .1));
[5.6, 5.92, 6.24].forEach((t, i) => S.bois(t, -.2 + i * .25));                            // volets
[6.9, 7.8].forEach(t => S.oiseau(t, .6));
[7.2, 9.0].forEach(t => S.souffle(t, 1.6));                                                 // la façade respire
for (const w of [10, 35, 47.5]) S.whoosh(w - .34, .68);
for (let i = 0; i < 10; i++) { const st = 10.9 + i * .58, side = hash(i * 7.7 + 3) < .68 ? -1 : 1; S.plip(st, .1); if (i % 2 === 0) S.pouf(st + 2.9, side * .5); }
S.pinceau(15.1, .8);
S.seau(19.0, -.5); S.seau(19.3, -.35);
S.plop(22.25, -.5);                                                                          // la truelle plonge dans le ciment
S.clac(23.1);
for (let i = 0; i < 9; i++) { const st = 23.9 + i * .42; S.plip(st, 0); S.toc(st + 2.3, -.25); }
S.vent(31.3, 3.4);
S.glace(31.95);
S.crac(32.5);
S.boum(33.3 + Math.sqrt(2 * (828 - 505) / 2600));
for (let i = 0; i < 4; i++) S.pop(38.55 + i * .8, [0, .5, 0, -.5][i]);
S.feu(39.4, 2.4);
[39.65, 40.1, 40.55].forEach(t => S.bloop(t, .5)); [41.15, 41.55, 41.95].forEach(t => S.bloop(t, -.5));
S.pinceau(42.3, .6);
S.plop(42.4, -.3);
for (let i = 0; i < 9; i++) { const st = 42.8 + i * .5; S.plip(st, 0); if (i % 2 === 1) S.pouf(st + 2.5, -.5); }
[43.45, 44.35, 45.25].forEach(t => S.coche(t, -.6));
for (let i = 0; i < 5; i++) S.pas(47.55 + i * .28, -.6 + i * .1);
S.papier(48.05);
for (let i = 0; i < 5; i++) S.flic(49.05 + i * .3, -.1 + rnd() * .3);
[50.65, 51.1, 51.55].forEach(t => S.racle(t, .45, 0, 1900));
[52.25, 52.7, 53.15].forEach(t => S.racle(t, .42, .1, 2600));
[50.45, 52.05, 53.65].forEach(t => S.coche(t, -.7));
S.pop(54.05, -.4);
[56.2, 57.1, 58.6].forEach((t, i) => S.oiseau(t, -.2 + i * .2));

// ---------- réverbération (Freeverb) ----------
function freeverb(inL, inR, { room = .84, damp = .3 } = {}) {
  const sc = SR / 44100, cD = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map(d => Math.round(d * sc)), aD = [556, 441, 341, 225].map(d => Math.round(d * sc)), sp = Math.round(23 * sc);
  const mk = ds => ds.map(d => ({ b: new Float32Array(d), i: 0, st: 0 }));
  const cl = mk(cD), cr = mk(cD.map(d => d + sp)), al = mk(aD), ar = mk(aD.map(d => d + sp));
  const oL = new Float32Array(N), oR = new Float32Array(N);
  const comb = (c, x) => { const y = c.b[c.i]; c.st = y * (1 - damp) + c.st * damp; c.b[c.i] = x + c.st * room; c.i = (c.i + 1) % c.b.length; return y; };
  const ap = (a, x) => { const bo = a.b[a.i]; const y = -x + bo; a.b[a.i] = x + bo * .5; a.i = (a.i + 1) % a.b.length; return y; };
  for (let n = 0; n < N; n++) {
    const x = (inL[n] + inR[n]) * .015;
    let l = 0, r = 0; for (const c of cl) l += comb(c, x); for (const c of cr) r += comb(c, x);
    for (const a of al) l = ap(a, l); for (const a of ar) r = ap(a, r);
    oL[n] = l; oR[n] = r;
  }
  return [oL, oR];
}
const [wL, wR] = freeverb(REV.L, REV.R);

// ---------- mixage ----------
const L = new Float32Array(N), R = new Float32Array(N), WET = 2.2, SFXG = 1.15;
const hpL = biquad('hp', 28), hpR = biquad('hp', 28);
for (let n = 0; n < N; n++) {
  const t = n / SR, fade = Math.min(1, t / .08) * (t > DUR - 1.4 ? Math.max(0, (DUR - t) / 1.4) : 1);
  L[n] = hpL(MUS.L[n] + SFX.L[n] * SFXG + wL[n] * WET) * fade;
  R[n] = hpR(MUS.R[n] + SFX.R[n] * SFXG + wR[n] * WET) * fade;
}
// niveau : RMS visé ≈ -19 dBFS, puis limiteur doux et crête vraie à -1,5 dBTP
let sq = 0; for (let n = 0; n < N; n++) sq += L[n] * L[n] + R[n] * R[n];
const rms = Math.sqrt(sq / (2 * N)), gain = Math.pow(10, -19 / 20) / rms;
let peak = 0;
for (let n = 0; n < N; n++) { L[n] = Math.tanh(L[n] * gain * 1.1) / 1.1; R[n] = Math.tanh(R[n] * gain * 1.1) / 1.1; peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n])); }
// crête « vraie » (entre les échantillons), estimée par suréchantillonnage ×4 (sinc fenêtré) : marge pour le codage AAC
function truePeak(x) {
  const TAPS = 8, ker = [];
  for (const f of [.25, .5, .75]) { const k = []; for (let j = -TAPS + 1; j <= TAPS; j++) { const d = j - f, w = .5 + .5 * Math.cos(Math.PI * d / TAPS); k.push(d === 0 ? 1 : Math.sin(Math.PI * d) / (Math.PI * d) * w); } ker.push(k); }
  let m = 0;
  for (let n = TAPS; n < x.length - TAPS; n++) {
    m = Math.max(m, Math.abs(x[n]));
    if (Math.abs(x[n]) < .5 * m) continue;                                // seules les zones fortes peuvent dépasser
    for (const k of ker) { let v = 0; for (let j = 0; j < k.length; j++) v += x[n - TAPS + 1 + j] * k[j]; m = Math.max(m, Math.abs(v)); }
  }
  return m;
}
const tp = Math.max(peak, truePeak(L), truePeak(R));
const norm = Math.pow(10, -1.5 / 20) / tp;
// écriture WAV 16 bits
const data = Buffer.alloc(N * 4);
for (let n = 0; n < N; n++) { data.writeInt16LE(Math.round(clamp(L[n] * norm, -1, 1) * 32767), n * 4); data.writeInt16LE(Math.round(clamp(R[n] * norm, -1, 1) * 32767), n * 4 + 2); }
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + data.length, 4); hdr.write('WAVE', 8); hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(data.length, 40);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, Buffer.concat([hdr, data]));
console.log(`écrit ${OUT}  (rms avant normalisation ${(20 * Math.log10(rms)).toFixed(1)} dBFS, gain ${(20 * Math.log10(gain * norm)).toFixed(1)} dB)`);
