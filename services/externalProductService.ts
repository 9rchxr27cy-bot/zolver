
import { Product } from '../types';

export const MOCK_PRODUCTS: Product[] = [
    // ZOLVER MERCH
    {
        id: 'zolver-hoodie-001',
        title: 'Zolver Official Hoodie - Black',
        description: 'Premium heavyweight cotton hoodie with embroidered Zolver logo. Perfect for cold job sites.',
        price: 49.99,
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'],
        category: 'MERCH',
        fulfillmentType: 'ZOLVER_INTERNAL',
        stock: 100,
        rating: 4.8,
        reviewsCount: 42
    },
    {
        id: 'zolver-cap-001',
        title: 'Zolver Snapback Cap',
        description: 'Classic snapback with 3D embroidery. One size fits all.',
        price: 24.99,
        images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800'],
        category: 'MERCH',
        fulfillmentType: 'ZOLVER_INTERNAL',
        stock: 250,
        rating: 4.9,
        reviewsCount: 128
    },
    {
        id: 'zolver-vest-001',
        title: 'Zolver Pro Safety Vest',
        description: 'High-visibility safety vest with multiple tool pockets and Zolver Pro badging.',
        price: 34.99,
        images: ['https://images.unsplash.com/photo-1611174743420-3d7df880ce32?auto=format&fit=crop&q=80&w=800'], // Placeholder
        category: 'UNIFORMS',
        fulfillmentType: 'ZOLVER_INTERNAL',
        stock: 50,
        rating: 4.7,
        reviewsCount: 15
    },

    // PARTNER TOOLS (DROPSHIP)
    {
        id: 'partner-makita-drill',
        title: 'Makita 18V LXT Cordless Driver-Drill',
        description: 'Powerful and compact driver-drill. Mechanical 2-speed transmission (0-500 & 0-1,900 RPM) for a wide range of drilling.',
        price: 129.00,
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800'],
        category: 'TOOLS',
        fulfillmentType: 'PARTNER_DROPSHIP',
        partnerId: 'makita-official',
        brand: 'Makita',
        stock: 20,
        rating: 4.9,
        reviewsCount: 3400
    },
    {
        id: 'partner-bosch-laser',
        title: 'Bosch Professional Laser Measure',
        description: 'Laser measure with Bluetooth connectivity for documenting measurements via App.',
        price: 89.99,
        images: ['https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&q=80&w=800'], // Placeholder
        category: 'TOOLS',
        fulfillmentType: 'PARTNER_DROPSHIP',
        partnerId: 'bosch-tools',
        brand: 'Bosch',
        stock: 15,
        rating: 4.6,
        reviewsCount: 210
    },
    {
        id: 'partner-gloves-heavy',
        title: 'Heavy Duty Impact Gloves',
        description: 'Cut resistant and impact protection gloves for demolition and heavy lifting.',
        price: 19.99,
        images: ['https://images.unsplash.com/photo-1595328906666-4c4f3a4b0870?auto=format&fit=crop&q=80&w=800'], // Placeholder
        category: 'EQUIPMENT',
        fulfillmentType: 'PARTNER_DROPSHIP',
        partnerId: 'safety-gear-co',
        brand: 'SafetyPro',
        stock: 500,
        rating: 4.5,
        reviewsCount: 89
    }
];

export const externalProductService = {
    getProducts: async (category?: string): Promise<Product[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));

        if (category) {
            return MOCK_PRODUCTS.filter(p => p.category === category);
        }
        return MOCK_PRODUCTS;
    },

    getProductById: async (id: string): Promise<Product | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_PRODUCTS.find(p => p.id === id);
    }
};
