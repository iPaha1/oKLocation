"use client";


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Navigation2 } from 'lucide-react';
import { toast } from 'sonner';
// import { useSavedLocation } from '@/hooks/use-api-usage';


interface LocationDetails {
    address: string;
    district: string;
    region: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }

const GetCurrentLocation = () => {

    // let's get all the save locations from the database
    // const savedLocations = useSavedLocation("VV-819-0005");
    // console.log("Saved Locations", savedLocations);
  
const [location, setLocation] = useState<{
    coords?: { latitude: number; longitude: number };
    address?: string;
    locationDetails?: LocationDetails;
    loading: boolean;
    error?: string;
  }>({
    loading: false
  });

  const copyAndSaveLocation = async () => {
    console.log("here is the data to be saved", location);
    if (!location.coords || !location.locationDetails) return;
  
    // First, copy to clipboard
    navigator.clipboard.writeText(location.locationDetails.address);
    
    // Start saving process
    setLocation(prev => ({ ...prev, saving: true }));
  
    try {
      // Save to database
      const response = await fetch('/api/v1/save-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coords: location.coords,
          address: location.address,
          locationDetails: location.locationDetails,
        }),
      });

      const data = await response.json();

    if (response.status === 409) {
      // Location already exists
      toast.info('Location already exists', {
        description: data.message || 'This location has already been saved in the database.',
        action: {
          label: 'OK',
          onClick: () => toast.dismiss()
        }
      });
      return;
    }
  
      if (!response.ok) throw new Error('Failed to save location');
  
      // Show success toast that includes both copy and save confirmation
      toast.success('Digital Address copied and saved', {
        description: 'The digital address has been copied to your clipboard and saved for future reference.',
        action: {
          label: 'OK',
          onClick: () => toast.dismiss()
        }
      });
    } catch (error) {
      console.error('Error saving location:', error);

      // Check if it's our known error or a network/unknown error
    const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
    
    toast.error('Error saving location', {
      description: `The digital address was copied to your clipboard, but couldn't be saved: ${errorMessage}`,
      action: {
        label: 'OK',
        onClick: () => toast.dismiss()
      }
    });
    
    } finally {
      setLocation(prev => ({ ...prev, saving: false }));
    }
  };
  
  

  const getLocation = () => {
    setLocation(prev => ({ ...prev, loading: true, error: undefined }));
    
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser'
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Get address from coordinates using Geocoding API
          const [googleResponse, okLocationResponse] = await Promise.all([
            fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            ),
            fetch(
              `/api/v1/address?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,
              {
                headers: {
                  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
                  ...(process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET && { 
                    'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET 
                  })
                }
              }
            )
          ]);

          const [googleData, locationDetails] = await Promise.all([
            googleResponse.json(),
            okLocationResponse.json()
          ]);

          const address = googleData.results[0]?.formatted_address;

          setLocation({
            coords: position.coords,
            address,
            locationDetails,
            loading: false
          });
        } catch {
          setLocation(prev => ({
            ...prev,
            coords: position.coords,
            loading: false,
            error: 'Error fetching address details'
          }));
        }
      },
      (error) => {
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    );
  };

  // let's console log the location details from google maps and oklocation
  console.log("Location Details", location);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Get Your Current Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              readOnly
              value={location.coords 
                ? `${location.coords.latitude},${location.coords.longitude}`
                : ''}
            // value={location.locationDetails ? location.locationDetails.address : ''}
              placeholder="Your digital address code will appear here"
              className="flex-1"
            />
            <Button
              onClick={getLocation}
              disabled={location.loading}
              variant="default"
            >
              <Navigation2 className="mr-2 h-4 w-4" />
              {location.loading ? 'Getting location...' : 'Get Location'}
            </Button>
            <Button
              onClick={copyAndSaveLocation}
              disabled={!location.coords}
              variant="outline"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>

          {location.error && (
            <div className="text-red-500 text-sm">
              Error: {location.error}
            </div>
          )}
          

          {location.coords && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Location Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
              {location.locationDetails && (
                  <>
                    <div>
                      <div className="font-semibold">Digital Address</div>
                      <div>{location.locationDetails.address}</div>
                    </div>
                    <div>
                      <div className="font-semibold">District</div>
                      <div>{location.locationDetails.district}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Region</div>
                      <div>{location.locationDetails.region}</div>
                    </div>
                  </>
                )}
                <div>
                  <div className="font-semibold">Latitude</div>
                  <div>{location.coords.latitude}</div>
                </div>
                <div>
                  <div className="font-semibold">Longitude</div>
                  <div>{location.coords.longitude}</div>
                </div>
                {location.address && (
                  <div>
                    <div className="font-semibold">Google Maps Address</div>
                    <div>{location.address}</div>
                  </div>
                )}
                
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GetCurrentLocation;







// "use client";


// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Copy, Navigation2 } from 'lucide-react';
// import { toast } from 'sonner';

// const GetCurrentLocation = () => {
//   interface LocationDetails {
//   address: string;
//   district: string;
//   region: string;
//   coordinates: {
//     latitude: number;
//     longitude: number;
//   };
// }

// const [location, setLocation] = useState<{
//     coords?: { latitude: number; longitude: number };
//     address?: string;
//     locationDetails?: LocationDetails;
//     loading: boolean;
//     error?: string;
//   }>({
//     loading: false
//   });
  

//   const getLocation = () => {
//     setLocation(prev => ({ ...prev, loading: true, error: undefined }));
    
//     if (!navigator.geolocation) {
//       setLocation(prev => ({
//         ...prev,
//         loading: false,
//         error: 'Geolocation is not supported by your browser'
//       }));
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         try {
//           // Get address from coordinates using Geocoding API
//           const [googleResponse, okLocationResponse] = await Promise.all([
//             fetch(
//               `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
//             ),
//             fetch(
//               `/api/v1/address?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,
//               {
//                 headers: {
//                   'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
//                   ...(process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET && { 
//                     'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET 
//                   })
//                 }
//               }
//             )
//           ]);

//           const [googleData, locationDetails] = await Promise.all([
//             googleResponse.json(),
//             okLocationResponse.json()
//           ]);

//           const address = googleData.results[0]?.formatted_address;

//           setLocation({
//             coords: position.coords,
//             address,
//             locationDetails,
//             loading: false
//           });
//         } catch {
//           setLocation(prev => ({
//             ...prev,
//             coords: position.coords,
//             loading: false,
//             error: 'Error fetching address details'
//           }));
//         }
//       },
//       (error) => {
//         setLocation(prev => ({
//           ...prev,
//           loading: false,
//           error: error.message
//         }));
//       }
//     );
//   };

//   const copyLocation = () => {
//     if (location.coords) {
//       const locationString = `${location.coords.latitude},${location.coords.longitude}`;
//       navigator.clipboard.writeText(locationString);
//       toast('Digital Address copied to clipboard', {
//         description: 'You can now paste the digital address code wherever you need it.',
//         action: {
//           label: 'OK',
//           onClick: () => toast.dismiss()
//         }
//         }
//       );
//     }
//   };

//   return (
//     <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
//       <Card>
//         <CardHeader>
//           <CardTitle>Get Your Current Location</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex gap-2">
//             <Input
//               readOnly
//               value={location.coords 
//                 ? `${location.coords.latitude},${location.coords.longitude}`
//                 : ''}
//             // value={location.locationDetails ? location.locationDetails.address : ''}
//               placeholder="Your digital address code will appear here"
//               className="flex-1"
//             />
//             <Button
//               onClick={getLocation}
//               disabled={location.loading}
//               variant="default"
//             >
//               <Navigation2 className="mr-2 h-4 w-4" />
//               {location.loading ? 'Getting location...' : 'Get Location'}
//             </Button>
//             <Button
//               onClick={copyLocation}
//               disabled={!location.coords}
//               variant="outline"
//             >
//               <Copy className="mr-2 h-4 w-4" />
//               Copy
//             </Button>
//           </div>

//           {location.error && (
//             <div className="text-red-500 text-sm">
//               Error: {location.error}
//             </div>
//           )}
          

//           {location.coords && (
//             <Card className="mt-4">
//               <CardHeader>
//                 <CardTitle className="text-lg">Location Details</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2">
//               {location.locationDetails && (
//                   <>
//                     <div>
//                       <div className="font-semibold">Digital Address</div>
//                       <div>{location.locationDetails.address}</div>
//                     </div>
//                     <div>
//                       <div className="font-semibold">District</div>
//                       <div>{location.locationDetails.district}</div>
//                     </div>
//                     <div>
//                       <div className="font-semibold">Region</div>
//                       <div>{location.locationDetails.region}</div>
//                     </div>
//                   </>
//                 )}
//                 <div>
//                   <div className="font-semibold">Latitude</div>
//                   <div>{location.coords.latitude}</div>
//                 </div>
//                 <div>
//                   <div className="font-semibold">Longitude</div>
//                   <div>{location.coords.longitude}</div>
//                 </div>
//                 {location.address && (
//                   <div>
//                     <div className="font-semibold">Google Maps Address</div>
//                     <div>{location.address}</div>
//                   </div>
//                 )}
                
//               </CardContent>
//             </Card>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default GetCurrentLocation;
