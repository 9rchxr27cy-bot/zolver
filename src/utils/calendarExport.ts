import { format } from 'date-fns';
import type { Appointment } from '../../types';

/**
 * Generate Google Calendar link for an appointment
 */
export function generateGoogleCalendarLink(appointment: Appointment): string {
    const start = appointment.start_datetime.toDate();
    const end = appointment.end_datetime.toDate();

    // Format dates for Google Calendar (YYYYMMDDTHHmmssZ)
    const formatGoogleDate = (date: Date) => {
        return format(date, "yyyyMMdd'T'HHmmss");
    };

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: appointment.title,
        dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
        details: appointment.description || '',
        location: appointment.location || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate ICS file content for an appointment
 */
export function generateICSFile(appointment: Appointment): string {
    const start = appointment.start_datetime.toDate();
    const end = appointment.end_datetime.toDate();

    // Format dates for ICS (YYYYMMDDTHHmmss)
    const formatICSDate = (date: Date) => {
        return format(date, "yyyyMMdd'T'HHmmss");
    };

    const now = new Date();
    const dtstamp = formatICSDate(now);
    const dtstart = formatICSDate(start);
    const dtend = formatICSDate(end);

    // Escape special characters in ICS format
    const escapeICS = (str: string) => {
        return str.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
    };

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Zolver//Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${appointment.id}@zolver.app`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${escapeICS(appointment.title)}`,
        appointment.description ? `DESCRIPTION:${escapeICS(appointment.description)}` : '',
        appointment.location ? `LOCATION:${escapeICS(appointment.location)}` : '',
        `STATUS:CONFIRMED`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');

    return icsContent;
}

/**
 * Download ICS file for mobile/desktop import
 */
export function downloadICS(appointment: Appointment): void {
    const icsContent = generateICSFile(appointment);

    // Create blob and download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appointment.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
}
