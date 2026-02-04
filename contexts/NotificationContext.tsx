import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { useAuth } from './AuthContext';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    details?: any;
    read: boolean;
    timestamp: number;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (type: NotificationType, message: string, details?: any) => void;
    markAsRead: (id: string) => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useAuth();

    // In a real app, this might sync with Firestore. For now, local state for toasts/alerts.
    // If persistent notifications are needed, we'd add logic here.

    const addNotification = (type: NotificationType, message: string, details?: any) => {
        const newNotif: Notification = {
            id: Date.now().toString(),
            type,
            message,
            details,
            read: false,
            timestamp: Date.now()
        };
        setNotifications(prev => [newNotif, ...prev]);

        // Auto-dismiss for toasts (optional, but good UX)
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
            }, 5000);
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount: notifications.filter(n => !n.read).length,
            addNotification,
            markAsRead,
            clearNotifications
        }}>
            {children}

            {/* TOAST RENDERER */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {notifications.slice(0, 5).map(note => (
                    <div
                        key={note.id}
                        className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-center gap-3 min-w-[300px] animate-in slide-in-from-right-10 fade-in duration-300 ${note.type === 'success' ? 'bg-white border-green-200 text-green-800' :
                                note.type === 'error' ? 'bg-white border-red-200 text-red-800' :
                                    'bg-white border-slate-200 text-slate-800'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${note.type === 'success' ? 'bg-green-500' :
                                note.type === 'error' ? 'bg-red-500' :
                                    'bg-blue-500'
                            }`} />
                        <div className="flex-1">
                            <p className="font-bold text-sm">{note.message}</p>
                            {note.details && <p className="text-xs opacity-70 mt-1">Check console for details</p>}
                        </div>
                        <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== note.id))} className="text-slate-400 hover:text-slate-600">×</button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
