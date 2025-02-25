// lib/ghana-post/services/db-service.ts

import { generateGhanaPostcodes } from '@/lib/generate-post-codes';
import { Prisma, PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function savePostcodesToDatabase() {
  try {
    console.log('Starting database update...');
    const postcodeData = generateGhanaPostcodes();

    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // First, clear existing data
      console.log('Clearing existing data...');
      await tx.postcodeLocality.deleteMany();
      await tx.postcodeDistrict.deleteMany();
      await tx.postcodeRegion.deleteMany();
      await tx.postcodeMetadata.deleteMany();

      let totalLocalities = 0;

      // Process each region
      for (const region of postcodeData.regions) {
        console.log(`Processing region: ${region.name}`);
        
        // Create region
        const savedRegion = await tx.postcodeRegion.create({
          data: {
            code: region.code,
            name: region.name,
          },
        });

        // Process districts
        for (const district of region.districts) {
          console.log(`Processing district: ${district.name}`);
          
          // Create district
          const savedDistrict = await tx.postcodeDistrict.create({
            data: {
              code: district.code,
              name: district.name,
              postcode: `${region.code} ${district.code}00`,
              regionId: savedRegion.id,
            },
          });

          // Process localities
          if (district.localities && district.localities.length > 0) {
            const localitiesData = district.localities.map((locality) => ({
              code: locality.code,
              name: locality.name,
              type: locality.type,
              postcode: locality.postcode,
              districtId: savedDistrict.id,
            }));

            await tx.postcodeLocality.createMany({
              data: localitiesData,
            });

            totalLocalities += district.localities.length;
          }
        }
      }

      // Save metadata
      await tx.postcodeMetadata.create({
        data: {
          lastGenerated: new Date(),
          totalRegions: postcodeData.regions.length,
          totalDistricts: postcodeData.regions.reduce(
            (sum, region) => sum + region.districts.length, 0
          ),
          totalLocalities,
          version: 1,
        },
      });

      console.log('\nPostcode Generation Statistics:');
      console.log(`Total Regions: ${postcodeData.regions.length}`);
      console.log(`Total Districts: ${postcodeData.regions.reduce(
        (sum, region) => sum + region.districts.length, 0
      )}`);
      console.log(`Total Localities: ${totalLocalities}`);
    });

    console.log('\nDatabase update completed successfully!');
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getPostcodeFromDatabase(postcode: string) {
  try {
    // Try to find locality postcode first
    const locality = await prisma.postcodeLocality.findFirst({
      where: { postcode },
      include: {
        district: {
          include: {
            region: true,
          },
        },
      },
    });

    if (locality) {
      return {
        postcode: locality.postcode,
        region: locality.district.region.name,
        district: locality.district.name,
        locality: locality.name,
        type: locality.type,
      };
    }

    // If not found, try district postcode
    const district = await prisma.postcodeDistrict.findFirst({
      where: { postcode },
      include: {
        region: true,
      },
    });

    if (district) {
      return {
        postcode: district.postcode,
        region: district.region.name,
        district: district.name,
      };
    }

    return null;
  } finally {
    await prisma.$disconnect();
  }
}