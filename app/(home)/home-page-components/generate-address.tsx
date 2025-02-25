"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Navigation2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";

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

const GenerateAddressDialog = () => {
  const [coordinates, setCoordinates] = useState({ latitude: '', longitude: '' });
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({ loading: false });

  const isValidCoordinates = () => {
    const lat = parseFloat(coordinates.latitude);
    const lng = parseFloat(coordinates.longitude);
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  };

  const getCurrentLocation = () => {
    setLocationInfo(prev => ({ ...prev, loading: true, error: undefined }));

    if (!navigator.geolocation) {
      setLocationInfo(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser'
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setCoordinates({
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        });
        await getLocationDetails();
      },
      (error) => {
        setLocationInfo(prev => ({
          ...prev,
          loading: false,
          error: `Error getting location: ${error.message}`
        }));
      }
    );
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
            postalCode: getAddressComponent('postal_code'),
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
    } catch {
      console.error('Error fetching location details');
      setLocationInfo({
        loading: false,
        error: 'Error fetching location details'
      });
    }
  };

  const copyAndSaveLocation = async () => {
      // console log the values to be saved to the database
      console.log("here is the data to be savedeeeed:", location);
      if (!isValidCoordinates() || !locationInfo.locationDetails) return;
    
      // First, copy to clipboard
      const locationString = locationInfo.address || '';
      navigator.clipboard.writeText(locationString);
    
      try {
        // Save to database
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
            description: data.message || 'This location has already been saved in the database.',
            action: {
              label: 'OK',
              onClick: () => toast.dismiss()
            }
          });
          return;
        }
    
        if (!response.ok) {
          throw new Error('Failed to save location');
        }
    
        toast.success('Digital Address copied and saved', {
          description: 'The digital address has been copied to your clipboard and saved for future reference.',
          action: {
            label: 'OK',
            onClick: () => toast.dismiss()
          }
        });
      } catch (error) {
        console.error('Error saving location:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
        
        toast.error('Error saving location', {
          description: `The digital address was copied to your clipboard, but couldn't be saved: ${errorMessage}`,
          action: {
            label: 'OK',
            onClick: () => toast.dismiss()
          }
        });
      }
    };

  const LocationDetailsCard = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Location Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {locationInfo.locationDetails && (
          <>
            <DetailItem label="Coordinates" value={`${coordinates.latitude}, ${coordinates.longitude}`} />
            <DetailItem label="Digital Address" value={locationInfo.locationDetails.address} />
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
            
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">Complete Home Address:</span>
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
              {/* <h3 className="font-bold mb-2">Complete Home Address</h3> */}
              <div className="border rounded-md p-4 space-y-1">
                {[
                  locationInfo.locationDetails.address,
                  `${locationInfo.locationDetails.streetNumber} ${locationInfo.locationDetails.streetName}`,
                  locationInfo.locationDetails.neighborhood,
                  locationInfo.locationDetails.locality,
                  locationInfo.locationDetails.administrativeAreaLevel2,
                  locationInfo.locationDetails.administrativeAreaLevel1,
                  locationInfo.locationDetails.postalCode,
                  locationInfo.locationDetails.country
                ].filter(Boolean).map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </div>
          </>
        )}
        {locationInfo.address && (
          <DetailItem label="Google Maps Address" value={locationInfo.address} />
        )}
      </CardContent>
    </Card>
  );

  const DetailItem = ({ label, value }: { label: string; value?: string }) => (
    value ? (
      <div>
        <div className="font-semibold">{label}</div>
        <div>{value}</div>
      </div>
    ) : null
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Navigation2 className="w-4 h-4" />
          Generate Address
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Generate Address from Current Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={getCurrentLocation} 
                disabled={locationInfo.loading} 
                className="w-full"
              >
                <Navigation2 className="mr-2 h-4 w-4" />
                {locationInfo.loading ? "Fetching..." : "Get Current Location"}
              </Button>

              {locationInfo.error && (
                <p className="text-red-500 text-sm">{locationInfo.error}</p>
              )}

              {locationInfo.address && (
                <div className="mt-4">
                  <Label>Address</Label>
                  <div className="flex items-center gap-2">
                    <Input value={locationInfo.address} readOnly />
                    <Button size="icon" onClick={copyAndSaveLocation}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {(locationInfo.address || locationInfo.locationDetails) && (
                <LocationDetailsCard />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateAddressDialog;






// "use client";

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Copy, Navigation2 } from "lucide-react";
// import { toast } from "sonner";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import { motion } from "framer-motion";
// import { Label } from "@/components/ui/label";

// const GenerateAddressDialog = () => {
//   const [location, setLocation] = useState<{
//     coords?: { latitude: number; longitude: number };
//     address?: string;
//     loading: boolean;
//     error?: string;
//   }>({ loading: false });

//   const getCurrentLocation = () => {
//     setLocation({ loading: true, error: undefined });

//     if (!navigator.geolocation) {
//       setLocation({ loading: false, error: "Geolocation not supported" });
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         try {
//           const response = await fetch(
//             `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
//           );
//           const data = await response.json();

//           if (data.status === "OK" && data.results.length > 0) {
//             setLocation({
//               coords: position.coords,
//               address: data.results[0].formatted_address,
//               loading: false,
//             });
//           } else {
//             setLocation({ loading: false, error: "No address found" });
//           }
//         } catch {
//           setLocation({ loading: false, error: "Error fetching address" });
//         }
//       },
//       (error) => {
//         setLocation({ loading: false, error: error.message });
//       }
//     );
//   };

//   const copyAddress = () => {
//     if (location.address) {
//       navigator.clipboard.writeText(location.address);
//       toast.success("Address copied to clipboard");
//     }
//   };

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="outline" className="flex items-center gap-2">
//           <Navigation2 className="w-4 h-4" />
//           Generate Address
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-md">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//         >
//           <Card>
//             <CardHeader>
//               <CardTitle>Generate Address from Current Location</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <Button onClick={getCurrentLocation} disabled={location.loading} className="w-full">
//                 <Navigation2 className="mr-2 h-4 w-4" />
//                 {location.loading ? "Fetching..." : "Get Current Location"}
//               </Button>
//               {location.error && <p className="text-red-500 text-sm">{location.error}</p>}
//               {location.address && (
//                 <div className="mt-4">
//                   <Label>Address</Label>
//                   <div className="flex items-center gap-2">
//                     <Input value={location.address} readOnly />
//                     <Button size="icon" onClick={copyAddress}>
//                       <Copy className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </motion.div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default GenerateAddressDialog;