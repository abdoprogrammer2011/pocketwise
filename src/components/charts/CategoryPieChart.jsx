/**
 * Category Pie Chart
 * Shows spending breakdown by category using Recharts.
 * Follows dataviz guidelines: categorical palette, thin marks, proper labels.
 */

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CATEGORY_MAP, CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

const COLORS = CHART_COLORS.light;
const DARK_COLORS = CHART_COLORS.dark;

export function CategoryPieChart({ data, title = 'Spending by Category', height = 280, showLegend = true }) {
  // Validate and prepare data
  const chartData = useMemo(() => {
    if (!data || !data.length) return [];
    const total = data.reduce((sum, d) => sum + d.amount, 0);
    return data
      .filter(d => d.amount > 0)
      .map((d, index) => ({
        ...d,
        categoryLabel: CATEGORY_MAP[d.category]?.label || d.category,
        categoryIcon: CATEGORY_MAP[d.category]?.icon || 'more-horizontal',
        color: COLORS[index % COLORS.length],
        darkColor: DARK_COLORS[index % DARK_COLORS.length],
        percentage: total > 0 ? ((d.amount / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [data]);

  const total = useMemo(() => chartData.reduce((sum, d) => sum + d.amount, 0), [chartData]);

  if (!chartData.length) {
    return (
      <div className="chart-container h-full flex items-center justify-center">
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No spending data yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add expenses to see category breakdown</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[180px]">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="font-medium text-gray-900 dark:text-gray-50">{item.categoryLabel}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">{formatCurrency(item.amount)}</span>
          <span className="font-medium text-gray-900 dark:text-gray-50">{item.percentage}%</span>
        </div>
      </div>
    );
  };

  const CustomLegend = ({ payload }) => (
    <div className="flex flex-wrap gap-2 mt-4 justify-center">
      {payload.map((entry, index) => (
        <div key={entry.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: entry.type === 'circle' ? entry.color : undefined,
              borderRadius: entry.type === 'rect' ? '2px' : '50%',
            }}
          />
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="chart-container h-full" style={{ height }}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4 flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Total: {formatCurrency(total)}
          </span>
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height - (title ? 48 : 0)}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="amount"
            nameKey="categoryLabel"
            label={({ categoryLabel, percentage }) => percentage > 5 ? `${categoryLabel} ${percentage}%` : ''}
            labelLine={false}
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry, index) => (
              <Cell key={entry.category} fill={entry.color} stroke="white" strokeWidth={2} />
            ))}
            <Tooltip content={<CustomTooltip />} />
          </Pie>
          {showLegend && (
            <Legend
              wrapper={CustomLegend}
              layout="vertical"
              align="center"
              verticalAlign="bottom"
              height={100}
              iconType="circle"
              formatter={(value) => CATEGORY_MAP[value]?.label || value}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBarChart({ data, title = 'Spending by Category', height = 300 }) {
  const chartData = useMemo(() => {
    if (!data || !data.length) return [];
    const total = data.reduce((sum, d) => sum + d.amount, 0);
    return data
      .filter(d => d.amount > 0)
      .map((d, index) => ({
        ...d,
        categoryLabel: CATEGORY_MAP[d.category]?.label || d.category,
        color: COLORS[index % COLORS.length],
        darkColor: DARK_COLORS[index % DARK_COLORS.length],
        percentage: total > 0 ? ((d.amount / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [data]);

  const total = useMemo(() => chartData.reduce((sum, d) => sum + d.amount, 0), [chartData]);

  if (!chartData.length) {
    return (
      <div className="chart-container h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No data to display</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900 dark:text-gray-50">{item.categoryLabel}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.amount)} • {item.percentage}%</p>
      </div>
    );
  };

  return (
    <div className="chart-container h-full" style={{ height }}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4 flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Total: {formatCurrency(total)}
          </span>
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height - (title ? 48 : 0)}>
        <PieChart>
          {/* Using PieChart as container for BarChart-like layout */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}