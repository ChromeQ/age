/**
 * MemoryDataStore is a `DataStore` that stores the saved data as in-memory JavaScript objects.
 * It does not provide a persistence mechanism.
 */
import clonedeep from "lodash.clonedeep";
import { Player, Event, GamePlayer, Achievement } from "./@types";
import { DataStore } from "./DataStore";

export class MemoryDataStore extends DataStore {
  gameStates: Record<Player["id"], GamePlayer>;

  /**
   * **`MemoryDataStore`** constructor accepts no arguments.
   */
  constructor() {
    super();
    this.gameStates = {};
  }

  /**
   * See `DataStore.recordPlayer`
   */
  recordPlayer(player: Player): void {
    this.gameStates[player.id] =
      this.gameStates[player.id] || this.makePlayer(player);
  }

  /**
   * See `DataStore.recordEvent`
   */
  recordEvent(player: Player, event: Event): void {
    this.gameStates[player.id] =
      this.gameStates[player.id] || this.makePlayer(player);

    this.gameStates[player.id]?.history.push({
      timestamp: new Date(),
      event,
    });
  }

  /**
   * See `DataStore.recordAchievement`
   */
  recordAchievement(player: Player, achievement: Achievement): void {
    this.gameStates[player.id] =
      this.gameStates[player.id] || this.makePlayer(player);

    this.gameStates[player.id]?.history.push({
      timestamp: achievement.achieved,
      achievement,
    });
    this.gameStates[player.id]?.achievements.push(achievement);
  }

  /**
   * See `DataStore.getPlayer`
   */
  getPlayer(player: Player): GamePlayer<Player> | undefined {
    return clonedeep(this.gameStates[player.id]);
  }

  /**
   * Not a guaranteed part of the DataStore interface
   */
  getPlayerIds(): string[] {
    return Object.keys(this.gameStates);
  }
}
