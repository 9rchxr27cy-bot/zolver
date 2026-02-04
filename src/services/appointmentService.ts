import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Appointment, AppointmentType, AppointmentStatus } from '../../types';

export interface CreateExternalAppointmentData {
    professionalId: string;
    title: string;
    description?: string;
    start: Date;
    end: Date;
    location?: string;
    value?: number;
}

export class AppointmentService {
    /**
     * Create appointment automatically from accepted job
     */
    static async createFromJob(
        jobId: string,
        professionalId: string,
        clientId: string,
        clientName: string,
        clientAvatar: string | undefined,
        service: string,
        description: string,
        scheduledFor: string | 'asap',
        address: any,
        price: number
    ): Promise<string> {
        try {
            // Calculate start/end times
            const startTime = scheduledFor === 'asap'
                ? Timestamp.now()
                : Timestamp.fromDate(new Date(scheduledFor));

            // Default duration: 2 hours
            const endTime = Timestamp.fromMillis(
                startTime.toMillis() + (2 * 60 * 60 * 1000)
            );

            // Build location string
            const locationStr = address
                ? `${address.street} ${address.number}, ${address.postalCode} ${address.city}`
                : undefined;

            const appointment: Omit<Appointment, 'id'> = {
                professionalId,
                clientId,
                jobId,

                title: `${service} - ${clientName}`,
                description,
                start_datetime: startTime,
                end_datetime: endTime,

                type: 'zolver_job',

                address,
                location: locationStr,
                value: price,

                clientName,
                clientAvatar,

                status: 'scheduled',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const ref = await addDoc(collection(db, 'appointments'), appointment);
            console.log('✅ Appointment created from job:', ref.id);
            return ref.id;
        } catch (error) {
            console.error('❌ Error creating appointment from job:', error);
            throw error;
        }
    }

    /**
     * Create external (manual) appointment
     */
    static async createExternal(data: CreateExternalAppointmentData): Promise<string> {
        try {
            const appointment: Omit<Appointment, 'id'> = {
                professionalId: data.professionalId,

                title: data.title,
                description: data.description,
                start_datetime: Timestamp.fromDate(data.start),
                end_datetime: Timestamp.fromDate(data.end),

                type: 'external_job',

                location: data.location,
                value: data.value,

                status: 'scheduled',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const ref = await addDoc(collection(db, 'appointments'), appointment);
            console.log('✅ External appointment created:', ref.id);
            return ref.id;
        } catch (error) {
            console.error('❌ Error creating external appointment:', error);
            throw error;
        }
    }

    /**
     * Update appointment status
     */
    static async updateStatus(
        appointmentId: string,
        status: AppointmentStatus
    ): Promise<void> {
        try {
            const appointmentRef = doc(db, 'appointments', appointmentId);
            await updateDoc(appointmentRef, {
                status,
                updatedAt: Timestamp.now()
            });
            console.log('✅ Appointment status updated:', appointmentId, status);
        } catch (error) {
            console.error('❌ Error updating appointment status:', error);
            throw error;
        }
    }

    /**
     * Delete appointment
     */
    static async deleteAppointment(appointmentId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, 'appointments', appointmentId));
            console.log('✅ Appointment deleted:', appointmentId);
        } catch (error) {
            console.error('❌ Error deleting appointment:', error);
            throw error;
        }
    }

    /**
     * Get all appointments for a professional
     */
    static async getAppointmentsForProfessional(
        professionalId: string
    ): Promise<Appointment[]> {
        try {
            const q = query(
                collection(db, 'appointments'),
                where('professionalId', '==', professionalId)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Appointment));
        } catch (error) {
            console.error('❌ Error fetching appointments:', error);
            throw error;
        }
    }

    /**
     * Check if time slot is available (no overlapping appointments)
     */
    static async isTimeSlotAvailable(
        professionalId: string,
        start: Date,
        end: Date,
        excludeAppointmentId?: string
    ): Promise<boolean> {
        try {
            const appointments = await this.getAppointmentsForProfessional(professionalId);

            return !appointments.some(app => {
                // Skip cancelled appointments
                if (app.status === 'cancelled') return false;

                // Skip the appointment being excluded (for updates)
                if (excludeAppointmentId && app.id === excludeAppointmentId) return false;

                const appStart = app.start_datetime.toDate();
                const appEnd = app.end_datetime.toDate();

                // Check for overlap: new event starts before existing ends AND ends after existing starts
                return (start < appEnd && end > appStart);
            });
        } catch (error) {
            console.error('❌ Error checking availability:', error);
            return false; // Assume not available on error
        }
    }
}
