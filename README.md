# ATHAR — Vanilla HTML, CSS & JavaScript

This package is the browser-only vanilla conversion of the supplied ATHAR project.

## Run it
1. Extract the ZIP.
2. Open the extracted folder in VS Code.
3. Install/use the **Live Server** extension.
4. Right-click `index.html` → **Open with Live Server**.

Do not open with `file://`; JavaScript modules need an HTTP server. The 3D scene loads Three.js from its CDN, so an internet connection is required.

Alternative: from this folder run `python -m http.server 8000`, then visit `http://localhost:8000`.

## Included
- Plain `index.html` entry point.
- Original project CSS and the original Three.js game engine modules converted to browser ES modules.
- Original 3D scene, planet exploration, controls, narration and sound modules retained.
- Vanilla JavaScript challenge launcher, knowledge quiz and story-order puzzle.
- NASA Mission Library with official NASA mission links and NSSDCA catalog records.
- No React, Vite, Base44 SDK, database or backend runtime is required.

## Notes
- The challenge launcher appears after the game sets an active planet. The quiz unlocks after at least three objects have been explored, matching the original game's rule.
- The story puzzle uses the mission story stages already present in the source project. It is tap-to-select and tap-to-place, so it works with mouse, keyboard/touch screens; it does not depend on React.
- NASA summaries are educational short descriptions. The official NASA links are provided on each card for checking the complete mission records.
- The project uses browser speech synthesis / audio where supported. Browser permissions and device audio settings may affect sound.
- This is a standalone vanilla web project; it does not include a backend or user-account persistence.
