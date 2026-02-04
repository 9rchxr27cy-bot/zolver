import React from 'react';
import { X, MapPin, Calendar, Clock, Euro, User, ExternalLink, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { Appointment } from '../../../types';
import { generateGoogleCalendarLink, downloadICS } from '../../utils/calendarExport';

interface AppointmentDetailModalProps {
    appointment: Appointment;
    onClose: () => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
    appointment,
    onClose,
}) => {
    const isZolver = appointment.type === 'zolver_job';
    const start = appointment.start_datetime.toDate();
    const end = appointment.end_datetime.toDate();

    const handleGoogleCalendar = () => {
        const url = generateGoogleCalendarLink(appointment);
        window.open(url, '_blank');
    };

    const handleDownloadICS = () => {
        downloadICS(appointment);
    };

    const handleOpenMaps = () => {
        if (appointment.location) {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appointment.location)}`;
            window.open(mapsUrl, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div
                    className={`sticky top-0 p-6 border-b-4 ${isZolver
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        }`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-black uppercase ${isZolver
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-blue-500 text-white'
                                        }`}
                                >
                                    {isZolver ? '🔧 Zolver' : '📋 External'}
                                </span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                {appointment.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg transition"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Date & Time */}
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Calendar className="text-slate-400 mt-1" size={20} />
                            <div>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                    Date
                                </p>
                                <p className="text-lg font-black text-slate-900 dark:text-white">
                                    {format(start, 'EEEE, MMMM d, yyyy')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="text-slate-400 mt-1" size={20} />
                            <div>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                    Time
                                </p>
                                <p className="text-lg font-black text-slate-900 dark:text-white">
                                    {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Client (if Zolver) */}
                    {isZolver && appointment.clientName && (
                        <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            <User className="text-slate-400 mt-1" size={20} />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                    Client
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    {appointment.clientAvatar && (
                                        <img
                                            src={appointment.clientAvatar}
                                            alt={appointment.clientName}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    )}
                                    <p className="text-lg font-black text-slate-900 dark:text-white">
                                        {appointment.clientName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    {appointment.location && (
                        <div className="flex items-start gap-3">
                            <MapPin className="text-slate-400 mt-1" size={20} />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                    Location
                                </p>
                                <p className="text-base text-slate-900 dark:text-white">
                                    {appointment.location}
                                </p>
                                <button
                                    onClick={handleOpenMaps}
                                    className="mt-2 text-sm text-orange-500 hover:text-orange-600 font-bold flex items-center gap-1"
                                >
                                    Open in Maps <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {appointment.description && (
                        <div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                                Description
                            </p>
                            <p className="text-slate-700 dark:text-slate-300">
                                {appointment.description}
                            </p>
                        </div>
                    )}

                    {/* Value */}
                    {appointment.value && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                            <Euro className="text-green-600" size={24} />
                            <div>
                                <p className="text-sm font-bold text-green-600">
                                    Value
                                </p>
                                <p className="text-2xl font-black text-green-700 dark:text-green-500">
                                    €{appointment.value.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Export Buttons */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">
                            Export to Calendar
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleGoogleCalendar}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition"
                            >
                                <Calendar size={18} />
                                Google
                            </button>
                            <button
                                onClick={handleDownloadICS}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition"
                            >
                                <Download size={18} />
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
