import { Quest } from "grimoire-kolmafia";
import { itemAmount, myHp, myMaxhp, putCloset, runChoice, useSkill, visitUrl } from "kolmafia";
import { $effect, $effects, $familiar, $item, $skill, get, have, SongBoom, uneffect } from "libram";

import { LocketTask } from "./engine";

const poisons = $effects`Hardly Poisoned at All, A Little Bit Poisoned, Somewhat Poisoned, Really Quite Poisoned, Majorly Poisoned`;

export const setup: Quest<LocketTask> = {
  name: "Setup",
  tasks: [
    {
      name: "Beaten Up",
      completed: () => !have($effect`Beaten Up`),
      do: () => {
        if (["Poetic Justice", "Lost and Found"].includes(get("lastEncounter"))) {
          uneffect($effect`Beaten Up`);
        }
        if (have($effect`Beaten Up`)) {
          throw "Got beaten up for no discernable reason!";
        }
      },
      sobriety: "either",
    },
    {
      name: "Disco Nap",
      ready: () => have($skill`Disco Nap`) && have($skill`Adventurer of Leisure`),
      completed: () => poisons.every((e) => !have(e)),
      do: () => useSkill($skill`Disco Nap`),
      sobriety: "either",
    },
    {
      name: "Antidote",
      completed: () => poisons.every((e) => !have(e)),
      do: () => poisons.forEach((e) => uneffect(e)),
      sobriety: "either",
    },
    {
      name: "Recover",
      ready: () => have($skill`Cannelloni Cocoon`),
      completed: () => myHp() / myMaxhp() >= 0.5,
      do: () => {
        useSkill($skill`Cannelloni Cocoon`);
      },
      sobriety: "either",
    },
    {
      name: "Recover Failed",
      completed: () => myHp() / myMaxhp() >= 0.5,
      do: () => {
        throw "Unable to heal above 50% HP, heal yourself!";
      },
      sobriety: "either",
    },
    {
      name: "Kgnee",
      ready: () => have($familiar`Reagnimated Gnome`),
      completed: () =>
        !have($familiar`Reagnimated Gnome`) || have($item`gnomish housemaid's kgnee`),
      do: (): void => {
        visitUrl("arena.php");
        runChoice(4);
      },
      outfit: { familiar: $familiar`Reagnimated Gnome` },
      sobriety: "sober",
    },
    {
      name: "Closet Sand Dollars",
      completed: () => itemAmount($item`sand dollar`) === 0,
      do: () => putCloset(itemAmount($item`sand dollar`), $item`sand dollar`),
      sobriety: "either",
    },
    {
      name: "Closet Hobo Nickels",
      completed: () =>
        itemAmount($item`hobo nickel`) === 0 ||
        (!have($familiar`Hobo Monkey`) && !have($item`hobo nickel`, 1000)),
      do: () => putCloset(itemAmount($item`hobo nickel`), $item`hobo nickel`),
      sobriety: "either",
    },
    {
      name: "Boombox",
      completed: () =>
        !SongBoom.have() ||
        SongBoom.song() === "Food Vibrations" ||
        SongBoom.songChangesLeft() === 0,
      do: () => SongBoom.setSong("Food Vibrations"),
      sobriety: "either",
    },
  ],
};
