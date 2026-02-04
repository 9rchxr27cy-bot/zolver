import React from 'react';
import { Star } from 'lucide-react';

interface ReviewStarsProps {
    rating: number;
    count?: number;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
}

export const ReviewStars: React.FC<ReviewStarsProps> = ({
    rating,
    count,
    size = 'sm',
    showCount = true
}) => {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    return (
        <div className="flex items-center gap-1">
            {stars.map((star) => (
                <Star
                    key={star}
                    className={`${sizeClasses[size]} ${star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                />
            ))}
            {showCount && count !== undefined && (
                <span className={`ml-1 font-medium text-slate-600 dark:text-slate-400 ${textSizeClasses[size]}`}>
                    ({count})
                </span>
            )}
        </div>
    );
};
