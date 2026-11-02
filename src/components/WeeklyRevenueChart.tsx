import React, { useState, useMemo } from 'react';
import { Sale } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Banknote, 
  Smartphone, 
  Calendar, 
  ChevronRight,
  Layers,
  Columns
} from 'lucide-react';

interface WeeklyRevenueChartProps {
  sales: Sale[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

interface DayData {
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  dayLabel: string; // Mon 29
  fullDateStr: string;
  cash: number;
  mpesa: number;
  total: number;
  orderCount: number;
  isToday: boolean;
  isSelected: boolean;
}

export const WeeklyRevenueChart: React.FC<WeeklyRevenueChartProps> = ({
  sales,
  selectedDate,
  onSelectDate,
}) => {
  const [chartMode, setChartMode] = useState<'stacked' | 'grouped'>('stacked');
  const [timeRange, setTimeRange] = useState<'current_week' | 'last_7_days'>('current_week');

  const formatKSh = (amount: number) => `KSh ${amount.toLocaleString('en-KE')}`;

  // Generate 7 days for current week or last 7 days
  const weekData = useMemo(() => {
    const today = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(today);
    const days: DayData[] = [];

    if (timeRange === 'current_week') {
      // Calculate Monday of the current week (ISO week starts on Monday)
      const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
      const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(today);
      monday.setDate(today.getDate() + distanceToMonday);
      monday.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
        const dayShort = d.toLocaleDateString('en-GB', { weekday: 'short' });
        const dayNum = d.getDate();

        days.push({
          date: dateStr,
          dayName: dayShort,
          dayLabel: `${dayShort} ${dayNum}`,
          fullDateStr: d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          cash: 0,
          mpesa: 0,
          total: 0,
          orderCount: 0,
          isToday: dateStr === todayStr,
          isSelected: dateStr === selectedDate,
        });
      }
    } else {
      // Last 7 days ending today
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
        const dayShort = d.toLocaleDateString('en-GB', { weekday: 'short' });
        const dayNum = d.getDate();

        days.push({
          date: dateStr,
          dayName: dayShort,
          dayLabel: `${dayShort} ${dayNum}`,
          fullDateStr: d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          cash: 0,
          mpesa: 0,
          total: 0,
          orderCount: 0,
          isToday: dateStr === todayStr,
          isSelected: dateStr === selectedDate,
        });
      }
    }

    // Aggregate sales data per day
    sales.forEach(sale => {
      // Only include completed sales (excluding reversed or voided entries)
      if (sale.status === 'completed' || sale.status === 'voided') {
        const saleDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(sale.ts));
        const dayMatch = days.find(d => d.date === saleDateStr);
        if (dayMatch) {
          dayMatch.total += sale.total;
          dayMatch.orderCount += 1;
          if (sale.payment_method === 'Cash') {
            dayMatch.cash += sale.total;
          } else if (sale.payment_method === 'M-Pesa') {
            dayMatch.mpesa += sale.total;
          }
        }
      }
    });

    return days;
  }, [sales, timeRange, selectedDate]);

  // Aggregate weekly totals
  const weekTotals = useMemo(() => {
    let totalRevenue = 0;
    let totalCash = 0;
    let totalMpesa = 0;
    let totalOrders = 0;
    let topDay: DayData | null = null;

    weekData.forEach(day => {
      totalRevenue += day.total;
      totalCash += day.cash;
      totalMpesa += day.mpesa;
      totalOrders += day.orderCount;
      if (!topDay || day.total > topDay.total) {
        topDay = day;
      }
    });

    const cashShare = totalRevenue > 0 ? Math.round((totalCash / totalRevenue) * 100) : 0;
    const mpesaShare = totalRevenue > 0 ? Math.round((totalMpesa / totalRevenue) * 100) : 0;

    return {
      totalRevenue,
      totalCash,
      totalMpesa,
      totalOrders,
      cashShare,
      mpesaShare,
      topDay: topDay && (topDay as DayData).total > 0 ? topDay : null,
    };
  }, [weekData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: DayData = payload[0].payload;
      const cashPct = data.total > 0 ? Math.round((data.cash / data.total) * 100) : 0;
      const mpesaPct = data.total > 0 ? Math.round((data.mpesa / data.total) * 100) : 0;

      return (
        <div className="bg-stone-900 border border-stone-700/80 rounded-2xl p-3.5 shadow-2xl text-stone-100 text-xs space-y-2 min-w-[200px] z-50">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <div>
              <p className="font-bold text-stone-200">{data.fullDateStr}</p>
              <p className="text-[10px] text-stone-400">{data.dayName} • {data.orderCount} orders</p>
            </div>
            {data.isToday && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Today
              </span>
            )}
          </div>

          <div className="space-y-1.5 font-mono">
            {/* Cash */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-400 font-sans text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Cash:</span>
              </span>
              <span className="font-bold text-amber-300">
                {formatKSh(data.cash)} <span className="text-[10px] font-sans text-stone-500 font-normal">({cashPct}%)</span>
              </span>
            </div>

            {/* M-Pesa */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-400 font-sans text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>M-Pesa:</span>
              </span>
              <span className="font-bold text-emerald-300">
                {formatKSh(data.mpesa)} <span className="text-[10px] font-sans text-stone-500 font-normal">({mpesaPct}%)</span>
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-800 text-stone-100 font-bold">
              <span className="font-sans text-[11px] text-stone-300">Day Total:</span>
              <span className="text-sm text-stone-100">{formatKSh(data.total)}</span>
            </div>
          </div>

          <p className="text-[10px] text-stone-500 pt-1 text-center font-sans">
            Click bar to load this day's sales below
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-stone-900 border border-stone-800 p-4 sm:p-5 space-y-4 shadow-md">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-stone-100 flex items-center gap-2">
              <span>Weekly Sales Revenue Breakdown</span>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 border border-stone-700">
                Cash vs M-Pesa
              </span>
            </h3>
            <p className="text-xs text-stone-400">
              Interactive daily sales trend. Tap any bar to view that day's transaction receipts.
            </p>
          </div>
        </div>

        {/* Range & Mode Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Range Switcher */}
          <div className="bg-stone-950 p-1 rounded-xl border border-stone-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setTimeRange('current_week')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                timeRange === 'current_week'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('last_7_days')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                timeRange === 'last_7_days'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Past 7 Days
            </button>
          </div>

          {/* Stacked vs Grouped Toggle */}
          <div className="bg-stone-950 p-1 rounded-xl border border-stone-800 flex items-center text-xs">
            <button
              onClick={() => setChartMode('stacked')}
              className={`p-1.5 rounded-lg transition ${
                chartMode === 'stacked'
                  ? 'bg-stone-800 text-amber-400'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Stacked bars (Total height = Day Total)"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartMode('grouped')}
              className={`p-1.5 rounded-lg transition ${
                chartMode === 'grouped'
                  ? 'bg-stone-800 text-amber-400'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Side-by-side grouped bars"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Metric Summary Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
        <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80">
          <span className="text-[11px] text-stone-400 block font-semibold">Weekly Net Revenue</span>
          <span className="text-base sm:text-lg font-extrabold font-mono text-stone-100">
            {formatKSh(weekTotals.totalRevenue)}
          </span>
          <span className="text-[10px] text-stone-500 block font-mono">
            {weekTotals.totalOrders} total orders
          </span>
        </div>

        <div className="p-3 rounded-xl bg-stone-950/70 border border-amber-950/40">
          <span className="text-[11px] text-amber-400/90 block font-semibold flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5 text-amber-400" />
            <span>Weekly Cash</span>
          </span>
          <span className="text-base sm:text-lg font-extrabold font-mono text-amber-400">
            {formatKSh(weekTotals.totalCash)}
          </span>
          <span className="text-[10px] text-stone-500 block font-mono">
            {weekTotals.cashShare}% of weekly sales
          </span>
        </div>

        <div className="p-3 rounded-xl bg-stone-950/70 border border-emerald-950/40">
          <span className="text-[11px] text-emerald-400/90 block font-semibold flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Weekly M-Pesa</span>
          </span>
          <span className="text-base sm:text-lg font-extrabold font-mono text-emerald-400">
            {formatKSh(weekTotals.totalMpesa)}
          </span>
          <span className="text-[10px] text-stone-500 block font-mono">
            {weekTotals.mpesaShare}% of weekly sales
          </span>
        </div>

        <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80 flex flex-col justify-between">
          <span className="text-[11px] text-stone-400 block font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Best Day</span>
          </span>
          {weekTotals.topDay ? (
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-stone-200">{(weekTotals.topDay as DayData).dayName}</span>
              <span className="font-mono text-xs font-bold text-amber-300">
                {formatKSh((weekTotals.topDay as DayData).total)}
              </span>
            </div>
          ) : (
            <span className="text-stone-500 text-[11px]">No sales recorded yet</span>
          )}
          <span className="text-[10px] text-stone-500 block">Peak trading volume</span>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weekData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload[0]) {
                const day = state.activePayload[0].payload as DayData;
                onSelectDate(day.date);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis
              dataKey="dayLabel"
              stroke="#737373"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#404040' }}
            />
            <YAxis
              stroke="#737373"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: number) => {
                if (val >= 1000) return `${Math.round(val / 1000)}k`;
                return `${val}`;
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', color: '#a8a29e' }}
            />

            {/* Cash Bar */}
            <Bar
              dataKey="cash"
              name="Cash Sales"
              fill="#f59e0b"
              stackId={chartMode === 'stacked' ? 'revenue' : undefined}
              radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
              cursor="pointer"
            >
              {weekData.map((entry, index) => (
                <Cell
                  key={`cell-cash-${index}`}
                  fill={entry.isSelected ? '#fbbf24' : '#f59e0b'}
                  stroke={entry.isSelected ? '#ffffff' : undefined}
                  strokeWidth={entry.isSelected ? 1.5 : 0}
                />
              ))}
            </Bar>

            {/* M-Pesa Bar */}
            <Bar
              dataKey="mpesa"
              name="M-Pesa Sales"
              fill="#10b981"
              stackId={chartMode === 'stacked' ? 'revenue' : undefined}
              radius={chartMode === 'stacked' ? [6, 6, 0, 0] : [4, 4, 0, 0]}
              cursor="pointer"
            >
              {weekData.map((entry, index) => (
                <Cell
                  key={`cell-mpesa-${index}`}
                  fill={entry.isSelected ? '#34d399' : '#10b981'}
                  stroke={entry.isSelected ? '#ffffff' : undefined}
                  strokeWidth={entry.isSelected ? 1.5 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Day Selector Chips below chart */}
      <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-stone-400 font-semibold shrink-0">
          Jump to Day:
        </span>
        <div className="flex items-center gap-1.5">
          {weekData.map(day => (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1 shrink-0 ${
                day.isSelected
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <span>{day.dayName}</span>
              {day.total > 0 && (
                <span className={`text-[10px] ${day.isSelected ? 'text-stone-950 font-bold' : 'text-stone-500'}`}>
                  •
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
