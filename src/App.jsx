/**
 * PocketWise App Shell
 * Auth gate + role-based dashboards. Simple view routing (no extra router dependency).
 */

import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ChildDashboard from './components/dashboard/ChildDashboard';
import ParentDashboard from './components/dashboard/ParentDashboard';

function AppShell() {
  const { user, profile, loading, isChild, isParent } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState('home');

  useEffect(() => {
    if (isChild) setView('dashboard');
    if (isParent) setView('parent');
  }, [isChild, isParent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath={`/${view}`}
          onNavigate={(path) => {
            const key = path.replace(/^\//, '').split('/')[0] || 'home';
            setView(key === 'parent' && path !== '/parent' ? path.slice(1) : key);
            setSidebarOpen(false);
          }}
        />
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {isChild && <ChildDashboard userId={user.uid} />}
          {isParent && <ParentDashboard userId={user.uid} />}
          {!isChild && !isParent && (
            <div className="page-content">
              <h1 className="section-title">Welcome to PocketWise</h1>
              <p className="section-subtitle">Your profile is missing a role. Please sign out and register again as a Child or Parent.</p>
            </div>
          )}
        </main>
      </div>
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu overlay"
        />
      )}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
