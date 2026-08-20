import React, { useState } from 'react';
import { X, Utensils, Bus, Gamepad2, ShoppingBag, BookOpen, MoreHorizontal } from 'lucide-react';
import { addExpense } from '../services/expenseService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { checkExpenseBadges } from '../utils/badgeRules';

const CATEGORIES = [
  { key: 'food', icon: Utensils },
  { key: 'transport', icon: Bus },
  { key: 'fun', icon: Gamepad2 },
  { key: 'shopping', icon: ShoppingBag },
  { key: 'school', icon: BookOpen },
  { key: 'other', icon: MoreHorizontal },
];

export default function ExpenseModal({ isOpen, onClose, folders, expenseCount }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [folderId, setFolderId] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetAndClose = () => {
    setAmount('');
    setNote('');
    setFolderId('');
    setNewFolderName('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await addExpense(user.uid, {
        amount: Number(amount),
        category,
        note,
        date: today,
        folderId: folderId || undefined,
        folderName: folderId ? undefined : newFolderName || today,
      });
      // Fire-and-check: the "first expense" badge only needs a rough count.
      await checkExpenseBadges(user.uid, (expenseCount || 0) + 1);
      resetAndClose();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="glass-card w-full sm:max-w-md p-6 rounded-b-none sm:rounded-3xl max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-slate-800">{t('expenseModal.title')}</h3>
          <button onClick={resetAndClose} className="text-slate-400 hover:text-slate-700" aria-label={t('common.close')}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100/80 text-red-700 text-sm px-3 py-2 rounded-xl mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">{t('expenseModal.amount')}</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field text-lg font-semibold"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">{t('expenseModal.category')}</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${
                    category === key
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white/60 border-white/60 text-slate-600'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-[11px] font-medium">{t(`expenseModal.categories.${key}`)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">{t('expenseModal.folder')}</label>
            <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className="input-field">
              <option value="">{t('expenseModal.createNewFolder')}</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            {!folderId && (
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={t('expenseModal.folder')}
                className="input-field mt-2"
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">
              {t('expenseModal.note')} <span className="text-slate-400">({t('common.optional')})</span>
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field"
              placeholder={t('expenseModal.notePlaceholder')}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {t('expenseModal.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
