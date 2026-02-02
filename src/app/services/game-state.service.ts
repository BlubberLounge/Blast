import { Injectable, signal } from '@angular/core';

export interface UndercoverSettings {
  players: { id: string; name: string }[];
  imposterCount: number;
  discussionTime: number;
  showImposterHint: boolean;
}

export interface KopfkinoSettings {
  players: { id: string; name: string }[];
  roundTime: number;
  selectedCategory: string;
}

export interface MontagsmalerSettings {
  players: { id: string; name: string }[];
  roundTime: number;
  selectedCategory: string;
}

export interface LippenlesenSettings {
  players: { id: string; name: string }[];
  roundTime: number;
  selectedCategory: string;
}

export interface WoerterketteSettings {
  players: { id: string; name: string }[];
  turnTime: number;
}

export interface KingsCupSettings {
  players: { id: string; name: string }[];
}

export interface QuizBattleSettings {
  players: { id: string; name: string }[];
  selectedCategory: string;
  questionsPerPlayer: number;
}

export interface ActivitySettings {
  players: { id: string; name: string }[];
  roundTime: number;
  selectedCategory: string;
  totalRounds: number;
}

export interface GameSettings {
  undercover: UndercoverSettings;
  kopfkino: KopfkinoSettings;
  montagsmaler: MontagsmalerSettings;
  lippenlesen: LippenlesenSettings;
  woerterkette: WoerterketteSettings;
  kingsCup: KingsCupSettings;
  quizBattle: QuizBattleSettings;
  activity: ActivitySettings;
}

const STORAGE_KEY = 'blast-game-settings';

const DEFAULT_SETTINGS: GameSettings = {
  undercover: {
    players: [],
    imposterCount: 1,
    discussionTime: 300,
    showImposterHint: true
  },
  kopfkino: {
    players: [],
    roundTime: 60,
    selectedCategory: ''
  },
  montagsmaler: {
    players: [],
    roundTime: 60,
    selectedCategory: ''
  },
  lippenlesen: {
    players: [],
    roundTime: 30,
    selectedCategory: 'Zufällig'
  },
  woerterkette: {
    players: [],
    turnTime: 10
  },
  kingsCup: {
    players: []
  },
  quizBattle: {
    players: [],
    selectedCategory: '',
    questionsPerPlayer: 5
  },
  activity: {
    players: [],
    roundTime: 60,
    selectedCategory: '',
    totalRounds: 3
  }
};

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private settings = signal<GameSettings>(this.loadSettings());

  constructor() {
    // Auto-save on changes
  }

  private loadSettings(): GameSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new properties
        return {
          undercover: { ...DEFAULT_SETTINGS.undercover, ...parsed.undercover },
          kopfkino: { ...DEFAULT_SETTINGS.kopfkino, ...parsed.kopfkino },
          montagsmaler: { ...DEFAULT_SETTINGS.montagsmaler, ...parsed.montagsmaler },
          lippenlesen: { ...DEFAULT_SETTINGS.lippenlesen, ...parsed.lippenlesen },
          woerterkette: { ...DEFAULT_SETTINGS.woerterkette, ...parsed.woerterkette },
          kingsCup: { ...DEFAULT_SETTINGS.kingsCup, ...parsed.kingsCup },
          quizBattle: { ...DEFAULT_SETTINGS.quizBattle, ...parsed.quizBattle },
          activity: { ...DEFAULT_SETTINGS.activity, ...parsed.activity }
        };
      }
    } catch (e) {
      console.warn('Failed to load game settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings()));
    } catch (e) {
      console.warn('Failed to save game settings:', e);
    }
  }

  // Undercover
  getUndercoverSettings(): UndercoverSettings {
    return this.settings().undercover;
  }

  saveUndercoverSettings(settings: Partial<UndercoverSettings>): void {
    this.settings.update(s => ({
      ...s,
      undercover: { ...s.undercover, ...settings }
    }));
    this.saveSettings();
  }

  // Kopfkino
  getKopfkinoSettings(): KopfkinoSettings {
    return this.settings().kopfkino;
  }

  saveKopfkinoSettings(settings: Partial<KopfkinoSettings>): void {
    this.settings.update(s => ({
      ...s,
      kopfkino: { ...s.kopfkino, ...settings }
    }));
    this.saveSettings();
  }

  // Montagsmaler
  getMontagsmalerSettings(): MontagsmalerSettings {
    return this.settings().montagsmaler;
  }

  saveMontagsmalerSettings(settings: Partial<MontagsmalerSettings>): void {
    this.settings.update(s => ({
      ...s,
      montagsmaler: { ...s.montagsmaler, ...settings }
    }));
    this.saveSettings();
  }

  // Lippenlesen
  getLippenlesenSettings(): LippenlesenSettings {
    return this.settings().lippenlesen;
  }

  saveLippenlesenSettings(settings: Partial<LippenlesenSettings>): void {
    this.settings.update(s => ({
      ...s,
      lippenlesen: { ...s.lippenlesen, ...settings }
    }));
    this.saveSettings();
  }

  // Wörterkette
  getWoerterketteSettings(): WoerterketteSettings {
    return this.settings().woerterkette;
  }

  saveWoerterketteSettings(settings: Partial<WoerterketteSettings>): void {
    this.settings.update(s => ({
      ...s,
      woerterkette: { ...s.woerterkette, ...settings }
    }));
    this.saveSettings();
  }

  // Kings Cup
  getKingsCupSettings(): KingsCupSettings {
    return this.settings().kingsCup;
  }

  saveKingsCupSettings(settings: Partial<KingsCupSettings>): void {
    this.settings.update(s => ({
      ...s,
      kingsCup: { ...s.kingsCup, ...settings }
    }));
    this.saveSettings();
  }

  // Quiz Battle
  getQuizBattleSettings(): QuizBattleSettings {
    return this.settings().quizBattle;
  }

  saveQuizBattleSettings(settings: Partial<QuizBattleSettings>): void {
    this.settings.update(s => ({
      ...s,
      quizBattle: { ...s.quizBattle, ...settings }
    }));
    this.saveSettings();
  }

  // Activity
  getActivitySettings(): ActivitySettings {
    return this.settings().activity;
  }

  saveActivitySettings(settings: Partial<ActivitySettings>): void {
    this.settings.update(s => ({
      ...s,
      activity: { ...s.activity, ...settings }
    }));
    this.saveSettings();
  }

  // Clear all settings
  clearAll(): void {
    this.settings.set({ ...DEFAULT_SETTINGS });
    localStorage.removeItem(STORAGE_KEY);
  }
}
