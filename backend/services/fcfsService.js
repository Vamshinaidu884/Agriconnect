/* ============================================================
   FCFS Service — First Come First Served job acceptance logic
   ============================================================ */

/**
 * Process a worker accepting a job request (FCFS).
 * @param {object} request - Mongoose Request document
 * @param {object} user - Authenticated user (Mongoose User doc)
 * @returns {{ success: boolean, message: string }}
 */
const processAcceptance = (request, user) => {
  const userId = user._id.toString();

  // Validation checks
  if (request.status === 'completed' || request.status === 'expired') {
    return { success: false, message: 'This request is no longer available.' };
  }

  if (request.farmerId.toString() === userId) {
    return { success: false, message: 'You cannot accept your own request.' };
  }

  const alreadyAccepted = request.acceptedUsers.some(
    (u) => u.userId.toString() === userId
  );
  if (alreadyAccepted) {
    return { success: false, message: 'You have already accepted this request.' };
  }

  if (request.workersAccepted >= request.workersNeeded) {
    return { success: false, message: 'Request is full — all positions have been filled.' };
  }

  return { success: true };
};

/**
 * Process a worker withdrawing from a job request.
 * @param {object} request - Mongoose Request document
 * @param {object} user - Authenticated user
 * @returns {{ success: boolean, message: string }}
 */
const processWithdrawal = (request, user) => {
  const userId = user._id.toString();

  if (request.farmerId.toString() === userId) {
    return { success: false, message: 'Farmers cannot withdraw from their own request.' };
  }

  const isAccepted = request.acceptedUsers.some(
    (u) => u.userId.toString() === userId
  );
  if (!isAccepted) {
    return { success: false, message: 'You have not accepted this request.' };
  }

  if (request.status === 'completed') {
    return { success: false, message: 'Cannot withdraw from a completed request.' };
  }

  return { success: true };
};

/**
 * Check if a user can accept a request.
 */
const canAccept = (request, user) => {
  return processAcceptance(request, user).success;
};

module.exports = { processAcceptance, processWithdrawal, canAccept };
