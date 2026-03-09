/**
 * Format a date/timestamp to user's system timezone and locale
 * @param {string | Date} dateStr - ISO date string or Date object from API
 * @param {object} options - Additional formatting options
 * @returns {string} - Formatted date string in user's local timezone
 */
export const formatToUserTimezone = (dateStr, options = {}) => {
    try {
        const date = new Date(dateStr);
        
        // Get user's actual system locale
        const userLocale = navigator.language.startsWith('en') ? 'en-GB' : navigator.language;
        
        // Get user's actual system timezone
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Default format options
        const defaultOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: userTimezone,
        };
        
        // Merge with user-provided options
        const finalOptions = { ...defaultOptions, ...options };
        
        return date.toLocaleString(userLocale, finalOptions);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

