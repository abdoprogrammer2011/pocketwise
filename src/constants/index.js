/**
 * Application Constants
 * Centralized definitions for categories, badges, roles, etc.
 */

// Expense Categories with icons and colors for charts
export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: 'utensils', color: '#2a78d6', bgColor: 'bg-brand-100 dark:bg-brand-900/50', textColor: 'text-brand-700 dark:text-brand-300' },
  { id: 'transport', label: 'Transport', icon: 'bus', color: '#eb6834', bgColor: 'bg-orange-100 dark:bg-orange-900/50', textColor: 'text-orange-700 dark:text-orange-300' },
  { id: 'entertainment', label: 'Entertainment', icon: 'gamepad-2', color: '#1baf7a', bgColor: 'bg-emerald-100 dark:bg-emerald-900/50', textColor: 'text-emerald-700 dark:text-emerald-300' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag', color: '#eda100', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50', textColor: 'text-yellow-700 dark:text-yellow-300' },
  { id: 'education', label: 'Education', icon: 'graduation-cap', color: '#e87ba4', bgColor: 'bg-pink-100 dark:bg-pink-900/50', textColor: 'text-pink-700 dark:text-pink-300' },
  { id: 'health', label: 'Health & Wellness', icon: 'heart-pulse', color: '#008300', bgColor: 'bg-green-100 dark:bg-green-900/50', textColor: 'text-green-700 dark:text-green-300' },
  { id: 'gaming', label: 'Gaming', icon: 'controller', color: '#4a3aa7', bgColor: 'bg-violet-100 dark:bg-violet-900/50', textColor: 'text-violet-700 dark:text-violet-300' },
  { id: 'other', label: 'Other', icon: 'more-horizontal', color: '#e34948', bgColor: 'bg-red-100 dark:bg-red-900/50', textColor: 'text-red-700 dark:text-red-300' },
];

// Category lookup for quick access
export const CATEGORY_MAP = EXPENSE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {});

// Budget Split Presets
export const BUDGET_SPLITS = {
  balanced: { essentials: 50, fun: 30, savings: 20 },
  saver: { essentials: 40, fun: 20, savings: 40 },
  spender: { essentials: 60, fun: 30, savings: 10 },
  custom: { essentials: 0, fun: 0, savings: 0 },
};

// User Roles
export const USER_ROLES = {
  CHILD: 'child',
  PARENT: 'parent',
};

// Badge Definitions
export const BADGES = [
  {
    id: 'first_expense',
    name: 'First Steps',
    description: 'Logged your first expense!',
    icon: 'sparkles',
    condition: (stats) => stats.totalExpenses >= 1,
    rarity: 'common',
  },
  {
    id: 'week_streak',
    name: 'Week Warrior',
    description: 'Logged expenses 7 days in a row',
    icon: 'flame',
    condition: (stats) => stats.streakDays >= 7,
    rarity: 'rare',
  },
  {
    id: 'month_streak',
    name: 'Monthly Master',
    description: 'Logged expenses 30 days in a row',
    icon: 'trophy',
    condition: (stats) => stats.streakDays >= 30,
    rarity: 'epic',
  },
  {
    id: 'saver',
    name: 'Super Saver',
    description: 'Saved 50% of allowance this month',
    icon: 'piggy-bank',
    condition: (stats) => stats.savingsRate >= 50,
    rarity: 'rare',
  },
  {
    id: 'budget_keeper',
    name: 'Budget Keeper',
    description: 'Stayed under budget for 3 months',
    icon: 'shield-check',
    condition: (stats) => stats.monthsUnderBudget >= 3,
    rarity: 'epic',
  },
  {
    id: 'category_explorer',
    name: 'Category Explorer',
    description: 'Used all 8 expense categories',
    icon: 'compass',
    condition: (stats) => stats.categoriesUsed >= 8,
    rarity: 'rare',
  },
  {
    id: 'goal_crusher',
    name: 'Goal Crusher',
    description: 'Completed 5 savings goals',
    icon: 'target',
    condition: (stats) => stats.goalsCompleted >= 5,
    rarity: 'epic',
  },
  {
    id: 'big_saver',
    name: 'Big Saver',
    description: 'Saved over $100 total',
    icon: 'coins',
    condition: (stats) => stats.totalSaved >= 100,
    rarity: 'legendary',
  },
];

// Rarity colors
export const RARITY_COLORS = {
  common: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' },
  rare: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  epic: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  legendary: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
};

// Chart Colors (from dataviz palette - categorical)
export const CHART_COLORS = {
  light: [
    '#2a78d6', // blue
    '#eb6834', // orange
    '#1baf7a', // aqua
    '#eda100', // yellow
    '#e87ba4', // magenta
    '#008300', // green
    '#4a3aa7', // violet
    '#e34948', // red
  ],
  dark: [
    '#3987e5', // blue
    '#d95926', // orange
    '#199e70', // aqua
    '#c98500', // yellow
    '#d55181', // magenta
    '#008300', // green
    '#9085e9', // violet
    '#e66767', // red
  ],
};

// Time period options
export const TIME_PERIODS = [
  { id: 'week', label: 'This Week', days: 7 },
  { id: 'month', label: 'This Month', days: 30 },
  { id: 'quarter', label: 'This Quarter', days: 90 },
  { id: 'year', label: 'This Year', days: 365 },
];

// Default allowance amounts by age (suggestions)
export const ALLOWANCE_SUGGESTIONS = [
  { age: 6, amount: 5 },
  { age: 7, amount: 7 },
  { age: 8, amount: 10 },
  { age: 9, amount: 12 },
  { age: 10, amount: 15 },
  { age: 11, amount: 20 },
  { age: 12, amount: 25 },
  { age: 13, amount: 30 },
  { age: 14, amount: 40 },
  { age: 15, amount: 50 },
  { age: 16, amount: 60 },
  { age: 17, amount: 75 },
  { age: 18, amount: 100 },
];

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Firestore Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  EXPENSES: 'expenses',
  SAVINGS_GOALS: 'savingsGoals',
  ALLOWANCES: 'allowances',
  BADGES: 'badges',
  NOTIFICATIONS: 'notifications',
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  SHORT: 'MM/dd/yyyy',
  ISO: "yyyy-MM-dd",
  MONTH_YEAR: 'MMMM yyyy',
  WEEKDAY: 'EEEE',
};