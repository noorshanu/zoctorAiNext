"use client";
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { refreshAccessToken, logoutUser } from './utils/api';
import Loader from "./components/Loader";

export const AuthContext = React.createContext(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = tokenData.exp * 1000;
          
          if (Date.now() >= expirationTime) {
            refreshAccessToken()
              .then(response => {
                if (response.status) {
                  localStorage.setItem('accessToken', response.accessToken);
                  setIsAuthenticated(true);
                } else {
                  throw new Error('Token refresh failed');
                }
              })
              .catch(() => {
                localStorage.removeItem('accessToken');
                setIsAuthenticated(false);
              });
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          localStorage.removeItem('accessToken');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('firstName', userData.firstName);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('firstName');
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const refreshToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = tokenData.exp * 1000;
          
          if (Date.now() + 300000 >= expirationTime) {
            const response = await refreshAccessToken();
            if (response.status) {
              localStorage.setItem('accessToken', response.accessToken);
            }
          }
        } catch (error) {
          console.error('Token refresh error:', error);
        }
      }
    };

    const interval = setInterval(refreshToken, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <Loader />;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;