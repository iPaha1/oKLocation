import { PrismaClient } from '@prisma/client';
import localitiesData from '../lib/ghana-post/data/localities/one/two/localities.json';


interface Region {
    code: string;
    name: string;
  }
  
  const GHANA_REGIONS_DATA: Region[] = [
    { code: 'AH', name: 'AHAFO' },
    { code: 'A', name: 'ASHANTI' },
    { code: 'BO', name: 'BONO' },
    { code: 'BE', name: 'BONO EAST' },
    { code: 'C', name: 'CENTRAL' },
    { code: 'E', name: 'EASTERN' },
    { code: 'GA', name: 'GREATER ACCRA' },
    { code: 'NE', name: 'NORTH EAST' },
    { code: 'N', name: 'NORTHERN' },
    { code: 'O', name: 'OTI' },
    { code: 'S', name: 'SAVANNAH' },
    { code: 'UE', name: 'UPPER EAST' },
    { code: 'UW', name: 'UPPER WEST' },
    { code: 'V', name: 'VOLTA' },
    { code: 'W', name: 'WESTERN' },
    { code: 'WN', name: 'WESTERN NORTH' },
  ];
  interface Locality {
    name: string;
    type: 'city' | 'town' | 'suburb' | 'village' | 'neighborhood';
    districtCode: string;
    regionCode: string;
    boundary?: GeoJSON.Geometry;
  }
  
  interface LocalityCollection {
    [districtCode: string]: {
      district: string;
      region: string;
      localities: Locality[];
    };
  }
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
  
  function padNumber(num: number, length: number): string {
    return num.toString().padStart(length, '0');
  }
  
  function formatDistrictCode(regionCode: string, districtNumber: number): string {
    return `${regionCode}${padNumber(districtNumber, 2)}`;
  }
  
  async function clearExistingData() {
    console.log('Clearing existing data...');
    await prisma.locality.deleteMany();
    await prisma.district.deleteMany();
    await prisma.region.deleteMany();
    console.log('Existing data cleared.');
  }
  
  async function saveRegionsAndDistricts(localities: LocalityCollection) {
    console.log('Saving regions and districts...');
  
    // Create a map to store region codes
    const regionCodeMap = new Map(GHANA_REGIONS_DATA.map(region => [region.name, region.code]));
  
    // First, save all regions
    for (const region of GHANA_REGIONS_DATA) {
      try {
        await prisma.region.create({
          data: {
            name: region.name,
            code: region.code,
          },
        });
        console.log(`Saved region: ${region.name} with code ${region.code}`);
      } catch (error) {
        console.error(`Error saving region ${region.name}:`, error);
      }
    }
  
    // Create a counter for districts within each region
    const regionDistrictCounters = new Map<string, number>();
  
    // Then save districts with proper region relationships and formatted codes
    for (const [oldDistrictCode, districtData] of Object.entries(localities)) {
      const regionCode = regionCodeMap.get(districtData.region);
      
      if (!regionCode) {
        console.error(`Region code not found for region: ${districtData.region}`);
        continue;
      }
  
      try {
        // Find the region first
        const region = await prisma.region.findFirst({
          where: { code: regionCode },
        });
  
        if (!region) {
          console.error(`Region not found for code: ${regionCode}`);
          continue;
        }
  
        // Get and increment the district counter for this region
        const currentCount = (regionDistrictCounters.get(regionCode) || 0) + 1;
        regionDistrictCounters.set(regionCode, currentCount);
  
        // Format the new district code (e.g., 'GA01', 'GA02', etc.)
        const formattedDistrictCode = formatDistrictCode(regionCode, currentCount);
  
        // Create the district with the region relationship
        const district = await prisma.district.create({
          data: {
            name: districtData.district,
            code: formattedDistrictCode,
            regionId: region.id,
          },
        });
  
        console.log(`Saved district: ${district.name} (${district.code}) for region ${region.name}`);
  
        // Store the mapping of old to new district codes for locality processing
        oldToNewDistrictCodes.set(oldDistrictCode, formattedDistrictCode);
  
      } catch (error) {
        console.error(`Error saving district ${districtData.district}:`, error);
      }
    }
  }
  
  // Store mapping of old to new district codes
  const oldToNewDistrictCodes = new Map<string, string>();
  
  async function saveLocalities(localities: LocalityCollection) {
    console.log('Saving localities...');
  
    for (const [oldDistrictCode, districtData] of Object.entries(localities)) {
      const newDistrictCode = oldToNewDistrictCodes.get(oldDistrictCode);
      
      if (!newDistrictCode) {
        console.error(`New district code not found for old code: ${oldDistrictCode}`);
        continue;
      }
  
      // Find the district in the database
      const district = await prisma.district.findFirst({
        where: { code: newDistrictCode }, include: {region: true}
      });
  
      if (!district) {
        console.error(`District not found: ${newDistrictCode}`);
        continue;
      }
  
      console.log(`Processing localities for district: ${district.name} (${district.code})`);

      // let's remove the first two letter of the district code 
    const trimmedDistrictCode = district.code.substring(2);
  
      // Save localities for this district
      for (const [index, locality] of districtData.localities.entries()) {
        const localityCode = padNumber(index + 1, 2);
        const postcode = `${district.region.code} ${trimmedDistrictCode}${localityCode}`; // Now using the new district code format
        try {
          await prisma.locality.create({
            data: {
              name: locality.name,
              type: locality.type,
              code: localityCode,
              postcode: postcode,
              districtId: district.id,
              boundary: locality.boundary ? JSON.stringify(locality.boundary) : undefined,
            },
          });
  
          console.log(`Saved locality: ${locality.name} (${postcode})`);
        } catch (error) {
          console.error(`Error saving locality ${locality.name}:`, error);
        }
      }
    }
  }
  
  async function main() {
    try {
      console.log('Starting database population...');
      
      await clearExistingData();
      await saveRegionsAndDistricts(localitiesData as LocalityCollection);
      await saveLocalities(localitiesData as LocalityCollection);
  
      console.log('Database population completed successfully!');
    } catch (error) {
      console.error('Error in main execution:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
  
  main()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });

  




// import { PrismaClient } from '@prisma/client';
// import localitiesData from '../lib/ghana-post/data/localities/one/localities.json';

// interface Locality {
//   name: string;
//   type: 'city' | 'town' | 'suburb' | 'village' | 'neighborhood';
//   districtCode: string;
//   regionCode: string;
//   boundary?: GeoJSON.Geometry; // GeoJSON boundary data
// }

// interface LocalityCollection {
//   [districtCode: string]: {
//     district: string;
//     region: string;
//     localities: Locality[];
//   };
// }

// const prisma = new PrismaClient({
//   log: ['query', 'error', 'warn'],
// });

// async function clearExistingData() {
//   console.log('Clearing existing data...');
//   await prisma.locality.deleteMany();
//   await prisma.district.deleteMany();
//   await prisma.region.deleteMany();
//   console.log('Existing data cleared.');
// }

// async function saveRegionsAndDistricts(localities: LocalityCollection) {
//   console.log('Saving regions and districts...');

//   const regions = new Map<string, { name: string; code: string; districts: { name: string; code: string; localities: Locality[] }[] }>();

//   // Group districts by region
//   for (const districtCode in localities) {
//     const { district, region, localities: districtLocalities } = localities[districtCode];

//     if (!regions.has(region)) {
//       regions.set(region, { name: region, code: districtCode.substring(0, 2), districts: [] });
//     }

//     regions.get(region)?.districts.push({
//       name: district,
//       code: districtCode,
//       localities: districtLocalities,
//     });
//   }

//   // Save regions and districts
//   for (const [, regionData] of regions) {
//     const savedRegion = await prisma.region.create({
//       data: {
//         name: regionData.name,
//         code: regionData.code,
//         districts: {
//           create: regionData.districts.map(district => ({
//             name: district.name,
//             code: district.code,
//           })),
//         },
//       },
//     });

//     console.log(`Saved region: ${savedRegion.name}`);
//   }

//   console.log('Regions and districts saved.');
// }

// async function saveLocalities(localities: LocalityCollection) {
//   console.log('Saving localities...');

//   for (const districtCode in localities) {
//     const { localities: districtLocalities } = localities[districtCode];

//     for (const locality of districtLocalities) {
//       await prisma.locality.create({
//         data: {
//           name: locality.name,
//           type: locality.type,
//           district: {
//             connect: { code: districtCode },
//           },
//           boundary: locality.boundary ? JSON.parse(JSON.stringify(locality.boundary)) : undefined,
//         },
//       });
//     }
//   }

//   console.log('Localities saved.');
// }

// async function saveDataToDatabase() {
//   try {
//     console.log('Starting database update...');

//     // Clear existing data
//     await clearExistingData();

//     // Save regions and districts
//     await saveRegionsAndDistricts(localitiesData as LocalityCollection);

//     // Save localities
//     await saveLocalities(localitiesData as LocalityCollection);

//     console.log('\nDatabase update completed successfully!');
//   } catch (error) {
//     console.error('Error saving to database:', error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// async function main() {
//   try {
//     console.log('Starting database population...');
//     await saveDataToDatabase();
//     console.log('Successfully completed database population!');
//   } catch (error) {
//     console.error('Error running script:', error);
//     process.exit(1);
//   }
// }

// main()
//   .then(() => {
//     console.log('Script completed successfully');
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error('Script failed:', error);
//     process.exit(1);
//   });








// import { PrismaClient } from '@prisma/client';
// import localitiesData from '../lib/ghana-post/data/localities/one/localities.json';


// interface Locality {
//     name: string;
//     type: 'city' | 'town' | 'suburb' | 'village' | 'neighborhood';
//     districtCode: string;
//     regionCode: string;
//     boundary?: GeoJSON.Geometry; // GeoJSON boundary data
//   }
  
//   interface LocalityCollection {
//     [districtCode: string]: {
//       district: string;
//       region: string;
//       localities: Locality[];
//     };
//   }
  
//   const prisma = new PrismaClient({
//     log: ['query', 'error', 'warn'],
//   });
  
//   async function clearExistingData() {
//     console.log('Clearing existing data...');
//     await prisma.locality.deleteMany();
//     await prisma.district.deleteMany();
//     await prisma.region.deleteMany();
//     await prisma.postcodeMetadata.deleteMany();
//     console.log('Existing data cleared.');
//   }
  
//   function padNumber(num: number, length: number): string {
//     return num.toString().padStart(length, '0');
//   }
  
//   function generatePostcode(regionCode: string, districtCode: string, localityCode: string): string {
//     return `${regionCode} ${districtCode}${localityCode}`;
//   }
  
//   async function saveRegionsAndDistricts(localities: LocalityCollection) {
//     console.log('Saving regions and districts...');
  
//     const regions = new Map<string, { name: string; code: string; districts: { name: string; code: string; localities: Locality[] }[] }>();
  
//     // Group districts by region
//     for (const districtCode in localities) {
//       const { district, region, localities: districtLocalities } = localities[districtCode];
  
//       if (!regions.has(region)) {
//         regions.set(region, { name: region, code: districtCode.substring(0, 2), districts: [] });
//       }
  
//       regions.get(region)?.districts.push({
//         name: district,
//         code: districtCode,
//         localities: districtLocalities,
//       });
//     }
  
//     // Save regions and districts
//     for (const [, regionData] of regions) {
//       const savedRegion = await prisma.region.create({
//         data: {
//           name: regionData.name,
//           code: regionData.code,
//           districts: {
//             create: regionData.districts.map((district, districtIndex) => ({
//               name: district.name,
//               code: padNumber(districtIndex + 1, 2), // Generate district code (e.g., "01")
//             //   postcode: generatePostcode(regionData.code, padNumber(districtIndex + 1, 2), '00'), // District postcode (e.g., "GA 0100")
//             })),
//           },
//         },
//       });
  
//       console.log(`Saved region: ${savedRegion.name}`);
//     }
  
//     console.log('Regions and districts saved.');
//   }
  
//   async function saveLocalities(localities: LocalityCollection) {
//     console.log('Saving localities...');
  
//     for (const districtCode in localities) {
//       const { localities: districtLocalities } = localities[districtCode];
  
//       const district = await prisma.district.findFirst({
//         where: { code: districtCode },
//       });
  
//       if (!district) {
//         console.error(`District not found: ${districtCode}`);
//         continue;
//       }
  
//       for (const [localityIndex, locality] of districtLocalities.entries()) {
//         const localityCode = padNumber(localityIndex + 1, 2); // Generate locality code (e.g., "01")
//         const postcode = generatePostcode(district.code.substring(0, 2), district.code, localityCode); // Locality postcode (e.g., "GA 0101")
  
//         await prisma.locality.create({
//           data: {
//             name: locality.name,
//             type: locality.type,
//             code: localityCode,
//             postcode,
//             districtId: district.id,
//             boundary: locality.boundary ? JSON.parse(JSON.stringify(locality.boundary)) : undefined,
//           },
//         });
//       }
//     }
  
//     console.log('Localities saved.');
//   }
  
//   async function saveDataToDatabase() {
//     try {
//       console.log('Starting database update...');
  
//       // Clear existing data
//       await clearExistingData();
  
//       // Save regions and districts
//       await saveRegionsAndDistricts(localitiesData as LocalityCollection);
  
//       // Save localities
//       await saveLocalities(localitiesData as LocalityCollection);
  
//       // Save metadata
//       const totalRegions = Object.keys(localitiesData).length;
//       const totalDistricts = Object.values(localitiesData).reduce((acc) => acc + 1, 0);
//       const totalLocalities = Object.values(localitiesData).reduce((acc, district) => acc + district.localities.length, 0);
  
//       await prisma.postcodeMetadata.create({
//         data: {
//           lastGenerated: new Date(),
//           totalRegions,
//           totalDistricts,
//           totalLocalities,
//           version: 1,
//         },
//       });
  
//       console.log('\nDatabase update completed successfully!');
//     } catch (error) {
//       console.error('Error saving to database:', error);
//       throw error;
//     } finally {
//       await prisma.$disconnect();
//     }
//   }
  
//   async function main() {
//     try {
//       console.log('Starting database population...');
//       await saveDataToDatabase();
//       console.log('Successfully completed database population!');
//     } catch (error) {
//       console.error('Error running script:', error);
//       process.exit(1);
//     }
//   }
  
//   main()
//     .then(() => {
//       console.log('Script completed successfully');
//       process.exit(0);
//     })
//     .catch((error) => {
//       console.error('Script failed:', error);
//       process.exit(1);
//     });


