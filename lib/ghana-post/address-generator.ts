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

export const generateGPSAddress = async (latitude: number, longitude: number): Promise<GPSAddress  & { locality: string }> => {
  // Define grid cell size (in degrees)
  const latitudeOffset = 0.0000137; // ~5 square feet in latitude
  const longitudeOffset = 0.0000173; // ~5 square feet in longitude

  // Round coordinates to the nearest grid cell
  const roundedLatitude = roundToGrid(latitude, latitudeOffset);
  const roundedLongitude = roundToGrid(longitude, longitudeOffset);

  // Fetch location details from Google Geocoding API using rounded coordinates
  const googleResponse = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${roundedLatitude},${roundedLongitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  );
  const googleData = await googleResponse.json();
  // console.log("this the google response :", googleResponse)

  if (googleData.status !== 'OK' || googleData.results.length === 0) {
    throw new Error('No location found for these coordinates');
  }

  const result = googleData.results[0];
  const addressComponents = result.address_components;

  // Helper function to extract address components by type
  const getAddressComponent = (type: string): string => {
    const component = addressComponents.find((comp: { types: string[]; long_name: string }) =>
      comp.types.includes(type)
    );
    return component ? component.long_name : '';
  };

  // Extract region and district name from the address components.
  // We assume that administrative_area_level_1 is the region and
  // administrative_area_level_2 is the district.
  let region = getAddressComponent('administrative_area_level_1');
  const districtName = getAddressComponent('administrative_area_level_2');
  const districtLocality = getAddressComponent('locality')

  // Remove the word "Region" from the region name (if present)
  region = region.replace(/\bRegion\b/gi, '').trim();

  // Attempt to match the district name with our official data.
  // We use a flexible match: if either string is contained in the other (ignoring case).
  const googleDistrictName = districtName.toLowerCase();
  const matchedDistrict = Object.values(GHANA_DISTRICTS_DATA).find((d) => {
    const officialName = d.name.toLowerCase();
    return officialName === googleDistrictName ||
           officialName.includes(googleDistrictName) ||
           googleDistrictName.includes(officialName);
  });

  if (!matchedDistrict) {
    throw new Error(`District code not found for "${districtName}"`);
  }
  const districtCode = matchedDistrict.code;
  // const districtLocality = matchedLocality.code;

  // Generate a 3-digit number based on the rounded coordinates.
  // For example, we sum the absolute values, multiply by 1000, then modulo 1000.
  const coordinateNumber = Math.floor((Math.abs(roundedLatitude) + Math.abs(roundedLongitude)) * 1000) % 1000;
  const coordinateNumberStr = coordinateNumber.toString().padStart(3, '0');

  // Generate a 4-digit unique random number.
  const uniqueNumber = Math.floor(1000 + Math.random() * 9000);
  const uniqueNumberStr = uniqueNumber.toString().padStart(4, '0');

  // Combine to create the digital address in the format: DistrictCode-XXX-YYYY
  const digitalAddress = `${districtCode}-${coordinateNumberStr}-${uniqueNumberStr}`;
  console.log("here are they;", districtLocality, digitalAddress, districtName)

  return {
    address: digitalAddress,
    district: districtCode,
    locality: districtLocality,
    region,
    coordinates: {
      latitude: roundedLatitude,
      longitude: roundedLongitude,
    },
  };
};







// // lib/ghana-post/address-generator.ts

// interface GPSAddress {
//   address: string;
//   district: string;
//   region: string;
//   coordinates: {
//     latitude: number;
//     longitude: number;
//   };
// }

// // Helper function to round coordinates to the nearest grid cell
// const roundToGrid = (value: number, offset: number): number => {
//   return Math.floor(value / offset) * offset;
// };

// export const generateGPSAddress = async (latitude: number, longitude: number): Promise<GPSAddress> => {
//   // Define grid cell size (in degrees)
//   const latitudeOffset = 0.0000137; // ~5 square feet in latitude
//   const longitudeOffset = 0.0000173; // ~5 square feet in longitude

//   // Round coordinates to the nearest grid cell
//   const roundedLatitude = roundToGrid(latitude, latitudeOffset);
//   const roundedLongitude = roundToGrid(longitude, longitudeOffset);

//   // Fetch location details from Google Geocoding API using rounded coordinates
//   const googleResponse = await fetch(
//     `https://maps.googleapis.com/maps/api/geocode/json?latlng=${roundedLatitude},${roundedLongitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
//   );
//   const googleData = await googleResponse.json();

//   if (googleData.status !== 'OK' || googleData.results.length === 0) {
//     throw new Error('No location found for these coordinates');
//   }

//   const result = googleData.results[0];
//   const addressComponents = result.address_components;

//   // Helper function to extract address components
//   const getAddressComponent = (type: string) => {
//     const component = addressComponents.find((comp: { types: string[]; long_name: string }) =>
//       comp.types.includes(type)
//     );
//     return component ? component.long_name : '';
//   };

//   // Extract region, locality, and municipality
//   let region = getAddressComponent('administrative_area_level_1');
//   const locality = getAddressComponent('locality');
//   const municipality = getAddressComponent('administrative_area_level_2');

//   // Remove the word "Region" from the region name (case-insensitive)
//   region = region.replace(/\bRegion\b/gi, '').trim();

//   // Generate the unique code
//   const regionCode = region
//     .split(' ')
//     .map((word: string) => word[0])
//     .join('')
//     .toUpperCase();

//   const localityCode = locality
//     .split(' ')
//     .map((word: string) => word[0])
//     .join('')
//     .toUpperCase();

//   const municipalityCode = municipality
//     .split(' ')
//     .map((word: string) => word[0])
//     .join('')
//     .toUpperCase();

//   // Generate a random number from the rounded coordinates
//   const randomNumberFromCoords = Math.floor(
//     (Math.abs(roundedLatitude) + Math.abs(roundedLongitude)) * 1000
//   ) % 10000;

//   // Generate a 4-digit unique number (you can use a more sophisticated method if needed)
//   const uniqueNumber = Math.floor(1000 + Math.random() * 9000);

//   // Combine everything to create the Digital Address
//   const digitalAddress = `${regionCode}${localityCode}${municipalityCode}-${randomNumberFromCoords}-${uniqueNumber}`;

//   return {
//     address: digitalAddress,
//     district: municipality,
//     region: region,
//     coordinates: {
//       latitude: roundedLatitude,
//       longitude: roundedLongitude
//     }
//   };
// };







// // lib/ghana-post/address-generator.ts

// interface GPSAddress {
//   address: string;
//   district: string;
//   region: string;
//   coordinates: {
//     latitude: number;
//     longitude: number;
//   };
// }

// export const generateGPSAddress = async (latitude: number, longitude: number): Promise<GPSAddress> => {
//   // Fetch location details from Google Geocoding API
//   const googleResponse = await fetch(
//     `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
//   );
//   const googleData = await googleResponse.json();

//   if (googleData.status !== 'OK' || googleData.results.length === 0) {
//     throw new Error('No location found for these coordinates');
//   }

//   const result = googleData.results[0];
//   const addressComponents = result.address_components;

//   // Helper function to extract address components
//   const getAddressComponent = (type: string) => {
//     const component = addressComponents.find((comp: { types: string[]; long_name: string }) =>
//       comp.types.includes(type)
//     );
//     return component ? component.long_name : '';
//   };

//   // Extract region, locality, and municipality
//   let region = getAddressComponent('administrative_area_level_1');
//   const locality = getAddressComponent('locality');
//   const municipality = getAddressComponent('administrative_area_level_2');

//   // Remove the word "Region" from the region name (case-insensitive)
//   region = region.replace(/\bRegion\b/gi, '').trim();

//   // Generate the unique code
//   const regionCode = region
//     .split(' ')
//     .map((word: string) => word[0])
//     .join('')
//     .toUpperCase();

//   const localityCode = locality
//     .split(' ')
//     .map((word: string) => word[0])
//     .join('')
//     .toUpperCase();

//   const municipalityCode = municipality
//     .split(' ')
//     .map((word: string) => word[0])
//     .join('')
//     .toUpperCase();

//   // Generate a random number from the coordinates
//   const randomNumberFromCoords = Math.floor(
//     (Math.abs(latitude) + Math.abs(longitude)) * 1000
//   ) % 10000;

//   // Generate a 4-digit unique number (you can use a more sophisticated method if needed)
//   const uniqueNumber = Math.floor(1000 + Math.random() * 9000);

//   // Combine everything to create the Digital Address
//   const digitalAddress = `${regionCode}${localityCode}${municipalityCode}-${randomNumberFromCoords}-${uniqueNumber}`;

//   return {
//     address: digitalAddress,
//     district: municipality,
//     region: region,
//     coordinates: {
//       latitude,
//       longitude
//     }
//   };
// };




// // lib/ghana-post/address-generator.ts

// interface GPSAddress {
//   address: string;
//   district: string;
//   region: string;
//   coordinates: {
//     latitude: number;
//     longitude: number;
//   };
// }

// export const generateGPSAddress = async (latitude: number, longitude: number): Promise<GPSAddress> => {
//   // Fetch location details from Google Geocoding API
//   const googleResponse = await fetch(
//     `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
//   );
//   const googleData = await googleResponse.json();

//   if (googleData.status !== 'OK' || googleData.results.length === 0) {
//     throw new Error('No location found for these coordinates');
//   }

//   const result = googleData.results[0];
//   const addressComponents = result.address_components;

//   // Helper function to extract address components
//   const getAddressComponent = (type: string) => {
//     const component = addressComponents.find((comp: { types: string[]; long_name: string }) => comp.types.includes(type));
//     return component ? component.long_name : '';
//   };

//   // Extract region, locality, and municipality
//   const region = getAddressComponent('administrative_area_level_1');
//   const locality = getAddressComponent('locality');
//   const municipality = getAddressComponent('administrative_area_level_2');

//   // Generate the unique code
//   const regionCode = region
//     .split(' ')
//     .map((word: string) => word[0])
//     .join('')
//     .toUpperCase();

//   const localityCode = locality
//     .split(' ')
//     .map((word: string) => word[0])
//     .join('')
//     .toUpperCase();

//   const municipalityCode = municipality
//     .split(' ')
//     .map((word: string) => word[0])
//     .join('')
//     .toUpperCase();

//   // Generate a random number from the coordinates
//   const randomNumberFromCoords = Math.floor(
//     (Math.abs(latitude) + Math.abs(longitude)) * 1000
//   ) % 10000;

//   // Generate a 4-digit unique number (you can use a more sophisticated method if needed)
//   const uniqueNumber = Math.floor(1000 + Math.random() * 9000);

//   // Combine everything to create the Digital Address
//   const digitalAddress = `${regionCode}${localityCode}${municipalityCode}-${randomNumberFromCoords}-${uniqueNumber}`;

//   return {
//     address: digitalAddress,
//     district: municipality,
//     region: region,
//     coordinates: {
//       latitude,
//       longitude
//     }
//   };
// };







// // lib/ghana-post/address-generator.ts
// import { boundaryManager } from './utils/boundaries';

// interface GhanaGPSAddress {
//   address: string;
//   district: string;
//   region: string;
//   coordinates: {
//     latitude: number;
//     longitude: number;
//   };
// }

// // Ghana's boundaries for grid calculations
// const GHANA_BOUNDS = {
//   north: 11.5,  // Northern-most point
//   south: 4.5,   // Southern-most point
//   west: -3.5,   // Western-most point
//   east: 1.5,    // Eastern-most point
//   // Grid settings
//   gridCells: 1000000 // For high precision
// };

// export async function generateGPSAddress(latitude: number, longitude: number): Promise<GhanaGPSAddress> {
//   try {
//     // Validate coordinates are within Ghana
//     if (!isWithinGhana(latitude, longitude)) {
//       throw new Error('Coordinates are outside Ghana boundaries');
//     }

//     // Initialize the boundary manager before using it
//     await boundaryManager.initialize();

//     // Find the district for these coordinates
//     const district = await boundaryManager.findDistrict(latitude, longitude);
//     if (!district) {
//       throw new Error('Could not find district for these coordinates');
//     }

//     // Generate area code (first 3 digits)
//     const areaCode = generateAreaCode(latitude, longitude);

//     // Generate location code (last 4 digits)
//     const locationCode = generateLocationCode(latitude, longitude);

//     // Format the complete address
//     const address = `${district.properties.districtCode}-${areaCode}-${locationCode}`;

//     return {
//       address,
//       district: district.properties.districtName,
//       region: district.properties.regionName,
//       coordinates: { latitude, longitude }
//     };
//   } catch (error) {
//     // Enhance error handling with more specific error messages
//     if (error instanceof Error) {
//       throw new Error(`Error generating address: ${error.message}`);
//     }
//     throw new Error('Unknown error occurred while generating address');
//   }
// }

// function isWithinGhana(latitude: number, longitude: number): boolean {
//   return (
//     latitude >= GHANA_BOUNDS.south && 
//     latitude <= GHANA_BOUNDS.north &&
//     longitude >= GHANA_BOUNDS.west && 
//     longitude <= GHANA_BOUNDS.east
//   );
// }

// function generateAreaCode(latitude: number, longitude: number): string {
//   // Calculate normalized position within Ghana (0-1 range)
//   const normalizedLat = (latitude - GHANA_BOUNDS.south) / (GHANA_BOUNDS.north - GHANA_BOUNDS.south);
//   const normalizedLong = (longitude - GHANA_BOUNDS.west) / (GHANA_BOUNDS.east - GHANA_BOUNDS.west);

//   // Convert to grid coordinates (0-999 range for 3 digits)
//   const gridY = Math.floor(normalizedLat * 1000);
//   const gridX = Math.floor(normalizedLong * 1000);

//   // Combine into area code
//   const areaCode = (gridY * 1000 + gridX) % 1000;
//   return areaCode.toString().padStart(3, '0');
// }

// function generateLocationCode(latitude: number, longitude: number): string {
//   // Calculate fine-grained position within local grid
//   const latDecimal = (latitude % 0.001) * 10000;
//   const longDecimal = (longitude % 0.001) * 10000;

//   // Combine into location code
//   const locationCode = (Math.floor(latDecimal) * 10000 + Math.floor(longDecimal)) % 10000;
//   return locationCode.toString().padStart(4, '0');
// }

// // Example usage with enhanced error handling
// export async function getAddressFromCoordinates(latitude: number, longitude: number) {
//   try {
//     // Ensure boundary manager is initialized
//     await boundaryManager.initialize();
    
//     const address = await generateGPSAddress(latitude, longitude);
//     return {
//       success: true,
//       data: address
//     };
//   } catch (error) {
//     console.error('Error in getAddressFromCoordinates:', error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error occurred'
//     };
//   }
// }









// // lib/ghana-post/address-generator.ts
// import { boundaryManager } from './utils/boundaries';

// interface GhanaGPSAddress {
//   address: string;
//   district: string;
//   region: string;
//   coordinates: {
//     latitude: number;
//     longitude: number;
//   };
// }

// // Ghana's boundaries for grid calculations
// const GHANA_BOUNDS = {
//   north: 11.5,  // Northern-most point
//   south: 4.5,   // Southern-most point
//   west: -3.5,   // Western-most point
//   east: 1.5,    // Eastern-most point
//   // Grid settings
//   gridCells: 1000000 // For high precision
// };

// export async function generateGPSAddress(latitude: number, longitude: number): Promise<GhanaGPSAddress> {
//   try {
//     // Validate coordinates are within Ghana
//     if (!isWithinGhana(latitude, longitude)) {
//       throw new Error('Coordinates are outside Ghana boundaries');
//     }

//     // Initialize the boundary manager before using it
//     await boundaryManager.initialize();

//     // Find the district for these coordinates
//     const district = await boundaryManager.findDistrict(latitude, longitude);
//     if (!district) {
//       throw new Error('Could not find district for these coordinates');
//     }

//     // Generate area code (first 3 digits)
//     const areaCode = generateAreaCode(latitude, longitude);

//     // Generate location code (last 4 digits)
//     const locationCode = generateLocationCode(latitude, longitude);

//     // Format the complete address
//     const address = `${district.properties.districtCode}-${areaCode}-${locationCode}`;

//     return {
//       address,
//       district: district.properties.districtName,
//       region: district.properties.regionName,
//       coordinates: { latitude, longitude }
//     };
//   } catch (error) {
//     // Enhance error handling with more specific error messages
//     if (error instanceof Error) {
//       throw new Error(`Error generating address: ${error.message}`);
//     }
//     throw new Error('Unknown error occurred while generating address');
//   }
// }

// function isWithinGhana(latitude: number, longitude: number): boolean {
//   return (
//     latitude >= GHANA_BOUNDS.south && 
//     latitude <= GHANA_BOUNDS.north &&
//     longitude >= GHANA_BOUNDS.west && 
//     longitude <= GHANA_BOUNDS.east
//   );
// }

// function generateAreaCode(latitude: number, longitude: number): string {
//   // Calculate normalized position within Ghana (0-1 range)
//   const normalizedLat = (latitude - GHANA_BOUNDS.south) / (GHANA_BOUNDS.north - GHANA_BOUNDS.south);
//   const normalizedLong = (longitude - GHANA_BOUNDS.west) / (GHANA_BOUNDS.east - GHANA_BOUNDS.west);

//   // Convert to grid coordinates (0-999 range for 3 digits)
//   const gridY = Math.floor(normalizedLat * 1000);
//   const gridX = Math.floor(normalizedLong * 1000);

//   // Combine into area code
//   const areaCode = (gridY * 1000 + gridX) % 1000;
//   return areaCode.toString().padStart(3, '0');
// }

// function generateLocationCode(latitude: number, longitude: number): string {
//   // Calculate fine-grained position within local grid
//   const latDecimal = (latitude % 0.001) * 10000;
//   const longDecimal = (longitude % 0.001) * 10000;

//   // Combine into location code
//   const locationCode = (Math.floor(latDecimal) * 10000 + Math.floor(longDecimal)) % 10000;
//   return locationCode.toString().padStart(4, '0');
// }

// // Example usage with enhanced error handling
// export async function getAddressFromCoordinates(latitude: number, longitude: number) {
//   try {
//     // Ensure boundary manager is initialized
//     await boundaryManager.initialize();
    
//     const address = await generateGPSAddress(latitude, longitude);
//     return {
//       success: true,
//       data: address
//     };
//   } catch (error) {
//     console.error('Error in getAddressFromCoordinates:', error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error occurred'
//     };
//   }
// }







// // lib/ghana-post/address-generator.ts
// import { boundaryManager } from './utils/boundaries';

// interface GhanaGPSAddress {
//   address: string;
//   district: string;
//   region: string;
//   coordinates: {
//     latitude: number;
//     longitude: number;
//   };
// }

// // Ghana's boundaries for grid calculations
// const GHANA_BOUNDS = {
//   north: 11.5,  // Northern-most point
//   south: 4.5,   // Southern-most point
//   west: -3.5,   // Western-most point
//   east: 1.5,    // Eastern-most point
//   // Grid settings
//   gridCells: 1000000 // For high precision
// };

// export async function generateGPSAddress(latitude: number, longitude: number): Promise<GhanaGPSAddress> {
//   // Validate coordinates are within Ghana
//   if (!isWithinGhana(latitude, longitude)) {
//     throw new Error('Coordinates are outside Ghana boundaries');
//   }

//   // Find the district for these coordinates
//   const district = await boundaryManager.findDistrict(latitude, longitude);
//   if (!district) {
//     throw new Error('Could not find district for these coordinates');
//   }

//   // Generate area code (first 3 digits)
//   const areaCode = generateAreaCode(latitude, longitude);

//   // Generate location code (last 4 digits)
//   const locationCode = generateLocationCode(latitude, longitude);

//   // Format the complete address
//   const address = `${district.properties.districtCode}-${areaCode}-${locationCode}`;

//   return {
//     address,
//     district: district.properties.districtName,
//     region: district.properties.regionName,
//     coordinates: { latitude, longitude }
//   };
// }

// function isWithinGhana(latitude: number, longitude: number): boolean {
//   return (
//     latitude >= GHANA_BOUNDS.south && 
//     latitude <= GHANA_BOUNDS.north &&
//     longitude >= GHANA_BOUNDS.west && 
//     longitude <= GHANA_BOUNDS.east
//   );
// }

// function generateAreaCode(latitude: number, longitude: number): string {
//   // Calculate normalized position within Ghana (0-1 range)
//   const normalizedLat = (latitude - GHANA_BOUNDS.south) / (GHANA_BOUNDS.north - GHANA_BOUNDS.south);
//   const normalizedLong = (longitude - GHANA_BOUNDS.west) / (GHANA_BOUNDS.east - GHANA_BOUNDS.west);

//   // Convert to grid coordinates (0-999 range for 3 digits)
//   const gridY = Math.floor(normalizedLat * 1000);
//   const gridX = Math.floor(normalizedLong * 1000);

//   // Combine into area code
//   const areaCode = (gridY * 1000 + gridX) % 1000;
//   return areaCode.toString().padStart(3, '0');
// }

// function generateLocationCode(latitude: number, longitude: number): string {
//   // Calculate fine-grained position within local grid
//   const latDecimal = (latitude % 0.001) * 10000;
//   const longDecimal = (longitude % 0.001) * 10000;

//   // Combine into location code
//   const locationCode = (Math.floor(latDecimal) * 10000 + Math.floor(longDecimal)) % 10000;
//   return locationCode.toString().padStart(4, '0');
// }

// // Example usage:
// export async function getAddressFromCoordinates(latitude: number, longitude: number) {
//   try {
//     const address = await generateGPSAddress(latitude, longitude);
//     return {
//       success: true,
//       data: address
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error occurred'
//     };
//   }
// }