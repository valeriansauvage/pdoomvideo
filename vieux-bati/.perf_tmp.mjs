import puppeteer from 'puppeteer-core';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
const [,, id, step = '1'] = process.argv;
const TIMING = JSON.parse(readFileSync('src/timing.js', 'utf8').replace(/^[\s\S]*?window\.TIMING = /, '').replace(/;\s*$/, ''));
const sc = TIMING.scenes.find(s => s.id === id);
const browser = await puppeteer.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', headless: true, args: ['--allow-file-access-from-files', '--no-sandbox'] });
const page = await browser.newPage(); await page.evaluateOnNewDocument(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, o) { return g.call(this, t, Object.assign({ willReadFrequently: false }, o || {})); }; });
const errs = [];
page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (['error', 'warn'].includes(m.type())) errs.push(m.text()); });
await page.goto(pathToFileURL(resolve('index.html')).href + '?render', { waitUntil: 'load' });
await page.waitForFunction('window.ready === true');
const res = await page.evaluate((a, b, fps, step) => {
  for (let f = Math.ceil(a * fps); f < b * fps; f += 5) window.drawAt(f / fps); // warm caches
  const out = [];
  for (let f = Math.ceil(a * fps); f < b * fps; f += step) { const t0 = performance.now(); window.drawAt(f / fps); document.getElementById('out').getContext('2d').getImageData(0, 0, 1, 1); out.push([f / fps, performance.now() - t0]); }
  return out;
}, sc.start, sc.end, TIMING.fps, +step);
const ms = res.map(r => r[1]).sort((x, y) => x - y);
const worst = [...res].sort((x, y) => y[1] - x[1]).slice(0, 10).map(([t, m]) => `${(t - sc.start).toFixed(2)}s:${m.toFixed(0)}`);
const buckets = {}; res.forEach(([t, m]) => { const b = Math.floor(t - sc.start); (buckets[b] = buckets[b] || []).push(m); });
console.log(Object.entries(buckets).map(([b, a]) => `${b}:${(a.reduce((x, y) => x + y, 0) / a.length).toFixed(0)}`).join(' '));
console.log(`${id} (draw + raster flush): n=${ms.length} avg=${(ms.reduce((a, b) => a + b, 0) / ms.length).toFixed(1)}ms p50=${ms[Math.floor(ms.length * .5)].toFixed(1)} p95=${ms[Math.floor(ms.length * .95)].toFixed(1)} max=${ms[ms.length - 1].toFixed(1)}\n  worst: ${worst.join(' ')}`);
if (errs.length) console.log('ERRORS:', [...new Set(errs)].slice(0, 10).join('\n'));
await browser.close();
