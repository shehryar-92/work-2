function rgbDistanceSquared(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

function averageColor(bucket) {
  let sr = 0, sg = 0, sb = 0;
  for (const [r, g, b] of bucket) {
    sr += r; sg += g; sb += b;
  }
  const n = bucket.length;
  return [Math.round(sr / n), Math.round(sg / n), Math.round(sb / n)];
}

// Finds the RGB channel (0=r, 1=g, 2=b) with the widest spread in a bucket,
// which is the axis median-cut splits on.
function widestChannel(bucket) {
  const min = [255, 255, 255];
  const max = [0, 0, 0];
  for (const [r, g, b] of bucket) {
    if (r < min[0]) min[0] = r; if (r > max[0]) max[0] = r;
    if (g < min[1]) min[1] = g; if (g > max[1]) max[1] = g;
    if (b < min[2]) min[2] = b; if (b > max[2]) max[2] = b;
  }
  const ranges = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  let channel = 0;
  if (ranges[1] > ranges[channel]) channel = 1;
  if (ranges[2] > ranges[channel]) channel = 2;
  return { channel, range: ranges[channel] };
}

function pickBucketToSplit(buckets) {
  let bestIndex = -1;
  let bestRange = -1;
  for (let i = 0; i < buckets.length; i++) {
    if (buckets[i].length <= 1) continue;
    const { range } = widestChannel(buckets[i]);
    if (range === 0) continue;
    if (range > bestRange) {
      bestRange = range;
      bestIndex = i;
    }
  }
  return bestIndex;
}

// Median-cut quantization: repeatedly splits the bucket with the widest
// color range in half until we have `colorCount` buckets, then averages
// each one into a palette color. Stops early if pixels can't be split
// further (e.g. an image with fewer distinct colors than requested).
function medianCutPalette(pixels, colorCount) {
  colorCount = Math.max(1, Math.floor(colorCount));
  if (pixels.length === 0) return [];

  const buckets = [pixels.slice()];
  while (buckets.length < colorCount) {
    const index = pickBucketToSplit(buckets);
    if (index === -1) break;

    const bucket = buckets[index];
    const { channel } = widestChannel(bucket);
    bucket.sort((a, b) => a[channel] - b[channel]);

    const mid = Math.floor(bucket.length / 2);
    buckets.splice(index, 1, bucket.slice(0, mid), bucket.slice(mid));
  }

  return buckets.map(averageColor);
}

function nearestColorIndex(color, palette) {
  let bestIndex = 0;
  let bestDist = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const dist = rgbDistanceSquared(color, palette[i]);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function quantizePixels(pixels, palette) {
  return pixels.map((p) => palette[nearestColorIndex(p, palette)]);
}

const pixelArt = {
  medianCutPalette,
  nearestColorIndex,
  quantizePixels,
  rgbDistanceSquared,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = pixelArt;
} else {
  window.pixelArt = pixelArt;
}

