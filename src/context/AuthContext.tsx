import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AppRole = 'Admin' | 'Manager' | 'Veterinarian' | 'Accounts Officer' | 'Worker';

interface FarmInfo {
  id: number;
  name: string;
}

interface FarmUser {
  username: string;
  role: AppRole;
  fullName: string;
  station: string;
}

interface StationInfo {
  tag: string;
  name: string;
  location: string;
}

interface AuthState {
  isLoggedIn: boolean;
  userType: 'buyer' | 'farm_user' | null;
  userName: string | null;
  currentFarm: FarmInfo | null;
  currentUser: FarmUser | null;
  currentStation: StationInfo | null;
}

interface AuthContextType extends AuthState {
  login: (name: string, type: 'buyer' | 'farm_user') => void;
  logout: () => void;
  loginAsGuest: () => void;
  farmLogin: (farmId: number, username: string, role: AppRole) => void;
  setRole: (role: AppRole) => void;
  setStation: (station: StationInfo) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    userType: null,
    userName: null,
    currentFarm: null,
    currentUser: null,
    currentStation: null,
  });

  const login = (name: string, type: 'buyer' | 'farm_user') => {
    setAuth(prev => ({ ...prev, isLoggedIn: true, userType: type, userName: name }));
  };

  const logout = () => {
    setAuth({
      isLoggedIn: false, userType: null, userName: null,
      currentFarm: null, currentUser: null, currentStation: null,
    });
  };

  const loginAsGuest = () => {
    setAuth(prev => ({ ...prev, isLoggedIn: true, userType: 'buyer', userName: 'Guest User' }));
  };

  const farmLogin = (farmId: number, username: string, role: AppRole) => {
    const roleNameMap: Record<AppRole, string> = {
      'Admin': 'Muhammad Talal Khan',
      'Manager': 'Ahmed Raza',
      'Veterinarian': 'Dr. Imran Malik',
      'Accounts Officer': 'Bilal Hassan',
      'Worker': 'Farhan Ali',
    };
    setAuth({
      isLoggedIn: true,
      userType: 'farm_user',
      userName: username,
      currentFarm: { id: farmId, name: 'GRASS Farms' },
      currentUser: { username, role, fullName: roleNameMap[role] || username, station: 'all' },
      currentStation: null,
    });
  };

  const setRole = (role: AppRole) => {
    setAuth(prev => {
      if (!prev.currentUser) return prev;
      const roleNameMap: Record<AppRole, string> = {
        'Admin': 'Muhammad Talal Khan',
        'Manager': 'Ahmed Raza',
        'Veterinarian': 'Dr. Imran Malik',
        'Accounts Officer': 'Bilal Hassan',
        'Worker': 'Farhan Ali',
      };
      return {
        ...prev,
        currentUser: { ...prev.currentUser, role, fullName: roleNameMap[role] || prev.currentUser.fullName },
      };
    });
  };

  const setStation = (station: StationInfo) => {
    setAuth(prev => ({ ...prev, currentStation: station }));
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, loginAsGuest, farmLogin, setRole, setStation }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
