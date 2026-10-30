# F12 Boundaries

Shapes to map any SA2 dataset (LGA and postcode shapes too).

| | |
| --- | --- |
| Publisher | Australian Bureau of Statistics |
| Source page | <https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/access-and-downloads/digital-boundary-files> |
| Level | SA2, LGA, postcode |
| Period | 2021 edition |
| Downloaded | 3 October 2026, not changed |
| Licence | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); full text in [`LICENCES/CC-BY-4.0.txt`](../../LICENCES/CC-BY-4.0.txt) |

## Credit line

Put this in your README if you use this dataset:

> Australian Bureau of Statistics, Australian Statistical Geography Standard (ASGS) Edition 3, digital boundary files.

## Files

Not in this repo: the shapes cover all of Australia and are 40 to 56 MB each. Download only
the one your map needs from the source page above:

| File | Size | Use it to map |
| --- | --- | --- |
| `LGA_2025_AUST_GDA2020.zip` | 40.7 MB | council areas |
| `POA_2021_AUST_GDA2020_SHP.zip` | 55.9 MB | postcodes |
| `SA2_2021_AUST_SHP_GDA2020.zip` | 50.7 MB | SA2 areas |

Put the zip in this folder, keep only South Australian shapes (state code 4), and save them as
a small GeoJSON file for the app. Commit the GeoJSON, not the zip.

More about this dataset and what it joins with: the [data guide](../../README.md).
