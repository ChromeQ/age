# **AGE** -- Abstract Gamification Engine.

This is a rewrite of (rodw/age)[https://github.com/rodw/age] from coffeescript to TypeScript. Mostly it is the same but with some notable changes:

1. Renamed all methods from snake_case to camelCase
2. Achievement Rules are evaluated on event received rather than on `getPlayerAchievments`
3. Achieved Achievements are also added to the `player.history`
4. Transient rules are not yet implemented
5. History entries are objects with a timestamp Date, and Achievements have an `achieved` Date
6. Methods return values rather than replying on Node style callbacks with errors

## Installation

```bash
npm install @chromeq/age
```

## Examples

For a detailed example of how to use the AGE framework, visit the base project [example docs](https://github.com/rodw/age/blob/master/docs/stack-exchange-example.litcoffee).

## Usage

Clients must: 

1. Initialise the ***GameEngine*** and register ***players***. [Further Docs](https://github.com/rodw/age/blob/master/docs/stack-exchange-example.litcoffee#implementing-the-game)
```ts
import { GameEngine } from '@chromeq/age';

// Create a new instance of the gamification engine
const engine = new GameEngine();

// Register the "player" -- any object that contains at least an `id`
const player = { id: 123 };
engine.addPlayer(player);
```

2. Define ***achievement rules*** which define conditions that ***players*** must meet in order to earn the corresponding ***achievement***. [Further Docs](https://github.com/rodw/age/blob/master/docs/stack-exchange-example.litcoffee#age-achievement-rules)
```ts
const rule = new AchievementRule({
    key: 'SessionCount',
    multiplicity: 1,
    transient: false,
    predicate: (player, engine) => {
        return sessionCount > 3; // Any logic required to evaluate to `boolean`
    },
});

// Add the achievemt rule to the engine -- Can also be defined first and provided to the GameEngine constructor
engine.addAchievementRule(rule);
```

3. Publish ***events*** that represent actions or events that add to a player's ***event history***.
```ts
// Add an event that happens -- Also has alias `trigger`, `triggerEvent`, `dispatch` or `dispatchEvent`
engine.addEvent(player, 'SessionCount'); // TODO: Add extra data to the event
```

4. Subscribe to ***events*** or ***achievements***
```ts
// Subscribe to `'achievement-achieved'` or `'event-occurred'` -- Also has alias `listen`, `addListner` or `addEventListner`

engine.on('event-occurred', async (player, event) => {
    // Useful to "chain" events and you can call `engine.addEvent` again here
    console.log('EVENT OCCURRED', player, event);
});

engine.on('achievement-achieved', async (player, achievement) => {
    // Congrats 🎉 - Show the appropriate UI or save state
    console.log('ACHIEVEMENT ACHIEVED', player, achievement);
});
```

