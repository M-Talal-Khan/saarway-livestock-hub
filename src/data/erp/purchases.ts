export interface Purchase {
  id: string;
  supplier: string;
  date: string;
  animals: number;
  totalCost: number;
  station: string;
  status: 'Finalised' | 'Draft';
}

export const purchases: Purchase[] = [
  { id: "P-001", supplier: "Mandi Kasur", date: "2024-11-15", animals: 5, totalCost: 1462750, station: "Station 1 — Main", status: "Finalised" },
  { id: "P-002", supplier: "Ali Livestock Trader", date: "2024-12-01", animals: 3, totalCost: 625650, station: "Station 2 — East Wing", status: "Finalised" },
  { id: "P-003", supplier: "Sahiwal Mandi", date: "2025-01-05", animals: 4, totalCost: 950200, station: "Station 3 — Pattoki Road", status: "Finalised" },
  { id: "P-004", supplier: "Faisalabad Bazaar", date: "2025-02-10", animals: 3, totalCost: 637650, station: "Station 2 — East Wing", status: "Draft" },
];
