import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { farmGrowthData, listingTrendsData, mostActiveFarmsData, breedPopularityData } from "@/data/super-admin";

const PIE_COLORS = ["#4ad88a", "#e8c24a", "#4dc8e8", "#5a82a8", "#f5d87a"];

const Analytics = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Farm Growth */}
      <Card>
        <CardHeader><CardTitle className="text-base">Farm Growth (Monthly)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={farmGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120 46% 62% / 0.2)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="farms" stroke="#4ad88a" strokeWidth={2} dot={{ r: 4 }} animationDuration={800} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Listing Trends */}
      <Card>
        <CardHeader><CardTitle className="text-base">Listing Trends</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={listingTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120 46% 62% / 0.2)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="created" fill="#4ad88a" name="Created" radius={[4, 4, 0, 0]} animationDuration={800} />
              <Bar dataKey="removed" fill="#e85858" name="Removed" radius={[4, 4, 0, 0]} animationDuration={800} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120 46% 62% / 0.2)" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="farm" tick={{ fontSize: 11 }} width={130} />
              <Tooltip />
              <Bar dataKey="listings" fill="#4dc8e8" radius={[0, 4, 4, 0]} animationDuration={800} />
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
              <Pie data={breedPopularityData} dataKey="count" nameKey="breed" cx="50%" cy="50%" outerRadius={100} innerRadius={50} label={({ breed, percent }) => `${breed} ${(percent * 100).toFixed(0)}%`} animationDuration={800}>
                {breedPopularityData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Analytics;
