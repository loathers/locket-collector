import { garboAverageValue, garboValue } from "../garboValue";
import { GeneralFamiliar, MenuOptions } from "./lib";
import { Familiar, familiarWeight, weightAdjustment } from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  findLeprechaunMultiplier,
  get,
  have,
  Robortender,
} from "libram";

type ConstantValueFamiliar = {
  familiar: Familiar;
  value: (options: MenuOptions) => number;
};

const standardFamiliars: ConstantValueFamiliar[] = [
  {
    familiar: $familiar`Obtuse Angel`,
    value: () => 0.02 * garboValue($item`time's arrow`),
  },
  {
    familiar: $familiar`Stocking Mimic`,
    value: () =>
      garboAverageValue(...$items`Polka Pop, BitterSweetTarts, Piddles`) / 6 +
      (1 / 3 + (have($effect`Jingle Jangle Jingle`) ? 0.1 : 0)) *
        (familiarWeight($familiar`Stocking Mimic`) + weightAdjustment()),
  },
  {
    familiar: $familiar`Shorter-Order Cook`,
    value: () =>
      garboAverageValue(
        ...$items`short beer, short stack of pancakes, short stick of butter, short glass of water, short white`
      ) / 11,
  },
  {
    familiar: $familiar`Robortender`,
    value: () =>
      garboValue($item`elemental sugarcube`) / 5 +
      (Robortender.currentDrinks().includes($item`Feliz Navidad`)
        ? get("garbo_felizValue", 0) * 0.25
        : 0) +
      (Robortender.currentDrinks().includes($item`Newark`)
        ? get("garbo_newarkValue", 0) * 0.25
        : 0),
  },
  {
    familiar: $familiar`Twitching Space Critter`,

    // Item is ludicrously overvalued and incredibly low-volume.
    // We can remove this cap once the price reaches a lower equilibrium
    // we probably won't, but we can.
    value: () => Math.min(garboValue($item`twitching space egg`) * 0.0002, 690),
  },
  {
    familiar: $familiar`Hobo Monkey`,
    value: () => 75,
  },
  {
    familiar: $familiar`Red-Nosed Snapper`,
    value: ({ location }) =>
      location === $location`Globe Theatre Main Stage`
        ? garboValue($item`human musk`) / 11
        : 0,
  },
  {
    familiar: $familiar`Mosquito`,
    // Acts as default familiar.
    // Extra roses when using an attacking familiar and everyone has this one
    value: () => 1,
  },
];

export default function getConstantValueFamiliars(
  options: MenuOptions = {}
): GeneralFamiliar[] {
  return standardFamiliars
    .filter(({ familiar }) => have(familiar))
    .map(({ familiar, value }) => ({
      familiar,
      expectedValue: value(options),
      leprechaunMultiplier: findLeprechaunMultiplier(familiar),
      limit: "none",
    }));
}
