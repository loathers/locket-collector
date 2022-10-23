import { Args } from "grimoire-kolmafia";
import { descToItem, inebrietyLimit, isDarkMode, Item, myAdventures, myFamiliar, myInebriety, print, runChoice, visitUrl } from "kolmafia";
import { $familiar, get, SourceTerminal } from "libram";

/**
 * Find the best element of an array, where "best" is defined by some given criteria.
 * @param array The array to traverse and find the best element of.
 * @param optimizer Either a key on the objects we're looking at that corresponds to numerical values, or a function for mapping these objects to numbers. Essentially, some way of assigning value to the elements of the array.
 * @param reverse Make this true to find the worst element of the array, and false to find the best. Defaults to false.
 */
 export function maxBy<T>(
    array: T[] | readonly T[],
    optimizer: (element: T) => number,
    reverse?: boolean
  ): T;
  export function maxBy<S extends string | number | symbol, T extends { [x in S]: number }>(
    array: T[] | readonly T[],
    key: S,
    reverse?: boolean
  ): T;
  export function maxBy<S extends string | number | symbol, T extends { [x in S]: number }>(
    array: T[] | readonly T[],
    optimizer: ((element: T) => number) | S,
    reverse = false
  ): T {
    if (typeof optimizer === "function") {
      return maxBy(
        array.map((key) => ({ key, value: optimizer(key) })),
        "value",
        reverse
      ).key;
    } else {
      return array.reduce((a, b) => (a[optimizer] > b[optimizer] !== reverse ? a : b));
    }
  }

export function shouldRedigitize(): boolean {
    const digitizesLeft = SourceTerminal.getDigitizeUsesRemaining();
    const monsterCount = SourceTerminal.getDigitizeMonsterCount() + 1;
    // triangular number * 10 - 3
    const digitizeAdventuresUsed = monsterCount * (monsterCount + 1) * 5 - 3;
    // Redigitize if fewer adventures than this digitize usage.
    return (
      SourceTerminal.have() &&
      SourceTerminal.canDigitize() &&
      myAdventures() / 0.96 < digitizesLeft * digitizeAdventuresUsed
    );
  }

const HIGHLIGHT = isDarkMode() ? "yellow" : "blue";
export function printh(message: string) {
  print(message, HIGHLIGHT);
}

export function printd(message: string) {
  if (args.debug) {
    print(message, HIGHLIGHT);
  }
}

export function sober() {
  return myInebriety() <= inebrietyLimit() + (myFamiliar() === $familiar`Stooper` ? -1 : 0);
}

export const args = Args.create("chrono", "A script for farming chroner", {
  turns: Args.number({
    help: "The number of turns to run (use negative numbers for the number of turns remaining)",
    default: Infinity,
  }),
  monster: Args.string({
    help: "The monster to add to your locket",
    default: "",
  }),
  location: Args.string({
    help: "The location to add all available monsters from to your locket",
    default: "",
  }),
  debug: Args.flag({
    help: "Turn on debug printing",
    default: false,
  }),
});

function getCMCChoices(): { [choice: string]: number } {
    const options = visitUrl("campground.php?action=workshed");
    let i = 0;
    let match;
    const entries: [string, number][] = [];
  
    const regexp = /descitem\((\d+)\)/g;
    while ((match = regexp.exec(options)) !== null) {
      entries.push([`${descToItem(match[1])}`, ++i]);
    }
    return Object.fromEntries(entries);
  }
  
  export function tryGetCMCItem(item: Item): void {
    const choice = getCMCChoices()[`${item}`];
    if (choice) {
      runChoice(choice);
    }
  }
  
  export type CMCEnvironment = "u" | "i";
  export function countEnvironment(environment: CMCEnvironment): number {
    return get("lastCombatEnvironments")
      .split("")
      .filter((e) => e === environment).length;
  }
  
  export type RealmType = "spooky" | "stench" | "hot" | "cold" | "sleaze" | "fantasy" | "pirate";
  export function realmAvailable(identifier: RealmType): boolean {
    if (identifier === "fantasy") {
      return get(`_frToday`) || get(`frAlways`);
    } else if (identifier === "pirate") {
      return get(`_prToday`) || get(`prAlways`);
    }
    return get(`_${identifier}AirportToday`, false) || get(`${identifier}AirportAlways`, false);
  }
  