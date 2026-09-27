# Kit d'intégration · vidéo interactive « La chaux, le souffle du vieux bâti »

> **Pour le Claude (ou la personne) qui monte le site valeriansauvage.fr.**
> Ce kit contient une vidéo explicative animée d'une minute en français et son lecteur interactif, prêts à publier.
> Il suffit de déposer le dossier `video-chaux/` sur le site et d'insérer une iframe dans la page choisie.
> Ne modifie ni les fichiers vidéo ni les temps de `cues.js` : ils sont synchronisés avec l'animation.

## 1. Ce que c'est

- **La vidéo** (60 s, 1920×1080, son) explique pourquoi un vieux mur doit « respirer », pourquoi un enduit ciment
  l'abîme et pourquoi la chaux le protège. Elle se termine sur « Redonnons du souffle à votre maison ·
  Valérian Sauvage · valeriansauvage.fr ». Le style est aquarelle et encre, avec des tons papier, chaux et ocre.
- **Le lecteur interactif** propose :
  - 6 chapitres cliquables : Le vieux bâti, Un mur qui respire, Le piège du ciment, La chaux, Le savoir-faire, Votre maison ;
  - un quiz « ciment ou chaux ? » à 0:21 ;
  - 5 bulles « En savoir plus » qui mettent la vidéo en pause ;
  - en fin de vidéo, les boutons « Demander un diagnostic » et « Revoir la vidéo » ;
  - le texte complet de la vidéo dans un bloc dépliable, pour l'accessibilité et le référencement.
- **Techniquement**, c'est un dossier statique autonome : HTML, CSS et JavaScript sans bibliothèque. Il n'y a ni
  CDN, ni cookie, ni traceur, et les polices sont incluses. Il est compatible avec tous les navigateurs récents,
  sur ordinateur comme sur mobile.

## 2. Contenu

```
video-chaux/                ← dossier à publier tel quel (garder cette arborescence : chemins relatifs)
├── index.html              le lecteur (page autonome, s'affiche aussi seule)
├── lecteur.css             l'apparence (couleurs et polices en variables en haut du fichier)
├── lecteur.js              le fonctionnement
├── cues.js                 les contenus : chapitres, quiz, bulles, lien du bouton de fin
├── fonts/                  Fraunces, Nunito, Caveat (woff2, licence SIL OFL jointe)
└── media/
    ├── chaux-1080.mp4      vidéo HD, 17,7 Mo (servie aux grands écrans)
    ├── chaux-720.mp4       vidéo 720p, 6,8 Mo (servie aux mobiles ; sert de secours si la HD manque)
    └── affiche.jpg         image d'attente (titre peint dans le ciel)
exemple-integration.html    page d'exemple : ouvrir pour voir l'intégration en iframe
```

## 3. Intégration recommandée : une iframe

L'iframe isole complètement le lecteur : aucun conflit de styles ou de scripts avec le site.

**Étape 1 : publier le dossier** pour qu'il soit servi à l'adresse `https://valeriansauvage.fr/video-chaux/`.

| Type de site | Où mettre `video-chaux/` |
|---|---|
| HTML statique, Netlify, GitHub Pages | à la racine du site publié |
| Next.js, Vite, Astro, Nuxt, SvelteKit | dans `public/` (ou `static/` pour SvelteKit) |
| WordPress | à la racine du site par FTP (à côté de `wp-content/`), puis bloc « HTML personnalisé » |
| Wix, Squarespace, Webflow | héberger le dossier ailleurs (Netlify, GitHub Pages…) puis bloc « Intégrer du code » avec l'adresse complète |

**Étape 2 : insérer ce code** dans la page (HTML pur ou bloc HTML) :

```html
<section class="video-chaux" aria-label="Vidéo : la chaux et le vieux bâti">
  <iframe id="video-chaux" src="/video-chaux/index.html"
          title="Vidéo interactive : la chaux, le souffle du vieux bâti"
          style="width:100%;height:760px;border:0;display:block"
          allow="fullscreen" loading="lazy"></iframe>
</section>
<script>
  // Le lecteur envoie sa hauteur : on ajuste l'iframe (utile sur mobile et quand le texte est déplié).
  addEventListener('message', e => {
    if (e.data && e.data.videoChauxHauteur) document.getElementById('video-chaux').style.height = e.data.videoChauxHauteur + 'px';
  });
</script>
```

**Version React / Next.js :**

```jsx
import { useEffect, useRef } from 'react';

export default function VideoChaux() {
  const ref = useRef(null);
  useEffect(() => {
    const onMsg = e => { if (e.data?.videoChauxHauteur && ref.current) ref.current.style.height = e.data.videoChauxHauteur + 'px'; };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);
  return (
    <iframe ref={ref} src="/video-chaux/index.html" title="Vidéo interactive : la chaux, le souffle du vieux bâti"
            style={{ width: '100%', height: 760, border: 0, display: 'block' }} allow="fullscreen" loading="lazy" />
  );
}
```

- Largeur conseillée : 100 % d'un conteneur de 900 à 1 120 px au maximum. Le lecteur s'adapte seul, et sous 560 px
  il passe en disposition mobile.
- Dans une iframe, le lecteur retire son propre fond et ses marges : il se fond dans la page.
- Emplacement suggéré : une section « Pourquoi la chaux ? » sur l'accueil, ou en tête de la page consacrée aux
  enduits à la chaux et au bâti ancien. Tu peux ajouter un titre au-dessus, par exemple « Comprendre en 1 minute ».

## 4. Personnaliser (sans toucher à la vidéo)

- **Lien du bouton « Demander un diagnostic »** : dans `cues.js`, bloc `fin.boutons`. Il vaut aujourd'hui
  `https://valeriansauvage.fr/`. **Remplace-le par la page de contact ou de devis du site** (par exemple
  `https://valeriansauvage.fr/contact`). Dans une iframe, le lien s'ouvre dans la page principale.
- **Couleurs du lecteur**, pour les aligner sur la charte du site : les variables en haut de `lecteur.css`.

| Variable | Rôle | Valeur actuelle |
|---|---|---|
| `--vc-fond` | fond papier, boutons de chapitre | `#F4EDE1` |
| `--vc-carte` | fond du lecteur et des fenêtres | `#FBF7EF` |
| `--vc-encre` | texte | `#2F2A2E` |
| `--vc-doux` | texte secondaire | `#6B6259` |
| `--vc-accent` / `--vc-accent-fonce` | boutons, progression, chapitre en cours (ocre) | `#B8702F` / `#8E5423` |
| `--vc-accent-clair` | survol, chapitre actif | `#EFD6A8` |
| `--vc-eau` | contour de focus clavier | `#3F86B0` |

- **Polices du lecteur** : `--vc-titre` (Fraunces), `--vc-texte` (Nunito) et `--vc-main` (Caveat, manuscrite).
  Pour reprendre celles du site, change ces variables. Si elles ne sont plus utilisées, supprime aussi les
  `@font-face` du haut de `lecteur.css`.
- **Textes du quiz et des bulles** : dans `cues.js`, blocs `quiz` et `bulles`. On peut les modifier, mais **pas les
  temps** (`t`, `debut`, `fin`), qui sont calés sur l'image. Les légendes font partie de la vidéo : elles ne se
  modifient qu'en refaisant le rendu (voir § 8).

## 5. Contraintes d'hébergement

- Garder l'arborescence du dossier, car tous les chemins sont relatifs.
- Servir les `.mp4` avec `Content-Type: video/mp4` et les requêtes partielles (`Range`). C'est le cas par défaut sur
  Netlify, Vercel, GitHub Pages et les hébergeurs mutualisés courants.
- Poids : environ 25 Mo en tout, mais la page n'en charge qu'environ 150 Ko tant qu'on ne lance pas la vidéo
  (`preload="none"`), puis seulement la version adaptée à l'écran.
- Pas de lecture automatique : les navigateurs l'interdisent avec le son, et le lecteur est conçu pour démarrer au
  clic.
- Rien ne dépend d'un service tiers : pas de bandeau cookies nécessaire pour ce lecteur.

## 6. Référencement (optionnel)

À ajouter dans la page qui contient l'iframe. Adapter les adresses si le dossier est ailleurs :

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "La chaux, le souffle du vieux bâti",
  "description": "Une minute pour comprendre pourquoi les murs anciens doivent respirer, et pourquoi un enduit à la chaux les protège mieux que le ciment.",
  "thumbnailUrl": "https://valeriansauvage.fr/video-chaux/media/affiche.jpg",
  "uploadDate": "2026-09-27",
  "duration": "PT1M",
  "inLanguage": "fr",
  "contentUrl": "https://valeriansauvage.fr/video-chaux/media/chaux-1080.mp4",
  "embedUrl": "https://valeriansauvage.fr/video-chaux/index.html"
}
</script>
```

## 7. Variante : la vidéo seule, sans interactivité

```html
<video controls playsinline preload="none" poster="/video-chaux/media/affiche.jpg" style="width:100%;height:auto;border-radius:16px">
  <source src="/video-chaux/media/chaux-1080.mp4" type="video/mp4">
</video>
```

## 8. Vérifications après mise en ligne

- [ ] `https://valeriansauvage.fr/video-chaux/` s'ouvre seul et la vidéo démarre au clic, avec le son.
- [ ] Le quiz apparaît à 0:21 et la vidéo repart après la réponse.
- [ ] Une bulle « + » (par exemple sur la maison, vers 0:05) ouvre sa fiche et met la vidéo en pause.
- [ ] En fin de vidéo, « Demander un diagnostic » mène à la bonne page du site.
- [ ] Sur mobile, le lecteur passe en disposition verticale et l'iframe prend la bonne hauteur (pas de barre de défilement).
- [ ] Le plein écran fonctionne (bouton en bas à droite).

## 9. Sources et modifications de la vidéo

Les sources de l'animation et de la musique sont dans le dépôt GitHub `valeriansauvage/pdoomvideo`, branche
`claude/intelligent-bardeen-58ujsu`, dossier `chaux/` : moteur aquarelle, personnages, six chapitres, musique
générée, storyboard. Pour changer la vidéo elle-même (légendes, dessins, fin), il faut refaire le rendu comme
indiqué dans `chaux/README.md`, puis remplacer les fichiers de `video-chaux/media/`. Le lecteur n'a pas à changer.
