export interface FeedItem {
  id: number;
  name: string;
  unit: 'kg' | 'bag';
  costPerUnit: number;
  threshold: number;
  status: 'Active' | 'Inactive';
}

export interface StationStock {
  feedId: number;
  feed: string;
  currentStock: number;
  threshold: number;
  lastRestocked: string;
  unit: 'kg' | 'bag';
}

export interface StockEntry {
  id: number;
  date: string;
  feedItem: string;
  station: string;
  type: 'Stock In' | 'Stock Out';
  quantity: number;
  unit: 'kg' | 'bag';
  cost: number;
  source: string;
}

export interface ConsumptionEntry {
  id: number;
  date: string;
  station: string;
  feed: string;
  quantity: number;
  unit: 'kg' | 'bag';
  cost: number;
  loggedBy: string;
}

export const feedItems: FeedItem[] = [
  { id: 1, name: 'Silage', unit: 'kg', costPerUnit: 18, threshold: 500, status: 'Active' },
  { id: 2, name: 'Concentrate', unit: 'kg', costPerUnit: 65, threshold: 200, status: 'Active' },
  { id: 3, name: 'Rice Husk', unit: 'bag', costPerUnit: 350, threshold: 50, status: 'Active' },
  { id: 4, name: 'Hay', unit: 'kg', costPerUnit: 25, threshold: 300, status: 'Active' },
  { id: 5, name: 'Wheat Straw', unit: 'kg', costPerUnit: 12, threshold: 400, status: 'Active' },
  { id: 6, name: 'Molasses', unit: 'kg', costPerUnit: 40, threshold: 100, status: 'Inactive' },
];

export const stationStocks: Record<string, StationStock[]> = {
  'Station 1 — Main': [
    { feedId: 1, feed: 'Silage', currentStock: 1240, threshold: 500, lastRestocked: '2025-02-20', unit: 'kg' },
    { feedId: 2, feed: 'Concentrate', currentStock: 180, threshold: 200, lastRestocked: '2025-02-15', unit: 'kg' },
    { feedId: 3, feed: 'Rice Husk', currentStock: 65, threshold: 50, lastRestocked: '2025-02-18', unit: 'bag' },
    { feedId: 4, feed: 'Hay', currentStock: 890, threshold: 300, lastRestocked: '2025-02-22', unit: 'kg' },
    { feedId: 5, feed: 'Wheat Straw', currentStock: 340, threshold: 400, lastRestocked: '2025-02-10', unit: 'kg' },
  ],
  'Station 2 — East Wing': [
    { feedId: 1, feed: 'Silage', currentStock: 420, threshold: 500, lastRestocked: '2025-02-12', unit: 'kg' },
    { feedId: 2, feed: 'Concentrate', currentStock: 310, threshold: 200, lastRestocked: '2025-02-19', unit: 'kg' },
    { feedId: 3, feed: 'Rice Husk', currentStock: 22, threshold: 50, lastRestocked: '2025-01-28', unit: 'bag' },
    { feedId: 4, feed: 'Hay', currentStock: 560, threshold: 300, lastRestocked: '2025-02-14', unit: 'kg' },
    { feedId: 5, feed: 'Wheat Straw', currentStock: 710, threshold: 400, lastRestocked: '2025-02-20', unit: 'kg' },
  ],
  'Station 3 — Pattoki Road': [
    { feedId: 1, feed: 'Silage', currentStock: 280, threshold: 500, lastRestocked: '2025-02-05', unit: 'kg' },
    { feedId: 2, feed: 'Concentrate', currentStock: 95, threshold: 200, lastRestocked: '2025-02-08', unit: 'kg' },
    { feedId: 3, feed: 'Rice Husk', currentStock: 88, threshold: 50, lastRestocked: '2025-02-17', unit: 'bag' },
    { feedId: 4, feed: 'Hay', currentStock: 150, threshold: 300, lastRestocked: '2025-01-30', unit: 'kg' },
    { feedId: 5, feed: 'Wheat Straw', currentStock: 200, threshold: 400, lastRestocked: '2025-02-02', unit: 'kg' },
  ],
};

export const stockHistory: StockEntry[] = [
  { id: 1, date: '2025-02-22', feedItem: 'Hay', station: 'Station 1 — Main', type: 'Stock In', quantity: 400, unit: 'kg', cost: 10000, source: 'Malik Feeds Kasur' },
  { id: 2, date: '2025-02-20', feedItem: 'Silage', station: 'Station 1 — Main', type: 'Stock In', quantity: 600, unit: 'kg', cost: 10800, source: 'Local Supplier' },
  { id: 3, date: '2025-02-20', feedItem: 'Wheat Straw', station: 'Station 2 — East Wing', type: 'Stock In', quantity: 350, unit: 'kg', cost: 4200, source: 'Farm Reserve' },
  { id: 4, date: '2025-02-19', feedItem: 'Concentrate', station: 'Station 2 — East Wing', type: 'Stock In', quantity: 150, unit: 'kg', cost: 9750, source: 'Agri Mart' },
  { id: 5, date: '2025-02-18', feedItem: 'Rice Husk', station: 'Station 1 — Main', type: 'Stock In', quantity: 30, unit: 'bag', cost: 10500, source: 'Rice Mill Pattoki' },
  { id: 6, date: '2025-02-17', feedItem: 'Rice Husk', station: 'Station 3 — Pattoki Road', type: 'Stock In', quantity: 40, unit: 'bag', cost: 14000, source: 'Rice Mill Pattoki' },
  { id: 7, date: '2025-02-15', feedItem: 'Concentrate', station: 'Station 1 — Main', type: 'Stock In', quantity: 100, unit: 'kg', cost: 6500, source: 'Agri Mart' },
  { id: 8, date: '2025-02-12', feedItem: 'Silage', station: 'Station 2 — East Wing', type: 'Stock In', quantity: 500, unit: 'kg', cost: 9000, source: 'Local Supplier' },
];

export const consumptionLog: ConsumptionEntry[] = [
  { id: 1, date: '2025-03-05', station: 'Station 1 — Main', feed: 'Silage', quantity: 120, unit: 'kg', cost: 2160, loggedBy: 'Farhan Ali' },
  { id: 2, date: '2025-03-05', station: 'Station 1 — Main', feed: 'Concentrate', quantity: 45, unit: 'kg', cost: 2925, loggedBy: 'Farhan Ali' },
  { id: 3, date: '2025-03-05', station: 'Station 2 — East Wing', feed: 'Silage', quantity: 80, unit: 'kg', cost: 1440, loggedBy: 'Usman Ghani' },
  { id: 4, date: '2025-03-04', station: 'Station 1 — Main', feed: 'Hay', quantity: 95, unit: 'kg', cost: 2375, loggedBy: 'Farhan Ali' },
  { id: 5, date: '2025-03-04', station: 'Station 3 — Pattoki Road', feed: 'Silage', quantity: 60, unit: 'kg', cost: 1080, loggedBy: 'Ahmed Raza' },
  { id: 6, date: '2025-03-04', station: 'Station 2 — East Wing', feed: 'Concentrate', quantity: 35, unit: 'kg', cost: 2275, loggedBy: 'Usman Ghani' },
  { id: 7, date: '2025-03-03', station: 'Station 1 — Main', feed: 'Wheat Straw', quantity: 70, unit: 'kg', cost: 840, loggedBy: 'Farhan Ali' },
  { id: 8, date: '2025-03-03', station: 'Station 3 — Pattoki Road', feed: 'Hay', quantity: 50, unit: 'kg', cost: 1250, loggedBy: 'Ahmed Raza' },
  { id: 9, date: '2025-03-02', station: 'Station 2 — East Wing', feed: 'Rice Husk', quantity: 8, unit: 'bag', cost: 2800, loggedBy: 'Usman Ghani' },
  { id: 10, date: '2025-03-02', station: 'Station 1 — Main', feed: 'Silage', quantity: 115, unit: 'kg', cost: 2070, loggedBy: 'Farhan Ali' },
];

export function getLowStockAlerts(): { station: string; feed: string; current: number; threshold: number; unit: string; severity: 'red' | 'amber' }[] {
  const alerts: { station: string; feed: string; current: number; threshold: number; unit: string; severity: 'red' | 'amber' }[] = [];
  for (const [station, stocks] of Object.entries(stationStocks)) {
    for (const s of stocks) {
      if (s.currentStock <= s.threshold) {
        alerts.push({
          station,
          feed: s.feed,
          current: s.currentStock,
          threshold: s.threshold,
          unit: s.unit,
          severity: s.currentStock <= s.threshold * 0.5 ? 'red' : 'amber',
        });
      }
    }
  }
  return alerts;
}
