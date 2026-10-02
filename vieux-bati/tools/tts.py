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

ENGINE = script.get('engine', 'kokoro')
kokoro = None
jessica = None

def _ffmpeg(a, sr_in, af):
    """Run a float32 mono signal through an ffmpeg audio filter chain; returns 24 kHz float32."""
    import subprocess
    p = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(sr_in), '-ac', '1', '-i', '-', '-af', af,
                        '-ar', str(SR), '-ac', '1', '-f', 'f32le', '-'], input=a.astype(np.float32).tobytes(), capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).copy()

def _trim(a, thr=0.01, pre=300, post=900):
    nz = np.where(np.abs(a) > thr)[0]
    return a[max(0, nz[0] - pre): nz[-1] + post] if len(nz) else a

def breath(r, dur):
    """A soft, natural-sounding inhale: shaped noise with a breathy spectrum and a swelling envelope."""
    n = int(dur * SR)
    spec = np.fft.rfft(r.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    shape = (np.exp(-((f - 1100) / 700) ** 2) + .7 * np.exp(-((f - 2300) / 900) ** 2) + .25 * np.exp(-((f - 450) / 250) ** 2)) * (f > 180) / (1 + (f / 5000) ** 4)
    x = np.fft.irfft(spec * shape, n)
    t = np.linspace(0, 1, n)
    envl = np.sin(np.pi * np.clip(t / .7, 0, 1) / 2) ** 1.5 * np.clip((1 - t) / .25, 0, 1) ** .8
    x = x * envl * (1 + .15 * np.sin(2 * np.pi * 7 * t))
    return (x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * r.uniform(.010, .016)).astype(np.float32)

SENT_PAUSE = {'.': (.30, .48), '!': (.32, .48), '?': (.38, .55), '…': (.45, .70), ':': (.22, .34), ';': (.22, .34)}

def synth_jessica(text):
    """One line → sentences synthesised separately with varied pace/pitch, joined by natural pauses (and an occasional breath)."""
    global jessica
    import re
    if jessica is None:
        import sherpa_onnx
        d = os.path.join(MODELS, 'vits-piper-fr_FR-upmc-medium')
        jessica = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f'{d}/fr_FR-upmc-medium.onnx', tokens=f'{d}/tokens.txt', data_dir=f'{d}/espeak-ng-data',
                                                      noise_scale=0.72, noise_scale_w=0.9, length_scale=1.0), num_threads=4)))
    r = np.random.default_rng(int(hashlib.sha1(text.encode()).hexdigest()[:8], 16))
    parts = [p.strip() for p in re.findall(r'[^.!?…:;]+[.!?…:;]*', text) if p.strip()]
    out = []
    base = script['speed']
    for i, p in enumerate(parts):
        sp = base * r.uniform(.94, 1.04) * (1.03 if len(p) < 25 else 1)       # short phrases a touch livelier
        g = jessica.generate(p, sid=0, speed=sp)
        a = np.array(g.samples, np.float32)
        pitch = script.get('pitch', .96) * r.uniform(.985, 1.02) * (1.015 if p.endswith(('!', '?')) else 1)
        a = _trim(_ffmpeg(a, g.sample_rate, f'rubberband=pitch={pitch:.4f}:formant=preserved'))
        out.append(a)
        if i < len(parts) - 1:
            lo, hi = SENT_PAUSE.get(p[-1], (.18, .28))
            gap = r.uniform(lo, hi)
            if gap > .4 and r.random() < .45 and len(parts[i + 1]) > 30:   # mid-line breath before a long sentence
                b = breath(r, min(.42, gap - .08)); out.append(b); out.append(np.zeros(int((gap - len(b) / SR) * SR), np.float32))
            else:
                out.append(np.zeros(int(gap * SR), np.float32))
    return np.concatenate(out)

def synth(text):
    global kokoro
    key = hashlib.sha1(f"{ENGINE}|{script['voice']}|{script['speed']}|{script.get('pitch')}|{text}".encode()).hexdigest()[:16]
    path = os.path.join(ROOT, 'out/tts', key + '.wav')
    if not os.path.exists(path):
        if ENGINE == 'jessica':
            audio = synth_jessica(text)
        else:
            if kokoro is None:
                from kokoro_onnx import Kokoro
                kokoro = Kokoro(os.path.join(MODELS, 'kokoro.onnx'), os.path.join(MODELS, 'voices.bin'))
            audio, sr = kokoro.create(text, voice=script['voice'], speed=script['speed'], lang='fr-fr')
        sf.write(path, audio, SR)
        print('  synth', text[:70])
    a, _ = sf.read(path, dtype='float32')
    return _trim(a, pre=600, post=1200)

timeline, chunks, breaths, t = [], [], [], 0.0
for si, sc in enumerate(script['scenes']):
    start = t
    t += FIRST_LEAD if si == 0 else LEAD
    lines = []
    for li, ln in enumerate(sc['lines']):
        txt = ln.get('s', ln['t'])
        if ENGINE == 'jessica' and li > 0:
            rb = np.random.default_rng(len(txt) * 7919 + si * 31 + li)
            t += rb.uniform(.05, .3)                                   # varied rhythm between lines
            if rb.random() < .7:                                     # breathe in before most lines
                b = breath(rb, rb.uniform(.32, .48)); breaths.append((t - len(b) / SR - .06, b))
        elif ENGINE == 'jessica' and si > 0:
            rb = np.random.default_rng(si); b = breath(rb, .42); breaths.append((t - len(b) / SR - .1, b))
        a = synth(txt)
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
lips = voice.copy()                      # lip-sync from speech only (not breaths)
if ENGINE == 'jessica':
    for st, b in breaths:
        i = max(0, int(st * SR)); voice[i:i + len(b)] += b[:max(0, n - i)]
    # warm, soft "recorded in a quiet room" colouring + very low room tone
    voice = _ffmpeg(voice, SR, script.get('voice_fx', 'equalizer=f=220:t=q:w=1:g=2.5,equalizer=f=3300:t=q:w=1.3:g=-2.5,highshelf=f=7500:g=-4,deesser=i=0.4,aecho=0.8:0.6:28|47:0.10|0.06,acompressor=threshold=-22dB:ratio=2.2:attack=15:release=250'))[:n]
    voice = np.pad(voice, (0, n - len(voice)))
    voice += (np.random.default_rng(3).standard_normal(n) * 0.0012).astype(np.float32)
    voice *= 0.89 / np.max(np.abs(voice))

# lip-sync envelope per video frame (0..1)
hop = SR // FPS
nf = int(np.ceil(dur * FPS))
env = np.array([np.sqrt(np.mean(lips[i * hop:(i + 1) * hop] ** 2)) if i * hop < n else 0 for i in range(nf)])
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
