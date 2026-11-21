# Sous un arbre à la campagne — la bande dessinée

This folder adapts the screenplay *Sous un arbre à la campagne* into a 26-page comic album plus a cover. It is painted with the same watercolour-and-ink engine as the P(doom) video: p5.js with p5.brush, rendered in headless Chrome. Every panel is code: there is no hand-drawn or generated image anywhere.

The page-by-page adaptation, with every line of dialogue and its French translation, is in [`DECOUPAGE.md`](DECOUPAGE.md).

## Rendering

The prerequisites are the same as for the video: Node.js and Google Chrome (or Chromium). The `npm install` at the repository root provides p5, p5.brush and puppeteer-core.

```bash
npm install
node bd/render.mjs --all --workers=3        # paint every page → out/bd/planche_XX.jpg (page 0 is the cover)
node bd/render.mjs --pdf                    # bind them → out/bd/Sous_un_arbre_a_la_campagne.pdf
node bd/render.mjs --pages=4 --only=2       # just panel 2 of page 4, for quick checks
```

Options:

- `--chrome=<path>`: the Chrome executable. By default it looks for Chrome on Windows and macOS, and for Playwright's Chromium on Linux.
- `--angle=<backend>`: the WebGL backend. The defaults are `d3d11` on Windows, `metal` on macOS and `swiftshader` (CPU) elsewhere.

With a GPU, a page takes a few seconds. On CPU-only SwiftShader it takes one to five minutes.

To browse the pages interactively, open `bd/album.html` in Chrome launched with `--allow-file-access-from-files`.

## How it is built

| Path | What it is |
|---|---|
| [`src/core.js`](src/core.js) | Page layout (rows of panels), per-panel painting, cameras, speech bubbles with tails, captions, sound effects, paper and grain |
| [`src/people.js`](src/people.js) | A posable painted human: joints, two-bone IK for the hands (`reachN: [x, y]` or `'ear'`, `'mouth'`, `'chest'`…), views, expressions, hair and outfits. Also defines the cast. |
| [`src/sets.js`](src/sets.js) | The settings: the Paris bedroom, the street with the protest crowd, the tunnel, the getaway car, the countryside and the big tree, the farm (yard, living room, kitchen, hallway, closet), and the night woods and road |
| [`src/props.js`](src/props.js) | Suitcases, gold and cash, the guitar, coffee and croissant, the car, goats and chickens, the easel, the shovel and more |
| [`src/pages/`](src/pages/) | The pages, a few per file. Each page is `page(n, rows)`, and each panel is a `draw(w, h)` function plus its bubbles (`bub`), captions (`cap`) and sound effects (`sfx`). |
| [`album.html`](album.html) | Loads everything. It also works as a page viewer. |
| [`render.mjs`](render.mjs) | Renders pages to JPEG, makes contact sheets and binds the PDF |

### Writing a panel

```js
{
  draw(w, h) {
    cam(1000, 560, 1.4);                          // world point at the panel centre, zoom
    parisStreet({ smoke: .8 });                   // a set
    crowd({ rows: [[870, .5, 26]] });
    fig('vlad', 1110, 1020, { view: 'l', ex: 'talk', reachN: [940, 600] });   // hand to Valérian's cheek
  },
  bub: [{ s: 'vlad', t: 'Tant de jeunes femmes.', x: .74, y: .14 }],     // tail finds Vlad's mouth
  cap: [{ t: 'Paris.', at: 'tl' }],
}
```

Lines that are not in French get a translation: `tr: '…'` prints it in small italics under the original.
