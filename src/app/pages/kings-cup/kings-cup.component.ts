import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';
import { generateUUID } from '../../utils/uuid';

type GamePhase = 'setup' | 'playing' | 'king-drink' | 'result';
type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: CardSuit;
  value: CardValue;
  id: string;
}

interface Player {
  id: string;
  name: string;
}

interface CardRule {
  title: string;
  description: string;
  icon: string;
}

const CARD_RULES: Record<CardValue, CardRule> = {
  'A': {
    title: 'Wasserfall',
    description: 'Alle trinken! Der Spieler links von dir darf erst aufhören, wenn du aufhörst. Dann der nächste usw.',
    icon: '🌊'
  },
  '2': {
    title: 'Du',
    description: 'Wähle eine Person, die trinken muss!',
    icon: '👉'
  },
  '3': {
    title: 'Ich',
    description: 'Du trinkst!',
    icon: '🙋'
  },
  '4': {
    title: 'Boden',
    description: 'Alle müssen den Boden berühren! Der Letzte trinkt.',
    icon: '⬇️'
  },
  '5': {
    title: 'Männer',
    description: 'Alle Männer trinken!',
    icon: '👨'
  },
  '6': {
    title: 'Frauen',
    description: 'Alle Frauen trinken!',
    icon: '👩'
  },
  '7': {
    title: 'Himmel',
    description: 'Alle zeigen in die Luft! Der Letzte trinkt.',
    icon: '☝️'
  },
  '8': {
    title: 'Trinkpartner',
    description: 'Wähle einen Trinkpartner! Ihr trinkt ab jetzt immer zusammen.',
    icon: '🤝'
  },
  '9': {
    title: 'Reim',
    description: 'Sag ein Wort! Reihum muss jeder ein Wort sagen, das sich darauf reimt. Wer keins findet, trinkt!',
    icon: '📝'
  },
  '10': {
    title: 'Kategorie',
    description: 'Nenne eine Kategorie (z.B. Automarken)! Reihum muss jeder etwas nennen. Wer nichts weiß, trinkt!',
    icon: '📋'
  },
  'J': {
    title: 'Regel',
    description: 'Erfinde eine neue Regel! Wer sie bricht, trinkt. Die Regel gilt bis zum nächsten Buben.',
    icon: '📜'
  },
  'Q': {
    title: 'Fragemeister',
    description: 'Du bist der Fragemeister! Wer auf deine Fragen antwortet, trinkt. Gilt bis zur nächsten Dame.',
    icon: '❓'
  },
  'K': {
    title: 'König',
    description: 'Schütte etwas von deinem Getränk in den Kings Cup! Wer den 4. König zieht, trinkt den gesamten Kings Cup!',
    icon: '👑'
  }
};

const SUIT_SYMBOLS: Record<CardSuit, string> = {
  'hearts': '♥',
  'diamonds': '♦',
  'clubs': '♣',
  'spades': '♠'
};

const SUIT_COLORS: Record<CardSuit, string> = {
  'hearts': 'text-red-500',
  'diamonds': 'text-red-500',
  'clubs': 'text-gray-900',
  'spades': 'text-gray-900'
};

@Component({
  selector: 'app-kings-cup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kings-cup.component.html',
  styleUrl: './kings-cup.component.scss'
})
export class KingsCupComponent implements OnInit {
  // Game state
  phase = signal<GamePhase>('setup');
  players = signal<Player[]>([]);
  deck = signal<Card[]>([]);
  currentCard = signal<Card | null>(null);
  currentPlayerIndex = signal<number>(0);
  kingsDrawn = signal<number>(0);
  drawnCards = signal<Card[]>([]);

  // UI state
  newPlayerName = signal<string>('');
  isCardFlipping = signal<boolean>(false);
  showRule = signal<boolean>(false);

  // Computed
  canStartGame = computed(() => this.players().length >= 2);
  currentPlayer = computed((): Player | undefined => this.players()[this.currentPlayerIndex()]);
  remainingCards = computed(() => this.deck().length);
  currentRule = computed(() => {
    const card = this.currentCard();
    return card ? CARD_RULES[card.value] : null;
  });

  constructor(
    private router: Router,
    private gameState: GameStateService
  ) {
    // Auto-save settings in setup phase
    effect(() => {
      const players = this.players();
      if (this.phase() === 'setup') {
        this.gameState.saveKingsCupSettings({ players });
      }
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    const settings = this.gameState.getKingsCupSettings();
    if (settings?.players?.length) {
      this.players.set(settings.players);
    }
  }

  // Player management
  addPlayer(): void {
    const name = this.newPlayerName().trim();
    if (name && this.players().length < 12) {
      this.players.update(players => [...players, { id: generateUUID(), name }]);
      this.newPlayerName.set('');
    }
  }

  removePlayer(id: string): void {
    this.players.update(players => players.filter(p => p.id !== id));
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.addPlayer();
    }
  }

  // Game logic
  startGame(): void {
    if (!this.canStartGame()) return;

    this.deck.set(this.createDeck());
    this.shuffleDeck();
    this.kingsDrawn.set(0);
    this.drawnCards.set([]);
    this.currentPlayerIndex.set(0);
    this.currentCard.set(null);
    this.showRule.set(false);
    this.phase.set('playing');
  }

  private createDeck(): Card[] {
    const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values: CardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: Card[] = [];

    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value, id: generateUUID() });
      }
    }

    return deck;
  }

  private shuffleDeck(): void {
    this.deck.update(deck => {
      const shuffled = [...deck];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }

  drawCard(): void {
    if (this.isCardFlipping() || this.deck().length === 0) return;

    this.isCardFlipping.set(true);
    this.showRule.set(false);

    const card = this.deck()[0];
    this.deck.update(deck => deck.slice(1));
    this.drawnCards.update(cards => [...cards, card]);

    setTimeout(() => {
      this.currentCard.set(card);
      this.isCardFlipping.set(false);

      // Check for King
      if (card.value === 'K') {
        this.kingsDrawn.update(k => k + 1);
        if (this.kingsDrawn() === 4) {
          this.phase.set('king-drink');
        }
      }

      setTimeout(() => {
        this.showRule.set(true);
      }, 300);
    }, 400);
  }

  nextPlayer(): void {
    // Check if deck is empty
    if (this.deck().length === 0) {
      this.phase.set('result');
      return;
    }

    this.currentPlayerIndex.update(i => (i + 1) % this.players().length);
    this.currentCard.set(null);
    this.showRule.set(false);
  }

  continueAfterKingsDrink(): void {
    this.phase.set('result');
  }

  // Utilities
  getSuitSymbol(suit: CardSuit): string {
    return SUIT_SYMBOLS[suit];
  }

  getSuitColor(suit: CardSuit): string {
    return SUIT_COLORS[suit];
  }

  getCardDisplayValue(value: CardValue): string {
    return value;
  }

  // Navigation
  goHome(): void {
    this.router.navigate(['/']);
  }

  resetGame(): void {
    this.phase.set('setup');
    this.currentCard.set(null);
    this.deck.set([]);
    this.drawnCards.set([]);
    this.kingsDrawn.set(0);
    this.currentPlayerIndex.set(0);
    this.showRule.set(false);
  }

  playAgain(): void {
    this.startGame();
  }
}
