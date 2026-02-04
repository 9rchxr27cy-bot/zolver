import React from 'react';
import { Home, ShoppingBag, MessageCircle, Compass, CreditCard, User as UserIcon } from 'lucide-react';
import { DashboardView } from '../screens/ClientScreens';
import { IncomingOrderAlert } from './orders/IncomingOrderAlert';

interface DashboardLayoutProps {
    children: React.ReactNode;
    currentView: DashboardView;
    onViewChange: (view: DashboardView) => void;
    onStoreClick: () => void;
    onHomeClick: () => void;
    onProfileClick: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    currentView,
    onViewChange,
    onStoreClick,
    onHomeClick,
    onProfileClick
}) => {
    const handleNavClick = (view: DashboardView) => onViewChange(view);

    return (
        <>
            <IncomingOrderAlert />
            {children}
        </>
    );
};
