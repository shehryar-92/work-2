const fileInput = document.getElementById("file-input");
const detailRange = document.getElementById("detail-range");
const colorsRange = document.getElementById("colors-range");
const detailValue = document.getElementById("detail-value");
const colorsValue = document.getElementById("colors-value");
const outputCanvas = document.getElementById("output-canvas");
const downloadBtn = document.getElementById("download-btn");
const hint = document.getElementById("hint");
const themeSwitch = document.getElementById("theme-switch");

const outputCtx = outputCanvas.getContext("2d");
const workCanvas = document.createElement("canvas");
const workCtx = workCanvas.getContext("2d");

let currentImage = null;
const MAX_DISPLAY = 480;

function applyTheme(isDark) {
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("pixelart-theme", isDark ? "dark" : "light");
}

const savedTheme = localStorage.getItem("pixelart-theme");
const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
const startDark = savedTheme ? savedTheme === "dark" : prefersDark;
themeSwitch.checked = startDark;
applyTheme(startDark);
themeSwitch.addEventListener("change", () => applyTheme(themeSwitch.checked));

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      downloadBtn.disabled = false;
      hint.textContent = `${img.naturalWidth} x ${img.naturalHeight} source image loaded.`;
      render();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

detailRange.addEventListener("input", () => {
  detailValue.textContent = detailRange.value;
  render();
});

colorsRange.addEventListener("input", () => {
  colorsValue.textContent = colorsRange.value;
  render();
});

function render() {
  if (!currentImage) return;

  const blocksAcross = Number(detailRange.value);
  const aspect = currentImage.naturalWidth / currentImage.naturalHeight;
  const blocksDown = Math.max(1, Math.round(blocksAcross / aspect));

  workCanvas.width = blocksAcross;
  workCanvas.height = blocksDown;
  workCtx.imageSmoothingEnabled = true;
  workCtx.clearRect(0, 0, blocksAcross, blocksDown);
  workCtx.drawImage(currentImage, 0, 0, blocksAcross, blocksDown);

  const imageData = workCtx.getImageData(0, 0, blocksAcross, blocksDown);
  const data = imageData.data;

  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  const colorCount = Number(colorsRange.value);
  const palette = pixelArt.medianCutPalette(pixels, colorCount);
  const quantized = pixelArt.quantizePixels(pixels, palette);

  for (let i = 0; i < quantized.length; i++) {
    const offset = i * 4;
    data[offset] = quantized[i][0];
    data[offset + 1] = quantized[i][1];
    data[offset + 2] = quantized[i][2];
  }
  workCtx.putImageData(imageData, 0, 0);

  const scale = Math.max(1, Math.floor(MAX_DISPLAY / Math.max(blocksAcross, blocksDown)));
  outputCanvas.width = blocksAcross * scale;
  outputCanvas.height = blocksDown * scale;
  outputCtx.imageSmoothingEnabled = false;
  outputCtx.drawImage(workCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
}

downloadBtn.addEventListener("click", () => {
  outputCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pixel-art.png";
    link.click();
    URL.revokeObjectURL(url);
  }, "image/png");
});

