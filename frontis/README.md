# FRONTIS · plans d'ouverture et de fin

Deux plans animés pour le teaser FRONTIS : un carton d'ouverture, et le même carton pour clore le film.
Sur le fond crème de la charte, la maison du logo se construit (les murs montent, le toit se pose), FRONTIS et sa
signature surgissent, puis les savoir-faire : **Enduits à la chaux · Couverture & zinguerie**.

## Les fichiers livrés

| Fichier | Contenu |
|---|---|
| `FRONTIS_OUVERTURE_4K_fond-plein_ProRes422HQ.mov` | Ouverture, 5 s, fond crème |
| `FRONTIS_OUVERTURE_4K_fond-transparent_ProRes4444.mov` | Ouverture, 5 s, fond transparent (couche alpha) |
| `FRONTIS_FIN_4K_fond-plein_ProRes422HQ.mov` | Fin, 7 s, fond crème puis fondu au noir |
| `FRONTIS_FIN_4K_fond-transparent_ProRes4444.mov` | Fin, 7 s, fond transparent : le carton s'efface en fondu |
| `FRONTIS_…_1080p_…` | Les mêmes en 1920 × 1080 |
| `FRONTIS_…_1080p_apercu.mp4` | Aperçus légers (H.264) pour valider sans logiciel de montage |

Tous les fichiers : 25 images/s, BT.709, sans son (la musique du film continue). Ils se lisent dans
Premiere Pro, Final Cut Pro et DaVinci Resolve.

## Au montage

**Ouverture (5 s)**

| Temps | À l'image |
|---|---|
| 0 → 0,35 s | Fond crème seul |
| 0,35 → 3,7 s | Les murs montent, le toit se pose, FRONTIS et sa signature, puis les savoir-faire |
| 3,7 → 5 s | Le carton complet tient |

Placer un fondu enchaîné de 0,5 à 0,8 s entre la fin du fichier et le premier plan du film (le portail).
Le carton est complet dès 3,7 s : on peut raccourcir le plan et lancer le fondu plus tôt.

**Fin (7 s)**

| Temps | À l'image |
|---|---|
| 0 → 0,75 s | Fond crème seul : la dernière image du film vient s'y fondre (fondu enchaîné de 0,5 à 0,75 s) |
| 0,75 → 4,1 s | Le même carton se construit |
| 4,1 → 6 s | Le carton complet tient |
| 6 → 7 s | Fondu au noir, déjà dans le fichier |

Pour garder le carton plus longtemps à l'écran, faire un arrêt sur image entre 4,1 et 6 s, avant le fondu au noir.

**Version fond transparent** : à poser au-dessus d'une image du film, pour fondre le logo dans le plan. Le texte du logo
est foncé : la réserver aux images claires (ciel, façade enduite).

## Refaire le rendu

Le logo, l'animation et le rendu sont du code : on peut tout refaire, dans une autre taille ou une autre cadence, en
quelques minutes. Il faut Node.js, Chrome et ffmpeg.

| Fichier | Rôle |
|---|---|
| [`src/logo.js`](src/logo.js) | Le logo en calques (murs, toit, mot FRONTIS, signature) |
| [`src/carton.js`](src/carton.js) | L'animation des deux plans, les savoir-faire et les durées |
| [`studio.html`](studio.html) | Aperçu interactif ; à ouvrir par un petit serveur local, par exemple `npx http-server frontis` |
| [`render.mjs`](render.mjs) | Rendu image par image dans Chrome, puis encodage ffmpeg |

```bash
npm install
node frontis/render.mjs --frames --plan=intro --w=3840    # images de l'ouverture, fond plein et transparent
node frontis/render.mjs --frames --plan=fin --w=3840      # images de la fin
node frontis/render.mjs --encode --plan=intro --w=3840    # ProRes 4K et 1080p, aperçu MP4 → frontis/out/livraison
node frontis/render.mjs --encode --plan=fin --w=3840
node frontis/render.mjs --sheet --plan=intro --times=1,2,3,4.9 --out=frontis/out/check/planche.jpg   # planche de contrôle
```

**Le logo** est lu dans `assets/logo/logo.svg` (de préférence) ou `assets/logo/logo.png`, puis découpé tout seul :
l'icône est le premier bloc à gauche ; dans l'icône, l'orange forme le toit et le reste les murs ; à droite, la première
ligne de texte est le mot FRONTIS et la suite la signature. Un PNG sur fond blanc est détouré automatiquement. Sans
fichier, un logo provisoire redessiné d'après la charte est utilisé, et la mention « logo provisoire » apparaît à l'image.

**Charte** : vert foncé `#24523A`, vert vif `#3FA24C`, orange `#D9622B`, crème `#F3EFE4` ; Archivo Black et
Barlow Condensed (licence SIL OFL, fichiers dans `assets/fonts/`).
