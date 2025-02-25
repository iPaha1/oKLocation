"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OpenStreetMapComponentProps {
  currentLocation: { lat: number; lng: number } | null;
  setCurrentLocation: (location: { lat: number; lng: number } | null) => void;
}

export function OpenStreetMapComponent({ currentLocation, setCurrentLocation }: OpenStreetMapComponentProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);

  useEffect(() => {
    // Ensure this code runs only in the browser
    if (typeof window === 'undefined') return;

    // Initialize OpenStreetMap with Leaflet
    const mapInstance = L.map('map').setView([5.6037, -0.1870], 15); // Ghana center

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstance);

    // Add click listener to map
    mapInstance.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setCurrentLocation({ lat, lng });
    });

    setMap(mapInstance);

    // Cleanup
    return () => {
      mapInstance.remove();
    };
  }, [setCurrentLocation]);

  useEffect(() => {
    if (map && currentLocation) {
      // Remove previous marker if it exists
      if (marker) {
        marker.remove();
      }

      // Create a new marker
      const newMarker = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: L.icon({
          iconUrl: '/images/marker.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        }),
      }).addTo(map);

      setMarker(newMarker);

      // Smooth pan to location
      map.panTo([currentLocation.lat, currentLocation.lng]);
    }
  }, [map, currentLocation, marker]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

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
  );
}






// "use client";

// import { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// interface OpenStreetMapComponentProps {
//   currentLocation: { lat: number; lng: number } | null;
//   setCurrentLocation: (location: { lat: number; lng: number } | null) => void;
// }

// export function OpenStreetMapComponent({ currentLocation, setCurrentLocation }: OpenStreetMapComponentProps) {
//   const [map, setMap] = useState<L.Map | null>(null);
//   const [marker, setMarker] = useState<L.Marker | null>(null);

//   useEffect(() => {
//     // Initialize OpenStreetMap with Leaflet
//     const mapInstance = L.map('map').setView([5.6037, -0.1870], 15); // Ghana center

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: '© OpenStreetMap contributors',
//     }).addTo(mapInstance);

//     // Add click listener to map
//     mapInstance.on('click', (e: L.LeafletMouseEvent) => {
//       const { lat, lng } = e.latlng;
//       setCurrentLocation({ lat, lng });
//     });

//     setMap(mapInstance);

//     // Cleanup
//     return () => {
//       mapInstance.remove();
//     };
//   }, [setCurrentLocation]);

//   useEffect(() => {
//     if (map && currentLocation) {
//       // Remove previous marker if it exists
//       if (marker) {
//         marker.remove();
//       }

//       // Create a new marker
//       const newMarker = L.marker([currentLocation.lat, currentLocation.lng], {
//         icon: L.icon({
//           iconUrl: '/images/marker.png',
//           iconSize: [32, 32],
//           iconAnchor: [16, 32],
//         }),
//       }).addTo(map);

//       setMarker(newMarker);

//       // Smooth pan to location
//       map.panTo([currentLocation.lat, currentLocation.lng]);
//     }
//   }, [map, currentLocation, marker]);

//   const getCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setCurrentLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//         }
//       );
//     }
//   };

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
//   );
// }