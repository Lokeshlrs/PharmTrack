/**
 * Calculate geographical distance in kilometers between two latitude/longitude points
 * using the Haversine formula.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return 250; // default reasonable estimate if coordinates missing
  }
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Estimate transit delivery time based on distance in km
 */
export function estimateTransitHours(distanceKm) {
  if (distanceKm <= 100) return '4 Hours';
  if (distanceKm <= 300) return '8 Hours';
  if (distanceKm <= 600) return '16 Hours';
  if (distanceKm <= 1200) return '24 Hours';
  return '48 Hours';
}
