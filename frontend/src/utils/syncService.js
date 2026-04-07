// syncService.js
// Handles localStorage queue for offline transactions

export const getPendingTransactions = () => {
  const pending = localStorage.getItem('pending_transactions');
  return pending ? JSON.parse(pending) : [];
};

export const pushToPending = (transaction) => {
  const pending = getPendingTransactions();
  // Add a temporary mock ID and a timestamp so it behaves correctly in the UI
  const tempTx = { ...transaction, _id: `temp-${Date.now()}`, isOffline: true };
  pending.push(tempTx);
  localStorage.setItem('pending_transactions', JSON.stringify(pending));
  return tempTx;
};

export const clearPendingQueue = () => {
  localStorage.removeItem('pending_transactions');
};

export const removePendingTransaction = (tempId) => {
  let pending = getPendingTransactions();
  pending = pending.filter(t => t._id !== tempId);
  localStorage.setItem('pending_transactions', JSON.stringify(pending));
};
