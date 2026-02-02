import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import packageJson from '../../../../package.json';

interface GameCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  shadowColor: string;
  available: boolean;
  size: 'small' | 'medium' | 'large';
  players: string;
  badge?: string;
}

const FAVORITES_KEY = 'blast-favorites';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  protected readonly version = packageJson.version;
  searchQuery = signal<string>('');
  favorites = signal<Set<string>>(this.loadFavorites());
  showFavoritesOnly = signal<boolean>(false);

  // Toast notification
  toastMessage = signal<string>('');
  toastVisible = signal<boolean>(false);

  // Hidden reset feature
  private resetClickCount = 0;
  private resetClickTimer: ReturnType<typeof setTimeout> | null = null;

  private loadFavorites(): Set<string> {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load favorites:', e);
    }
    return new Set();
  }

  private saveFavorites(): void {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...this.favorites()]));
    } catch (e) {
      console.warn('Failed to save favorites:', e);
    }
  }

  toggleFavorite(gameId: string, event: Event): void {
    event.stopPropagation();
    this.favorites.update(favs => {
      const newFavs = new Set(favs);
      if (newFavs.has(gameId)) {
        newFavs.delete(gameId);
      } else {
        newFavs.add(gameId);
      }
      return newFavs;
    });
    this.saveFavorites();
  }

  isFavorite(gameId: string): boolean {
    return this.favorites().has(gameId);
  }

  toggleShowFavorites(): void {
    this.showFavoritesOnly.update(v => !v);
  }

  get favoritesCount(): number {
    return this.favorites().size;
  }

  allGames: GameCard[] = [
    {
      id: 'undercover',
      name: 'Undercover',
      description: 'Finde den Spion! Einer kennt das Wort nicht.',
      icon: '🕵️',
      gradient: 'from-red-500 via-orange-500 to-amber-500',
      shadowColor: 'shadow-red-500/30',
      available: true,
      size: 'large',
      players: '3-10',
      badge: 'Beliebt'
    },
    {
      id: 'kopfkino',
      name: 'Kopfkino',
      description: 'Halte das Handy an die Stirn und errate das Wort!',
      icon: '🎬',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      shadowColor: 'shadow-blue-500/30',
      available: true,
      size: 'medium',
      players: '2-20'
    },
    {
      id: 'wahrheit-pflicht',
      name: 'Wahrheit oder Pflicht',
      description: 'Der Klassiker für jede Party!',
      icon: '🎯',
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      shadowColor: 'shadow-pink-500/30',
      available: false,
      size: 'medium',
      players: '2-20'
    },
    {
      id: 'wer-wuerde-eher',
      name: 'Wer würde eher...',
      description: 'Findet heraus wer am ehesten was tun würde!',
      icon: '🤷',
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      shadowColor: 'shadow-violet-500/30',
      available: false,
      size: 'small',
      players: '3-20'
    },
    {
      id: 'never-have-i-ever',
      name: 'Ich hab noch nie...',
      description: 'Enthülle Geheimnisse deiner Freunde!',
      icon: '🙈',
      gradient: 'from-emerald-500 via-green-500 to-lime-500',
      shadowColor: 'shadow-emerald-500/30',
      available: false,
      size: 'small',
      players: '3-20'
    },
    {
      id: 'categories',
      name: 'Kategorien',
      description: 'Nenne Begriffe bevor die Zeit abläuft!',
      icon: '⚡',
      gradient: 'from-yellow-500 via-amber-500 to-orange-500',
      shadowColor: 'shadow-yellow-500/30',
      available: false,
      size: 'small',
      players: '2-10'
    },
    {
      id: 'drawing',
      name: 'Montagsmaler',
      description: 'Zeichne und lass andere raten!',
      icon: '🎨',
      gradient: 'from-indigo-500 via-blue-500 to-sky-500',
      shadowColor: 'shadow-indigo-500/30',
      available: true,
      size: 'medium',
      players: '2-12'
    },
    {
      id: 'quiz',
      name: 'Quiz Battle',
      description: 'Teste dein Wissen gegen Freunde!',
      icon: '🧠',
      gradient: 'from-cyan-500 via-teal-500 to-emerald-500',
      shadowColor: 'shadow-cyan-500/30',
      available: true,
      size: 'small',
      players: '2-8',
      badge: 'Neu'
    },
    {
      id: 'werwolf',
      name: 'Werwolf',
      description: 'Finde die Werwölfe bevor es zu spät ist!',
      icon: '🐺',
      gradient: 'from-slate-600 via-gray-700 to-zinc-800',
      shadowColor: 'shadow-slate-500/30',
      available: false,
      size: 'medium',
      players: '5-15'
    },
    {
      id: 'scharade',
      name: 'Scharade',
      description: 'Erkläre ohne Worte - nur mit Gesten!',
      icon: '🎭',
      gradient: 'from-orange-500 via-red-500 to-rose-500',
      shadowColor: 'shadow-orange-500/30',
      available: false,
      size: 'small',
      players: '4-20'
    },
    {
      id: 'tabu',
      name: 'Tabu',
      description: 'Erkläre das Wort ohne verbotene Begriffe!',
      icon: '🚫',
      gradient: 'from-red-600 via-red-500 to-orange-500',
      shadowColor: 'shadow-red-500/30',
      available: false,
      size: 'small',
      players: '4-12'
    },
    {
      id: 'zwei-wahrheiten',
      name: '2 Wahrheiten, 1 Lüge',
      description: 'Erkenne die Lüge unter den Aussagen!',
      icon: '🤥',
      gradient: 'from-amber-500 via-yellow-500 to-lime-500',
      shadowColor: 'shadow-amber-500/30',
      available: false,
      size: 'small',
      players: '3-15'
    },
    {
      id: 'would-you-rather',
      name: 'Würdest du lieber',
      description: 'Triff unmögliche Entscheidungen!',
      icon: '⚖️',
      gradient: 'from-purple-500 via-violet-500 to-indigo-500',
      shadowColor: 'shadow-purple-500/30',
      available: false,
      size: 'small',
      players: '2-20'
    },
    {
      id: 'hot-takes',
      name: 'Hot Takes',
      description: 'Teile deine kontroversen Meinungen!',
      icon: '🔥',
      gradient: 'from-orange-600 via-red-600 to-rose-600',
      shadowColor: 'shadow-orange-500/30',
      available: false,
      size: 'small',
      players: '3-15'
    },
    {
      id: 'storytime',
      name: 'Story Time',
      description: 'Erzählt gemeinsam verrückte Geschichten!',
      icon: '📖',
      gradient: 'from-amber-400 via-orange-400 to-red-400',
      shadowColor: 'shadow-amber-500/30',
      available: false,
      size: 'small',
      players: '3-10'
    },
    {
      id: 'stille-post',
      name: 'Stille Post Extrem',
      description: 'Zeichnen und Raten in der Kette!',
      icon: '📝',
      gradient: 'from-teal-500 via-cyan-500 to-blue-500',
      shadowColor: 'shadow-teal-500/30',
      available: false,
      size: 'medium',
      players: '4-12'
    },
    {
      id: 'kings-cup',
      name: 'Kings Cup',
      description: 'Das ultimative Trinkspiel mit Karten!',
      icon: '👑',
      gradient: 'from-yellow-500 via-amber-500 to-yellow-600',
      shadowColor: 'shadow-yellow-500/30',
      available: true,
      size: 'small',
      players: '2-10'
    },
    {
      id: 'flaschendrehen',
      name: 'Flaschendrehen',
      description: 'Die Flasche entscheidet dein Schicksal!',
      icon: '🍾',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      shadowColor: 'shadow-emerald-500/30',
      available: false,
      size: 'small',
      players: '3-15'
    },
    {
      id: 'reaktion',
      name: 'Reaktionstest',
      description: 'Wer hat die schnellsten Reflexe?',
      icon: '⚡',
      gradient: 'from-yellow-400 via-lime-400 to-green-400',
      shadowColor: 'shadow-yellow-500/30',
      available: false,
      size: 'small',
      players: '2-8'
    },
    {
      id: 'wortekette',
      name: 'Wörterkette',
      description: 'Finde Wörter die mit dem letzten Buchstaben beginnen!',
      icon: '🔗',
      gradient: 'from-blue-400 via-indigo-500 to-purple-500',
      shadowColor: 'shadow-blue-500/30',
      available: true,
      size: 'small',
      players: '2-8'
    },
    {
      id: 'entweder-oder',
      name: 'Entweder Oder',
      description: 'Was würdest du wählen?',
      icon: '🔀',
      gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
      shadowColor: 'shadow-fuchsia-500/30',
      available: false,
      size: 'small',
      players: '2-20'
    },
    {
      id: 'paar-challenge',
      name: 'Paar Challenge',
      description: 'Wie gut kennt ihr euch wirklich?',
      icon: '💕',
      gradient: 'from-rose-400 via-pink-500 to-red-500',
      shadowColor: 'shadow-rose-500/30',
      available: false,
      size: 'small',
      players: '2'
    },
    {
      id: 'activity',
      name: 'Activity',
      description: 'Erkläre, zeichne oder pantomime!',
      icon: '🎪',
      gradient: 'from-violet-500 via-purple-500 to-pink-500',
      shadowColor: 'shadow-violet-500/30',
      available: true,
      size: 'medium',
      players: '4-16',
      badge: 'Neu'
    },
    {
      id: 'lippenlesen',
      name: 'Lippenlesen',
      description: 'Errate was gesagt wird - ohne Ton!',
      icon: '👄',
      gradient: 'from-pink-400 via-rose-400 to-red-400',
      shadowColor: 'shadow-pink-500/30',
      available: true,
      size: 'small',
      players: '2-10'
    },
    {
      id: 'memory-challenge',
      name: 'Memory Challenge',
      description: 'Teste dein Gedächtnis gegen Freunde!',
      icon: '🧩',
      gradient: 'from-indigo-400 via-blue-500 to-cyan-500',
      shadowColor: 'shadow-indigo-500/30',
      available: false,
      size: 'small',
      players: '2-6'
    },
    {
      id: 'alibi',
      name: 'Alibi',
      description: 'Überzeuge die anderen von deinem Alibi!',
      icon: '🔍',
      gradient: 'from-gray-500 via-slate-600 to-gray-700',
      shadowColor: 'shadow-gray-500/30',
      available: false,
      size: 'small',
      players: '4-10'
    },
    {
      id: 'buzz',
      name: 'Buzz',
      description: 'Drück den Buzzer als Erster!',
      icon: '🔔',
      gradient: 'from-red-500 via-orange-500 to-yellow-500',
      shadowColor: 'shadow-red-500/30',
      available: false,
      size: 'small',
      players: '2-8'
    }
  ];

  games = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const showFavsOnly = this.showFavoritesOnly();
    const favs = this.favorites();

    let filtered = this.allGames;

    // Filter by favorites if enabled
    if (showFavsOnly) {
      filtered = filtered.filter(game => favs.has(game.id));
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  constructor(private router: Router) {}

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  navigateTo(game: GameCard): void {
    if (game.available) {
      this.router.navigate([`/${game.id}`]);
    }
  }

  getCardClasses(game: GameCard): string {
    const sizeClasses = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-1 row-span-1 md:col-span-1 md:row-span-2',
      large: 'col-span-1 row-span-1 md:col-span-2 md:row-span-2'
    };
    return sizeClasses[game.size];
  }

  // Get mascot colors for each game
  getMascotColors(gameId: string): { primary: string; secondary: string; accent: string; skin: string } {
    const colors: Record<string, { primary: string; secondary: string; accent: string; skin: string }> = {
      'undercover': { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#2C3E50', skin: '#FFE4C4' },
      'kopfkino': { primary: '#4FC3F7', secondary: '#29B6F6', accent: '#01579B', skin: '#FFE4C4' },
      'wahrheit-pflicht': { primary: '#F06292', secondary: '#EC407A', accent: '#AD1457', skin: '#FFE4C4' },
      'wer-wuerde-eher': { primary: '#BA68C8', secondary: '#AB47BC', accent: '#6A1B9A', skin: '#FFE4C4' },
      'never-have-i-ever': { primary: '#81C784', secondary: '#66BB6A', accent: '#2E7D32', skin: '#FFE4C4' },
      'categories': { primary: '#FFD54F', secondary: '#FFC107', accent: '#FF6F00', skin: '#FFE4C4' },
      'drawing': { primary: '#7986CB', secondary: '#5C6BC0', accent: '#283593', skin: '#FFE4C4' },
      'quiz': { primary: '#4DD0E1', secondary: '#26C6DA', accent: '#006064', skin: '#FFE4C4' }
    };
    return colors[gameId] || colors['imposter'];
  }

  // Show toast notification
  private showToast(message: string, duration = 2000): void {
    this.toastMessage.set(message);
    this.toastVisible.set(true);
    setTimeout(() => {
      this.toastVisible.set(false);
    }, duration);
  }

  // Hidden feature: Clear all caches after 5 taps
  async onSecretReset(): Promise<void> {
    this.resetClickCount++;

    // Reset counter after 3 seconds of no clicks
    if (this.resetClickTimer) {
      clearTimeout(this.resetClickTimer);
    }
    this.resetClickTimer = setTimeout(() => {
      this.resetClickCount = 0;
    }, 3000);

    if (this.resetClickCount >= 5) {
      // Show toast
      this.showToast('Cache wird geleert...', 1500);

      // Wait a moment for toast to show
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clear localStorage
      localStorage.clear();
      this.favorites.set(new Set());
      this.resetClickCount = 0;

      // Clear Service Worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Unregister Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      // Force reload from server
      window.location.reload();
    }
  }
}
