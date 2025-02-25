// scripts/load-boundaries.ts
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface BoundaryFeature {
  properties: {
    districtCode: string;
    districtName: string;
    regionName: string;
    originalName: string;
  };
  geometry: {
    coordinates: number[][][];
  };
}

interface BoundaryData {
  features: BoundaryFeature[];
}

async function loadBoundaries() {
  try {
    console.log('Reading boundary data...')
    const boundaryPath = path.join(process.cwd(), 'lib/ghana-post/data/district-boundaries.json')
    
    if (!fs.existsSync(boundaryPath)) {
      console.error(`File not found: ${boundaryPath}`);
      console.log('Current directory:', process.cwd());
      console.log('Available files:', fs.readdirSync(path.join(process.cwd(), 'lib/ghana-post/data')));
      throw new Error('Boundary data file not found');
    }

    const boundaryData: BoundaryData = JSON.parse(fs.readFileSync(boundaryPath, 'utf-8'))

    console.log('Loading boundaries into database...')
    let successCount = 0
    let failureCount = 0

    // First, clear existing boundaries
    console.log('Clearing existing boundaries...')
    await prisma.locationCache.deleteMany({})

    console.log(`Found ${boundaryData.features.length} districts to process`)

    for (const feature of boundaryData.features) {
      try {
        // Get center point of the district (using first coordinate as reference)
        const coordinates = feature.geometry.coordinates[0][0]
        
        await prisma.locationCache.create({
          data: {
            gpsName: feature.properties.districtCode,
            latitude: coordinates[1], // Latitude is second value
            longitude: coordinates[0], // Longitude is first value
            region: feature.properties.regionName,
            district: feature.properties.districtName,
            area: feature.properties.originalName,
            postCode: feature.properties.districtCode,
          }
        })
        successCount++
        if (successCount % 10 === 0) {
          console.log(`Processed ${successCount} districts...`)
        }
      } catch (error) {
        failureCount++
        console.error(`Failed to load boundary for ${feature.properties.districtName}:`, error)
      }
    }

    console.log('\nLoading complete!')
    console.log(`Successfully loaded: ${successCount} districts`)
    console.log(`Failed to load: ${failureCount} districts`)
    console.log(`Total processed: ${boundaryData.features.length} districts`)
    
  } catch (error) {
    console.error('Error loading boundaries:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Execute the function
loadBoundaries()
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })