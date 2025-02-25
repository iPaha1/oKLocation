
// app/(routes)/location/components/location-details.tsx
"use client"

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { MapComponent } from './map'
import { LocationInfo } from './location-info'


export interface LocationDetails {
  address: string
  district: string
  region: string
  coordinates: {
    latitude: number
    longitude: number
  }
  streetName?: string
  community?: string
  postalArea?: string
  postCode?: string
}

export function LocationDetails() {
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch location details using our API
  const { data: locationDetails } = useQuery<LocationDetails>({
    queryKey: ['location', currentLocation],
    queryFn: async () => {
      if (!currentLocation) return null
      const response = await fetch(
        `/api/v1/address?lat=${currentLocation.lat}&lng=${currentLocation.lng}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
            ...(process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET && { 'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET })
          }
        }
      )
      return response.json()
    },
    enabled: !!currentLocation
  })

  // let's console.log the locationDetails to see what we're getting
  console.log("Here is the location details: " , locationDetails)

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <Card className="w-96 p-4 rounded-none">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Input
              placeholder="Search for Addresses, Places, Coordinates"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>

          <LocationInfo 
            locationDetails={locationDetails} 
            currentLocation={currentLocation} 
          />
        </div>
      </Card>

      {/* Map */}
      <MapComponent
        currentLocation={currentLocation}
        setCurrentLocation={setCurrentLocation}
      />
    </div>
  )
}







// "use client";


// import React, { useEffect, useState } from 'react';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { MapPin, Search, Navigation, Globe, Building, Home, Mail, MapPinned } from 'lucide-react';
// import { useQuery } from '@tanstack/react-query';

// interface LocationDetails {
//   address: string;
//   district: string;
//   region: string;
//   coordinates: {
//     latitude: number;
//     longitude: number;
//   };
//   streetName?: string;
//   community?: string;
//   postalArea?: string;
//   postCode?: string;
// }

// export default function LocationPage() {
//   const [map, setMap] = useState<google.maps.Map | null>(null);
//   const [marker, setMarker] = useState<google.maps.Marker | null>(null);
//   const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
  

//   // Fetch location details using our API
//   const { data: locationDetails } = useQuery<LocationDetails>({
//     queryKey: ['location', currentLocation],
//     queryFn: async () => {
//       if (!currentLocation) return null;
//       const response = await fetch(
//         `/api/v1/address?lat=${currentLocation.lat}&lng=${currentLocation.lng}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
//           }
//         }
//       );
//       return response.json();
//     },
//     enabled: !!currentLocation
//   });

//   useEffect(() => {
//     // Initialize Google Maps
//     const initMap = () => {
//       const mapElement = document.getElementById('map');
//       if (mapElement) {
//         const mapInstance = new google.maps.Map(mapElement, {
//           center: { lat: 5.6037, lng: -0.1870 }, // Ghana center
//           zoom: 15,
//           mapTypeControl: true,
//           mapTypeControlOptions: {
//             style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
//             position: google.maps.ControlPosition.TOP_RIGHT,
//           },
//         });
//         setMap(mapInstance);

//         // Add click listener to map
//         mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
//           const lat = e.latLng?.lat();
//           const lng = e.latLng?.lng();
//           if (lat && lng) {
//             setCurrentLocation({ lat, lng });
//           }
//         });
//       }
//     };

//     initMap();
//   }, []);

//   useEffect(() => {
//     if (map && currentLocation) {
//       // Update marker position
//       if (marker) {
//         marker.setMap(null);
//       }
//       const newMarker = new google.maps.Marker({
//         position: currentLocation,
//         map: map,
//         animation: google.maps.Animation.DROP,
//       });
//       setMarker(newMarker);
//       map.panTo(currentLocation);
//     }
//   }, [map, currentLocation, marker]);

//   const getCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setCurrentLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//           });
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//         }
//       );
//     }
//   };

//   return (
//     <div className="flex min-h-screen">
//       {/* Left Panel */}
//       <Card className="w-96 p-4 rounded-none">
//         <div className="space-y-4">
//           {/* Search Bar */}
//           <div className="relative">
//             <Input
//               placeholder="Search for Addresses, Places, Coordinates"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10"
//             />
//             <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//           </div>

//           {/* Address Info */}
//           <div className="space-y-6">
//             <h2 className="text-lg font-semibold">Address info</h2>
            
//             <div className="space-y-4">
//               {/* Digital Address */}
//               <div className="flex items-start space-x-3">
//                 <MapPin className="h-5 w-5 mt-1 text-green-600" />
//                 <div>
//                   <p className="font-medium">Digital Address</p>
//                   <p className="text-xl font-bold">{locationDetails?.address || '...'}</p>
//                   <p className="text-sm text-muted-foreground">Address version 2</p>
//                 </div>
//               </div>

//               {/* Street Name */}
//               <div className="flex items-start space-x-3">
//                 <Navigation className="h-5 w-5 mt-1" />
//                 <div>
//                   <p className="font-medium">Street Name</p>
//                   <p>{locationDetails?.streetName || '...'}</p>
//                 </div>
//               </div>

//               {/* Region */}
//               <div className="flex items-start space-x-3">
//                 <Globe className="h-5 w-5 mt-1" />
//                 <div>
//                   <p className="font-medium">Region</p>
//                   <p>{locationDetails?.region || '...'}</p>
//                 </div>
//               </div>

//               {/* District */}
//               <div className="flex items-start space-x-3">
//                 <Building className="h-5 w-5 mt-1" />
//                 <div>
//                   <p className="font-medium">District</p>
//                   <p>{locationDetails?.district || '...'}</p>
//                 </div>
//               </div>

//               {/* Community */}
//               <div className="flex items-start space-x-3">
//                 <Home className="h-5 w-5 mt-1" />
//                 <div>
//                   <p className="font-medium">Community</p>
//                   <p>{locationDetails?.community || '...'}</p>
//                 </div>
//               </div>

//               {/* Postal Area */}
//               <div className="flex items-start space-x-3">
//                 <Mail className="h-5 w-5 mt-1" />
//                 <div>
//                   <p className="font-medium">Postal Area</p>
//                   <p>{locationDetails?.postalArea || '...'}</p>
//                 </div>
//               </div>

//               {/* Post Code */}
//               <div className="flex items-start space-x-3">
//                 <MapPinned className="h-5 w-5 mt-1" />
//                 <div>
//                   <p className="font-medium">Post Code</p>
//                   <p>{locationDetails?.postCode || '...'}</p>
//                 </div>
//               </div>

//               {/* Coordinates */}
//               <div className="flex items-start space-x-3">
//                 <Navigation className="h-5 w-5 mt-1" />
//                 <div>
//                   <p className="font-medium">Latitude,Longitude</p>
//                   <p>
//                     {currentLocation 
//                       ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`
//                       : '...'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Card>

//       {/* Map */}
//       <div className="flex-1 relative">
//         <div id="map" className="w-full h-full" />
//         <Button
//           className="absolute bottom-4 right-4"
//           onClick={getCurrentLocation}
//         >
//           Get Current Location
//         </Button>
//       </div>
//     </div>
//   );
// }