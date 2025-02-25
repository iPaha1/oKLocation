// src/lib/ghana-post/constants.ts
export const GHANA_BOUNDS = {
    north: 11.5,
    south: 4.5,
    west: -3.5,
    east: 1.5,
    // Grid settings
    cellSize: 0.000899, // Approximately 100m at equator
    gridCells: 100000 // Number of cells in each direction
  } as const
  
  export const GPS_NAME_REGEX = /^[A-Z0-9]{2}\d{8}$/