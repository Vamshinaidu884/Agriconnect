/* Distance calculation utility using Haversine formula */

export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

export function isWithinRange(userLoc, targetLoc, rangeKm) {
  const dist = calculateDistance(userLoc.lat, userLoc.lng, targetLoc.lat, targetLoc.lng);
  return dist <= rangeKm;
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km} km`;
}
