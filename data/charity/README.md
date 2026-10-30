# Charity data for our idea

Refresh both files with `python scripts/fetch_charity_data.py`. Downloaded 30 October 2026.

## acnc_sa_charities.csv

6,347 registered charities that operate in South Australia, from the ACNC Charity Register.

- **What a row is:** one charity, with its registered address, website, size, and `Y` flags for
  what it does and who it helps (`People_at_risk_of_homelessness`, `Families`,
  `Migrants_Refugees_or_Asylum_Seekers`, `Victims_of_Disasters`, `Aged_Persons` and more).
- **Use it for:** matching items to need. Kitchenware and linen suit charities that help
  refugees or people at risk of homelessness; kids' things suit charities that help families.
- **Careful:** the address is the registered office, not a shop. Big charities (Salvos, Vinnies)
  appear once, often with an interstate address. A charity listed here may not take goods at
  all. Charities can ask the ACNC to withhold details, so some are missing.
- **Source:** [ACNC Register on data.gov.au](https://data.gov.au/data/dataset/acnc-register)
- **Licence:** [CC BY 3.0 AU](https://creativecommons.org/licenses/by/3.0/au/)
- **Credit line:** Australian Charities and Not-for-profits Commission, ACNC Registered
  Charities, data.gov.au, licensed under CC BY 3.0 AU.

## osm_sa_charity_shops.csv

131 charity shops (`shop=charity`, 93) and second-hand shops (`shop=second_hand`, 38) in SA, with
map coordinates. Includes 22 Vinnies, 14 Salvos, and Red Cross, RSPCA, Lifeline and Savers shops.

- **Use it for:** a "nearest drop-off" map and list.
- **Careful:** volunteers map these, so it's incomplete. Only 48 have a street address and 36
  have opening hours; some have no name. Savers is a business, not a charity. Tell people to
  check with the store before they go.
- **Source:** [OpenStreetMap](https://www.openstreetmap.org/), queried through the Overpass API
- **Licence:** [ODbL](https://opendatacommons.org/licenses/odbl/). If we publish a changed
  version of this file, it stays under ODbL.
- **Credit line:** © OpenStreetMap contributors. Show this on the map and in the README.

## Also useful, already in this repo

- **SA textile waste for the pitch:** `data/extras/3_sustainability/S10_nwrr-database-2026/`.
  In 2024–25, SA sent about 28,800 tonnes of textiles, leather and rubber to landfill and
  recycled about 9,500 tonnes (sheet `Database`, header row 2, `Jurisdiction` SA, `Year`
  2024–25, `Classification` Category). The landfill figure is recorded under business waste,
  so household clothing may be counted elsewhere. Say "about" and credit the source.
- **Where need is highest:** DSS payment recipients by area
  (`data/4_foundation/F8_dss-payment-demographics/`) and SEIFA disadvantage
  (`data/4_foundation/F4_seifa-2021/`).
