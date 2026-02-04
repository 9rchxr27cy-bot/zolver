import React from 'react';
import { ShieldCheck, Truck, CreditCard, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const TrustBadges: React.FC = () => {
    const { t } = useLanguage();

    const badges = [
        {
            icon: Truck,
            title: 'Entrega Grátis',
            subtitle: 'Acima de €50',
            color: 'text-green-600 dark:text-green-400'
        },
        {
            icon: RotateCcw,
            title: 'Devolução 30 Dias',
            subtitle: 'Sem perguntas',
            color: 'text-blue-600 dark:text-blue-400'
        },
        {
            icon: ShieldCheck,
            title: 'Compra Segura',
            subtitle: 'SSL Certificado',
            color: 'text-purple-600 dark:text-purple-400'
        },
        {
            icon: CreditCard,
            title: 'Pagamento Fácil',
            subtitle: 'Todos os métodos',
            color: 'text-orange-600 dark:text-orange-400'
        }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-6">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {badges.map((badge, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${badge.color}`}>
                                <badge.icon size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-slate-900 dark:text-white">
                                    {badge.title}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {badge.subtitle}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
