import { Component, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';
import { generateUUID } from '../../utils/uuid';

interface Player {
  id: string;
  name: string;
  strikes: number;
  isOut: boolean;
}

type GamePhase = 'setup' | 'playing' | 'eliminated' | 'winner';

@Component({
  selector: 'app-woerterkette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './woerterkette.component.html',
  styleUrl: './woerterkette.component.scss'
})
export class WoerterketteComponent implements OnDestroy {
  // Game state
  phase = signal<GamePhase>('setup');
  players = signal<Player[]>([]);
  currentPlayerIndex = signal<number>(0);
  currentWord = signal<string>('');
  previousWord = signal<string>('');
  usedWords = signal<Set<string>>(new Set());
  requiredLetter = signal<string>('');

  // Settings
  turnTime = signal<number>(10);
  maxStrikes = signal<number>(3);
  private readonly MAX_PLAYERS = 8;

  // Timer
  timeLeft = signal<number>(10);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Input
  newPlayerName = '';
  wordInput = '';

  // UI state
  lastEliminatedPlayer = signal<Player | null>(null);
  errorMessage = signal<string>('');

  // Computed
  canStartGame = computed(() => this.players().length >= 2);
  canAddPlayer = computed(() => this.players().length < this.MAX_PLAYERS);
  currentPlayer = computed(() => {
    const activePlayers = this.players().filter(p => !p.isOut);
    const idx = this.currentPlayerIndex() % activePlayers.length;
    return activePlayers[idx];
  });
  activePlayers = computed(() => this.players().filter(p => !p.isOut));
  winner = computed(() => {
    const active = this.activePlayers();
    return active.length === 1 ? active[0] : null;
  });
  usedWordsPreview = computed(() => Array.from(this.usedWords()).slice(0, 10));
  usedWordsCount = computed(() => this.usedWords().size);
  hasMoreWords = computed(() => this.usedWords().size > 10);
  extraWordsCount = computed(() => this.usedWords().size - 10);

  constructor(
    private router: Router,
    private gameState: GameStateService
  ) {
    this.loadSettings();
  }

  private loadSettings(): void {
    const settings = this.gameState.getWoerterketteSettings();
    if (settings.players.length > 0) {
      this.players.set(settings.players.map(p => ({ ...p, strikes: 0, isOut: false })));
    }
    if (settings.turnTime) {
      this.turnTime.set(settings.turnTime);
      this.timeLeft.set(settings.turnTime);
    }
  }

  private saveSettings(): void {
    this.gameState.saveWoerterketteSettings({
      players: this.players().map(p => ({ id: p.id, name: p.name })),
      turnTime: this.turnTime()
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // Player management
  addPlayer(): void {
    if (this.newPlayerName.trim() && this.canAddPlayer()) {
      const player: Player = {
        id: generateUUID(),
        name: this.newPlayerName.trim(),
        strikes: 0,
        isOut: false
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
    this.currentPlayerIndex.set(0);
    this.previousWord.set('');
    this.requiredLetter.set('');
    this.usedWords.set(new Set());
    this.players.update(p => p.map(player => ({ ...player, strikes: 0, isOut: false })));
    this.shufflePlayers();
    this.phase.set('playing');
    this.startTimer();
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

  private startTimer(): void {
    this.timeLeft.set(this.turnTime());
    this.timerInterval = setInterval(() => {
      this.timeLeft.update(t => t - 1);
      if (this.timeLeft() <= 0) {
        this.handleTimeout();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private resetTimer(): void {
    this.stopTimer();
    this.startTimer();
  }

  submitWord(): void {
    const word = this.wordInput.trim().toLowerCase();
    this.errorMessage.set('');

    if (!word) {
      this.errorMessage.set('Bitte gib ein Wort ein!');
      return;
    }

    // Check if word was already used
    if (this.usedWords().has(word)) {
      this.errorMessage.set('Dieses Wort wurde bereits benutzt!');
      return;
    }

    // Check if word starts with required letter (if there is one)
    if (this.requiredLetter() && !word.startsWith(this.requiredLetter().toLowerCase())) {
      this.errorMessage.set(`Das Wort muss mit "${this.requiredLetter().toUpperCase()}" beginnen!`);
      return;
    }

    // Word is valid
    this.usedWords.update(w => {
      const newSet = new Set(w);
      newSet.add(word);
      return newSet;
    });

    this.previousWord.set(word);
    this.requiredLetter.set(word.charAt(word.length - 1));
    this.wordInput = '';
    this.nextPlayer();
  }

  private handleTimeout(): void {
    this.giveStrike();
  }

  skipTurn(): void {
    this.giveStrike();
  }

  private giveStrike(): void {
    this.stopTimer();
    this.errorMessage.set('');

    const current = this.currentPlayer();
    if (!current) return;

    // Find the actual player in the array and update strikes
    this.players.update(p => {
      return p.map(player => {
        if (player.id === current.id) {
          const newStrikes = player.strikes + 1;
          const isOut = newStrikes >= this.maxStrikes();
          if (isOut) {
            this.lastEliminatedPlayer.set({ ...player, strikes: newStrikes, isOut: true });
          }
          return { ...player, strikes: newStrikes, isOut };
        }
        return player;
      });
    });

    // Check if player was eliminated
    const updatedPlayer = this.players().find(p => p.id === current.id);
    if (updatedPlayer?.isOut) {
      // Check if game is over
      if (this.activePlayers().length <= 1) {
        this.phase.set('winner');
      } else {
        this.phase.set('eliminated');
      }
    } else {
      this.nextPlayer();
    }
  }

  continueAfterElimination(): void {
    this.lastEliminatedPlayer.set(null);
    this.phase.set('playing');
    // Don't increment index since the eliminated player is no longer in active list
    this.currentPlayerIndex.set(this.currentPlayerIndex() % this.activePlayers().length);
    this.startTimer();
  }

  private nextPlayer(): void {
    this.stopTimer();
    const activeCount = this.activePlayers().length;
    if (activeCount <= 1) {
      this.phase.set('winner');
      return;
    }
    this.currentPlayerIndex.update(i => (i + 1) % activeCount);
    this.startTimer();
  }

  // Navigation
  playAgain(): void {
    this.stopTimer();
    this.phase.set('setup');
    this.players.update(p => p.map(player => ({ ...player, strikes: 0, isOut: false })));
    this.previousWord.set('');
    this.requiredLetter.set('');
    this.usedWords.set(new Set());
    this.currentPlayerIndex.set(0);
    this.wordInput = '';
    this.errorMessage.set('');
  }

  newGame(): void {
    this.stopTimer();
    this.previousWord.set('');
    this.requiredLetter.set('');
    this.usedWords.set(new Set());
    this.currentPlayerIndex.set(0);
    this.wordInput = '';
    this.errorMessage.set('');
    this.players.update(p => p.map(player => ({ ...player, strikes: 0, isOut: false })));
    this.shufflePlayers();
    this.phase.set('playing');
    this.startTimer();
  }

  goHome(): void {
    this.stopTimer();
    this.router.navigate(['/']);
  }

  getStrikeDisplay(strikes: number): string {
    return '❌'.repeat(strikes) + '⚪'.repeat(this.maxStrikes() - strikes);
  }
}
