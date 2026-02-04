
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  History,
  User,
  Star,
  MapPin,
  Euro,
  LayoutDashboard,
  Clock,
  Trash2,
  Edit,
  Activity,
  Heart,
  FileText,
  ArrowLeft,
  Check,
  Compass,
  Search,
  UserPlus,
  UserMinus,
  Megaphone,
  Award,
  ShoppingBag
} from 'lucide-react';
import { Button, Card } from '../components/ui';
import { Proposal, JobRequest, User as UserType } from '../types';
import { MOCK_JOBS, CATEGORIES, MOCK_REVIEWS, MOCK_CLIENT } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfileModal, PortfolioOverlay } from '../components/ServiceModals';
import { ClientExploreView } from '../components/ClientExploreView';
import { useDatabase } from '../contexts/DatabaseContext';
import { query, collection, where, onSnapshot, doc, documentId } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { ChatScreen } from './ChatScreen';

import { SponsoredProsScreen } from './client/SponsoredProsScreen';
import { HighlightsScreen } from './client/HighlightsScreen';
import { ClientMenuScreen } from './client/ClientMenuScreen';
import { StoreHome } from './store/StoreHome'; // Import Store
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { ReviewModal } from '../components/reviews/ReviewModal';
import { NotificationsBell } from '../components/NotificationsBell';

interface ClientDashboardProps {
  jobs: JobRequest[];
  onSelectProposal: (p: Proposal) => void;
  onCreateNew: () => void;
  onViewProfile: () => void;
  onEdit: (job: JobRequest) => void;
  onDirectRequest: (pro: UserType) => void;
  onHireAgain: (pro: UserType, category: any) => void;
  onStoreClick?: () => void; // Callback to navigate to Store (kept for compatibility)
  favorites?: string[];
  activeProposal?: Proposal | null;
  onClearProposal?: () => void;
  currentView?: DashboardView;
  onViewChange?: (view: DashboardView) => void;
  // Passing these so ChatScreen can use them (forwarded from App)
  chatHandlers?: {
    onToggleFavorite?: (id: string) => void;
    onToggleBlock?: (id: string) => void;
    isFavorited?: (id: string) => boolean;
    isBlocked?: (id: string) => boolean;
  };
  darkMode: boolean;
  onToggleTheme: () => void;
}

export type DashboardView = 'REQUESTS' | 'MARKET' | 'HISTORY' | 'MESSAGES' | 'FAVORITES' | 'INVOICES' | 'EXPLORE' | 'FEATURED' | 'MY_ADS' | 'MENU' | 'ORDERS' | 'STORE';

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  jobs, onSelectProposal, onCreateNew, onViewProfile, onEdit, onDirectRequest, onHireAgain, onStoreClick, favorites = [],
  currentView: propView, onViewChange, activeProposal, onClearProposal, chatHandlers, darkMode, onToggleTheme
}) => {
  const { t, tCategory } = useLanguage();
  const { proposals, users, updateJob, updateProposal, deleteJob, transactions, followUser, unfollowUser } = useDatabase(); // Added transactions

  const [internalView, setInternalView] = useState<DashboardView>('REQUESTS');

  // Use prop if available, else internal state
  const currentView = propView || internalView;
  const setCurrentView = (view: DashboardView) => {
    if (onViewChange) onViewChange(view);
    else setInternalView(view);
  };

  const [viewingPro, setViewingPro] = useState<Proposal | UserType | null>(null);
  const [viewingPortfolio, setViewingPortfolio] = useState<Proposal | null>(null);

  // Get Current User (Client)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // REVIEW LOGIC STATE
  const [reviewJob, setReviewJob] = useState<JobRequest | null>(null);
  const [dismissedReviews, setDismissedReviews] = useState<string[]>([]);

  useEffect(() => {
    // Find first completed job without review that hasn't been dismissed
    const jobToReview = jobs.find(j =>
      j.status === 'COMPLETED' &&
      !j.hasReview &&
      !j.reviewId &&
      !dismissedReviews.includes(j.id)
    );

    if (jobToReview && !reviewJob) {
      setReviewJob(jobToReview);
    }
  }, [jobs, dismissedReviews, reviewJob]);

  const handleNotificationClick = (type: string, data: any) => {
    // Navigate to relevant screen
    if (type === 'OFFER_MADE' || type === 'JOB_DONE') {
      setCurrentView('REQUESTS');
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('servicebid_current_session_user');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const filterMyChats = () => {
    return myChats.filter(chat => {
      const j = jobs.find(job => job.id === chat.jobId);
      return j && j.status !== 'COMPLETED' && j.status !== 'CANCELLED';
    });
  };

  // --- ISOLATED LIVE MARKET LOGIC ---
  const [marketJobId, setMarketJobId] = useState<string | null>(null);
  const [liveMarketJob, setLiveMarketJob] = useState<JobRequest | null>(null);
  const [liveProposals, setLiveProposals] = useState<Proposal[]>([]);
  const [marketStatus, setMarketStatus] = useState<string>('IDLE'); // 'LOADING', 'READY', 'ERROR'

  // We keep this for the sidebar check, but the main logic uses marketJobId
  const [selectedJobForMarket, setSelectedJobForMarket] = useState<JobRequest | null>(null);

  const handleGoToMarket = (job: JobRequest) => {
    setSelectedJobForMarket(job); // Keep for sidebar compatibility
    setMarketJobId(job.id);
    setCurrentView('MARKET');
  };

  useEffect(() => {
    if (!marketJobId) return;

    setMarketStatus('LOADING');
    console.log(`[ISOLATED MARKET] Starting listeners for Job ID: ${marketJobId}`);

    // Listener 1: The Job Itself (using query to allow rules evaluation)
    const jobQuery = query(
      collection(db, 'jobs'),
      where(documentId(), '==', marketJobId)
    );

    const unsubJob = onSnapshot(jobQuery, (snapshot) => {
      if (!snapshot.empty) {
        const jobData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as JobRequest;
        console.log('[ISOLATED MARKET] Job Data Updated:', jobData);
        setLiveMarketJob(jobData);
      } else {
        console.error('[ISOLATED MARKET] Job not accessible or does not exist');
        setMarketStatus('ERROR_NO_JOB');
      }
    }, (error) => {
      console.error('[ISOLATED MARKET] Job listener error:', error);
      setMarketStatus('ERROR_NO_ACCESS');
    });

    // Listener 2: The Proposals
    const q = query(collection(db, 'proposals'), where('jobId', '==', marketJobId));

    const unsubProposals = onSnapshot(q, (snapshot) => {
      console.log(`[ISOLATED MARKET] Snapshot received. Docs count: ${snapshot.docs.length}`);
      const props = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Proposal));
      console.log('[ISOLATED MARKET] Proposals Parsed:', props);
      setLiveProposals(props);
      setMarketStatus('READY');
    }, (error) => {
      console.error('[ISOLATED MARKET] Proposal listener error:', error);
      setMarketStatus('ERROR_LISTENER');
    });

    return () => {
      console.log('[ISOLATED MARKET] Cleaning up listeners');
      unsubJob();
      unsubProposals();
    };
  }, [marketJobId]);

  // CRITICAL CHANGE: Logic to ACCEPT a bid explicitly and PERSIST IT
  // CRITICAL CHANGE: Logic to ACCEPT a bid explicitly and PERSIST IT
  const handleAcceptBid = (proposal: Proposal) => {
    if (!liveMarketJob) return;

    // 1. Update Job Status to CONFIRMED (Closing it to other bids)
    // FIX: Add locking fields to prevent "orphaned" job
    const updatedJob: JobRequest = {
      ...liveMarketJob,
      status: 'FUNDS_ESCROWED', // Start Escrow Flow
      isLocked: true,
      lockedBy: proposal.proId, // Lock to the Pro
      acceptedProposalId: proposal.id,
      finalPrice: proposal.price
    };

    updateJob(updatedJob);

    // 2. Update Proposal Status in DB so Pro sees it
    const confirmedProposal: Proposal = { ...proposal, status: 'ACCEPTED' }; // Use ACCEPTED to match ChatScreen logic
    updateProposal(confirmedProposal); // Persist to DB

    // Navigate to chat
    onSelectProposal(confirmedProposal);
  };

  // Filter Messages (Proposals that are accepted OR have explicit chat history)
  const myChats = proposals.filter(p => {
    const relevantJob = jobs.find(j => j.id === p.jobId);
    // STRICT FILTER: Chat only appears if proposal is CONFIRMED.
    return relevantJob && p.status === 'ACCEPTED';
  });

  const SidebarItem = ({ view, icon: Icon, label, count }: { view: DashboardView, icon: any, label?: string, count?: number }) => (
    <div className="relative group">
      <button
        onClick={() => setCurrentView(view)}
        className={`p-3 rounded-2xl transition-all duration-300 relative ${currentView === view
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-orange-500'
          }`}
      >
        <Icon size={24} />
        {count && count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
            {count}
          </span>
        )}
      </button>
      <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 hidden sm:block">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950">
      {/* Sidebar (Desktop) */}
      <div className="hidden sm:flex flex-col w-24 bg-white dark:bg-slate-900 border-r dark:border-slate-800 items-center py-8 gap-8 z-20">
        <div
          className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl cursor-pointer active:scale-90 transition-transform hover:rotate-90 duration-500"
          onClick={onCreateNew}
          title={t.whatNeed}
        >
          <Plus size={24} />
        </div>

        <div className="w-10 h-px bg-slate-100 dark:bg-slate-800" />

        <nav className="flex flex-col gap-6 items-center w-full">
          <SidebarItem view="MY_ADS" icon={Award} label="Featured Pros" />
          <SidebarItem view="REQUESTS" icon={FileText} label={t.myRequests} count={jobs.filter(j => j.status === 'IN_PROGRESS').length} />
          {['ADMIN'].includes(currentUser?.role || '') && <SidebarItem view="INVOICES" icon={FileText} label="Invoices (Admin)" />}
          {selectedJobForMarket && (
            <SidebarItem view="MARKET" icon={LayoutDashboard} label={t.liveMarket} />
          )}
          {/* STORE */}
          <SidebarItem view="STORE" icon={ShoppingBag} label={t.storeTab || 'Loja Zolver'} />
          <SidebarItem view="MESSAGES" icon={MessageSquare} label={t.messagesTab} count={filterMyChats().length} />
          <SidebarItem view="HISTORY" icon={History} label={t.historyTab} />
          <SidebarItem view="EXPLORE" icon={Compass} label="Explore" />
          <SidebarItem view="FEATURED" icon={Star} label="Spotlight" />
        </nav>



        <div className="mt-auto flex flex-col items-center gap-4">
          <NotificationsBell
            userId={currentUser?.id || ''}
            onNavigate={handleNotificationClick}
          />
          <button onClick={onViewProfile} className="p-3 text-slate-400 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">
            <User size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 sm:pb-8 h-[calc(100vh-64px)]">
        {/* MOBILE HEADER REMOVED AS REQUESTED */}

        {/* GLOBAL FIXED NOTIFICATION BELL (Mobile Only) */}
        {['FEATURED', 'REQUESTS', 'MESSAGES', 'EXPLORE'].includes(currentView) && (
          <div className="sm:hidden fixed top-4 right-4 z-50">
            <NotificationsBell
              userId={currentUser?.id || ''}
              onNavigate={handleNotificationClick}
            />
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* VIEW: HISTORY (New List of Completed Jobs) */}
          {currentView === 'HISTORY' && (
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
              {/* Added padding top since header is gone */}
              <div className="md:hidden h-4" />
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-6">{t.historyTab}</h2>

              {jobs.filter(j => j.status === 'COMPLETED' || j.status === 'CANCELLED').length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">{t.noHistory}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.filter(j => j.status === 'COMPLETED' || j.status === 'CANCELLED').map(job => (
                    <div key={job.id}
                      onClick={() => {
                        // Find proposal/chat to open details read-only
                        const prop = proposals.find(p => p.jobId === job.id && p.status === 'ACCEPTED'); // or just open chat if exists
                        if (prop) onSelectProposal(prop);
                      }}
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity cursor-pointer">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white line-through decoration-slate-300">{job.title}</h4>
                        <p className="text-xs text-slate-500">{new Date(job.finishedAt || job.createdAt).toLocaleDateString()} • {job.status}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-bold text-slate-400">€{job.finalPrice}</span>
                        <Button
                          variant="outline"
                          className="text-xs h-8 px-3 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-500 dark:border-slate-700 dark:text-orange-400 dark:hover:bg-slate-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            const prop = proposals.find(p => p.jobId === job.id && p.status === 'ACCEPTED');
                            if (prop) {
                              const proUser = users.find(u => u.id === prop.proId);
                              if (proUser) {
                                onHireAgain(proUser, job.category);
                              }
                            }
                          }}
                        >
                          {t.hireAgain}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {/* VIEW: MY ADS (NOW SPONSORED SHOWCASE) */}
          {currentView === 'MY_ADS' && (
            <SponsoredProsScreen />
          )}

          {/* VIEW: MY REQUESTS (LIST) */}
          {currentView === 'REQUESTS' && (
            <motion.div
              {...({
                key: "requests",
                initial: { opacity: 0, x: -10 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: 10 },
                className: "p-4 md:p-8 max-w-5xl mx-auto"
              } as any)}
            >
              <div className="md:hidden h-4" />
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t.myRequests}</h1>
                  <p className="text-slate-500 font-medium text-sm md:text-base">{t.manageRequests}</p>
                </div>
                <Button onClick={onCreateNew} className="hidden sm:flex items-center gap-2">
                  <Plus size={18} /> {t.createFirstRequest}
                </Button>
                {/* Mobile Create Button */}
                <Button onClick={onCreateNew} className="sm:hidden flex items-center gap-2 text-xs px-3 h-8">
                  <Plus size={14} /> New
                </Button>
              </div>

              {jobs.filter(j => j.status !== 'COMPLETED' && j.status !== 'CANCELLED').length === 0 ? (
                <div className="text-center py-16 md:py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 mx-auto">
                  <FileText className="w-12 h-12 md:w-16 md:h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">{t.noActiveRequests}</p>
                  <Button onClick={onCreateNew} variant="outline" className="mt-4">
                    {t.createFirstRequest}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {jobs.filter(j => j.status !== 'COMPLETED' && j.status !== 'CANCELLED').map((job, i) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 hover:shadow-lg transition-all group border-l-4 border-l-orange-500">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] md:text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                              {tCategory(job.category)}
                            </span>
                            <span className="text-[10px] md:text-xs text-slate-400 flex items-center gap-1">
                              <Clock size={12} /> {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {job.title || job.description}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                            <span className="flex items-center gap-1"><Euro size={14} /> {job.suggestedPrice}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 justify-end border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => onEdit(job)}
                              className="p-2 md:p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors bg-slate-50 dark:bg-slate-800 md:bg-transparent"
                              title={t.editRequest}
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(t.confirmDelete || 'Are you sure you want to delete this job?')) {
                                  deleteJob(job.id);
                                }
                              }}
                              className="p-2 md:p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors bg-slate-50 dark:bg-slate-800 md:bg-transparent"
                              title={t.deleteRequest}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <Button
                            onClick={() => handleGoToMarket(job)}
                            className="flex-1 md:flex-none bg-slate-900 dark:bg-white dark:text-slate-900 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 text-sm"
                          >
                            <Activity size={16} className="text-orange-500" />
                            {t.goToMarket} ({proposals.filter(p => p.jobId === job.id).length})
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: LIVE MARKET (For Specific Job) */}
          {currentView === 'MARKET' && liveMarketJob && (
            <motion.div
              {...({
                key: "market",
                initial: { opacity: 0, x: 10 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: -10 },
                className: "p-4 md:p-8 max-w-5xl mx-auto"
              } as any)}
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setCurrentView('REQUESTS')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"><ArrowLeft size={20} /></button>
                <div>
                  <h2 className="text-xl md:text-2xl font-black">{t.liveMarket}</h2>
                  <p className="text-slate-500 text-xs md:text-sm">{liveMarketJob.title}</p>
                </div>
              </div>

              {liveProposals.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-slate-400 animate-pulse">{t.waitingClient}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveProposals.map(bid => (
                    <Card key={bid.id} className="p-4 flex flex-col gap-4 relative overflow-hidden">
                      <div className="flex items-center gap-3">
                        <img src={bid.proAvatar} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold">{bid.proName}</h4>
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold"><Star size={12} fill="currentColor" /> {bid.proRating}</div>
                        </div>
                        <div className="ml-auto text-xl font-black text-orange-500">€ {bid.price}</div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{bid.message}"</p>

                      {/* Accept Button Logic */}
                      {bid.status === 'ACCEPTED' ? (
                        <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2">
                          <Check size={16} /> Accepted
                        </div>
                      ) : (
                        <Button onClick={() => handleAcceptBid(bid)}>
                          {t.acceptAndChat}
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: EXPLORE (Social Discovery) */}
          {currentView === 'EXPLORE' && (
            <div className="h-full">
              <ClientExploreView
                currentUser={currentUser}
                users={users}
                onDirectRequest={onDirectRequest}
                onViewProfile={(pro) => {
                  setViewingPro(pro);
                  setViewingPortfolio(null);
                }}
              />
            </div>
          )}

          {/* VIEW: MESSAGES */}
          {currentView === 'MESSAGES' && (
            <div className="h-full max-w-7xl mx-auto flex gap-6">
              {/* Desktop: List is always visible. Mobile: List visible only if no chat selected (logic handled in App/Layout preferably but for now we do partial) */}
              <div className={`w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-140px)]`}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="font-bold text-lg">{t.messagesTab}</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {myChats.length === 0 && <p className="p-4 text-slate-500 text-sm">{t.noActiveRequests}</p>}
                  {myChats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => onSelectProposal(chat)}
                      className={`p-4 border-b border-slate-50 dark:border-slate-800 cursor-pointer flex gap-3 transition-colors ${activeProposal?.id === chat.id ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <img src={chat.proAvatar} className="w-10 h-10 rounded-full object-cover" alt="Pro" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm truncate">{chat.proName}</h4>
                          <span className="text-[10px] text-slate-400">{new Date(chat.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{chat.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CENTER COLUMN (MAIN STAGE) */}
              {/* Mobile: Full Screen Overlay when active. Desktop: Side Panel. */}
              <div className={`
                  fixed inset-0 z-50 md:static md:z-auto bg-white dark:bg-slate-900 md:flex flex-1 md:bg-transparent
                  transition-transform duration-300 transform
                  ${activeProposal ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
              `}>
                {activeProposal ? (
                  <div className="h-full flex flex-col md:rounded-2xl md:overflow-hidden md:border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                    {/* Back Button for Mobile is handled inside ChatScreen or we wrap it here */}
                    {/* We pass onBack to ChatScreen. On Mobile it clears. On Desktop it also clears (closing the chat view) */}
                    <ChatScreen
                      proposal={activeProposal}
                      onBack={() => onClearProposal && onClearProposal()}
                      currentUserRole="CLIENT"
                      onComplete={() => onClearProposal && onClearProposal()}
                      onToggleFavorite={chatHandlers?.onToggleFavorite}
                      onToggleBlock={chatHandlers?.onToggleBlock}
                      isFavorited={chatHandlers?.isFavorited && chatHandlers.isFavorited(activeProposal.proId)}
                      isBlocked={chatHandlers?.isBlocked && chatHandlers.isBlocked(activeProposal.proId)}
                    />
                  </div>
                ) : (
                  <div className="hidden md:flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                    <MessageSquare size={48} className="mb-4 opacity-50" />
                    <p>Select a conversation to start chatting</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: HISTORY */}
          {currentView === 'HISTORY' && (
            <motion.div
              {...({
                key: "history",
                initial: { opacity: 0, x: 10 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: -10 },
                className: "p-4 md:p-8 max-w-4xl mx-auto"
              } as any)}
            >
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">{t.historyTab}</h2>
              <div className="space-y-4 mt-6">
                {jobs.filter(j => j.status === 'COMPLETED').map(job => (
                  <Card key={job.id} className="p-4 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity">
                    <div className="min-w-0 flex-1 mr-4">
                      <h4 className="font-bold truncate">{job.title || job.description}</h4>
                      <p className="text-xs text-slate-500">{new Date(job.finishedAt!).toLocaleDateString()}</p>
                    </div>
                    <span className="font-black text-orange-500 whitespace-nowrap">€ {job.finalPrice}</span>
                  </Card>
                ))}
                {jobs.filter(j => j.status === 'COMPLETED').length === 0 && <p className="text-slate-500">{t.noRequestsDesc}</p>}
              </div>
            </motion.div>
          )}

          {/* VIEW: FAVORITES */}
          {currentView === 'FAVORITES' && (
            <motion.div
              {...({
                key: "favorites",
                initial: { opacity: 0, x: 10 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: -10 },
                className: "p-4 md:p-8 max-w-4xl mx-auto"
              } as any)}
            >
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">{t.favoritesTab}</h2>
              <p className="text-slate-500 mb-8">Your trusted professionals.</p>

              {favorites.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">{t.noFavorites}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {users.filter(u => favorites.includes(u.id) && u.role === 'PRO').map(pro => (
                    <Card key={pro.id} className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all">
                      <img src={pro.avatar} className="w-16 h-16 rounded-2xl object-cover" />
                      <div>
                        <h4 className="font-bold text-lg">{pro.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Star size={14} className="text-amber-500 fill-current" /> {pro.rating}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: FEATURED (Featured Professionals) - Unified with Desktop 'Featured Pros' */}
          {currentView === 'FEATURED' && (
            <SponsoredProsScreen />
          )}

          {/* VIEW: STORE (In-App Store) */}
          {currentView === 'STORE' && (
            <div className="h-full">
              <StoreHome />
            </div>
          )}

          {/* VIEW: MENU */}
          {currentView === 'MENU' && currentUser && (
            <ClientMenuScreen
              user={currentUser}
              darkMode={darkMode}
              onToggleTheme={onToggleTheme}
              onNavigate={(route) => {
                if (route === '/store') {
                  setCurrentView('STORE');
                } else if (route === '/explore') {
                  setCurrentView('EXPLORE');
                } else if (route === '/history') {
                  setCurrentView('HISTORY');
                } else if (route === '/profile') {
                  onViewProfile();
                } else if (route === '/following') {
                  setCurrentView('FAVORITES');
                }
              }}
              onLogout={() => {
                window.location.href = '/';
              }}
            />
          )}

        </AnimatePresence>

        <AnimatePresence>
          {viewingPro && (
            <UserProfileModal
              user={{
                id: (viewingPro as Proposal).proId || (viewingPro as UserType).id,
                name: (viewingPro as Proposal).proName || (viewingPro as UserType).name,
                avatar: (viewingPro as Proposal).proAvatar || (viewingPro as UserType).avatar,
                role: 'PRO',
                rating: (viewingPro as Proposal).proRating || (viewingPro as UserType).rating || 0,
                level: (viewingPro as Proposal).proLevel || (viewingPro as UserType).level || 'Professional',
                languages: (viewingPro as UserType).languages || ['PT', 'FR', 'EN'],
                username: (viewingPro as UserType).username,
                followers: (viewingPro as UserType).followers,
                following: (viewingPro as UserType).following,
                instagram_url: (viewingPro as UserType).instagram_url
              }}
              onClose={() => setViewingPro(null)}
              onMessage={(user) => {
                setViewingPro(null);
                setCurrentView('MESSAGES');
              }}
              onHire={() => {
                // If it's a proposal, select it. If it's a user, we might need a different flow or just open chat request
                if ((viewingPro as Proposal).jobId) {
                  onSelectProposal(viewingPro as Proposal);
                } else {
                  // Logic for hiring directly from profile not fully implemented yet in this version
                  // But we should trigger the Direct Request functionality
                  if (!currentUser) {
                    alert('Please login to hire');
                    return;
                  }
                  onDirectRequest(viewingPro as UserType);
                }
              }}
              onViewPortfolio={() => setViewingPortfolio(viewingPro as Proposal)}
              onDirectRequest={(pro) => {
                setViewingPro(null); // Close modal
                onDirectRequest(pro);
              }}
            />
          )}
          {viewingPortfolio && (
            <PortfolioOverlay
              proposal={viewingPortfolio}
              onClose={() => setViewingPortfolio(null)}
            />
          )}
        </AnimatePresence>
      </div >

      {/* Mobile Navigation */}
      <BottomNavigation
        activeTab={
          currentView === 'EXPLORE' ? 'SEARCH' :
            currentView === 'FAVORITES' ? 'FOLLOWING' :
              currentView === 'REQUESTS' || currentView === 'MESSAGES' ? 'ACTIVITY' :
                'PROFILE'
        }
        onTabChange={(id) => {
          if (id === 'FEATURED') setCurrentView('FEATURED');
          if (id === 'ORDERS') setCurrentView('REQUESTS');
          if (id === 'NEW') onCreateNew();
          if (id === 'MESSAGES') setCurrentView('MESSAGES');
          if (id === 'MENU') setCurrentView('MENU');
        }}
      />

      {/* REVIEW MODAL INTEGRATION */}
      {
        reviewJob && (
          <ReviewModal
            isOpen={!!reviewJob}
            onClose={() => {
              setDismissedReviews(prev => [...prev, reviewJob.id]);
              setReviewJob(null);
            }}
            jobId={reviewJob.id}
            proId={reviewJob.lockedBy || ''}
            proName={users.find(u => u.id === reviewJob.lockedBy)?.name || 'Professional'}
            onSuccess={() => {
              // Success action handled by service (updates DB)
              // We just close the modal, and the subscription will update the 'hasReview' field
              setReviewJob(null);
            }}
          />
        )
      }
    </div >
  );
};
