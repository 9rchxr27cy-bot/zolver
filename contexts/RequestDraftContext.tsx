import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JobRequest } from '../types';

interface DraftData {
    category?: string;
    title?: string;
    description?: string;
    location?: string;
    urgency?: 'ASAP' | 'THIS_WEEK' | 'PLANNING' | 'SPECIFIC_DATE';
    scheduledDate?: string;
    photos?: string[];
    suggestedPrice?: string;
    addressDetails?: any;
}

interface RequestDraftContextType {
    draft: DraftData | null;
    saveDraft: (data: DraftData) => void;
    clearDraft: () => void;
    hasDraft: boolean;
}

const RequestDraftContext = createContext<RequestDraftContextType | undefined>(undefined);

export const RequestDraftProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [draft, setDraft] = useState<DraftData | null>(null);

    // Load from sessionStorage on mount
    useEffect(() => {
        const saved = sessionStorage.getItem('zolver_request_draft');
        if (saved) {
            try {
                setDraft(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
    }, []);

    const saveDraft = (data: DraftData) => {
        setDraft(data);
        sessionStorage.setItem('zolver_request_draft', JSON.stringify(data));
    };

    const clearDraft = () => {
        setDraft(null);
        sessionStorage.removeItem('zolver_request_draft');
    };

    return (
        <RequestDraftContext.Provider value={{ draft, saveDraft, clearDraft, hasDraft: !!draft }}>
            {children}
        </RequestDraftContext.Provider>
    );
};

export const useRequestDraft = () => {
    const context = useContext(RequestDraftContext);
    if (!context) {
        throw new Error('useRequestDraft must be used within a RequestDraftProvider');
    }
    return context;
};
