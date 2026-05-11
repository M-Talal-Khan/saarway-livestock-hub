import { Award, CheckCircle2, ShieldCheck, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { MarketplaceTrustScore } from "@/lib/marketplace-trust";

function tone(score: MarketplaceTrustScore) {
  if (score.level === "excellent") {
    return {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      bar: "bg-emerald-500",
      icon: "text-emerald-600",
    };
  }
  if (score.level === "strong") {
    return {
      badge: "border-sw-green-200 bg-sw-green-50 text-sw-green-700",
      bar: "bg-sw-green-600",
      icon: "text-sw-green-700",
    };
  }
  if (score.level === "growing") {
    return {
      badge: "border-amber-200 bg-amber-50 text-amber-700",
      bar: "bg-amber-500",
      icon: "text-amber-600",
    };
  }
  return {
    badge: "border-slate-200 bg-white/70 text-slate-700",
    bar: "bg-slate-500",
    icon: "text-slate-600",
  };
}

export function TrustScoreBadge({ trustScore }: { trustScore?: MarketplaceTrustScore | null }) {
  if (!trustScore) return null;
  const styles = tone(trustScore);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black shadow-sm ${styles.badge}`}>
      <ShieldCheck className="h-3.5 w-3.5" />
      {trustScore.score} Trust
    </span>
  );
}

export function TrustScorePanel({ trustScore }: { trustScore?: MarketplaceTrustScore | null }) {
  if (!trustScore) return null;
  const styles = tone(trustScore);
  const reasons = trustScore.reasons.length > 0 ? trustScore.reasons : ["Marketplace history is still building"];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sw-green-50/80 to-white/60 backdrop-blur-xl rounded-[2rem] p-6 border border-sw-green-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-sw-green-100/30">
      {/* Decorative background blur */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-sw-green-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-sw-green-100/50">
            <Award className={`h-6 w-6 ${styles.icon}`} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-sw-green-800/50 mb-0.5">Marketplace Trust</p>
            <h2 className="text-xl font-black text-[#050f05] tracking-tight leading-none">{trustScore.label}</h2>
            <p className="mt-1.5 text-xs text-[#050f05]/60 font-medium leading-relaxed max-w-[200px]">{trustScore.summary}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-sw-green-700 tracking-tighter">{trustScore.score}</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sw-green-800/40">out of 100</p>
        </div>
      </div>

      <Progress
        value={trustScore.score}
        className="mt-6 h-2.5 bg-sw-green-100/50 rounded-full overflow-hidden"
        indicatorClassName={`${styles.bar} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
      />

      <div className="mt-6 grid gap-2.5 sm:grid-cols-2 relative z-10">
        {reasons.map((reason) => (
          <div key={reason} className="flex items-start gap-2.5 rounded-xl bg-white/60 border border-sw-green-100/40 px-3.5 py-2.5 text-xs font-semibold text-[#050f05]/80 shadow-sm transition-all hover:bg-white hover:shadow-md">
            <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${styles.icon}`} />
            <span className="leading-tight">{reason}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-sw-green-200/50 pt-5 text-center relative z-10">
        <div className="flex flex-col justify-center">
          <p className="text-2xl font-black text-[#050f05] leading-none mb-1">{trustScore.metrics.totalListings}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sw-green-800/40">Listings</p>
        </div>
        <div className="flex flex-col justify-center border-l border-sw-green-200/50">
          <p className="text-2xl font-black text-[#050f05] leading-none mb-1">{trustScore.metrics.soldListings}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sw-green-800/40">Sold</p>
        </div>
        <div className="flex flex-col justify-center border-l border-sw-green-200/50">
          <p className="flex items-center justify-center gap-1 text-2xl font-black text-[#050f05] leading-none mb-1">
            <TrendingUp className="h-4 w-4 text-sw-green-500 mb-0.5" />{trustScore.metrics.farmTenureDays}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sw-green-800/40">Days</p>
        </div>
      </div>
    </section>
  );
}
