import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import { Card } from '../../components/ui';
import { ShoppingBag, Package, AlertCircle, CheckCircle2 } from 'lucide-react';

const sampleProducts = [
    {
        title: 'Zolver Pro Work Pants - Heavy Duty',
        description: 'Professional work pants with reinforced knees and multiple tool pockets. Made from durable ripstop fabric. Perfect for plumbers, electricians, and construction workers.',
        price: 49.99,
        images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800', 'https://images.unsplash.com/photo-1594938384827-ab63628f3ed3?w=800'],
        category: 'WORKWEAR' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'Zolver Pro',
        stock: 50,
        rating: 4.7,
        reviewsCount: 89
    },
    {
        title: 'Safety Work Boots - Steel Toe',
        description: 'Waterproof safety boots with steel toe cap, puncture-resistant sole, and electrical hazard protection. Comfortable for all-day wear.',
        price: 79.99,
        images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800'],
        category: 'WORKWEAR' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'SafeStep',
        stock: 35,
        rating: 4.8,
        reviewsCount: 127
    },
    {
        title: 'High-Visibility Safety Vest',
        description: 'ANSI Class 2 compliant reflective safety vest. Lightweight, breathable mesh with adjustable straps.',
        price: 15.99,
        images: ['https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800'],
        category: 'WORKWEAR' as const,
        fulfillmentType: 'DROPSHIP' as const,
        brand: 'SafetyFirst',
        stock: 100,
        rating: 4.5,
        reviewsCount: 203
    },
    {
        title: 'Work Gloves - Cut Resistant (6 Pairs)',
        description: 'Level 5 cut-resistant work gloves with excellent grip. Touchscreen compatible. Pack of 6 pairs.',
        price: 24.99,
        images: ['https://images.unsplash.com/photo-1584438543928-05c0c0d0c8a0?w=800'],
        category: 'WORKWEAR' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'GripPro',
        stock: 75,
        rating: 4.6,
        reviewsCount: 156
    },
    {
        title: 'Cordless Drill/Driver Kit - 20V Max',
        description: '20V Max lithium-ion cordless drill with 2 batteries, charger, and carrying case. Variable speed trigger, 24-position clutch.',
        price: 129.99,
        images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800'],
        category: 'TOOLS' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'PowerMax',
        stock: 25,
        rating: 4.9,
        reviewsCount: 342
    },
    {
        title: 'Impact Driver Set - 18V',
        description: 'High-torque 18V impact driver with brushless motor. Includes 2 batteries (4.0Ah), fast charger, and 32-piece bit set.',
        price: 149.99,
        images: ['https://images.unsplash.com/photo-1519472554795-f1e9f38af874?w=800'],
        category: 'TOOLS' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'ImpactPro',
        stock: 18,
        rating: 4.8,
        reviewsCount: 287
    },
    {
        title: 'Angle Grinder - 4.5 inch',
        description: '750W angle grinder with safety guard and side handle. Perfect for cutting, grinding, and polishing metal and masonry.',
        price: 59.99,
        images: ['https://images.unsplash.com/photo-1622290319757-eb5cd0219d07?w=800'],
        category: 'TOOLS' as const,
        fulfillmentType: 'DROPSHIP' as const,
        brand: 'GrindMaster',
        stock: 40,
        rating: 4.5,
        reviewsCount: 178
    },
    {
        title: 'Professional Tool Set - 200 Pieces',
        description: 'Comprehensive 200-piece mechanic tool set with ratchets, sockets, wrenches, screwdrivers, and more.',
        price: 199.99,
        images: ['https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800'],
        category: 'TOOLS' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'ToolMaster',
        stock: 15,
        rating: 4.7,
        reviewsCount: 234
    },
    {
        title: 'Laser Level - Cross Line',
        description: 'Self-leveling cross-line laser level with magnetic mount. Red beam, 50ft range, ±3mm accuracy.',
        price: 89.99,
        images: ['https://images.unsplash.com/photo-1504222490345-c075b6008014?w=800'],
        category: 'TOOLS' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'LaserLine',
        stock: 22,
        rating: 4.6,
        reviewsCount: 145
    },
    {
        title: 'Multi-Tool Utility Knife Set',
        description: 'Heavy-duty utility knife with auto-lock and 10 extra blades. Ergonomic rubber grip, magnetic blade storage.',
        price: 19.99,
        images: ['https://images.unsplash.com/photo-1560780552-ba4d9b144a73?w=800'],
        category: 'TOOLS' as const,
        fulfillmentType: 'DROPSHIP' as const,
        brand: 'CutPro',
        stock: 80,
        rating: 4.4,
        reviewsCount: 312
    },
    {
        title: 'Pipe Wrench Set - 3 Piece',
        description: 'Professional pipe wrench set (10", 14", 18") with I-beam handles and hardened steel jaws.',
        price: 69.99,
        images: ['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800'],
        category: 'PLUMBING' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'PlumbPro',
        stock: 30,
        rating: 4.7,
        reviewsCount: 98
    },
    {
        title: 'Electrical Tester & Multimeter',
        description: 'Digital multimeter with non-contact voltage tester. AC/DC voltage, current, resistance, continuity testing.',
        price: 44.99,
        images: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800'],
        category: 'ELECTRICAL' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'VoltTest',
        stock: 45,
        rating: 4.6,
        reviewsCount: 167
    },
    {
        title: 'Rolling Tool Chest - 7 Drawer',
        description: 'Heavy-duty rolling tool chest with 7 drawers and top compartment. Ball-bearing slides, lockable.',
        price: 299.99,
        images: ['https://images.unsplash.com/photo-1588287729528-1b39e6fcabdb?w=800'],
        category: 'STORAGE' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'StoreMaster',
        stock: 8,
        rating: 4.8,
        reviewsCount: 156
    },
    {
        title: 'Tool Bag - 16 inch Wide Mouth',
        description: 'Heavy-duty tool bag with reinforced bottom, padded shoulder strap, and 23 exterior pockets.',
        price: 39.99,
        images: ['https://images.unsplash.com/photo-1585009198325-e7ecacf94b47?w=800'],
        category: 'STORAGE' as const,
        fulfillmentType: 'DROPSHIP' as const,
        brand: 'CarryAll',
        stock: 60,
        rating: 4.5,
        reviewsCount: 189
    },
    {
        title: 'Safety Glasses - 12 Pack',
        description: 'ANSI Z87.1 certified safety glasses with anti-fog coating. UV protection, scratch-resistant. Bulk pack of 12.',
        price: 29.99,
        images: ['https://images.unsplash.com/photo-1577803645773-f96470509666?w=800'],
        category: 'SAFETY' as const,
        fulfillmentType: 'DROPSHIP' as const,
        brand: 'SafeVision',
        stock: 95,
        rating: 4.4,
        reviewsCount: 278
    }
];

export const SeedStoreProducts: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<Array<{ type: 'info' | 'success' | 'error'; message: string }>>([]);
    const [successCount, setSuccessCount] = useState(0);

    const addLog = (type: 'info' | 'success' | 'error', message: string) => {
        setLogs(prev => [...prev, { type, message }]);
    };

    const seedProducts = async () => {
        setLoading(true);
        setLogs([]);
        setSuccessCount(0);

        addLog('info', '🌱 Starting to seed products...');

        let count = 0;

        for (const product of sampleProducts) {
            try {
                const docRef = await addDoc(collection(db, 'products'), {
                    ...product,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                addLog('success', `✅ Added: ${product.title}`);
                count++;
                setSuccessCount(count);
            } catch (error: any) {
                addLog('error', `❌ Failed: ${product.title} - ${error.message}`);
            }
        }

        addLog('info', `\n🎉 Successfully added ${count}/${sampleProducts.length} products!`);
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <ShoppingBag className="w-8 h-8 text-orange-500" />
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Seed Store Products</h2>
                        <p className="text-sm text-slate-500">Add sample products to Firestore</p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-bold text-blue-900 dark:text-blue-100 mb-2">Products to be added:</p>
                                <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                                    <li>• 4x Work Clothes & Safety Gear (pants, boots, vests, gloves)</li>
                                    <li>• 3x Power Tools (drill, impact driver, angle grinder)</li>
                                    <li>• 3x Hand Tools (tool set, laser level, utility knife)</li>
                                    <li>• 2x Plumbing & Electrical (pipe wrench, multimeter)</li>
                                    <li>• 2x Storage (tool chest, tool bag)</li>
                                    <li>• 1x Safety Equipment (safety glasses)</li>
                                </ul>
                                <p className="font-bold text-blue-900 dark:text-blue-100 mt-2">Total: 15 products</p>
                            </div>
                        </div>
                    </div>

                    {successCount > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <p className="font-bold text-green-900 dark:text-green-100">
                                    Added {successCount}/{sampleProducts.length} products
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={seedProducts}
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Seeding...
                        </>
                    ) : (
                        <>
                            <Package className="w-5 h-5" />
                            🌱 Seed Products
                        </>
                    )}
                </button>

                {logs.length > 0 && (
                    <div className="mt-6 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <div className="space-y-1 font-mono text-xs">
                            {logs.map((log, idx) => (
                                <div
                                    key={idx}
                                    className={`${log.type === 'success' ? 'text-green-600' :
                                            log.type === 'error' ? 'text-red-600' :
                                                'text-slate-600 dark:text-slate-300'
                                        }`}
                                >
                                    {log.message}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800 dark:text-amber-200">
                            <p className="font-bold mb-1">Note:</p>
                            <p>You must be logged in as an ADMIN to seed products. Only admins have permission to write to the products collection.</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
