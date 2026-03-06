export interface Treatment {
  id: string;
  cattleId: string;
  date: string;
  condition: string;
  treatment: string;
  medicine: string;
  cost: number;
  outcome: 'Recovered' | 'Ongoing' | 'Died';
  vet: string;
}

export const treatments: Treatment[] = [
  { id: "T-001", cattleId: "F001-0002", date: "2025-02-15", condition: "Mild fever", treatment: "Antipyretic injection", medicine: "Meloxicam 10ml", cost: 1500, outcome: "Recovered", vet: "Dr. Imran" },
  { id: "T-002", cattleId: "F001-0006", date: "2025-02-20", condition: "Foot rot", treatment: "Antibiotic course + hoof trim", medicine: "Oxytetracycline 20ml", cost: 3200, outcome: "Ongoing", vet: "Dr. Imran" },
  { id: "T-003", cattleId: "F001-0015", date: "2025-01-28", condition: "Bloat — severe", treatment: "Emergency trocarisation", medicine: "Trocar + Simethicone", cost: 5000, outcome: "Died", vet: "Dr. Imran" },
  { id: "T-004", cattleId: "F001-0001", date: "2025-02-10", condition: "Skin irritation", treatment: "Topical antifungal", medicine: "Miconazole cream", cost: 800, outcome: "Recovered", vet: "Dr. Imran" },
  { id: "T-005", cattleId: "F001-0005", date: "2025-02-25", condition: "Diarrhoea", treatment: "Rehydration + antibiotics", medicine: "ORS + Enrofloxacin 15ml", cost: 2000, outcome: "Ongoing", vet: "Dr. Imran" },
];
