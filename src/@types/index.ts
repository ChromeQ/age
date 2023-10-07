import type { GameEngine } from '../GameEngine';
export type { GameEngine };

export type Player = Record<string, unknown> & { id: string | number };

export interface GamePlayer<T extends Player = Player> {
  id: Player['id'];
  achievements: Achievement[];
  history: HistoryItem[];
  data: T;
}

export interface Achievement {
  name: string | number;
  achieved: Date;
}

export interface Event<T = unknown> {
  name: string | number;
  data?: T;
}

export type HistoryItem = {
  timestamp: Date;
} & ({ event: Event } | { achievement: Achievement });

export type AchievementAchievedListener = (
  player: Player,
  achievement: Achievement,
  engine: GameEngine
) => void;

export type EventOccurredListener = (player: Player, event: Event, engine: GameEngine) => void;
