export interface Listing {
  id: number;
  breed: string;
  teeth: number;
  weight: number;
  price: number;
  farm: string;
  farmId: number;
  location: string;
  gender: string;
  status: string;
  description: string;
  daysListed: number;
}

export const listings: Listing[] = [
  { id: 101, breed: "Sahiwal", teeth: 4, weight: 320, price: 450000, farm: "GRASS Farms", farmId: 1, location: "Kasur", gender: "Male", status: "Ready for Sale", description: "Healthy Sahiwal bull, vaccinated, excellent weight gain", daysListed: 2 },
  { id: 102, breed: "Friesian", teeth: 6, weight: 480, price: 680000, farm: "Al-Noor Livestock", farmId: 2, location: "Lahore", gender: "Male", status: "Ready for Sale", description: "Premium Friesian, imported lineage, top condition", daysListed: 5 },
  { id: 103, breed: "Cross", teeth: 2, weight: 220, price: 280000, farm: "GRASS Farms", farmId: 1, location: "Kasur", gender: "Female", status: "Ready for Sale", description: "Young cross breed heifer, perfect for breeding", daysListed: 1 },
  { id: 104, breed: "Cholistani", teeth: 8, weight: 510, price: 720000, farm: "Green Valley Farms", farmId: 3, location: "Faisalabad", gender: "Male", status: "Ready for Sale", description: "Mature Cholistani bull, strong build, show quality", daysListed: 8 },
  { id: 105, breed: "Nili-Ravi", teeth: 4, weight: 390, price: 520000, farm: "Khan Cattle Farm", farmId: 4, location: "Multan", gender: "Female", status: "Ready for Sale", description: "Nili-Ravi buffalo, high milk yield potential", daysListed: 3 },
  { id: 106, breed: "Sahiwal", teeth: 6, weight: 410, price: 580000, farm: "GRASS Farms", farmId: 1, location: "Kasur", gender: "Male", status: "Ready for Sale", description: "Well-fed Sahiwal, dewormed and fully vaccinated", daysListed: 12 },
  { id: 107, breed: "Friesian", teeth: 2, weight: 190, price: 220000, farm: "Northern Pastures", farmId: 7, location: "Abbottabad", gender: "Female", status: "Ready for Sale", description: "Young Friesian heifer from hill region, acclimatised", daysListed: 6 },
  { id: 108, breed: "Cross", teeth: 4, weight: 340, price: 390000, farm: "Sindh Agri Farms", farmId: 6, location: "Hyderabad", gender: "Male", status: "Ready for Sale", description: "Healthy cross breed, good frame, gaining well", daysListed: 4 },
  { id: 109, breed: "Cholistani", teeth: 4, weight: 360, price: 480000, farm: "Baloch Livestock", farmId: 5, location: "Quetta", gender: "Male", status: "Ready for Sale", description: "Desert-hardy Cholistani, sturdy and disease-resistant", daysListed: 10 },
  { id: 110, breed: "Sahiwal", teeth: 2, weight: 180, price: 200000, farm: "Al-Noor Livestock", farmId: 2, location: "Lahore", gender: "Female", status: "Ready for Sale", description: "Young Sahiwal calf, excellent genetics", daysListed: 7 },
];
