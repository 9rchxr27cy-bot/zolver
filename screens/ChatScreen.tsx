
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Send, Users, Lock, RotateCcw, CheckCircle, Tag,
  Car, MapPin, Play, Square, CreditCard, Star, ChevronRight, Bot,
  FileText, Download, CheckCircle2, ArrowLeft as ArrowLeftIcon, X,
  MoreVertical, Phone
} from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { Proposal, ChatMessage, JobStatus, JobRequest, Invoice, Role, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { ServiceStatusHeader } from '../components/ServiceStatusHeader';
import { UserProfileModal } from '../components/ServiceModals';
import { createInvoiceObject, downloadInvoicePDF } from '../utils/pdfGenerator';

// Helper Components
const InvoiceBubble = ({ msg }: { msg: ChatMessage }) => {
    const { t } = useLanguage();
    if (!msg.invoiceDetails) return null;
    return (
        <div className="w-full max-w-[80%] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <FileText size={20} className="text-slate-500" />
                </div>
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.invoiceNo} #{msg.invoiceDetails.id}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.serviceCompleted}</h4>
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t.amountHT}</span>
                    <span className="font-mono">€ {msg.invoiceDetails.subtotalHT.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">TVA (17%)</span>
                    <span className="font-mono">€ {msg.invoiceDetails.totalVAT.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span>{t.total}</span>
                    <span className="text-orange-500">€ {msg.invoiceDetails.totalTTC.toFixed(2)}</span>
                </div>
            </div>
            <Button onClick={() => downloadInvoicePDF(msg.invoiceDetails!)} variant="outline" size="sm" className="w-full">
                <Download size={14} className="mr-2" /> {t.downloadPdf}
            </Button>
        </div>
    );
};

const OfferBubble = ({ msg, onAccept, canAccept }: { msg: ChatMessage; onAccept: () => void; canAccept: boolean }) => {
    const { t } = useLanguage();
    if (!msg.offerDetails) return null;
    const isAccepted = msg.offerDetails.status === 'ACCEPTED';
    const isRejected = msg.offerDetails.status === 'REJECTED';
    
    return (
        <div className="w-full max-w-[80%] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm text-center">
            <h4 className="font-bold text-sm mb-2">{t.proposalUpdate}</h4>
            <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-slate-400 line-through text-sm">€ {msg.offerDetails.oldPrice}</span>
                <ArrowLeftIcon size={12} className="text-slate-300" />
                <span className="text-xl font-black text-orange-500">€ {msg.offerDetails.newPrice}</span>
            </div>
            <p className="text-xs text-slate-500 italic mb-3">"{msg.offerDetails.reason}"</p>
            {isAccepted ? (
                <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                    <CheckCircle size={12} /> {t.offerAccepted}
                </div>
            ) : isRejected ? (
                <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                    <X size={12} /> {t.offerDeclined}
                </div>
            ) : canAccept ? (
                <div className="flex gap-2">
                    <Button size="sm" onClick={onAccept} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        {t.acceptOffer}
                    </Button>
                </div>
            ) : (
                <div className="text-xs text-slate-400 italic">{t.waitingClient}</div>
            )}
        </div>
    );
};

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
  const { jobs, users, chats, addChatMessage, updateChatMessage, updateJob, updateProposal } = useDatabase();
  
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [negotiating, setNegotiating] = useState(false);
  const [newPrice, setNewPrice] = useState(proposal.price.toString());
  const [negotiationReason, setNegotiationReason] = useState('');

  const job = jobs.find(j => j.id === proposal.jobId);
  const chatId = proposal.id;
  const messages = chats[chatId] || [];

  // Determine "Other User"
  let otherUser: User | undefined;
  if (currentUserRole === 'CLIENT') {
      otherUser = users.find(u => u.id === proposal.proId);
  } else {
      otherUser = users.find(u => u.id === job?.clientId);
  }

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        handleSendMessage('', 'text', { 
            isSystem: true, 
            text: `Job status updated to: ${newStatus}` 
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
          handleSendMessage('', 'offer_update', {
              offerDetails: {
                  oldPrice: job.finalPrice || proposal.price,
                  newPrice: price,
                  reason: negotiationReason,
                  status: 'PENDING'
              }
          });
          setNegotiating(false);
      }
  };

  const handleAcceptOffer = (msg: ChatMessage) => {
      if (!msg.offerDetails || !job) return;
      
      // Update Message
      updateChatMessage(chatId, msg.id, {
          offerDetails: { ...msg.offerDetails, status: 'ACCEPTED' }
      });

      // Update Job Price
      updateJob({ ...job, finalPrice: msg.offerDetails.newPrice });
      // Update Proposal Price (for listing)
      updateProposal({ ...proposal, price: msg.offerDetails.newPrice });

      handleSendMessage('', 'text', { isSystem: true, text: `Price updated to €${msg.offerDetails.newPrice}` });
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
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
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
            <button onClick={() => setIsProfileOpen(true)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <MoreVertical size={20} />
            </button>
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
                return (
                    <div key={msg.id} className="flex justify-center my-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            {msg.text}
                        </span>
                    </div>
                );
            }

            if (msg.type === 'invoice') {
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <InvoiceBubble msg={msg} />
                    </div>
                );
            }

            if (msg.type === 'offer_update') {
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <OfferBubble 
                            msg={msg} 
                            onAccept={() => handleAcceptOffer(msg)} 
                            canAccept={!isMe && msg.offerDetails?.status === 'PENDING'} 
                        />
                    </div>
                );
            }

            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                        isMe 
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
      {currentUserRole !== 'CLIENT' && job.status !== 'COMPLETED' && (
          <div className="px-4 pb-2">
              {job.status === 'CONFIRMED' && (
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white" onClick={() => handleUpdateStatus('EN_ROUTE')}>
                      <Car size={16} className="mr-2" /> {t.actionOnWay}
                  </Button>
              )}
              {job.status === 'EN_ROUTE' && (
                  <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={() => handleUpdateStatus('ARRIVED')}>
                      <MapPin size={16} className="mr-2" /> {t.actionArrived}
                  </Button>
              )}
              {job.status === 'ARRIVED' && (
                  <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white" onClick={() => handleUpdateStatus('IN_PROGRESS')}>
                      <Play size={16} className="mr-2" /> {t.actionStart}
                  </Button>
              )}
              {job.status === 'IN_PROGRESS' && (
                  <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800 text-white" onClick={() => handleUpdateStatus('COMPLETED')}>
                      <Square size={16} className="mr-2" /> {t.finishJob}
                  </Button>
              )}
          </div>
      )}

      {/* Input Area */}
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

      {/* Negotiation Modal */}
      <AnimatePresence>
        {negotiating && (
            <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40"
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
                    <Button onClick={handleSendOffer} className="w-full h-12 text-lg">{t.sendUpdate}</Button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && otherUser && (
            <UserProfileModal 
                user={{
                    id: otherUser.id,
                    name: otherUser.name,
                    avatar: otherUser.avatar,
                    role: otherUser.role,
                    rating: otherUser.rating,
                    level: otherUser.level,
                    languages: otherUser.languages,
                    address: otherUser.addresses[0]?.locality
                }}
                onClose={() => setIsProfileOpen(false)}
                hideHireAction
                onToggleFavorite={onToggleFavorite}
                onToggleBlock={onToggleBlock}
                isFavorited={isFavorited}
                isBlocked={isBlocked}
            />
        )}
      </AnimatePresence>
    </div>
  );
};
