// Super Admin dummy data

export const pendingFarms = [
  { farmName: "Frontier Livestock", owner: "Kamran Shah", phone: "0345-1112233", email: "kamran@email.com", city: "Peshawar", stations: 2, type: "Meat", submitted: "2025-03-02" },
  { farmName: "Punjab Agri Co", owner: "Tariq Mehmood", phone: "0300-4455667", email: "tariq@email.com", city: "Rawalpindi", stations: 4, type: "Both", submitted: "2025-03-04" },
  { farmName: "Thar Desert Farms", owner: "Raheem Bhutto", phone: "0321-7788990", email: "raheem@email.com", city: "Tharparkar", stations: 1, type: "Meat", submitted: "2025-03-05" },
];

export const activeFarms = [
  { id: "F001", name: "GRASS Farms", owner: "Muhammad Talal Khan", city: "Kasur", animals: 105, listings: 24, feeStatus: "Paid" as const, joined: "2024-08-15" },
  { id: "F002", name: "Al-Noor Livestock", owner: "Noor Ahmed", city: "Lahore", animals: 78, listings: 18, feeStatus: "Paid" as const, joined: "2024-09-01" },
  { id: "F003", name: "Green Valley Farms", owner: "Hamza Iqbal", city: "Faisalabad", animals: 142, listings: 31, feeStatus: "Overdue" as const, joined: "2024-09-20" },
  { id: "F004", name: "Khan Cattle Farm", owner: "Imran Khan", city: "Multan", animals: 56, listings: 12, feeStatus: "Paid" as const, joined: "2024-10-10" },
  { id: "F005", name: "Baloch Livestock", owner: "Nawab Baloch", city: "Quetta", animals: 34, listings: 9, feeStatus: "Overdue" as const, joined: "2025-02-20" },
  { id: "F006", name: "Sindh Agri Farms", owner: "Ali Raza Soomro", city: "Hyderabad", animals: 91, listings: 14, feeStatus: "Paid" as const, joined: "2025-02-25" },
  { id: "F007", name: "Northern Pastures", owner: "Zaid Khan", city: "Abbottabad", animals: 28, listings: 7, feeStatus: "Paid" as const, joined: "2025-02-28" },
];

export const suspendedFarms = [
  { id: "F099", name: "Desert Star Ranch", owner: "Qadir Magsi", reason: "Repeated non-payment of platform fees — 3 months overdue", suspendedDate: "2025-01-15" },
];

export const adminListings = [
  { id: 101, animal: "Sahiwal Bull, 4 teeth, 320kg", farm: "GRASS Farms", price: 450000, date: "2025-02-20", status: "Active" as const },
  { id: 102, animal: "Friesian Bull, 6 teeth, 480kg", farm: "Al-Noor Livestock", price: 680000, date: "2025-02-18", status: "Active" as const },
  { id: 103, animal: "Cross Heifer, 2 teeth, 220kg", farm: "GRASS Farms", price: 280000, date: "2025-02-22", status: "Active" as const },
  { id: 104, animal: "Cholistani Bull, 8 teeth, 510kg", farm: "Green Valley Farms", price: 720000, date: "2025-02-15", status: "Active" as const },
  { id: 105, animal: "Nili-Ravi Buffalo, 4 teeth, 390kg", farm: "Khan Cattle Farm", price: 520000, date: "2025-02-19", status: "Active" as const },
  { id: 106, animal: "Sahiwal Bull, 6 teeth, 410kg", farm: "GRASS Farms", price: 580000, date: "2025-02-10", status: "Active" as const },
  { id: 107, animal: "Friesian Heifer, 2 teeth, 190kg", farm: "Northern Pastures", price: 220000, date: "2025-02-16", status: "Active" as const },
  { id: 108, animal: "Cross Bull, 4 teeth, 340kg", farm: "Sindh Agri Farms", price: 390000, date: "2025-02-18", status: "Active" as const },
  { id: 109, animal: "Cholistani Bull, 4 teeth, 360kg", farm: "Baloch Livestock", price: 480000, date: "2025-02-12", status: "Active" as const },
  { id: 110, animal: "Sahiwal Calf, 2 teeth, 180kg", farm: "Al-Noor Livestock", price: 200000, date: "2025-02-15", status: "Active" as const },
  { id: 111, animal: "Cross Heifer, 2 teeth, 200kg", farm: "Baloch Livestock", price: 180000, date: "2025-01-10", status: "Suspended" as const },
  { id: 112, animal: "Sahiwal Bull, 6 teeth, 400kg", farm: "Green Valley Farms", price: 550000, date: "2025-01-05", status: "Suspended" as const },
];

export const revenueData = [
  { farm: "GRASS Farms", animals: 105, subFee: 5250, listings: 24, listFee: 1200, owed: 6450, paid: 6450, balance: 0 },
  { farm: "Al-Noor Livestock", animals: 78, subFee: 3900, listings: 18, listFee: 900, owed: 4800, paid: 4800, balance: 0 },
  { farm: "Green Valley Farms", animals: 142, subFee: 7100, listings: 31, listFee: 1550, owed: 8650, paid: 4100, balance: 4550 },
  { farm: "Khan Cattle Farm", animals: 56, subFee: 2800, listings: 12, listFee: 600, owed: 3400, paid: 3400, balance: 0 },
  { farm: "Baloch Livestock", animals: 34, subFee: 1700, listings: 9, listFee: 450, owed: 2150, paid: 0, balance: 2150 },
  { farm: "Sindh Agri Farms", animals: 91, subFee: 4550, listings: 14, listFee: 700, owed: 5250, paid: 5250, balance: 0 },
  { farm: "Northern Pastures", animals: 28, subFee: 1400, listings: 7, listFee: 350, owed: 1750, paid: 1750, balance: 0 },
];

export const monthlyRevenueChart = [
  { month: "Sep 2024", collected: 28000, outstanding: 3200 },
  { month: "Oct 2024", collected: 35000, outstanding: 4100 },
  { month: "Nov 2024", collected: 41000, outstanding: 2800 },
  { month: "Dec 2024", collected: 48000, outstanding: 5500 },
  { month: "Jan 2025", collected: 52000, outstanding: 6200 },
  { month: "Feb 2025", collected: 42000, outstanding: 4550 },
];

export const farmGrowthData = [
  { month: "Apr 24", farms: 0 }, { month: "May 24", farms: 0 },
  { month: "Jun 24", farms: 1 }, { month: "Jul 24", farms: 1 },
  { month: "Aug 24", farms: 2 }, { month: "Sep 24", farms: 1 },
  { month: "Oct 24", farms: 2 }, { month: "Nov 24", farms: 0 },
  { month: "Dec 24", farms: 1 }, { month: "Jan 25", farms: 1 },
  { month: "Feb 25", farms: 3 }, { month: "Mar 25", farms: 0 },
];

export const listingTrendsData = [
  { month: "Sep", created: 12, removed: 3 },
  { month: "Oct", created: 18, removed: 5 },
  { month: "Nov", created: 15, removed: 4 },
  { month: "Dec", created: 22, removed: 7 },
  { month: "Jan", created: 20, removed: 6 },
  { month: "Feb", created: 16, removed: 3 },
];

export const mostActiveFarmsData = [
  { farm: "Green Valley Farms", listings: 31 },
  { farm: "GRASS Farms", listings: 24 },
  { farm: "Al-Noor Livestock", listings: 18 },
  { farm: "Sindh Agri Farms", listings: 14 },
  { farm: "Khan Cattle Farm", listings: 12 },
];

export const breedPopularityData = [
  { breed: "Sahiwal", count: 18 },
  { breed: "Friesian", count: 12 },
  { breed: "Cross", count: 9 },
  { breed: "Cholistani", count: 7 },
  { breed: "Nili-Ravi", count: 5 },
];

export interface AdminMessage {
  id: number;
  type: "Farm Owner" | "General User";
  name: string;
  email: string;
  phone: string | null;
  message: string;
  date: string;
  status: "Unread" | "Read" | "Resolved";
}

export const adminMessages: AdminMessage[] = [
  { id: 1, type: "Farm Owner" as const, name: "Asad Khan", email: "asad@email.com", phone: "0312-1234567", message: "I want to register my farm in Peshawar. We have 3 stations with approximately 200 cattle. What is the process for onboarding and how soon can we get started?", date: "2025-03-04", status: "Unread" as const },
  { id: 2, type: "General User" as const, name: "Fatima Noor", email: "fatima@email.com", phone: null, message: "How do I contact a seller after viewing a listing? I clicked on a listing but couldn't find the contact button. Do I need to create an account first?", date: "2025-03-03", status: "Unread" as const },
  { id: 3, type: "Farm Owner" as const, name: "Usman Ali", email: "usman@email.com", phone: "0300-9998877", message: "We have 5 stations across Punjab and are interested in digitising our entire operation. Can Saarway handle multi-station farms with different managers at each location?", date: "2025-03-01", status: "Read" as const },
  { id: 4, type: "General User" as const, name: "Ayesha Bibi", email: "ayesha@email.com", phone: "0333-5556677", message: "I purchased a bull from a farm listed on Saarway. The experience was great. Just wanted to say thank you and suggest adding a review system.", date: "2025-02-28", status: "Resolved" as const },
  { id: 5, type: "Farm Owner" as const, name: "Javed Akhtar", email: "javed@email.com", phone: "0345-1112233", message: "Is there a dairy tracking module available? We mainly deal in dairy cattle and need milk production tracking integrated with finance.", date: "2025-02-25", status: "Resolved" as const },
];

export const adminAlerts = [
  { id: 1, type: "Farm Fee Overdue", severity: "critical" as const, message: "Green Valley Farms — PKR 4,550 balance overdue since Feb 28", time: "2 hours ago", link: "/super-admin/revenue" },
  { id: 2, type: "Farm Fee Overdue", severity: "critical" as const, message: "Baloch Livestock — PKR 2,150 balance overdue since Mar 1", time: "5 hours ago", link: "/super-admin/revenue" },
  { id: 3, type: "New Registration", severity: "info" as const, message: "New farm registration: Frontier Livestock (Peshawar) — awaiting review", time: "5 hours ago", link: "/super-admin/farms" },
  { id: 4, type: "Listing Suspended", severity: "warning" as const, message: "Listing #109 suspended — Baloch Livestock (Cholistani Bull)", time: "1 day ago", link: "/super-admin/marketplace" },
  { id: 5, type: "Listing Suspended", severity: "warning" as const, message: "Listing #112 suspended — Green Valley Farms (Sahiwal Bull)", time: "1 day ago", link: "/super-admin/marketplace" },
  { id: 6, type: "New Message", severity: "info" as const, message: "New Contact Us message from Asad Khan (Farm Owner)", time: "1 day ago", link: "/super-admin/messages" },
  { id: 7, type: "Farm Reactivated", severity: "success" as const, message: "Northern Pastures reactivated after fee payment cleared", time: "3 days ago", link: "/super-admin/farms" },
  { id: 8, type: "New Registration", severity: "info" as const, message: "New farm registration: Punjab Agri Co (Rawalpindi) — awaiting review", time: "3 days ago", link: "/super-admin/farms" },
];
