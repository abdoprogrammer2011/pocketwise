/**
 * Child Dashboard
 * Main dashboard for kids/teens showing balance, quick actions, and insights.
 */

import { useState } from 'react';
import {
  Plus,
  Wallet,
  PiggyBank,
  BarChart3,
  Target,
  Trophy,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useExpenses, useSavingsGoals, useAllowance, useBadges, useExpenseCharts } from '../../hooks/useFirestoreData';
import { addExpense, addToSavingsGoal, createSavingsGoal } from '../../services/firestore';
import { formatCurrency, formatDate, calculatePercentage } from '../../utils/helpers';
import { EXPENSE_CATEGORIES, BADGES, RARITY_COLORS } from '../../constants';
import CategoryIcon from '../ui/CategoryIcon';
import Button from '../ui/Button';
import { ExpenseModal } from '../features/ExpenseModal';
import { SavingsGoalModal, ContributeToGoalModal } from '../features/SavingsGoalModal';
import { SavingsProgressRing, SavingsGoalCard } from '../charts/SavingsProgressChart';
import { CategoryPieChart } from '../charts/CategoryPieChart';
import { WeeklyTrendsChart } from '../charts/WeeklyTrendsChart';
import Badge from '../ui/Badge';

export default function ChildDashboard({ userId }) {
  const { expenses, expensesByDate, stats, loading: expensesLoading } = useExpenses(userId);
  const { goals, totalSaved, goalsCompleted, loading: goalsLoading } = useSavingsGoals(userId);
  const { allowance, loading: allowanceLoading } = useAllowance(userId);
  const { badges, loading: badgesLoading } = useBadges(userId);
  const { categoryData, dailyData, weeklyTrends } = useExpenseCharts(expenses);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributingGoal, setContributingGoal] = useState(null);

  const allowanceAmount = allowance?.amount || 0;
  const totalSpent = stats.monthlyTotal || 0;
  const remaining = Math.max(allowanceAmount - totalSpent, 0);
  const spentPercentage = allowanceAmount > 0 ? (totalSpent / allowanceAmount) * 100 : 0;

  const recentExpenses = expenses.slice(0, 5);
  const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount).slice(0, 3);
  const recentBadges = badges.slice(0, 4);

  const handleAddExpense = async (expenseData) => {
    try {
      await addExpense(userId, expenseData);
      setShowExpenseModal(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const handleAddGoal = async (goalData) => {
    try {
      await createSavingsGoal(userId, goalData);
      setShowGoalModal(false);
      setEditingGoal(null);
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleContribute = async (amount) => {
    try {
      await addToSavingsGoal(userId, contributingGoal.id, amount);
      setShowContributeModal(false);
      setContributingGoal(null);
    } catch (error) {
      console.error('Failed to contribute:', error);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    // Would need to import deleteExpense from firestore
  };

  // Budget Splitter Feature
  const budgetSplit = {
    essentials: Math.round(allowanceAmount * 0.5),
    fun: Math.round(allowanceAmount * 0.3),
    savings: Math.round(allowanceAmount * 0.2),
  };

  if (expensesLoading || goalsLoading || allowanceLoading) {
    return (
      <div className="page-container">
        <div className="page-content space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Hey there! 👋</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Ready to track your spending today?</p>
          </div>
          <Button variant="primary" onClick={() => setShowExpenseModal(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>

        {/* Balance Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Monthly Allowance"
            value={formatCurrency(allowanceAmount)}
            icon={<Wallet className="w-5 h-5" />}
            iconColor="text-blue-600 dark:text-blue-400"
            bgColor="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard
            title="Spent This Month"
            value={formatCurrency(totalSpent)}
            icon={<ArrowUpRight className="w-5 h-5" />}
            iconColor="text-error-600 dark:text-error-400"
            bgColor="bg-error-50 dark:bg-error-900/20"
            trend={{ value: `${spentPercentage.toFixed(0)}% of allowance`, negative: true }}
          />
          <StatCard
            title="Remaining"
            value={formatCurrency(remaining)}
            icon={<PiggyBank className="w-5 h-5" />}
            iconColor="text-success-600 dark:text-success-400"
            bgColor="bg-success-50 dark:bg-success-900/20"
            trend={{ value: `${remaining > 0 ? '+' : ''}${formatCurrency(remaining - totalSpent)} vs last month`, positive: remaining >= totalSpent }}
          />
          <StatCard
            title="Total Saved"
            value={formatCurrency(totalSaved)}
            icon={<Target className="w-5 h-5" />}
            iconColor="text-purple-600 dark:text-purple-400"
            bgColor="bg-purple-50 dark:bg-purple-900/20"
            trend={{ value: `${goalsCompleted} goals completed`, positive: true }}
          />
        </div>

        {/* Progress Ring - Allowance Usage */}
        <div className="glass-card p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Monthly Budget</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Used</span>
                    <span className="font-medium text-gray-900 dark:text-gray-50">{spentPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        spentPercentage >= 90 ? 'bg-error-500' : spentPercentage >= 70 ? 'bg-warning-500' : 'bg-brand-500'
                      }`}
                      style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(budgetSplit.essentials)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Essentials (50%)</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(budgetSplit.fun)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fun (30%)</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-2xl font-bold text-success-600 dark:text-success-400">{formatCurrency(budgetSplit.savings)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Savings (20%)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <SavingsProgressRing
                current={totalSpent}
                target={allowanceAmount || 1}
                size={140}
                strokeWidth={10}
              />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                {formatCurrency(remaining)} left
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions & Savings Goals */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Add Expense by Category */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Quick Add</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowExpenseModal(true)}>
                View All
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {EXPENSE_CATEGORIES.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setEditingExpense({ category: cat.id });
                    setShowExpenseModal(true);
                  }}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 transition-colors text-center"
                >
                  <div className={`${cat.bgColor} w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <CategoryIcon name={cat.icon} className={`w-5 h-5 ${cat.textColor}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Savings Goals */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Savings Goals</h3>
              <Button variant="primary" size="sm" onClick={() => setShowGoalModal(true)}>
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </div>
            {activeGoals.length > 0 ? (
              <div className="space-y-4">
                {activeGoals.map((goal) => (
                  <SavingsGoalCard
                    key={goal.id}
                    goal={goal}
                    onContribute={(g) => { setContributingGoal(g); setShowContributeModal(true); }}
                    onEdit={(g) => { setEditingGoal(g); setShowGoalModal(true); }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PiggyBank className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No savings goals yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first goal to start saving!</p>
                <Button variant="primary" size="sm" className="mt-3" onClick={() => setShowGoalModal(true)}>
                  Create Goal
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryPieChart data={categoryData} title="Spending by Category" height={320} />
          <WeeklyTrendsChart data={weeklyTrends} title="Weekly Trends" height={320} />
        </div>

        {/* Recent Expenses & Badges */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Expenses */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Recent Expenses</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            {recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {recentExpenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onEdit={() => handleEditExpense(expense)}
                    onDelete={() => handleDeleteExpense(expense.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No expenses yet. Add your first one!
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Badges</h3>
              <span className="badge-gray">{badges.length}/{BADGES.length}</span>
            </div>
            <div className="space-y-2">
              {recentBadges.map((badge) => {
                const badgeDef = BADGES.find(b => b.id === badge.badgeId);
                const rarity = badgeDef?.rarity || 'common';
                const rarityStyle = RARITY_COLORS[rarity];
                return (
                  <div key={badge.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rarityStyle.bg} ${rarityStyle.border}`}>
                      <span className={`${rarityStyle.text} text-xl`} data-lucide={badgeDef?.icon || 'sparkles'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-50 truncate">{badgeDef?.name || badge.badgeId}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{badgeDef?.description}</p>
                    </div>
                    <span className={`badge ${rarity === 'legendary' ? 'badge-warning' : rarity === 'epic' ? 'badge-primary' : rarity === 'rare' ? 'badge-primary' : 'badge-gray'}`}>
                      {rarity}
                    </span>
                  </div>
                );
              })}
              {recentBadges.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p>Earn badges by tracking expenses!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <ExpenseModal
          isOpen={showExpenseModal}
          onClose={() => { setShowExpenseModal(false); setEditingExpense(null); }}
          onSubmit={handleAddExpense}
          initialData={editingExpense}
        />

        <SavingsGoalModal
          isOpen={showGoalModal}
          onClose={() => { setShowGoalModal(false); setEditingGoal(null); }}
          onSubmit={handleAddGoal}
          initialData={editingGoal}
        />

        <ContributeToGoalModal
          isOpen={showContributeModal}
          onClose={() => { setShowContributeModal(false); setContributingGoal(null); }}
          onSubmit={handleContribute}
          goal={contributingGoal}
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, iconColor, bgColor, trend }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.positive ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-success-600 dark:text-success-400" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-error-600 dark:text-error-400" />
              )}
              <span className={`text-xs ${trend.positive ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor} ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ExpenseRow({ expense, onEdit, onDelete }) {
  const cat = EXPENSE_CATEGORIES.find(c => c.id === expense.category) || EXPENSE_CATEGORIES[7];

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
      <div className={`${cat.bgColor} w-10 h-10 rounded-lg flex items-center justify-center ${cat.textColor}`}>
        <CategoryIcon name={cat.icon} className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-gray-50 truncate">{expense.description}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {cat.label} • {formatDate(expense.date)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900 dark:text-gray-50">
          {formatCurrency(expense.amount)}
        </span>
        <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Edit">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
      </div>
    </div>
  );
}