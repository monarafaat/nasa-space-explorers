// Background music for the whole site.
// Put your files inside the audio folder:
// audio/music.mp3
// audio/suck-in.mp3


// ATHAR Background Music + Planet Suction Sound

const MUSIC_SRC = new URL("../audio/music.mp3", import.meta.url);
const SUCK_SRC = new URL("../audio/suck-in.mp3", import.meta.url);
const WELCOME_SRC = new URL("../audio/welcome.mp3", import.meta.url);

const welcomeAudio = new Audio(WELCOME_SRC);
welcomeAudio.loop = false;
welcomeAudio.volume = 1;


const audio = new Audio(MUSIC_SRC);
audio.loop = true;
audio.volume = 0.35;

const suckAudio = new Audio(SUCK_SRC);
suckAudio.loop = false;
suckAudio.volume = 0.8;

let muted = false;

try {
  muted = localStorage.getItem("athar-music-muted") === "1";
} catch (error) {
  console.warn("Music settings unavailable:", error);
}

// Music button
const btn = document.createElement("button");
btn.id = "music-toggle";
btn.type = "button";

const paint = () => {
  btn.textContent = muted ? "🔇 Music" : "🔊 Music";
  btn.setAttribute("aria-pressed", String(!muted));
};

paint();
document.body.appendChild(btn);

// Play background music
function tryPlay() {
  if (muted) return;

  audio.play().catch((error) => {
    console.error("Background music error:", error);
  });
}

// Button control
btn.addEventListener("click", (e) => {
  e.stopPropagation();

  muted = !muted;

  try {
    localStorage.setItem(
      "athar-music-muted",
      muted ? "1" : "0"
    );
  } catch {}

  if (muted) {
    audio.pause();
  } else {
    tryPlay();
  }

  paint();
});

// Browser autoplay permission
const unlock = () => {
  tryPlay();

  ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
    window.removeEventListener(eventName, unlock, true);
  });
};

["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
  window.addEventListener(eventName, unlock, true);
});
export function playWelcomeSound() {
  welcomeAudio.currentTime = 0;

  welcomeAudio.play().catch((error) => {
    console.error("Welcome sound error:", error);
  });
}


// Planet suction sound

// Planet suction sound
export function playSuckSound() {
  // Stop background music
  audio.pause();

  // Play suction sound
  suckAudio.pause();
  suckAudio.currentTime = 0;

  suckAudio.onended = () => {
    // Restore background music
    muted = false;

    try {
      localStorage.setItem("athar-music-muted", "0");
    } catch {}

    paint();

    audio.play().catch((error) => {
      console.error("Background music error:", error);
    });
  };

  suckAudio.play().catch((error) => {
    console.error("Suction sound error:", error);
  });
  
}

