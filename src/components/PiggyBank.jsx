import React, { useMemo } from 'react';
import { PiggyBank as PiggyIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/** Expects `goals`: the child's live goals array from subscribeToGoals(). */
export default function PiggyBank({ goals }) {
  const { t } = useLanguage();

  const { totalSaved, totalTarget } = useMemo(
    () =>
      goals.reduce(
        (acc, g) => ({
          totalSaved: acc.totalSaved + (g.currentAmount || 0),
          totalTarget: acc.totalTarget + (g.targetAmount || 0),
        }),
        { totalSaved: 0, totalTarget: 0 }
      ),
    [goals]
  );

  const fillPercent = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  return (
    <div className="glass-card p-5 flex items-center gap-5">
      <div className="relative w-20 h-20 shrink-0">
        <div className="absolute inset-0 rounded-full bg-white/60 border border-white/70 overflow-hidden flex items-end">
          <div
            className="w-full bg-gradient-to-t from-primary-500 to-primary-300 transition-all duration-700"
            style={{ height: `${fillPercent}%` }}
          />
        </div>
        <PiggyIcon size={32} className="absolute inset-0 m-auto text-primary-700 drop-shadow" />
      </div>

      <div>
        <h3 className="font-bold text-slate-700">{t('piggyBank.title')}</h3>
        <p className="text-2xl font-extrabold text-primary-700">
          {totalSaved} <span className="text-sm font-medium text-slate-400">{t('common.currency')}</span>
        </p>
        <p className="text-xs text-slate-400">{t('piggyBank.ofGoal', { amount: totalTarget })}</p>
      </div>
    </div>
  );
}
