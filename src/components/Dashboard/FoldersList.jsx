import React, { useState } from 'react';
import { Folder, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { deleteExpense } from '../../services/expenseService';

/** Expects `folders` and `expenses`: the child's live arrays from their subscriptions. */
export default function FoldersList({ folders, expenses }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [openId, setOpenId] = useState(null);

  if (folders.length === 0) {
    return <p className="text-sm text-slate-400 glass-panel p-4 text-center">{t('child.noFolders')}</p>;
  }

  return (
    <div>
      <h3 className="font-bold text-slate-700 mb-3">{t('child.folders')}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {folders.map((folder) => {
          const isOpen = openId === folder.id;
          const items = expenses.filter((e) => e.folderId === folder.id);

          return (
            <div key={folder.id} className="glass-panel p-4">
              <button onClick={() => setOpenId(isOpen ? null : folder.id)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-100 text-primary-600 p-2 rounded-xl">
                    <Folder size={16} />
                  </div>
                  <div className="text-start">
                    <p className="font-semibold text-slate-700 text-sm">{folder.name}</p>
                    <p className="text-xs text-slate-400">
                      {folder.expenseCount || 0} · {folder.total || 0} {t('common.currency')}
                    </p>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>

              {isOpen && (
                <div className="mt-3 space-y-1.5 border-t border-white/50 pt-3">
                  {items.length === 0 && <p className="text-xs text-slate-400">{t('charts.noData')}</p>}
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        {t(`expenseModal.categories.${it.category}`)} {it.note && `· ${it.note}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">
                          {it.amount} {t('common.currency')}
                        </span>
                        <button
                          onClick={() => deleteExpense(user.uid, it)}
                          className="text-slate-300 hover:text-red-500"
                          aria-label={t('common.delete')}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
