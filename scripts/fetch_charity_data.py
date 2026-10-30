"""Download SA charity data into data/charity/. Run it again any time to refresh.

    python scripts/fetch_charity_data.py

Writes:
  data/charity/acnc_sa_charities.csv   registered charities that operate in SA (ACNC, CC BY 3.0 AU)
  data/charity/osm_sa_charity_shops.csv  op shops with map coordinates (OpenStreetMap, ODbL)
"""

import io
import json
import urllib.parse
import urllib.request
from pathlib import Path

import pandas as pd

OUT = Path(__file__).resolve().parent.parent / "data" / "charity"
ACNC_URL = (
    "https://data.gov.au/data/dataset/b050b242-4487-4306-abf5-07ca073e5594/resource/"
    "8fb32972-24e9-4c95-885e-7140be51be8a/download/datadotgov_main.csv"
)
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
OVERPASS_QUERY = """[out:json][timeout:90];
area["ISO3166-2"="AU-SA"]->.sa;
(nwr["shop"="charity"](area.sa); nwr["shop"="second_hand"](area.sa););
out center tags;"""
USER_AGENT = "aplo-hack-for-humanity-2026 (hackathon project)"

ACNC_COLUMNS = [
    "ABN", "Charity_Legal_Name", "Other_Organisation_Names", "Town_City", "State", "Postcode",
    "Charity_Website", "Charity_Size",
    "Advancing_social_or_public_welfare", "Advancing_natual_environment",
    "Preventing_or_relieving_suffering_of_animals",
    "Aged_Persons", "Children", "Families", "Financially_Disadvantaged",
    "Migrants_Refugees_or_Asylum_Seekers", "People_at_risk_of_homelessness",
    "People_with_Disabilities", "Unemployed_Person", "Veterans_or_their_families",
    "Victims_of_Disasters", "Youth",
]


def fetch(url: str, data: bytes | None = None) -> bytes:
    request = urllib.request.Request(url, data=data, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=180) as response:
        return response.read()


def acnc_sa() -> pd.DataFrame:
    df = pd.read_csv(io.BytesIO(fetch(ACNC_URL)), low_memory=False)
    return df.loc[df["Operates_in_SA"] == "Y", ACNC_COLUMNS]


def osm_sa_shops() -> pd.DataFrame:
    body = urllib.parse.urlencode({"data": OVERPASS_QUERY}).encode()
    elements = json.loads(fetch(OVERPASS_URL, body))["elements"]
    rows = []
    for e in elements:
        tags = e.get("tags", {})
        point = e.get("center", e)
        rows.append({
            "name": tags.get("name", ""),
            "brand": tags.get("brand", ""),
            "shop": tags.get("shop", ""),
            "lat": point.get("lat"),
            "lon": point.get("lon"),
            "street": " ".join(filter(None, [tags.get("addr:housenumber"), tags.get("addr:street")])),
            "suburb": tags.get("addr:suburb") or tags.get("addr:city", ""),
            "postcode": tags.get("addr:postcode", ""),
            "opening_hours": tags.get("opening_hours", ""),
            "website": tags.get("website", ""),
            "osm_id": f"{e['type']}/{e['id']}",
        })
    return pd.DataFrame(rows).sort_values("name")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    charities = acnc_sa()
    charities.to_csv(OUT / "acnc_sa_charities.csv", index=False)
    print(f"{len(charities)} charities operating in SA -> {OUT / 'acnc_sa_charities.csv'}")
    shops = osm_sa_shops()
    shops.to_csv(OUT / "osm_sa_charity_shops.csv", index=False)
    print(f"{len(shops)} SA charity and second-hand shops -> {OUT / 'osm_sa_charity_shops.csv'}")
