
import { db } from '../lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Announcement } from '../../types';
import { logger } from './loggerService';

class AdminService {

    // GHOST MODE: Impersonate a user
    async enterGhostMode(targetUserId: string) {
        try {
            // Check if user exists first
            const userRef = doc(db, 'users', targetUserId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                throw new Error("Target user does not exist");
            }

            // In a real app, we would use a custom token system. 
            // For this demo: we will store the admin context in SessionStorage and force reloading the app with the user's ID mocked.
            // However, since we rely on Firebase Auth, true impersonation requires Cloud Functions "createCustomToken".
            // SHORTCUT for MVP: We will set a 'impersonatedUserId' in localStorage and modify AuthContext to respect it if the real user is Admin.

            sessionStorage.setItem('originalAdminUid', 'CURRENT_ADMIN_UID_PLACEHOLDER'); // In a real flow we'd get this from auth
            sessionStorage.setItem('impersonatedUserId', targetUserId);

            logger.warn('ADMIN_ACTION', `Entering Ghost Mode for user ${targetUserId}`);

            window.location.reload(); // Reload to trigger the context to pick up the new ID
        } catch (error) {
            logger.error('GHOST_MODE_FAIL', 'Failed to enter ghost mode', error instanceof Error ? error.message : "Unknown");
            throw error;
        }
    }

    // BROADCAST: Send global push/banner
    async sendBroadcast(message: string, type: 'INFO' | 'WARNING' | 'CRITICAL') {
        try {
            await addDoc(collection(db, 'system_announcements'), {
                message,
                type,
                active: true,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() // 24h expiry
            });
            logger.info('BROADCAST_SENT', `Broadcast sent: ${message}`);
        } catch (error) {
            logger.error('BROADCAST_FAIL', 'Failed to send broadcast', error instanceof Error ? error.message : "Unknown");
            throw error;
        }
    }

    // MAINTENANCE: Kill Switch
    async toggleMaintenanceMode(enabled: boolean) {
        try {
            await setDoc(doc(db, 'config', 'app_status'), {
                maintenanceMode: enabled,
                updatedAt: serverTimestamp()
            }, { merge: true });

            logger.warn('MAINTENANCE_TOGGLE', `Maintenance mode set to ${enabled}`);
        } catch (error) {
            logger.error('MAINTENANCE_FAIL', 'Failed to toggle maintenance', error instanceof Error ? error.message : "Unknown");
            throw error;
        }
    }
}

export const adminService = new AdminService();
