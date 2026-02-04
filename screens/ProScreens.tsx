import React, { useState, useEffect } from 'react';
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
    PieChart, // Added for Dashboard/Finance
    History,
    CalendarDays, // Added for Agenda
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
    Shield, // Added for Role/Team
    Award, // Added for Verification
    AlertTriangle,
    Navigation,
    Phone
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/Layout'; // Assuming these exist or we use standard HTML
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { AgendaTab } from '../components/AgendaTab';
import { JobRequest, Proposal, User as UserType, Transaction, Invoice, TeamMember } from '../types';

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

const TeamManagement = () => {
    const { t } = useLanguage();
    const { addNotification } = useNotifications();
    const [members, setMembers] = useState<TeamMember[]>([
        { id: 'tm1', name: 'John Doe', role: 'TECHNICIAN', email: 'john@zolver.com', status: 'ACTIVE', avatar: 'https://i.pravatar.cc/150?u=tm1', assignedJobs: [] },
        { id: 'tm2', name: 'Jane Smith', role: 'ADMIN', email: 'jane@zolver.com', status: 'ACTIVE', avatar: 'https://i.pravatar.cc/150?u=tm2', assignedJobs: [] },
    ]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMember, setNewMember] = useState<Partial<TeamMember>>({ role: 'TECHNICIAN', status: 'ACTIVE' });

    const handleAddMember = () => {
        if (!newMember.name || !newMember.email) {
            addNotification('error', 'Please fill in name and email');
            return;
        }
        const member: TeamMember = {
            id: `tm-${Date.now()}`,
            name: newMember.name!,
            role: newMember.role as any || 'TECHNICIAN',
            email: newMember.email!,
            status: 'ACTIVE',
            avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
            assignedJobs: []
        };
        setMembers([...members, member]);
        setIsAddModalOpen(false);
        setNewMember({ role: 'TECHNICIAN', status: 'ACTIVE' });
        addNotification('success', t.staffAdded);
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
                {members.map(member => (
                    <div key={member.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full bg-slate-100" />
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {member.name}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black ${member.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {member.role}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500">{member.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className={member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>
                                {member.status === 'ACTIVE' ? t.active : t.inactive}
                            </Badge>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500">
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ADD MEMBER MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black">{t.addMember}</h3>
                            <button onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <Input label={t.fullName} value={newMember.name || ''} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
                            <Input label={t.emailLogin} value={newMember.email || ''} onChange={e => setNewMember({ ...newMember, email: e.target.value })} />
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">{t.roleTitle}</label>
                                <select
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    value={newMember.role}
                                    onChange={e => setNewMember({ ...newMember, role: e.target.value as any })}
                                >
                                    <option value="TECHNICIAN">Technician</option>
                                    <option value="ADMIN">Admin / Manager</option>
                                    <option value="SUPPORT">Support</option>
                                </select>
                            </div>
                            <Button onClick={handleAddMember} className="w-full bg-slate-900 text-white mt-4">{t.saveEmployee}</Button>
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
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Invoice Header / Actions */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <FileText size={18} />
                        <span className="font-bold">Invoice Preview</span>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-slate-800">
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
            paymentMethod: newTx.paymentMethod || 'CASH'
        };

        setTransactions([tx, ...transactions]);
        setIsAddModalOpen(false);
        setNewTx({ type: 'CREDIT', date: new Date().toISOString().split('T')[0], paymentMethod: 'CASH', category: 'SERVICE', status: 'COMPLETED', description: '', amount: 0 });
        addNotification('success', 'Transaction recorded');
    };

    // Derived Stats
    const totalIncome = transactions.filter(t => t.type === 'CREDIT').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'DEBIT').reduce((acc, curr) => acc + curr.amount, 0);
    const profit = totalIncome - totalExpense;

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Revenue (Gross)" value={`€${totalIncome.toFixed(2)}`} icon={Wallet} trend={12} color="green" />
                <StatCard title="Expenses" value={`€${totalExpense.toFixed(2)}`} icon={CreditCard} trend={-5} color="red" />
                <StatCard title="Net Profit" value={`€${profit.toFixed(2)}`} icon={PieChart} trend={8} color="blue" />
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
                                <div className="flex items-center gap-4">
                                    <span className={`font-black ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                                        {tx.type === 'CREDIT' ? '+' : '-'}€{tx.amount.toFixed(2)}
                                    </span>
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
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl">
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

                                <Input label="Amount (€)" type="number" placeholder="0.00" value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} />

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
}

export const ProDashboard: React.FC<ProScreensProps> = ({ onViewProfile, onBid, onChatSelect }) => {
    const { t, tCategory } = useLanguage();
    const { jobs, proposals, createProposal } = useDatabase();
    const { addNotification } = useNotifications();
    const [activeTab, setActiveTab] = useState<'MARKET' | 'MY_JOBS' | 'HISTORY' | 'TEAM' | 'FINANCE' | 'AGENDA'>('MARKET');

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

    const myJobs = proposals
        .filter(p => p.proId === currentUser.id)
        .map(p => {
            const job = jobs.find(j => j.id === p.jobId);
            return { job, proposal: p };
        })
        .filter(item => item.job && item.job.status !== 'CANCELLED');

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

    const submitProposal = async (job: JobRequest, price: number) => {
        console.log("Submitting proposal for job:", job.id, "Price:", price);

        if (!currentUser || !currentUser.id) {
            addNotification('error', "User session invalid. Please log in again.");
            return;
        }

        // Generate ID safely
        const propId = `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const newProposal: Proposal = {
            id: propId,
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
            // SAFETY: Firestore crashes if undefined is passed. ensure it is string or null.
            distance: job.distance || null
        };

        console.log("Proposal payload:", newProposal);

        try {
            // Sanitize payload to remove any potential undefined values at root or nested levels
            const sanitizedProposal = JSON.parse(JSON.stringify(newProposal));
            await createProposal(sanitizedProposal);
            console.log("Proposal created in DB");
            addNotification('success', "Offer sent successfully!");
        } catch (error: any) {
            console.error("Critical Failure in createProposal:", error);
            // Show detailed logs as requested by user
            addNotification('error', "Failed to send bid. Click for details.", {
                message: error.message,
                code: error.code,
                stack: error.stack,
                proposalPayload: newProposal
            });
            throw error; // Re-throw so the caller knows it failed
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
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
                    <button onClick={onViewProfile} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-orange-500"><UserIcon size={20} /></button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'MARKET', label: t.liveMarket, icon: Search },
                        { id: 'MY_JOBS', label: t.myRequests, icon: Briefcase },
                        { id: 'HISTORY', label: t.historyTab, icon: History },
                        { id: 'TEAM', label: t.teamTab, icon: Users },
                        { id: 'FINANCE', label: t.financialErp, icon: PieChart },
                        { id: 'AGENDA', label: 'Agenda', icon: CalendarDays } // Added Agenda button
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <AnimatePresence mode="wait">

                    {activeTab === 'MARKET' && (
                        <motion.div key="market" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-black text-slate-900 dark:text-white">{t.opportunities}</h2>
                                <span className="text-xs font-bold text-slate-400">{marketJobs.length} avail.</span>
                            </div>

                            {marketJobs.length === 0 ? (
                                <div className="text-center py-20">
                                    <Search className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold">{t.scanningJobs}</p>
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

                    {activeTab === 'MY_JOBS' && (
                        <motion.div key="myjobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">{t.myRequests}</h2>
                            {myJobs.filter(({ job }) => job!.status !== 'COMPLETED' && job!.status !== 'CANCELLED').length === 0 ? (
                                <p className="text-slate-400 text-center py-10">{t.noActiveRequests}</p>
                            ) : (
                                myJobs.filter(({ job }) => job!.status !== 'COMPLETED' && job!.status !== 'CANCELLED').map(({ job, proposal }) => (
                                    <Card
                                        key={job!.id}
                                        className={`p-5 cursor-pointer hover:shadow-lg transition-all border-l-4 ${proposal.status === 'CONFIRMED' ? 'border-l-orange-500' : 'border-l-amber-500'}`}
                                        onClick={() => onChatSelect && onChatSelect(proposal)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white">{job!.title || job!.description}</h3>
                                            {proposal.status === 'CONFIRMED' ? (
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
                        <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
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
                        <motion.div key="agenda" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                                            <CalendarDays size={32} />
                                        </div>
                                        Agenda
                                    </h1>
                                    <p className="text-slate-500 mt-2 font-medium max-w-2xl">
                                        Visualize your scheduled jobs and sync them with your external calendars.
                                    </p>
                                </div>
                                <div className="h-[700px]">
                                    <AgendaTab jobs={agendaJobs} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'TEAM' && (
                        <motion.div key="team" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <TeamManagement />
                        </motion.div>
                    )}

                    {activeTab === 'FINANCE' && (
                        <motion.div key="finance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <ProAnalytics />
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* JOB DETAILS / CUSTOM BID MODAL */}
                <AnimatePresence>
                    {selectedJob && (
                        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
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
            </div>
        </div>
    );
};
