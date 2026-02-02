export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Allgemeinwissen
  {
    id: 'aw1',
    question: 'Welches ist das größte Organ des menschlichen Körpers?',
    options: ['Leber', 'Gehirn', 'Haut', 'Herz'],
    correctIndex: 2,
    category: 'Allgemeinwissen'
  },
  {
    id: 'aw2',
    question: 'Wie viele Planeten hat unser Sonnensystem?',
    options: ['7', '8', '9', '10'],
    correctIndex: 1,
    category: 'Allgemeinwissen'
  },
  {
    id: 'aw3',
    question: 'Welches chemische Element hat das Symbol "Au"?',
    options: ['Silber', 'Aluminium', 'Gold', 'Kupfer'],
    correctIndex: 2,
    category: 'Allgemeinwissen'
  },
  {
    id: 'aw4',
    question: 'Wie viele Kontinente gibt es auf der Erde?',
    options: ['5', '6', '7', '8'],
    correctIndex: 2,
    category: 'Allgemeinwissen'
  },
  {
    id: 'aw5',
    question: 'Welches Tier kann am längsten ohne Wasser überleben?',
    options: ['Elefant', 'Kamel', 'Kängururatte', 'Schildkröte'],
    correctIndex: 2,
    category: 'Allgemeinwissen'
  },
  {
    id: 'aw6',
    question: 'Was ist die Hauptstadt von Australien?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
    correctIndex: 2,
    category: 'Allgemeinwissen'
  },
  {
    id: 'aw7',
    question: 'Welcher Planet ist der Sonne am nächsten?',
    options: ['Venus', 'Merkur', 'Mars', 'Erde'],
    correctIndex: 1,
    category: 'Allgemeinwissen'
  },
  {
    id: 'aw8',
    question: 'Wie viele Zähne hat ein erwachsener Mensch normalerweise?',
    options: ['28', '30', '32', '34'],
    correctIndex: 2,
    category: 'Allgemeinwissen'
  },

  // Geographie
  {
    id: 'geo1',
    question: 'Welcher ist der längste Fluss der Welt?',
    options: ['Amazonas', 'Nil', 'Jangtse', 'Mississippi'],
    correctIndex: 1,
    category: 'Geographie'
  },
  {
    id: 'geo2',
    question: 'In welchem Land liegt die Sahara größtenteils?',
    options: ['Ägypten', 'Algerien', 'Marokko', 'Libyen'],
    correctIndex: 1,
    category: 'Geographie'
  },
  {
    id: 'geo3',
    question: 'Welches ist das kleinste Land der Welt?',
    options: ['Monaco', 'San Marino', 'Vatikanstadt', 'Liechtenstein'],
    correctIndex: 2,
    category: 'Geographie'
  },
  {
    id: 'geo4',
    question: 'Welcher Ozean ist der größte?',
    options: ['Atlantik', 'Indischer Ozean', 'Pazifik', 'Arktischer Ozean'],
    correctIndex: 2,
    category: 'Geographie'
  },
  {
    id: 'geo5',
    question: 'Welches Land hat die meisten Einwohner?',
    options: ['USA', 'Indien', 'China', 'Indonesien'],
    correctIndex: 2,
    category: 'Geographie'
  },
  {
    id: 'geo6',
    question: 'Welche Stadt wird "Die ewige Stadt" genannt?',
    options: ['Athen', 'Rom', 'Jerusalem', 'Kairo'],
    correctIndex: 1,
    category: 'Geographie'
  },
  {
    id: 'geo7',
    question: 'Welches ist das höchste Gebirge der Welt?',
    options: ['Anden', 'Rocky Mountains', 'Alpen', 'Himalaya'],
    correctIndex: 3,
    category: 'Geographie'
  },
  {
    id: 'geo8',
    question: 'An welchem Fluss liegt Paris?',
    options: ['Rhein', 'Seine', 'Loire', 'Themse'],
    correctIndex: 1,
    category: 'Geographie'
  },

  // Geschichte
  {
    id: 'his1',
    question: 'In welchem Jahr fiel die Berliner Mauer?',
    options: ['1987', '1988', '1989', '1990'],
    correctIndex: 2,
    category: 'Geschichte'
  },
  {
    id: 'his2',
    question: 'Wer war der erste Mensch auf dem Mond?',
    options: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'Michael Collins'],
    correctIndex: 1,
    category: 'Geschichte'
  },
  {
    id: 'his3',
    question: 'In welchem Jahr begann der Zweite Weltkrieg?',
    options: ['1937', '1938', '1939', '1940'],
    correctIndex: 2,
    category: 'Geschichte'
  },
  {
    id: 'his4',
    question: 'Wer malte die Mona Lisa?',
    options: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Botticelli'],
    correctIndex: 2,
    category: 'Geschichte'
  },
  {
    id: 'his5',
    question: 'Welches antike Weltwunder steht noch heute?',
    options: ['Koloss von Rhodos', 'Pyramiden von Gizeh', 'Leuchtturm von Alexandria', 'Hängende Gärten'],
    correctIndex: 1,
    category: 'Geschichte'
  },
  {
    id: 'his6',
    question: 'Wer entdeckte Amerika im Jahr 1492?',
    options: ['Amerigo Vespucci', 'Christoph Kolumbus', 'Ferdinand Magellan', 'Marco Polo'],
    correctIndex: 1,
    category: 'Geschichte'
  },
  {
    id: 'his7',
    question: 'Welcher römische Kaiser ließ das Kolosseum bauen?',
    options: ['Nero', 'Augustus', 'Vespasian', 'Trajan'],
    correctIndex: 2,
    category: 'Geschichte'
  },
  {
    id: 'his8',
    question: 'In welchem Jahr wurde die EU gegründet?',
    options: ['1989', '1992', '1993', '1995'],
    correctIndex: 2,
    category: 'Geschichte'
  },

  // Sport
  {
    id: 'sp1',
    question: 'Wie viele Spieler hat eine Fußballmannschaft auf dem Feld?',
    options: ['9', '10', '11', '12'],
    correctIndex: 2,
    category: 'Sport'
  },
  {
    id: 'sp2',
    question: 'Welches Land hat die meisten Fußball-WM-Titel gewonnen?',
    options: ['Deutschland', 'Argentinien', 'Brasilien', 'Italien'],
    correctIndex: 2,
    category: 'Sport'
  },
  {
    id: 'sp3',
    question: 'Wie lange dauert ein Basketballspiel in der NBA (Spielzeit)?',
    options: ['40 Minuten', '48 Minuten', '60 Minuten', '90 Minuten'],
    correctIndex: 1,
    category: 'Sport'
  },
  {
    id: 'sp4',
    question: 'In welcher Stadt fanden die ersten modernen Olympischen Spiele statt?',
    options: ['Paris', 'London', 'Athen', 'Rom'],
    correctIndex: 2,
    category: 'Sport'
  },
  {
    id: 'sp5',
    question: 'Welcher Tennisspieler hat die meisten Grand-Slam-Titel?',
    options: ['Roger Federer', 'Rafael Nadal', 'Novak Djokovic', 'Pete Sampras'],
    correctIndex: 2,
    category: 'Sport'
  },
  {
    id: 'sp6',
    question: 'Wie viele Ringe hat das olympische Symbol?',
    options: ['4', '5', '6', '7'],
    correctIndex: 1,
    category: 'Sport'
  },
  {
    id: 'sp7',
    question: 'Welches Land gewann die Fußball-WM 2014?',
    options: ['Brasilien', 'Argentinien', 'Deutschland', 'Niederlande'],
    correctIndex: 2,
    category: 'Sport'
  },
  {
    id: 'sp8',
    question: 'Wie schwer ist eine Bowlingkugel maximal?',
    options: ['12 Pfund', '14 Pfund', '16 Pfund', '18 Pfund'],
    correctIndex: 2,
    category: 'Sport'
  },

  // Unterhaltung
  {
    id: 'unt1',
    question: 'Wer spielte Jack in "Titanic"?',
    options: ['Brad Pitt', 'Leonardo DiCaprio', 'Johnny Depp', 'Tom Cruise'],
    correctIndex: 1,
    category: 'Unterhaltung'
  },
  {
    id: 'unt2',
    question: 'Welche Band sang "Bohemian Rhapsody"?',
    options: ['The Beatles', 'Led Zeppelin', 'Queen', 'Pink Floyd'],
    correctIndex: 2,
    category: 'Unterhaltung'
  },
  {
    id: 'unt3',
    question: 'In welchem Film sagt man "Möge die Macht mit dir sein"?',
    options: ['Star Trek', 'Star Wars', 'Herr der Ringe', 'Matrix'],
    correctIndex: 1,
    category: 'Unterhaltung'
  },
  {
    id: 'unt4',
    question: 'Wie heißt der Zauberer in "Herr der Ringe"?',
    options: ['Saruman', 'Dumbledore', 'Gandalf', 'Merlin'],
    correctIndex: 2,
    category: 'Unterhaltung'
  },
  {
    id: 'unt5',
    question: 'Welche Serie hat den Titelsong "Friends will be Friends"?',
    options: ['How I Met Your Mother', 'Friends', 'The Big Bang Theory', 'Seinfeld'],
    correctIndex: 1,
    category: 'Unterhaltung'
  },
  {
    id: 'unt6',
    question: 'Wer ist der Sänger von "Shape of You"?',
    options: ['Justin Bieber', 'Ed Sheeran', 'Bruno Mars', 'The Weeknd'],
    correctIndex: 1,
    category: 'Unterhaltung'
  },
  {
    id: 'unt7',
    question: 'Welcher Superheld kommt von Krypton?',
    options: ['Batman', 'Spider-Man', 'Superman', 'Iron Man'],
    correctIndex: 2,
    category: 'Unterhaltung'
  },
  {
    id: 'unt8',
    question: 'Wie heißt der Clownfisch in "Findet Nemo"?',
    options: ['Nemo', 'Marlin', 'Dorie', 'Gill'],
    correctIndex: 0,
    category: 'Unterhaltung'
  },

  // Wissenschaft
  {
    id: 'wis1',
    question: 'Was ist H2O?',
    options: ['Sauerstoff', 'Wasser', 'Wasserstoff', 'Kohlendioxid'],
    correctIndex: 1,
    category: 'Wissenschaft'
  },
  {
    id: 'wis2',
    question: 'Wie viele Knochen hat der menschliche Körper?',
    options: ['186', '206', '226', '246'],
    correctIndex: 1,
    category: 'Wissenschaft'
  },
  {
    id: 'wis3',
    question: 'Was misst ein Barometer?',
    options: ['Temperatur', 'Luftfeuchtigkeit', 'Luftdruck', 'Windgeschwindigkeit'],
    correctIndex: 2,
    category: 'Wissenschaft'
  },
  {
    id: 'wis4',
    question: 'Welches Gas atmen Pflanzen hauptsächlich ein?',
    options: ['Sauerstoff', 'Stickstoff', 'Kohlendioxid', 'Wasserstoff'],
    correctIndex: 2,
    category: 'Wissenschaft'
  },
  {
    id: 'wis5',
    question: 'Wie schnell ist das Licht (ungefähr)?',
    options: ['100.000 km/s', '200.000 km/s', '300.000 km/s', '400.000 km/s'],
    correctIndex: 2,
    category: 'Wissenschaft'
  },
  {
    id: 'wis6',
    question: 'Wer entwickelte die Relativitätstheorie?',
    options: ['Isaac Newton', 'Albert Einstein', 'Stephen Hawking', 'Nikola Tesla'],
    correctIndex: 1,
    category: 'Wissenschaft'
  },
  {
    id: 'wis7',
    question: 'Welches ist das härteste natürliche Material?',
    options: ['Stahl', 'Titan', 'Diamant', 'Graphen'],
    correctIndex: 2,
    category: 'Wissenschaft'
  },
  {
    id: 'wis8',
    question: 'Wie viele Chromosomen hat ein Mensch?',
    options: ['23', '46', '48', '52'],
    correctIndex: 1,
    category: 'Wissenschaft'
  }
];

/**
 * Get all available quiz categories
 */
export function getQuizCategories(): string[] {
  const categories = new Set(QUIZ_QUESTIONS.map(q => q.category));
  return Array.from(categories);
}

/**
 * Get shuffled quiz questions, optionally filtered by category
 * @param count Number of questions to return
 * @param category Optional category filter (empty = all categories)
 */
export function getQuizQuestions(count: number, category?: string): QuizQuestion[] {
  let questions = [...QUIZ_QUESTIONS];

  // Filter by category if specified
  if (category && category !== '') {
    questions = questions.filter(q => q.category === category);
  }

  // Shuffle questions
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  // Return requested count
  return questions.slice(0, Math.min(count, questions.length));
}

/**
 * Get total number of questions available
 */
export function getQuizQuestionCount(category?: string): number {
  if (category && category !== '') {
    return QUIZ_QUESTIONS.filter(q => q.category === category).length;
  }
  return QUIZ_QUESTIONS.length;
}
