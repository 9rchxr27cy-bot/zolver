
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
  UserMinus
} from 'lucide-react';
import { Button, Card } from '../components/ui';
import { Proposal, JobRequest, User as UserType } from '../types';
import { MOCK_JOBS, CATEGORIES, MOCK_REVIEWS, MOCK_CLIENT } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfileModal, PortfolioOverlay } from '../components/ServiceModals';
import { useDatabase } from '../contexts/DatabaseContext';
import { query, collection, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

interface ClientDashboardProps {
  jobs: JobRequest[];
  onSelectProposal: (p: Proposal) => void;
  onCreateNew: () => void;
  onViewProfile: () => void;
  onEdit: (job: JobRequest) => void;
  onDirectRequest: (pro: UserType) => void;
  favorites?: string[];
}

type DashboardView = 'REQUESTS' | 'MARKET' | 'HISTORY' | 'MESSAGES' | 'FAVORITES' | 'INVOICES' | 'EXPLORE';

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ jobs, onSelectProposal, onCreateNew, onViewProfile, onEdit, onDirectRequest, favorites = [] }) => {
  const { t, tCategory } = useLanguage();
  const { proposals, users, updateJob, updateProposal, deleteJob, transactions, followUser, unfollowUser } = useDatabase(); // Added transactions

  const [currentView, setCurrentView] = useState<DashboardView>('REQUESTS');
  const [viewingPro, setViewingPro] = useState<Proposal | UserType | null>(null);
  const [viewingPortfolio, setViewingPortfolio] = useState<Proposal | null>(null);

  // Get Current User (Client)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

    // Listener 1: The Job Itself
    const unsubJob = onSnapshot(doc(db, 'jobs', marketJobId), (docSnap) => {
      if (docSnap.exists()) {
        const jobData = { id: docSnap.id, ...docSnap.data() } as JobRequest;
        console.log('[ISOLATED MARKET] Job Data Updated:', jobData);
        setLiveMarketJob(jobData);
      } else {
        console.error('[ISOLATED MARKET] Job document not found!');
        setMarketStatus('ERROR_NO_JOB');
      }
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
  const handleAcceptBid = (proposal: Proposal) => {
    if (!liveMarketJob) return;

    // 1. Update Job Status to CONFIRMED (Closing it to other bids)
    const updatedJob: JobRequest = { ...liveMarketJob, status: 'CONFIRMED', finalPrice: proposal.price };
    updateJob(updatedJob);

    // 2. Update Proposal Status in DB so Pro sees it
    const confirmedProposal: Proposal = { ...proposal, status: 'CONFIRMED' };
    updateProposal(confirmedProposal); // Persist to DB

    // Navigate to chat
    onSelectProposal(confirmedProposal);
  };

  // Filter Messages (Proposals that are accepted OR have explicit chat history)
  const myChats = proposals.filter(p => {
    const relevantJob = jobs.find(j => j.id === p.jobId);
    // STRICT FILTER: Chat only appears if proposal is CONFIRMED.
    return relevantJob && p.status === 'CONFIRMED';
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
          <SidebarItem view="REQUESTS" icon={FileText} label={t.myRequests} count={jobs.filter(j => j.status === 'IN_PROGRESS').length} />
          {selectedJobForMarket && (
            <SidebarItem view="MARKET" icon={LayoutDashboard} label={t.liveMarket} />
          )}
          <SidebarItem view="MESSAGES" icon={MessageSquare} label={t.messagesTab} count={filterMyChats().length} />
          <SidebarItem view="HISTORY" icon={History} label={t.historyTab} />
          <SidebarItem view="EXPLORE" icon={Compass} label="Explore" />
        </nav>

        <div className="mt-auto">
          <button onClick={onViewProfile} className="p-3 text-slate-400 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">
            <User size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 sm:pb-8 h-[calc(100vh-64px)]">
        <AnimatePresence mode="wait">

          {/* VIEW: HISTORY (New List of Completed Jobs) */}
          {currentView === 'HISTORY' && (
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
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
                        const prop = proposals.find(p => p.jobId === job.id && p.status === 'CONFIRMED'); // or just open chat if exists
                        if (prop) onSelectProposal(prop);
                      }}
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity cursor-pointer">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white line-through decoration-slate-300">{job.title}</h4>
                        <p className="text-xs text-slate-500">{new Date(job.finishedAt || job.createdAt).toLocaleDateString()} • {job.status}</p>
                      </div>
                      <span className="font-bold text-slate-400">€{job.finalPrice}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: MY REQUESTS (LIST) */}
          {currentView === 'REQUESTS' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-4 md:p-8 max-w-5xl mx-auto"
            >
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t.myRequests}</h1>
                  <p className="text-slate-500 font-medium text-sm md:text-base">{t.manageRequests}</p>
                </div>
                <Button onClick={onCreateNew} className="hidden sm:flex items-center gap-2">
                  <Plus size={18} /> {t.createFirstRequest}
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
              key="market"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 md:p-8 max-w-5xl mx-auto"
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
                      {bid.status === 'CONFIRMED' ? (
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
            <motion.div
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 md:p-8 max-w-5xl mx-auto"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Explore Pros</h1>
                  <p className="text-slate-500 font-medium">Find and follow the best professionals.</p>
                </div>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search name or @handle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-80 pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* My Public Profile Preview */}
              <div className="mb-10 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 rounded-3xl p-6 md:p-8 text-white dark:text-slate-900 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={currentUser?.avatar || MOCK_CLIENT.avatar} className="w-16 h-16 rounded-2xl border-2 border-white/20" />
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-slate-900" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg md:text-xl">{currentUser?.name || "My Name"}</h3>
                      <p className="opacity-60 text-sm">{currentUser?.username || "@create.your.handle"}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-bold opacity-80">
                        <span>{currentUser?.followers?.length || 0} Followers</span>
                        <span>•</span>
                        <span>{currentUser?.following?.length || 0} Following</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => currentUser && setViewingPro({ ...currentUser, role: 'CLIENT' })} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900 border-none backdrop-blur-md">
                    View Profile
                  </Button>
                </div>
              </div>

              {/* Pros Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users
                  .filter(u => u.role === 'PRO' && (
                    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()))
                  ))
                  .map(pro => (
                    <div key={pro.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-orange-500/20 transition-all group flex flex-col items-center text-center cursor-pointer" onClick={() => setViewingPro(pro)}>
                      <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 mb-3 group-hover:scale-105 transition-transform">
                        <img src={pro.avatar} className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 object-cover" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{pro.name}</h3>
                      <span className="text-xs text-slate-400 font-medium mb-3">{pro.username}</span>

                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mb-4 bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded-full">
                        <Star size={12} fill="currentColor" /> {pro.rating || 'New'}
                      </div>

                      <div className="mt-auto w-full flex gap-2">
                        <button
                          className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-orange-500 hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingPro(pro);
                          }}
                        >
                          View Profile
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!currentUser) return;
                            if (currentUser?.following?.includes(pro.id)) {
                              unfollowUser(currentUser.id, pro.id);
                            } else {
                              followUser(currentUser.id, pro.id);
                            }
                          }}
                          className={`p-2 rounded-xl border ${currentUser?.following?.includes(pro.id) ? 'border-orange-500 text-orange-500 bg-orange-50' : 'border-slate-200 text-slate-400 hover:text-orange-500'}`}
                        >
                          {currentUser?.following?.includes(pro.id) ? <UserMinus size={16} /> : <UserPlus size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* VIEW: MESSAGES */}
          {currentView === 'MESSAGES' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 md:p-8 max-w-4xl mx-auto"
            >
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">{t.messagesTab}</h2>
              <div className="space-y-3 mt-6">
                {myChats.filter(chat => {
                  const j = jobs.find(job => job.id === chat.jobId);
                  return j && j.status !== 'COMPLETED' && j.status !== 'CANCELLED';
                }).length === 0 ? (
                  <p className="text-slate-500">{t.noActiveRequests}</p>
                ) : (
                  myChats.filter(chat => {
                    const j = jobs.find(job => job.id === chat.jobId);
                    return j && j.status !== 'COMPLETED' && j.status !== 'CANCELLED';
                  }).map((chat, i) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => onSelectProposal(chat)}
                      className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-orange-500/30 transition-all cursor-pointer group flex gap-4"
                    >
                      <div className="relative shrink-0">
                        <img src={chat.proAvatar} className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{chat.proName}</h3>
                        <p className="text-sm text-slate-500 truncate">{chat.message}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* VIEW: HISTORY */}
          {currentView === 'HISTORY' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 md:p-8 max-w-4xl mx-auto"
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
              key="favorites"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 md:p-8 max-w-4xl mx-auto"
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
      </div>

      {/* Mobile Navigation (Bottom) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t dark:border-slate-800 p-2 flex justify-around z-30 pb-safe">
        <button onClick={() => setCurrentView('REQUESTS')} className={`p-2 rounded-xl flex flex-col items-center ${currentView === 'REQUESTS' ? 'text-orange-500' : 'text-slate-400'}`}>
          <FileText size={24} />
          <span className="text-[10px] font-bold mt-1">Requests</span>
        </button>
        <button onClick={() => selectedJobForMarket ? setCurrentView('MARKET') : setCurrentView('REQUESTS')} className={`p-2 rounded-xl flex flex-col items-center ${currentView === 'MARKET' ? 'text-orange-500' : 'text-slate-400'}`}>
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-bold mt-1">Market</span>
        </button>
        <button onClick={onCreateNew} className="p-4 bg-orange-500 text-white rounded-full -mt-8 shadow-lg shadow-orange-500/30">
          <Plus size={24} />
        </button>
        <button onClick={() => setCurrentView('MESSAGES')} className={`p-2 rounded-xl flex flex-col items-center ${currentView === 'MESSAGES' ? 'text-orange-500' : 'text-slate-400'}`}>
          <MessageSquare size={24} />
          <span className="text-[10px] font-bold mt-1">Chat</span>
        </button>
        <button onClick={() => setCurrentView('HISTORY')} className={`p-2 rounded-xl flex flex-col items-center ${currentView === 'HISTORY' ? 'text-orange-500' : 'text-slate-400'}`}>
          <History size={24} />
          <span className="text-[10px] font-bold mt-1">History</span>
        </button>
        <button onClick={() => setCurrentView('EXPLORE')} className={`p-2 rounded-xl flex flex-col items-center ${currentView === 'EXPLORE' ? 'text-orange-500' : 'text-slate-400'}`}>
          <Compass size={24} />
          <span className="text-[10px] font-bold mt-1">Explore</span>
        </button>
      </div>
    </div>
  );
};
