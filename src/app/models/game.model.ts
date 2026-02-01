import { Player } from './player.model';

export type GameMode = 'imposter' | 'stirnraten';

export interface GameState {
  mode: GameMode;
  players: Player[];
  currentPlayerIndex: number;
  round: number;
  isGameActive: boolean;
}

export interface ImposterGame extends GameState {
  mode: 'imposter';
  secretWord: string;
  imposterIds: string[];
  phase: 'setup' | 'reveal' | 'discussion' | 'voting' | 'result';
}

export interface StirnratenGame extends GameState {
  mode: 'stirnraten';
  currentWord: string;
  wordsGuessed: number;
  wordsSkipped: number;
  timeLeft: number;
  phase: 'setup' | 'playing' | 'result';
}
