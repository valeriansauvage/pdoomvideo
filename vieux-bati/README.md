# Le vieux bâti doit respirer

Vidéo explicative animée (8 min 33 s, 1080p, en français) sur le bâti ancien, racontée par Valérian (voix enregistrée), présentée par un maçon du patrimoine animé. Signée **Valeriansauvage.fr**.

▶ **La vidéo : [`video/le-vieux-bati-doit-respirer.mp4`](video/le-vieux-bati-doit-respirer.mp4)** (8 min 33 s, 1920×1080, 25 i/s, 92 Mo)

| Chapitre | Sujet |
|---|---|
| Intro | Une maison de 1880 qui a tenu plus d'un siècle… jusqu'à sa « rénovation » |
| 1 | Comment vit un mur ancien : un mur perspirant, en équilibre avec l'eau |
| 2 | Nous sommes faits d'eau : 10 à 15 L de vapeur par jour pour une famille |
| 3 | Comment la peinture plastique, les RPE et le ciment ont piégé l'eau (cloques, salpêtre, gélifraction) |
| 4 | Sur-isolation et ventilation : point de rosée, moisissures, isolants perspirants, VMC |
| 5 | Les enduits à la chaux : le cycle de la chaux, la carbonatation, les trois couches |
| 6 | Les enduits pouzzolaniques : le mortier des Romains |
| 7 | Les peintures minérales KEIM : la silicatisation |
| 8 | Comment vieilliront les façades : plastique contre minéral, à 10, 25 et 50 ans |
| 9 | Les bons gestes + signature |

## Fabrication

Tout est généré par du code : il n'y a ni image ni vidéo source.

- `script.json` : le texte de la narration (`t` = sous-titre, `s` = variante phonétique pour la voix).
- `tools/tts.py` : la voix off, le calage de chaque phrase, l'enveloppe de la synchro labiale et une musique de fond générée. Il écrit `src/timing.js` et `out/mix.wav`. La voix est « Jessica » (Piper `fr_FR-upmc-medium`, via sherpa-onnx), rendue plus humaine : chaque phrase est synthétisée à part avec un débit et une hauteur légèrement variés, des pauses naturelles, des respirations douces avant la plupart des phrases, une couleur chaude (légèrement plus grave, aigus adoucis) et une petite ambiance de pièce. L'ancien moteur Kokoro reste disponible (`"engine": "kokoro"` dans `script.json`).
- **Son** : `node render.mjs --events` rejoue toutes les images et note l'apparition de chaque texte ; `tools/cues.py` en fait des bruitages (pops, tampons, tics des compteurs, whoosh aux chapitres, carillon final) ; `tools/music.mjs` compose la musique (ukulélé, plus discrète sur les passages graves) ; `tools/bed.py` mixe voix + musique avec ducking ; `tools/sound.mjs` ajoute les bruitages et normalise à −16 LUFS. `music.mjs` et `sound.mjs` viennent de [claude-animation-skill](https://github.com/buildwithhanif/claude-animation-skill) (licence MIT).
- **Style dessiné à la main** : les contours « bouillonnent » 8 fois par seconde (`BOIL` dans `core.js`), texture papier, légère caméra sur chaque plan, apparitions « snap puis tenue », gestes de Margot avec anticipation et rebond.
- `src/` : le moteur Canvas 2D (`core.js`, `props.js`, `presenter.js`, `main.js`) et une scène par chapitre dans `src/scenes/`.
- `render.mjs` : il dessine chaque image dans Chromium headless, puis encode le MP4 avec ffmpeg.
- `SCENE_GUIDE.md` : le guide de style et l'API des scènes.

```bash
npm install
pip install sherpa-onnx soundfile numpy
# voix Jessica : https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-fr_FR-upmc-medium.tar.bz2
#   à décompresser dans models/ (ffmpeg avec rubberband requis)
python3 tools/tts.py --models=models          # voix + timing + musique
node render.mjs --events && python3 tools/cues.py     # bruitages → out/cues.json
node tools/music.mjs out/music2.wav --dur <durée> --bpm 96 --quiet <a-b,…> --end <t>
python3 tools/bed.py                                  # voix + musique → out/bed.wav
node render.mjs --frames --workers=4                  # images → out/frames (reprise possible)
ffmpeg -framerate 25 -i out/frames/f%05d.jpg -c:v libx264 -crf 23 -pix_fmt yuv420p out/picture.mp4
node tools/sound.mjs out/cues.json out/picture.mp4 out/final.mp4 --bed out/bed.wav --bed-vol 1
```

Aperçu interactif : ouvrez `index.html` dans Chrome (lancé avec `--allow-file-access-from-files`).
