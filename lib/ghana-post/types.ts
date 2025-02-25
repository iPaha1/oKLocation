// src/lib/ghana-post/types.ts
export interface District {
    code: string
    name: string
    region: string
  //   area: string
  //   postCode: string
  //   latitude: number
  //   longitude: number
  }
  
  export interface Region {
    code: string 
    name: string
    districts: District[]
  }
  
  export interface LocationResponse {
    GPSName: string
    Region: string
    District: string
    Area: string
    Street?: string
    PlaceName?: string
    postCode: string
    latitude: number
    longitude: number
  }