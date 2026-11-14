const W = 1152;
const H = 768;
const FONT = '"Trebuchet MS", Verdana, sans-serif';
const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", sans-serif';
const TEMPLATE_SRC = new URL("./certificate-template.jpeg", import.meta.url).href;

const templateImage = new Image();
let templateReady = false;
let templateLoadError = null;
const templateLoaded = new Promise((resolve) => {
  templateImage.onload = () => {
    templateReady = true;
    resolve();
  };
  templateImage.onerror = () => {
    templateLoadError = new Error(`Certificate template could not be loaded: ${TEMPLATE_SRC}`);
    resolve();
  };
});
templateImage.src = TEMPLATE_SRC;

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fillRound(ctx, x, y, w, h, r, color) {
  roundedRect(ctx, x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawText(ctx, value, x, y, size, color, weight = "bold", maxWidth) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.fillText(String(value ?? ""), x, y, maxWidth);
  ctx.restore();
}

function drawFittedText(ctx, value, x, y, maxWidth, startSize, color, minSize = 10) {
  let size = startSize;
  ctx.save();
  ctx.font = `bold ${size}px ${FONT}`;
  while (ctx.measureText(String(value)).width > maxWidth && size > minSize) {
    size--;
    ctx.font = `bold ${size}px ${FONT}`;
  }
  ctx.restore();
  drawText(ctx, value, x, y, size, color, "bold", maxWidth);
}

function drawDynamicFields(ctx, data) {
  const navy = "#142b68";
  const blue = "#31518c";
  const name = String(data.name || "Space Explorer");

  fillRound(ctx, 420, 418, 460, 58, 24, "#fff8ef");
  drawFittedText(ctx, name, 650, 447, 425, 46, navy, 26);

  ctx.save();
  ctx.beginPath();
  ctx.arc(344, 558, 24, 0, Math.PI * 2);
  ctx.fillStyle = "#fff5e8";
  ctx.fill();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `32px ${EMOJI_FONT}`;
  ctx.fillText(data.badge?.emoji || "🚀", 344, 558);
  ctx.restore();

  const badgeTitle = data.badge?.title || data.planet || "Space Explorer";
  drawFittedText(ctx, badgeTitle, 392, 590, 120, 14, blue, 10);
  drawFittedText(ctx, data.score ?? 0, 532, 590, 92, 20, blue, 14);
  drawFittedText(ctx, `${data.correct ?? 0} / ${data.total ?? 0}`, 696, 590, 104, 17, blue, 12);

  const seconds = Math.max(0, Number(data.seconds) || 0);
  const time = `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  drawFittedText(ctx, time, 844, 590, 88, 18, blue, 12);
  drawFittedText(ctx, data.date || new Date().toLocaleDateString(), 994, 590, 108, 15, blue, 10);
}

function renderCertificate(ctx, data) {
  ctx.drawImage(templateImage, 0, 0, W, H);
  drawDynamicFields(ctx, data);
}

export function drawCertificate(data = {}) {
  if (!templateReady) {
    throw templateLoadError || new Error("Certificate template is still loading.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context is not supported.");
  }

  renderCertificate(ctx, data);
  return canvas;
}

export async function createCertificateCanvas(data = {}) {
  await templateLoaded;
  if (!templateReady) {
    throw templateLoadError || new Error("Certificate template is unavailable.");
  }
  return drawCertificate(data);
}

export async function downloadCertificate(data = {}) {
  try {
    const canvas = await createCertificateCanvas(data);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");

    const safePlanet = String(data.planet || "Space")
      .replace(/[^a-z0-9-_]/gi, "-");
    link.download = `ATHAR-${safePlanet}-Certificate.png`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  } catch (error) {
    console.error("Certificate download failed:", error);
    alert("Sorry! The certificate could not be downloaded. Please try again.");
    return false;
  }
}