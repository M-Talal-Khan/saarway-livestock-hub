import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthState {
  isLoggedIn: boolean;
  userType: 'buyer' | 'farm_user' | null;
  userName: string | null;
}

interface AuthContextType extends AuthState {
  login: (name: string, type: 'buyer' | 'farm_user') => void;
  logout: () => void;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    userType: null,
    userName: null,
  });

  const login = (name: string, type: 'buyer' | 'farm_user') => {
    setAuth({ isLoggedIn: true, userType: type, userName: name });
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, userType: null, userName: null });
  };

  const loginAsGuest = () => {
    setAuth({ isLoggedIn: true, userType: 'buyer', userName: 'Guest User' });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
