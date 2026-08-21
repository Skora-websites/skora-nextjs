/**
 * Calculates distance between two latitude/longitude pairs in meters using the Haversine formula.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Validates if the user's location is within the office geofence radius (default 100 meters).
 */
export function isWithinGeofence(
  userLat: number,
  userLng: number,
  officeLat: number,
  officeLng: number,
  maxRadiusMeters: number = 100
): { isWithin: boolean; distanceMeters: number } {
  const distanceMeters = calculateDistanceMeters(userLat, userLng, officeLat, officeLng);
  const isWithin = distanceMeters <= maxRadiusMeters;
  return { isWithin, distanceMeters: Math.round(distanceMeters * 10) / 10 };
}
