// app/generate-address/generate-address-components-generate-address.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Navigation2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";

interface LocationDetails {
    digitalAddress: string;  // Added this
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

const OpenStreetGenerateAddress = () => {
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
  
        try {
          // Step 1: Use Nominatim API to get address details
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`
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
          console.log("OpenStreetMap address:", address);
  
          // Step 2: Fetch postcode and digital address from our API
          const postCodeResponse = await fetch(
            `/api/v1/address?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,
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
          console.log('API response:', postCodeData);
  
          if (!postCodeResponse.ok) {
            throw new Error(postCodeData.error || 'Failed to fetch postcode');
          }
  
          // Step 3: Combine both data sources
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
              locality: postCodeData.locality || address.city || address.town || address.village || '',
              administrativeAreaLevel1: postCodeData.region || address.state || '',
              administrativeAreaLevel2: postCodeData.district || address.county || '',
              postalCode: postCodeData.postcode || address.postcode || '',
              country: address.country || '',
              plusCode: '',
              coordinates: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
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

  const copyAndSaveLocation = async () => {
    if (!isValidCoordinates() || !locationInfo.locationDetails) return;

    // const locationString = `${coordinates.latitude},${coordinates.longitude}`;
    const locationString = locationInfo.locationDetails?.digitalAddress;
    navigator.clipboard.writeText(locationString);

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
          address: locationInfo.locationDetails.address,
          locationDetails: {
            address: locationInfo.locationDetails.digitalAddress,
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
        {/* <CardTitle className="text-lg">Location Details</CardTitle> */}
      </CardHeader>
      <CardContent className="space-y-2">
        {locationInfo.locationDetails && (
          <>
            {/* <DetailItem label="Coordinates" value={`${coordinates.latitude}, ${coordinates.longitude}`} />
            <DetailItem label="Digital Address" value={locationInfo.locationDetails.digitalAddress} />
            <DetailItem label="Street Number" value={locationInfo.locationDetails.streetNumber} />
            <DetailItem label="Street Name" value={locationInfo.locationDetails.streetName} />
            <DetailItem label="Suburb" value={locationInfo.locationDetails.suburb} />
            <DetailItem label="Town" value={locationInfo.locationDetails.town} />
            <DetailItem label="Neighborhood" value={locationInfo.locationDetails.neighborhood} />
            <DetailItem label="Locality" value={locationInfo.locationDetails.locality} />
            <DetailItem label="Region" value={locationInfo.locationDetails.administrativeAreaLevel1} />
            <DetailItem label="Municipality" value={locationInfo.locationDetails.administrativeAreaLevel2} />
            <DetailItem label="Postal Code" value={locationInfo.locationDetails.postalCode} />
            <DetailItem label="Country" value={locationInfo.locationDetails.country} /> */}

            <div className="flex items-center justify-between">
              <span className="font-bold">Complete Home Address:</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm"
                onClick={() => {
                  const address = [
                    locationInfo.locationDetails?.digitalAddress,
                    locationInfo.locationDetails?.streetNumber && 
                      `${locationInfo.locationDetails?.streetNumber} ${locationInfo.locationDetails.streetName}`,
                    locationInfo.locationDetails?.suburb,
                    locationInfo.locationDetails?.town,
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
              <div className="border rounded-md p-4 space-y-1">
                {[
                  locationInfo.locationDetails.digitalAddress,
                  `${locationInfo.locationDetails.streetNumber} ${locationInfo.locationDetails.streetName}`,
                  locationInfo.locationDetails.suburb,
                  locationInfo.locationDetails.town,
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
      </CardContent>
    </Card>
  );

//   const DetailItem = ({ label, value }: { label: string; value?: string }) => (
//     value ? (
//       <div>
//         <div className="font-semibold">{label}</div>
//         <div>{value}</div>
//       </div>
//     ) : null
//   );

  return (
    <div className="container mx-auto py-8 px-4 ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Generate Digital Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-4">
              <Button 
                onClick={getCurrentLocation} 
                disabled={locationInfo.loading} 
                className="w-full py-6 text-lg"
                size="lg"
              >
                <Navigation2 className="mr-3 h-5 w-5" />
                {locationInfo.loading ? "Fetching Location..." : "Get Current Location"}
              </Button>

              {locationInfo.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600 text-sm">{locationInfo.error}</p>
                </div>
              )}

              {locationInfo.address && (
                <div className="space-y-2">
                  <Label className="text-base">Current Address</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={locationInfo.locationDetails?.digitalAddress} 
                      readOnly 
                      className="text-sm"
                    />
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={copyAndSaveLocation}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {(locationInfo.address || locationInfo.locationDetails) && (
                <LocationDetailsCard />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OpenStreetGenerateAddress;