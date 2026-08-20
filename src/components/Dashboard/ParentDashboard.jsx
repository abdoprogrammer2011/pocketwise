import React, { useEffect, useState } from 'react';
import { Users, Copy, Check, Wallet } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToLinkedChildren, setMonthlyAllowance, depositAllowance } from '../../services/userService';
import { subscribeToExpenses } from '../../services/expenseService';
import { subscribeToGoals } from '../../services/goalService';
import { subscribeToBadges } from '../../services/badgeService';
import ChartsSection from '../ChartsSection';
import BadgesSection from '../BadgesSection';
import SavingsGoalCard from '../SavingsGoalCard';

export default function ParentDashboard() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [copied, setCopied] = useState(false);

  // Real-time: any child that links using this parent's code appears here
  // immediately, with no action needed from the parent.
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToLinkedChildren(user.uid, (list) => {
      setChildren(list);
      setSelectedChildId((prev) => prev || list[0]?.id || null);
    });
    return unsub;
  }, [user]);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const copyCode = () => {
    navigator.clipboard.writeText(profile?.linkCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{t('parent.yourLinkCode')}</p>
          <p className="text-2xl font-extrabold tracking-widest text-primary-700">{profile?.linkCode}</p>
        </div>
        <button onClick={copyCode} className="btn-secondary flex items-center gap-2 text-sm">
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? t('common.success') : t('parent.shareCode')}
        </button>
      </div>

      {children.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-400">
          <Users size={32} className="mx-auto mb-2" />
          {t('parent.noChildren')}
        </div>
      ) : (
        <>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`glass-panel px-4 py-3 flex items-center gap-2 shrink-0 transition-all ${
                  selectedChildId === child.id ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {child.name?.[0]?.toUpperCase()}
                </div>
                <div className="text-start">
                  <p className="text-sm font-semibold text-slate-700">{child.name}</p>
                  <p className="text-xs text-slate-400">
                    {child.balance ?? 0} {t('common.currency')}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {selectedChild && <ChildDetailPanel key={selectedChild.id} child={selectedChild} />}
        </>
      )}
    </div>
  );
}

function ChildDetailPanel({ child }) {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [allowanceInput, setAllowanceInput] = useState(child.monthlyAllowance || 0);
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    const unsubExpenses = subscribeToExpenses(child.id, setExpenses);
    const unsubGoals = subscribeToGoals(child.id, setGoals);
    const unsubBadges = subscribeToBadges(child.id, setBadges);
    return () => {
      unsubExpenses();
      unsubGoals();
      unsubBadges();
    };
  }, [child.id]);

  const handleSaveAllowance = async () => {
    await setMonthlyAllowance(child.id, Number(allowanceInput));
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount) return;
    await depositAllowance(child.id, Number(depositAmount));
    setDepositAmount('');
  };

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 grid sm:grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">{t('parent.setAllowance')}</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={allowanceInput}
              onChange={(e) => setAllowanceInput(e.target.value)}
              className="input-field"
            />
            <button onClick={handleSaveAllowance} className="btn-primary px-4">
              {t('common.save')}
            </button>
          </div>
        </div>
        <form onSubmit={handleDeposit}>
          <label className="text-sm font-medium text-slate-600 mb-1 block">{t('parent.depositAllowance')}</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="input-field"
              placeholder="0"
            />
            <button type="submit" className="btn-secondary px-4 flex items-center gap-1.5">
              <Wallet size={16} />
              {t('common.add')}
            </button>
          </div>
        </form>
      </div>

      <ChartsSection expenses={expenses} />

      {goals.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-700 mb-3">{t('child.savingsGoals')}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((g) => (
              // Read-only in the parent view: contributing/deleting a goal must
              // happen from the owning child's own account, so interaction is
              // disabled here rather than wiring up write actions against
              // someone else's data.
              <div key={g.id} className="pointer-events-none opacity-90">
                <SavingsGoalCard goal={g} />
              </div>
            ))}
          </div>
        </div>
      )}

      <BadgesSection earnedBadges={badges} />
    </div>
  );
}
