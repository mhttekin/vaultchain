"use client"
import React, { useEffect, useContext, createContext, useState } from "react";
import axiosInstance from "../lib/axios";
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [authToken, setAuthToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(); 

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/api/user/profile/');
      setUser(response.data);
      return response.data
    } catch (error) {
      setAuthToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      return null;
    }
  };


  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        setAuthToken(token);
        await fetchUserProfile();
      }
      setLoading(false);
    };
    checkSession();
  }, []);

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
      const userProfile = await fetchUserProfile();
      return { 
        success: true,
        data: userProfile
      };
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
      const userProfile = await fetchUserProfile();
      return {
        success: true,
        data: userProfile
      };
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
      setUser(null);
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
      user,
      setUser,
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
