import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Truck, ShieldCheck, Tag, Award, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { ProductCategory } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TrustBadges } from '../../components/store/TrustBadges';
import { ReviewStars } from '../../components/store/ReviewStars';
import { FlashDeals } from '../../components/store/FlashDeals';
import { CartProgressBar } from '../../components/store/CartProgressBar';
import { ProductRecommendations } from '../../components/store/ProductRecommendations';

interface StoreHomeProps {
    onBack?: () => void;
}

export const StoreHome: React.FC<StoreHomeProps> = ({ onBack }) => {
    const { products: dbProducts } = useDatabase();
    const { t } = useLanguage();
    const [loading] = useState(false);
    const [activeCategory, setActiveCategory] = useState<ProductCategory | 'ALL'>('ALL');
    const { addToCart, cartTotal } = useCart();

    const products = dbProducts.filter(p => activeCategory === 'ALL' || p.category === activeCategory);

    // Mock data for recommendations (in production, use actual algorithm)
    const recommendations = dbProducts.slice(0, 4);

    // Helper function to get mock review data
    const getMockReviews = (productId: string) => {
        const ratings = [4.2, 4.5, 4.7, 4.8, 4.9, 5.0];
        const counts = [45, 67, 89, 127, 156, 203];
        const index = parseInt(productId.slice(-1), 16) % ratings.length;
        return {
            rating: ratings[index],
            count: counts[index]
        };
    };

    // Check if product is "Pro's Choice"
    const isProsChoice = (productId: string) => {
        // In production, check actual sales data
        return parseInt(productId.slice(-1), 16) % 3 === 0;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0">
            {/* MOBILE HEADER FOR NAVIGATION */}
            <div className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h1 className="font-bold text-lg text-slate-900 dark:text-white">Loja Zolver</h1>
            </div>

            {/* FLASH DEALS BANNER */}
            <FlashDeals />

            {/* HERO BANNER */}
            <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-900 to-indigo-900 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />

                <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-start text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            {t.storeOfficial || 'Loja Oficial Zolver'}
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black mb-2">
                            {t.storeHeroTitle || 'Ferramentas Profissionais'}
                        </h1>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <p className="text-lg text-slate-300 max-w-xl mb-4">
                            {t.storeHeroDesc || 'Equipamento de qualidade para profissionais de elite'}
                        </p>
                        <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 px-4 py-2 rounded-full text-sm font-bold">
                            <Truck className="w-4 h-4" />
                            Entrega Grátis acima de €50
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* TRUST BADGES */}
            <TrustBadges />

            {/* FIRST-TIME BUYER PROMOTION */}
            <div className="max-w-7xl mx-auto px-4 mt-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-black text-lg">Primeira Compra? Ganhe 15% OFF</div>
                            <div className="text-sm opacity-90">Use o código: <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">ZOLVER15</span></div>
                        </div>
                    </div>
                    <button className="hidden md:block bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:bg-purple-50 transition-colors">
                        Aplicar Código
                    </button>
                </div>
            </div>

            {/* FILTERS & CONTENT */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                        {(['ALL', 'MERCH', 'TOOLS', 'UNIFORMS', 'EQUIPMENT'] as const).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {cat === 'ALL' ? t.storeAllProducts || 'Todos' : (cat as string || '').charAt(0) + (cat as string || '').slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={t.storeSearchPlaceholder || 'Buscar produtos...'}
                            className="w-full pl-10 pr-4 py-2 rounded-full bg-white dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* PRODUCT GRID */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => {
                                const reviews = getMockReviews(product.id);
                                const proChoice = isProsChoice(product.id);
                                const lowStock = product.stock > 0 && product.stock <= 5;

                                return (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -5 }}
                                    >
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden group">
                                            {/* IMAGE */}
                                            <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />

                                                {/* PRO'S CHOICE BADGE */}
                                                {proChoice && (
                                                    <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                                        <Award className="w-3 h-3" />
                                                        ESCOLHA PRO
                                                    </div>
                                                )}

                                                {/* FULFILLMENT TYPE BADGE */}
                                                {!proChoice && product.fulfillmentType === 'ZOLVER_INTERNAL' && (
                                                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        {t.storeOfficialBadge || 'Oficial'}
                                                    </div>
                                                )}
                                                {!proChoice && product.fulfillmentType === 'PARTNER_DROPSHIP' && (
                                                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                                        <Truck className="w-3 h-3" />
                                                        {t.storePartnerBadge || 'Parceiro'}
                                                    </div>
                                                )}

                                                {/* LOW STOCK ALERT */}
                                                {lowStock && (
                                                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {product.stock} restantes
                                                    </div>
                                                )}

                                                {/* Quick Add Button */}
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="absolute bottom-2 right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-slate-900 dark:text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-600 hover:text-white"
                                                >
                                                    <ShoppingBag className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* INFO */}
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                                        {product.brand || 'Zolver'}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-xs text-amber-500">
                                                        <Tag className="w-3 h-3" />
                                                        {product.category}
                                                    </div>
                                                </div>

                                                <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2 h-10">
                                                    {product.title}
                                                </h3>

                                                {/* REVIEWS */}
                                                <div className="mb-2">
                                                    <ReviewStars rating={reviews.rating} count={reviews.count} size="sm" />
                                                </div>

                                                <div className="flex justify-between items-end">
                                                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                                                        €{product.price.toFixed(2)}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {product.stock > 0 ? `${product.stock} ${t.storeInStock || 'em stock'}` : t.storeOutOfStock || 'Esgotado'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* RECOMMENDATIONS */}
                        <ProductRecommendations
                            products={recommendations}
                            onAddToCart={addToCart}
                            title="Profissionais também compraram"
                        />
                    </>
                )}
            </div>

            {/* CART PROGRESS BAR */}
            <CartProgressBar currentTotal={cartTotal} freeShippingThreshold={50} />
        </div>
    );
};
