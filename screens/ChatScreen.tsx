
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Send, Users, Lock, RotateCcw, CheckCircle, Tag,
    Car, MapPin, Play, Square, CreditCard, Star, ChevronRight, Bot,
    FileText, Download, CheckCircle2, ArrowLeft as ArrowLeftIcon, X,
    MoreVertical, Phone, Banknote
} from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { Proposal, ChatMessage, JobStatus, JobRequest, Invoice, Role, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { ServiceStatusHeader } from '../components/ServiceStatusHeader';
import { UserProfileModal } from '../components/ServiceModals';
import { createInvoiceObject, downloadInvoicePDF } from '../utils/pdfGenerator';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, getDocs, where } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { ProposalCard, StatusStepper, InvoiceCard, SecurityCodeCard } from '../components/ChatWorkflow'; // Added SecurityCodeCard

// Local Helper Components Removed - Moved to ../components/ChatWorkflow

interface ChatScreenProps {
    proposal: Proposal;
    onBack: () => void;
    currentUserRole: Role;
    onComplete: () => void;
    onToggleFavorite?: (id: string) => void;
    onToggleBlock?: (id: string) => void;
    isFavorited?: boolean;
    isBlocked?: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
    proposal,
    onBack,
    currentUserRole,
    onComplete,
    onToggleFavorite,
    onToggleBlock,
    isFavorited,
    isBlocked
}) => {
    const { t } = useLanguage();
    const { jobs, users, chats, proposals, addChatMessage, updateChatMessage, updateJob, updateProposal, getStaffMembers } = useDatabase();

    // Get Current User (to know who is the 'Boss' and get staff)
    // Get Current User (to know who is the 'Boss' and get staff)
    const currentUser = React.useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('servicebid_current_session_user') || '{}');
        } catch (e) { return {}; }
    }, []);

    const hasAttemptedLock = useRef(false);

    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileUser, setProfileUser] = useState<User | Partial<User> | null>(null); // Dynamic profile user
    const [negotiating, setNegotiating] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    // Finish Job & Invoice State
    const [isFinishJobModalOpen, setIsFinishJobModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER' | null>(null);

    // Review State for Client
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');

    const [isStartJobModalOpen, setIsStartJobModalOpen] = useState(false);
    const [startCodeInput, setStartCodeInput] = useState('');
    const [startCodeError, setStartCodeError] = useState(false);

    // Mock addTransaction for now
    const addTransaction = async (transaction: any) => {
        console.log("Adding transaction:", transaction);
        await addDoc(collection(db, 'transactions'), transaction);
    };

    const [newPrice, setNewPrice] = useState(proposal.price.toString());
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [negotiationReason, setNegotiationReason] = useState('');

    const staffMembers = currentUserRole === 'PRO' ? getStaffMembers(currentUser.id) : [];

    const job = jobs.find(j => j.id === proposal.jobId);
    const chatId = proposal.id;
    // Determine "Other User"
    let otherUser: User | undefined;
    if (currentUserRole === 'CLIENT') {
        // If job is assigned to a specific employee, show them. Otherwise show the Pro (Company Owner)
        if (job?.assignedEmployeeId) {
            otherUser = users.find(u => u.id === job.assignedEmployeeId);
        }
        if (!otherUser) {
            otherUser = users.find(u => u.id === proposal.proId);
        }
    } else {
        otherUser = users.find(u => u.id === job?.clientId);
    }

    // FIX: Subscribe to messages locally instead of relying on global context
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        // Direct subscription to this chat's messages
        const q = query(collection(db, 'chats', chatId, 'messages'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage))
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            setMessages(msgs);

            // Scroll on new messages
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });

        return () => unsubscribe(); // Cleanup subscription
    }, [chatId]);

    // --- LOCKING LOGIC ---
    // If Pro opens chat and it's not locked, lock it.
    // --- LOCKING LOGIC ---
    // If Pro opens chat and it's not locked, lock it.
    useEffect(() => {
        if (currentUserRole === 'PRO' && job && !job.isLocked && !job.isExternal && !hasAttemptedLock.current) {
            hasAttemptedLock.current = true; // Prevent infinite re-lock attempts

            // Generate Start Code if not exists
            const code = Math.floor(1000 + Math.random() * 9000).toString();

            updateJob({
                ...job,
                isLocked: true,
                lockedBy: currentUser.id,
                startCode: job.startCode || code
            });
            addChatMessage(chatId, {
                id: `sys-lock-${Date.now()}`,
                senderId: 'SYSTEM',
                text: '🔒 This request is now exclusively locked to you.',
                isSystem: true,
                type: 'text',
                timestamp: new Date().toISOString()
            });
        }
    }, [currentUserRole, job?.id, job?.isLocked, currentUser.id]);

    // --- EXECUTION STEPPER LOGIC ---
    const handleUpdateExecutionStep = (newStep: JobRequest['executionStep']) => {
        if (!job) return;

        let statusUpdate: Partial<JobRequest> = { executionStep: newStep };
        let msgText = '';

        // Map Step to Job Status & System Message
        switch (newStep) {
            case 'EN_ROUTE':
                statusUpdate.status = 'EN_ROUTE';
                msgText = "🚗 The professional is on the way.";
                break;
            case 'ARRIVED':
                statusUpdate.status = 'ARRIVED';
                msgText = "📍 The professional has arrived.";
                break;
            case 'STARTED':
                statusUpdate.status = 'IN_PROGRESS'; // Keep status internal as IN_PROGRESS for dashboard
                statusUpdate.startedAt = new Date().toISOString();
                msgText = "▶️ Work started with secure code.";
                break;
            case 'FINISHED':
                // Don't change main status to COMPLETED yet, wait for client confirmation
                statusUpdate.finishedAt = new Date().toISOString();
                msgText = "✅ Work finished by professional. Waiting for client confirmation.";
                break;
        }

        updateJob({ ...job, ...statusUpdate });
        if (msgText) {
            handleSendMessage('', 'text', { isSystem: true, text: msgText });
        }
    };

    const handleStartWorkWithCode = () => {
        if (startCodeInput === job?.startCode) {
            handleUpdateExecutionStep('STARTED');
            setIsStartJobModalOpen(false);
            setStartCodeError(false);
        } else {
            setStartCodeError(true);
        }
    };

    const handleSendMessage = (text: string = inputText, type: ChatMessage['type'] = 'text', payload?: any) => {
        if (!text && type === 'text') return;

        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderId: currentUserRole === 'CLIENT' ? job!.clientId : proposal.proId, // Simplified for this context
            text: type === 'text' ? text : undefined,
            timestamp: new Date().toISOString(),
            type,
            ...payload
        };

        addChatMessage(chatId, newMessage);
        setInputText('');

        // Simulate Auto-Reply (Mock) if user is offline/busy (simplified)
        if (currentUserRole === 'CLIENT' && otherUser?.autoReplyConfig?.enabled) {
            setTimeout(() => {
                const autoMsg: ChatMessage = {
                    id: `msg-auto-${Date.now()}`,
                    senderId: otherUser!.id,
                    text: otherUser!.autoReplyConfig?.customMessage || "I'm currently busy but will get back to you shortly.",
                    timestamp: new Date().toISOString(),
                    type: 'text',
                    isAutoReply: true
                };
                addChatMessage(chatId, autoMsg);
            }, (otherUser.autoReplyConfig.delay || 0) * 1000 + 1000); // converting mock minutes to fast ms
        }
    };

    const handleUpdateStatus = (newStatus: JobStatus) => {
        if (job) {
            updateJob({ ...job, status: newStatus });

            // System message
            let statusMessage = `Job status updated to: ${newStatus}`;
            if (newStatus === 'EN_ROUTE') statusMessage = "🚗 The professional is on the way to your location.";
            if (newStatus === 'ARRIVED') statusMessage = "📍 The professional has arrived at the destination.";
            // if (newStatus === 'STARTED') statusMessage = "🛠️ Work has started."; // Handled in execution step

            handleSendMessage('', 'text', {
                isSystem: true,
                text: statusMessage
            });

            if (newStatus === 'COMPLETED' && currentUserRole !== 'CLIENT') {
                // Generate Invoice
                const invoice = createInvoiceObject(
                    users.find(u => u.id === proposal.proId)!, // Pro
                    otherUser?.name || 'Client',
                    job,
                    job.finalPrice || proposal.price
                );

                handleSendMessage('', 'invoice', { invoiceDetails: invoice });
                onComplete();
            }
        }
    };

    const handleSendOffer = () => {
        const price = parseFloat(newPrice);
        if (price && job) {
            handleSendMessage('', 'PROPOSAL', { // CHANGED to PROPOSAL
                offerDetails: {
                    oldPrice: job.finalPrice || proposal.price,
                    newPrice: price,
                    reason: negotiationReason,
                    newDate,
                    newTime,
                    status: 'PENDING'
                }
            });
            setNegotiating(false);
        }
    };

    const handleAcceptOffer = (msg: ChatMessage) => {
        // Use fresh proposal from context to avoid stale state overwrites
        const currentProposal = proposals.find(p => p.id === proposal.id) || proposal;

        if (!msg.offerDetails || !job) return;

        // Update Message
        updateChatMessage(chatId, msg.id, {
            offerDetails: { ...msg.offerDetails, status: 'ACCEPTED' }
        });

        // Update Job Price
        updateJob({ ...job, finalPrice: msg.offerDetails.newPrice });
        // Update Proposal Price (for listing)
        updateProposal({ ...currentProposal, price: msg.offerDetails.newPrice });

        handleSendMessage('', 'text', { isSystem: true, text: `Price updated to €${msg.offerDetails.newPrice}` });
    };

    const handleAssignStaff = (staffId: string) => {
        const staff = users.find(u => u.id === staffId);
        if (!staff || !job) return;

        updateJob({ ...job, assignedEmployeeId: staffId, status: 'CONFIRMED' });

        handleSendMessage('', 'assignment', {
            isSystem: true,
            text: `Job assigned to team member: ${staff.name}`,
            assignmentDetails: {
                technicianId: staff.id,
                technicianName: staff.name,
                technicianAvatar: staff.avatar
            }
        });
        setIsAssignModalOpen(false);
    };

    const handleFinishJob = async () => {
        if (!job || !currentUser) return;

        // Update execution step to FINISHED
        handleUpdateExecutionStep('FINISHED');
        setIsFinishJobModalOpen(false);
    };

    // Client Confirms Job Finished
    const handleClientConfirmFinish = async (confirmed: boolean) => {
        if (!job) return;

        if (confirmed) {
            // Update step to WAIT FOR PAYMENT
            updateJob({ ...job, executionStep: 'FINISHED', status: 'WAITING_CLIENT_CONFIRMATION' }); // Using existing status or a new one?
            // Actually, if client confirms, we wait for Pro to acknowledge payment or just move to payment pending
            // Let's assume flow: Finished -> Client Confirm -> (Payment Flow)

            handleSendMessage('', 'text', {
                isSystem: true,
                text: "Client confirmed job completion. ✅ Proceeding to payment."
            });

            // Allow Pro to generate invoice now
            // We can set a temporary local state or just trust the 'FINISHED' step + confirmation message
        } else {
            // Client says NO
            updateJob({ ...job, executionStep: 'STARTED', status: 'IN_PROGRESS' });
            handleSendMessage('', 'text', {
                isSystem: true,
                text: "Client denied completion. Job set back to In Progress. ❌"
            });
        }
    };

    // OLD INVOICE GEN LOGIC MOVED TO SEPARATE FUNCTION TRIGGERED BY PRO AFTER CONFIRMATION
    const handleGenerateInvoice = async () => {
        if (!job || !currentUser) return;

        // 1. Create Invoice Object
        // In a real app, 'issuer' would come from currentUser.companyDetails
        // and 'client' from 'otherUser' or 'job.location'
        const invoice: Invoice = {
            id: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            date: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
            issuer: currentUser.companyDetails || {
                legalName: currentUser.name,
                legalType: 'independant',
                vatNumber: 'LU12345678', // Stub
                licenseNumber: '123456/A',
                licenseExpiry: '2025-12-31',
                iban: 'LU00 0000 0000 0000',
                address: 'Luxembourg'
            },
            client: {
                name: otherUser.name,
                address: (job.location as any)?.locality || job.location || "Luxembourg",
                vatNumber: undefined // Client VAT usually undefined for individuals
            },
            items: [{
                description: job.title,
                quantity: 1,
                unitPrice: job.finalPrice || proposals.find(p => p.jobId === job.id && (p.status as any) === 'ACCEPTED')?.price || 0,
                vatRate: 17,
                total: job.finalPrice || 0
            }],
            subtotalHT: (job.finalPrice || 0) / 1.17,
            totalVAT: (job.finalPrice || 0) * (1 - 1 / 1.17),
            totalTTC: job.finalPrice || 0,
            status: selectedPaymentMethod === 'CASH' || selectedPaymentMethod === 'CARD' ? 'PAID' : 'PENDING',
            language: 'EN',
            paymentMethod: selectedPaymentMethod
        };

        // 2. Update Job Status
        updateJob({ ...job, status: 'COMPLETED' });

        // 3. Send Invoice Message
        handleSendMessage('', 'invoice', {
            isSystem: true,
            text: 'Invoice Generated',
            invoiceDetails: invoice
        });

        // 4. Also add a system message clarifying payment
        handleSendMessage('', 'text', {
            isSystem: true,
            text: `Job Completed. Payment via ${selectedPaymentMethod}.`
        });

        // 5. Create Transaction Record (Stub for Dashboard)
        try {
            const transactionValues = {
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                description: `Payment for ${job.title}`,
                amount: invoice.totalTTC,
                type: 'CREDIT',
                status: invoice.status === 'PAID' ? 'COMPLETED' : 'PENDING',
                invoiceId: invoice.id,
                jobId: job.id,
                category: job.category,
                paymentMethod: selectedPaymentMethod,
                proId: currentUserRole === 'PRO' ? currentUser.id : job.assignedEmployeeId
            };

            // Add Transaction to DB
            if (addTransaction) { // Safe check
                addTransaction(transactionValues as any);
                // Note: addTransaction signature might need Transaction Type. 
                // Assuming dummy implementation for now as addTransaction is verified in task.md
            }

        } catch (e) {
            console.error("Error creating transaction", e);
        }
        setIsFinishJobModalOpen(false);

    };

    const handleSubmitReview = async () => {
        if (!job || !currentUser) return;

        try {
            // 1. Create Review Object
            const review = {
                id: crypto.randomUUID(),
                jobId: job.id,
                proId: job.assignedEmployeeId || proposals.find(p => p.jobId === job.id && (p.status as any) === 'ACCEPTED')?.proId || 'unknown',
                clientId: currentUser.id,
                clientName: currentUser.name,
                rating: reviewRating,
                comment: reviewComment,
                timestamp: Date.now(),
                serviceCategory: job.category,
                price: job.finalPrice
            };

            // 2. Save Review to Firestore (stubbed to console for now as we don't have 'reviews' collection set up in this context)
            // await addDoc(collection(db, 'reviews'), review);
            console.log("Review Submitted:", review);

            // 3. Mark job as reviewed locally (optimization) or update job in DB
            // await updateDoc(doc(db, 'jobs', job.id), { hasReview: true });

            // 4. Send a Thank You message in chat
            handleSendMessage('', 'text', {
                isSystem: true,
                text: `Client rated the service: ${reviewRating} stars! ⭐`
            });

            setIsReviewModalOpen(false);

            // addNotification('success', 'Review submitted successfully!');

        } catch (e) {
            console.error("Failed to submit review", e);
        }
    };

    if (!job || !otherUser) return <div>Loading...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                        setProfileUser(otherUser);
                        setIsProfileOpen(true);
                    }}>
                        <div className="relative">
                            <img src={otherUser.avatar} className="w-10 h-10 rounded-full object-cover" />
                            {/* Status Dot: Kept green as it means "Online" status, semantically correct, but changed class to verify no legacy emerald */}
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{otherUser.name}</h3>
                            <p className="text-xs text-slate-500">{job.title || job.description}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-orange-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-full">
                        <Phone size={20} />
                    </button>
                    <button onClick={() => {
                        setIsProfileOpen(true);
                    }} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <MoreVertical size={20} />
                    </button>
                    {/* Reciprocal Review Trigger for Pro */}
                    {currentUserRole === 'PRO' && (job.status === 'COMPLETED' || (job.status as unknown as string) === 'FINISHED') && (
                        <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className="p-2 bg-orange-50 text-orange-500 rounded-full hover:bg-orange-100 transition-colors"
                            title="Rate Client"
                        >
                            <Star size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Service Status Bar */}
            <ServiceStatusHeader status={job.status} />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = (currentUserRole === 'CLIENT' && msg.senderId === job.clientId) ||
                        (currentUserRole !== 'CLIENT' && msg.senderId !== job.clientId);

                    if (msg.isSystem) {
                        // Check if it's an assignment message to render uniquely
                        if (msg.type === 'assignment' && msg.assignmentDetails) {
                            return (
                                <div key={msg.id} className="flex justify-center my-4">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-1 pl-3 pr-1 rounded-full flex items-center gap-2 shadow-sm border border-slate-200 dark:border-slate-700">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Job Assigned to
                                        </span>
                                        <button
                                            onClick={() => {
                                                if (msg.assignmentDetails) {
                                                    // Fetch full user if possible, or use stub
                                                    const staffUser = users.find(u => u.id === msg.assignmentDetails!.technicianId);
                                                    setProfileUser(staffUser || {
                                                        id: msg.assignmentDetails.technicianId,
                                                        name: msg.assignmentDetails.technicianName,
                                                        avatar: msg.assignmentDetails.technicianAvatar,
                                                        role: 'EMPLOYEE',
                                                        level: 'Professional', // Fixed: 'Staff' is not a valid level
                                                        rating: 5.0,
                                                        languages: ['EN']
                                                    });
                                                    setIsProfileOpen(true);
                                                }
                                            }}
                                            className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-full py-1 px-2 hover:bg-slate-50 transition-colors"
                                        >
                                            <img src={msg.assignmentDetails.technicianAvatar} className="w-5 h-5 rounded-full bg-slate-200" />
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">{msg.assignmentDetails.technicianName}</span>
                                            <ChevronRight size={12} className="text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id} className="flex justify-center my-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }

                    if (msg.type === 'invoice' && msg.invoiceDetails) {
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <InvoiceCard invoice={msg.invoiceDetails} />
                            </div>
                        );
                    }

                    if (msg.type === 'PROPOSAL' || msg.type === 'offer_update') {
                        // Use ProposalCard
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full justify-center`}>
                                <ProposalCard
                                    msg={msg}
                                    onAccept={() => handleAcceptOffer(msg)}
                                    onDecline={() => { /* Implement Decline Logic */ }}
                                    canInterect={!isMe && msg.offerDetails?.status === 'PENDING'}
                                />
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${isMe
                                ? 'bg-orange-500 text-white rounded-br-sm shadow-lg shadow-orange-500/20'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-bl-sm border border-slate-100 dark:border-slate-800 shadow-sm'
                                }`}>
                                {msg.text}
                                {msg.isAutoReply && (
                                    <div className="mt-2 flex items-center gap-1 text-[10px] opacity-70 border-t border-white/20 pt-1">
                                        <Bot size={12} /> Auto-reply
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Pro Actions Bar */}
            {currentUserRole !== 'CLIENT' && (
                <div className="px-4 pb-2">
                    {/* Assign Button - Only for PRO if they have staff and Job is Confirmed but not yet started properly */}
                    {job.status === 'CONFIRMED' && currentUserRole === 'PRO' && staffMembers.length > 0 && !job.executionStep && (
                        <Button size="sm" variant="outline" className="w-full bg-white border-slate-200 text-slate-700 mb-2" onClick={() => setIsAssignModalOpen(true)}>
                            <Users size={16} className="mr-2" /> {t.assign || "Assign Team"}
                        </Button>
                    )}

                    {/* If Stepper is active, we don't need manual buttons usually, except maybe for specific overrides or if Stepper handles it all. 
                         The StatusStepper handles transitions. 
                         We just kept the Assign button here. 
                     */}
                </div>
            )}

            {/* Client Confirmation Banner */}
            {currentUserRole === 'CLIENT' && job.status === 'WAITING_CLIENT_CONFIRMATION' && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-t border-orange-100 dark:border-orange-800/50">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-full text-orange-600 dark:text-orange-400">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Confirm Job Completion</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                The professional has marked this job as finished. Please confirm if the work has been completed to your satisfaction.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => handleClientConfirmFinish(false)}
                            className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-700"
                        >
                            Not Done Yet
                        </Button>
                        <Button
                            onClick={() => handleClientConfirmFinish(true)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Confirm Completion
                        </Button>
                    </div>
                </div>
            )}

            {/* Input Area or Read-Only Banner */}
            {job.status === 'COMPLETED' ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
                        <Lock size={16} /> Chat is closed for this completed job.
                    </p>
                </div>
            ) : (
                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-end gap-2">
                    <button
                        onClick={() => setNegotiating(!negotiating)}
                        className="p-3 text-slate-400 hover:text-orange-500 bg-slate-50 dark:bg-slate-800 rounded-xl transition-colors"
                    >
                        <Tag size={20} />
                    </button>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center p-1">
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                            placeholder={t.typeMessage}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!inputText.trim()}
                            className="p-2 bg-orange-500 text-white rounded-lg shadow-md disabled:opacity-50 disabled:shadow-none transition-all hover:bg-orange-600"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Security Code Banner (Client Only) */}
            {currentUserRole === 'CLIENT' && job?.startCode && job?.executionStep !== 'STARTED' && job?.executionStep !== 'FINISHED' && job?.executionStep !== 'COMPLETED' && (
                <SecurityCodeCard code={job.startCode} />
            )}

            {/* Execution Stepper (Pro Only) */}
            {(currentUserRole === 'PRO' || currentUserRole === 'EMPLOYEE') && job && job.status !== 'OPEN' && job.status !== 'NEGOTIATING' && (
                <StatusStepper
                    currentStep={job.executionStep}
                    onStepChange={handleUpdateExecutionStep}
                    onStartWork={() => setIsStartJobModalOpen(true)}
                />
            )}

            {/* Negotiation Modal */}
            <AnimatePresence>
                {negotiating && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        {...({ className: "absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40" } as any)}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{t.updateOffer}</h3>
                            <button onClick={() => setNegotiating(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">{t.newPrice} (€)</label>
                                <Input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="text-lg font-black" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">{t.reasonChange}</label>
                                <Input value={negotiationReason} onChange={e => setNegotiationReason(e.target.value)} placeholder="e.g. Extra materials needed" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">New Date</label>
                                    <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">New Time</label>
                                    <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} />
                                </div>
                            </div>
                            <Button onClick={handleSendOffer} className="w-full h-12 text-lg">{t.sendUpdate}</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Start Code Modal */}
            <AnimatePresence>
                {isStartJobModalOpen && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            {...({ className: "bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl" } as any)}
                        >
                            <h3 className="font-bold text-lg mb-4 text-center">{t.startCodeLabel}</h3>
                            <Input
                                value={startCodeInput}
                                onChange={(e) => setStartCodeInput(e.target.value)}
                                placeholder="0000"
                                className="text-center text-3xl font-black tracking-[1em] mb-4 h-16"
                                maxLength={4}
                            />
                            {startCodeError && <p className="text-red-500 text-center text-sm font-bold mb-4">{t.invalidCode}</p>}

                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setIsStartJobModalOpen(false)} className="flex-1">Cancel</Button>
                                <Button onClick={handleStartWorkWithCode} className="flex-1 bg-orange-500 text-white">Start Work</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Finish Job & Invoice Modal */}
            <AnimatePresence>
                {isFinishJobModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            {...({ className: "bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6" } as any)}
                        >
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{job.status === 'COMPLETED' ? t.generateInvoice : t.finishJob}</h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    {job.status === 'COMPLETED'
                                        ? "Job is verified. Select payment method to generate invoice."
                                        : "Mark job as finished to request client confirmation."}
                                </p>

                                {job.status !== 'COMPLETED' ? (
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={() => setIsFinishJobModalOpen(false)} className="flex-1">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleFinishJob} className="flex-1 bg-slate-900 text-white hover:bg-slate-800">
                                            Request Confirmation
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3 mb-8">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Select Payment Method:</h4>
                                            {/* Payment Methods */}
                                            {[
                                                { id: 'CASH', icon: Banknote, label: 'Cash Payment' },
                                                { id: 'CARD', icon: CreditCard, label: 'Card Payment' },
                                                { id: 'TRANSFER', icon: ArrowLeftIcon, label: 'Bank Transfer' } // Using ArrowLeftIcon as placeholder for generic bank icon if missing
                                            ].map((method) => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setSelectedPaymentMethod(method.id as any)}
                                                    className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${selectedPaymentMethod === method.id
                                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                                                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                                                        }`}
                                                >
                                                    <div className={`p-2 rounded-full mr-3 ${selectedPaymentMethod === method.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        <method.icon size={20} />
                                                    </div>
                                                    <span className={`font-bold ${selectedPaymentMethod === method.id ? 'text-orange-900 dark:text-orange-200' : 'text-slate-600'}`}>
                                                        {method.label}
                                                    </span>
                                                    {selectedPaymentMethod === method.id && (
                                                        <CheckCircle2 size={24} className="ml-auto text-orange-500 fill-orange-500 text-white" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex gap-3">
                                            <Button variant="ghost" onClick={() => setIsFinishJobModalOpen(false)} className="flex-1">
                                                Cancel
                                            </Button>
                                            {selectedPaymentMethod && (
                                                <Button onClick={handleGenerateInvoice} className="flex-1 bg-slate-900 text-white hover:bg-slate-800">
                                                    Generate & Send
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {/* Client Review Modal */}
            <AnimatePresence>
                {
                    isReviewModalOpen && (
                        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                {...({ className: "bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative" } as any)}
                            >
                                <div className="bg-slate-50 dark:bg-slate-800 p-6 text-center border-b border-slate-100 dark:border-slate-700">
                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1">Rate your experience</h3>
                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1">Rate your experience</h3>
                                    <p className="text-sm text-slate-500">
                                        {currentUserRole === 'PRO' ? `How was your experience with ${otherUser.name}?` : `How was the service provided by ${otherUser.name}?`}
                                    </p>
                                </div>

                                <div className="p-6">
                                    {/* Stars */}
                                    <div className="flex justify-center gap-2 mb-6">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setReviewRating(star)}
                                                className="transition-transform hover:scale-110 focus:outline-none"
                                            >
                                                <Star
                                                    size={32}
                                                    className={`${star <= reviewRating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'fill-slate-100 dark:fill-slate-800 text-slate-300 dark:text-slate-600'
                                                        } transition-colors`}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mb-6">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Comment (Optional)</label>
                                        <textarea
                                            value={reviewComment}
                                            onChange={e => setReviewComment(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-orange-500 outline-none"
                                            rows={3}
                                            placeholder="Share your feedback..."
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSubmitReview}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-lg shadow-xl shadow-slate-900/10"
                                        disabled={reviewRating === 0}
                                    >
                                        Submit Review
                                    </Button>
                                    <button
                                        onClick={() => setIsReviewModalOpen(false)}
                                        className="w-full mt-3 text-slate-400 hover:text-slate-600 text-sm font-medium"
                                    >
                                        Skip for now
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* User Profile Modal */}
            <AnimatePresence>
                {
                    isProfileOpen && profileUser && (
                        <UserProfileModal
                            user={{
                                id: profileUser.id!,
                                name: profileUser.name!,
                                avatar: profileUser.avatar!,
                                role: profileUser.role as Role,
                                rating: profileUser.rating || 5.0,
                                level: profileUser.level || 'Member',
                                languages: profileUser.languages || [],
                                address: profileUser.addresses && profileUser.addresses.length > 0 ? profileUser.addresses[0].locality : 'Luxembourg'
                            }}
                            onClose={() => setIsProfileOpen(false)}
                            hideHireAction
                            onToggleFavorite={onToggleFavorite}
                            onToggleBlock={onToggleBlock}
                            isFavorited={isFavorited}
                            isBlocked={isBlocked}
                        />
                    )
                }
            </AnimatePresence >

            {/* Assign Staff Modal */}
            <AnimatePresence>
                {
                    isAssignModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                {...({ className: "bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col" } as any)}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center p-4">
                                    <h3 className="font-bold text-lg">Select Team Member</h3>
                                    <button onClick={() => setIsAssignModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                                </div>
                                <div className="grid grid-cols-1 gap-2 p-4 overflow-y-auto">
                                    {staffMembers.map(staff => (
                                        <button
                                            key={staff.id}
                                            onClick={() => handleAssignStaff(staff.id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${job?.assignedEmployeeId === staff.id
                                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                : 'border-slate-100 hover:border-slate-300 bg-slate-50'
                                                }`}
                                        >
                                            <img src={staff.avatar} className="w-10 h-10 rounded-full bg-slate-200" />
                                            <div className="text-left">
                                                <div className="font-bold text-sm">{staff.name}</div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{staff.level || 'Staff'}</div>
                                            </div>
                                            {job?.assignedEmployeeId === staff.id && <CheckCircle size={16} className="ml-auto text-orange-500" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence>
        </div >
    );
};
