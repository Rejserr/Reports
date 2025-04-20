import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  username?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;  // Ovo svojstvo mora postojati
  loading: boolean;
}
const defaultValue: AuthContextType = {
  user: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  loading: true
};

const AuthContext = createContext<AuthContextType>(defaultValue);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('auth_user');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem('auth_user');
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const validCredentials = [
        { email: 'admin@example.com', password: 'admin' },
        { email: 'user@example.com', password: 'user' }
      ];
      
      const isValidCredentials = validCredentials.some(
        cred => cred.email === email && cred.password === password
      );
      
      if (isValidCredentials) {
        const userData: User = {
          id: '1',
          name: email === 'admin@example.com' ? 'Administrator' : 'Demo User',
          email,
          role: email === 'admin@example.com' ? 'admin' : 'user',
          username: email.split('@')[0]
        };
        
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('auth_user');
    setUser(null);
    setIsAuthenticated(false);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };