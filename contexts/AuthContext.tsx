import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../src/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { logger } from '../src/services/loggerService';
// Assuming Type User from 'firebase/auth' is the auth user, and we also have our app User type.
// We'll stick to Firebase User for auth state, and maybe fetch profile data.

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    userData: any | null; // Profile data from Firestore
    login: (email: string, pass: string) => Promise<void>;
    signUp: (email: string, pass: string, initialData?: any) => Promise<void>;

    resetPassword: (email: string) => Promise<void>;
    isImpersonating: boolean;
    exitGhostMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null); // Store full profile
    const [loading, setLoading] = useState(true);
    const [isImpersonating, setIsImpersonating] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                // Fetch extra user data if needed
                try {
                    // Check for Ghost Mode
                    const impersonatedId = sessionStorage.getItem('impersonatedUserId');
                    const targetUid = impersonatedId || firebaseUser.uid;
                    if (impersonatedId) setIsImpersonating(true);

                    const userDoc = await getDoc(doc(db, 'users', targetUid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData(data);
                        localStorage.setItem('servicebid_current_session_user', JSON.stringify({ id: firebaseUser.uid, ...data }));
                    } else {
                        // Fallback: Use basic data from Auth if doc missing
                        const basicData = {
                            id: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                            role: 'CLIENT' // Default fallback
                        };
                        setUserData(basicData);
                        localStorage.setItem('servicebid_current_session_user', JSON.stringify(basicData));
                    }
                } catch (e) {
                    logger.error("AUTH_PROFILE_FETCH", "Error fetching user profile", firebaseUser.uid);
                    // Critical fallback to allow app to load
                    setUserData({ id: firebaseUser.uid, email: firebaseUser.email });
                }
            } else {
                setUserData(null);
                localStorage.removeItem('servicebid_current_session_user');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (e: any) {
            // 1. Tratamento específico para Credenciais Inválidas (Senha errada)
            if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
                // Apenas mostre o alerta na tela, NÃO chame logSystemError
                throw e; // O LoginModal vai capturar e mostrar o toast
            }

            // 2. Outros erros reais (Sistema fora do ar, etc) podem ser logados
            logger.error("AUTH_LOGIN_FAIL", e.message, email);
            throw e;
        }
    };

    const signUp = async (email: string, pass: string, initialData: any = {}) => {
        const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, pass);
        // Create user document in Firestore immediately
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userData = {
            id: firebaseUser.uid,
            email: email,
            role: 'CLIENT', // Default
            createdAt: new Date().toISOString(),
            addresses: [],
            ...initialData
        };
        await setDoc(userRef, userData);
        setUserData(userData);
    };

    const logout = async () => {
        await signOut(auth);
        setUserData(null);
        localStorage.removeItem('servicebid_current_session_user');
    };

    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    const exitGhostMode = () => {
        sessionStorage.removeItem('impersonatedUserId');
        sessionStorage.removeItem('originalAdminUid');
        setIsImpersonating(false);
        window.location.reload();
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, userData, login, signUp, resetPassword, isImpersonating, exitGhostMode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
