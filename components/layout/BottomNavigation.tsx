import React, { useMemo } from 'react';
import { TrendingUp, ClipboardList, Plus, MessageCircle, Menu, Wallet, Briefcase, Activity, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface BottomNavigationProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
    const { userData: user } = useAuth();

    const items = useMemo(() => {
        if (!user) return [];

        if (user.role === 'PRO') {
            return [
                { id: 'ACTIVE', label: 'Active', icon: Activity },
                { id: 'MARKET', label: 'Market', icon: ShoppingBag },
                { id: 'MY_JOBS', label: 'Requests', icon: Briefcase },
                { id: 'FINANCE', label: 'Finance', icon: Wallet },
                { id: 'MENU', label: 'Menu', icon: Menu }
            ];
        }

        // CLIENT ROLE - Final Navigation Structure
        return [
            { id: 'FEATURED', label: 'Featured', icon: TrendingUp },
            { id: 'ORDERS', label: 'Pedidos', icon: ClipboardList },
            { id: 'NEW', label: 'Novo', icon: Plus, isSpecial: true },
            { id: 'MESSAGES', label: 'Chat', icon: MessageCircle },
            { id: 'MENU', label: 'Menu', icon: Menu }
        ];
    }, [user?.role]);

    if (!user) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe z-50 md:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto relative">
                {items.map((item) => {
                    const isActive = activeTab === (item.id === 'NEW' ? 'XXXX' : item.id);
                    const isSpecial = (item as any).isSpecial;

                    if (isSpecial) {
                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className="relative -top-6 group"
                            >
                                <div className="w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/40 flex items-center justify-center transform transition-transform group-active:scale-95 border-4 border-slate-50 dark:border-slate-900">
                                    <item.icon size={28} strokeWidth={2.5} />
                                </div>
                                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                    {item.label}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`}
                        >
                            <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-orange-50 dark:bg-orange-500/10' : ''}`}>
                                <item.icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`transition-transform ${isActive ? 'scale-110' : ''}`}
                                />
                            </div>
                            <span className="text-[10px] font-bold">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
