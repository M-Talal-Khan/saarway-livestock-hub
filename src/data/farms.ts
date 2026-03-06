export interface Farm {
  id: number;
  name: string;
  city: string;
  listings: number;
  description: string;
  address?: string;
  farmingType?: string;
  totalAnimals?: number;
}

export const farms: Farm[] = [
  { id: 1, name: "GRASS Farms", city: "Kasur", listings: 24, description: "Premium cattle farming operation specialising in meat breeds across 3 stations", address: "GT Road, Kasur", farmingType: "Meat", totalAnimals: 105 },
  { id: 2, name: "Al-Noor Livestock", city: "Lahore", listings: 18, description: "Family-run farm with a focus on Sahiwal and cross breeds", address: "Raiwind Road, Lahore", farmingType: "Both", totalAnimals: 62 },
  { id: 3, name: "Green Valley Farms", city: "Faisalabad", listings: 31, description: "Large-scale livestock farm with dairy and meat operations", address: "Jhang Road, Faisalabad", farmingType: "Both", totalAnimals: 89 },
  { id: 4, name: "Khan Cattle Farm", city: "Multan", listings: 12, description: "Quality Friesian and Holstein cattle raised with modern techniques", address: "Bosan Road, Multan", farmingType: "Dairy", totalAnimals: 44 },
  { id: 5, name: "Baloch Livestock", city: "Quetta", listings: 9, description: "Specialising in Balochi breed cattle and small ruminants", address: "Sariab Road, Quetta", farmingType: "Meat", totalAnimals: 35 },
  { id: 6, name: "Sindh Agri Farms", city: "Hyderabad", listings: 14, description: "Mixed farming with a strong focus on Kundhi buffalo", address: "Autobahn Road, Hyderabad", farmingType: "Both", totalAnimals: 58 },
  { id: 7, name: "Northern Pastures", city: "Abbottabad", listings: 7, description: "Hill-region farming with Jersey and cross breeds", address: "Mansehra Road, Abbottabad", farmingType: "Dairy", totalAnimals: 28 },
];
