import { GeoJSONCollection, GeoJSONFeature, Position } from "../geojson"

// /lib/ghana-post/utils/point-in-polygon.ts
function isPointInPolygon(point: Position, polygon: Position[]): boolean {
    const [x, y] = point
    let inside = false
  
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i]
      const [xj, yj] = polygon[j]
  
      const intersect = ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
      
      if (intersect) inside = !inside
    }
  
    return inside
  }
  
  export function findDistrictForPoint(
    point: Position,
    geojsonData: GeoJSONCollection
  ): GeoJSONFeature | null {
    for (const feature of geojsonData.features) {
      if (feature.geometry.type === 'Polygon') {
        if (isPointInPolygon(point, feature.geometry.coordinates[0] as Position[])) {
          return feature
        }
      } else if (feature.geometry.type === 'MultiPolygon') {
        for (const polygon of feature.geometry.coordinates) {
          if (isPointInPolygon(point, polygon[0] as Position[])) {
            return feature
          }
        }
      }
    }
    return null
  }