
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, LayoutDashboard, User as UserIcon, Lock, ChevronRight, MapPin, Navigation, CheckCircle2 } from 'lucide-react';
import { Card, Button } from '../components/ui';
import { User, Proposal, JobRequest } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useDatabase } from '../contexts/DatabaseContext';

interface StaffDashboardProps {
  user: User;
  onViewProfile: () => void;
  onChatSelect: (proposal: Proposal) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ user, onViewProfile, onChatSelect }) => {
  const { t } = useLanguage();
  const { jobs, proposals, users } = useDatabase();
  const [activeTab, setActiveTab] = useState<'JOBS' | 'MESSAGES'>('JOBS');

  // Filter jobs assigned to this staff member
  const myAssignedJobs = jobs.filter(j => j.assignedTo === user.id && j.status !== 'COMPLETED' && j.status !== 'CANCELLED');
  
  // Get active chats for these jobs
  const myChats = proposals.filter(p => {
      const job = jobs.find(j => j.id === p.jobId);
      return job && job.assignedTo === user.id && p.status === 'CONFIRMED';
  });

  return (
    <div className="p-4 pb-24 h-full bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div 
        onClick={onViewProfile}
        className="flex items-center justify-between mb-6 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer"
      >
         <div className="flex items-center gap-3">
             <div className="relative">
                <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-orange-500 p-0.5" alt="Me" />
                <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase border-2 border-white dark:border-slate-900">Staff</div>
             </div>
             <div>
                 <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user.name}</h3>
                 <p className="text-xs text-slate-500 font-medium">{user.jobTitle || 'Technician'}</p>
             </div>
         </div>
         <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
             <ChevronRight size={20} />
         </div>
      </div>

      {/* Restricted Access Notice */}
      <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
          <Lock className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <div>
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">{t.staffRestriction}</h4>
              <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">{t.staffRestrictionDesc}</p>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-6">
          <button 
            onClick={() => setActiveTab('JOBS')}
            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'JOBS' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400'}`}
          >
            {t.staffDashboard} ({myAssignedJobs.length})
          </button>
          <button 
            onClick={() => setActiveTab('MESSAGES')}
            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'MESSAGES' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400'}`}
          >
            {t.messagesTab} ({myChats.length})
          </button>
      </div>

      {/* Content */}
      <AnimatePresence mode='wait'>
          {activeTab === 'JOBS' && (
              <motion.div 
                key="jobs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                  {myAssignedJobs.length === 0 ? (
                      <div className="text-center py-20">
                          <LayoutDashboard className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-400 font-bold">{t.noActiveRequests}</p>
                      </div>
                  ) : (
                      myAssignedJobs.map(job => (
                          <Card 
                            key={job.id} 
                            className="p-5 border-l-4 border-l-orange-500 hover:shadow-lg transition-all cursor-pointer"
                            onClick={() => {
                                // Find the proposal to open chat
                                const prop = proposals.find(p => p.jobId === job.id && p.status === 'CONFIRMED');
                                if (prop) onChatSelect(prop);
                            }}
                          >
                              <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">{job.category}</span>
                                  <span className="text-xs font-mono text-slate-400">{new Date(job.createdAt).toLocaleDateString()}</span>
                              </div>
                              <h4 className="font-bold text-lg mb-1">{job.title || job.description}</h4>
                              <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
                                  <MapPin size={14} /> {job.location}
                              </div>
                              
                              <div className="flex gap-2">
                                  <Button size="sm" className="flex-1 bg-slate-900 text-white" onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`, '_blank');
                                  }}>
                                      <Navigation size={16} className="mr-2" /> {t.navToJob}
                                  </Button>
                                  <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                                      <MessageSquare size={16} className="mr-2" /> Chat
                                  </Button>
                              </div>
                          </Card>
                      ))
                  )}
              </motion.div>
          )}

          {activeTab === 'MESSAGES' && (
              <motion.div 
                key="messages"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                  {myChats.map(chat => {
                      const client = users.find(u => {
                          const job = jobs.find(j => j.id === chat.jobId);
                          return u.id === job?.clientId;
                      });
                      
                      return (
                        <div 
                            key={chat.id}
                            onClick={() => onChatSelect(chat)}
                            className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className="relative">
                                <img src={client?.avatar || chat.proAvatar} className="w-12 h-12 rounded-xl object-cover" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-slate-900" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h4 className="font-bold text-slate-900 dark:text-white">{client?.name || 'Client'}</h4>
                                    <span className="text-xs text-slate-400">Now</span>
                                </div>
                                <p className="text-sm text-slate-500 truncate group-hover:text-orange-500 transition-colors">{chat.message}</p>
                            </div>
                            <ChevronRight className="text-slate-300" size={18} />
                        </div>
                      );
                  })}
                  {myChats.length === 0 && (
                      <div className="text-center py-10 text-slate-400">{t.noActiveRequests}</div>
                  )}
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};
