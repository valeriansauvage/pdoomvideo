"""Turn the picture's text pop-ins (out/events.json, from `node render.mjs --events`) into sound-effect cues
for tools/sound.mjs: pops for labels, thumps for big stamps, ticks for running counters, whooshes for chapter
changes, plus a few word-specific sounds. Writes out/cues.json.
"""
import json, os, re, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = sorted(json.load(open(os.path.join(ROOT, 'out/events.json'))), key=lambda e: e['t'])
src = open(os.path.join(ROOT, 'src/timing.js'), encoding='utf-8').read()
T = json.loads(re.sub(r'^[\s\S]*?window\.TIMING = ', '', src).rstrip().rstrip(';'))

LEAD = .03                       # sound slightly before the picture reads as synced
SPECIAL = [                      # (pattern, sfx, vol, dur)
    (r'Gélifraction|microfissures|fissure', 'crack', .45, None),
    (r'BLOQUÉE|BREVETÉ|SE DÉGRADE|VIEILLIT|même recette|AVANT 1948', 'thump', .5, None),
    (r'Salpêtre|Carbonatation|Silicatisation|réaction pouzzolanique|Réaction pouzzolanique', 'sparkle', .35, None),
    (r'= de la pierre|MUR PERSPIRANT|Équilibre|La bonne recette|encore un siècle|comme neuve|belle patine', 'chime', .32, None),
    (r'cloque|cloques', 'boing', .3, .35),
    (r'pluie|eau du sol|remontées du sol|gouttes|vapeur', 'drip', .28, None),
    (r'€€€', 'buzz', .22, .35),
]
rnd = lambda s: int(hashlib.md5(s.encode()).hexdigest()[:6], 16) / 0xFFFFFF

cues, last = [], {'pop': -9, 'tick': -9}
numeric = re.compile(r'^[\d\s%°,.+\-–−/CLans]*\d[\d\s%°,.+\-–−/CLans]*$')
i = 0
while i < len(E):
    e = E[i]
    # group things that appear together (letter-by-letter titles, a card with several texts)
    grp = [e]
    while i + 1 < len(E) and E[i + 1]['t'] - e['t'] < .07 and E[i + 1]['scene'] == e['scene']:
        i += 1; grp.append(E[i])
    i += 1
    t, txt = e['t'] - LEAD, ' '.join(g['text'] for g in grp)
    big = max(g['size'] for g in grp)
    if all(numeric.match(g['text'].strip() or 'x') for g in grp):           # running counters → light ticks
        if t - last['tick'] >= .09:
            cues.append({'sfx': 'tick', 't': round(t, 3), 'vol': .16, 'pitch': round(.9 + .3 * rnd(txt), 2)}); last['tick'] = t
        continue
    special = next((s for s in SPECIAL if re.search(s[0], txt)), None)
    if special:
        c = {'sfx': special[1], 't': round(t, 3), 'vol': special[2]}
        if special[3]: c['dur'] = special[3]
        cues.append(c)
        if special[1] == 'thump': cues.append({'sfx': 'pop', 't': round(t, 3), 'vol': .25, 'pitch': .8})
        last['pop'] = t
        continue
    if t - last['pop'] < .11:                                              # don't machine-gun
        continue
    if big >= 64 and len(txt) > 2:
        cues.append({'sfx': 'thump', 't': round(t, 3), 'vol': .3}); cues.append({'sfx': 'pop', 't': round(t, 3), 'vol': .32, 'pitch': .85})
    else:
        cues.append({'sfx': 'pop', 't': round(t, 3), 'vol': round(.22 + .1 * rnd(txt + 'v'), 2), 'pitch': round(.92 + .38 * rnd(txt), 2),
                     'pan': round((rnd(txt + 'p') - .5) * .5, 2)})
    last['pop'] = t

# chapter changes: a whoosh as the ribbon sweeps in; a soft riser into the title card
for si, sc in enumerate(T['scenes']):
    if si: cues.append({'sfx': 'whoosh', 't': round(sc['start'] - .12, 3), 'vol': .38, 'dur': .7})
cues.append({'sfx': 'riser', 't': 0.0, 'vol': .18, 'dur': 1.4})
# the end card: chime + sparkle as the signature is written
end = T['scenes'][-1]['lines'][-1]['end']
cues += [{'sfx': 'chime', 't': round(end + .35, 3), 'vol': .4}, {'sfx': 'sparkle', 't': round(end + 1.1, 3), 'vol': .3}]

cues.sort(key=lambda c: c['t'])
json.dump(cues, open(os.path.join(ROOT, 'out/cues.json'), 'w'), indent=0)
from collections import Counter
print(len(cues), 'cues', dict(Counter(c['sfx'] for c in cues)))
