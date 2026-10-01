"""Voice-over, timing and music for the video.

  python3 tools/tts.py --models=<dir with kokoro.onnx + voices.bin>

Reads script.json, synthesises every line with Kokoro (French voice), lays the lines
out on a timeline, and writes:
  out/voice.wav      narration only
  out/music.wav      soft generated background music (ducked under the voice)
  out/mix.wav        final soundtrack
  src/timing.js      window.TIMING = {fps, duration, scenes:[{id,title,start,end,lines:[{start,end,t}]}], env:[...]}
Lines are cached in out/tts/ by text hash, so editing one line only re-synthesises that line.
"""
import hashlib, json, os, sys
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = dict(a.lstrip('-').split('=', 1) for a in sys.argv[1:] if '=' in a)
MODELS = args.get('models', os.path.join(ROOT, 'models'))
SR, FPS = 24000, 25
GAP_LINE, LEAD, TAIL = 0.42, 0.9, 1.1
FIRST_LEAD, LAST_TAIL = 3.2, 9.0

script = json.load(open(os.path.join(ROOT, 'script.json'), encoding='utf-8'))
os.makedirs(os.path.join(ROOT, 'out/tts'), exist_ok=True)

kokoro = None
def synth(text):
    global kokoro
    key = hashlib.sha1(f"{script['voice']}|{script['speed']}|{text}".encode()).hexdigest()[:16]
    path = os.path.join(ROOT, 'out/tts', key + '.wav')
    if not os.path.exists(path):
        if kokoro is None:
            from kokoro_onnx import Kokoro
            kokoro = Kokoro(os.path.join(MODELS, 'kokoro.onnx'), os.path.join(MODELS, 'voices.bin'))
        audio, sr = kokoro.create(text, voice=script['voice'], speed=script['speed'], lang='fr-fr')
        assert sr == SR
        sf.write(path, audio, SR)
        print('  synth', text[:70])
    a, _ = sf.read(path, dtype='float32')
    # trim leading/trailing near-silence so the gaps are ours
    nz = np.where(np.abs(a) > 0.01)[0]
    if len(nz): a = a[max(0, nz[0] - 600): nz[-1] + 1200]
    return a

timeline, chunks, t = [], [], 0.0
for si, sc in enumerate(script['scenes']):
    start = t
    t += FIRST_LEAD if si == 0 else LEAD
    lines = []
    for ln in sc['lines']:
        a = synth(ln.get('s', ln['t']))
        chunks.append((t, a))
        lines.append({'start': round(t, 3), 'end': round(t + len(a) / SR, 3), 't': ln['t']})
        t += len(a) / SR + GAP_LINE
    t += (LAST_TAIL if si == len(script['scenes']) - 1 else TAIL) - GAP_LINE
    timeline.append({'id': sc['id'], 'title': sc['title'], 'start': round(start, 3), 'end': round(t, 3), 'lines': lines})

dur = t
n = int(np.ceil(dur * SR))
voice = np.zeros(n, np.float32)
for st, a in chunks:
    i = int(st * SR); voice[i:i + len(a)] += a
peak = np.max(np.abs(voice)); voice *= 0.89 / peak

# lip-sync envelope per video frame (0..1)
hop = SR // FPS
nf = int(np.ceil(dur * FPS))
env = np.array([np.sqrt(np.mean(voice[i * hop:(i + 1) * hop] ** 2)) if i * hop < n else 0 for i in range(nf)])
env = np.clip(env / (np.percentile(env[env > 0.01], 90) + 1e-6), 0, 1)
env = np.convolve(env, [0.25, 0.5, 0.25], mode='same')

# ---- background music: slow warm pad + gentle plucked arpeggio, in C major / A minor ----
rng = np.random.default_rng(7)
tt = np.arange(n) / SR
def note(m): return 440.0 * 2 ** ((m - 69) / 12)
chords = [[48, 55, 64, 67], [45, 52, 60, 64], [41, 48, 57, 64], [43, 50, 59, 62]]  # C, Am, F, G
bar = 4.8
music = np.zeros(n, np.float32)
nb = int(np.ceil(dur / bar)) + 1
for b in range(nb):
    ch = chords[b % 4]
    s0 = int(b * bar * SR); L = int(bar * 1.6 * SR)
    if s0 >= n: break
    seg = np.arange(L) / SR
    envp = np.minimum(1, seg / 1.6) * np.exp(-np.maximum(0, seg - bar) / 0.9)
    pad = np.zeros(L)
    for m in ch:
        f = note(m)
        for det in (-0.12, 0.12):
            pad += np.sin(2 * np.pi * f * (1 + det / 100) * seg + rng.uniform(0, 6)) * 0.5
            pad += 0.12 * np.sin(4 * np.pi * f * seg)
    pad *= envp * 0.035
    e = min(n, s0 + L); music[s0:e] += pad[:e - s0].astype(np.float32)
    # arpeggio: 8 plucks per bar
    arp = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 24, ch[3] + 12, ch[2] + 12, ch[3] + 12]
    for k, m in enumerate(arp):
        p0 = s0 + int(k * bar / 8 * SR); PL = int(1.4 * SR)
        ps = np.arange(PL) / SR; f = note(m)
        pl = (np.sin(2 * np.pi * f * ps) + 0.3 * np.sin(4 * np.pi * f * ps) + 0.1 * np.sin(6 * np.pi * f * ps)) * np.exp(-ps * 3.2) * np.minimum(1, ps / 0.004)
        e = min(n, p0 + PL)
        if p0 < n: music[p0:e] += (pl[:e - p0] * 0.022).astype(np.float32)
# fade in / out
music *= np.minimum(1, tt / 2.5) * np.minimum(1, (dur - tt) / 4)
# duck under voice (smoothed envelope)
venv = np.abs(voice)
k = int(0.25 * SR); kern = np.ones(k) / k
venv = np.convolve(venv, kern, mode='same')
duck = 1 - 0.55 * np.clip(venv / 0.05, 0, 1)
music *= duck
# louder for the intro title and the final signature
boost = np.ones(n)
boost[tt < FIRST_LEAD] = 1.8
boost[tt > timeline[-1]['lines'][-1]['end'] + 0.3] = 1.9
music *= np.convolve(boost, np.ones(SR // 2) / (SR // 2), mode='same').astype(np.float32)

mix = voice + music
mix *= 0.95 / np.max(np.abs(mix))
sf.write(os.path.join(ROOT, 'out/voice.wav'), voice, SR)
sf.write(os.path.join(ROOT, 'out/music.wav'), music, SR)
sf.write(os.path.join(ROOT, 'out/mix.wav'), mix, SR)

out = {'fps': FPS, 'duration': round(dur, 3), 'scenes': timeline, 'env': [round(float(x), 2) for x in env]}
with open(os.path.join(ROOT, 'src/timing.js'), 'w', encoding='utf-8') as f:
    f.write('// generated by tools/tts.py — do not edit\nwindow.TIMING = ' + json.dumps(out, ensure_ascii=False) + ';\n')
print(f'duration {dur:.1f}s ({dur / 60:.1f} min)')
for s in timeline: print(f"  {s['id']:12s} {s['start']:7.1f} → {s['end']:7.1f}  ({s['end'] - s['start']:.1f}s)")
