// app/(routes)/location/page.tsx

// import LocationsDetailsDisplay from "./location-details-components/locations-details-display"
import OpenStreetLocationsDetailsDisplay from "./location-details-components/open-street-components/open-street-location-details-display"


export default function LocationPage() {
  return (
  // <LocationsDetailsDisplay />
  <OpenStreetLocationsDetailsDisplay />
)
}