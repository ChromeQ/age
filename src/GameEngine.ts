/**
 * The **GameEngine** fulfills two primary roles:
 *
 *  - It offers a centralized API that used by internal and external
 *    clients to inspect or act on the current game state.
 *
 *  - It implements the logic that drives the game itself -- evaluating
 *    whether achievements have been achieved, etc.
 *
 * The GameEngine is an `EventEmitter`, emitting events when an
 * event has occured or an achievement has been achieved.
 */
import type {
  Achievement,
  Event,
  GamePlayer,
  HistoryItem,
  Player,
} from "./@types";
import { AchievementRule } from "./AchievementRule";
import { DataStore } from "./DataStore";
import { MemoryDataStore } from "./MemoryDataStore";
import { EventEmitter, Listener } from "events";
import { countAchievement } from "./utils";

interface GameEngineProps {
  /**
   * **datastore** -- A DataStore instance (defaults to `MemoryDataStore`)
   */
  datastore: DataStore;
  /**
   * **achievementRules** -- An array of achievement rules (default to empty array)
   */
  achievementRules: AchievementRule[];
}

type GAME_ENGINE_ACHIEVEMENT_ACHIEVED = "achievement-achieved";
type GAME_ENGINE_EVENT_OCCURRED = "event-occurred";
type AchievementAchievedListener = (
  player: Player,
  achievement: Achievement,
  engine: GameEngine
) => void;
type EventOccurredListener = (
  player: Player,
  event: Event,
  engine: GameEngine
) => void;

export class GameEngine extends EventEmitter {
  /**
   * `GameEngine.AGE_ACHIEVED` is the event type used when a player
   * has earned an achievement. The corresponding EventEmitter event
   * object will contain three properities:
   *
   * 1. `player` -- the player that earned this achievement
   * 2. `achievement` -- the achievement that was earned
   * 3. `engine` -- this GameEngine instance
   */
  private AGE_ACHIEVED: GAME_ENGINE_ACHIEVEMENT_ACHIEVED =
    "achievement-achieved";

  /**
   * `GameEngine.AGE_EVENT` is the event type used when an event has
   * occurred. The corresponding EventEmitter event object will contain
   * three properities:
   *
   * 1. `player` -- the player to which the event occurred
   * 2. `event` -- the event that occurred
   * 3. `engine` -- this GameEngine instance
   */
  private AGE_EVENT: GAME_ENGINE_EVENT_OCCURRED = "event-occurred";

  private datastore: DataStore;
  private achievementRules: AchievementRule[] = [];
  private _on: EventEmitter["on"];

  /**
   * **GameEngine** constructor accepts two optional props.
   */
  constructor(props?: Partial<GameEngineProps>) {
    super();
    this.datastore = props?.datastore || new MemoryDataStore();
    this.achievementRules = props?.achievementRules || this.achievementRules;

    this._on = super.on;
  }

  /**
   * **`addPlayer`** ensures that a player object exists for the given `player`.
   * The `player` MUST have an `id` property.
   * @param player Player
   */
  addPlayer(player: Player): void {
    this.datastore.recordPlayer(player);
  }

  /**
   * **`addEvent`** reports that the given `event` occurred for the given `player`.
   *
   * This method will emit a `GameEngine.AGE_EVENT` message to any registered listeners.
   * @param player Player
   * @param event Event
   */
  addEvent(player: Player, eventName: Event["name"]): void {
    const event: Event = {
      name: eventName,
    };

    this.datastore.recordEvent(player, event);

    this.emit(this.AGE_EVENT, player, event, this);

    const gamePlayer = this.getPlayer(player);
    if (gamePlayer) {
      this.achievementRules.forEach((rule) => {
        this.evaluateAchievementRule(gamePlayer, rule);
      });
    }
  }

  /**
   * **`addAchievement`** reports that the given `player` achieved the specified `achievement`.
   *
   * This method will emit a `GameEngine.AGE_ACHIEVED` message to any registered listeners.
   * @param player Player
   * @param achievementName Achievement Name
   */
  private addAchievement(
    player: Player,
    achievementName: Achievement["name"]
  ): void {
    const achievement: Achievement = {
      name: achievementName,
      achieved: new Date(),
    };

    this.datastore.recordAchievement(player, achievement);

    this.emit(this.AGE_ACHIEVED, player, achievement, this);
  }

  /**
   * **`addAchievementRule`** registers a new achievement rule with the GameEngine.
   * Subsequent invocations of `getPlayerAchievements` will evaluate the given
   * achievement rule.
   *
   * See the `AchievementRule` type for more details.
   * @param rule Achievement Rule
   */
  addAchievementRule(rule: AchievementRule): void {
    this.achievementRules.push(rule);
  }

  /**
   * **`getPlayer`** will fetch the player object specified by `player.id`.
   * @param player Player
   * @returns GamePlayer
   */
  getPlayer(player: Player): GamePlayer | undefined {
    return this.datastore.getPlayer(player);
  }

  /**
   * **`getPlayerHistory`** returns an array of events experienced by the player with the given `player.id`.
   * By default this method simply invokes `.history` on the value obtained from `getPlayer`.
   * @param player Player
   * @returns Player History
   */
  getPlayerHistory(player: Player): HistoryItem[] {
    return this.datastore.getPlayerHistory(player);
  }

  /**
   * **`getPlayerAchievements`** returns an array of achievements achieved by the player with the given `player.id`.
   * By default this method simply invokes `.achievements` on the value obtained from `getPlayer`.
   * @param player Player
   * @returns Player Achievements
   */
  getPlayerAchievements(player: Player): Achievement[] {
    return this.datastore.getPlayerAchievements(player);
  }

  /**
   * **`evaluateAchievementRule`** is a private utility method.
   * This method will evaluate the given `rule` for the given `player` by
   * parsing the keys in order to invoke the predicate for each key.
   * @param player Player
   * @param rule Achievement Rule
   */
  private evaluateAchievementRule(player: GamePlayer, rule: AchievementRule) {
    const key =
      typeof rule.key === "function" ? rule.key(player, this) : rule.key;
    const keys = Array.isArray(key) ? key : [key];

    keys.forEach((key) => {
      this.evaluateSingleAchievement(player, key, rule);
    });
  }

  /**
   * **`evaluateSingleAchievement`** is a private utility method.
   * This method will evaluate the given `rule` for the given `player`
   * and make the requisite changes to the game state.
   * @param player Player
   * @param key Key
   * @param rule Achievement Rule
   */
  private evaluateSingleAchievement(
    player: GamePlayer,
    key: Achievement["name"],
    rule: AchievementRule
  ) {
    if (rule.multiplicity > 0) {
      const count = countAchievement(
        player.achievements,
        key,
        rule.multiplicity
      );

      if (count >= rule.multiplicity) {
        return;
      }
    }

    const achieved = rule.predicate(player, this);
    if (achieved) {
      player.achievements;

      if (!rule.transient) {
        this.addAchievement(player.data, key);
      } else {
        throw new Error("TODO: Transient rules not implemented");
      }
    }
  }

  on(
    type: GAME_ENGINE_ACHIEVEMENT_ACHIEVED,
    listener: AchievementAchievedListener
  ): typeof this;
  on(
    type: GAME_ENGINE_EVENT_OCCURRED,
    listener: EventOccurredListener
  ): typeof this;
  on(type: string, listener: Listener) {
    this._on.call(this, type, listener);

    return this;
  }

  /**
   * **`listen`** An alias for `EventEmitter.on`
   */
  listen = this.on;
  /**
   * **`addListener`** An alias for `EventEmitter.on`
   */
  addListener = this.on;
  /**
   * **`addEventListener`** An alias for `EventEmitter.on`
   */
  addEventListener = this.on;

  /**
   * **`dispatch`** An alias for `GameEngine.addEvent`
   */
  dispatch = this.addEvent;
  /**
   * **`dispatchEvent`** An alias for `GameEngine.addEvent`
   */
  dispatchEvent = this.addEvent;
  /**
   * **`trigger`** An alias for `GameEngine.addEvent`
   */
  trigger = this.addEvent;
  /**
   * **`triggerEvent`** An alias for `GameEngine.addEvent`
   */
  triggerEvent = this.addEvent;
}
