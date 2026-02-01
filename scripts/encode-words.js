/**
 * Word Encoder Script
 * Run with: node scripts/encode-words.js
 * This generates encoded word data from the JSON file
 */

const fs = require('fs');
const path = require('path');

const KEY = 'Bl4stP4rtyG4m3s2024!';

// XOR cipher
function xorCipher(text, key) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

// Encode to base64
function encode(text) {
  const xored = xorCipher(text, KEY);
  return Buffer.from(xored, 'binary').toString('base64');
}

// Read words from JSON
const jsonPath = path.join(__dirname, '../src/assets/data/words.json');
const wordsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Generate encoded array
console.log('// Generated encoded words - do not edit manually');
console.log('// Source: src/assets/data/words.json');
console.log('// Run: node scripts/encode-words.js to regenerate');
console.log('export const ENCODED_DATA: string[] = [');
wordsData.words.forEach(item => {
  const combined = `${item.word}|${item.hint}`;
  console.log(`  '${encode(combined)}',`);
});
console.log('];');

console.log('\n// Total words:', wordsData.words.length);
