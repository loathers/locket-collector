# locket-collector

Add monsters to your combat lover's locket.

To install, run the following command on an up-to-date [KolMafia](https://github.com/kolmafia/kolmafia) version:

```
git checkout loathers/locket-collector release
```

To update, run `git update` or check the "Update installed Git projects on login" box within Mafia preferences.

## Running Locko

To run locko, run the following command in the mafia GCLI:

`locko monster="MONSTER TO FIND"`

or

`locko location="LOCATION TO FIND ALL MONSTERS"`

You can specify the number of turns to run (use negative numbers for the number of turns remaining) with the turns argument. The following example will use 10 turns.

`locko monster="rushing bum" turns=10`

## Warnings

* Cannot be used if you don't have any reminisces left, as there tracking the captured monsters is not supported.
* Currently only searches for monsters that always exist in a zone and cannot follow choice adventures. It is possible mafia has bad data and a monster won't be found, but generally it should be correct.
* If a monster is copyable and not locketable, the script should abort after it is encountered, but no guarentee this works and turns could be wasted. This may be due to missing data in mafia and could be reported.
* Various choice adventures are not handled and could cause problems.
