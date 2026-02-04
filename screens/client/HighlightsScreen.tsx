import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, MapPin, Award, ExternalLink, MessageCircle, Zap } from 'lucide-react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ReviewStars } from '../../components/store/ReviewStars';

export const HighlightsScreen: React.FC = () => {
    const { users } = useDatabase();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Filter promoted professionals
    const promotedPros = users.filter(u =>
        u.role === 'PRO' &&
        (u.isPromoted === true || (u.marketingPlan && u.marketingPlan !== 'free'))
    );

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleProClick = (proId: string) => {
        navigate(`/pro/${proId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
                <div className="max-w-2xl mx-auto space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white">Destaques</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Profissionais em evidência</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {promotedPros.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <Star className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                            Nenhum destaque no momento
                        </h3>
                        <p className="text-sm text-slate-500">
                            Profissionais promovidos aparecerão aqui
                        </p>
                    </div>
                ) : (
                    promotedPros.map((pro, idx) => (
                        <motion.div
                            key={pro.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden group cursor-pointer"
                            onClick={() => handleProClick(pro.id)}
                        >
                            {/* Cover Image / Header */}
                            <div className="relative h-64 bg-gradient-to-br from-orange-400 to-pink-500 overflow-hidden">
                                {pro.coverImage ? (
                                    <img
                                        src={pro.coverImage}
                                        alt={pro.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <img
                                            src={pro.avatar}
                                            alt={pro.name}
                                            className="w-32 h-32 rounded-full border-4 border-white shadow-2xl"
                                        />
                                    </div>
                                )}

                                {/* Promoted Badge */}
                                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm">
                                    <Zap className="w-4 h-4 fill-current" />
                                    {pro.marketingPlan === 'premium' ? 'PREMIUM' : 'DESTAQUE'}
                                </div>

                                {/* Verified Badge */}
                                {pro.isVerified && (
                                    <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1 text-xs font-bold">
                                        <Award className="w-3 h-3" />
                                        VERIFICADO
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Profile Info */}
                                <div className="flex items-start gap-4 mb-4">
                                    {!pro.coverImage && (
                                        <img
                                            src={pro.avatar}
                                            alt={pro.name}
                                            className="w-16 h-16 rounded-2xl border-2 border-slate-100 dark:border-slate-800"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                            {pro.companyDetails?.legalName || pro.name}
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                            <MapPin className="w-4 h-4" />
                                            {pro.addresses && pro.addresses[0] ? pro.addresses[0].locality : 'Luxembourg'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            {pro.level || 'Top Pro'}
                                        </div>
                                        <ReviewStars rating={pro.rating || 4.8} count={pro.reviewCount || 0} size="sm" />
                                    </div>
                                </div>

                                {/* Bio */}
                                {pro.bio && (
                                    <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
                                        {pro.bio}
                                    </p>
                                )}

                                {/* Services Tags */}
                                {pro.services && pro.services.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {pro.services.slice(0, 3).map((service, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold"
                                            >
                                                {service.id}
                                            </span>
                                        ))}
                                        {pro.services.length > 3 && (
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold">
                                                +{pro.services.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleProClick(pro.id);
                                        }}
                                        className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 px-6 rounded-2xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Ver Perfil
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/messages');
                                        }}
                                        className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
