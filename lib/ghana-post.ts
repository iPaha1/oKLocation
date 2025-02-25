// lib/ghana-post.ts

// import { loadDistrictBoundaries } from './data/district-boundaries'
import { GHANA_REGIONS_DATA } from '../data'
import { GeoJSONCollection } from './ghana-post/geojson'
import { LocationResponse } from './ghana-post/types'
import { findDistrictForPoint } from './ghana-post/utils/point-in-polygon'

// Sample district boundaries loader
const loadDistrictBoundaries = async (): Promise<GeoJSONCollection> => {
  // This sample GeoJSON contains a single feature for demonstration.
  // In a production system, you would load detailed boundaries for all districts.
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          districtCode: 'AA',           // Sample district code
          districtName: 'Accra',          // Sample district name
          regionName: 'Greater Accra',    // Sample region name
          regionCode: 'GA'
        },
        geometry: {
          type: 'Polygon',
          // Sample coordinates - a simple closed loop (for demo only)
          coordinates: [
            [
              [-0.20751953125, 5.703448715041431],
              [-0.20751953125, 5.703848715041431],
              [-0.20701953125, 5.703848715041431],
              [-0.20701953125, 5.703448715041431],
              [-0.20751953125, 5.703448715041431] // Closing the polygon
            ]
          ]
        }
      }
    ]
  }
}

class GhanaPostAPI {
  private districtBoundaries: GeoJSONCollection | null = null

  constructor() {
    this.initializeBoundaries()
  }

  private async initializeBoundaries() {
    this.districtBoundaries = await loadDistrictBoundaries()
  }

  private async findDistrictFromCoordinates(latitude: number, longitude: number) {
    if (!this.districtBoundaries) {
      await this.initializeBoundaries()
    }

    const point: [number, number] = [longitude, latitude]
    const district = findDistrictForPoint(point, this.districtBoundaries!)

    if (!district) {
      throw new Error('Location not found in any district')
    }

    return district
  }

  private generateGridReference(latitude: number, longitude: number): string {
    // Ghana's boundaries
    const GHANA_BOUNDS = {
      north: 11.5,
      south: 4.5,
      west: -3.5,
      east: 1.5,
      // Grid settings
      cellSize: 0.000899, // Approximately 100m at equator
      gridCells: 100000 // Number of cells in each direction
    }

    // Validate coordinates
    if (
      latitude < GHANA_BOUNDS.south || latitude > GHANA_BOUNDS.north ||
      longitude < GHANA_BOUNDS.west || longitude > GHANA_BOUNDS.east
    ) {
      throw new Error('Coordinates outside Ghana boundaries')
    }

    // Calculate grid position
    const latGrid = Math.floor(
      ((latitude - GHANA_BOUNDS.south) / (GHANA_BOUNDS.north - GHANA_BOUNDS.south)) *
      GHANA_BOUNDS.gridCells
    )
    const longGrid = Math.floor(
      ((longitude - GHANA_BOUNDS.west) / (GHANA_BOUNDS.east - GHANA_BOUNDS.west)) *
      GHANA_BOUNDS.gridCells
    )

    // Format as 8-digit string
    return `${latGrid.toString().padStart(4, '0')}${longGrid.toString().padStart(4, '0')}`
  }

  async getLocationByCoordinates(latitude: number, longitude: number): Promise<LocationResponse> {
    // Find district from coordinates
    const districtFeature = await this.findDistrictFromCoordinates(latitude, longitude)
    const { districtCode, districtName, regionName } = districtFeature.properties

    // Generate grid reference
    const gridRef = this.generateGridReference(latitude, longitude)

    // Find region data
    const region = GHANA_REGIONS_DATA.find(r => r.name === regionName)
    if (!region) {
      throw new Error('Region not found')
    }

    // Find district data
    const district = region.districts.find(d => d.code === districtCode)
    if (!district) {
      throw new Error('District not found')
    }

    // Construct GPS name
    const gpsName = `${districtCode}${gridRef}`

    return {
      GPSName: gpsName,
      Region: regionName,
      District: districtName,
      Area: '', // Would need area database
      postCode: `${districtCode}${gridRef.substring(0, 4)}`,
      latitude,
      longitude,
      Street: undefined,
      PlaceName: undefined
    }
  }

  async getLocationByAddress(gpsName: string): Promise<LocationResponse> {
    // Validate GPS name format
    if (!/^[A-Z0-9]{2}\d{8}$/.test(gpsName)) {
      throw new Error('Invalid GPS name format')
    }

    const districtCode = gpsName.substring(0, 2)
    const gridRef = gpsName.substring(2)

    // Find district
    let district: { code: string, name: string } | null = null
    let region: { name: string, districts: { code: string, name: string }[] } | null = null

    for (const r of GHANA_REGIONS_DATA) {
      const d = r.districts.find(d => d.code === districtCode)
      if (d) {
        district = d
        region = r
        break
      }
    }

    if (!district || !region) {
      throw new Error('Invalid district code')
    }

    // Convert grid reference back to coordinates
    // This is a simplified conversion - you'd need proper grid conversion
    const GHANA_BOUNDS = {
      north: 11.5,
      south: 4.5,
      west: -3.5,
      east: 1.5,
      gridCells: 100000
    }

    const latGrid = parseInt(gridRef.substring(0, 4))
    const longGrid = parseInt(gridRef.substring(4))

    const latitude = GHANA_BOUNDS.south +
      (latGrid / GHANA_BOUNDS.gridCells) * (GHANA_BOUNDS.north - GHANA_BOUNDS.south)
    const longitude = GHANA_BOUNDS.west +
      (longGrid / GHANA_BOUNDS.gridCells) * (GHANA_BOUNDS.east - GHANA_BOUNDS.west)

    return {
      GPSName: gpsName,
      Region: region.name,
      District: district.name,
      Area: '', // Would need area database
      postCode: `${districtCode}${gridRef.substring(0, 4)}`,
      latitude,
      longitude
    }
  }
}

// Create and export singleton instance
const ghanaPostAPI = new GhanaPostAPI()

export const getLocationByAddress = (gpsName: string) =>
  ghanaPostAPI.getLocationByAddress(gpsName)

export const getLocationByCoordinates = (latitude: number, longitude: number) =>
  ghanaPostAPI.getLocationByCoordinates(latitude, longitude)











// THIS IS THE ACTUAL CODE BUT IT IS NOT WORKING

// // lib/ghana-post.ts

// import { loadDistrictBoundaries } from './data/district-boundaries'
// import { GHANA_REGIONS_DATA } from '../data'
// import { GeoJSONCollection } from './ghana-post/geojson'
// import { LocationResponse } from './ghana-post/types'
// import { findDistrictForPoint } from './ghana-post/utils/point-in-polygon'


// class GhanaPostAPI {
//   private districtBoundaries: GeoJSONCollection | null = null

//   constructor() {
//     this.initializeBoundaries()
//   }

//   private async initializeBoundaries() {
//     this.districtBoundaries = await loadDistrictBoundaries()
//   }

//   private async findDistrictFromCoordinates(latitude: number, longitude: number) {
//     if (!this.districtBoundaries) {
//       await this.initializeBoundaries()
//     }

//     const point: [number, number] = [longitude, latitude]
//     const district = findDistrictForPoint(point, this.districtBoundaries!)

//     if (!district) {
//       throw new Error('Location not found in any district')
//     }

//     return district
//   }

//   private generateGridReference(latitude: number, longitude: number): string {
//     // Ghana's boundaries
//     const GHANA_BOUNDS = {
//       north: 11.5,
//       south: 4.5,
//       west: -3.5,
//       east: 1.5,
//       // Grid settings
//       cellSize: 0.000899, // Approximately 100m at equator
//       gridCells: 100000 // Number of cells in each direction
//     }

//     // Validate coordinates
//     if (latitude < GHANA_BOUNDS.south || latitude > GHANA_BOUNDS.north ||
//         longitude < GHANA_BOUNDS.west || longitude > GHANA_BOUNDS.east) {
//       throw new Error('Coordinates outside Ghana boundaries')
//     }

//     // Calculate grid position
//     const latGrid = Math.floor(
//       ((latitude - GHANA_BOUNDS.south) / (GHANA_BOUNDS.north - GHANA_BOUNDS.south)) 
//       * GHANA_BOUNDS.gridCells
//     )
//     const longGrid = Math.floor(
//       ((longitude - GHANA_BOUNDS.west) / (GHANA_BOUNDS.east - GHANA_BOUNDS.west)) 
//       * GHANA_BOUNDS.gridCells
//     )

//     // Format as 8-digit string
//     return `${latGrid.toString().padStart(4, '0')}${longGrid.toString().padStart(4, '0')}`
//   }

//   async getLocationByCoordinates(latitude: number, longitude: number): Promise<LocationResponse> {
//     // Find district from coordinates
//     const districtFeature = await this.findDistrictFromCoordinates(latitude, longitude)
//     const { districtCode, districtName, regionName } = districtFeature.properties

//     // Generate grid reference
//     const gridRef = this.generateGridReference(latitude, longitude)

//     // Find region data
//     const region = GHANA_REGIONS_DATA.find(r => r.name === regionName)
//     if (!region) {
//       throw new Error('Region not found')
//     }

//     // Find district data
//     const district = region.districts.find(d => d.code === districtCode)
//     if (!district) {
//       throw new Error('District not found')
//     }

//     // Construct GPS name
//     const gpsName = `${districtCode}${gridRef}`

//     return {
//       GPSName: gpsName,
//       Region: regionName,
//       District: districtName,
//       Area: '', // Would need area database
//       postCode: `${districtCode}${gridRef.substring(0, 4)}`,
//       latitude,
//       longitude,
//       Street: undefined,
//       PlaceName: undefined
//     }
//   }

//   async getLocationByAddress(gpsName: string): Promise<LocationResponse> {
//     // Validate GPS name format
//     if (!/^[A-Z0-9]{2}\d{8}$/.test(gpsName)) {
//       throw new Error('Invalid GPS name format')
//     }

//     const districtCode = gpsName.substring(0, 2)
//     const gridRef = gpsName.substring(2)

//     // Find district
//     let district: { code: string, name: string } | null = null
//     let region: { name: string, districts: { code: string, name: string }[] } | null = null

//     for (const r of GHANA_REGIONS_DATA) {
//       const d = r.districts.find(d => d.code === districtCode)
//       if (d) {
//         district = d
//         region = r
//         break
//       }
//     }

//     if (!district || !region) {
//       throw new Error('Invalid district code')
//     }

//     // Convert grid reference back to coordinates
//     // This is a simplified conversion - you'd need proper grid conversion
//     const GHANA_BOUNDS = {
//       north: 11.5,
//       south: 4.5,
//       west: -3.5,
//       east: 1.5,
//       gridCells: 100000
//     }

//     const latGrid = parseInt(gridRef.substring(0, 4))
//     const longGrid = parseInt(gridRef.substring(4))

//     const latitude = GHANA_BOUNDS.south + 
//       (latGrid / GHANA_BOUNDS.gridCells) * (GHANA_BOUNDS.north - GHANA_BOUNDS.south)
//     const longitude = GHANA_BOUNDS.west + 
//       (longGrid / GHANA_BOUNDS.gridCells) * (GHANA_BOUNDS.east - GHANA_BOUNDS.west)

//     return {
//       GPSName: gpsName,
//       Region: region.name,
//       District: district.name,
//       Area: '', // Would need area database
//       postCode: `${districtCode}${gridRef.substring(0, 4)}`,
//       latitude,
//       longitude
//     }
//   }
// }

// // Create and export singleton instance
// const ghanaPostAPI = new GhanaPostAPI()

// export const getLocationByAddress = (gpsName: string) => 
//   ghanaPostAPI.getLocationByAddress(gpsName)

// export const getLocationByCoordinates = (latitude: number, longitude: number) =>
//   ghanaPostAPI.getLocationByCoordinates(latitude, longitude)