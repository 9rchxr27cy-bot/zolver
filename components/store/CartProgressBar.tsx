import React from 'react';
import { Truck, CheckCircle } from 'lucide-react';

interface CartProgressBarProps {
    currentTotal: number;
    freeShippingThreshold?: number;
}

export const CartProgressBar: React.FC<CartProgressBarProps> = ({
    currentTotal,
    freeShippingThreshold = 50
}) => {
    const progress = Math.min((currentTotal / freeShippingThreshold) * 100, 100);
    const remaining = Math.max(freeShippingThreshold - currentTotal, 0);
    const achieved = currentTotal >= freeShippingThreshold;

    if (currentTotal === 0) return null;

    return (
        <div className="fixed bottom-20 md:bottom-4 left-0 right-0 z-40 px-4">
            <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {achieved ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                            <Truck className="w-5 h-5 text-orange-500" />
                        )}
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {achieved ? (
                                '🎉 Entrega Grátis Garantida!'
                            ) : (
                                `Faltam €${remaining.toFixed(2)} para entrega grátis`
                            )}
                        </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                        €{currentTotal.toFixed(2)}
                    </span>
                </div>

                <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${achieved
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-orange-500 to-amber-500'
                            }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
