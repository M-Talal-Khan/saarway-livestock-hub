"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth, AppRole } from "@/context/AuthContext";

const roles: AppRole[] = ["Admin", "Manager", "Veterinarian", "Accounts Officer", "Worker"];

const FarmLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [farmId, setFarmId] = useState("");
  const [role, setRole] = useState<AppRole | "">("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { farmLogin } = useAuth();
  const router = useRouter();

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [forgotFarmId, setForgotFarmId] = useState("");
  const [forgotRole, setForgotRole] = useState<AppRole | "">("");
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await farmLogin(Number(farmId), username, role as AppRole, password);
    setLoading(false);

    if (error) {
      toast({ title: "Login failed", description: error, variant: "destructive" });
      return;
    }

    toast({ title: "Welcome!", description: "Redirecting to your farm dashboard..." });

    // Admin must select a station first; all other roles go straight to dashboard
    router.push(role === "Admin" ? "/erp/stations-overview" : "/erp/dashboard");
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    const res = await fetch("/api/farm-auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmNumber: forgotFarmId, username: forgotUsername, role: forgotRole }),
    });
    const data = await res.json();
    setForgotLoading(false);
    if (!res.ok) {
      toast({ title: "Request failed", description: data.error, variant: "destructive" });
      return;
    }
    setForgotSent(true);
  };

  return (
    <main className="pt-20 pb-16 sw-mesh-gradient min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-sw-blob" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-sw-blob" style={{ animationDelay: "-3s" }} />

      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="sw-glass-premium rounded-3xl p-8 shadow-2xl">

          {/* ── Forgot Password View ── */}
          {showForgot ? (
            <>
              <div className="text-center mb-6">
                <Image src="/images/logo-icon-v2.png" alt="Saarway" width={56} height={56} className="mx-auto mb-3" />
                <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
                <p className="text-sm text-muted-foreground mt-1">We'll notify the super admin to send you new credentials</p>
              </div>

              {forgotSent ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                  <p className="font-semibold text-foreground">Request sent!</p>
                  <p className="text-sm text-muted-foreground">
                    The Saarway super admin will reset your password and share the new credentials with you shortly.
                  </p>
                  <button
                    onClick={() => { setShowForgot(false); setForgotSent(false); setForgotFarmId(""); setForgotUsername(""); setForgotRole(""); }}
                    className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Farm ID</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={forgotFarmId}
                      onChange={(e) => setForgotFarmId(e.target.value)}
                      className={inputClass}
                      placeholder="Your unique Farm ID"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Role</label>
                    <select
                      required
                      value={forgotRole}
                      onChange={(e) => setForgotRole(e.target.value as AppRole)}
                      className={inputClass}
                    >
                      <option value="">Select your role</option>
                      {roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Username</label>
                    <input
                      type="text"
                      required
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      className={inputClass}
                      placeholder="Your assigned username"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-sw-green-700 transition-all sw-btn-glow sw-ripple shadow-lg disabled:opacity-70"
                  >
                    {forgotLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : "Send Reset Request"}
                  </button>
                  <div className="text-center">
                    <button type="button" onClick={() => setShowForgot(false)} className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto">
                      <ArrowLeft className="w-3 h-3" /> Back to login
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* ── Login View ── */
            <>
              <div className="text-center mb-6">
                <Image src="/images/logo-icon-v2.png" alt="Saarway" width={56} height={56} className="mx-auto mb-3" />
                <h1 className="text-2xl font-bold text-foreground">Farm Owner Login</h1>
                <p className="text-sm text-muted-foreground mt-1">Enter your credentials provided by Saarway admin</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Farm ID</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={999}
                    value={farmId}
                    onChange={(e) => setFarmId(e.target.value)}
                    className={inputClass}
                    placeholder="Your unique Farm ID (1–999)"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Role</label>
                  <select
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value as AppRole)}
                    className={inputClass}
                  >
                    <option value="">Select your role</option>
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputClass}
                    placeholder="Your assigned username"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-sw-green-700 transition-all sw-btn-glow sw-ripple shadow-lg disabled:opacity-70"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Logging in...</>
                  ) : (
                    "Login to Farm Dashboard"
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    if (role === "Admin") {
                      setForgotFarmId(farmId);
                      setForgotRole("Admin");
                      setForgotUsername(username);
                      setShowForgot(true);
                    } else {
                      setShowContactModal(true);
                    }
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── Contact Admin Modal ── */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl relative bg-card border border-border">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center gap-3 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <p className="font-semibold text-foreground">Password Reset</p>
              <p className="text-sm text-muted-foreground">
                Please contact your farm admin. They can reset your password directly from the User Management panel.
              </p>
              <button
                onClick={() => setShowContactModal(false)}
                className="mt-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-sw-green-700 transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default FarmLogin;
