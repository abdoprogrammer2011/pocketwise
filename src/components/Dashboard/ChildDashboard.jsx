import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Wallet, TrendingDown, CalendarClock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { subscribeToExpenses, subscribeToFolders } from '../../services/expenseService';
import { subscribeToGoals } from '../../services/goalService';
import { subscribeToBadges, awardBadgeIfNew } from '../../services/badgeService';
import { hasSaverStreak, isUnderBudget, isBigSaver } from '../../utils/badgeRules';
import ExpenseModal from '../ExpenseModal';
import SavingsGoalCard from '../SavingsGoalCard';
import ChartsSection from '../ChartsSection';
import BudgetSplitter from '../BudgetSplitter';
import PiggyBank from '../PiggyBank';
import BadgesSection from '../BadgesSection';
import AddGoalModal from './AddGoalModal';
import FoldersList from './FoldersList';

export default function ChildDashboard() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [expenses, setExpenses] = useState([]);
  const [folders, setFolders] = useState([]);
  const [goals, setGoals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // -------------------------------------------------------------------------
  // This is where the UI connects to Firestore's real-time listeners: each
  // subscribeTo*() call returns an unsubscribe function from onSnapshot(),
  // so any write — from this device *or* a parent's device — updates state
  // here instantly, with no polling and no manual refresh.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    const unsubExpenses = subscribeToExpenses(user.uid, setExpenses);
    const unsubFolders = subscribeToFolders(user.uid, setFolders);
    const unsubGoals = subscribeToGoals(user.uid, setGoals);
    const unsubBadges = subscribeToBadges(user.uid, setBadges);
    return () => {
      unsubExpenses();
      unsubFolders();
      unsubGoals();
      unsubBadges();
    };
  }, [user]);

  // Rule-based gamification: re-evaluate badge conditions whenever the
  // underlying data changes. awardBadgeIfNew() is idempotent, so this is
  // safe to call on every render of this effect.
  useEffect(() => {
    if (!user || !profile) return;
    if (hasSaverStreak(expenses)) awardBadgeIfNew(user.uid, 'saver_streak');
    if (isUnderBudget(expenses, profile.monthlyAllowance)) awardBadgeIfNew(user.uid, 'smart_spender');
    if (isBigSaver(goals)) awardBadgeIfNew(user.uid, 'big_saver');
  }, [expenses, goals, profile, user]);

  const spentThisMonth = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7);
    return expenses.filter((e) => e.date?.startsWith(month)).reduce((s, e) => s + Number(e.amount), 0);
  }, [expenses]);

  if (!profile) return null;

  return (
    <div className="space-y-6 pb-24">
      {/* Header stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={Wallet} label={t('child.balance')} value={`${profile.balance ?? 0} ${t('common.currency')}`} accent="primary" />
        <StatCard icon={TrendingDown} label={t('child.spentThisMonth')} value={`${spentThisMonth} ${t('common.currency')}`} accent="accent" />
        <StatCard
          icon={CalendarClock}
          label={t('child.monthlyAllowance')}
          value={`${profile.monthlyAllowance ?? 0} ${t('common.currency')}`}
          accent="sky"
        />
      </div>

      <FoldersList folders={folders} expenses={expenses} />

      <ChartsSection expenses={expenses} />

      <div className="grid lg:grid-cols-2 gap-5">
        <BudgetSplitter profile={profile} />
        <PiggyBank goals={goals} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-700">{t('child.savingsGoals')}</h3>
          <button
            onClick={() => setShowGoalModal(true)}
            className="text-sm font-semibold text-primary-600 flex items-center gap-1 hover:underline"
          >
            <Plus size={15} /> {t('child.addGoal')}
          </button>
        </div>
        {goals.length === 0 ? (
          <p className="text-sm text-slate-400 glass-panel p-4 text-center">{t('child.noGoalsYet')}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((g) => (
              <SavingsGoalCard key={g.id} goal={g} />
            ))}
          </div>
        )}
      </div>

      <BadgesSection earnedBadges={badges} />

      {/* Floating action button to log a new expense */}
      <button
        onClick={() => setShowExpenseModal(true)}
        className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 btn-primary rounded-full w-14 h-14 flex items-center justify-center shadow-xl shadow-primary-600/30 z-40 !p-0"
        aria-label={t('child.addExpense')}
      >
        <Plus size={26} />
      </button>

      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        folders={folders}
        expenseCount={expenses.length}
      />
      <AddGoalModal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  const accentMap = {
    primary: 'bg-primary-100 text-primary-600',
    accent: 'bg-accent-400/20 text-accent-600',
    sky: 'bg-sky-100 text-sky-600',
  };
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${accentMap[accent]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
