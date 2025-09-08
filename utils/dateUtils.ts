import { getTodayDateString as getTodayDateStringOriginal } from './dateUtils';

export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  // Adjust for timezone offset to prevent date from shifting
  const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
  return adjustedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats a Date object into 'YYYY-MM-DD' string for date inputs.
 * @param date The date to format.
 * @returns The formatted date string.
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
