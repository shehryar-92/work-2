# Pixel Art Converter

Turns a regular photo into blocky, low-color pixel art, right in the browser. Drop in an image, drag a couple sliders, download the result.

## How it works

Two things happen to an image to make it "pixel art": it gets **downsampled** (fewer, bigger pixels) and **color-quantized** (fewer colors total). This app does both:

1. The image is drawn onto a tiny offscreen canvas (say, 64 pixels across). Letting the canvas do this scaling gets you a reasonable box-filter average for free, no need to write that by hand.
2. The colors in that tiny image are reduced using **median-cut quantization**: it repeatedly finds the group of pixels with the widest color range and splits it in half, until you're left with as many groups as the color count you asked for. Each group is averaged down to one color, and that becomes the palette.
3. Every pixel gets remapped to its nearest color in that palette.
4. The result is scaled back up with pixel smoothing turned off, so you get hard, crisp blocks instead of a blurry resize.

The quantization logic (`pixelart.js`) is plain JavaScript working on arrays of RGB values — no canvas or DOM involved — so it's testable on its own with Node's test runner.

## Files

- `pixelart.js` — median-cut palette generation and color quantization (pure logic)
- `pixelart.test.js` — tests for the above
- `app.js` — file loading, canvas downsampling/upscaling, wiring up the controls
- `index.html` / `style.css` — the page and its styling, light/dark toggle included

## Controls

- **Detail** — how many pixel blocks wide the output is. Lower means chunkier.
- **Colors** — size of the palette median-cut generates. Lower means more posterized.

## Running it

No build step. Just open `index.html` in a browser.

To run the logic tests:

```
node --test
```

## Notes

- Everything happens client-side. The image never leaves your machine.
- If your source image doesn't have many distinct colors to begin with, the palette may end up smaller than what you asked for — median-cut stops splitting once there's nothing left to split.

