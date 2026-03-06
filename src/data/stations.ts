export interface Station {
  name: string;
  location: string;
  animals: number;
  farmId: number;
}

export const stations: Station[] = [
  { name: "Station 1 — Main", location: "Kasur", animals: 45, farmId: 1 },
  { name: "Station 2 — East Wing", location: "Kasur", animals: 32, farmId: 1 },
  { name: "Station 3 — Pattoki Road", location: "Pattoki", animals: 28, farmId: 1 },
  { name: "Main Station", location: "Lahore", animals: 38, farmId: 2 },
  { name: "Branch — Raiwind", location: "Raiwind", animals: 24, farmId: 2 },
  { name: "Central Station", location: "Faisalabad", animals: 52, farmId: 3 },
  { name: "South Block", location: "Faisalabad", animals: 37, farmId: 3 },
  { name: "Main Station", location: "Multan", animals: 44, farmId: 4 },
  { name: "Main Station", location: "Quetta", animals: 35, farmId: 5 },
  { name: "Main Station", location: "Hyderabad", animals: 34, farmId: 6 },
  { name: "Hilltop Station", location: "Abbottabad", animals: 18, farmId: 6 },
  { name: "Main Station", location: "Abbottabad", animals: 28, farmId: 7 },
];
