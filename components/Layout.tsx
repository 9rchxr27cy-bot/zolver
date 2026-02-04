
import React, { useState } from 'react';
import { Moon, Sun, ChevronDown, User as UserIcon, LogOut, X, Mail, Phone, Lock, Briefcase, User as UserCircle, LayoutDashboard, Wrench } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { useLanguage, LANGUAGES_LIST, Language } from '../contexts/LanguageContext';
import { Button, Input, ZolverLogo } from './ui';
import { db } from '../src/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement } from '../types';
export { Button, Input, Card, Badge } from './ui';

import { DashboardView } from '../screens/ClientScreens';
import { Home, MessageCircle, Compass, CreditCard, ShoppingBag } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  toggleTheme: () => void;
  user: User | null;
  onLogout: () => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onDashboardClick: () => void;
  onLogin: (emailOrPhone: string, pass: string) => void;
  onSignUpClick: () => void;
  onSwitchRole: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  // Navigation Control
  onStoreClick?: () => void;
  currentView?: DashboardView;
  onViewChange?: (view: DashboardView) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  darkMode,
  toggleTheme,
  user,
  onLogout,
  onLogoClick,
  onProfileClick,
  onDashboardClick,
  onLogin,
  onSignUpClick,
  authModalOpen,
  setAuthModalOpen,
  onStoreClick,
  currentView,
  onViewChange
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { isImpersonating, exitGhostMode } = useAuth();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const currentLangObj = LANGUAGES_LIST.find(l => l.code === language) || LANGUAGES_LIST[0];
  const isEmployee = user?.role === 'EMPLOYEE';
  const isAdmin = user?.role === 'ADMIN';

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  React.useEffect(() => {
    const q = query(
      collection(db, 'system_announcements'),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setAnnouncement(snap.docs[0].data() as Announcement);
      } else {
        setAnnouncement(null);
      }
    });
    return () => unsub();
  }, []);

  const handleNavClick = (view: DashboardView) => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-orange-100 selection:text-orange-900 pb-20 md:pb-0 pt-0 md:pt-16">

        {/* --- DESKTOP TOP BAR (Fixed) --- */}
        <nav className={`fixed top-0 w-full z-50 backdrop-blur-md px-4 md:px-8 py-3 hidden md:flex items-center justify-between shadow-sm transition-colors duration-300
            ${isAdmin
            ? 'bg-slate-900/95 dark:bg-black/90 border-b border-red-900/30'
            : 'bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800'
          }`}>
          {/* LEFT: Logo */}
          <div
            className={`flex items-center gap-2 group ${isEmployee ? 'cursor-default' : 'cursor-pointer'}`}
            onClick={isEmployee ? undefined : onLogoClick}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform p-2
                ${isAdmin
                ? 'bg-red-600 text-white shadow-red-500/20'
                : 'bg-slate-900 dark:bg-white text-orange-500 shadow-slate-900/20 dark:shadow-none'
              } ${!isEmployee && 'group-active:scale-90'}`}>
              <ZolverLogo />
            </div>
            <div>
              <span className={`text-xl font-black uppercase tracking-tighter block ${isAdmin ? 'text-white' : ''}`}>
                Zolver<span className={isAdmin ? 'text-red-500' : 'text-orange-500'}>.lu</span>
              </span>
              {isAdmin && <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase block -mt-1">Command Center</span>}
            </div>
          </div>

          {/* CENTER: Navigation Links Removed for Minimalist Design */}


          {/* RIGHT: User & Settings */}
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl transition-colors ${!user ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <span className="text-lg">{currentLangObj.flag}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    {...({
                      initial: { opacity: 0, y: 10 },
                      animate: { opacity: 1, y: 0 },
                      exit: { opacity: 0, y: 10 },
                      className: "absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 overflow-hidden"
                    } as any)}
                  >
                    {LANGUAGES_LIST.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code as Language);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${language === l.code ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <span className="text-lg">{l.flag}</span>
                        {l.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className="flex items-center gap-2 sm:gap-3 p-1 pr-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group"
                >
                  <img src={user.avatar} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-100 dark:border-slate-700" alt={user.name} />
                  <span className="text-sm font-bold hidden sm:block">{user.name}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform group-hover:text-slate-600 ${isUserOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserOpen && (
                    <motion.div
                      {...({
                        initial: { opacity: 0, y: 10 },
                        animate: { opacity: 1, y: 0 },
                        exit: { opacity: 0, y: 10 },
                        className: "absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 overflow-hidden"
                      } as any)}
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                        <span className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.loggedAs}</span>
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{user.email}</span>
                      </div>
                      <button
                        onClick={() => { onDashboardClick(); setIsUserOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard size={18} /> {t.dashboard}
                      </button>
                      <button
                        onClick={() => { onProfileClick(); setIsUserOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <UserIcon size={18} /> {t.profile}
                      </button>
                      <button
                        onClick={() => { onLogout(); setIsUserOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={18} /> {t.logout}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 whitespace-nowrap flex items-center gap-1"
              >
                <span>{t.signIn}</span>
                <span className="opacity-70 font-normal">/ Join</span>
              </Button>
            )}
          </div>
        </nav>

        <div className={`md:hidden sticky top-0 z-50 backdrop-blur border-b p-4 flex justify-between items-center transition-colors duration-300
            ${isAdmin
            ? 'bg-slate-900/95 text-white border-red-900/30'
            : 'bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white border-slate-100 dark:border-slate-800'
          } ${user ? 'hidden' : ''}`}>
          {/* Left: Logo */}
          <div className="flex items-center gap-2" onClick={onLogoClick}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${isAdmin ? 'bg-red-600 text-white' : 'bg-slate-900 text-orange-500'}`}>
              <ZolverLogo className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-lg leading-none block">Zolver</span>
              {isAdmin && <span className="text-[8px] font-bold text-red-500 tracking-widest uppercase block">ADMIN</span>}
              {!isAdmin && <span className="text-[8px] font-bold text-orange-500 tracking-widest uppercase block">LUXEMBOURG</span>}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Public: Language Switcher specific for mobile */}
            {!user && (
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
              >
                <span className="text-sm">{currentLangObj.flag}</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 text-slate-500">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Public: Login Button Short */}
            {!user && (
              <Button
                size="sm"
                onClick={() => setAuthModalOpen(true)}
                className="px-3 py-1.5 h-auto text-xs font-bold"
              >
                {t.signIn} / Join
              </Button>
            )}

            {/* Mobile User Menu Toggle if Logged In? Already separate usually, but here just barebones */}
            {user && (
              <img
                src={user.avatar}
                className="w-8 h-8 rounded-lg border border-slate-200"
                onClick={onProfileClick} // Simple profile nav
              />
            )}
          </div>
        </div>

        {/* Mobile Language Dropdown (Global Overlay) */}
        <AnimatePresence>
          {isLangOpen && !user && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              {...({ className: "md:hidden fixed top-16 right-4 z-[60] bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-200 dark:border-slate-800 p-2 w-48" } as any)}
            >
              {LANGUAGES_LIST.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLanguage(l.code as Language); setIsLangOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold border-b border-slate-50 last:border-0 dark:border-slate-800"
                >
                  <span>{l.flag}</span> {l.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>


        {isImpersonating && (
          <div className="bg-red-900/90 text-white text-center py-2 font-mono border-b-2 border-red-500 animate-pulse flex items-center justify-center gap-4">
            <span>👁️ GHOST MODE ACTIVE: VIEWING AS {user?.email}</span>
            <button onClick={exitGhostMode} className="bg-white text-red-900 px-3 py-1 rounded text-xs font-bold uppercase hover:bg-red-100">
              Exit Spy Mode
            </button>
          </div>
        )}

        {announcement && (
          <div className={`w-full py-2 px-4 text-center text-sm font-bold text-white flex items-center justify-center gap-2 animate-in slide-in-from-top duration-500 ${announcement.type === 'CRITICAL' ? 'bg-red-600' :
            announcement.type === 'WARNING' ? 'bg-orange-500' : 'bg-blue-600'
            }`}>
            📢 {announcement.message}
          </div>
        )}

        <main className="max-w-7xl mx-auto min-h-[calc(100vh-64px)] pb-24 md:pb-0">
          {children}
        </main>



      </div>
    </div >
  );
};
