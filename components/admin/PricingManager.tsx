import React, { useState, useEffect } from 'react';
import { Save, DollarSign, Zap, Crown, Star, Percent, Settings, Plus, Trash2 } from 'lucide-react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { Card, Button, Input, Badge } from '../Layout';
import { MonetizationConfig, BoostPlan, SubscriptionPlan } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

export const PricingManager = () => {
    const { systemConfig, updateSystemConfig } = useDatabase();
    const { t } = useLanguage();
    const [config, setConfig] = useState<MonetizationConfig | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (systemConfig?.monetization) {
            setConfig(systemConfig.monetization);
        } else if (systemConfig && systemConfig.monetization === undefined) {
            console.log("Auto-seeding monetization config...");

            // AUTO-SEED Logic
            const seed = {
                commissionRateDefault: 15,
                subscriptionPlans: [],
                boostPlans: [
                    { id: "3day", name: "Turbo", durationDays: 3, price: 9.90, color: 'blue' }
                ]
            };

            // Trigger update immediately
            updateSystemConfig(seed as any).then(() => {
                setConfig(seed as any);
            });
        }
    }, [systemConfig]);

    if (!config) return <div className="p-8 text-center text-slate-500">{t.loading}...</div>;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSystemConfig(config);
            alert("Pricing configuration updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update config");
        } finally {
            setIsSaving(false);
        }
    };

    const updateBoostPlan = (id: string, updates: Partial<BoostPlan>) => {
        setConfig(prev => ({
            ...prev!,
            boostPlans: prev!.boostPlans.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
    };

    const updateSubscriptionPlan = (id: string, updates: Partial<SubscriptionPlan>) => {
        setConfig(prev => ({
            ...prev!,
            subscriptionPlans: prev!.subscriptionPlans.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <DollarSign className="text-green-500" /> {t.adminMonetization}
                    </h2>
                    <p className="text-sm text-slate-500">{t.adminMonetizationDesc}</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="flex gap-2 bg-green-600 hover:bg-green-700">
                    <Save size={20} /> {isSaving ? t.saving : t.saveChanges}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Global Fees */}
                <Card className="space-y-6">
                    <h3 className="font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <Settings size={18} className="text-slate-400" /> {t.platformDefaults}
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                                <Percent size={14} /> {t.adminCommRate}
                            </label>
                            <Input type="number" value={config.commissionRateDefault} onChange={e => setConfig({ ...config, commissionRateDefault: Number(e.target.value) })} />
                            <p className="text-[10px] text-slate-500">{t.adminCommRateDesc}</p>
                        </div>
                    </div>
                </Card>

                {/* 2. Marketing (Boost) Plans */}
                <Card className="space-y-6">
                    <h3 className="font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <Zap size={18} className="text-amber-500" /> {t.adminPaidBoosts}
                    </h3>
                    <div className="space-y-6">
                        {config.boostPlans.map(plan => (
                            <div key={plan.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`bg-${plan.color}-50 text-${plan.color}-600 border-${plan.color}-200`}>{plan.name}</Badge>
                                        <span className="text-xs text-slate-400 font-medium">ID: {plan.id}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">{t.adminPrice} (€)</label>
                                        <Input type="number" step="0.01" value={plan.price} onChange={e => updateBoostPlan(plan.id, { price: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">{t.boostDuration}</label>
                                        <Input type="number" value={plan.durationDays} onChange={e => updateBoostPlan(plan.id, { durationDays: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* 3. Subscription Plans */}
                <Card className="lg:col-span-2 space-y-6">
                    <h3 className="font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <Crown size={18} className="text-blue-500" /> {t.subTiers}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {config.subscriptionPlans.map(plan => (
                            <div key={plan.id} className="p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 space-y-4 hover:border-blue-500 transition-colors">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-black text-lg">{plan.name}</h4>
                                    <Badge>{plan.id}</Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">{t.monthlyPrice}</label>
                                        <Input type="number" value={plan.price} onChange={e => updateSubscriptionPlan(plan.id, { price: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">{t.adminCommRate}</label>
                                        <Input type="number" value={plan.commissionRate} onChange={e => updateSubscriptionPlan(plan.id, { commissionRate: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">{t.adminBilling}</label>
                                        <div className="pt-2 text-xs font-bold text-slate-500">{t.adminMonthly}</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">{t.featureList}</label>
                                    <textarea
                                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                                        value={plan.features.join('\n')}
                                        onChange={e => updateSubscriptionPlan(plan.id, { features: e.target.value.split('\n') })}
                                        rows={4}
                                        placeholder={t.onePerLine}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="md:col-span-2 p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
                            <Plus size={48} className="mx-auto mb-4 opacity-20" />
                            <p>{t.noSubPlans}</p>
                            <Button variant="ghost" onClick={() => setConfig({
                                ...config, subscriptionPlans: [
                                    { id: 'starter', name: 'Starter', price: 0, billingCycle: 'monthly', commissionRate: 20, features: ['Basic Access'] },
                                    { id: 'pro', name: 'Zolver Pro', price: 29.90, billingCycle: 'monthly', commissionRate: 10, features: ['Unlimited Access', 'Pro Badge'] }
                                ]
                            })}>{t.initDefaultPlans}</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
