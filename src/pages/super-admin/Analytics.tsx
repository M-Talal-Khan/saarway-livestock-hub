import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { farmGrowthData, listingTrendsData, mostActiveFarmsData, breedPopularityData } from "@/data/super-admin";

const CHART_TOOLTIP_STYLE = {
  background: 'white', border: 'none', borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderTop: '3px solid #4ad88a', padding: '12px 16px',
};

const PIE_GRADIENTS = [
  { id: 'aPieGreen', from: '#4ad88a', to: '#1f9e1f' },
  { id: 'aPieGold', from: '#f5d87a', to: '#d4a934' },
  { id: 'aPieSky', from: '#4dc8e8', to: '#2a9ec0' },
  { id: 'aPieBlue', from: '#5a82a8', to: '#3d5f80' },
  { id: 'aPieOrange', from: '#f97316', to: '#c2410c' },
];

const Analytics = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Farm Growth */}
      <Card>
        <CardHeader><CardTitle className="text-base">Farm Growth (Monthly)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={farmGrowthData}>
              <defs>
                <linearGradient id="aGreenArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ad88a" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4ad88a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120 46% 62% / 0.15)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: 'rgba(74,216,138,0.06)' }} />
              <Area type="monotone" dataKey="farms" stroke="#4ad88a" strokeWidth={3} fill="url(#aGreenArea)" dot={{ r: 5, fill: '#4ad88a', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#1f9e1f', stroke: '#fff', strokeWidth: 3 }} animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Listing Trends */}
      <Card>
        <CardHeader><CardTitle className="text-base">Listing Trends</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={listingTrendsData}>
              <defs>
                <linearGradient id="aCreatedBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ad88a" stopOpacity={1} />
                  <stop offset="100%" stopColor="#1f9e1f" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="aRemovedBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e85858" stopOpacity={1} />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120 46% 62% / 0.15)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: 'rgba(74,216,138,0.06)' }} />
              <Legend />
              <Bar dataKey="created" fill="url(#aCreatedBar)" name="Created" radius={[8, 8, 0, 0]} animationDuration={1200} style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }} />
              <Bar dataKey="removed" fill="url(#aRemovedBar)" name="Removed" radius={[8, 8, 0, 0]} animationDuration={1200} style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Most Active Farms */}
      <Card>
        <CardHeader><CardTitle className="text-base">Most Active Farms (by Listings)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mostActiveFarmsData} layout="vertical">
              <defs>
                <linearGradient id="aSkyBar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2a9ec0" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#4dc8e8" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120 46% 62% / 0.15)" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="farm" tick={{ fontSize: 11 }} width={130} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: 'rgba(77,200,232,0.06)' }} />
              <Bar dataKey="listings" fill="url(#aSkyBar)" radius={[0, 8, 8, 0]} animationDuration={1200} style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Breed Popularity */}
      <Card>
        <CardHeader><CardTitle className="text-base">Most Listed Breeds</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <defs>
                {PIE_GRADIENTS.map(g => (
                  <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={g.from} stopOpacity={1} />
                    <stop offset="100%" stopColor={g.to} stopOpacity={0.85} />
                  </linearGradient>
                ))}
              </defs>
              <Pie data={breedPopularityData} dataKey="count" nameKey="breed" cx="50%" cy="50%" innerRadius={55} outerRadius={100} paddingAngle={3} cornerRadius={6} stroke="#fff" strokeWidth={3} label={({ breed, percent }) => `${breed} ${(percent * 100).toFixed(0)}%`} animationDuration={1200} style={{ filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.12))' }}>
                {breedPopularityData.map((_, i) => <Cell key={i} fill={`url(#${PIE_GRADIENTS[i % PIE_GRADIENTS.length].id})`} />)}
              </Pie>
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Analytics;
