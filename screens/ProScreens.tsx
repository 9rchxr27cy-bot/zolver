
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Euro, Send, X, TrendingUp, Calendar, CheckCircle2, DollarSign, LayoutDashboard, Briefcase, BarChart3, MessageSquare, History, ChevronRight, Clock, Check, Download, FileText, Lock, Crown, ArrowUpRight, Printer, Eye, ChevronDown, AlertCircle, Plus, CreditCard, Banknote, Landmark, Filter, ShieldCheck, User as UserIcon, Users, UserPlus, Power, Trash2, Edit, Save, Upload, Flag, CreditCard as IdCard, Contact, MoreVertical, Camera, ArrowDownRight, PieChart, Wallet, Search, TrendingDown, FileSpreadsheet, Briefcase as Office } from 'lucide-react';
import { Button, Input, Card, LevelBadge } from '../components/ui';
import { MOCK_PRO, CATEGORIES } from '../constants';
import { JobRequest, Proposal, Invoice, User, Transaction } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { createInvoiceObject, downloadInvoicePDF, calculateInvoiceTotals, downloadFiscalReport } from '../utils/pdfGenerator';
import { useDatabase } from '../contexts/DatabaseContext';

interface ProScreensProps {
  onViewProfile: () => void;
  onBid: (jobId: string, amount: number) => void;
  onChatSelect?: (proposal: Proposal) => void;
}

const InvoicePreviewModal: React.FC<{ invoice: Invoice; onClose: () => void }> = ({ invoice, onClose }) => {
    const { t } = useLanguage();

    const paymentLabel = invoice.paymentMethod === 'CARD' ? 'Carte Bancaire' 
                         : invoice.paymentMethod === 'TRANSFER' ? 'Virement Bancaire' 
                         : invoice.paymentMethod === 'CASH' ? 'Espèces'
                         : 'N/A';

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-2xl bg-slate-100 dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Modal Toolbar */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                    <h3 className="font-bold flex items-center gap-2 text-sm md:text-base">
                        <FileText size={18} /> 
                        {t.invoiceNo} #{invoice.id}
                    </h3>
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 hidden md:flex" onClick={() => window.print()}>
                            <Printer size={18} />
                        </Button>
                        <Button 
                            size="sm" 
                            className="bg-orange-500 hover:bg-orange-600 text-white border-none"
                            onClick={() => { downloadInvoicePDF(invoice); onClose(); }}
                        >
                            <Download size={18} className="mr-2" /> <span className="hidden md:inline">{t.downloadPdf}</span>
                        </Button>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* INVOICE PAPER (Scrollable) */}
                <div className="overflow-y-auto p-4 md:p-6 flex-1 bg-slate-200/50 dark:bg-black/20">
                    <div className="bg-white text-slate-900 shadow-xl mx-auto max-w-[210mm] min-h-[297mm] p-6 md:p-12 text-xs md:text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                        
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-100 pb-8 mb-8 gap-4">
                            <div className="space-y-1">
                                <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-widest mb-4">INVOICE</h1>
                                <p className="font-bold text-base md:text-lg">{invoice.issuer.legalName}</p>
                                <p className="text-slate-500 max-w-[200px]">{invoice.issuer.address}</p>
                                <div className="mt-4 text-[10px] md:text-xs text-slate-500 space-y-0.5">
                                    <p>TVA: {invoice.issuer.vatNumber}</p>
                                    <p>RCS: {invoice.issuer.rcsNumber}</p>
                                    <p>IBAN: {invoice.issuer.iban}</p>
                                </div>
                            </div>
                            <div className="text-left md:text-right space-y-1 w-full md:w-auto">
                                <div className="inline-block bg-slate-100 px-4 py-2 rounded-lg text-right mb-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase">{t.invoiceNo}</p>
                                    <p className="text-lg md:text-xl font-mono font-bold text-slate-900">#{invoice.id}</p>
                                </div>
                                <p><span className="text-slate-400 font-medium mr-2">{t.invDate}:</span> {new Date(invoice.date).toLocaleDateString()}</p>
                                <p><span className="text-slate-400 font-medium mr-2">{t.invDue}:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="mb-12">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.invBillTo}</h4>
                            <p className="font-bold text-lg">{invoice.client.name}</p>
                            <p className="text-slate-500">{invoice.client.address}</p>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full mb-12 min-w-[500px]">
                                <thead className="border-b-2 border-slate-900 text-slate-900">
                                    <tr>
                                        <th className="py-3 text-left font-black uppercase text-xs tracking-wider w-[50%]">{t.invDesc}</th>
                                        <th className="py-3 text-center font-black uppercase text-xs tracking-wider">{t.invQty}</th>
                                        <th className="py-3 text-right font-black uppercase text-xs tracking-wider">{t.invRate}</th>
                                        <th className="py-3 text-right font-black uppercase text-xs tracking-wider">TVA</th>
                                        <th className="py-3 text-right font-black uppercase text-xs tracking-wider">{t.invTotal}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invoice.items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="py-4 font-medium text-slate-700">{item.description}</td>
                                            <td className="py-4 text-center text-slate-500">{item.quantity}</td>
                                            <td className="py-4 text-right text-slate-700">€ {item.unitPrice.toFixed(2)}</td>
                                            <td className="py-4 text-right text-slate-500">{item.vatRate}%</td>
                                            <td className="py-4 text-right font-bold text-slate-900">€ {item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end mb-12">
                            <div className="w-full md:w-1/2 space-y-3">
                                <div className="flex justify-between text-slate-500">
                                    <span>{t.invSubtotal}</span>
                                    <span className="font-mono">€ {invoice.subtotalHT.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>{t.invVatAmt} (17%)</span>
                                    <span className="font-mono">€ {invoice.totalVAT.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t-2 border-slate-900 pt-3 text-lg font-black text-slate-900">
                                    <span>{t.invTotalDue}</span>
                                    <span>€ {invoice.totalTTC.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-2">
                                    <span>{t.paymentMethod}</span>
                                    <span className="font-bold uppercase">{paymentLabel}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-100 pt-8 text-center text-xs text-slate-400">
                            <p className="font-medium mb-1">{invoice.issuer.legalName} • {invoice.issuer.address}</p>
                            <p>{t.invFooter}</p>
                            <p className="mt-2 font-mono">Bank: {invoice.issuer.bankName || 'BGL BNP Paribas'} • IBAN: {invoice.issuer.iban} • BIC: {invoice.issuer.bic || 'N/A'}</p>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const TeamManagement: React.FC = () => {
    const { t } = useLanguage();
    const { getStaffMembers, createStaff, updateUser, deleteUser } = useDatabase();
    const currentUser = JSON.parse(localStorage.getItem('servicebid_current_session_user') || '{}');
    const [staffList, setStaffList] = useState<User[]>(getStaffMembers(currentUser.id));
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
    
    // TABBED STATE FOR FORM
    const [staffTab, setStaffTab] = useState<'IDENTITY' | 'LEGAL'>('IDENTITY');
    
    const [hrForm, setHrForm] = useState({
        name: '', surname: '', email: '', phone: '', password: '', confirmPassword: '', jobTitle: '', 
        avatar: '', nationality: 'Luxembourgish', cnsNumber: '', idCardNumber: '', birthDate: '',
    });

    useEffect(() => { setStaffList(getStaffMembers(currentUser.id)); }, [isStaffModalOpen]);

    const resetForm = () => {
        setHrForm({ name: '', surname: '', email: '', phone: '', password: '', confirmPassword: '', jobTitle: '', avatar: '', nationality: 'Luxembourgish', cnsNumber: '', idCardNumber: '', birthDate: '' });
        setEditingStaffId(null);
        setStaffTab('IDENTITY');
    };

    const handleSaveStaff = () => {
        if (!hrForm.name || !hrForm.email) return;
        const staffData: Partial<User> = {
            name: `${hrForm.name} ${hrForm.surname}`.trim(),
            email: hrForm.email, phone: hrForm.phone, jobTitle: hrForm.jobTitle,
            avatar: hrForm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${hrForm.name}`,
            nationality: hrForm.nationality, cnsNumber: hrForm.cnsNumber, idCardNumber: hrForm.idCardNumber, birthDate: hrForm.birthDate
        };
        if (hrForm.password && hrForm.password === hrForm.confirmPassword) staffData.password = hrForm.password;
        
        if (editingStaffId) {
            const existingStaff = staffList.find(s => s.id === editingStaffId);
            if (existingStaff) { 
                updateUser({ ...existingStaff, ...staffData }); 
                setStaffList(prev => prev.map(u => u.id === editingStaffId ? { ...existingStaff, ...staffData } : u)); 
            }
        } else { 
            createStaff(currentUser.id, staffData); 
        }
        setIsStaffModalOpen(false); 
        resetForm();
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Users className="text-orange-500" /> {t.manageTeam}</h2>
                    <p className="text-slate-500 text-sm mt-1">{t.manageTeamDesc}</p>
                </div>
                <Button onClick={() => { resetForm(); setIsStaffModalOpen(true); }} className="flex items-center gap-2 bg-slate-900 dark:bg-white dark:text-slate-900 w-full sm:w-auto shadow-lg"><UserPlus size={18} /> {t.addMember}</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffList.map(staff => (
                    <div key={staff.id} className={`group relative bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all hover:shadow-lg ${staff.isActive ? 'border-slate-100 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 opacity-60 grayscale'}`}>
                        <div className="flex items-center gap-4">
                            <img src={staff.avatar} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 dark:border-slate-700" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white truncate">{staff.name}</h4>
                                <p className="text-orange-600 dark:text-orange-400 font-bold uppercase text-[10px] tracking-wider mb-1">{staff.jobTitle}</p>
                                <p className="text-xs text-slate-400 truncate">{staff.email}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <button onClick={() => { setEditingStaffId(staff.id); setIsStaffModalOpen(true); }} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"><Edit size={16} /></button>
                                <button onClick={() => { updateUser({ ...staff, isActive: !staff.isActive }); setStaffList(prev => prev.map(u => u.id === staff.id ? { ...u, isActive: !u.isActive } : u)); }} className={`p-2 rounded-lg transition-colors ${staff.isActive ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}><Power size={16} /></button>
                            </div>
                        </div>
                        {staff.cnsNumber && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                                <div><span className="font-bold">CNS:</span> {staff.cnsNumber}</div>
                                <div><span className="font-bold">ID:</span> {staff.idCardNumber}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <AnimatePresence>{isStaffModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsStaffModalOpen(false)} />
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] overflow-hidden relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">{editingStaffId ? t.editMember : t.addMember}</h3>
                                <p className="text-xs text-slate-500">HR & Access Management</p>
                            </div>
                            <button onClick={() => setIsStaffModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>

                        <div className="flex border-b border-slate-200 dark:border-slate-800">
                            <button 
                                onClick={() => setStaffTab('IDENTITY')}
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors ${staffTab === 'IDENTITY' ? 'border-b-2 border-orange-500 text-orange-500 bg-white dark:bg-slate-900' : 'text-slate-400 bg-slate-50 dark:bg-slate-950'}`}
                            >
                                {t.basicDataTab}
                            </button>
                            <button 
                                onClick={() => setStaffTab('LEGAL')}
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors ${staffTab === 'LEGAL' ? 'border-b-2 border-orange-500 text-orange-500 bg-white dark:bg-slate-900' : 'text-slate-400 bg-slate-50 dark:bg-slate-950'}`}
                            >
                                {t.hrDataTab}
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-white dark:bg-slate-900 flex-1">
                            {staffTab === 'IDENTITY' ? (
                                <motion.div key="identity" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative group cursor-pointer" onClick={() => setHrForm({...hrForm, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`})}>
                                            <img src={hrForm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${hrForm.name || 'New'}`} className="w-20 h-20 rounded-2xl bg-slate-100 object-cover border-2 border-slate-100 dark:border-slate-800" />
                                            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera size={20} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Input label={t.fullName} value={hrForm.name} onChange={e => setHrForm({...hrForm, name: e.target.value})} placeholder="First Name" />
                                            <Input placeholder="Last Name" value={hrForm.surname} onChange={e => setHrForm({...hrForm, surname: e.target.value})} />
                                        </div>
                                    </div>

                                    <Input label={t.roleTitle} value={hrForm.jobTitle} onChange={e => setHrForm({...hrForm, jobTitle: e.target.value})} placeholder="e.g. Senior Technician" />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label={t.emailLogin} type="email" value={hrForm.email} onChange={e => setHrForm({...hrForm, email: e.target.value})} />
                                        <Input label={t.phoneLabel} type="tel" value={hrForm.phone} onChange={e => setHrForm({...hrForm, phone: e.target.value})} />
                                    </div>

                                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50">
                                        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2"><Lock size={12} /> App Access</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input type="password" placeholder="Password" value={hrForm.password} onChange={e => setHrForm({...hrForm, password: e.target.value})} className="bg-white dark:bg-slate-900" />
                                            <Input type="password" placeholder="Confirm" value={hrForm.confirmPassword} onChange={e => setHrForm({...hrForm, confirmPassword: e.target.value})} className="bg-white dark:bg-slate-900" />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="legal" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                    <Input type="date" label={t.hrBirthDate} value={hrForm.birthDate} onChange={e => setHrForm({...hrForm, birthDate: e.target.value})} />
                                    
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.hrNationality}</label>
                                        <select 
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                            value={hrForm.nationality}
                                            onChange={e => setHrForm({...hrForm, nationality: e.target.value})}
                                        >
                                            <option value="Luxembourgish">Luxembourgish 🇱🇺</option>
                                            <option value="Portuguese">Portuguese 🇵🇹</option>
                                            <option value="French">French 🇫🇷</option>
                                            <option value="Belgian">Belgian 🇧🇪</option>
                                            <option value="German">German 🇩🇪</option>
                                            <option value="Italian">Italian 🇮🇹</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <Input label={t.hrCns} value={hrForm.cnsNumber} onChange={e => setHrForm({...hrForm, cnsNumber: e.target.value})} placeholder="YYYYMMDDXXXXX" />
                                    <Input label={t.hrIdCard} value={hrForm.idCardNumber} onChange={e => setHrForm({...hrForm, idCardNumber: e.target.value})} />
                                    
                                    <div className="mt-4 p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <Upload size={20} />
                                        <span className="text-xs font-bold">{t.uploadPhoto} (ID/Passport)</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
                            {editingStaffId && (
                                <Button variant="danger" className="mr-auto" onClick={() => { if(window.confirm(t.deleteStaffConfirm)) { deleteUser(editingStaffId); setIsStaffModalOpen(false); } }}>
                                    <Trash2 size={18} />
                                </Button>
                            )}
                            <Button variant="ghost" onClick={() => setIsStaffModalOpen(false)}>{t.cancel}</Button>
                            <Button onClick={handleSaveStaff} className="shadow-lg shadow-orange-500/20 px-6">{t.saveEmployee}</Button>
                        </div>
                    </motion.div>
                </div>
            )}</AnimatePresence>
        </div>
    );
};

// --- RESTORED COMPREHENSIVE ERP ANALYTICS ---
const ProAnalytics: React.FC = () => {
  const { t } = useLanguage();
  const { jobs, transactions, addTransaction } = useDatabase(); // UPDATED: Use Database Context for transactions
  
  // -- STATES --
  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH' | 'YEAR' | 'ALL'>('MONTH');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [combinedTransactions, setCombinedTransactions] = useState<Transaction[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Dynamic Categories based on Type
  const EXPENSE_CATEGORIES = [
      'Materials / Stock', 
      'Fuel / Transport', 
      'Rent / Office', 
      'Salaries / Staff', 
      'Taxes / VAT', 
      'Insurance', 
      'Marketing / Ads',
      'Software / Tools',
      'Platform Fees',
      'Other'
  ];

  const INCOME_CATEGORIES = [
      'Service Revenue', 
      'Product Sales', 
      'Consulting', 
      'Refund',
      'Other'
  ];

  // Manual Entry Form State
  const [newTx, setNewTx] = useState({ 
      description: '', 
      amount: '', 
      type: 'CREDIT' as 'CREDIT' | 'DEBIT',
      category: 'Service Revenue',
      paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'TRANSFER',
      date: new Date().toISOString().split('T')[0]
  });

  // Init Data (Mix of Real Jobs + Mock Expenses from Context)
  useEffect(() => {
      // 1. Convert Completed Jobs to Transactions (Calculated on fly from jobs DB)
      const jobTransactions: Transaction[] = jobs
          .filter(j => j.status === 'COMPLETED')
          .map(j => ({
              id: j.id,
              date: j.finishedAt || new Date().toISOString(),
              description: j.title || j.description || 'Service',
              amount: j.finalPrice || 0,
              type: 'CREDIT',
              status: 'COMPLETED',
              jobId: j.id,
              // Map DB payment methods to simpler string if needed, or assume job has it
              // We'll infer payment method if not explicitly stored in job (simulated)
              paymentMethod: j.paymentMethod || 'CASH',
              category: 'Service Revenue'
          }));

      // 2. Combine with stored transactions from Context (Manual Entries + Mocks)
      const allTx = [...jobTransactions, ...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setCombinedTransactions(allTx);
  }, [jobs, transactions]);

  // -- FILTER LOGIC --
  const filteredTransactions = useMemo(() => {
      const now = new Date();
      return combinedTransactions.filter(t => {
          // 1. Time Filter
          const tDate = new Date(t.date);
          let timeMatch = true;
          if (timeRange === 'WEEK') {
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              timeMatch = tDate >= weekAgo;
          } else if (timeRange === 'MONTH') {
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              timeMatch = tDate >= monthAgo;
          } else if (timeRange === 'YEAR') {
              const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
              timeMatch = tDate >= yearAgo;
          }

          // 2. Type Filter
          const typeMatch = typeFilter === 'ALL' || t.type === typeFilter;

          // 3. Search Filter
          const searchMatch = !searchQuery || 
              t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
              (t.amount.toString().includes(searchQuery));

          return timeMatch && typeMatch && searchMatch;
      });
  }, [combinedTransactions, timeRange, typeFilter, searchQuery]);

  // -- CALCULATIONS (On Filtered Data) --
  const totalRevenue = filteredTransactions.filter(t => t.type === 'CREDIT').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'DEBIT').reduce((acc, t) => acc + t.amount, 0);
  
  // Tax Logic: (Revenue - Expenses) * 17% (VAT)
  const taxableIncome = Math.max(0, totalRevenue - totalExpenses);
  const taxProvision = taxableIncome * 0.17;
  const netIncome = taxableIncome - taxProvision;

  // Comparison Logic (Mock - just showing visual difference)
  const prevRevenue = totalRevenue * 0.85; // Simulated 15% growth
  const growth = totalRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  // Payment Breakdown
  const payments = filteredTransactions.filter(t => t.type === 'CREDIT');
  const cashTotal = payments.filter(t => t.paymentMethod === 'CASH').reduce((a, t) => a + t.amount, 0);
  const cardTotal = payments.filter(t => t.paymentMethod === 'CARD').reduce((a, t) => a + t.amount, 0);
  const transferTotal = payments.filter(t => t.paymentMethod === 'TRANSFER').reduce((a, t) => a + t.amount, 0);
  const totalReceived = cashTotal + cardTotal + transferTotal || 1; // avoid div/0

  // Calculate Category Stats for Expenses
  const categoryStats = useMemo(() => {
      const expenseTx = filteredTransactions.filter(t => t.type === 'DEBIT');
      const totalExp = expenseTx.reduce((acc, t) => acc + t.amount, 0) || 1;
      const stats: Record<string, number> = {};
      
      expenseTx.forEach(t => {
          const cat = t.category || 'Other';
          stats[cat] = (stats[cat] || 0) + t.amount;
      });

      // Sort by amount desc
      return Object.entries(stats)
          .sort(([, a], [, b]) => b - a)
          .map(([key, val]) => ({ key, val, percent: (val / totalExp) * 100 }));
  }, [filteredTransactions]);

  const handleAddTransaction = () => {
      if (!newTx.description || !newTx.amount) return;
      const tx: Transaction = {
          id: `manual-${Date.now()}`,
          date: new Date(newTx.date).toISOString(),
          description: newTx.description,
          amount: parseFloat(newTx.amount),
          type: newTx.type,
          status: 'COMPLETED',
          category: newTx.category,
          paymentMethod: newTx.paymentMethod
      };
      
      addTransaction(tx); // PERSIST IN CONTEXT
      setIsAddModalOpen(false);
      // Reset
      setNewTx({ description: '', amount: '', type: 'CREDIT', category: 'Service Revenue', paymentMethod: 'CASH', date: new Date().toISOString().split('T')[0] });
  };

  const downloadReceipt = (tx: Transaction) => {
      alert(`📥 Downloading Receipt #${tx.id}\n\n${tx.description}\nAmount: €${tx.amount}\nDate: ${new Date(tx.date).toLocaleDateString()}`);
  }

  // Effect to switch default category when Type changes in modal
  useEffect(() => {
      if (newTx.type === 'CREDIT') setNewTx(prev => ({ ...prev, category: INCOME_CATEGORIES[0] }));
      else setNewTx(prev => ({ ...prev, category: EXPENSE_CATEGORIES[0] }));
  }, [newTx.type]);

  return (
    <div className="space-y-6 pb-24">
      {/* 1. TOP TOOLBAR */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="text-orange-500" /> {t.financialPerformance}
              </h2>
              <p className="text-slate-500 text-xs mt-1">Real-time ERP & Tax Estimation</p> 
          </div>
          
          <div className="flex flex-wrap gap-2 w-full xl:w-auto">
              {/* Time Filter */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {['WEEK', 'MONTH', 'YEAR', 'ALL'].map((r) => (
                      <button
                          key={r}
                          onClick={() => setTimeRange(r as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === r ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                          {r === 'WEEK' ? '7D' : r === 'MONTH' ? '30D' : r === 'YEAR' ? 'YTD' : 'ALL'}
                      </button>
                  ))}
              </div>

              <Button size="sm" variant="outline" onClick={() => downloadFiscalReport(2024)} className="border-slate-200 dark:border-slate-700">
                  <FileSpreadsheet size={16} className="mr-2 text-green-600" /> Export CSV
              </Button>
              <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                  <Plus size={16} className="mr-2" /> {t.addTransaction}
              </Button>
          </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden group">
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <TrendingUp size={14} /> Revenue
                      </div>
                      <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold">+{growth.toFixed(0)}%</span>
                  </div>
                  <span className="text-3xl font-black tracking-tight">€ {totalRevenue.toFixed(2)}</span>
                  <p className="text-[10px] text-slate-500 mt-2">vs € {prevRevenue.toFixed(2)} prev period</p>
              </div>
              <div className="absolute -bottom-6 -right-6 text-slate-800 opacity-50 group-hover:scale-110 transition-transform"><BarChart3 size={100} /></div>
          </div>

          {/* Expenses */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-red-500 text-xs font-bold uppercase tracking-wider">
                  <ArrowDownRight size={14} /> Expenses
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">€ {totalExpenses.toFixed(2)}</span>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min((totalExpenses/totalRevenue)*100, 100)}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{(totalExpenses/totalRevenue*100 || 0).toFixed(1)}% of revenue</p>
          </div>

          {/* Tax Provision */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
                  <Landmark size={14} /> VAT (17%)
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">€ {taxProvision.toFixed(2)}</span>
              <p className="text-[10px] text-slate-400 mt-2 leading-tight">{t.provisionTax}</p>
          </div>

          {/* Net Income */}
          <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-800 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
                  <PieChart size={14} /> Net Profit
              </div>
              <span className="text-2xl font-black text-orange-600 dark:text-orange-400">€ {netIncome.toFixed(2)}</span>
              <p className="text-[10px] text-orange-700/60 dark:text-orange-300/60 mt-1">After tax provision</p>
          </div>
      </div>

      {/* 3. VISUALIZATIONS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Methods Breakdown */}
          <Card className="p-5">
              <h3 className="font-bold text-sm mb-4 text-slate-700 dark:text-slate-300">Incoming Payment Methods</h3>
              <div className="flex h-4 rounded-full overflow-hidden mb-4">
                  <div className="bg-orange-500 h-full" style={{ width: `${(cashTotal/totalReceived)*100}%` }} />
                  <div className="bg-blue-500 h-full" style={{ width: `${(cardTotal/totalReceived)*100}%` }} />
                  <div className="bg-purple-500 h-full" style={{ width: `${(transferTotal/totalReceived)*100}%` }} />
              </div>
              <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-slate-500">Cash</span>
                      <span className="font-bold">€{cashTotal}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-slate-500">Card</span>
                      <span className="font-bold">€{cardTotal}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-slate-500">Transfer</span>
                      <span className="font-bold">€{transferTotal}</span>
                  </div>
              </div>
          </Card>

          {/* Quick Stats / Top Categories */}
          <Card className="p-5 flex flex-col justify-center">
              <h3 className="font-bold text-sm mb-4 text-slate-700 dark:text-slate-300">Business Expenses Breakdown</h3>
              <div className="space-y-3">
                  {categoryStats.slice(0, 4).map((cat, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">{cat.key}</span>
                          <div className="flex-1 mx-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-400' : 'bg-blue-400'}`} 
                                style={{ width: `${cat.percent}%` }} 
                              />
                          </div>
                          <span className="font-bold">{cat.percent.toFixed(0)}%</span>
                      </div>
                  ))}
                  {categoryStats.length === 0 && <p className="text-xs text-slate-400 italic">No expenses recorded yet.</p>}
              </div>
          </Card>
      </div>

      {/* 4. TRANSACTION MANAGEMENT */}
      <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <History size={18} /> Transactions
              </h3>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-48">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                          type="text" 
                          placeholder="Search..." 
                          className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-orange-500 outline-none"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>

                  {/* Type Filter */}
                  <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shrink-0">
                      {(['ALL', 'CREDIT', 'DEBIT'] as const).map(f => (
                          <button
                              key={f}
                              onClick={() => setTypeFilter(f)}
                              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors ${typeFilter === f ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                          >
                              {f === 'ALL' ? 'All' : f === 'CREDIT' ? 'In' : 'Out'}
                          </button>
                      ))}
                  </div>
              </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold text-xs uppercase sticky top-0 z-10 shadow-sm">
                      <tr>
                          <th className="px-4 py-3 text-left w-24">Date</th>
                          <th className="px-4 py-3 text-left">Description</th>
                          <th className="px-4 py-3 text-left w-32 hidden sm:table-cell">Category</th>
                          <th className="px-4 py-3 text-left w-24">Method</th>
                          <th className="px-4 py-3 text-right w-32">Amount</th>
                          <th className="px-4 py-3 text-center w-16">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredTransactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                              <td className="px-4 py-3 text-slate-500 text-xs">
                                  {new Date(tx.date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                  {tx.description}
                                  {tx.jobId && <span className="ml-2 text-[9px] bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 px-1.5 py-0.5 rounded font-bold uppercase">JOB</span>}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${tx.type === 'DEBIT' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                                      {tx.category || 'General'}
                                  </span>
                              </td>
                              <td className="px-4 py-3">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                                      tx.paymentMethod === 'CASH' ? 'bg-green-50 text-green-600 border-green-100' :
                                      tx.paymentMethod === 'CARD' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                      'bg-purple-50 text-purple-600 border-purple-100'
                                  }`}>
                                      {tx.paymentMethod || 'CASH'}
                                  </span>
                              </td>
                              <td className={`px-4 py-3 text-right font-bold ${tx.type === 'CREDIT' ? 'text-orange-500' : 'text-slate-900 dark:text-white'}`}>
                                  {tx.type === 'CREDIT' ? '+' : '-'} € {tx.amount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                  <button onClick={() => downloadReceipt(tx)} className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                                      <Download size={16} />
                                  </button>
                              </td>
                          </tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                          <tr>
                              <td colSpan={6} className="px-4 py-12 text-center text-slate-400 italic">
                                  {t.noJobsPeriod}
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </Card>

      {/* MANUAL ENTRY MODAL */}
      <AnimatePresence>
          {isAddModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl">
                      <h3 className="text-lg font-black mb-4">{t.addTransaction}</h3>
                      <div className="space-y-4">
                          {/* Type Selector */}
                          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                              <button onClick={() => setNewTx({...newTx, type: 'CREDIT'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newTx.type === 'CREDIT' ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-500' : 'text-slate-500'}`}>Income (Credit)</button>
                              <button onClick={() => setNewTx({...newTx, type: 'DEBIT'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newTx.type === 'DEBIT' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-500' : 'text-slate-500'}`}>Expense (Debit)</button>
                          </div>

                          <Input label="Date" type="date" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} />
                          <Input label={t.invDesc} placeholder="e.g. Tools, Gas, Rent" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} />
                          
                          {/* Advanced Fields */}
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-bold text-slate-500 mb-1 block">Category</label>
                                  <select 
                                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none"
                                      value={newTx.category}
                                      onChange={e => setNewTx({...newTx, category: e.target.value})}
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
                                      onChange={e => setNewTx({...newTx, paymentMethod: e.target.value as any})}
                                  >
                                      <option value="CASH">Cash</option>
                                      <option value="CARD">Card</option>
                                      <option value="TRANSFER">Transfer</option>
                                  </select>
                              </div>
                          </div>

                          <Input label="Amount (€)" type="number" placeholder="0.00" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} />
                          
                          <div className="flex gap-2 justify-end mt-4">
                              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>{t.cancel}</Button>
                              <Button onClick={handleAddTransaction}>{t.saveChanges}</Button>
                          </div>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};

export const ProDashboard: React.FC<ProScreensProps> = ({ onViewProfile, onBid, onChatSelect }) => {
  const { t, tCategory } = useLanguage();
  const { jobs, proposals, createProposal } = useDatabase();
  const [activeTab, setActiveTab] = useState<'MARKET' | 'MY_JOBS' | 'TEAM' | 'FINANCE'>('MARKET');
  const currentUser = JSON.parse(localStorage.getItem('servicebid_current_session_user') || '{}');
  
  // -- MODAL STATE --
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');

  const marketJobs = jobs.filter(j => 
      j.status === 'OPEN' && 
      !proposals.some(p => p.jobId === j.id && p.proId === currentUser.id)
  );

  const myJobs = proposals
      .filter(p => p.proId === currentUser.id)
      .map(p => {
          const job = jobs.find(j => j.id === p.jobId);
          return { job, proposal: p };
      })
      .filter(item => item.job && item.job.status !== 'CANCELLED');

  const handleQuickBid = (job: JobRequest) => {
      const bid = job.suggestedPrice || 100;
      submitProposal(job, bid);
  };

  const handleSubmitBid = () => {
      if (selectedJob) {
          submitProposal(selectedJob, Number(bidAmount) || selectedJob.suggestedPrice || 0);
          setSelectedJob(null);
      }
  };

  const submitProposal = (job: JobRequest, price: number) => {
      const newProposal: Proposal = {
          id: `prop-${Date.now()}`,
          jobId: job.id,
          proId: currentUser.id,
          proName: currentUser.name,
          proAvatar: currentUser.avatar,
          proLevel: currentUser.level || 'Professional',
          proRating: currentUser.rating || 5.0,
          price: price,
          message: "I can help with this.",
          createdAt: new Date().toISOString(),
          status: 'NEGOTIATING', // Fixed status to match types
          distance: job.distance
      };
      createProposal(newProposal);
      alert("Offer sent!");
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
                  { id: 'MY_JOBS', label: t.myRequests, icon: Office },
                  { id: 'TEAM', label: t.teamTab, icon: Users },
                  { id: 'FINANCE', label: t.financialErp, icon: PieChart }
              ].map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          activeTab === tab.id 
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
                              <Card key={job.id} className="p-5 hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">{job.category}</span>
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
                                      >
                                          <Check size={14} className="mr-2" /> Accept €{job.suggestedPrice}
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
                      {myJobs.length === 0 ? (
                          <p className="text-slate-400 text-center py-10">{t.noActiveRequests}</p>
                      ) : (
                          myJobs.map(({ job, proposal }) => (
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
                                >
                                    <Send size={20} className="mr-2" />
                                    Send Offer
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
