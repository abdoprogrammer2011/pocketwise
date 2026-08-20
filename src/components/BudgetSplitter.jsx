import React, { useState, useEffect } from 'react';
import { PieChart as PieIcon, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { updateBudgetSplit } from '../services/userService';
import { awardBadgeIfNew } from '../services/badgeService';

const DEFAULT_SPLIT = { essentials: 50, fun: 30, savings: 20 };

/** Expects the child's live Firestore `profile` (for existing split + allowance defaults). */
export default function BudgetSplitter({ profile }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [split, setSplit] = useState(profile?.budgetSplit || DEFAULT_SPLIT);
  const [amount, setAmount] = useState(profile?.monthlyAllowance || 0);
  const [saved, setSaved] = useState(false);

  // Stay in sync if the split/allowance changes elsewhere (e.g. a parent sets a new allowance).
  useEffect(() => {
    if (profile?.budgetSplit) setSplit(profile.budgetSplit);
    if (profile?.monthlyAllowance) setAmount(profile.monthlyAllowance);
  }, [profile]);

  const total = split.essentials + split.fun + split.savings;

  const handleChange = (key, value) => {
    setSaved(false);
    setSplit((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSave = async () => {
    if (total !== 100) return;
    await updateBudgetSplit(user.uid, split);
    await awardBadgeIfNew(user.uid, 'planner');
    setSaved(true);
  };

  const rows = [
    { key: 'essentials', label: t('budgetSplitter.essentials'), track: 'accent-sky-500' },
    { key: 'fun', label: t('budgetSplitter.fun'), track: 'accent-accent-500' },
    { key: 'savings', label: t('budgetSplitter.savings'), track: 'accent-primary-600' },
  ];

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-primary-100 text-primary-600 p-2 rounded-xl">
          <PieIcon size={18} />
        </div>
        <h3 className="font-bold text-slate-700">{t('budgetSplitter.title')}</h3>
      </div>

      <div className="mb-4">
        <label className="text-sm text-slate-500">{t('budgetSplitter.totalAmount')}</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="input-field mt-1"
        />
      </div>

      <div className="space-y-4">
        {rows.map(({ key, label, track }) => (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-600">{label}</span>
              <span className="text-slate-500">
                {split[key]}% · {Math.round((amount * split[key]) / 100)} {t('common.currency')}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={split[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className={`w-full ${track}`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className={`text-sm font-semibold ${total === 100 ? 'text-primary-600' : 'text-red-500'}`}>
          {total}% {total !== 100 && `· ${t('budgetSplitter.mustEqual100')}`}
        </span>
        <button
          onClick={handleSave}
          disabled={total !== 100}
          className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save size={15} /> {saved ? t('common.success') : t('budgetSplitter.saveSplit')}
        </button>
      </div>
    </div>
  );
}
