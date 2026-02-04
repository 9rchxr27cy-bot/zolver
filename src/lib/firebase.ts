/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

export const firebaseConfig = {
    apiKey: "AIzaSyCMUOKfz3GZgbJZfogwi3RH3BLRntqkxWE",
    authDomain: "zolver-19930615.firebaseapp.com",
    projectId: "zolver-19930615",
    storageBucket: "zolver-19930615.firebasestorage.app",
    messagingSenderId: "1008268192184",
    appId: "1:1008268192184:web:2cd0840ccdb2406919474d",
    measurementId: "G-4NL0D1SW7W"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
