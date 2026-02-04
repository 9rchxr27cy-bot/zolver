import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Check, Zap, Crown, Star, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Card, Button, Badge } from '../../components/Layout';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useNotifications } from '../../contexts/NotificationContext';

export const BoostProfileScreen = ({ onBack }: { onBack: () => void }) => {
    const { t } = useLanguage();
    const { systemConfig, updateUser, currentUser } = useDatabase();
    const { addNotification } = useNotifications();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    // Hardcoded plans to prevent infinite loading if system config is empty
    const HARDCODED_PLANS = [
        { id: 'basic-boost', name: 'Basic Boost', price: 29, durationDays: 30, description: 'Get noticed by more clients.', features: ['100 Profile Views', 'Top in Search Results'], color: 'blue', iconName: 'Zap', isBestValue: false },
        { id: 'premium-spotlight', name: 'Premium Spotlight', price: 59, durationDays: 30, description: 'Maximum visibility for your services.', features: ['Unlimited Views', 'Featured Listing', 'Priority Support'], color: 'pink', iconName: 'Crown', isBestValue: true },
    ];

    const plans = (systemConfig?.monetization.boostPlans?.length ? systemConfig.monetization.boostPlans : HARDCODED_PLANS);

    const handlePurchase = async () => {
        if (!currentUser || !currentUser.id || !selectedPlan) return;

        const plan = plans.find(p => p.id === selectedPlan);
        if (!plan) return;

        setIsLoading(true);
        try {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + plan.durationDays);

            // MONETIZATION UPDATE: New Fields
            await updateUser(currentUser.id, {
                isBoosted: true, // Keep legacy flag for now
                boostPlan: selectedPlan as any,
                boostExpiresAt: expiryDate.toISOString(),

                // Requested Fields
                marketingPlan: selectedPlan,
                isPromoted: true,
                planActivatedAt: new Date().toISOString(),
                promotedUntil: expiryDate.toISOString()
            });

            addNotification('success', "Parabéns! Seu perfil foi impulsionado com sucesso.");

            onBack();
        } catch (error) {
            console.error(error);
            addNotification('error', 'Purchase failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const currentBoostActive = currentUser?.isBoosted && currentUser.boostExpiresAt && new Date(currentUser.boostExpiresAt) > new Date();

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Rocket className="text-pink-500" /> {t.boostHeroTitle}
                    </h1>
                    <p className="text-slate-500">{t.boostHeroDesc}</p>
                </div>
            </div>

            {/* Active Boost Status */}
            {currentBoostActive && (
                <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                            <Rocket size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{t.boostStatusActive}</h3>
                            <p className="text-green-50 opacity-90 text-sm">
                                {t.boostStatusExpires} {new Date(currentUser!.boostExpiresAt).toLocaleDateString()}.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const Icon = plan.iconName === 'Zap' ? Zap : plan.iconName === 'Crown' ? Crown : Star;
                    const isActivePlan = currentUser?.marketingPlan === plan.id;
                    const isSelected = selectedPlan === plan.id;

                    return (
                        <motion.div
                            key={plan.id}
                            whileHover={!isActivePlan ? { y: -5 } : {}}
                        >
                            <div
                                className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-200 overflow-hidden h-full ${isActivePlan
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10 ring-2 ring-green-200 cursor-default'
                                        : isSelected
                                            ? `border-${plan.color}-500 bg-${plan.color}-50 dark:bg-${plan.color}-900/10 ring-2 ring-${plan.color}-200`
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                                    }`}
                                onClick={() => !isActivePlan && setSelectedPlan(plan.id)}
                            >
                                {plan.isBestValue && !isActivePlan && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
                                        {t.boostBestValue}
                                    </div>
                                )}

                                {isActivePlan && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1">
                                        <Check size={12} strokeWidth={4} /> ACTIVE
                                    </div>
                                )}

                                <div className="p-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isActivePlan
                                            ? 'bg-green-100 text-green-600'
                                            : `bg-${plan.color}-100 text-${plan.color}-600 dark:bg-${plan.color}-900/30 dark:text-${plan.color}-400`
                                        }`}>
                                        <Icon size={24} />
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                                    <p className="text-slate-500 text-sm mb-4">{plan.description}</p>

                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">€{plan.price.toFixed(2)}</span>
                                        <span className="text-slate-400 font-medium whitespace-nowrap">/ {plan.durationDays} {t.days}</span>
                                    </div>

                                    <ul className="space-y-3 mb-6">
                                        {plan.features?.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                <div className={`p-1 mt-0.5 rounded-full ${isActivePlan ? 'bg-green-100 text-green-600' : `bg-${plan.color}-100 text-${plan.color}-600`} shrink-0`}>
                                                    <Check size={10} strokeWidth={4} />
                                                </div>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className={`w-full py-2 rounded-xl text-center font-bold border transition-colors ${isActivePlan
                                            ? 'bg-green-500 text-white border-green-500'
                                            : isSelected
                                                ? `bg-${plan.color}-500 text-white border-${plan.color}-500`
                                                : 'bg-transparent border-slate-200 text-slate-400'
                                        }`}>
                                        {isActivePlan ? 'Current Plan' : isSelected ? t.boostSelected : t.boostSelectPlan}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl flex gap-3 text-xs text-slate-500">
                <AlertTriangle size={16} className="shrink-0 text-amber-500" />
                <p>
                    {t.boostDisclaimer}
                </p>
            </div>

            {/* Sticky Action Footer (Mobile) or Standard Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 md:static md:bg-transparent md:border-none md:p-0 flex justify-end">
                <Button
                    size="lg"
                    className={`w-full md:w-auto shadow-xl ${selectedPlan ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    disabled={!selectedPlan || isLoading}
                    onClick={handlePurchase}
                >
                    {isLoading ? t.processing : selectedPlan ? t.boostActivateNow : t.boostSelectPlan}
                </Button>
            </div>
        </div>
    );
};
