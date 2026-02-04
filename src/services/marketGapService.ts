
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { logger } from './loggerService';

class MarketGapService {
    private collectionRef = collection(db, 'market_gaps');

    async recordGap(searchQuery: string, location: string) {
        if (!searchQuery) return;

        const normalizedQuery = (searchQuery || '').toLowerCase().trim();
        const normalizedLocation = (location || '').toLowerCase().trim() || 'all-luxembourg';

        try {
            // Check if this gap already exists using a composite key logic or query
            // Ideally we'd validte this but for now simple query
            const q = query(
                this.collectionRef,
                where('query', '==', normalizedQuery),
                where('location', '==', normalizedLocation)
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // Increment existing
                const docRef = snapshot.docs[0].ref;
                await updateDoc(docRef, {
                    count: increment(1),
                    lastSearched: serverTimestamp()
                });
            } else {
                // Create new gap
                await addDoc(this.collectionRef, {
                    query: normalizedQuery,
                    location: normalizedLocation,
                    count: 1,
                    lastSearched: serverTimestamp()
                });
                // Log this as an interesting event
                logger.info('MARKET_GAP_DETECTED', `New gap found: ${normalizedQuery} in ${normalizedLocation}`);
            }
        } catch (error) {
            logger.error('MARKET_GAP_ERROR', 'Failed to record market gap', error);
        }
    }

    async getTopGaps(limitCount = 5) {
        // This would be used by Admin Dashboard
        // Requires importing orderBy and limit if implemented
        return [];
    }
}

export const marketGapService = new MarketGapService();
