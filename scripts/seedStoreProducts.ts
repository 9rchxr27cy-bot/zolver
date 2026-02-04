import { collection, addDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

/**
 * Seed sample Zolver Store products
 * Products focused on professional work tools and equipment
 */

const sampleProducts = [
    // Work Clothes & Safety Gear
    {
        title: 'Zolver Pro Work Pants - Heavy Duty',
        description: 'Professional work pants with reinforced knees and multiple tool pockets. Made from durable ripstop fabric. Perfect for plumbers, electricians, and construction workers.',
        price: 49.99,
        images: [
            'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
            'https://images.unsplash.com/photo-1594938384827-ab63628f3ed3?w=800'
        ],
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
        images: [
            'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800',
            'https://images.unsplash.com/photo-1542840410-3092f99611a3?w=800'
        ],
        category: 'WORKWEAR' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'SafeStep',
        stock: 35,
        rating: 4.8,
        reviewsCount: 127
    },
    {
        title: 'High-Visibility Safety Vest',
        description: 'ANSI Class 2 compliant reflective safety vest. Lightweight, breathable mesh with adjustable straps. Essential for road work and construction.',
        price: 15.99,
        images: [
            'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800'
        ],
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
        images: [
            'https://images.unsplash.com/photo-1584438543928-05c0c0d0c8a0?w=800'
        ],
        category: 'WORKWEAR' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'GripPro',
        stock: 75,
        rating: 4.6,
        reviewsCount: 156
    },

    // Power Tools
    {
        title: 'Cordless Drill/Driver Kit - 20V Max',
        description: '20V Max lithium-ion cordless drill with 2 batteries, charger, and carrying case. Variable speed trigger, 24-position clutch. Includes drill and screwdriver bits.',
        price: 129.99,
        images: [
            'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800',
            'https://images.unsplash.com/photo-1606145551819-c61a9c09afd8?w=800'
        ],
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
        images: [
            'https://images.unsplash.com/photo-1519472554795-f1e9f38af874?w=800'
        ],
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
        images: [
            'https://images.unsplash.com/photo-1622290319757-eb5cd0219d07?w=800'
        ],
        category: 'TOOLS' as const,
        fulfillmentType: 'DROPSHIP' as const,
        brand: 'GrindMaster',
        stock: 40,
        rating: 4.5,
        reviewsCount: 178
    },

    // Hand Tools & Accessories
    {
        title: 'Professional Tool Set - 200 Pieces',
        description: 'Comprehensive 200-piece mechanic tool set with ratchets, sockets, wrenches, screwdrivers, and more. Organized in sturdy carrying case.',
        price: 199.99,
        images: [
            'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800',
            'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800'
        ],
        category: 'TOOLS' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'ToolMaster',
        stock: 15,
        rating: 4.7,
        reviewsCount: 234
    },
    {
        title: 'Laser Level - Cross Line',
        description: 'Self-leveling cross-line laser level with magnetic mount. Red beam, 50ft range, ±3mm accuracy. Essential for installation work.',
        price: 89.99,
        images: [
            'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=800'
        ],
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
        images: [
            'https://images.unsplash.com/photo-1560780552-ba4d9b144a73?w=800'
        ],
        category: 'TOOLS' as const,
        fulfillmentType: 'DROPSHIP' as const,
        brand: 'CutPro',
        stock: 80,
        rating: 4.4,
        reviewsCount: 312
    },

    // Plumbing & Electrical
    {
        title: 'Pipe Wrench Set - 3 Piece',
        description: 'Professional pipe wrench set (10", 14", 18") with I-beam handles and hardened steel jaws. Essential for plumbers.',
        price: 69.99,
        images: [
            'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800'
        ],
        category: 'PLUMBING' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'PlumbPro',
        stock: 30,
        rating: 4.7,
        reviewsCount: 98
    },
    {
        title: 'Electrical Tester & Multimeter',
        description: 'Digital multimeter with non-contact voltage tester. AC/DC voltage, current, resistance, continuity testing. Auto-ranging.',
        price: 44.99,
        images: [
            'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800'
        ],
        category: 'ELECTRICAL' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'VoltTest',
        stock: 45,
        rating: 4.6,
        reviewsCount: 167
    },

    // Storage & Organization
    {
        title: 'Rolling Tool Chest - 7 Drawer',
        description: 'Heavy-duty rolling tool chest with 7 drawers and top compartment. Ball-bearing slides, lockable, powder-coated steel.',
        price: 299.99,
        images: [
            'https://images.unsplash.com/photo-1588287729528-1b39e6fcabdb?w=800'
        ],
        category: 'STORAGE' as const,
        fulfillmentType: 'MARKETPLACE' as const,
        brand: 'StoreMaster',
        stock: 8,
        rating: 4.8,
        reviewsCount: 156
    },
    {
        title: 'Tool Bag - 16 inch Wide Mouth',
        description: 'Heavy-duty tool bag with reinforced bottom, padded shoulder strap, and 23 exterior pockets. Water-resistant 600D polyester.',
        price: 39.99,
        images: [
            'https://images.unsplash.com/photo-1585009198325-e7ecacf94b47?w=800'
        ],
        category: 'STORAGE' as const,
        fulfillmentType: 'DROPSHIP' as const,
        brand: 'CarryAll',
        stock: 60,
        rating: 4.5,
        reviewsCount: 189
    },

    // Safety Equipment
    {
        title: 'Safety Glasses - 12 Pack',
        description: 'ANSI Z87.1 certified safety glasses with anti-fog coating. UV protection, scratch-resistant. Bulk pack of 12.',
        price: 29.99,
        images: [
            'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800'
        ],
        category: 'SAFETY' as const,
        fulfillmentType: 'DROPSHIP' as const,
        brand: 'SafeVision',
        stock: 95,
        rating: 4.4,
        reviewsCount: 278
    }
];

async function seedStoreProducts() {
    console.log('🌱 Starting to seed Zolver Store products...');

    try {
        const productsRef = collection(db, 'products');
        let successCount = 0;

        for (const product of sampleProducts) {
            try {
                const docRef = await addDoc(productsRef, {
                    ...product,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`✅ Added: ${product.title} (ID: ${docRef.id})`);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to add ${product.title}:`, error);
            }
        }

        console.log(`\n🎉 Successfully added ${successCount}/${sampleProducts.length} products!`);
        console.log('\n📦 Product Summary:');
        console.log(`- Work Clothes & Safety: 4 products`);
        console.log(`- Power Tools: 3 products`);
        console.log(`- Hand Tools: 3 products`);
        console.log(`- Plumbing & Electrical: 2 products`);
        console.log(`- Storage: 2 products`);
        console.log(`- Safety Equipment: 1 product`);

    } catch (error) {
        console.error('❌ Error seeding products:', error);
    }
}

// Export for use
export { seedStoreProducts, sampleProducts };

// Run if executed directly
if (typeof window === 'undefined') {
    console.log('Run this in browser console after importing db');
}
