
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Star, Shield, Clock, Phone, Mail, Instagram, Globe, Check, Heart, Ban, Unlock,
  UserPlus, UserMinus, Grid, ShieldCheck, CheckCircle2, Briefcase, Award, Quote, ExternalLink, Languages,
  CreditCard, History, User as UserIcon, Download, FileText, MessageSquare // Added User icon for bio section
} from 'lucide-react';
import { Button, LevelBadge, Card } from './ui';
import { User, Review, Proposal } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { MOCK_PRO, MOCK_REVIEWS, MOCK_CLIENT } from '../constants';
import { InstaPortfolio } from './InstaPortfolio';

interface PortfolioOverlayProps {
  proposal: Proposal;
  onClose: () => void;
}

export const PortfolioOverlay: React.FC<PortfolioOverlayProps> = ({ proposal, onClose }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-[90]"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
              <img src={proposal.proAvatar} className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{proposal.proName}</h3>
              <p className="text-xs text-slate-500 font-medium">{t.instaPortfolio}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          <InstaPortfolio />
        </div>
      </motion.div>
    </div>
  );
};

export const ServiceSelectionModal: React.FC<{
  pro: User;
  onSelect: (category: string) => void;
  onClose: () => void;
}> = ({ pro, onSelect, onClose }) => {
  // Using constant categories for now as fallback
  const CATEGORIES = [
    { id: 'cleaning', label: 'Limpeza', icon: '🧹' },
    { id: 'moving', label: 'Mudanças', icon: '📦' },
    { id: 'painting', label: 'Pintura', icon: '🎨' },
    { id: 'plumbing', label: 'Canalização', icon: '🔧' },
    { id: 'electricity', label: 'Eletricidade', icon: '⚡' },
    { id: 'gardening', label: 'Jardinagem', icon: '🌿' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200"
        >
          <X size={20} className="text-gray-600 dark:text-gray-300" />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden border-2 border-orange-500 p-1">
              <img src={pro.avatar} alt={pro.name} className="w-full h-full object-cover rounded-full" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Pedir Orçamento para {pro.companyDetails?.legalName || pro.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Selecione o serviço que você precisa
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-2 border-transparent hover:border-orange-500 transition-all group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface UserProfileModalProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    role: 'CLIENT' | 'PRO' | 'EMPLOYEE';
    // Optional Pro/Staff fields
    level?: string;
    rating?: number;
    jobTitle?: string;
    // Optional Client fields
    address?: string;
    languages?: string[];
    // Business Hours
    openingTime?: string;
    closingTime?: string;
  };
  onClose: () => void;
  // Pro Actions
  onViewPortfolio?: () => void;
  onHire?: () => void;
  hideHireAction?: boolean;
  // Interaction Actions
  onToggleFavorite?: (id: string) => void;
  onToggleBlock?: (id: string) => void;
  isFavorited?: boolean;
  isBlocked?: boolean;
  onDirectRequest?: (pro: User) => void;
}

interface ProviderProfileViewProps {
  user: User;
  onViewPortfolio?: () => void;
  onHire?: () => void;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  onDirectRequest?: (pro: User) => void;
}

// --- SUB-COMPONENTS FOR CLEAN ARCHITECTURE ---

const ClientProfileView: React.FC<{ user: UserProfileModalProps['user'] }> = ({ user }) => {
  const { t } = useLanguage();

  const clientData = {
    requestsMade: 12,
    paymentRate: '100%',
    languages: user.languages || MOCK_CLIENT.languages,
    address: user.address || `${MOCK_CLIENT.addresses[0]?.street} ${MOCK_CLIENT.addresses[0]?.number}, ${MOCK_CLIENT.addresses[0]?.locality}`,
    rating: 5.0
  };

  return (
    <div className="px-6 pb-8 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col items-center mt-6 mb-6">
        <div className="relative">
          <img
            src={user.avatar}
            className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-xl"
            alt={user.name}
          />
          <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-900">
            <UserIcon size={20} fill="currentColor" className="text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-black mt-4 text-slate-900 dark:text-white">{user.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {t.clientRole}
          </span>
          <span className="text-orange-500 font-bold flex items-center gap-1 text-xs">
            <CheckCircle2 size={14} /> {t.reliableClient}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
        <div className="text-center border-r border-slate-200 dark:border-slate-700">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.requestsMade}</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{clientData.requestsMade}</span>
        </div>
        <div className="text-center">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.paymentRate}</span>
          <span className="text-lg font-black text-orange-500">{clientData.paymentRate}</span>
        </div>
      </div>

      {/* Logistics Section */}
      <div className="space-y-6">
        <div>
          <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
            <Languages size={16} /> {t.speaks}
          </h4>
          <div className="flex flex-wrap gap-2">
            {clientData.languages.map(lang => (
              <span key={lang} className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                {lang === 'EN' ? '🇬🇧' : lang === 'FR' ? '🇫🇷' : lang === 'LB' ? '🇱🇺' : lang === 'PT' ? '🇵🇹' : '🇩🇪'} {lang}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50">
          <h4 className="font-black text-sm uppercase tracking-widest text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-3">
            <MapPin size={16} /> {t.serviceLocation}
          </h4>
          <p className="text-slate-700 dark:text-slate-300 font-medium mb-4 leading-relaxed">
            {clientData.address}
          </p>
          <div className="flex gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clientData.address)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1"
            >
              <Button size="sm" variant="secondary" className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-none shadow-sm hover:bg-slate-100">
                <ExternalLink size={14} className="mr-2" /> {t.openMaps}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- NEW EMPLOYEE VIEW ---
const EmployeeProfileView: React.FC<{ user: UserProfileModalProps['user'] }> = ({ user }) => {
  const { t } = useLanguage();
  const { jobs } = useDatabase();

  // Stats specifically for this employee
  // Note: We need to safely access jobs, assuming useDatabase provides it.
  const jobsCompleted = jobs ? jobs.filter(j => j.assignedTo === user.id && j.status === 'COMPLETED').length : 0;
  const languages = user.languages || ['FR', 'EN']; // Fallback

  return (
    <div className="px-6 pb-8 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex flex-col items-center mt-6 mb-6">
        <div className="relative">
          <img src={user.avatar} className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-900 object-cover shadow-xl" />
          <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-900">
            <Briefcase size={20} fill="currentColor" />
          </div>
        </div>
        <h3 className="text-2xl font-black mt-4 text-slate-900 dark:text-white">{user.name}</h3>
        <p className="text-orange-600 dark:text-orange-400 font-bold uppercase text-xs tracking-wider mt-1 mb-2">
          {user.jobTitle || 'Technician'}
        </p>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          <ShieldCheck size={14} className="text-orange-500" />
          <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">{t.verifiedBadge}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-center gap-2 mb-1 text-slate-400 text-xs font-black uppercase tracking-widest">
            <History size={14} /> Jobs
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{jobsCompleted}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-center gap-2 mb-1 text-slate-400 text-xs font-black uppercase tracking-widest">
            <Award size={14} /> Exp.
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">3 <span className="text-sm text-slate-400 font-medium">Yrs</span></span>
        </div>
      </div>

      {/* Bio / Objectives */}
      <div className="space-y-6">
        <div>
          <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
            <Quote size={16} /> Work Philosophy
          </h4>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            "I am dedicated to providing high-quality service with a focus on safety and efficiency. Customer satisfaction is my top priority on every job."
          </p>
        </div>

        {/* Languages */}
        <div>
          <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
            <Languages size={16} /> {t.speaks}
          </h4>
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
              <span key={lang} className="px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-800/50 text-xs font-bold">
                {lang === 'EN' ? '🇬🇧' : lang === 'FR' ? '🇫🇷' : lang === 'LB' ? '🇱🇺' : lang === 'PT' ? '🇵🇹' : '🇩🇪'} {lang}
              </span>
            ))}
          </div>
        </div>

        {/* REVIEWS HISTORY */}
        <div className="space-y-4 mb-8">
          <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <History size={16} /> Job History & Reviews
          </h4>
          <div className="space-y-3">
            {MOCK_REVIEWS.filter(r => r.employeeId === user.id).length > 0 ? (
              MOCK_REVIEWS.filter(r => r.employeeId === user.id).map((review, i, arr) => (
                <div key={review.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                    {i < arr.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200">{review.service}</h5>
                      <span className="text-[10px] font-black text-slate-400">{review.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-2">"{review.comment}"</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="flex items-center text-amber-500 font-bold">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} size={10} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic">No reviews yet for this team member.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProviderProfileView: React.FC<ProviderProfileViewProps> = ({
  user,
  onViewPortfolio,
  onHire,
  onToggleFollow,
  isFollowing,
  onDirectRequest
}) => {
  const { t } = useLanguage();

  // Safe access to properties with defaults
  const closingTime = user.closingTime || '18:00';
  const openingTime = user.openingTime || '09:00';
  const websiteUrl = `https://servicebid.lu/${user.name.toLowerCase().replace(/\s+/g, '-')}`;

  // Use user.followers if available, else 0
  const followersCount = (user as any).followers?.length || 0;
  const followingCount = (user as any).following?.length || 0;
  const proLanguages = user.languages || ['FR', 'EN'];

  return (
    <div className="px-6 pb-8 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col items-center mt-6 mb-6">
        <div className="relative">
          <img
            src={user.avatar}
            className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-xl"
            alt={user.name}
          />
          <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-900">
            <ShieldCheck size={20} fill="currentColor" className="text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-black mt-4 text-slate-900 dark:text-white text-center">{user.name}</h3>
        {(user as any).username && (
          <span className="text-slate-400 font-medium text-sm">@{(user as any).username.replace('@', '')}</span>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap justify-center gap-2 w-full max-w-sm">
          {/* Follow Button */}
          {onToggleFollow && (
            <button
              onClick={onToggleFollow}
              className={`flex items-center justify-center gap-2 px-4 h-10 rounded-xl font-bold transition-all min-w-[100px] ${isFollowing
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                : 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'}`}
            >
              {isFollowing ? (
                <>
                  <UserMinus size={16} /> Following
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Follow
                </>
              )}
            </button>
          )}

          {/* Hire Button */}
          <Button onClick={onHire} className="bg-orange-600 hover:bg-orange-700 text-white min-w-[100px]">
            {t.hire}
          </Button>

          {/* Direct Request Button */}
          {onDirectRequest && (
            <Button variant="outline" onClick={() => onDirectRequest(user)} className="border-orange-200 hover:bg-orange-50 dark:border-slate-700 dark:hover:bg-slate-800 min-w-[120px]">
              Direct Request
            </Button>
          )}

          {/* Message Button (New) */}
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={() => alert("Chat feature coming soon for profiles!")}>
            <MessageSquare size={20} />
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <LevelBadge level={user.level || 'Professional'} />
          <span className="text-amber-500 font-bold flex items-center gap-1">
            <Star size={16} fill="currentColor" /> {user.rating}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
        <div className="text-center border-r border-slate-200 dark:border-slate-700">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.jobs}</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">128</span>
        </div>
        <div className="text-center border-r border-slate-200 dark:border-slate-700">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">Followers</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{followersCount}</span>
        </div>
        <div className="text-center">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">Following</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{followingCount}</span>
        </div>
      </div>

      {/* SOCIAL & WEB SECTION */}
      <div className="mb-6">
        <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
          <Globe size={16} /> {t.onlinePresence}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {/* Website Button */}
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all group"
          >
            <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl group-hover:scale-110 transition-transform">
              <Globe size={24} />
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold text-slate-900 dark:text-white">Website</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-center">
                servicebid.lu <ExternalLink size={10} />
              </span>
            </div>
          </a>

          {/* Instagram/Portfolio Button */}
          <button
            onClick={onViewPortfolio}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-md transition-all group"
          >
            <div className="p-0.5 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 group-hover:scale-110 transition-transform">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-[10px]">
                <Instagram size={20} className="text-slate-900 dark:text-white" />
              </div>
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold text-slate-900 dark:text-white">Portfolio</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-center">
                Instagram <ExternalLink size={10} />
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* INSTAGRAM GRID */}
      <div className="mb-6">
        <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
          <Grid size={16} /> Latest Posts
        </h4>
        <InstaPortfolio />
      </div>

      {/* Business Hours */}
      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
        <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
          <Clock size={16} /> {t.businessHours}
        </h4>
        <div className="flex justify-between items-center text-sm font-medium">
          <span className="text-slate-500">Mon - Fri</span>
          <span className="text-slate-900 dark:text-white font-bold">{openingTime} - {closingTime}</span>
        </div>
      </div>

      {/* Languages Section */}
      <div className="mb-6">
        <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
          <Languages size={16} /> {t.speaks}
        </h4>
        <div className="flex flex-wrap gap-2">
          {proLanguages.map(lang => (
            <span key={lang} className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
              {lang === 'EN' ? '🇬🇧' : lang === 'FR' ? '🇫🇷' : lang === 'LB' ? '🇱🇺' : lang === 'PT' ? '🇵🇹' : '🇩🇪'} {lang}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <UserIcon size={16} /> {t.bio}
        </h4>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
          {user.bio || MOCK_PRO.bio}
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <History size={16} /> {t.serviceTimeline}
        </h4>
        <div className="space-y-3">
          {MOCK_REVIEWS.map((review, i) => (
            <div key={review.id} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                {i < MOCK_REVIEWS.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">{review.service}</h5>
                  <span className="text-[10px] font-black text-slate-400">{review.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="text-orange-500 font-bold">€ {review.price}</span>
                  <span>•</span>
                  <div className="flex items-center text-amber-500 font-bold">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={10} fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT (Refactored to Drawer) ---

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onViewPortfolio,
  onHire,
  hideHireAction = false,
  onToggleFavorite,
  onToggleBlock,
  isFavorited = false,
  isBlocked = false,
  onDirectRequest
}) => {
  const { t } = useLanguage();
  const { followUser, unfollowUser } = useDatabase();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const isFollowing = currentUser?.following?.includes(user.id);

  const handleToggleFollow = async () => {
    if (!currentUser) return;
    if (isFollowing) {
      await unfollowUser(currentUser.id, user.id);
      // Optimistic or refresh? Context updates should reflect if we were using it for currentUser
      // But since we use local state for currentUser parsing, we might need to manually update it or refetch
      // For now, let's rely on re-renders if context updates active user, but local storage doesn't auto-update.
      // Better: Update local state
      const newFollowing = currentUser.following.filter((id: string) => id !== user.id);
      setCurrentUser({ ...currentUser, following: newFollowing });
    } else {
      await followUser(currentUser.id, user.id);
      const newFollowing = [...(currentUser.following || []), user.id];
      setCurrentUser({ ...currentUser, following: newFollowing });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* DRAWER CONTAINER */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-950 shadow-2xl h-full flex flex-col z-[70] border-l border-slate-200 dark:border-slate-800"
      >
        {/* Drawer Header */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4 shrink-0">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.contactInfo}</h2>
        </div>

        {/* Scrollable Content based on Role */}
        <div className="flex-1 overflow-y-auto">
          {user.role === 'CLIENT' ? (
            <ClientProfileView user={user} />
          ) : user.role === 'EMPLOYEE' ? (
            <EmployeeProfileView user={user} />
          ) : (
            <ProviderProfileView
              user={user as User}
              onHire={onHire}
              onViewPortfolio={onViewPortfolio}
              isFollowing={isFollowing}
              onToggleFollow={handleToggleFollow}
              onDirectRequest={onDirectRequest}
            />
          )}

          {/* ACTION BUTTONS (BLOCK & FAVORITE) - For Pro/Staff */}
          {user.role !== 'CLIENT' && (
            <div className="px-6 pb-8 space-y-4">
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

              {/* Favorite Button */}
              <button
                onClick={() => onToggleFavorite && onToggleFavorite(user.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
              >
                <Heart size={20} className={isFavorited ? "text-red-500 fill-current" : "text-slate-400 group-hover:text-red-500"} />
                <span className={`text-sm font-bold ${isFavorited ? "text-red-500" : "text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                  {isFavorited ? t.removeFromFavorites : t.addToFavorites}
                </span>
              </button>

              {/* Block Button */}
              <button
                onClick={() => onToggleBlock && onToggleBlock(user.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
              >
                {isBlocked ? (
                  <Unlock size={20} className="text-slate-500 group-hover:text-slate-700" />
                ) : (
                  <Ban size={20} className="text-red-500 group-hover:text-red-600" />
                )}
                <span className={`text-sm font-bold ${isBlocked ? "text-slate-500" : "text-red-500 group-hover:text-red-600"}`}>
                  {isBlocked ? t.unblockContact : t.blockContact}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Hire Button (Fixed at Bottom if applicable - Only for PRO main profiles) */}
        {user.role === 'PRO' && !hideHireAction && onHire && !isBlocked && (
          <div className="p-6 border-t dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
            <Button
              className="w-full h-14 text-lg font-black rounded-2xl"
              onClick={() => {
                onHire();
                onClose();
              }}
            >
              {t.hireNow}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export const ProProfileModal = UserProfileModal;



interface InvoiceViewModalProps {
  transaction: any; // Using any for flexibility with Transaction type
  onClose: () => void;
  onDownload: (t: any) => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({ transaction, onClose, onDownload }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden z-[70] flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/10">Invoice</span>
              <span className="text-slate-400 text-xs uppercase tracking-wider">#{transaction.id.slice(0, 8)}</span>
            </div>
            <h2 className="text-2xl font-black">€ {Number(transaction.amount).toFixed(2)}</h2>
            <p className="text-slate-400 text-xs mt-1">{new Date(transaction.date).toLocaleDateString()} • {transaction.time || '12:00 PM'}</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Transaction Details</h4>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Service</span>
                <span className="font-bold text-slate-900 dark:text-white text-right max-w-[60%]">{transaction.description}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Category</span>
                <span className="font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 text-xs">
                  {transaction.category || 'General'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Payment Method</span>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  {transaction.paymentMethod === 'CARD' ? <CreditCard size={14} /> : <div className="w-3 h-3 rounded-full bg-green-500" />}
                  {transaction.paymentMethod || 'CASH'}
                </div>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Status</span>
                <span className={`flex items-center gap-1.5 font-bold text-xs px-2 py-1 rounded-full ${transaction.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-amber-100 text-amber-700'
                  }`}>
                  <CheckCircle2 size={12} /> {transaction.status}
                </span>
              </div>
            </div>

            {/* QR Code / Footer Stub */}
            <div className="mt-6 flex justify-center opacity-50">
              {/* Placeholder for QR or Barcode */}
              <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-[0.5em]">
                ||| || ||| || |||
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-400 mb-4">
              This is a digital receipt for your records.
              For tax purposes, please use the PDF version.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <Button onClick={() => onDownload(transaction)} className="w-full bg-slate-900 text-white hover:bg-slate-800 h-12 text-lg shadow-xl shadow-slate-900/10">
            <Download size={20} className="mr-2" /> Download PDF Invoice
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

