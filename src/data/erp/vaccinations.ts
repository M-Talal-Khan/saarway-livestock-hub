export interface Vaccination {
  id: string;
  cattleId: string;
  vaccine: string;
  dateGiven: string | null;
  nextDue: string;
  status: 'Completed' | 'Scheduled' | 'Upcoming' | 'Overdue';
  vet: string | null;
  notes?: string;
}

export const vaccinations: Vaccination[] = [
  { id: "V-001", cattleId: "F001-0001", vaccine: "FMD", dateGiven: "2024-12-01", nextDue: "2025-06-01", status: "Scheduled", vet: "Dr. Imran" },
  { id: "V-002", cattleId: "F001-0001", vaccine: "Deworming", dateGiven: "2024-12-15", nextDue: "2025-03-15", status: "Upcoming", vet: "Dr. Imran" },
  { id: "V-003", cattleId: "F001-0002", vaccine: "HS", dateGiven: "2024-06-10", nextDue: "2025-06-10", status: "Scheduled", vet: "Dr. Imran" },
  { id: "V-004", cattleId: "F001-0003", vaccine: "FMD", dateGiven: "2024-08-20", nextDue: "2025-02-20", status: "Overdue", vet: "Dr. Imran" },
  { id: "V-005", cattleId: "F001-0003", vaccine: "BQ", dateGiven: null, nextDue: "2025-01-15", status: "Overdue", vet: null },
  { id: "V-006", cattleId: "F001-0005", vaccine: "LSD", dateGiven: "2025-01-10", nextDue: "2026-01-10", status: "Completed", vet: "Dr. Imran" },
  { id: "V-007", cattleId: "F001-0007", vaccine: "FMD", dateGiven: null, nextDue: "2025-03-10", status: "Upcoming", vet: null },
  { id: "V-008", cattleId: "F001-0007", vaccine: "HS", dateGiven: null, nextDue: "2025-03-10", status: "Upcoming", vet: null },
  { id: "V-009", cattleId: "F001-0010", vaccine: "Deworming", dateGiven: "2025-02-01", nextDue: "2025-05-01", status: "Completed", vet: "Dr. Imran" },
];
