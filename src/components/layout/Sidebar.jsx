/**
 * Sidebar Component
 * Navigation sidebar for desktop layouts.
 */

import { useState } from 'react';
import {
  Home,
  Wallet,
  PiggyBank,
  BarChart3,
  Users,
  Settings,
  Bell,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/auth';
import Button from '../ui/Button';

const CHILD_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'expenses', label: 'My Expenses', icon: Wallet, path: '/expenses' },
  { id: 'savings', label: 'Savings Goals', icon: PiggyBank, path: '/savings' },
  { id: 'insights', label: 'Insights', icon: BarChart3, path: '/insights' },
];

const PARENT_NAV = [
  { id: 'overview', label: 'Family Overview', icon: Home, path: '/parent' },
  { id: 'children', label: 'Children', icon: Users, path: '/parent/children' },
  { id: 'allowances', label: 'Allowances', icon: Wallet, path: '/parent/allowances' },
  { id: 'insights', label: 'Insights', icon: BarChart3, path: '/parent/insights' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/parent/settings' },
];

export default function Sidebar({ isOpen, onClose, currentPath, onNavigate }) {
  const { isChild, isParent, profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = isChild ? CHILD_NAV : PARENT_NAV;

  const isActive = (path) => currentPath === path || currentPath.startsWith(path + '/');

  return (
    <aside
      className={`fixed lg:relative inset-y-0 left-0 z-40 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${collapsed ? 'w-20' : 'w-64'}`}
      aria-label="Main navigation"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-50">PocketWise</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={!collapsed ? 'ml-auto' : ''}
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2" role="navigation" aria-label="Main">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onNavigate?.(item.path);
                    onClose?.();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50'
                  }`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>

          {/* Role indicator */}
          {!collapsed && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="px-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Mode
              </p>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-block ${
                isChild
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}>
                {isChild ? 'Kid Mode' : 'Parent Mode'}
              </span>
            </div>
          )}
        </nav>

        {/* Footer: User info & logout */}
        {!collapsed && profile && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar">
                {profile.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-50 truncate">{profile.displayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile.email}</p>
              </div>
            </div>
            <button
              onClick={async () => await logoutUser()}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}