import React from 'react';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const TermsScreen = ({ onBack }: { onBack?: () => void }) => {
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
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Terms of Use</h1>
                    <p className="text-slate-500">Last Updated: January 2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300">
                    <section>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Introduction</h3>
                        <p>
                            Welcome to Zolver. Zolver is a platform that facilitates the connection between Service Professionals ("Pros") and Clients.
                            By using our application, you agree to these terms completely.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Nature of Service</h3>
                        <p>
                            Zolver acts specifically as an <strong>intermediary platform</strong>. We are not a construction company, cleaning service, or employer of the Professionals.
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Contracts are formed directly between the Client and the Pro.</li>
                            <li>Zolver is not liable for the quality, safety, or legality of the services provided.</li>
                            <li>Pros are independent contractors, not employees of Zolver.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Payments and Fees</h3>
                        <p>
                            Payments made through the Zolver Secure Vault are held in escrow until job completion.
                            Zolver charges a service fee (Commission) on transactions to maintain the platform.
                            Cancellations made less than 24 hours before a scheduled job may incur a penalty fee.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4. User Responsibilities</h3>
                        <p>
                            Users agree to provide accurate information and treat other users with respect.
                            Any fraudulent activity, harassment, or misuse of the platform will result in immediate account suspension.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">5. Liability Limitation</h3>
                        <p>
                            To the maximum extent permitted by law, Zolver shall not be liable for any indirect, incidental, special, consequential, or punitive damages
                            arising out of your use of the services.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-400">Zolver Luxembourg S.à r.l.</p>
                </div>

            </div>
        </div>
    );
};
