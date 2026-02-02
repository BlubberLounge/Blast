import { Component, signal, computed, OnDestroy, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Player } from '../../models/player.model';
import { getRandomImposterWord } from '../../data/words';
import { GameStateService } from '../../services/game-state.service';
import { generateUUID } from '../../utils/uuid';

type GamePhase = 'setup' | 'reveal' | 'discussion' | 'result';

@Component({
  selector: 'app-undercover',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './undercover.component.html',
  styleUrl: './undercover.component.scss'
})
export class UndercoverComponent implements OnInit, OnDestroy {
  // Game state
  phase = signal<GamePhase>('setup');
  players = signal<Player[]>([]);
  secretWord = signal<string>('');
  wordHint = signal<string>('');
  imposterCount = signal<number>(1);
  currentRevealIndex = signal<number>(0);
  showingRole = signal<boolean>(false);

  // Card swipe state
  cardDragY = signal<number>(0);
  isDragging = signal<boolean>(false);
  isRevealed = signal<boolean>(false);
  private dragStartY = 0;
  private readonly REVEAL_THRESHOLD = -120; // Pixels to swipe up to reveal

  // Timer
  discussionTime = signal<number>(300); // Default 5 minutes
  timeLeft = signal<number>(300);
  timerPaused = signal<boolean>(false);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Result phase
  impostersRevealed = signal<boolean>(false);

  // Character indices (randomized per game)
  characterIndices = signal<number[]>([]);

  // Settings
  showImposterHint = signal<boolean>(true);
  private readonly MAX_PLAYERS = 10;

  // Input
  newPlayerName = '';

  // Computed
  canStartGame = computed(() => this.players().length >= 3);
  canAddPlayer = computed(() => this.players().length < this.MAX_PLAYERS);
  currentPlayer = computed(() => this.players()[this.currentRevealIndex()]);
  allRevealed = computed(() => this.currentRevealIndex() >= this.players().length);
  imposters = computed(() => this.players().filter(p => p.isImposter));
  innocents = computed(() => this.players().filter(p => !p.isImposter));

  constructor(
    private router: Router,
    private gameState: GameStateService
  ) {
    // Auto-save settings when they change
    effect(() => {
      const players = this.players();
      const imposterCount = this.imposterCount();
      const discussionTime = this.discussionTime();
      const showImposterHint = this.showImposterHint();
      // Only save in setup phase to avoid saving mid-game state
      if (this.phase() === 'setup') {
        this.gameState.saveUndercoverSettings({
          players: players.map(p => ({ id: p.id, name: p.name })),
          imposterCount,
          discussionTime,
          showImposterHint
        });
      }
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    const settings = this.gameState.getUndercoverSettings();
    if (settings.players.length > 0) {
      this.players.set(settings.players.map(p => ({
        id: p.id,
        name: p.name,
        isImposter: false
      })));
    }
    this.imposterCount.set(settings.imposterCount);
    this.discussionTime.set(settings.discussionTime);
    this.timeLeft.set(settings.discussionTime);
    this.showImposterHint.set(settings.showImposterHint);
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // Timer methods
  private startTimer(): void {
    this.timeLeft.set(this.discussionTime());
    this.timerPaused.set(false);
    this.timerInterval = setInterval(() => {
      if (!this.timerPaused()) {
        this.timeLeft.update(t => t - 1);
        if (this.timeLeft() <= 0) {
          this.endDiscussion();
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

  endDiscussion(): void {
    this.stopTimer();
    this.impostersRevealed.set(false);
    this.phase.set('result');
  }

  revealImposters(): void {
    this.impostersRevealed.set(true);
  }

  // Player management
  addPlayer(): void {
    if (this.newPlayerName.trim() && this.canAddPlayer()) {
      const player: Player = {
        id: generateUUID(),
        name: this.newPlayerName.trim(),
        isImposter: false
      };
      this.players.update(p => [...p, player]);
      this.newPlayerName = '';
    }
  }

  removePlayer(id: string): void {
    this.players.update(p => p.filter(player => player.id !== id));
  }

  // Game flow
  startGame(): void {
    if (!this.canStartGame()) return;

    // Get random word with hint
    const wordData = getRandomImposterWord();
    this.secretWord.set(wordData.word);
    this.wordHint.set(wordData.hint);

    // Assign imposters randomly
    const playersCopy = [...this.players()];
    const shuffled = playersCopy.sort(() => Math.random() - 0.5);
    const imposterIds = shuffled.slice(0, this.imposterCount()).map(p => p.id);

    this.players.update(players =>
      players.map(p => ({
        ...p,
        isImposter: imposterIds.includes(p.id)
      }))
    );

    // Generate randomized character indices for each player
    this.characterIndices.set(this.generateRandomCharacterIndices(this.players().length));

    this.currentRevealIndex.set(0);
    this.getNewPastelColor(); // Random color for first card
    this.phase.set('reveal');
  }

  // Generate unique random character indices for all players
  private generateRandomCharacterIndices(playerCount: number): number[] {
    const totalCharacters = 19; // character-0.jpg through character-18.jpg

    // Create array of all character indices [0, 1, 2, ..., 18]
    const allIndices = Array.from({ length: totalCharacters }, (_, i) => i);

    // Fisher-Yates shuffle
    for (let i = allIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
    }

    // Return first N characters (one unique character per player)
    return allIndices.slice(0, playerCount);
  }

  // Reveal phase - Card swipe handlers (hold to reveal mechanic)
  onCardTouchStart(event: TouchEvent): void {
    this.isDragging.set(true);
    this.dragStartY = event.touches[0].clientY;
  }

  onCardTouchMove(event: TouchEvent): void {
    if (!this.isDragging()) return;
    event.preventDefault();
    const currentY = event.touches[0].clientY;
    const deltaY = currentY - this.dragStartY;
    // Only allow dragging upward (negative values)
    const clampedY = Math.min(0, deltaY);
    this.cardDragY.set(clampedY);

    // Show role while held past threshold
    if (clampedY <= this.REVEAL_THRESHOLD) {
      this.showingRole.set(true);
    } else {
      this.showingRole.set(false);
    }
  }

  onCardTouchEnd(): void {
    if (!this.isDragging()) return;
    this.isDragging.set(false);

    // Always snap back down
    this.cardDragY.set(0);
    this.showingRole.set(false);

    // Show the button as soon as user releases the card
    this.isRevealed.set(true);
  }

  // Mouse events for desktop testing
  onCardMouseDown(event: MouseEvent): void {
    this.isDragging.set(true);
    this.dragStartY = event.clientY;
  }

  onCardMouseMove(event: MouseEvent): void {
    if (!this.isDragging()) return;
    event.preventDefault();
    const deltaY = event.clientY - this.dragStartY;
    const clampedY = Math.min(0, deltaY);
    this.cardDragY.set(clampedY);

    // Show role while held past threshold
    if (clampedY <= this.REVEAL_THRESHOLD) {
      this.showingRole.set(true);
    } else {
      this.showingRole.set(false);
    }
  }

  onCardMouseUp(): void {
    this.onCardTouchEnd();
  }

  onCardMouseLeave(): void {
    if (this.isDragging()) {
      this.onCardTouchEnd();
    }
  }

  resetCardState(): void {
    this.cardDragY.set(0);
    this.isDragging.set(false);
    this.isRevealed.set(false);
  }

  showRole(): void {
    this.showingRole.set(true);
  }

  hideRoleAndNext(): void {
    // Reset card state and move to next player
    this.cardDragY.set(0);
    this.showingRole.set(false);
    this.isRevealed.set(false);
    this.currentRevealIndex.update(i => i + 1);
    this.getNewPastelColor(); // Get new random color for next card

    if (this.allRevealed()) {
      this.phase.set('discussion');
      this.startTimer();
    }
  }

  // Navigation
  playAgain(): void {
    this.stopTimer();
    this.phase.set('setup');
    this.players.update(p => p.map(player => ({ ...player, isImposter: false })));
    this.secretWord.set('');
    this.wordHint.set('');
    this.currentRevealIndex.set(0);
    this.timerPaused.set(false);
    this.impostersRevealed.set(false);
  }

  goHome(): void {
    this.stopTimer();
    this.router.navigate(['/']);
  }

  // Format time for display (mm:ss)
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Get character index for current player (0-18, randomized)
  getCharacterIndex(): number {
    const indices = this.characterIndices();
    const currentIndex = this.currentRevealIndex();
    return indices[currentIndex] ?? (currentIndex % 19);
  }

  // Pastel colors for character card gradients
  private pastelColors = [
    { from: 'from-pink-400/80', via: 'via-pink-500/50', name: 'pink' },
    { from: 'from-purple-400/80', via: 'via-purple-500/50', name: 'purple' },
    { from: 'from-blue-400/80', via: 'via-blue-500/50', name: 'blue' },
    { from: 'from-cyan-400/80', via: 'via-cyan-500/50', name: 'cyan' },
    { from: 'from-teal-400/80', via: 'via-teal-500/50', name: 'teal' },
    { from: 'from-green-400/80', via: 'via-green-500/50', name: 'green' },
    { from: 'from-amber-400/80', via: 'via-amber-500/50', name: 'amber' },
    { from: 'from-orange-400/80', via: 'via-orange-500/50', name: 'orange' },
    { from: 'from-rose-400/80', via: 'via-rose-500/50', name: 'rose' },
    { from: 'from-violet-400/80', via: 'via-violet-500/50', name: 'violet' },
  ];

  currentPastelColor = signal(this.getRandomPastelColor());

  private getRandomPastelColor() {
    return this.pastelColors[Math.floor(Math.random() * this.pastelColors.length)];
  }

  // Called when moving to next player to get a new random color
  getNewPastelColor(): void {
    this.currentPastelColor.set(this.getRandomPastelColor());
  }
}
