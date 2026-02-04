import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package, Trash2, Edit2, ExternalLink, Shield, Save, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { Card, Button, Input, Badge } from '../Layout';
import { Product, ProductCategory, FulfillmentType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

export const StoreManager = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useDatabase();
    const { t } = useLanguage();
    const [isAdding, setIsAdding] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        title: '',
        description: '',
        price: 0,
        stock: 0,
        category: 'TOOLS',
        fulfillmentType: 'ZOLVER_INTERNAL',
        images: ['']
    });

    const categories: ProductCategory[] = ['MERCH', 'TOOLS', 'UNIFORMS', 'EQUIPMENT'];

    const handleSave = async () => {
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
            } else {
                await addProduct(formData as Omit<Product, 'id'>);
            }
            setIsAdding(false);
            setEditingProduct(null);
            setFormData({ title: '', description: '', price: 0, stock: 0, category: 'TOOLS', fulfillmentType: 'ZOLVER_INTERNAL', images: [''] });
        } catch (error) {
            console.error("Store update failed", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <Package className="text-pink-500" /> {t.adminCatalog}
                    </h2>
                    <p className="text-sm text-slate-500">{t.adminCatalogDesc}</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="flex gap-2">
                    <Plus size={20} /> {t.adminAddProduct}
                </Button>
            </div>

            {/* List Table */}
            <Card className="overflow-hidden p-0">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">{t.adminProduct}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">{t.adminCategory}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">{t.adminPrice}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">{t.adminStock}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">{t.adminType}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">{t.adminActions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {products.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                            {p.images?.[0] ? <img src={p.images[0]} alt="" className="object-cover w-full h-full" /> : <Package className="text-slate-300" />}
                                        </div>
                                        <div>
                                            <div className="font-bold">{p.title}</div>
                                            <div className="text-xs text-slate-500 truncate w-40">{p.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline">{p.category}</Badge>
                                </td>
                                <td className="px-6 py-4 font-black">€{p.price.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={p.stock < 5 ? 'text-red-500 font-bold' : ''}>{p.stock} units</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-xs">
                                        {p.fulfillmentType === 'ZOLVER_INTERNAL' ? <Shield size={12} className="text-blue-500" /> : <ExternalLink size={12} className="text-amber-500" />}
                                        {p.fulfillmentType === 'ZOLVER_INTERNAL' ? t.adminInternal : t.adminPartner}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingProduct(p); setFormData(p); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => deleteProduct(p.id)} className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Modal Form */}
            <AnimatePresence>
                {(isAdding || editingProduct) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <h3 className="text-xl font-black">{editingProduct ? t.adminEditProduct : t.adminAddNewProduct}</h3>
                                    <button onClick={() => { setIsAdding(false); setEditingProduct(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X /></button>
                                </div>
                                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-400">Title</label>
                                            <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Master Drill" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-400">Category</label>
                                            <select className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-400">Description</label>
                                        <textarea className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-400">Price (€)</label>
                                            <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-400">Stock</label>
                                            <Input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-400">{t.adminFulfillment}</label>
                                            <div className="flex items-center gap-2 pt-2">
                                                <button onClick={() => setFormData({ ...formData, fulfillmentType: 'ZOLVER_INTERNAL' })} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${formData.fulfillmentType === 'ZOLVER_INTERNAL' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{t.adminInternal.toUpperCase()}</button>
                                                <button onClick={() => setFormData({ ...formData, fulfillmentType: 'PARTNER_DROPSHIP' })} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${formData.fulfillmentType === 'PARTNER_DROPSHIP' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{t.adminPartner.toUpperCase()}</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-400">Image URL</label>
                                        <Input value={formData.images?.[0]} onChange={e => setFormData({ ...formData, images: [e.target.value] })} placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                    <Button variant="ghost" onClick={() => { setIsAdding(false); setEditingProduct(null); }}>{t.cancel}</Button>
                                    <Button onClick={handleSave} className="flex gap-2">
                                        <Save size={18} /> {editingProduct ? t.saveChanges : t.adminAddProduct}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
