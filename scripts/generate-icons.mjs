import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Table for CRC32 calculation
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c >>> 0;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  
  const crcBuf = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcBuf);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generateHudIconPng(size) {
  const width = size;
  const height = size;

  // Raw RGBA image data with scanline filter byte (0) per row
  const rowStride = width * 4 + 1;
  const rawData = Buffer.alloc(rowStride * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.46;
  const innerRadius = width * 0.36;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 10, g = 14, b = 28, a = 255; // Background dark cyberpunk slate

      // Rounded container / outer border ring
      if (dist > radius) {
        a = 0; // transparent corners
      } else if (dist >= innerRadius && dist <= radius) {
        // Neon cyan/magenta ring
        const angle = Math.atan2(dy, dx);
        if (angle > 0) {
          r = 0; g = 243; b = 255; a = 255; // #00f3ff Cyan
        } else {
          r = 255; g = 0; b = 85; a = 255; // #ff0055 Magenta
        }
      } else {
        // Inner HUD Graphic: Hexagon / HUD Crosshair
        const inCrossX = Math.abs(dx) < Math.max(1, size * 0.08) && Math.abs(dy) < size * 0.25;
        const inCrossY = Math.abs(dy) < Math.max(1, size * 0.08) && Math.abs(dx) < size * 0.25;
        const inCenterDot = dist < Math.max(1.5, size * 0.12);

        if (inCenterDot) {
          r = 0; g = 243; b = 255; a = 255; // Cyan core
        } else if (inCrossX || inCrossY) {
          r = 0; g = 200; b = 255; a = 230;
        } else {
          // Subtle tech grid pattern
          r = 13; g = 17; b = 23; a = 240;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Non-interlaced
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idatChunk = createChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

export function generateAllIcons(outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sizes = [16, 32, 48, 128];
  for (const s of sizes) {
    const pngBuf = generateHudIconPng(s);
    const filePath = path.join(outputDir, `icon${s}.png`);
    fs.writeFileSync(filePath, pngBuf);
    console.log(`Generated ${filePath} (${s}x${s})`);
  }
}

// If run directly
if (process.argv[1]?.includes('generate-icons.mjs')) {
  const targetDir = path.resolve('public/icons');
  generateAllIcons(targetDir);
}
