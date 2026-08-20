/**
 * Firestore Data Hooks
 * React hooks that connect real-time Firestore snapshots to UI state.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  subscribeToExpenses,
  subscribeToSavingsGoals,
  subscribeToAllowance,
  subscribeToUserBadges,
} from '../services/firestore';
import { CATEGORY_MAP } from '../constants';
import { groupExpensesByDate, isThisMonth, isThisWeek, startOfDay } from '../utils/helpers';

/**
 * Real-time expenses hook.
 * Components using this hook automatically re-render when Firestore changes.
 */
export function useExpenses(userId, options = {}) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToExpenses(
      userId,
      (data) => {
        setExpenses(data);
        setLoading(false);
      },
      options
    );

    return () => unsubscribe();
  }, [userId, JSON.stringify(options)]);

  const stats = useMemo(() => calculateExpenseStats(expenses), [expenses]);
  const expensesByDate = useMemo(() => groupExpensesByDate(expenses), [expenses]);

  return { expenses, expensesByDate, stats, loading, error };
}

/**
 * Real-time savings goals hook.
 */
export function useSavingsGoals(userId) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToSavingsGoals(userId, (data) => {
      setGoals(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const totalSaved = useMemo(() => goals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0), [goals]);
  const goalsCompleted = useMemo(() => goals.filter(goal => goal.currentAmount >= goal.targetAmount).length, [goals]);

  return { goals, totalSaved, goalsCompleted, loading };
}

/**
 * Real-time monthly allowance hook.
 */
export function useAllowance(userId) {
  const [allowance, setAllowance] = useState(null);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setAllowance(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToAllowance(userId, (data) => {
      setAllowance(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { allowance, loading };
}

/**
 * Real-time badges hook.
 */
export function useBadges(userId) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setBadges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserBadges(userId, (data) => {
      setBadges(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { badges, loading };
}

/**
 * Derived chart data for expenses.
 */
export function useExpenseCharts(expenses) {
  return useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category || 'other';
      acc[category] = (acc[category] || 0) + Number(expense.amount || 0);
      return acc;
    }, {});

    const categoryData = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      name: CATEGORY_MAP[category]?.label || category,
      amount,
    }));

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = startOfDay(date).toISOString().split('T')[0];
      const total = expenses
        .filter(expense => startOfDay(expense.date).toISOString().split('T')[0] === key)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      last7Days.push({ date: key, total });
    }

    const weeklyTrends = buildWeeklyTrends(expenses, 6);

    return { categoryData, dailyData: last7Days, weeklyTrends };
  }, [expenses]);
}

function calculateExpenseStats(expenses) {
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const thisMonth = expenses.filter(expense => isThisMonth(expense.date));
  const thisWeek = expenses.filter(expense => isThisWeek(expense.date));
  const monthlyTotal = thisMonth.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const weeklyTotal = thisWeek.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const todayTotal = expenses
    .filter(expense => startOfDay(expense.date).getTime() === startOfDay(new Date()).getTime())
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  const categoriesUsed = new Set(expenses.map(expense => expense.category)).size;

  return {
    total,
    count: expenses.length,
    average: expenses.length ? total / expenses.length : 0,
    monthlyTotal,
    weeklyTotal,
    todayTotal,
    categoriesUsed,
  };
}

function buildWeeklyTrends(expenses, weeks = 6) {
  const result = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - i * 7);
    const start = startOfDay(weekStart);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const weekExpenses = expenses.filter(expense => {
      const d = new Date(expense.date);
      return d >= start && d <= end;
    });

    const byCategory = weekExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount || 0);
      return acc;
    }, {});

    result.push({
      week: start.toISOString().split('T')[0],
      label: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      total: weekExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      byCategory,
    });
  }
  return result;
}