import React, { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { User } from '../types/user';
import { getCurrentUser } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For testing purposes, we'll use a mock user
    // In a real app, you would check for a valid token and fetch the user
    const mockUser: User = {
      id: 1,
      name: 'Admin User',
      role: 'Admin',
      email: 'admin@company.com'
    };
    
    setUser(mockUser);
    setLoading(false);
    
    // Uncomment the following code in a real implementation
    /*
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
    */
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // For testing purposes, we'll just set a mock user
      // In a real app, you would call the login API
      const mockUser: User = {
        id: 1,
        name: 'Admin User',
        role: 'Admin',
        email: email
      };
      
      setUser(mockUser);
      
      // Uncomment the following code in a real implementation
      /*
      const response = await login(email, password);
      setUser(response.user);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      */
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading
  };

   return React.createElement(AuthContext.Provider, { value }, children);
};
export default useAuth;