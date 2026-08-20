import React, { useState } from 'react';
import { PiggyBank as PiggyIcon, Plus, Trash2, Check } from 'lucide-react';
import { contributeToGoal, deleteGoal } from '../services/goalService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function SavingsGoalCard({ goal }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showInput, setShowInput] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

  const handleContribute = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || Number(amount) <= 0) return;
    try {
      await contributeToGoal(user.uid, goal, Number(amount));
      setAmount('');
      setShowInput(false);
    } catch (err) {
      setError(err.message === 'INSUFFICIENT_BALANCE' ? t('goal.insufficientBalance') : t('common.error'));
    }
  };

  return (
    <div className="glass-panel p-4 relative overflow-hidden">
      {goal.completed && (
        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 bg-primary-500 text-white p-1 rounded-full">
          <Check size={14} />
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="bg-primary-100 text-primary-600 p-2.5 rounded-xl">
          <PiggyIcon size={20} />
        </div>
        <div>
          <p className="font-bold text-slate-700">{goal.title}</p>
          <p className="text-xs text-slate-400">
            {goal.currentAmount} / {goal.targetAmount} {t('common.currency')}
          </p>
        </div>
      </div>

      <div className="w-full h-2.5 bg-white/70 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {showInput ? (
        <form onSubmit={handleContribute} className="flex gap-2">
          <input
            autoFocus
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field py-1.5 text-sm"
            placeholder={t('goal.newContribution')}
          />
          <button type="submit" className="btn-primary px-3 py-1.5 text-sm">
            {t('common.add')}
          </button>
        </form>
      ) : (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowInput(true)}
            className="text-sm font-semibold text-primary-600 flex items-center gap-1 hover:underline"
          >
            <Plus size={15} /> {t('goal.contribute')}
          </button>
          <button
            onClick={() => deleteGoal(user.uid, goal.id)}
            className="text-slate-300 hover:text-red-500 transition-colors"
            aria-label={t('common.delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
