import { southIndianStates } from '../data/categories';

export const isValidLocation = (location) => {
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);
  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    (lat !== 0 || lng !== 0);
};

export const getStateCenter = (state) => {
  const normalizedState = String(state || '').toLowerCase();
  return southIndianStates.find(
    (entry) => [entry.id, entry.name.toLowerCase(), entry.shortName.toLowerCase()]
      .includes(normalizedState)
  )?.center || null;
};

export const getCurrentLocation = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('Geolocation is not supported.'));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const location = { lat: coords.latitude, lng: coords.longitude };
      if (isValidLocation(location)) {
        resolve(location);
      } else {
        reject(new Error('The browser returned invalid location coordinates.'));
      }
    },
    reject,
    { enableHighAccuracy: true, timeout: 8000 }
  );
});
