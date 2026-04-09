import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';
import { getPendingTransactions, clearPendingQueue, pushToPending, removePendingTransaction } from '../utils/syncService';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/transactions/';

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [user]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const response = await axios.get(API_URL, config);
      setTransactions(response.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // Initialize Event Listener for Online Sync
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Network is back online. Syncing pending transactions...');
      await syncPendingTransactions();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user]);

  const syncPendingTransactions = async () => {
    if (!user || navigator.onLine === false) return;
    
    const pending = getPendingTransactions();
    
    if (pending.length === 0) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Upload each offline transaction
      for (const tx of pending) {
        const { _id, isOffline, ...cleanTx } = tx; // remove temporary flags
        await axios.post(API_URL, cleanTx, config);
      }
      
      clearPendingQueue(); // clear local storage
      fetchTransactions(); // fetch latest from MongoDB to refresh UI
      console.log('Successfully synced offline data to MongoDB.');
    } catch (error) {
      console.error('Failed to sync offline transactions:', error);
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      if (navigator.onLine) {
        // Send to MongoDB immediately
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const response = await axios.post(API_URL, transactionData, config);
        setTransactions([response.data, ...transactions]);
      } else {
        // We are Offline! Push to local storage
        const tempTx = pushToPending(transactionData);
        setTransactions([tempTx, ...transactions]);
        console.warn('Device offline. Saved transaction locally.');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      // If it's an offline transaction, remove from localStorage
      if (id.startsWith('temp-')) {
         removePendingTransaction(id);
         setTransactions(transactions.filter((t) => t._id !== id));
         return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.delete(API_URL + id, config);
      setTransactions(transactions.filter((t) => t._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, loading, addTransaction, deleteTransaction, fetchTransactions }}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;
