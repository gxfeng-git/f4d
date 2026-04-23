import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createPng(size, filename, options = {}) {
  const width = size;
  const height = size;
  const background = options.background ?? [2, 6, 23, 255];
  const inner = options.inner ?? [29, 78, 216, 255];
  const highlight = options.highlight ?? [250, 204, 21, 255];
  const radius = Math.round(size * 0.22);
  const innerRadius = Math.round(size * 0.17);
  const padding = Math.round(size * 0.16);
  const lineHeight = Math.max(6, Math.round(size * 0.045));

  const raw = Buffer.alloc((width * 4 + 1) * height);

  const inRoundedRect = (x, y, start, end, r) => {
    const left = start;
    const right = end;
    const top = start;
    const bottom = end;
    const cx = x < left + r ? left + r : x > right - r ? right - r : x;
    const cy = y < top + r ? top + r : y > bottom - r ? bottom - r : y;
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= r * r;
  };

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x += 1) {
      let pixel = background;

      if (inRoundedRect(x, y, 0, size - 1, radius)) {
        pixel = background;
      }

      if (inRoundedRect(x, y, padding, size - padding - 1, innerRadius)) {
        pixel = inner;
      }

      const lineXs = [padding * 1.4, padding * 1.4, padding * 1.4];
      const lineWidths = [size * 0.44, size * 0.44, size * 0.26];
      const lineYs = [size * 0.28, size * 0.48, size * 0.68];

      for (let index = 0; index < lineYs.length; index += 1) {
        const startX = Math.round(lineXs[index]);
        const endX = Math.round(startX + lineWidths[index]);
        const startY = Math.round(lineYs[index]);
        const endY = Math.round(startY + lineHeight);
        if (x >= startX && x <= endX && y >= startY && y <= endY) {
          pixel = index === 0 ? [226, 232, 240, 255] : index === 1 ? [191, 219, 254, 255] : [147, 197, 253, 255];
        }
      }

      const circleCenter = Math.round(size * 0.7);
      const circleRadius = Math.round(size * 0.08);
      const circleDx = x - circleCenter;
      const circleDy = y - circleCenter;
      if (circleDx * circleDx + circleDy * circleDy <= circleRadius * circleRadius) {
        pixel = highlight;
      }

      const offset = rowStart + 1 + x * 4;
      raw[offset] = pixel[0];
      raw[offset + 1] = pixel[1];
      raw[offset + 2] = pixel[2];
      raw[offset + 3] = pixel[3];
    }
  }

  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const png = Buffer.concat([
    pngSignature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ]);

  writeFileSync(resolve(process.cwd(), 'public', filename), png);
}

createPng(192, 'pwa-192x192.png');
createPng(512, 'pwa-512x512.png');
createPng(512, 'maskable-icon-512x512.png', {
  background: [2, 6, 23, 255],
  inner: [37, 99, 235, 255]
});
createPng(180, 'apple-touch-icon.png');
