import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { latitude, longitude } = req.body;

  try {
    // Convert latitude and longitude to a GeoJSON point
    const point = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };

    // Query the Locality model to find the locality that contains the point
    const locality = await prisma.locality.findFirst({
      where: {
        boundary: {
          path: 'coordinates',
          array_contains: point.coordinates.map(String),
        },
      },
      include: {
        district: {
          include: {
            region: true,
          },
        },
      },
    });

    if (!locality) {
      return res.status(404).json({ message: 'No locality found for the given coordinates' });
    }

    // Extract the necessary connections
    const postcode = locality.postcode;
    const district = locality.district;
    const region = locality.district.region;

    res.status(200).json({
      postcode,
      locality: {
        id: locality.id,
        name: locality.name,
        type: locality.type,
      },
      district: {
        id: district.id,
        name: district.name,
        code: district.code,
      },
      region: {
        id: region.id,
        name: region.name,
        code: region.code,
      },
    });
  } catch (error) {
    console.error('Error fetching postcode and connections:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}