/* Labour and Machine Categories for ArgiMatch */

export const labourCategories = {
  withoutTools: [
    { id: 'lifting', name: 'Lifting Worker', icon: '💪', description: 'Heavy lifting and carrying' },
    { id: 'cutting', name: 'Cutting Worker', icon: '🌿', description: 'Crop cutting and trimming' },
    { id: 'watchman', name: 'Watchman', icon: '👁️', description: 'Field security and guarding' },
    { id: 'cleaner', name: 'Field Cleaner', icon: '🧹', description: 'Field cleaning and weeding' },
    { id: 'caretaker', name: 'Animal Caretaker', icon: '🐐', description: 'Goat/sheep/cattle care' },
    { id: 'planting', name: 'Planting Worker', icon: '🌱', description: 'Seed planting and sowing' },
  ],
  withTools: [
    { id: 'sprayer', name: 'Sprayer Worker', icon: '💨', description: 'Pesticide/fertilizer spraying' },
    { id: 'irrigation', name: 'Irrigation Worker', icon: '💧', description: 'Water management' },
    { id: 'harvest', name: 'Harvest Helper', icon: '🌾', description: 'Harvest assistance with tools' },
    { id: 'fencing', name: 'Fencing Worker', icon: '🔨', description: 'Field fencing and boundary' },
  ]
};

export const machineCategories = [
  { id: 'tractor', name: 'Tractor', icon: '🚜', description: 'Ploughing, tilling, transport' },
  { id: 'jcb', name: 'JCB / Excavator', icon: '🏗️', description: 'Earth moving, digging' },
  { id: 'harvester', name: 'Harvester', icon: '🌾', description: 'Crop harvesting machine' },
  { id: 'rotavator', name: 'Rotavator', icon: '⚙️', description: 'Soil tilling and mixing' },
  { id: 'seeder', name: 'Seeder', icon: '🌱', description: 'Automated seed planting' },
  { id: 'sprayer_machine', name: 'Sprayer Machine', icon: '💨', description: 'Large-scale spraying' },
  { id: 'trailer', name: 'Trailer / Transport', icon: '🚛', description: 'Crop and material transport' },
];

export const workTimeSlots = [
  { id: 'morning', name: 'Morning', time: '6:00 AM - 12:00 PM', icon: '🌅' },
  { id: 'afternoon', name: 'Afternoon', time: '12:00 PM - 6:00 PM', icon: '☀️' },
  { id: 'fullday', name: 'Full Day', time: '6:00 AM - 6:00 PM', icon: '📅' },
];

export const southIndianStates = [
  {
    id: 'ap',
    name: 'Andhra Pradesh',
    shortName: 'AP',
    language: 'Telugu',
    capital: 'Amaravati',
    center: { lat: 15.9129, lng: 79.7400 },
    districts: ['Guntur', 'Krishna', 'East Godavari', 'West Godavari', 'Prakasam', 'Nellore', 'Kurnool', 'Anantapur', 'Chittoor', 'Kadapa', 'Visakhapatnam', 'Srikakulam'],
  },
  {
    id: 'ts',
    name: 'Telangana',
    shortName: 'TS',
    language: 'Telugu',
    capital: 'Hyderabad',
    center: { lat: 17.1232, lng: 79.2088 },
    districts: ['Hyderabad', 'Rangareddy', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Nalgonda', 'Medak', 'Adilabad', 'Mahbubnagar'],
  },
  {
    id: 'tn',
    name: 'Tamil Nadu',
    shortName: 'TN',
    language: 'Tamil',
    capital: 'Chennai',
    center: { lat: 11.1271, lng: 78.6569 },
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Thanjavur', 'Vellore', 'Dindigul'],
  },
  {
    id: 'ka',
    name: 'Karnataka',
    shortName: 'KA',
    language: 'Kannada',
    capital: 'Bengaluru',
    center: { lat: 15.3173, lng: 75.7139 },
    districts: ['Bengaluru', 'Mysuru', 'Hubli-Dharwad', 'Mangaluru', 'Belgaum', 'Gulbarga', 'Davangere', 'Bellary', 'Shimoga', 'Tumkur'],
  },
  {
    id: 'kl',
    name: 'Kerala',
    shortName: 'KL',
    language: 'Malayalam',
    capital: 'Thiruvananthapuram',
    center: { lat: 10.8505, lng: 76.2711 },
    districts: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kannur', 'Kollam', 'Alappuzha', 'Palakkad', 'Malappuram', 'Idukki'],
  },
];

export const rangeOptions = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 30, label: '30 km' },
  { value: 50, label: '50 km' },
];

export const priceUnits = [
  { id: 'per_day', label: 'Per Day' },
  { id: 'per_hour', label: 'Per Hour' },
  { id: 'per_acre', label: 'Per Acre' },
];

export const getAllLabourCategories = () => {
  return [...labourCategories.withoutTools, ...labourCategories.withTools];
};

export const getCategoryById = (id) => {
  const all = [...labourCategories.withoutTools, ...labourCategories.withTools, ...machineCategories];
  return all.find(cat => cat.id === id);
};
