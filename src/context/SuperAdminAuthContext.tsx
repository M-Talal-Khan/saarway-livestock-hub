"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SuperAdminAuth {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const SuperAdminAuthContext = createContext<SuperAdminAuth | null>(null);

export const SuperAdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (email: string, _password: string) => {
    // Dummy auth — accept any non-empty credentials
    if (email && _password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAuthenticated(false);

  return (
    <SuperAdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </SuperAdminAuthContext.Provider>
  );
};

export const useSuperAdminAuth = () => {
  const ctx = useContext(SuperAdminAuthContext);
  if (!ctx) throw new Error("useSuperAdminAuth must be used within SuperAdminAuthProvider");
  return ctx;
};
