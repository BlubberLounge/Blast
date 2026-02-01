import { Component, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';

interface Player {
  id: string;
  name: string;
  score: number;
}

type GamePhase = 'setup' | 'ready' | 'speaking' | 'guessing' | 'result' | 'scores';

// Word categories for lip reading
const WORDS: Record<string, string[]> = {
  'Tiere': [
    'Elefant', 'Giraffe', 'Schmetterling', 'Krokodil', 'Pinguin',
    'Flamingo', 'Nashorn', 'Delfin', 'Papagei', 'Schildkröte',
    'Löwe', 'Tiger', 'Zebra', 'Affe', 'Bär', 'Hund', 'Katze',
    'Pferd', 'Kuh', 'Schwein', 'Huhn', 'Ente', 'Gans', 'Schaf'
  ],
  'Essen': [
    'Spaghetti', 'Schokolade', 'Hamburger', 'Pizza', 'Pommes',
    'Wassermelone', 'Erdbeere', 'Banane', 'Kartoffel', 'Brokkoli',
    'Käsekuchen', 'Bratwurst', 'Schnitzel', 'Salat', 'Suppe',
    'Brot', 'Butter', 'Käse', 'Milch', 'Ei', 'Apfel', 'Orange'
  ],
  'Berufe': [
    'Feuerwehrmann', 'Astronaut', 'Zahnarzt', 'Polizist', 'Lehrer',
    'Bäcker', 'Pilot', 'Arzt', 'Krankenschwester', 'Koch',
    'Mechaniker', 'Elektriker', 'Friseur', 'Kellner', 'Verkäufer',
    'Maler', 'Musiker', 'Schauspieler', 'Fotograf', 'Journalist'
  ],
  'Aktivitäten': [
    'Schwimmen', 'Tanzen', 'Kochen', 'Schlafen', 'Lachen',
    'Singen', 'Springen', 'Laufen', 'Radfahren', 'Skifahren',
    'Lesen', 'Schreiben', 'Malen', 'Fotografieren', 'Telefonieren',
    'Putzen', 'Waschen', 'Bügeln', 'Staubsaugen', 'Einkaufen'
  ],
  'Gegenstände': [
    'Regenschirm', 'Kühlschrank', 'Waschmaschine', 'Fernseher', 'Computer',
    'Staubsauger', 'Kaffeemaschine', 'Bügeleisen', 'Zahnbürste', 'Handtuch',
    'Schlüssel', 'Brille', 'Uhr', 'Handy', 'Kopfhörer',
    'Lampe', 'Stuhl', 'Tisch', 'Bett', 'Schrank', 'Spiegel'
  ],
  'Filme & Serien': [
    'Titanic', 'Avatar', 'Frozen', 'Batman', 'Superman',
    'Harry Potter', 'Spider-Man', 'Star Wars', 'Shrek', 'Minions',
    'Breaking Bad', 'Friends', 'Simpsons', 'Game of Thrones', 'Stranger Things'
  ],
  'Zufällig': []
};

@Component({
  selector: 'app-lippenlesen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lippenlesen.component.html',
  styleUrl: './lippenlesen.component.scss'
})
export class LippenlesenComponent implements OnDestroy {
  // Game state
  phase = signal<GamePhase>('setup');
  players = signal<Player[]>([]);
  currentPlayerIndex = signal<number>(0);
  currentWord = signal<string>('');
  roundNumber = signal<number>(1);
  totalRounds = signal<number>(3);

  // Settings
  selectedCategory = signal<string>('Zufällig');
  roundTime = signal<number>(30);

  // Timer
  timeLeft = signal<number>(30);
  timerPaused = signal<boolean>(false);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Input
  newPlayerName = '';

  // Categories
  categories = Object.keys(WORDS);

  // Computed
  canStartGame = computed(() => this.players().length >= 2);
  currentPlayer = computed(() => this.players()[this.currentPlayerIndex()]);
  isLastRound = computed(() => this.roundNumber() >= this.totalRounds() * this.players().length);
  sortedPlayers = computed(() => [...this.players()].sort((a, b) => b.score - a.score));
  currentRoundDisplay = computed(() => {
    const playerCount = this.players().length;
    return playerCount > 0 ? Math.ceil(this.roundNumber() / playerCount) : 1;
  });

  constructor(
    private router: Router,
    private gameState: GameStateService
  ) {
    this.loadSettings();
  }

  private loadSettings(): void {
    const settings = this.gameState.getLippenlesenSettings();
    if (settings.players.length > 0) {
      this.players.set(settings.players.map(p => ({ ...p, score: 0 })));
    }
    if (settings.roundTime) {
      this.roundTime.set(settings.roundTime);
      this.timeLeft.set(settings.roundTime);
    }
    if (settings.selectedCategory) {
      this.selectedCategory.set(settings.selectedCategory);
    }
  }

  private saveSettings(): void {
    this.gameState.saveLippenlesenSettings({
      players: this.players().map(p => ({ id: p.id, name: p.name })),
      roundTime: this.roundTime(),
      selectedCategory: this.selectedCategory()
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // Player management
  addPlayer(): void {
    if (this.newPlayerName.trim()) {
      const player: Player = {
        id: crypto.randomUUID(),
        name: this.newPlayerName.trim(),
        score: 0
      };
      this.players.update(p => [...p, player]);
      this.newPlayerName = '';
      this.saveSettings();
    }
  }

  removePlayer(id: string): void {
    this.players.update(p => p.filter(player => player.id !== id));
    this.saveSettings();
  }

  // Game flow
  startGame(): void {
    if (!this.canStartGame()) return;

    this.saveSettings();
    this.roundNumber.set(1);
    this.currentPlayerIndex.set(0);
    this.players.update(p => p.map(player => ({ ...player, score: 0 })));
    this.shufflePlayers();
    this.phase.set('ready');
  }

  private shufflePlayers(): void {
    this.players.update(p => {
      const shuffled = [...p];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }

  showWord(): void {
    this.currentWord.set(this.getRandomWord());
    this.phase.set('speaking');
  }

  private getRandomWord(): string {
    const category = this.selectedCategory();
    let wordList: string[];

    if (category === 'Zufällig') {
      // Get words from all categories
      const allCategories = Object.keys(WORDS).filter(c => c !== 'Zufällig');
      const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
      wordList = WORDS[randomCategory];
    } else {
      wordList = WORDS[category];
    }

    return wordList[Math.floor(Math.random() * wordList.length)];
  }

  startGuessing(): void {
    this.phase.set('guessing');
    this.startTimer();
  }

  private startTimer(): void {
    this.timeLeft.set(this.roundTime());
    this.timerPaused.set(false);
    this.timerInterval = setInterval(() => {
      if (!this.timerPaused()) {
        this.timeLeft.update(t => t - 1);
        if (this.timeLeft() <= 0) {
          this.endRound(false);
        }
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  togglePauseTimer(): void {
    this.timerPaused.update(p => !p);
  }

  // Someone guessed correctly
  correctGuess(): void {
    this.stopTimer();
    // Award points to speaker (1 point for successful communication)
    const currentIdx = this.currentPlayerIndex();
    this.players.update(p => {
      const updated = [...p];
      updated[currentIdx] = { ...updated[currentIdx], score: updated[currentIdx].score + 1 };
      return updated;
    });
    this.endRound(true);
  }

  // Time ran out or skip
  skipWord(): void {
    this.stopTimer();
    this.endRound(false);
  }

  private endRound(wasCorrect: boolean): void {
    this.stopTimer();
    this.phase.set('result');
  }

  nextRound(): void {
    const nextIndex = (this.currentPlayerIndex() + 1) % this.players().length;
    this.currentPlayerIndex.set(nextIndex);

    // If we've gone through all players, increment round
    if (nextIndex === 0) {
      this.roundNumber.update(r => r + 1);
    }

    // Check if game is over
    if (this.roundNumber() > this.totalRounds()) {
      this.phase.set('scores');
    } else {
      this.phase.set('ready');
    }
  }

  // Navigation
  playAgain(): void {
    this.stopTimer();
    this.phase.set('setup');
    this.players.update(p => p.map(player => ({ ...player, score: 0 })));
    this.roundNumber.set(1);
    this.currentPlayerIndex.set(0);
  }

  newGame(): void {
    this.stopTimer();
    this.roundNumber.set(1);
    this.currentPlayerIndex.set(0);
    this.players.update(p => p.map(player => ({ ...player, score: 0 })));
    this.shufflePlayers();
    this.phase.set('ready');
  }

  goHome(): void {
    this.stopTimer();
    this.router.navigate(['/']);
  }

  formatTime(seconds: number): string {
    return seconds.toString();
  }
}
