import Papa from "papaparse"
import shopsCsv from "../../data/charity/osm_sa_charity_shops.csv?raw"
import type { Item, PlanGroup } from "./types"

export type Shop = {
  id: string
  /** Empty when volunteers didn't record a name or brand. */
  name: string
  brand: string
  kind: "charity" | "second_hand"
  lat: number
  lon: number
  address: string
}

export type PlanShop = { shop: Shop; charities: string[]; items: Item[] }

// Which OpenStreetMap shops belong to each charity in data/charities.csv.
const SHOP_MATCHERS: Record<string, RegExp> = {
  "Salvos Stores": /salvo/i,
  "Vinnies SA": /vinnie|st vincent/i,
}

function parseShops(csv: string): Shop[] {
  const { data } = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  })
  return data.flatMap((row) => {
    const lat = Number(row.lat)
    const lon = Number(row.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return []
    const brand = row.brand?.trim() ?? ""
    return [
      {
        id: row.osm_id,
        name: row.name?.trim() || brand,
        brand,
        kind: row.shop === "second_hand" ? "second_hand" : "charity",
        lat,
        lon,
        address: [row.street, row.suburb]
          .map((part) => part?.trim())
          .filter(Boolean)
          .join(", "),
      },
    ]
  })
}

const SHOPS = parseShops(shopsCsv)

export function shopLabel(shop: Shop): string {
  if (shop.name) return shop.name
  return shop.kind === "charity" ? "Charity shop" : "Second-hand shop"
}

function shopsForCharity(charity: string): Shop[] {
  const matcher = SHOP_MATCHERS[charity]
  const matched = matcher
    ? SHOPS.filter((shop) => matcher.test(`${shop.name} ${shop.brand}`))
    : []
  return matched.length > 0
    ? matched
    : SHOPS.filter((shop) => shop.kind === "charity")
}

/** Drop-off shops for the plan's charities, each with the things that can go there. */
export function shopsForPlan(plan: PlanGroup[]): PlanShop[] {
  const byId = new Map<string, PlanShop>()
  for (const { destination, items } of plan) {
    if (destination.kind !== "charity") continue
    for (const shop of shopsForCharity(destination.charity)) {
      const entry = byId.get(shop.id) ?? { shop, charities: [], items: [] }
      if (!entry.charities.includes(destination.charity))
        entry.charities.push(destination.charity)
      entry.items.push(...items)
      byId.set(shop.id, entry)
    }
  }
  return [...byId.values()]
}
