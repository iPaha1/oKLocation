// lib/ghana-post/utils/district-finder.ts

import { GHANA_REGIONS_DATA } from "@/lib/ghana-post/data";

export function findDistrictAndRegionCodes(districtName: string, regionName: string) {
  // Normalize input by converting to uppercase
  const normalizedDistrictName = districtName.trim().toUpperCase();
  const normalizedRegionName = regionName.trim().toUpperCase();

  // Find the region first
  const region = GHANA_REGIONS_DATA.find(r => r.name === normalizedRegionName);
  if (!region) return null;

  // Find the district within that region
  const district = region.districts.find(d => d.name.toUpperCase() === normalizedDistrictName);
  if (!district) return null;

  return {
    regionCode: region.code,
    districtCode: district.code
  };
}