
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from './components/Layout';
import { DashboardLayout } from './components/DashboardLayout';
import { WelcomeScreen, ProOnboarding, CompanyCreationScreen, LoginModal, ClientSignupModal, ForgotPasswordModal } from './screens/AuthScreens';
import { LandingScreen } from './screens/LandingScreen';
import { WizardScreen } from './screens/WizardScreen';
import { ClientDashboard, DashboardView } from './screens/ClientScreens'; // Updated import
import { ProDashboard } from './screens/ProScreens';
import { StaffDashboard } from './screens/StaffScreens';
import { ChatScreen } from './screens/ChatScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AdminDashboard } from './screens/AdminDashboard'; // Import Admin
import { AllServicesScreen } from './screens/AllServicesScreen';
import { StoreHome } from './screens/store/StoreHome';
import { ProPublicProfile } from './screens/public/ProPublicProfile';
import { CartDrawer } from './screens/store/CartDrawer';
import { CartProvider } from './contexts/CartContext';
import { User, Proposal, JobRequest } from './types';
import { MOCK_CLIENT, MOCK_PRO, MOCK_EMPLOYEE } from './constants';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserProfileModal, PortfolioOverlay, ServiceSelectionModal } from './components/ServiceModals';
import { useDatabase } from './contexts/DatabaseContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { RequestDraftProvider, useRequestDraft } from './contexts/RequestDraftContext';
import { sendNewOrderEmail } from './services/emailService';
import { TermsScreen } from './screens/legal/TermsScreen';
import { PrivacyScreen } from './screens/legal/PrivacyScreen';

const LoadingScreen: React.FC = () => (
  <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[9999] flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mb-4 relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          inset: -4,
          border: '4px solid transparent',
          borderTopColor: '#f97316',
          borderRadius: '9999px'
        }}
      />
    </div>
    <p className="text-slate-500 font-bold animate-pulse">Initializing Zolver...</p>
  </div>
);

const AppContent: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { users, jobs, proposals, registerUser, createJob, updateJob, updateUser } = useDatabase();
  const { userData, loading, login, signUp, logout: authLogout, resetPassword } = useAuth();
  const { saveDraft, clearDraft } = useRequestDraft();
  const currentUser = userData;

  const [screen, setScreen] = useState<'LANDING' | 'WIZARD' | 'DASHBOARD' | 'CHAT' | 'WELCOME' | 'ONBOARDING' | 'PROFILE' | 'COMPANY_CREATION' | 'ALL_CATEGORIES' | 'ADMIN' | 'STORE' | 'PUBLIC_PROFILE' | 'TERMS' | 'PRIVACY'>('LANDING');
  const [publicProId, setPublicProId] = useState<string>('');
  const [dashboardView, setDashboardView] = useState<DashboardView>('REQUESTS'); // Lifted state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [clientSignupOpen, setClientSignupOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // State to hold a job created by a guest before they log in
  const [pendingJob, setPendingJob] = useState<Partial<JobRequest> | null>(null);
  // State to hold the job currently being edited
  const [editingJob, setEditingJob] = useState<JobRequest | null>(null);

  // DIRECT BOOKING STATE
  const [directRequestTarget, setDirectRequestTarget] = useState<User | null>(null);
  const [wizardTargetPro, setWizardTargetPro] = useState<User | null>(null);

  useEffect(() => {
    // Sync to localStorage for legacy compatibility is handled in AuthContext

    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    // LEGAL PAGES ROUTING
    const path = location.pathname;
    if (path === '/terms') {
      setScreen('TERMS');
      return;
    }
    if (path === '/privacy') {
      setScreen('PRIVACY');
      return;
    }

    // LOGIN ROUTING
    if (path === '/login') {
      if (currentUser) {
        // Already logged in - redirect to dashboard
        navigate('/', { replace: true });
        setScreen('DASHBOARD');
      } else {
        // Not logged in - open modal and clear URL
        setAuthModalOpen(true);
        navigate('/', { replace: true });
      }
      return;
    }

    // REQUEST ROUTING (New /request/new?proId=...)
    if (path === '/request/new') {
      const params = new URLSearchParams(location.search);
      const intentProId = params.get('proId');

      if (intentProId && users.length > 0) {
        const targetPro = users.find(u => u.id === intentProId);
        if (targetPro) {
          setWizardTargetPro(targetPro);
          setSelectedCategory(targetPro.services?.[0]?.id || 'General');
          setEditingJob(null);
          setScreen('WIZARD');
        }
      }
      return; // Stop processing
    }

    // MANUAL ROUTING FOR PUBLIC PROFILE
    // path is already defined above
    const match = path.match(/^\/w\/([a-zA-Z0-9_-]+)$/);
    if (match && match[1]) {
      setPublicProId(match[1]);
      setScreen('PUBLIC_PROFILE');
    }

    // LEGACY DIRECT REQUEST HANDLING (Query params on root)
    const params = new URLSearchParams(location.search);
    const intentProId = params.get('proId');
    // Only process if at root OR if we didn't catch /request/new
    if (intentProId && path === '/') {
      const intentService = params.get('service');
      const intentAmount = params.get('amount') || "0";

      if (!loading && users.length > 0) {
        const targetPro = users.find(u => u.id === intentProId);
        if (targetPro) {
          setWizardTargetPro(targetPro);
          setSelectedCategory(intentService || targetPro.services?.[0]?.id || 'General');
          setEditingJob(null);

          setEditingJob({
            suggestedPrice: Number(intentAmount)
          } as any);

          setScreen('WIZARD');
          // Clean URL
          window.history.replaceState({}, '', '/');
        }
      }
    }

  }, [darkMode, loading, users, location]); // Added location dependency

  // If Auth is still loading, show splash screen to avoid "flash of unauthenticated content"
  if (loading) return <LoadingScreen />;

  // FIX: Always go to LANDING (Home Page) when clicking logo, UNLESS Admin
  const handleLogoClick = () => {
    if (currentUser?.role === 'ADMIN') {
      setScreen('ADMIN');
    } else {
      setEditingJob(null);
      setScreen('LANDING');
    }
  };

  const handleStartWizard = (category: string) => {
    setSelectedCategory(category);
    setEditingJob(null); // Clear editing state when starting new
    setScreen('WIZARD');
  };

  const handleEditRequest = (job: JobRequest) => {
    setEditingJob(job);
    setSelectedCategory(job.category);
    setScreen('WIZARD');
  };

  const handleLogin = (user: User) => {
    // This is now mostly handled by AuthContext state
    if (user.role === 'ADMIN' || user.email === 'ceo@zolver.lu') {
      setScreen('ADMIN');
    } else {
      setScreen('DASHBOARD');
    }
  };

  const handleLogout = () => {
    authLogout();
    setScreen('LANDING');
  };

  const handleSaveJob = (jobData: any) => {
    // 1. EXTRACT EXTRA FIELDS (Don't save to Job DB)
    const { saveAddress, addressDetails: newAddrDetails, ...cleanJobData } = jobData;

    // 2. HANDLE SAVE ADDRESS
    if (currentUser && saveAddress && newAddrDetails && newAddrDetails.city) {
      const currentAddresses = currentUser.addresses || [];
      // Simple check to avoid exact duplicates
      const exists = currentAddresses.some(a =>
        a.postalCode === newAddrDetails.postalCode &&
        a.street === newAddrDetails.street &&
        a.number === newAddrDetails.number
      );

      if (!exists) {
        const newAddressObj = {
          id: `addr-${Date.now()}`,
          label: newAddrDetails.city, // Default label
          street: newAddrDetails.street,
          number: newAddrDetails.number,
          postalCode: newAddrDetails.postalCode,
          locality: newAddrDetails.city,
          floor: newAddrDetails.floor || '',
          residence: newAddrDetails.residence || ''
        };

        // OPTIMISTIC UPDATE
        const updatedUser = {
          ...currentUser,
          addresses: [...currentAddresses, newAddressObj]
        };
        updateUser(currentUser.id, updatedUser);
        localStorage.setItem('servicebid_current_session_user', JSON.stringify(updatedUser)); // Persist session
      }
    }

    const commonData = {
      category: (editingJob ? editingJob.category : selectedCategory) as any,
      title: cleanJobData.title,
      description: cleanJobData.description,
      photos: cleanJobData.photos,
      location: cleanJobData.location || { city: 'Luxembourg', postalCode: '', street: '' }, // Fallback for safety
      urgency: cleanJobData.urgency,
      scheduledDate: cleanJobData.scheduledDate,
      suggestedPrice: Number(cleanJobData.suggestedPrice) || 0,
    };

    if (!currentUser) {
      // User is Guest: Save draft and OPEN MODAL (do not redirect)
      saveDraft({ ...commonData, suggestedPrice: commonData.suggestedPrice.toString() });
      setPendingJob(commonData); // Keep local state for immediate retry
      setAuthModalOpen(true);
    } else {
      if (editingJob) {
        // UPDATE EXISTING VIA DB
        updateJob({ ...editingJob, ...commonData });
        setEditingJob(null);
      } else {
        // CREATE NEW VIA DB
        const newJob: JobRequest = {
          ...commonData,
          id: `job-${crypto.randomUUID()}`,
          clientId: currentUser.id,
          status: 'OPEN',
          createdAt: new Date().toISOString(), // Use Real date
          proposalsCount: 0,
          photos: cleanJobData.photos || [],
          // DIRECT REQUEST FIELDS
          target_company_id: wizardTargetPro ? wizardTargetPro.id : null,
          is_direct_request: !!wizardTargetPro,
          assigned_employee_id: null
        } as JobRequest;

        createJob(newJob);

        // EMAIL NOTIFICATION (Direct Request)
        if (wizardTargetPro && wizardTargetPro.email) {
          sendNewOrderEmail(
            wizardTargetPro.email,
            wizardTargetPro.name,
            currentUser.name,
            commonData.title || commonData.category
          );
        }

      }
      setDirectRequestTarget(null); // Reset after save
      setWizardTargetPro(null); // Reset target
      clearDraft(); // Clear draft on success
      setScreen('DASHBOARD');
      setDashboardView('EXPLORE'); // Redirect to Market/Map (Explore View)
    }
  };

  // --- ACTIONS: Favorites & Blocking ---
  const handleToggleFavorite = (targetUserId: string) => {
    if (!currentUser) return;
    const currentFavs = currentUser.favorites || [];
    const newFavs = currentFavs.includes(targetUserId)
      ? currentFavs.filter(id => id !== targetUserId)
      : [...currentFavs, targetUserId];

    const updatedUser = { ...currentUser, favorites: newFavs };
    updateUser(currentUser.id, updatedUser); // Update in DB
    localStorage.setItem('servicebid_current_session_user', JSON.stringify(updatedUser)); // Update Session
  };

  const handleToggleBlock = (targetUserId: string) => {
    if (!currentUser) return;
    const currentBlocked = currentUser.blockedUsers || [];
    const newBlocked = currentBlocked.includes(targetUserId)
      ? currentBlocked.filter(id => id !== targetUserId)
      : [...currentBlocked, targetUserId];

    const updatedUser = { ...currentUser, blockedUsers: newBlocked };
    updateUser(currentUser.id, updatedUser); // Update in DB
    localStorage.setItem('servicebid_current_session_user', JSON.stringify(updatedUser)); // Update Session
  };

  const renderScreen = () => {
    switch (screen) {
      case 'TERMS':
        return <TermsScreen onBack={() => setScreen('LANDING')} />;
      case 'PRIVACY':
        return <PrivacyScreen onBack={() => setScreen('LANDING')} />;
      case 'LANDING':
        return (
          <LandingScreen
            onSelectCategory={(cat) => handleStartWizard(cat)}
            onRegisterPro={() => setScreen('WELCOME')}
            onOpenCompanyHelp={() => setScreen('COMPANY_CREATION')}
            onViewAllServices={() => setScreen('ALL_CATEGORIES')}
          />
        );
      case 'ALL_CATEGORIES':
        return (
          <AllServicesScreen
            onBack={() => {
              if (currentUser) {
                // Logged in: Return to Dashboard (Highlights view)
                setScreen('DASHBOARD');
                setDashboardView('FEATURED');
              } else {
                // Visitor: Return to Landing
                setScreen('LANDING');
              }
            }}
            onSelectCategory={(cat) => handleStartWizard(cat)}
          />
        );
      case 'STORE':
        return <StoreHome />;
      case 'WIZARD':
        return (
          <WizardScreen
            category={selectedCategory}
            currentUser={currentUser}
            initialData={editingJob} // Pass data for editing
            targetUser={wizardTargetPro}
            onComplete={(data) => handleSaveJob(data)}
            onCancel={() => {
              setEditingJob(null);
              setWizardTargetPro(null); // Reset target
              setScreen(currentUser ? 'DASHBOARD' : 'LANDING');
              if (currentUser) setDashboardView('REQUESTS'); // Redirect to Dashboard (Requests/Orders)
            }}
          />
        );
      case 'WELCOME':
        return <WelcomeScreen onLogin={(role) => {
          if (role === 'CLIENT') {
            setClientSignupOpen(true);
          }
          else setScreen('ONBOARDING');
        }} />;
      case 'ONBOARDING':
        return <ProOnboarding onComplete={(data) => {
          signUp(data.email, data.password, {
            name: data.fullName,
            phone: data.phone,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.fullName}`,
            role: 'PRO',
            isVerified: false,
            level: 'Novice',
            xp: 0,
            rating: 5.0,
            languages: ['EN', 'FR'],
            addresses: [{
              id: 'addr-pro',
              label: 'Business',
              street: data.street,
              number: data.houseNumber,
              postalCode: data.postalCode,
              locality: data.locality,
              hasElevator: false,
              easyParking: true
            }],
            companyDetails: {
              legalName: data.companyName || data.fullName,
              legalType: data.legalType,
              vatNumber: data.tvaNumber,
              rcsNumber: data.rcsNumber,
              licenseNumber: data.licenseNum,
              licenseExpiry: data.licenseExpiry,
              iban: data.iban,
              plan: data.selectedPlan
            }
          });
          setScreen('DASHBOARD');
        }} />;
      case 'COMPANY_CREATION':
        return <CompanyCreationScreen onBack={() => setScreen('LANDING')} />;
      case 'DASHBOARD':
        if (!currentUser) return <LandingScreen onSelectCategory={handleStartWizard} onRegisterPro={() => setScreen('WELCOME')} onViewAllServices={() => setScreen('ALL_CATEGORIES')} />;

        if (currentUser.role === 'CLIENT') {
          return (
            <DashboardLayout
              currentView={dashboardView}
              onViewChange={setDashboardView}
              onStoreClick={() => setScreen('STORE')}
              onHomeClick={() => setDashboardView('REQUESTS')}
              onProfileClick={() => setScreen('PROFILE')}
            >
              <ClientDashboard
                // Filter jobs from DB for this client
                jobs={jobs.filter(j => j.clientId === currentUser.id)}
                onSelectProposal={(p) => {
                  setActiveProposal(p);
                  // Do not switch screen, let Dashboard handle split-view/overlay
                }}
                onCreateNew={() => setScreen('ALL_CATEGORIES')}
                onViewProfile={() => setScreen('PROFILE')}
                onEdit={handleEditRequest}
                onDirectRequest={(pro) => setDirectRequestTarget(pro)} // Set target
                onHireAgain={(pro, category) => {
                  setWizardTargetPro(pro);
                  setSelectedCategory(category);
                  setEditingJob(null);
                  setScreen('WIZARD');
                }}
                onStoreClick={() => setScreen('STORE')} // NEW: Pass Store navigation callback
                favorites={currentUser.favorites}
                currentView={dashboardView}
                onViewChange={setDashboardView}
                activeProposal={activeProposal}
                onClearProposal={() => setActiveProposal(null)}
                chatHandlers={{
                  onToggleFavorite: handleToggleFavorite,
                  onToggleBlock: handleToggleBlock,
                  isFavorited: (id) => currentUser.favorites?.includes(id) || false,
                  isBlocked: (id) => currentUser.blockedUsers?.includes(id) || false
                }}
                darkMode={darkMode}
                onToggleTheme={() => setDarkMode(!darkMode)}
              />
            </DashboardLayout>
          );
        } else if (currentUser.role === 'PRO') {
          return (
            <ProDashboard
              onViewProfile={() => setScreen('PROFILE')}
              onBid={() => { }}
              onChatSelect={(proposal) => {
                setActiveProposal(proposal);
                setScreen('CHAT');
              }}
              onNavigate={(targetScreen, params) => {
                if (targetScreen === 'CHAT' && params?.jobId) {
                  // Find the proposal associated with this job for this pro
                  const relevantProposal = proposals.find(p => p.jobId === params.jobId && p.proId === currentUser.id);
                  if (relevantProposal) {
                    setActiveProposal(relevantProposal);
                    setScreen('CHAT');
                  } else {
                    console.error("App: No proposal found for agenda job", params.jobId);
                    // Optional: Show notification error
                  }
                } else {
                  setScreen(targetScreen as any);
                }
              }}
              darkMode={darkMode}
              toggleTheme={() => setDarkMode(!darkMode)}
            />
          );
        } else {
          // ROLE === 'EMPLOYEE'
          return (
            <StaffDashboard
              user={currentUser}
              onViewProfile={() => setScreen('PROFILE')}
              onChatSelect={(proposal) => {
                setActiveProposal(proposal);
                setScreen('CHAT');
              }}
            />
          );
        }
      case 'CHAT':
        return activeProposal ? (
          <ChatScreen
            proposal={activeProposal}
            onBack={() => setScreen('DASHBOARD')}
            currentUserRole={currentUser?.role || 'CLIENT'}
            onComplete={() => setScreen('DASHBOARD')}
            // Pass logic functions to ChatScreen to pass to Modal
            onToggleFavorite={handleToggleFavorite}
            onToggleBlock={handleToggleBlock}
            isFavorited={currentUser?.favorites?.includes(activeProposal.proId)}
            isBlocked={currentUser?.blockedUsers?.includes(activeProposal.proId)}
          />
        ) : null;
      case 'PROFILE':
        return currentUser ? (
          <ProfileScreen
            user={currentUser}
            onBack={() => setScreen('DASHBOARD')}
            onUpdate={(data) => {
              const updated = { ...currentUser, ...data };
              updateUser(currentUser.id, updated); // Sync DB
              localStorage.setItem('servicebid_current_session_user', JSON.stringify(updated));
            }}
          />
        ) : null;
      case 'ADMIN':
        return <AdminDashboard />;
      case 'PUBLIC_PROFILE':
        return (
          <ProPublicProfile
            proId={publicProId}
            onContact={(pro) => {
              setWizardTargetPro(pro);
              setSelectedCategory(pro.services?.[0]?.id || 'General'); // Default to first service or General
              setScreen('WIZARD');
              // Optional: Reset URL to avoid confusion if they refresh
              window.history.pushState({}, '', '/');
            }}
          />
        );
      default:
        return <LandingScreen
          onSelectCategory={(cat) => handleStartWizard(cat)}
          onRegisterPro={() => setScreen('WELCOME')}
          onOpenCompanyHelp={() => setScreen('COMPANY_CREATION')}
          onViewAllServices={() => setScreen('ALL_CATEGORIES')}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-200">
      <Layout
        darkMode={darkMode}
        toggleTheme={() => setDarkMode(!darkMode)}
        user={currentUser}
        onLogout={handleLogout}
        onLogoClick={handleLogoClick}
        onProfileClick={() => setScreen('PROFILE')}
        onDashboardClick={() => setScreen('DASHBOARD')}
        onLogin={(email, pass) => setAuthModalOpen(true)}
        onSignUpClick={() => setScreen('WELCOME')}
        onSwitchRole={() => { }}
        onStoreClick={() => setScreen('STORE')}
        authModalOpen={authModalOpen}
        setAuthModalOpen={setAuthModalOpen}
        currentView={dashboardView}
        onViewChange={setDashboardView}
      >
        <AnimatePresence mode='wait'>
          <motion.div
            {...({
              key: screen,
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -10 },
              transition: { duration: 0.2 },
              className: "w-full"
            } as any)}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </Layout>

      {/* SERVICE SELECTION MODAL FOR DIRECT REQUESTS */}
      <AnimatePresence>
        {directRequestTarget && (
          <ServiceSelectionModal
            pro={directRequestTarget}
            onClose={() => setDirectRequestTarget(null)}
            onSelect={(category) => {
              setWizardTargetPro(directRequestTarget); // Persist target for Wizard
              setDirectRequestTarget(null); // Close modal
              // Start Wizard with this target
              setEditingJob(null);
              setSelectedCategory(category);
              setScreen('WIZARD');
            }}
          />
        )}
      </AnimatePresence>

      <CartDrawer />

      <LoginModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSignUpClick={() => {
          setAuthModalOpen(false);
          setScreen('WELCOME');
        }}
        onLogin={async (email, pass) => {
          try {
            await login(email, pass);
            setAuthModalOpen(false);

            // CHECK REDIRECT
            const params = new URLSearchParams(location.search);
            const redirect = params.get('redirect');
            if (redirect) {
              navigate(redirect);
              return;
            }

            // If we have a pending job (Guest Checkout flow), DO NOT Redirect.
            // The user stays on Wizard, but now is logged in.
            // They can click "Submit" again to finish.
            if (pendingJob) {
              // Optional: We could auto-submit here, but it's safer to let them review and click "Save".
              // Just stay on current screen.
              return;
            }

            if (email === 'ceo@zolver.lu') {
              setScreen('ADMIN');
            } else {
              setScreen('DASHBOARD');
            }
          } catch (e) {
            console.error("Login failed", e);
            // In a real app, show a toast here
          }
        }}
        onForgotPasswordClick={() => setForgotPasswordOpen(true)}
      />

      <ClientSignupModal
        isOpen={clientSignupOpen}
        onClose={() => setClientSignupOpen(false)}
        onSignUp={async (data) => {
          await signUp(data.email, data.password, data);
          setScreen('DASHBOARD');
        }}
        onLoginClick={() => {
          setClientSignupOpen(false);
          setAuthModalOpen(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onReset={resetPassword}
      />
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <DatabaseProvider>
      <NotificationProvider>
        <LanguageProvider>
          <CartProvider>
            <RequestDraftProvider>
              <AppContent />
            </RequestDraftProvider>
          </CartProvider>
        </LanguageProvider>
      </NotificationProvider>
    </DatabaseProvider>
  </AuthProvider>
);

// Safe ID Generator Helper (Fallback for older browsers)
function generateId(prefix: string = 'id'): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default App;
