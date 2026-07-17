/* ============================================================
   Language Context — Lightweight and Non-refreshing switch
   Supports: English (en), Telugu (te), Hindi (hi), Tamil (ta)
   ============================================================ */
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    // Nav & Sidebar
    dashboard: 'Dashboard',
    requests: 'Farm Requests',
    machines: 'Machines',
    labours: 'Labours',
    nearby: 'Explore Nearby',
    ai_tools: 'AI Tools',
    disease_detection: 'Disease Detection',
    crop_guide: 'Crop Guide',
    market_prices: 'Market Prices',
    weather: 'Weather Info',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    search: 'Search...',
    notifications: 'Notifications',

    // Dashboard & Home
    welcome: 'Welcome back',
    jobs_done: 'Jobs Done',
    rating: 'Rating',
    radius: 'Radius',
    quick_actions: 'Quick Actions',
    find_labour: 'Find Labour',
    find_labour_desc: 'Hire workers nearby',
    find_machine: 'Find Machine',
    find_machine_desc: 'Rent farming equipment',
    my_requests: 'My Requests',
    my_requests_desc: 'Track your requests',
    explore_nearby: 'Explore Nearby',
    explore_nearby_desc: 'Browse all requests',
    my_machines: 'My Machines',
    my_machines_desc: 'Manage your listings',
    smart_intel: 'Smart Intelligence',
    disease_detection_desc: 'Scan plant diseases',
    crop_guide_desc: 'Smart crop advice',
    market_prices_desc: 'Live crop prices',
    recent_requests: 'Recent Requests',
    view_all: 'View All',

    // Profile Settings
    manage_roles: 'Manage Roles',
    switch_roles: 'Switch or add roles',
    search_radius: 'Search Range',
    range: 'Range',
    sign_out: 'Sign out of your account',
    edit_photo: 'Edit Photo',
    uploading: 'Uploading...',
  },
  te: {
    // Nav & Sidebar
    dashboard: 'డాష్‌బోర్డ్',
    requests: 'వ్యవసాయ అభ్యర్థనలు',
    machines: 'యంత్రాలు',
    labours: 'కూలీలు',
    nearby: 'దగ్గరలోని అభ్యర్థనలు',
    ai_tools: 'ఏఐ పరికరాలు',
    disease_detection: 'తెగుళ్ల గుర్తింపు',
    crop_guide: 'పంటల గైడ్',
    market_prices: 'మార్కెట్ ధరలు',
    weather: 'వాతావరణం',
    settings: 'సెట్టింగులు',
    profile: 'ప్రొఫైల్',
    logout: 'లాగౌట్',
    search: 'వెతకండి...',
    notifications: 'నోటిఫికేషన్లు',

    // Dashboard & Home
    welcome: 'స్వాగతం',
    jobs_done: 'పూర్తయిన పనులు',
    rating: 'రేటింగ్',
    radius: 'పరిధి',
    quick_actions: 'త్వరిత చర్యలు',
    find_labour: 'కూలీలను వెతకండి',
    find_labour_desc: 'దగ్గర్లోని కూలీలను నియమించుకోండి',
    find_machine: 'యంత్రాన్ని వెతకండి',
    find_machine_desc: 'వ్యవసాయ పరికరాలను అద్దెకు తీసుకోండి',
    my_requests: 'నా అభ్యర్థనలు',
    my_requests_desc: 'మీ అభ్యర్థనలను ట్రాక్ చేయండి',
    explore_nearby: 'దగ్గరలో అన్వేషించండి',
    explore_nearby_desc: 'అన్ని అభ్యర్థనలను బ్రౌజ్ చేయండి',
    my_machines: 'నా యంత్రాలు',
    my_machines_desc: 'మీ యంత్రాలను నిర్వహించండి',
    smart_intel: 'స్మార్ట్ ఇంటెలిజెన్స్',
    disease_detection_desc: 'మొక్కల తెగుళ్లను స్కాన్ చేయండి',
    crop_guide_desc: 'స్మార్ట్ పంటల సలహా',
    market_prices_desc: 'ప్రత్యక్ష మార్కెట్ ధరలు',
    recent_requests: 'ఇటీవలి అభ్యర్థనలు',
    view_all: 'అన్నీ చూడండి',

    // Profile Settings
    manage_roles: 'పాత్రలను నిర్వహించండి',
    switch_roles: 'పాత్రలను మార్చండి లేదా జోడించండి',
    search_radius: 'శోధన పరిధి',
    range: 'పరిధి',
    sign_out: 'ఖాతా నుండి నిష్క్రమించండి',
    edit_photo: 'ఫోటో మార్చండి',
    uploading: 'అప్‌లోడ్ అవుతోంది...',
  },
  hi: {
    // Nav & Sidebar
    dashboard: 'डैशबोर्ड',
    requests: 'कृषि अनुरोध',
    machines: 'मशीनें',
    labours: 'मजदूर',
    nearby: 'आसपास खोजें',
    ai_tools: 'एआई उपकरण',
    disease_detection: 'रोग की पहचान',
    crop_guide: 'फसल गाइड',
    market_prices: 'मंडी भाव',
    weather: 'मौसम की जानकारी',
    settings: 'सेटिंग्स',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉगआउट',
    search: 'खोजें...',
    notifications: 'अधिसूचनाएं',

    // Dashboard & Home
    welcome: 'स्वागत है',
    jobs_done: 'पूरे किए कार्य',
    rating: 'रेटिंग',
    radius: 'दायरा',
    quick_actions: 'त्वरित कार्रवाई',
    find_labour: 'मजदूर खोजें',
    find_labour_desc: 'आसपास के मजदूर किराए पर लें',
    find_machine: 'मशीन खोजें',
    find_machine_desc: 'खेती के उपकरण किराए पर लें',
    my_requests: 'मेरे अनुरोध',
    my_requests_desc: 'अपने अनुरोध ट्रैक करें',
    explore_nearby: 'आसपास खोजें',
    explore_nearby_desc: 'सभी अनुरोध ब्राउज़ करें',
    my_machines: 'मेरी मशीनें',
    my_machines_desc: 'अपनी सूचियाँ प्रबंधित करें',
    smart_intel: 'स्मार्ट इंटेलिजेंस',
    disease_detection_desc: 'पौधों के रोगों को स्कैन करें',
    crop_guide_desc: 'स्मार्ट फसल सलाह',
    market_prices_desc: 'लाइव मंडी भाव',
    recent_requests: 'हाल के अनुरोध',
    view_all: 'सभी देखें',

    // Profile Settings
    manage_roles: 'भूमिकाएं प्रबंधित करें',
    switch_roles: 'भूमिकाएं बदलें या जोड़ें',
    search_radius: 'खोज सीमा',
    range: 'दायरा',
    sign_out: 'खाते से लॉगआउट करें',
    edit_photo: 'फोटो बदलें',
    uploading: 'अपलोड हो रहा है...',
  },
  ta: {
    // Nav & Sidebar
    dashboard: 'டாஷ்போர்டு',
    requests: 'விவசாய கோரிக்கைகள்',
    machines: 'இயந்திரங்கள்',
    labours: 'தொழிலாளர்கள்',
    nearby: 'அருகிலுள்ள கோரிக்கைகள்',
    ai_tools: 'ஏஐ கருவிகள்',
    disease_detection: 'நோய் கண்டறிதல்',
    crop_guide: 'பயிர் வழிகாட்டி',
    market_prices: 'சந்தை விலைகள்',
    weather: 'வானிலை தகவல்',
    settings: 'அமைப்புகள்',
    profile: 'விவரக்குறிப்பு',
    logout: 'வெளியேறு',
    search: 'தேடு...',
    notifications: 'அறிவிப்புகள்',

    // Dashboard & Home
    welcome: 'வரவேற்கிறோம்',
    jobs_done: 'முடித்த வேலைகள்',
    rating: 'மதிப்பீடு',
    radius: 'வரம்பு',
    quick_actions: 'விரைவான செயல்கள்',
    find_labour: 'தொழிலாளர்களைத் தேடு',
    find_labour_desc: 'அருகிலுள்ள தொழிலாளர்களை நியமிக்கவும்',
    find_machine: 'இயந்திரத்தைத் தேடு',
    find_machine_desc: 'விவசாய உபகரணங்களை வாடகைக்கு எடுக்கவும்',
    my_requests: 'எனது கோரிக்கைகள்',
    my_requests_desc: 'உங்கள் கோரிக்கைகளை கண்காணிக்கவும்',
    explore_nearby: 'அருகில் ஆராயுங்கள்',
    explore_nearby_desc: 'அனைத்து கோரிக்கைகளையும் உலாவுங்கள்',
    my_machines: 'எனது இயந்திரங்கள்',
    my_machines_desc: 'உங்கள் இயந்திரங்களை நிர்வகிக்கவும்',
    smart_intel: 'ஸ்மார்ட் இன்டெலிஜென்ஸ்',
    disease_detection_desc: 'பயிர் நோய்களை ஸ்கேன் செய்யவும்',
    crop_guide_desc: 'ஸ்மார்ட் பயிர் ஆலோசனை',
    market_prices_desc: 'சந்தை விலைகள்',
    recent_requests: 'சமீபத்திய கோரிக்கைகள்',
    view_all: 'அனைத்தும் பார்',

    // Profile Settings
    manage_roles: 'பாத்திரங்களை நிர்வகி',
    switch_roles: 'பாத்திரங்களை மாற்றவும் அல்லது சேர்க்கவும்',
    search_radius: 'தேடல் வரம்பு',
    range: 'வரம்பு',
    sign_out: 'கணக்கிலிருந்து வெளியேறு',
    edit_photo: 'புகைப்படத்தை மாற்று',
    uploading: 'பதிவேற்றப்படுகிறது...',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('agrimatch_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('agrimatch_lang', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
