// render.mjs — drive index.html in headless Chromium.
//   node render.mjs --sheet=10,20,30 [--cols=3] [--w=640] [--out=out/sheet.jpg]   contact sheet
//   node render.mjs --scene=keim [--n=12] [--out=out/keim.jpg]                     contact sheet spread over one scene
//   node render.mjs --stills=12.5,40 [--out=out/stills]                            full-res PNG stills
//   node render.mjs --frames[=a:b] [--workers=4]                                   JPEG frames → out/frames (resumable)
//   node render.mjs --encode [--out=out/vieux-bati.mp4]                            frames + soundtrack → MP4
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, statSync, renameSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const CHROME = args.chrome || process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TIMING = JSON.parse(readFileSync('src/timing.js', 'utf8').replace(/^[\s\S]*?window\.TIMING = /, '').replace(/;\s*$/, ''));
const FPS = TIMING.fps, DUR = TIMING.duration, FRAMES = 'out/frames';
const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('close', c => c ? bad(new Error(cmd + ' exited ' + c)) : ok()); });

if (args.encode) {
  const out = args.out || 'out/vieux-bati.mp4', n = readdirSync(FRAMES).filter(f => f.endsWith('.jpg')).length;
  console.log(`encoding ${n} frames → ${out}`);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-stats', '-framerate', String(FPS), '-i', `${FRAMES}/f%05d.jpg`, '-i', 'out/mix.wav',
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf || 20), '-tune', 'animation', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', out]);
  console.log('wrote ' + out); process.exit(0);
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 0,
  args: ['--allow-file-access-from-files', '--no-sandbox', '--window-size=1920,1080', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'] });
async function openPage(tag = '') {
  const page = await browser.newPage();
  page.on('console', m => { if (['error', 'warn'].includes(m.type())) console.log(`[page${tag}]`, m.text()); });
  page.on('pageerror', e => console.log(`[page error${tag}]`, e.message));
  await page.goto(pathToFileURL(resolve('index.html')).href + '?render', { waitUntil: 'load' });
  await page.waitForFunction('window.ready === true', { timeout: 60000 });
  return page;
}
const frameOf = async (page, t, type, q) => { const url = await page.evaluate((t, type, q) => window.renderAt(t, type, q), t, type, q); return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'); };
const times = s => String(s).split(',').map(Number);

if (args.sheet || args.scene) {
  let ts;
  if (args.scene) { const sc = TIMING.scenes.find(s => s.id === args.scene); const n = +(args.n || 12); ts = Array.from({ length: n }, (_, i) => +(sc.start + (sc.end - sc.start) * (i + .5) / n).toFixed(2)); }
  else ts = times(args.sheet);
  const page = await openPage(), out = args.out || `out/${args.scene || 'sheet'}.jpg`; mkdirSync(dirname(out), { recursive: true });
  const { url, ms } = await page.evaluate((ts, c, w) => window.renderSheet(ts, c, w), ts, +(args.cols || 3), +(args.w || 640));
  writeFileSync(out, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  console.log(`${out}  ms/frame: ${ms.join(' ')}`);
} else if (args.stills) {
  const page = await openPage(), out = args.out || 'out/stills'; mkdirSync(out, { recursive: true });
  for (const s of times(args.stills)) { const buf = await frameOf(page, s, 'image/png'); const f = `${out}/t${s.toFixed(2).replace('.', '_')}.png`; writeFileSync(f, buf); console.log(f); }
} else if (args.frames) {
  const [a, b] = args.frames === true ? [0, DUR] : String(args.frames).split(':').map(Number), workers = +(args.workers || 4);
  mkdirSync(FRAMES, { recursive: true });
  const first = Math.round(a * FPS), last = Math.min(Math.ceil(DUR * FPS) - 1, Math.round(b * FPS) - 1);
  const todo = []; for (let i = first; i <= last; i++) { const f = `${FRAMES}/f${String(i).padStart(5, '0')}.jpg`; if (!existsSync(f) || statSync(f).size < 1000) todo.push(i); }
  console.log(`${todo.length} frames to render (${last - first + 1 - todo.length} done), ${workers} workers`);
  let next = 0, done = 0; const start = Date.now();
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const page = await openPage('#' + w);
    while (next < todo.length) {
      const i = todo[next++], f = `${FRAMES}/f${String(i).padStart(5, '0')}.jpg`;
      writeFileSync(f + '.tmp', await frameOf(page, i / FPS, 'image/jpeg', .93)); renameSync(f + '.tmp', f);
      if (++done % 250 === 0 || done === todo.length) { const el = (Date.now() - start) / 1000; console.log(`frame ${done}/${todo.length}  ${(el / done * 1000).toFixed(0)} ms/frame  eta ${((todo.length - done) * el / done / 60).toFixed(1)} min`); }
    }
  }));
}
await browser.close();
