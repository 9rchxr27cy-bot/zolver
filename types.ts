
export type Role = 'CLIENT' | 'PRO' | 'EMPLOYEE' | null;

// Changed to string to support the expanded catalog easily
export type Category = string;

export type LanguageCode = 'LB' | 'FR' | 'DE' | 'EN' | 'PT';

export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  postalCode: string;
  locality: string;
  floor?: string;
  block?: string;
  residence?: string;
  hasElevator: boolean;
  easyParking: boolean;
  additionalInfo?: string;
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
  legalType: 'independant' | 'sarl-s' | 'sarl' | 'sa';
  rcsNumber?: string; // Registro de Comércio (Ex: B123456)
  vatNumber: string; // TVA (Ex: LU12345678)
  licenseNumber: string; // Autorização de Estabelecimento
  licenseExpiry: string; // Data
  iban: string;
  bic?: string; // Bank Identifier Code
  bankName?: string;
  // Billing Fields
  plan?: 'Basic' | 'Premium';
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
  email: string;
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
  bio?: string;
  twoFactorEnabled?: boolean;
  // User Preferences
  favorites?: string[]; // Array of User IDs
  blockedUsers?: string[]; // Array of User IDs

  username?: string; // Handle
  followers?: string[]; // Array of User IDs
  following?: string[]; // Array of User IDs
  instagram_url?: string;

  // Shortcuts for UI (optional, might be in companyDetails)
  openingTime?: string;
  closingTime?: string;

  // EMPLOYEE SPECIFIC - HR DATA
  companyId?: string; // Links employee to the Boss (Pro)
  jobTitle?: string; // e.g., "Senior Technician"
  isActive?: boolean; // For deactivating employees without deleting history
  nationality?: string; // NEW: Origin country
  cnsNumber?: string; // NEW: Luxembourg Social Security (Matricule)
  idCardNumber?: string; // NEW: Identity Card / Passport
  birthDate?: string; // NEW: Date of birth for HR records
}

export interface Review {
  id: string;
  service: string;
  price: number;
  rating: number;
  comment: string;
  date: string;
  employeeId?: string; // Added for staff reviews
}

export type JobStatus =
  | 'OPEN'
  | 'WAITING_PROVIDER_CONFIRMATION' // Added for Direct Request flow
  | 'WAITING_CLIENT_CONFIRMATION' // Added for review flow
  | 'NEGOTIATING'
  | 'CONFIRMED'   // Pro aceito
  | 'EN_ROUTE'    // A caminho
  | 'ARRIVED'     // Chegou no local
  | 'IN_PROGRESS' // Trabalho iniciado
  | 'REVIEW_PENDING' // Pro terminou, aguardando Cliente confirmar
  | 'PAYMENT_PENDING' // Cliente confirmou, aguardando Pro confirmar pgto
  | 'COMPLETED'   // Finalizado e pago
  | 'CANCELLED';

export interface JobRequest {
  id: string;
  clientId: string;
  clientName?: string; // Added for UI convenience
  category: Category;
  title?: string;
  description: string;
  photos: string[];
  location: string;
  urgency: 'URGENT' | 'THIS_WEEK' | 'PLANNING' | 'SPECIFIC_DATE';
  scheduledDate?: string; // Format YYYY-MM-DD
  suggestedPrice?: number;
  finalPrice?: number; // Preço acordado final
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

  // DIRECT REQUEST
  is_direct_request?: boolean;
  target_company_id?: string;

  // TEAM MANAGEMENT
  assignedTo?: string; // ID of the Employee assigned to this job
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
  estimatedTime?: string;
  createdAt: string;
  distance?: string;
  status?: JobStatus; // Added to pass initial state to Chat
}

export interface OfferDetails {
  oldPrice: number;
  newPrice: number;
  reason: string;
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
  type: 'CREDIT' | 'DEBIT'; // Credit = Income, Debit = Platform Fee
  status: 'COMPLETED' | 'PENDING';
  invoiceId?: string;
  jobId?: string;
  category?: string;
  paymentMethod?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string; // Optional now, used for text messages
  timestamp: string;
  isSystem?: boolean;
  isAutoReply?: boolean; // NEW: Distinguish bot messages
  type: 'text' | 'image' | 'offer_update' | 'receipt' | 'invoice' | 'assignment'; // Added 'assignment'
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
    totalAmount: number;
  };
  invoiceDetails?: Invoice; // Added for official invoice
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'ADMIN' | 'TECHNICIAN' | 'SUPPORT';
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatar: string;
  assignedJobs: string[]; // Job IDs
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'ADMIN' | 'TECHNICIAN' | 'SUPPORT';
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatar: string;
  assignedJobs: string[]; // Job IDs
}