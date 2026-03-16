// Indian states and districts data
export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export const DISTRICTS: Record<string, string[]> = {
  "Karnataka": ["Bangalore Urban", "Bangalore Rural", "Mysore", "Mandya", "Hassan", "Tumkur", "Shimoga", "Davangere", "Chitradurga", "Bellary", "Raichur", "Gulbarga", "Bidar", "Dharwad", "Belgaum", "Uttara Kannada", "Dakshina Kannada", "Udupi", "Kodagu", "Chikmagalur", "Haveri", "Gadag", "Koppal", "Bagalkot", "Bijapur", "Chamarajanagar", "Kolar", "Chikballapur", "Ramanagara", "Yadgir"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Satara", "Sangli"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha", "Palakkad"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Kakinada", "Rajahmundry"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Bhilwara", "Alwar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut", "Ghaziabad", "Noida"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
};

export const TALUKS: Record<string, string[]> = {
  "Bangalore Urban": ["Bangalore North", "Bangalore South", "Anekal"],
  "Mysore": ["Mysore", "Nanjangud", "T. Narasipura", "Hunsur", "Periyapatna", "K.R. Nagar", "H.D. Kote"],
  "Mandya": ["Mandya", "Maddur", "Malavalli", "Srirangapatna", "Nagamangala", "K.R. Pet", "Pandavapura"],
  "Mumbai": ["Andheri", "Borivali", "Kurla"],
  "Chennai": ["Egmore", "Mylapore", "Perambur", "Tondiarpet"],
  "Hyderabad": ["Secunderabad", "Charminar", "Khairatabad", "Musheerabad"],
  "New Delhi": ["Connaught Place", "Karol Bagh", "Saket"],
};

export const EDUCATION_LEVELS = [
  "Illiterate", "Primary (1-5)", "Middle (6-8)", "Secondary (9-10)",
  "Higher Secondary (11-12)", "Diploma", "Graduate", "Post Graduate",
  "Professional Degree", "Doctorate"
];

export const OCCUPATIONS = [
  "Agriculture", "Business", "Government Employee", "Private Employee",
  "Self Employed", "Student", "Homemaker", "Retired", "Unemployed",
  "Daily Wage Worker", "Other"
];

export const RELIGIONS = [
  "Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other"
];

export const CATEGORIES = ["General", "OBC", "SC", "ST"];

export const WATER_SOURCES = [
  "Tap Water", "Borewell", "Well", "River/Stream", "Tanker", "Other"
];

export const INCOME_RANGES = [
  "Below ₹5,000", "₹5,000 - ₹10,000", "₹10,000 - ₹25,000",
  "₹25,000 - ₹50,000", "₹50,000 - ₹1,00,000", "Above ₹1,00,000"
];

export const HOUSE_TYPES = ["Own", "Rent", "Government"];

export interface FamilyMember {
  name: string;
  age: string;
  gender: string;
  education: string;
  occupation: string;
  workingStatus: string;
  maritalStatus: string;
  phone: string;
  aadhaar: string;
}

export interface CensusEntry {
  id: string;
  // Location
  state: string;
  district: string;
  taluk: string;
  village: string;
  pincode: string;
  // Family
  headOfFamily: string;
  houseNumber: string;
  houseType: string;
  numberOfMembers: number;
  members: FamilyMember[];
  // Additional
  monthlyIncome: string;
  religion: string;
  category: string;
  disabilityStatus: string;
  migrationStatus: string;
  internetAvailability: string;
  drinkingWaterSource: string;
  toiletFacility: string;
  electricityAvailability: string;
  // Meta
  submittedAt: string;
}

// localStorage helpers
const STORAGE_KEY = "census_entries";

export function getEntries(): CensusEntry[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addEntry(entry: CensusEntry) {
  const entries = getEntries();
  entries.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function updateEntry(id: string, updated: CensusEntry) {
  const entries = getEntries().map(e => e.id === id ? updated : e);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function deleteEntry(id: string) {
  const entries = getEntries().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function searchEntries(query: string): CensusEntry[] {
  const q = query.toLowerCase();
  return getEntries().filter(e =>
    e.headOfFamily.toLowerCase().includes(q) ||
    e.state.toLowerCase().includes(q) ||
    e.district.toLowerCase().includes(q) ||
    e.village.toLowerCase().includes(q)
  );
}
