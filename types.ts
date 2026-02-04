
export type Role = 'CLIENT' | 'PRO' | 'EMPLOYEE' | 'TECHNICIAN' | 'MANAGER' | 'ADMIN';

// Changed to string to support the expanded catalog easily
export type Category = string;

export type LanguageCode = 'LB' | 'FR' | 'DE' | 'EN' | 'PT';

export interface Address {
  id: string;
  label: string; // Home, Work, etc
  street: string;
  number: string;
  postalCode: string;
  locality: string;
  country?: string; // Added country
  floor?: string;
  block?: string;
  residence?: string;
  hasElevator?: boolean;
  easyParking?: boolean;
  coordinates?: { lat: number; lng: number };
}

export type AutoReplyTemplate = 'AGILITY' | 'DATA' | 'CUSTOM';

export interface AutoReplyConfig {
  enabled: boolean;
  delay: number; // 0 (immediate), 5 (minutes), 15 (minutes)
  template: AutoReplyTemplate;
  customMessage?: string;
}

export interface CompanyDetails {
  legalName: string; // Nome da Empresa ou do Independente
  legalType: 'independant' | 'sarl-s' | 'sarl' | 'sa' | 'societe'; // Added societe as generic fallback
  rcsNumber?: string; // Registro de Comércio (Ex: B123456)
  vatNumber: string; // TVA (Ex: LU12345678)
  licenseNumber?: string; // Autorização de Estabelecimento
  licenseExpiry?: string; // Data
  iban: string;
  bic?: string; // Bank Identifier Code
  bankName?: string;
  description?: string; // Added for profile
  // Billing Fields
  plan?: 'Basic' | 'Premium' | 'Founder';
  cardLast4?: string;
  cardBrand?: string;
  // Business Hours
  openingTime?: string; // "09:00"
  closingTime?: string; // "18:00"
  workingDays?: string[]; // Array of days e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
}

export interface User {
  id: string;
  name: string;
  surname?: string;
  avatar: string;
  role: Role;
  onboardingStep?: number; // Added for flow control
  email: string;
  status?: 'active' | 'suspended' | 'pending' | 'inactive'; // Added for account status
  phone?: string;
  password?: string; // NEW: Password field for login logic
  languages: LanguageCode[];
  addresses: Address[];
  companyDetails?: CompanyDetails; // New Field
  autoReplyConfig?: AutoReplyConfig; // NEW: Smart Reply Settings
  isVerified?: boolean;
  level?: 'Novice' | 'Professional' | 'Expert' | 'Master';
  xp?: number;
  rating?: number;
  reviewsCount?: number;
  joinedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  bio?: string;
  twoFactorEnabled?: boolean;
  // User Preferences
  favorites?: string[]; // Array of User IDs
  blockedUsers?: string[]; // Array of User IDs

  username?: string; // Handle
  username_lower?: string; // FOR SEARCH OPTIMIZATION
  followers?: string[]; // Array of User IDs
  following?: string[]; // Array of User IDs
  instagram_url?: string;

  // Shortcuts for UI (optional, might be in companyDetails)
  openingTime?: string;
  closingTime?: string;

  // Paid Boosts (Marketing)
  isBoosted?: boolean;
  boostExpiresAt?: any; // Using 'any' to be flexible with Firebase Timestamp or Date string, but practically Timestamp
  boostPlan?: '3_DAYS' | '7_DAYS' | '30_DAYS';

  // Monetization Testing Fields
  marketingPlan?: string;
  isPromoted?: boolean;
  planActivatedAt?: string;
  promotedUntil?: string;

  // Profile Visuals
  coverImage?: string;
  websiteTheme?: 'modern' | 'classic' | 'bold' | 'minimalist';
  primaryColor?: string;

  // Rich Content (Public Profile 2.0)
  videoUrl?: string; // YouTube/Vimeo Link
  serviceRadius?: number; // km
  expertTips?: { title: string; content: string }[]; // SEO Content


  // EMPLOYEE SPECIFIC - HR DATA (LUXEMBOURG COMPLIANCE)
  companyId?: string; // Links employee to the Boss (Pro)
  isEmployee?: boolean; // NEW: Explicit flag to mark user as employee
  jobTitle?: string; // e.g., "Senior Technician"
  isActive?: boolean; // For deactivating employees without deleting history
  nationality?: string; // Origin country
  cnsNumber?: string; // Luxembourg Social Security (13 digits: YYYYMMDDXXXXX)
  taxClass?: 'Class 1' | 'Class 1a' | 'Class 2'; // Impôt sur le revenu
  iban?: string; // For salary payment
  idCardNumber?: string; // Identity Card / Passport
  birthDate?: string; // Date of birth for HR records
  services?: { id: string; price?: number; unit?: string }[]; // Added to support service filtering
}

export interface Review {
  id: string;
  jobId?: string; // Added
  proId?: string; // Added/Optional
  clientId?: string; // Added/Optional
  clientName?: string; // Added
  service: string;
  price: number;
  rating: number;
  comment: string;
  date: string;
  employeeId?: string;
}

export type JobStatus =
  | 'OPEN'
  | 'WAITING_PROVIDER_CONFIRMATION' // Added for Direct Request flow
  | 'WAITING_CLIENT_CONFIRMATION' // Added for review flow
  | 'FUNDS_ESCROWED' // Funds held in vault
  | 'NEGOTIATING'
  | 'CONFIRMED'   // Pro aceito
  | 'EN_ROUTE'    // A caminho
  | 'ARRIVED'     // Chegou no local
  | 'IN_PROGRESS' // Trabalho iniciado
  | 'REVIEW_PENDING' // Pro terminou, aguardando Cliente confirmar
  | 'PAYMENT_PENDING' // Cliente confirmou, aguardando Pro confirmar pgto
  | 'COMPLETED'   // Finalizado e pago
  | 'CANCELLED'
  | 'STARTED'     // Iniciado oficialmente
  | 'FINISHED'    // Pro terminou (novo status)
  | 'PAID';       // Pago mas talvez não finalizado (ex: aguardando review)

export interface JobRequest {
  id: string;
  clientId: string;
  assignedTo?: string; // Added
  clientName?: string;
  clientAvatar?: string; // Added
  category: Category;
  title?: string;
  description: string;
  photos: string[];
  location: string;
  urgency: 'URGENT' | 'THIS_WEEK' | 'PLANNING' | 'SPECIFIC_DATE';
  scheduledDate?: string; // Format YYYY-MM-DD
  suggestedPrice?: number;
  finalPrice?: number; // Preço acordado final
  reviewId?: string; // Added for linking reviews
  hasReview?: boolean; // Added to track if review exists
  status: JobStatus;
  createdAt: string;
  startedAt?: string; // ISO String
  finishedAt?: string; // ISO String
  proposalsCount?: number;
  distance?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER'; // New Field
  // Manual / External Job Fields
  isExternal?: boolean;
  externalClientName?: string;

  // EXECUTION WORKFLOW
  isLocked?: boolean;
  lockedBy?: string; // ID of the Pro
  executionStep?: 'PENDING' | 'EN_ROUTE' | 'ARRIVED' | 'STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'PAID' | 'COMPLETED' | 'FUNDS_ESCROWED';

  // DIRECT REQUEST
  is_direct_request?: boolean;
  target_company_id?: string;

  // TEAM MANAGEMENT
  // TEAM MANAGEMENT
  assignedEmployeeId?: string | null; // ID of the Employee assigned to this job
  startCode?: string; // 4-digit security code
  acceptedProposalId?: string; // Links to the accepted proposal
}

export interface Proposal {
  id: string;
  jobId: string;
  proId: string;
  proName: string;
  proAvatar: string;
  proLevel: string;
  proRating: number;
  price: number;
  message: string;
  distance: string; // e.g., '3.2 km'
  createdAt: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NEGOTIATING'; // Added NEGOTIATING
}

export interface OfferDetails {
  oldPrice: number;
  newPrice: number;
  reason: string;
  newDate?: string;
  newTime?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

// LUXEMBOURG INVOICE MODEL
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number; // 17, 3, etc.
  total: number;
}

export interface Invoice {
  id: string; // Format: YYYY-XXXX
  date: string;
  dueDate: string;
  issuer: CompanyDetails & { address: string };
  client: { name: string; address: string; vatNumber?: string };
  items: InvoiceItem[];
  subtotalHT: number; // Hors Taxe
  totalVAT: number;   // TVA
  totalTTC: number;   // Toutes Taxes Comprises
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  language: 'FR' | 'EN' | 'DE';
  paymentMethod?: string; // New Field to display on PDF
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT' | 'EXPENSE'; // Added EXPENSE
  status: 'COMPLETED' | 'PENDING';
  invoiceId?: string;
  jobId?: string;
  category?: 'Material' | 'Fuel' | 'Equipment' | 'Other' | string; // Expense Category
  vatAmount?: number; // TVA paid on expense or collected on sale
  vatRate?: number; // %
  paymentMethod?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string; // Optional now, used for text messages
  timestamp: string;
  isSystem?: boolean;
  isAutoReply?: boolean; // NEW: Distinguish bot messages
  type: 'text' | 'image' | 'offer_update' | 'receipt' | 'invoice' | 'assignment' | 'PROPOSAL'; // Added 'PROPOSAL' as requested
  offerDetails?: OfferDetails;
  assignmentDetails?: { // New Payload
    technicianId: string; // NEW: To fetch profile
    technicianName: string;
    technicianAvatar: string;
  };
  receiptDetails?: {
    startTime: string;
    endTime: string;
    duration: string;
  };
  invoiceDetails?: Invoice;
}

// ----------------------------------------------------
// STORE / E-COMMERCE TYPES
// ----------------------------------------------------

export type ProductCategory = 'MERCH' | 'TOOLS' | 'UNIFORMS' | 'EQUIPMENT';
export type FulfillmentType = 'ZOLVER_INTERNAL' | 'PARTNER_DROPSHIP';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: ProductCategory;
  fulfillmentType: FulfillmentType;
  partnerId?: string; // If dropship
  brand?: string;
  stock: number;
  rating?: number;
  reviewsCount?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface StoreOrder {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  shippingAddress: Address;
  createdAt: string;
  paymentMethod: 'CARD' | 'STRIPE_MOCK';
  fulfillmentStatus?: {
    internal?: 'PENDING' | 'SHIPPED';
    partner?: 'PENDING' | 'REQUESTED' | 'SHIPPED';
  };
}




export interface BoostPlan {
  id: string; // '3_DAYS', '7_DAYS', '30_DAYS'
  name: string; // 'Turbo', 'Pro', 'Elite'
  durationDays: number;
  price: number;
  description?: string;
  features?: string[];
  isBestValue?: boolean;
  color: string; // 'blue', 'purple', 'amber'
  iconName?: 'Zap' | 'Star' | 'Crown';
}

export interface SubscriptionPlan {
  id: string; // 'starter', 'pro'
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  commissionRate: number; // e.g., 10 or 20
  features: string[];
}

export interface MonetizationConfig {
  docId: 'monetization'; // Singleton ID
  commissionRateDefault: number; // 15
  subscriptionPlans: SubscriptionPlan[];
  boostPlans: BoostPlan[];
}

export interface PartnerIntegration {
  id: string;
  name: string; // Makita, Bosch
  apiKey?: string;
  baseUrl?: string;
  isActive: boolean;
}

export interface SystemConfig {
  monetization: MonetizationConfig;
  partners: PartnerIntegration[];
}

// Replaces existing TeamMember
export interface TeamMember extends User {
  // Inherits all User properties (including HR data)
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  assignedJobs: string[];
}

export interface DatabaseContextType {
  users: User[];
  jobs: JobRequest[];
  proposals: Proposal[];
  chats: Record<string, ChatMessage[]>;
  transactions: Transaction[];
  products: Product[];
  systemConfig: SystemConfig | null; // Cached config
  createJob: (job: Partial<JobRequest>) => Promise<string>;
  updateJobStatus: (jobId: string, status: JobStatus) => Promise<void>;
  createProposal: (proposal: Partial<Proposal>) => Promise<string>;
  addChatMessage: (chatId: string, message: ChatMessage) => Promise<void>;
  updateChatMessage: (chatId: string, messageId: string, updates: Partial<ChatMessage>) => Promise<void>;
  createEmployee: (employeeData: User, password: string) => Promise<void>;
  addTransaction: (tx: Transaction) => Promise<void>;
  followUser: (followerId: string, targetId: string) => Promise<void>;
  unfollowUser: (followerId: string, targetId: string) => Promise<void>;
  // STORE & CONFIG
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateSystemConfig: (data: Partial<MonetizationConfig>) => Promise<void>;
  addPartner: (partner: PartnerIntegration) => Promise<void>;
}

export interface SystemLog {
  id: string;
  errorCode: string;
  message: string;
  userId?: string;
  timestamp: string;
  deviceInfo?: string; // User Agent
  path?: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  idDocumentUrl: string;
  businessRegisterUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface Announcement {
  id: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  createdAt: string;
  active: boolean;
  expiresAt?: string;
}

export interface MarketGap {
  id: string;
  query: string;
  location: string;
  count: number;
  lastSearched: string;
}

// PROFESSIONAL CALENDAR SYSTEM
export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type AppointmentType = 'zolver_job' | 'external_job';

export interface Appointment {
  id: string;
  professionalId: string;
  clientId?: string; // Optional for external jobs
  jobId?: string; // Optional for external jobs

  title: string;
  description?: string;
  start_datetime: any; // Firestore Timestamp
  end_datetime: any; // Firestore Timestamp

  type: AppointmentType;

  // Location info (from job or manual)
  address?: any; // AddressFormData from job
  location?: string; // Human-readable location string

  // Financial
  value?: number;

  // Metadata
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp

  // Status
  status: AppointmentStatus;

  // Client info (for display)
  clientName?: string;
  clientAvatar?: string;
}