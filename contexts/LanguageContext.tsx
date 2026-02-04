import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fr' | 'de' | 'lb' | 'pt';

export const LANGUAGES_LIST: { code: Language; name: string; flag: string }[] = [
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'lb', name: 'Lëtzebuergesch', flag: '🇱🇺' }
];

interface Translations {
  // General
  welcome: string;
  findPro: string;
  searchPlaceholder: string;
  login: string;
  logout: string;
  signup: string;
  profile: string;
  messages: string;
  notifications: string;
  settings: string;

  // Job Status
  OPEN: string;
  IN_PROGRESS: string;
  COMPLETED: string;
  CANCELLED: string;

  // Tabs
  liveMarket: string;
  myRequests: string;
  historyTab: string;
  teamTab: string;

  // Actions
  postJob: string;
  viewDetails: string;
  accept: string;
  decline: string;
  hire: string;

  // Categories
  cleaning: string;
  moving: string;
  plumbing: string;
  electrical: string;
  painting: string;
  gardening: string;

  // Pro Dashboard
  opportunities: string;
  scanningJobs: string;
  financialErp: string;
  financialPerformance: string;
  addTransaction: string;
  exportReport: string;
  breakdown: string;
  noJobsPeriod: string;
  manageTeam: string;
  manageTeamDesc: string;
  addMember: string;
  staffAdded: string;
  saveEmployee: string;
  roleTitle: string;
  active: string;
  inactive: string;
  fullName: string;
  emailLogin: string;

  // Invoice
  invBillTo: string;
  invDate: string;
  invDue: string;
  invDesc: string;
  invQty: string;
  invRate: string;
  invTotal: string;
  invSubtotal: string;
  invVatAmt: string;
  invTotalDue: string;
  invFooter: string;

  // New
  detailsLabel: string;
  photosOptional: string;
  yourOffer: string;
  cancel: string;
  saveChanges: string;
  today: string;
  yesterday: string;
  noHistory: string;
  confirmDelete: string;
  noActiveRequests: string;
}

const translations: Record<Language, Translations> = {
  en: {
    welcome: "Welcome to Zolver",
    findPro: "Find a Pro",
    searchPlaceholder: "What service do you need?",
    login: "Log In",
    logout: "Log Out",
    signup: "Sign Up",
    profile: "Profile",
    messages: "Messages",
    notifications: "Notifications",
    settings: "Settings",
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    liveMarket: "Live Market",
    myRequests: "My Requests",
    historyTab: "History",
    teamTab: "Team",
    postJob: "Post a Job",
    viewDetails: "View Details",
    accept: "Accept",
    decline: "Decline",
    hire: "Hire",
    cleaning: "Cleaning",
    moving: "Moving",
    plumbing: "Plumbing",
    electrical: "Electrical",
    painting: "Painting",
    gardening: "Gardening",
    opportunities: "New Opportunities",
    scanningJobs: "Scanning for jobs nearby...",
    financialErp: "Financial & ERP",
    financialPerformance: "Track your business performance",
    addTransaction: "Add Transaction",
    exportReport: "Export Report",
    breakdown: "Breakdown",
    noJobsPeriod: "No transactions for this period",
    manageTeam: "Manage Team",
    manageTeamDesc: "Add and manage your technicians",
    addMember: "Add Member",
    staffAdded: "Staff member added successfully",
    saveEmployee: "Save Employee",
    roleTitle: "Role & Permissions",
    active: "Active",
    inactive: "Inactive",
    fullName: "Full Name",
    emailLogin: "Email (Login)",
    invBillTo: "Bill To",
    invDate: "Date",
    invDue: "Due Date",
    invDesc: "Description",
    invQty: "Qty",
    invRate: "Rate",
    invTotal: "Total",
    invSubtotal: "Subtotal",
    invVatAmt: "VAT Amount",
    invTotalDue: "Total Due",
    invFooter: "Thank you for your business!",
    detailsLabel: "Details",
    photosOptional: "Photos",
    yourOffer: "Your Offer",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    today: "Today",
    yesterday: "Yesterday",
    noHistory: "No history available",
    confirmDelete: "Confirm Delete",
    noActiveRequests: "No active requests found."
  },
  fr: {
    welcome: "Bienvenue sur Zolver",
    findPro: "Trouver un Pro",
    searchPlaceholder: "De quel service avez-vous besoin ?",
    login: "Connexion",
    logout: "Déconnexion",
    signup: "S'inscrire",
    profile: "Profil",
    messages: "Messages",
    notifications: "Notifications",
    settings: "Paramètres",
    OPEN: "Ouvert",
    IN_PROGRESS: "En Cours",
    COMPLETED: "Terminé",
    CANCELLED: "Annulé",
    liveMarket: "Marché en Direct",
    myRequests: "Mes Demandes",
    historyTab: "Historique",
    teamTab: "Équipe",
    postJob: "Publier une mission",
    viewDetails: "Voir Détails",
    accept: "Accepter",
    decline: "Refuser",
    hire: "Engager",
    cleaning: "Nettoyage",
    moving: "Déménagement",
    plumbing: "Plomberie",
    electrical: "Électricité",
    painting: "Peinture",
    gardening: "Jardinage",
    opportunities: "Nouvelles Opportunités",
    scanningJobs: "Recherche de missions à proximité...",
    financialErp: "Finance & ERP",
    financialPerformance: "Suivez la performance de votre entreprise",
    addTransaction: "Ajouter Transaction",
    exportReport: "Exporter Rapport",
    breakdown: "Détail",
    noJobsPeriod: "Aucune transaction pour cette période",
    manageTeam: "Gérer l'équipe",
    manageTeamDesc: "Ajoutez et gérez vos techniciens",
    addMember: "Ajouter Membre",
    staffAdded: "Membre ajouté avec succès",
    saveEmployee: "Enregistrer Employé",
    roleTitle: "Rôle et Permissions",
    active: "Actif",
    inactive: "Inactif",
    fullName: "Nom Complet",
    emailLogin: "Email (Connexion)",
    invBillTo: "Facturer à",
    invDate: "Date",
    invDue: "Échéance",
    invDesc: "Description",
    invQty: "Qté",
    invRate: "Prix Unitaire",
    invTotal: "Total",
    invSubtotal: "Sous-total",
    invVatAmt: "Montant TVA",
    invTotalDue: "Total à Payer",
    invFooter: "Merci de votre confiance !",
    detailsLabel: "Détails",
    photosOptional: "Photos",
    yourOffer: "Votre Offre",
    cancel: "Annuler",
    saveChanges: "Enregistrer",
    today: "Aujourd'hui",
    yesterday: "Hier",
    noHistory: "Aucun historique disponible",
    confirmDelete: "Confirmer la suppression",
    noActiveRequests: "Aucune demande active trouvée."
  },
  pt: {
    welcome: "Bem-vindo ao Zolver",
    findPro: "Encontrar Profissional",
    searchPlaceholder: "Que serviço precisa?",
    login: "Entrar",
    logout: "Sair",
    signup: "Registar",
    profile: "Perfil",
    messages: "Mensagens",
    notifications: "Notificações",
    settings: "Definições",
    OPEN: "Aberto",
    IN_PROGRESS: "Em Progresso",
    COMPLETED: "Concluído",
    CANCELLED: "Cancelado",
    liveMarket: "Mercado ao Vivo",
    myRequests: "Meus Pedidos",
    historyTab: "Histórico",
    teamTab: "Equipa",
    postJob: "Publicar Pedido",
    viewDetails: "Ver Detalhes",
    accept: "Aceitar",
    decline: "Recusar",
    hire: "Contratar",
    cleaning: "Limpezas",
    moving: "Mudanças",
    plumbing: "Canalização",
    electrical: "Eletricidade",
    painting: "Pintura",
    gardening: "Jardinagem",
    opportunities: "Novas Oportunidades",
    scanningJobs: "A procurar trabalhos próximos...",
    financialErp: "Finanças e ERP",
    financialPerformance: "Acompanhe o desempenho do seu negócio",
    addTransaction: "Adicionar Transação",
    exportReport: "Exportar Relatório",
    breakdown: "Detalhes",
    noJobsPeriod: "Sem transações neste período",
    manageTeam: "Gerir Equipa",
    manageTeamDesc: "Adicione e gerencie seus técnicos",
    addMember: "Adicionar Membro",
    staffAdded: "Funcionário adicionado com sucesso",
    saveEmployee: "Guardar Funcionário",
    roleTitle: "Função e Permissões",
    active: "Ativo",
    inactive: "Inativo",
    fullName: "Nome Completo",
    emailLogin: "Email (Login)",
    invBillTo: "Faturar a",
    invDate: "Data",
    invDue: "Vencimento",
    invDesc: "Descrição",
    invQty: "Qtd",
    invRate: "Preço Unit.",
    invTotal: "Total",
    invSubtotal: "Subtotal",
    invVatAmt: "IVA",
    invTotalDue: "Total a Pagar",
    invFooter: "Obrigado pela preferência!",
    detailsLabel: "Detalhes",
    photosOptional: "Fotos",
    yourOffer: "Sua Oferta",
    cancel: "Cancelar",
    saveChanges: "Guardar Alterações",
    today: "Hoje",
    yesterday: "Ontem",
    noHistory: "Sem histórico disponível",
    confirmDelete: "Confirmar Eliminação",
    noActiveRequests: "Nenhum pedido ativo encontrado."
  },
  de: {
    welcome: "Willkommen bei Zolver",
    findPro: "Profi finden",
    searchPlaceholder: "Welchen Service benötigen Sie?",
    login: "Anmelden",
    logout: "Abmelden",
    signup: "Registrieren",
    profile: "Profil",
    messages: "Nachrichten",
    notifications: "Benachrichtigungen",
    settings: "Einstellungen",
    OPEN: "Offen",
    IN_PROGRESS: "In Bearbeitung",
    COMPLETED: "Abgeschlossen",
    CANCELLED: "Storniert",
    liveMarket: "Live-Markt",
    myRequests: "Meine Anfragen",
    historyTab: "Verlauf",
    teamTab: "Team",
    postJob: "Auftrag posten",
    viewDetails: "Details ansehen",
    accept: "Akzeptieren",
    decline: "Ablehnen",
    hire: "Einstellen",
    cleaning: "Reinigung",
    moving: "Umzug",
    plumbing: "Sanitär",
    electrical: "Elektrik",
    painting: "Maler",
    gardening: "Garten",
    opportunities: "Neue Chancen",
    scanningJobs: "Suche nach Aufträgen in der Nähe...",
    financialErp: "Finanzen & ERP",
    financialPerformance: "Verfolgen Sie Ihre Geschäftsleistung",
    addTransaction: "Transaktion hinzufügen",
    exportReport: "Bericht exportieren",
    breakdown: "Aufschlüsselung",
    noJobsPeriod: "Keine Transaktionen in diesem Zeitraum",
    manageTeam: "Team verwalten",
    manageTeamDesc: "Techniker hinzufügen und verwalten",
    addMember: "Mitglied hinzufügen",
    staffAdded: "Mitarbeiter erfolgreich hinzugefügt",
    saveEmployee: "Mitarbeiter speichern",
    roleTitle: "Rolle & Berechtigungen",
    active: "Aktiv",
    inactive: "Inaktiv",
    fullName: "Vollständiger Name",
    emailLogin: "E-Mail (Login)",
    invBillTo: "Rechnung an",
    invDate: "Datum",
    invDue: "Fälligkeit",
    invDesc: "Beschreibung",
    invQty: "Menge",
    invRate: "Einzelpreis",
    invTotal: "Gesamt",
    invSubtotal: "Zwischensumme",
    invVatAmt: "MwSt Betrag",
    invTotalDue: "Gesamtbetrag",
    invFooter: "Vielen Dank für Ihr Vertrauen!",
    detailsLabel: "Details",
    photosOptional: "Fotos",
    yourOffer: "Ihr Angebot",
    cancel: "Abbrechen",
    saveChanges: "Änderungen speichern",
    today: "Heute",
    yesterday: "Gestern",
    noHistory: "Kein Verlauf verfügbar",
    confirmDelete: "Löschen bestätigen",
    noActiveRequests: "Keine aktiven Anfragen gefunden."
  },
  lb: {
    welcome: "Wëllkomm bei Zolver",
    findPro: "Fannt e Profi",
    searchPlaceholder: "Wéi e Service braucht Dir?",
    login: "Aloggen",
    logout: "Ausloggen",
    signup: "Registréieren",
    profile: "Profil",
    messages: "Messagen",
    notifications: "Notifikatiounen",
    settings: "Astellungen",
    OPEN: "Op",
    IN_PROGRESS: "Am Gaang",
    COMPLETED: "Fäerdeg",
    CANCELLED: "Ofgebrach",
    liveMarket: "Live Maart",
    myRequests: "Meng Ufroen",
    historyTab: "Verlaf",
    teamTab: "Equipe",
    postJob: "Aarbecht posten",
    viewDetails: "Detailer kucken",
    accept: "Akzeptéieren",
    decline: "Ofleenen",
    hire: "Engagéieren",
    cleaning: "Botzen",
    moving: "Plënnere",
    plumbing: "Sanitär",
    electrical: "Elektresch",
    painting: "Molen",
    gardening: "Gaardenaarbecht",
    opportunities: "Nei Méiglechkeeten",
    scanningJobs: "Sicht no Aarbechten an der Géigend...",
    financialErp: "Finanzen & ERP",
    financialPerformance: "Verfollegt Är Geschäftsleeschtung",
    addTransaction: "Transaktioun dobäisetzen",
    exportReport: "Rapport exportéieren",
    breakdown: "Detailer",
    noJobsPeriod: "Keng Transaktiounen an dëser Period",
    manageTeam: "Equipe verwalten",
    manageTeamDesc: "Techniker dobäisetzen an verwalten",
    addMember: "Member dobäisetzen",
    staffAdded: "Mataarbechter erfollegräich dobäigesat",
    saveEmployee: "Mataarbechter späicheren",
    roleTitle: "Roll & Berechtigungen",
    active: "Aktiv",
    inactive: "Inaktiv",
    fullName: "Ganzen Numm",
    emailLogin: "Email (Login)",
    invBillTo: "Rechnung un",
    invDate: "Datum",
    invDue: "Verfall",
    invDesc: "Beschreiwung",
    invQty: "Quantitéit",
    invRate: "Eenheetspräis",
    invTotal: "Total",
    invSubtotal: "Zwëschenzomm",
    invVatAmt: "TVA Betrag",
    invTotalDue: "Total ze bezuelen",
    invFooter: "Merci fir Äert Vertrauen!",
    detailsLabel: "Detailer",
    photosOptional: "Fotoen",
    yourOffer: "Är Offer",
    cancel: "Ofbriechen",
    saveChanges: "Ännerungen späicheren",
    today: "Haut",
    yesterday: "Gëschter",
    noHistory: "Kee Verlaf verfügbar",
    confirmDelete: "Läschen bestätegen",
    noActiveRequests: "Keng aktiv Ufroen fonnt."
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  tCategory: (cat: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from local storage on mount
  useEffect(() => {
    const storedLang = localStorage.getItem('zolver_language') as Language;
    if (storedLang && Object.keys(translations).includes(storedLang)) {
      setLanguage(storedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('zolver_language', lang);
  };

  const tCategory = (cat: string) => {
    const key = cat.toLowerCase().replace(' ', '') as keyof Translations;
    return translations[language][key] || cat;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: translations[language], tCategory }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
