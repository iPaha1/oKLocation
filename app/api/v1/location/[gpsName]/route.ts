// app/api/v1/location/[gpsName]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { validateApiKey } from '@/lib/api-validate';
import { prisma } from '@/lib/prisma';
import { getLocationByAddress } from '@/lib/ghana-post';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get GPS name from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const gpsName = pathParts[pathParts.length - 1];

    if (!gpsName) {
      return NextResponse.json(
        { error: 'Missing GPS name' },
        { status: 400 }
      );
    }

    // Extract API key from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.split(' ')[1];
    const apiSecret = authHeader.split(' ')[2];
    
    // Validate API key
    const validationResult = await validateApiKey(apiKey, apiSecret);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimitResult = await rateLimit(apiKey);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Check cache first
    const cachedLocation = await prisma.locationCache.findUnique({
      where: { gpsName }
    });

    if (cachedLocation) {
      return NextResponse.json(cachedLocation);
    }

    // Get location from Ghana Post GPS
    const location = await getLocationByAddress(gpsName);
    
    // Cache the result
    await prisma.locationCache.create({
      data: {
        gpsName,
        region: location.Region,
        district: location.District,
        area: location.Area,
        street: location.Street,
        placeName: location.PlaceName,
        postCode: location.postCode,
        latitude: location.latitude,
        longitude: location.longitude
      }
    });

    // Log the API request
    await prisma.apiRequest.create({
      data: {
        apiKeyId: validationResult.keyId ?? '',
        endpoint: `/api/v1/location/${gpsName}`,
        status: 200,
        duration: 0
      }
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



// // src/app/api/v1/location/[gpsName]/route.ts
// import { NextResponse } from 'next/server'
// import { rateLimit } from '@/lib/rate-limit'
// import { validateApiKey } from '@/lib/api-validate'
// import { prisma } from '@/lib/prisma'
// import { getLocationByAddress } from '@/lib/ghana-post'

// export async function GET(
//   request: Request,
//   { params }: { params: { gpsName: string } }
// ) {
//   try {
//     // Extract API key from header
//     const authHeader = request.headers.get('authorization')
//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json(
//         { error: 'Missing or invalid authorization header' },
//         { status: 401 }
//       )
//     }

//     const apiKey = authHeader.split(' ')[1]
//     const apiSecret = authHeader.split(' ')[2]
//     // const apiSecret = request.headers.get('x-api-secret')
    
//     // Validate API key
//     const validationResult = await validateApiKey(apiKey, apiSecret)
//     if (!validationResult.valid) {
//       return NextResponse.json(
//         { error: validationResult.error },
//         { status: 401 }
//       )
//     }

//     // Check rate limit
//     const rateLimitResult = await rateLimit(apiKey)
//     if (!rateLimitResult.allowed) {
//       return NextResponse.json(
//         { error: 'Rate limit exceeded' },
//         { status: 429 }
//       )
//     }

//     // Check cache first
//     const cachedLocation = await prisma.locationCache.findUnique({
//       where: { gpsName: params.gpsName }
//     })

//     if (cachedLocation) {
//       return NextResponse.json(cachedLocation)
//     }

//     // Get location from Ghana Post GPS
//     const location = await getLocationByAddress(params.gpsName)
    
//     // Cache the result
//     await prisma.locationCache.create({
//       data: {
//         gpsName: params.gpsName,
//         region: location.Region,
//         district: location.District,
//         area: location.Area,
//         street: location.Street,
//         placeName: location.PlaceName,
//         postCode: location.postCode,
//         latitude: location.latitude,
//         longitude: location.longitude
//       }
//     })

//     // Log the API request
//     await prisma.apiRequest.create({
//       data: {
//         apiKeyId: validationResult.keyId ?? '',
//         endpoint: `/api/v1/location/${params.gpsName}`,
//         status: 200,
//         duration: 0 // You can add actual duration tracking
//       }
//     })

//     return NextResponse.json(location)
//   } catch (error) {
//     console.error('Error processing request:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }

