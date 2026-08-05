const test = require("node:test");
const assert = require("node:assert");
const { medianCutPalette, nearestColorIndex, quantizePixels } = require("../pixelart.js");

test("medianCutPalette returns requested color count for varied pixels", () => {
  const pixels = [];
  for (let i = 0; i < 50; i++) {
    pixels.push([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]);
  }
  const palette = medianCutPalette(pixels, 8);
  assert.strictEqual(palette.length, 8);
});

test("medianCutPalette stops early when there's only one distinct color", () => {
  const pixels = Array.from({ length: 20 }, () => [10, 20, 30]);
  const palette = medianCutPalette(pixels, 5);
  assert.strictEqual(palette.length, 1);
  assert.deepStrictEqual(palette[0], [10, 20, 30]);
});

test("medianCutPalette handles empty input", () => {
  assert.deepStrictEqual(medianCutPalette([], 4), []);
});

test("medianCutPalette averages a simple two-color split correctly", () => {
  const pixels = [
    [0, 0, 0], [0, 0, 0],
    [255, 255, 255], [255, 255, 255],
  ];
  const palette = medianCutPalette(pixels, 2);
  assert.strictEqual(palette.length, 2);
  const hasBlack = palette.some((c) => c[0] === 0 && c[1] === 0 && c[2] === 0);
  const hasWhite = palette.some((c) => c[0] === 255 && c[1] === 255 && c[2] === 255);
  assert.ok(hasBlack && hasWhite);
});

test("nearestColorIndex picks the closest palette entry", () => {
  const palette = [[0, 0, 0], [255, 255, 255], [255, 0, 0]];
  assert.strictEqual(nearestColorIndex([10, 10, 10], palette), 0);
  assert.strictEqual(nearestColorIndex([240, 245, 250], palette), 1);
  assert.strictEqual(nearestColorIndex([200, 20, 20], palette), 2);
});

test("quantizePixels maps every pixel to a palette color", () => {
  const palette = [[0, 0, 0], [255, 255, 255]];
  const pixels = [[5, 5, 5], [250, 250, 250], [10, 0, 0]];
  const result = quantizePixels(pixels, palette);
  for (const color of result) {
    const isBlack = color[0] === 0 && color[1] === 0 && color[2] === 0;
    const isWhite = color[0] === 255 && color[1] === 255 && color[2] === 255;
    assert.ok(isBlack || isWhite);
  }
});

