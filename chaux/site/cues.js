// cues.js : le minutage unique de la vidéo « La chaux, le souffle du vieux bâti » (60 s).
// Lu par l'atelier de rendu (chapitres, légendes), par le générateur de musique (bruitages)
// et par le lecteur interactif du site (chapitres, quiz, bulles « En savoir plus »).
// Les positions x / y des bulles sont en % de l'image (0 = gauche / haut).
const CUES = {
  duree: 60,
  bpm: 96,

  chapitres: [
    { id: 'vieux-bati', titre: 'Le vieux bâti', debut: 0, fin: 10 },
    { id: 'respire', titre: 'Un mur qui respire', debut: 10, fin: 22.5 },
    { id: 'ciment', titre: 'Le piège du ciment', debut: 22.5, fin: 35 },
    { id: 'chaux', titre: 'La chaux', debut: 35, fin: 47.5 },
    { id: 'savoir-faire', titre: 'Le savoir-faire', debut: 47.5, fin: 55 },
    { id: 'contact', titre: 'Votre maison', debut: 55, fin: 60 },
  ],

  // [début, fin, texte] : légendes incrustées en bas de l'image
  legendes: [
    [4.7, 7.3, 'Nos maisons anciennes ont traversé les siècles…'],
    [7.5, 9.7, '…grâce à des murs qui respirent.'],
    [10.7, 14.3, 'L’humidité du sol monte dans le mur…'],
    [14.5, 18.5, '…puis s’évapore librement : le mur respire.'],
    [18.8, 22.3, 'Pour le protéger, on l’enduit. Mais avec quoi ?'],
    [23.3, 27.6, 'Le ciment ne laisse pas respirer : l’eau reste piégée.'],
    [27.9, 31.3, 'Humidité, salpêtre, murs froids…'],
    [31.6, 34.8, '…et l’enduit finit par éclater.'],
    [35.5, 38.2, 'La chaux, elle, laisse le mur respirer.'],
    [38.4, 42.2, 'Née de la pierre, elle redevient pierre en durcissant.'],
    [42.5, 47.2, 'Souple, perspirante et saine : elle protège sans enfermer.'],
    [47.9, 50.5, 'Un savoir-faire d’artisan…'],
    [50.7, 54.7, '…couche après couche, dans les règles de l’art.'],
  ],

  // [instant, son] : bruitages mixés par music.mjs
  bruitages: [],

  // Question posée au visiteur : le lecteur met la vidéo en pause à cet instant.
  quiz: {
    t: 21.4,
    question: 'Pour protéger ce vieux mur, vous choisissez…',
    choix: [
      { id: 'ciment', texte: 'Un enduit ciment', retour: 'Aïe… Regardez ce qui arrive au mur.' },
      { id: 'chaux', texte: 'Un enduit à la chaux', retour: 'Bien vu ! Voyons pourquoi le ciment est un piège.' },
    ],
  },

  // Bulles « En savoir plus » : visibles entre debut et fin, cliquables (la vidéo se met en pause).
  bulles: [
    { debut: 5, fin: 9.8, x: 50, y: 37, titre: 'Qu’appelle-t-on « bâti ancien » ?',
      texte: 'Les maisons construites avant 1948 environ, en pierre, brique ou terre, montées avec des mortiers de chaux ou de terre. Elles n’ont pas de barrière contre l’humidité : elles la gèrent en la laissant s’évaporer.' },
    { debut: 14.5, fin: 18.6, x: 50, y: 32, titre: 'Pourquoi un mur doit-il respirer ?',
      texte: 'L’eau du sol et celle de la vie intérieure (cuisine, douche, respiration) traversent les murs. Si elle peut s’évaporer, le mur reste sec, sain et plus isolant. On dit qu’il est « perspirant ».' },
    { debut: 27.9, fin: 31.4, x: 72, y: 36, titre: 'Le salpêtre, c’est quoi ?',
      texte: 'Des sels minéraux transportés par l’eau. Quand elle s’évapore, ils cristallisent en surface : poudre blanche, peinture qui cloque, enduit et pierre qui s’effritent.' },
    { debut: 38.4, fin: 42.3, x: 50, y: 30, titre: 'Chaux aérienne ou hydraulique ?',
      texte: 'La chaux aérienne (CL) durcit à l’air : très souple et respirante, idéale pour les finitions et les badigeons. La chaux hydraulique naturelle (NHL) prend aussi avec l’eau : plus résistante, elle convient aux enduits de façade.' },
    { debut: 49, fin: 54.7, x: 40, y: 36, titre: 'Les 3 couches d’un enduit',
      texte: 'Le gobetis accroche l’enduit au mur. Le corps d’enduit dresse et protège. La finition donne la texture et la couleur, avec des sables locaux et des pigments naturels.' },
  ],

  // Écran de fin (lecteur) : liens vers le site
  fin: {
    titre: 'Redonnons du souffle à votre maison',
    boutons: [
      { texte: 'Demander un diagnostic', lien: 'https://valeriansauvage.com/', principal: true },
      { texte: 'Revoir la vidéo', action: 'revoir' },
    ],
  },
};
if (typeof module !== 'undefined') module.exports = CUES;
