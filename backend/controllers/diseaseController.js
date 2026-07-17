/* ============================================================
   Disease Detection Controller — Plant.id API + Mock fallback
   ============================================================ */
const axios = require('axios');
const { uploadToCloudinary } = require('../middleware/upload');

// Mock disease database (used when Plant.id API key is not set)
const DISEASE_DATABASE = [
  {
    id: 'leaf_blight', name: 'Leaf Blight', confidence: 89, severity: 'high', crop: 'Rice',
    cause: 'Caused by Helminthosporium oryzae fungus. Spreads rapidly in warm, humid conditions with poor drainage.',
    symptoms: ['Brown oval spots on leaves', 'Yellowing leaf margins', 'Lesions merge causing leaf death'],
    prevention: ['Use resistant varieties', 'Proper spacing between plants', 'Avoid excessive nitrogen fertilizer', 'Ensure good field drainage'],
    medicine: ['Mancozeb 75% WP @ 2g/litre', 'Propiconazole 25% EC @ 1ml/litre', 'Tricyclazole 75% WP @ 0.6g/litre'],
    icon: '🍂',
  },
  {
    id: 'powdery_mildew', name: 'Powdery Mildew', confidence: 92, severity: 'medium', crop: 'Tomato',
    cause: 'Caused by Oidium lycopersici fungus. Thrives in dry, warm weather with cool nights.',
    symptoms: ['White powdery coating on leaves', 'Curling and yellowing of leaves', 'Reduced fruit quality'],
    prevention: ['Good air circulation', 'Avoid overhead watering', 'Remove infected plant parts', 'Use disease-free seeds'],
    medicine: ['Sulphur 80% WP @ 3g/litre', 'Carbendazim 50% WP @ 1g/litre', 'Hexaconazole 5% EC @ 2ml/litre'],
    icon: '🔬',
  },
  {
    id: 'bacterial_wilt', name: 'Bacterial Wilt', confidence: 85, severity: 'high', crop: 'Brinjal',
    cause: 'Caused by Ralstonia solanacearum bacteria. Enters through roots in waterlogged soils.',
    symptoms: ['Sudden wilting of plants', 'Browning of vascular tissue', 'No yellowing before wilting'],
    prevention: ['Crop rotation with non-host crops', 'Use raised beds', 'Apply Trichoderma to soil', 'Avoid waterlogging'],
    medicine: ['Streptocycline @ 0.5g/litre', 'Copper oxychloride @ 3g/litre', 'Pseudomonas fluorescens soil drench'],
    icon: '🦠',
  },
  {
    id: 'yellow_mosaic', name: 'Yellow Mosaic Virus', confidence: 94, severity: 'high', crop: 'Black Gram',
    cause: 'Transmitted by whiteflies (Bemisia tabaci). Common in warm, dry conditions.',
    symptoms: ['Yellow patches on leaves', 'Mosaic pattern of green and yellow', 'Stunted growth', 'Pod deformation'],
    prevention: ['Control whitefly population', 'Use resistant varieties', 'Destroy infected plants early', 'Intercropping with cereals'],
    medicine: ['Imidacloprid 17.8% SL @ 0.3ml/litre', 'Thiamethoxam 25% WG @ 0.3g/litre', 'Neem oil 5% spray'],
    icon: '🌿',
  },
  {
    id: 'leaf_rust', name: 'Leaf Rust', confidence: 88, severity: 'medium', crop: 'Wheat',
    cause: 'Caused by Puccinia recondita fungus. Spreads through wind-borne spores in cool, moist conditions.',
    symptoms: ['Orange-brown pustules on leaf surface', 'Circular to oval shaped spots', 'Premature leaf drying'],
    prevention: ['Grow resistant varieties', 'Timely sowing', 'Balanced fertilization', 'Remove volunteer plants'],
    medicine: ['Propiconazole 25% EC @ 1ml/litre', 'Tebuconazole 25.9% EC @ 1ml/litre', 'Mancozeb 75% WP @ 2.5g/litre'],
    icon: '🍁',
  },
];

/**
 * @route   POST /api/disease/detect
 * @desc    Detect crop disease from uploaded image
 * @access  Private
 */
const detectDisease = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a plant image' });
    }

    const plantIdKey = process.env.PLANTID_API_KEY;

    // Upload image to Cloudinary for storage
    let imageUrl = null;
    try {
      const uploaded = await uploadToCloudinary(req.file.buffer, 'agrimatch/disease');
      imageUrl = uploaded.secure_url;
    } catch (uploadErr) {
      console.warn('Cloudinary upload failed, proceeding with analysis:', uploadErr.message);
    }

    // Use Plant.id API if key is available
    if (plantIdKey && plantIdKey !== 'your_plant_id_api_key') {
      try {
        const base64Image = req.file.buffer.toString('base64');
        const response = await axios.post(
          'https://api.plant.id/v2/health_assessment',
          {
            images: [`data:${req.file.mimetype};base64,${base64Image}`],
            modifiers: ['crops_fast', 'similar_images'],
            disease_details: ['cause', 'description', 'treatment', 'classification'],
          },
          {
            headers: { 'Api-Key': plantIdKey, 'Content-Type': 'application/json' },
            timeout: 15000,
          }
        );

        const health = response.data.health_assessment;
        if (health && health.diseases && health.diseases.length > 0) {
          const topDisease = health.diseases[0];
          return res.json({
            success: true,
            isHealthy: health.is_healthy,
            imageUrl,
            disease: {
              name: topDisease.name,
              confidence: Math.round(topDisease.probability * 100),
              severity: topDisease.probability > 0.7 ? 'high' : topDisease.probability > 0.4 ? 'medium' : 'low',
              cause: topDisease.disease_details?.cause || 'Information not available',
              symptoms: topDisease.disease_details?.description ? [topDisease.disease_details.description] : [],
              prevention: topDisease.disease_details?.treatment?.biological || [],
              medicine: topDisease.disease_details?.treatment?.chemical || [],
            },
            source: 'plant.id',
          });
        }
      } catch (apiError) {
        console.warn('Plant.id API error, falling back to mock:', apiError.message);
      }
    }

    // Fallback: return a random disease from mock database
    const mockResult = DISEASE_DATABASE[Math.floor(Math.random() * DISEASE_DATABASE.length)];
    res.json({
      success: true,
      isHealthy: false,
      imageUrl,
      disease: mockResult,
      source: 'mock',
      note: 'Using demo data. Configure PLANTID_API_KEY for real AI detection.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { detectDisease };
