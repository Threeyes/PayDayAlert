import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

const table = new Int32Array(256)
for (let n = 0; n < 256; n += 1) {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  table[n] = c
}

function crc32(buffer) {
  let c = -1
  for (let i = 0; i < buffer.length; i += 1) c = table[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typeBuffer = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
  return Buffer.concat([length, typeBuffer, data, crc])
}

function encodePng(width, height, rgba) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 6
  const stride = width * 4 + 1
  const raw = Buffer.alloc(stride * height)
  for (let y = 0; y < height; y += 1) {
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const clamp01 = (value) => Math.min(1, Math.max(0, value))
const mix = (a, b, t) => a.map((value, index) => value + (b[index] - value) * t)

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const lengthSq = dx * dx + dy * dy
  const t = lengthSq === 0 ? 0 : clamp01(((px - x1) * dx + (py - y1) * dy) / lengthSq)
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

const BACKGROUND = [6, 10, 8]
const MINT = [76, 224, 168]
const GOLD = [242, 199, 119]
const MINT_TOP = [125, 240, 196]
const MINT_BOTTOM = [46, 201, 143]

function createIcon(size, scale) {
  const pixels = Buffer.alloc(size * size * 4)
  const center = size / 2
  const stroke = size * 0.038
  const strokes = [
    [0.32, 0.24, 0.5, 0.5],
    [0.68, 0.24, 0.5, 0.5],
    [0.5, 0.5, 0.5, 0.77],
    [0.35, 0.575, 0.65, 0.575],
    [0.35, 0.675, 0.65, 0.675],
  ].map(([x1, y1, x2, y2]) =>
    [x1, y1, x2, y2].map((value) => center + (value - 0.5) * size * scale),
  )

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = (x + 0.5) / size
      const ny = (y + 0.5) / size

      const glow = Math.pow(clamp01(1 - Math.hypot(nx - 0.5, ny - 0.42) / 0.62), 2.4) * 0.32
      let color = mix(BACKGROUND, MINT, glow)
      const goldGlow = Math.pow(clamp01(1 - Math.hypot(nx - 0.86, ny - 0.94) / 0.46), 2.6) * 0.16
      color = mix(color, GOLD, goldGlow)

      let coverage = 0
      for (const [x1, y1, x2, y2] of strokes) {
        const distance = distanceToSegment(x + 0.5, y + 0.5, x1, y1, x2, y2)
        coverage = Math.max(coverage, clamp01(stroke + 0.5 - distance))
      }
      if (coverage > 0) {
        const gradient = clamp01((ny - 0.2) / 0.6)
        color = mix(color, mix(MINT_TOP, MINT_BOTTOM, gradient), coverage)
      }

      const offset = (y * size + x) * 4
      pixels[offset] = Math.round(color[0])
      pixels[offset + 1] = Math.round(color[1])
      pixels[offset + 2] = Math.round(color[2])
      pixels[offset + 3] = 255
    }
  }

  return encodePng(size, size, pixels)
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', createIcon(192, 1))
writeFileSync('public/icons/icon-512.png', createIcon(512, 1))
writeFileSync('public/icons/icon-maskable.png', createIcon(512, 0.78))
console.log('icons generated')
