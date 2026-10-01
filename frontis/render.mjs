// render.mjs : rend les plans FRONTIS dans Chromium sans fenêtre, puis les encode avec ffmpeg.
//   node frontis/render.mjs --sheet --plan=intro --times=0.4,0.9,1.4 [--mode=plein] [--cols=3] [--cell=640] --out=frontis/out/check/a.jpg
//   node frontis/render.mjs --frames --plan=intro --mode=plein [--w=3840] [--workers=4]    images PNG → frontis/out/frames/
//   node frontis/render.mjs --encode --plan=intro [--w=3840]        fichiers des vidéastes (4K et 1080p) + aperçu MP4
//   node frontis/render.mjs --apercu --teaser=<vidéo du film> [--debut=3.0] [--duree=2.9] [--crop=w:h:x:y]
//        montage d'essai : ouverture → fondu enchaîné → extrait du film → fondu enchaîné → fin
// Chrome : --chrome=<chemin> ou variable CHROME si aucun des emplacements habituels ne convient.
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, statSync, renameSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const FPS = 25, W = +(args.w || 3840);
const NOMS = { intro: 'OUVERTURE', fin: 'FIN' };
const LIVRAISON = join(ICI, 'out', 'livraison');
const framesDir = (plan, mode, w) => join(ICI, 'out', 'frames', `${plan}_${mode}_${w}`);

const run = (cmd, a, cwd) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit', cwd }); p.on('error', bad); p.on('close', c => (c ? bad(new Error(`${cmd} a échoué (${c})`)) : ok())); });

// ---------- encodage ----------
// RVB → YUV en BT.709 et plage vidéo, pour que le vert et l'orange de la charte arrivent justes dans le montage.
const COULEUR = ['-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv'];
const echelle = (w, fmt) => `scale=${w}:-2:flags=lanczos+accurate_rnd+full_chroma_int:out_color_matrix=bt709:out_range=tv,format=${fmt}`;
// ProRes à qualité fixe : à débit nominal, il gaspille des centaines de Mo sur ces aplats. À q 8, l'écart reste d'un
// demi-décibel (invisible) et chaque fichier passe sous 30 Mo, la limite d'envoi.
const PRORES_422HQ = ['-c:v', 'prores_ks', '-profile:v', '3', '-vendor', 'apl0', '-qscale:v', '8'];
const PRORES_4444 = ['-c:v', 'prores_ks', '-profile:v', '4', '-vendor', 'apl0', '-alpha_bits', '16', '-qscale:v', '8'];

async function encoder(plan) {
  mkdirSync(LIVRAISON, { recursive: true });
  const nom = NOMS[plan], src = mode => ['-framerate', String(FPS), '-i', join(framesDir(plan, mode, W), 'f%04d.png')];
  for (const [res, w] of [['4K', 3840], ['1080p', 1920]]) {
    if (w > W) continue;
    const base = join(LIVRAISON, `FRONTIS_${nom}_${res}`);
    console.log(`→ ${base}_…`);
    await run('ffmpeg', ['-y', '-loglevel', 'error', ...src('plein'), '-vf', echelle(w, 'yuv422p10le'), ...PRORES_422HQ, ...COULEUR, `${base}_fond-plein_ProRes422HQ.mov`]);
    if (w === 1920) {
      await run('ffmpeg', ['-y', '-loglevel', 'error', ...src('alpha'), '-vf', echelle(w, 'yuva444p10le'), ...PRORES_4444, ...COULEUR, `${base}_fond-transparent_ProRes4444.mov`]);
      await run('ffmpeg', ['-y', '-loglevel', 'error', ...src('plein'), '-vf', echelle(w, 'yuv420p'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', ...COULEUR, '-movflags', '+faststart', `${base}_apercu.mp4`]);
    } else await sequencePng(nom, res, src('alpha'));
  }
}

// En 4K, le ProRes 4444 ne descend pas sous 30 Mo : la version transparente part en séquence PNG sans perte, zippée.
async function sequencePng(nom, res, entree) {
  const dossier = `FRONTIS_${nom}_${res}_fond-transparent_PNG`, chemin = join(LIVRAISON, dossier);
  rmSync(chemin, { recursive: true, force: true }); mkdirSync(chemin);
  await run('ffmpeg', ['-y', '-loglevel', 'error', ...entree, '-c:v', 'png', '-pred', 'mixed', '-compression_level', '9', '-start_number', '0', join(chemin, `FRONTIS_${nom}_%04d.png`)]);
  rmSync(`${chemin}.zip`, { force: true });
  try { await run('zip', ['-q', '-r', '-0', `${dossier}.zip`, dossier], LIVRAISON); rmSync(chemin, { recursive: true }); }
  catch { console.log(`  zip indisponible : la séquence reste dans ${chemin}`); }
}

// Montage d'essai pour juger les fondus : ouverture → extrait du film → fin (fondus enchaînés de 0,6 s).
async function apercu() {
  const teaser = args.teaser, debut = +(args.debut ?? 3.0), duree = +(args.duree ?? 2.9), fondu = 0.6;
  const intro = join(LIVRAISON, 'FRONTIS_OUVERTURE_1080p_apercu.mp4'), fin = join(LIVRAISON, 'FRONTIS_FIN_1080p_apercu.mp4');
  const out = args.out || join(ICI, 'out', 'apercu_montage.mp4');
  const dureeIntro = readdirSync(framesDir('intro', 'plein', W)).filter(f => f.endsWith('.png')).length / FPS;
  const prep = `fps=${FPS},format=yuv420p,setsar=1,settb=AVTB`;
  const film = `${args.crop ? `crop=${args.crop},` : ''}scale=1920:1080:flags=lanczos,${prep},setpts=PTS-STARTPTS`;
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', intro, '-ss', String(debut), '-t', String(duree), '-i', teaser, '-i', fin, '-filter_complex',
    `[0:v]${prep}[a];[1:v]${film}[b];[2:v]${prep}[c];` +
    `[a][b]xfade=transition=fade:duration=${fondu}:offset=${dureeIntro - fondu}[ab];` +
    `[ab][c]xfade=transition=fade:duration=${fondu}:offset=${dureeIntro + duree - 2 * fondu}[v]`,
    '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', ...COULEUR, '-movflags', '+faststart', out]);
  console.log(`montage d'essai → ${out}`);
}

if (args.encode) { await encoder(args.plan); process.exit(0); }
if (args.apercu) { await apercu(); process.exit(0); }

// ---------- rendu dans Chromium ----------
const CHROMES = [args.chrome, process.env.CHROME, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
const CHROME = CHROMES.find(p => p && existsSync(p));
if (!CHROME) throw new Error('Chrome introuvable : préciser --chrome=<chemin>');

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true, protocolTimeout: 0,
  args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'],
});
async function ouvrir(w, tag = '') {
  const page = await browser.newPage();
  page.on('console', m => { if (['error', 'warn'].includes(m.type()) && !m.text().includes('ERR_FILE_NOT_FOUND')) console.log(`[page${tag}]`, m.text()); });   // logo.svg / logo.png absents : normal
  page.on('pageerror', e => console.log(`[erreur page${tag}]`, e.message));
  await page.goto(`${pathToFileURL(join(ICI, 'studio.html')).href}?w=${w}`, { waitUntil: 'load' });
  await page.waitForFunction('window.ready === true', { timeout: 60000 });
  return page;
}
const decode = url => Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');

if (args.sheet) {
  const page = await ouvrir(1920), out = args.out || join(ICI, 'out', 'check', 'sheet.jpg'); mkdirSync(dirname(out), { recursive: true });
  const times = String(args.times).split(',').map(Number);
  writeFileSync(out, decode(await page.evaluate((p, m, ts, c, w) => window.renderSheet(p, m, ts, c, w), args.plan || 'intro', args.mode || 'plein', times, +(args.cols || 3), +(args.cell || 640))));
  console.log(out);
} else if (args.frames) {
  // Parallèle et reprenable : chaque page prend la prochaine image manquante ; les fichiers sont écrits d'un bloc.
  const plan = args.plan || 'intro', modes = args.mode ? [args.mode] : ['plein', 'alpha'], workers = +(args.workers || 4);
  const probe = await ouvrir(320), dur = await probe.evaluate(p => window.PLANS[p].dur, plan); await probe.close();
  const n = Math.round(dur * FPS), todo = [];
  for (const mode of modes) {
    const dir = framesDir(plan, mode, W); mkdirSync(dir, { recursive: true });
    for (let i = 0; i < n; i++) { const f = join(dir, `f${String(i).padStart(4, '0')}.png`); if (!existsSync(f) || statSync(f).size < 1000) todo.push([mode, i, f]); }
  }
  console.log(`${plan} : ${todo.length} images à rendre en ${W} px, ${workers} pages`);
  let next = 0, done = 0; const start = Date.now();
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const page = await ouvrir(W, `#${w}`);
    while (next < todo.length) {
      const [mode, i, f] = todo[next++];
      writeFileSync(`${f}.tmp`, decode(await page.evaluate((p, t, m) => window.renderAt(p, t, m), plan, i / FPS, mode))); renameSync(`${f}.tmp`, f);
      if (++done % 25 === 0 || done === todo.length) console.log(`  ${done}/${todo.length}  ${((Date.now() - start) / done).toFixed(0)} ms/image`);
    }
  }));
}
await browser.close();
