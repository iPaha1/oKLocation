// lib/location-cache.ts

import { prisma } from "./prisma";

interface LocationData {
  gpsName: string;
  latitude: number;
  longitude: number;
  region: string;
  regionCode: string;
  district: string;
  districtCode: string;
  area: string;
  postCode: string;
  street?: string;
  placeName?: string;
}

export async function getCachedLocation(gpsName: string) {
  try {
    return await prisma.locationCache.findUnique({
      where: { gpsName }
    });
  } catch (error) {
    console.error('Error getting cached location:', error);
    return null;
  }
}

export async function cacheLocation(locationData: LocationData) {
  try {
    return await prisma.locationCache.upsert({
      where: { gpsName: locationData.gpsName },
      update: {
        ...locationData,
        updatedAt: new Date()
      },
      create: locationData
    });
  } catch (error) {
    console.error('Error caching location:', error);
    throw error;
  }
}

export async function findNearbyLocations(
  latitude: number,
  longitude: number,
  radiusKm: number = 1
) {
  // Convert km to degrees (approximate)
  const degreesRadius = radiusKm / 111.32;

  try {
    return await prisma.locationCache.findMany({
      where: {
        AND: [
          {
            latitude: {
              gte: latitude - degreesRadius,
              lte: latitude + degreesRadius
            }
          },
          {
            longitude: {
              gte: longitude - degreesRadius,
              lte: longitude + degreesRadius
            }
          }
        ]
      },
      orderBy: [
        {
          createdAt: 'desc'
        }
      ],
      take: 10
    });
  } catch (error) {
    console.error('Error finding nearby locations:', error);
    return [];
  }
}

export async function cleanupOldCacheEntries(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  try {
    await prisma.locationCache.deleteMany({
      where: {
        updatedAt: {
          lt: cutoffDate
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up old cache entries:', error);
  }
}