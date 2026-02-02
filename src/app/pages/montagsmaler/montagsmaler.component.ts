import { Component, signal, computed, OnDestroy, OnInit, effect, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Player } from '../../models/player.model';
import { getRandomStirnratenWord, getStirnratenCategories } from '../../data/words';
import { GameStateService } from '../../services/game-state.service';
import { generateUUID } from '../../utils/uuid';

type GamePhase = 'setup' | 'ready' | 'drawing' | 'passing' | 'guessing' | 'evaluation' | 'scores';

interface DrawPoint {
  x: number;
  y: number;
  isStart: boolean;
  color: string;
  size: number;
}

interface Guess {
  playerId: string;
  playerName: string;
  guess: string;
  isCorrect: boolean | null;
}

@Component({
  selector: 'app-montagsmaler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './montagsmaler.component.html',
  styleUrl: './montagsmaler.component.scss'
})
export class MontagsmalerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('drawingCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;

  // Game state
  phase = signal<GamePhase>('setup');
  players = signal<Player[]>([]);
  currentDrawerIndex = signal<number>(0);
  currentWord = signal<string>('');
  roundsPlayed = signal<number>(0);
  totalRounds = signal<number>(2);
  roundTime = signal<number>(60);
  timeLeft = signal<number>(60);
  selectedCategory = signal<string>('');
  categorySearch = signal<string>('');
  allCategories = getStirnratenCategories();

  // Pass-around guessing state
  currentGuesserIndex = signal<number>(0);
  guesses = signal<Guess[]>([]);
  currentGuessInput = '';
  drawingImageData = signal<string>('');

  // Drawing state
  isDrawing = signal<boolean>(false);
  currentColor = signal<string>('#FFFFFF');
  brushSize = signal<number>(5);
  drawingHistory: DrawPoint[] = [];

  // Available colors
  colors = ['#FFFFFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9F43'];
  brushSizes = [3, 5, 8, 12, 18];

  // Timer
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Input
  newPlayerName = '';

  // Settings
  private readonly MAX_PLAYERS = 12;

  // Computed
  canAddPlayer = computed(() => this.players().length < this.MAX_PLAYERS);
  categories = computed(() => {
    const search = this.categorySearch().toLowerCase().trim();
    if (!search) return this.allCategories;
    return this.allCategories.filter(cat => cat.toLowerCase().includes(search));
  });
  canStartGame = computed(() => this.players().length >= 2);
  currentDrawer = computed(() => this.players()[this.currentDrawerIndex()]);
  guessers = computed(() => this.players().filter((_, i) => i !== this.currentDrawerIndex()));
  currentGuesser = computed(() => this.guessers()[this.currentGuesserIndex()]);
  allGuessesCollected = computed(() => this.currentGuesserIndex() >= this.guessers().length);
  isGameOver = computed(() => {
    const totalRoundsNeeded = this.players().length * this.totalRounds();
    return this.roundsPlayed() >= totalRoundsNeeded;
  });
  correctGuessCount = computed(() => this.guesses().filter(g => g.isCorrect === true).length);

  constructor(
    private router: Router,
    private gameState: GameStateService
  ) {
    effect(() => {
      const players = this.players();
      const roundTime = this.roundTime();
      const selectedCategory = this.selectedCategory();
      if (this.phase() === 'setup') {
        this.gameState.saveMontagsmalerSettings({
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

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  private loadSettings(): void {
    const settings = this.gameState.getMontagsmalerSettings();
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
  }

  // Canvas initialization
  private initCanvas(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    if (!this.canvasRef || !this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.redrawCanvas();
  }

  private redrawCanvas(): void {
    if (!this.ctx || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;

    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const point of this.drawingHistory) {
      if (point.isStart) {
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
        this.ctx.strokeStyle = point.color;
        this.ctx.lineWidth = point.size;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
      }
    }
  }

  // Drawing methods
  startDrawing(event: MouseEvent | TouchEvent): void {
    if (this.phase() !== 'drawing') return;
    this.isDrawing.set(true);

    const pos = this.getEventPosition(event);
    this.drawingHistory.push({
      x: pos.x,
      y: pos.y,
      isStart: true,
      color: this.currentColor(),
      size: this.brushSize()
    });

    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
    }
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing() || this.phase() !== 'drawing' || !this.ctx) return;
    event.preventDefault();

    const pos = this.getEventPosition(event);
    this.drawingHistory.push({
      x: pos.x,
      y: pos.y,
      isStart: false,
      color: this.currentColor(),
      size: this.brushSize()
    });

    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.strokeStyle = this.currentColor();
    this.ctx.lineWidth = this.brushSize();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  stopDrawing(): void {
    this.isDrawing.set(false);
  }

  private getEventPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in event) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
  }

  clearCanvas(): void {
    this.drawingHistory = [];
    if (this.ctx && this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      this.ctx.fillStyle = '#1a1a2e';
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  setColor(color: string): void {
    this.currentColor.set(color);
  }

  setBrushSize(size: number): void {
    this.brushSize.set(size);
  }

  private saveCanvasImage(): void {
    if (this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      this.drawingImageData.set(canvas.toDataURL('image/png'));
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

  // Game flow
  startGame(): void {
    if (!this.canStartGame()) return;
    this.currentDrawerIndex.set(0);
    this.roundsPlayed.set(0);
    this.players.update(p => p.map(player => ({ ...player, score: 0 })));
    this.phase.set('ready');
  }

  startRound(): void {
    this.clearCanvas();
    this.timeLeft.set(this.roundTime());
    const category = this.selectedCategory() || undefined;
    this.currentWord.set(getRandomStirnratenWord(category));
    this.guesses.set([]);
    this.currentGuesserIndex.set(0);
    this.currentGuessInput = '';
    this.phase.set('drawing');
    this.startTimer();

    setTimeout(() => this.initCanvas(), 100);
  }

  // Timer
  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeLeft.update(t => t - 1);
      if (this.timeLeft() <= 0) {
        this.finishDrawing();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  finishDrawing(): void {
    this.stopTimer();
    this.saveCanvasImage();
    this.currentGuesserIndex.set(0);
    this.phase.set('passing');
  }

  startGuessing(): void {
    this.currentGuessInput = '';
    this.phase.set('guessing');
  }

  submitGuess(): void {
    const guesser = this.currentGuesser();
    if (!guesser || !this.currentGuessInput.trim()) return;

    const newGuess: Guess = {
      playerId: guesser.id,
      playerName: guesser.name,
      guess: this.currentGuessInput.trim(),
      isCorrect: null
    };

    this.guesses.update(g => [...g, newGuess]);
    this.currentGuessInput = '';

    this.currentGuesserIndex.update(i => i + 1);

    // Always go to passing - either for next guesser or back to drawer
    this.phase.set('passing');
  }

  markGuess(index: number, isCorrect: boolean): void {
    this.guesses.update(guesses => {
      const updated = [...guesses];
      updated[index] = { ...updated[index], isCorrect };
      return updated;
    });
  }

  finishEvaluation(): void {
    const correctCount = this.correctGuessCount();
    if (correctCount > 0) {
      this.players.update(players =>
        players.map((p, i) =>
          i === this.currentDrawerIndex()
            ? { ...p, score: (p.score || 0) + correctCount }
            : p
        )
      );
    }

    const correctGuessPlayerIds = this.guesses()
      .filter(g => g.isCorrect === true)
      .map(g => g.playerId);

    if (correctGuessPlayerIds.length > 0) {
      this.players.update(players =>
        players.map(p =>
          correctGuessPlayerIds.includes(p.id)
            ? { ...p, score: (p.score || 0) + 1 }
            : p
        )
      );
    }

    this.nextRound();
  }

  nextRound(): void {
    this.roundsPlayed.update(r => r + 1);

    if (this.isGameOver()) {
      this.phase.set('scores');
      return;
    }

    this.currentDrawerIndex.update(i => (i + 1) % this.players().length);
    this.phase.set('ready');
  }

  allGuessesEvaluated(): boolean {
    return this.guesses().every(g => g.isCorrect !== null);
  }

  getSortedPlayers(): Player[] {
    return [...this.players()].sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  // Navigation
  playAgain(): void {
    this.players.update(p => p.map(player => ({ ...player, score: 0 })));
    this.currentDrawerIndex.set(0);
    this.roundsPlayed.set(0);
    this.drawingImageData.set('');
    this.guesses.set([]);
    this.phase.set('setup');
  }

  goHome(): void {
    this.stopTimer();
    this.router.navigate(['/']);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
