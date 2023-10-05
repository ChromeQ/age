/**
 * DataStore defines an abstract API by which the `GameEngine` can save, persist and retrieve information about players and game states.
 */
import type {
  Player,
  Event,
  Achievement,
  HistoryItem,
  GamePlayer,
} from "./@types";

export class DataStore {
  /**
   * **`makePlayer`** creates a new player object based on the given `data` object, must contain an `id`.
   * @param data An object containing the player id and any additional meta-data for the player
   * @returns GamePlayer
   */
  makePlayer(data: Player): GamePlayer {
    return {
      id: data.id,
      achievements: [],
      history: [],
      data,
    };
  }

  /**
   * **`recordPlayer`** ensures that the datastore contains a player object for the specified `player` data
   * This method is not implemented in the base DataStore object. Subclasses must override and implement this method
   * @param player Player
   */
  recordPlayer(player: Player): void {
    throw new Error("Method not implemented.");
  }

  /**
   * **`recordEvent`** registers that the given `player` encountered the given `event`
   * This method is not implemented in the base DataStore object. Subclasses must override and implement this method
   * @param player Player
   * @param event Event
   */
  recordEvent(player: Player, event: Event): void {
    throw new Error("Method not implemented.");
  }

  /**
   * **`recordAchievement`** registers that the given `player` achieved the `acheivement`
   * This method is not implemented in the base DataStore object. Subclasses must override and implement this method
   * @param player Player
   * @param achievement Achievement
   */
  recordAchievement(player: Player, achievement: Achievement): void {
    throw new Error("Method not implemented.");
  }

  /**
   * **`getPlayer`** returns the player object for the player with the given `player.id`.
   * This method is not implemented in the base DataStore object. Subclasses must override and implement this method.
   * @param player Player
   * @returns GamePlayer
   */
  getPlayer(player: Player): GamePlayer | undefined {
    throw new Error("Method not implemented.");
  }

  /**
   * **`getPlayerHistory`** returns an array of events experienced by the player with the given `player.id`.
   * By default this method simply invokes `.history` on the value obtained from `getPlayer`.
   * @param player Player
   * @returns Player History
   */
  getPlayerHistory(player: Player): HistoryItem[] {
    return this.getPlayer(player)?.history ?? [];
  }

  /**
   * **`getPlayerAchievements`** returns an array of achievements achieved by the player with the given `player.id`.
   * By default this method simply invokes `.achievements` on the value obtained from `getPlayer`.
   * @param player Player
   * @returns Player Achievements
   */
  getPlayerAchievements(player: Player): Achievement[] {
    return this.getPlayer(player)?.achievements ?? [];
  }
}
