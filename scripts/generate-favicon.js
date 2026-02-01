const pngToIco = require('png-to-ico').default;
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/favicon.png');
const outputPath = path.join(__dirname, '../public/favicon.ico');

async function generateFavicon() {
  try {
    const buf = await pngToIco(inputPath);
    fs.writeFileSync(outputPath, buf);
    console.log('favicon.ico created successfully!');
  } catch (err) {
    console.error('Error creating favicon.ico:', err);
  }
}

generateFavicon();
