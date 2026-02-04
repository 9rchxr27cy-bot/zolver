import { db } from '../src/lib/firebase';
import { runTransaction, doc, collection, serverTimestamp } from 'firebase/firestore';

interface ReviewSubmission {
    jobId: string;
    proId: string;
    clientId?: string;
    clientName: string;
    rating: number;
    comment: string;
}

export const submitReview = async (data: ReviewSubmission) => {
    try {
        await runTransaction(db, async (transaction) => {
            // 1. References
            const proRef = doc(db, 'users', data.proId);
            const jobRef = doc(db, 'jobs', data.jobId);
            const reviewRef = doc(collection(db, 'reviews')); // Auto-ID

            // 2. Read current Pro Stats
            const proDoc = await transaction.get(proRef);
            if (!proDoc.exists()) {
                throw new Error("Professional not found");
            }

            const proData = proDoc.data();
            const currentRating = proData.rating || 5.0; // Default to 5 if new
            const currentCount = proData.reviewsCount || 0;

            // 3. Calculate New Stats
            const newCount = currentCount + 1;
            const newRating = ((currentRating * currentCount) + data.rating) / newCount;

            // 4. Create Review Document
            transaction.set(reviewRef, {
                id: reviewRef.id,
                ...data,
                createdAt: serverTimestamp(),
                date: new Date().toISOString() // Redundant but useful for UI
            });

            // 5. Update Pro
            transaction.update(proRef, {
                rating: Number(newRating.toFixed(2)), // Keep 2 decimals
                reviewsCount: newCount
            });

            // 6. Update Job (Mark as reviewed to prevent duplicate modal)
            transaction.update(jobRef, {
                hasReview: true,
                reviewId: reviewRef.id
            });
        });

        console.log("Review transaction completed successfully.");

    } catch (error) {
        console.error("Review Transaction Failed:", error);
        throw error;
    }
};
