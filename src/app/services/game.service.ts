import { Injectable, signal, computed } from '@angular/core';
import { Player } from '../models/player.model';
import { generateUUID } from '../utils/uuid';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Players
  private _players = signal<Player[]>([]);
  players = this._players.asReadonly();

  playerCount = computed(() => this._players().length);

  // Add player
  addPlayer(name: string): void {
    const player: Player = {
      id: generateUUID(),
      name: name.trim(),
      score: 0
    };
    this._players.update(players => [...players, player]);
  }

  // Remove player
  removePlayer(id: string): void {
    this._players.update(players => players.filter(p => p.id !== id));
  }

  // Clear all players
  clearPlayers(): void {
    this._players.set([]);
  }

  // Get player by id
  getPlayer(id: string): Player | undefined {
    return this._players().find(p => p.id === id);
  }

  // Update player score
  updateScore(id: string, points: number): void {
    this._players.update(players =>
      players.map(p => p.id === id ? { ...p, score: (p.score || 0) + points } : p)
    );
  }
}
