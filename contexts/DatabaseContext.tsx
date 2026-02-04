
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, JobRequest, Proposal, ChatMessage, JobStatus, Transaction } from '../types';
import { MOCK_CLIENT, MOCK_PRO, MOCK_JOBS, MOCK_PROPOSALS } from '../constants';
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
  getDocs
} from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { generateBaseHandle } from '../utils/userUtils';

interface DatabaseContextType {
  users: User[];
  jobs: JobRequest[];
  proposals: Proposal[];
  chats: Record<string, ChatMessage[]>;
  transactions: Transaction[];
  isLoading: boolean;
  // Actions
  registerUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  createJob: (job: JobRequest) => Promise<void>;
  updateJob: (job: JobRequest) => Promise<void>;
  createProposal: (proposal: Proposal) => Promise<void>;
  updateProposal: (proposal: Proposal) => Promise<void>;
  addChatMessage: (chatId: string, message: ChatMessage) => Promise<void>;
  updateChatMessage: (chatId: string, msgId: string, updates: Partial<ChatMessage>) => Promise<void>;
  getChatMessages: (chatId: string) => ChatMessage[];
  loginUser: (email: string, pass: string) => Promise<User | null>;
  createStaff: (bossId: string, staffData: Partial<User>) => Promise<void>;
  getStaffMembers: (bossId: string) => User[];
  deleteUser: (userId: string) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;

  addTransaction: (tx: Transaction) => Promise<void>;
  followUser: (currentUserId: string, targetUserId: string) => Promise<void>;
  unfollowUser: (currentUserId: string, targetUserId: string) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Real-time Subscriptions ---

  useEffect(() => {
    // Users Subscription
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

      // If no users exist, seed initial mocks for demo (optional, remove for prod)
      if (usersList.length === 0) {
        // We could seed here, but for now let's just use what's in DB
      }
      setUsers(usersList);
    });

    // Jobs Subscription
    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const jobsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobRequest));
      setJobs(jobsList);
    });

    // Proposals Subscription
    const unsubProposals = onSnapshot(collection(db, 'proposals'), (snapshot) => {
      const proposalsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal));
      setProposals(proposalsList);
    });

    // Chats Subscription (this might be too heavy for ALL chats, but okay for MVP)
    const unsubChats = onSnapshot(collection(db, 'chats'), (snapshot) => {
      // This is tricky because we structure chats as Record<string, ChatMessage[]>
      // Ideally we fetch chats on demand or subscribe to user's chats
      // For MVP, let's fetch messages for active chats
    });

    // Transactions Subscription
    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const txList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txList);
    });

    setIsLoading(false);

    return () => {
      unsubUsers();
      unsubJobs();
      unsubProposals();
      unsubChats();
      unsubTransactions();
    };
  }, []);

  // --- Actions ---


  // ... (previous code)

  // --- Actions ---

  const registerUser = async (user: User) => {
    // 1. Generate Handle if missing
    let finalUser = { ...user };
    if (!finalUser.username) {
      let baseHandle = generateBaseHandle(finalUser.name);
      // Simple uniqueness check could be done here or relied on Rules/Next Update
      // For MVP: append random digits if needed, or just set it.
      // We'll trust the user to change it later if they want specific.
      // But let's add 4 digits to be safe by default
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      finalUser.username = `@${baseHandle}${randomSuffix}`;
      finalUser.username_lower = finalUser.username.toLowerCase();
    }

    // Initialize social arrays
    finalUser.followers = [];
    finalUser.following = [];

    // Use setDoc with user.id to keep consistency if auth uid is used
    await setDoc(doc(db, 'users', finalUser.id), finalUser);
  };

  const updateUser = async (updatedUser: User) => {
    // Update lowercase handle if username changes
    if (updatedUser.username) {
      updatedUser.username_lower = updatedUser.username.toLowerCase();
    }
    await updateDoc(doc(db, 'users', updatedUser.id), { ...updatedUser });
  };

  const followUser = async (currentUserId: string, targetUserId: string) => {
    if (!currentUserId || !targetUserId) return;

    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    // Update Current User (Following)
    const currentUserDoc = users.find(u => u.id === currentUserId);
    const newFollowing = [...(currentUserDoc?.following || [])];
    if (!newFollowing.includes(targetUserId)) newFollowing.push(targetUserId);

    // Update Target User (Followers)
    const targetUserDoc = users.find(u => u.id === targetUserId);
    const newFollowers = [...(targetUserDoc?.followers || [])];
    if (!newFollowers.includes(currentUserId)) newFollowers.push(currentUserId);

    await updateDoc(currentUserRef, { following: newFollowing });
    await updateDoc(targetUserRef, { followers: newFollowers });
  };

  const unfollowUser = async (currentUserId: string, targetUserId: string) => {
    if (!currentUserId || !targetUserId) return;

    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    // Update Current User (Following)
    const currentUserDoc = users.find(u => u.id === currentUserId);
    const newFollowing = (currentUserDoc?.following || []).filter(id => id !== targetUserId);

    // Update Target User (Followers)
    const targetUserDoc = users.find(u => u.id === targetUserId);
    const newFollowers = (targetUserDoc?.followers || []).filter(id => id !== currentUserId);

    await updateDoc(currentUserRef, { following: newFollowing });
    await updateDoc(targetUserRef, { followers: newFollowers });
  };

  const deleteUser = async (userId: string) => {
    await deleteDoc(doc(db, 'users', userId));
  };

  // ... (rest of code)

  const loginUser = async (email: string, pass: string): Promise<User | null> => {
    // In real app, use firebase/auth
    // Here we query Firestore for the email (INSECURE for password, but matches request scope)
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const user = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User;

    // Employee Check: Must be active
    if (user.role === 'EMPLOYEE' && user.isActive === false) return null;

    // Simple password check (Mock logic migrated)
    if (user.password) {
      return user.password === pass ? user : null;
    }
    return pass === 'password123' ? user : null;
  };

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

  const addTransaction = async (tx: Transaction) => {
    await setDoc(doc(db, 'transactions', tx.id), tx);
  };

  return (
    <DatabaseContext.Provider value={{
      users,
      jobs,
      proposals,
      chats,
      transactions,
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
      loginUser,
      createStaff,
      getStaffMembers,
      deleteUser,
      deleteJob: async (jobId: string) => {
        await deleteDoc(doc(db, 'jobs', jobId));
      },
      addTransaction
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
