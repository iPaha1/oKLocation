import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface MapComponentProps {
  currentLocation: { lat: number; lng: number } | null
  setCurrentLocation: (location: { lat: number; lng: number } | null) => void
}

export function MapComponent({ currentLocation, setCurrentLocation }: MapComponentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)

  useEffect(() => {
    // Initialize Google Maps
    const initMap = () => {
      const mapElement = document.getElementById('map')
      if (mapElement) {
        const mapInstance = new google.maps.Map(mapElement, {
          center: { lat: 5.6037, lng: -0.1870 }, // Ghana center
          zoom: 15,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT,
          },
        })
        setMap(mapInstance)

        // Add click listener to map
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          const lat = e.latLng?.lat()
          const lng = e.latLng?.lng()
          if (lat && lng) {
            setCurrentLocation({ lat, lng })
          }
        })
      }
    }

    initMap()
  }, [setCurrentLocation])

  useEffect(() => {
    if (map && currentLocation) {
      // Remove previous marker if it exists
      if (marker) {
        marker.setMap(null)
      }

      // Create a new marker with custom options
      const newMarker = new google.maps.Marker({
        position: currentLocation,
        map: map,
        icon: {
          url: '/images/marker.png',
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        },
        zIndex: 1000
      })

      setMarker(newMarker)
      
      // Smooth pan to location
      map.panTo(currentLocation)
    }
  }, [map, currentLocation, marker])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  return (
    <div className="flex-1 relative">
      <div id="map" className="w-full h-full" />
      <Button
        className="absolute bottom-4 right-4"
        onClick={getCurrentLocation}
      >
        Get Current Location
      </Button>
    </div>
  )
}




// // app/(routes)/location/components/map-component.tsx
// import { useEffect, useState } from 'react'
// import { Button } from '@/components/ui/button'

// interface MapComponentProps {
//   currentLocation: { lat: number; lng: number } | null
//   setCurrentLocation: (location: { lat: number; lng: number } | null) => void
// }

// export function MapComponent({ currentLocation, setCurrentLocation }: MapComponentProps) {
//   const [map, setMap] = useState<google.maps.Map | null>(null)
//   const [marker, setMarker] = useState<google.maps.Marker | null>(null)

//   useEffect(() => {
//     // Initialize Google Maps
//     const initMap = () => {
//       const mapElement = document.getElementById('map')
//       if (mapElement) {
//         const mapInstance = new google.maps.Map(mapElement, {
//           center: { lat: 5.6037, lng: -0.1870 }, // Ghana center
//           zoom: 15,
//           mapTypeControl: true,
//           mapTypeControlOptions: {
//             style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
//             position: google.maps.ControlPosition.TOP_RIGHT,
//           },
//         })
//         setMap(mapInstance)

//         // Add click listener to map
//         mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
//           const lat = e.latLng?.lat()
//           const lng = e.latLng?.lng()
//           if (lat && lng) {
//             setCurrentLocation({ lat, lng })
//           }
//         })
//       }
//     }

//     initMap()
//   }, [setCurrentLocation])

//   useEffect(() => {
//     if (map && currentLocation) {
//       // Update marker position
//       if (marker) {
//         marker.setMap(null)
//       }
//       const newMarker = new google.maps.Marker({
//         position: currentLocation,
//         map: map,
//         animation: google.maps.Animation.DROP,
//       })
//       setMarker(newMarker)
//       map.panTo(currentLocation)
//     }
//   }, [map, currentLocation, marker])

//   const getCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setCurrentLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//           })
//         },
//         (error) => {
//           console.error('Error getting location:', error)
//         }
//       )
//     }
//   }

//   return (
//     <div className="flex-1 relative">
//       <div id="map" className="w-full h-full" />
//       <Button
//         className="absolute bottom-4 right-4"
//         onClick={getCurrentLocation}
//       >
//         Get Current Location
//       </Button>
//     </div>
//   )
// }