# La chaux, le souffle du vieux bâti

Vidéo interactive d'une minute, en français, pour le site [valeriansauvage.fr](https://valeriansauvage.fr/).
Elle explique simplement pourquoi un vieux mur doit respirer, pourquoi le ciment l'abîme et pourquoi la chaux
le protège. Elle se termine sur une invitation à demander un diagnostic.

Elle est peinte image par image avec le moteur aquarelle de la vidéo *P(doom)* (p5.js + p5.brush), sur une
musique originale générée par [`music.mjs`](music.mjs), sans aucun échantillon ni droit à payer.

## Ce qu'il y a ici

| Chemin | Rôle |
|---|---|
| [`site/`](site/) | **Le dossier à mettre en ligne** : le lecteur interactif et les vidéos |
| [`site/cues.js`](site/cues.js) | Le minutage unique : chapitres, légendes, quiz, bulles « En savoir plus », boutons de fin |
| [`site/lecteur.css`](site/lecteur.css) | L'apparence du lecteur (couleurs et polices en variables en haut du fichier) |
| [`STORYBOARD.md`](STORYBOARD.md) | Le découpage plan par plan |
| [`studio.html`](studio.html) | L'atelier : chaque image y est peinte (ouvrir dans Chrome pour la parcourir) |
| [`src/`](src/) | Le moteur, les personnages (`cast.js`), les décors (`props.js`) et les six chapitres (`src/ch/`) |
| [`render.mjs`](render.mjs) | Rend les images dans Chrome sans écran et encode les vidéos avec ffmpeg |
| [`music.mjs`](music.mjs) | Compose et mixe la bande-son (musique + bruitages) |

## Mettre la vidéo sur le site

Le dossier `site/` est autonome : le lecteur, ses polices, ses vidéos et l'image d'affiche. Il ne dépend
d'aucun service extérieur (pas de Google Fonts, pas de traceur).

1. **Déposer le dossier** `site/` sur l'hébergement du site, par exemple sous le nom `video-chaux/`.
   Avec GitHub Pages, on peut aussi l'activer sur ce dépôt : la page sera alors servie à
   `https://valeriansauvage.github.io/pdoomvideo/chaux/site/`.
2. **Coller ce bloc** là où la vidéo doit apparaître. Sous WordPress, Wix, Squarespace ou Webflow, c'est le bloc
   « HTML personnalisé » ou « Intégrer du code ». Remplacer l'adresse par la bonne.

```html
<iframe id="video-chaux" src="/video-chaux/index.html"
        title="Vidéo interactive : la chaux, le souffle du vieux bâti"
        style="width:100%;height:760px;border:0;display:block" allow="fullscreen" loading="lazy"></iframe>
<script>
  // ajuste la hauteur du cadre à celle du lecteur (ordinateur comme mobile)
  addEventListener('message', e => { if (e.data && e.data.videoChauxHauteur) document.getElementById('video-chaux').style.height = e.data.videoChauxHauteur + 'px'; });
</script>
```

Pour une simple vidéo, sans interactivité, utiliser `site/media/chaux-1080.mp4` (ou la version 720p, plus légère
sur mobile) dans une balise `<video controls poster="affiche.jpg">`.

## Modifier les textes, les couleurs ou le lien de contact

- **Légendes, quiz, bulles, bouton « Demander un diagnostic »** : dans `site/cues.js`. Les textes du lecteur
  changent immédiatement. Les légendes étant peintes dans la vidéo, il faut ensuite refaire le rendu (voir plus bas).
- **Couleurs et polices du lecteur** : les variables `--vc-…` en haut de `site/lecteur.css`.
- **Couleurs et polices de la vidéo** : `PAL` et `FONT` en haut de `src/core.js`, puis refaire le rendu.

## Refaire la vidéo

Il faut Node.js, Chrome (ou Chromium) et ffmpeg. Depuis la racine du dépôt :

```bash
npm install
node chaux/music.mjs                               # bande-son → chaux/assets/musique.wav
node chaux/render.mjs --frames=0:60 --workers=3    # peint les 1 440 images → chaux/out/frames (reprise possible)
node chaux/render.mjs --encode                     # vidéos 1080p et 720p + affiche → chaux/site/media/
```

Pour vérifier un passage sans tout refaire : `node chaux/render.mjs --sheet=12,23.2,33.5 --out=chaux/out/planche.jpg`
(planche de contrôle) ou `--clip=20:26 --out=chaux/out/extrait.mp4` (extrait avec le son). On peut aussi ouvrir
`chaux/studio.html` dans Chrome et faire défiler le curseur.

Sans carte graphique, Chrome peint en logiciel : une image prend environ 1 à 2 s, et la vidéo complète une vingtaine
de minutes. Les fonds aquarelle, les plus lents, ne sont peints qu'une fois puis gardés dans `chaux/out/layers/`.

## Crédits

- Moteur d'animation : [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) (p5.js, p5.brush), adapté pour cette vidéo.
- Polices : Fraunces, Caveat et Nunito (licence SIL Open Font License).
- Musique et bruitages : originaux, synthétisés par `music.mjs`.
