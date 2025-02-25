// /lib/ghana-post/utils/boundaries.ts
import RBush from 'rbush'
import type { Position } from 'geojson'
import { GeoJSONCollection, GeoJSONFeature } from '../geojson'

interface BoundaryIndex {
  minX: number
  minY: number
  maxX: number
  maxY: number
  districtCode: string
  geometry: GeoJSON.Geometry
}

export class BoundaryManager {
  private static instance: BoundaryManager
  private tree: RBush<BoundaryIndex>
  private boundaries: GeoJSONCollection | null = null
  private initializationPromise: Promise<void> | null = null
  
  private constructor() {
    this.tree = new RBush()
  }

  static getInstance(): BoundaryManager {
    if (!BoundaryManager.instance) {
      BoundaryManager.instance = new BoundaryManager()
    }
    return BoundaryManager.instance
  }

  async initialize() {
    // If already initialized, return immediately
    if (this.boundaries) return

    // If initialization is in progress, wait for it
    if (this.initializationPromise) {
      await this.initializationPromise
      return
    }

    // Start initialization
    this.initializationPromise = this.doInitialize()
    await this.initializationPromise
  }

  private async doInitialize() {
    try {
      // Get the host from the environment
      const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
      const host = process.env.NEXT_PUBLIC_HOST || 'localhost:3000'
      
      // Construct the full URL
      const url = `${protocol}://${host}/api/boundaries`
      
      // Load district boundaries
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch boundaries: ${response.statusText}`)
      }
      
      this.boundaries = await response.json()

      // Build spatial index
      const items: BoundaryIndex[] = []

      this.boundaries?.features.forEach(feature => {
        const bbox = this.calculateBBox(feature.geometry as GeoJSON.Geometry)
        items.push({
          minX: bbox[0],
          minY: bbox[1],
          maxX: bbox[2],
          maxY: bbox[3],
          districtCode: feature.properties.districtCode,
          geometry: feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
        })
      })

      this.tree.load(items)
    } catch (error) {
      console.error('Failed to initialize boundaries:', error)
      // Clear the promise so initialization can be retried
      this.initializationPromise = null
      throw error
    }
  }

  async findDistrict(latitude: number, longitude: number): Promise<GeoJSONFeature | null> {
    // Ensure initialization before proceeding
    await this.initialize()

    if (!this.boundaries) {
      throw new Error('Boundaries not initialized')
    }

    // Search the R-tree index
    const matches = this.tree.search({
      minX: longitude,
      minY: latitude,
      maxX: longitude,
      maxY: latitude
    })

    // Check each potential match
    for (const match of matches) {
      if (this.pointInPolygon([longitude, latitude], match.geometry)) {
        const feature = this.boundaries.features.find(
          f => f.properties.districtCode === match.districtCode
        )
        return feature || null
      }
    }

    return null
  }

  private calculateBBox(geometry: GeoJSON.Geometry): [number, number, number, number] {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    const checkCoordinates = (coords: Position[]) => {
      coords.forEach(([x, y]) => {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      })
    }

    if (geometry.type === 'Polygon') {
      geometry.coordinates.forEach(checkCoordinates)
    } else if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach(poly => poly.forEach(checkCoordinates))
    }

    return [minX, minY, maxX, maxY]
  }

  private pointInPolygon(point: Position, geometry: GeoJSON.Geometry): boolean {
    const [x, y] = point
    
    const checkPolygon = (coords: Position[]): boolean => {
      let inside = false
      for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
        const [xi, yi] = coords[i]
        const [xj, yj] = coords[j]
        
        const intersect = ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
        
        if (intersect) inside = !inside
      }
      return inside
    }

    if (geometry.type === 'Polygon') {
      return checkPolygon(geometry.coordinates[0])
    } else if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.some(poly => checkPolygon(poly[0]))
    }

    return false
  }
}

// Export singleton instance
export const boundaryManager = BoundaryManager.getInstance()







// // /lib/ghana-post/utils/boundaries.ts
// import RBush from 'rbush'
// import type { Position } from 'geojson'
// import { GeoJSONCollection, GeoJSONFeature } from '../geojson'

// interface BoundaryIndex {
//   minX: number
//   minY: number
//   maxX: number
//   maxY: number
//   districtCode: string
//   geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
// }

// export class BoundaryManager {
//   private static instance: BoundaryManager
//   private tree: RBush<BoundaryIndex>
//   private boundaries: GeoJSONCollection | null = null
//   private initializationPromise: Promise<void> | null = null
  
//   private constructor() {
//     this.tree = new RBush()
//   }

//   static getInstance(): BoundaryManager {
//     if (!BoundaryManager.instance) {
//       BoundaryManager.instance = new BoundaryManager()
//     }
//     return BoundaryManager.instance
//   }

//   async initialize() {
//     // If already initialized, return immediately
//     if (this.boundaries) return

//     // If initialization is in progress, wait for it
//     if (this.initializationPromise) {
//       await this.initializationPromise
//       return
//     }

//     // Start initialization
//     this.initializationPromise = this.doInitialize()
//     await this.initializationPromise
//   }

//   private async doInitialize() {
//     try {
//       // Load district boundaries
//       const response = await fetch('/api/boundaries')
//       if (!response.ok) {
//         throw new Error(`Failed to fetch boundaries: ${response.statusText}`)
//       }
      
//       this.boundaries = await response.json()

//       // Build spatial index
//       const items: BoundaryIndex[] = []

//       this.boundaries?.features.forEach(feature => {
//         if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
//           const bbox = this.calculateBBox(feature.geometry as GeoJSON.Geometry)
//           items.push({
//             minX: bbox[0],
//             minY: bbox[1],
//             maxX: bbox[2],
//             maxY: bbox[3],
//             districtCode: feature.properties.districtCode,
//             geometry: feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
//           })
//         }
//       })

//       this.tree.load(items)
//     } catch (error) {
//       console.error('Failed to initialize boundaries:', error)
//       // Clear the promise so initialization can be retried
//       this.initializationPromise = null
//       throw error
//     }
//   }

//   async findDistrict(latitude: number, longitude: number): Promise<GeoJSONFeature | null> {
//     // Ensure initialization before proceeding
//     await this.initialize()

//     if (!this.boundaries) {
//       throw new Error('Boundaries not initialized')
//     }

//     // Search the R-tree index
//     const matches = this.tree.search({
//       minX: longitude,
//       minY: latitude,
//       maxX: longitude,
//       maxY: latitude
//     })

//     // Check each potential match
//     for (const match of matches) {
//       if (this.pointInPolygon([longitude, latitude], match.geometry)) {
//         const feature = this.boundaries.features.find(
//           f => f.properties.districtCode === match.districtCode
//         )
//         return feature || null
//       }
//     }

//     return null
//   }

//   private calculateBBox(geometry: GeoJSON.Geometry): [number, number, number, number] {
//     let minX = Infinity
//     let minY = Infinity
//     let maxX = -Infinity
//     let maxY = -Infinity

//     const checkCoordinates = (coords: Position[]) => {
//       coords.forEach(([x, y]) => {
//         minX = Math.min(minX, x)
//         minY = Math.min(minY, y)
//         maxX = Math.max(maxX, x)
//         maxY = Math.max(maxY, y)
//       })
//     }

//     if (geometry.type === 'Polygon') {
//       geometry.coordinates.forEach(checkCoordinates)
//     } else if (geometry.type === 'MultiPolygon') {
//       geometry.coordinates.forEach(poly => poly.forEach(checkCoordinates))
//     }

//     return [minX, minY, maxX, maxY]
//   }

//   private pointInPolygon(point: Position, geometry: GeoJSON.Geometry): boolean {
//     const [x, y] = point
    
//     const checkPolygon = (coords: Position[]): boolean => {
//       let inside = false
//       for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
//         const [xi, yi] = coords[i]
//         const [xj, yj] = coords[j]
        
//         const intersect = ((yi > y) !== (yj > y)) &&
//           (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
        
//         if (intersect) inside = !inside
//       }
//       return inside
//     }

//     if (geometry.type === 'Polygon') {
//       return checkPolygon(geometry.coordinates[0])
//     } else if (geometry.type === 'MultiPolygon') {
//       return geometry.coordinates.some(poly => checkPolygon(poly[0]))
//     }

//     return false
//   }
// }

// // Export singleton instance
// export const boundaryManager = BoundaryManager.getInstance()








// // /lib/ghana-post/utils/boundaries.ts
// import RBush from 'rbush'
// import type { Position } from 'geojson'
// import { GeoJSONCollection, GeoJSONFeature } from '../geojson'

// interface BoundaryIndex {
//   minX: number
//   minY: number
//   maxX: number
//   maxY: number
//   districtCode: string
//   geometry: GeoJSON.Geometry
// }

// export class BoundaryManager {
//   private static instance: BoundaryManager
//   private tree: RBush<BoundaryIndex>
//   private boundaries: GeoJSONCollection | null = null
  
//   private constructor() {
//     this.tree = new RBush()
//   }

//   static getInstance(): BoundaryManager {
//     if (!BoundaryManager.instance) {
//       BoundaryManager.instance = new BoundaryManager()
//     }
//     return BoundaryManager.instance
//   }

//   async initialize() {
//     if (this.boundaries) return

//     try {
//       // Load district boundaries
//       const response = await fetch('/api/boundaries')
//       this.boundaries = await response.json()

//       // Build spatial index
//       const items: BoundaryIndex[] = []

//       this.boundaries?.features.forEach(feature => {
//         const bbox = this.calculateBBox(feature.geometry)
//         items.push({
//           minX: bbox[0],
//           minY: bbox[1],
//           maxX: bbox[2],
//           maxY: bbox[3],
//           districtCode: feature.properties.districtCode,
//           geometry: feature.geometry
//         })
//       })

//       this.tree.load(items)
//     } catch (error) {
//       console.error('Failed to initialize boundaries:', error)
//       throw error
//     }
//   }

//   findDistrict(latitude: number, longitude: number): GeoJSONFeature | null {
//     if (!this.boundaries) {
//       throw new Error('Boundaries not initialized')
//     }

//     // Search the R-tree index
//     const matches = this.tree.search({
//       minX: longitude,
//       minY: latitude,
//       maxX: longitude,
//       maxY: latitude
//     })

//     // Check each potential match
//     for (const match of matches) {
//       if (this.pointInPolygon([longitude, latitude], match.geometry)) {
//         const feature = this.boundaries.features.find(
//           f => f.properties.districtCode === match.districtCode
//         )
//         return feature || null
//       }
//     }

//     return null
//   }

//   private calculateBBox(geometry: GeoJSON.Geometry): [number, number, number, number] {
//     let minX = Infinity
//     let minY = Infinity
//     let maxX = -Infinity
//     let maxY = -Infinity

//     const checkCoordinates = (coords: Position[]) => {
//       coords.forEach(([x, y]) => {
//         minX = Math.min(minX, x)
//         minY = Math.min(minY, y)
//         maxX = Math.max(maxX, x)
//         maxY = Math.max(maxY, y)
//       })
//     }

//     if (geometry.type === 'Polygon') {
//       geometry.coordinates.forEach(checkCoordinates)
//     } else if (geometry.type === 'MultiPolygon') {
//       geometry.coordinates.forEach(poly => poly.forEach(checkCoordinates))
//     }

//     return [minX, minY, maxX, maxY]
//   }

//   private pointInPolygon(point: Position, geometry: GeoJSON.Geometry): boolean {
//     const [x, y] = point
    
//     const checkPolygon = (coords: Position[]): boolean => {
//       let inside = false
//       for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
//         const [xi, yi] = coords[i]
//         const [xj, yj] = coords[j]
        
//         const intersect = ((yi > y) !== (yj > y)) &&
//           (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
        
//         if (intersect) inside = !inside
//       }
//       return inside
//     }

//     if (geometry.type === 'Polygon') {
//       return checkPolygon(geometry.coordinates[0])
//     } else if (geometry.type === 'MultiPolygon') {
//       return geometry.coordinates.some(poly => checkPolygon(poly[0]))
//     }

//     return false
//   }
// }

// // Export singleton instance
// export const boundaryManager = BoundaryManager.getInstance()