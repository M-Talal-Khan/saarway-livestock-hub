"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// ── NOTE: Super admin accounts must be created with app_metadata = {"role": "super_admin"}
// Use the Supabase dashboard SQL editor:
//   UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role":"super_admin"}'
//   WHERE email = 'admin@saarway.com';
// Then insert a row in public.super_admins (id, email, full_name).

interface SuperAdminAuth {
  isAuthenticated: boolean;
  loading: boolean;
  adminUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
}

const SuperAdminAuthContext = createContext<SuperAdminAuth | null>(null);

export const SuperAdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();

  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      // Only accept users whose app_metadata marks them as super_admin
      const isSuperAdmin = user?.app_metadata?.role === "super_admin";
      setAdminUser(isSuperAdmin ? user : null);
      setIsAuthenticated(isSuperAdmin);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { success: false, error: error.message };

    // Verify the account is marked as super_admin in app_metadata
    const isSuperAdmin = data.user?.app_metadata?.role === "super_admin";
    if (!isSuperAdmin) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Access denied. This account is not a Super Admin.",
      };
    }

    return { success: true, error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SuperAdminAuthContext.Provider
      value={{ isAuthenticated, loading, adminUser, login, logout }}
    >
      {children}
    </SuperAdminAuthContext.Provider>
  );
};

export const useSuperAdminAuth = () => {
  const ctx = useContext(SuperAdminAuthContext);
  if (!ctx)
    throw new Error("useSuperAdminAuth must be used within SuperAdminAuthProvider");
  return ctx;
};
