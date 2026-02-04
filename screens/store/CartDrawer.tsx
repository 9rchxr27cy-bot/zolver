
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../../components/ui';

export const CartDrawer: React.FC = () => {
    const { cart, isCartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

    // Unified Checkout Handler (Mock)
    const handleCheckout = () => {
        alert("Proceeding to Unified Checkout. \n\nBackend will split order:\n- Zolver Items -> Warehouse\n- Partner Items -> Drop Ship API");
        // In real app, navigate to /store/checkout
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        {...({ onClick: () => setCartOpen(false) } as any)}
                        {...({ className: "fixed inset-0 bg-black z-[60]" } as any)}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        {...({ className: "fixed inset-y-0 right-0 z-[70] w-full md:w-96 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col" } as any)}
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Your Cart
                            </h2>
                            <button
                                onClick={() => setCartOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Your cart is empty</p>
                                    <Button variant="outline" className="mt-4" onClick={() => setCartOpen(false)}>
                                        Start Shopping
                                    </Button>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <img
                                            src={item.images[0]}
                                            alt={item.title}
                                            className="w-20 h-20 object-cover rounded-lg bg-white"
                                        />
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                {item.fulfillmentType === 'ZOLVER_INTERNAL' && (
                                                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1 block">Zolver Official</span>
                                                )}
                                                {item.fulfillmentType === 'PARTNER_DROPSHIP' && (
                                                    <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 mb-1 block">Partner: {item.brand}</span>
                                                )}
                                                <h4 className="font-medium text-sm truncate">{item.title}</h4>
                                                <p className="text-sm font-bold mt-1">€{item.price.toFixed(2)}</p>
                                            </div>

                                            <div className="flex justify-between items-center mt-2">
                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 hover:text-red-500"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 hover:text-green-500"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-slate-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-bold text-xl">€{cartTotal.toFixed(2)}</span>
                                </div>
                                <Button className="w-full py-3 text-lg" onClick={handleCheckout}>
                                    Checkout Now
                                </Button>
                                <p className="text-center text-xs text-slate-400 mt-3">
                                    Shipping & Taxes calculated at checkout
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
