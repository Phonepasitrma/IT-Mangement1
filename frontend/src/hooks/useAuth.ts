import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import api from '../services/api';

interface User {
  userId: number;
  employeeId: string;
  username: string;
  email: string;
  department: string;
  position?: string;
  userType: 'Admin' | 'Manager' | 'User' | 'Viewer';
  managerId?: number;
  managerName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ requirePasswordChange?: boolean } | undefined>;
  logout: () => void;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
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
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get<User>('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post<{ user: User; token: string; requirePasswordChange?: boolean }>('/auth/login', { username, password });
      
      const { user: userData, token, requirePasswordChange } = response.data;
      
      setUser(userData);
      localStorage.setItem('token', token);
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { requirePasswordChange };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    const permissions: Record<string, string[]> = {
      Admin: ['*'], // Admin has all permissions
      Manager: [
        'assets.view',
        'assets.create',
        'assets.edit',
        'assets.delete',
        'users.view',
        'reports.view',
        'config.view',
        'config.edit',
      ],
      User: [
        'assets.view',
        'assets.create',
        'reports.view',
      ],
      Viewer: [
        'assets.view',
        'reports.view',
      ],
    };

    const userPermissions = permissions[user.userType] || [];
    
    // Admin has all permissions
    if (userPermissions.includes('*')) return true;
    
    return userPermissions.includes(permission);
  };

  const isAdmin = (): boolean => {
    return user?.userType === 'Admin';
  };

  const isManager = (): boolean => {
    return user?.userType === 'Manager' || user?.userType === 'Admin';
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    hasPermission,
    isAdmin,
    isManager,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export default useAuth;
