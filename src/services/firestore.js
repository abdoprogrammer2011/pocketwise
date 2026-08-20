/**
 * Firestore Service Functions
 * All CRUD operations for PocketWise data
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Timestamp,
  writeBatch,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../constants';
import { generateId, startOfWeek, getWeekLabel, calculateCategoryTotals, startOfMonth, endOfMonth } from '../utils/helpers';

// ============================================================================
// USER PROFILE OPERATIONS
// ============================================================================

/**
 * Create or update user profile
 * @param {string} uid - User ID
 * @param {Object} profileData - Profile data
 * @returns {Promise<void>}
 */
export async function createUserProfile(uid, profileData) {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  await setDoc(userRef, {
    ...profileData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Get user profile
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} User profile or null
 */
export async function getUserProfile(uid) {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Update user profile
 * @param {string} uid - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateUserProfile(uid, updates) {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Link parent and child accounts
 * @param {string} parentUid - Parent user ID
 * @param {string} childUid - Child user ID
 * @returns {Promise<void>}
 */
export async function linkParentChild(parentUid, childUid) {
  const batch = writeBatch(db);

  const parentRef = doc(db, COLLECTIONS.USERS, parentUid);
  const childRef = doc(db, COLLECTIONS.USERS, childUid);

  batch.update(parentRef, {
    linkedChildren: arrayUnion(childUid),
    updatedAt: serverTimestamp(),
  });

  batch.update(childRef, {
    linkedParent: parentUid,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Unlink parent and child accounts
 * @param {string} parentUid - Parent user ID
 * @param {string} childUid - Child user ID
 * @returns {Promise<void>}
 */
export async function unlinkParentChild(parentUid, childUid) {
  const batch = writeBatch(db);

  const parentRef = doc(db, COLLECTIONS.USERS, parentUid);
  const childRef = doc(db, COLLECTIONS.USERS, childUid);

  batch.update(parentRef, {
    linkedChildren: arrayRemove(childUid),
    updatedAt: serverTimestamp(),
  });

  batch.update(childRef, {
    linkedParent: null,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Subscribe to user profile changes (real-time)
 * @param {string} uid - User ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function subscribeToUserProfile(uid, callback) {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  return onSnapshot(userRef, (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

// ============================================================================
// EXPENSE OPERATIONS
// ============================================================================

/**
 * Add a new expense
 * @param {string} userId - User ID (child)
 * @param {Object} expenseData - Expense data
 * @returns {Promise<string>} Expense ID
 */
export async function addExpense(userId, expenseData) {
  const expensesRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.EXPENSES);
  const docRef = await addDoc(expensesRef, {
    ...expenseData,
    amount: Number(expenseData.amount),
    date: expenseData.date instanceof Date ? Timestamp.fromDate(expenseData.date) : Timestamp.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Get expenses for a user with optional filters
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Expenses array
 */
export async function getExpenses(userId, options = {}) {
  const {
    startDate,
    endDate,
    category,
    limit: limitCount = 100,
    orderByField = 'date',
    orderDirection = 'desc',
  } = options;

  let expensesQuery = query(
    collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.EXPENSES),
    orderBy(orderByField, orderDirection),
    limit(limitCount)
  );

  if (startDate) {
    expensesQuery = query(expensesQuery, where('date', '>=', startDate instanceof Date ? Timestamp.fromDate(startDate) : startDate));
  }
  if (endDate) {
    expensesQuery = query(expensesQuery, where('date', '<=', endDate instanceof Date ? Timestamp.fromDate(endDate) : endDate));
  }
  if (category) {
    expensesQuery = query(expensesQuery, where('category', '==', category));
  }

  const snap = await getDocs(expensesQuery);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate ? doc.data().date.toDate() : doc.data().date,
  }));
}

/**
 * Get expenses grouped by date (for folder view)
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Expenses grouped by date
 */
export async function getExpensesByDate(userId, options = {}) {
  const expenses = await getExpenses(userId, options);
  return expenses.reduce((groups, expense) => {
    const dateKey = expense.date instanceof Date
      ? expense.date.toISOString().split('T')[0]
      : expense.date?.split('T')[0] || new Date().toISOString().split('T')[0];

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateKey,
        expenses: [],
        total: 0,
      };
    }
    groups[dateKey].expenses.push(expense);
    groups[dateKey].total += expense.amount;
    return groups;
  }, {});
}

/**
 * Update an expense
 * @param {string} userId - User ID
 * @param {string} expenseId - Expense ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateExpense(userId, expenseId, updates) {
  const expenseRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.EXPENSES, expenseId);
  await updateDoc(expenseRef, {
    ...updates,
    amount: updates.amount ? Number(updates.amount) : undefined,
    date: updates.date instanceof Date ? Timestamp.fromDate(updates.date) : updates.date,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete an expense
 * @param {string} userId - User ID
 * @param {string} expenseId - Expense ID
 * @returns {Promise<void>}
 */
export async function deleteExpense(userId, expenseId) {
  const expenseRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.EXPENSES, expenseId);
  await deleteDoc(expenseRef);
}

/**
 * Subscribe to expenses (real-time)
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function
 * @param {Object} options - Query options
 * @returns {Function} Unsubscribe function
 */
export function subscribeToExpenses(userId, callback, options = {}) {
  const {
    startDate,
    endDate,
    category,
    limit: limitCount = 100,
    orderByField = 'date',
    orderDirection = 'desc',
  } = options;

  let expensesQuery = query(
    collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.EXPENSES),
    orderBy(orderByField, orderDirection),
    limit(limitCount)
  );

  if (startDate) {
    expensesQuery = query(expensesQuery, where('date', '>=', startDate instanceof Date ? Timestamp.fromDate(startDate) : startDate));
  }
  if (endDate) {
    expensesQuery = query(expensesQuery, where('date', '<=', endDate instanceof Date ? Timestamp.fromDate(endDate) : endDate));
  }
  if (category) {
    expensesQuery = query(expensesQuery, where('category', '==', category));
  }

  return onSnapshot(expensesQuery, (snap) => {
    const expenses = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate ? doc.data().date.toDate() : doc.data().date,
    }));
    callback(expenses);
  });
}

/**
 * Get expense statistics
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Statistics
 */
export async function getExpenseStats(userId, startDate, endDate) {
  const expenses = await getExpenses(userId, { startDate, endDate, limit: 1000 });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const byDate = expenses.reduce((acc, e) => {
    const dateKey = e.date instanceof Date ? e.date.toISOString().split('T')[0] : e.date?.split('T')[0];
    acc[dateKey] = (acc[dateKey] || 0) + e.amount;
    return acc;
  }, {});

  const categoryCount = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    count: expenses.length,
    average: expenses.length ? total / expenses.length : 0,
    byCategory,
    byDate,
    categoryCount,
    categoriesUsed: Object.keys(byCategory).length,
  };
}

// ============================================================================
// SAVINGS GOAL OPERATIONS
// ============================================================================

/**
 * Create a savings goal
 * @param {string} userId - User ID
 * @param {Object} goalData - Goal data
 * @returns {Promise<string>} Goal ID
 */
export async function createSavingsGoal(userId, goalData) {
  const goalsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.SAVINGS_GOALS);
  const docRef = await addDoc(goalsRef, {
    ...goalData,
    targetAmount: Number(goalData.targetAmount),
    currentAmount: Number(goalData.currentAmount || 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Get all savings goals for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Goals array
 */
export async function getSavingsGoals(userId) {
  const goalsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.SAVINGS_GOALS);
  const q = query(goalsRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    targetAmount: Number(doc.data().targetAmount),
    currentAmount: Number(doc.data().currentAmount),
    createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
  }));
}

/**
 * Update a savings goal
 * @param {string} userId - User ID
 * @param {string} goalId - Goal ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateSavingsGoal(userId, goalId, updates) {
  const goalRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.SAVINGS_GOALS, goalId);
  await updateDoc(goalRef, {
    ...updates,
    targetAmount: updates.targetAmount ? Number(updates.targetAmount) : undefined,
    currentAmount: updates.currentAmount ? Number(updates.currentAmount) : undefined,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Add amount to savings goal
 * @param {string} userId - User ID
 * @param {string} goalId - Goal ID
 * @param {number} amount - Amount to add
 * @returns {Promise<void>}
 */
export async function addToSavingsGoal(userId, goalId, amount) {
  const goalRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.SAVINGS_GOALS, goalId);
  await updateDoc(goalRef, {
    currentAmount: increment(Number(amount)),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a savings goal
 * @param {string} userId - User ID
 * @param {string} goalId - Goal ID
 * @returns {Promise<void>}
 */
export async function deleteSavingsGoal(userId, goalId) {
  const goalRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.SAVINGS_GOALS, goalId);
  await deleteDoc(goalRef);
}

/**
 * Subscribe to savings goals (real-time)
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function subscribeToSavingsGoals(userId, callback) {
  const goalsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.SAVINGS_GOALS);
  const q = query(goalsRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const goals = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      targetAmount: Number(doc.data().targetAmount),
      currentAmount: Number(doc.data().currentAmount),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
    }));
    callback(goals);
  });
}

// ============================================================================
// ALLOWANCE OPERATIONS
// ============================================================================

/**
 * Set monthly allowance for a child
 * @param {string} childId - Child user ID
 * @param {Object} allowanceData - Allowance data
 * @returns {Promise<void>}
 */
export async function setAllowance(childId, allowanceData) {
  const allowanceRef = doc(db, COLLECTIONS.USERS, childId, COLLECTIONS.ALLOWANCES, 'current');
  await setDoc(allowanceRef, {
    ...allowanceData,
    amount: Number(allowanceData.amount),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Get current allowance
 * @param {string} childId - Child user ID
 * @returns {Promise<Object|null>} Allowance data
 */
export async function getAllowance(childId) {
  const allowanceRef = doc(db, COLLECTIONS.USERS, childId, COLLECTIONS.ALLOWANCES, 'current');
  const snap = await getDoc(allowanceRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Subscribe to allowance changes (real-time)
 * @param {string} childId - Child user ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function subscribeToAllowance(childId, callback) {
  const allowanceRef = doc(db, COLLECTIONS.USERS, childId, COLLECTIONS.ALLOWANCES, 'current');
  return onSnapshot(allowanceRef, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

// ============================================================================
// BADGE OPERATIONS
// ============================================================================

/**
 * Award badge to user
 * @param {string} userId - User ID
 * @param {string} badgeId - Badge ID
 * @returns {Promise<void>}
 */
export async function awardBadge(userId, badgeId) {
  const badgeRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.BADGES, badgeId);
  await setDoc(badgeRef, {
    badgeId,
    awardedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Get user badges
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Badges array
 */
export async function getUserBadges(userId) {
  const badgesRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.BADGES);
  const snap = await getDocs(badgesRef);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    awardedAt: doc.data().awardedAt?.toDate ? doc.data().awardedAt.toDate() : doc.data().awardedAt,
  }));
}

/**
 * Subscribe to user badges (real-time)
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function subscribeToUserBadges(userId, callback) {
  const badgesRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.BADGES);
  return onSnapshot(badgesRef, (snap) => {
    const badges = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      awardedAt: doc.data().awardedAt?.toDate ? doc.data().awardedAt.toDate() : doc.data().awardedAt,
    }));
    callback(badges);
  });
}

// ============================================================================
// ANALYTICS & AGGREGATIONS
// ============================================================================

/**
 * Get weekly spending trend data for charts
 * @param {string} userId - User ID
 * @param {number} weeks - Number of weeks to fetch
 * @returns {Promise<Array>} Weekly data
 */
export async function getWeeklyTrends(userId, weeks = 8) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const expenses = await getExpenses(userId, { startDate, endDate, limit: 1000 });

  // Group by week
  const weeklyData = {};
  expenses.forEach(expense => {
    const date = expense.date instanceof Date ? expense.date : new Date(expense.date);
    const weekStart = startOfWeek(date);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        week: weekKey,
        label: getWeekLabel(weekStart),
        total: 0,
        byCategory: {},
      };
    }
    weeklyData[weekKey].total += expense.amount;
    weeklyData[weekKey].byCategory[expense.category] =
      (weeklyData[weekKey].byCategory[expense.category] || 0) + expense.amount;
  });

  // Fill in missing weeks with zero data
  const result = [];
  let current = startOfWeek(startDate);
  const endWeek = startOfWeek(endDate);

  while (current <= endWeek) {
    const weekKey = current.toISOString().split('T')[0];
    result.push(weeklyData[weekKey] || {
      week: weekKey,
      label: getWeekLabel(current),
      total: 0,
      byCategory: {},
    });
    current.setDate(current.getDate() + 7);
  }

  return result;
}

/**
 * Get category breakdown for pie chart
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Category data
 */
export async function getCategoryBreakdown(userId, startDate, endDate) {
  const expenses = await getExpenses(userId, { startDate, endDate, limit: 1000 });
  const totals = calculateCategoryTotals(expenses);
  const total = Object.values(totals).reduce((a, b) => a + b, 0);

  return Object.entries(totals).map(([category, amount]) => ({
    category,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate badge eligibility and award new badges
 * @param {string} userId - User ID
 * @param {Object} stats - User statistics
 * @returns {Promise<Array>} Newly awarded badges
 */
export async function checkAndAwardBadges(userId, stats) {
  const { BADGES } = await import('../constants/index.js');
  const existingBadges = await getUserBadges(userId);
  const existingBadgeIds = new Set(existingBadges.map(b => b.badgeId));

  const newBadges = [];

  for (const badge of BADGES) {
    if (!existingBadgeIds.has(badge.id) && badge.condition(stats)) {
      await awardBadge(userId, badge.id);
      newBadges.push(badge);
    }
  }

  return newBadges;
}

/**
 * Get child's dashboard data (for parent view)
 * @param {string} childId - Child user ID
 * @returns {Promise<Object>} Dashboard data
 */
export async function getChildDashboardData(childId) {
  const [profile, expenses, goals, allowance, badges, stats] = await Promise.all([
    getUserProfile(childId),
    getExpenses(childId, { limit: 50 }),
    getSavingsGoals(childId),
    getAllowance(childId),
    getUserBadges(childId),
    getExpenseStats(childId, startOfMonth(new Date()), endOfMonth(new Date())),
  ]);

  const weeklyTrends = await getWeeklyTrends(childId, 4);
  const categoryBreakdown = await getCategoryBreakdown(childId, startOfMonth(new Date()), endOfMonth(new Date()));

  return {
    profile,
    recentExpenses: expenses.slice(0, 10),
    goals,
    allowance,
    badges,
    stats,
    weeklyTrends,
    categoryBreakdown,
  };
}