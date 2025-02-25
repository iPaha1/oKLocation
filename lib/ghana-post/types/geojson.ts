// /lib/ghana-post/types/geojson.ts
export interface GeoJSONGeometry {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
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