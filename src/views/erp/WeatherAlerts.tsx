"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, CloudSun, AlertTriangle, Thermometer, Droplets, Wind, Plus, Check, Bell, Settings, MapPin, Search, Eye, Gauge, Sun, CloudRain, Activity, TrendingUp, TrendingDown, Newspaper, Info, Heart, Sprout, AlertCircle, Clock, Umbrella, ArrowRight, Sparkles, ShieldCheck, Lock, Waves } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WeatherAlert {
  id: string;
  alert_type: "heatwave" | "flood" | "cold_snap" | "heavy_rain" | "storm" | "drought";
  severity: "warning" | "severe" | "critical";
  temperature_c: number | null;
  humidity: number | null;
  description: string;
  recommendation: string | null;
  is_acknowledged: boolean;
  source: string;
  created_at: string;
  stations: { station_name: string } | null;
}

interface CurrentWeather {
  city: string;
  area: string;
  country: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  description: string;
  wind_speed: number;
  visibility: number;
  pressure: number;
  uv_index: number;
  precipitation: number;
  alert_triggered: boolean;
  alerts: string[];
}

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  description: string;
  chanceOfRain: number;
  humidity: number;
}

interface WeatherData {
  weather: CurrentWeather;
  forecast: ForecastDay[];
  source: string;
}

interface WeatherSettings {
  city: string;
  area: string;
  heat_alert_threshold: number;
  cold_alert_threshold: number;
  enabled: boolean;
}

interface NewsItem {
  category: string;
  title: string;
  summary: string;
  time: string;
  source?: string;
}

// Pre-built cities and areas for Pakistan
const PAKISTAN_LOCATIONS = [
  { city: "Lahore", areas: ["Allama Iqbal Town", "Bahria Town", "Cantt", "DHA", "Gulberg", "Johar Town", "Model Town", "Shalimar", "Wagah"] },
  { city: "Karachi", areas: ["Clifton", "DHA", "Gulshan-e-Iqbal", "Gulistan-e-Jauhar", "Jamshoro", "Korangi", "Landhi", "Lyari", "Saddar", "Shah Faisal", "Scheme 33"] },
  { city: "Faisalabad", areas: ["Dijkot", "Jaranwala", "Lyallpur", "Madina Town", "Millat Chowk", "Railway Road", "Samaana", "Sultan Colony"] },
  { city: "Rawalpindi", areas: ["Adiala Road", "Bahra Kahu", "Cantonment", "Chaklala", "DHQ Hospital", "F-6", "Gulshan-e-Sadiq", "Lahore Gate", "Murree Road", "Saddar"] },
  { city: "Multan", areas: ["Bosan", "Cantt", "Chauburji", "Ghanti Ghar", "Khanewal Road", "Laar", "Mandi Bahauddin Road", "Nawabpur", "Old Bus Stand"] },
  { city: "Peshawar", areas: ["Ashrafia", "Cantt", "Dabgari Garden", "Fighterabad", "Hayatabad", "Kohat Road", "Namak Mandi", "Shah Plaza", "University Road"] },
  { city: "Quetta", areas: ["Brewery Road", "Cantt", "Chiltan", "Jinnah Road", "Killi", "Loralai Bazaar", "Mehmood Kai Road", "Pasni Road", "Sariab Road"] },
  { city: "Sialkot", areas: ["Cantt", "Chaprar", "Dalair", "Daska Road", "Khadim Ali Road", "Marala", "Pasrur Road", "Rehmatian", "Shahabpura"] },
  { city: "Islamabad", areas: ["Bhara Kahu", "Blue Area", "D-12", "E-7", "F-6", "F-7", "F-10", "G-6", "G-7", "G-10", "G-11", "G-13", "H-8", "H-11", "I-8", "I-10", "PWD", "Satellite Town"] },
  { city: "Gujranwala", areas: ["Ali Pur Chattha", "Cantonment", "Civil Lines", "Kamoki", "Mandiala", "Muridke", "Naushera Virkan", "Qasoor", "Wazirabad"] },
  { city: "Sargodha", areas: ["Bhera", "Khanqah", "Mitha Tiwana", "Quaidabad", "Sahiwal", "Shorkot", "Taragarh"] },
  { city: "Bahawalpur", areas: ["Cantt", "Dijkot", "Farid Town", "Hasilpur", "Model Town", "Zia-ul-Haq"] },
];

const ALERT_ICONS: Record<string, React.ElementType> = {
  heatwave: Thermometer,
  flood: Droplets,
  cold_snap: CloudSun,
  heavy_rain: Droplets,
  storm: Wind,
  drought: CloudSun,
};

const SEVERITY_COLORS: Record<string, { bg: string; badge: string; icon: string }> = {
  warning: { bg: "bg-sw-gold-100", badge: "bg-sw-gold-100 text-yellow-700 border-yellow-200", icon: "text-sw-gold-500" },
  severe: { bg: "bg-orange-50", badge: "bg-orange-50 text-orange-700 border-orange-200", icon: "text-orange-600" },
  critical: { bg: "bg-sw-gold-100", badge: "bg-sw-gold-100 text-yellow-700 border-yellow-200", icon: "text-sw-gold-500" },
};

const formatAlertType = (type: string) => {
  return type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (dateStr === "Today" || date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric" });
};
const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/90 border border-white/70 shadow-sm">
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sw-green-100 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
      <p className="text-lg sm:text-xl font-bold text-foreground mt-0.5">{value}</p>
    </div>
  </div>
);

// ── Threshold Card Component ────────────────────────────────────────────────────
const ThresholdCard = ({ type, value, currentTemp, canManage }: { type: "heat" | "cold"; value: number; currentTemp: number; canManage: boolean }) => {
  const isExceeded = type === "heat" ? currentTemp >= value : currentTemp <= value;
  const delta = Math.abs(currentTemp - value);

  return (
  <div className={`relative overflow-hidden rounded-xl p-4 border bg-white shadow-sm transition-all ${
    isExceeded
      ? type === "heat"
        ? "border-amber-200"
        : "border-sky-200"
      : "border-sw-green-100"
  }`}>
    <div className={`absolute inset-x-0 top-0 h-1 ${
      isExceeded ? (type === "heat" ? "bg-amber-400" : "bg-sky-400") : "bg-sw-green-500"
    }`} />
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isExceeded
            ? type === "heat"
              ? "bg-sw-gold-100"
              : "bg-sw-sky-100"
            : "bg-sw-green-100"
        }`}>
          {type === "heat" ? (
            <TrendingUp className={`h-5 w-5 ${isExceeded ? "text-sw-gold-500" : "text-primary"}`} />
          ) : (
            <TrendingDown className={`h-5 w-5 ${isExceeded ? "text-sw-sky-500" : "text-primary"}`} />
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{type === "heat" ? "Heat" : "Cold"} Threshold</p>
          <p className={`text-2xl font-bold text-foreground mt-0.5 ${isExceeded ? (type === "heat" ? "text-sw-gold-600" : "text-sw-sky-600") : ""}`}>{value}°C</p>
        </div>
      </div>
      <Badge variant="outline" className={`text-xs ${isExceeded ? (type === "heat" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-sky-50 text-sky-700 border-sky-200") : "bg-sw-green-50 text-sw-green-700 border-sw-green-200"}`}>
        {isExceeded ? "Active" : `${delta}Â° away`}
      </Badge>
    </div>
    <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
      <span>{type === "heat" ? "Triggers high-temperature advisories" : "Triggers cold-weather advisories"}</span>
      <span className="inline-flex items-center gap-1 font-medium text-sw-green-800">
        {canManage ? <ShieldCheck className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
        {canManage ? "Editable" : "Admin/Manager"}
      </span>
    </div>
  </div>
  );
};

// ── Forecast Widget Component ───────────────────────────────────────────────────
const ForecastWidget = ({ day }: { day: ForecastDay }) => {
  const WeatherIcon = day.chanceOfRain > 50 ? CloudRain : Sun;

  return (
    <div className="rounded-xl p-4 border border-sw-green-100 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">
          {formatDate(day.date)}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sw-green-100 flex items-center justify-center">
            <WeatherIcon className={`h-5 w-5 ${day.chanceOfRain > 50 ? "text-sw-sky-400" : "text-sw-gold-400"}`} />
          </div>
          <div>
            <p className="text-sm capitalize font-medium text-foreground">{day.description}</p>
            <p className="text-xs text-muted-foreground">{day.chanceOfRain}% rain</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-lg font-bold text-foreground">{day.maxTemp}°</p>
            <p className="text-xs text-muted-foreground">High</p>
          </div>
          <div className="w-px h-6 bg-border" />
          <div>
            <p className="text-lg font-semibold text-muted-foreground">{day.minTemp}°</p>
            <p className="text-xs text-muted-foreground">Low</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Droplets className="h-3 w-3" />
          <span>{day.humidity}%</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CloudRain className="h-3 w-3" />
          <span>{day.chanceOfRain}%</span>
        </div>
      </div>
    </div>
  );
};

// ── News Item Component ────────────────────────────────────────────────────────
const NewsItem = ({ news }: { news: NewsItem }) => {
  const CategoryIcon = news.category === "Emergency" || news.category === "Flood" ? AlertTriangle :
                       news.category === "Warning" || news.category === "Alert" ? AlertCircle :
                       news.category === "Advisory" ? Info :
                       news.category === "Health" ? Activity :
                       news.category === "Market" ? TrendingUp : Sprout;

  const categoryColors: Record<string, string> = {
    Emergency: "bg-sw-green-100 text-sw-green-700",
    Flood: "bg-sw-green-100 text-sw-green-700",
    Warning: "bg-sw-gold-100 text-yellow-700",
    Alert: "bg-sw-gold-100 text-yellow-700",
    Advisory: "bg-sw-sky-100 text-sw-sky-700",
    Health: "bg-sw-green-100 text-sw-green-700",
    Market: "bg-sw-sky-100 text-sw-sky-700",
    Update: "bg-sw-green-100 text-sw-green-700",
    News: "bg-sw-green-100 text-sw-green-700",
    Tip: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-sw-green-50/50 hover:bg-sw-green-100/50 transition-colors border border-transparent hover:border-sw-green-200">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        news.category === "Warning" || news.category === "Alert" ? "bg-sw-gold-100" :
        news.category === "Advisory" || news.category === "Market" ? "bg-sw-sky-100" : "bg-sw-green-100"
      }`}>
        <CategoryIcon className={`h-5 w-5 ${
          news.category === "Warning" || news.category === "Alert" ? "text-sw-gold-500" :
          news.category === "Advisory" ? "text-sw-sky-500" : "text-primary"
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[news.category]}`}>
            {news.category}
          </span>
          <span className="text-xs text-muted-foreground">{news.time}</span>
        </div>
        <h4 className="text-sm font-medium text-foreground leading-tight">{news.title}</h4>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{news.summary}</p>
        {news.source && (
          <span className="inline-block mt-1.5 text-[10px] text-muted-foreground/60 bg-sw-green-50 px-1.5 py-0.5 rounded">
            {news.source}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Impact Card Component ────────────────────────────────────────────────────────
const ImpactCard = ({ icon: Icon, label, value, status }: { icon: React.ElementType; label: string; value: string; status: "safe" | "warning" | "danger" }) => {
  const statusColors = {
    safe: { bg: "bg-sw-green-100", text: "text-sw-green-700", icon: "text-primary" },
    warning: { bg: "bg-sw-gold-100", text: "text-yellow-700", icon: "text-sw-gold-500" },
    danger: { bg: "bg-red-100", text: "text-red-700", icon: "text-red-600" },
  };
  const colors = statusColors[status];

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-sw-green-100 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}>
        <Icon className={`h-5 w-5 ${colors.icon}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-base font-semibold ${colors.text}`}>{value}</p>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const WeatherAlerts = () => {
  const { currentUser, currentStation } = useAuth();
  const token = currentUser?.sessionToken ?? "";
  const canManageSettings = ["admin", "manager"].includes(currentUser?.role?.toLowerCase() ?? "");
  const canManageAlerts = canManageSettings;

  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [weatherSource, setWeatherSource] = useState<string>("");
  const [settings, setSettings] = useState<WeatherSettings | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsSource, setNewsSource] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const [thresholdErrors, setThresholdErrors] = useState<{ heat?: string; cold?: string }>({});

  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    city: "Lahore",
    area: "Allama Iqbal Town",
    heat_alert_threshold: "40",
    cold_alert_threshold: "5",
    enabled: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentCityAreas = PAKISTAN_LOCATIONS.find(l => l.city === settingsForm.city)?.areas || [];

  const filteredLocations = searchQuery
    ? PAKISTAN_LOCATIONS.filter(l =>
        l.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.areas.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
      ).map(l => ({
        ...l,
        areas: l.areas.filter(a => a.toLowerCase().includes(searchQuery.toLowerCase())),
      })).filter(l => l.city.toLowerCase().includes(searchQuery.toLowerCase()) || l.areas.length > 0)
    : PAKISTAN_LOCATIONS;

  const [addAlert, setAddAlert] = useState(false);
  const [alertForm, setAlertForm] = useState({
    alert_type: "heatwave",
    severity: "warning",
    temperature_c: "",
    humidity: "",
    description: "",
    recommendation: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/weather/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setSettingsForm({
          city: data.settings.city || "Lahore",
          area: data.settings.area || "Allama Iqbal Town",
          heat_alert_threshold: String(data.settings.heat_alert_threshold),
          cold_alert_threshold: String(data.settings.cold_alert_threshold),
          enabled: data.settings.enabled,
        });
      }
    } catch {
      // silent fail
    }
  }, [token]);

  const fetchAlerts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/weather/alerts?acknowledged=false", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts ?? []);
      }
    } catch {
      // silent fail
    }
  }, [token]);

  const fetchWeather = useCallback(async () => {
    setWeatherLoading(true);
    try {
      // Try authenticated endpoint first
      if (token) {
        const res = await fetch("/api/weather/current", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: WeatherData = await res.json();
          if (data.weather) {
            setWeather(data.weather);
            setForecast(data.forecast || []);
            setWeatherSource(data.source || "");
            setWeatherLoading(false);
            return;
          }
        }
      }
      // Fallback to demo mode if auth fails
      const demoRes = await fetch("/api/weather/current?demo=true");
      if (demoRes.ok) {
        const data: WeatherData = await demoRes.json();
        if (data.weather) {
          setWeather(data.weather);
          setForecast(data.forecast || []);
          setWeatherSource(data.source + " (demo)" || "demo");
        }
      }
    } catch {
      // Last resort: try demo
      try {
        const demoRes = await fetch("/api/weather/current?demo=true");
        if (demoRes.ok) {
          const data: WeatherData = await demoRes.json();
          if (data.weather) {
            setWeather(data.weather);
            setForecast(data.forecast || []);
            setWeatherSource("demo");
          }
        }
      } catch { /* silent */ }
    } finally {
      setWeatherLoading(false);
    }
  }, [token]);

  const fetchNews = useCallback(async () => {
    if (!weather) return;
    try {
      const res = await fetch(
        `/api/weather/news?temp=${weather.temperature}&desc=${encodeURIComponent(weather.description)}`
      );
      if (res.ok) {
        const data = await res.json();
        setNewsItems(data.news || []);
        setNewsSource(data.source || "");
      }
    } catch {
      // silent fail
    }
  }, [weather]);

  useEffect(() => {
    if (token) {
      setLoading(false);
      fetchSettings();
      fetchAlerts();
    }
    fetchWeather();
  }, [token, fetchSettings, fetchAlerts, fetchWeather]);

  useEffect(() => {
    if (weather) {
      fetchNews();
    }
  }, [weather, fetchNews]);

  const validateThresholds = (): boolean => {
    const errors: { heat?: string; cold?: string } = {};
    const heatVal = parseFloat(settingsForm.heat_alert_threshold);
    const coldVal = parseFloat(settingsForm.cold_alert_threshold);

    if (isNaN(heatVal) || heatVal < 20 || heatVal > 60) {
      errors.heat = "Must be 20-60°C";
    }
    if (isNaN(coldVal) || coldVal < -10 || coldVal > 20) {
      errors.cold = "Must be -10°C to 20°C";
    }
    if (!isNaN(heatVal) && !isNaN(coldVal) && heatVal <= coldVal) {
      errors.heat = "Heat > Cold required";
    }

    setThresholdErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSettings = async () => {
    if (!canManageSettings) {
      toast({
        title: "Permission required",
        description: "Only Admin and Manager users can change weather thresholds.",
        variant: "destructive",
      });
      return;
    }
    if (!validateThresholds()) {
      toast({ title: "Invalid Settings", description: "Please fix the errors.", variant: "destructive" });
      return;
    }
    setSavingSettings(true);
    try {
      const payload = {
        city: settingsForm.city,
        area: settingsForm.area,
        heat_alert_threshold: Number(settingsForm.heat_alert_threshold),
        cold_alert_threshold: Number(settingsForm.cold_alert_threshold),
        enabled: settingsForm.enabled,
      };
      const res = await fetch("/api/weather/settings", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
        toast({ title: "Settings saved" });
        setShowSettings(false);
        setThresholdErrors({});
        await fetchWeather();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast({
          title: "Save failed",
          description: errData.error || `Server returned ${res.status}`,
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      const res = await fetch("/api/weather/alerts", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ alert_id: alertId, action: "acknowledge" }),
      });
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        toast({ title: "Alert acknowledged" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to acknowledge", variant: "destructive" });
    }
  };

  const handleAddAlert = async () => {
    if (!alertForm.description || !alertForm.alert_type || !alertForm.severity) {
      toast({ title: "Error", description: "Fill required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/weather/alerts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_type: alertForm.alert_type,
          severity: alertForm.severity,
          temperature_c: alertForm.temperature_c ? Number(alertForm.temperature_c) : null,
          humidity: alertForm.humidity ? Number(alertForm.humidity) : null,
          description: alertForm.description,
          recommendation: alertForm.recommendation || null,
          station_id: currentStation?.id || null,
        }),
      });
      if (res.ok) {
        toast({ title: "Alert created" });
        setAddAlert(false);
        setAlertForm({ alert_type: "heatwave", severity: "warning", temperature_c: "", humidity: "", description: "", recommendation: "" });
        await fetchAlerts();
      }
    } catch {
      toast({ title: "Error", description: "Failed to create alert", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const unreadCount = alerts.filter(a => !a.is_acknowledged).length;

  const getWeatherNews = () => {
    if (newsItems.length > 0) return newsItems;
    if (!weather) return [];
    const temp = weather.temperature;
    if (temp >= 38) return [{ category: "Advisory", title: "Heatwave Alert", summary: "Temperature expected to reach 45°C. Provide extra shade and water for livestock.", time: "2h ago" }];
    if (temp <= 5) return [{ category: "Warning", title: "Cold Wave Alert", summary: "Temperature dropping to freezing. Move calves to heated shelter.", time: "1h ago" }];
    if (weather.description.toLowerCase().includes("rain")) return [{ category: "Alert", title: "Heavy Rain Advisory", summary: "Secure feed stocks and clear drainage.", time: "1h ago" }];
    return [{ category: "Update", title: "Favorable Weather", summary: "This week's conditions are optimal for grazing and farm work.", time: "Now" }];
  };

  const getTempStatus = () => {
    if (!weather || !settings) return null;
    const heatThreshold = settings.heat_alert_threshold;
    const coldThreshold = settings.cold_alert_threshold;
    const temp = weather.temperature;

    if (temp >= heatThreshold) {
      return { type: "heat" as const, level: "high" as const };
    }
    if (temp >= heatThreshold - 3) {
      return { type: "heat" as const, level: "medium" as const };
    }
    if (temp <= coldThreshold) {
      return { type: "cold" as const, level: "high" as const };
    }
    if (temp <= coldThreshold + 3) {
      return { type: "cold" as const, level: "medium" as const };
    }
    return null;
  };

  const getLivestockImpact = () => {
    if (!weather) return null;
    return {
      heatStress: weather.temperature >= 40 ? "warning" : weather.temperature >= 35 ? "warning" : "safe",
      uvExposure: weather.uv_index >= 8 ? "warning" : weather.uv_index >= 5 ? "warning" : "safe",
      feedingTime: weather.temperature >= 35 ? "Early/Late" : "Normal",
      waterCheck: weather.humidity < 30 ? "Extra Often" : "Regular",
    };
  };

  if (loading && !weather) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sw-green-100 flex items-center justify-center">
            <CloudSun className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Weather Alerts</h1>
            <p className="text-sm text-muted-foreground">Monitor conditions for livestock safety</p>
          </div>
        </div>
        {canManageAlerts && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setShowSettings(true)} className="gap-2 bg-white flex-1 sm:flex-none">
              <Settings className="h-4 w-4" /> Settings
            </Button>
            <Button onClick={() => setAddAlert(true)} className="gap-2 flex-1 sm:flex-none">
              <Plus className="h-4 w-4" /> Add Alert
            </Button>
          </div>
        )}
        {!canManageSettings && (
          <Badge variant="outline" className="bg-white text-sw-green-800 border-sw-green-200">
            <Lock className="mr-1 h-3 w-3" />
            Thresholds managed by Admin/Manager
          </Badge>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Weather Card */}
          {weatherLoading ? (
            <Card className="erp-glass-card"><CardContent className="p-6 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></CardContent></Card>
          ) : weather ? (
            <>
              <Card className={`overflow-hidden border-0 shadow-[0_18px_50px_-22px_rgba(24,100,45,0.45)] animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both ${getTempStatus()?.level === "high" ? "ring-1 ring-amber-300" : ""}`}>
                {/* Status Indicator */}
                <div className={`px-4 py-3 border-b flex items-center gap-2 ${
                  getTempStatus()?.level === "high"
                    ? "bg-sw-gold-50 border-sw-gold-200"
                    : getTempStatus()?.level === "medium"
                      ? "bg-sw-gold-50/50 border-sw-gold-100"
                      : "bg-sw-green-50 border-sw-green-100"
                }`}>
                  {getTempStatus()?.level === "high" ? (
                    <>
                      <AlertTriangle className={`h-4 w-4 ${getTempStatus()?.type === "heat" ? "text-sw-gold-500" : "text-sw-sky-500"}`} />
                      <span className={`text-sm font-medium ${getTempStatus()?.type === "heat" ? "text-sw-gold-700" : "text-sw-sky-700"}`}>
                        {getTempStatus()?.type === "heat" ? "Heat" : "Cold"} Alert Active
                      </span>
                    </>
                  ) : getTempStatus()?.level === "medium" ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-sw-gold-500" />
                      <span className="text-sm font-medium text-sw-gold-700">Approaching Threshold</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Conditions Normal</span>
                    </>
                  )}
                  <Badge variant="outline" className="ml-auto text-xs">{weatherSource}</Badge>
                </div>

                {/* Weather Content */}
                <CardContent className="bg-gradient-to-br from-white via-sw-green-50/70 to-sw-sky-400/10 p-5">
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Temperature */}
                    <div className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sw-green-500 to-sw-sky-400 flex items-center justify-center text-white shadow-lg">
                        {weather.precipitation > 0 || weather.description.toLowerCase().includes("rain") ? (
                          <CloudRain className="h-10 w-10" />
                        ) : weather.wind_speed >= 30 ? (
                          <Wind className="h-10 w-10" />
                        ) : (
                          <CloudSun className="h-10 w-10" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{settings?.area || weather.area || weather.city}, {settings?.city || weather.city}</span>
                        </div>
                        <p className="text-4xl font-bold text-foreground mt-0.5">{weather.temperature}°</p>
                        <p className="text-sm text-muted-foreground capitalize mt-0.5">{weather.description}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4">
                      <StatCard icon={Thermometer} label="Feels Like" value={`${weather.feels_like}°C`} />
                      <StatCard icon={Droplets} label="Humidity" value={`${weather.humidity}%`} />
                      <StatCard icon={Wind} label="Wind" value={`${weather.wind_speed} km/h`} />
                      <StatCard icon={Eye} label="Visibility" value={`${weather.visibility} km`} />
                    </div>
                  </div>

                  {/* Secondary Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/80">
                    <div className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-muted-foreground">
                      <Gauge className="h-4 w-4" />
                      <span>Pressure: <strong className="text-foreground">{weather.pressure} hPa</strong></span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-muted-foreground">
                      <Sun className="h-4 w-4" />
                      <span>UV Index: <strong className="text-foreground">{weather.uv_index}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-muted-foreground">
                      <CloudRain className="h-4 w-4" />
                      <span>Precipitation: <strong className="text-foreground">{weather.precipitation} mm</strong></span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Threshold Cards */}
              {settings && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-150">
                  <ThresholdCard type="heat" value={settings.heat_alert_threshold} currentTemp={weather.temperature} canManage={canManageSettings} />
                  <ThresholdCard type="cold" value={settings.cold_alert_threshold} currentTemp={weather.temperature} canManage={canManageSettings} />
                </div>
              )}

              {/* 3-Day Forecast */}
              {forecast.length > 0 && (
                <Card className="erp-glass-card animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Umbrella className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base font-semibold">3-Day Forecast</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {forecast.map((day, index) => (
                      <ForecastWidget key={index} day={day} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Active Alerts */}
              {unreadCount > 0 ? (
                <Card className="bg-white border border-sw-gold-200 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-sw-gold-500" />
                      <CardTitle className="text-base font-semibold">Active Alerts ({unreadCount})</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs">Severity</TableHead>
                          <TableHead className="text-xs">Description</TableHead>
                          <TableHead className="text-xs">Station</TableHead>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-right text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alerts.map(alert => {
                          const config = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.warning;
                          const AlertIcon = ALERT_ICONS[alert.alert_type] || AlertTriangle;
                          return (
                            <TableRow key={alert.id} className="hover:bg-sw-gold-50/30">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${config.bg}`}>
                                    <AlertIcon className={`h-3 w-3 ${config.icon}`} />
                                  </div>
                                  <span className="text-xs font-medium text-foreground">{formatAlertType(alert.alert_type)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${config.badge}`}>
                                  {alert.severity}
                                </span>
                              </TableCell>
                              <TableCell className="max-w-[180px]">
                                <p className="text-xs text-foreground">{alert.description}</p>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{alert.stations?.station_name ?? "All"}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(alert.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                              </TableCell>
                              <TableCell className="text-right">
                                {canManageAlerts && (
                                  <Button size="sm" variant="ghost" onClick={() => handleAcknowledge(alert.id)} className="h-6 text-xs gap-1">
                                    <Check className="h-3 w-3" /> Ack
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white border border-sw-green-200 min-h-[220px] animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-500">
                  <CardContent className="min-h-[220px] py-6 flex items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-sw-green-50 mx-auto mb-3 flex items-center justify-center">
                        <Check className="h-6 w-6 text-sw-green-500" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1">No Active Alerts</h3>
                      <p className="text-sm text-muted-foreground">All conditions normal</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="erp-glass-card-subtle">
              <CardContent className="p-8 text-center">
                <CloudSun className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Loading weather data...</p>
                <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={fetchWeather}>
                  <CloudSun className="h-3.5 w-3.5" /> Retry
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Weather News */}
          {weather && (
            <Card className="erp-glass-card animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both delay-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base font-semibold">Weather Updates</CardTitle>
                  {newsSource && (
                    <Badge variant="outline" className="ml-auto text-[10px] bg-sw-green-50">{newsSource}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {getWeatherNews().map((news, index) => (
                  <NewsItem key={index} news={news} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Livestock Impact */}
          {weather && (
            <Card className="erp-glass-card animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both delay-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base font-semibold">Livestock Impact</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ImpactCard
                  icon={Thermometer}
                  label="Heat Stress"
                  value={getLivestockImpact()?.heatStress === "warning" ? "Monitor" : "Normal"}
                  status={getLivestockImpact()?.heatStress as "safe" | "warning" | "danger"}
                />
                <ImpactCard
                  icon={Sun}
                  label="UV Exposure"
                  value={getLivestockImpact()?.uvExposure === "warning" ? "Moderate" : "Low"}
                  status={getLivestockImpact()?.uvExposure as "safe" | "warning" | "danger"}
                />
                <ImpactCard
                  icon={Clock}
                  label="Feeding Time"
                  value={getLivestockImpact()?.feedingTime || "Normal"}
                  status="safe"
                />
                <ImpactCard
                  icon={Droplets}
                  label="Water Check"
                  value={getLivestockImpact()?.waterCheck || "Regular"}
                  status="safe"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      
      {/* Add Manual Alert Dialog */}
      <Dialog open={addAlert} onOpenChange={setAddAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Weather Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Alert Type</label>
                <Select value={alertForm.alert_type} onValueChange={(v) => setAlertForm(p => ({ ...p, alert_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heatwave">Heatwave</SelectItem>
                    <SelectItem value="cold_snap">Cold Snap</SelectItem>
                    <SelectItem value="flood">Flood</SelectItem>
                    <SelectItem value="heavy_rain">Heavy Rain</SelectItem>
                    <SelectItem value="storm">Storm</SelectItem>
                    <SelectItem value="drought">Drought</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Severity</label>
                <Select value={alertForm.severity} onValueChange={(v) => setAlertForm(p => ({ ...p, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Temperature (°C)</label>
                <Input type="number" value={alertForm.temperature_c} onChange={(e) => setAlertForm(p => ({ ...p, temperature_c: e.target.value }))} placeholder="42" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Humidity (%)</label>
                <Input type="number" value={alertForm.humidity} onChange={(e) => setAlertForm(p => ({ ...p, humidity: e.target.value }))} placeholder="85" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={alertForm.description} onChange={(e) => setAlertForm(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Recommendation</label>
              <Textarea value={alertForm.recommendation} onChange={(e) => setAlertForm(p => ({ ...p, recommendation: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAlert(false)}>Cancel</Button>
            <Button onClick={handleAddAlert} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Weather Settings Dialog */}
      <Dialog open={showSettings && canManageSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-sw-green-500" />
              Weather Threshold Settings
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-xl border border-sw-green-100 bg-sw-green-50 p-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-sw-green-700" />
              <div>
                <p className="text-sm font-medium text-sw-green-900">Admin and Manager only</p>
                <p className="text-xs text-sw-green-900/70">These values control automatic heat and cold warnings for the farm.</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Search Location</label>
              <Input placeholder="Search city or area..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">City</label>
              <Select value={settingsForm.city} onValueChange={(v) => {
                const loc = PAKISTAN_LOCATIONS.find(l => l.city === v);
                setSettingsForm(p => ({ ...p, city: v, area: loc?.areas[0] || "" }));
                setSearchQuery("");
              }}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {filteredLocations.map((loc) => (
                    <SelectItem key={loc.city} value={loc.city}>{loc.city} ({loc.areas.length})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Area</label>
              <Select value={settingsForm.area} onValueChange={(v) => setSettingsForm(p => ({ ...p, area: v }))} disabled={!settingsForm.city}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currentCityAreas.map((area) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-sw-green-50 rounded-lg">
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-sw-gold-500" />
                  Heat (°C)
                </label>
                <Input type="number" value={settingsForm.heat_alert_threshold} onChange={(e) => {
                  setSettingsForm(p => ({ ...p, heat_alert_threshold: e.target.value }));
                  setThresholdErrors(p => ({ ...p, heat: undefined }));
                }} className={`h-9 ${thresholdErrors.heat ? "border-sw-gold-300" : ""}`} />
                {thresholdErrors.heat && <p className="text-[10px] text-sw-gold-600">{thresholdErrors.heat}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-sw-sky-500" />
                  Cold (°C)
                </label>
                <Input type="number" value={settingsForm.cold_alert_threshold} onChange={(e) => {
                  setSettingsForm(p => ({ ...p, cold_alert_threshold: e.target.value }));
                  setThresholdErrors(p => ({ ...p, cold: undefined }));
                }} className={`h-9 ${thresholdErrors.cold ? "border-sw-gold-300" : ""}`} />
                {thresholdErrors.cold && <p className="text-[10px] text-sw-gold-600">{thresholdErrors.cold}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-sw-green-100 bg-white p-3">
              <div>
                <p className="text-sm font-medium">Enable weather alerts</p>
                <p className="text-xs text-muted-foreground">Show active weather warnings for this farm.</p>
              </div>
              <Switch checked={settingsForm.enabled} onCheckedChange={(checked) => setSettingsForm(p => ({ ...p, enabled: checked }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowSettings(false); setThresholdErrors({}); }}>Cancel</Button>
            <Button onClick={handleSaveSettings} disabled={savingSettings} className="bg-sw-green-500">
              {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeatherAlerts;
