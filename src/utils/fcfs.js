/* FCFS Logic for ArgiMatch */

export function processAcceptance(request, userId) {
  if (request.status === 'completed' || request.status === 'expired') {
    return { success: false, message: 'This request is no longer available.' };
  }
  if (request.acceptedUsers.includes(userId)) {
    return { success: false, message: 'You have already accepted this request.' };
  }
  if (request.rejectedUsers?.includes(userId)) {
    return { success: false, message: 'This request is full.' };
  }
  if (request.farmerId === userId) {
    return { success: false, message: 'You cannot accept your own request.' };
  }
  if (request.workersAccepted >= request.workersNeeded) {
    return { success: false, message: 'Request Full — all positions filled.' };
  }

  const updated = { ...request };
  updated.acceptedUsers = [...updated.acceptedUsers, userId];
  updated.workersAccepted = updated.acceptedUsers.length;

  if (updated.workersAccepted >= updated.workersNeeded) {
    updated.status = 'active';
  }

  return { success: true, request: updated, message: 'Accepted successfully!' };
}

export function canAcceptRequest(request, userId) {
  if (!request || !userId) return false;
  if (request.farmerId === userId) return false;
  if (request.status !== 'pending') return false;
  if (request.acceptedUsers.includes(userId)) return false;
  if (request.workersAccepted >= request.workersNeeded) return false;
  return true;
}

export function getRequestStatusInfo(status) {
  const map = {
    pending: { label: 'Pending', color: 'warning', icon: '⏳' },
    active: { label: 'Active', color: 'success', icon: '✅' },
    completed: { label: 'Completed', color: 'info', icon: '🏁' },
    expired: { label: 'Expired', color: 'error', icon: '⏰' },
  };
  return map[status] || map.pending;
}
