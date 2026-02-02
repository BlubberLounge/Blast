import { Component, signal, computed, OnDestroy, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Player } from '../../models/player.model';
import { getRandomStirnratenWord, getStirnratenCategories } from '../../data/words';
import { GameStateService } from '../../services/game-state.service';
import { generateUUID } from '../../utils/uuid';

type GamePhase = 'setup' | 'teams' | 'mode-select' | 'playing' | 'round-result' | 'scores';
type ActivityMode = 'explain' | 'draw' | 'pantomime';

interface Team {
  id: string;
  name: string;
  color: string;
  players: Player[];
  score: number;
}

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss'
})
export class ActivityComponent implements OnInit, OnDestroy {
  // Game state
  phase = signal<GamePhase>('setup');
  players = signal<Player[]>([]);
  teams = signal<Team[]>([]);
  currentTeamIndex = signal<number>(0);
  currentPlayerIndex = signal<number>(0);
  currentWord = signal<string>('');
  currentMode = signal<ActivityMode>('explain');
  timeLeft = signal<number>(60);
  roundTime = signal<number>(60);
  selectedCategory = signal<string>('');
  categorySearch = signal<string>('');
  wordsGuessed = signal<number>(0);
  roundsPlayed = signal<number>(0);
  totalRounds = signal<number>(3);

  // Categories
  allCategories = getStirnratenCategories();
  categories = computed(() => {
    const search = this.categorySearch().toLowerCase().trim();
    if (!search) return this.allCategories;
    return this.allCategories.filter(cat => cat.toLowerCase().includes(search));
  });

  // Timer
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  isPaused = signal<boolean>(false);

  // Settings
  private readonly MAX_PLAYERS = 16;
  private readonly MIN_PLAYERS = 4;

  // Input
  newPlayerName = '';

  // Team colors
  teamColors = [
    { name: 'Team Rot', color: 'from-red-500 to-rose-600', bg: 'bg-red-500', text: 'text-red-400' },
    { name: 'Team Blau', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500', text: 'text-blue-400' },
    { name: 'Team Grün', color: 'from-green-500 to-emerald-600', bg: 'bg-green-500', text: 'text-green-400' },
    { name: 'Team Gelb', color: 'from-yellow-500 to-amber-600', bg: 'bg-yellow-500', text: 'text-yellow-400' }
  ];

  // Mode info
  modes: { id: ActivityMode; name: string; icon: string; description: string }[] = [
    { id: 'explain', name: 'Erklären', icon: '🗣️', description: 'Erkläre das Wort ohne es zu nennen!' },
    { id: 'draw', name: 'Zeichnen', icon: '✏️', description: 'Zeichne das Wort in die Luft!' },
    { id: 'pantomime', name: 'Pantomime', icon: '🎭', description: 'Stelle das Wort dar - ohne zu sprechen!' }
  ];

  // Computed
  canStartGame = computed(() => this.players().length >= this.MIN_PLAYERS);
  canAddPlayer = computed(() => this.players().length < this.MAX_PLAYERS);
  currentTeam = computed(() => this.teams()[this.currentTeamIndex()]);
  currentPlayer = computed(() => {
    const team = this.currentTeam();
    if (!team) return null;
    return team.players[this.currentPlayerIndex() % team.players.length];
  });
  isGameOver = computed(() => this.roundsPlayed() >= this.totalRounds() * this.teams().length);
  currentModeInfo = computed(() => this.modes.find(m => m.id === this.currentMode()));

  constructor(
    private router: Router,
    private gameState: GameStateService
  ) {
    // Auto-save settings when they change
    effect(() => {
      const players = this.players();
      const roundTime = this.roundTime();
      const selectedCategory = this.selectedCategory();
      const totalRounds = this.totalRounds();
      if (this.phase() === 'setup') {
        this.gameState.saveActivitySettings({
          players: players.map(p => ({ id: p.id, name: p.name })),
          roundTime,
          selectedCategory,
          totalRounds
        });
      }
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    const settings = this.gameState.getActivitySettings();
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
    this.totalRounds.set(settings.totalRounds);
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
        score: 0
      };
      this.players.update(p => [...p, player]);
      this.newPlayerName = '';
    }
  }

  removePlayer(id: string): void {
    this.players.update(p => p.filter(player => player.id !== id));
  }

  // Team creation
  createTeams(): void {
    if (!this.canStartGame()) return;

    const playerList = [...this.players()];
    // Shuffle players
    for (let i = playerList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerList[i], playerList[j]] = [playerList[j], playerList[i]];
    }

    // Determine number of teams (2 for 4-7 players, 3 for 8-11, 4 for 12+)
    const numTeams = playerList.length < 8 ? 2 : playerList.length < 12 ? 3 : 4;

    // Distribute players to teams
    const newTeams: Team[] = [];
    for (let i = 0; i < numTeams; i++) {
      newTeams.push({
        id: generateUUID(),
        name: this.teamColors[i].name,
        color: this.teamColors[i].color,
        players: [],
        score: 0
      });
    }

    playerList.forEach((player, index) => {
      newTeams[index % numTeams].players.push(player);
    });

    this.teams.set(newTeams);
    this.phase.set('teams');
  }

  // Shuffle teams again
  reshuffleTeams(): void {
    this.createTeams();
  }

  // Start game from teams phase
  startGame(): void {
    this.currentTeamIndex.set(0);
    this.currentPlayerIndex.set(0);
    this.roundsPlayed.set(0);
    this.selectRandomMode();
    this.phase.set('mode-select');
  }

  // Select random mode
  selectRandomMode(): void {
    const modes: ActivityMode[] = ['explain', 'draw', 'pantomime'];
    const randomIndex = Math.floor(Math.random() * modes.length);
    this.currentMode.set(modes[randomIndex]);
  }

  // Start round
  startRound(): void {
    this.wordsGuessed.set(0);
    this.timeLeft.set(this.roundTime());
    this.isPaused.set(false);
    this.nextWord();
    this.phase.set('playing');
    this.startTimer();
  }

  // Timer
  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (!this.isPaused()) {
        this.timeLeft.update(t => t - 1);
        if (this.timeLeft() <= 0) {
          this.endRound();
        }
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  togglePause(): void {
    this.isPaused.update(p => !p);
  }

  // Game actions
  onCorrect(): void {
    this.wordsGuessed.update(w => w + 1);
    this.teams.update(teams =>
      teams.map((t, i) =>
        i === this.currentTeamIndex()
          ? { ...t, score: t.score + 1 }
          : t
      )
    );
    this.nextWord();
  }

  onSkip(): void {
    this.nextWord();
  }

  nextWord(): void {
    const category = this.selectedCategory() || undefined;
    this.currentWord.set(getRandomStirnratenWord(category));
  }

  // End round
  endRound(): void {
    this.stopTimer();
    this.roundsPlayed.update(r => r + 1);
    this.phase.set('round-result');
  }

  // Next team
  nextTeam(): void {
    if (this.isGameOver()) {
      this.phase.set('scores');
    } else {
      // Move to next team
      const nextTeamIdx = (this.currentTeamIndex() + 1) % this.teams().length;
      this.currentTeamIndex.set(nextTeamIdx);

      // If we've gone through all teams, increment player index
      if (nextTeamIdx === 0) {
        this.currentPlayerIndex.update(i => i + 1);
      }

      this.selectRandomMode();
      this.phase.set('mode-select');
    }
  }

  // Get sorted teams by score
  getSortedTeams(): Team[] {
    return [...this.teams()].sort((a, b) => b.score - a.score);
  }

  // Get current round number
  getRoundNumber(): number {
    return Math.floor(this.roundsPlayed() / this.teams().length) + 1;
  }

  // Get team color classes
  getTeamColorClasses(team: Team): string {
    const colorConfig = this.teamColors.find(c => c.name === team.name);
    return colorConfig ? colorConfig.color : 'from-gray-500 to-gray-600';
  }

  getTeamBgClass(team: Team): string {
    const colorConfig = this.teamColors.find(c => c.name === team.name);
    return colorConfig ? colorConfig.bg : 'bg-gray-500';
  }

  getTeamTextClass(team: Team): string {
    const colorConfig = this.teamColors.find(c => c.name === team.name);
    return colorConfig ? colorConfig.text : 'text-gray-400';
  }

  // Reset game
  resetGame(): void {
    this.stopTimer();
    this.phase.set('setup');
    this.teams.set([]);
    this.currentTeamIndex.set(0);
    this.currentPlayerIndex.set(0);
    this.roundsPlayed.set(0);
  }

  // Play again with same teams
  playAgain(): void {
    this.teams.update(teams => teams.map(t => ({ ...t, score: 0 })));
    this.currentTeamIndex.set(0);
    this.currentPlayerIndex.set(0);
    this.roundsPlayed.set(0);
    this.selectRandomMode();
    this.phase.set('mode-select');
  }

  // Navigation
  goHome(): void {
    this.stopTimer();
    this.router.navigate(['/']);
  }
}
