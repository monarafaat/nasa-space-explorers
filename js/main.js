
import { MARKUP } from "./game/markup.js";
import { loadThree } from "./game/loadThree.js";
import { startGame } from "./game/spaceExplorers.js";
import { missions, catalogRecords } from "./missions.js";
import "./challenges-vanilla.js";
import { playWelcomeSound } from "./music.js";

document.querySelector("#athar-root").innerHTML = MARKUP;

// Welcome voice
let welcomePlayed = false;

document.addEventListener(
  "pointerdown",
  () => {
    if (welcomePlayed) return;

    welcomePlayed = true;
    playWelcomeSound();
  },
  { once: true }
);

const root = document.body;

const panel = document.createElement("aside");
panel.id = "nasa-library";

panel.innerHTML = `
  <button id="nasa-open" class="nasa-tab" type="button">
    🛰 NASA Mission Library
  </button>

  <section class="nasa-panel" aria-label="NASA mission resources" hidden>
    <header>
      <div>
        <small>OFFICIAL NASA SOURCES</small>
        <h2>Mission Archives</h2>
      </div>
      <button id="nasa-close" aria-label="Close">✕</button>
    </header>

    <p class="nasa-intro">
      Explore real missions and spacecraft records.
      Mission facts are summarized from NASA pages;
      use the source links for full details.
    </p>

    <div class="nasa-grid" id="mission-cards"></div>

    <h3>NSSDCA spacecraft catalog</h3>
    <div id="catalog-links" class="catalog-links"></div>

    <a
      class="nasa-source"
      href="https://nssdc.gsfc.nasa.gov/"
      target="_blank"
      rel="noopener"
    >
      Open NASA Space Science Data Coordinated Archive ↗
    </a>
  </section>
`;

root.append(panel);

const panelEl = panel.querySelector(".nasa-panel");

panel.querySelector("#nasa-open").addEventListener("click", () => {
  panelEl.hidden = false;
});

panel.querySelector("#nasa-close").addEventListener("click", () => {
  panelEl.hidden = true;
});

panel.querySelector("#mission-cards").innerHTML = missions
  .map(m => `
    <article class="mission-card">
      <div class="mission-meta">${m.planet} · ${m.type}</div>
      <h3>${m.name}</h3>
      <p>${m.objective}</p>
      <p class="mission-fact">${m.fact}</p>
      <small>Launch: ${m.launch} · Landing: ${m.landing}</small>
      <a href="${m.url}" target="_blank" rel="noopener">
        NASA mission page ↗
      </a>
    </article>
  `)
  .join("");

panel.querySelector("#catalog-links").innerHTML = catalogRecords
  .map(r => `
    <a href="${r.url}" target="_blank" rel="noopener">
      ${r.name} ↗
    </a>
  `)
  .join("");

// Original game startup
let stopGame = () => {};

loadThree()
  .then(() => {
    stopGame = startGame();
  })
  .catch(err => {
    console.error("ATHAR game could not start:", err);
  });

window.addEventListener("beforeunload", () => stopGame());

