import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, ChevronRight, Award, Zap, ShieldCheck } from 'lucide-react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import { User } from '../../types';
import { Card, Button, Badge } from '../../components/Layout';

// Extended User type for this screen logic
interface ProUser extends User {
    category?: string;
    reviewCount?: number;
    rating?: number;
    location?: string;
    skills?: string[];
    bio?: string;
    isPromoted?: boolean;
}

// MOCK DATA for "Aggressive Optimization" / Demo purposes
const MOCK_TOTAL_PROS: ProUser[] = [
    {
        id: 'pro-mock-1',
        name: "Ricardo Silva",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
        role: "PRO",
        category: "construction",
        rating: 5.0,
        reviewCount: 124,
        location: "Luxembourg City",
        bio: "Especialista em renovações de alto padrão com 15 anos de experiência.",
        isPromoted: true,
        skills: ["Renovação Completa", "Pintura", "Gesso"],
        email: "test1@test.com", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), pushNotifications: true, emailNotifications: true,
        languages: [],
        addresses: []
    },
    {
        id: 'pro-mock-2',
        name: "Elena K.",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
        role: "PRO",
        category: "cleaning",
        rating: 4.9,
        reviewCount: 89,
        location: "Esch-sur-Alzette",
        bio: "Serviço de limpeza premium para residências e escritórios.",
        isPromoted: true,
        skills: ["Limpeza Profunda", "Pós-Obra", "Ecofriendly"],
        email: "test2@test.com", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), pushNotifications: true, emailNotifications: true,
        languages: [],
        addresses: []
    },
    {
        id: 'pro-mock-3',
        name: "Marco Rosso",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
        role: "PRO",
        category: "plumbing",
        rating: 4.8,
        reviewCount: 56,
        location: "Differdange",
        bio: "Canalizador certificado disponível 24h para emergências.",
        isPromoted: true,
        skills: ["Emergências", "Gás", "Sanitários"],
        email: "test3@test.com", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), pushNotifications: true, emailNotifications: true,
        languages: [],
        addresses: []
    }
];

export const SponsoredProsScreen: React.FC = () => {
    const [pros, setPros] = useState<ProUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSponsoredPros = async () => {
            let isFilesFound = false;
            try {
                setLoading(true);
                // Try fetching real promoted users
                const q = query(
                    collection(db, 'users'),
                    where('role', '==', 'PRO'),
                    where('isPromoted', '==', true),
                    limit(10)
                );
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const realPros = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProUser[];
                    setPros(realPros);
                    isFilesFound = true;
                } else {
                    // FALLBACK MOCK DATA
                    setTimeout(() => {
                        setPros(MOCK_TOTAL_PROS);
                    }, 800);
                }
            } catch (error) {
                console.error("Error fetching sponsored pros:", error);
                setPros(MOCK_TOTAL_PROS);
            } finally {
                // Only set loading to false if we found files or if we want the mock timeout to handle it
                if (isFilesFound) setLoading(false);
                else setTimeout(() => setLoading(false), 800);
            }
        };

        fetchSponsoredPros();
    }, []);

    const handleProClick = (proId: string) => {
        // using window location since react-router-dom is not available
        window.location.href = `/w/${proId}`;
    };

    return (
        <motion.div
            {...({
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                className: "p-4 md:p-8 max-w-6xl mx-auto pb-24"
            } as any)}
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-gradient-to-r from-orange-400 to-amber-500 text-white border-0 font-black tracking-widest px-3 py-1 text-[10px] uppercase">
                            <Zap size={10} className="mr-1 fill-white" /> Elite Pros
                        </Badge>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Featured Professionals
                    </h1>
                    <p className="text-slate-500 text-lg mt-2 max-w-2xl">
                        Top-rated experts recommended by Zolver for your next project. Verified quality and priority service.
                    </p>
                </div>
                <Button className="hidden md:flex bg-slate-100 hover:bg-slate-200 text-slate-900">
                    View All Categories
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pros.map((pro) => (
                        <motion.div
                            key={pro.id}
                            {...({
                                whileHover: { y: -5 },
                                onClick: () => handleProClick(pro.id),
                                className: "group cursor-pointer relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-orange-500/30 transition-all duration-300"
                            } as any)}
                        >
                            {/* Cover Area */}
                            <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1 text-white text-xs font-bold">
                                    <Award size={12} className="text-orange-400" />
                                    Verified
                                </div>
                            </div>

                            {/* Profile Content */}
                            <div className="px-6 pb-6 relative">
                                <div className="relative -mt-12 mb-4 flex justify-between items-end">
                                    <img
                                        src={pro.avatar || "https://ui-avatars.com/api/?name=Pro+User"}
                                        className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg object-cover bg-white"
                                        alt={pro.name}
                                    />
                                    <div className="flex flex-col items-end mb-1">
                                        <div className="flex items-center gap-1 text-amber-500 font-black text-lg">
                                            <Star size={18} fill="currentColor" />
                                            {pro.rating || 'New'}
                                        </div>
                                        <span className="text-xs text-slate-400 font-bold">{pro.reviewCount || 0} reviews</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors flex items-center gap-2">
                                        {pro.name}
                                        <ShieldCheck size={16} className="text-blue-500" />
                                    </h3>
                                    <p className="text-orange-500 font-bold text-xs uppercase tracking-wider mb-3">
                                        {pro.category || 'Professional'}
                                    </p>

                                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">
                                        {pro.bio || "No bio description available for this professional."}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {(pro.skills || []).slice(0, 3).map((skill: string, idx: number) => (
                                            <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg">
                                                # {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                                            <MapPin size={14} />
                                            {pro.location || "Luxembourg"}
                                        </div>
                                        <Button className="h-8 px-4 text-xs rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors border border-slate-200 dark:border-slate-700">
                                            View Profile <ChevronRight size={14} className="ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
