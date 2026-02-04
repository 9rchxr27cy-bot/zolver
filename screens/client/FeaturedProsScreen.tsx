import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Shield, ChevronRight, Zap } from 'lucide-react';
import { Card, Button, Badge } from '../../components/Layout';
import { useLanguage } from '../../contexts/LanguageContext';
import { db } from '../../src/lib/firebase'; // Adjust import based on structure
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { User, JobRequest } from '../../types';

export const FeaturedProsScreen = ({
    onViewProfile,
    onDirectRequest
}: {
    onViewProfile: (userId: string) => void,
    onDirectRequest: (pro: User) => void
}) => {
    const { t } = useLanguage();
    const [pros, setPros] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBoostedPros = async () => {
            try {
                const usersRef = collection(db, 'users');
                // Creating a query for boosted pros
                // Note: In a real app, you might need a composite index for this query
                const q = query(
                    usersRef,
                    where('role', '==', 'PRO'),
                    where('isBoosted', '==', true)
                );

                const snapshot = await getDocs(q);
                const fetchedPros: User[] = [];

                const now = new Date();

                snapshot.forEach(doc => {
                    const data = doc.data() as User;
                    // Manual filter for expiry if not indexed/queryable easily
                    // Assuming boostExpiresAt handles both string and Timestamp from typings
                    let expiresAt = new Date();
                    if (data.boostExpiresAt?.toDate) {
                        expiresAt = data.boostExpiresAt.toDate();
                    } else if (typeof data.boostExpiresAt === 'string') {
                        expiresAt = new Date(data.boostExpiresAt);
                    }

                    if (expiresAt > now) {
                        fetchedPros.push({ id: doc.id, ...data });
                    }
                });

                setPros(fetchedPros);
            } catch (error) {
                console.error("Error fetching boosted pros:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBoostedPros();
    }, []);

    return (
        <div className="space-y-6 pb-20">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 h-48 flex items-center justify-center text-center px-6">
                <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1581094794329-cd119277f82e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

                <div className="relative z-10 max-w-lg">
                    <Badge className="bg-amber-400 text-slate-900 mb-2 mx-auto inline-flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> Spotlight
                    </Badge>
                    <h1 className="text-3xl font-black text-white mb-2">Top Rated Professionals</h1>
                    <p className="text-slate-300">
                        Our most dedicated and highly-reviewed experts, ready for your project.
                    </p>
                </div>
            </div>

            {/* Pros Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : pros.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Star size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Featured Pros Yet</h3>
                    <p className="text-slate-500">Check back later for our spotlight selection.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pros.map(pro => (
                        <Card
                            key={pro.id}
                            className="overflow-hidden border-2 border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 transition-all group"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-4">
                                        <div className="relative">
                                            <img
                                                src={pro.avatar || 'https://ui-avatars.com/api/?name=' + pro.name}
                                                alt={pro.name}
                                                className="w-16 h-16 rounded-2xl object-cover bg-slate-200"
                                            />
                                            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-900 rounded-full p-1 border-2 border-white dark:border-slate-900">
                                                <Zap size={14} fill="currentColor" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                                {pro.name} {pro.surname}
                                                {pro.isVerified && <Shield size={14} className="text-blue-500" fill="currentColor" />}
                                            </h3>
                                            <p className="text-slate-500 text-sm mb-1 line-clamp-1">{pro.companyDetails?.description || 'Professional Service Provider'}</p>
                                            <div className="flex items-center gap-3 text-xs font-medium">
                                                <span className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md">
                                                    <Star size={12} fill="currentColor" /> {pro.rating?.toFixed(1) || '5.0'}
                                                </span>
                                                <span className="text-slate-400">({pro.reviewsCount || 0} reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills / Bio Snippet */}
                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {(pro.companyDetails?.workingDays || ['Mon', 'Tue']).slice(0, 3).map(day => (
                                            <span key={day} className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                                                {day}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform"
                                        onClick={() => onDirectRequest(pro)}
                                    >
                                        Hire Now
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="px-3"
                                        onClick={() => onViewProfile(pro.id)}
                                    >
                                        <ChevronRight size={18} />
                                    </Button>
                                </div>
                            </div>

                            {/* Decorative footer stripe */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 opacity-50" />
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
