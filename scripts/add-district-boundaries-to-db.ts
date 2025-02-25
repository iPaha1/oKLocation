import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Function to normalize district names for comparison
function normalizeName(name: string | undefined): string {
  if (!name) {
    return ''; // Return an empty string if the name is undefined
  }
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();
}

// Function to check if a district name matches a boundary name
function isMatchingDistrict(districtName: string | undefined, boundaryName: string | undefined): boolean {
  const normalizedDistrictName = normalizeName(districtName);
  const normalizedBoundaryName = normalizeName(boundaryName);

  // Check if the boundary name contains the district name or vice versa
  return (
    normalizedBoundaryName.includes(normalizedDistrictName) ||
    normalizedDistrictName.includes(normalizedBoundaryName)
  );
}

async function addBoundariesToDistricts() {
  try {
    console.log('Loading district boundaries...');

    // Load the district boundaries GeoJSON file
    const boundariesPath = path.join(__dirname, '../lib/ghana-post/data/districts/district-boundaries.json');
    const boundariesData = JSON.parse(fs.readFileSync(boundariesPath, 'utf-8'));

    console.log(`Found ${boundariesData.features.length} district boundaries.`);

    // Fetch all districts from the database
    const districts = await prisma.district.findMany();

    console.log(`Found ${districts.length} districts in the database.`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Iterate through each district and match it with a boundary
    for (const district of districts) {
      if (!district.name) {
        console.log(`Skipping district with missing name: ${district.id}`);
        skippedCount++;
        continue;
      }

      const matchingBoundary = boundariesData.features.find((feature: { properties: { name: string }, geometry: GeoJSON.Geometry }) => {
        if (!feature.properties?.name) {
          console.log(`Skipping boundary with missing name: unknown`);
          return false;
        }

        // Log the names being compared for debugging
        console.log(`Comparing district: "${district.name}" with boundary: "${feature.properties.name}"`);

        return isMatchingDistrict(district.name, feature.properties.name);
      });

      if (matchingBoundary) {
        // Update the district with the boundary data
        await prisma.district.update({
          where: { id: district.id },
          data: {
            boundary: matchingBoundary.geometry,
          },
        });

        console.log(`Updated boundary for district: ${district.name}`);
        updatedCount++;
      } else {
        console.log(`No matching boundary found for district: ${district.name}`);
        skippedCount++;
      }
    }

    console.log(`\nUpdated boundaries for ${updatedCount} districts.`);
    console.log(`Skipped ${skippedCount} districts due to missing names or no matching boundary.`);
  } catch (error) {
    console.error('Error adding boundaries to districts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
addBoundariesToDistricts();






// THIS ONE LOGS ALL THE SKIPPED DISTRICTS



// import { PrismaClient } from '@prisma/client';
// import fs from 'fs';
// import path from 'path';

// const prisma = new PrismaClient({
//   log: ['query', 'error', 'warn'],
// });

// // Function to normalize district names for comparison
// function normalizeName(name: string | undefined): string {
//   if (!name) {
//     return ''; // Return an empty string if the name is undefined
//   }
//   return name
//     .toLowerCase()
//     .replace(/[^a-z0-9\s]/g, '') // Remove special characters
//     .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
//     .trim();
// }

// // Function to check if a district name matches a boundary name
// function isMatchingDistrict(districtName: string | undefined, boundaryName: string | undefined): boolean {
//   const normalizedDistrictName = normalizeName(districtName);
//   const normalizedBoundaryName = normalizeName(boundaryName);

//   // Check if the boundary name contains the district name or vice versa
//   return (
//     normalizedBoundaryName.includes(normalizedDistrictName) ||
//     normalizedDistrictName.includes(normalizedBoundaryName)
//   );
// }

// async function addBoundariesToDistricts() {
//   try {
//     console.log('Loading district boundaries...');

//     // Load the district boundaries GeoJSON file
//     const boundariesPath = path.join(__dirname, '../lib/ghana-post/data/districts/district-boundaries.json');
//     const boundariesData = JSON.parse(fs.readFileSync(boundariesPath, 'utf-8'));

//     console.log(`Found ${boundariesData.features.length} district boundaries.`);

//     // Fetch all districts from the database
//     const districts = await prisma.district.findMany();

//     console.log(`Found ${districts.length} districts in the database.`);

//     let updatedCount = 0;
//     let skippedCount = 0;

//     // Iterate through each district and match it with a boundary
//     for (const district of districts) {
//       if (!district.name) {
//         console.log(`Skipping district with missing name: ${district.id}`);
//         skippedCount++;
//         continue;
//       }

//       const matchingBoundary = boundariesData.features.find((feature: { properties: { name: string }, geometry: GeoJSON.Geometry }) => {
//         if (!feature.properties?.name) {
//           console.log(`Skipping boundary with missing name: unknown`);
//           return false;
//         }

//         // Log the names being compared for debugging
//         console.log(`Comparing district: "${district.name}" with boundary: "${feature.properties.name}"`);

//         return isMatchingDistrict(district.name, feature.properties.name);
//       });

//       if (matchingBoundary) {
//         // Update the district with the boundary data
//         await prisma.district.update({
//           where: { id: district.id },
//           data: {
//             boundary: matchingBoundary.geometry,
//           },
//         });

//         console.log(`Updated boundary for district: ${district.name}`);
//         updatedCount++;
//       } else {
//         console.log(`No matching boundary found for district: ${district.name}`);
//         skippedCount++;
//       }
//     }

//     console.log(`\nUpdated boundaries for ${updatedCount} districts.`);
//     console.log(`Skipped ${skippedCount} districts due to missing names or no matching boundary.`);
//   } catch (error) {
//     console.error('Error adding boundaries to districts:', error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // Execute the script
// addBoundariesToDistricts();



// import { PrismaClient } from '@prisma/client';
// import fs from 'fs';
// import path from 'path';

// const prisma = new PrismaClient({
//   log: ['query', 'error', 'warn'],
// });

// // Function to normalize district names for comparison
// function normalizeName(name: string): string {
//   return name
//     .toLowerCase()
//     .replace(/[^a-z0-9\s]/g, '') // Remove special characters
//     .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
//     .trim();
// }

// // Function to check if a district name matches a boundary name
// function isMatchingDistrict(districtName: string, boundaryName: string): boolean {
//   const normalizedDistrictName = normalizeName(districtName);
//   const normalizedBoundaryName = normalizeName(boundaryName);

//   // Check if the boundary name contains the district name or vice versa
//   return (
//     normalizedBoundaryName.includes(normalizedDistrictName) ||
//     normalizedDistrictName.includes(normalizedBoundaryName)
//   );
// }

// async function addBoundariesToDistricts() {
//   try {
//     console.log('Loading district boundaries...');

//     // Load the district boundaries GeoJSON file
//     const boundariesPath = path.join(__dirname, '../lib/ghana-post/data/districts/district-boundaries.json');
//     const boundariesData = JSON.parse(fs.readFileSync(boundariesPath, 'utf-8'));

//     console.log(`Found ${boundariesData.features.length} district boundaries.`);

//     // Fetch all districts from the database
//     const districts = await prisma.district.findMany();

//     console.log(`Found ${districts.length} districts in the database.`);

//     let updatedCount = 0;

//     // Iterate through each district and match it with a boundary
//     for (const district of districts) {
//       const matchingBoundary = boundariesData.features.find((feature: { properties: { name: string }; geometry: GeoJSON.Geometry }) =>
//         isMatchingDistrict(district.name, feature.properties.name)
//       );

//       if (matchingBoundary) {
//         // Update the district with the boundary data
//         await prisma.district.update({
//           where: { id: district.id },
//           data: {
//             boundary: matchingBoundary.geometry,
//           },
//         });

//         console.log(`Updated boundary for district: ${district.name}`);
//         updatedCount++;
//       } else {
//         console.log(`No matching boundary found for district: ${district.name}`);
//       }
//     }

//     console.log(`\nUpdated boundaries for ${updatedCount} districts.`);
//   } catch (error) {
//     console.error('Error adding boundaries to districts:', error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // Execute the script
// addBoundariesToDistricts();