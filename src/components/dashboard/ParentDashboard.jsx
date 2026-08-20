/**
 * Parent Dashboard
 * Overview of linked children's accounts with monitoring and controls.
 */

import { useState, useEffect } from 'react';
import {
  Users,
  Wallet,
  BarChart3,
  Settings,
  Plus,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  PiggyBank,
  MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, subscribeToUserProfile, getChildDashboardData, setAllowance, updateUserProfile } from '../../services/firestore';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { CategoryPieChart } from '../charts/CategoryPieChart';
import { WeeklyTrendsChart } from '../charts/WeeklyTrendsChart';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Modal } from '../ui/Modal';
import Input from '../ui/Input';
import CategoryIcon from '../ui/CategoryIcon';

export default function ParentDashboard({ userId }) {
  const { profile: parentProfile } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const [allowanceAmount, setAllowanceAmount] = useState('');
  const [newChildCode, setNewChildCode] = useState('');

  useEffect(() => {
    loadChildren();
  }, [userId]);

  const loadChildren = async () => {
    if (!parentProfile?.linkedChildren?.length) {
      setChildren([]);
      setLoading(false);
      return;
    }

    try {
      const childrenProfiles = await Promise.all(
        parentProfile.linkedChildren.map(childId => getUserProfile(childId))
      );
      const validChildren = childrenProfiles.filter(Boolean);
      setChildren(validChildren);
      if (validChildren.length && !selectedChild) {
        setSelectedChild(validChildren[0].uid);
      }
    } catch (error) {
      console.error('Failed to load children:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      loadChildData(selectedChild);
    }
  }, [selectedChild]);

  const loadChildData = async (childId) => {
    try {
      setLoading(true);
      const data = await getChildDashboardData(childId);
      setChildData(data);
    } catch (error) {
      console.error('Failed to load child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async () => {
    // Generate a new child code for linking
    const code = `PW-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setNewChildCode(code);
    setShowAddChild(false);
    // In a real app, this would create an invite or show the code to share
    alert(`Share this code with your child: ${code}\nThey'll enter it when creating their account.`);
  };

  const handleSetAllowance = async () => {
    if (!selectedChild || !allowanceAmount) return;
    try {
      await setAllowance(selectedChild, { amount: Number(allowanceAmount) });
      setShowAllowanceModal(false);
      setAllowanceAmount('');
      loadChildData(selectedChild);
    } catch (error) {
      console.error('Failed to set allowance:', error);
    }
  };

  const getChildInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'C';
  };

  const getSpendingStatus = (spent, allowance) => {
    if (!allowance || allowance === 0) return { label: 'No limit set', color: 'badge-gray' };
    const pct = (spent / allowance) * 100;
    if (pct >= 100) return { label: 'Over budget', color: 'badge-error' };
    if (pct >= 80) return { label: 'Near limit', color: 'badge-warning' };
    return { label: 'On track', color: 'badge-success' };
  };

  if (loading && !children.length) {
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Family Overview</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor your children's spending habits</p>
          </div>
          <Button variant="primary" onClick={() => setShowAddChild(true)}>
            <Plus className="w-4 h-4" />
            Add Child
          </Button>
        </div>

        {/* Children Selector Cards */}
        {children.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {children.map((child) => {
              const isActive = selectedChild === child.uid;
              const spent = childData?.stats?.monthlyTotal || 0;
              const allowance = childData?.allowance?.amount || 0;
              const status = getSpendingStatus(spent, allowance);

              return (
                <button
                  key={child.uid}
                  onClick={() => setSelectedChild(child.uid)}
                  className={`glass-card-hover p-4 relative ${isActive ? 'ring-2 ring-brand-500' : ''}`}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full" />
                  )}
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      {getChildInitials(child.displayName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-50 truncate">{child.displayName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {child.age ? `${child.age} years old` : 'Age not set'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Allowance</span>
                      <span className="font-medium text-gray-900 dark:text-gray-50">
                        {allowance > 0 ? formatCurrency(allowance) : 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-500 dark:text-gray-400">Spent</span>
                      <span className="font-medium text-gray-900 dark:text-gray-50">
                        {formatCurrency(spent)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Badge variant={status.color}>{status.label}</Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {children.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">No children linked yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Add your child's account to start monitoring their spending</p>
            <Button variant="primary" onClick={() => setShowAddChild(true)}>
              <Plus className="w-4 h-4" />
              Add First Child
            </Button>
          </div>
        )}

        {/* Selected Child Detail */}
        {selectedChild && childData && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="avatar-lg">
                    {getChildInitials(childData.profile?.displayName)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                      {childData.profile?.displayName}'s Dashboard
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      Monthly allowance: {childData.allowance?.amount
                        ? formatCurrency(childData.allowance.amount)
                        : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={() => { setAllowanceAmount(childData.allowance?.amount || ''); setShowAllowanceModal(true); }}>
                    <Wallet className="w-4 h-4" />
                    Set Allowance
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="This Month"
                value={formatCurrency(childData.stats?.monthlyTotal || 0)}
                icon={<Wallet className="w-5 h-5" />}
                iconColor="text-blue-600 dark:text-blue-400"
                bgColor="bg-blue-50 dark:bg-blue-900/20"
              />
              <StatCard
                title="This Week"
                value={formatCurrency(childData.stats?.weeklyTotal || 0)}
                icon={<TrendingUp className="w-5 h-5" />}
                iconColor="text-purple-600 dark:text-purple-400"
                bgColor="bg-purple-50 dark:bg-purple-900/20"
              />
              <StatCard
                title="Today"
                value={formatCurrency(childData.stats?.todayTotal || 0)}
                icon={<PiggyBank className="w-5 h-5" />}
                iconColor="text-success-600 dark:text-success-400"
                bgColor="bg-success-50 dark:bg-success-900/20"
              />
              <StatCard
                title="Categories Used"
                value={childData.stats?.categoriesUsed || 0}
                icon={<MoreHorizontal className="w-5 h-5" />}
                iconColor="text-warning-600 dark:text-warning-400"
                bgColor="bg-warning-50 dark:bg-warning-900/20"
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <CategoryPieChart
                data={childData.categoryBreakdown}
                title={`${childData.profile?.displayName}'s Spending by Category`}
                height={350}
              />
              <WeeklyTrendsChart
                data={childData.weeklyTrends}
                title="Weekly Spending Trends"
                height={350}
              />
            </div>

            {/* Savings Goals */}
            {childData.goals?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Savings Goals</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {childData.goals.map((goal) => (
                    <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <h4 className="font-medium text-gray-900 dark:text-gray-50 mb-1">{goal.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{goal.description}</p>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-gradient-to-r from-success-500 to-success-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Expenses */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Recent Expenses</h3>
              {childData.recentExpenses?.length > 0 ? (
                <div className="space-y-2">
                  {childData.recentExpenses.map((expense) => (
                    <ParentExpenseRow key={expense.id} expense={expense} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent expenses</p>
              )}
            </div>

            {/* Badges */}
            {childData.badges?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Recent Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {childData.badges.slice(0, 6).map((badge) => (
                    <Badge key={badge.id} variant="primary" className="gap-1">
                      <span data-lucide={badge.icon || 'sparkles'} className="w-3 h-3" />
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <Modal isOpen={showAddChild} onClose={() => setShowAddChild(false)} title="Add Child" size="md">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              To link your child's account, have them create an account and enter this code:
            </p>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
              <code className="text-2xl font-mono font-bold text-brand-600 dark:text-brand-400 tracking-wider">
                {newChildCode}
              </code>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              They'll select "Child/Teen" role and enter this code during registration.
            </p>
            <Button variant="primary" className="w-full" onClick={() => setShowAddChild(false)}>
              Got it
            </Button>
          </div>
        </Modal>

        <Modal isOpen={showAllowanceModal} onClose={() => setShowAllowanceModal(false)} title="Set Monthly Allowance" size="md">
          <div className="space-y-4">
            <Input
              label="Monthly Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="50.00"
              value={allowanceAmount}
              onChange={(e) => setAllowanceAmount(e.target.value)}
              required
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="ghost" onClick={() => setShowAllowanceModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSetAllowance}>Save Allowance</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, iconColor, bgColor }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor} ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ParentExpenseRow({ expense }) {
  const cat = expense.category;
  // Find matching category from constants (would need import)
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
        <CategoryIcon name={cat} className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-gray-50 truncate">{expense.description}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {cat} • {formatDate(expense.date, 'MMM d, yyyy')}
        </p>
      </div>
      <span className="font-semibold text-gray-900 dark:text-gray-50">
        {formatCurrency(expense.amount)}
      </span>
    </div>
  );
}