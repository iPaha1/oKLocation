// app/api/v1/saved-locations/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-secret",
};

export async function GET(req: Request) {
  try {
    console.log('GET request received');
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    console.log('Searching for address:', address);

    if (!address) {
      console.log('No address provided');
      return NextResponse.json({ error: 'Address is required' }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log('Querying database for address:', address);
    const savedLocation = await prisma.savedLocation.findFirst({
      where: {
        digitalAddress: address
      }
    });

    console.log('Database result:', savedLocation);

    if (!savedLocation) {
      return NextResponse.json({ error: 'Location not found' }, { 
        status: 404,
        headers: corsHeaders 
      });
    }

    return NextResponse.json({
      coords: {
        latitude: savedLocation.latitude,
        longitude: savedLocation.longitude
      },
      address: savedLocation.address,
      locationDetails: {
        address: savedLocation.digitalAddress,
        districtCode: savedLocation.districtCode,
        district: savedLocation.district,
        regionCode: savedLocation.regionCode,
        region: savedLocation.region
      }
    }, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Error in saved-locations API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}