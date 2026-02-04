import React from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingBag,
    History,
    User,
    Users,
    Globe,
    Moon,
    Sun,
    LogOut,
    ChevronRight,
    Search
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { User as UserType } from '../../types';

interface ClientMenuScreenProps {
    user: UserType;
    darkMode: boolean;
    onToggleTheme: () => void;
    onNavigate: (route: string) => void;
    onLogout: () => void;
}

export const ClientMenuScreen: React.FC<ClientMenuScreenProps> = ({
    user,
    darkMode,
    onToggleTheme,
    onNavigate,
    onLogout
}) => {
    const { language, setLanguage, t } = useLanguage();

    const MenuItem = ({ icon: Icon, label, onClick, badge }: any) => (
        <button
            onClick={onClick}
            className="flex items-center justify-between w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 group-hover:text-orange-500 transition-colors">
                    <Icon size={20} />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {badge && <span className="text-xs font-bold text-orange-500">{badge}</span>}
                <ChevronRight size={18} className="text-slate-400" />
            </div>
        </button>
    );

    const SectionTitle = ({ title }: { title: string }) => (
        <div className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {title}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            // @ts-ignore
            className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-950"
        >
            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-b-3xl shadow-lg mb-4">
                <div className="flex items-center gap-4">
                    <img
                        src={user.avatar}
                        className="w-16 h-16 rounded-2xl border-4 border-white/20 shadow-lg"
                        alt={user.name}
                    />
                    <div>
                        <h2 className="text-xl font-black">{user.name}</h2>
                        <p className="text-sm opacity-90">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 px-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-sm border border-slate-100 dark:border-slate-800">
                    <SectionTitle title="Explorar" />

                    <MenuItem
                        icon={Search}
                        label="Buscar Profissionais"
                        onClick={() => onNavigate('/explore')}
                    />

                    <MenuItem
                        icon={ShoppingBag}
                        label="Loja Zolver"
                        onClick={() => onNavigate('/store')}
                    />

                    <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

                    <SectionTitle title={(t as any).general || 'Minha Conta'} />

                    <MenuItem
                        icon={History}
                        label={t.historyTab || 'Histórico'}
                        onClick={() => onNavigate('/history')}
                    />

                    <MenuItem
                        icon={User}
                        label={t.profile || 'Dados Pessoais'}
                        onClick={() => onNavigate('/profile')}
                    />

                    <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

                    <SectionTitle title="App" />

                    {/* Language Selector */}
                    <button
                        onClick={() => {
                            const langs = ['en', 'pt', 'fr', 'de'];
                            const currentIndex = langs.indexOf(language);
                            const nextLang = langs[(currentIndex + 1) % langs.length];
                            setLanguage(nextLang as any);
                        }}
                        className="flex items-center justify-between w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                <Globe size={20} />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{(t as any).language || 'Idioma'}</span>
                        </div>
                        <span className="text-sm font-bold text-orange-500 uppercase">{language}</span>
                    </button>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={onToggleTheme}
                        className="flex items-center justify-between w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">
                                {darkMode ? 'Modo Claro' : 'Modo Escuro'}
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Logout Footer */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-4">
                <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                    <LogOut size={20} />
                    {t.logout || 'Sair'}
                </button>
            </div>
        </motion.div>
    );
};
