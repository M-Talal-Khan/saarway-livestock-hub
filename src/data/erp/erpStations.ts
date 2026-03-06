export interface ERPStation {
  tag: string;
  name: string;
  location: string;
  animals: number;
  type: 'Owned' | 'Rented';
  rentAmount?: number;
  contractStart?: string;
  contractEnd?: string;
  ownerName?: string;
  ownerContact?: string;
  paymentDueDay?: number;
  paymentStatus?: 'Paid' | 'Unpaid' | 'Overdue';
}

export const erpStations: ERPStation[] = [
  { tag: "A", name: "Station 1 — Main", location: "Kasur", animals: 45, type: "Owned" },
  { tag: "B", name: "Station 2 — East Wing", location: "Kasur", animals: 32, type: "Rented", rentAmount: 45000, contractStart: "2024-01-01", contractEnd: "2025-12-31", ownerName: "Haji Nawaz", ownerContact: "0300-5551234", paymentDueDay: 28, paymentStatus: "Overdue" },
  { tag: "C", name: "Station 3 — Pattoki Road", location: "Pattoki", animals: 28, type: "Rented", rentAmount: 35000, contractStart: "2024-06-01", contractEnd: "2026-05-31", ownerName: "Malik Aslam", ownerContact: "0321-4449876", paymentDueDay: 1, paymentStatus: "Paid" },
];
