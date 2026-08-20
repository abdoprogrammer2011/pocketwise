import { awardBadgeIfNew } from '../services/badgeService';

/** Checked right after a new expense is logged. */
export async function checkExpenseBadges(uid, newExpenseCount) {
  if (newExpenseCount === 1) {
    await awardBadgeIfNew(uid, 'first_step');
  }
}

/**
 * Checked whenever the dashboard's expense list changes — true once the
 * child has logged at least one expense on 5+ distinct days.
 */
export function hasSaverStreak(expenses) {
  const days = new Set(expenses.map((e) => e.date));
  return days.size >= 5;
}

/**
 * Checked against the current month's spending vs. the monthly allowance —
 * true if the child has spent something, but stayed at or under 80% of it.
 */
export function isUnderBudget(expenses, monthlyAllowance) {
  if (!monthlyAllowance) return false;
  const month = new Date().toISOString().slice(0, 7);
  const spent = expenses
    .filter((e) => e.date?.startsWith(month))
    .reduce((sum, e) => sum + Number(e.amount), 0);
  return spent > 0 && spent <= monthlyAllowance * 0.8;
}

/** Checked against total saved across all goals. */
export function isBigSaver(goals, threshold = 500) {
  const total = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  return total >= threshold;
}
