// apercu.mjs : essais des styles en situation, sur des images du teaser, pour choisir comment le logo se fond dans le film.
//   node frontis/apercu.mjs --teaser=<enregistrement du teaser> [--styles=image,flou,portail] [--out=frontis/out/apercu_styles.mp4]
// Les fonds viennent de l'enregistrement d'écran du début du teaser : le portail fermé (première image, nettoyée de
// l'interface YouTube), l'ouverture du portail, puis la villa, qui tient lieu de dernière image du film.
//   styles incrustés (image, flou) : le logo passe par-dessus le film ; pour « flou », le film est flouté comme au montage ;
//   cartons (portail, creme) : fondus enchaînés avec le film.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const FPS = 25, OUT = join(ICI, 'out'), FONDS = join(OUT, 'fonds'), ESSAIS = join(OUT, 'essais');
const TEASER = args.teaser, STYLES = String(args.styles || 'image,flou,portail').split(',');
const INCRUSTES = ['image', 'flou'];
// zone vidéo de l'enregistrement (sans les bandes noires), interface YouTube à effacer sur la première image, extrait propre
const CROP = '2080:1170:226:0', OUVERTURE = [3.15, 5.89];
const NETTOYAGE = 'delogo=x=1:y=930:w=2078:h=22,delogo=x=680:y=1120:w=720:h=40,delogo=x=70:y=530:w=300:h=90';
const FLOU = 26;                                             // flou du style « flou », en pixels (sigma, image 1080p)
const ETIQUETTES = { image: 'A · LOGO SUR LE FILM', flou: 'B · LOGO SUR LE FILM FLOUTÉ', portail: 'C · CARTON ARDOISE', creme: 'CARTON CRÈME' };

const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a.map(String), { stdio: 'inherit' }); p.on('error', bad); p.on('close', c => (c ? bad(new Error(`${cmd} a échoué (${c})`)) : ok())); });
const ff = (...a) => run('ffmpeg', ['-y', '-loglevel', 'error', ...a]);
const X264 = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p'];
const NORM = `fps=${FPS},format=yuv420p,setsar=1,settb=AVTB`;
const easeInOut = x => { x = Math.max(0, Math.min(1, x)); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

// Plan fixe tiré d'une image, avec une lente poussée (agrandie d'abord, pour que le zoom ne tremble pas).
const fixe = (d, z) => `scale=4160:2340,zoompan=z='1+${z}*on/${Math.round(d * FPS)}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=${FPS},${NORM}`;

async function fonds() {
  mkdirSync(FONDS, { recursive: true });
  const portail = join(FONDS, 'portail.png'), villa = join(FONDS, 'villa.png');
  await ff('-i', TEASER, '-vf', `select=eq(n\\,0),crop=${CROP},${NETTOYAGE}`, '-frames:v', 1, portail);
  await ff('-sseof', -0.05, '-i', TEASER, '-vf', `crop=${CROP}`, '-frames:v', 1, villa);
  // ouverture : le portail fermé tient 3,9 s, puis fondu de 0,4 s dans l'ouverture filmée (6,24 s en tout)
  await ff('-loop', 1, '-framerate', FPS, '-t', 3.9, '-i', portail, '-ss', OUVERTURE[0], '-t', OUVERTURE[1] - OUVERTURE[0], '-i', TEASER,
    '-filter_complex', `[0:v]${fixe(3.9, .02)}[a];[1:v]crop=${CROP},scale=1920:1080:flags=lanczos,${NORM},setpts=PTS-STARTPTS[b];[a][b]xfade=transition=fade:duration=0.4:offset=3.5[v]`,
    '-map', '[v]', ...X264, join(FONDS, 'ouverture.mp4'));
  await ff('-loop', 1, '-framerate', FPS, '-t', 7, '-i', villa, '-vf', fixe(7, .04), ...X264, join(FONDS, 'fin.mp4'));
}

// Flou du film pour le style « flou » : fort sous le logo de l'ouverture puis net quand il s'efface ; à la fin, le film
// se floute pendant que le logo arrive. Commandes sendcmd, une par image.
function rampeFlou(plan) {
  const f = plan === 'intro' ? t => FLOU * (1 - easeInOut((t - 3.6) / 1.2)) : t => FLOU * easeInOut((t - .75) / 1.25);
  let s = ''; for (let i = 0; i <= 7 * FPS; i++) s += `${(i / FPS).toFixed(2)} gblur@f sigma ${f(i / FPS).toFixed(2)};\n`;
  const fichier = join(ESSAIS, `flou_${plan}.cmd`); writeFileSync(fichier, s); return fichier;
}

async function essai(plan, style) {
  const images = join(OUT, 'frames', `${plan}_${style}_1920`, 'f%04d.png'), out = join(ESSAIS, `${plan}_${style}.mp4`);
  if (INCRUSTES.includes(style)) {                             // le logo par-dessus le film (flouté pour « flou »)
    const flou = style === 'flou' ? `,sendcmd=f=${rampeFlou(plan)},gblur@f=sigma=0:steps=3` : '';
    await ff('-i', join(FONDS, plan === 'intro' ? 'ouverture.mp4' : 'fin.mp4'), '-framerate', FPS, '-i', images, '-filter_complex',
      `[0:v]${NORM}${flou}[f];[1:v]format=rgba,settb=AVTB[l];[f][l]overlay=format=auto:eof_action=pass,format=yuv420p[v]`, '-map', '[v]', ...X264, out);
  } else if (plan === 'intro') {                               // carton → fondu enchaîné → portail fermé puis ouverture
    await ff('-framerate', FPS, '-i', images, '-ss', 2.6, '-i', join(FONDS, 'ouverture.mp4'), '-filter_complex',
      `[0:v]${NORM}[a];[1:v]${NORM},setpts=PTS-STARTPTS[b];[a][b]xfade=transition=fade:duration=0.6:offset=4.4[v]`, '-map', '[v]', ...X264, out);
  } else {                                                     // villa → fondu enchaîné → carton de fin
    await ff('-t', 2, '-i', join(FONDS, 'fin.mp4'), '-framerate', FPS, '-i', images, '-filter_complex',
      `[0:v]${NORM}[a];[1:v]${NORM}[b];[a][b]xfade=transition=fade:duration=0.6:offset=1.4[v]`, '-map', '[v]', ...X264, out);
  }
  return out;
}

if (!TEASER || !existsSync(TEASER)) throw new Error('préciser --teaser=<enregistrement du teaser>');
mkdirSync(ESSAIS, { recursive: true });
await fonds();
for (const plan of ['intro', 'fin']) await run('node', [join(ICI, 'render.mjs'), '--frames', `--plan=${plan}`, `--style=${STYLES.join(',')}`, '--w=1920']);
const clips = [];
for (const style of STYLES) for (const plan of ['intro', 'fin']) clips.push([style, await essai(plan, style)]);
// tout à la suite, chaque essai titré en haut à gauche
const police = join(ICI, 'assets', 'fonts', 'BarlowCondensed-SemiBold.ttf'), out = args.out || join(OUT, 'apercu_styles.mp4');
const titres = clips.map(([style], i) => `[${i}:v]${NORM},drawtext=fontfile=${police}:text='${ETIQUETTES[style]}':x=56:y=44:fontsize=36:fontcolor=white:borderw=2:bordercolor=black@0.5[c${i}]`).join(';');
await ff(...clips.flatMap(([, f]) => ['-i', f]), '-filter_complex', `${titres};${clips.map((_, i) => `[c${i}]`).join('')}concat=n=${clips.length}:v=1:a=0[v]`, '-map', '[v]', ...X264, '-movflags', '+faststart', out);
console.log(`essais → ${out}`);
