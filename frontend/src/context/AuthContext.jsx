import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://172.20.160.201:5000/api/auth/';

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(API_URL + 'login', { email, password });
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
    }
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await axios.post(API_URL + 'register', { name, email, password });
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
    }
    return response.data;
  };

  const updateBudget = async (budget) => {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    const response = await axios.put(API_URL + 'profile', { monthlyBudget: budget }, config);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
    }
    return response.data;
  };

  const deleteAccount = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    await axios.delete(API_URL + 'profile', config);
    localStorage.removeItem('user');
    setUser(null);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateBudget, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
