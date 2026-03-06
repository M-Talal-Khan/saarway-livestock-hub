import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Factory, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth, AppRole } from '@/context/AuthContext';

const roles: AppRole[] = ['Admin', 'Manager', 'Veterinarian', 'Accounts Officer', 'Worker'];

const FarmLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [farmId, setFarmId] = useState('');
  const [role, setRole] = useState<AppRole | ''>('');
  const [username, setUsername] = useState('');
  const { farmLogin } = useAuth();
  const navigate = useNavigate();

  const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      farmLogin(Number(farmId), username, role as AppRole);
      toast({ title: 'Welcome!', description: 'Redirecting to your farm dashboard...' });
      setLoading(false);
      navigate('/erp/stations-overview');
    }, 1000);
  };

  const handleForgot = () => {
    toast({ title: 'Password Reset', description: 'Contact your Farm Admin to reset your password from the User Management panel.' });
  };

  return (
    <main className="pt-20 pb-16 bg-background min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <div className="sw-glass-card rounded-2xl p-8">
          <div className="text-center mb-6">
            <Factory className="w-12 h-12 text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-foreground">Farm Owner Login</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your credentials provided by Saarway admin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Farm ID</label>
              <input type="number" required min={1} max={999} value={farmId} onChange={e => setFarmId(e.target.value)} className={inputClass} placeholder="Your unique Farm ID (1-999)" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Role</label>
              <select required value={role} onChange={e => setRole(e.target.value as AppRole)} className={inputClass}>
                <option value="">Select your role</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Username</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className={inputClass} placeholder="Your assigned username" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required className={inputClass} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-sw-green-700 transition-colors sw-btn-glow disabled:opacity-70"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</> : 'Login to Farm Dashboard'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={handleForgot} className="text-xs text-primary hover:underline">Forgot your password?</button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FarmLogin;
