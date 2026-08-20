import React from 'react';
import * as Icons from 'lucide-react';
import { BADGE_DEFINITIONS } from '../services/badgeService';
import { useLanguage } from '../contexts/LanguageContext';

/** Expects `earnedBadges`: the live badges array from subscribeToBadges(). */
export default function BadgesSection({ earnedBadges }) {
  const { t } = useLanguage();
  const earnedKeys = new Set(earnedBadges.map((b) => b.badgeKey));

  return (
    <div className="glass-card p-5">
      <h3 className="font-bold text-slate-700 mb-4">{t('badges.title')}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Object.entries(BADGE_DEFINITIONS).map(([key, def]) => {
          const Icon = Icons[def.icon] || Icons.Award;
          const earned = earnedKeys.has(key);
          return (
            <div key={key} className="flex flex-col items-center gap-1.5" title={t(`badges.${key}.desc`)}>
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  earned
                    ? `bg-gradient-to-br ${def.color} text-white shadow-lg animate-pop`
                    : 'bg-slate-200/60 text-slate-400'
                }`}
              >
                <Icon size={22} />
              </div>
              <span className={`text-[11px] text-center font-medium ${earned ? 'text-slate-600' : 'text-slate-400'}`}>
                {t(`badges.${key}.name`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
