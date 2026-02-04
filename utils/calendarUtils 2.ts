
import { JobRequest } from '../types';

export const generateGoogleCalendarLink = (job: JobRequest): string => {
    if (!job.scheduledDate) return '';

    // Create Date object from scheduledDate (handle Timestamp or string)
    let date: Date;
    // @ts-ignore
    if (job.scheduledDate.seconds) {
        // @ts-ignore
        date = new Date(job.scheduledDate.seconds * 1000);
    } else {
        date = new Date(job.scheduledDate as string);
    }

    const start = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    // Assume 2 hour duration default
    const end = new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");

    const title = encodeURIComponent(`Job: ${job.category} - ${job.clientName}`);
    const details = encodeURIComponent(`Location: ${job.location || 'Remote'}\nClient: ${job.clientName}`);
    const location = encodeURIComponent(job.location || '');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
};

export const downloadICSFile = (job: JobRequest): void => {
    if (!job.scheduledDate) return;

    let date: Date;
    // @ts-ignore
    if (job.scheduledDate.seconds) {
        // @ts-ignore
        date = new Date(job.scheduledDate.seconds * 1000);
    } else {
        date = new Date(job.scheduledDate as string);
    }

    const start = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");

    const content = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:Job: ${job.category}`,
        `DESCRIPTION:Client: ${job.clientName}`,
        `LOCATION:${job.location || ''}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'job-appointment.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
