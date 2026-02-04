import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';

interface FlashDealsProps {
    endTime?: Date;
}

export const FlashDeals: React.FC<FlashDealsProps> = ({ endTime }) => {
    // Default to 6 hours from now if no endTime provided
    const defaultEndTime = new Date(Date.now() + 6 * 60 * 60 * 1000);
    const targetTime = endTime || defaultEndTime;

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = targetTime.getTime() - Date.now();

        if (difference <= 0) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }

        return {
            hours: Math.floor(difference / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Zap className="w-5 h-5" fill="currentColor" />
                    </div>
                    <div>
                        <div className="font-black text-sm md:text-base">⚡ OFERTAS RELÂMPAGO</div>
                        <div className="text-xs opacity-90">Aproveite descontos de até 40%</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 opacity-75" />
                    <div className="flex items-center gap-1 font-mono font-bold">
                        <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-sm min-w-[2rem] text-center">
                            {String(timeLeft.hours).padStart(2, '0')}
                        </div>
                        <span>:</span>
                        <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-sm min-w-[2rem] text-center">
                            {String(timeLeft.minutes).padStart(2, '0')}
                        </div>
                        <span>:</span>
                        <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-sm min-w-[2rem] text-center">
                            {String(timeLeft.seconds).padStart(2, '0')}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
