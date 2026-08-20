/**
 * Utility Functions for PocketWise
 * Common helpers for formatting, calculations, date handling, etc.
 */

import { DATE_FORMATS } from '../constants';

/**
 * Format currency amount
 * @param {number} amount - Amount in dollars
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format date for display
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format type from DATE_FORMATS
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = DATE_FORMATS.DISPLAY) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const options = {
    [DATE_FORMATS.DISPLAY]: { month: 'short', day: 'numeric', year: 'numeric' },
    [DATE_FORMATS.SHORT]: { month: '2-digit', day: '2-digit', year: 'numeric' },
    [DATE_FORMATS.MONTH_YEAR]: { month: 'long', year: 'numeric' },
    [DATE_FORMATS.WEEKDAY]: { weekday: 'long' },
  }[format];

  if (options) {
    return d.toLocaleDateString('en-US', options);
  }

  // ISO format
  return d.toISOString().split('T')[0];
}

/**
 * Get start of day
 * @param {Date} date - Date object
 * @returns {Date} Start of day
 */
export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 * @param {Date} date - Date object
 * @returns {Date} End of day
 */
export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of week (Monday)
 * @param {Date} date - Date object
 * @returns {Date} Start of week
 */
export function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday = 1
  d.setDate(diff);
  return startOfDay(d);
}

/**
 * Get end of week (Sunday)
 * @param {Date} date - Date object
 * @returns {Date} End of week
 */
export function endOfWeek(date) {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  return endOfDay(d);
}

/**
 * Get start of month
 * @param {Date} date - Date object
 * @returns {Date} Start of month
 */
export function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  return startOfDay(d);
}

/**
 * Get end of month
 * @param {Date} date - Date object
 * @returns {Date} End of month
 */
export function endOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return endOfDay(d);
}

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export function isToday(date) {
  const today = new Date();
  const d = new Date(date);
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}

/**
 * Check if date is in current week
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export function isThisWeek(date) {
  const now = new Date();
  const start = startOfWeek(now);
  const end = endOfWeek(now);
  const d = new Date(date);
  return d >= start && d <= end;
}

/**
 * Check if date is in current month
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export function isThisMonth(date) {
  const now = new Date();
  const d = new Date(date);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

/**
 * Get days difference between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Days difference
 */
export function daysDifference(date1, date2) {
  const d1 = startOfDay(new Date(date1));
  const d2 = startOfDay(new Date(date2));
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generate array of dates for a range
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Date[]} Array of dates
 */
export function getDateRange(start, end) {
  const dates = [];
  const current = startOfDay(new Date(start));
  const endDate = startOfDay(new Date(end));

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places (default: 1)
 * @returns {number} Percentage
 */
export function calculatePercentage(value, total, decimals = 1) {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return Number(percentage.toFixed(decimals));
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
}

/**
 * Group expenses by date
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} Expenses grouped by date string
 */
export function groupExpensesByDate(expenses) {
  return expenses.reduce((groups, expense) => {
    const date = formatDate(expense.date, DATE_FORMATS.ISO);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});
}

/**
 * Group expenses by category
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} Expenses grouped by category
 */
export function groupExpensesByCategory(expenses) {
  return expenses.reduce((groups, expense) => {
    const category = expense.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(expense);
    return groups;
  }, {});
}

/**
 * Calculate expense totals by category
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} Category totals
 */
export function calculateCategoryTotals(expenses) {
  return expenses.reduce((totals, expense) => {
    const category = expense.category || 'other';
    totals[category] = (totals[category] || 0) + (expense.amount || 0);
    return totals;
  }, {});
}

/**
 * Get week label for a date
 * @param {Date} date - Date object
 * @returns {string} Week label (e.g., "Week of Jan 15")
 */
export function getWeekLabel(date) {
  const start = startOfWeek(new Date(date));
  return `Week of ${formatDate(start, DATE_FORMATS.DISPLAY)}`;
}

/**
 * Get month label for a date
 * @param {Date} date - Date object
 * @returns {string} Month label (e.g., "January 2024")
 */
export function getMonthLabel(date) {
  return formatDate(date, DATE_FORMATS.MONTH_YEAR);
}

/**
 * Sort expenses by date (newest first)
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} Sorted expenses
 */
export function sortExpensesByDate(expenses) {
  return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Calculate streak days
 * @param {Array} dates - Array of dates (strings or Date objects)
 * @returns {number} Current streak in days
 */
export function calculateStreak(dates) {
  if (!dates.length) return 0;

  const sortedDates = dates
    .map(d => startOfDay(new Date(d)).getTime())
    .sort((a, b) => b - a);

  let streak = 1;
  const today = startOfDay(new Date()).getTime();

  // Check if today or yesterday has an entry
  const hasToday = sortedDates.includes(today);
  const hasYesterday = sortedDates.includes(today - 86400000);

  if (!hasToday && !hasYesterday) return 0;

  let expectedDate = hasToday ? today : today - 86400000;

  for (let i = 0; i < sortedDates.length; i++) {
    if (sortedDates[i] === expectedDate) {
      streak++;
      expectedDate -= 86400000;
    } else if (sortedDates[i] < expectedDate) {
      break;
    }
  }

  return streak - 1; // Adjust for initial increment
}

/**
 * Get age from birthdate
 * @param {Date|string} birthdate - Birth date
 * @returns {number} Age in years
 */
export function getAge(birthdate) {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('One special character');
  return { isValid: errors.length === 0, errors };
}

/**
 * Convert hex color to rgba
 * @param {string} hex - Hex color
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
export function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 chars)
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format time ago (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export function formatTimeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date, DATE_FORMATS.DISPLAY);
}