/**
 * AchievementRule is an (optional) base type for rules that define achievements within the GameEngine.
 *
 * It is not necessary to extend this class to create an achievement rule.
 * Any object that provides the specified properties is sufficient.
 * This base class simply provides a handy place to document these assumptions
 * and to provide default properties that are sufficient for most use cases.
 */
import type { GameEngine, GamePlayer } from "./@types";

/**
 * The `AchievementRule` constructor accepts an optional map of properties.
 *
 * Four properties are recognized:
 */
interface AchievementRuleProps {
  /**
   * **`multiplicity`** -- an integer representing the number of times this
   * achievement can be earned by a single player. A value of `1` indicates
   * that the achievement can be awarded exactly once to a given player. A
   * value of *n* indicates that the achievement can be awarded exactly *n*
   * times to a given player. A value of `0` indicates that the achievement
   * can be awarded an infinite number of times.  Defaults to `0`.
   */
  multiplicity: number;
  /**
   * **`transient`** -- a boolean value indicating whether the achievement,
   * once awarded, becomes a permanent part of the player's game state,
   * or if the conditions must be re-evaluated each time. Defaults to `false`.
   *
   * For example, an achievement such as "logged-in today" might be considered
   * transient while an achievement such as "logged-in at least 10 times" might
   * be considered permanent.
   */
  transient: boolean;
  /**
   * **`key`** -- an identifier for this achievement (as stored within a player's `achievements` container)
   * The `key` attribute can take several forms:
   *  - a scalar string or number that acts as an identifier for this achievement
   *  - an array of strings or numbers, that indicates this single rule can
   *    result in several achivements.  The `predicate` function will be evaluated
   *    once for each element of the array.
   *  - a function that yields a scalar value or an array, in which case the
   *    function is evaluated and the corresponding scalar or array is treated
   *    as above. This function is passed two arguments: a Player object and a
   *    GameEngine instance. It returns a single key or an array of keys.
   *
   * The latter case (the function) can be used to create dynamic identifiers.
   * For example, for an achievement such as "Logged in on <DATE>".
   *
   * No default value is provided for this property. Instances or subclasses must override this property.
   */
  key:
    | string
    | number
    | string[]
    | number[]
    | (string | number)[]
    | ((
        player: GamePlayer,
        engine: GameEngine
      ) => string | number | string[] | number[] | (string | number)[]);
  /**
   * **`predicate`** -- a function (accepting two arguments: a Player object and
   * a GameEngine instance. It returns a boolean after evaluating whether or not the
   * given player has earned this achievement.
   *
   * No default value is provided for this property. Instances or subclasses must override this property.
   */
  predicate: (player: GamePlayer, engine: GameEngine) => boolean;
}

export class AchievementRule {
  multiplicity: AchievementRuleProps["multiplicity"] = 0;
  transient: AchievementRuleProps["transient"] = false;
  key: AchievementRuleProps["key"] = () => {
    throw new Error("Method not implemented.");
  };
  predicate: AchievementRuleProps["predicate"] = () => {
    throw new Error("Method not implemented.");
  };

  /**
   * Note that it is not necessary to pass these properties to the constructor method.
   * They could also be assigned in the subclass implementation or set after the
   * object is constructed.
   */
  constructor(props?: Partial<AchievementRuleProps>) {
    if (props) {
      this.multiplicity = props.multiplicity ?? this.multiplicity;
      this.transient = props.transient ?? this.transient;
      this.key = props.key ?? this.key;
      this.predicate = props.predicate ?? this.predicate;
    }
  }
}
