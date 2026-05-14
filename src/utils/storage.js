const STORAGE_KEYS = {
  USER: 'agrimatch_user',
  REQUESTS: 'agrimatch_requests',
  USERS: 'agrimatch_users',
  RATINGS: 'agrimatch_ratings',
};

export const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};

export { STORAGE_KEYS };
export default storage;
