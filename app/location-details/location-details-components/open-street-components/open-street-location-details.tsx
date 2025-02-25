"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { OpenStreetLocationInfo } from './open-street-location-info';

// Dynamically import OpenStreetMapComponent with SSR disabled
const OpenStreetMapComponent = dynamic(
  () => import('./open-street-map-component').then(mod => mod.OpenStreetMapComponent),
  { ssr: false }
);

export interface OpenStreetLocationDetails {
  address: string;
  district: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  streetName?: string;
  community?: string;
  postalArea?: string;
  postCode?: string;
}

export function OpenStreetLocationDetails() {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch location details using Nominatim API
  const { data: OpenStreetlocationDetails } = useQuery<OpenStreetLocationDetails | null>({
    queryKey: ['location', currentLocation],
    queryFn: async () => {
      if (!currentLocation) {
        // Return null or throw an error if currentLocation is null
        return null;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.lat}&lon=${currentLocation.lng}&zoom=18&addressdetails=1`
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const address = data.address;

      return {
        address: data.display_name,
        district: address.county || address.state_district || '',
        region: address.state || '',
        streetName: address.road || '',
        community: address.neighbourhood || '',
        postalArea: address.postcode || '',
        postCode: address.postcode || '',
        coordinates: {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
        },
      };
    },
    enabled: !!currentLocation, // Only run the query if currentLocation is not null
  });

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

          <OpenStreetLocationInfo
            locationDetails={OpenStreetlocationDetails}
            currentLocation={currentLocation}
          />
        </div>
      </Card>

      {/* Map */}
      <OpenStreetMapComponent
        currentLocation={currentLocation}
        setCurrentLocation={setCurrentLocation}
      />
    </div>
  );
}






// "use client";

// import React, { useState } from 'react';
// import { Card } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Search } from 'lucide-react';
// import { useQuery } from '@tanstack/react-query';
// import { OpenStreetMapComponent } from './open-street-map-component';
// import { OpenStreetLocationInfo } from './open-street-location-info';

// export interface OpenStreetLocationDetails {
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

// export function OpenStreetLocationDetails() {
//   const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');

//   // Fetch location details using Nominatim API
//   const { data: OpenStreetlocationDetails } = useQuery<OpenStreetLocationDetails | null>({
//     queryKey: ['location', currentLocation],
//     queryFn: async () => {
//       if (!currentLocation) {
//         // Return null or throw an error if currentLocation is null
//         return null;
//       }

//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.lat}&lon=${currentLocation.lng}&zoom=18&addressdetails=1`
//       );

//       const data = await response.json();
//       if (data.error) throw new Error(data.error);

//       const address = data.address;

//       return {
//         address: data.display_name,
//         district: address.county || address.state_district || '',
//         region: address.state || '',
//         streetName: address.road || '',
//         community: address.neighbourhood || '',
//         postalArea: address.postcode || '',
//         postCode: address.postcode || '',
//         coordinates: {
//           latitude: currentLocation.lat,
//           longitude: currentLocation.lng,
//         },
//       };
//     },
//     enabled: !!currentLocation, // Only run the query if currentLocation is not null
//   });

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

//           <OpenStreetLocationInfo
//             locationDetails={OpenStreetlocationDetails}
//             currentLocation={currentLocation}
//           />
//         </div>
//       </Card>

//       {/* Map */}
//       <OpenStreetMapComponent
//         currentLocation={currentLocation}
//         setCurrentLocation={setCurrentLocation}
//       />
//     </div>
//   );
// }