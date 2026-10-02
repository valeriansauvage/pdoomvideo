"""Mix the narration (out/voice.wav) with the music (out/music2.wav) into out/bed.wav (48 kHz, 16-bit mono),
ducking the music under the voice. tools/sound.mjs then adds the sound effects and normalises loudness."""
import os, subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000

def load(path):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).copy()

voice, music = load(os.path.join(ROOT, 'out/voice.wav')), load(os.path.join(ROOT, 'out/music2.wav'))
n = max(len(voice), len(music)); voice = np.pad(voice, (0, n - len(voice))); music = np.pad(music, (0, n - len(music)))

rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2))
music *= rms(voice) / rms(music) * 10 ** (-10 / 20)          # music sits 10 dB under the voice when she's silent…
win = int(.3 * SR)                                             # …and ~22 dB under while she speaks
env = np.convolve(np.abs(voice), np.ones(win) / win, mode='same')
speech = np.clip(env / (np.percentile(env[env > 1e-3], 50) * .6), 0, 1)
att = int(.25 * SR); speech = np.convolve(speech, np.ones(att) / att, mode='same')   # smooth gain changes
music *= 10 ** (-12 * speech / 20)

bed = voice + music
bed *= .9 / np.max(np.abs(bed))
pcm = (np.clip(bed, -1, 1) * 32767).astype('<i2').tobytes()
with open(os.path.join(ROOT, 'out/bed.wav'), 'wb') as f:
    import struct
    f.write(b'RIFF' + struct.pack('<I', 36 + len(pcm)) + b'WAVEfmt ' + struct.pack('<IHHIIHH', 16, 1, 1, SR, SR * 2, 2, 16) + b'data' + struct.pack('<I', len(pcm)) + pcm)
print(f'bed {n / SR:.1f}s')
