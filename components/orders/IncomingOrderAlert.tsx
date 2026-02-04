import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import { JobRequest } from '../../types';
import { X, ArrowRight, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const IncomingOrderAlert: React.FC = () => {
    const { userData } = useAuth();
    const [incomingJob, setIncomingJob] = useState<JobRequest | null>(null);
    const [isRinging, setIsRinging] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize Audio
    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audioRef.current.loop = true;
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Listen for New Orders
    useEffect(() => {
        if (!userData || userData.role !== 'PRO') return;

        // Listen for jobs targeted at this pro created recently
        // We allow a 5-minute window to catch "just arrived" jobs
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        // Query for Direct Requests
        const q = query(
            collection(db, 'jobs'),
            where('target_company_id', '==', userData.id),
            where('is_direct_request', '==', true),
            // We look for statuses that indicate a fresh request waiting for response
            where('status', 'in', ['OPEN', 'WAITING_PROVIDER_CONFIRMATION', 'PENDING_PRO_CONFIRMATION']),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const job = { id: change.doc.id, ...change.doc.data() } as JobRequest;

                    // Check if it's actually recent (Firestore query above helps, but double check)
                    const jobTime = new Date(job.createdAt).getTime();
                    const now = Date.now();
                    // Alert if created within last 2 minutes
                    if (now - jobTime < 2 * 60 * 1000) {
                        setIncomingJob(job);
                        setIsRinging(true);
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [userData]);

    // Handle Ringing Logic
    useEffect(() => {
        if (isRinging && audioRef.current) {
            audioRef.current.play().catch(e => console.log("Audio play failed (interaction needed):", e));
        } else if (!isRinging && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [isRinging]);

    const handleDismiss = () => {
        setIsRinging(false);
        setIncomingJob(null);
    };

    const handleViewOrder = () => {
        setIsRinging(false);
        if (incomingJob) {
            // Navigate to job details
            // Assuming parent handles routing or we just use window.location for now if no router available in context
            // Or set active tab in Pro Dashboard via event/context if possible.
            // For MVP, we can emit a custom event or just close. 
            // Ideally we should use a navigation function passed down or from hook.
            // Since specific navigation isn't provided in prompt, we'll dismiss and assume user sees it in "My Jobs"
            // BUT prompt says: "Leva para /orders/{id}"
            window.history.pushState({}, '', `/orders/${incomingJob.id}`);
            // Also force reload or custom event to switch view if SPA
            window.dispatchEvent(new CustomEvent('NAVIGATE_TO_JOB', { detail: { jobId: incomingJob.id } }));
        }
        setIncomingJob(null);
    };

    if (!isRinging || !incomingJob) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center pointer-events-none p-4 pb-8">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={handleDismiss} />

            {/* Alert Modal */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="pointer-events-auto w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-orange-500 relative"
            >
                {/* Pulsing Header */}
                <div className="bg-orange-500 p-4 text-white flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2">
                        <BellRing className="animate-bounce" />
                        <h2 className="text-xl font-black uppercase tracking-tighter">New Request!</h2>
                    </div>
                    <button onClick={handleDismiss} className="p-1 hover:bg-white/20 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 text-center">
                    {incomingJob.clientAvatar && (
                        <img src={incomingJob.clientAvatar} className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-slate-100 object-cover" />
                    )}
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{incomingJob.clientName || 'Client'}</h3>
                    <p className="text-slate-500 font-medium mb-6">{incomingJob.title || incomingJob.category}</p>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6 flex justify-between items-center">
                        <div className="text-left">
                            <p className="text-xs text-slate-400 uppercase font-bold">Est. Value</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">
                                {incomingJob.suggestedPrice ? `€${incomingJob.suggestedPrice}` : 'Negotiable'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase font-bold">Distance</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{incomingJob.distance || 'Near'}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleViewOrder}
                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white font-black text-lg rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30"
                    >
                        VIEW REQUEST <ArrowRight />
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="mt-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 text-sm font-bold"
                    >
                        Dismiss Alert
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
