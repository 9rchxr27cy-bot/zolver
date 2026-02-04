import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Appointment } from '../../../types';
import { AddExternalJobModal } from '../../components/calendar/AddExternalJobModal';
import { AppointmentDetailModal } from '../../components/calendar/AppointmentDetailModal';

const locales = { 'pt': pt };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: Appointment;
}

export const CalendarScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { userData } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [view, setView] = useState<View>('month');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Subscribe to appointments
    useEffect(() => {
        if (!userData) return;

        const q = query(
            collection(db, 'appointments'),
            where('professionalId', '==', userData.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const apps = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Appointment));
            setAppointments(apps);
        });

        return () => unsubscribe();
    }, [userData]);

    // Convert appointments to calendar events
    useEffect(() => {
        const calendarEvents: CalendarEvent[] = appointments.map(app => ({
            id: app.id,
            title: app.title,
            start: app.start_datetime.toDate(),
            end: app.end_datetime.toDate(),
            resource: app
        }));
        setEvents(calendarEvents);
    }, [appointments]);

    const eventStyleGetter = (event: CalendarEvent) => {
        const isZolver = event.resource.type === 'zolver_job';
        return {
            style: {
                backgroundColor: isZolver ? '#f97316' : '#3b82f6',
                borderColor: isZolver ? '#ea580c' : '#2563eb',
                color: 'white',
                borderRadius: '6px',
                border: '2px solid',
                fontWeight: 600,
            }
        };
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedAppointment(event.resource);
    };

    const handleSelectSlot = () => {
        setShowAddModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                            📅 My Calendar
                        </h1>
                    </div>

                    {/* Legend */}
                    <div className="hidden sm:flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-orange-500 border-2 border-orange-600" />
                            <span className="text-slate-600 dark:text-slate-400">Zolver Jobs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500 border-2 border-blue-600" />
                            <span className="text-slate-600 dark:text-slate-400">External Jobs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="max-w-7xl mx-auto p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4" style={{ height: 'calc(100vh - 200px)' }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            view={view}
                            onView={setView}
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            selectable
                            eventPropGetter={eventStyleGetter}
                            popup
                            messages={{
                                next: 'Próximo',
                                previous: 'Anterior',
                                today: 'Hoje',
                                month: 'Mês',
                                week: 'Semana',
                                day: 'Dia',
                                agenda: 'Agenda',
                                date: 'Data',
                                time: 'Hora',
                                event: 'Evento',
                                noEventsInRange: 'Sem eventos neste período',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Floating Add Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-full shadow-2xl shadow-orange-500/40 flex items-center justify-center transition-all z-50"
                aria-label="Add external job"
            >
                <Plus size={28} strokeWidth={3} />
            </button>

            {/* Modals */}
            {showAddModal && userData && (
                <AddExternalJobModal
                    professionalId={userData.id}
                    onClose={() => setShowAddModal(false)}
                />
            )}

            {selectedAppointment && (
                <AppointmentDetailModal
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                />
            )}
        </div>
    );
};
