import { adv1, appearanceRates, canAdventure, Location, Monster, toMonster } from "kolmafia";
import { $item, CombatLoversLocket, get, getKramcoWandererChance } from "libram";

import { LocketQuest, LocketStrategy } from "./engine";
import { sober } from "./lib";
import Macro from "./macro";
import { chooseQuestOutfit, ifHave } from "./outfit";

let lastFoughtMonster: Monster | null = null;

function locationCompleted(location: Location): boolean {
  const rates = appearanceRates(location, true);

  const locketMonsters = CombatLoversLocket.unlockedLocketMonsters();
  if (lastFoughtMonster != null && !locketMonsters.includes(lastFoughtMonster)) {
    throw `${lastFoughtMonster} not added to locket successfully, is it invalid?`;
  }

  for (let key in rates) {
    const monster = toMonster(key);
    if (rates[key] <= 0) continue;
    if (!monster.copyable || monster.boss) continue;
    if (!locketMonsters.includes(monster)) {
      return false;
    }
  }

  return true;
}

export function locationMissing(location: Location): Monster[] {
  const monsters = new Array<Monster>;
  const rates = appearanceRates(location, true);
  const locketMonsters = CombatLoversLocket.unlockedLocketMonsters();
  for (let key in rates) {
    const monster = toMonster(key);
    if (rates[key] <= 0) continue;
    if (!monster.copyable || monster.boss) continue;
    if (!locketMonsters.includes(monster)) {
      monsters.push(monster);
    }
  }
  return monsters;
}

export function locationQuest(location: Location): LocketQuest {
  return {
    name: "Location",
    location,
    tasks: [
      {
        name: `${location}`,
        ready: () => canAdventure(location),
        completed: () => locationCompleted(location),
        do: () => {
          if (adv1(location, -1, "")) {
            let monster = get("lastCopyableMonster");
            if (monster?.copyable && !monster?.boss) {
              lastFoughtMonster = monster;
            }
          }
        },
        outfit: () => {
          const drunkSpec = sober() ? {} : { offhand: $item`Drunkula's wineglass` };
          const sausageSpec =
            getKramcoWandererChance() >= 1 ? ifHave("offhand", $item`Kramco Sausage-o-Matic™`) : {};
          return chooseQuestOutfit(
            { location, isFree: getKramcoWandererChance() >= 1 },
            { acc3: $item`combat lover's locket` },
            sausageSpec,
            drunkSpec
          );
        },
        combat: new LocketStrategy(Macro.standardCombat()),
        sobriety: "either",
      },
    ],
  };
}
