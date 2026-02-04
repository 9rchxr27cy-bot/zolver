import { db } from '../src/lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { logger } from '../src/services/loggerService';

export interface PersistentNotification {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: 'JOB_REQUEST' | 'OFFER_MADE' | 'JOB_DONE' | 'GENERAL';
    read: boolean;
    createdAt: any;
    data?: any; // For navigation (jobId, etc)
}

// 1. NOTIFY PRO: New Request
export const notifyProNewRequest = async (proId: string, clientName: string, jobId: string) => {
    try {
        await addDoc(collection(db, 'users', proId, 'notifications'), {
            userId: proId,
            title: 'Novo Pedido',
            body: `Você recebeu um pedido direto de ${clientName}`,
            type: 'JOB_REQUEST',
            read: false,
            createdAt: serverTimestamp(),
            data: { jobId }
        });
    } catch (error) {
        logger.error('NOTIF_PRO', error.message);
    }
};

// 2. NOTIFY CLIENT: New Offer
export const notifyClientOffer = async (clientId: string, proName: string, jobId: string, proposalId: string) => {
    try {
        await addDoc(collection(db, 'users', clientId, 'notifications'), {
            userId: clientId,
            title: 'Nova Oferta',
            body: `${proName} enviou um orçamento`,
            type: 'OFFER_MADE',
            read: false,
            createdAt: serverTimestamp(),
            data: { jobId, proposalId }
        });
    } catch (error) {
        logger.error('NOTIF_CLIENT', error.message);
    }
};

// 3. NOTIFY CLIENT: Job Done
export const notifyClientJobDone = async (clientId: string, proName: string, jobId: string) => {
    try {
        await addDoc(collection(db, 'users', clientId, 'notifications'), {
            userId: clientId,
            title: 'Serviço Concluído',
            body: `Avalie o serviço de ${proName}`,
            type: 'JOB_DONE',
            read: false,
            createdAt: serverTimestamp(),
            data: { jobId }
        });
    } catch (error) {
        logger.error('NOTIF_JOB_DONE', error.message);
    }
};

// UTILS
export const markNotificationRead = async (userId: string, notificationId: string) => {
    try {
        await updateDoc(doc(db, 'users', userId, 'notifications', notificationId), {
            read: true
        });
    } catch (error) {
        logger.error('NOTIF_MARK_READ', error.message);
    }
};
