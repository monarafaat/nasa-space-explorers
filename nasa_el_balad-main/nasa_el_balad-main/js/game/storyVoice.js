// Short spoken lines for the picture puzzle, using the browser's own voice.
const PREFERRED = [
  'samantha', 'google uk english female', 'google us english', 'microsoft zira', 'karen',
  'serena', 'victoria', 'tessa', 'moira', 'fiona', 'ava', 'allison', 'susan', 'female',
];

let muted = false;
let cached = null;

function list() {
  try {
    return window.speechSynthesis.getVoices() || [];
  } catch (e) {
    return [];
  }
}

function pick() {
  if (cached) return cached;
  const voices = list();
  if (!voices.length) return null;
  const english = voices.filter((v) => /^en/i.test(v.lang));
  cached = english.find((v) => PREFERRED.some((p) => v.name.toLowerCase().includes(p))) || english[0] || voices[0];
  return cached;
}

try {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      cached = null;
    });
  }
} catch (e) {
  /* voices not ready yet */
}

const ready = () => !muted && typeof window !== 'undefined' && !!window.speechSynthesis;

function utterance(text) {
  const line = new SpeechSynthesisUtterance(text);
  const v = pick();
  if (v) line.voice = v;
  line.rate = 0.94;
  line.pitch = 1.25;
  line.volume = 0.95;
  return line;
}

const voice = {
  speak(text) {
    if (!ready() || !text) return;
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance(text));
    } catch (e) {
      /* speech unavailable */
    }
  },
  // One sentence at a time, so long stories are never cut short.
  speakLines(lines) {
    if (!ready() || !lines || !lines.length) return;
    try {
      window.speechSynthesis.cancel();
      let i = 0;
      const next = () => {
        if (!ready() || i >= lines.length) return;
        const line = utterance(lines[i++]);
        line.onend = next;
        line.onerror = next;
        window.speechSynthesis.speak(line);
      };
      next();
    } catch (e) {
      /* speech unavailable */
    }
  },
  stop() {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) {
      /* speech unavailable */
    }
  },
  setMuted(next) {
    muted = !!next;
    if (muted) voice.stop();
    return muted;
  },
  isMuted: () => muted,
};

export default voice;