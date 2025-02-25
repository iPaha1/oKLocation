import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-validate';
import { trackApiRequest } from '@/lib/api-tracking';
import { gpsToLocation } from '@/lib/ghana-post/utils/gps-converter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CORS headers with strict options
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-secret',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Received lookup request`);

  try {
    // Extract and validate headers
    const authHeader = request.headers.get('authorization');
    const apiSecret = request.headers.get('x-api-secret');

    console.log(`[${requestId}] Validating request headers`);

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Missing or invalid authorization header',
          requestId 
        },
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    if (!apiSecret) {
      return NextResponse.json(
        { 
          error: 'Missing API secret',
          requestId 
        },
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    const apiKey = authHeader.split(' ')[1];
    console.log(`[${requestId}] Validating API credentials`);

    // Validate API credentials
    const validation = await validateApiKey(apiKey, apiSecret);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: validation.error,
          requestId 
        },
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    // Get and validate GPS address
    const searchParams = request.nextUrl.searchParams;
    const gpsName = searchParams.get('gps')?.trim().toUpperCase();
    console.log(`[${requestId}] Processing GPS address:`, gpsName);

    if (!gpsName) {
      const duration = Date.now() - startTime;
      await trackApiRequest({
        apiKeyId: validation.keyId!,
        endpoint: '/api/v1/address/lookup',
        status: 400,
        duration,
      });
      return NextResponse.json(
        { 
          error: 'Missing GPS address parameter',
          requestId 
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Enhanced GPS format validation
    const gpsRegex = /^[A-Z]{2}-\d{3,4}-\d{4}$/;
    if (!gpsRegex.test(gpsName)) {
      const duration = Date.now() - startTime;
      await trackApiRequest({
        apiKeyId: validation.keyId!,
        endpoint: '/api/v1/address/lookup',
        status: 400,
        duration,
      });
      return NextResponse.json(
        { 
          error: 'Invalid GPS address format. Expected format: XX-YYY-ZZZZ or XX-YYYY-ZZZZ',
          requestId 
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    console.log('this is the gpsName:', gpsName);

    // Convert GPS code to location data with enhanced precision
    console.log(`[${requestId}] Converting GPS to location data`);
    const locationData = await gpsToLocation(gpsName);
    console.log(`[${requestId}] Location data retrieved:`, locationData);

    // Extract district and locality from location data
    const district = locationData.district;
    const locality = locationData.address;
    console.log("THIS IS THE LOCALITY: ", locality)
    console.log("THIS IS THE DISTRICT: ", district)
    
    if (!district || !locality) {
      const duration = Date.now() - startTime;
      await trackApiRequest({
        apiKeyId: validation.keyId!,
        endpoint: '/api/v1/address/lookup',
        status: 404,
        duration,
      });
      return NextResponse.json(
        { 
          error: 'District or locality not found in GPS data',
          requestId 
        },
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }

    // Fetch postcode from database
    console.log(`[${requestId}] Fetching postcode for district: ${district}, locality: ${locality}`);
    const localityData = await prisma.locality.findFirst({
      where: {
        name: locality,
        district: {
          name: district,
        },
      },
      select: {
        postcode: true,
      },
    });

    console.log("THIS IS THE LOCALITYDATA: ", localityData)

    if (!localityData) {
      const duration = Date.now() - startTime;
      await trackApiRequest({
        apiKeyId: validation.keyId!,
        endpoint: '/api/v1/address/lookup',
        status: 404,
        duration,
      });
      return NextResponse.json(
        { 
          error: 'Postcode not found for the given district and locality',
          requestId 
        },
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }

    const duration = Date.now() - startTime;
    await trackApiRequest({
      apiKeyId: validation.keyId!,
      endpoint: '/api/v1/address/lookup',
      status: 200,
      duration,
    });

    // Return enhanced response with metadata
    return NextResponse.json({
      requestId,
      timestamp: new Date().toISOString(),
      data: {
        ...locationData,
        postcode: localityData.postcode, // Include postcode in the response
      },
      processingTime: duration
    }, { 
      headers: {
        ...corsHeaders,
        'X-Request-ID': requestId,
        'X-Processing-Time': duration.toString()
      }
    });
  } catch (error) {
    console.error(`[${requestId}] Error looking up address:`, error);
    const duration = Date.now() - startTime;
    
    if (error instanceof Error && 'keyId' in error) {
      const errorWithKeyId = error as Error & { keyId: string };
      await trackApiRequest({
        apiKeyId: errorWithKeyId.keyId,
        endpoint: '/api/v1/address/lookup',
        status: 500,
        duration,
      });
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        requestId,
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'X-Request-ID': requestId,
          'X-Processing-Time': duration.toString()
        }
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}







// // app/api/v1/address/lookup/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { validateApiKey } from '@/lib/api-validate';
// import { trackApiRequest } from '@/lib/api-tracking';
// import { gpsToLocation } from '@/lib/ghana-post/utils/gps-converter';

// // CORS headers with strict options
// const corsHeaders = {
//   'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
//   'Access-Control-Allow-Methods': 'GET, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-secret',
//   'Access-Control-Max-Age': '86400', // 24 hours
//   'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
//   'Pragma': 'no-cache',
//   'Expires': '0',
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function GET(request: NextRequest) {
//   const startTime = Date.now();
//   const requestId = crypto.randomUUID();
//   console.log(`[${requestId}] Received lookup request`);

//   try {
//     // Extract and validate headers
//     const authHeader = request.headers.get('authorization');
//     const apiSecret = request.headers.get('x-api-secret');

//     console.log(`[${requestId}] Validating request headers`);

//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json(
//         { 
//           error: 'Missing or invalid authorization header',
//           requestId 
//         },
//         { 
//           status: 401,
//           headers: corsHeaders
//         }
//       );
//     }

//     if (!apiSecret) {
//       return NextResponse.json(
//         { 
//           error: 'Missing API secret',
//           requestId 
//         },
//         { 
//           status: 401,
//           headers: corsHeaders
//         }
//       );
//     }

//     const apiKey = authHeader.split(' ')[1];
//     console.log(`[${requestId}] Validating API credentials`);

//     // Validate API credentials
//     const validation = await validateApiKey(apiKey, apiSecret);
//     if (!validation.valid) {
//       return NextResponse.json(
//         { 
//           error: validation.error,
//           requestId 
//         },
//         { 
//           status: 401,
//           headers: corsHeaders
//         }
//       );
//     }

//     // Get and validate GPS address
//     const searchParams = request.nextUrl.searchParams;
//     console.log("this is the search params: ", searchParams)
//     const gpsName = searchParams.get('gps')?.trim().toUpperCase();
//     console.log(`[${requestId}] Processing GPS address:`, gpsName);

//     if (!gpsName) {
//       const duration = Date.now() - startTime;
//       await trackApiRequest({
//         apiKeyId: validation.keyId!,
//         endpoint: '/api/v1/address/lookup',
//         status: 400,
//         duration,
//       });
//       return NextResponse.json(
//         { 
//           error: 'Missing GPS address parameter',
//           requestId 
//         },
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }

//     // Enhanced GPS format validation
//     const gpsRegex = /^[A-Z]{2}-\d{3,4}-\d{4}$/;
//     if (!gpsRegex.test(gpsName)) {
//       const duration = Date.now() - startTime;
//       await trackApiRequest({
//         apiKeyId: validation.keyId!,
//         endpoint: '/api/v1/address/lookup',
//         status: 400,
//         duration,
//       });
//       return NextResponse.json(
//         { 
//           error: 'Invalid GPS address format. Expected format: XX-YYY-ZZZZ or XX-YYYY-ZZZZ',
//           requestId 
//         },
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }

//     console.log('this is the gpsName:', gpsName);

//     // Convert GPS code to location data with enhanced precision
//     console.log(`[${requestId}] Converting GPS to location data`);
//     const locationData = await gpsToLocation(gpsName);
//     console.log(`[${requestId}] Location data retrieved:`, locationData);

//     const duration = Date.now() - startTime;
//     await trackApiRequest({
//       apiKeyId: validation.keyId!,
//       endpoint: '/api/v1/address/lookup',
//       status: 200,
//       duration,
//     });

//     // Return enhanced response with metadata
//     return NextResponse.json({
//       requestId,
//       timestamp: new Date().toISOString(),
//       data: locationData,
//       processingTime: duration
//     }, { 
//       headers: {
//         ...corsHeaders,
//         'X-Request-ID': requestId,
//         'X-Processing-Time': duration.toString()
//       }
//     });
//   } catch (error) {
//     console.error(`[${requestId}] Error looking up address:`, error);
//     const duration = Date.now() - startTime;
    
//     if (error instanceof Error && 'keyId' in error) {
//       const errorWithKeyId = error as Error & { keyId: string };
//       await trackApiRequest({
//         apiKeyId: errorWithKeyId.keyId,
//         endpoint: '/api/v1/address/lookup',
//         status: 500,
//         duration,
//       });
//     }

//     return NextResponse.json(
//       { 
//         error: error instanceof Error ? error.message : 'Internal server error',
//         requestId,
//         timestamp: new Date().toISOString()
//       },
//       { 
//         status: 500,
//         headers: {
//           ...corsHeaders,
//           'X-Request-ID': requestId,
//           'X-Processing-Time': duration.toString()
//         }
//       }
//     );
//   }
// }





// // app/api/v1/address/lookup/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { validateApiKey } from '@/lib/api-validate';
// import { trackApiRequest } from '@/lib/api-tracking';
// import { gpsToLocation } from '@/lib/ghana-post/utils/gps-converter';

// // CORS headers
// const corsHeaders = {
//   'Access-Control-Allow-Origin': 'http://localhost:3000',
//   'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-secret',
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function GET(request: NextRequest) {
//   const startTime = Date.now();
//   console.log('Received lookup request');

//   try {
//     // Extract API key and secret from headers
//     const authHeader = request.headers.get('authorization');
//     const apiSecret = request.headers.get('x-api-secret');

//     console.log('Auth header present:', !!authHeader);
//     console.log('API secret present:', !!apiSecret);

//     // log the request headers
//     console.log('Request headers:', request.headers);
//     console.log('Request nextUrl:', request.nextUrl);

//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json(
//         { error: 'Missing or invalid authorization header' },
//         { 
//           status: 401,
//           headers: corsHeaders
//         }
//       );
//     }

//     if (!apiSecret) {
//       return NextResponse.json(
//         { error: 'Missing API secret' },
//         { 
//           status: 401,
//           headers: corsHeaders
//         }
//       );
//     }

//     const apiKey = authHeader.split(' ')[1];
//     console.log('Validating API key');

//     // Validate API key and secret
//     const validation = await validateApiKey(apiKey, apiSecret);
//     if (!validation.valid) {
//       return NextResponse.json(
//         { error: validation.error },
//         { 
//           status: 401,
//           headers: corsHeaders
//         }
//       );
//     }

//     // Get GPS address from query params
//     const searchParams = request.nextUrl.searchParams;
//     const gpsName = searchParams.get('gps');
//     console.log('Looking up GPS address:', gpsName);

//     if (!gpsName) {
//       const duration = Date.now() - startTime;
//       await trackApiRequest({
//         apiKeyId: validation.keyId!,
//         endpoint: '/api/v1/address/lookup',
//         status: 400,
//         duration
//       });
//       return NextResponse.json(
//         { error: 'Missing GPS address parameter' },
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }

//     // Validate GPS code format
//     const gpsRegex = /^[A-Z]{2}-\d{3,4}-\d{4}$/;
//     if (!gpsRegex.test(gpsName)) {
//       const duration = Date.now() - startTime;
//       await trackApiRequest({
//         apiKeyId: validation.keyId!,
//         endpoint: '/api/v1/address/lookup',
//         status: 400,
//         duration
//       });
//       return NextResponse.json(
//         { error: 'Invalid GPS address format' },
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }

//     // Convert GPS code to location data
//     const locationData = await gpsToLocation(gpsName);
//     console.log('Location data:', locationData);

//     const duration = Date.now() - startTime;
//     await trackApiRequest({
//       apiKeyId: validation.keyId!,
//       endpoint: '/api/v1/address/lookup',
//       status: 200,
//       duration
//     });

//     return NextResponse.json(locationData, { headers: corsHeaders });
//   } catch (error) {
//     console.error('Error looking up address:', error);
//     const duration = Date.now() - startTime;
    
//     if (error instanceof Error && 'keyId' in error) {
//       const errorWithKeyId = error as Error & { keyId: string };
//       await trackApiRequest({
//         apiKeyId: errorWithKeyId.keyId,
//         endpoint: '/api/v1/address/lookup',
//         status: 500,
//         duration
//       });
//     }

//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Internal server error' },
//       { 
//         status: 500,
//         headers: corsHeaders
//       }
//     );
//   }
// }



// // app/api/v1/address/lookup/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { validateApiKey } from '@/lib/api-validate';
// import { trackApiRequest } from '@/lib/api-tracking';
// import { prisma } from '@/lib/prisma';
// import { cacheLocation, getCachedLocation } from '@/lib/local-cache';

// // CORS headers
// const corsHeaders = {
//   'Access-Control-Allow-Origin': 'http://localhost:3000',
//   'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-secret',
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function GET(request: NextRequest) {
//   const startTime = Date.now();
//   console.log('Received lookup request');

//   try {
//     // Extract API key and secret from headers
//     const authHeader = request.headers.get('authorization');
//     const apiSecret = request.headers.get('x-api-secret');

//     console.log('Auth header present:', !!authHeader);
//     console.log('API secret present:', !!apiSecret);

//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json(
//         { error: 'Missing or invalid authorization header' },
//         { 
//           status: 401,
//           headers: corsHeaders
//         }
//       );
//     }

//     if (!apiSecret) {
//       return NextResponse.json(
//         { error: 'Missing API secret' },
//         { 
//           status: 401,
//           headers: corsHeaders
//         }
//       );
//     }

//     const apiKey = authHeader.split(' ')[1];
//     console.log('Validating API key');

//     // Validate API key and secret
//     const validation = await validateApiKey(apiKey, apiSecret);
//     if (!validation.valid) {
//       return NextResponse.json(
//         { error: validation.error },
//         { 
//           status: 401,
//           headers: corsHeaders
//         }
//       );
//     }

//     // Get GPS address from query params
//     const searchParams = request.nextUrl.searchParams;
//     const gpsAddress = searchParams.get('gps');
//     console.log('Looking up GPS address:', gpsAddress);

//     if (!gpsAddress) {
//       const duration = Date.now() - startTime;
//       await trackApiRequest({
//         apiKeyId: validation.keyId!,
//         endpoint: '/api/v1/address/lookup',
//         status: 400,
//         duration
//       });
//       return NextResponse.json(
//         { error: 'Missing GPS address parameter' },
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }

//     // Check cache first
//     console.log('Checking cache');
//     const cachedLocation = await getCachedLocation(gpsAddress);
//     if (cachedLocation) {
//       console.log('Cache hit');
//       const duration = Date.now() - startTime;
//       await trackApiRequest({
//         apiKeyId: validation.keyId!,
//         endpoint: '/api/v1/address/lookup',
//         status: 200,
//         duration
//       });

//       return NextResponse.json({
//         address: cachedLocation.gpsName,
//         district: cachedLocation.district,
//         region: cachedLocation.region,
//         coordinates: {
//           latitude: cachedLocation.latitude,
//           longitude: cachedLocation.longitude
//         }
//       }, { headers: corsHeaders });
//     }

//     // Look up address in database
//     console.log('Checking database');
//     const locationData = await prisma.locationCache.findFirst({
//       where: {
//         gpsName: gpsAddress
//       }
//     });

//     if (!locationData) {
//       console.log('Address not found');
//       const duration = Date.now() - startTime;
//       await trackApiRequest({
//         apiKeyId: validation.keyId!,
//         endpoint: '/api/v1/address/lookup',
//         status: 404,
//         duration
//       });
//       return NextResponse.json(
//         { error: 'Address not found' },
//         { 
//           status: 404,
//           headers: corsHeaders
//         }
//       );
//     }

//     console.log('Address found in database');
//     const response = {
//       address: locationData.gpsName,
//       district: locationData.district,
//       region: locationData.region,
//       coordinates: {
//         latitude: locationData.latitude,
//         longitude: locationData.longitude
//       }
//     };

//     // Cache the result
//     await cacheLocation({
//       gpsName: locationData.gpsName,
//       latitude: locationData.latitude,
//       longitude: locationData.longitude,
//       region: locationData.region,
//       district: locationData.district,
//       area: locationData.area,
//       postCode: locationData.postCode,
//       street: locationData.street || undefined,
//       placeName: locationData.placeName || undefined
//     });

//     const duration = Date.now() - startTime;
//     await trackApiRequest({
//       apiKeyId: validation.keyId!,
//       endpoint: '/api/v1/address/lookup',
//       status: 200,
//       duration
//     });

//     return NextResponse.json(response, { headers: corsHeaders });
//   } catch (error) {
//     console.error('Error looking up address:', error);
//     const duration = Date.now() - startTime;
    
//     if (error instanceof Error && 'keyId' in error) {
//       const errorWithKeyId = error as Error & { keyId: string };
//       await trackApiRequest({
//         apiKeyId: errorWithKeyId.keyId,
//         endpoint: '/api/v1/address/lookup',
//         status: 500,
//         duration
//       });
//     }

//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Internal server error' },
//       { 
//         status: 500,
//         headers: corsHeaders
//       }
//     );
//   }
// }