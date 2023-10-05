export type Player = Record<string, unknown> & { id: string | number };

export interface GamePlayer<T extends Player = Player> {
  id: Player["id"];
  achievements: Achievement[];
  history: HistoryItem[];
  data: T;
}

export interface Achievement {
  name: string | number;
  achieved: Date;
}

export interface Event {
  name: string | number;
}

export type HistoryItem = {
  timestamp: Date;
} & ({ event: Event } | { achievement: Achievement });
