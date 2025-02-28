// utils/location-utils.ts

// Calculate if a point is within a certain radius of another point
export function isWithinRadius(
    point1: { latitude: number; longitude: number } | { lat: number; lng: number },
    point2: { latitude: number; longitude: number } | { lat: number; lng: number },
    radiusInMeters: number
  ): boolean {
    // Normalize coordinates to use latitude/longitude naming
    const lat1 = 'lat' in point1 ? point1.lat : point1.latitude;
    const lng1 = 'lng' in point1 ? point1.lng : point1.longitude;
    const lat2 = 'lat' in point2 ? point2.lat : point2.latitude;
    const lng2 = 'lng' in point2 ? point2.lng : point2.longitude;
  
    // Haversine formula to calculate distance between two points
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
  
    return distance <= radiusInMeters;
  }
  
  // Format coordinates to 6 decimal places
  export function formatCoordinates(
    coordinates: { latitude: number; longitude: number } | { lat: number; lng: number }
  ): string {
    const lat = 'lat' in coordinates ? coordinates.lat : coordinates.latitude;
    const lng = 'lng' in coordinates ? coordinates.lng : coordinates.longitude;
    
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
  
  // Calculate distance between two points in kilometers
  export function calculateDistance(
    point1: { latitude: number; longitude: number } | { lat: number; lng: number },
    point2: { latitude: number; longitude: number } | { lat: number; lng: number }
  ): number {
    // Normalize coordinates
    const lat1 = 'lat' in point1 ? point1.lat : point1.latitude;
    const lng1 = 'lng' in point1 ? point1.lng : point1.longitude;
    const lat2 = 'lat' in point2 ? point2.lat : point2.latitude;
    const lng2 = 'lng' in point2 ? point2.lng : point2.longitude;
  
    // Haversine formula
    const R = 6371; // Earth's radius in kilometers
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }