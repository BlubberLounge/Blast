// Encoded word data - obfuscated to prevent easy extraction
// Regenerate with: node scripts/encode-words.js
export interface ImposterWord {
  word: string;
  hint: string;
}

// Decoder key (split to avoid easy detection)
const _k = ['Bl4st', 'P4rty', 'G4m3s', '2024!'].join('');

// XOR decode
function _x(t: string, k: string): string {
  let r = '';
  for (let i = 0; i < t.length; i++) {
    r += String.fromCharCode(t.charCodeAt(i) ^ k.charCodeAt(i % k.length));
  }
  return r;
}

// Decode from base64
function _d(e: string): string {
  try {
    return _x(atob(e), _k);
  } catch {
    return '';
  }
}

// Encoded word data (word|hint format)
const _e: string[] = [
  'EgVOCRUscQEHHCk=',
  'BppaFgYscQEHHCk=',
  'ARlGAQ0nQQAHDTtxHkAWXA==',
  'ERlHGx0scQEHHCk=',
  'ABlGFBEiSDcHCiJa',
  'ERhGEho0SD0GDQ==',
  'EQ9cBhg1SD0GDQ==',
  'ERlEFgY9VQAfDTt7H0c=',
  'BAVAHREjRwEADCNdAk88QEQ=',
  'CR5VHR81WhoVDDRIIkEH',
  'AAVWHx0/QBoREjt7H0c=',
  'EQ9cBB09WRAVHTt7H0c=',
  'GANbDzsiQA==',
  'CQVaHAgfRgY=',
  'BABBFBwxUhcaBQhGGQ==',
  'FQldGxoxVxoAHClIK1YaV0JGVUY=',
  'EQVYBREjQBcGBQFRBFYBRlFV',
  'Cg1YHxsnURcaBQFRBFYBRlFV',
  'DR9AFgY+SDQRECJGGVIU',
  'FA1YFhokXRwHDSZTEXUWW1VAQEAl',
  'CgNXGw41XQYIPDFRA0c=',
  'CQNaCREiQA4xDyJaGQ==',
  'BAlHBx0mVR4IPDFRA0c=',
  'BQlWBgYkRwYVHjtxG1YdRg==',
  'DQdAHBY1RhQRCjNIKEUWXEQ=',
  'CQ1GHREmVR4IPDFRA0c=',
  'Eg1GBw0scQQRFzM=',
  'BBnrERU8WA4nCShGGQ==',
  'EQddFRU4RhcaBRREAkEH',
  'ERlGFRE+SCEEFjVA',
  'FglaHR0jSCEEFjVA',
  'AA1HGBEkVhMYFTtnHVwBRg==',
  'EQ9cBB09WRcaBRREAkEH',
  'AQ1ZAx0+Uw41EjNdG1oH1kQ=',
  'BR5dHxg1Wg41EjNdG1oH1kQ=',
  'Fx5YEgEySDMfDS5CBEeXRg==',
  'EQRbAwQ5WhUIOCxABEUaRtRG',
  'Fg1aCRE+SDMfDS5CBEeXRg==',
  'GA1cHRUiTgYIOyJGGFU=',
  'EgNYGg41XQ42HDVBCw==',
  'BAlBFgYnURoGBQVRH0YV',
  'BB5dABElRg42HDVBCw==',
  'Ax5OBwgSUQABHw==',
  'DglcAREiSDARCzJS',
  'Cg1aFw0sYBcXESldBg==',
  'CwJHBxU3RhMZBQZEHQ==',
  'DAlAFRg5TA41CTc=',
  'FgVfJxs7SDMECQ==',
  'GwNBJwEyUQ41CTc=',
  'ExxbBx02TQ41CTc=',
  'FQRVBwcRRAIIODdE',
  'FgVaFxEiSDMECQ==',
  'Dw9wHBoxWBZTCjt5DEEYVw==',
  'CwdREggdVQAfHA==',
  'AwFVCRs+SD8VCyxR',
  'ERhVARYlVxkHBQpVH1gW',
  'AxxEHxEseRMGEiI=',
  'DAVfFggdVQAfHA==',
  'FglHHxUseRMGEiI=',
  'BABBFA41QRUIPyZcH0kWR1c=',
  'F0F2Ehw+SDQVETVOCEYU',
  'Fg1MGggWVRoGAyJBCg==',
  'BJBcAREiRxEcHC5aEXccWUVfUU82',
  'Fg1ABxs/SDmCCzdRHw==',
  'EgVRARc5WhUIMrFGHVYB',
  'BB5dAAEiSDmCCzdRHw==',
];

// Cache decoded words
let _c: ImposterWord[] | null = null;

function _decode(): ImposterWord[] {
  return _e.map(e => {
    const d = _d(e);
    const [word, hint] = d.split('|');
    return { word: word || '', hint: hint || '' };
  }).filter(w => w.word && w.hint);
}

// Get all imposter words (decoded)
export function getImposterWords(): ImposterWord[] {
  if (!_c) _c = _decode();
  return _c;
}

// Wörter für Stirnraten (verschiedene Kategorien)
export const STIRNRATEN_WORDS: { [category: string]: string[] } = {
  'Promis': [
    'Cristiano Ronaldo', 'Taylor Swift', 'Elon Musk', 'Angela Merkel',
    'Leonardo DiCaprio', 'Beyoncé', 'Dwayne Johnson', 'Kim Kardashian',
    'Ed Sheeran', 'Rihanna', 'Brad Pitt', 'Ariana Grande',
    'Lionel Messi', 'Lady Gaga', 'Justin Bieber', 'Kylie Jenner',
    'Tom Hanks', 'Shakira', 'David Beckham', 'Selena Gomez',
    'Billie Eilish', 'Zendaya', 'Bad Bunny', 'The Weeknd',
    'Adele', 'Drake', 'Post Malone', 'Cardi B'
  ],
  'Filme & Serien': [
    'Harry Potter', 'Titanic', 'Star Wars', 'Breaking Bad',
    'Game of Thrones', 'Avengers', 'Stranger Things', 'The Office',
    'Friends', 'Joker', 'Batman', 'Spider-Man',
    'Squid Game', 'Money Heist', 'The Witcher', 'Frozen',
    'Lion King', 'Shrek', 'Inception', 'Matrix',
    'Wednesday', 'The Last of Us', 'Bridgerton', 'Peaky Blinders',
    'Barbie', 'Oppenheimer', 'Top Gun', 'Avatar'
  ],
  'Tiere': [
    'Elefant', 'Pinguin', 'Krokodil', 'Schmetterling',
    'Delfin', 'Gorilla', 'Flamingo', 'Eichhörnchen',
    'Chamäleon', 'Kolibri', 'Orca', 'Giraffe',
    'Nashorn', 'Koala', 'Känguru', 'Papagei',
    'Schildkröte', 'Hai', 'Pfau', 'Faultier',
    'Erdmännchen', 'Alpaka', 'Qualle', 'Seepferdchen'
  ],
  'Essen & Trinken': [
    'Spaghetti Bolognese', 'Sushi', 'Burger', 'Pommes',
    'Schnitzel', 'Tacos', 'Currywurst', 'Döner Kebab',
    'Tiramisu', 'Cheesecake', 'Bratwurst', 'Lasagne',
    'Chicken Nuggets', 'Hot Dog', 'Croissant', 'Bretzel',
    'Apfelstrudel', 'Käsefondue', 'Ramen', 'Pad Thai',
    'Bubble Tea', 'Avocado Toast', 'Poke Bowl', 'Falafel'
  ],
  'Berufe': [
    'Feuerwehrmann', 'Astronaut', 'Pilot', 'Koch',
    'Arzt', 'Polizist', 'Lehrer', 'Anwalt',
    'Influencer', 'DJ', 'Youtuber', 'Politiker',
    'Fußballspieler', 'Schauspieler', 'Sänger', 'Model',
    'Tierarzt', 'Architekt', 'Programmierer', 'Taxifahrer'
  ],
  'Alltag': [
    'Zähneputzen', 'Duschen', 'Aufwachen', 'Kochen',
    'Einkaufen', 'Autofahren', 'Schlafen', 'Essen',
    'Telefonieren', 'Arbeiten', 'Sport machen', 'Fernsehen',
    'Lesen', 'Musik hören', 'Tanzen', 'Singen',
    'Putzen', 'Wäsche waschen', 'Staubsaugen', 'Bügeln'
  ],
  'Sport': [
    'Fußball', 'Basketball', 'Tennis', 'Schwimmen',
    'Skifahren', 'Snowboarden', 'Surfen', 'Skateboarden',
    'Boxen', 'Yoga', 'Marathon', 'Golf',
    'Volleyball', 'Handball', 'Eishockey', 'Formel 1',
    'Klettern', 'Tanzen', 'Reiten', 'Tauchen'
  ],
  'Länder & Städte': [
    'Paris', 'New York', 'Tokyo', 'Dubai',
    'London', 'Rom', 'Sydney', 'Rio de Janeiro',
    'Las Vegas', 'Barcelona', 'Amsterdam', 'Berlin',
    'Hawaii', 'Malediven', 'Island', 'Ägypten',
    'Thailand', 'Australien', 'Brasilien', 'Japan'
  ],
  'Marken & Produkte': [
    'iPhone', 'Nike', 'McDonald\'s', 'Coca-Cola',
    'Netflix', 'Spotify', 'Tesla', 'IKEA',
    'Amazon', 'Google', 'PlayStation', 'Nintendo',
    'Adidas', 'Starbucks', 'Lego', 'Disney',
    'TikTok', 'Instagram', 'YouTube', 'WhatsApp'
  ],
  'Musik': [
    'Gitarre spielen', 'Schlagzeug', 'Klavier', 'Karaoke',
    'Rap', 'Heavy Metal', 'Klassische Musik', 'Oper',
    'Konzert', 'Festival', 'Chor singen', 'Beatboxen',
    'Autotune', 'Violine', 'Saxophon', 'Trompete'
  ],
  'Gaming': [
    'Minecraft', 'Fortnite', 'FIFA', 'Call of Duty',
    'Mario Kart', 'Pokémon', 'GTA', 'The Sims',
    'Tetris', 'Pac-Man', 'Among Us', 'Roblox',
    'Zelda', 'Super Mario', 'Sonic', 'Candy Crush'
  ],
  'Emotionen': [
    'Verliebt sein', 'Aufgeregt', 'Müde', 'Hungrig',
    'Wütend', 'Traurig', 'Glücklich', 'Überrascht',
    'Gelangweilt', 'Nervös', 'Stolz', 'Eifersüchtig',
    'Peinlich berührt', 'Ängstlich', 'Dankbar', 'Nostalgisch'
  ]
};

// Hilfsfunktion: Zufälliges Wort aus einer Liste
export function getRandomWord(words: string[]): string {
  return words[Math.floor(Math.random() * words.length)];
}

// Hilfsfunktion: Zufälliges Imposter-Wort mit Hinweis
export function getRandomImposterWord(): ImposterWord {
  const words = getImposterWords();
  return words[Math.floor(Math.random() * words.length)];
}

// Hilfsfunktion: Zufälliges Stirnraten-Wort (optional mit Kategorie)
export function getRandomStirnratenWord(category?: string): string {
  if (category && STIRNRATEN_WORDS[category]) {
    return getRandomWord(STIRNRATEN_WORDS[category]);
  }
  // Alle Wörter zusammenfassen
  const allWords = Object.values(STIRNRATEN_WORDS).flat();
  return getRandomWord(allWords);
}

// Alle Kategorien für Stirnraten
export function getStirnratenCategories(): string[] {
  return Object.keys(STIRNRATEN_WORDS);
}
