
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, JobRequest, Proposal, ChatMessage, JobStatus, Transaction, Role, Product, SystemConfig, MonetizationConfig, PartnerIntegration } from '../types';
import { notifyProNewRequest, notifyClientJobDone } from '../services/notificationService';

// ... inside component ...
import { MOCK_CLIENT, MOCK_PRO, MOCK_JOBS, MOCK_PROPOSALS, MOCK_EMPLOYEE, MOCK_REVIEWS } from '../constants';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  setDoc,
  deleteDoc,
  Timestamp,
  getDocs,
  arrayUnion,
  arrayRemove,
  or
} from 'firebase/firestore';
import { db, auth, firebaseConfig } from '../src/lib/firebase';
import { withSnapshotRetry } from '../src/lib/firestoreRetry';
import { onAuthStateChanged, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { generateBaseHandle } from '@/utils/userUtils';
import { logger } from '../src/services/loggerService';

interface DatabaseContextType {
  users: User[];
  jobs: JobRequest[];
  proposals: Proposal[];
  chats: Record<string, ChatMessage[]>;
  transactions: Transaction[];
  followingIds: string[]; // Added
  isLoading: boolean;
  currentUser: User | null;
  // Actions
  registerUser: (user: User) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  createJob: (job: JobRequest) => Promise<void>;
  updateJob: (job: JobRequest) => Promise<void>;
  createProposal: (proposal: Proposal) => Promise<void>;
  updateProposal: (proposal: Proposal) => Promise<void>;
  addChatMessage: (chatId: string, message: ChatMessage) => Promise<void>;
  updateChatMessage: (chatId: string, msgId: string, updates: Partial<ChatMessage>) => Promise<void>;
  getChatMessages: (chatId: string) => ChatMessage[];
  createStaff: (bossId: string, staffData: Partial<User>) => Promise<void>;
  getStaffMembers: (bossId: string) => User[];
  deleteUser: (userId: string) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;

  addTransaction: (tx: Transaction) => Promise<void>;
  followUser: (currentUserId: string, targetUserId: string) => Promise<void>;
  unfollowUser: (currentUserId: string, targetUserId: string) => Promise<void>;
  createEmployee: (employeeData: User, password: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
  // STORE
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  // CONFIG
  systemConfig: SystemConfig | null;
  updateSystemConfig: (data: Partial<MonetizationConfig>) => Promise<void>;
  addPartner: (partner: PartnerIntegration) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Real-time Subscriptions ---

  useEffect(() => {
    let unsubUsers: any;
    let unsubFollows: any;
    let unsubJobs: any;
    let unsubProposals: any;
    let unsubChats: any;
    let unsubTransactions: any;
    let unsubProducts: any;
    let unsubMonetization: any;
    let unsubPartners: any;

    const setupSubscriptions = (isAuth: boolean) => {
      // Clean up previous if any
      unsubUsers && unsubUsers();
      unsubJobs && unsubJobs();
      unsubProposals && unsubProposals();
      unsubChats && unsubChats();
      unsubTransactions && unsubTransactions();
      unsubProducts && unsubProducts();
      unsubMonetization && unsubMonetization();
      unsubPartners && unsubPartners();

      logger.info('DB_SETUP', `Setting up subscriptions, isAuth: ${isAuth}`);
      if (!isAuth) {
        logger.info('DB_SETUP', 'Not authenticated, skipping subscriptions');
        setIsLoading(false);
        return;
      }

      logger.info('DB_SETUP', 'Authenticated, starting subscriptions');
      // Users Subscription with Retry Logic
      unsubUsers = withSnapshotRetry(
        collection(db, 'users'),
        (snapshot) => {
          logger.info('DB_USERS', `Snapshot received, size: ${snapshot.size}`);
          const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
          setUsers(usersList);

          // Update currentUser if it's among the loaded users
          if (auth.currentUser) {
            const u = usersList.find(user => user.id === auth.currentUser?.uid);
            if (u) setCurrentUser(u);
          }
        },
        (err) => {
          logger.error("DB_SUB_USERS", err.message);
          console.error('[DB] Users subscription error, retry logic will handle reconnection:', err);
        },
        { maxRetries: 5, initialDelay: 2000, maxDelay: 30000 } // More aggressive retry for critical data
      );

      // Jobs Subscription
      // Jobs Subscription (Safe Query)
      const jobsQuery = query(
        collection(db, 'jobs'),
        or(
          where('clientId', '==', auth.currentUser?.uid || 'guest'),
          where('status', '==', 'OPEN')
        )
      );

      unsubJobs = onSnapshot(jobsQuery, (snapshot) => {
        const jobsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobRequest));
        setJobs(jobsList);
      }, (err) => {
        logger.error('DB_JOBS', err.message);
        // Fallback: If 'or' query fails (e.g. requires index), try just fetching own jobs
        if (err.code === 'failed-precondition' || err.code === 'permission-denied') {
          logger.warn('DB_JOBS_FALLBACK', `Using fallback query for jobs, code: ${err.code}`);
          if (unsubJobs) unsubJobs(); // Properly cleanup before creating new subscription
          const fallbackQuery = query(collection(db, 'jobs'), where('clientId', '==', auth.currentUser?.uid));
          unsubJobs = onSnapshot(fallbackQuery, (sn) => {
            const list = sn.docs.map(d => ({ id: d.id, ...d.data() } as JobRequest));
            setJobs(list);
          });
        }
      });

      // Proposals Subscription with Retry Logic (query filtered by user)
      const proposalsQuery = query(
        collection(db, 'proposals'),
        where('proId', '==', auth.currentUser?.uid || 'guest')
      );
      unsubProposals = withSnapshotRetry(
        proposalsQuery,
        (snapshot) => {
          const proposalsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal));
          setProposals(proposalsList);
        },
        (err) => console.error('[DB] Proposals subscription error, will retry:', err),
        { maxRetries: 3 }
      );

      // Transactions Subscription (query filtered by user)
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', auth.currentUser?.uid || 'guest')
      );
      unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
        const txList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setTransactions(txList);
      }, (err) => logger.info('DB_TRANSACTIONS', `Subscription restricted: ${err.message}`));

      // Products Subscription with Retry Logic
      unsubProducts = withSnapshotRetry(
        collection(db, 'products'),
        (snapshot) => {
          const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setProducts(productList);
        },
        (err) => console.error('[DB] Products subscription error, will retry:', err),
        { maxRetries: 3, initialDelay: 1500 }
      );

      // System Config Subscriptions
      const monetizationDoc = doc(db, 'system_config', 'monetization');
      unsubMonetization = onSnapshot(monetizationDoc, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as MonetizationConfig;
          setSystemConfig(prev => ({
            monetization: data,
            partners: prev?.partners || []
          }));
        }
      });

      const partnersDoc = doc(db, 'system_config', 'partners');
      unsubPartners = onSnapshot(partnersDoc, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as { list: PartnerIntegration[] };
          setSystemConfig(prev => ({
            monetization: prev?.monetization || { docId: 'monetization', commissionRateDefault: 15, subscriptionPlans: [], boostPlans: [] },
            partners: data.list || []
          }));
        }
      });

      // Follows Subscription (My Follows)
      const followsQuery = query(collection(db, 'follows'), where('followerId', '==', auth.currentUser?.uid));
      unsubFollows = onSnapshot(followsQuery, (snapshot) => {
        const ids = snapshot.docs.map(doc => doc.data().targetId || doc.data().followingId);
        setFollowingIds(ids);
      }, (err) => console.log("Follows subscription error", err));

      setIsLoading(false);
    };

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setupSubscriptions(!!user);
    });

    return () => {
      unsubAuth();
      unsubUsers && unsubUsers();
      unsubJobs && unsubJobs();
      unsubProposals && unsubProposals();
      unsubChats && unsubChats();
      unsubTransactions && unsubTransactions();
      unsubFollows && unsubFollows();
      unsubProducts && unsubProducts();
      unsubMonetization && unsubMonetization();
      unsubPartners && unsubPartners();
    };
  }, []);

  // --- Actions ---


  // ... (previous code)

  // --- Actions ---

  const resetDatabase = async () => {
    setIsLoading(true);
    try {
      const { seedService } = await import('../src/services/seedService');
      await seedService.resetDatabase();
      // Reload users to reflect changes
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    } catch (error) {
      console.error("Reset Failed:", error);
      alert("Reset Failed! Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (user: User) => {
    // 1. Generate Handle if missing
    let finalUser = { ...user };
    if (!finalUser.username) {
      let baseHandle = await generateBaseHandle(finalUser.name);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      finalUser.username = `@${baseHandle}${randomSuffix}`;
      finalUser.username_lower = (finalUser.username || '').toLowerCase();
    }

    // Initialize social arrays
    finalUser.followers = [];
    finalUser.following = [];

    // Use setDoc with user.id to keep consistency if auth uid is used
    await setDoc(doc(db, 'users', finalUser.id), finalUser);
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    // Update lowercase handle if username changes
    if (updates.username) {
      updates.username_lower = (updates.username || '').toLowerCase();
    }
    await setDoc(doc(db, 'users', userId), updates, { merge: true });
  };

  const followUser = async (currentUserId: string, targetUserId: string) => {
    if (!currentUserId || !targetUserId) return;

    // Composite ID: followerId_targetId
    const followId = `${currentUserId}_${targetUserId}`;
    const followRef = doc(db, 'follows', followId);

    await setDoc(followRef, {
      followerId: currentUserId,
      followingId: targetUserId,
      createdAt: new Date().toISOString() // serverTimestamp is better but Date string is safer for simple clients
    });
  };

  const unfollowUser = async (currentUserId: string, targetUserId: string) => {
    if (!currentUserId || !targetUserId) return;

    const followId = `${currentUserId}_${targetUserId}`;
    const followRef = doc(db, 'follows', followId);

    await deleteDoc(followRef);
  };

  const deleteUser = async (userId: string) => {
    await deleteDoc(doc(db, 'users', userId));
  };

  // ... (rest of code)


  const createJob = async (job: JobRequest) => {
    // Ensure ID is set
    const jobRef = doc(db, 'jobs', job.id);
    await setDoc(jobRef, job);
  };

  const updateJob = async (updatedJob: JobRequest) => {
    await updateDoc(doc(db, 'jobs', updatedJob.id), { ...updatedJob });
  };

  const createProposal = async (proposal: Proposal) => {
    await setDoc(doc(db, 'proposals', proposal.id), proposal);

    // Update Job Proposal Count
    // Ideally use a Cloud Function or Transaction
    const job = jobs.find(j => j.id === proposal.jobId);
    if (job) {
      await updateDoc(doc(db, 'jobs', job.id), {
        proposalsCount: (job.proposalsCount || 0) + 1
      });
    }
  };

  const updateProposal = async (updatedProposal: Proposal) => {
    await updateDoc(doc(db, 'proposals', updatedProposal.id), { ...updatedProposal });
  };

  const addChatMessage = async (chatId: string, message: ChatMessage) => {
    // Store message in subcollection: chats/{chatId}/messages/{msgId}
    const msgRef = doc(db, 'chats', chatId, 'messages', message.id);
    await setDoc(msgRef, message);

    // Also update parent chat document for "Last Message" if needed
    await setDoc(doc(db, 'chats', chatId), {
      lastMessage: message,
      updatedAt: message.timestamp,
      participants: [message.senderId] // You'd want to add receiver too
    }, { merge: true });

    // Local Update for immediate UI feedback (subscription will catch up)
    setChats(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message]
    }));
  };

  const updateChatMessage = async (chatId: string, msgId: string, updates: Partial<ChatMessage>) => {
    await updateDoc(doc(db, 'chats', chatId, 'messages', msgId), updates);
  };

  const getChatMessages = (chatId: string) => {
    // This needs to be real-time
    // For now, we rely on a separate useEffect to subscribe to active chat
    return chats[chatId] || [];
  };

  // Effect to subscribe to messages for known chats
  // REMOVED: Faulty global chat subscription. Subscriptions moved to ChatScreen.
  /*
  useEffect(() => {
    const q = query(collection(db, 'chats'));
    const ip = onSnapshot(q, (snapshot) => {
      // ... (Removed recursive logic)
    });
    return () => ip();
  }, []); 
  */


  const createStaff = async (bossId: string, staffData: Partial<User>) => {
    const boss = users.find(u => u.id === bossId);
    if (!boss) return;

    const newUser: User = {
      ...staffData,
      id: staffData.id || `staff-${Date.now()}`,
      role: 'EMPLOYEE',
      companyId: bossId,
      isActive: true,
      avatar: staffData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffData.name}`,
      languages: staffData.languages || boss.languages,
      addresses: [],
      companyDetails: boss.companyDetails
    } as User;

    await setDoc(doc(db, 'users', newUser.id), newUser);
  };

  const getStaffMembers = (bossId: string) => {
    // sync logic is fine since `users` is synced
    return users.filter(u => u.companyId === bossId && u.role === 'EMPLOYEE');
  };

  // --- EMPLOYEE CREATION (SECONDARY APP) ---
  const createEmployee = async (employeeData: User, password: string) => {
    // 1. Initialize secondary app to avoid logging out the current admin
    const secondaryApp = initializeApp(firebaseConfig, "Secondary");
    const secondaryAuth = getAuth(secondaryApp);

    try {
      // 2. Create Authentication User
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, employeeData.email, password);
      const newUser = userCredential.user;

      // 3. Prepare Firestore Data
      // Ensure critical fields are set
      const finalUserData: User = {
        ...employeeData,
        id: newUser.uid,
        companyId: auth.currentUser?.uid, // Link to Admin
        role: (employeeData.role as Role) || 'TECHNICIAN', // System Role
        jobTitle: employeeData.jobTitle || employeeData.role || 'Technician', // Display Role
        isEmployee: true,
        isActive: true, // Default Active Status
        joinedDate: new Date().toISOString(),
        isVerified: true, // Internal employees are verified by Admin
        rating: 5.0,
        reviewsCount: 0,
        xp: 0,
        level: 'Novice'
      };

      // 4. Save to Firestore
      await setDoc(doc(db, 'users', newUser.uid), finalUserData);

      console.log(`[DB] Employee ${finalUserData.email} created successfully with ID ${newUser.uid}`);

      // 5. Cleanup
      await signOut(secondaryAuth);
    } catch (error) {
      logger.error("DB_CREATE_EMPLOYEE", "Error creating employee", error instanceof Error ? error.message : "Unknown error");
      throw error;
    } finally {
      // Always delete the secondary app
      await deleteApp(secondaryApp);
    }
  };

  const addTransaction = async (tx: Transaction) => {
    await setDoc(doc(db, 'transactions', tx.id), tx);
  };

  // --- STORE ACTIONS ---
  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newRef = doc(collection(db, 'products'));
    await setDoc(newRef, { ...product, id: newRef.id });
    return newRef.id;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await updateDoc(doc(db, 'products', id), updates);
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
  };

  // --- CONFIG ACTIONS ---
  const updateSystemConfig = async (data: Partial<MonetizationConfig>) => {
    await setDoc(doc(db, 'system_config', 'monetization'), data, { merge: true });
  };

  const addPartner = async (partner: PartnerIntegration) => {
    // For now, simpler implementation: could be a subcollection or array in a doc
    // Let's assume we manage it locally or in a 'partners' collection later.
    // For this task, we will just log or simulate save since backend structure for partners wasn't explicitly strictly defined as collection vs doc.
    // We will assume 'system_config/partners' doc with an array 'list'.
    const partnersDoc = doc(db, 'system_config', 'partners');
    await setDoc(partnersDoc, {
      list: arrayUnion(partner)
    }, { merge: true });
  };



  return (
    <DatabaseContext.Provider value={{
      users,
      jobs,
      proposals,
      chats,
      transactions,
      products,
      systemConfig,
      currentUser,
      followingIds, // Added
      isLoading,
      registerUser,
      updateUser,
      createJob,
      updateJob,
      createProposal,
      updateProposal,
      addChatMessage,
      updateChatMessage,
      getChatMessages,
      createStaff,
      getStaffMembers,
      deleteUser,
      deleteJob: async (jobId: string) => {
        await deleteDoc(doc(db, 'jobs', jobId));
      },
      addTransaction,
      createEmployee,
      followUser,
      unfollowUser,
      addProduct,
      updateProduct,
      deleteProduct,
      updateSystemConfig,
      addPartner,
      resetDatabase
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
