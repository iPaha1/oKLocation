// app/(routes)/location/components/locations-details-display.tsx
"use client"

import { OpenStreetLocationDetails } from './open-street-location-details'

export default function OpenStreetLocationsDetailsDisplay() {
  return (
    <div className="min-h-screen">
      <OpenStreetLocationDetails />
    </div>
  )
}