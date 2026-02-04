/**
 * Firestore Query Retry Utility
 * Handles network failures and CORS errors with exponential backoff
 */

import { onSnapshot } from 'firebase/firestore';

interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if error is retryable (network/CORS issues)
 */
const isRetryableError = (error: any): boolean => {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code?.toLowerCase() || '';

    // Network-related errors
    if (errorCode === 'unavailable' || errorCode === 'network-error') return true;
    if (errorMessage.includes('network')) return true;
    if (errorMessage.includes('cors')) return true;
    if (errorMessage.includes('fetch')) return true;
    if (errorMessage.includes('connection')) return true;

    return false;
};

/**
 * Execute a Firestore query with retry logic
 * 
 * @example
 * const users = await withRetry(
 *   () => getDocs(collection(db, 'users')),
 *   { maxRetries: 3 }
 * );
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: any;
    let delay = opts.initialDelay;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Don't retry if not a network error or if we're out of retries
            if (!isRetryableError(error) || attempt === opts.maxRetries) {
                console.error(`[Retry] Failed after ${attempt + 1} attempts:`, error);
                throw error;
            }

            // Log retry attempt
            console.warn(
                `[Retry] Attempt ${attempt + 1}/${opts.maxRetries + 1} failed. ` +
                `Retrying in ${delay}ms... Error: ${error.message}`
            );

            // Wait before retrying
            await sleep(delay);

            // Exponential backoff with max cap
            delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
        }
    }

    // Should never reach here, but TypeScript doesn't know that
    throw lastError;
}

/**
 * Wrap a Firestore snapshot listener with error handling and reconnection
 * 
 * @example
 * const unsubscribe = withSnapshotRetry(
 *   collection(db, 'users'),
 *   (snapshot) => setUsers(snapshot.docs.map(...)),
 *   (error) => console.error(error)
 * );
 */
export function withSnapshotRetry(
    query: any,
    onNext: (snapshot: any) => void,
    onError?: (error: Error) => void,
    options: RetryOptions = {}
): () => void {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let unsubscribe: (() => void) | null = null;
    let isActive = true;
    let reconnectAttempt = 0;
    let reconnectDelay = opts.initialDelay;

    const setupListener = () => {
        if (!isActive) return;

        try {
            unsubscribe = onSnapshot(
                query,
                (snapshot: any) => {
                    // Reset reconnect counter on successful connection
                    reconnectAttempt = 0;
                    reconnectDelay = opts.initialDelay;
                    onNext(snapshot);
                },
                (error: any) => {
                    console.error('[Snapshot] Error:', error);

                    if (onError) onError(error);

                    // Attempt to reconnect if it's a network error
                    if (isRetryableError(error) && reconnectAttempt < opts.maxRetries) {
                        reconnectAttempt++;
                        console.warn(
                            `[Snapshot] Reconnecting (${reconnectAttempt}/${opts.maxRetries}) ` +
                            `in ${reconnectDelay}ms...`
                        );

                        setTimeout(() => {
                            if (unsubscribe) unsubscribe();
                            setupListener();
                        }, reconnectDelay);

                        reconnectDelay = Math.min(
                            reconnectDelay * opts.backoffMultiplier,
                            opts.maxDelay
                        );
                    }
                }
            );
        } catch (error) {
            console.error('[Snapshot] Failed to setup listener:', error);
            if (onError) onError(error as Error);
        }
    };

    setupListener();

    // Return cleanup function
    return () => {
        isActive = false;
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
    };
}

