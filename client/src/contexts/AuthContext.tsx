import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (token: string, userData: User) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('futurefind_user');
    const token = localStorage.getItem('futurefind_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Get the authentication token
  const getToken = () => {
    return localStorage.getItem('futurefind_token');
  };

  // Login functionality
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        profileImage: data.user.profileImage
      };

      setUser(userData);
      localStorage.setItem('futurefind_user', JSON.stringify(userData));
      localStorage.setItem('futurefind_token', data.token);

      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login functionality
  const loginWithGoogle = async (token: string, userData: User) => {
    setIsLoading(true);
    try {
      setUser(userData);
      localStorage.setItem('futurefind_user', JSON.stringify(userData));
      localStorage.setItem('futurefind_token', token);

      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error) {
      console.error('Google login failed:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Google authentication failed.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup functionality
  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Don't set user data or token after signup - user needs to login separately
      // setUser(userData);
      // localStorage.setItem('futurefind_user', JSON.stringify(userData));
      // localStorage.setItem('futurefind_token', data.token);

      toast({
        title: "Account created successfully",
        description: `Welcome to FutureFind, ${name}! Please sign in with your new account.`,
      });
    } catch (error) {
      console.error('Signup failed:', error);
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Please try again with different credentials.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout functionality
  const logout = () => {
    setUser(null);
    localStorage.removeItem('futurefind_user');
    localStorage.removeItem('futurefind_token');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    // Use window.location.href to completely reset browser state and prevent back button issues
    window.location.href = '/auth';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
