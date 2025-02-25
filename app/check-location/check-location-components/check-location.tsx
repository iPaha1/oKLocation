"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Copy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LocationDetails {
  address: string;
  district: string;
  region: string;
  streetNumber?: string;
  streetName?: string;
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

const GetLocationByCoordinates = () => {
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
      const [googleResponse, okLocationResponse] = await Promise.all([
        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        ),
        fetch(
          `/api/v1/address?lat=${coordinates.latitude}&lng=${coordinates.longitude}`,
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

      if (googleData.status === 'OK' && googleData.results.length > 0) {
        const result = googleData.results[0];
        const addressComponents = result.address_components;

        const getAddressComponent = (type: string) => {
          const component = addressComponents.find((comp: { types: string[] }) => 
            comp.types.includes(type)
          );
          return component ? component.long_name : undefined;
        };

        // Get postal code
        const locality = getAddressComponent('locality') || getAddressComponent('sublocality');
        const district = getAddressComponent('administrative_area_level_2');
        const region = getAddressComponent('administrative_area_level_1');
        let postcode = null;

        if (locality || district || region) {
          try {
            const postcodeResponse = await fetch(
              `/api/v1/postcode/lookup?${new URLSearchParams({
                ...(locality && { locality }),
                ...(district && { district }),
                ...(region && { region })
              })}`,
              {
                headers: {
                  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
                  'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET || ''
                }
              }
            );

            if (postcodeResponse.ok) {
              const postcodeData = await postcodeResponse.json();
              postcode = postcodeData.postcode;
            }
          } catch (error) {
            console.error('Error fetching postcode:', error);
          }
        }

        setLocationInfo({
          address: result.formatted_address,
          locationDetails: {
            ...locationDetails,
            streetNumber: getAddressComponent('street_number'),
            streetName: getAddressComponent('route'),
            neighborhood: getAddressComponent('neighborhood'),
            locality: getAddressComponent('locality'),
            administrativeAreaLevel1: getAddressComponent('administrative_area_level_1'),
            administrativeAreaLevel2: getAddressComponent('administrative_area_level_2'),
            postalCode: postcode || getAddressComponent('postal_code'),
            country: getAddressComponent('country'),
            plusCode: result.plus_code?.global_code
          },
          loading: false
        });
      } else {
        setLocationInfo({
          loading: false,
          error: 'No location found for these coordinates'
        });
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
      setLocationInfo({
        loading: false,
        error: 'Error fetching location details'
      });
    }
  };

  const copyAndSaveLocation = async () => {
    console.log('THIS IS THE LOCATION: ', )
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
            <DetailItem label="Digital Address" value={locationInfo.locationDetails.address} />
            <DetailItem label="Street Number" value={locationInfo.locationDetails.streetNumber} />
            <DetailItem label="Street Name" value={locationInfo.locationDetails.streetName} />
            <DetailItem label="Neighborhood" value={locationInfo.locationDetails.neighborhood} />
            <DetailItem label="Locality" value={locationInfo.locationDetails.locality} />
            <DetailItem label="Region" value={locationInfo.locationDetails.administrativeAreaLevel1} />
            <DetailItem label="Municipality" value={locationInfo.locationDetails.administrativeAreaLevel2} />
            <DetailItem label="Postal Code" value={locationInfo.locationDetails.postalCode} />
            <DetailItem label="Country" value={locationInfo.locationDetails.country} />
            <DetailItem label="Plus Code" value={locationInfo.locationDetails.plusCode} />
            <DetailItem label="Google Maps Address" value={locationInfo.address} />
            </div>

              <div className="flex items-center justify-between">
                <span className="font-bold">Complete Home Address:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                  onClick={() => {
                    const address = [
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
                  locationInfo.locationDetails.address,
                  locationInfo.locationDetails.streetNumber && 
                    `${locationInfo.locationDetails.streetNumber} ${locationInfo.locationDetails.streetName}`,
                  locationInfo.locationDetails.neighborhood,
                  locationInfo.locationDetails.locality,
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
          <CardTitle>Get Location Details by Coordinates</CardTitle>
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

export default GetLocationByCoordinates;












// "use client";

// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Search, Copy } from 'lucide-react';
// import { Label } from '@/components/ui/label';
// import { toast } from 'sonner';
// // import { getPostCodeFromDB } from '@/lib/get-postcode-from-database';

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

// const GetLocationByCoordinates = () => {
//   const [coordinates, setCoordinates] = useState({
//     latitude: '',
//     longitude: ''
//   });
  
//   const [locationInfo, setLocationInfo] = useState<{
//     address?: string;
//     locationDetails?: LocationDetails;
//     loading: boolean;
//     error?: string;
//   }>({
//     loading: false
//   });

//   const isValidCoordinates = () => {
//     const lat = parseFloat(coordinates.latitude);
//     const lng = parseFloat(coordinates.longitude);
    
//     return !isNaN(lat) && !isNaN(lng) && 
//            lat >= -90 && lat <= 90 && 
//            lng >= -180 && lng <= 180;
//   };
  
//   const copyAndSaveLocation = async () => {
//     // console log the values to be saved to the database
//     console.log("here is the data to be savedeeeed:", location);
//     if (!isValidCoordinates() || !locationInfo.locationDetails) return;
  
//     // First, copy to clipboard
//     const locationString = `${coordinates.latitude},${coordinates.longitude}`;
//     navigator.clipboard.writeText(locationString);
  
//     try {
//       // Save to database
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
//           description: data.message || 'This location has already been saved in the database.',
//           action: {
//             label: 'OK',
//             onClick: () => toast.dismiss()
//           }
//         });
//         return;
//       }
  
//       if (!response.ok) {
//         throw new Error('Failed to save location');
//       }
  
//       toast.success('Digital Address copied and saved', {
//         description: 'The digital address has been copied to your clipboard and saved for future reference.',
//         action: {
//           label: 'OK',
//           onClick: () => toast.dismiss()
//         }
//       });
//     } catch (error) {
//       console.error('Error saving location:', error);
      
//       const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      
//       toast.error('Error saving location', {
//         description: `The digital address was copied to your clipboard, but couldn't be saved: ${errorMessage}`,
//         action: {
//           label: 'OK',
//           onClick: () => toast.dismiss()
//         }
//       });
//     }
//   };

//   // const getLocationDetails = async () => {
//   //   if (!isValidCoordinates()) {
//   //     setLocationInfo({
//   //       loading: false,
//   //       error: 'Please enter valid coordinates (latitude: -90 to 90, longitude: -180 to 180)'
//   //     });
//   //     return;
//   //   }
  
//   //   setLocationInfo(prev => ({ ...prev, loading: true, error: undefined }));
  
//   //   try {
//   //     const [googleResponse, okLocationResponse] = await Promise.all([
//   //       fetch(
//   //         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
//   //       ),
//   //       fetch(
//   //         `/api/v1/address?lat=${coordinates.latitude}&lng=${coordinates.longitude}`,
//   //         {
//   //           headers: {
//   //             'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
//   //             ...(process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET && { 
//   //               'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET 
//   //             })
//   //           }
//   //         }
//   //       )
//   //     ]);
  
//   //     const [googleData, locationDetails] = await Promise.all([
//   //       googleResponse.json(),
//   //       okLocationResponse.json()
//   //     ]);
  
//   //     if (googleData.status === 'OK' && googleData.results.length > 0) {
//   //       const result = googleData.results[0];
//   //       const addressComponents = result.address_components;
  
//   //       const getAddressComponent = (type: string) => {
//   //         const component = addressComponents.find((comp: { types: string[] }) => comp.types.includes(type));
//   //         return component ? component.long_name : undefined;
//   //       };

//   //       // Extract address components
//   //     const locality = getAddressComponent('locality') || getAddressComponent('sublocality');
//   //     const district = getAddressComponent('administrative_area_level_2');
//   //     const region = getAddressComponent('administrative_area_level_1');
//   //     console.log("this is the locality:", locality);
//   //     console.log("this is the district:", district);
//   //     console.log("this is the region:", region);

      

      

//   //     // Fetch postcode data
//   //     // let postcodeData = null;
//   //     if (locality || district || region) {
//   //       try {
//   //         const postcodeResponse = await fetch(
//   //           `/api/v1/postcode/lookup?${new URLSearchParams({
//   //             ...(locality && { locality }),
//   //             ...(district && { district }),
//   //             ...(region && { region })
//   //           })}`,
//   //           {
//   //             headers: {
//   //               'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
//   //               'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET || ''
//   //             }
//   //           }
//   //         );
//   //         console.log("THESE IS THE RESPONSE: ", postcodeResponse)
//   //         // log the postcode from the response
          
//   //         if (postcodeResponse.ok) {
//   //           await postcodeResponse.json();
//   //         }
//   //       } catch (error) {
//   //         console.error('Error fetching postcode:', error);
//   //       }
//   //     }
  
//   //       setLocationInfo({
//   //         address: result.formatted_address,
//   //         locationDetails: {
//   //           ...locationDetails,
//   //           streetNumber: getAddressComponent('street_number'),
//   //           streetName: getAddressComponent('route'),
//   //           neighborhood: getAddressComponent('neighborhood'),
//   //           locality: getAddressComponent('locality'),
//   //           administrativeAreaLevel1: getAddressComponent('administrative_area_level_1'),
//   //           administrativeAreaLevel2: getAddressComponent('administrative_area_level_2'),
//   //           postalCode: getAddressComponent('postal_code'),
//   //           country: getAddressComponent('country'),
//   //           plusCode: result.plus_code ? result.plus_code.global_code : undefined
//   //         },
//   //         loading: false
//   //       });
//   //     } else {
//   //       setLocationInfo({
//   //         loading: false,
//   //         error: 'No location found for these coordinates'
//   //       });
//   //     }
//   //   } catch (error) {
//   //     console.error('Error fetching location details:', error);
//   //     setLocationInfo({
//   //       loading: false,
//   //       error: 'Error fetching location details'
//   //     });
//   //   }
//   // };


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
//       const [googleResponse, okLocationResponse] = await Promise.all([
//         fetch(
//           `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
//         ),
//         fetch(
//           `/api/v1/address?lat=${coordinates.latitude}&lng=${coordinates.longitude}`,
//           {
//             headers: {
//               'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
//               ...(process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET && { 
//                 'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET 
//               })
//             }
//           }
//         )
//       ]);
  
//       const [googleData, locationDetails] = await Promise.all([
//         googleResponse.json(),
//         okLocationResponse.json()
//       ]);
  
//       if (googleData.status === 'OK' && googleData.results.length > 0) {
//         const result = googleData.results[0];
//         const addressComponents = result.address_components;
  
//         const getAddressComponent = (type: string) => {
//           const component = addressComponents.find((comp: { types: string[] }) => comp.types.includes(type));
//           return component ? component.long_name : undefined;
//         };
  
//         // Extract address components
//         const locality = getAddressComponent('locality') || getAddressComponent('sublocality');
//         const district = getAddressComponent('administrative_area_level_2');
//         const region = getAddressComponent('administrative_area_level_1');
  
//         console.log("Locality:", locality);
//         console.log("District:", district);
//         console.log("Region:", region);
  
//         // Fetch postcode data
//         let postcode = null;
//         if (locality || district || region) {
//           try {
//             const postcodeResponse = await fetch(
//               `/api/v1/postcode/lookup?${new URLSearchParams({
//                 ...(locality && { locality }),
//                 ...(district && { district }),
//                 ...(region && { region })
//               })}`,
//               {
//                 headers: {
//                   'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
//                   'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET || ''
//                 }
//               }
//             );
  
//             if (postcodeResponse.ok) {
//               const postcodeData = await postcodeResponse.json();
//               postcode = postcodeData.postcode;
//               console.log("Postcode:", postcode);
//             }
//           } catch (error) {
//             console.error('Error fetching postcode:', error);
//           }
//         }
  
//         setLocationInfo({
//           address: result.formatted_address,
//           locationDetails: {
//             ...locationDetails,
//             streetNumber: getAddressComponent('street_number'),
//             streetName: getAddressComponent('route'),
//             neighborhood: getAddressComponent('neighborhood'),
//             locality: getAddressComponent('locality'),
//             administrativeAreaLevel1: getAddressComponent('administrative_area_level_1'),
//             administrativeAreaLevel2: getAddressComponent('administrative_area_level_2'),
//             postalCode: postcode || getAddressComponent('postal_code'), // Use fetched postcode or fallback to Google's postal code
//             country: getAddressComponent('country'),
//             plusCode: result.plus_code ? result.plus_code.global_code : undefined
//           },
//           loading: false
//         });
//       } else {
//         setLocationInfo({
//           loading: false,
//           error: 'No location found for these coordinates'
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching location details:', error);
//       setLocationInfo({
//         loading: false,
//         error: 'Error fetching location details'
//       });
//     }
//   };

//   // let's console log the location details we get from the api
//     console.log("location details from api:", locationInfo);

// //   const copyLocation = () => {
// //     const locationString = `${coordinates.latitude},${coordinates.longitude}`;
// //     navigator.clipboard.writeText(locationString);
// //     toast.success('Location copied to clipboard');
// //   };

//   return (
//     <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
//       <Card>
//         <CardHeader>
//           <CardTitle>Get Location Details by Coordinates</CardTitle>
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

//       {(locationInfo.address || locationInfo.locationDetails) && (
//         <Card className="mt-4">
//         <CardHeader>
//           <CardTitle className="text-lg">Location Details</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-2">
//           <div>
//             <div className="font-semibold">Coordinates</div>
//             <div>{coordinates.latitude}, {coordinates.longitude}</div>
//           </div>
//           {locationInfo.locationDetails && (
//             <>
//               <div>
//                 <div className="font-semibold">Digital Address</div>
//                 <div>{locationInfo.locationDetails.address}</div>
//               </div>
//               <div>
//                 <div className="font-semibold">Street Number</div>
//                 <div>{locationInfo.locationDetails.streetNumber}</div>
//               </div>
//               <div>
//                 <div className="font-semibold">Street Name</div>
//                 <div>{locationInfo.locationDetails.streetName}</div>
//               </div>
//               <div>
//                 <div className="font-semibold">Neighborhood</div>
//                 <div>{locationInfo.locationDetails.neighborhood}</div>
//               </div>
//               <div>
//                 <div className="font-semibold">Locality</div>
//                 <div>{locationInfo.locationDetails.locality}</div>
//               </div>
//               <div>
//                 <div className="font-semibold">Region</div>
//                 <div>{locationInfo.locationDetails.administrativeAreaLevel1}</div>
//               </div>
//               <div>
//                 <div className="font-semibold">Municipality</div>
//                 <div>{locationInfo.locationDetails.administrativeAreaLevel2}</div>
//               </div>
//               <div>
//                 <div className="font-semibold">Postal Code</div>
//                 <div>{locationInfo.locationDetails.postalCode}</div>
//               </div>
//               <div>
//                 <div className="font-semibold">Country</div>
//                 <div>{locationInfo.locationDetails.country}</div>
//               </div>
//               <div>
//                 <div className="font-semibold">Plus Code</div>
//                 <div>{locationInfo.locationDetails.plusCode}</div>
//               </div>
//             </>
//           )}
//           {locationInfo.address && (
//             <div>
//               <div className="font-semibold">Google Maps Address</div>
//               <div>{locationInfo.address}</div>
//             </div>
//           )}
      
//           <div>
//             <span className="font-bold">Here is your complete home address:</span>
//             {locationInfo.locationDetails && (
//               <div className="border rounded-md m-4">
//                 {locationInfo.locationDetails.streetNumber && (
//                   <div className="ml-4 mr-4 mt-4">{locationInfo.locationDetails.address}</div>
//                 )}
//                 {locationInfo.locationDetails.streetNumber && (
//                   <div className="ml-4 mr-4">{locationInfo.locationDetails.streetNumber} {locationInfo.locationDetails.streetName}</div>
//                 )}
//                 {locationInfo.locationDetails.neighborhood && (
//                   <div className="ml-4 mr-4">{locationInfo.locationDetails.neighborhood}</div>
//                 )}
//                 {locationInfo.locationDetails.locality && (
//                   <div className="ml-4 mr-4">{locationInfo.locationDetails.locality}</div>
//                 )}
//                 {locationInfo.locationDetails.administrativeAreaLevel2 && (
//                   <div className="ml-4 mr-4">{locationInfo.locationDetails.administrativeAreaLevel2}</div>
//                 )}
//                 {locationInfo.locationDetails.administrativeAreaLevel1 && (
//                   <div className="ml-4 mr-4">{locationInfo.locationDetails.administrativeAreaLevel1}</div>
//                 )}
//                 {locationInfo.locationDetails.postalCode && (
//                   <div className="ml-4 mr-4">{locationInfo.locationDetails.postalCode}</div>
//                 )}
//                 {locationInfo.locationDetails.country && (
//                   <div className="ml-4 mr-4 mb-4">{locationInfo.locationDetails.country}</div>
//                 )}
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//       )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default GetLocationByCoordinates;







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
//   coordinates: {
//     latitude: number;
//     longitude: number;
//   };
// }

// const GetLocationByCoordinates = () => {
//   const [coordinates, setCoordinates] = useState({
//     latitude: '',
//     longitude: ''
//   });
  
//   const [locationInfo, setLocationInfo] = useState<{
//     address?: string;
//     locationDetails?: LocationDetails;
//     loading: boolean;
//     error?: string;
//   }>({
//     loading: false
//   });

//   const isValidCoordinates = () => {
//     const lat = parseFloat(coordinates.latitude);
//     const lng = parseFloat(coordinates.longitude);
    
//     return !isNaN(lat) && !isNaN(lng) && 
//            lat >= -90 && lat <= 90 && 
//            lng >= -180 && lng <= 180;
//   };
  
//   const copyAndSaveLocation = async () => {
//     // console log the values to be saved to the database
//     console.log("here is the data to be savedeeeed:", location);
//     if (!isValidCoordinates() || !locationInfo.locationDetails) return;
  
//     // First, copy to clipboard
//     const locationString = `${coordinates.latitude},${coordinates.longitude}`;
//     navigator.clipboard.writeText(locationString);
  
//     try {
//       // Save to database
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
//           description: data.message || 'This location has already been saved in the database.',
//           action: {
//             label: 'OK',
//             onClick: () => toast.dismiss()
//           }
//         });
//         return;
//       }
  
//       if (!response.ok) {
//         throw new Error('Failed to save location');
//       }
  
//       toast.success('Digital Address copied and saved', {
//         description: 'The digital address has been copied to your clipboard and saved for future reference.',
//         action: {
//           label: 'OK',
//           onClick: () => toast.dismiss()
//         }
//       });
//     } catch (error) {
//       console.error('Error saving location:', error);
      
//       const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      
//       toast.error('Error saving location', {
//         description: `The digital address was copied to your clipboard, but couldn't be saved: ${errorMessage}`,
//         action: {
//           label: 'OK',
//           onClick: () => toast.dismiss()
//         }
//       });
//     }
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
//       const [googleResponse, okLocationResponse] = await Promise.all([
//         fetch(
//           `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
//         ),
//         fetch(
//           `/api/v1/address?lat=${coordinates.latitude}&lng=${coordinates.longitude}`,
//           {
//             headers: {
//               'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OKLOCATION_API_KEY}`,
//               ...(process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET && { 
//                 'x-api-secret': process.env.NEXT_PUBLIC_OKLOCATION_API_SECRET 
//               })
//             }
//           }
//         )
//       ]);

//       const [googleData, locationDetails] = await Promise.all([
//         googleResponse.json(),
//         okLocationResponse.json()
//       ]);

//       console.log("this is the google response:", googleResponse)

//       if (googleData.status === 'OK' && googleData.results.length > 0) {
//         setLocationInfo({
//           address: googleData.results[0].formatted_address,
//           locationDetails,
//           loading: false
//         });
//       } else {
//         setLocationInfo({
//           loading: false,
//           error: 'No location found for these coordinates'
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching location details:', error);
//       setLocationInfo({
//         loading: false,
//         error: 'Error fetching location details'
//       });
//     }
//   };


//   // let's console log the location details we get from the api
//     console.log("location details from api:", locationInfo);

// //   const copyLocation = () => {
// //     const locationString = `${coordinates.latitude},${coordinates.longitude}`;
// //     navigator.clipboard.writeText(locationString);
// //     toast.success('Location copied to clipboard');
// //   };

//   return (
//     <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
//       <Card>
//         <CardHeader>
//           <CardTitle>Get Location Details by Coordinates</CardTitle>
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
//             <Card className="mt-4">
//               <CardHeader>
//                 <CardTitle className="text-lg">Location Details</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2">
//                 <div>
//                   <div className="font-semibold">Coordinates</div>
//                   <div>{coordinates.latitude}, {coordinates.longitude}</div>
//                 </div>
//                 {locationInfo.locationDetails && (
//                   <>
//                     <div>
//                       <div className="font-semibold">Digital Address</div>
//                       <div>{locationInfo.locationDetails.address}</div>
//                     </div>
//                     <div>
//                       <div className="font-semibold">District</div>
//                       <div>{locationInfo.locationDetails.district}</div>
//                     </div>
//                     <div>
//                       <div className="font-semibold">Region</div>
//                       <div>{locationInfo.locationDetails.region}</div>
//                     </div>
//                   </>
//                 )}
//                 {locationInfo.address && (
//                   <div>
//                     <div className="font-semibold">Google Maps Address</div>
//                     <div>{locationInfo.address}</div>
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

// export default GetLocationByCoordinates;



// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Search, Copy } from 'lucide-react';
// import { Label } from '@/components/ui/label';
// import { toast } from 'sonner';

// const GetLocationByCoordinates = () => {
//   const [coordinates, setCoordinates] = useState({
//     latitude: '',
//     longitude: ''
//   });
  
//   const [locationInfo, setLocationInfo] = useState<{
//     address?: string;
//     loading: boolean;
//     error?: string;
//   }>({
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
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
//       );
//       const data = await response.json();

//       if (data.status === 'OK' && data.results.length > 0) {
//         setLocationInfo({
//           address: data.results[0].formatted_address,
//           loading: false
//         });
//       } else {
//         setLocationInfo({
//           loading: false,
//           error: 'No location found for these coordinates'
//         });
//       }
//     } catch {
//       setLocationInfo({
//         loading: false,
//         error: 'Error fetching location details'
//       });
//     }
//   };

//   const copyLocation = () => {
//     const locationString = `${coordinates.latitude},${coordinates.longitude}`;
//     navigator.clipboard.writeText(locationString);
//     toast.success('Location copied to clipboard');
//   };

//   return (
//     <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
//       <Card>
//         <CardHeader>
//           <CardTitle>Get Location Details by Coordinates</CardTitle>
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
//               onClick={copyLocation}
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

//           {locationInfo.address && (
//             <Card className="mt-4">
//               <CardHeader>
//                 <CardTitle className="text-lg">Location Details</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2">
//                 <div>
//                   <div className="font-semibold">Coordinates</div>
//                   <div>{coordinates.latitude}, {coordinates.longitude}</div>
//                 </div>
//                 <div>
//                   <div className="font-semibold">Address</div>
//                   <div>{locationInfo.address}</div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default GetLocationByCoordinates;