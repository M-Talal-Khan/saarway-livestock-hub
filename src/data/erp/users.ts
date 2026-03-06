export interface ERPUser {
  username: string;
  fullName: string;
  role: 'Admin' | 'Manager' | 'Veterinarian' | 'Accounts Officer' | 'Worker';
  station: string;
  status: 'Active' | 'Inactive';
}

export const erpUsers: ERPUser[] = [
  { username: "talal.admin", fullName: "Muhammad Talal Khan", role: "Admin", station: "All Stations", status: "Active" },
  { username: "ahmed.mgr", fullName: "Ahmed Raza", role: "Manager", station: "Station 1 — Main", status: "Active" },
  { username: "dr.imran", fullName: "Dr. Imran Malik", role: "Veterinarian", station: "All Stations", status: "Active" },
  { username: "bilal.acc", fullName: "Bilal Hassan", role: "Accounts Officer", station: "All Stations", status: "Active" },
  { username: "farhan.w1", fullName: "Farhan Ali", role: "Worker", station: "Station 1 — Main", status: "Active" },
  { username: "usman.w2", fullName: "Usman Ghani", role: "Worker", station: "Station 2 — East Wing", status: "Inactive" },
];
