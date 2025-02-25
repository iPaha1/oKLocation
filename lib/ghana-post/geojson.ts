// /lib/ghana-post/types/geojson.ts
export type Position = [number, number]

export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon'
  coordinates: Position[][] | Position[][][]
}

export interface GeoJSONFeature {
  type: 'Feature'
  properties: {
    districtCode: string
    districtName: string
    regionCode: string
    regionName: string
  }
  geometry: GeoJSONGeometry
}

export interface GeoJSONCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}