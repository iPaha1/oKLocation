// lib/postcode.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define specific types for each response type
interface LocalityResponse {
  type: 'locality';
  postcode: string | null;
  locality: string;
  district: string;
  region: string;
  metadata: {
    localityType: string;
    localityCode: string | null;
    districtCode: string;
    regionCode: string;
  };
}

interface DistrictResponse {
  type: 'district';
  district: string;
  region: string;
  metadata: {
    districtCode: string;
    regionCode: string;
  };
}

interface RegionResponse {
  type: 'region';
  region: string;
  metadata: {
    regionCode: string;
  };
}

// Union type of all possible responses
type PostcodeResponse = LocalityResponse | DistrictResponse | RegionResponse;

// Helper function to clean administrative names
function cleanAdministrativeName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  
  const cleanedName = name
    // Remove administrative terms wherever they appear
    .replace(/\s*(Region|Municipal|Metropolitan|Municipality|District|Assembly|Metro)\s*/gi, ' ')
    // Remove directional indicators
    .replace(/\s+(East|West|North|South)\s+/gi, ' ')
    // Clean up any double spaces and trim
    .replace(/\s+/g, ' ')
    .trim()
    // Convert to uppercase to match database format
    .toUpperCase();

  console.log(`Cleaned "${name}" to "${cleanedName}"`);
  return cleanedName;
}


export const getPostCodeFromDB = async (params: {
  locality?: string;
  district?: string;
  region?: string;
}): Promise<PostcodeResponse | null> => {
  // Clean up the input parameters
  const cleanedParams = {
    locality: params.locality,
    district: cleanAdministrativeName(params.district),
    region: cleanAdministrativeName(params.region)
  };

  const { locality, district, region } = cleanedParams;

  console.log("Original parameters:", params);
  console.log("Cleaned parameters:", cleanedParams);

  if (!locality && !district && !region) {
    throw new Error('At least one search parameter is required (locality, district, or region)');
  }

  try {
    // Try exact locality match first
    if (locality) {
      const localityMatch = await prisma.locality.findFirst({
        where: {
          name: {
            equals: locality,
          },
          district: {
            name: district ? {
              contains: district,
            } : undefined,
            region: region ? {
              name: {
                contains: region,
              }
            } : undefined,
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

      console.log("Locality search result:", localityMatch);

      if (localityMatch) {
        return {
          type: 'locality',
          postcode: localityMatch.postcode,
          locality: localityMatch.name,
          district: localityMatch.district.name,
          region: localityMatch.district.region.name,
          metadata: {
            localityType: localityMatch.type,
            localityCode: localityMatch.code,
            districtCode: localityMatch.district.code,
            regionCode: localityMatch.district.region.code,
          },
        };
      } else {
        console.log(`No locality match found for "${locality}"`);
      }
    }

    // Try district match
    if (district) {
      const districtMatch = await prisma.district.findFirst({
        where: {
          name: {
            contains: district,
          },
          region: region ? {
            name: {
              contains: region,
            }
          } : undefined,
        },
        include: {
          region: true,
        },
      });

      console.log("District search result:", districtMatch);

      if (districtMatch) {
        return {
          type: 'district',
          district: districtMatch.name,
          region: districtMatch.region.name,
          metadata: {
            districtCode: districtMatch.code,
            regionCode: districtMatch.region.code,
          },
        };
      } else {
        console.log(`No district match found for "${district}"`);
      }
    }

    // Try region match
    if (region) {
      const regionMatch = await prisma.region.findFirst({
        where: {
          name: {
            contains: region,
          },
        },
      });

      console.log("Region search result:", regionMatch);

      if (regionMatch) {
        return {
          type: 'region',
          region: regionMatch.name,
          metadata: {
            regionCode: regionMatch.code,
          },
        };
      } else {
        console.log(`No region match found for "${region}"`);
      }
    }

    console.log("No matches found for any parameter");
    return null;

  } catch (error) {
    console.error('Error fetching postcode from database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Optional: Export the cleaning function if needed elsewhere
export const cleanLocationName = cleanAdministrativeName;



// // lib/postcode.ts

// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // Define specific types for each response type
// interface LocalityResponse {
//   type: 'locality';
//   postcode: string | null;  // Changed from optional to nullable
//   locality: string;
//   district: string;
//   region: string;
//   metadata: {
//     localityType: string;
//     localityCode: string | null;  // Changed from optional to nullable
//     districtCode: string;
//     regionCode: string;
//   };
// }

// interface DistrictResponse {
//   type: 'district';
//   district: string;
//   region: string;
//   metadata: {
//     districtCode: string;
//     regionCode: string;
//   };
// }

// interface RegionResponse {
//   type: 'region';
//   region: string;
//   metadata: {
//     regionCode: string;
//   };
// }

// // Union type of all possible responses
// type PostcodeResponse = LocalityResponse | DistrictResponse | RegionResponse;

// export const getPostCodeFromDB = async (params: {
//   locality?: string;
//   district?: string;
//   region?: string;
// }): Promise<PostcodeResponse | null> => {
//   const { locality, district, region } = params;

//   console.log("this is the region, district and locality in the getPostcode from database function: ", region, district , locality)

//   if (!locality && !district && !region) {
//     throw new Error('At least one search parameter is required (locality, district, or region)');
//   }

//   try {
//     // Try exact locality match first
//     if (locality) {
//       const localityMatch = await prisma.locality.findFirst({
//         where: {
//           name: {
//             equals: locality,
//           },
//           district: {
//             name: district ? { contains: district } : undefined,
//             region: region ? { name: { contains: region } } : undefined,
//           },
//         },
//         include: {
//           district: {
//             include: {
//               region: true,
//             },
//           },
//         },
//       });

//       if (!localityMatch) {
//         console.log("the locality does not match in the database: ", locality)
//       }

//       if (localityMatch) {
//         return {
//           type: 'locality',
//           postcode: localityMatch.postcode,
//           locality: localityMatch.name,
//           district: localityMatch.district.name,
//           region: localityMatch.district.region.name,
//           metadata: {
//             localityType: localityMatch.type,
//             localityCode: localityMatch.code,
//             districtCode: localityMatch.district.code,
//             regionCode: localityMatch.district.region.code,
//           },
//         };
//       }
//     }

//     // Try district match
//     if (district) {
//       const districtMatch = await prisma.district.findFirst({
//         where: {
//           name: {
//             contains: district,
//           },
//           region: region ? { name: { contains: region } } : undefined,
//         },
//         include: {
//           region: true,
//         },
//       });

//       if (!districtMatch) {
//         console.log("the district does not match in the database: ", district)
//       }

//       if (districtMatch) {
//         return {
//           type: 'district',
//           district: districtMatch.name,
//           region: districtMatch.region.name,
//           metadata: {
//             districtCode: districtMatch.code,
//             regionCode: districtMatch.region.code,
//           },
//         };
//       }
//     }

//     // Try region match
//     if (region) {
//       const regionMatch = await prisma.region.findFirst({
//         where: {
//           name: {
//             contains: region,
//           },
//         },
//       });

//       if(!regionMatch){
//         console.log('this region does not match in the database : ', region)
//       }

//       if (regionMatch) {
//         return {
//           type: 'region',
//           region: regionMatch.name,
//           metadata: {
//             regionCode: regionMatch.code,
//           },
//         };
//       }
//     }

//     return null;
//   } catch (error) {
//     console.error('Error fetching postcode from database:', error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// };






// // lib/postcode.ts

// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// interface PostcodeResponse {
//   type: 'locality' | 'district' | 'region';
//   postcode?: string;
//   locality?: string;
//   district?: string;
//   region?: string;
//   metadata?: {
//     localityType?: string;
//     localityCode?: string;
//     districtCode?: string;
//     regionCode?: string;
//   };
// }

// export const getPostCodeFromDB = async (params: {
//   locality?: string;
//   district?: string;
//   region?: string;
// }): Promise<PostcodeResponse | null> => {
//   const { locality, district, region } = params;

//   // Ensure at least one parameter is provided
//   if (!locality && !district && !region) {
//     throw new Error('At least one search parameter is required (locality, district, or region)');
//   }

//   try {
//     let postcode = null;

//     // Try exact locality match first
//     if (locality) {
//       const localityMatch = await prisma.locality.findFirst({
//         where: {
//           name: {
//             equals: locality,
//           },
//           district: {
//             name: district ? { contains: district } : undefined,
//             region: region ? { name: { contains: region } } : undefined,
//           },
//         },
//         include: {
//           district: {
//             include: {
//               region: true,
//             },
//           },
//         },
//       });

//       console.log('Locality found: ', locality)

//       if (localityMatch) {
//         postcode = {
//           type: 'locality' as const,
//           postcode: localityMatch.postcode,
//           locality: localityMatch.name,
//           district: localityMatch.district.name,
//           region: localityMatch.district.region.name,
//           metadata: {
//             localityType: localityMatch.type,
//             localityCode: localityMatch.code,
//             districtCode: localityMatch.district.code,
//             regionCode: localityMatch.district.region.code,
//           },
//         };
//       }
//     }

//     // If no exact match, try district
//     if (!postcode && district) {
//       const districtMatch = await prisma.district.findFirst({
//         where: {
//           name: {
//             contains: district,
//           },
//           region: region ? { name: { contains: region } } : undefined,
//         },
//         include: {
//           region: true,
//         },
//       });

//       if (districtMatch) {
//         postcode = {
//           type: 'district' as const,
//           district: districtMatch.name,
//           region: districtMatch.region.name,
//           metadata: {
//             districtCode: districtMatch.code,
//             regionCode: districtMatch.region.code,
//           },
//         };
//       }
//     }

//     // If still no match, try region
//     if (!postcode && region) {
//       const regionMatch = await prisma.region.findFirst({
//         where: {
//           name: {
//             contains: region,
//           },
//         },
//       });

//       if (regionMatch) {
//         postcode = {
//           type: 'region' as const,
//           region: regionMatch.name,
//           metadata: {
//             regionCode: regionMatch.code,
//           },
//         };
//       }
//     }

//     if (!postcode) {
//       return null;
//     }

//     return postcode;
//   } catch (error) {
//     console.error('Error fetching postcode from database:', error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// };


// // lib/postcode-utils.ts
// export async function GetPostCodeFromDB(params: {
//     locality?: string;
//     district?: string;
//     region?: string;
//   }) {
//     const { locality, district, region } = params;
  
//     // Ensure at least one parameter is provided
//     if (!locality && !district && !region) {
//       throw new Error('At least one search parameter is required');
//     }
  
//     try {
//       const postcodeResponse = await fetch(
//         `/api/v1/postcode/lookup?${new URLSearchParams({
//           ...(locality && { locality }),
//           ...(district && { district }),
//           ...(region && { region })
//         })}`
//       );
  
//       if (!postcodeResponse.ok) {
//         // Handle non-200 responses
//         const errorData = await postcodeResponse.json();
//         throw new Error(errorData.error || 'Failed to fetch postcode');
//       }
  
//       return await postcodeResponse.json();
//     } catch (error) {
//       console.error('Error fetching postcode:', error);
//       throw error;
//     }
//   }