/**
 * Savings Progress Chart
 * Circular progress indicator for savings goals.
 */

import { useMemo } from 'react';
import { formatCurrency } from '../../utils/helpers';
import Button from '../ui/Button';

export function SavingsProgressRing({
  current = 0,
  target = 100,
  size = 120,
  strokeWidth = 8,
  showAmount = true,
  className = ''
}) {
  const progress = useMemo(() => Math.min(current / target, 1), [current, target]);
  const circumference = 2 * Math.PI * (size / 2 - strokeWidth);
  const offset = circumference * (1 - progress);
  const percentage = Math.round(progress * 100);

  return (
    <div className={`relative inline-flex ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - strokeWidth}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          className="dark:stroke-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - strokeWidth}
          fill="none"
          stroke="url(#savings-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="savings-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </svg>

      {showAmount && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            {percentage}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatCurrency(current)} / {formatCurrency(target)}
          </span>
        </div>
      )}
    </div>
  );
}

export function SavingsProgressBar({
  current = 0,
  target = 100,
  height = 12,
  showLabel = true,
  className = ''
}) {
  const progress = useMemo(() => Math.min(current / target, 1), [current, target]);
  const percentage = Math.round(progress * 100);

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-gray-50">
            {formatCurrency(current)} / {formatCurrency(target)} ({percentage}%)
          </span>
        </div>
      )}
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-success-500 to-success-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function SavingsGoalCard({ goal, onContribute, onEdit, onDelete }) {
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const remaining = goal.targetAmount - goal.currentAmount;
  const isComplete = progress >= 100;

  return (
    <div className="glass-card-hover p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 truncate">{goal.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{goal.description}</p>
        </div>
        {isComplete && (
          <span className="badge-success flex-shrink-0">Completed!</span>
        )}
      </div>

      <SavingsProgressBar
        current={goal.currentAmount}
        target={goal.targetAmount}
        height={10}
      />

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          {remaining > 0 ? `${formatCurrency(remaining)} to go` : 'Goal reached!'}
        </span>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => onContribute?.(goal)} disabled={isComplete}>
            Add Money
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit?.(goal)}>
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}