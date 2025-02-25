"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Copy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LocationDetails {
    digitalAddress: string;
  address: string;
  district: string;
  region: string;
  streetNumber?: string;
  streetName?: string;
  suburb?: string;
  town?: string;
  neighborhood?: string;
  locality?: string;
  administrativeAreaLevel1?: string;
  administrativeAreaLevel2?: string;
  postalCode?: string;
  country?: string;
  plusCode?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface LocationInfo {
  address?: string;
  locationDetails?: LocationDetails;
  loading: boolean;
  error?: string;
}

const OpenStreetGetLocationByCoordinates = () => {
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: ''
  });
  
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    loading: false
  });

  const isValidCoordinates = () => {
    const lat = parseFloat(coordinates.latitude);
    const lng = parseFloat(coordinates.longitude);
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  };

  const getLocationDetails = async () => {
    if (!isValidCoordinates()) {
      setLocationInfo({
        loading: false,
        error: 'Please enter valid coordinates (latitude: -90 to 90, longitude: -180 to 180)'
      });
      return;
    }

    setLocationInfo(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      // Step 1: Use Nominatim API to get address details
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=18&addressdetails=1`
      );

      const nominatimData = await nominatimResponse.json();

      if (nominatimData.error) {
        setLocationInfo({
          loading: false,
          error: nominatimData.error
        });
        return;
      }

      const address = nominatimData.address;
      console.log("this is the address: ", address)

      // Step 2: Fetch postcode from your database using region, district, and locality
      const postCodeResponse = await fetch(
        `/api/v1/address?lat=${coordinates.latitude}&lng=${coordinates.longitude}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
            ...(process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET && { 
              'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET 
            })
          }
        }
      );

      const postCodeData = await postCodeResponse.json();
      console.log('this is the postCode : ', postCodeData)

      if (!postCodeResponse.ok) {
        throw new Error(postCodeData.error || 'Failed to fetch postcode');
      }

      // Step 3: Combine Nominatim data with postcode from your database
      setLocationInfo({
        address: nominatimData.display_name,
        locationDetails: {
          digitalAddress: postCodeData.address,
          address: nominatimData.display_name,
          district: address.county || address.state_district || '',
          region: address.state || '',
          streetNumber: address.house_number || '',
          streetName: address.road || '',
          suburb: address.suburb || '',
          town: address.town || '',
          neighborhood: address.neighbourhood || '',
          locality: address.city || address.town || address.village || '',
          administrativeAreaLevel1: address.state || '',
          administrativeAreaLevel2: address.county || '',
          postalCode: postCodeData.postCode || address.postcode || '',
          country: address.country || '',
          plusCode: '', // Nominatim does not provide plus codes
          coordinates: {
            latitude: parseFloat(coordinates.latitude),
            longitude: parseFloat(coordinates.longitude)
          }
        },
        loading: false
      });
    } catch (error) {
      console.error('Error fetching location details:', error);
      setLocationInfo({
        loading: false,
        error: 'Error fetching location details'
      });
    }
  };

// const getLocationDetails = async () => {
//     if (!isValidCoordinates()) {
//       setLocationInfo({
//         loading: false,
//         error: 'Please enter valid coordinates (latitude: -90 to 90, longitude: -180 to 180)'
//       });
//       return;
//     }
  
//     setLocationInfo(prev => ({ ...prev, loading: true, error: undefined }));
  
//     try {
//       // Step 1: Use Nominatim API to get address details
//       const nominatimResponse = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=18&addressdetails=1`
//       );
  
//       const nominatimData = await nominatimResponse.json();
  
//       if (nominatimData.error) {
//         setLocationInfo({
//           loading: false,
//           error: nominatimData.error
//         });
//         return;
//       }
  
//       const address = nominatimData.address;
//       console.log("this is the address: ", address)
  
//       // Step 2: Fetch generated digital address and postcode from your database
//       const postCodeResponse = await fetch(
//         `/api/v1/address?lat=${coordinates.latitude}&lng=${coordinates.longitude}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
//             ...(process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET && { 
//               'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET 
//             })
//           }
//         }
//       );
  
//       const postCodeData = await postCodeResponse.json();
//       console.log('this is the postCode Data : ', postCodeData)
  
//       if (!postCodeResponse.ok) {
//         throw new Error(postCodeData.error || 'Failed to fetch postcode');
//       }
  
//       // Step 3: Combine Nominatim data with the generated digital address and postcode
//       setLocationInfo({
//         address: postCodeData.address, // Use the generated digital address from the endpoint
//         locationDetails: {
//           address: postCodeData.address, // Use the generated digital address here
//           district: address.county || address.state_district || '',
//           region: address.state || '',
//           streetNumber: address.house_number || '',
//           streetName: address.road || '',
//           neighborhood: address.neighbourhood || '',
//           locality: address.city || address.town || address.village || '',
//           administrativeAreaLevel1: address.state || '',
//           administrativeAreaLevel2: address.county || '',
//           postalCode: postCodeData.postCode || address.postcode || '',
//           country: address.country || '',
//           plusCode: '', // Nominatim does not provide plus codes
//           coordinates: {
//             latitude: parseFloat(coordinates.latitude),
//             longitude: parseFloat(coordinates.longitude)
//           }
//         },
//         loading: false
//       });
//     } catch (error) {
//       console.error('Error fetching location details:', error);
//       setLocationInfo({
//         loading: false,
//         error: 'Error fetching location details'
//       });
//     }
//   };

// copy and save address
  const copyAndSaveLocation = async () => {
    if (!isValidCoordinates() || !locationInfo.locationDetails) return;

    const locationString = `${coordinates.latitude},${coordinates.longitude}`;
    await navigator.clipboard.writeText(locationString);

    try {
      const response = await fetch('/api/v1/save-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coords: {
            latitude: parseFloat(coordinates.latitude),
            longitude: parseFloat(coordinates.longitude)
          },
          address: locationInfo.address,
          locationDetails: {
            address: locationInfo.locationDetails.address,
            district: locationInfo.locationDetails.district || null,
            region: locationInfo.locationDetails.region || null
          }
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        toast.info('Location already exists', {
          description: data.message || 'This location has already been saved in the database.'
        });
        return;
      }

      if (!response.ok) throw new Error('Failed to save location');

      toast.success('Digital Address copied and saved', {
        description: 'The digital address has been copied to your clipboard and saved for future reference.'
      });
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Error saving location', {
        description: `The digital address was copied to your clipboard, but couldn't be saved: ${error instanceof Error ? error.message : 'Network error occurred'}`
      });
    }
  };

  const DetailItem = ({ label, value }: { label: string; value?: string }) => (
    value ? (
      <div>
        <div className="font-semibold">{label}</div>
        <div>{value}</div>
      </div>
    ) : null
  );

  const LocationDetailsDisplay = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Location Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <DetailItem label="Coordinates" value={`${coordinates.latitude}, ${coordinates.longitude}`} />
        {locationInfo.locationDetails && (
          <>
            <div className=''>
                {/* the digital address should be from the generated digital address function in the endpoint route */}
            <DetailItem label="Digital Address" value={locationInfo.locationDetails.digitalAddress} /> 

              <DetailItem label="Address" value={locationInfo.locationDetails.address} />
              <DetailItem label="Street Number" value={locationInfo.locationDetails.streetNumber} />
              <DetailItem label="Street Name" value={locationInfo.locationDetails.streetName} />
              <DetailItem label="Suburd" value={locationInfo.locationDetails.suburb} />
              <DetailItem label="Town" value={locationInfo.locationDetails.town} />
              <DetailItem label="Neighborhood" value={locationInfo.locationDetails.neighborhood} />
              <DetailItem label="Locality" value={locationInfo.locationDetails.locality} />
              <DetailItem label="Region" value={locationInfo.locationDetails.administrativeAreaLevel1} />
              <DetailItem label="Municipality" value={locationInfo.locationDetails.administrativeAreaLevel2} />
              <DetailItem label="Postal Code" value={locationInfo.locationDetails.postalCode} />
              <DetailItem label="Country" value={locationInfo.locationDetails.country} />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold">Complete Home Address:</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm"
                onClick={() => {
                  const address = [
                    locationInfo.locationDetails?.digitalAddress,
                    locationInfo.locationDetails?.address,
                    locationInfo.locationDetails?.streetNumber && 
                      `${locationInfo.locationDetails?.streetNumber} ${locationInfo.locationDetails.streetName}`,
                    locationInfo.locationDetails?.neighborhood,
                    locationInfo.locationDetails?.locality,
                    locationInfo.locationDetails?.administrativeAreaLevel2,
                    locationInfo.locationDetails?.administrativeAreaLevel1,
                    locationInfo.locationDetails?.postalCode,
                    locationInfo.locationDetails?.country
                  ].filter(Boolean).join('\n');
                  
                  navigator.clipboard.writeText(address);
                  toast.success('Complete address copied to clipboard');
                }}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy Address
              </Button>
            </div>            

            <div className="mt-6">
              <div className="border rounded-md p-4 mt-2 space-y-1">
                {[
                    locationInfo.locationDetails?.digitalAddress,
                //   locationInfo.locationDetails.address,
                  locationInfo.locationDetails.streetNumber && 
                    `${locationInfo.locationDetails.streetNumber} ${locationInfo.locationDetails.streetName}`,
                  locationInfo.locationDetails.neighborhood,
                  `${locationInfo.locationDetails.locality} ${locationInfo.locationDetails.town}`,
                  locationInfo.locationDetails.suburb,
                  locationInfo.locationDetails.administrativeAreaLevel2,
                  locationInfo.locationDetails.administrativeAreaLevel1,
                  locationInfo.locationDetails.postalCode,
                  locationInfo.locationDetails.country
                ].filter(Boolean).map((line, index) => (
                  <div key={index} className="text-sm">{line}</div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Get Location Details from OpenStreetMap by Coordinates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="text"
                value={coordinates.latitude}
                onChange={(e) => setCoordinates(prev => ({
                  ...prev,
                  latitude: e.target.value
                }))}
                placeholder="-90 to 90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="text"
                value={coordinates.longitude}
                onChange={(e) => setCoordinates(prev => ({
                  ...prev,
                  longitude: e.target.value
                }))}
                placeholder="-180 to 180"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={getLocationDetails}
              disabled={locationInfo.loading || !coordinates.latitude || !coordinates.longitude}
              className="flex-1"
            >
              <Search className="mr-2 h-4 w-4" />
              {locationInfo.loading ? 'Getting details...' : 'Get Location Details'}
            </Button>
            <Button
              onClick={copyAndSaveLocation}
              disabled={!isValidCoordinates()}
              variant="outline"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>

          {locationInfo.error && (
            <div className="text-red-500 text-sm">
              Error: {locationInfo.error}
            </div>
          )}

          {(locationInfo.address || locationInfo.locationDetails) && (
            <LocationDetailsDisplay />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenStreetGetLocationByCoordinates;






// "use client";

// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Search, Copy } from 'lucide-react';
// import { Label } from '@/components/ui/label';
// import { toast } from 'sonner';

// interface LocationDetails {
//   address: string;
//   district: string;
//   region: string;
//   streetNumber?: string;
//   streetName?: string;
//   neighborhood?: string;
//   locality?: string;
//   administrativeAreaLevel1?: string;
//   administrativeAreaLevel2?: string;
//   postalCode?: string;
//   country?: string;
//   plusCode?: string;
//   coordinates: {
//     latitude: number;
//     longitude: number;
//   };
// }

// interface LocationInfo {
//   address?: string;
//   locationDetails?: LocationDetails;
//   loading: boolean;
//   error?: string;
// }

// const OpenStreetGetLocationByCoordinates = () => {
//   const [coordinates, setCoordinates] = useState({
//     latitude: '',
//     longitude: ''
//   });
  
//   const [locationInfo, setLocationInfo] = useState<LocationInfo>({
//     loading: false
//   });

//   const isValidCoordinates = () => {
//     const lat = parseFloat(coordinates.latitude);
//     const lng = parseFloat(coordinates.longitude);
//     return !isNaN(lat) && !isNaN(lng) && 
//            lat >= -90 && lat <= 90 && 
//            lng >= -180 && lng <= 180;
//   };

//   const getLocationDetails = async () => {
//     if (!isValidCoordinates()) {
//       setLocationInfo({
//         loading: false,
//         error: 'Please enter valid coordinates (latitude: -90 to 90, longitude: -180 to 180)'
//       });
//       return;
//     }

//     setLocationInfo(prev => ({ ...prev, loading: true, error: undefined }));

//     try {
//       const nominatimResponse = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=18&addressdetails=1`
//       );

//       const nominatimData = await nominatimResponse.json();

//       console.log('THIS IS THE NOMINATIMDATA: ', nominatimData)
      
//       fetch(
//         `/api/v1/address?lat=${coordinates.latitude}&lng=${coordinates.longitude}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
//             ...(process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET && { 
//               'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET 
//             })
//           }
//         }
//       )
//       if (nominatimData.error) {
//         setLocationInfo({
//           loading: false,
//           error: nominatimData.error
//         });
//         return;
//       }

//       const address = nominatimData.address;

//       setLocationInfo({
//         address: nominatimData.display_name,
//         locationDetails: {
//           address: nominatimData.display_name,
//           district: address.county || address.state_district || '',
//           region: address.state || '',
//           streetNumber: address.house_number || '',
//           streetName: address.road || '',
//           neighborhood: address.neighbourhood || '',
//           locality: address.city || address.town || address.village || '',
//           administrativeAreaLevel1: address.state || '',
//           administrativeAreaLevel2: address.county || '',
//           postalCode: address.postcode || '',
//           country: address.country || '',
//           plusCode: '', // Nominatim does not provide plus codes
//           coordinates: {
//             latitude: parseFloat(coordinates.latitude),
//             longitude: parseFloat(coordinates.longitude)
//           }
//         },
//         loading: false
//       });
//     } catch (error) {
//       console.error('Error fetching location details:', error);
//       setLocationInfo({
//         loading: false,
//         error: 'Error fetching location details'
//       });
//     }
//   };

//   const copyAndSaveLocation = async () => {
//     if (!isValidCoordinates() || !locationInfo.locationDetails) return;

//     const locationString = `${coordinates.latitude},${coordinates.longitude}`;
//     await navigator.clipboard.writeText(locationString);

//     try {
//       const response = await fetch('/api/v1/save-location', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           coords: {
//             latitude: parseFloat(coordinates.latitude),
//             longitude: parseFloat(coordinates.longitude)
//           },
//           address: locationInfo.address,
//           locationDetails: {
//             address: locationInfo.locationDetails.address,
//             district: locationInfo.locationDetails.district || null,
//             region: locationInfo.locationDetails.region || null
//           }
//         }),
//       });

//       const data = await response.json();

//       if (response.status === 409) {
//         toast.info('Location already exists', {
//           description: data.message || 'This location has already been saved in the database.'
//         });
//         return;
//       }

//       if (!response.ok) throw new Error('Failed to save location');

//       toast.success('Digital Address copied and saved', {
//         description: 'The digital address has been copied to your clipboard and saved for future reference.'
//       });
//     } catch (error) {
//       console.error('Error saving location:', error);
//       toast.error('Error saving location', {
//         description: `The digital address was copied to your clipboard, but couldn't be saved: ${error instanceof Error ? error.message : 'Network error occurred'}`
//       });
//     }
//   };

//   const DetailItem = ({ label, value }: { label: string; value?: string }) => (
//     value ? (
//       <div>
//         <div className="font-semibold">{label}</div>
//         <div>{value}</div>
//       </div>
//     ) : null
//   );

//   const LocationDetailsDisplay = () => (
//     <Card className="mt-4">
//       <CardHeader>
//         <CardTitle className="text-lg">Location Details</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-2">
//         <DetailItem label="Coordinates" value={`${coordinates.latitude}, ${coordinates.longitude}`} />
//         {locationInfo.locationDetails && (
//           <>
//             <div className=''>
//               <DetailItem label="Digital Address" value={locationInfo.locationDetails.address} />
//               <DetailItem label="Street Number" value={locationInfo.locationDetails.streetNumber} />
//               <DetailItem label="Street Name" value={locationInfo.locationDetails.streetName} />
//               <DetailItem label="Neighborhood" value={locationInfo.locationDetails.neighborhood} />
//               <DetailItem label="Locality" value={locationInfo.locationDetails.locality} />
//               <DetailItem label="Region" value={locationInfo.locationDetails.administrativeAreaLevel1} />
//               <DetailItem label="Municipality" value={locationInfo.locationDetails.administrativeAreaLevel2} />
//               <DetailItem label="Postal Code" value={locationInfo.locationDetails.postalCode} />
//               <DetailItem label="Country" value={locationInfo.locationDetails.country} />
//             </div>

//             <div className="flex items-center justify-between">
//               <span className="font-bold">Complete Home Address:</span>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="text-sm"
//                 onClick={() => {
//                   const address = [
//                     locationInfo.locationDetails?.address,
//                     locationInfo.locationDetails?.streetNumber && 
//                       `${locationInfo.locationDetails?.streetNumber} ${locationInfo.locationDetails.streetName}`,
//                     locationInfo.locationDetails?.neighborhood,
//                     locationInfo.locationDetails?.locality,
//                     locationInfo.locationDetails?.administrativeAreaLevel2,
//                     locationInfo.locationDetails?.administrativeAreaLevel1,
//                     locationInfo.locationDetails?.postalCode,
//                     locationInfo.locationDetails?.country
//                   ].filter(Boolean).join('\n');
                  
//                   navigator.clipboard.writeText(address);
//                   toast.success('Complete address copied to clipboard');
//                 }}
//               >
//                 <Copy className="h-4 w-4 mr-1" />
//                 Copy Address
//               </Button>
//             </div>            

//             <div className="mt-6">
//               <div className="border rounded-md p-4 mt-2 space-y-1">
//                 {[
//                   locationInfo.locationDetails.address,
//                   locationInfo.locationDetails.streetNumber && 
//                     `${locationInfo.locationDetails.streetNumber} ${locationInfo.locationDetails.streetName}`,
//                   locationInfo.locationDetails.neighborhood,
//                   locationInfo.locationDetails.locality,
//                   locationInfo.locationDetails.administrativeAreaLevel2,
//                   locationInfo.locationDetails.administrativeAreaLevel1,
//                   locationInfo.locationDetails.postalCode,
//                   locationInfo.locationDetails.country
//                 ].filter(Boolean).map((line, index) => (
//                   <div key={index} className="text-sm">{line}</div>
//                 ))}
//               </div>
//             </div>
//           </>
//         )}
//       </CardContent>
//     </Card>
//   );

//   return (
//     <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
//       <Card>
//         <CardHeader>
//           <CardTitle>Get Location Details from Open street by Coordinates</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="latitude">Latitude</Label>
//               <Input
//                 id="latitude"
//                 type="text"
//                 value={coordinates.latitude}
//                 onChange={(e) => setCoordinates(prev => ({
//                   ...prev,
//                   latitude: e.target.value
//                 }))}
//                 placeholder="-90 to 90"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="longitude">Longitude</Label>
//               <Input
//                 id="longitude"
//                 type="text"
//                 value={coordinates.longitude}
//                 onChange={(e) => setCoordinates(prev => ({
//                   ...prev,
//                   longitude: e.target.value
//                 }))}
//                 placeholder="-180 to 180"
//               />
//             </div>
//           </div>

//           <div className="flex gap-2 pt-2">
//             <Button
//               onClick={getLocationDetails}
//               disabled={locationInfo.loading || !coordinates.latitude || !coordinates.longitude}
//               className="flex-1"
//             >
//               <Search className="mr-2 h-4 w-4" />
//               {locationInfo.loading ? 'Getting details...' : 'Get Location Details'}
//             </Button>
//             <Button
//               onClick={copyAndSaveLocation}
//               disabled={!isValidCoordinates()}
//               variant="outline"
//             >
//               <Copy className="mr-2 h-4 w-4" />
//               Copy
//             </Button>
//           </div>

//           {locationInfo.error && (
//             <div className="text-red-500 text-sm">
//               Error: {locationInfo.error}
//             </div>
//           )}

//           {(locationInfo.address || locationInfo.locationDetails) && (
//             <LocationDetailsDisplay />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default OpenStreetGetLocationByCoordinates;





