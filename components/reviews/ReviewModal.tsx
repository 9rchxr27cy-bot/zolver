import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui';
import { submitReview } from '../../services/reviewService';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    proId: string;
    proName: string;
    onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, jobId, proId, proName, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If not open, don't render (or use AnimatePresence in parent)
    // But typically prompts ask for conditional rendering or internal null return
    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            await submitReview({
                jobId,
                proId,
                rating,
                comment,
                clientName: "Client" // Ideally fetched or passed prop
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to submit review", error);
            alert("Error submitting review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 md:p-8 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <X size={24} />
                    </button>

                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                        Rate the Service
                    </h2>
                    <p className="text-slate-500 mb-8">
                        How was your experience with <span className="font-bold text-slate-900 dark:text-white">{proName}</span>?
                    </p>

                    <div className="flex justify-center gap-2 mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110 focus:outline-none"
                            >
                                <Star
                                    size={40}
                                    className={`${star <= (hoverRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                                            : 'text-slate-200 dark:text-slate-700'
                                        } transition-colors duration-200`}
                                />
                            </button>
                        ))}
                    </div>

                    <textarea
                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:ring-2 focus:ring-orange-500 outline-none mb-6"
                        rows={4}
                        placeholder="Write a comment (optional)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />

                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || isSubmitting}
                        className="w-full bg-slate-900 text-white hover:bg-slate-800 h-12 text-lg font-bold shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Sending...' : 'Submit Review'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
