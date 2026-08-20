import React, { useState } from 'react';
import { X } from 'lucide-react';
import { addGoal } from '../../services/goalService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AddGoalModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !targetAmount) return;
    setSubmitting(true);
    try {
      await addGoal(user.uid, { title, targetAmount: Number(targetAmount) });
      setTitle('');
      setTargetAmount('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-sm p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-slate-800">{t('goal.addGoalTitle')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label={t('common.close')}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">{t('goal.goalName')}</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder={t('goal.goalName')}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">{t('goal.target')}</label>
            <input
              required
              type="number"
              min="1"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="input-field"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {t('common.add')}
          </button>
        </form>
      </div>
    </div>
  );
}
