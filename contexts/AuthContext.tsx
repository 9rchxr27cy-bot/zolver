import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
// Assuming Type User from 'firebase/auth' is the auth user, and we also have our app User type.
// We'll stick to Firebase User for auth state, and maybe fetch profile data.

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    userData: any | null; // Profile data from Firestore
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null); // Store full profile
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                // Fetch extra user data if needed
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                        // Sync to localStorage for legacy compatibility
                        localStorage.setItem('servicebid_current_session_user', JSON.stringify({ id: firebaseUser.uid, ...userDoc.data() }));
                    } else {
                        // Fallback if doc not created yet
                        localStorage.setItem('servicebid_current_session_user', JSON.stringify({ id: firebaseUser.uid, email: firebaseUser.email }));
                    }
                } catch (e) {
                    console.error("Error fetching user profile", e);
                }
            } else {
                setUserData(null);
                localStorage.removeItem('servicebid_current_session_user');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem('servicebid_current_session_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, userData }}>
            {!loading && children}
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
