import { Args, getTasks, Quest } from "grimoire-kolmafia";
import {
  adv1,
  Location,
  myAdventures,
  myTurncount,
  print,
  toLocation,
  toMonster,
  totalTurnsPlayed,
} from "kolmafia";
import {
  $item,
  $location,
  $skill,
  CombatLoversLocket,
  Counter,
  get,
  getKramcoWandererChance,
  have,
  Session,
  sinceKolmafiaRevision,
  withProperty,
} from "libram";

import { LocketEngine, LocketQuest, LocketStrategy, LocketTask } from "./engine";
import { args, printh, sober } from "./lib";
import { locationMissing, locationQuest } from "./location";
import Macro from "./macro";
import { monsterQuest } from "./monster";
import { chooseQuestOutfit, ifHave } from "./outfit";
import { setup } from "./setup";

export default function main(command?: string): void {
  Args.fill(args, command);

  if (args.help) {
    Args.showHelp(args);
    return;
  }

  sinceKolmafiaRevision(26834);

  if (!have($item`combat lover's locket`)) {
    throw "You don't have a combat lover's locket.";
  }

  if (CombatLoversLocket.reminiscesLeft() === 0) {
    throw "You don't have any reminisces left, will be unable to detect monster list.";
  }

  const turncount = myTurncount();
  const completed =
    args.turns > 0
      ? () => myTurncount() - turncount >= args.turns || myAdventures() === 0
      : () => myAdventures() === -args.turns;

  if (args.location !== "") {
    const location = toLocation(args.location);
    const missing = locationMissing(location);
    if (missing.length === 0) {
      print(`No missing monsters in ${location}`);
      return;
    }
    print(`Missing monsters in ${location}:`);
    for (const monster of missing) {
      print(`* ${monster}`);
    }
  }

  if (args.monster !== "") {
    if (CombatLoversLocket.unlockedLocketMonsters().includes(toMonster(args.monster))) {
      print(`${toMonster(args.monster)} is already in your locket`);
      return;
    }
  }

  let digitizes = -1;

  const quest: LocketQuest =
    args.location !== ""
      ? { ...locationQuest(toLocation(args.location)), completed }
      : { ...monsterQuest(toMonster(args.monster)), completed };
  const global: Quest<LocketTask> = {
    name: "Global",
    completed,
    tasks: [
      {
        name: "Proton Ghost",
        ready: () =>
          have($item`protonic accelerator pack`) &&
          get("questPAGhost") !== "unstarted" &&
          !!get("ghostLocation"),
        do: (): void => {
          const location = get("ghostLocation");
          if (location) {
            adv1(location, 0, "");
          } else {
            throw "Could not determine Proton Ghost location!";
          }
        },
        outfit: () =>
          chooseQuestOutfit(
            { location: quest.location, isFree: true },
            { back: $item`protonic accelerator pack` }
          ),
        completed: () => get("questPAGhost") === "unstarted",
        combat: new LocketStrategy(
          Macro.trySkill($skill`Sing Along`)
            .trySkill($skill`Shoot Ghost`)
            .trySkill($skill`Shoot Ghost`)
            .trySkill($skill`Shoot Ghost`)
            .trySkill($skill`Trap Ghost`)
        ),
        sobriety: "sober",
      },
      {
        name: "Vote Wanderer",
        ready: () =>
          have($item`"I Voted!" sticker`) &&
          totalTurnsPlayed() % 11 === 1 &&
          get("lastVoteMonsterTurn") < totalTurnsPlayed() &&
          get("_voteFreeFights") < 3,
        do: (): void => {
          adv1(quest.location, -1, "");
        },
        outfit: () =>
          chooseQuestOutfit(
            { location: quest.location, isFree: true },
            { acc3: $item`"I Voted!" sticker` },
          ),
        completed: () => get("lastVoteMonsterTurn") === totalTurnsPlayed(),
        combat: new LocketStrategy(Macro.redigitize().standardCombat()),
        sobriety: "either",
      },
      {
        name: "Digitize Wanderer",
        ready: () => Counter.get("Digitize") <= 0,
        outfit: () =>
          chooseQuestOutfit({
            location: quest.location,
            isFree: get("_sourceTerminalDigitizeMonster")?.attributes.includes("FREE"),
          }),
        completed: () => get("_sourceTerminalDigitizeMonsterCount") !== digitizes,
        do: () => {
          adv1(quest.location, -1, "");
          digitizes = get("_sourceTerminalDigitizeMonsterCount");
        },
        combat: new LocketStrategy(Macro.redigitize().standardCombat()),
        sobriety: "either",
      },
      {
        name: "Void Monster",
        ready: () =>
          have($item`cursed magnifying glass`) && get("cursedMagnifyingGlassCount") === 13,
        completed: () => get("_voidFreeFights") >= 5,
        outfit: () =>
          chooseQuestOutfit(
            { location: quest.location, isFree: true },
            { offhand: $item`cursed magnifying glass` }
          ),
        do: quest.location,
        sobriety: "sober",
        combat: new LocketStrategy(Macro.standardCombat()),
      },
    ],
  };

  const engine = new LocketEngine(getTasks([setup, global, quest]));
  engine.print();

  const locketStart = CombatLoversLocket.unlockedLocketMonsters();

  withProperty("recoveryScript", "", () => {
    try {
      engine.run();
    } finally {
      engine.destruct();
    }
  });

  printh(`SESSION RESULTS:`);
  for (const monster of CombatLoversLocket.unlockedLocketMonsters()) {
    if (!locketStart.includes(monster)) {
      printh(`MONSTER ${monster}`);
    }
  }
}
