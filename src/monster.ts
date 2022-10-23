import {
  adv1,
  appearanceRates,
  canAdventure,
  Location,
  Monster,
  toLocation,
  toMonster,
} from "kolmafia";
import {
  $item,
  $location,
  $locations,
  CombatLoversLocket,
  get,
  getKramcoWandererChance,
} from "libram";

import { LocketQuest, LocketStrategy } from "./engine";
import { sober } from "./lib";
import Macro from "./macro";
import { chooseQuestOutfit, ifHave } from "./outfit";

let lastFoughtMonster: Monster | null = null;

function monsterComplete(monster: Monster): boolean {
  const locketMonsters = CombatLoversLocket.unlockedLocketMonsters();
  if (lastFoughtMonster === monster && !locketMonsters.includes(lastFoughtMonster)) {
    throw `${monster} not added to locket successfully, is it invalid?`;
  }

  return locketMonsters.includes(monster);
}

function monsterLocation(monster: Monster): Location {
  for (const location of Location.all()) {
    if (!canAdventure(location)) continue;
    const rates = appearanceRates(location, true);
    for (let key in rates) {
      if (rates[key] <= 0) continue;
      const rateMonster = toMonster(key);
      if (!rateMonster.copyable || rateMonster.boss) continue;
      if (rateMonster === monster) return location;
    }
  }
  return $location`none`;
}

export function monsterQuest(monster: Monster): LocketQuest {
  if (!monster.copyable || monster.boss) {
    throw "You can't locket this monster";
  }
  const location = monsterLocation(monster);
  return {
    name: "Monster",
    location,
    tasks: [
      {
        name: `${monster}`,
        ready: () => canAdventure(location),
        completed: () => monsterComplete(monster),
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
