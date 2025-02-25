// lib/ghana-post/utils/gps-converter.ts

import { boundaryManager } from './boundaries';

interface GPSCoordinates {
  latitude: number;
  longitude: number;
}



export function gpsToCoordinates(gpsCode: string): GPSCoordinates {
  console.log('Converting GPS code to coordinates:', gpsCode);
  
  // Split GPS code into components
  const [areaCode, gridCode, locationCode] = gpsCode.split('-');
  console.log('GPS components:', { areaCode, gridCode, locationCode });
  
  // Convert area code to base coordinates using predefined mapping
  // Using Accra as an example base point for GA codes
  const baseCoordinates = {
    GA: { lat: 5.6037, lng: -0.1870 },  // Accra
    GB: { lat: 5.5502, lng: -0.2174 },  // Greater Accra North
    GC: { lat: 5.7828, lng: -0.2247 },  // Greater Accra Central
    GD: { lat: 5.6408, lng: -0.0947 },  // Greater Accra East
    GE: { lat: 5.5571, lng: -0.1462 }   // Greater Accra South
  }[areaCode] || { lat: 5.6037, lng: -0.1870 }; // Default to Accra central if unknown
  
  // Parse the grid and location codes
  const gridNumbers = parseInt(gridCode);
  const locationNumbers = parseInt(locationCode);
  
  // Calculate offsets based on grid and location (simplified version)
  const latOffset = (Math.floor(gridNumbers / 100) * 0.01) + 
                   (Math.floor(locationNumbers / 100) * 0.001);
  const lngOffset = ((gridNumbers % 100) * 0.01) + 
                   ((locationNumbers % 100) * 0.001);
  
  // Calculate final coordinates
  const coordinates = {
    latitude: baseCoordinates.lat + latOffset,
    longitude: baseCoordinates.lng + lngOffset
  };
  
  console.log('Calculated coordinates:', coordinates);
  return coordinates;
}

export async function gpsToLocation(gpsCode: string) {
  try {
    console.log('Starting GPS to location conversion:', gpsCode);
    
    // Convert GPS code to coordinates
    const coordinates = gpsToCoordinates(gpsCode);
    
    console.log('Converting coordinates to location data:', coordinates);
    
    // Initialize boundary manager
    console.log('Initializing boundary manager...');
    await boundaryManager.initialize();
    
    // Find district for these coordinates
    console.log('Finding district for coordinates...');
    const district = await boundaryManager.findDistrict(
      coordinates.latitude,
      coordinates.longitude
    );
    
    if (!district) {
      console.log('No district found for coordinates:', coordinates);
      // Return approximate location based on GPS code prefix
      const areaCode = gpsCode.split('-')[0];
      const defaultDistricts = {
        GA: { district: 'Accra Metropolitan', region: 'Greater Accra' },
        GB: { district: 'Ga West Municipal', region: 'Greater Accra' },
        GC: { district: 'Ga Central Municipal', region: 'Greater Accra' },
        GD: { district: 'La-Nkwantanang-Madina Municipal', region: 'Greater Accra' },
        GE: { district: 'La-Dade-Kotopon Municipal', region: 'Greater Accra' }
      };
      
      const defaultLocation = defaultDistricts[areaCode as keyof typeof defaultDistricts] || defaultDistricts.GA;
      
      return {
        address: gpsCode,
        district: defaultLocation.district,
        region: defaultLocation.region,
        coordinates,
        approximated: true
      };
    }
    
    console.log('District found:', district.properties);
    
    return {
      address: gpsCode,
      districtCode: district.properties.districtCode || 'N/A', // if you have a code
    districtName: district.properties.districtName,
    regionCode: district.properties.regionCode || 'N/A', // if available
    regionName: district.properties.regionName,
    municipality: district.properties.districtName, // if needed
    coordinates,
    //   district: district.properties.districtName,
    //   region: district.properties.regionName,
    //   coordinates,
      approximated: false
    };
  } catch (error) {
    console.error('Error in gpsToLocation:', error);
    throw error;
  }
}