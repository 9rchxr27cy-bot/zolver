
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SystemLog } from '../../types';

class LoggerService {
    private logsCollection = collection(db, 'system_logs');

    private async log(severity: SystemLog['severity'], errorCode: string, message: string, userId?: string, path?: string) {
        try {
            await addDoc(this.logsCollection, {
                errorCode,
                message,
                userId: userId || 'anonymous',
                timestamp: new Date().toISOString(), // Use ISO string for easier querying/display
                deviceInfo: navigator.userAgent,
                path: path || window.location.pathname,
                severity,
                _serverTimestamp: serverTimestamp() // For accurate sorting
            });
        } catch (e) {
            console.error("FAILED TO LOG SYSTEM ERROR:", e);
        }
    }

    async info(code: string, message: string, userId?: string) {
        // Also console log for dev
        console.log(`[INFO] ${code}: ${message}`);
        await this.log('INFO', code, message, userId);
    }

    async warn(code: string, message: string, userId?: string) {
        console.warn(`[WARN] ${code}: ${message}`);
        await this.log('WARNING', code, message, userId);
    }

    async error(code: string, message: string, userId?: string, path?: string) {
        console.error(`[ERROR] ${code}: ${message}`);
        await this.log('ERROR', code, message, userId, path);
    }

    async critical(code: string, message: string, userId?: string) {
        console.error(`[CRITICAL] ${code}: ${message}`);
        await this.log('CRITICAL', code, message, userId);
    }
}

export const logger = new LoggerService();
