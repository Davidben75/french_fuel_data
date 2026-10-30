"use client"

import { useState } from "react"
import { Loader2, MapPin, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React from "react"

const FUEL_TYPES = [
  { value: "sp95", label: "SP95" },
  { value: "sp98", label: "SP98" },
  { value: "e10", label: "E10" },
  { value: "e85", label: "E85" },
  { value: "gazole", label: "Gazole" },
  { value: "gplc", label: "GPLC" },
] as const

type FuelType = (typeof FUEL_TYPES)[number]["value"]

export function FuelRadiusSearch({
  onSearch,
  isLoading = false,
}: {
  onSearch: (values: { fuelType: FuelType; radiusM: number }) => void
  isLoading?: boolean
}) {
  const [fuelType, setFuelType] = useState<FuelType>("sp95")
  const [radiusKm, setRadiusKm] = useState("10")

  const parsedRadius = Number(radiusKm)
  const isValid =
    Number.isFinite(parsedRadius) && parsedRadius > 0 && parsedRadius <= 100
  const convertRadiusinM = parsedRadius * 1000

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!isValid) return

    onSearch({ fuelType, radiusM: convertRadiusinM })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fuel-type">Carburants</Label>

        <Select
          value={fuelType}
          onValueChange={(value) => setFuelType(value as FuelType)}
        >
          <SelectTrigger id="fuel-type" className="w-full">
            <SelectValue placeholder="Select fuel" />
          </SelectTrigger>

          <SelectContent>
            {FUEL_TYPES.map((fuel) => (
              <SelectItem key={fuel.value} value={fuel.value}>
                {fuel.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="radius">Rayon</Label>

        <InputGroup>
          <InputGroupAddon>
            <MapPin className="size-4 text-muted-foreground" />
          </InputGroupAddon>

          <InputGroupInput
            id="radius"
            type="number"
            inputMode="decimal"
            min={1}
            max={100}
            step={1}
            value={radiusKm}
            onChange={(event) => setRadiusKm(event.target.value)}
            placeholder="10"
            aria-invalid={!isValid}
          />

          <InputGroupAddon align="inline-end">
            <InputGroupText>km</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Searching…
          </>
        ) : (
          <>
            <Search className="size-4" />
            Rechercher
          </>
        )}
      </Button>
    </form>
  )
}
