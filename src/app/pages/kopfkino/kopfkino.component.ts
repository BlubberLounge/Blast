import { Component, signal, computed, OnDestroy, OnInit, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Player } from '../../models/player.model';
import { getRandomStirnratenWord, getStirnratenCategories } from '../../data/words';
import { GameStateService } from '../../services/game-state.service';
import { generateUUID } from '../../utils/uuid';

type GamePhase = 'setup' | 'ready' | 'playing' | 'result';

@Component({
  selector: 'app-kopfkino',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kopfkino.component.html',
  styleUrl: './kopfkino.component.scss'
})
export class KopfkinoComponent implements OnInit, OnDestroy {
  // Game state
  phase = signal<GamePhase>('setup');
  players = signal<Player[]>([]);
  currentPlayerIndex = signal<number>(0);
  currentWord = signal<string>('');
  wordsGuessed = signal<number>(0);
  wordsSkipped = signal<number>(0);
  timeLeft = signal<number>(60);
  roundTime = signal<number>(60);
  selectedCategory = signal<string>('');
  categorySearch = signal<string>('');
  allCategories = getStirnratenCategories();
  categories = computed(() => {
    const search = this.categorySearch().toLowerCase().trim();
    if (!search) return this.allCategories;
    return this.allCategories.filter(cat => cat.toLowerCase().includes(search));
  });

  // Gyroscope
  gyroscopePermission = signal<boolean>(false);
  lastTilt = signal<string>('');
  tiltCooldown = false;

  // Timer
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Settings
  private readonly MAX_PLAYERS = 20;

  // Input
  newPlayerName = '';

  // Computed
  canStartGame = computed(() => this.players().length >= 1);
  canAddPlayer = computed(() => this.players().length < this.MAX_PLAYERS);
  currentPlayer = computed(() => this.players()[this.currentPlayerIndex()]);
  isLastPlayer = computed(() => this.currentPlayerIndex() >= this.players().length - 1);

  constructor(
    private router: Router,
    private gameState: GameStateService
  ) {
    // Auto-save settings when they change
    effect(() => {
      const players = this.players();
      const roundTime = this.roundTime();
      const selectedCategory = this.selectedCategory();
      // Only save in setup phase to avoid saving mid-game state
      if (this.phase() === 'setup') {
        this.gameState.saveKopfkinoSettings({
          players: players.map(p => ({ id: p.id, name: p.name })),
          roundTime,
          selectedCategory
        });
      }
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    const settings = this.gameState.getKopfkinoSettings();
    if (settings.players.length > 0) {
      this.players.set(settings.players.map(p => ({
        id: p.id,
        name: p.name,
        score: 0
      })));
    }
    this.roundTime.set(settings.roundTime);
    this.timeLeft.set(settings.roundTime);
    this.selectedCategory.set(settings.selectedCategory);
  }

  ngOnDestroy(): void {
    this.stopTimer();
    window.removeEventListener('deviceorientation', this.handleOrientation);
    this.unlockOrientation();
  }

  // Screen orientation methods
  private async lockLandscape(): Promise<void> {
    try {
      const orientation = screen.orientation as any;
      if (orientation && typeof orientation.lock === 'function') {
        await orientation.lock('landscape');
      }
    } catch (error) {
      // Orientation lock not supported or denied - silently ignore
      console.warn('Could not lock orientation:', error);
    }
  }

  private unlockOrientation(): void {
    try {
      const orientation = screen.orientation as any;
      if (orientation && typeof orientation.unlock === 'function') {
        orientation.unlock();
      }
    } catch (error) {
      // Silently ignore unlock errors
    }
  }

  // Player management
  addPlayer(): void {
    if (this.newPlayerName.trim() && this.canAddPlayer()) {
      const player: Player = {
        id: generateUUID(),
        name: this.newPlayerName.trim(),
        score: 0
      };
      this.players.update(p => [...p, player]);
      this.newPlayerName = '';
    }
  }

  removePlayer(id: string): void {
    this.players.update(p => p.filter(player => player.id !== id));
  }

  // Request gyroscope permission (needed for iOS)
  async requestGyroscopePermission(): Promise<void> {
    // Check if DeviceOrientationEvent exists and has requestPermission
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        this.gyroscopePermission.set(permission === 'granted');
      } catch (error) {
        console.error('Gyroscope permission denied:', error);
        this.gyroscopePermission.set(false);
      }
    } else {
      // Non-iOS devices don't need permission
      this.gyroscopePermission.set(true);
    }
  }

  // Start game
  async startGame(): Promise<void> {
    if (!this.canStartGame()) return;

    await this.requestGyroscopePermission();
    await this.lockLandscape();
    this.currentPlayerIndex.set(0);
    this.phase.set('ready');
  }

  // Prepare round for current player
  prepareRound(): void {
    this.wordsGuessed.set(0);
    this.wordsSkipped.set(0);
    this.timeLeft.set(this.roundTime());
    this.nextWord();
    this.phase.set('playing');
    this.startTimer();
    this.startGyroscope();
  }

  // Timer
  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeLeft.update(t => t - 1);
      if (this.timeLeft() <= 0) {
        this.endRound();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Gyroscope handling
  private handleOrientation = (event: DeviceOrientationEvent): void => {
    if (this.tiltCooldown || this.phase() !== 'playing') return;

    const beta = event.beta || 0; // Front-back tilt (-180 to 180)

    // Tilt forward (phone face down) = CORRECT
    if (beta < -30) {
      this.onCorrect();
      this.triggerCooldown();
    }
    // Tilt backward (phone face up) = SKIP
    else if (beta > 60) {
      this.onSkip();
      this.triggerCooldown();
    }
  };

  private triggerCooldown(): void {
    this.tiltCooldown = true;
    setTimeout(() => {
      this.tiltCooldown = false;
    }, 1000); // 1 second cooldown between tilts
  }

  startGyroscope(): void {
    window.addEventListener('deviceorientation', this.handleOrientation);
  }

  stopGyroscope(): void {
    window.removeEventListener('deviceorientation', this.handleOrientation);
  }

  // Game actions
  onCorrect(): void {
    this.lastTilt.set('correct');
    this.wordsGuessed.update(w => w + 1);
    this.updatePlayerScore(1);
    this.nextWord();
    setTimeout(() => this.lastTilt.set(''), 500);
  }

  onSkip(): void {
    this.lastTilt.set('skip');
    this.wordsSkipped.update(w => w + 1);
    this.nextWord();
    setTimeout(() => this.lastTilt.set(''), 500);
  }

  nextWord(): void {
    const category = this.selectedCategory() || undefined;
    this.currentWord.set(getRandomStirnratenWord(category));
  }

  updatePlayerScore(points: number): void {
    this.players.update(players =>
      players.map((p, i) =>
        i === this.currentPlayerIndex()
          ? { ...p, score: (p.score || 0) + points }
          : p
      )
    );
  }

  // End round
  endRound(): void {
    this.stopTimer();
    this.stopGyroscope();
    this.phase.set('result');
  }

  // Next player or end game
  nextPlayer(): void {
    if (this.isLastPlayer()) {
      // Game over - show final scores
      this.phase.set('setup');
    } else {
      this.currentPlayerIndex.update(i => i + 1);
      this.phase.set('ready');
    }
  }

  // For manual button controls (desktop/testing)
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.phase() !== 'playing') return;

    if (event.key === 'ArrowUp' || event.key === 'w') {
      this.onCorrect();
    } else if (event.key === 'ArrowDown' || event.key === 's') {
      this.onSkip();
    }
  }

  // Get sorted players by score
  getSortedPlayers(): Player[] {
    return [...this.players()].sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  // Reset game
  resetGame(): void {
    this.phase.set('setup');
    this.players.update(p => p.map(player => ({ ...player, score: 0 })));
    this.currentPlayerIndex.set(0);
    this.unlockOrientation();
  }

  // Navigation
  goHome(): void {
    this.stopTimer();
    this.stopGyroscope();
    this.unlockOrientation();
    this.router.navigate(['/']);
  }
}
