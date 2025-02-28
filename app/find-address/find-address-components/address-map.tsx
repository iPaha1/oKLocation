"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import NavigationGuidance from './navigation-guidance';

interface AddressMapProps {
  destinationLocation: { lat: number; lng: number };
  currentLocation: { lat: number; lng: number } | null;
}

export default function AddressMap({
  destinationLocation,
  currentLocation,
}: AddressMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isWithinRadius, setIsWithinRadius] = useState(false);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: 'weekly',
        libraries: ['places', 'geometry'], // Add 'geometry' here
      });

      const google = await loader.load();

      if (mapRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: destinationLocation,
          zoom: 15,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'transit',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          map: mapInstanceRef.current,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            strokeWeight: 4,
          },
        });

        setIsMapLoaded(true);
      }
    };

    initMap();
  }, [destinationLocation]);

  // Update current location marker and directions
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded || !currentLocation) return;

    const google = window.google;

    // Add or update current location marker
    const currentLocationMarker = new google.maps.Marker({
      position: currentLocation,
      map: mapInstanceRef.current,
      title: 'Your Location',
      icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      zIndex: 2,
    });

    // Update directions
    if (directionsRendererRef.current) {
      const directionsService = new google.maps.DirectionsService();

      directionsService.route(
        {
          origin: currentLocation,
          destination: destinationLocation,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            directionsRendererRef.current?.setDirections(result);

            // Fit bounds to show entire route
            if (mapInstanceRef.current && result.routes[0].bounds) {
              mapInstanceRef.current.fitBounds(result.routes[0].bounds);
            }
          }
        }
      );
    }

    // Check if within radius
    if (google.maps.geometry && google.maps.geometry.spherical) {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
        new google.maps.LatLng(destinationLocation.lat, destinationLocation.lng)
      );

      setIsWithinRadius(distance <= 50); // 50 meters radius
    } else {
      console.error('Google Maps Geometry library is not loaded.');
    }

    return () => {
      currentLocationMarker.setMap(null);
    };
  }, [currentLocation, destinationLocation, isMapLoaded]);

  const handleNavigate = () => {
    // This function will be called when the navigation button is pressed
    console.log("Navigation started");
  };

  return (
    <>
      <div ref={mapRef} className="w-full h-full" />

      {/* Radius Legend */}
      {currentLocation && (
        <div className="absolute left-4 bottom-4 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isWithinRadius ? 'bg-green-500' : 'bg-orange-500'
            }`} />
            <span className="text-sm font-medium">
              {isWithinRadius
                ? 'Within destination zone'
                : 'Move closer to destination'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isWithinRadius
              ? 'You have arrived at the destination'
              : 'Get within 50 meters to arrive'}
          </p>
        </div>
      )}

      {/* Navigation Guidance */}
      {currentLocation && (
        <NavigationGuidance
          currentLocation={currentLocation}
          destinationType="delivery"
          destination={destinationLocation}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
}





// // app/find-address/components/address-map.tsx
// "use client";

// import { useEffect, useRef, useState } from 'react';
// import { Loader } from '@googlemaps/js-api-loader';
// import NavigationGuidance from './navigation-guidance';

// interface AddressMapProps {
//   destinationLocation: { lat: number; lng: number };
//   currentLocation: { lat: number; lng: number } | null;
// }

// export default function AddressMap({
//   destinationLocation,
//   currentLocation,
// }: AddressMapProps) {
//   const mapRef = useRef<HTMLDivElement>(null);
//   const mapInstanceRef = useRef<google.maps.Map | null>(null);
//   const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
//   const [isMapLoaded, setIsMapLoaded] = useState(false);
//   const [isWithinRadius, setIsWithinRadius] = useState(false);

//   // Initialize map
//   useEffect(() => {
//     const initMap = async () => {
//       const loader = new Loader({
//         apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
//         version: 'weekly',
//         libraries: ['places'],
//       });

//       const google = await loader.load();

//       if (mapRef.current) {
//         mapInstanceRef.current = new google.maps.Map(mapRef.current, {
//           center: destinationLocation,
//           zoom: 15,
//           styles: [
//             {
//               featureType: 'poi',
//               elementType: 'labels',
//               stylers: [{ visibility: 'off' }],
//             },
//             {
//               featureType: 'transit',
//               elementType: 'labels',
//               stylers: [{ visibility: 'off' }],
//             },
//           ],
//           zoomControl: true,
//           zoomControlOptions: {
//             position: google.maps.ControlPosition.RIGHT_CENTER,
//           },
//           mapTypeControl: false,
//           streetViewControl: false,
//           fullscreenControl: false,
//         });

//         // Add destination marker with info window
//         // const destinationMarker = new google.maps.Marker({
//         //   position: destinationLocation,
//         //   map: mapInstanceRef.current,
//         //   title: 'Destination',
//         //   icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
//         //   zIndex: 1,
//         // });

//         // Create destination radius circle
//         // const radiusCircle = new google.maps.Circle({
//         //   map: mapInstanceRef.current,
//         //   center: destinationLocation,
//         //   radius: 50, // 50 meters
//         //   strokeColor: '#F97316',
//         //   strokeOpacity: 0.8,
//         //   strokeWeight: 2,
//         //   fillColor: '#F97316',
//         //   fillOpacity: 0.15,
//         //   zIndex: 0,
//         // });

//         directionsRendererRef.current = new google.maps.DirectionsRenderer({
//           map: mapInstanceRef.current,
//           suppressMarkers: true,
//           polylineOptions: {
//             strokeColor: '#3b82f6',
//             strokeOpacity: 0.8,
//             strokeWeight: 4,
//           },
//         });

//         setIsMapLoaded(true);
//       }
//     };

//     initMap();
//   }, [destinationLocation]);

//   // Update current location marker and directions
//   useEffect(() => {
//     if (!mapInstanceRef.current || !isMapLoaded || !currentLocation) return;

//     const google = window.google;
    
//     // Add or update current location marker
//     const currentLocationMarker = new google.maps.Marker({
//       position: currentLocation,
//       map: mapInstanceRef.current,
//       title: 'Your Location',
//       icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
//       zIndex: 2,
//     });

//     // Update directions
//     if (directionsRendererRef.current) {
//       const directionsService = new google.maps.DirectionsService();
      
//       directionsService.route(
//         {
//           origin: currentLocation,
//           destination: destinationLocation,
//           travelMode: google.maps.TravelMode.DRIVING,
//         },
//         (result, status) => {
//           if (status === 'OK' && result) {
//             directionsRendererRef.current?.setDirections(result);

//             // Fit bounds to show entire route
//             if (mapInstanceRef.current && result.routes[0].bounds) {
//               mapInstanceRef.current.fitBounds(result.routes[0].bounds);
//             }
//           }
//         }
//       );
//     }

//     // Check if within radius
//     const distance = google.maps.geometry.spherical.computeDistanceBetween(
//       new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
//       new google.maps.LatLng(destinationLocation.lat, destinationLocation.lng)
//     );
    
//     setIsWithinRadius(distance <= 50); // 50 meters radius

//     return () => {
//       currentLocationMarker.setMap(null);
//     };
//   }, [currentLocation, destinationLocation, isMapLoaded]);

//   const handleNavigate = () => {
//     // This function will be called when the navigation button is pressed
//     console.log("Navigation started");
//   };

//   return (
//     <>
//       <div ref={mapRef} className="w-full h-full" />
      
//       {/* Radius Legend */}
//       {currentLocation && (
//         <div className="absolute left-4 bottom-4 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
//           <div className="flex items-center space-x-2">
//             <div className={`w-3 h-3 rounded-full ${
//               isWithinRadius ? 'bg-green-500' : 'bg-orange-500'
//             }`} />
//             <span className="text-sm font-medium">
//               {isWithinRadius 
//                 ? 'Within destination zone' 
//                 : 'Move closer to destination'}
//             </span>
//           </div>
//           <p className="text-xs text-muted-foreground mt-1">
//             {isWithinRadius 
//               ? 'You have arrived at the destination'
//               : 'Get within 50 meters to arrive'}
//           </p>
//         </div>
//       )}

//       {/* Navigation Guidance */}
//       {currentLocation && (
//         <NavigationGuidance
//           currentLocation={currentLocation}
//           destinationType="delivery"
//           destination={destinationLocation}
//           onNavigate={handleNavigate}
//         />
//       )}
//     </>
//   );
// }