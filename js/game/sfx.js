// Tiny synthesized sound effects for the challenge (no audio files needed).
const KEY = 'athar_sfx_muted';
let ctx = null;
let muted = false;
try {
  muted = localStorage.getItem(KEY) === '1';
} catch (e) {
  /* storage blocked */
}

function audio() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try {
      ctx = new C();
    } catch (e) {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, delay, dur, type = 'sine', level = 0.16) {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(level, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

const sfx = {
  correct() {
    if (muted) return;
    tone(660, 0, 0.16, 'triangle', 0.15);
    tone(880, 0.09, 0.18, 'triangle', 0.13);
    tone(1320, 0.18, 0.26, 'triangle', 0.1);
  },
  wrong() {
    if (muted) return;
    tone(300, 0, 0.16, 'sine', 0.13);
    tone(196, 0.12, 0.26, 'sine', 0.11);
  },
  grab() {
    if (muted) return;
    tone(520, 0, 0.07, 'square', 0.05);
  },
  drop() {
    if (muted) return;
    tone(420, 0, 0.09, 'sine', 0.06);
  },
  win() {
    if (muted) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.14));
    tone(1568, 0.5, 0.5, 'sine', 0.09);
  },
  toggle() {
    muted = !muted;
    try {
      localStorage.setItem(KEY, muted ? '1' : '0');
    } catch (e) {
      /* storage blocked */
    }
    return muted;
  },
  isMuted: () => muted,
};

export default sfx;