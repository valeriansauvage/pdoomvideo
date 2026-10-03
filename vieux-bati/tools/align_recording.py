"""Align a human narration recording with the script.

  python3 tools/align_recording.py <recording> --asr=<dir with sherpa-onnx-whisper-small>

1. cut the recording into speech segments at pauses,
2. transcribe each segment (Whisper small via sherpa-onnx, French),
3. align segments to script lines by text similarity (dynamic programming; retakes and stray takes are skipped),
writes out/rec/segments.json (all segments + transcripts) and out/rec/alignment.json (line → start/end in the recording).
"""
import difflib, json, os, re, sys, unicodedata
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = dict(a.lstrip('-').split('=', 1) for a in sys.argv[2:] if '=' in a)
REC = sys.argv[1]
ASR = args.get('asr')
OUT = os.path.join(ROOT, 'out/rec'); os.makedirs(OUT, exist_ok=True)

import subprocess
def load(path, sr):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).copy()

SR = 16000
a = load(REC, SR)
hop = int(.02 * SR); n = len(a) // hop
db = 20 * np.log10(np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) for i in range(n)]) + 1e-9)
floor, sp = np.percentile(db, 10), np.percentile(db, 90)
sil = db < floor + (sp - floor) * .25

# speech runs separated by pauses ≥ 0.25 s
segs, i = [], 0
while i < n:
    if sil[i]: i += 1; continue
    j = i
    while j < n:
        if sil[j]:
            k = j
            while k < n and sil[k]: k += 1
            if (k - j) * .02 >= .25: break
            j = k
        else: j += 1
    segs.append([i * .02, j * .02]); i = j
segs = [s for s in segs if s[1] - s[0] >= .15]
# merge very short blips into the neighbour
merged = []
for s in segs:
    if merged and (s[1] - s[0] < .35 or s[0] - merged[-1][1] < .12) and s[1] - merged[-1][0] < 25: merged[-1][1] = s[1]
    else: merged.append(s)
segs = merged
print(len(segs), 'segments')

if os.path.exists(f'{OUT}/segments.json') and 'retranscribe' not in args:
    out = json.load(open(f'{OUT}/segments.json', encoding='utf-8'))
else:
  import sherpa_onnx
  rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f'{ASR}/small-encoder.int8.onnx', decoder=f'{ASR}/small-decoder.int8.onnx', tokens=f'{ASR}/small-tokens.txt',
    language='fr', task='transcribe', num_threads=4)
  out = []
  for s0, s1 in segs:
    x = a[max(0, int((s0 - .1) * SR)): int((s1 + .1) * SR)]
    st = rec.create_stream(); st.accept_waveform(SR, x); rec.decode_stream(st)
    out.append({'start': round(s0, 2), 'end': round(s1, 2), 'text': st.result.text.strip()})
    print(f'{s0:7.2f}-{s1:7.2f}  {out[-1]["text"]}')
  json.dump(out, open(f'{OUT}/segments.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# ---- align segments → script lines ----
script = json.load(open(os.path.join(ROOT, 'script.json'), encoding='utf-8'))
lines = [l['t'] for sc in script['scenes'] for l in sc['lines']]
def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'valeriansauvage\.fr', 'valerian sauvage point fr', s)
    return re.sub(r'[^a-z0-9 ]+', ' ', s).split()
def sim(x, y):
    return difflib.SequenceMatcher(None, x, y, autojunk=False).ratio()
SW = [norm(o['text']) for o in out]; LW = [norm(l) for l in lines]
S, L, MAXK, MAXM, SKIP = len(SW), len(LW), 9, 5, -.25
NEG = -1e9
dp = np.full((S + 1, L + 1), NEG); bk = {}
dp[0][0] = 0
for i in range(S + 1):
    for j in range(L + 1):
        if dp[i][j] == NEG: continue
        if i < S and dp[i][j] + SKIP > dp[i + 1][j]:                   # skip a segment (false start / retake)
            dp[i + 1][j] = dp[i][j] + SKIP; bk[(i + 1, j)] = ('skip', i, j, 0)
        for k in range(1, MAXK + 1):                                   # segments i..i+k  ↔  lines j..j+m
            if i + k > S: break
            words = sum(SW[i:i + k], [])
            for m in range(1, MAXM + 1):
                if j + m > L: break
                sc = dp[i][j] + 2 * m * sim(words, sum(LW[j:j + m], [])) - .05 * (k - 1) - .15 * (m - 1)
                if sc > dp[i + k][j + m]:
                    dp[i + k][j + m] = sc; bk[(i + k, j + m)] = ('group', i, j, m)
i, j = max(range(S + 1), key=lambda i: dp[i][L]), L
groups, skipped = [], []
while (i, j) != (0, 0):
    kind, pi, pj, m = bk[(i, j)]
    if kind == 'group': groups.append((pi, i, pj, m))
    else: skipped.append(pi)
    i, j = pi, pj
groups.reverse()

# split a group's time span between its lines: proportional to word counts, snapped to the quietest nearby frame
def quiet_near(t, lo, hi):
    a0, a1 = int(max(lo, t - .7) / .02), int(min(hi, t + .7) / .02)
    if a1 <= a0: return t
    w = db[a0:a1] + 6 * np.abs(np.arange(a0, a1) * .02 - t)          # quiet AND close to the estimate
    return (a0 + int(np.argmin(w))) * .02
res = []
for s0, s1, l0, m in groups:
    t0, t1 = out[s0]['start'], out[s1 - 1]['end']
    heard = ' '.join(out[k]['text'] for k in range(s0, s1))
    if m == 1: spans = [(t0, t1)]
    else:
        # prefer real pauses between this group's segments as boundaries
        wc = [len(LW[l0 + q]) for q in range(m)]; cum = np.cumsum(wc) / sum(wc)
        cuts = []
        segw = [max(1, len(SW[k])) for k in range(s0, s1)]; segcum = np.cumsum(segw) / sum(segw)   # word share after each segment
        used = -1
        for q in range(m - 1):
            # a pause between segments whose word share matches the lines' word share, else the quietest point near the estimate
            cands = [(abs(segcum[k] - cum[q]), k) for k in range(used + 1, len(segw) - 1)]
            best = min(cands) if cands else None
            if best and best[0] < .06:
                k = best[1]; used = k; cuts.append((out[s0 + k]['end'] + out[s0 + k + 1]['start']) / 2)
            else:
                # inside a segment: interpolate within the segment holding that word share, then snap to a quiet frame
                k = int(np.searchsorted(segcum, cum[q])); k = min(k, len(segw) - 1)
                lo = segcum[k - 1] if k else 0; f = (cum[q] - lo) / max(1e-6, segcum[k] - lo)
                st, en = out[s0 + k]['start'], out[s0 + k]['end']
                cuts.append(quiet_near(st + (en - st) * f, st, en))
        b = [t0] + cuts + [t1]; spans = [(b[q], b[q + 1]) for q in range(m)]
    for q in range(m):
        res.append({'line': l0 + q + 1, 'start': round(spans[q][0], 2), 'end': round(spans[q][1], 2), 'heard': heard if m == 1 else f'[{q + 1}/{m}] ' + heard,
                    'script': lines[l0 + q], 'match': round(sim(norm(heard), sum(LW[l0:l0 + m], [])), 2)})
json.dump({'lines': res, 'skipped': [out[k] for k in sorted(skipped)]}, open(f'{OUT}/alignment.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
low = [r for r in res if r['match'] < .6]
print(f'\naligned {len(res)} lines; mean match {np.mean([r["match"] for r in res]):.2f}; {len(low)} lines below 0.6; {len(skipped)} segments skipped')
for r in low: print(' LOW', r['line'], r['match'], '|', r['heard'][:70], '||', r['script'][:50])
for k in sorted(skipped): print(' SKIP', out[k])
