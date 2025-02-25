// src/lib/ghana-post/index.ts
import { GHANA_BOUNDS, GPS_NAME_REGEX } from './constants'
import { GHANA_REGIONS_DATA } from '../../data'
import type { LocationResponse } from './types'
import { boundaryManager } from './utils/boundaries'

class GhanaPostAPI {
  private initialized = false

  constructor() {
    this.initialize()
  }

  private async initialize() {
    if (this.initialized) return
    await boundaryManager.initialize()
    this.initialized = true
  }

  private generateGridReference(latitude: number, longitude: number): string {
    // Validate coordinates
    if (latitude < GHANA_BOUNDS.south || latitude > GHANA_BOUNDS.north ||
        longitude < GHANA_BOUNDS.west || longitude > GHANA_BOUNDS.east) {
      throw new Error(`Coordinates (${latitude}, ${longitude}) outside Ghana boundaries`)
    }

    // Calculate grid position
    const latGrid = Math.floor(
      ((latitude - GHANA_BOUNDS.south) / (GHANA_BOUNDS.north - GHANA_BOUNDS.south)) 
      * GHANA_BOUNDS.gridCells
    )
    const longGrid = Math.floor(
      ((longitude - GHANA_BOUNDS.west) / (GHANA_BOUNDS.east - GHANA_BOUNDS.west)) 
      * GHANA_BOUNDS.gridCells
    )

    return `${latGrid.toString().padStart(4, '0')}${longGrid.toString().padStart(4, '0')}`
  }

  async getLocationByCoordinates(latitude: number, longitude: number): Promise<LocationResponse> {
    await this.initialize()

    // Find district from coordinates
    const district = await boundaryManager.findDistrict(latitude, longitude)
    if (!district) {
      throw new Error(`No district found for coordinates (${latitude}, ${longitude})`)
    }

    const { districtCode, districtName, regionName } = district.properties

    // Generate grid reference
    const gridRef = this.generateGridReference(latitude, longitude)

    // Find region data
    const region = GHANA_REGIONS_DATA.find(r => r.name === regionName)
    if (!region) {
      throw new Error(`Region "${regionName}" not found in database`)
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
    if (!GPS_NAME_REGEX.test(gpsName)) {
      throw new Error('Invalid GPS name format. Expected format: XX00000000 (2 letters/numbers + 8 numbers)')
    }

    const districtCode = gpsName.substring(0, 2)
    const gridRef = gpsName.substring(2)

    // Find district and region
    let matchedDistrict = null
    let matchedRegion = null

    for (const region of GHANA_REGIONS_DATA) {
      const district = region.districts.find(d => d.code === districtCode)
      if (district) {
        matchedDistrict = district
        matchedRegion = region
        break
      }
    }

    if (!matchedDistrict || !matchedRegion) {
      throw new Error(`Invalid district code: ${districtCode}`)
    }

    // Convert grid reference back to coordinates
    const latGrid = parseInt(gridRef.substring(0, 4))
    const longGrid = parseInt(gridRef.substring(4))

    const latitude = GHANA_BOUNDS.south + 
      (latGrid / GHANA_BOUNDS.gridCells) * (GHANA_BOUNDS.north - GHANA_BOUNDS.south)
    const longitude = GHANA_BOUNDS.west + 
      (longGrid / GHANA_BOUNDS.gridCells) * (GHANA_BOUNDS.east - GHANA_BOUNDS.west)

    return {
      GPSName: gpsName,
      Region: matchedRegion.name,
      District: matchedDistrict.name,
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