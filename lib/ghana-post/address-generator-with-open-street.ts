// lib/ghana-post/address-generator.ts

import { GHANA_DISTRICTS_DATA } from './data';

interface GPSAddress {
  address: string;
  district: string; // This will be the district code (e.g., "G4")
  locality: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Helper function to round coordinates to the nearest grid cell
const roundToGrid = (value: number, offset: number): number => {
  return Math.floor(value / offset) * offset;
};

export const OpenStreeGenerateGPSAddress = async (latitude: number, longitude: number): Promise<GPSAddress & { locality: string }> => {
  // Define grid cell size (in degrees)
  const latitudeOffset = 0.0000137; // ~5 square feet in latitude
  const longitudeOffset = 0.0000173; // ~5 square feet in longitude

  // Round coordinates to the nearest grid cell
  const roundedLatitude = roundToGrid(latitude, latitudeOffset);
  const roundedLongitude = roundToGrid(longitude, longitudeOffset);

  // Fetch location details from OpenStreetMap using rounded coordinates
  const osmResponse = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${roundedLatitude}&lon=${roundedLongitude}&format=json&addressdetails=1`,
    {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'oKLocation/1.0'
      }
    }
  );
  const osmData = await osmResponse.json();

  if (!osmData || !osmData.address) {
    throw new Error('No location found for these coordinates');
  }

  // Extract region (state) and district (county) from OSM data
  const region = osmData.address.state || '';
  const districtName = osmData.address.county || osmData.address.city_district || '';
  const locality = osmData.address.town || osmData.address.city || osmData.address.village || '';

  console.log('OSM Address Data:', {
    region,
    districtName,
    locality,
    fullAddress: osmData.address
  });

  // Attempt to match the district name with our official data
  const osmDistrictName = districtName.toLowerCase();
  const matchedDistrict = Object.values(GHANA_DISTRICTS_DATA).find((d) => {
    const officialName = d.name.toLowerCase();
    return officialName === osmDistrictName ||
           officialName.includes(osmDistrictName) ||
           osmDistrictName.includes(officialName);
  });

  if (!matchedDistrict) {
    throw new Error(`District code not found for "${districtName}"`);
  }
  const districtCode = matchedDistrict.code;

  // Generate a 3-digit number based on the rounded coordinates
  const coordinateNumber = Math.floor((Math.abs(roundedLatitude) + Math.abs(roundedLongitude)) * 1000) % 1000;
  const coordinateNumberStr = coordinateNumber.toString().padStart(3, '0');

  // Generate a 4-digit unique random number
  const uniqueNumber = Math.floor(1000 + Math.random() * 9000);
  const uniqueNumberStr = uniqueNumber.toString().padStart(4, '0');

  // Combine to create the digital address in the format: DistrictCode-XXX-YYYY
  const digitalAddress = `${districtCode}-${coordinateNumberStr}-${uniqueNumberStr}`;
  console.log("Generated address:", {
    address: digitalAddress,
    district: districtCode,
    locality,
    region,
    coordinates: {
      latitude: roundedLatitude,
      longitude: roundedLongitude
    }
  });

  return {
    address: digitalAddress,
    district: districtName,
    locality,
    region,
    coordinates: {
      latitude: roundedLatitude,
      longitude: roundedLongitude,
    },
  };
};