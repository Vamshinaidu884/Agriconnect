const { calculateDistance } = require('./haversineService');

const hasCoordinates = (location) =>
  Number.isFinite(location?.lat) &&
  Number.isFinite(location?.lng) &&
  (location.lat !== 0 || location.lng !== 0);

function rankWithKnn(machines, { location, preferredType, targetPrice, limit = 8 }) {
  if (machines.length === 0) return [];

  const prices = machines.map((machine) => Number(machine.pricePerDay) || 0);
  const priceFloor = Math.min(...prices);
  const priceCeiling = Math.max(...prices);
  const priceRange = Math.max(priceCeiling - priceFloor, 1);
  const referencePrice = Number.isFinite(targetPrice)
    ? Math.min(Math.max(targetPrice, priceFloor), priceCeiling)
    : priceFloor;
  const typePreference = preferredType?.trim().toLowerCase();

  const candidates = machines.map((machine) => {
    const machineType = String(machine.type || '').toLowerCase();
    const distanceKm = hasCoordinates(location) && hasCoordinates(machine.location)
      ? calculateDistance(location.lat, location.lng, machine.location.lat, machine.location.lng)
      : null;
    const features = [
      distanceKm === null ? 0 : Math.min(distanceKm / 100, 1),
      Math.min(Math.max((Number(machine.rating) || 0) / 5, 0), 1),
      Math.abs((Number(machine.pricePerDay) || 0) - referencePrice) / priceRange,
      machine.available ? 0 : 1,
      typePreference && machineType !== typePreference ? 1 : 0,
    ];

    // Query vector describes a nearby, well-rated, fairly priced, available match.
    const query = [0, 1, 0, 0, 0];
    const distance = Math.sqrt(features.reduce(
      (sum, value, index) => sum + (value - query[index]) ** 2,
      0
    ));

    return { ...machine, distanceKm, knnDistance: distance };
  });

  return candidates
    .sort((a, b) => a.knnDistance - b.knnDistance || (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    .slice(0, limit)
    .map(({ knnDistance, ...machine }) => ({ ...machine, recommendationScore: Number((1 / (1 + knnDistance)).toFixed(3)) }));
}

module.exports = { rankWithKnn };
