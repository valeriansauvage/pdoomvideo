"""Refine phrase boundaries that fall inside a continuous stretch of speech.

  python3 tools/refine_cuts.py <recording> --asr=<whisper dir>

For every boundary that align_recording.py had to estimate (several phrases in one block), try each silence
within ±3 s: transcribe the 3 s after it and keep the one whose first words match the next phrase.
Updates out/rec/alignment.json in place.
"""
import difflib, json, os, re, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = dict(a.lstrip('-').split('=', 1) for a in sys.argv[2:] if '=' in a)
SR = 16000
p = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True)
a = np.frombuffer(p.stdout, np.float32)
hop = SR // 50
db = 20 * np.log10(np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) for i in range(len(a) // hop)]) + 1e-9)
floor = np.percentile(db, 10)

import sherpa_onnx
ASR = args['asr']
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{ASR}/small-encoder.int8.onnx', decoder=f'{ASR}/small-decoder.int8.onnx',
                                                 tokens=f'{ASR}/small-tokens.txt', language='fr', task='transcribe', num_threads=4)
def asr(t0, t1):
    st = rec.create_stream(); st.accept_waveform(SR, a[int(t0 * SR):int(t1 * SR)]); rec.decode_stream(st); return st.result.text
def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9 ]+', ' ', s).split()

AL = json.load(open(os.path.join(ROOT, 'out/rec/alignment.json'), encoding='utf-8'))
L = AL['lines']
def silences(lo, hi):
    """centres of quiet runs (≥ 80 ms) between lo and hi seconds"""
    i0, i1 = int(lo * 50), int(hi * 50); q = db[i0:i1] < floor + 14; out, k = [], 0
    while k < len(q):
        if q[k]:
            j = k
            while j < len(q) and q[j]: j += 1
            if j - k >= 4: out.append((i0 + (k + j) / 2) * .02)
            k = j
        else: k += 1
    return out
changed = 0
for idx in range(1, len(L)):
    cur = L[idx]
    if not cur['heard'].startswith('[') or cur['heard'].startswith('[1/'): continue       # only estimated boundaries
    prev, est = L[idx - 1], cur['start']
    target = norm(cur['script'])[:4]
    best = None
    for c in silences(max(prev['start'] + .5, est - 3), min(cur['end'] - .5, est + 3)):
        w = norm(asr(c, min(c + 3, cur['end'] + 1)))[:4]
        score = difflib.SequenceMatcher(None, w, target).ratio() - .04 * abs(c - est)
        if best is None or score > best[0]: best = (score, c, ' '.join(w))
    if best and abs(best[1] - est) > .05:
        print(f"line {cur['line']:2d}: {est:7.2f} → {best[1]:7.2f}  ({best[2]!r} vs {' '.join(target)!r}, score {best[0]:.2f})")
        prev['end'] = round(best[1], 2); cur['start'] = round(best[1], 2); changed += 1
json.dump(AL, open(os.path.join(ROOT, 'out/rec/alignment.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(changed, 'boundaries moved')
