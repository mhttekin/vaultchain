"use client"
import React, { useContext, createContext, useState } from "react";
import axiosInstance from "../lib/axios";

// i had this in one of my old projects, don't know the full functionality behind it, changed it for ours.
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // i ll set the user later
  // const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/token/', {
        email,
        password
      });
      const { access, refresh } = response.data;
      setAuthToken(access);
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      return response.data

    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed"
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, first_name, last_name) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/register/', {
        email,
        password,
        first_name,
        last_name,
        user_type: 'standard'
      }); 
      const { access, refresh } = response.data;
      setAuthToken(access);
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.message || "Register failed"
      }
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    setLoading(true); 
    try{
      setAuthToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return {success: true}
    } catch (error) {
      return {
        success: false,
        error: error.message || "Logout failed"
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{
      authToken,
      setAuthToken,
      login,
      logout,
      register,
      loading
    }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
