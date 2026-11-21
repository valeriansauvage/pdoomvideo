// bd/render.mjs: paint the album pages in headless Chrome, then bind them into a PDF.
//   node bd/render.mjs --pages=1,2,5 [--out=out/bd] [--workers=2]   render pages → out/bd/planche_XX.jpg
//   node bd/render.mjs --all [--workers=3]                           every page defined in bd/src/pages
//   node bd/render.mjs --pages=4 --only=2                            just panel 2 of page 4 (fast check)
//   node bd/render.mjs --sheet=1,2,3,4 [--w=520]                     contact sheet of pages → out/bd/sheet.jpg
//   node bd/render.mjs --pdf                                         bind out/bd/planche_*.jpg → out/bd/<title>.pdf
// Pages 90 and up are development sheets (model sheet, set gallery): --all and --pdf skip them.
// Chrome: --chrome=<path> (defaults: Windows Chrome, or Playwright's Chromium on Linux). GPU backend: --angle=<d3d11|metal|swiftshader|...>.
import puppeteer from 'puppeteer-core';
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const OUT = args.out || 'out/bd';
const TITLE = 'Sous_un_arbre_a_la_campagne';
mkdirSync(OUT, { recursive: true });

function findChrome() {
  if (args.chrome) return args.chrome;
  if (process.platform === 'win32') return 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  if (process.platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const pw = '/opt/pw-browsers';
  if (existsSync(pw)) for (const d of readdirSync(pw).filter(d => /^chromium-\d+$/.test(d)).sort().reverse()) {
    const p = join(pw, d, 'chrome-linux64', 'chrome'); if (existsSync(p)) return p;
  }
  for (const p of ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']) if (existsSync(p)) return p;
  throw new Error('Chrome not found: pass --chrome=<path>');
}
const angle = args.angle || ({ win32: 'd3d11', darwin: 'metal' }[process.platform] || 'swiftshader');

async function launch() {
  return puppeteer.launch({
    executablePath: findChrome(), headless: true, protocolTimeout: 0,
    args: ['--allow-file-access-from-files', '--no-sandbox', `--use-angle=${angle}`, '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization', '--disable-renderer-backgrounding', '--disable-background-timer-throttling']
  });
}
async function openPage(browser, tag = '') {
  const page = await browser.newPage();
  page.on('console', m => { if (['error', 'warn'].includes(m.type()) && !/GPU stall|GL Driver/.test(m.text())) console.log(`[page${tag}]`, m.text()); });
  page.on('pageerror', e => console.log(`[page error${tag}]`, e.message));
  await page.goto(pathToFileURL(resolve('bd/album.html')).href + '?render', { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.ready === true', { timeout: 120000 });
  if (!(await page.evaluate(() => window.fontsOk))) console.log('warning: fonts did not load');
  return page;
}
const pad = n => String(n).padStart(2, '0');
const b64 = url => Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');

if (args.pdf) {
  const files = readdirSync(OUT).filter(f => /^planche_\d+\.jpg$/.test(f) && +f.match(/\d+/)[0] < 90).sort();   // pages 90+ are development sheets
  if (!files.length) throw new Error('no pages in ' + OUT);
  const browser = await launch(), page = await browser.newPage();
  const html = `<!doctype html><html><head><title>Sous un arbre à la campagne</title><style>@page{size:160mm 220mm;margin:0}html,body{margin:0}img{display:block;width:160mm;height:220mm;page-break-after:always;break-after:page}img:last-child{page-break-after:auto;break-after:auto}</style></head><body>` +
    files.map(f => `<img src="data:image/jpeg;base64,${readFileSync(join(OUT, f)).toString('base64')}">`).join('') + '</body></html>';
  await page.setContent(html, { waitUntil: 'load' });
  const out = join(OUT, TITLE + '.pdf');
  await page.pdf({ path: out, width: '160mm', height: '220mm', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log(`bound ${files.length} pages → ${out}`);
  process.exit(0);
}

const browser = await launch();
if (args.sheet) {
  // contact sheet from already-rendered page files (render them first)
  const ns = String(args.sheet).split(',').map(Number), w = +(args.w || 520), h = Math.round(w * 2200 / 1600), cols = +(args.cols || Math.min(ns.length, 4));
  const page = await browser.newPage();
  const imgs = ns.map(n => `data:image/jpeg;base64,${readFileSync(join(OUT, `planche_${pad(n)}.jpg`)).toString('base64')}`);
  await page.setContent(`<canvas id=c></canvas>`);
  const url = await page.evaluate(async (imgs, w, h, cols, ns) => {
    const rows = Math.ceil(imgs.length / cols), c = document.getElementById('c'); c.width = cols * w + (cols + 1) * 10; c.height = rows * h + (rows + 1) * 10;
    const x = c.getContext('2d'); x.fillStyle = '#333'; x.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < imgs.length; i++) { const im = new Image(); im.src = imgs[i]; await im.decode(); x.drawImage(im, 10 + (i % cols) * (w + 10), 10 + Math.floor(i / cols) * (h + 10), w, h); x.fillStyle = '#fff'; x.font = '18px sans-serif'; x.fillText(String(ns[i]), 16 + (i % cols) * (w + 10), 30 + Math.floor(i / cols) * (h + 10)); }
    return c.toDataURL('image/jpeg', .85);
  }, imgs, w, h, cols, ns);
  const out = args.out && args.out.endsWith('.jpg') ? args.out : join(OUT, 'sheet.jpg');
  writeFileSync(out, b64(url)); console.log('sheet → ' + out);
  await browser.close(); process.exit(0);
}

const probe = await openPage(browser);
const all = await probe.evaluate(() => window.pageList());
const want = args.all ? all.filter(n => n < 90) : String(args.pages || all[0]).split(',').map(Number).filter(n => all.includes(n));
const only = args.only ? +args.only : null;
console.log(`GPU: ${await probe.evaluate(() => { const gl = drawingContext, e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); })}`);
const workers = Math.max(1, Math.min(+(args.workers || 1), want.length));
const pages = [probe]; for (let w = 1; w < workers; w++) pages.push(await openPage(browser, '#' + w));
let next = 0; const t0 = Date.now();
await Promise.all(pages.map(async (pg, w) => {
  while (next < want.length) {
    const n = want[next++], t1 = Date.now();
    const r = await pg.evaluate((n, only, q) => window.renderPage(n, { only, q }), n, only, +(args.q || .9));
    const f = join(OUT, only ? `planche_${pad(n)}_case${only}.jpg` : `planche_${pad(n)}.jpg`);
    writeFileSync(f, b64(r.url));
    console.log(`${f}  ${((Date.now() - t1) / 1000).toFixed(1)} s  (panels: ${r.panels.map(m => (m / 1000).toFixed(1)).join(' ')} s)`);
  }
}));
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
await browser.close();
