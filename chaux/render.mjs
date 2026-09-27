// render.mjs: peint les images de studio.html dans Chrome sans écran, puis assemble la vidéo avec ffmpeg.
// Lancer depuis n'importe où (les chemins sont relatifs à ce dossier) :
//   node chaux/render.mjs --sheet=2,12,24 [--cols=3] [--w=640] --out=out/check.jpg   planche de contrôle rapide
//   node chaux/render.mjs --stills=3,30 --out=out/stills                           images fixes pleine résolution
//   node chaux/render.mjs --clip=0:10 --out=out/clip.mp4                           extrait avec le son
//   node chaux/render.mjs --frames=0:60 --workers=3                                toutes les images → out/frames (reprise possible)
//   node chaux/render.mjs --encode                                                 images + musique → video-chaux/media/*.mp4
// Options : --chrome=<chemin de Chrome>, --gpu (utiliser la carte graphique au lieu du rendu logiciel sous Linux)
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, statSync, renameSync, readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const at = p => resolve(HERE, p);
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const fps = +(args.fps || 24);
const FRAMES_DIR = at('out/frames'), LAYER_DIR = at('out/layers'), MUSIC = at('assets/musique.wav');
mkdirSync(LAYER_DIR, { recursive: true });
const out = p => resolve(process.cwd(), p);
// Empreintes du code pour invalider les calques mis en cache : fichiers partagés + un par chapitre (c1…c6).
const md5 = files => createHash('md5').update(files.map(f => readFileSync(at(f), 'utf8')).join('\n')).digest('hex').slice(0, 10);
const SALT = { shared: md5(['src/core.js', 'src/props.js', 'src/cast.js']) };
for (const f of readdirSync(at('src/ch'))) SALT[f.slice(0, 2)] = md5(['src/ch/' + f]);

function findChrome() {
  if (args.chrome) return args.chrome;
  if (process.env.CHROME) return process.env.CHROME;
  const cands = [];
  if (existsSync('/opt/pw-browsers')) for (const d of readdirSync('/opt/pw-browsers').filter(d => d.startsWith('chromium-')).sort().reverse()) cands.push(`/opt/pw-browsers/${d}/chrome-linux/chrome`);
  cands.push('/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe');
  const c = cands.find(existsSync); if (!c) throw new Error('Chrome introuvable : passer --chrome=<chemin>');
  return c;
}
const GL = process.platform === 'win32' ? ['--use-angle=d3d11'] : process.platform === 'darwin' ? ['--use-angle=metal']
  : args.gpu ? ['--use-angle=gl'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('close', c => c ? bad(new Error(cmd + ' exited ' + c)) : ok()); });

if (args.encode) {
  // Deux versions web : 1080p (ordinateur) et 720p (mobile), plus l'affiche (première image du titre).
  const n = readdirSync(FRAMES_DIR).filter(f => f.endsWith('.jpg')).length, media = at('video-chaux/media');
  mkdirSync(media, { recursive: true });
  console.log(`encodage de ${n} images`);
  const common = ['-y', '-loglevel', 'error', '-stats', '-framerate', String(fps), '-i', `${FRAMES_DIR}/f%05d.jpg`, '-i', MUSIC, '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-shortest'];
  await run('ffmpeg', [...common, '-crf', args.crf || '26', '-maxrate', '4M', '-bufsize', '8M', join(media, 'chaux-1080.mp4')]);
  await run('ffmpeg', [...common, '-vf', 'scale=1280:720:flags=lanczos', '-crf', '27', '-maxrate', '2M', '-bufsize', '4M', join(media, 'chaux-720.mp4')]);
  const poster = args.poster || '2.9';                                   // le titre est peint dans le ciel
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${FRAMES_DIR}/f${String(Math.round(+poster * fps)).padStart(5, '0')}.jpg`, '-vf', 'scale=1280:720:flags=lanczos', '-q:v', '4', join(media, 'affiche.jpg')]);
  console.log('écrit dans ' + media);
  process.exit(0);
}

const browser = await puppeteer.launch({
  executablePath: findChrome(), headless: true, protocolTimeout: 0,
  args: ['--no-sandbox', '--allow-file-access-from-files', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--window-size=1920,1080',
    '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-features=CanvasNoise', ...GL]
});
async function openPage(tag = '') {
  const page = await browser.newPage();
  page.on('console', m => { if (['error', 'warn'].includes(m.type())) console.log(`[page${tag}]`, m.text()); });
  page.on('pageerror', e => console.log(`[page error${tag}]`, e.message));
  // Les calques aquarelle mis en cache sont partagés entre les pages et les lancements via out/layers.
  if (!args.nocache) await page.exposeFunction('__saveLayer', (key, b64) => { writeFileSync(join(LAYER_DIR, key + '.png'), Buffer.from(b64, 'base64')); });
  await page.goto(pathToFileURL(at(args.studio || 'studio.html')).href + '?render', { waitUntil: 'load' });
  await page.waitForFunction('window.ready === true', { timeout: 120000, polling: 250 });
  await page.evaluate((files, salt) => { window.LAYER_DIR = 'out/layers'; window.LAYER_FILES = files; window.LAYER_SALT = salt; }, args.nocache ? [] : readdirSync(LAYER_DIR).filter(f => f.endsWith('.png')).map(f => f.slice(0, -4)), SALT);
  return page;
}
const frameOf = async (page, t, type, q) => {
  const url = await page.evaluate((t, type, q) => window.renderAt(t, type, q), t, type, q);
  return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
};
const times = s => String(s).split(',').map(Number);

if (args.sheet) {
  const page = await openPage(), o = out(args.out || 'out/sheet.jpg'); mkdirSync(dirname(o), { recursive: true });
  const { url, ms } = await page.evaluate((ts, c, w) => window.renderSheet(ts, c, w), times(args.sheet), +(args.cols || 3), +(args.w || 640));
  writeFileSync(o, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  console.log(`${o}  ms/image : ${ms.join(' ')}`);
} else if (args.stills) {
  const page = await openPage(), o = out(args.out || 'out/stills'); mkdirSync(o, { recursive: true });
  console.log('GPU :', await page.evaluate(() => window.gpuInfo()));
  for (const s of times(args.stills)) {
    const t0 = Date.now(), buf = await frameOf(page, s, args.png ? 'image/png' : 'image/jpeg', .92);
    const f = `${o}/t${s.toFixed(2).replace('.', '_')}.${args.png ? 'png' : 'jpg'}`; writeFileSync(f, buf);
    console.log(`${f}  ${Date.now() - t0} ms`);
  }
} else if (args.frames) {
  // Parallèle et reprenable : chaque page prend la prochaine image manquante ; les fichiers sont écrits de façon atomique.
  const page0 = await openPage(), DUR = await page0.evaluate(() => DUR); await page0.close();
  const [a, b] = String(args.frames).split(':').map(Number), workers = +(args.workers || 3);
  mkdirSync(FRAMES_DIR, { recursive: true });
  const first = Math.round(a * fps), last = Math.min(Math.ceil(DUR * fps) - 1, Math.round(b * fps) - 1);
  const todo = []; for (let i = first; i <= last; i++) { const f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`; if (args.force || !existsSync(f) || statSync(f).size < 1000) todo.push(i); }
  console.log(`${todo.length} images à peindre (${last - first + 1 - todo.length} déjà faites), ${workers} pages`);
  let next = 0, done = 0; const start = Date.now();
  const work = async w => {
    const page = await openPage('#' + w);
    while (next < todo.length) {
      const i = todo[next++], f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`;
      const buf = await frameOf(page, i / fps, 'image/jpeg', .95);
      writeFileSync(f + '.tmp', buf); renameSync(f + '.tmp', f);
      if (++done % 24 === 0 || done === todo.length) {
        const el = (Date.now() - start) / 1000;
        console.log(`image ${done}/${todo.length}  ${(el / done * 1000).toFixed(0)} ms/image effectif  reste ${((todo.length - done) * el / done / 60).toFixed(1)} min`);
      }
    }
  };
  await Promise.all(Array.from({ length: workers }, (_, w) => work(w)));
} else {
  const page = await openPage();
  const [a, b] = args.clip ? String(args.clip).split(':').map(Number) : [0, await page.evaluate(() => DUR)];
  const o = out(args.out || 'out/clip.mp4'); mkdirSync(dirname(o), { recursive: true });
  const audio = existsSync(MUSIC) ? ['-ss', String(a), '-t', String(b - a), '-i', MUSIC] : [];
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', ...audio,
    '-map', '0:v', ...(audio.length ? ['-map', '1:a', '-c:a', 'aac', '-b:a', '160k', '-shortest'] : []), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', o],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((b - a) * fps), start = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = await frameOf(page, a + i / fps, 'image/jpeg', .92);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 24 === 0 || i === n - 1) console.log(`image ${i + 1}/${n}  ${((Date.now() - start) / (i + 1)).toFixed(0)} ms/image`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log(`écrit ${o}`);
}
await browser.close();
