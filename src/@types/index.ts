export interface GameEngine {}

export type Player = Record<string, unknown> & { id: string | number };
export interface GamePlayer<T extends Player = Player> {
  id: Player["id"];
  achievements: Achievement[];
  history: HistoryItem[];
  data: T;
}

export interface Achievement {}

export interface HistoryItem {}

export interface Event {}
