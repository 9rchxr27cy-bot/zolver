
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { User as UserIcon, Activity, Euro, Globe, ShieldCheck, CheckCircle, FileText, MapPin, AlertTriangle, Megaphone, Trash2, X, MessageCircle, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { db } from '../src/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where, doc, updateDoc } from 'firebase/firestore';
import { SystemLog, User, JobRequest, VerificationRequest } from '../types';
import { format } from 'date-fns';
import { StoreManager } from '../components/admin/StoreManager';
import { PricingManager } from '../components/admin/PricingManager';
import { SeedStoreProducts } from '../components/admin/SeedStoreProducts';
import { useLanguage } from '../contexts/LanguageContext';

export const AdminDashboard: React.FC = () => {
    const { userData, logout } = useAuth();
    const { resetDatabase } = useDatabase();
    const { t } = useLanguage();

    // STATE
    const [stats, setStats] = useState({ users: 0, activeJobs: 0, gmv: 0, newUsersToday: 0 });
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [recentLogins, setRecentLogins] = useState<User[]>([]);
    const [countryStats, setCountryStats] = useState<{ name: string, percent: number }[]>([]);
    const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STORE' | 'PRICING' | 'TOOLS'>('OVERVIEW');

    // Drill-Down States
    const [usersList, setUsersList] = useState<User[]>([]);
    const [activeJobsList, setActiveJobsList] = useState<JobRequest[]>([]);

    const [showUserModal, setShowUserModal] = useState(false);
    const [showLiveOpsModal, setShowLiveOpsModal] = useState(false);
    const [showRegionModal, setShowRegionModal] = useState(false);

    useEffect(() => {
        // 1. LIVE METRICS & HEATMAP
        // Listening to Users
        const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
            const users = snap.docs.map(d => d.data() as User);
            const total = users.length;
            const newToday = users.filter(u => {
                const joined = new Date(u.joinedDate || '');
                const today = new Date();
                return joined.getDate() === today.getDate() && joined.getMonth() === today.getMonth();
            }).length;

            setUsersList(users); // Store for drill-down
            setStats(prev => ({ ...prev, users: total, newUsersToday: newToday }));

            // Heatmap Logic
            const locations: Record<string, number> = {};
            users.forEach(u => {
                const city = u.addresses?.[0]?.locality || 'Unknown';
                locations[city] = (locations[city] || 0) + 1;
            });
            const heatmapData = Object.entries(locations).map(([name, count]) => ({
                name,
                percent: Math.round((count / total) * 100)
            })).sort((a, b) => b.percent - a.percent).slice(0, 5);
            setCountryStats(heatmapData);
        });

        // Listening to Jobs
        const unsubJobs = onSnapshot(collection(db, 'jobs'), (snap) => {
            const jobs = snap.docs.map(d => d.data() as JobRequest);
            // Updated logic with new JobStatus types
            const active = jobs.filter(j =>
                j.status === 'IN_PROGRESS' ||
                j.status === 'STARTED' ||
                j.status === 'EN_ROUTE' ||
                j.status === 'ARRIVED'
            ).length;

            const paid = jobs.filter(j => j.status === 'PAID' || j.status === 'COMPLETED');
            const totalRevenue = paid.reduce((acc, curr) => acc + (curr.finalPrice || curr.suggestedPrice || 0), 0);

            setStats(prev => ({ ...prev, activeJobs: active, gmv: totalRevenue }));

            // Filter active jobs for drill-down
            const activeList = jobs.filter(j =>
                j.status === 'IN_PROGRESS' ||
                j.status === 'STARTED' ||
                j.status === 'EN_ROUTE' ||
                j.status === 'ARRIVED'
            );
            setActiveJobsList(activeList);
        });

        // 3. SYSTEM LOGS
        const qLogs = query(collection(db, 'system_logs'), orderBy('_serverTimestamp', 'desc'), limit(50));
        const unsubLogs = onSnapshot(qLogs, (snap) => {
            const newLogs = snap.docs.map(d => ({ id: d.id, ...d.data() } as SystemLog));
            setLogs(newLogs);
        });

        // 4. VERIFICATIONS
        const qVerif = query(collection(db, 'verification_requests'), where('status', '==', 'PENDING'));
        const unsubVerif = onSnapshot(qVerif, (snap) => {
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as VerificationRequest));
            setVerifications(items);
        });

        return () => {
            unsubUsers();
            unsubJobs();
            unsubLogs();
            unsubVerif();
        };
    }, []);


    // ----------------------------------------------------
    // ACTIONS
    // ----------------------------------------------------
    const handleImpersonate = () => {
        const targetId = prompt("Enter User ID to Impersonate:");
        if (targetId) import('../src/services/adminService').then(({ adminService }) => adminService.enterGhostMode(targetId));
    };

    const handleImpersonateUser = (userId: string) => {
        if (window.confirm('Enter Ghost Mode as this user?')) {
            import('../src/services/adminService').then(({ adminService }) => adminService.enterGhostMode(userId));
        }
    };

    const handleVerify = async (reqId: string, userId: string, approved: boolean) => {
        if (!window.confirm(`Are you sure you want to ${approved ? 'APPROVE' : 'REJECT'} this request?`)) return;
        try {
            await updateDoc(doc(db, 'verification_requests', reqId), { status: approved ? 'APPROVED' : 'REJECTED' });
            if (approved) {
                await updateDoc(doc(db, 'users', userId), { isVerified: true });
            }
        } catch (e) {
            console.error("Verification failed", e);
            alert("Action failed");
        }
    };

    const handleHardReset = async () => {
        const secret = prompt("TYPE 'DELETE_ALL_DATA' TO CONFIRM:");
        if (secret === 'DELETE_ALL_DATA') {
            try {
                await resetDatabase();
                alert("System Reset Complete.");
                window.location.href = '/';
            } catch (e) {
                alert("Reset Failed: " + e);
            }
        }
    };

    // ----------------------------------------------------
    // RENDER: COMMAND CENTER
    // ----------------------------------------------------
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8 pb-32">

            {/* HEADER */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white flex items-center gap-2">
                        <span className="text-red-500">Zolver.</span> {t.commandCenter} <span className="text-slate-600">v2.0</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-mono">{t.loggedAsAdmin}: {userData?.email}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={handleImpersonate} className="flex-1 md:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700">
                        👻 {t.ghostMode}
                    </button>
                    <button onClick={logout} className="px-4 py-2 border border-slate-700 text-slate-400 hover:text-white hover:border-white rounded-lg font-bold text-xs uppercase transition-colors">
                        {t.logout}
                    </button>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700 w-fit gap-1">
                    <button
                        onClick={() => setActiveTab('OVERVIEW')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'OVERVIEW' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        {t.overviewTab}
                    </button>
                    <button
                        onClick={() => setActiveTab('STORE')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'STORE' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        {t.storeTab}
                    </button>
                    <button
                        onClick={() => setActiveTab('PRICING')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'PRICING' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        {t.pricingTab}
                    </button>
                    <button
                        onClick={() => setActiveTab('TOOLS')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'TOOLS' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        🔧 TOOLS
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {activeTab === 'OVERVIEW' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                        {/* 1. LIVE PULSE */}
                        <div className="col-span-1 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div
                                onClick={() => setShowUserModal(true)}
                                className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-slate-500 transition-colors"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <UserIcon size={48} />
                                </div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{t.totalUsers}</p>
                                <h3 className="text-3xl font-black text-white">{stats.users}</h3>
                                <div className="mt-2 text-xs font-bold bg-green-500/10 text-green-400 inline-block px-2 py-1 rounded">+{stats.newUsersToday} Today</div>
                            </div>
                            <div
                                onClick={() => setShowLiveOpsModal(true)}
                                className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-slate-500 transition-colors"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Activity size={48} />
                                </div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{t.activeJobsTab}</p>
                                <h3 className="text-3xl font-black text-white">{stats.activeJobs}</h3>
                                <div className="mt-2 text-xs font-bold text-slate-500">{t.livePulse}</div>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Euro size={48} />
                                </div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{t.volumeGmv}</p>
                                <h3 className="text-3xl font-black text-white">€{stats.gmv.toLocaleString()}</h3>
                                <div className="mt-2 text-xs font-bold text-slate-500">Gross Volume</div>
                            </div>
                            <div
                                onClick={() => setShowRegionModal(true)}
                                className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-slate-500 transition-colors"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Globe size={48} />
                                </div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{t.topRegion}</p>
                                <h3 className="text-xl font-black text-white truncate">{countryStats[0]?.name || "N/A"}</h3>
                                <div className="mt-2 text-xs font-bold text-slate-500">{countryStats[0]?.percent || 0}% share</div>
                            </div>
                        </div>

                        {/* 2. MAIN FEED */}
                        <div className="col-span-1 md:col-span-3 space-y-6">
                            <div className="bg-slate-800/30 border border-slate-700 rounded-3xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                                        <ShieldCheck className="text-blue-500" /> {t.trustSafety}
                                    </h2>
                                    <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                                        {verifications.length} {t.pendingVerifications.split(' ')[0]}
                                    </span>
                                </div>

                                {verifications.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                                        <CheckCircle className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                                        <p className="text-slate-500 font-bold">{t.allClear}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {verifications.map(v => (
                                            <div key={v.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-white text-lg">{v.userName}</h4>
                                                        <p className="text-xs text-slate-400 font-mono">{v.userEmail}</p>
                                                    </div>
                                                    <span className="text-[10px] font-bold bg-slate-800 px-2 py-1 rounded text-slate-300">{t.proApplicant}</span>
                                                </div>
                                                <div className="flex gap-2 text-xs my-2">
                                                    <a href={v.idDocumentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded transition-colors text-blue-400">
                                                        <FileText size={14} /> ID Card
                                                    </a>
                                                    <a href={v.businessRegisterUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded transition-colors text-blue-400">
                                                        <FileText size={14} /> {t.businessReg}
                                                    </a>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                                    <button onClick={() => handleVerify(v.id, v.userId, false)} className="p-2 rounded bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40 text-xs font-bold transition-colors">
                                                        {t.reject}
                                                    </button>
                                                    <button onClick={() => handleVerify(v.id, v.userId, true)} className="p-2 rounded bg-green-900/20 text-green-500 border border-green-900/50 hover:bg-green-900/40 text-xs font-bold transition-colors">
                                                        {t.approveVerify}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-800/30 border border-slate-700 rounded-3xl p-6">
                                <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                    <MapPin className="text-orange-500" /> {t.regionalDist}
                                </h2>
                                <div className="space-y-4">
                                    {countryStats.map(c => (
                                        <div key={c.name} className="relative">
                                            <div className="flex justify-between text-xs font-bold mb-1 uppercase text-slate-400">
                                                <span>{c.name}</span>
                                                <span>{c.percent}%</span>
                                            </div>
                                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full"
                                                    style={{ width: `${c.percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                    {countryStats.length === 0 && <p className="text-slate-500 text-sm">No location data available.</p>}
                                </div>
                            </div>
                        </div>

                        {/* 3. SIDEBAR */}
                        <div className="col-span-1 space-y-6">
                            <div className="bg-red-950/20 border border-red-900/30 rounded-3xl p-6">
                                <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                                    <AlertTriangle size={18} /> {t.dangerZone}
                                </h3>
                                <button
                                    onClick={() => {
                                        const msg = prompt("Broadcast Message:");
                                        if (msg) import('../src/services/adminService').then(({ adminService }) => adminService.sendBroadcast(msg, 'WARNING'));
                                    }}
                                    className="w-full mb-3 py-3 px-4 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded-xl text-red-400 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Megaphone size={16} /> {t.emergencyBroadcast}
                                </button>
                                <button
                                    onClick={handleHardReset}
                                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition-all active:scale-95"
                                >
                                    <Trash2 size={16} /> {t.wipeDatabase}
                                </button>
                            </div>

                            <div className="bg-black border border-slate-800 rounded-3xl overflow-hidden flex flex-col max-h-[500px]">
                                <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                                    <h3 className="font-mono text-xs font-bold text-slate-400">{t.systemLogs}</h3>
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    </div>
                                </div>
                                <details className="md:block open:bg-black/50 md:open:bg-transparent">
                                    <summary className="md:hidden p-4 text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-900 select-none">
                                        Toggle Logs Output...
                                    </summary>
                                    <div className="p-4 font-mono text-[10px] space-y-2 overflow-y-auto max-h-[400px]">
                                        {logs.length === 0 && <p className="text-slate-600">No active logs...</p>}
                                        {logs.map(log => (
                                            <div key={log.id} className="border-l-2 border-slate-800 pl-2 py-1">
                                                <span className="text-slate-500 block mb-0.5">[{format(new Date(log.timestamp), 'HH:mm:ss')}]</span>
                                                <span className={`${log.severity === 'CRITICAL' ? 'text-red-500 font-bold' : log.severity === 'ERROR' ? 'text-orange-400' : 'text-green-400'}`}>
                                                    [{log.severity}]
                                                </span>{' '}
                                                <span className="text-slate-300">{log.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'STORE' && (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 min-h-[600px] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-800">
                        <StoreManager />
                    </div>
                )}


                {activeTab === 'PRICING' && (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 min-h-[600px] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-800">
                        <PricingManager />
                    </div>
                )}

                {activeTab === 'TOOLS' && (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 min-h-[600px] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-800">
                        <h2 className="text-2xl font-black mb-6">🔧 Admin Tools</h2>
                        <SeedStoreProducts />
                    </div>
                )}
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {showUserModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowUserModal(false)} />
                        <motion.div {...({ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, className: "bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[80vh] rounded-3xl overflow-hidden relative z-10 flex flex-col shadow-2xl" } as any)} >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><UserIcon className="text-blue-500" /> Users Directory</h3>
                                <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold sticky top-0 z-10">
                                        <tr>
                                            <th className="p-4">User</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4">Location</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-slate-800">
                                        {usersList.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4 flex items-center gap-3">
                                                    <img src={u.avatar} className="w-8 h-8 rounded-full bg-slate-800" />
                                                    <div>
                                                        <div className="font-bold text-white">{u.name}</div>
                                                        <div className="text-xs text-slate-500">{u.email}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${u.role === 'ADMIN' ? 'bg-red-900/50 text-red-500' :
                                                        u.role === 'PRO' ? 'bg-orange-900/50 text-orange-500' :
                                                            'bg-blue-900/50 text-blue-500'
                                                        }`}>{u.role}</span>
                                                </td>
                                                <td className="p-4 text-slate-400">
                                                    {u.addresses?.[0]?.locality || <span className="text-slate-600 italic">Unknown</span>}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => handleImpersonateUser(u.id)} className="text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 ml-auto">
                                                        <LogIn size={14} /> Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showLiveOpsModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLiveOpsModal(false)} />
                        <motion.div {...({ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, className: "bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[80vh] rounded-3xl overflow-hidden relative z-10 flex flex-col shadow-2xl" } as any)} >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="text-green-500" /> Live Operations</h3>
                                <button onClick={() => setShowLiveOpsModal(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {activeJobsList.length === 0 ? (
                                    <div className="text-center py-20 text-slate-500">No active jobs right now.</div>
                                ) : activeJobsList.map(job => (
                                    <div key={job.id} className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-slate-600 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${job.status === 'IN_PROGRESS' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                                            <div>
                                                <div className="font-bold text-white text-sm">{job.title}</div>
                                                <div className="text-xs text-slate-400 flex items-center gap-2">
                                                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{job.status}</span>
                                                    <span>•</span>
                                                    <span>€{job.suggestedPrice}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleImpersonateUser(job.clientId)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors">
                                            <MessageCircle size={14} /> Spy (Chat)
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}

                {showRegionModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRegionModal(false)} />
                        <motion.div {...({ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, className: "bg-slate-900 border border-slate-700 w-full max-w-xl max-h-[80vh] rounded-3xl overflow-hidden relative z-10 flex flex-col shadow-2xl" } as any)} >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Globe className="text-blue-500" /> User Geography</h3>
                                <button onClick={() => setShowRegionModal(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="space-y-6">
                                    {countryStats.map((c, i) => (
                                        <div key={c.name} className="relative">
                                            <div className="flex justify-between text-sm font-bold mb-2 uppercase text-white">
                                                <span className="flex items-center gap-2">
                                                    <span className="text-slate-500">#{i + 1}</span> {c.name}
                                                </span>
                                                <span>{c.percent}%</span>
                                            </div>
                                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    {...({
                                                        initial: { width: 0 },
                                                        animate: { width: `${c.percent}%` },
                                                        transition: { duration: 1, ease: 'easeOut' },
                                                        className: "h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                                                    } as any)}
                                                ></motion.div>
                                            </div>
                                        </div>
                                    ))}
                                    {countryStats.length === 0 && <p className="text-slate-500 text-center">No location data.</p>}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
