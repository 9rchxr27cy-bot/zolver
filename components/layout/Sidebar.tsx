import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, X, Moon, Sun } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    darkMode: boolean;
    toggleTheme: () => void;
    children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    user,
    darkMode,
    toggleTheme,
    children
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '100%' }}
                    className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 flex flex-col"
                >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        {/* 1. ESTRUTURA DO CABEÇALHO (Usuario Request) */}
                        <div className="flex flex-col gap-6 mb-2">
                            {/* NÍVEL 1: Marca e Controles do App */}
                            <div className="flex justify-between items-center">
                                {/* Logo Zolver (Link para Home) */}
                                <Link to="/" className="flex items-center gap-2" onClick={onClose}>
                                    <div className="bg-orange-500 rounded-lg p-1.5">
                                        <span className="text-white font-bold text-lg">Z</span>
                                    </div>
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">ZOLVER</span>
                                </Link>

                                {/* Controles (Idioma + Tema) */}
                                <div className="flex items-center gap-2">
                                    {/* Botão de Idioma (Simplificado) */}
                                    <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                        <span className="text-xs font-bold">PT</span>
                                    </button>

                                    {/* Botão Dark Mode (ThemeToggle) */}
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                                    >
                                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* NÍVEL 2: Perfil do Usuário */}
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="relative cursor-pointer">
                                        <img
                                            className="w-10 h-10 rounded-full border-2 border-orange-500 p-0.5 object-cover"
                                            src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                                            alt="Avatar"
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900">
                                            {user?.role === 'PRO' ? 'PRO' : 'USER'}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                                            {user?.name || 'Visitante'}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                                            {user?.email || 'Ver Perfil'}
                                        </p>
                                    </div>
                                </div>

                                {/* Botão de Configurações do Perfil */}
                                <Link to="/profile" onClick={onClose} className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-orange-500 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <Settings size={18} />
                                </Link>
                            </div>
                        </div>
                        {/* END HEADER */}

                        <div className="flex justify-end mt-4">
                            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {children}
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
};
