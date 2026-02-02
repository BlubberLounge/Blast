import { Component, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';
import { QuizQuestion, getQuizQuestions, getQuizCategories } from '../../data/quiz-questions';
import { generateUUID } from '../../utils/uuid';

type GamePhase = 'setup' | 'ready' | 'question' | 'result' | 'scores';

interface Player {
  id: string;
  name: string;
  score: number;
  currentQuestionIndex: number;
}

@Component({
  selector: 'app-quiz-battle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-battle.component.html',
  styleUrl: './quiz-battle.component.scss'
})
export class QuizBattleComponent implements OnDestroy {
  // Game state
  phase = signal<GamePhase>('setup');
  players = signal<Player[]>([]);
  questions = signal<QuizQuestion[]>([]);

  // Setup
  newPlayerName = '';
  selectedCategory = signal<string>('');
  questionsPerPlayer = signal<number>(5);
  categories = getQuizCategories();

  // Question phase
  currentPlayerIndex = signal<number>(0);
  currentQuestionIndex = signal<number>(0);
  timeLeft = signal<number>(15);
  selectedAnswer = signal<number | null>(null);
  showingResult = signal<boolean>(false);
  lastAnswerCorrect = signal<boolean>(false);

  // Timer
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Computed values
  currentPlayer = computed(() => {
    const players = this.players();
    const index = this.currentPlayerIndex();
    return players[index] || null;
  });

  currentQuestion = computed(() => {
    const player = this.currentPlayer();
    if (!player) return null;
    const questions = this.questions();
    const questionIndex = player.currentQuestionIndex;
    return questions[questionIndex] || null;
  });

  totalQuestionsInGame = computed(() => {
    return this.players().length * this.questionsPerPlayer();
  });

  currentQuestionNumber = computed(() => {
    const players = this.players();
    const currentIdx = this.currentPlayerIndex();
    const currentPlayer = players[currentIdx];
    if (!currentPlayer) return 0;

    let total = 0;
    for (let i = 0; i < currentIdx; i++) {
      total += players[i].currentQuestionIndex + 1;
    }
    total += currentPlayer.currentQuestionIndex + 1;
    return total;
  });

  sortedPlayers = computed(() => {
    return [...this.players()].sort((a, b) => b.score - a.score);
  });

  canStart = computed(() => {
    return this.players().length >= 2;
  });

  constructor(
    private router: Router,
    private gameState: GameStateService
  ) {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private loadSettings(): void {
    const settings = this.gameState.getQuizBattleSettings();
    if (settings.players.length > 0) {
      this.players.set(settings.players.map(p => ({
        ...p,
        score: 0,
        currentQuestionIndex: 0
      })));
    }
    if (settings.selectedCategory) {
      this.selectedCategory.set(settings.selectedCategory);
    }
    if (settings.questionsPerPlayer) {
      this.questionsPerPlayer.set(settings.questionsPerPlayer);
    }
  }

  private saveSettings(): void {
    this.gameState.saveQuizBattleSettings({
      players: this.players().map(p => ({ id: p.id, name: p.name })),
      selectedCategory: this.selectedCategory(),
      questionsPerPlayer: this.questionsPerPlayer()
    });
  }

  // Player management
  addPlayer(): void {
    const name = this.newPlayerName.trim();
    if (!name || this.players().length >= 8) return;

    this.players.update(players => [
      ...players,
      { id: generateUUID(), name, score: 0, currentQuestionIndex: 0 }
    ]);
    this.newPlayerName = '';
    this.saveSettings();
  }

  removePlayer(id: string): void {
    this.players.update(players => players.filter(p => p.id !== id));
    this.saveSettings();
  }

  // Setup options
  selectCategory(category: string): void {
    this.selectedCategory.set(category);
    this.saveSettings();
  }

  setQuestionsPerPlayer(count: number): void {
    this.questionsPerPlayer.set(count);
    this.saveSettings();
  }

  // Game flow
  startGame(): void {
    if (!this.canStart()) return;

    // Get questions - need enough for all players
    const totalNeeded = this.players().length * this.questionsPerPlayer();
    const category = this.selectedCategory() || undefined;
    const questions = getQuizQuestions(totalNeeded, category);
    this.questions.set(questions);

    // Reset player scores and question indices
    this.players.update(players => players.map(p => ({
      ...p,
      score: 0,
      currentQuestionIndex: 0
    })));

    this.currentPlayerIndex.set(0);
    this.phase.set('ready');
  }

  playerReady(): void {
    this.selectedAnswer.set(null);
    this.showingResult.set(false);
    this.phase.set('question');
    this.startTimer();
  }

  private startTimer(): void {
    this.timeLeft.set(15);
    this.stopTimer();

    this.timerInterval = setInterval(() => {
      this.timeLeft.update(t => {
        if (t <= 1) {
          this.handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private handleTimeout(): void {
    this.stopTimer();
    if (this.selectedAnswer() === null) {
      this.submitAnswer(-1); // No answer
    }
  }

  selectAnswer(index: number): void {
    if (this.selectedAnswer() !== null || this.showingResult()) return;
    this.selectedAnswer.set(index);
    this.stopTimer();
    this.submitAnswer(index);
  }

  private submitAnswer(answerIndex: number): void {
    const question = this.currentQuestion();
    if (!question) return;

    const isCorrect = answerIndex === question.correctIndex;
    this.lastAnswerCorrect.set(isCorrect);

    if (isCorrect) {
      // Award points
      const playerIdx = this.currentPlayerIndex();
      this.players.update(players => {
        const updated = [...players];
        updated[playerIdx] = {
          ...updated[playerIdx],
          score: updated[playerIdx].score + 10
        };
        return updated;
      });
    }

    this.showingResult.set(true);
    this.phase.set('result');
  }

  nextTurn(): void {
    const players = this.players();
    const currentIdx = this.currentPlayerIndex();
    const currentPlayer = players[currentIdx];

    // Update current player's question index
    const newQuestionIndex = currentPlayer.currentQuestionIndex + 1;
    this.players.update(ps => {
      const updated = [...ps];
      updated[currentIdx] = {
        ...updated[currentIdx],
        currentQuestionIndex: newQuestionIndex
      };
      return updated;
    });

    // Check if this player is done with all their questions
    if (newQuestionIndex >= this.questionsPerPlayer()) {
      // Move to next player
      const nextPlayerIdx = currentIdx + 1;

      if (nextPlayerIdx >= players.length) {
        // All players done - show scores
        this.phase.set('scores');
        return;
      }

      this.currentPlayerIndex.set(nextPlayerIdx);
    }

    // Show ready screen for next question
    this.selectedAnswer.set(null);
    this.showingResult.set(false);
    this.phase.set('ready');
  }

  playAgain(): void {
    this.startGame();
  }

  backToMenu(): void {
    this.router.navigate(['/']);
  }

  backToSetup(): void {
    this.stopTimer();
    this.phase.set('setup');
  }

  // Timer color based on time left
  getTimerColor(): string {
    const time = this.timeLeft();
    if (time <= 3) return 'text-red-400';
    if (time <= 7) return 'text-yellow-400';
    return 'text-emerald-400';
  }

  getTimerBgColor(): string {
    const time = this.timeLeft();
    if (time <= 3) return 'bg-red-500/20';
    if (time <= 7) return 'bg-yellow-500/20';
    return 'bg-emerald-500/20';
  }
}
