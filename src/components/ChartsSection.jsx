import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

const COLORS = ['#1eaf80', '#ff9f1c', '#3fcb9a', '#e8850a', '#71e2b6', '#94a3b8'];

/** Expects `expenses`: [{ amount, category, date: 'YYYY-MM-DD', ... }] */
export default function ChartsSection({ expenses }) {
  const { t } = useLanguage();

  const categoryData = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(totals).map(([category, value]) => ({
      name: t(`expenseModal.categories.${category}`),
      value,
    }));
  }, [expenses, t]);

  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      const total = expenses
        .filter((e) => e.date === key)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      days.push({ day: label, total });
    }
    return days;
  }, [expenses]);

  const hasData = expenses.length > 0;

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="glass-card p-5">
        <h3 className="font-bold text-slate-700 mb-3">{t('charts.spendingByCategory')}</h3>
        {hasData ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text={t('charts.noData')} />
        )}
      </div>

      <div className="glass-card p-5">
        <h3 className="font-bold text-slate-700 mb-3">{t('charts.weeklyTrends')}</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip />
            <Bar dataKey="total" fill="#1eaf80" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">{text}</div>;
}
