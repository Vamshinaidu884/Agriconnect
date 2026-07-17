/* ============================================================
   Haversine Service — Great-circle distance calculation
   Used for finding nearby requests based on GPS coordinates
   ============================================================ */

const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians.
 */
const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Calculate the distance between two GPS points using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers (rounded to 1 decimal)
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10;
};

/**
 * Check if a point is within a given radius.
 * @param {number} lat1 - User latitude
 * @param {number} lng1 - User longitude
 * @param {number} lat2 - Target latitude
 * @param {number} lng2 - Target longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean}
 */
const isWithinRadius = (lat1, lng1, lat2, lng2, radiusKm) => {
  return calculateDistance(lat1, lng1, lat2, lng2) <= radiusKm;
};

/**
 * Filter an array of items by proximity to a point.
 * Each item must have location.lat and location.lng.
 * @param {Array} items - Array of objects with location.lat/lng
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {number} radiusKm - Filter radius in km
 * @returns {Array} Filtered and distance-annotated items sorted by distance
 */
const filterByRadius = (items, userLat, userLng, radiusKm) => {
  return items
    .map((item) => ({
      ...item,
      distanceKm: calculateDistance(userLat, userLng, item.location.lat, item.location.lng),
    }))
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

module.exports = { calculateDistance, isWithinRadius, filterByRadius };
