// app/api/v1/save-location/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findDistrictAndRegionCodes } from '@/lib/ghana-post/utils/find-district-and-region-code';


export async function POST(req: Request) {
    try {
      const body = await req.json();
      console.log('Request body:', body);
      
      // Validate the incoming data
      if (!body || !body.coords || !body.locationDetails) {
        return NextResponse.json(
          { error: 'Invalid request data' },
          { status: 400 }
        );
      }
  
      const { coords, address, locationDetails } = body;
  
      // Additional validation
      if (typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
        return NextResponse.json(
          { error: 'Invalid coordinates' },
          { status: 400 }
        );
      }
  
      // Check if location already exists with same digital address
      const existingLocationByAddress = await prisma.savedLocation.findFirst({
        where: {
          digitalAddress: locationDetails.address
        }
      });
  
      if (existingLocationByAddress) {
        return NextResponse.json({
          success: false,
          message: 'Location with this digital address already exists',
          data: existingLocationByAddress
        }, { status: 409 }); // 409 Conflict
      }
  
      // Check if location exists with same coordinates (within small radius)
      const RADIUS_THRESHOLD = 0.0001; // Approximately 11 meters
      const existingLocationByCoords = await prisma.savedLocation.findFirst({
        where: {
          AND: [
            {
              latitude: {
                gte: coords.latitude - RADIUS_THRESHOLD,
                lte: coords.latitude + RADIUS_THRESHOLD
              }
            },
            {
              longitude: {
                gte: coords.longitude - RADIUS_THRESHOLD,
                lte: coords.longitude + RADIUS_THRESHOLD
              }
            }
          ]
        }
      });
  
      if (existingLocationByCoords) {
        return NextResponse.json({
          success: false,
          message: 'Location with similar coordinates already exists',
          data: existingLocationByCoords
        }, { status: 409 });
      }
  
      // Get accurate district and region codes
      const codes = findDistrictAndRegionCodes(
        locationDetails.district,
        locationDetails.region
      );
      console.log('codes:', codes);
  
      // Save location to database if it doesn't exist
      const savedLocation = await prisma.savedLocation.create({
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: address || null,
          digitalAddress: locationDetails.address || '',
          districtCode: codes?.districtCode || null,
          regionCode: codes?.regionCode || null,
          district: locationDetails.district || null,
          region: locationDetails.region || null,
          postCode: locationDetails.postalCode || null
        }
      });
  
      return NextResponse.json({
        success: true,
        data: savedLocation
      });
  
    } catch (error) {
      console.error('Error saving location:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error
      });
      
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
    
//     // Validate the incoming data
//     if (!body || !body.coords || !body.locationDetails) {
//       return NextResponse.json(
//         { error: 'Invalid request data' },
//         { status: 400 }
//       );
//     }

//     const { coords, address, locationDetails } = body;

//     // Additional validation
//     if (typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
//       return NextResponse.json(
//         { error: 'Invalid coordinates' },
//         { status: 400 }
//       );
//     }

//     // Get accurate district and region codes
//     const codes = findDistrictAndRegionCodes(
//         locationDetails.district,
//         locationDetails.region
//       );
//       console.log('codes:', codes);

//     // Save location to database
//     const savedLocation = await prisma.savedLocation.create({
//       data: {
//         latitude: coords.latitude,
//         longitude: coords.longitude,
//         address: address || null,
//         digitalAddress: locationDetails.address || '',
//         districtCode: codes?.districtCode || null,
//         regionCode: codes?.regionCode || null,
//         district: locationDetails.district || null,
//         region: locationDetails.region || null,
//       }
//     });

//     return NextResponse.json({
//       success: true,
//       data: savedLocation
//     });

//   } catch (error) {
//     console.error('Error saving location:', {
//       message: error instanceof Error ? error.message : 'Unknown error',
//       error
//     });
    
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return new NextResponse('Address is required', { status: 400 });
    }

    const savedLocation = await prisma.savedLocation.findFirst({
      where: {
        digitalAddress: address
      }
    });

    if (!savedLocation) {
      return new NextResponse('Location not found', { status: 404 });
    }

    return NextResponse.json({
      coords: {
        latitude: savedLocation.latitude,
        longitude: savedLocation.longitude
      },
      address: savedLocation.address,
      locationDetails: {
        address: savedLocation.digitalAddress,
        district: savedLocation.district,
        region: savedLocation.region
      }
    });
  } catch (error) {
    console.error('Error fetching saved location:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}