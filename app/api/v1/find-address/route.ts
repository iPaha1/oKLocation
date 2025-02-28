// app/api/v1/find-address/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Digital address is required' },
        { status: 400 }
      );
    }

    // Clean up the search query by removing spaces and dashes
    // and make it case-insensitive
    const cleanedAddress = address.trim();

    // First try exact match
    let savedLocation = await prisma.savedLocation.findFirst({
      where: {
        digitalAddress: cleanedAddress
      }
    });

    // If exact match fails, try a more flexible search
    if (!savedLocation) {
      savedLocation = await prisma.savedLocation.findFirst({
        where: {
          OR: [
            { digitalAddress: { contains: cleanedAddress} },
            { digitalAddress: { contains: cleanedAddress.replace(/-/g, '') } }
          ]
        }
      });
    }

    if (!savedLocation) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(savedLocation);
  } catch (error) {
    console.error('Error finding address:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}