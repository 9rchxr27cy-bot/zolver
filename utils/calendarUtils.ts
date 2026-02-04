import { JobRequest } from '../types';

export const generateGoogleCalendarLink = (job: JobRequest): string => {
    if (!job.scheduledDate) return '';

    const startTime = new Date(typeof job.scheduledDate === 'string' ? job.scheduledDate : (job.scheduledDate as any).seconds * 1000);
    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // Default 1 hour duration

    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const title = encodeURIComponent(job.title || job.category);
    const details = encodeURIComponent(job.description);
    const location = encodeURIComponent(job.location);
    const dates = `${formatDate(startTime)}/${formatDate(endTime)}`;

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
};

export const downloadICSFile = (job: JobRequest): string => {
    if (!job.scheduledDate) return '';

    const startTime = new Date(typeof job.scheduledDate === 'string' ? job.scheduledDate : (job.scheduledDate as any).seconds * 1000);
    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000));

    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Zolver//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${job.id}@zolver.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:${job.title || job.category}
DESCRIPTION:${job.description}
LOCATION:${job.location}
END:VEVENT
END:VCALENDAR`;

    return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
};

export const parseDate = (date: any): Date => {
    if (!date) return new Date();
    if (date.seconds) return new Date(date.seconds * 1000);
    if (date instanceof Date) return date;
    return new Date(date);
};
