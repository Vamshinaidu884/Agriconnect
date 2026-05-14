/* Helper utilities for ArgiMatch */

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

export function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getTimeSlotLabel(slot) {
  const map = {
    morning: '🌅 Morning (6AM - 12PM)',
    afternoon: '☀️ Afternoon (12PM - 6PM)',
    fullday: '📅 Full Day (6AM - 6PM)',
  };
  return map[slot] || slot;
}

export function getRoleLabel(role) {
  const map = {
    farmer: '👨‍🌾 Farmer',
    labour: '👷 Labour Worker',
    machine_owner: '🚜 Machine Owner',
  };
  return map[role] || role;
}

export function getRoleIcon(role) {
  const map = { farmer: '👨‍🌾', labour: '👷', machine_owner: '🚜' };
  return map[role] || '👤';
}

export function getStateById(states, id) {
  return states.find(s => s.id === id);
}

export function truncateText(text, maxLen = 80) {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '...';
}
