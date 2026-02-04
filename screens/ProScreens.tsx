import React, { useState, useEffect } from 'react';
import { notifyClientOffer } from '../services/notificationService';
import { sendOfferReceivedEmail } from '../services/emailService';
import { CalendarScreen } from '../src/screens/pro/CalendarScreen';

type ReportView = 'JOBS' | 'TRANSACTIONS' | 'INSIGHTS';
import { NotificationsBell } from '../components/NotificationsBell';
import { IncomingOrderAlert } from '../components/orders/IncomingOrderAlert';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Search,
    MessageSquare,
    User,
    Settings,
    Briefcase,
    Calendar,
    Wallet,
    ChevronRight,
    Check,
    X,
    Clock,
    MapPin,
    Star,
    Filter,
    Bell,
    LogOut,
    Plus,
    FileText,
    Users,
    TrendingUp,
    PieChart,
    CalendarDays,
    Eye,
    Send,
    Edit,
    Trash2,
    Save,
    Crown,
    ExternalLink,
    Camera,
    Image as ImageIcon,
    Download,
    Share2,
    MoreVertical,
    CheckCircle,
    Monitor,
    Smartphone,
    Globe,
    CreditCard,
    DollarSign,
    Box,
    Truck,
    Shield,
    Award,
    AlertTriangle,
    Navigation,
    Phone,
    Activity,
    FileDown,
    Zap,
    ShoppingBag,
    ClipboardList,
    Menu as MenuIcon,
    History
} from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { Card, Button, Input, Badge } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { AgendaTab } from '../components/AgendaTab';
import { BoostProfileScreen } from './pro/BoostProfileScreen';
import { StoreHome } from './store/StoreHome';
import { JobRequest, Proposal, User as UserType, Transaction, Invoice, TeamMember, Role } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



// --- HELPER COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }: any) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
                <Icon size={24} />
            </div>
            {trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{value}</h3>
    </div>
);

// Simple User Icon helper
const UserIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

// Simplified Icon for Expense
const ShoppingCartIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
);


// --- MAIN COMPONENTS STREAMLINED FOR INSERTION ---

// --- TEAM MANAGEMENT (HR COMPLIANCE) ---
const TeamManagement = () => {
    const { t } = useLanguage();
    const { addNotification } = useNotifications();
    const { createEmployee, getStaffMembers, deleteUser } = useDatabase(); // Use real DB actions

    // Get Current Boss ID
    const currentUser = JSON.parse(localStorage.getItem('servicebid_current_session_user') || '{}');
    const members = getStaffMembers(currentUser.id); // Validated to work

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'access' | 'hr'>('access');
    const [isLoading, setIsLoading] = useState(false);

    // Initial State for New Employee
    const initialMemberState: Partial<TeamMember> = {
        role: 'EMPLOYEE', // System role
        jobTitle: 'Technician', // Default Display Role
        nationality: 'Luxembourg',
        taxClass: 'Class 1',
        addresses: [{ id: 'addr-main', label: 'Home', street: '', number: '', postalCode: '', locality: '', country: 'Luxembourg' }]
    };

    const [newMember, setNewMember] = useState<Partial<TeamMember>>(initialMemberState);
    const [password, setPassword] = useState(''); // Separate password state

    const handleAddMember = async () => {
        // Validation - Tab 1
        if (!newMember.name || !newMember.email || !password) {
            addNotification('error', 'Basic Access Info (Name, Email, Password) is required.');
            setActiveTab('access');
            return;
        }

        // Validation - Tab 2 (HR)
        if (!newMember.cnsNumber || newMember.cnsNumber.length !== 13) {
            addNotification('error', 'Invalid CNS Number. Must be 13 digits.');
            setActiveTab('hr');
            return;
        }

        setIsLoading(true);
        try {
            await createEmployee(newMember as TeamMember, password);
            addNotification('success', t.staffAdded);
            setIsAddModalOpen(false);
            setNewMember(initialMemberState);
            setPassword('');
            setActiveTab('access');
        } catch (error: any) {
            addNotification('error', 'Failed to create employee: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateAddress = (field: string, value: string) => {
        const currentAddr = newMember.addresses?.[0] || { id: 'addr-1', label: 'Home', street: '', number: '', postalCode: '', locality: '' };
        const updatedAddr = { ...currentAddr, [field]: value };
        setNewMember({ ...newMember, addresses: [updatedAddr] });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.manageTeam}</h2>
                    <p className="text-slate-500">{t.manageTeamDesc}</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800">
                    <Plus size={18} className="mr-2" /> {t.addMember}
                </Button>
            </div>

            <div className="grid gap-4">
                {members.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200">
                        <Users size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-500">No team members yet</h3>
                        <p className="text-sm text-slate-400">Add your first employee to start managing your squad.</p>
                    </div>
                )}

                {members.map(member => (
                    <div key={member.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}`} alt={member.name} className="w-12 h-12 rounded-full bg-slate-100 object-cover" />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {member.name} {member.surname}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black ${member.jobTitle === 'Manager' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {member.jobTitle || 'Technician'}
                                    </span>
                                </h3>
                                <div className="flex gap-4 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><Smartphone size={12} /> {member.phone || 'No Phone'}</span>
                                    <span className="flex items-center gap-1"><CreditCard size={12} /> {member.cnsNumber || 'No CNS'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge className={member.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>
                                {member.isActive ? t.active : t.inactive}
                            </Badge>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                                <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteUser(member.id)} className="text-slate-400 hover:text-red-500">
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ADD MEMBER MODAL (2-STEP HR COMPLIANCE) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        {...({
                            initial: { scale: 0.95, opacity: 0 },
                            animate: { scale: 1, opacity: 1 },
                            className: "bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        } as any)}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.addMember}</h3>
                                <p className="text-xs text-slate-500">Luxembourg Compliance Standard</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        {/* Tabs Header */}
                        <div className="flex border-b border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setActiveTab('access')}
                                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'access' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}
                            >
                                <Shield size={16} /> 1. Access & Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('hr')}
                                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'hr' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400'}`}
                            >
                                <FileText size={16} /> 2. HR & Legal
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50/30">

                            {activeTab === 'access' ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label={t.fullName} value={newMember.name || ''} onChange={e => setNewMember({ ...newMember, name: e.target.value })} placeholder="First Name" />
                                        <Input label="Surname" value={newMember.surname || ''} onChange={e => setNewMember({ ...newMember, surname: e.target.value })} placeholder="Last Name" />
                                    </div>

                                    <Input label={t.emailLogin} type="email" value={newMember.email || ''} onChange={e => setNewMember({ ...newMember, email: e.target.value })} placeholder="employee@company.lu" />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative col-span-2">
                                            <Input label="Initial Password" type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Secret123!" />
                                            <span className="text-[10px] text-orange-500 absolute top-0 right-0 font-bold">Never saved to DB</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">System Role</label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white"
                                            value={newMember.jobTitle}
                                            onChange={e => {
                                                const title = e.target.value;
                                                // Map Job Title to System Role
                                                let systemRole: Role = 'TECHNICIAN';
                                                if (title === 'Manager' || title === 'Team Leader') systemRole = 'MANAGER';

                                                setNewMember({ ...newMember, jobTitle: title, role: systemRole });
                                            }}
                                        >
                                            <option value="Technician">Technician</option>
                                            <option value="Senior Technician">Senior Technician</option>
                                            <option value="Team Leader">Team Leader</option>
                                            <option value="Manager">Manager / Admin</option>
                                            <option value="Apprentice">Apprentice</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

                                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl flex gap-3 items-start">
                                        <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-yellow-700">Please verify official documents before saving. CNS must match the social security card.</p>
                                    </div>

                                    <Input
                                        label="CNS Number (13 Digits)"
                                        value={newMember.cnsNumber || ''}
                                        onChange={e => setNewMember({ ...newMember, cnsNumber: e.target.value })}
                                        placeholder="YYYYMMDDXXXXX"
                                    />

                                    <Input label="Phone Number" value={newMember.phone || ''} onChange={e => setNewMember({ ...newMember, phone: e.target.value })} placeholder="+352 691..." />


                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="ID / Passport No." value={newMember.idCardNumber || ''} onChange={e => setNewMember({ ...newMember, idCardNumber: e.target.value })} />
                                        <Input label="Nationality" value={newMember.nationality || ''} onChange={e => setNewMember({ ...newMember, nationality: e.target.value })} />
                                    </div>

                                    <Input label="IBAN (Salary)" value={newMember.iban || ''} onChange={e => setNewMember({ ...newMember, iban: e.target.value })} placeholder="LU..." />

                                    <div className="pt-2 border-t border-slate-200">
                                        <label className="text-xs font-bold text-slate-900 mb-2 block">Residence Address</label>
                                        <div className="space-y-2">
                                            <Input label="" placeholder="Street & Number" value={`${newMember.addresses?.[0]?.street || ''} ${newMember.addresses?.[0]?.number || ''}`} onChange={e => {
                                                const parts = e.target.value.split(' ');
                                                const num = parts.pop() || '';
                                                const str = parts.join(' ');
                                                updateAddress('street', str);
                                                updateAddress('number', num);
                                            }} />
                                            <div className="grid grid-cols-3 gap-2">
                                                <Input label="" placeholder="L-XXXX" value={newMember.addresses?.[0]?.postalCode || ''} onChange={e => updateAddress('postalCode', e.target.value)} />
                                                <Input label="" placeholder="Locality" className="col-span-2" value={newMember.addresses?.[0]?.locality || ''} onChange={e => updateAddress('locality', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            {activeTab === 'access' ? (
                                <Button onClick={() => setActiveTab('hr')} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                                    Next Step <ChevronRight size={16} className="ml-2" />
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button onClick={() => setActiveTab('access')} variant="ghost" className="text-slate-500">
                                        Back
                                    </Button>
                                    <Button onClick={handleAddMember} disabled={isLoading} className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20">
                                        {isLoading ? 'Creating Account...' : (
                                            <span className="flex items-center gap-2"><Check size={18} /> Complete Hiring</span>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const InvoicePreviewModal = ({ invoice, onClose }: { invoice: any, onClose: () => void }) => { // Using any for ease, ideally Invoice type
    const { t } = useLanguage();
    if (!invoice) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                {...({
                    initial: { y: 50, opacity: 0 },
                    animate: { y: 0, opacity: 1 },
                    exit: { y: 50, opacity: 0 },
                    className: "bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                } as any)}
            >
                {/* Invoice Header / Actions */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <FileText size={18} />
                        <span className="font-bold">Invoice Preview</span>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-slate-800" onClick={() => {
                            const doc = new jsPDF();

                            // Header
                            doc.setFontSize(22);
                            doc.text("INVOICE", 14, 20);

                            doc.setFontSize(10);
                            doc.text(`Invoice #: ${invoice.id.toUpperCase()}`, 14, 30);
                            doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 14, 35);

                            // Company Info (Right)
                            doc.text("Zolver Inc.", 150, 20);
                            doc.text("123 Business Avenue", 150, 25);
                            doc.text("L-1234 Luxembourg", 150, 30);
                            doc.text("VAT: LU12345678", 150, 35);

                            // Bill To
                            doc.text("Bill To:", 14, 50);
                            doc.setFont(undefined, 'bold');
                            doc.text(invoice.clientName || 'Client Name', 14, 55);
                            doc.setFont(undefined, 'normal');

                            // Table
                            autoTable(doc, {
                                startY: 65,
                                head: [['Description', 'Qty', 'Rate', 'Total']],
                                body: [
                                    [invoice.description, '1', `€${invoice.amount.toFixed(2)}`, `€${invoice.amount.toFixed(2)}`]
                                ],
                            });

                            // Totals
                            const finalY = (doc as any).lastAutoTable.finalY || 80;
                            doc.text(`Subtotal: €${invoice.amount.toFixed(2)}`, 140, finalY + 10);
                            doc.text(`VAT (17%): €${(invoice.amount * 0.17).toFixed(2)}`, 140, finalY + 15);
                            doc.setFont(undefined, 'bold');
                            doc.text(`Total Due: €${(invoice.amount * 1.17).toFixed(2)}`, 140, finalY + 25);

                            doc.save(`invoice_${invoice.id}.pdf`);
                        }}>
                            <Download size={16} className="mr-2" /> PDF
                        </Button>
                        <Button size="sm" variant="ghost" onClick={onClose} className="text-white hover:bg-slate-800">
                            <X size={20} />
                        </Button>
                    </div>
                </div>

                {/* Invoice Paper content */}
                <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-900 font-serif">
                    <div className="flex justify-between items-start border-b pb-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">INVOICE</h1>
                            <p className="text-slate-500 font-sans text-sm">#{invoice.id.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-xl text-orange-600 mb-1">Zolver Inc.</div>
                            <p className="text-sm text-slate-500 font-sans">123 Business Avenue<br />L-1234 Luxembourg<br />VAT: LU12345678</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8 font-sans">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t.invBillTo}</h3>
                            <p className="font-bold text-slate-900">{invoice.clientName || 'Client Name'}</p>
                            <p className="text-sm text-slate-500">Client Address Line 1<br />City, Country</p>
                        </div>
                        <div className="text-right">
                            <div className="mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase mr-4">{t.invDate}:</span>
                                <span className="font-medium">{new Date(invoice.date).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase mr-4">{t.invDue}:</span>
                                <span className="font-medium">{new Date(new Date(invoice.date).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <table className="w-full mb-8 font-sans">
                        <thead>
                            <tr className="bg-slate-50 border-y border-slate-200">
                                <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase">{t.invDesc}</th>
                                <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase">{t.invQty}</th>
                                <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase">{t.invRate}</th>
                                <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase">{t.invTotal}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-100">
                                <td className="py-4 px-4 text-sm font-medium">{invoice.description}</td>
                                <td className="py-4 px-4 text-sm text-right">1</td>
                                <td className="py-4 px-4 text-sm text-right">€{invoice.amount.toFixed(2)}</td>
                                <td className="py-4 px-4 text-sm font-bold text-right">€{invoice.amount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="flex justify-end font-sans">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{t.invSubtotal}</span>
                                <span className="font-medium">€{invoice.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{t.invVatAmt} (17%)</span>
                                <span className="font-medium">€{(invoice.amount * 0.17).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black border-t border-slate-200 pt-2 mt-2">
                                <span>{t.invTotalDue}</span>
                                <span className="text-slate-900">€{(invoice.amount * 1.17).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-400 font-sans">{t.invFooter}</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const ProAnalytics = () => {
    const { t } = useLanguage();
    const { addNotification } = useNotifications();
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: 'tx1', date: '2023-10-25', amount: 150.00, type: 'CREDIT', description: 'Plumbing Repair - Job #123', category: 'SERVICE', status: 'COMPLETED', paymentMethod: 'CARD' },
        { id: 'tx2', date: '2023-10-24', amount: 45.50, type: 'DEBIT', description: 'Hardware Store - Materials', category: 'MATERIALS', status: 'COMPLETED', paymentMethod: 'CARD' },
        { id: 'tx3', date: '2023-10-22', amount: 300.00, type: 'CREDIT', description: 'Full House Cleaning', category: 'SERVICE', status: 'COMPLETED', paymentMethod: 'CASH' }
    ]);

    const [filterPeriod, setFilterPeriod] = useState<'WEEK' | 'MONTH' | 'YEAR'>('MONTH');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewInvoice, setViewInvoice] = useState<string | null>(null); // Transaction ID to view invoice for

    // New Transaction State
    const [newTx, setNewTx] = useState<Partial<Transaction>>({
        type: 'CREDIT',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
        category: 'SERVICE',
        status: 'COMPLETED'
    });

    const INCOME_CATEGORIES = ['SERVICE', 'PRODUCT_SALE', 'OTHER_INCOME'];
    const EXPENSE_CATEGORIES = ['MATERIALS', 'FUEL', 'RENT', 'MARKETING', 'INSURANCE', 'TAX', 'OTHER_EXPENSE'];

    const handleAddTransaction = () => {
        if (!newTx.amount || !newTx.description) {
            addNotification('error', 'Please fill in amount and description');
            return;
        }

        const tx: Transaction = {
            id: `tx-${Date.now()}`,
            date: newTx.date!,
            amount: Number(newTx.amount),
            type: newTx.type || 'CREDIT',
            description: newTx.description!,
            category: newTx.category || 'SERVICE',
            status: 'COMPLETED',
            paymentMethod: newTx.paymentMethod || 'CASH',
            // Simple logic: if expense, assume 17% VAT paid. If income, assume 17% VAT collected.
            vatRate: 17,
            vatAmount: Number(newTx.amount) * 0.17
        };

        setTransactions([tx, ...transactions]);
        setIsAddModalOpen(false);
        setNewTx({ type: 'CREDIT', date: new Date().toISOString().split('T')[0], paymentMethod: 'CASH', category: 'SERVICE', status: 'COMPLETED', description: '', amount: 0 });
        addNotification('success', 'Transaction recorded');
    };

    // Derived Stats
    // Derived Stats
    const totalIncome = transactions.filter(t => t.type === 'CREDIT').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'DEBIT').reduce((acc, curr) => acc + curr.amount, 0);
    const profit = totalIncome - totalExpense;

    // VAT Estimation
    // VAT Collected (on Income) - VAT Paid (on Expenses)
    // Assuming amounts are Net for simplicity in this demo, or we treat them as Gross and back-calculate.
    // Let's assume inclusive for user simplicity: Amount / 1.17 * 0.17
    const vatCollected = transactions.filter(t => t.type === 'CREDIT').reduce((acc, curr) => acc + (curr.amount / 1.17 * 0.17), 0);
    const vatPaid = transactions.filter(t => t.type === 'DEBIT').reduce((acc, curr) => acc + (curr.amount / 1.17 * 0.17), 0);
    const vatDue = vatCollected - vatPaid;

    // Helper to generate a dummy invoice object from a transaction
    const getInvoiceFromTransaction = (txId: string) => {
        const tx = transactions.find(t => t.id === txId);
        if (!tx) return null;
        return {
            id: tx.id,
            date: tx.date,
            amount: tx.amount,
            description: tx.description,
            clientName: "Walk-in Client" // Dummy
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.financialErp}</h2>
                    <p className="text-slate-500">{t.financialPerformance}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => { }} className="hidden sm:flex">
                        <Download size={18} className="mr-2" /> {t.exportReport}
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20">
                        <Plus size={18} className="mr-2" /> {t.addTransaction}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Revenue (Gross)" value={`€${totalIncome.toFixed(2)}`} icon={Wallet} trend={12} color="green" />
                <StatCard title="Expenses" value={`€${totalExpense.toFixed(2)}`} icon={CreditCard} trend={-5} color="red" />
                <StatCard title="Net Profit" value={`€${profit.toFixed(2)}`} icon={PieChart} trend={8} color="blue" />
                <StatCard title="Est. VAT Due" value={`€${vatDue.toFixed(2)}`} icon={FileText} trend={0} color="orange" />
            </div>

            {/* Transactions List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
                    <h3 className="font-bold text-lg">{t.breakdown}</h3>
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {(['WEEK', 'MONTH', 'YEAR'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => setFilterPeriod(p)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterPeriod === p ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                            >
                                {p === 'WEEK' ? '7D' : p === 'MONTH' ? '30D' : 'YTD'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                            {t.noJobsPeriod}
                        </div>
                    ) : (
                        transactions.map(tx => (
                            <div key={tx.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {tx.type === 'CREDIT' ? <TrendingUp size={18} /> : <ShoppingCartIcon size={18} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{tx.description}</h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-2">
                                            <span>{new Date(tx.date).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="uppercase">{tx.category}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-black ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                                        {tx.type === 'CREDIT' ? '+' : '-'}€{tx.amount.toFixed(2)}
                                    </span>
                                    <Badge className={tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>
                                        {tx.status === 'COMPLETED' ? t.active : t.inactive}
                                    </Badge>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setViewInvoice(tx.id)}>
                                        <FileText size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ADD TRANSACTION MODAL */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="absolute inset-0" onClick={() => setIsAddModalOpen(false)} />
                        <motion.div
                            {...({
                                initial: { scale: 0.95, opacity: 0 },
                                animate: { scale: 1, opacity: 1 },
                                exit: { scale: 0.95, opacity: 0 },
                                className: "bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl"
                            } as any)}
                        >
                            <h3 className="text-lg font-black mb-4">{t.addTransaction}</h3>
                            <div className="space-y-4">
                                {/* Type Selector */}
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                    <button onClick={() => setNewTx({ ...newTx, type: 'CREDIT' })} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newTx.type === 'CREDIT' ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-500' : 'text-slate-500'}`}>Income (Credit)</button>
                                    <button onClick={() => setNewTx({ ...newTx, type: 'DEBIT' })} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newTx.type === 'DEBIT' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-500' : 'text-slate-500'}`}>Expense (Debit)</button>
                                </div>

                                <Input label="Date" type="date" value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })} />
                                <Input label={t.invDesc} placeholder="e.g. Tools, Gas, Rent" value={newTx.description} onChange={e => setNewTx({ ...newTx, description: e.target.value })} />

                                {/* Advanced Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Category</label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none"
                                            value={newTx.category}
                                            onChange={e => setNewTx({ ...newTx, category: e.target.value })}
                                        >
                                            {(newTx.type === 'CREDIT' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Method</label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none"
                                            value={newTx.paymentMethod}
                                            onChange={e => setNewTx({ ...newTx, paymentMethod: e.target.value as any })}
                                        >
                                            <option value="CASH">Cash</option>
                                            <option value="CARD">Card</option>
                                            <option value="TRANSFER">Transfer</option>
                                        </select>
                                    </div>
                                </div>

                                <Input label="Amount (€)" type="number" placeholder="0.00" value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: Number(e.target.value) })} />

                                <div className="flex gap-2 justify-end mt-4">
                                    <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>{t.cancel}</Button>
                                    <Button onClick={handleAddTransaction}>{t.saveChanges}</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
                {/* INVOICE PREVIEW MODAL */}
                <AnimatePresence>
                    {viewInvoice && (
                        <InvoicePreviewModal
                            invoice={getInvoiceFromTransaction(viewInvoice)}
                            onClose={() => setViewInvoice(null)}
                        />
                    )}
                </AnimatePresence>

            </AnimatePresence>
        </div>
    );
};

interface ProScreensProps {
    onViewProfile: () => void;
    onBid: (job: JobRequest) => void;
    onChatSelect: (proposal: Proposal) => void;
    onNavigate?: (screen: string, params?: any) => void;
    darkMode?: boolean;
    toggleTheme?: () => void;
}

export const ProDashboard: React.FC<ProScreensProps> = ({ onViewProfile, onBid, onChatSelect, onNavigate, darkMode = false, toggleTheme = () => { } }) => {
    const { t, tCategory } = useLanguage();
    const { jobs, proposals, createProposal, users } = useDatabase();
    const { addNotification } = useNotifications();
    const [activeTab, setActiveTab] = useState<'MARKET' | 'MY_JOBS' | 'HISTORY' | 'TEAM' | 'FINANCE' | 'AGENDA' | 'ACTIVE' | 'BOOST' | 'STORE' | 'MENU'>('MARKET');

    // Filter jobs for agenda
    const agendaJobs = jobs.filter(j =>
        (j.status === 'CONFIRMED' || j.status === 'IN_PROGRESS' || j.status === 'WAITING_CLIENT_CONFIRMATION') &&
        j.scheduledDate
    );
    const currentUser = JSON.parse(localStorage.getItem('servicebid_current_session_user') || '{}');

    // -- MODAL STATE --
    const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
    const [bidAmount, setBidAmount] = useState<string>('');
    const [submittingId, setSubmittingId] = useState<string | null>(null); // Track which job is submitting

    const marketJobs = jobs.filter(j =>
        (j.status === 'OPEN' || j.status === 'WAITING_PROVIDER_CONFIRMATION') &&
        !proposals.some(p => p.jobId === j.id && p.proId === currentUser.id) &&
        // Direct Request Logic: Show if it's open for everyone (not direct) OR if it is direct and targeted at me
        ((!j.is_direct_request) || (j.is_direct_request && j.target_company_id === currentUser.id))
    );



    // NEW: Active Locked Jobs (Where I am the owner)
    // NEW: Active Locked Jobs (Where I am the owner)
    // NEW: Active Locked Jobs (Where I am the owner)
    const activeWorks = jobs.filter(j =>
        (
            // I am the locked provider (company owner) OR the assigned employee
            (j.lockedBy === currentUser.id || j.assignedEmployeeId === currentUser.id) ||
            // OR I have an accepted proposal for this job (double check)
            proposals.some(p => p.jobId === j.id && p.proId === currentUser.id && p.status === 'ACCEPTED')
        ) &&
        // AND the status is active
        ['IN_PROGRESS', 'CONFIRMED', 'PAYMENT_PENDING', 'PENDING_PRO_CONFIRMATION', 'WAITING_CLIENT_CONFIRMATION', 'WAITING_PROVIDER_CONFIRMATION', 'FUNDS_ESCROWED'].includes(j.status)
    );

    // DIRECT REQUESTS (Inject into "My Requests")
    const directRequests = jobs.filter(j =>
        j.is_direct_request &&
        j.target_company_id === currentUser.id &&
        !proposals.some(p => p.jobId === j.id && p.proId === currentUser.id) &&
        j.status !== 'CANCELLED'
    );

    const myJobs = [
        ...directRequests.map(j => ({
            job: j,
            proposal: {
                id: `direct-${j.id}`,
                jobId: j.id,
                proId: currentUser.id,
                price: j.suggestedPrice || 0,
                status: 'PENDING', // Visual status
                createdAt: j.createdAt,
                proName: currentUser.name,
                proAvatar: currentUser.avatar
            } as any
        })),
        ...proposals
            .filter(p => p.proId === currentUser.id)
            .map(p => {
                const job = jobs.find(j => j.id === p.jobId);
                return { job, proposal: p };
            })
            .filter(item => item.job && item.job.status !== 'CANCELLED')
    ];

    const handleQuickBid = async (job: JobRequest) => {
        if (submittingId) return;
        setSubmittingId(job.id);

        try {
            // HARDENED: Ensure we use the exact ID from the job passed in
            const bid = job.suggestedPrice || 100;
            console.log(`[ProScreens] Quick Bid for Job ID: ${job.id}`);
            await submitProposal(job, bid);
        } catch (error) {
            console.error("Bid failed", error);
            alert("Failed to send bid. Please try again.");
        } finally {
            setSubmittingId(null);
        }
    };

    const handleSubmitBid = async () => {
        if (submittingId || !selectedJob) return;
        setSubmittingId(selectedJob.id);

        try {
            await submitProposal(selectedJob, Number(bidAmount) || selectedJob.suggestedPrice || 0);
            setSelectedJob(null);
        } catch (error) {
            console.error("Bid failed", error);
            alert("Failed to send bid.");
        } finally {
            setSubmittingId(null);
        }
    };

    const handleNotificationClick = (type: string, data: any) => {
        if (type === 'JOB_REQUEST' && data?.jobId) {
            setActiveTab('MY_JOBS'); // Or logic to focus specific job
        }
    };

    const submitProposal = async (job: JobRequest, price: number) => {
        console.log("Submitting proposal for job:", job.id, "Price:", price);

        if (!price || price <= 0) {
            addNotification('error', "Please enter a valid price");
            return;
        }

        const newProposal: Proposal = { // Use Proposal type
            // Types usually Proposal
            id: `prop-${Date.now()}`,
            jobId: job.id,
            proId: currentUser.id,
            proName: currentUser.name || 'Professional',
            proAvatar: currentUser.avatar,
            proLevel: currentUser.level || 'Professional',
            proRating: currentUser.rating || 5.0,
            price: price,
            message: "I can help with this.",
            createdAt: new Date().toISOString(),
            status: 'NEGOTIATING',
            distance: job.distance || null
        } as any; // Cast to avoid strict type issues for now, matching existing pattern

        console.log("Proposal payload:", newProposal);

        try {
            const sanitizedProposal = JSON.parse(JSON.stringify(newProposal));
            await createProposal(sanitizedProposal);
            console.log("Proposal created in DB");
            addNotification('success', "Offer sent successfully!");

            // NOTIFICATION TRIGGER: Notify Client
            notifyClientOffer(job.clientId, currentUser.name, job.id, newProposal.id);

            // EMAIL TRIGGER: Notify Client
            const clientUser = users.find(u => u.id === job.clientId);
            if (clientUser && clientUser.email) {
                sendOfferReceivedEmail(
                    clientUser.email,
                    clientUser.name,
                    currentUser.name,
                    price
                );
            }

        } catch (error: any) {
            console.error("Critical Failure in createProposal:", error);
            addNotification('error', "Failed to send bid. Click for details.", {
                message: error.message,
                code: error.code,
                stack: error.stack,
                proposalPayload: newProposal
            });
            throw error;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            <IncomingOrderAlert />
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-20">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative cursor-pointer" onClick={onViewProfile}>
                            <img src={currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-orange-500 p-0.5" />
                            <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900">PRO</div>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</h3>
                            <p className="text-xs text-slate-500">Zolver Pro</p>
                        </div>
                    </div>
                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2">
                        <NotificationsBell
                            userId={currentUser.id}
                            onNavigate={handleNotificationClick}
                        />
                        <button onClick={onViewProfile} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-orange-500"><UserIcon size={20} /></button>
                    </div>
                </div>


                <div className="hidden md:flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'MARKET', label: t.liveMarket, icon: Search },
                        { id: 'ACTIVE', label: 'My Active Jobs', icon: Activity },
                        { id: 'MY_JOBS', label: t.myRequests, icon: Briefcase },
                        { id: 'HISTORY', label: t.historyTab, icon: History },
                        { id: 'TEAM', label: t.teamTab, icon: Users },
                        { id: 'FINANCE', label: t.financialErp, icon: PieChart },
                        { id: 'AGENDA', label: 'Agenda', icon: CalendarDays },
                        { id: 'BOOST', label: 'Marketing', icon: Zap }, // Added Boost button
                        { id: 'STORE', label: 'Store', icon: ShoppingBag } // Added Store button
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div >

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <AnimatePresence mode="wait">

                    {activeTab === 'MARKET' && (
                        <motion.div
                            {...({
                                key: "market",
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -10 },
                                className: "space-y-4"
                            } as any)}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                                    <Search size={24} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">🎯 Explore Opportunities</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{marketJobs.length} new jobs available</p>
                                </div>
                            </div>

                            {marketJobs.length === 0 ? (
                                <div className="text-center py-20 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border-2 border-dashed border-blue-200 dark:border-blue-800">
                                    <Search className="w-16 h-16 text-blue-300 dark:text-blue-700 mx-auto mb-4" />
                                    <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-2">No opportunities yet</p>
                                    <p className="text-slate-500 text-sm">Check back soon for new job listings</p>
                                </div>
                            ) : (
                                marketJobs.map(job => (
                                    <Card key={job.id} className={`p-5 hover:shadow-lg transition-all border-l-4 ${job.is_direct_request ? 'border-l-amber-500 bg-amber-50/30 dark:bg-amber-900/5' : 'border-l-blue-500'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex gap-2">
                                                {job.is_direct_request && (
                                                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                                                        <Crown size={10} /> Exclusive
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">{job.category}</span>
                                            </div>
                                            <span className="text-xs font-bold text-orange-500">€ {job.suggestedPrice}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">{job.title || job.description}</h3>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                                            <MapPin size={12} /> {job.location} • {job.distance || '5 km'}
                                        </div>

                                        {/* UPDATED BUTTONS */}
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="flex-1 text-xs font-bold border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                onClick={() => { setSelectedJob(job); setBidAmount(job.suggestedPrice?.toString() || ''); }}
                                            >
                                                <Eye size={14} className="mr-2" /> Details / Custom
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
                                                onClick={() => handleQuickBid(job)}
                                                disabled={submittingId === job.id}
                                            >
                                                {submittingId === job.id ? (
                                                    <span className="animate-pulse">Sending...</span>
                                                ) : (
                                                    <>
                                                        <Check size={14} className="mr-2" /> Accept €{job.suggestedPrice}
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'ACTIVE' && (
                        <motion.div
                            {...({
                                key: "active",
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -10 },
                                className: "space-y-4"
                            } as any)}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600 dark:text-green-400">
                                    <Briefcase size={24} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">⚙️ Active Work</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{activeWorks.length} jobs in progress</p>
                                </div>
                            </div>

                            {activeWorks.length === 0 ? (
                                <div className="text-center py-20 bg-green-50/50 dark:bg-green-900/10 rounded-3xl border-2 border-dashed border-green-200 dark:border-green-800">
                                    <Briefcase className="w-16 h-16 text-green-300 dark:text-green-700 mx-auto mb-4" />
                                    <p className="text-green-600 dark:text-green-400 font-bold text-lg mb-2">No active work</p>
                                    <p className="text-slate-500 text-sm">Start by accepting opportunities from the Market</p>
                                </div>
                            ) : (
                                activeWorks.map(job => (
                                    <Card
                                        key={job.id}
                                        className="p-5 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-green-500 bg-green-50/20 dark:bg-green-900/10"
                                        onClick={() => {
                                            const prop = proposals.find(p => p.jobId === job.id && p.proId === currentUser.id) || {
                                                id: `mock-prop-${job.id}`,
                                                jobId: job.id,
                                                proId: currentUser.id,
                                                price: job.finalPrice || job.suggestedPrice || 0,
                                                status: 'ACCEPTED', // Using ACCEPTED to match types if possible, or force cast
                                                createdAt: job.createdAt,
                                                proName: currentUser.name,
                                                proAvatar: currentUser.avatar,
                                                proLevel: 'Professional',
                                                proRating: 5.0,
                                                message: 'Generated'
                                            } as any;
                                            onChatSelect && onChatSelect(prop);
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white">{job.title || job.description}</h3>
                                            <span className="text-[10px] font-black uppercase bg-green-100 text-green-600 px-2 py-0.5 rounded flex items-center gap-1">
                                                <Activity size={10} /> IN PROGRESS
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-3 flex items-center gap-2">
                                            <MapPin size={12} /> {job.location}
                                        </p>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="font-black text-slate-900 dark:text-white">€{job.finalPrice || job.suggestedPrice}</span>
                                            <Button size="sm" className="bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-600/20">
                                                Continue Job <ChevronRight size={14} className="ml-1" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'MY_JOBS' && (
                        <motion.div
                            {...({
                                key: "myjobs",
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -10 },
                                className: "space-y-4"
                            } as any)}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">📝 My Proposals</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{myJobs.filter(({ job }) => job!.status !== 'COMPLETED' && job!.status !== 'CANCELLED').length} active bids</p>
                                </div>
                            </div>

                            {myJobs.filter(({ job }) => job!.status !== 'COMPLETED' && job!.status !== 'CANCELLED').length === 0 ? (
                                <div className="text-center py-20 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-800">
                                    <FileText className="w-16 h-16 text-indigo-300 dark:text-indigo-700 mx-auto mb-4" />
                                    <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg mb-2">No proposals submitted</p>
                                    <p className="text-slate-500 text-sm">Browse the Market and submit your first bid</p>
                                </div>
                            ) : (
                                myJobs.filter(({ job }) => job!.status !== 'COMPLETED' && job!.status !== 'CANCELLED').map(({ job, proposal }) => (
                                    <Card
                                        key={job!.id}
                                        className={`p-5 cursor-pointer hover:shadow-lg transition-all border-l-4 ${proposal.status === 'ACCEPTED' ? 'border-l-orange-500' : 'border-l-amber-500'}`}
                                        onClick={() => onChatSelect && onChatSelect(proposal)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white">{job!.title || job!.description}</h3>
                                            {proposal.status === 'ACCEPTED' ? (
                                                <span className="text-[10px] font-black uppercase bg-orange-100 text-orange-600 px-2 py-0.5 rounded">Active</span>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-600 px-2 py-0.5 rounded">Pending</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mb-3">Bid: €{proposal.price}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[10px] text-slate-400">{new Date(proposal.createdAt).toLocaleDateString()}</span>
                                            <div className="flex -space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white dark:border-slate-900" />
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'HISTORY' && (
                        <motion.div
                            {...({
                                key: "history",
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -10 },
                                className: "space-y-4"
                            } as any)}
                        >
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">{t.historyTab}</h2>
                            {myJobs.filter(({ job }) => job!.status === 'COMPLETED' || job!.status === 'CANCELLED').length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-medium">{t.noHistory}</p>
                                </div>
                            ) : (
                                myJobs.filter(({ job }) => job!.status === 'COMPLETED' || job!.status === 'CANCELLED').map(({ job, proposal }) => (
                                    <Card
                                        key={job!.id}
                                        className="p-5 cursor-pointer hover:shadow-lg transition-all border-l-4 border-slate-300 opacity-75 hover:opacity-100"
                                        onClick={() => onChatSelect && onChatSelect(proposal)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white line-through decoration-slate-300">{job!.title || job!.description}</h3>
                                            <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{job!.status}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-3">Final: €{job!.finalPrice || proposal.price}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[10px] text-slate-400">{new Date(job!.finishedAt || job!.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'AGENDA' && (
                        <motion.div
                            {...({
                                key: "agenda",
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -10 }
                            } as any)}
                        >
                            <CalendarScreen onBack={() => setActiveTab('MARKET')} />
                        </motion.div>
                    )}

                    {activeTab === 'TEAM' && (
                        <motion.div
                            {...({
                                key: "team",
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -10 }
                            } as any)}
                        >
                            <TeamManagement />
                        </motion.div>
                    )}

                    {activeTab === 'FINANCE' && (
                        <motion.div
                            {...({
                                key: "finance",
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -10 }
                            } as any)}
                        >
                            <ProAnalytics />
                        </motion.div>
                    )}

                    {activeTab === 'BOOST' && (
                        <motion.div
                            {...({
                                key: "boost",
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -10 }
                            } as any)}
                        >
                            <BoostProfileScreen onBack={() => setActiveTab('MARKET')} />
                        </motion.div>
                    )}

                    {activeTab === 'STORE' && (
                        <motion.div
                            {...({
                                key: "store",
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -10 }
                            } as any)}
                        >
                            <StoreHome />
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* JOB DETAILS / CUSTOM BID MODAL */}
                <AnimatePresence>
                    {selectedJob && (
                        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />
                            <motion.div
                                {...({
                                    initial: { y: '100%' },
                                    animate: { y: 0 },
                                    exit: { y: '100%' },
                                    className: "bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
                                } as any)}
                            >
                                <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600">
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="flex items-start justify-between gap-4 mb-4 pr-8">
                                    <div>
                                        <span className="inline-block px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-2">
                                            {tCategory(selectedJob.category)}
                                        </span>
                                        {selectedJob.title && (
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-1">
                                                {selectedJob.title}
                                            </h3>
                                        )}
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase whitespace-nowrap shadow-sm border ${selectedJob.urgency === 'URGENT' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                        {selectedJob.urgency}
                                    </div>
                                </div>

                                <p className="text-slate-500 text-xs font-bold flex items-center gap-1 mb-6">
                                    <MapPin size={14} className="text-orange-500" /> {selectedJob.location} • {selectedJob.distance || 'Near'}
                                </p>

                                <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl mb-6 border border-slate-100 dark:border-slate-700">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.detailsLabel}</h4>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                        "{selectedJob.description}"
                                    </p>
                                    {selectedJob.photos.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.photosOptional}</h4>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {selectedJob.photos.map((p, i) => (
                                                    <img key={i} src={p} className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-600 hover:scale-105 transition-transform cursor-pointer" alt="job evidence" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t.yourOffer} (€)</label>
                                    <div className="flex gap-4 flex-col sm:flex-row">
                                        <div className="relative w-full sm:w-1/3">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">€</span>
                                            <Input
                                                type="number"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                className="pl-8 text-lg font-black"
                                                placeholder={selectedJob.suggestedPrice?.toString() || "0"}
                                            />
                                        </div>
                                        <Button
                                            className="flex-1 w-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg h-12 text-base font-bold"
                                            onClick={handleSubmitBid}
                                            disabled={submittingId === selectedJob.id}
                                        >
                                            {submittingId === selectedJob.id ? (
                                                <span className="animate-pulse">Sending...</span>
                                            ) : (
                                                <>
                                                    <Send size={20} className="mr-2" />
                                                    Send Offer
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                <Sidebar
                    isOpen={activeTab === 'MENU'}
                    onClose={() => setActiveTab('MARKET')}
                    user={currentUser}
                    darkMode={darkMode}
                    toggleTheme={toggleTheme}
                >
                    {[
                        { id: 'MARKET', label: t.liveMarket, icon: Search },
                        { id: 'ACTIVE', label: 'My Active Jobs', icon: Activity },
                        { id: 'MY_JOBS', label: t.myRequests, icon: Briefcase },
                        { id: 'HISTORY', label: t.historyTab, icon: History },
                        { id: 'TEAM', label: t.teamTab, icon: Users },
                        { id: 'FINANCE', label: t.financialErp, icon: PieChart },
                        { id: 'AGENDA', label: 'Agenda', icon: CalendarDays },
                        { id: 'BOOST', label: 'Marketing', icon: Zap },
                        { id: 'STORE', label: 'Store', icon: ShoppingBag }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold"
                        >
                            <div className="p-2 bg-white dark:bg-slate-700 rounded-xl text-orange-500">
                                <item.icon size={24} />
                            </div>
                            {item.label}
                        </button>
                    ))}
                </Sidebar>
                <BottomNavigation
                    activeTab={activeTab}
                    onTabChange={(id) => setActiveTab(id as any)}
                />
            </div>
        </div >
    );
};
