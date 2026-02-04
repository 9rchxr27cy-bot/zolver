
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User as UserIcon,
    UserPlus,
    UserMinus,
    Plus,
    Trash2,
    MapPin,
    ShieldCheck,
    Camera,
    ChevronRight,
    Globe,
    Check,
    Info,
    Car,
    ArrowUpCircle,
    Loader2,
    Building,
    Grid,
    LayoutDashboard,
    Building2,
    FileBadge,
    Landmark,
    Copy,
    ExternalLink,
    MessageCircle,
    Eye,
    Smartphone,
    CreditCard,
    Crown,
    Clock,
    Ban,
    Unlock,
    Palette,
    LayoutTemplate,
    MessageSquare,
    Zap,
    FileText,
    Edit3,
    Bot,
    Users,
    TrendingUp,
    Receipt,
    Briefcase,
    BadgeEuro,
    RefreshCw,
    BadgeCheck,
    CheckCircle,
    LogOut
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { addDoc, collection, query, where, getDocs, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';
import { AddressAutocomplete, AddressFormData } from '../components/AddressAutocomplete';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Card } from '../components/ui';
import { User, LanguageCode, AutoReplyTemplate } from '../types';
import { profileSchema, ProfileFormData } from '../utils/validation';
import { useLanguage } from '../contexts/LanguageContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { useLuxAddress } from '../hooks/useLuxAddress';
import { InstaPortfolio } from '../components/InstaPortfolio';

interface ProfileScreenProps {
    user: User;
    onBack: () => void;
    onUpdate: (data: Partial<User>) => void;
}

type Tab = 'personal' | 'company' | 'address' | 'security' | 'portfolio' | 'website' | 'chat_settings' | 'team' | 'finance' | 'verification';

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all shrink-0 md:w-full ${active
            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
            : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
    >
        {icon}
        <span className="whitespace-nowrap">{label}</span>
    </button>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onBack, onUpdate }) => {
    const { t, language } = useLanguage();
    const { resetDatabase } = useDatabase();
    const [activeTab, setActiveTab] = useState<Tab>('personal');
    const [isSaving, setIsSaving] = useState(false);

    // --- WEBSITE STATE ---
    const [isSiteOnline, setIsSiteOnline] = useState(true);
    const [siteTheme, setSiteTheme] = useState(user.websiteTheme || 'modern');
    const [siteColor, setSiteColor] = useState(user.primaryColor || 'orange');
    const [linkCopied, setLinkCopied] = useState(false);

    // --- RICH CONTENT STATE (PROFILE 2.0) ---
    const [videoUrl, setVideoUrl] = useState(user.videoUrl || '');
    const [serviceRadius, setServiceRadius] = useState(user.serviceRadius || 25);
    const [expertTips, setExpertTips] = useState<{ title: string, content: string }[]>(user.expertTips || [
        { title: '', content: '' }
    ]);

    // --- VISUAL IDENTITY STATE ---
    const [coverImage, setCoverImage] = useState(user.coverImage || '');
    const [avatar, setAvatar] = useState(user.avatar || '');
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);

    // --- VERIFICATION STATE ---
    const [verificationStatus, setVerificationStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NONE');
    const [idDoc, setIdDoc] = useState('');
    const [bizDoc, setBizDoc] = useState('');

    useEffect(() => {
        if (user.isVerified) {
            setVerificationStatus('APPROVED');
            return;
        }

        // Check for pending request
        const checkPending = async () => {
            try {
                const q = query(
                    collection(db, 'verification_requests'),
                    where('userId', '==', user.id),
                    orderBy('createdAt', 'desc'),
                    limit(1)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
                    if (data.status === 'PENDING') {
                        setVerificationStatus('PENDING');
                    } else if (data.status === 'REJECTED') {
                        setVerificationStatus('REJECTED');
                    }
                }
            } catch (err) {
                console.error("Error checking verification status", err);
            }
        };
        checkPending();
    }, [user.id, user.isVerified]);

    const handleRequestVerification = async () => {
        if (!idDoc || !bizDoc) return;
        setIsSaving(true);
        try {
            await addDoc(collection(db, 'verification_requests'), {
                userId: user.id,
                userEmail: user.email,
                userName: user.name,
                idDocumentUrl: idDoc,
                businessRegisterUrl: bizDoc,
                status: 'PENDING',
                createdAt: serverTimestamp()
            });
            setVerificationStatus('PENDING');
        } catch (err) {
            console.error("Error submitting verification", err);
        } finally {
            setIsSaving(false);
        }
    };

    // --- SMART REPLY STATE ---
    const [autoReplyEnabled, setAutoReplyEnabled] = useState(user.autoReplyConfig?.enabled || false);
    const [replyDelay, setReplyDelay] = useState(user.autoReplyConfig?.delay || 0);
    const [replyTemplate, setReplyTemplate] = useState<AutoReplyTemplate>(user.autoReplyConfig?.template || 'DATA');
    const [customReplyMessage, setCustomReplyMessage] = useState(user.autoReplyConfig?.customMessage || '');

    // --- ADDRESS MANAGEMENT STATE ---
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

    const defaultFirstName = user.name.split(' ')[0];
    const defaultLastName = user.name.split(' ').slice(1).join(' ') || user.surname || '';

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
        getValues,
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: defaultFirstName,
            lastName: defaultLastName,
            email: user.email,
            phone: user.phone || '',
            languages: user.languages,
            postalCode: user.addresses?.[0]?.postalCode || '',
            locality: user.addresses?.[0]?.locality || '',
            street: user.addresses?.[0]?.street || '',
            number: user.addresses?.[0]?.number || '',
            floor: user.addresses?.[0]?.floor || '',
            residence: user.addresses?.[0]?.residence || '',
            hasElevator: user.addresses?.[0]?.hasElevator || false,
            easyParking: user.addresses?.[0]?.easyParking || false,
        }
    });

    // Manually register fields that are managed by AddressAutocomplete
    React.useEffect(() => {
        register('street');
        register('number');
        register('postalCode');
        register('locality');
        register('floor');
        register('residence');
    }, [register]);

    const watchZip = watch('postalCode');
    const selectedLangs = watch('languages');
    const { data: luxAddr, loading: addrLoading } = useLuxAddress(watchZip);

    useEffect(() => {
        if (luxAddr?.city) {
            setValue('locality', luxAddr.city);
        }
    }, [luxAddr, setValue]);

    const languages: { code: LanguageCode, label: string }[] = [
        { code: 'LB', label: 'Lëtzebuergesch' },
        { code: 'FR', label: 'Français' },
        { code: 'DE', label: 'Deutsch' },
        { code: 'EN', label: 'English' },
        { code: 'PT', label: 'Português' },
    ];

    const handleToggleLang = (code: LanguageCode) => {
        const current = (selectedLangs as LanguageCode[]) || [];
        if (current.includes(code)) {
            setValue('languages', current.filter(c => c !== code));
        } else {
            setValue('languages', [...current, code]);
        }
    };

    // NEW: Handle saving a specific address (Add or Edit)
    const handleSaveAddress = async () => {
        const data = getValues();
        // Validation could be added here

        const newAddress = {
            id: editingAddressId || `addr-${Date.now()}`,
            label: editingAddressId ? (user.addresses?.find(a => a.id === editingAddressId)?.label || 'Alias') : 'New Address',
            street: data.street,
            number: data.number,
            postalCode: data.postalCode,
            locality: data.locality,
            floor: data.floor,
            residence: data.residence,
            hasElevator: data.hasElevator,
            easyParking: data.easyParking,
        };

        let updatedAddresses = [...(user.addresses || [])];

        if (editingAddressId) {
            // Update existing
            updatedAddresses = updatedAddresses.map(a => a.id === editingAddressId ? { ...a, ...newAddress } : a);
        } else {
            // Add new
            updatedAddresses.push(newAddress);
        }

        setIsSaving(true);
        try {
            await onUpdate({ addresses: updatedAddresses });
            setShowAddressForm(false);
            setEditingAddressId(null);
            reset(); // Clear form
        } finally {
            setIsSaving(false);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 1200));

        onUpdate({
            name: `${data.firstName} ${data.lastName}`,
            phone: data.phone,
            languages: data.languages as LanguageCode[],
            coverImage,
            avatar,
            addresses: [{
                id: user.addresses?.[0]?.id || 'addr-1',
                label: 'Principal',
                street: data.street,
                number: data.number,
                postalCode: data.postalCode,
                locality: data.locality,
                floor: data.floor,
                residence: data.residence,
                hasElevator: data.hasElevator,
                easyParking: data.easyParking,
            }]
        });
        setIsSaving(false);
    };

    // Mock handlers for company data updates
    const [companyIban, setCompanyIban] = useState(user.companyDetails?.iban || '');
    const [companyLicenseExpiry, setCompanyLicenseExpiry] = useState(user.companyDetails?.licenseExpiry || '');
    const [openingTime, setOpeningTime] = useState(user.companyDetails?.openingTime || '08:00');
    const [closingTime, setClosingTime] = useState(user.companyDetails?.closingTime || '18:00');

    const handleSaveWebsite = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 1000));

        // Filter out empty tips
        const cleanTips = expertTips.filter(t => t.title.trim() !== '');

        onUpdate({
            websiteTheme: siteTheme,
            primaryColor: siteColor,
            videoUrl: videoUrl,
            serviceRadius: serviceRadius,
            expertTips: cleanTips
        });
        setIsSaving(false);
    };

    // Working Days State
    const [workingDays, setWorkingDays] = useState<string[]>(user.companyDetails?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

    // Fake card update state
    const [fakeCardLast4, setFakeCardLast4] = useState(user.companyDetails?.cardLast4 || '4242');
    const [isChangingCard, setIsChangingCard] = useState(false);

    const handleSaveCompanyData = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 1200));
        if (user.companyDetails) {
            onUpdate({
                companyDetails: {
                    ...user.companyDetails,
                    iban: companyIban,
                    licenseExpiry: companyLicenseExpiry,
                    cardLast4: fakeCardLast4, // mock update
                    openingTime: openingTime,
                    closingTime: closingTime,
                    workingDays: workingDays // Updated
                }
            });
        }
        setIsSaving(false);
        setIsChangingCard(false);
    };

    const handleSaveChatSettings = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 800));
        onUpdate({
            autoReplyConfig: {
                enabled: autoReplyEnabled,
                delay: replyDelay,
                template: replyTemplate,
                customMessage: customReplyMessage
            }
        });
        setIsSaving(false);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/w/${user.id}`);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const shareWhatsapp = () => {
        const url = `${window.location.origin}/w/${user.id}`;
        const text = `Check out my professional website: ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleUnblock = (userId: string) => {
        const currentBlocked = user.blockedUsers || [];
        const newBlocked = currentBlocked.filter(id => id !== userId);
        onUpdate({ blockedUsers: newBlocked });
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Navigation to login should be handled by an auth listener or parent component
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const toggleDay = (dayKey: string) => {
        if (workingDays.includes(dayKey)) {
            setWorkingDays(workingDays.filter(d => d !== dayKey));
        } else {
            // Sort implies complex logic, so we just append. 
            // Ideally we would keep them sorted but for UI active state checking, order doesn't matter.
            setWorkingDays([...workingDays, dayKey]);
        }
    };

    // Day labels based on language
    const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayLabelsMap: Record<string, string[]> = {
        EN: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        PT: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
        FR: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
        DE: ['M', 'D', 'M', 'D', 'F', 'S', 'S'],
        LB: ['M', 'D', 'M', 'D', 'F', 'S', 'S']
    };
    const currentDayLabels = dayLabelsMap[language] || dayLabelsMap['EN'];

    // Visual Theme Component Helper
    const ThemePreview = ({ type, color }: { type: string, color: string }) => {
        const activeColorClass = `bg-${color}-500`;

        if (type === 'modern') {
            return (
                <div className="w-full h-16 bg-slate-50 dark:bg-slate-800 rounded-lg p-1.5 flex flex-col gap-1 overflow-hidden relative">
                    <div className={`w-full h-6 rounded-md ${activeColorClass} opacity-80`} />
                    <div className="flex gap-1">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-md" />
                        <div className="flex-1 flex flex-col gap-1">
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                            <div className="w-2/3 h-2 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                        </div>
                    </div>
                </div>
            );
        }
        if (type === 'classic') {
            return (
                <div className="w-full h-16 bg-slate-50 dark:bg-slate-800 rounded-lg p-1.5 flex flex-col gap-1 overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="w-full h-2 bg-slate-900 dark:bg-slate-600 rounded-sm mb-1" />
                    <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
                    <div className="flex gap-1 mt-1">
                        <div className="w-1/3 h-8 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                        <div className="w-2/3 flex flex-col gap-1">
                            <div className="w-full h-1.5 bg-slate-300 dark:bg-slate-600 rounded-sm" />
                            <div className="w-full h-1.5 bg-slate-300 dark:bg-slate-600 rounded-sm" />
                            <div className={`w-1/2 h-1.5 ${activeColorClass} rounded-sm`} />
                        </div>
                    </div>
                </div>
            );
        }
        if (type === 'bold') {
            return (
                <div className="w-full h-16 bg-slate-900 dark:bg-black rounded-lg p-1.5 flex flex-col gap-1 overflow-hidden">
                    <div className={`w-1/2 h-4 ${activeColorClass} rounded-sm`} />
                    <div className="w-full h-8 bg-slate-800 rounded-sm border border-slate-700" />
                </div>
            );
        }
        return ( // Minimal
            <div className="w-full h-16 bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-center gap-2 border border-slate-100 dark:border-slate-800">
                <div className={`w-8 h-8 rounded-full border-2 ${(activeColorClass || '').replace('bg-', 'border-')}`} />
                <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
        );
    };

    const TemplateOption = ({
        id,
        label,
        desc,
        icon: Icon
    }: { id: AutoReplyTemplate, label: string, desc: string, icon: any }) => (
        <div
            onClick={() => setReplyTemplate(id)}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start gap-4 ${replyTemplate === id
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
        >
            <div className={`p-2 rounded-xl shrink-0 ${replyTemplate === id ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <Icon size={20} />
            </div>
            <div>
                <h4 className={`font-bold text-sm ${replyTemplate === id ? 'text-orange-700 dark:text-orange-400' : 'text-slate-900 dark:text-white'}`}>
                    {label}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {desc}
                </p>
            </div>
            {replyTemplate === id && (
                <div className="ml-auto bg-orange-500 text-white rounded-full p-1">
                    <Check size={12} />
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950">
            <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 md:p-6 flex flex-col gap-6 md:sticky md:top-16 md:h-[calc(100vh-64px)] shrink-0">
                <button onClick={onBack} className="text-sm font-bold text-slate-500 flex items-center gap-2 hover:text-orange-500 transition-colors mb-4 md:hidden">
                    <ChevronRight className="rotate-180 w-4 h-4" /> {t.back}
                </button>

                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                    {/* Dashboard Button in Sidebar */}
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all shrink-0 md:w-full border-2 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 mb-2 md:mb-4"
                    >
                        <LayoutDashboard size={18} />
                        <span>{t.dashboard}</span>
                    </button>

                    <TabButton active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} icon={<UserIcon size={18} />} label={t.personalInfo} />
                    {user.role === 'PRO' && (
                        <>
                            <TabButton active={activeTab === 'company'} onClick={() => setActiveTab('company')} icon={<Building2 size={18} />} label={t.companyData} />
                            <TabButton active={activeTab === 'website'} onClick={() => setActiveTab('website')} icon={<Smartphone size={18} />} label={t.myWebsite} />
                            <TabButton active={activeTab === 'chat_settings'} onClick={() => setActiveTab('chat_settings')} icon={<MessageSquare size={18} />} label={t.chatSettings} />
                            <TabButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} icon={<Grid size={18} />} label="Portfolio" />
                            <TabButton active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={<Users size={18} />} label="Team" />
                            <TabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<BadgeEuro size={18} />} label="Finance" />
                            <TabButton active={activeTab === 'verification'} onClick={() => setActiveTab('verification')} icon={<BadgeCheck size={18} />} label="Verification" />
                        </>
                    )}
                    <TabButton active={activeTab === 'address'} onClick={() => setActiveTab('address')} icon={<MapPin size={18} />} label={t.addressLogistics} />
                    <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<ShieldCheck size={18} />} label={t.security} />
                </div>

                <div className="mt-auto hidden md:block">
                    <Card className="bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/50 p-4">
                        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-2">
                            <Info size={16} />
                            <span className="text-xs font-black uppercase tracking-wider">{t.logisticsNote}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t.luxNoteDesc}
                        </p>
                    </Card>
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-12 max-w-4xl mx-auto w-full mb-20 md:mb-0">
                <AnimatePresence mode="wait">

                    {/* === CHAT SETTINGS TAB (PRO ONLY - SMART REPLY) === */}
                    {activeTab === 'chat_settings' ? (
                        <motion.div key="chat_settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} {...{ className: "flex flex-col gap-8 pb-24" } as any}>
                            <header>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    {t.smartReply}
                                    <span className="bg-amber-400 text-slate-900 text-[10px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider">PRO</span>
                                </h2>
                                <p className="text-slate-500 mt-2">{t.smartReplyDesc}</p>
                            </header>

                            <Card className="p-6">
                                {/* Toggle */}
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{t.smartReply}</h3>
                                        <p className="text-xs text-slate-500">{t.enableAutoReply}</p>
                                    </div>
                                    <div
                                        onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${autoReplyEnabled ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${autoReplyEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                                    </div>
                                </div>

                                {/* Delay Selection */}
                                <div className={`space-y-6 transition-opacity duration-300 ${autoReplyEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                    <div>
                                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3 block">
                                            {t.activationTime}
                                        </label>
                                        <div className="flex gap-2">
                                            {[0, 5, 15].map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => setReplyDelay(time)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${replyDelay === time
                                                        ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                                        }`}
                                                >
                                                    {time === 0 ? t.immediate : time === 5 ? t.mins5 : t.mins15}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Templates */}
                                    <div>
                                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 block">
                                            {t.botPersonality}
                                        </label>
                                        <div className="space-y-3">
                                            <TemplateOption
                                                id="AGILITY"
                                                label={t.agilityMode}
                                                desc={t.agilityDesc}
                                                icon={Zap}
                                            />
                                            <TemplateOption
                                                id="DATA"
                                                label={t.dataMode}
                                                desc={t.dataDesc}
                                                icon={FileText}
                                            />
                                            <TemplateOption
                                                id="CUSTOM"
                                                label={t.customMode}
                                                desc={t.customDesc}
                                                icon={Edit3}
                                            />
                                        </div>
                                    </div>

                                    {/* Custom Text Area */}
                                    {replyTemplate === 'CUSTOM' && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                                            <label className="text-xs font-bold text-slate-500 mb-2 block">{t.yourMessage}</label>
                                            <textarea
                                                value={customReplyMessage}
                                                onChange={(e) => setCustomReplyMessage(e.target.value)}
                                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 outline-none text-sm h-32"
                                                placeholder={t.botMessageCustomDefault}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            </Card>

                            {/* Preview Card */}
                            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-3xl opacity-80">
                                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">{t.preview}</h4>
                                <div className="flex gap-4">
                                    <div className="relative">
                                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
                                        <div className="absolute -bottom-1 -right-1 bg-orange-500 p-0.5 rounded-full border border-white">
                                            <Bot size={10} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-slate-900 p-3 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            {replyTemplate === 'AGILITY' && t.botMessageAgility}
                                            {replyTemplate === 'DATA' && t.botMessageData}
                                            {replyTemplate === 'CUSTOM' && (customReplyMessage || t.botMessageCustomDefault)}
                                        </p>
                                        <span className="text-[10px] text-slate-400 mt-2 block flex items-center gap-1">
                                            <Bot size={10} /> {t.botMsgFooter}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                                <Button onClick={handleSaveChatSettings} isLoading={isSaving} className="px-8">{t.saveChanges}</Button>
                            </div>
                        </motion.div>
                    ) : activeTab === 'website' ? (
                        // ... (Rest of existing Website Tab code) ...
                        <motion.div key="website" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} {...{ className: "flex flex-col gap-8 pb-24" } as any}>

                            {/* Status Card */}
                            <div className={`rounded-[2rem] p-6 shadow-xl border transition-all duration-500 ${isSiteOnline ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800' : 'bg-slate-100 dark:bg-slate-950 border-transparent grayscale'}`}>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{t.siteStatus}</span>
                                        <span className={`text-lg font-black ${isSiteOnline ? 'text-orange-500' : 'text-slate-400'}`}>
                                            {isSiteOnline ? t.online : t.offline}
                                        </span>
                                    </div>
                                    <div
                                        onClick={() => setIsSiteOnline(!isSiteOnline)}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${isSiteOnline ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isSiteOnline ? 'translate-x-7' : 'translate-x-1'}`} />
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex justify-between items-center mb-4 border border-slate-100 dark:border-slate-700">
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                                        {window.location.host}/w/{user.id}
                                    </span>
                                    <button
                                        onClick={copyLink}
                                        className={`p-2 rounded-xl shadow-sm transition-all ${linkCopied ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-orange-500'}`}
                                    >
                                        {linkCopied ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>

                                <Button
                                    onClick={shareWhatsapp}
                                    // Changed from emerald to standard green for WhatsApp brand accuracy, but removed emerald dependency
                                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold h-12 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <MessageCircle size={20} /> {t.shareWhatsapp}
                                </Button>
                            </div>

                            {/* Appearance Settings */}
                            <Card className="p-6">
                                <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 mb-6">
                                    <Palette size={16} /> {t.appearance}
                                </h3>

                                <div className="mb-8">
                                    <label className="text-xs font-bold text-slate-500 mb-3 block">{t.selectTheme}</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {['Modern', 'Classic', 'Bold', 'Minimal'].map(theme => (
                                            <button
                                                key={theme}
                                                onClick={() => setSiteTheme(theme.toLowerCase() as any)}
                                                className={`relative p-2 rounded-xl border-2 transition-all flex flex-col gap-2 ${siteTheme === theme.toLowerCase()
                                                    ? `border-${siteColor}-500 ring-2 ring-${siteColor}-500/20 bg-slate-50 dark:bg-slate-900`
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                    }`}
                                            >
                                                <ThemePreview type={theme.toLowerCase()} color={siteColor} />
                                                <span className={`text-xs font-bold ${siteTheme === theme.toLowerCase() ? `text-${siteColor}-600 dark:text-${siteColor}-400` : 'text-slate-500'}`}>
                                                    {t[`theme${theme}` as keyof typeof t] || theme}
                                                </span>
                                                {siteTheme === theme.toLowerCase() && (
                                                    <div className={`absolute -top-2 -right-2 bg-${siteColor}-500 text-white p-1 rounded-full shadow-sm`}>
                                                        <Check size={10} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-3 block">{t.accentColor}</label>
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        {['orange', 'blue', 'purple', 'amber', 'rose'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setSiteColor(color)}
                                                className={`w-10 h-10 rounded-full bg-${color}-500 transition-all flex items-center justify-center relative shrink-0 ${siteColor === color ? 'ring-4 ring-slate-200 dark:ring-slate-700 scale-110 shadow-lg' : 'hover:scale-105'
                                                    }`}
                                            >
                                                {siteColor === color && <Check size={16} className="text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            {/* Preview & Info */}
                            <Card className="p-6 bg-slate-900 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <LayoutTemplate size={120} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black mb-2">{t.previewSite}</h3>
                                    <div className="flex items-center gap-2 text-orange-400 mb-6">
                                        <Info size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">{t.siteInfo}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-sm">
                                        {t.siteInfoDesc}
                                    </p>
                                    <Button
                                        variant="secondary"
                                        className="w-full h-12 gap-2"
                                        onClick={() => window.open(`/w/${user.id}`, '_blank')}
                                    >
                                        <ExternalLink size={18} /> {(t as any).visitSite || "Visit Website"}
                                    </Button>
                                </div>
                            </Card>

                            {/* --- CONTENT EDITOR (PROFILE 2.0) --- */}
                            <Card className="p-6">
                                <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 mb-6">
                                    <Zap size={16} /> Rich Content
                                </h3>

                                <div className="space-y-8">

                                    {/* Video URL */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-2 block">Video Presentation (YouTube/Vimeo)</label>
                                        <Input
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            placeholder="https://youtube.com/watch?v=..."
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Paste your video link to boost client trust.</p>
                                    </div>

                                    {/* Service Radius */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-slate-500">Service Radius</label>
                                            <span className="text-sm font-black text-orange-500">{serviceRadius} km</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="5"
                                            max="100"
                                            step="5"
                                            value={serviceRadius}
                                            onChange={(e) => setServiceRadius(parseInt(e.target.value))}
                                            className="w-full accent-orange-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">I serve clients up to {serviceRadius}km from my location.</p>
                                    </div>

                                    {/* Expert Tips */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-4 block">Expert Tips (SEO Content)</label>

                                        <div className="space-y-4">
                                            {expertTips.map((tip, index) => (
                                                <div key={index} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 relative group">
                                                    <div className="flex justify-between items-start gap-4 mb-2">
                                                        <div className="flex-1">
                                                            <input
                                                                value={tip.title}
                                                                onChange={(e) => {
                                                                    const newTips = [...expertTips];
                                                                    newTips[index].title = e.target.value;
                                                                    setExpertTips(newTips);
                                                                }}
                                                                placeholder={`Tip #${index + 1} Title`}
                                                                className="w-full bg-transparent font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-300"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const newTips = expertTips.filter((_, i) => i !== index);
                                                                setExpertTips(newTips);
                                                            }}
                                                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        value={tip.content}
                                                        onChange={(e) => {
                                                            const newTips = [...expertTips];
                                                            newTips[index].content = e.target.value;
                                                            setExpertTips(newTips);
                                                        }}
                                                        placeholder="Brief description or tip content..."
                                                        className="w-full bg-transparent text-sm text-slate-500 outline-none resize-none h-16 placeholder:text-slate-300"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {expertTips.length < 3 && (
                                            <button
                                                onClick={() => setExpertTips([...expertTips, { title: '', content: '' }])}
                                                className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:border-orange-500 hover:text-orange-500 font-bold text-sm transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={16} /> Add Expert Tip
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
                                <Button onClick={handleSaveWebsite} isLoading={isSaving} className="px-10 h-14 text-lg bg-orange-600 hover:bg-orange-700 text-white">
                                    {t.saveChanges}
                                </Button>
                            </div>
                        </motion.div>

                    ) : activeTab === 'portfolio' ? (
                        <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <header className="mb-8">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Portfolio</h2>
                                <p className="text-slate-500">Showcase your best work to clients.</p>
                            </header>
                            <InstaPortfolio />
                        </motion.div>
                    ) : activeTab === 'company' ? (
                        <motion.div key="company" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            {/* ... (Existing Company Tab Content) ... */}
                            <header className="mb-8">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{t.companyData}</h2>
                                <p className="text-slate-500">{t.companyDesc}</p>
                            </header>

                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3 mb-8">
                                <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                    {t.cantEditHelp}
                                </p>
                            </div>

                            <form onSubmit={handleSaveCompanyData} className="space-y-8">

                                {/* NEW SECTION: BUSINESS HOURS */}
                                <Card className="p-6 space-y-6">
                                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                        <Clock size={16} /> {t.businessHours}
                                    </h3>

                                    {/* Working Days Selector */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-3 block uppercase tracking-wider">{t.workingDays}</label>
                                        <div className="flex gap-2 justify-between sm:justify-start">
                                            {dayKeys.map((key, index) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => toggleDay(key)}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${workingDays.includes(key)
                                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-110'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {currentDayLabels[index]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <Input
                                            type="time"
                                            label={t.openingTime}
                                            value={openingTime}
                                            onChange={e => setOpeningTime(e.target.value)}
                                        />
                                        <Input
                                            type="time"
                                            label={t.closingTime}
                                            value={closingTime}
                                            onChange={e => setClosingTime(e.target.value)}
                                        />
                                    </div>
                                </Card>

                                {/* NEW SECTION: SUBSCRIPTION & BILLING */}
                                <Card className="p-6 space-y-6 border-l-4 border-l-amber-400">
                                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                        <Crown size={16} className="text-amber-500" /> {t.subscription}
                                    </h3>

                                    {/* Current Plan */}
                                    <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1 block">{t.currentPlan}</span>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">
                                                {user.companyDetails?.plan || 'Basic'} <span className="text-orange-500 text-xs ml-1">{t.activePlan}</span>
                                            </span>
                                        </div>
                                        <Button size="sm" variant="outline" className="text-xs">{t.upgradeBtn}</Button>
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <span className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3 block">{t.paymentCard}</span>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                <CreditCard className="text-slate-400" size={24} />
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                        •••• {fakeCardLast4}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{user.companyDetails?.cardBrand || 'Visa'} - Exp 12/28</p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    setIsChangingCard(true);
                                                    // Mock Simulate random new card
                                                    setTimeout(() => setFakeCardLast4(Math.floor(1000 + Math.random() * 9000).toString()), 500);
                                                }}
                                                variant="ghost"
                                                className="h-14 w-14 rounded-xl border-2 border-dashed border-slate-300 text-slate-400"
                                            >
                                                {isChangingCard ? <Loader2 className="animate-spin" /> : <Edit3 size={20} />}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                {/* Legal Info Card */}
                                <Card className="p-6 space-y-6">
                                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                        <Building2 size={16} /> {t.legalForm}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label={t.companyName}
                                            value={user.companyDetails?.legalName || ''}
                                            disabled
                                            className="bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-transparent"
                                        />
                                        <Input
                                            label={t.legalForm}
                                            value={user.companyDetails?.legalType?.toUpperCase() || ''}
                                            disabled
                                            className="bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-transparent"
                                        />
                                        <Input
                                            label={t.rcsNumber}
                                            value={user.companyDetails?.rcsNumber || 'N/A'}
                                            disabled
                                            className="bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-transparent"
                                        />
                                        <Input
                                            label={t.tvaNumber}
                                            value={user.companyDetails?.vatNumber || ''}
                                            disabled
                                            className="bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-transparent"
                                        />
                                    </div>
                                </Card>

                                {/* Banking */}
                                <Card className="p-6 space-y-6">
                                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                        <Landmark size={16} /> {t.banking}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        {/* Editable field */}
                                        <Input
                                            label={t.iban}
                                            value={companyIban}
                                            onChange={e => setCompanyIban(e.target.value.toUpperCase())}
                                            className="font-mono text-lg tracking-wide font-bold"
                                        />
                                    </div>
                                </Card>

                                <div className="pt-6 flex justify-end border-t border-slate-200 dark:border-slate-800">
                                    <Button type="submit" isLoading={isSaving} className="px-10 h-14 text-lg">{t.saveChanges}</Button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">

                            <AnimatePresence mode="wait">
                                {activeTab === 'personal' && (
                                    <motion.div key="personal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} {...{ className: "space-y-8" } as any}>
                                        <header className="mb-6">
                                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{t.personalInfo}</h2>
                                            <p className="text-slate-500">{t.manageIdentity}</p>
                                        </header>

                                        {/* Cover Image */}
                                        {/* Cover Image - PRO Only */}
                                        {user.role === 'PRO' && (
                                            <div className="relative w-full h-32 md:h-48 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-8 border-2 border-slate-100 dark:border-slate-800 group">
                                                {coverImage ? (
                                                    <img src={coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center flex-col gap-2 text-slate-400">
                                                        <Camera size={32} className="opacity-20" />
                                                        <span className="text-xs font-bold opacity-50 uppercase tracking-widest">Add Cover Image</span>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setCoverImage('https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')}
                                                    className="absolute top-4 right-4 p-2 bg-white/30 backdrop-blur-md border border-white/50 text-white rounded-xl hover:bg-white hover:text-orange-500 transition-all shadow-lg"
                                                >
                                                    <Camera size={20} />
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-8 mb-10 px-2">
                                            <div className="relative z-20">
                                                <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl bg-white dark:bg-slate-800 shrink-0">
                                                    {avatar ? (
                                                        <img src={avatar} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                                            <UserIcon size={40} className="text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                                                    className="absolute -bottom-2 -right-2 p-2.5 bg-orange-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-white dark:border-slate-900"
                                                >
                                                    <Camera size={16} />
                                                </button>

                                                <AnimatePresence>
                                                    {showAvatarSelector && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                            {...{ className: "absolute top-full left-0 mt-4 w-72 bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 origin-top-left" } as any}
                                                        >
                                                            <div className="flex justify-between items-center mb-3">
                                                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Avatar</h4>
                                                                <button onClick={() => setShowAvatarSelector(false)} className="text-slate-400 hover:text-slate-600"><Check size={14} /></button>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-2 mb-4">
                                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                                                    <button
                                                                        key={i}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=Professional${i}`);
                                                                            setShowAvatarSelector(false);
                                                                        }}
                                                                        className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-900 hover:ring-2 ring-orange-500 overflow-hidden transition-all hover:scale-105"
                                                                    >
                                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Professional${i}`} className="w-full h-full" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setAvatar('https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
                                                                    setShowAvatarSelector(false);
                                                                }}
                                                                className="w-full py-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-bold hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <Camera size={14} /> Upload Custom Photo
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{user.name}</h3>
                                                <p className="text-slate-500 text-sm font-medium">{user.email}</p>
                                                {user.isVerified && <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase rounded-full tracking-wide">Verified Pro</span>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="Prénom" {...register('firstName')} error={errors.firstName?.message} placeholder="Alice" />
                                            <Input label="Nom" {...register('lastName')} error={errors.lastName?.message} placeholder="Johnson" />
                                            <div className="md:col-span-2">
                                                <Input label="Numéro de Téléphone" {...register('phone')} error={errors.phone?.message} placeholder="+352 621 123 456" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black flex items-center gap-2 text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                                <Globe size={16} className="text-orange-500" /> {t.languages}
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {languages.map(lang => (
                                                    <button
                                                        key={lang.code}
                                                        type="button"
                                                        onClick={() => handleToggleLang(lang.code)}
                                                        className={`px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all flex items-center gap-2 ${(selectedLangs as string[])?.includes(lang.code)
                                                            ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                                                            }`}
                                                    >
                                                        {(selectedLangs as string[])?.includes(lang.code) && <Check size={16} />}
                                                        {lang.label}
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.languages && <p className="text-xs text-red-500 font-bold">{errors.languages.message}</p>}
                                        </div>

                                        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 mt-8">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full py-4 rounded-xl bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-black flex items-center justify-center gap-3 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all hover:scale-[1.02] active:scale-95"
                                            >
                                                <LogOut size={20} />
                                                LOG OUT
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Address Tab (Unchanged but ensuring presence) */}
                                {activeTab === 'address' && (
                                    <motion.div key="address" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} {...{ className: "space-y-8" } as any}>
                                        <header className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{t.addressLogistics}</h2>
                                                <p className="text-slate-500">{t.smartAddress}</p>
                                            </div>
                                            {!showAddressForm && (
                                                <Button type="button" onClick={() => {
                                                    reset({ ...getValues(), street: '', number: '', postalCode: '', locality: '', floor: '', residence: '' }); // Clear address fields for new entry
                                                    setShowAddressForm(true);
                                                    setEditingAddressId(null);
                                                }} size="sm" className="gap-2">
                                                    <Plus size={16} /> {t.addAddress}
                                                </Button>
                                            )}
                                        </header>

                                        {!showAddressForm ? (
                                            <div className="grid gap-4">
                                                {user.addresses?.map((addr, idx) => (
                                                    <div key={addr.id || idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between group hover:border-orange-500 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                                                                <MapPin size={20} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-900 dark:text-white capitalize">{addr.label || 'Address'}</h4>
                                                                <p className="text-sm text-slate-500">
                                                                    {addr.street} {addr.number}, {addr.postalCode} {addr.locality}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    // Load address into form
                                                                    setValue('street', addr.street);
                                                                    setValue('number', addr.number);
                                                                    setValue('postalCode', addr.postalCode);
                                                                    setValue('locality', addr.locality);
                                                                    setValue('floor', addr.floor || '');
                                                                    setValue('residence', addr.residence || '');
                                                                    setValue('hasElevator', addr.hasElevator || false);
                                                                    setValue('easyParking', addr.easyParking || false);
                                                                    setEditingAddressId(addr.id);
                                                                    setShowAddressForm(true);
                                                                }}
                                                                className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
                                                            >
                                                                <Edit3 size={18} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newAddresses = user.addresses?.filter(a => a.id !== addr.id) || [];
                                                                    onUpdate({ addresses: newAddresses });
                                                                }}
                                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!user.addresses || user.addresses.length === 0) && (
                                                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                                        <MapPin size={32} className="mx-auto text-slate-300 mb-2" />
                                                        <p className="text-slate-500 font-medium">No addresses saved yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="md:col-span-3">
                                                    <AddressAutocomplete
                                                        value={{
                                                            street: watch('street') || '',
                                                            number: watch('number') || '',
                                                            postalCode: watch('postalCode') || '',
                                                            city: watch('locality') || '',
                                                            country: 'Luxembourg',
                                                            floor: watch('floor') || '',
                                                            residence: watch('residence') || ''
                                                        }}
                                                        onChange={(newData) => {
                                                            setValue('street', newData.street);
                                                            setValue('number', newData.number);
                                                            setValue('postalCode', newData.postalCode);
                                                            setValue('locality', newData.city);
                                                            setValue('floor', newData.floor);
                                                            setValue('residence', newData.residence);
                                                        }}
                                                        showDetails={true}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Elevator & Parking Toggles */}
                                                    <div
                                                        onClick={() => setValue('hasElevator', !watch('hasElevator'))}
                                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${watch('hasElevator')
                                                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${watch('hasElevator') ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                                <ArrowUpCircle size={20} />
                                                            </div>
                                                            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{t.elevator}</span>
                                                        </div>
                                                        {watch('hasElevator') && <Check size={18} className="text-orange-500" />}
                                                    </div>

                                                    <div
                                                        onClick={() => setValue('easyParking', !watch('easyParking'))}
                                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${watch('easyParking')
                                                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${watch('easyParking') ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                                <Car size={20} />
                                                            </div>
                                                            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{t.parking}</span>
                                                        </div>
                                                        {watch('easyParking') && <Check size={18} className="text-orange-500" />}
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 pt-4">
                                                    <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)} className="flex-1">
                                                        Cancel
                                                    </Button>
                                                    <Button type="button" onClick={handleSaveAddress} className="flex-1">
                                                        {editingAddressId ? 'Update Address' : 'Save Address'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}


                                {activeTab === 'security' && (
                                    <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} {...{ className: "space-y-8" } as any}>
                                        <header>
                                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{t.security}</h2>
                                            <p className="text-slate-500">Protection de vos données bancaires et acesso.</p>
                                        </header>
                                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-6 rounded-3xl">
                                            <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2">Double Authentification</h4>
                                            <p className="text-sm text-amber-700 dark:text-amber-500 mb-4">Recommandé pour les comptes avec transactions au Luxembourg.</p>
                                            <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100">Activer le 2FA</Button>
                                        </div>

                                        {/* BLOCKED USERS SECTION */}
                                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                                <Ban size={18} className="text-red-500" /> {t.blockedUsers}
                                            </h4>

                                            {user.blockedUsers && user.blockedUsers.length > 0 ? (
                                                <div className="space-y-3">
                                                    {user.blockedUsers.map(blockedId => (
                                                        <div key={blockedId} className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                                                    <UserIcon size={14} className="text-slate-400" />
                                                                </div>
                                                                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">User ID: {blockedId.slice(0, 8)}...</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleUnblock(blockedId)}
                                                                className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                <Unlock size={12} /> {t.unblockContact}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">{t.noBlockedUsers}</p>
                                            )}
                                        </div>


                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="pt-10 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                                <p className="text-xs text-slate-400 max-w-[200px] italic">Vos données sont stockées conformément au RGPD luxembourgeois.</p>
                                <Button type="submit" isLoading={isSaving} className="px-10 h-14 text-lg">{t.saveChanges}</Button>
                            </div>
                        </form>
                    )}
                </AnimatePresence >
                {/* === TEAM TAB === */}
                {
                    activeTab === 'team' && (
                        <motion.div key="team" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} {...{ className: "space-y-8" } as any}>
                            <header>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    My Team / Équipe
                                    <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider">PREMIUM</span>
                                </h2>
                                <p className="text-slate-500 mt-2">Gérez les accès et les rôles de vos collaborateurs.</p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Add New Card */}
                                <button className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 transition-all group">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 flex items-center justify-center mb-4 transition-colors">
                                        <UserPlus size={24} className="text-slate-400 group-hover:text-orange-500" />
                                    </div>
                                    <span className="font-bold text-sm">Ajouter un membre</span>
                                </button>

                                {/* Mock Team Members */}
                                {[1, 2].map((i) => (
                                    <Card key={i} className="p-6 flex flex-col items-center text-center relative overflow-hidden group">
                                        <div className="absolute top-4 right-4 text-slate-300">
                                            <ShieldCheck size={16} />
                                        </div>
                                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Employee${i}`} alt="Avatar" />
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">John Doe {i}</h3>
                                        <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-4">Technicien</p>

                                        <div className="flex items-center gap-2 w-full mt-auto">
                                            <Button variant="outline" className="flex-1 text-xs h-9">Gérer</Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    )
                }

                {/* === FINANCE TAB === */}
                {
                    activeTab === 'finance' && (
                        <motion.div key="finance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} {...{ className: "space-y-8" } as any}>
                            <header>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    Finance ERP
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider">LIVE</span>
                                </h2>
                                <p className="text-slate-500 mt-2">Aperçu de vos revenus et factures en temps réel.</p>
                            </header>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="p-6 bg-slate-900 text-white relative overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800">
                                    <div className="relative z-10">
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Revenu Total</p>
                                        <h3 className="text-3xl font-black">12,450€</h3>
                                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mt-2">
                                            <TrendingUp size={12} /> +12% ce mois
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 text-slate-800 rotate-12">
                                        <BadgeEuro size={80} />
                                    </div>
                                </Card>

                                <Card className="p-6 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">En Attente</p>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">2,850€</h3>
                                        <p className="text-xs text-slate-500 mt-2">3 factures impayées</p>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 text-slate-100 dark:text-slate-800 rotate-12">
                                        <Clock size={80} />
                                    </div>
                                </Card>

                                <Card className="p-6 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Dépenses</p>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">840€</h3>
                                        <p className="text-xs text-slate-500 mt-2">Matériel & Transport</p>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 text-slate-100 dark:text-slate-800 rotate-12">
                                        <Receipt size={80} />
                                    </div>
                                </Card>
                            </div>

                            {/* Recent Transactions List */}
                            <Card className="p-0 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Transactions Récentes</h3>
                                    <Button variant="ghost" className="text-xs">Voir tout</Button>
                                </div>
                                <div>
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
                                                    <ArrowUpCircle size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-900 dark:text-white">Paiement Client #{4000 + i}</p>
                                                    <p className="text-xs text-slate-500">24 Oct, 2024 • Virement</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-emerald-600">+ 450.00€</p>
                                                <p className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-1">Payé</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )
                }

                {/* === VERIFICATION TAB === */}
                {
                    activeTab === 'verification' && (
                        <motion.div key="verification" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} {...{ className: "space-y-8" } as any}>
                            <header>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    Trust & Safety
                                    {verificationStatus === 'APPROVED' && <span className="text-blue-500 bg-blue-100 px-2 py-0.5 rounded text-xs">VERIFIED</span>}
                                </h2>
                                <p className="text-slate-500 mt-2">Get the Blue Checkmark to build trust with clients.</p>
                            </header>

                            {verificationStatus === 'APPROVED' ? (
                                <Card className="p-8 text-center bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                    <CheckCircle size={64} className="mx-auto text-blue-500 mb-4" />
                                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">You are Verified!</h3>
                                    <p className="text-blue-600 dark:text-blue-400 mt-2">Your profile now displays the Blue Checkmark badge.</p>
                                </Card>
                            ) : verificationStatus === 'PENDING' ? (
                                <Card className="p-8 text-center bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                                    <div className="mx-auto w-16 h-16 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin mb-4"></div>
                                    <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300">Verification Pending</h3>
                                    <p className="text-yellow-600 dark:text-yellow-400 mt-2">Our team is reviewing your documents. This usually takes 24-48 hours.</p>
                                </Card>
                            ) : (
                                <Card className="p-6">
                                    <h3 className="font-bold text-lg mb-4">Submit Documents</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Identity Document (Passport/ID)</label>
                                            <div className="flex gap-2">
                                                <Input disabled value={idDoc} onChange={() => { }} placeholder="No file chosen" className="flex-1" />
                                                <Button onClick={() => setIdDoc('https://mock-storage.com/id_doc.pdf')} variant="outline">Upload Mock</Button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Business Register (RCS)</label>
                                            <div className="flex gap-2">
                                                <Input disabled value={bizDoc} onChange={() => { }} placeholder="No file chosen" className="flex-1" />
                                                <Button onClick={() => setBizDoc('https://mock-storage.com/rcs_doc.pdf')} variant="outline">Upload Mock</Button>
                                            </div>
                                        </div>
                                        <Button onClick={handleRequestVerification} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                                            Submit for Review
                                        </Button>
                                    </div>
                                </Card>
                            )}
                        </motion.div>
                    )
                }

            </main >
        </div >
    );
};
