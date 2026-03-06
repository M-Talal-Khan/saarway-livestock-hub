export interface Cattle {
  id: string;
  breed: string;
  teeth: number;
  weight: number;
  gender: 'Male' | 'Female';
  status: 'Active' | 'Fattening' | 'Ready for Sale' | 'Listed' | 'Sold' | 'Slaughtered' | 'Dead';
  station: string;
  purchaseDate: string;
  purchasePrice: number;
  weightHistory?: { date: string; weight: number }[];
}

export const cattle: Cattle[] = [
  { id: "F001-0001", breed: "Sahiwal", teeth: 4, weight: 320, gender: "Male", status: "Active", station: "Station 1 — Main", purchaseDate: "2024-11-15", purchasePrice: 280000, weightHistory: [{ date: "2024-11-15", weight: 280 }, { date: "2024-12-15", weight: 295 }, { date: "2025-01-15", weight: 310 }, { date: "2025-02-15", weight: 320 }] },
  { id: "F001-0002", breed: "Friesian", teeth: 6, weight: 480, gender: "Male", status: "Fattening", station: "Station 1 — Main", purchaseDate: "2024-10-20", purchasePrice: 420000, weightHistory: [{ date: "2024-10-20", weight: 420 }, { date: "2024-11-20", weight: 440 }, { date: "2024-12-20", weight: 460 }, { date: "2025-01-20", weight: 480 }] },
  { id: "F001-0003", breed: "Cross", teeth: 2, weight: 220, gender: "Female", status: "Ready for Sale", station: "Station 2 — East Wing", purchaseDate: "2024-12-01", purchasePrice: 180000 },
  { id: "F001-0004", breed: "Cholistani", teeth: 8, weight: 510, gender: "Male", status: "Listed", station: "Station 1 — Main", purchaseDate: "2024-09-10", purchasePrice: 350000 },
  { id: "F001-0005", breed: "Sahiwal", teeth: 4, weight: 290, gender: "Female", status: "Active", station: "Station 3 — Pattoki Road", purchaseDate: "2025-01-05", purchasePrice: 260000 },
  { id: "F001-0006", breed: "Nili-Ravi", teeth: 6, weight: 410, gender: "Female", status: "Fattening", station: "Station 2 — East Wing", purchaseDate: "2024-10-15", purchasePrice: 380000 },
  { id: "F001-0007", breed: "Friesian", teeth: 2, weight: 190, gender: "Male", status: "Active", station: "Station 1 — Main", purchaseDate: "2025-01-20", purchasePrice: 200000 },
  { id: "F001-0008", breed: "Sahiwal", teeth: 4, weight: 340, gender: "Male", status: "Ready for Sale", station: "Station 3 — Pattoki Road", purchaseDate: "2024-11-01", purchasePrice: 300000 },
  { id: "F001-0009", breed: "Cross", teeth: 6, weight: 370, gender: "Male", status: "Sold", station: "Station 1 — Main", purchaseDate: "2024-08-20", purchasePrice: 250000 },
  { id: "F001-0010", breed: "Cholistani", teeth: 4, weight: 300, gender: "Female", status: "Active", station: "Station 2 — East Wing", purchaseDate: "2025-02-01", purchasePrice: 270000 },
  { id: "F001-0011", breed: "Sahiwal", teeth: 8, weight: 530, gender: "Male", status: "Slaughtered", station: "Station 1 — Main", purchaseDate: "2024-07-10", purchasePrice: 320000 },
  { id: "F001-0012", breed: "Friesian", teeth: 4, weight: 380, gender: "Female", status: "Fattening", station: "Station 3 — Pattoki Road", purchaseDate: "2024-11-25", purchasePrice: 350000 },
  { id: "F001-0013", breed: "Cross", teeth: 2, weight: 175, gender: "Male", status: "Active", station: "Station 2 — East Wing", purchaseDate: "2025-02-10", purchasePrice: 160000 },
  { id: "F001-0014", breed: "Sahiwal", teeth: 6, weight: 420, gender: "Male", status: "Listed", station: "Station 1 — Main", purchaseDate: "2024-09-28", purchasePrice: 310000 },
  { id: "F001-0015", breed: "Nili-Ravi", teeth: 4, weight: 360, gender: "Female", status: "Dead", station: "Station 3 — Pattoki Road", purchaseDate: "2024-10-05", purchasePrice: 340000 },
];
