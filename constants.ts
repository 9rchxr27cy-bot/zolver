
import { User, JobRequest, Proposal, Review, Category } from './types';

// Expanded Categories List for the "All Services" Catalog (80+ Items)
export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  // --- HOME & CONSTRUCTION ---
  { id: 'Cleaning', label: 'Cleaning', icon: 'Sparkles' },
  { id: 'Electrician', label: 'Electrician', icon: 'Zap' },
  { id: 'Plumbing', label: 'Plumbing', icon: 'Droplets' },
  { id: 'Gardening', label: 'Gardening', icon: 'Flower2' },
  { id: 'SolarEnergy', label: 'Solar & Battery', icon: 'Sun' },
  { id: 'Painter', label: 'Painter', icon: 'Paintbrush' },
  { id: 'Carpenter', label: 'Carpenter', icon: 'Hammer' },
  { id: 'Roofer', label: 'Roofer', icon: 'Home' },
  { id: 'HVAC', label: 'Heating & AC', icon: 'Thermometer' },
  { id: 'Locksmith', label: 'Locksmith', icon: 'Lock' },
  { id: 'Flooring', label: 'Flooring', icon: 'Grid' },
  { id: 'PoolMaintenance', label: 'Pool Maintenance', icon: 'Droplets' },
  { id: 'PestControl', label: 'Pest Control', icon: 'Bug' },
  { id: 'InteriorDesign', label: 'Interior Design', icon: 'Layout' },
  { id: 'Handyman', label: 'Handyman', icon: 'Wrench' },
  { id: 'Mason', label: 'Mason / Bricklayer', icon: 'Hammer' },
  { id: 'Welder', label: 'Welder', icon: 'Zap' },
  { id: 'Glazier', label: 'Glazier (Windows)', icon: 'Grid' },
  { id: 'ChimneySweep', label: 'Chimney Sweep', icon: 'Home' },
  { id: 'SecuritySys', label: 'Security Systems', icon: 'Shield' },
  { id: 'SmartHome', label: 'Smart Home Install', icon: 'Wifi' },
  { id: 'FengShui', label: 'Feng Shui Consultant', icon: 'Compass' },
  { id: 'Architect', label: 'Architect', icon: 'PenTool' },
  { id: 'Insulation', label: 'Insulation Expert', icon: 'Home' },
  { id: 'Demolition', label: 'Demolition Service', icon: 'Hammer' },

  // --- AUTO & TRANSPORT ---
  { id: 'Mechanic', label: 'Mechanic', icon: 'Wrench' },
  { id: 'ElectricVehicle', label: 'Electric Vehicle', icon: 'Zap' },
  { id: 'AutoBody', label: 'Auto Body & Paint', icon: 'Paintbrush' },
  { id: 'CarWash', label: 'Car Wash', icon: 'Droplets' },
  { id: 'Towing', label: 'Towing Service', icon: 'Truck' },
  { id: 'Micromobility', label: 'Scooters & Bikes', icon: 'Bike' },
  { id: 'Moving', label: 'Moving', icon: 'Truck' },
  { id: 'Driver', label: 'Private Driver', icon: 'Car' },
  { id: 'DrivingInstructor', label: 'Driving Instructor', icon: 'Car' },
  { id: 'BoatMechanic', label: 'Boat Mechanic', icon: 'Anchor' },
  { id: 'BikeRepair', label: 'Bicycle Repair', icon: 'Bike' },
  { id: 'CarDetailing', label: 'Car Detailing', icon: 'Sparkles' },
  { id: 'Logistics', label: 'Logistics / Courier', icon: 'Truck' },

  // --- TECH & DIGITAL ---
  { id: 'IT Support', label: 'IT Support', icon: 'Laptop' },
  { id: 'WebDev', label: 'Web Developer', icon: 'Code' },
  { id: 'GraphicDesign', label: 'Graphic Design', icon: 'PenTool' },
  { id: 'VideoEditor', label: 'Video Editor', icon: 'Video' },
  { id: 'SEO', label: 'SEO Specialist', icon: 'Search' },
  { id: 'SocialMedia', label: 'Social Media Manager', icon: 'Smartphone' },
  { id: 'DataRecovery', label: 'Data Recovery', icon: 'Database' },
  { id: 'PhoneRepair', label: 'Phone/Tablet Repair', icon: 'Smartphone' },
  { id: 'ApplianceRepair', label: 'Appliance Repair', icon: 'Wrench' },
  { id: 'NetworkAdmin', label: 'Network Admin', icon: 'Wifi' },
  { id: 'CyberSecurity', label: 'Cyber Security', icon: 'Lock' },

  // --- BUSINESS & LEGAL ---
  { id: 'Accountant', label: 'Accountant', icon: 'FileText' },
  { id: 'Translator', label: 'Translator', icon: 'Languages' },
  { id: 'Lawyer', label: 'Lawyer / Legal', icon: 'Briefcase' },
  { id: 'Notary', label: 'Notary Services', icon: 'FileText' },
  { id: 'TaxAdvisor', label: 'Tax Advisor', icon: 'FileText' },
  { id: 'HRConsultant', label: 'HR Consultant', icon: 'Users' },
  { id: 'Copywriter', label: 'Copywriter', icon: 'Edit3' },
  { id: 'BusinessCoach', label: 'Business Coach', icon: 'TrendingUp' },
  { id: 'VirtualAssistant', label: 'Virtual Assistant', icon: 'Laptop' },

  // --- EVENTS & PARTY ---
  { id: 'EventPlanner', label: 'Event Planner', icon: 'Calendar' },
  { id: 'DJ', label: 'DJ & Music', icon: 'Music' },
  { id: 'Photographer', label: 'Photographer', icon: 'Camera' },
  { id: 'Caterer', label: 'Caterer / Food', icon: 'ChefHat' },
  { id: 'Florist', label: 'Florist', icon: 'Flower2' },
  { id: 'Musician', label: 'Live Musician/Band', icon: 'Music' },
  { id: 'Magician', label: 'Magician / Entertainer', icon: 'Sparkles' },
  { id: 'Bartender', label: 'Private Bartender', icon: 'Glass' },
  { id: 'WeddingOfficiant', label: 'Wedding Officiant', icon: 'Heart' },
  { id: 'PartyDecorator', label: 'Party Decorator', icon: 'Gift' },

  // --- LIFESTYLE & CARE (Non-Medical) ---
  { id: 'Beauty', label: 'Beauty & Esthetics', icon: 'Scissors' },
  { id: 'Pet Sitter', label: 'Pet Sitter', icon: 'Dog' },
  { id: 'Hairdresser', label: 'Hairdresser', icon: 'Scissors' },
  { id: 'MakeupArtist', label: 'Makeup Artist', icon: 'Smile' },
  { id: 'PersonalTrainer', label: 'Personal Trainer', icon: 'Dumbbell' },
  { id: 'Yoga', label: 'Yoga Instructor', icon: 'Flower2' },
  { id: 'Massage', label: 'Massage (Relax)', icon: 'Heart' }, // Strictly relaxation
  { id: 'Babysitter', label: 'Babysitter', icon: 'Baby' },
  { id: 'Chef', label: 'Personal Chef', icon: 'ChefHat' },
  { id: 'Tailor', label: 'Tailor / Alterations', icon: 'Scissors' },
  { id: 'Shoemaker', label: 'Shoemaker / Cobbler', icon: 'Wrench' },
  { id: 'PersonalShopper', label: 'Personal Shopper', icon: 'ShoppingBag' },
  { id: 'LifeCoach', label: 'Life Coach', icon: 'Compass' },
  { id: 'Astrologer', label: 'Astrologer / Tarot', icon: 'Star' },
  { id: 'TravelPlanner', label: 'Travel Planner', icon: 'Globe' },
  { id: 'DogWalker', label: 'Dog Walker', icon: 'Dog' },
  { id: 'DogTrainer', label: 'Dog Trainer', icon: 'Dog' },

  // --- EDUCATION & MUSIC ---
  { id: 'Tutor', label: 'Tutor / Schooling', icon: 'BookOpen' },
  { id: 'LanguageTutor', label: 'Language Tutor', icon: 'Languages' },
  { id: 'MusicTeacher', label: 'Music Teacher', icon: 'Music' },
  { id: 'ArtTeacher', label: 'Art Teacher', icon: 'Palette' },
  { id: 'CodingTutor', label: 'Coding Instructor', icon: 'Code' },
  { id: 'MathTutor', label: 'Math Tutor', icon: 'Calculator' }
];

export const MOCK_CLIENT: User = {
  id: 'client-1',
  name: 'Sophie',
  surname: 'Weber',
  email: 'sophie.weber@email.lu',
  phone: '+352 691 555 123',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
  role: 'CLIENT',
  languages: ['LB', 'FR', 'DE', 'EN'],
  addresses: [
    {
      id: 'addr-c1',
      label: 'Home',
      street: 'Route de Longwy',
      number: '8',
      postalCode: 'L-8080',
      locality: 'Bertrange',
      country: 'Luxembourg',
      floor: 'Ground',
      hasElevator: false,
      easyParking: true,
      coordinates: { lat: 49.6116, lng: 6.052 }
    }
  ],
  twoFactorEnabled: true,
};

export const MOCK_PRO: User = {
  id: 'pro-1',
  name: 'Jean-Pierre',
  surname: 'Schmit',
  email: 'jp.schmit@jps-lux.lu', // pro login
  phone: '+352 621 888 999',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JP',
  role: 'PRO',
  isVerified: true,
  level: 'Master',
  xp: 12500,
  rating: 4.95,
  reviewsCount: 342,
  joinedDate: '2019',
  bio: 'Expert sanitär & chauffage pour toute installation et dépannage urgence 24/7. JPS Lux est votre partenaire de confiance depuis 10 ans.',
  languages: ['LB', 'FR', 'DE', 'PT', 'EN'],
  addresses: [
    {
      id: 'addr-p1',
      label: 'Bureau / Atelier',
      street: 'Rue de Hollerich',
      number: '15',
      postalCode: 'L-1741',
      locality: 'Luxembourg',
      country: 'Luxembourg',
      coordinates: { lat: 49.6, lng: 6.13 }
    }
  ],
  // Smart Reply Config
  autoReplyConfig: {
    enabled: true,
    delay: 0,
    template: 'AGILITY'
  },
  companyDetails: {
    legalName: "JPS Lux S.à r.l.",
    legalType: "societe",
    vatNumber: "LU25896314",
    rcsNumber: "B123456",
    licenseNumber: "10098765/1",
    licenseExpiry: "2028-12-31",
    iban: "LU88 1111 2222 3333 44",
    bankName: "Spuerkeess (BCEE)",
    plan: "Founder",
    cardLast4: "9876",
    cardBrand: "MasterCard"
  },
  services: [
    { id: 'Plumbing', price: 90, unit: 'hour' },
    { id: 'HVAC', price: 110, unit: 'hour' },
    { id: 'SolarEnergy', price: 0, unit: 'project' } // Quote based
  ]
};

export const MOCK_EMPLOYEE: User = {
  id: 'staff-1',
  name: 'Marco',
  surname: 'Ferreira',
  email: 'marco.ferreira@jps-lux.lu',
  phone: '+352 661 777 666',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
  role: 'EMPLOYEE',
  companyId: 'pro-1',
  jobTitle: 'Installateur Qualifié',
  isActive: true,
  languages: ['PT', 'FR', 'LB'],
  addresses: [],
  // HR Data
  nationality: 'Portuguese',
  cnsNumber: '1990052012345',
  idCardNumber: 'PT98765432',
  birthDate: '1990-05-20',
  isVerified: true,
  level: 'Professional'
};

// Jobs including past jobs for analytics
export const MOCK_JOBS: JobRequest[] = [
  // Active Job: Waiting for Client Confirmation
  {
    id: 'job-active-1',
    clientId: 'client-1',
    assignedTo: 'pro-1', // Assigned to JP
    category: 'Plumbing',
    title: 'Fuite d\'eau salle de bain', // Added title
    description: 'Urgent: Fuite importante sous le lavabo, risque d\'inondation.',
    photos: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400'],
    urgency: 'URGENT',
    suggestedPrice: 150,
    finalPrice: 0,
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    location: '8, Route de Longwy, Bertrange',
    distance: '4.2 km',
    clientName: "Sophie Weber", // Denormalized for simpler display
    clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie'
  },
  // Past Jobs
  {
    id: 'job-old-1',
    clientId: 'client-1',
    assignedTo: 'pro-1',
    category: 'HVAC',
    title: 'Entretien Chaudière',
    description: 'Entretien annuel chaudière gaz.',
    photos: [],
    urgency: 'PLANNING',
    suggestedPrice: 220,
    finalPrice: 220,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
    finishedAt: new Date(Date.now() - 504800000).toISOString(),
    location: 'Bertrange',
    distance: '4.2 km',
    clientName: "Sophie Weber",
    clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    reviewId: 'r1'
  },
  {
    id: 'job-old-2',
    clientId: 'client-99',
    assignedTo: 'pro-1',
    category: 'Plumbing',
    title: 'Installation WC',
    description: 'Nouveau WC suspendu Geberit.',
    photos: [],
    urgency: 'THIS_WEEK',
    suggestedPrice: 450,
    finalPrice: 500,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 1209600000).toISOString(), // 14 days ago
    finishedAt: new Date(Date.now() - 1109600000).toISOString(),
    location: 'Luxembourg Gare',
    distance: '1.5 km',
    clientName: "Marc T.",
    clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marc'
  }
];

export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    jobId: 'job-active-1',
    proId: 'pro-1',
    proName: 'JPS Lux S.à r.l.',
    proAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JP',
    proLevel: 'Master',
    proRating: 4.95,
    price: 150,
    message: 'Bonjour Sophie, nous avons une équipe disponible dans 30 minutes pour votre fuite.',
    distance: '4.2 km',
    createdAt: new Date(Date.now() - 3000000).toISOString(), // 50 mins ago
    status: 'ACCEPTED'
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    jobId: 'job-old-1',
    clientId: 'client-1',
    clientName: 'Sophie W.',
    proId: 'pro-1',
    service: 'HVAC',
    price: 220,
    rating: 5,
    comment: 'Service impeccable, très propre et ponctuel. Je recommande vivement JP.',
    date: 'Il y a 1 semaine'
  },
  {
    id: 'r2',
    jobId: 'job-old-2',
    clientId: 'client-99',
    clientName: 'Marc T.',
    proId: 'pro-1',
    service: 'Plumbing',
    price: 500,
    rating: 5,
    comment: 'Travail pro.',
    date: 'Il y a 2 semaines'
  }
];

export const MOCK_TRANSACTIONS: any[] = [
  { id: 'tx1', date: '2023-10-01', amount: 220, description: 'Intervention Chaudière - Sophie W.', status: 'PAID', type: 'INCOME' },
  { id: 'tx2', date: '2023-10-05', amount: 500, description: 'Installation WC - Marc T.', status: 'PAID', type: 'INCOME' },
  { id: 'tx3', date: '2023-10-10', amount: -150, description: 'Achat Matériel - Facq', status: 'PAID', type: 'EXPENSE' }
];
