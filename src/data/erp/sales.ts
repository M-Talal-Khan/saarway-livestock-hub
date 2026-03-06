export interface Sale {
  id: string;
  date: string;
  type: 'Live Sale' | 'Slaughter';
  animals: number;
  buyer: string;
  total: number;
}

export const sales: Sale[] = [
  { id: "S-001", date: "2025-02-20", type: "Live Sale", animals: 1, buyer: "Haji Rashid — 0300-1234567", total: 520000 },
  { id: "S-002", date: "2025-02-18", type: "Slaughter", animals: 2, buyer: "Kasur Abattoir", total: 890000 },
  { id: "S-003", date: "2025-02-10", type: "Live Sale", animals: 3, buyer: "Ahmed Traders — 0321-9876543", total: 1350000 },
  { id: "S-004", date: "2025-01-28", type: "Slaughter", animals: 1, buyer: "Lahore Meat House", total: 410000 },
];
