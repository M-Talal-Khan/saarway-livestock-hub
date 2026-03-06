export interface Transaction {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  category: string;
  description: string;
  amount: number;
  station: string;
}

export const transactions: Transaction[] = [
  { id: "TXN-001", date: "2025-02-20", type: "Income", category: "Cattle Sale", description: "Live sale — Sahiwal bull (F001-0009)", amount: 520000, station: "Station 1" },
  { id: "TXN-002", date: "2025-02-18", type: "Income", category: "Cattle Sale", description: "Slaughter sale — 2 animals", amount: 890000, station: "Station 1" },
  { id: "TXN-003", date: "2025-02-15", type: "Expense", category: "Medical", description: "Treatment — F001-0002 fever", amount: 1500, station: "Station 1" },
  { id: "TXN-004", date: "2025-02-10", type: "Expense", category: "Cattle Purchase", description: "Purchase P-004 — 3 animals from Faisalabad", amount: 637650, station: "Station 2" },
  { id: "TXN-005", date: "2025-02-05", type: "Expense", category: "Station Rental", description: "February rent — Station 2", amount: 45000, station: "Station 2" },
  { id: "TXN-006", date: "2025-02-01", type: "Expense", category: "Salary", description: "January salary — 3 workers", amount: 90000, station: "All" },
  { id: "TXN-007", date: "2025-01-28", type: "Income", category: "Cattle Sale", description: "Slaughter sale — 1 animal", amount: 410000, station: "Station 3" },
  { id: "TXN-008", date: "2025-01-25", type: "Expense", category: "Feed", description: "Silage stock — Station 3", amount: 35000, station: "Station 3" },
  { id: "TXN-009", date: "2025-01-20", type: "Expense", category: "Marketplace Fee", description: "Listing fee — 2 new listings", amount: 100, station: "Station 1" },
  { id: "TXN-010", date: "2025-01-15", type: "Expense", category: "Cattle Purchase", description: "Purchase P-003 — 4 animals", amount: 950200, station: "Station 3" },
];
