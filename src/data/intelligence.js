/* Mock data for disease detection, crop recommendation, market insights */

export const diseaseDatabase = [
  {
    id: 'leaf_blight',
    name: 'Leaf Blight',
    confidence: 89,
    severity: 'high',
    crop: 'Rice',
    cause: 'Caused by Helminthosporium oryzae fungus. Spreads rapidly in warm, humid conditions with poor drainage.',
    symptoms: ['Brown oval spots on leaves', 'Yellowing leaf margins', 'Lesions merge causing leaf death'],
    prevention: ['Use resistant varieties', 'Proper spacing between plants', 'Avoid excessive nitrogen fertilizer', 'Ensure good field drainage'],
    medicine: ['Mancozeb 75% WP @ 2g/litre', 'Propiconazole 25% EC @ 1ml/litre', 'Tricyclazole 75% WP @ 0.6g/litre'],
    icon: '🍂',
  },
  {
    id: 'powdery_mildew',
    name: 'Powdery Mildew',
    confidence: 92,
    severity: 'medium',
    crop: 'Tomato',
    cause: 'Caused by Oidium lycopersici fungus. Thrives in dry, warm weather with cool nights.',
    symptoms: ['White powdery coating on leaves', 'Curling and yellowing of leaves', 'Reduced fruit quality'],
    prevention: ['Good air circulation', 'Avoid overhead watering', 'Remove infected plant parts', 'Use disease-free seeds'],
    medicine: ['Sulphur 80% WP @ 3g/litre', 'Carbendazim 50% WP @ 1g/litre', 'Hexaconazole 5% EC @ 2ml/litre'],
    icon: '🔬',
  },
  {
    id: 'bacterial_wilt',
    name: 'Bacterial Wilt',
    confidence: 85,
    severity: 'high',
    crop: 'Brinjal',
    cause: 'Caused by Ralstonia solanacearum bacteria. Enters through roots in waterlogged soils.',
    symptoms: ['Sudden wilting of plants', 'Browning of vascular tissue', 'No yellowing before wilting'],
    prevention: ['Crop rotation with non-host crops', 'Use raised beds', 'Apply Trichoderma to soil', 'Avoid waterlogging'],
    medicine: ['Streptocycline @ 0.5g/litre', 'Copper oxychloride @ 3g/litre', 'Pseudomonas fluorescens soil drench'],
    icon: '🦠',
  },
  {
    id: 'yellow_mosaic',
    name: 'Yellow Mosaic Virus',
    confidence: 94,
    severity: 'high',
    crop: 'Black Gram',
    cause: 'Transmitted by whiteflies (Bemisia tabaci). Common in warm, dry conditions.',
    symptoms: ['Yellow patches on leaves', 'Mosaic pattern of green and yellow', 'Stunted growth', 'Pod deformation'],
    prevention: ['Control whitefly population', 'Use resistant varieties', 'Destroy infected plants early', 'Intercropping with cereals'],
    medicine: ['Imidacloprid 17.8% SL @ 0.3ml/litre (for whitefly)', 'Thiamethoxam 25% WG @ 0.3g/litre', 'Neem oil 5% spray'],
    icon: '🌿',
  },
  {
    id: 'rust',
    name: 'Leaf Rust',
    confidence: 88,
    severity: 'medium',
    crop: 'Wheat',
    cause: 'Caused by Puccinia recondita fungus. Spreads through wind-borne spores in cool, moist conditions.',
    symptoms: ['Orange-brown pustules on leaf surface', 'Circular to oval shaped spots', 'Premature leaf drying'],
    prevention: ['Grow resistant varieties', 'Timely sowing', 'Balanced fertilization', 'Remove volunteer plants'],
    medicine: ['Propiconazole 25% EC @ 1ml/litre', 'Tebuconazole 25.9% EC @ 1ml/litre', 'Mancozeb 75% WP @ 2.5g/litre'],
    icon: '🍁',
  },
];

export const cropRecommendations = {
  ap: {
    kharif: [
      { name: 'Rice (Paddy)', emoji: '🌾', yield: '5-6 tonnes/ha', risk: 'low', season: 'Jun-Nov', water: 'High', soil: 'Clay loam' },
      { name: 'Cotton', emoji: '🏳️', yield: '2-3 tonnes/ha', risk: 'medium', season: 'Jun-Oct', water: 'Medium', soil: 'Black soil' },
      { name: 'Groundnut', emoji: '🥜', yield: '1.5-2 tonnes/ha', risk: 'low', season: 'Jun-Sep', water: 'Low', soil: 'Sandy loam' },
      { name: 'Red Gram (Tur)', emoji: '🫘', yield: '1-1.5 tonnes/ha', risk: 'low', season: 'Jun-Dec', water: 'Low', soil: 'All soils' },
    ],
    rabi: [
      { name: 'Bengal Gram', emoji: '🫘', yield: '1.5-2 tonnes/ha', risk: 'low', season: 'Oct-Feb', water: 'Low', soil: 'Sandy loam' },
      { name: 'Sunflower', emoji: '🌻', yield: '1-1.5 tonnes/ha', risk: 'medium', season: 'Oct-Feb', water: 'Medium', soil: 'All soils' },
      { name: 'Chillies', emoji: '🌶️', yield: '2-3 tonnes/ha', risk: 'medium', season: 'Sep-Mar', water: 'Medium', soil: 'Loam' },
    ],
  },
  ts: {
    kharif: [
      { name: 'Rice (Paddy)', emoji: '🌾', yield: '5-6 tonnes/ha', risk: 'low', season: 'Jun-Nov', water: 'High', soil: 'Clay loam' },
      { name: 'Cotton', emoji: '🏳️', yield: '2-2.5 tonnes/ha', risk: 'medium', season: 'Jun-Oct', water: 'Medium', soil: 'Black soil' },
      { name: 'Maize', emoji: '🌽', yield: '6-8 tonnes/ha', risk: 'low', season: 'Jun-Sep', water: 'Medium', soil: 'All soils' },
      { name: 'Soybean', emoji: '🫘', yield: '2-3 tonnes/ha', risk: 'medium', season: 'Jun-Oct', water: 'Medium', soil: 'Loam' },
    ],
    rabi: [
      { name: 'Bengal Gram', emoji: '🫘', yield: '1.5-2 tonnes/ha', risk: 'low', season: 'Oct-Feb', water: 'Low', soil: 'Sandy loam' },
      { name: 'Jowar', emoji: '🌾', yield: '2-3 tonnes/ha', risk: 'low', season: 'Oct-Feb', water: 'Low', soil: 'Black soil' },
    ],
  },
  tn: {
    kharif: [
      { name: 'Rice (Paddy)', emoji: '🌾', yield: '5-7 tonnes/ha', risk: 'low', season: 'Jun-Nov', water: 'High', soil: 'Clay loam' },
      { name: 'Sugarcane', emoji: '🎋', yield: '80-100 tonnes/ha', risk: 'medium', season: 'Jan-Dec', water: 'High', soil: 'Loam' },
      { name: 'Banana', emoji: '🍌', yield: '30-40 tonnes/ha', risk: 'medium', season: 'Year-round', water: 'High', soil: 'Rich loam' },
    ],
    rabi: [
      { name: 'Black Gram', emoji: '🫘', yield: '1-1.5 tonnes/ha', risk: 'low', season: 'Sep-Dec', water: 'Low', soil: 'Sandy loam' },
      { name: 'Groundnut', emoji: '🥜', yield: '1.5-2 tonnes/ha', risk: 'low', season: 'Oct-Feb', water: 'Low', soil: 'Sandy loam' },
    ],
  },
  ka: {
    kharif: [
      { name: 'Ragi (Finger Millet)', emoji: '🌾', yield: '3-4 tonnes/ha', risk: 'low', season: 'Jun-Oct', water: 'Low', soil: 'Red soil' },
      { name: 'Maize', emoji: '🌽', yield: '6-8 tonnes/ha', risk: 'low', season: 'Jun-Sep', water: 'Medium', soil: 'All soils' },
      { name: 'Rice (Paddy)', emoji: '🌾', yield: '4-5 tonnes/ha', risk: 'low', season: 'Jun-Nov', water: 'High', soil: 'Clay loam' },
      { name: 'Arecanut', emoji: '🌴', yield: '2-3 tonnes/ha', risk: 'medium', season: 'Year-round', water: 'High', soil: 'Laterite' },
    ],
    rabi: [
      { name: 'Jowar', emoji: '🌾', yield: '2-3 tonnes/ha', risk: 'low', season: 'Oct-Feb', water: 'Low', soil: 'Black soil' },
      { name: 'Sunflower', emoji: '🌻', yield: '1-1.5 tonnes/ha', risk: 'medium', season: 'Oct-Feb', water: 'Medium', soil: 'Loam' },
    ],
  },
  kl: {
    kharif: [
      { name: 'Rice (Paddy)', emoji: '🌾', yield: '4-5 tonnes/ha', risk: 'low', season: 'Jun-Nov', water: 'High', soil: 'Clay loam' },
      { name: 'Coconut', emoji: '🥥', yield: '10,000 nuts/ha', risk: 'low', season: 'Year-round', water: 'Medium', soil: 'Sandy loam' },
      { name: 'Rubber', emoji: '🌳', yield: '1.5-2 tonnes/ha', risk: 'low', season: 'Year-round', water: 'High', soil: 'Laterite' },
      { name: 'Pepper', emoji: '🫑', yield: '0.5-1 tonne/ha', risk: 'medium', season: 'Jun-Dec', water: 'High', soil: 'Rich loam' },
    ],
    rabi: [
      { name: 'Tapioca', emoji: '🥔', yield: '25-35 tonnes/ha', risk: 'low', season: 'Oct-Jun', water: 'Low', soil: 'Sandy loam' },
    ],
  },
};

export const marketPrices = [
  { crop: 'Rice (Paddy)', emoji: '🌾', currentPrice: 2200, previousPrice: 2100, unit: 'per quintal', mandi: 'Guntur', trend: 'up', change: 4.8 },
  { crop: 'Cotton', emoji: '🏳️', currentPrice: 6800, previousPrice: 7100, unit: 'per quintal', mandi: 'Warangal', trend: 'down', change: -4.2 },
  { crop: 'Groundnut', emoji: '🥜', currentPrice: 5500, previousPrice: 5200, unit: 'per quintal', mandi: 'Anantapur', trend: 'up', change: 5.8 },
  { crop: 'Red Gram', emoji: '🫘', currentPrice: 8200, previousPrice: 7800, unit: 'per quintal', mandi: 'Kurnool', trend: 'up', change: 5.1 },
  { crop: 'Maize', emoji: '🌽', currentPrice: 2000, previousPrice: 2050, unit: 'per quintal', mandi: 'Karimnagar', trend: 'down', change: -2.4 },
  { crop: 'Chillies', emoji: '🌶️', currentPrice: 15000, previousPrice: 13500, unit: 'per quintal', mandi: 'Guntur', trend: 'up', change: 11.1 },
  { crop: 'Sugarcane', emoji: '🎋', currentPrice: 3100, previousPrice: 2900, unit: 'per tonne', mandi: 'Thanjavur', trend: 'up', change: 6.9 },
  { crop: 'Ragi', emoji: '🌾', currentPrice: 3800, previousPrice: 3600, unit: 'per quintal', mandi: 'Mysuru', trend: 'up', change: 5.6 },
  { crop: 'Coconut', emoji: '🥥', currentPrice: 12500, previousPrice: 13000, unit: 'per 1000 nuts', mandi: 'Thrissur', trend: 'down', change: -3.8 },
  { crop: 'Black Gram', emoji: '🫘', currentPrice: 7000, previousPrice: 6600, unit: 'per quintal', mandi: 'Madurai', trend: 'up', change: 6.1 },
];

export const getSeasonForMonth = (month) => {
  if (month >= 5 && month <= 10) return 'kharif';
  return 'rabi';
};

export const getRandomDisease = () => {
  const idx = Math.floor(Math.random() * diseaseDatabase.length);
  return diseaseDatabase[idx];
};
