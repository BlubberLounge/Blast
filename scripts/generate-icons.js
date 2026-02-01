const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/icons/logo.svg');
const iconsDir = path.join(__dirname, '../public/icons');
const publicDir = path.join(__dirname, '../public');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate regular icons
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Generate maskable icons (with padding for safe zone)
  for (const size of [192, 512]) {
    const padding = Math.floor(size * 0.1);
    const innerSize = size - (padding * 2);

    await sharp(svgBuffer)
      .resize(innerSize, innerSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 10, g: 10, b: 26, alpha: 1 } // #0a0a1a
      })
      .png()
      .toFile(path.join(iconsDir, `icon-maskable-${size}x${size}.png`));
    console.log(`Generated icon-maskable-${size}x${size}.png`);
  }

  // Generate favicon (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Generated favicon.png');

  // Generate favicon.ico (multi-size)
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon-48.png'));

  // Generate Open Graph image (1200x630)
  const ogSvgPath = path.join(iconsDir, 'og-image.svg');
  if (fs.existsSync(ogSvgPath)) {
    const ogSvgBuffer = fs.readFileSync(ogSvgPath);
    await sharp(ogSvgBuffer)
      .resize(1200, 630)
      .png()
      .toFile(path.join(iconsDir, 'og-image.png'));
    console.log('Generated og-image.png (1200x630)');

    // Twitter card image
    await sharp(ogSvgBuffer)
      .resize(1200, 600)
      .png()
      .toFile(path.join(iconsDir, 'twitter-image.png'));
    console.log('Generated twitter-image.png (1200x600)');
  }

  console.log('\nDone! Icons generated successfully.');
}

generateIcons().catch(console.error);
