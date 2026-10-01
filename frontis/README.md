# FRONTIS · logo d'ouverture et de fin du teaser

Le logo FRONTIS se pose sur le film, qui se floute et s'assombrit dessous : la maison du logo se construit (le tracé
vert monte du sol, le trait orange du toit se pose), FRONTIS surgit, puis les savoir-faire, un par ligne :
**Ravalement traditionnel · Isolation thermique par l'extérieur · Couverture**. À l'ouverture, le logo s'efface et
l'image redevient nette ; à la fin, le film descend au noir.

## Les fichiers livrés

| Fichier | Contenu |
|---|---|
| `FRONTIS_OUVERTURE_1080p_incrustation-voile_ProRes4444.mov` | Ouverture, 5 s, 1920 × 1080, couche alpha |
| `FRONTIS_FIN_1080p_incrustation-voile_ProRes4444.mov` | Fin, 7 s, 1920 × 1080, couche alpha |
| `FRONTIS_OUVERTURE_4K_incrustation-voile_PNG.zip` | Ouverture en 3840 × 2160 : 125 images PNG à couche alpha |
| `FRONTIS_FIN_4K_incrustation-voile_PNG.zip` | Fin en 3840 × 2160 : 175 images PNG à couche alpha |
| `FRONTIS_reference_ouverture-et-fin.mp4` | Le rendu attendu, sur des images du teaser |
| `FRONTIS_LISEZ-MOI_montage.txt` | La notice des vidéastes : placement, minutage, réglage du flou |

Les fichiers contiennent le logo, un voile sombre à 32 % et, pour la fin, le fondu au noir ; seul le flou du film est à
ajouter au montage. 25 images/s, BT.709, sans son. Chaque fichier reste sous 30 Mo, la limite d'envoi : le ProRes est
encodé à qualité fixe (invisible sur ces aplats), et la version 4K part en séquence PNG, plus légère que le ProRes 4444.

## Les styles

Quatre styles ont été essayés sur des images du teaser ; le style retenu est `flou`.

| Style | Rendu |
|---|---|
| `flou` | Logo blanc incrusté sur le film flouté au montage, sous un voile sombre uniforme |
| `image` | Logo blanc incrusté sur le film net, un halo sombre derrière lui |
| `portail` | Carton plein, fond ardoise pris dans les tons du portail ; fondu enchaîné avec le film |
| `creme` | Carton plein sur le fond crème de la charte, logo d'origine |

## Refaire le rendu

Le logo, l'animation et le rendu sont du code : on peut tout refaire, dans un autre style, une autre taille ou une autre
cadence, en quelques minutes. Il faut Node.js, Chrome, ffmpeg et zip.

| Fichier | Rôle |
|---|---|
| [`assets/logo/logo.png`](assets/logo/logo.png) | Le logo officiel FRONTIS |
| [`src/logo.js`](src/logo.js) | Le logo découpé en calques animables (maison, toit, mot FRONTIS, signature) |
| [`src/carton.js`](src/carton.js) | L'animation, les styles, les savoir-faire et le minutage |
| [`studio.html`](studio.html) | Aperçu interactif ; à ouvrir par un petit serveur local, par exemple `npx http-server frontis` |
| [`render.mjs`](render.mjs) | Rendu image par image dans Chrome, puis export ffmpeg |
| [`apercu.mjs`](apercu.mjs) | Essais des styles en situation, sur l'enregistrement d'écran du teaser |

```bash
npm install
node frontis/render.mjs --frames --plan=intro --style=flou --w=3840   # images de l'ouverture → frontis/out/frames
node frontis/render.mjs --frames --plan=fin --style=flou --w=3840     # images de la fin
node frontis/render.mjs --encode --plan=intro --style=flou --w=3840   # ProRes 1080p et PNG 4K → frontis/out/livraison
node frontis/render.mjs --encode --plan=fin --style=flou --w=3840
node frontis/render.mjs --sheet --plan=intro --style=flou --times=1,2,3,4.9 --out=frontis/out/check/planche.jpg
node frontis/apercu.mjs --teaser=<enregistrement du teaser> --styles=flou,portail   # essais sur les images du film
```

**Le logo** est lu dans `assets/logo/logo.svg` s'il existe, sinon `assets/logo/logo.png`, puis découpé tout seul :
l'icône est le premier bloc à gauche ; dans l'icône, l'orange forme le toit et le reste la maison ; à droite, la
première ligne de texte est le mot FRONTIS et la suite la signature, qui n'est pas affichée. Un PNG sur fond blanc est
détouré automatiquement.

**Couleurs et police** : vert `#3FAA42`, orange `#EA6B49` et gris `#333333` du logo ; FRONTIS et les savoir-faire en
blanc sur le film ; fond crème de la charte `#F3EFE4` pour le style `creme` ; Barlow Condensed SemiBold (licence SIL
OFL, dans `assets/fonts/`).
