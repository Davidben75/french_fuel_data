"use client"
import {
  Map,
  MapTileLayer,
  MapMarker,
  MapZoomControl,
  MapLocateControl,
  MapPopup,
} from "@/components/ui/map"
import { divIcon, type LatLngExpression } from "leaflet"
import { Fuel, MapPin } from "lucide-react"
import React, { useCallback, useEffect, useState } from "react"
import { FuelRadiusSearch } from "@/components/fuel-radius-search"
import axios from "axios"

type Station = {
  id: number
  adresse: string
  cp: string
  ville: string
  lat: number
  lon: number
  price: number
  fuel: string
  distance_m: number
  geojson: Geojson
}

type Geojson = {
  type: string
  coordinates: [number, number]
}

const DEFAULT_POSITION: LatLngExpression = [48.856614, 2.3522219]

export default function MyMap() {
  const [currentPosition, setCurrentPosition] =
    useState<LatLngExpression>(DEFAULT_POSITION)
  const [filters, setFilters] = useState()
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!("geolocation" in navigator)) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCurrentPosition([coords.latitude, coords.longitude])
      },
      (err) => {
        console.warn("Geolocation failed:", err.message)
        // keeps DEFAULT_POSITION as fallback
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  }, [])

  const fetchStations = useCallback(
    async (values: any, position: LatLngExpression) => {
      // LatLngExpression can be [lat, lng] or { lat, lng } — normalize
      const [lat, lon] = Array.isArray(position)
        ? position
        : [position.lat, position.lng]

      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.get<Station[]>(
          `${process.env.NEXT_PUBLIC_API_URL}stations/nearest`,
          {
            params: {
              lat,
              lon,
              radiusM: values.radiusM,
              fuel: values.fuelType,
            },
          }
        )
        setStations(data)
        console.log(data)
      } catch (e) {
        const msg = axios.isAxiosError(e)
          ? (e.response?.data?.message ?? e.message)
          : "Unknown error"
        setError(msg)
        console.log(e)
        setStations([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (!filters) return
    console.log(filters)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStations(filters, currentPosition)
  }, [filters, currentPosition, fetchStations])

  return (
    <>
      {/* SEARCH INPUT  */}
      <div className="border-b bg-background p-4">
        <FuelRadiusSearch
          isLoading={false}
          onSearch={(values) => {
            setFilters(values)
            // Trigger your map search / API call here
          }}
        />
      </div>

      {/* MAP CONTENT */}
      <div className="h-dvh w-full overflow-hidden p-2 sm:p-4 md:p-8">
        <div className="relative h-full w-full overflow-hidden rounded-xl border shadow-sm">
          <Map
            center={currentPosition}
            zoom={12}
            className="h-full w-full touch-pan-y"
          >
            {stations &&
              stations.map((station, index) => (
                <MapMarker
                  key={station.id}
                  position={[
                    station.geojson.coordinates[1],
                    station.geojson.coordinates[0],
                  ]}
                  icon={
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-xs font-bold text-white shadow-md">
                      {index + 1}
                    </div>
                  }
                >
                  <MapPopup className="w-56">
                    <div className="space-y-1 p-1">
                      <p className="font-semibold">{station.adresse}</p>
                      <br />
                      <p className="text-sm text-muted-foreground">
                        {station.cp} {station.ville}
                      </p>
                      <br />
                      <p className="text-sm">Prix : {station.price}€ </p>
                      <br />
                      <p className="text-sm">
                        Distance : {Math.floor(station.distance_m / 1000)} km
                      </p>
                    </div>
                  </MapPopup>
                </MapMarker>
              ))}
            <MapTileLayer />

            <div className="absolute top-[calc(env(safe-area-inset-top)+0.5rem)] left-[calc(env(safe-area-inset-left)+0.5rem)] z-[1000] grid gap-1">
              <MapZoomControl className="static" />
              <MapLocateControl className="static" />
            </div>

            <MapMarker
              position={currentPosition}
              icon={<MapPin className="size-6 text-[#009dff]" />}
            />
          </Map>
        </div>
      </div>
    </>
  )
}
