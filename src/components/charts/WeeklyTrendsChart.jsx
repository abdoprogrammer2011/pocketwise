/**
 * Weekly Trends Chart
 * Shows spending trends over weeks using Recharts Area/Line chart.
 * Follows dataviz guidelines: single axis, proper scales, hover layer.
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../constants';
import { formatCurrency, formatDate } from '../../utils/helpers';

const COLORS = CHART_COLORS.light;
const DARK_COLORS = CHART_COLORS.dark;

export function WeeklyTrendsChart({ data, title = 'Weekly Spending Trends', height = 300, showArea = true }) {
  const chartData = useMemo(() => {
    if (!data || !data.length) return [];
    return data.map((week, index) => ({
      week: week.label || week.week,
      total: week.total || 0,
      ...week.byCategory,
    }));
  }, [data]);

  const maxTotal = useMemo(() => Math.max(...chartData.map(d => d.total), 1), [chartData]);

  if (!chartData.length) {
    return (
      <div className="chart-container h-full flex items-center justify-center">
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No weekly data yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add expenses to see trends</p>
        </div>
      </div>
    );
  }

  const categories = useMemo(() => {
    const cats = new Set();
    chartData.forEach(d => {
      Object.keys(d).forEach(k => {
        if (k !== 'week' && k !== 'total') cats.add(k);
      });
    });
    return Array.from(cats);
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const weekData = chartData.find(d => d.week === label);
    if (!weekData) return null;

    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[200px]">
        <p className="font-medium text-gray-900 dark:text-gray-50 mb-2">{label}</p>
        <p className="text-lg font-semibold text-brand-600 dark:text-brand-400 mb-2">
          {formatCurrency(weekData.total)}
        </p>
        {categories.map((cat, index) => {
          const amount = weekData[cat] || 0;
          if (amount === 0) return null;
          return (
            <div key={cat} className="flex justify-between text-sm py-0.5 border-t border-gray-100 dark:border-gray-800">
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {cat}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-50">{formatCurrency(amount)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const YAxisTick = ({ value }) => (
    <span className="text-xs text-gray-500 dark:text-gray-400">
      {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
    </span>
  );

  const XAxisTick = ({ value }) => (
    <span className="text-xs text-gray-500 dark:text-gray-400">{value}</span>
  );

  return (
    <div className="chart-container h-full" style={{ height }}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height - (title ? 40 : 0)}>
        {showArea ? (
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {categories.map((cat, index) => (
                <linearGradient key={cat} id={`color-${cat}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e1e0d9"
              vertical={false}
              horizontal={true}
            />
            <XAxis
              dataKey="week"
              tick={<XAxisTick />}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              tick={<YAxisTick />}
              tickLine={false}
              axisLine={false}
              dx={-10}
              domain={[0, maxTotal * 1.2]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="top"
              height={36}
              iconType="circle"
              formatter={(value) => value}
            />
            {categories.map((cat, index) => (
              <Area
                key={cat}
                type="monotone"
                dataKey={cat}
                stackId="1"
                stroke={COLORS[index % COLORS.length]}
                fill={`url(#color-${cat})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ))}
            <Line
              type="monotone"
              dataKey="total"
              stroke="#0b0b0b"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, fill: 'white', stroke: '#0b0b0b' }}
              legendType="line"
              name="Total"
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e1e0d9"
              vertical={false}
              horizontal={true}
            />
            <XAxis
              dataKey="week"
              tick={<XAxisTick />}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              tick={<YAxisTick />}
              tickLine={false}
              axisLine={false}
              dx={-10}
              domain={[0, maxTotal * 1.2]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="top"
              height={36}
              iconType="line"
            />
            {categories.map((cat, index) => (
              <Line
                key={cat}
                type="monotone"
                dataKey={cat}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: 'white', stroke: COLORS[index % COLORS.length] }}
                name={cat}
              />
            ))}
            <Line
              type="monotone"
              dataKey="total"
              stroke="#0b0b0b"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, fill: 'white', stroke: '#0b0b0b' }}
              legendType="line"
              name="Total"
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function DailyTrendsChart({ data, title = 'Daily Spending', height = 280 }) {
  const chartData = useMemo(() => {
    if (!data || !data.length) return [];
    return data.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: d.date,
      total: d.total || 0,
    }));
  }, [data]);

  const maxTotal = useMemo(() => Math.max(...chartData.map(d => d.total), 1), [chartData]);

  if (!chartData.length) {
    return (
      <div className="chart-container h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No daily data yet</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900 dark:text-gray-50">{item.date}</p>
        <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
          {formatCurrency(item.total)}
        </p>
      </div>
    );
  };

  const YAxisTick = ({ value }) => (
    <span className="text-xs text-gray-500 dark:text-gray-400">
      {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : formatCurrency(value)}
    </span>
  );

  return (
    <div className="chart-container h-full" style={{ height }}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height - (title ? 40 : 0)}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="color-daily" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e1e0d9"
            vertical={false}
            horizontal={true}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#898781' }}
            tickLine={false}
            axisLine={false}
            dy={10}
            interval={chartData.length > 14 ? 'preserveStartEnd' : 0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#898781' }}
            tickLine={false}
            axisLine={false}
            dx={-10}
            domain={[0, maxTotal * 1.2]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke={COLORS[0]}
            fill="url(#color-daily)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2, fill: 'white', stroke: COLORS[0] }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}