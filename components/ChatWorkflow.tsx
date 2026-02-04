
import React from 'react';
import {
    CheckCircle, X, ArrowRight, MapPin, Play, CheckSquare,
    CreditCard, Banknote, FileText, Download, Car, ArrowLeft
} from 'lucide-react';
import { Button } from './ui';
import { ChatMessage, Invoice, JobRequest } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { downloadInvoicePDF } from '../utils/pdfGenerator';

// --- PROPOSAL CARD ---
export const ProposalCard = ({ msg, onAccept, onDecline, canInterect }: {
    msg: ChatMessage;
    onAccept: () => void;
    onDecline: () => void;
    canInterect: boolean;
}) => {
    const { t } = useLanguage();
    if (!msg.offerDetails) return null;
    const isAccepted = msg.offerDetails.status === 'ACCEPTED';
    const isRejected = msg.offerDetails.status === 'REJECTED';

    return (
        <div className="w-full max-w-[85%] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {t.proposalUpdate}
                </span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base mb-4">
                {t.changeOffer}
            </h4>

            <div className="flex items-center justify-center gap-4 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <div className="text-right">
                    <span className="block text-xs text-slate-400 line-through">€ {msg.offerDetails.oldPrice}</span>
                    <span className="block text-xs text-slate-500">Old Price</span>
                </div>
                <ArrowRight size={16} className="text-slate-300" />
                <div className="text-left">
                    <span className="block text-xl font-black text-orange-500">€ {msg.offerDetails.newPrice}</span>
                    <span className="block text-xs text-slate-500 font-bold">New Price</span>
                </div>
            </div>

            {msg.offerDetails.reason && (
                <p className="text-sm text-slate-500 italic mb-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                    "{msg.offerDetails.reason}"
                </p>
            )}

            {isAccepted ? (
                <div className="w-full bg-green-100 text-green-700 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                    <CheckCircle size={16} /> {t.offerAccepted}
                </div>
            ) : isRejected ? (
                <div className="w-full bg-red-100 text-red-700 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                    <X size={16} /> {t.offerDeclined}
                </div>
            ) : canInterect ? (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onDecline}
                        className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        {t.decline}
                    </Button>
                    <Button
                        size="sm"
                        onClick={onAccept}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
                    >
                        {t.acceptOffer}
                    </Button>
                </div>
            ) : (
                <div className="text-xs text-slate-400 italic py-2">
                    {t.waitingClient}
                </div>
            )}
        </div>
    );
};

// --- STATUS STEPPER (For Pro) ---
export const StatusStepper = ({ currentStep, onStepChange, onStartWork }: {
    currentStep: JobRequest['executionStep'],
    onStepChange: (step: JobRequest['executionStep']) => void,
    onStartWork: () => void
}) => {
    const { t } = useLanguage();

    const steps = [
        { id: 'PENDING', label: t.stepperEnRoute, icon: Car, next: 'EN_ROUTE', actionLabel: t.actionOnWay },
        { id: 'EN_ROUTE', label: t.stepperArrived, icon: MapPin, next: 'ARRIVED', actionLabel: t.actionArrived },
        { id: 'ARRIVED', label: t.stepperStart, icon: Play, next: 'IN_PROGRESS', actionLabel: t.actionStart },
        { id: 'IN_PROGRESS', label: t.stepperFinish, icon: CheckSquare, next: 'FINISHED', actionLabel: t.finishJob },
        // Fallback or mapping for IN_PROGRESS if needed, but we try to stick to STARTED
    ];

    // Find active step index
    // Treat IN_PROGRESS as STARTED for visual purposes if legacy
    const effectiveStep = (currentStep === 'IN_PROGRESS' || (currentStep as unknown as string) === 'FUNDS_ESCROWED') ? 'STARTED' : (currentStep || 'PENDING');

    // If FUNDS_ESCROWED, we are actually at PENDING logic-wise for the stepper (waiting for En Route)
    // Wait, if FUNDS_ESCROWED, we want Pro to click "EN_ROUTE".
    // So if currentStep is FUNDS_ESCROWED, we should treat it as 'PENDING' (which leads to EN_ROUTE).
    const effectiveStepLogic = ((currentStep as unknown as string) === 'FUNDS_ESCROWED' || (currentStep as unknown as string) === 'CONFIRMED') ? 'PENDING' :
        (currentStep === 'IN_PROGRESS') ? 'STARTED' : (currentStep || 'PENDING');

    const activeIndex = steps.findIndex(s => s.id === effectiveStepLogic);

    // Safety check if step not found (e.g. COMPLETED)
    if (activeIndex === -1) return null;

    const currentStepDef = steps[activeIndex];

    // If finished or completed, don't show operational stepper buttons
    if (currentStep === 'FINISHED' || currentStep === 'PAID' || currentStep === 'COMPLETED') {
        return null;
    }

    const handleAction = () => {
        if (currentStepDef.id === 'ARRIVED') {
            onStartWork();
        } else {
            onStepChange(currentStepDef.next as any);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2">
            <div className="flex justify-between items-center mb-3 px-2">
                {steps.map((step, idx) => {
                    const isActive = idx === activeIndex;
                    const isDone = idx < activeIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-1 z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${isActive ? 'bg-orange-500 text-white scale-110 shadow-lg shadow-orange-500/30' :
                                isDone ? 'bg-slate-900 text-white dark:bg-slate-700' :
                                    'bg-slate-100 text-slate-400 dark:bg-slate-800'
                                }`}>
                                {isDone ? <CheckCircle size={14} /> : <step.icon size={14} />}
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wide ${isActive ? 'text-orange-500' : 'text-slate-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
                {/* Connector Line could be added here absolutely positioned */}
            </div>

            {currentStepDef && (
                <Button
                    onClick={handleAction}
                    className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-white shadow-lg h-12 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2"
                >
                    {currentStepDef.id === 'PENDING' && <Car size={18} />}
                    {currentStepDef.id === 'EN_ROUTE' && <MapPin size={18} />}
                    {currentStepDef.id === 'ARRIVED' && <Play size={18} />}
                    {(currentStepDef.id === 'STARTED' || currentStepDef.id === 'IN_PROGRESS') && <CheckSquare size={18} />}
                    {currentStepDef.actionLabel}
                </Button>
            )}
        </div>
    );
};

// --- SECURITY CODE CARD (Client View) ---
export const SecurityCodeCard = ({ code }: { code: string }) => {
    const { t } = useLanguage();
    return (
        <div className="mx-4 mb-2 bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-lg shadow-slate-900/20">
            <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-1">{t.startCodeLabel}</h4>
                <p className="text-xs text-slate-300">Give this code to the pro upon arrival.</p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                <span className="font-mono text-2xl font-black tracking-widest">{code}</span>
            </div>
        </div>
    );
};

// --- INVOICE CARD ---
export const InvoiceCard = ({ invoice }: { invoice: Invoice }) => {
    const { t } = useLanguage();
    return (
        <div className="w-full max-w-sm bg-white dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm mx-auto my-4">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <FileText size={20} className="text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t.invoiceNo}</span>
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">#{invoice.id}</span>
                    </div>
                </div>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
                    {t.executionPaid}
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">{t.invBillTo}</p>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{invoice.client.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">{t.invDate}</p>
                        <p className="font-mono text-xs text-slate-700 dark:text-slate-300">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>{t.invSubtotal}</span>
                        <span>€ {invoice.subtotalHT.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>{t.invVatAmt} (17%)</span>
                        <span>€ {invoice.totalVAT.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                        <span>{t.invTotal}</span>
                        <span className="text-orange-500">€ {invoice.totalTTC.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <Button
                    onClick={() => downloadInvoicePDF(invoice)}
                    variant="outline"
                    size="sm"
                    className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 border-slate-200 dark:border-slate-700"
                >
                    <Download size={14} className="mr-2" /> {t.downloadPdf}
                </Button>
            </div>
        </div>
    );
};
