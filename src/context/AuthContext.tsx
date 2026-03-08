"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Display-name role type — kept for backward compatibility with ERP sidebar/topbar
export type AppRole = "Admin" | "Manager" | "Veterinarian" | "Accounts Officer" | "Worker";

// ── Internal session shapes ──────────────────────────────────────────────────

interface FarmInfo {
  id: string;        // UUID
  name: string;
  number: number;
}

interface FarmUser {
  userId: string;
  username: string;
  role: AppRole;
  fullName: string;
  station: string;    // "all" for admin, station name for others
  sessionToken: string;
}

export interface StationInfo {
  id: string;        // UUID — needed for DB calls
  tag: string;
  name: string;
  location: string;  // city
}

// ── Context surface ──────────────────────────────────────────────────────────

interface AuthContextType {
  // Buyer (Supabase Auth)
  buyerUser: User | null;
  buyerLoading: boolean;

  // Farm user (custom session)
  currentFarm: FarmInfo | null;
  currentUser: FarmUser | null;
  currentStation: StationInfo | null;
  stationSelected: boolean;

  // Derived helpers
  isLoggedIn: boolean;
  userType: "buyer" | "farm_user" | null;

  // Buyer auth actions
  buyerSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  buyerSignUp: (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    city?: string
  ) => Promise<{ error: string | null }>;
  buyerSignOut: () => Promise<void>;
  buyerResetPassword: (email: string) => Promise<{ error: string | null }>;

  // Farm user auth actions
  farmLogin: (
    farmNumber: number,
    username: string,
    role: AppRole,
    password: string
  ) => Promise<{ error: string | null }>;
  logout: () => void;   // farm sign-out (name kept for ERPTopBar compatibility)

  // Station management (Admin flow)
  setStation: (station: StationInfo) => void;
  clearStation: () => void;
}

// ── Storage keys ─────────────────────────────────────────────────────────────

const FARM_SESSION_KEY = "saarway_farm_session";
const FARM_STATION_KEY = "saarway_farm_station";

// ── Provider ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();

  // Buyer state
  const [buyerUser, setBuyerUser] = useState<User | null>(null);
  const [buyerLoading, setBuyerLoading] = useState(true);

  // Farm user state
  const [currentFarm, setCurrentFarm] = useState<FarmInfo | null>(null);
  const [currentUser, setCurrentUser] = useState<FarmUser | null>(null);
  const [currentStation, setCurrentStation] = useState<StationInfo | null>(null);
  const [stationSelected, setStationSelected] = useState(false);

  // ── Restore farm session from localStorage on mount ──────────────────────
  useEffect(() => {
    const rawSession = localStorage.getItem(FARM_SESSION_KEY);
    if (rawSession) {
      try {
        const { farm, user } = JSON.parse(rawSession) as {
          farm: FarmInfo;
          user: FarmUser;
        };
        setCurrentFarm(farm);
        setCurrentUser(user);
      } catch {
        localStorage.removeItem(FARM_SESSION_KEY);
      }
    }

    const rawStation = localStorage.getItem(FARM_STATION_KEY);
    if (rawStation) {
      try {
        const station = JSON.parse(rawStation) as StationInfo;
        setCurrentStation(station);
        setStationSelected(true);
      } catch {
        localStorage.removeItem(FARM_STATION_KEY);
      }
    }
  }, []);

  // ── Supabase buyer auth listener ─────────────────────────────────────────
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Ignore super admin accounts — they use SuperAdminAuthContext
      const isSupAdmin = session?.user?.app_metadata?.role === "super_admin";
      setBuyerUser(isSupAdmin ? null : (session?.user ?? null));
      setBuyerLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Buyer actions ─────────────────────────────────────────────────────────

  const buyerSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const buyerSignUp = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    city?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone ?? null, city: city ?? null },
      },
    });
    return { error: error?.message ?? null };
  };

  const buyerSignOut = async () => {
    await supabase.auth.signOut();
  };

  const buyerResetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message ?? null };
  };

  // ── Farm user actions ─────────────────────────────────────────────────────

  const farmLogin = async (
    farmNumber: number,
    username: string,
    role: AppRole,
    password: string
  ): Promise<{ error: string | null }> => {
    const res = await fetch("/api/farm-auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmNumber, role, username, password }),
    });

    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "Login failed" };

    const farm: FarmInfo = {
      id: data.farmId,
      name: data.farmName,
      number: data.farmNumber,
    };

    const user: FarmUser = {
      userId: data.userId,
      username,
      role: data.role as AppRole,
      fullName: data.fullName,
      station: data.stationId ? "assigned" : "all",
      sessionToken: data.sessionToken,
    };

    localStorage.setItem(FARM_SESSION_KEY, JSON.stringify({ farm, user }));
    setCurrentFarm(farm);
    setCurrentUser(user);

    // Auto-set station for non-admin users who have an assigned station
    if (data.station && data.role !== "Admin") {
      const station: StationInfo = {
        id: data.station.id,
        tag: data.station.tag,
        name: data.station.name,
        location: data.station.city,
      };
      localStorage.setItem(FARM_STATION_KEY, JSON.stringify(station));
      setCurrentStation(station);
      setStationSelected(true);
    }

    return { error: null };
  };

  const logout = () => {
    localStorage.removeItem(FARM_SESSION_KEY);
    localStorage.removeItem(FARM_STATION_KEY);
    setCurrentFarm(null);
    setCurrentUser(null);
    setCurrentStation(null);
    setStationSelected(false);
  };

  // ── Station actions (Admin selects a station after login) ─────────────────

  const setStation = (station: StationInfo) => {
    localStorage.setItem(FARM_STATION_KEY, JSON.stringify(station));
    setCurrentStation(station);
    setStationSelected(true);
  };

  const clearStation = () => {
    localStorage.removeItem(FARM_STATION_KEY);
    setCurrentStation(null);
    setStationSelected(false);
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const isLoggedIn = !!buyerUser || !!currentUser;
  const userType = currentUser ? "farm_user" : buyerUser ? "buyer" : null;

  return (
    <AuthContext.Provider
      value={{
        buyerUser,
        buyerLoading,
        currentFarm,
        currentUser,
        currentStation,
        stationSelected,
        isLoggedIn,
        userType,
        buyerSignIn,
        buyerSignUp,
        buyerSignOut,
        buyerResetPassword,
        farmLogin,
        logout,
        setStation,
        clearStation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
