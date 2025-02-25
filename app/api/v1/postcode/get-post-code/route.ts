

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const districtName = searchParams.get('district');
    const localityName = searchParams.get('locality');

    if (!districtName || !localityName) {
      return NextResponse.json(
        { error: 'Missing district or locality parameters' },
        { status: 400 }
      );
    }

    // Query the database
    const locality = await prisma.locality.findFirst({
      where: {
        name: localityName,
        district: {
          name: districtName,
        },
      },
      select: {
        postcode: true,
        district: {
          select: {
            name: true,
            region: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!locality) {
      return NextResponse.json(
        { error: 'Locality not found for the given district and locality name' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      postcode: locality.postcode,
      district: locality.district.name,
      region: locality.district.region.name,
    });
  } catch (error) {
    console.error('Error fetching postcode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}









// import { NextRequest, NextResponse } from 'next/server';
// import { validateApiKey } from '@/lib/api-validate';
// import { trackApiRequest } from '@/lib/api-tracking';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

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

// // New endpoint to fetch postcode by district and locality
// export async function GET(request: NextRequest) {
//   const startTime = Date.now();
//   try {
//     // Extract API key and secret from headers
//     const authHeader = request.headers.get('authorization');
//     const apiSecret = request.headers.get('x-api-secret');

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

//     // Validate API key and secret
//     const validation = await validateApiKey(apiKey, apiSecret);
//     if (!validation.valid) {
//       return NextResponse.json(
//         { error: validation.error },
//         { 
//           status: validation.error?.includes('rate limit') ? 429 : 401,
//           headers: {
//             ...corsHeaders,
//             'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
//             'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
//               ? (validation.rateLimitQuota - validation.dailyRequests).toString()
//               : '0'
//           }
//         }
//       );
//     }

//     // Get district and locality from query params
//     const searchParams = request.nextUrl.searchParams;
//     const district = searchParams.get('district');
//     const locality = searchParams.get('locality');

//     if (!district || !locality) {
//       const duration = Date.now() - startTime;
//       await trackApiRequest({
//         apiKeyId: validation.keyId!,
//         endpoint: '/api/v1/address',
//         status: 400,
//         duration
//       });
//       return NextResponse.json(
//         { error: 'Missing district or locality parameters' },
//         { 
//           status: 400,
//           headers: corsHeaders
//         }
//       );
//     }

//     // Query the database to find the locality by district and locality name
//     const localityData = await prisma.locality.findFirst({
//       where: {
//         name: locality,
//         district: {
//           name: district,
//         },
//       },
//       select: {
//         postcode: true,
//         district: {
//           select: {
//             name: true,
//             region: {
//               select: {
//                 name: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!localityData) {
//       const duration = Date.now() - startTime;
//       await trackApiRequest({
//         apiKeyId: validation.keyId!,
//         endpoint: '/api/v1/address',
//         status: 404,
//         duration
//       });
//       return NextResponse.json(
//         { error: 'Locality not found for the given district and locality name' },
//         { 
//           status: 404,
//           headers: corsHeaders
//         }
//       );
//     }

//     const duration = Date.now() - startTime;
//     await trackApiRequest({
//       apiKeyId: validation.keyId!,
//       endpoint: '/api/v1/address',
//       status: 200,
//       duration
//     });

//     return NextResponse.json(
//       {
//         postcode: localityData.postcode,
//         district: localityData.district.name,
//         region: localityData.district.region.name,
//       },
//       {
//         headers: {
//           ...corsHeaders,
//           'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
//           'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
//             ? (validation.rateLimitQuota - validation.dailyRequests).toString()
//             : '0'
//         }
//       }
//     );
//   } catch (error) {
//     console.error('Error fetching postcode:', error);
//     const duration = Date.now() - startTime;

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
//       { 
//         status: 500,
//         headers: corsHeaders
//       }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }




