import { getPlanet, exploredCount, exploredIds, subscribe, markCertificateEarned } from "./game/progress.js";
import { exploredObjects, badgeFor, MIN_TO_PLAY } from "./game/challengeData.js";
import { CLUES } from "./game/challenges.js";
import { OBJECTS } from "./game/objects.js";
import { STORY, PALETTES } from "./game/storyStages.js";
import { createCertificateCanvas, downloadCertificate } from "./game/certificate.js";
import sfx from "./game/sfx.js";

const shuffle = (items) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));
const say = (text) => {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.88;
  utterance.pitch = 1.12;
  window.speechSynthesis.speak(utterance);
};

let active = false;
let current = null;
let startedAt = 0;
let elapsedTimer = 0;
let score = 0;
let attempts = 0;
let correctCount = 0;
let mistakes = 0;
let modeStep = 0;
let matchItems = [];
let storyObject = null;
let storyCards = [];
let storySlots = [];
let explorerName = "";
let selectedCard = null;
let selectedClue = null;
let dragState = null;
let muted = sfx.isMuted();

const launcher = document.createElement("div");
launcher.className = "kc-launchers";
launcher.id = "athar-challenge-launchers";
launcher.hidden = true;
launcher.innerHTML = `
  <div class="kc-exploration-counter" role="status" aria-live="polite">
    <span>Devices explored</span><b id="athar-found-count">0 / 0</b>
  </div>
  <button type="button" class="kc-launch" id="athar-quiz-open" disabled>
    <span>🚀 Planet mini-games</span><small id="athar-challenge-status">Explore 3 devices to unlock</small>
  </button>
`;
document.body.append(launcher);

const overlay = document.createElement("div");
overlay.id = "athar-vanilla-challenge";
overlay.className = "kc-back";
overlay.hidden = true;
document.body.append(overlay);

function eligibleObjects(planet) {
  return exploredObjects(planet, exploredIds(planet))
    .filter(object => CLUES[object.id]?.clue && STORY[object.id]?.length >= 3);
}
function syncLauncher() {
  const planet = getPlanet();
  launcher.hidden = !planet || active;
  const found = planet ? exploredCount(planet) : 0;
  const total = planet ? (OBJECTS[planet] || []).length : 0;
  const unlocked = found >= MIN_TO_PLAY;
  launcher.querySelector("#athar-found-count").textContent = `${found} / ${total}`;
  launcher.querySelector("#athar-quiz-open").disabled = !unlocked;
  launcher.querySelector("#athar-challenge-status").textContent = unlocked
    ? "Play both challenges"
    : `Explore ${MIN_TO_PLAY - found} more device${MIN_TO_PLAY - found === 1 ? "" : "s"} to unlock`;
}
subscribe(syncLauncher);
syncLauncher();

launcher.querySelector("#athar-quiz-open").addEventListener("click", startChallenge);
window.addEventListener("athar:challenge", startChallenge);
window.addEventListener("athar:story", startChallenge);

function startChallenge() {
  const planet = getPlanet();
  if (!planet || active) return;
  const found = eligibleObjects(planet);
  active = true;
  launcher.hidden = true;
  current = { planet, objects: found };
  score = 0;
  attempts = 0;
  correctCount = 0;
  mistakes = 0;
  modeStep = 0;
  startedAt = Date.now();
  window.ATHAR_CHALLENGE_OPEN = true;

  if (found.length < MIN_TO_PLAY) {
    renderNeedMore(planet, found.length);
    return;
  }

  renderNamePrompt();
}

function renderNamePrompt() {
  shell("Name your explorer", "Your name will be printed on the certificate after both mini-games.", `
    <form class="kc-name-gate" id="kc-explorer-form">
      <label class="kc-name-label" for="kc-explorer-name">Explorer name</label>
      <input id="kc-explorer-name" class="kc-name-input" maxlength="32" autocomplete="name" placeholder="Space Explorer" required />
      <p>Complete both challenges to earn your planet certificate.</p>
      <button class="kc-btn" type="submit">Start the challenges 🚀</button>
    </form>
  `, 0);
  const form = overlay.querySelector("#kc-explorer-form");
  const input = overlay.querySelector("#kc-explorer-name");
  input.focus();
  input.addEventListener("input", () => input.setCustomValidity(""));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    explorerName = input.value.trim();
    if (!explorerName) {
      input.setCustomValidity("Please enter your explorer name.");
      input.reportValidity();
      return;
    }
    startedAt = Date.now();
    matchItems = shuffle(current.objects).slice(0, Math.min(4, current.objects.length)).map(object => ({
      id: object.id,
      name: object.name,
      emoji: CLUES[object.id].emoji,
      clue: CLUES[object.id].clue,
      done: false,
      tries: 0
    }));
    renderMatch();
  });
}

function closeChallenge() {
  active = false;
  current = null;
  explorerName = "";
  selectedCard = selectedClue = dragState = null;
  clearInterval(elapsedTimer);
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  overlay.classList.remove("kc-certificate-back");
  overlay.hidden = true;
  overlay.innerHTML = "";
  window.ATHAR_CHALLENGE_OPEN = false;
  syncLauncher();
}
function goBackToSpace() {
  const back = document.querySelector("#abort");
  closeChallenge();
  if (back && getComputedStyle(back).display !== "none") back.click();
}
function elapsedSeconds() {
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}
function statsHTML() {
  return `<div class="kc-stats">
    <span>⭐ <b>${score}</b> pts</span>
    <span>✓ <b>${correctCount}</b> correct</span>
    <span>⏱ <b id="kc-clock">${formatTime(elapsedSeconds())}</b></span>
  </div>`;
}
function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
function progressHTML(percent) {
  return `<div class="kc-bar" aria-label="Mission progress"><i style="width:${percent}%"></i></div>`;
}
function shell(title, subtitle, body, percent = 0) {
  overlay.hidden = false;
  overlay.innerHTML = `
    <section class="kc-panel kc-game-panel" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}">
      <button class="kc-close" type="button" aria-label="Close challenge">✕</button>
      <div class="kc-top">
        <span class="kc-planet">${planetEmoji(current?.planet)} ${escapeHTML(current?.planet || "")}</span>
        <div class="kc-heading"><h1 class="kc-title">${title}</h1><span class="kc-kicker">ATHAR MISSION CONTROL</span></div>
        ${statsHTML()}
      </div>
      ${progressHTML(percent)}
      <p class="kc-sub">${subtitle}</p>
      ${body}
      <div class="kc-foot"><span>🪐 You discovered their stories. Now prove what you remember, Space Explorer!</span><button type="button" class="kc-sound ${muted ? "off" : ""}" id="kc-sound" aria-label="Toggle sound">${muted ? "🔇" : "🔊"}</button></div>
    </section>`;
  overlay.querySelector(".kc-close").addEventListener("click", closeChallenge);
  overlay.querySelector("#kc-sound").addEventListener("click", () => {
    muted = sfx.toggle();
    overlay.querySelector("#kc-sound").textContent = muted ? "🔇" : "🔊";
    overlay.querySelector("#kc-sound").classList.toggle("off", muted);
    if (muted && "speechSynthesis" in window) window.speechSynthesis.cancel();
  });
  clearInterval(elapsedTimer);
  elapsedTimer = setInterval(() => {
    const clock = overlay.querySelector("#kc-clock");
    if (clock) clock.textContent = formatTime(elapsedSeconds());
  }, 1000);
}
function planetEmoji(planet) {
  return ({ Moon: "🌙", Mars: "🔴", Earth: "🌍", Jupiter: "🪐", Saturn: "💫" })[planet] || "🚀";
}
function renderNeedMore(planet, count) {
  shell("Mission briefing", "Your knowledge mission is almost ready!", `
    <div class="kc-empty kc-empty-new">
      <div class="kc-empty-orbit">${planetEmoji(planet)}</div>
      <h2>More discoveries are waiting!</h2>
      <p>You have explored <b>${count}</b> story object(s) on ${escapeHTML(planet)}.</p>
      <p>Explore at least <b>${MIN_TO_PLAY}</b> objects and listen to their stories. Then return here to unlock both challenges.</p>
      <button class="kc-btn" id="kc-keep-exploring">Continue exploring 🚀</button>
    </div>`, 0);
  overlay.querySelector("#kc-keep-exploring").addEventListener("click", closeChallenge);
}
function renderMatch() {
  modeStep = 1;
  selectedClue = null;
  const clueCards = shuffle(matchItems);
  shell("Match My Story", "Drag a story card onto the NASA object it describes. On touchscreens, tap a story card, then tap its match.",  `
    <div class="kc-mode-tag"><span>01</span> MATCH THE DISCOVERY <b>${matchItems.filter(x => x.done).length}/${matchItems.length}</b></div>
    <div class="kc-match-intro">Connect each explorer with the discovery they made.</div>
    <div class="kc-match-board">
      <div class="kc-match-column">
        <h3>NASA EQUIPMENT</h3>
        <div class="kc-equipment-list">
          ${matchItems.map(item => `<button type="button" class="kc-equipment ${item.done ? "matched" : ""}" data-target="${escapeHTML(item.id)}" ${item.done ? "disabled" : ""}>
            <span class="kc-equipment-icon">${item.emoji}</span>
            <span class="kc-equipment-name">${escapeHTML(item.name)}</span>
            <span class="kc-equipment-slot">${item.done ? "✓ Matched" : "Drop story here"}</span>
          </button>`).join("")}
        </div>
      </div>
      <div class="kc-match-column">
        <h3>MISSION STORIES</h3>
        <div class="kc-clue-list">
          ${clueCards.filter(item => !item.done).map(item => `<button type="button" class="kc-clue-card" data-clue="${escapeHTML(item.id)}">
            <span class="kc-clue-grip">⠿</span><span>${escapeHTML(item.clue)}</span>
          </button>`).join("")}
        </div>
      </div>
    </div>
    <p class="kc-feedback" id="kc-match-feedback" aria-live="polite">Choose a story card to begin.</p>
    <div class="kc-action-row"><span class="kc-tip">💡 Wrong match? No problem — try another object.</span></div>
  `, 8);
  wireMatch();
}
function wireMatch() {
  overlay.querySelectorAll("[data-clue]").forEach(card => {
    card.addEventListener("click", () => {
      if (card.classList.contains("used")) return;
      selectedClue = card.dataset.clue;
      overlay.querySelectorAll("[data-clue]").forEach(x => x.classList.toggle("selected", x === card));
      const feedback = overlay.querySelector("#kc-match-feedback");
      if (feedback) feedback.textContent = "Great! Now choose the NASA equipment that matches this story.";
      sfx.grab();
    });
    card.addEventListener("pointerdown", event => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      dragState = { id: card.dataset.clue, pointerId: event.pointerId };
      card.classList.add("dragging");
      try { card.setPointerCapture(event.pointerId); } catch {}
    });
    card.addEventListener("pointerup", event => {
      if (!dragState || dragState.id !== card.dataset.clue) return;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-target]");
      card.classList.remove("dragging");
      if (target) attemptMatch(dragState.id, target.dataset.target);
      else {
        selectedClue = dragState.id;
        card.classList.add("selected");
      }
      dragState = null;
    });
    card.addEventListener("pointercancel", () => { card.classList.remove("dragging"); dragState = null; });
  });
  overlay.querySelectorAll("[data-target]").forEach(target => {
    target.addEventListener("click", () => {
      if (selectedClue) attemptMatch(selectedClue, target.dataset.target);
    });
  });
}
function attemptMatch(clueId, targetId) {
  selectedClue = null;
  const item = matchItems.find(x => x.id === clueId);
  const target = matchItems.find(x => x.id === targetId);
  if (!item || !target || item.done || target.done) return;
  attempts++;
  item.tries++;
  if (clueId === targetId) {
    item.done = true;
    correctCount++;
    score += item.tries === 1 ? 150 : 100;
    sfx.correct();
    const feedback = overlay.querySelector("#kc-match-feedback");
    if (feedback) feedback.textContent = `Excellent! ${item.name} matched its story. +${item.tries === 1 ? 150 : 100} points ⭐`;
    if (matchItems.every(x => x.done)) {
      score += mistakes === 0 ? 100 : 0;
      setTimeout(renderStoryPuzzle, 850);
    } else {
      setTimeout(renderMatch, 750);
    }
  } else {
    mistakes++;
    sfx.wrong();
    selectedClue = null;
    const card = overlay.querySelector(`[data-clue="${CSS.escape(clueId)}"]`);
    const dest = overlay.querySelector(`[data-target="${CSS.escape(targetId)}"]`);
    card?.classList.add("shake");
    dest?.classList.add("shake");
    const feedback = overlay.querySelector("#kc-match-feedback");
    if (feedback) feedback.textContent = "Almost! Think about what this equipment did. Try another match — you can do it!";
    setTimeout(() => { card?.classList.remove("shake", "selected"); dest?.classList.remove("shake"); }, 550);
  }
}
function renderStoryPuzzle() {
  modeStep = 2;
  const found = current.objects.filter(object => STORY[object.id]?.length >= 3);
  storyObject = found[Math.floor(Math.random() * found.length)];
  const palette = PALETTES[current.planet] || PALETTES.Moon;
  const ordered = STORY[storyObject.id].map((stage, index) => ({ ...stage, original: index, id: `${storyObject.id}-stage-${index}` }));
  storyCards = shuffle(ordered);
  storySlots = Array(ordered.length).fill(null);
  selectedCard = null;
  shell("Rebuild My Story", "Put the mission pictures in the order they really happened. Listen to a card if you need a hint.", `
    <div class="kc-mode-tag"><span>02</span> REBUILD THE MISSION <b>VISUAL PUZZLE</b></div>
    <div class="kc-story-heading"><div class="kc-story-object">${CLUES[storyObject.id]?.emoji || "🚀"}</div><div><b>${escapeHTML(storyObject.name)}</b><small>${escapeHTML(storyObject.mission || current.planet)} · ${escapeHTML(current.planet)}</small></div></div>
    <div class="kc-story-layout">
      <div class="kc-story-pool-wrap"><h3>MISSION PICTURE CARDS</h3>
        <div class="kc-story-pool" id="kc-story-pool">
          ${storyCards.map((card, index) => stageCardHTML(card, index, palette)).join("")}
        </div>
      </div>
      <div class="kc-timeline-wrap"><h3>BUILD THE TIMELINE <span>FIRST → LAST</span></h3>
        <div class="kc-visual-timeline" id="kc-story-slots">
          ${storySlots.map((_, index) => `<button type="button" class="kc-visual-slot" data-slot="${index}"><span class="kc-slot-number">${index + 1}</span><span class="kc-slot-placeholder">Drop picture</span></button>`).join("")}
        </div>
      </div>
    </div>
    <p class="kc-feedback" id="kc-story-feedback" aria-live="polite">Drag a picture into its timeline slot, or tap a picture then a slot.</p>
    <div class="kc-action-row"><span class="kc-tip">🎧 Tap the speaker on any picture to hear its story.</span></div>
  `, 55);
  wireStory(palette);
}
function stageCardHTML(card, index, palette) {
  return `<article class="kc-picture-card" data-picture="${index}" tabindex="0" role="button" aria-label="Mission picture ${index + 1}">
    <div class="kc-picture-scene scene-${escapeHTML(card.s)}" style="--scene-a:${palette.sky1};--scene-b:${palette.sky2};--scene-ground:${palette.ground};--scene-accent:${palette.accent}">
      <span class="kc-scene-stars">✦　·　✧　　·</span>
      <span class="kc-scene-planet">${current.planet === "Mars" ? "🔴" : current.planet === "Moon" ? "🌙" : current.planet === "Saturn" ? "🪐" : current.planet === "Jupiter" ? "🪐" : "🌍"}</span>
      <span class="kc-scene-main">${escapeHTML(card.g)}</span>
      <span class="kc-scene-ground"></span>
      <span class="kc-scene-spark">✦</span>
    </div>
    <div class="kc-picture-caption"><b>${escapeHTML(card.t)}</b><small>${escapeHTML(card.d)}</small></div>
    <button type="button" class="kc-card-audio" data-say="${index}" aria-label="Hear picture explanation">🔊</button>
  </article>`;
}
function wireStory(palette) {
  overlay.querySelectorAll("[data-picture]").forEach(card => {
    const choose = () => {
      selectedCard = Number(card.dataset.picture);
      overlay.querySelectorAll("[data-picture]").forEach(x => x.classList.toggle("selected", x === card));
      const feedback = overlay.querySelector("#kc-story-feedback");
      if (feedback) feedback.textContent = "Now choose the timeline position for this picture.";
      sfx.grab();
    };
    card.addEventListener("click", event => {
      if (event.target.closest("[data-say]")) return;
      choose();
    });
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); }
    });
    card.addEventListener("pointerdown", event => {
      if (event.target.closest("[data-say]")) return;
      dragState = { picture: Number(card.dataset.picture), pointerId: event.pointerId };
      card.classList.add("dragging");
      try { card.setPointerCapture(event.pointerId); } catch {}
    });
    card.addEventListener("pointerup", event => {
      if (!dragState || dragState.picture !== Number(card.dataset.picture)) return;
      const slot = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-slot]");
      card.classList.remove("dragging");
      if (slot) attemptStoryPlace(dragState.picture, Number(slot.dataset.slot));
      else choose();
      dragState = null;
    });
    card.addEventListener("pointercancel", () => { card.classList.remove("dragging"); dragState = null; });
  });
  overlay.querySelectorAll("[data-slot]").forEach(slot => slot.addEventListener("click", () => {
    if (selectedCard !== null) attemptStoryPlace(selectedCard, Number(slot.dataset.slot));
  }));
  overlay.querySelectorAll("[data-say]").forEach(button => button.addEventListener("click", event => {
    event.stopPropagation();
    const card = storyCards[Number(button.dataset.say)];
    if (!muted) say(card.v);
  }));
}
function attemptStoryPlace(cardIndex, slotIndex) {
  if (cardIndex == null || slotIndex < 0 || slotIndex >= storySlots.length) return;
  const card = storyCards[cardIndex];
  if (!card || storySlots.includes(cardIndex)) return;
  attempts++;
  const previous = storySlots[slotIndex];
  if (previous !== null) {
    const feedback = overlay.querySelector("#kc-story-feedback");
    if (feedback) feedback.textContent = "That timeline spot is already filled. Choose an empty spot.";
    return;
  }
  if (card.original === slotIndex) {
    storySlots[slotIndex] = cardIndex;
    selectedCard = null;
    correctCount++;
    score += 125;
    sfx.correct();
    refreshStorySlots();
    const feedback = overlay.querySelector("#kc-story-feedback");
    if (feedback) feedback.textContent = `Perfect sequence! ${card.t} belongs here. +125 points ⭐`;
    if (storySlots.every(value => value !== null)) {
      score += mistakes === 0 ? 100 : 0;
      setTimeout(() => {
        if (active && current) renderCompletion();
      }, 650);
    }
  } else {
    mistakes++;
    sfx.wrong();
    const slot = overlay.querySelector(`[data-slot="${slotIndex}"]`);
    slot?.classList.add("bad");
    const feedback = overlay.querySelector("#kc-story-feedback");
    if (feedback) feedback.textContent = "Not quite yet! Think about what happened first, next, and last. Try again.";
    setTimeout(() => slot?.classList.remove("bad"), 550);
  }
  updateStats();
}
function refreshStorySlots() {
  overlay.querySelectorAll("[data-picture]").forEach(card => {
    const index = Number(card.dataset.picture);
    card.hidden = storySlots.includes(index);
    card.classList.remove("selected");
  });
  overlay.querySelectorAll("[data-slot]").forEach(slot => {
    const index = Number(slot.dataset.slot);
    const cardIndex = storySlots[index];
    slot.classList.toggle("filled", cardIndex !== null);
    if (cardIndex === null) {
      slot.innerHTML = `<span class="kc-slot-number">${index + 1}</span><span class="kc-slot-placeholder">Drop picture</span>`;
    } else {
      const card = storyCards[cardIndex];
      slot.innerHTML = `<span class="kc-slot-number">${index + 1}</span><span class="kc-slot-filled">${escapeHTML(card.g)}<b>${escapeHTML(card.t)}</b><small>${escapeHTML(card.d)}</small></span><span class="kc-slot-check">✓</span>`;
    }
  });
}
function updateStats() {
  const points = overlay.querySelector(".kc-stats b");
  if (points) points.textContent = score;
  const correct = overlay.querySelectorAll(".kc-stats b")[1];
  if (correct) correct.textContent = correctCount;
}

async function renderCompletion() {
  if (!active || !current) return;
  clearInterval(elapsedTimer);
  const seconds = elapsedSeconds();
  const planet = current.planet;
  const badge = badgeFor(planet);
  const certificate = {
    name: explorerName,
    planet,
    badge,
    score,
    correct: correctCount,
    total: matchItems.length + storyCards.length,
    seconds,
    date: new Date().toLocaleDateString()
  };
  markCertificateEarned(planet);
  sfx.win();
  overlay.classList.add("kc-certificate-back");
  overlay.hidden = false;
  overlay.innerHTML = `
    <div class="kc-certificate-confetti" aria-hidden="true">
      ${Array.from({ length: 18 }, (_, index) => `<i style="--x:${index * 5.5}%;--delay:${index * 45}ms;--color:hsl(${index * 31},90%,65%)"></i>`).join("")}
    </div>
    <section class="kc-panel kc-certificate-panel" role="dialog" aria-modal="true" aria-label="Your planet certificate">
      <button class="kc-close" type="button" aria-label="Close certificate">✕</button>
      <p class="kc-certificate-congrats">🎉 Certificate unlocked! 🎉</p>
      <div class="kc-certificate-preview" id="kc-certificate-preview" aria-live="polite">Preparing your certificate…</div>
      <p class="kc-certificate-error" id="kc-certificate-error" role="alert" hidden></p>
      <p class="kc-certificate-status" id="kc-certificate-status" aria-live="polite"></p>
      <div class="kc-row kc-certificate-actions">
        <button class="kc-btn" id="kc-download">⬇ Download certificate</button>
        <button class="kc-btn alt" id="kc-continue">Continue exploring</button>
      </div>
    </section>
  `;
  overlay.querySelector(".kc-close").addEventListener("click", closeChallenge);
  overlay.querySelector("#kc-continue").addEventListener("click", goBackToSpace);
  overlay.querySelector("#kc-download").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    const downloaded = await downloadCertificate(certificate);
    button.disabled = false;
    const status = overlay.querySelector("#kc-certificate-status");
    if (downloaded && status) status.textContent = "Your certificate has been downloaded.";
  });
  try {
    const canvas = await createCertificateCanvas(certificate);
    const preview = overlay.querySelector("#kc-certificate-preview");
    if (!active || !preview) return;
    canvas.className = "kc-certificate-image";
    preview.textContent = "";
    preview.append(canvas);
  } catch (error) {
    console.error("Certificate preview failed:", error);
    const errorMessage = overlay.querySelector("#kc-certificate-error");
    if (active && errorMessage) {
      errorMessage.hidden = false;
      errorMessage.textContent = "The certificate preview could not be loaded. You can try downloading it instead.";
      overlay.querySelector("#kc-certificate-preview").textContent = "";
    }
  }
}
