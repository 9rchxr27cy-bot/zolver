import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MapPin,
    Star,
    UserPlus,
    UserMinus,
    Check,
    Zap,
    ArrowRight,
    Filter
} from 'lucide-react';
import { User, Category } from '../types';
import { Button, Card } from './ui';
import { useDatabase } from '../contexts/DatabaseContext';
import { CATEGORIES } from '../constants';
import * as LucideIcons from 'lucide-react';
import { ProviderProfileView } from './ServiceModals';
import { marketGapService } from '../src/services/marketGapService';

// Category Chip Component
const CategoryChip = ({ category, isSelected, onClick }: { category: any, isSelected: boolean, onClick: () => void }) => {
    const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.HelpCircle;

    return (
        <button
            onClick={onClick}
            className={`
        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
        ${isSelected
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500'
                }
      `}
        >
            <IconComponent size={16} />
            {category.label}
        </button>
    );
};

interface ClientExploreViewProps {
    currentUser: User | null;
    users: User[]; // All users passed from parent
    onDirectRequest: (pro: User) => void;
    onViewProfile?: (pro: User) => void; // Optional if handled internally
}

export const ClientExploreView: React.FC<ClientExploreViewProps> = ({
    currentUser,
    users,
    onDirectRequest
}) => {
    const { followUser, unfollowUser, followingIds } = useDatabase();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedPro, setSelectedPro] = useState<User | null>(null);

    // Real-time Follow Status Logic (Local listener is handled in DatabaseContext or parent, 
    // but for immediate UI feedback we check currentUser.following. 
    // Ideally, currentUser should be live-updated from parent.)

    // Filter Pros
    const filteredPros = users.filter(u => {
        if (u.role !== 'PRO') return false;

        // Search Match
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            (u.name || '').toLowerCase().includes(searchLower) ||
            (u.username || '').toLowerCase().includes(searchLower) ||
            (u.jobTitle || '').toLowerCase().includes(searchLower);

        // Category Match
        // If 'All', match everyone. Else check if pro offers this service.
        // Note: Pro services might be an array of objects or strings.
        // We assume u.services contains { id: string }[] or we check logic.
        // For now, let's assume if category is selected, we look for it in u.services
        let matchesCategory = true;
        if (selectedCategory !== 'All') {
            matchesCategory = u.services?.some(s => s.id === selectedCategory) || false;
        }

        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        // Boost Logic: Boosted profiles always come first
        // If both boosted, maybe sort by expiry or rating? For now just boolean check.
        const aBoost = a.isBoosted && a.boostExpiresAt && new Date(a.boostExpiresAt) > new Date();
        const bBoost = b.isBoosted && b.boostExpiresAt && new Date(b.boostExpiresAt) > new Date();

        if (aBoost && !bBoost) return -1;
        if (!aBoost && bBoost) return 1;

        // Secondary sort: Rating (Desc)
        return (b.rating || 0) - (a.rating || 0);
    });

    // MARKET GAP LOGGING
    useEffect(() => {
        if (searchQuery.length > 2 && filteredPros.length === 0) {
            const timeoutId = setTimeout(() => {
                marketGapService.recordGap(searchQuery, 'Luxembourg');
            }, 3000); // Wait 3s to ensure user finished typing
            return () => clearTimeout(timeoutId);
        }
    }, [searchQuery, filteredPros.length]);

    return (
        <div className="flex flex-col md:flex-row h-full overflow-hidden">

            {/* LEFT PANEL: SEARCH & LIST (Master) */}
            {/* On mobile, hidden if pro is selected? Or just stack? Let's use standard Master-Detail responsive logic */}
            <div className={`
        flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 border-r dark:border-slate-800
        ${selectedPro ? 'hidden md:flex' : 'flex'} 
      `}>

                {/* Header & Search */}
                <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-10">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Explore Pros</h1>

                    {/* Search Input */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, skill, or handle..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/50 transition-all font-medium text-slate-900 dark:text-white"
                        />
                    </div>

                    {/* Categories Carousel */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                        <CategoryChip
                            category={{ id: 'All', label: 'All Pros', icon: 'Grid' }}
                            isSelected={selectedCategory === 'All'}
                            onClick={() => setSelectedCategory('All')}
                        />
                        {CATEGORIES.slice(0, 10).map(cat => ( // Show top categories
                            <CategoryChip
                                key={cat.id}
                                category={cat}
                                isSelected={selectedCategory === cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* List of Pros */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {filteredPros.length === 0 ? (
                        <div className="text-center py-20 opacity-50">
                            <p>No professionals found matching your filters.</p>
                        </div>
                    ) : (
                        filteredPros.map(pro => {
                            const isFollowing = currentUser?.following?.includes(pro.id);

                            return (
                                <div
                                    key={pro.id}
                                    onClick={() => setSelectedPro(pro)}
                                    className={`
                    group relative bg-white dark:bg-slate-900 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-lg
                    ${selectedPro?.id === pro.id
                                            ? 'border-orange-500 ring-1 ring-orange-500 shadow-orange-500/10'
                                            : 'border-slate-100 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700'
                                        }
                  `}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <img src={pro.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800" />
                                            {/* Online Status */}
                                            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>

                                            {/* Boost Badge on Avatar */}
                                            {pro.isBoosted && pro.boostExpiresAt && new Date(pro.boostExpiresAt) > new Date() && (
                                                <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-1 border-2 border-white dark:border-slate-900 z-10 shadow-lg scale-75">
                                                    <Zap size={14} fill="currentColor" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 pt-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate pr-2 flex items-center gap-1">
                                                        {pro.name}
                                                        {pro.isVerified && <Check size={14} className="text-blue-500" strokeWidth={3} />}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-orange-500 font-bold text-xs uppercase tracking-wide mb-1">
                                                            {pro.jobTitle || 'Professional'}
                                                        </p>
                                                        {pro.isBoosted && pro.boostExpiresAt && new Date(pro.boostExpiresAt) > new Date() && (
                                                            <span className="text-[10px] font-black uppercase bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 px-1.5 py-0.5 rounded mb-1 shadow-sm">
                                                                PRO
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg text-xs font-black">
                                                    <Star size={12} fill="currentColor" /> {pro.rating || 'NEW'}
                                                </div>
                                            </div>

                                            {/* Tags/Location */}
                                            <div className="flex items-center gap-3 text-slate-400 text-xs mt-2">
                                                <span className="flex items-center gap-1"><MapPin size={12} /> {pro.addresses?.[0]?.locality || 'Luxembourg'}</span>
                                                {pro.level && <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 font-bold">{pro.level}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Row */}
                                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex gap-3">
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDirectRequest(pro);
                                            }}
                                            className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs h-9"
                                        >
                                            <Zap size={14} className="mr-2 fill-current" /> Request
                                        </Button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!currentUser) return; // Should prompt login
                                                if (isFollowing) {
                                                    unfollowUser(currentUser.id, pro.id);
                                                } else {
                                                    followUser(currentUser.id, pro.id);
                                                }
                                            }}
                                            className={`
                        h-9 px-4 rounded-xl flex items-center gap-2 text-xs font-bold transition-all border
                        ${isFollowing
                                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                                                    : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                }
                      `}
                                        >
                                            {isFollowing ? (
                                                <>
                                                    <Check size={14} /> Following
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={14} /> Follow
                                                </>
                                            )}
                                        </button>
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: DETAILS (Detail) */}
            <div className={`
        flex-1 bg-white dark:bg-slate-900 h-full overflow-y-auto relative
        ${selectedPro ? 'block fixed inset-0 z-50 md:static md:z-auto' : 'hidden md:flex items-center justify-center'}
      `}>
                {selectedPro ? (
                    <div className="h-full flex flex-col">
                        {/* Mobile Back Button */}
                        <div className="md:hidden p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <button onClick={() => setSelectedPro(null)} className="p-2 -ml-2 text-slate-500">
                                <ArrowRight size={24} className="rotate-180" />
                            </button>
                            <span className="font-bold">Back to List</span>
                        </div>

                        {/* Reused Provider Profile View */}
                        {/* We need to make sure ProviderProfileView is exported from ServiceModals or we manually inline a wrapper */}
                        <div className="flex-1 overflow-y-auto">
                            <ProviderProfileView
                                user={selectedPro}
                                onDirectRequest={() => onDirectRequest(selectedPro)}
                                isFollowing={currentUser?.following?.includes(selectedPro.id)}
                                onToggleFollow={() => {
                                    if (!currentUser) return;
                                    if (currentUser.following?.includes(selectedPro.id)) {
                                        unfollowUser(currentUser.id, selectedPro.id);
                                    } else {
                                        followUser(currentUser.id, selectedPro.id);
                                    }
                                }}
                                onHire={() => onDirectRequest(selectedPro)} // Reuse Hire for Direct Request in this context
                            />
                        </div>
                    </div>
                ) : (
                    // Empty State (Desktop)
                    <div className="text-center p-8 opacity-40">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-slate-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select a Professional</h2>
                        <p className="text-slate-500">Click on a card to view full profile details.</p>
                    </div>
                )}
            </div>

        </div>
    );
};
