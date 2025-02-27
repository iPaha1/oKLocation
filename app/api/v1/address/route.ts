// app/api/v1/address/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-validate';
import { trackApiRequest } from '@/lib/api-tracking';
import { generateGPSAddress } from '@/lib/ghana-post/address-generator';
import { cacheLocation, getCachedLocation } from '@/lib/local-cache';
import { getPostCodeFromDB } from '@/lib/get-postcode-from-database';
import { OpenStreeGenerateGPSAddress } from '@/lib/ghana-post/address-generator-with-open-street';


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-secret",
  "Access-Control-Expose-Headers": "X-RateLimit-Limit, X-RateLimit-Remaining"
};

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}

interface GhanaGPSAddress {
  address: string;
  district: string;
  districtCode?: string;
  region: string;
  regionCode?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Function to clean district names by removing common suffixes
function cleanDistrictName(district: string): string {
  if (!district) return district;
  
  // List of suffixes to remove
  const suffixes = [
    'Municipal',
    'Municipality',
    'District',
    'Metropolitan',
    'Metro',
    'Assembly'
  ];
  
  // Create a regex pattern to match any of these words followed by optional whitespace
  const pattern = new RegExp(`\\s+(${suffixes.join('|')})\\b.*$`, 'i');
  
  // Remove the suffixes
  return district.replace(pattern, '').trim();
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Extract API key and secret from headers
    const authHeader = request.headers.get('authorization');
    const apiSecret = request.headers.get('x-api-secret');
    console.log('Auth header present:', !!authHeader);
    console.log('API secret present:', !!apiSecret);
    // let's log the keys
    console.log('Auth header:', authHeader)
    console.log('API secret:', apiSecret)

    // Add CORS headers to the validation response
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { 
          status: 401,
          headers: {
            ...corsHeaders
          }
        }
      );
    }

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    if (!apiSecret) {
      return NextResponse.json(
        { error: 'Missing API secret' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.split(' ')[1];

    // Validate API key and secret
    const validation = await validateApiKey(apiKey, apiSecret);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { 
          status: validation.error?.includes('rate limit') ? 429 : 401,
          headers: {
            'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
            'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
              ? (validation.rateLimitQuota - validation.dailyRequests).toString()
              : '0'
          }
        }
      );
    }

    // Get coordinates from query params
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      const duration = Date.now() - startTime;
      await trackApiRequest({
        apiKeyId: validation.keyId!,
        endpoint: '/api/v1/address',
        status: 400,
        duration
      });
      return NextResponse.json(
        { error: 'Missing latitude or longitude parameters' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);      
    

    if (isNaN(latitude) || isNaN(longitude)) {
      const duration = Date.now() - startTime;
      await trackApiRequest({
        apiKeyId: validation.keyId!,
        endpoint: '/api/v1/address',
        status: 400,
        duration
      });
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Generate cache key using coordinates
    const gpsName = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    
    // Check cache first
    const cachedLocation = await getCachedLocation(gpsName);
    if (cachedLocation) {
      
      const ghanaGPSAddress: GhanaGPSAddress = {
        address: cachedLocation.gpsName,
        district: cachedLocation.district,
        districtCode: cachedLocation.districtCode || undefined,
        region: cachedLocation.region,
        regionCode: cachedLocation.regionCode || undefined,
        coordinates: {
          latitude: cachedLocation.latitude,
          longitude: cachedLocation.longitude
        }
      };

      const duration = Date.now() - startTime;
      await trackApiRequest({
        apiKeyId: validation.keyId!,
        endpoint: '/api/v1/address',
        status: 200,
        duration
      });

      return NextResponse.json(ghanaGPSAddress, {
        headers: {
          'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
          'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
            ? (validation.rateLimitQuota - validation.dailyRequests).toString()
            : '0'
        }
      });
    }

    // Generate new address if not in cache
    const address = await OpenStreeGenerateGPSAddress(latitude, longitude);
    console.log("this is the address generated : ", address)

    // Clean the district name before looking up in the database
    const cleanedDistrict = cleanDistrictName(address.district);
    console.log('Original district:', address.district);
    console.log('Cleaned district:', cleanedDistrict);
    
    // Update the address object with the cleaned district name
    address.district = cleanedDistrict;

    // log the region, district and locality
    console.log('this is the region, district and locality: ', address.region, address.district, address)

     // Fetch postcode from DB using extracted data
    const postCodeFromDB = await getPostCodeFromDB({
      locality: address.locality, // Use locality if available
      district: cleanedDistrict, // Use the cleaned district name
      region: address.region,
    });

    console.log("THIS IS THE POST CODE I AM GETTING in the address: ", postCodeFromDB);

    // Cache the result with the cleaned district name
    await cacheLocation({
      gpsName: address.address, // Use the generated GPS address as the key
      latitude,
      longitude,
      region: address.region,
      regionCode: '', // We'll update this if needed
      district: cleanedDistrict, // Store the cleaned district name
      districtCode: '', // We'll update this if needed
      area: '', // We'll update this if needed
      postCode: address.address.split('-')[0], // District code becomes post code
      street: undefined,
      placeName: undefined
    });

    const duration = Date.now() - startTime;
    await trackApiRequest({
      apiKeyId: validation.keyId!,
      endpoint: '/api/v1/address',
      status: 200,
      duration
    });

    return NextResponse.json(address, {
      headers: {
        'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
        'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
          ? (validation.rateLimitQuota - validation.dailyRequests).toString()
          : '0'
      }
    });
  } catch (error) {
    console.error('Error generating address:', error);
    const duration = Date.now() - startTime;
    
    // Only track if we have a valid API key
    if (error instanceof Error && 'keyId' in error) {
      await trackApiRequest({
        apiKeyId: (error as { keyId: string }).keyId,
        endpoint: '/api/v1/address',
        status: 500,
        duration
      });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint for batch processing
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Extract API key and secret from headers
    const authHeader = request.headers.get('authorization');
    const apiSecret = request.headers.get('x-api-secret');
    console.log('Auth header present:', !!authHeader);
    console.log('API secret present:', !!apiSecret);
    // let's log the keys
    console.log('Auth header:', authHeader)
    console.log('API secret:', apiSecret)

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header', authHeader);
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    if (!apiSecret) {
      return NextResponse.json(
        { error: 'Missing API secret' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.split(' ')[1];

    // Parse and validate request body
    const body = await request.json();
    if (!Array.isArray(body.coordinates)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    console.log('here is the body: ', body)

    // Validate API key and secret
    const validation = await validateApiKey(apiKey, apiSecret);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { 
          status: validation.error?.includes('rate limit') ? 429 : 401,
          headers: {
            'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
            'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
              ? (validation.rateLimitQuota - validation.dailyRequests).toString()
              : '0'
          }
        }
      );
    }

    // Process each set of coordinates
    const results = await Promise.all(
      body.coordinates.map(async (coord: { lat: number; lng: number }) => {
        try {
          const gpsName = `${coord.lat.toFixed(6)},${coord.lng.toFixed(6)}`;
          
          // Check cache first
          const cachedLocation = await getCachedLocation(gpsName);
          if (cachedLocation) {
            return {
              address: cachedLocation.gpsName,
              district: cachedLocation.district,
              region: cachedLocation.region,
              coordinates: {
                latitude: cachedLocation.latitude,
                longitude: cachedLocation.longitude
              }
            } as GhanaGPSAddress;
          }

          // Generate new address if not in cache
          const address = await generateGPSAddress(coord.lat, coord.lng);
          
          // Clean the district name
          const cleanedDistrict = cleanDistrictName(address.district);
          
          // Update the address object
          address.district = cleanedDistrict;
          
          // Cache the result with cleaned district name
          await cacheLocation({
            gpsName: address.address,
            latitude: coord.lat,
            longitude: coord.lng,
            region: address.region,
            regionCode: '',
            district: cleanedDistrict,
            districtCode: '',
            area: '',
            postCode: address.address.split('-')[0],
            street: undefined,
            placeName: undefined
          });

          return address;
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : 'Error processing coordinates',
            coordinates: coord
          };
        }
      })
    );

    const duration = Date.now() - startTime;
    await trackApiRequest({
      apiKeyId: validation.keyId!,
      endpoint: '/api/v1/address/batch',
      status: 200,
      duration
    });

    return NextResponse.json(
      { results },
      {
        headers: {
          'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
          'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
            ? (validation.rateLimitQuota - validation.dailyRequests).toString()
            : '0'
        }
      }
    );
  } catch (error) {
    console.error('Error processing batch request:', error);
    const duration = Date.now() - startTime;
    
    if (error instanceof Error && 'keyId' in error) {
      await trackApiRequest({
        apiKeyId: (error as { keyId: string }).keyId,
        endpoint: '/api/v1/address/batch',
        status: 500,
        duration
      });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}



// // app/api/v1/address/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { validateApiKey } from '@/lib/api-validate';
// import { trackApiRequest } from '@/lib/api-tracking';
// import { generateGPSAddress } from '@/lib/ghana-post/address-generator';
// import { cacheLocation, getCachedLocation } from '@/lib/local-cache';
// import { getPostCodeFromDB } from '@/lib/get-postcode-from-database';
// import { OpenStreeGenerateGPSAddress } from '@/lib/ghana-post/address-generator-with-open-street';


// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-secret",
//   "Access-Control-Expose-Headers": "X-RateLimit-Limit, X-RateLimit-Remaining"
// };

// // Handle CORS preflight requests
// export async function OPTIONS() {
//   return new NextResponse(null, {
//     status: 200,
//     headers: corsHeaders
//   });
// }

// interface GhanaGPSAddress {
//   address: string;
//   district: string;
//   districtCode?: string;
//   region: string;
//   regionCode?: string;
//   coordinates: {
//     latitude: number;
//     longitude: number;
//   };
// }


// export async function GET(request: NextRequest) {
//   const startTime = Date.now();
//   try {
//     // Extract API key and secret from headers
//     const authHeader = request.headers.get('authorization');
//     const apiSecret = request.headers.get('x-api-secret');
//     console.log('Auth header present:', !!authHeader);
//     console.log('API secret present:', !!apiSecret);
//     // let's log the keys
//     console.log('Auth header:', authHeader)
//     console.log('API secret:', apiSecret)

//     // Add CORS headers to the validation response
//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json(
//         { error: 'Missing or invalid authorization header' },
//         { 
//           status: 401,
//           headers: {
//             ...corsHeaders
//           }
//         }
//       );
//     }

//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json(
//         { error: 'Missing or invalid authorization header' },
//         { status: 401 }
//       );
//     }

//     if (!apiSecret) {
//       return NextResponse.json(
//         { error: 'Missing API secret' },
//         { status: 401 }
//       );
//     }

//     const apiKey = authHeader.split(' ')[1];

//     // Validate API key and secret
//     const validation = await validateApiKey(apiKey, apiSecret);
//     if (!validation.valid) {
//       return NextResponse.json(
//         { error: validation.error },
//         { 
//           status: validation.error?.includes('rate limit') ? 429 : 401,
//           headers: {
//             'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
//             'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
//               ? (validation.rateLimitQuota - validation.dailyRequests).toString()
//               : '0'
//           }
//         }
//       );
//     }

//     // Get coordinates from query params
//     const searchParams = request.nextUrl.searchParams;
//     const lat = searchParams.get('lat');
//     const lng = searchParams.get('lng');

//     if (!lat || !lng) {
//       const duration = Date.now() - startTime;
//       await trackApiRequest({
//         apiKeyId: validation.keyId!,
//         endpoint: '/api/v1/address',
//         status: 400,
//         duration
//       });
//       return NextResponse.json(
//         { error: 'Missing latitude or longitude parameters' },
//         { status: 400 }
//       );
//     }

//     const latitude = parseFloat(lat);
//     const longitude = parseFloat(lng);      
    

//     if (isNaN(latitude) || isNaN(longitude)) {
//       const duration = Date.now() - startTime;
//       await trackApiRequest({
//         apiKeyId: validation.keyId!,
//         endpoint: '/api/v1/address',
//         status: 400,
//         duration
//       });
//       return NextResponse.json(
//         { error: 'Invalid coordinates' },
//         { status: 400 }
//       );
//     }

//     // Generate cache key using coordinates
//     const gpsName = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    
//     // Check cache first
//     const cachedLocation = await getCachedLocation(gpsName);
//     if (cachedLocation) {
      
//       const ghanaGPSAddress: GhanaGPSAddress = {
//         address: cachedLocation.gpsName,
//         district: cachedLocation.district,
//         districtCode: cachedLocation.districtCode || undefined,
//         region: cachedLocation.region,
//         regionCode: cachedLocation.regionCode || undefined,
//         coordinates: {
//           latitude: cachedLocation.latitude,
//           longitude: cachedLocation.longitude
//         }
//       };

//       const duration = Date.now() - startTime;
//       await trackApiRequest({
//         apiKeyId: validation.keyId!,
//         endpoint: '/api/v1/address',
//         status: 200,
//         duration
//       });

//       return NextResponse.json(ghanaGPSAddress, {
//         headers: {
//           'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
//           'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
//             ? (validation.rateLimitQuota - validation.dailyRequests).toString()
//             : '0'
//         }
//       });
//     }

//     // Generate new address if not in cache
//     // const address = await generateGPSAddress(latitude, longitude);
//     // console.log('Generated address:', address);

//     // console.log("HERE ARE THEY: ", address.district, address.locality, address.address)
//     // console.log("this is the town and suburb: ", address.)

//     const address = await OpenStreeGenerateGPSAddress(latitude, longitude);
//     console.log("this is the address generated : ", address)

//     // log the region, district and locality
//     console.log('this is the region, district and locality: ', address.region, address.district, address)

//      // Fetch postcode from DB using extracted data
//     const postCodeFromDB = await getPostCodeFromDB({
//       locality: address.locality, // Use locality if available
//       district: address.district,
//       region: address.region,
//     });

//     console.log("THIS IS THE POST CODE I AM GETTING in the address: ", postCodeFromDB);


//     // Cache the result
//     await cacheLocation({
//       gpsName: address.address, // Use the generated GPS address as the key
//       latitude,
//       longitude,
//       region: address.region,
//       regionCode: '', // We'll update this if needed
//       district: address.district,
//       districtCode: '', // We'll update this if needed
//       area: '', // We'll update this if needed
//       postCode: address.address.split('-')[0], // District code becomes post code
//       street: undefined,
//       placeName: undefined
//     });

//     const duration = Date.now() - startTime;
//     await trackApiRequest({
//       apiKeyId: validation.keyId!,
//       endpoint: '/api/v1/address',
//       status: 200,
//       duration
//     });

//     return NextResponse.json(address, {
//       headers: {
//         'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
//         'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
//           ? (validation.rateLimitQuota - validation.dailyRequests).toString()
//           : '0'
//       }
//     });
//   } catch (error) {
//     console.error('Error generating address:', error);
//     const duration = Date.now() - startTime;
    
//     // Only track if we have a valid API key
//     if (error instanceof Error && 'keyId' in error) {
//       await trackApiRequest({
//         apiKeyId: (error as { keyId: string }).keyId,
//         endpoint: '/api/v1/address',
//         status: 500,
//         duration
//       });
//     }

//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // POST endpoint for batch processing
// export async function POST(request: NextRequest) {
//   const startTime = Date.now();
//   try {
//     // Extract API key and secret from headers
//     const authHeader = request.headers.get('authorization');
//     const apiSecret = request.headers.get('x-api-secret');
//     console.log('Auth header present:', !!authHeader);
//     console.log('API secret present:', !!apiSecret);
//     // let's log the keys
//     console.log('Auth header:', authHeader)
//     console.log('API secret:', apiSecret)

//     if (!authHeader?.startsWith('Bearer ')) {
//       console.log('Missing or invalid authorization header', authHeader);
//       return NextResponse.json(
//         { error: 'Missing or invalid authorization header' },
//         { status: 401 }
//       );
//     }

//     if (!apiSecret) {
//       return NextResponse.json(
//         { error: 'Missing API secret' },
//         { status: 401 }
//       );
//     }

//     const apiKey = authHeader.split(' ')[1];

//     // Parse and validate request body
//     const body = await request.json();
//     if (!Array.isArray(body.coordinates)) {
//       return NextResponse.json(
//         { error: 'Invalid request body' },
//         { status: 400 }
//       );
//     }

//     console.log('here is the body: ', body)

//     // Validate API key and secret
//     const validation = await validateApiKey(apiKey, apiSecret);
//     if (!validation.valid) {
//       return NextResponse.json(
//         { error: validation.error },
//         { 
//           status: validation.error?.includes('rate limit') ? 429 : 401,
//           headers: {
//             'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
//             'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
//               ? (validation.rateLimitQuota - validation.dailyRequests).toString()
//               : '0'
//           }
//         }
//       );
//     }

//     // Process each set of coordinates
//     const results = await Promise.all(
//       body.coordinates.map(async (coord: { lat: number; lng: number }) => {
//         try {
//           const gpsName = `${coord.lat.toFixed(6)},${coord.lng.toFixed(6)}`;
          
//           // Check cache first
//           const cachedLocation = await getCachedLocation(gpsName);
//           if (cachedLocation) {
//             return {
//               address: cachedLocation.gpsName,
//               district: cachedLocation.district,
//               region: cachedLocation.region,
//               coordinates: {
//                 latitude: cachedLocation.latitude,
//                 longitude: cachedLocation.longitude
//               }
//             } as GhanaGPSAddress;
//           }

//           // Generate new address if not in cache
//           const address = await generateGPSAddress(coord.lat, coord.lng);
          
//           // Cache the result
//           await cacheLocation({
//             gpsName: address.address,
//             latitude: coord.lat,
//             longitude: coord.lng,
//             region: address.region,
//             regionCode: '',
//             district: address.district,
//             districtCode: '',
//             area: '',
//             postCode: address.address.split('-')[0],
//             street: undefined,
//             placeName: undefined
//           });

//           return address;
//         } catch (error) {
//           return {
//             error: error instanceof Error ? error.message : 'Error processing coordinates',
//             coordinates: coord
//           };
//         }
//       })
//     );

//     const duration = Date.now() - startTime;
//     await trackApiRequest({
//       apiKeyId: validation.keyId!,
//       endpoint: '/api/v1/address/batch',
//       status: 200,
//       duration
//     });

//     return NextResponse.json(
//       { results },
//       {
//         headers: {
//           'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
//           'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
//             ? (validation.rateLimitQuota - validation.dailyRequests).toString()
//             : '0'
//         }
//       }
//     );
//   } catch (error) {
//     console.error('Error processing batch request:', error);
//     const duration = Date.now() - startTime;
    
//     if (error instanceof Error && 'keyId' in error) {
//       await trackApiRequest({
//         apiKeyId: (error as { keyId: string }).keyId,
//         endpoint: '/api/v1/address/batch',
//         status: 500,
//         duration
//       });
//     }

//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }










// // /app/api/v1/address/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { boundaryManager } from '@/lib/ghana-post/utils/boundaries'
// import { generateGPSAddress } from '@/lib/ghana-post/address-generator'


// export async function GET(request: NextRequest) {
//   // let's validate the API key
//   const apiKey = request.headers.get('Authorization')
//   if (!apiKey || !apiKey.startsWith('Bearer ')) {
//     return NextResponse.json(
//       { error: 'Missing or invalid authorization header' },
//       { status: 401 }
//     )
//   }
//   try {
//     const searchParams = request.nextUrl.searchParams
//     const lat = searchParams.get('lat')
//     const lng = searchParams.get('lng')

//     if (!lat || !lng) {
//       return NextResponse.json(
//         { error: 'Missing latitude or longitude parameters' },
//         { status: 400 }
//       )
//     }

//     // Initialize the boundary manager if not already initialized
//     await boundaryManager.initialize()

//     const address = await generateGPSAddress(parseFloat(lat), parseFloat(lng))

//     return NextResponse.json(address)
//   } catch (error) {
//     console.error('Error generating address:', error)
//     return NextResponse.json(
//       { error: 'Failed to generate address' },
//       { status: 500 }
//     )
//   }
// }





// // app/api/v1/address/route.ts
// import { NextResponse } from 'next/server';
// import { validateApiKey } from '@/lib/middleware';
// import { generateGPSAddress } from '@/lib/ghana-post/address-generator';

// export async function GET(request: Request) {
//   // Validate API key
//   const validationResult = await validateApiKey(request);
//   if ('error' in validationResult) {
//     return NextResponse.json(
//       { error: validationResult.error },
//       { status: validationResult.status }
//     );
//   }

//   try {
//     // Get coordinates from query params
//     const { searchParams } = new URL(request.url);
//     const latitude = parseFloat(searchParams.get('lat') || '');
//     const longitude = parseFloat(searchParams.get('lng') || '');

//     if (isNaN(latitude) || isNaN(longitude)) {
//       return NextResponse.json(
//         { error: 'Invalid coordinates' },
//         { status: 400 }
//       );
//     }

//     // Generate address
//     const address = await generateGPSAddress(latitude, longitude);

//     return NextResponse.json(address);
//   } catch (error) {
//     console.error('Error generating address:', error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }






// app/api/v1/address/route.ts
// import { NextResponse } from 'next/server';
// import { validateApiKey } from '@/lib/api-validate';
// import { rateLimit } from '@/lib/rate-limit';
// import { generateGPSAddress } from '@/lib/ghana-post/address-generator';

// export async function GET(request: Request) {
//   try {
//     // Extract API key
//     const authHeader = request.headers.get('authorization');
//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
//     }

//     const apiKey = authHeader.split(' ')[1];
    
//     // Validate API key
//     const validationResult = await validateApiKey(apiKey);
//     if (!validationResult.valid) {
//       return NextResponse.json({ error: validationResult.error }, { status: 401 });
//     }

//     // Check rate limit
//     const rateLimitResult = await rateLimit(apiKey);
//     if (!rateLimitResult.allowed) {
//       return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
//     }

//     // Get coordinates from query params
//     const { searchParams } = new URL(request.url);
//     const latitude = parseFloat(searchParams.get('lat') || '');
//     const longitude = parseFloat(searchParams.get('lng') || '');

//     if (isNaN(latitude) || isNaN(longitude)) {
//       return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
//     }

//     // Generate address
//     const address = await generateGPSAddress(latitude, longitude);

//     return NextResponse.json(address);
//   } catch (error) {
//     console.error('Error generating address:', error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // POST endpoint for batch processing
// export async function POST(request: Request) {
//   try {
//     // Extract API key
//     const authHeader = request.headers.get('authorization');
//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
//     }

//     const apiKey = authHeader.split(' ')[1];
    
//     // Validate API key
//     const validationResult = await validateApiKey(apiKey);
//     if (!validationResult.valid) {
//       return NextResponse.json({ error: validationResult.error }, { status: 401 });
//     }

//     // Get coordinates array from body
//     const body = await request.json();
//     if (!Array.isArray(body.coordinates)) {
//       return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
//     }

//     // Process each set of coordinates
//     const results = await Promise.all(
//       body.coordinates.map(async (coord: { lat: number; lng: number }) => {
//         try {
//           return await generateGPSAddress(coord.lat, coord.lng);
//         } catch (error) {
//           return {
//             error: error instanceof Error ? error.message : 'Error processing coordinates',
//             coordinates: coord
//           };
//         }
//       })
//     );

//     return NextResponse.json({ results });
//   } catch (error) {
//     console.error('Error processing batch request:', error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }