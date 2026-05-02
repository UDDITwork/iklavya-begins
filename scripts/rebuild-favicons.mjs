import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const SRC = 'C:/Users/Uddit/Downloads/favicon_io/android-chrome-512x512.png'
const PUBLIC = 'c:/Users/Uddit/Downloads/08_IKLAVYA_Training-Certs-Project/eklavya/iklavya-begins/public'
const APP = 'c:/Users/Uddit/Downloads/08_IKLAVYA_Training-Certs-Project/eklavya/iklavya-begins/src/app'

const trimmed = await sharp(SRC).trim({ threshold: 10 }).toBuffer()
const meta = await sharp(trimmed).metadata()
console.log(`After trim: ${meta.width}x${meta.height}`)

const archerHeight = Math.round(meta.height * 0.62)
const archerOnly = await sharp(trimmed)
  .extract({ left: 0, top: 0, width: meta.width, height: archerHeight })
  .toBuffer()

const am = await sharp(archerOnly).metadata()
const side = Math.max(am.width, am.height)
const padX = Math.round((side - am.width) / 2)
const padY = Math.round((side - am.height) / 2)

const square = await sharp(archerOnly)
  .extend({
    top: padY,
    bottom: side - am.height - padY,
    left: padX,
    right: side - am.width - padX,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .toBuffer()

const sizes = [
  { name: 'favicon-16x16.png', size: 16, dir: PUBLIC },
  { name: 'favicon-32x32.png', size: 32, dir: PUBLIC },
  { name: 'icon-192.png', size: 192, dir: PUBLIC },
  { name: 'icon-512.png', size: 512, dir: PUBLIC },
  { name: 'apple-touch-icon.png', size: 180, dir: PUBLIC },
]

for (const { name, size, dir } of sizes) {
  await sharp(square).resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toFile(join(dir, name))
  console.log(`  ${name} (${size}x${size})`)
}

const ico16 = await sharp(square).resize(16, 16).png().toBuffer()
const ico32 = await sharp(square).resize(32, 32).png().toBuffer()
const ico48 = await sharp(square).resize(48, 48).png().toBuffer()
const icoBuf = await pngToIco([ico16, ico32, ico48])
await writeFile(join(PUBLIC, 'favicon.ico'), icoBuf)
await writeFile(join(APP, 'favicon.ico'), icoBuf)
console.log(`  favicon.ico (multi-size 16/32/48)`)

console.log('\nDone.')
