
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, JobRequest, Proposal, ChatMessage, JobStatus, Transaction } from '../types';
import { MOCK_CLIENT, MOCK_PRO, MOCK_JOBS, MOCK_PROPOSALS, MOCK_EMPLOYEE } from '../constants';

interface DatabaseContextType {
  users: User[];
  jobs: JobRequest[];
  proposals: Proposal[];
  chats: Record<string, ChatMessage[]>;
  transactions: Transaction[]; // NEW: Global Transactions State
  // Actions
  registerUser: (user: User) => void;
  updateUser: (user: User) => void;
  createJob: (job: JobRequest) => void;
  updateJob: (job: JobRequest) => void;
  createProposal: (proposal: Proposal) => void;
  updateProposal: (proposal: Proposal) => void;
  addChatMessage: (chatId: string, message: ChatMessage) => void;
  updateChatMessage: (chatId: string, msgId: string, updates: Partial<ChatMessage>) => void;
  getChatMessages: (chatId: string) => ChatMessage[];
  loginUser: (email: string, pass: string) => User | null;
  createStaff: (bossId: string, staffData: Partial<User>) => void;
  getStaffMembers: (bossId: string) => User[];
  deleteUser: (userId: string) => void;
  addTransaction: (tx: Transaction) => void; // NEW Action
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage or Fallback to Mocks
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sb_users');
    return saved ? JSON.parse(saved) : [MOCK_CLIENT, MOCK_PRO, MOCK_EMPLOYEE];
  });

  const [jobs, setJobs] = useState<JobRequest[]>(() => {
    const saved = localStorage.getItem('sb_jobs');
    return saved ? JSON.parse(saved) : MOCK_JOBS;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('sb_proposals');
    return saved ? JSON.parse(saved) : MOCK_PROPOSALS;
  });

  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('sb_chats');
    return saved ? JSON.parse(saved) : {};
  });

  // NEW: Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sb_transactions');
    // Default mock transactions if empty
    return saved ? JSON.parse(saved) : [
        { id: 'exp-1', date: new Date(Date.now() - 86400000).toISOString(), description: 'ServiceBid Commission (5%)', amount: 25.00, type: 'DEBIT', status: 'COMPLETED', category: 'Platform Fees' },
        { id: 'exp-2', date: new Date(Date.now() - 172800000).toISOString(), description: 'Shell Station - Fuel', amount: 65.50, type: 'DEBIT', status: 'COMPLETED', category: 'Fuel / Transport', paymentMethod: 'CARD' },
        { id: 'exp-3', date: new Date(Date.now() - 400000000).toISOString(), description: 'Hornbach - Cabling', amount: 120.00, type: 'DEBIT', status: 'COMPLETED', category: 'Materials / Stock', paymentMethod: 'CARD' },
        { id: 'exp-4', date: new Date(Date.now() - 500000000).toISOString(), description: 'Foyer Insurance Quarterly', amount: 450.00, type: 'DEBIT', status: 'COMPLETED', category: 'Insurance', paymentMethod: 'TRANSFER' },
        { id: 'exp-5', date: new Date(Date.now() - 600000000).toISOString(), description: 'Office Rent - July', amount: 800.00, type: 'DEBIT', status: 'COMPLETED', category: 'Rent / Office', paymentMethod: 'TRANSFER' },
    ];
  });

  // Persistence Effects
  useEffect(() => localStorage.setItem('sb_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('sb_jobs', JSON.stringify(jobs)), [jobs]);
  useEffect(() => localStorage.setItem('sb_proposals', JSON.stringify(proposals)), [proposals]);
  useEffect(() => localStorage.setItem('sb_chats', JSON.stringify(chats)), [chats]);
  useEffect(() => localStorage.setItem('sb_transactions', JSON.stringify(transactions)), [transactions]);

  // Actions
  const registerUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const deleteUser = (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const loginUser = (email: string, pass: string): User | null => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) return null;
    
    // Employee Check: Must be active
    if (user.role === 'EMPLOYEE' && user.isActive === false) return null;

    // Password Check
    // 1. If user has a specific password set (e.g. created via Team Management or Sign Up), use it.
    if (user.password) {
        return user.password === pass ? user : null;
    } 
    
    // 2. Fallback for Demo Users or incomplete profiles
    return pass === 'password123' ? user : null;
  };

  const createJob = (job: JobRequest) => {
    setJobs(prev => [job, ...prev]);
  };

  const updateJob = (updatedJob: JobRequest) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const createProposal = (proposal: Proposal) => {
    setProposals(prev => [proposal, ...prev]);
    setJobs(prev => prev.map(j => 
        j.id === proposal.jobId 
        ? { ...j, proposalsCount: (j.proposalsCount || 0) + 1 } 
        : j
    ));
  };

  const updateProposal = (updatedProposal: Proposal) => {
    setProposals(prev => prev.map(p => p.id === updatedProposal.id ? updatedProposal : p));
  };

  const addChatMessage = (chatId: string, message: ChatMessage) => {
    setChats(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), message]
    }));
  };

  const updateChatMessage = (chatId: string, msgId: string, updates: Partial<ChatMessage>) => {
    setChats(prev => {
        const chatMsgs = prev[chatId] || [];
        const updatedMsgs = chatMsgs.map(m => m.id === msgId ? { ...m, ...updates } : m);
        return { ...prev, [chatId]: updatedMsgs };
    });
  };

  const getChatMessages = (chatId: string) => {
      return chats[chatId] || [];
  };

  const createStaff = (bossId: string, staffData: Partial<User>) => {
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
      
      setUsers(prev => [...prev, newUser]);
  };

  const getStaffMembers = (bossId: string) => {
      return users.filter(u => u.companyId === bossId && u.role === 'EMPLOYEE');
  };

  const addTransaction = (tx: Transaction) => {
      setTransactions(prev => [tx, ...prev]);
  };

  return (
    <DatabaseContext.Provider value={{
      users,
      jobs,
      proposals,
      chats,
      transactions, // Exported
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
      addTransaction // Exported
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
