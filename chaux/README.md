# La chaux, le souffle du vieux bâti

Vidéo interactive d'une minute, en français, pour le site [valeriansauvage.fr](https://valeriansauvage.fr/).
Elle explique simplement pourquoi un vieux mur doit respirer, pourquoi le ciment l'abîme et pourquoi la chaux
le protège. Elle se termine sur une invitation à demander un diagnostic.

Elle est peinte image par image avec le moteur aquarelle de la vidéo *P(doom)* (p5.js + p5.brush), sur une
musique originale générée par [`music.mjs`](music.mjs), sans aucun échantillon ni droit à payer.

## Ce qu'il y a ici

| Chemin | Rôle |
|---|---|
| [`video-chaux/`](video-chaux/) | **Le dossier à mettre en ligne** : le lecteur interactif et les vidéos |
| [`video-chaux/cues.js`](video-chaux/cues.js) | Le minutage unique : chapitres, légendes, quiz, bulles « En savoir plus », boutons de fin |
| [`video-chaux/lecteur.css`](video-chaux/lecteur.css) | L'apparence du lecteur (couleurs et polices en variables en haut du fichier) |
| [`INTEGRATION.md`](INTEGRATION.md) | **Le kit d'intégration** pour la personne (ou le Claude) qui monte le site |
| [`exemple-integration.html`](exemple-integration.html) | Une page d'exemple qui intègre le lecteur en iframe |
| [`STORYBOARD.md`](STORYBOARD.md) | Le découpage plan par plan |
| [`studio.html`](studio.html) | L'atelier : chaque image y est peinte (ouvrir dans Chrome pour la parcourir) |
| [`src/`](src/) | Le moteur, les personnages (`cast.js`), les décors (`props.js`) et les six chapitres (`src/ch/`) |
| [`render.mjs`](render.mjs) | Rend les images dans Chrome sans écran et encode les vidéos avec ffmpeg |
| [`music.mjs`](music.mjs) | Compose et mixe la bande-son (musique + bruitages) |

## Mettre la vidéo sur le site

Tout est décrit dans [`INTEGRATION.md`](INTEGRATION.md) : déposer le dossier `video-chaux/` sur le site, puis insérer
une iframe (codes HTML et React fournis). On y trouve aussi les couleurs à adapter, le lien du bouton de contact, les
contraintes d'hébergement, le balisage pour le référencement et une liste de vérifications.

Pour transmettre le tout d'un bloc, par exemple à une autre conversation Claude, on prépare une archive depuis ce
dossier :

```bash
cd chaux && zip -r -X video-chaux-kit.zip INTEGRATION.md exemple-integration.html video-chaux
```

## Modifier les textes, les couleurs ou le lien de contact

- **Quiz, bulles, bouton « Demander un diagnostic »** : dans `video-chaux/cues.js`. Le lecteur est mis à jour
  immédiatement. Les **légendes** étant peintes dans la vidéo, les modifier demande de refaire le rendu (voir plus bas).
- **Couleurs et polices du lecteur** : les variables `--vc-…` en haut de `video-chaux/lecteur.css`.
- **Couleurs et polices de la vidéo** : `PAL` et `FONT` en haut de `src/core.js`, puis refaire le rendu.

## Refaire la vidéo

Il faut Node.js, Chrome (ou Chromium) et ffmpeg. Depuis la racine du dépôt :

```bash
npm install
node chaux/music.mjs                               # bande-son → chaux/assets/musique.wav
node chaux/render.mjs --frames=0:60 --workers=3    # peint les 1 440 images → chaux/out/frames (reprise possible)
node chaux/render.mjs --encode                     # vidéos 1080p et 720p + affiche → chaux/video-chaux/media/
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
