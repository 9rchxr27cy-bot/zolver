import React from 'react';
import { ArrowLeft, Shield, Lock } from 'lucide-react';

export const PrivacyScreen = ({ onBack }: { onBack?: () => void }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">

                {/* Header */}
                <div className="mb-8">
                    {onBack && (
                        <button onClick={onBack} className="mb-4 flex items-center text-slate-500 hover:text-orange-500">
                            <ArrowLeft size={18} className="mr-2" /> Back
                        </button>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="text-green-500" />
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Privacy Policy</h1>
                    </div>
                    <p className="text-slate-500">GDPR Compliant • Last Updated: January 2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300">
                    <section className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <Lock size={16} /> Data Protection (GDPR)
                        </h3>
                        <p className="text-sm">
                            We process your personal data in accordance with the <strong>General Data Protection Regulation (EU) 2016/679</strong>.
                            Your privacy is paramount to us.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Data Collection</h3>
                        <p>
                            We collect only the data necessary to provide our services:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong> Identity:</strong> Name, Surname, Email.</li>
                            <li><strong> Verification:</strong> ID Documents, Business Permits (stored securely via Stripe/Firebase).</li>
                            <li><strong> Location:</strong> To match Pros with nearby Jobs.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Data Usage</h3>
                        <p>
                            Your data is used strictly to:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Facilitate service bookings.</li>
                            <li>Process secure payments.</li>
                            <li>Verify the identity of professionals for safety.</li>
                            <li>Send critical service notifications.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Your Rights</h3>
                        <p>
                            Under GDPR, you have the right to:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Access your personal data.</li>
                            <li>Rectify incorrect data.</li>
                            <li><strong>Right to be Forgotten:</strong> Request deletion of your account and data.</li>
                            <li>Object to data processing for marketing.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4. Cookies</h3>
                        <p>
                            We use essential cookies for authentication and session management. We do not use aggressive third-party tracking cookies without your explicit consent.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-400">Data Controller: Zolver Luxembourg S.à r.l.</p>
                </div>

            </div>
        </div>
    );
};
