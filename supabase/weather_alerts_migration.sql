-- Saarway Weather Alerts Extension
-- Add to Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  station_id uuid REFERENCES public.stations(id) ON DELETE SET NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('heatwave', 'flood', 'cold_snap', 'heavy_rain', 'storm', 'drought')),
  severity text NOT NULL CHECK (severity IN ('warning', 'severe', 'critical')),
  temperature_c numeric,
  humidity numeric,
  description text NOT NULL,
  recommendation text,
  is_acknowledged boolean DEFAULT false,
  acknowledged_by uuid REFERENCES public.farm_users(id),
  acknowledged_at timestamp with time zone,
  source text DEFAULT 'api' CHECK (source IN ('api', 'manual')),
  created_at timestamp with time zone DEFAULT now()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_weather_alerts_farm_id ON public.weather_alerts(farm_id);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_unacknowledged ON public.weather_alerts(farm_id, is_acknowledged) WHERE is_acknowledged = false;

-- RLS
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farm users can view weather alerts for their farm"
  ON public.weather_alerts FOR SELECT
  USING (auth.jwt() -> 'app_metadata' ->> 'farm_id' = farm_id::text);

CREATE POLICY "Farm users can insert weather alerts for their farm"
  ON public.weather_alerts FOR INSERT
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'farm_id' = farm_id::text);

CREATE POLICY "Farm users can update weather alerts for their farm"
  ON public.weather_alerts FOR UPDATE
  USING (auth.jwt() -> 'app_metadata' ->> 'farm_id' = farm_id::text);

-- Farm settings for weather
CREATE TABLE IF NOT EXISTS public.weather_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL UNIQUE REFERENCES public.farms(id) ON DELETE CASCADE,
  city text NOT NULL,
  area text NOT NULL DEFAULT '',
  heat_alert_threshold numeric DEFAULT 40.0,
  cold_alert_threshold numeric DEFAULT 5.0,
  enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.weather_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farm users can manage weather settings for their farm"
  ON public.weather_settings FOR ALL
  USING (auth.jwt() -> 'app_metadata' ->> 'farm_id' = farm_id::text);

-- Add area column if table already exists (for existing deployments)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'weather_settings' AND column_name = 'area') THEN
    -- Column exists, do nothing
  ELSE
    ALTER TABLE public.weather_settings ADD COLUMN area text NOT NULL DEFAULT '';
  END IF;
END $$;