import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { PersistentNotification, markNotificationRead } from '../services/notificationService';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationsBellProps {
    userId: string;
    onNavigate: (type: string, data: any) => void;
}

export const NotificationsBell: React.FC<NotificationsBellProps> = ({ userId, onNavigate }) => {
    const [notifications, setNotifications] = useState<PersistentNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const q = query(
            collection(db, 'users', userId, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as PersistentNotification));
            setNotifications(list);
            setUnreadCount(list.filter(n => !n.read).length);
        });

        return () => unsubscribe();
    }, [userId]);

    const handleClick = (note: PersistentNotification) => {
        if (!note.read) {
            markNotificationRead(userId, note.id);
        }
        onNavigate(note.type, note.data);
        setIsOpen(false);
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
            >
                <Bell size={24} className="text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            {...({ className: "absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50" } as any)}
                        >
                            <div className="p-3 border-b border-slate-100 dark:border-slate-800 font-bold text-sm">
                                Notifications
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-xs">
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map(note => (
                                        <div
                                            key={note.id}
                                            onClick={() => handleClick(note)}
                                            className={`p-3 border-b border-slate-50 dark:border-slate-800 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${!note.read ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm ${!note.read ? 'font-black text-orange-600' : 'font-bold text-slate-700 dark:text-slate-200'}`}>
                                                    {note.title}
                                                </h4>
                                                {!note.read && (
                                                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {note.body}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
