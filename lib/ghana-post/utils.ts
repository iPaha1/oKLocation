import { District } from "./types"

// src/lib/ghana-post/utils.ts
export function calculateGridReference(latitude: number, longitude: number): string {
    // Ghana's boundaries
    const GHANA_BOUNDS = {
      north: 11.5,
      south: 4.5,
      west: -3.5,
      east: 1.5
    }
  
    // Validate coordinates
    if (latitude < GHANA_BOUNDS.south || latitude > GHANA_BOUNDS.north ||
        longitude < GHANA_BOUNDS.west || longitude > GHANA_BOUNDS.east) {
      throw new Error('Coordinates outside Ghana boundaries')
    }
  
    // Grid calculation
    // Each grid cell is approximately 100m x 100m
    const latGrid = Math.floor((latitude - GHANA_BOUNDS.south) * 100000)
    const longGrid = Math.floor((longitude - GHANA_BOUNDS.west) * 100000)
  
    return `${latGrid.toString().padStart(4, '0')}${longGrid.toString().padStart(4, '0')}`
  }
  
  export function findDistrictByCoordinates(latitude: number, longitude: number): District | null {
    console.log(`Finding district for coordinates: ${latitude}, ${longitude}`)
    // This would require a GeoJSON database of district boundaries
    // For now, return null or closest district based on central coordinates
    return null
  }