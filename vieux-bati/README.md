# Le vieux bâti doit respirer

Vidéo explicative animée (8 min 22 s, 1080p, en français) sur le bâti ancien, présentée par Margot, maçonne du patrimoine. Signée **Valeriansauvage.fr**.

▶ **La vidéo : [`video/le-vieux-bati-doit-respirer.mp4`](video/le-vieux-bati-doit-respirer.mp4)** (8 min 22 s, 1920×1080, 25 i/s, 83 Mo)

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
- `tools/tts.py` : la voix off (Kokoro TTS, voix française `ff_siwis`), le calage de chaque phrase, l'enveloppe de la synchro labiale et une musique de fond générée. Il écrit `src/timing.js` et `out/mix.wav`.
- `src/` : le moteur Canvas 2D (`core.js`, `props.js`, `presenter.js`, `main.js`) et une scène par chapitre dans `src/scenes/`.
- `render.mjs` : il dessine chaque image dans Chromium headless, puis encode le MP4 avec ffmpeg.
- `SCENE_GUIDE.md` : le guide de style et l'API des scènes.

```bash
npm install
pip install kokoro-onnx soundfile numpy
# modèles Kokoro : https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
#   kokoro-v1.0.onnx → models/kokoro.onnx, voices-v1.0.bin → models/voices.bin
python3 tools/tts.py --models=models          # voix + timing + musique
node render.mjs --frames --workers=4          # images → out/frames (reprise possible)
node render.mjs --encode --out=out/vieux-bati.mp4
```

Aperçu interactif : ouvrez `index.html` dans Chrome (lancé avec `--allow-file-access-from-files`).
