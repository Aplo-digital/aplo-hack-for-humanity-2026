import { useEffect, useMemo } from "react"
import { divIcon, latLngBounds } from "leaflet"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { TYPE } from "@/components/design-system"
import { shopLabel, shopsForPlan, type PlanShop } from "@/lib/shops"
import type { PlanGroup } from "@/lib/types"

const ADELAIDE: [number, number] = [-34.93, 138.6]
const MARKER_COLOURS = ["var(--pine)", "var(--terracotta)"]

// A drawn circle instead of Leaflet's default image marker, whose paths break under Vite.
const markerIcon = (colour: string) =>
  divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
    html: `<span style="display:block;width:22px;height:22px;border-radius:9999px;background:${colour};border:3px solid #fff;box-shadow:0 1px 4px rgb(31 59 49 / 0.35)"></span>`,
  })

const ICONS = MARKER_COLOURS.map(markerIcon)

export default function PlanMap({ plan }: { plan: PlanGroup[] }) {
  const shops = useMemo(() => shopsForPlan(plan), [plan])
  const charities = useMemo(
    () => [...new Set(shops.flatMap((entry) => entry.charities))],
    [shops]
  )
  const iconFor = (entry: PlanShop) =>
    ICONS[charities.indexOf(entry.charities[0]) % ICONS.length]

  return (
    <div className="flex flex-col gap-3">
      <div className="h-[60vh] overflow-hidden rounded-2xl ring-1 ring-border">
        <MapContainer
          center={ADELAIDE}
          zoom={11}
          className="size-full"
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <FitToShops shops={shops} />
          {shops.map((entry) => (
            <Marker
              key={entry.shop.id}
              position={[entry.shop.lat, entry.shop.lon]}
              icon={iconFor(entry)}
              title={shopLabel(entry.shop)}
            >
              <Popup>
                <ShopPopup entry={entry} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {charities.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 px-1">
          {charities.map((charity, index) => (
            <li key={charity} className="flex items-center gap-1.5">
              <span
                className="size-3 rounded-full"
                style={{
                  background: MARKER_COLOURS[index % MARKER_COLOURS.length],
                }}
              />
              <span className={TYPE.caption}>{charity}</span>
            </li>
          ))}
        </ul>
      )}
      <p className={`${TYPE.caption} px-1`}>
        Shops come from OpenStreetMap. Some are missing. Check with the store
        before you drop things off.
      </p>
    </div>
  )
}

function ShopPopup({ entry }: { entry: PlanShop }) {
  const { shop, items } = entry
  return (
    <div className="flex max-w-56 flex-col gap-1 font-sans">
      <strong className="font-heading text-base font-normal">
        {shopLabel(shop)}
      </strong>
      {shop.address && <span className="text-sm">{shop.address}</span>}
      <span className="text-sm text-muted-foreground">
        You can bring:{" "}
        {items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}
      </span>
    </div>
  )
}

function FitToShops({ shops }: { shops: PlanShop[] }) {
  const map = useMap()
  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize()
      if (shops.length > 0) {
        map.fitBounds(
          latLngBounds(shops.map(({ shop }) => [shop.lat, shop.lon])),
          { padding: [28, 28], maxZoom: 14 }
        )
      }
    }, 50)
    return () => window.clearTimeout(timer)
  }, [map, shops])
  return null
}
