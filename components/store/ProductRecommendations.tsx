import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, TrendingUp } from 'lucide-react';
import { Product } from '../../types';
import { ReviewStars } from './ReviewStars';

interface ProductRecommendationsProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
    title?: string;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
    products,
    onAddToCart,
    title = 'Profissionais também compraram'
}) => {
    if (products.length === 0) return null;

    return (
        <div className="mt-16 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    {title}
                </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.slice(0, 4).map((product) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden group"
                    >
                        <div className="relative h-32 bg-slate-100 dark:bg-slate-800">
                            <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <button
                                onClick={() => onAddToCart(product)}
                                className="absolute bottom-2 right-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-slate-900 dark:text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-600 hover:text-white"
                            >
                                <ShoppingBag className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2 h-10">
                                {product.title}
                            </h3>
                            <ReviewStars rating={4.5} count={Math.floor(Math.random() * 200) + 50} size="sm" />
                            <div className="mt-2 flex justify-between items-center">
                                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                                    €{product.price.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
