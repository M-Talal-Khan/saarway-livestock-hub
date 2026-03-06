"use client";

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
  stationSelected: boolean;
}

interface AuthContextType extends AuthState {
  login: (name: string, type: 'buyer' | 'farm_user') => void;
  logout: () => void;
  loginAsGuest: () => void;
  farmLogin: (farmId: number, username: string, role: AppRole) => void;
  setStation: (station: StationInfo) => void;
  clearStation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleNameMap: Record<AppRole, string> = {
  'Admin': 'Muhammad Talal Khan',
  'Manager': 'Ahmed Raza',
  'Veterinarian': 'Dr. Imran Malik',
  'Accounts Officer': 'Bilal Hassan',
  'Worker': 'Farhan Ali',
};

const roleStationMap: Record<Exclude<AppRole, 'Admin'>, StationInfo> = {
  'Manager': { tag: 'A', name: 'Station 1 — Main', location: 'Kasur' },
  'Veterinarian': { tag: 'A', name: 'All Stations', location: 'Kasur' },
  'Accounts Officer': { tag: 'A', name: 'All Stations', location: 'Kasur' },
  'Worker': { tag: 'A', name: 'Station 1 — Main', location: 'Kasur' },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    userType: null,
    userName: null,
    currentFarm: null,
    currentUser: null,
    currentStation: null,
    stationSelected: false,
  });

  const login = (name: string, type: 'buyer' | 'farm_user') => {
    setAuth(prev => ({ ...prev, isLoggedIn: true, userType: type, userName: name }));
  };

  const logout = () => {
    setAuth({
      isLoggedIn: false, userType: null, userName: null,
      currentFarm: null, currentUser: null, currentStation: null,
      stationSelected: false,
    });
  };

  const loginAsGuest = () => {
    setAuth(prev => ({ ...prev, isLoggedIn: true, userType: 'buyer', userName: 'Guest User' }));
  };

  const farmLogin = (farmId: number, username: string, role: AppRole) => {
    const isAdmin = role === 'Admin';
    const station = isAdmin ? null : roleStationMap[role as Exclude<AppRole, 'Admin'>];

    setAuth({
      isLoggedIn: true,
      userType: 'farm_user',
      userName: username,
      currentFarm: { id: farmId, name: 'GRASS Farms' },
      currentUser: { username, role, fullName: roleNameMap[role] || username, station: isAdmin ? 'all' : station?.name || 'all' },
      currentStation: station,
      stationSelected: !isAdmin,
    });
  };

  const setStation = (station: StationInfo) => {
    setAuth(prev => ({ ...prev, currentStation: station, stationSelected: true }));
  };

  const clearStation = () => {
    setAuth(prev => ({ ...prev, currentStation: null, stationSelected: false }));
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, loginAsGuest, farmLogin, setStation, clearStation }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
