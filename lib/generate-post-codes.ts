// lib/ghana-post/postcode-generator.ts

import { GHANA_REGIONS_DATA } from '@/data';
import localitiesData from '../lib/ghana-post/data/localities.json';


interface Locality {
  name: string;
  type: 'city' | 'town' | 'suburb' | 'village' | 'neighborhood';
  districtCode: string;
  regionCode: string;
}

interface LocalityCollection {
  [districtCode: string]: {
    district: string;
    region: string;
    localities: Locality[];
  };
}

interface PostcodeLocality {
  name: string;
  type: string;
  code: string;
  postcode: string;
}

interface PostcodeDistrict {
  name: string;
  code: string;
  postcode: string;
  localities: PostcodeLocality[];
}

interface PostcodeRegion {
  name: string;
  code: string;
  districts: PostcodeDistrict[];
}

interface PostcodeData {
  regions: PostcodeRegion[];
}

class PostcodeGenerator {
  private localities: LocalityCollection;
  private postcodeData: PostcodeData = { regions: [] };

  constructor() {
    // Use the imported localities data
    this.localities = localitiesData as LocalityCollection;
  }

  private padNumber(num: number, length: number): string {
    return num.toString().padStart(length, '0');
  }

  private generateDistrictCode(regionCode: string, districtIndex: number): string {
    return this.padNumber(districtIndex + 1, 2);
  }

  private generateLocalityCode(districtCode: string, localityIndex: number): string {
    return this.padNumber(localityIndex + 1, 2);
  }

  private generatePostcode(regionCode: string, districtCode: string, localityCode: string): string {
    return `${regionCode} ${districtCode}${localityCode}`;
  }

  public generatePostcodes(): PostcodeData {
    this.postcodeData = { regions: [] };

    // Process each region
    GHANA_REGIONS_DATA.forEach(region => {
      const postcodeRegion: PostcodeRegion = {
        name: region.name,
        code: region.code,
        districts: []
      };

      // Process districts within the region
      region.districts.forEach((district, districtIndex) => {
        const districtData = this.localities[district.code];
        
        const districtCode = this.generateDistrictCode(region.code, districtIndex);
        const postcodeDistrict: PostcodeDistrict = {
          name: district.name,
          code: districtCode,
          postcode: `${region.code} ${districtCode}00`,
          localities: []
        };

        // If we have locality data, process it
        if (districtData?.localities) {
          districtData.localities.forEach((locality, localityIndex) => {
            const localityCode = this.generateLocalityCode(districtCode, localityIndex);
            const postcode = this.generatePostcode(region.code, districtCode, localityCode);

            const postcodeLocality: PostcodeLocality = {
              name: locality.name,
              type: locality.type,
              code: localityCode,
              postcode
            };

            postcodeDistrict.localities.push(postcodeLocality);
          });
        }

        postcodeRegion.districts.push(postcodeDistrict);
      });

      this.postcodeData.regions.push(postcodeRegion);
    });

    return this.postcodeData;
  }

  public lookupPostcode(postcode: string): {
    region: string;
    district: string;
    locality?: string;
    postcode: string;
  } | null {
    const [regionCode, localCode] = postcode.split(' ');
    if (!regionCode || !localCode || localCode.length !== 4) {
      return null;
    }

    const districtCode = localCode.substring(0, 2);
    const localityCode = localCode.substring(2, 4);

    const region = this.postcodeData.regions.find(r => r.code === regionCode);
    if (!region) return null;

    const district = region.districts.find(d => d.code === districtCode);
    if (!district) return null;

    // Handle district-level postcodes (ending in 00)
    if (localityCode === '00') {
      return {
        region: region.name,
        district: district.name,
        postcode: district.postcode
      };
    }

    const locality = district.localities.find(l => l.code === localityCode);
    if (!locality) return null;

    return {
      region: region.name,
      district: district.name,
      locality: locality.name,
      postcode: locality.postcode
    };
  }

  public validatePostcode(postcode: string): boolean {
    const postcodeRegex = /^[A-Z]{1,2}\s\d{4}$/;
    if (!postcodeRegex.test(postcode)) {
      return false;
    }
    return this.lookupPostcode(postcode) !== null;
  }
}

// Create a singleton instance
let postcodeGeneratorInstance: PostcodeGenerator | null = null;

function getPostcodeGenerator(): PostcodeGenerator {
  if (!postcodeGeneratorInstance) {
    postcodeGeneratorInstance = new PostcodeGenerator();
    postcodeGeneratorInstance.generatePostcodes();
  }
  return postcodeGeneratorInstance;
}

export const generateGhanaPostcodes = (): PostcodeData => {
  const generator = getPostcodeGenerator();
  return generator.generatePostcodes();
};

export const lookupGhanaPostcode = (postcode: string) => {
  const generator = getPostcodeGenerator();
  return generator.lookupPostcode(postcode);
};

export const validateGhanaPostcode = (postcode: string) => {
  const generator = getPostcodeGenerator();
  return generator.validatePostcode(postcode);
};

// let's get post code by district, region or locality from the database
export const getPostCodeFromDatabase = async (params: {
  locality?: string;
  district?: string;
  region?: string;
}) => {
  const { locality, district, region } = params;  
  // Ensure at least one parameter is provided
  if (!locality && !district && !region) {
    throw new Error('At least one search parameter is required');
  }
  try {
    const postcodeResponse = await fetch(
      `/api/v1/postcode/lookup?${new URLSearchParams({
        ...(locality && { locality }),
        ...(district && { district }),
        ...(region && { region })
      })}`
    );
    if (!postcodeResponse.ok) {
      // Handle non-200 responses
      const errorData = await postcodeResponse.json();
      throw new Error(errorData.error || 'Failed to fetch postcode');
    }
    return await postcodeResponse.json();
  } catch (error) {
    console.error('Error fetching postcode:', error);
    throw error;
  }
}

// how can we use this function to get post code by district, region or locality from the database?
// const postCode = await getPostCodeFromDatabase({ locality: 'Kumasi', district: 'Kumasi', region: 'Ashanti' });
// console.log(postCode);





// // lib/ghana-post/postcode-generator.ts


// import { GHANA_REGIONS_DATA } from '@/data';
// import fs from 'fs';
// import path from 'path';

// interface Locality {
//   name: string;
//   type: 'city' | 'town' | 'suburb' | 'village' | 'neighborhood';
//   districtCode: string;
//   regionCode: string;
// }

// interface LocalityCollection {
//   [districtCode: string]: {
//     district: string;
//     region: string;
//     localities: Locality[];
//   };
// }

// interface PostcodeLocality {
//   name: string;
//   type: string;
//   code: string;
//   postcode: string;
// }

// interface PostcodeDistrict {
//   name: string;
//   code: string;
//   postcode: string;
//   localities: PostcodeLocality[];
// }

// interface PostcodeRegion {
//   name: string;
//   code: string;
//   districts: PostcodeDistrict[];
// }

// interface PostcodeData {
//   regions: PostcodeRegion[];
// }

// class PostcodeGenerator {
//   private localities: LocalityCollection;
//   private postcodeData: PostcodeData = { regions: [] };

//   constructor() {
//     // Read the localities data
//     const localitiesPath = path.join(__dirname, 'data', 'localities.json');
//     this.localities = JSON.parse(fs.readFileSync(localitiesPath, 'utf-8'));
//   }

//   private padNumber(num: number, length: number): string {
//     return num.toString().padStart(length, '0');
//   }

//   private generateDistrictCode(regionCode: string, districtIndex: number): string {
//     return this.padNumber(districtIndex + 1, 2);
//   }

//   private generateLocalityCode(districtCode: string, localityIndex: number): string {
//     return this.padNumber(localityIndex + 1, 2);
//   }

//   private generatePostcode(regionCode: string, districtCode: string, localityCode: string): string {
//     return `${regionCode} ${districtCode}${localityCode}`;
//   }

//   public generatePostcodes(): PostcodeData {
//     // Process each region
//     GHANA_REGIONS_DATA.forEach(region => {
//       const postcodeRegion: PostcodeRegion = {
//         name: region.name,
//         code: region.code,
//         districts: []
//       };

//       // Process districts within the region
//       region.districts.forEach((district, districtIndex) => {
//         const districtData = this.localities[district.code];
//         if (!districtData) return;

//         const districtCode = this.generateDistrictCode(region.code, districtIndex);
//         const postcodeDistrict: PostcodeDistrict = {
//           name: district.name,
//           code: districtCode,
//           postcode: `${region.code} ${districtCode}00`,
//           localities: []
//         };

//         // Process localities within the district
//         districtData.localities.forEach((locality, localityIndex) => {
//           const localityCode = this.generateLocalityCode(districtCode, localityIndex);
//           const postcode = this.generatePostcode(region.code, districtCode, localityCode);

//           const postcodeLocality: PostcodeLocality = {
//             name: locality.name,
//             type: locality.type,
//             code: localityCode,
//             postcode
//           };

//           postcodeDistrict.localities.push(postcodeLocality);
//         });

//         postcodeRegion.districts.push(postcodeDistrict);
//       });

//       this.postcodeData.regions.push(postcodeRegion);
//     });

//     // Save the generated postcode data
//     const outputPath = path.join(__dirname, 'data', 'postcodes.json');
//     fs.writeFileSync(outputPath, JSON.stringify(this.postcodeData, null, 2));

//     return this.postcodeData;
//   }

//   public lookupPostcode(postcode: string): {
//     region: string;
//     district: string;
//     locality: string;
//     postcode: string;
//   } | null {
//     const [regionCode, localCode] = postcode.split(' ');
//     if (!regionCode || !localCode || localCode.length !== 4) {
//       return null;
//     }

//     const districtCode = localCode.substring(0, 2);
//     const localityCode = localCode.substring(2, 4);

//     const region = this.postcodeData.regions.find(r => r.code === regionCode);
//     if (!region) return null;

//     const district = region.districts.find(d => d.code === districtCode);
//     if (!district) return null;

//     const locality = district.localities.find(l => l.code === localityCode);
//     if (!locality) return null;

//     return {
//       region: region.name,
//       district: district.name,
//       locality: locality.name,
//       postcode: locality.postcode
//     };
//   }

//   public validatePostcode(postcode: string): boolean {
//     // Format should be: XX NNNN (where X is letter, N is number)
//     const postcodeRegex = /^[A-Z]{1,2}\s\d{4}$/;
//     if (!postcodeRegex.test(postcode)) {
//       return false;
//     }

//     // Check if the postcode exists in our data
//     return this.lookupPostcode(postcode) !== null;
//   }
// }

// // Export functions for external use
// export const generateGhanaPostcodes = (): PostcodeData => {
//   const generator = new PostcodeGenerator();
//   return generator.generatePostcodes();
// };

// export const lookupGhanaPostcode = (postcode: string) => {
//   const generator = new PostcodeGenerator();
//   generator.generatePostcodes(); // Initialize the data
//   return generator.lookupPostcode(postcode);
// };

// export const validateGhanaPostcode = (postcode: string) => {
//   const generator = new PostcodeGenerator();
//   generator.generatePostcodes(); // Initialize the data
//   return generator.validatePostcode(postcode);
// };

// // Generate postcodes if running directly
// if (require.main === module) {
//   console.log('Generating Ghana postcodes...');
//   const generator = new PostcodeGenerator();
//   const postcodeData = generator.generatePostcodes();
  
//   // Log some statistics
//   console.log('\nPostcode Generation Statistics:');
//   console.log(`Total regions: ${postcodeData.regions.length}`);
//   const totalDistricts = postcodeData.regions.reduce(
//     (sum, region) => sum + region.districts.length, 0
//   );
//   console.log(`Total districts: ${totalDistricts}`);
//   const totalLocalities = postcodeData.regions.reduce(
//     (sum, region) => sum + region.districts.reduce(
//       (dSum, district) => dSum + district.localities.length, 0
//     ), 0
//   );
//   console.log(`Total localities: ${totalLocalities}`);
//   console.log('\nPostcodes have been generated and saved to: ./data/postcodes.json');
// }