import React, { useState } from 'react';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, addDays
} from 'date-fns';
import { enUS, fr, pt, de, lb } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ExternalLink, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui';
import { JobRequest } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { generateGoogleCalendarLink, downloadICSFile } from '../utils/calendarUtils';

interface AgendaTabProps {
    jobs: JobRequest[];
}

export const AgendaTab: React.FC<AgendaTabProps> = ({ jobs }) => {
    const { language, t } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);

    // Map app languages to date-fns locales
    const localeMap: Record<string, any> = {
        'EN': enUS, 'FR': fr, 'PT': pt, 'DE': de, 'LB': lb
    };
    const currentLocale = localeMap[language] || enUS;

    // Calendar Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: currentLocale });
    const endDate = endOfWeek(monthEnd, { locale: currentLocale });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Helper for Firestore Timestamps (seconds) vs Strings vs Date objects
    const parseDate = (d: any): Date => {
        if (!d) return new Date();
        // If it's a Firestore Timestamp object with seconds
        if (typeof d === 'object' && 'seconds' in d) return new Date(d.seconds * 1000);
        if (typeof d === 'string') return new Date(d);
        return d; // Already a Date
    };

    // Filter jobs for the displayed days (optimization possible here)
    const getJobsForDay = (day: Date) => {
        return jobs.filter(job => {
            if (!job.scheduledDate) return false;
            return isSameDay(parseDate(job.scheduledDate), day);
        });
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <h2 className="text-2xl font-bold capitalize text-slate-800 dark:text-white">
                        {format(currentDate, 'MMMM yyyy', { locale: currentLocale })}
                    </h2>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button onClick={prevMonth} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"><ChevronLeft size={20} /></button>
                        <button onClick={goToToday} className="px-3 text-xs font-bold uppercase hover:bg-white dark:hover:bg-slate-700 rounded transition-colors">{t.today || 'Today'}</button>
                        <button onClick={nextMonth} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"><ChevronRight size={20} /></button>
                    </div>
                </div>

                {/* Simple Legend */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <span className="text-slate-500">Accepted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        <span className="text-slate-500">In Progress</span>
                    </div>
                </div>
            </div>

            {/* Mobile List View (Visible only on small screens) */}
            <div className="block sm:hidden space-y-3 overflow-y-auto flex-1 p-1">
                {jobs
                    .filter(j => isSameMonth(parseDate(j.scheduledDate || ''), currentDate))
                    .sort((a, b) => parseDate(a.scheduledDate || '').getTime() - parseDate(b.scheduledDate || '').getTime())
                    .map(job => (
                        <div
                            key={job.id}
                            onClick={() => setSelectedJob(job)}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform"
                        >
                            <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center text-xs font-bold border
                      ${job.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}
                  `}>
                                <span>{format(parseDate(job.scheduledDate || ''), 'd')}</span>
                                <span className="text-[9px] uppercase">{format(parseDate(job.scheduledDate || ''), 'MMM')}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white">{job.category}</h4>
                                <p className="text-xs text-slate-500">{job.clientName || 'Client'} • {format(parseDate(job.scheduledDate || ''), 'HH:mm')}</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300" />
                        </div>
                    ))}
                {jobs.filter(j => isSameMonth(parseDate(j.scheduledDate || ''), currentDate)).length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-sm">No jobs this month.</div>
                )}
            </div>

            {/* Calendar Grid (Hidden on mobile) */}
            <div className="hidden sm:flex flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex-col min-h-[500px]">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
                    {weekDays.map((d, i) => (
                        <div key={i} className="py-3 text-center text-xs font-bold uppercase text-slate-400">
                            {format(addDays(startDate, i), 'EEE', { locale: currentLocale })}
                        </div>
                    ))}
                </div>

                {/* Days Cells */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 sm:grid-rows-auto">
                    {calendarDays.map((day) => {
                        const dayJobs = getJobsForDay(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isDayToday = isToday(day);

                        return (
                            <div
                                key={day.toString()}
                                className={`min-h-[80px] sm:min-h-[100px] border-b border-r border-slate-100 dark:border-slate-800 p-1 sm:p-2 transition-colors relative
                   ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-950/30' : 'bg-white dark:bg-slate-900'}
                 `}
                            >
                                <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                    ${isDayToday ? 'bg-indigo-600 text-white' : 'text-slate-500'}
                    ${!isCurrentMonth ? 'opacity-30' : ''}
                 `}>
                                    {format(day, 'd')}
                                </div>

                                <div className="flex flex-col gap-1 overflow-y-auto max-h-[70px] sm:max-h-[80px]">
                                    {dayJobs.map(job => (
                                        <button
                                            key={job.id}
                                            onClick={() => setSelectedJob(job)}
                                            className={`text-[9px] sm:text-[10px] text-left px-1.5 py-1 rounded border-l-2 truncate w-full transition-all hover:scale-[1.02] active:scale-95
                         ${job.status === 'CONFIRMED'
                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                    : 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                }
                       `}
                                        >
                                            <span className="font-bold mr-1">{format(parseDate(job.scheduledDate!), 'HH:mm')}</span>
                                            {job.clientName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sync Modal */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedJob(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 z-[110]"
                        >
                            <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <CalendarIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Synch Calendar</h3>
                                    <p className="text-xs text-slate-500">Add this job to your personal agenda</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Service</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{selectedJob.category}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Client</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{selectedJob.clientName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Date</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{format(parseDate(selectedJob.scheduledDate), 'PPP', { locale: currentLocale })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Time</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{format(parseDate(selectedJob.scheduledDate), 'HH:mm')}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start h-12 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    onClick={() => window.open(generateGoogleCalendarLink(selectedJob), '_blank')}
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google" className="w-5 h-5 mr-3" />
                                    Google Calendar
                                    <ExternalLink size={14} className="ml-auto text-slate-400" />
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full justify-start h-12 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    onClick={() => downloadICSFile(selectedJob)}
                                >
                                    <div className="w-5 h-5 mr-3 bg-slate-900 text-white rounded flex items-center justify-center text-[10px] font-bold">iCal</div>
                                    Apple / Outlook (.ics)
                                    <Download size={14} className="ml-auto text-slate-400" />
                                </Button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
