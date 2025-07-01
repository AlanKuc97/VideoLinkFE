
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '@/lib/api/auth.api';
import { AuthTokenManager } from '@/lib/authTokenManager';
import { useToast } from '@/hooks/use-toast';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = AuthTokenManager.getAccessToken();
    if (token) {
      setIsAuthenticated(true);
      Cookies.set('authenticated', 'true', { expires: 7, path: '/' });
    } else {
      setIsAuthenticated(false);
      Cookies.remove('authenticated', { path: '/' });
    }
    setIsLoading(false);
  }, []);

  const login = async (data: any) => {
    try {
      const { access_token, refresh_token } = await loginUser(data);
      AuthTokenManager.setTokens(access_token, refresh_token);
      setIsAuthenticated(true);
      Cookies.set('authenticated', 'true', { expires: 7, path: '/' });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Please check your credentials and try again.',
      });
    }
  };

  const register = async (data: any) => {
    try {
      await registerUser(data);
      toast({
        title: 'Registration Successful',
        description: 'You can now log in with your new account.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'Please check your details and try again.',
      });
    }
  };

  const logout = () => {
    AuthTokenManager.clearTokens();
    setIsAuthenticated(false);
    Cookies.remove('authenticated', { path: '/' });
    router.push('/login');
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};
