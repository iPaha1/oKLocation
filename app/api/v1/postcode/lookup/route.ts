// app/api/v1/postcode/lookup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateApiKey } from '@/lib/api-validate';

const prisma = new PrismaClient();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('SEARCHING FOR POST CODE ...');

  try {
    // Validate API key and API secret
    const authHeader = request.headers.get('authorization');
    const apiSecret = request.headers.get('x-api-secret');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!apiSecret) {
      return NextResponse.json(
        { error: 'Missing API secret' },
        { status: 401, headers: corsHeaders }
      );
    }

    const apiKey = authHeader.split(' ')[1];
    const validation = await validateApiKey(apiKey, apiSecret);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 401, headers: corsHeaders }
      );
    }

    function cleanAdministrativeName(name: string | null): string | undefined {
      if (!name) return undefined;
      
      // Remove common administrative suffixes and clean up
      return name
        .replace(/\s*(Region|Municipal|Metropolitan|District|Assembly|East|West|North|South)\s*$/gi, '')
        .replace(/\s*(Municipal|Metropolitan|District|Assembly)\s*/gi, '')
        .trim();
    }
    

    // Get search parameters
    const searchParams = request.nextUrl.searchParams;
    const locality = searchParams.get('locality');
    const district = cleanAdministrativeName(searchParams.get('district'));
    // const district = searchParams.get('district');
    let region = searchParams.get('region');


    // Clean up region name by removing the word "Region" if it exists
    if (region) {
      region = region.replace(/\s*Region\s*$/i, '').trim();
    }


    console.log('Cleaned Search Parameters:', { locality, district, region });

    if (!locality && !district && !region) {
      return NextResponse.json(
        { error: 'At least one search parameter is required (locality, district, or region)' },
        { status: 400, headers: corsHeaders }
      );
    }

    // First, find the region
    const regionMatch = await prisma.region.findFirst({
      where: {
        name: {
          contains: region || undefined,
          // mode: 'insensitive'
        }
      }
    });

    console.log('Region Match:', regionMatch);

    if (!regionMatch) {
      return NextResponse.json(
        { error: 'Region not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Then, find the district within the region
    const districtMatch = await prisma.district.findFirst({
      where: {
        regionId: regionMatch.id,
        name: {
          contains: district || undefined,
          // mode: 'insensitive'
        }
      }
    });

    console.log('District Match:', districtMatch);

    if (!districtMatch) {
      return NextResponse.json({
        type: 'region',
        region: regionMatch.name,
        metadata: {
          regionCode: regionMatch.code
        }
      }, { headers: corsHeaders });
    }

    // Finally, find the locality within the district
    const localityMatch = await prisma.locality.findFirst({
      where: {
        districtId: districtMatch.id,
        name: {
          contains: locality || undefined,
          // mode: 'insensitive'
        }
      }
    });

    console.log('Locality Match:', localityMatch);

    if (!localityMatch) {
      return NextResponse.json({
        type: 'district',
        district: districtMatch.name,
        region: regionMatch.name,
        metadata: {
          districtCode: districtMatch.code,
          regionCode: regionMatch.code
        }
      }, { headers: corsHeaders });
    }

    // If we found a locality match, return full details
    const response = {
      type: 'locality',
      postcode: localityMatch.postcode,
      locality: localityMatch.name,
      district: districtMatch.name,
      region: regionMatch.name,
      metadata: {
        localityType: localityMatch.type,
        localityCode: localityMatch.code,
        districtCode: districtMatch.code,
        regionCode: regionMatch.code
      }
    };

    // Track API request
    const duration = Date.now() - startTime;
    await prisma.apiRequest.create({
      data: {
        apiKeyId: validation.keyId!,
        endpoint: '/api/v1/postcode/lookup',
        status: 200,
        duration
      }
    });

    return NextResponse.json(response, {
      headers: {
        ...corsHeaders,
        'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
        'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
          ? (validation.rateLimitQuota - validation.dailyRequests).toString()
          : '0'
      }
    });

  } catch (error) {
    console.error('Error looking up postcode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}





// // app/api/v1/postcode/lookup/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
// import { validateApiKey } from '@/lib/api-validate';


// const prisma = new PrismaClient();

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization"
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function GET(request: NextRequest) {
//   const startTime = Date.now();
//   console.log('SEARCHING FOR POST CODE ...')
  

//   try {
//     // Validate API key
//     const authHeader = request.headers.get('authorization');
//     const apiSecret = request.headers.get('x-api-secret');
//     console.log("HERE ARE THE HEADERS: ", authHeader)
//     console.log("HERE IS THE API SECRET:", apiSecret)

//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json(
//         { error: 'Missing or invalid authorization header' },
//         { status: 401, headers: corsHeaders }
//       );
//     }

//     if (!apiSecret) {
//       return NextResponse.json(
//         { error: 'Missing API secret' },
//         { status: 401, headers: corsHeaders }
//       );
//     }

//     const apiKey = authHeader.split(' ')[1];
//     const validation = await validateApiKey(apiKey, apiSecret);
    
//     if (!validation.valid) {
//       return NextResponse.json(
//         { error: validation.error },
//         { 
//           status: 401,
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

//     // Get search parameters
//     const searchParams = request.nextUrl.searchParams;
//     const locality = searchParams.get('locality');
//     const district = searchParams.get('district');
//     const region = searchParams.get('region');
//     console.log('LOCALITY DEY HERE: ', locality)
//     console.log('DISTRICT DEY HERE: ', district)
//     console.log('REGION DEY HERE: ', region)

    

//     const localityPostCode = await prisma.locality.findFirst({
//       where: {
//         name: locality || undefined,
//         district: {
//           name: district || undefined,
//           region: {
//             name: region || undefined
//           }
//         }
//       },
//       select: {
//         postcode: true,
//         name: true,
//         district: {
//           select: {
//             name: true,
//             region: {
//               select: {
//                 name: true
//               }
//             }
//           }
//         }
//       }
//     });
    
//     console.log('THIS IS THE POSTCODE FROM THE DATABASE: ', localityPostCode)

//     if (!locality && !district && !region) {
//       return NextResponse.json(
//         { error: 'At least one search parameter is required (locality, district, or region)' },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     let postcode = null;

//     // Try exact locality match first
//     if (locality) {
//       const localityMatch = await prisma.locality.findFirst({
//         where: {
//           name: {
//             equals: locality,
//             // mode: 'insensitive'
//           },
//           district: {
//             name: district ? {
//               contains: district,
//             //   mode: 'insensitive'
//             } : undefined,
//             region: region ? {
//               name: {
//                 contains: region,
//                 // mode: 'insensitive'
//               }
//             } : undefined
//           }
//         },
//         include: {
//           district: {
//             include: {
//               region: true
//             }
//           }
//         }
//       });

//       console.log("THERE IS LOCALITY: ", locality, localityMatch)

//       if (localityMatch) {
//         postcode = {
//           type: 'locality',
//           postcode: localityMatch.postcode,
//           locality: localityMatch.name,
//           district: localityMatch.district.name,
//           region: localityMatch.district.region.name,
//           metadata: {
//             localityType: localityMatch.type,
//             localityCode: localityMatch.code,
//             districtCode: localityMatch.district.code,
//             regionCode: localityMatch.district.region.code
//           }
//         };
//       }
//     }
//     console.log("THE LOCALITY IS MATCHING ...", locality)

//     // If no exact match, try district
//     if (!postcode && district) {
//       const districtMatch = await prisma.district.findFirst({
//         where: {
//           name: {
//             contains: district,
//             // mode: 'insensitive'
//           },
//           region: region ? {
//             name: {
//               contains: region,
//             //   mode: 'insensitive'
//             }
//           } : undefined
//         },
//         include: {
//           region: true
//         }
//       });

//       if (districtMatch) {
//         postcode = {
//           type: 'district',
//           district: districtMatch.name,
//           region: districtMatch.region.name,
//           metadata: {
//             districtCode: districtMatch.code,
//             regionCode: districtMatch.region.code
//           }
//         };
//       }
//     }

//     console.log("DISTRICT IS MATCHING ...", district)

//     // If still no match, try region
//     if (!postcode && region) {
//       const regionMatch = await prisma.region.findFirst({
//         where: {
//           name: {
//             contains: region,
//             // mode: 'insensitive'
//           }
//         }
//       });

//       if (regionMatch) {
//         postcode = {
//           type: 'region',
//           region: regionMatch.name,
//           metadata: {
//             regionCode: regionMatch.code
//           }
//         };
//       }
//     }

//     if (!postcode) {
//       return NextResponse.json(
//         { error: 'No matching postcode found' },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     const duration = Date.now() - startTime;

//     // Track API request
//     await prisma.apiRequest.create({
//       data: {
//         apiKeyId: validation.keyId!,
//         endpoint: '/api/v1/postcode/lookup',
//         status: 200,
//         duration
//       }
//     });

//     return NextResponse.json(postcode, {
//       headers: {
//         ...corsHeaders,
//         'X-RateLimit-Limit': validation.rateLimitQuota?.toString() || '1000',
//         'X-RateLimit-Remaining': validation.rateLimitQuota && validation.dailyRequests 
//           ? (validation.rateLimitQuota - validation.dailyRequests).toString()
//           : '0'
//       }
//     });
//   } catch (error) {
//     console.error('Error looking up postcode:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500, headers: corsHeaders }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }