"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSuperAdminAuth } from "@/context/SuperAdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useSuperAdminAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      router.push("/super-admin/dashboard");
    } else {
      toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
    }
  };

  const handleForgotPassword = () => {
    toast({ title: "Password reset email sent", description: "Check your inbox for further instructions." });
  };

  return (
    <div className="min-h-screen bg-sw-admin-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/images/logo-icon-v2.png" alt="Saarway" width={56} height={56} className="mx-auto mb-3 brightness-0 invert" />
          <h1 className="text-3xl font-bold text-white tracking-tight">SAARWAY</h1>
          <p className="text-sw-admin-blue mt-1">Super Admin</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-5"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@saarway.com"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:border-sw-admin-green focus-visible:ring-sw-admin-green/20"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:border-sw-admin-green focus-visible:ring-sw-admin-green/20"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-sw-admin-green text-sw-admin-bg font-semibold hover:bg-sw-admin-green/90 hover:scale-[1.02] transition-all"
          >
            Login
          </Button>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full text-sm text-sw-admin-blue hover:text-white transition-colors"
          >
            Forgot Password?
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
