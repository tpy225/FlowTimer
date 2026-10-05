import React, { useState } from 'react';
import { Scale, TrendingDown, TrendingUp, Minus, Calendar, Plus } from 'lucide-react';
import { WeightLog } from '../../types/workout';

interface WeightTrendChartProps {
  weightLogs: WeightLog[];
  onSelectDateToLog?: (date: string) => void;
}

export const WeightTrendChart: React.FC<WeightTrendChartProps> = ({
  weightLogs,
  onSelectDateToLog,
}) => {
  const [filterRange, setFilterRange] = useState<'7' | '30' | 'all'>('30');
  const [hoveredPoint, setHoveredPoint] = useState<WeightLog | null>(null);

  // Filter logs based on selection
  const sortedLogs = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));

  let filtered = sortedLogs;
  if (filterRange === '7') {
    filtered = sortedLogs.slice(-7);
  } else if (filterRange === '30') {
    filtered = sortedLogs.slice(-30);
  }

  // Calculate stats
  const count = filtered.length;
  const latestLog = filtered[filtered.length - 1];
  const firstLog = filtered[0];

  const weights = filtered.map((l) => l.weightKg);
  const minWeight = weights.length > 0 ? Math.min(...weights) : 50;
  const maxWeight = weights.length > 0 ? Math.max(...weights) : 60;
  const diff = latestLog && firstLog && count > 1 ? Number((latestLog.weightKg - firstLog.weightKg).toFixed(1)) : 0;

  // Chart dimensions
  const svgWidth = 360;
  const svgHeight = 150;
  const padLeft = 38;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Compute scale
  // Add a little breathing room above and below
  const ySpan = Math.max(maxWeight - minWeight, 1);
  const yMin = Math.floor((minWeight - ySpan * 0.15) * 10) / 10;
  const yMax = Math.ceil((maxWeight + ySpan * 0.15) * 10) / 10;
  const yRange = yMax - yMin || 1;

  const getX = (idx: number) => {
    if (count <= 1) return padLeft + chartW / 2;
    return padLeft + (idx / (count - 1)) * chartW;
  };

  const getY = (val: number) => {
    return padTop + chartH - ((val - yMin) / yRange) * chartH;
  };

  // Generate SVG points & path
  const points = filtered.map((item, idx) => ({
    x: getX(idx),
    y: getY(item.weightKg),
    item,
  }));

  const linePath = points.length > 0
    ? points.reduce((acc, pt, idx, arr) => {
        if (idx === 0) return `M ${pt.x},${pt.y}`;
        // Smooth curved bezier
        const prev = arr[idx - 1];
        const cpX1 = prev.x + (pt.x - prev.x) / 2;
        const cpX2 = prev.x + (pt.x - prev.x) / 2;
        return `${acc} C ${cpX1},${prev.y} ${cpX2},${pt.y} ${pt.x},${pt.y}`;
      }, '')
    : '';

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x},${padTop + chartH} L ${points[0].x},${padTop + chartH} Z`
    : '';

  // Format short date mm/dd
  const formatShortDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    return parts.length >= 3 ? `${Number(parts[1])}/${Number(parts[2])}` : dateStr;
  };

  return (
    <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-2xs space-y-3">
      {/* Top Header & Range Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-2xs">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-stone-900">體重趨勢與變化圖</h3>
            <span className="text-[10px] text-stone-400">記錄體態變化，見證自我進步</span>
          </div>
        </div>

        {/* Range filter buttons */}
        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200/70 text-[10px]">
          {(['7', '30', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRange(r)}
              className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                filterRange === r
                  ? 'bg-white text-stone-900 font-bold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {r === '7' ? '近7次' : r === '30' ? '近30次' : '全部'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stat Metrics Bar */}
      {latestLog && (
        <div className="grid grid-cols-3 gap-2 bg-stone-50/90 p-2.5 rounded-2xl border border-stone-200/60">
          <div>
            <span className="text-[10px] text-stone-400 font-medium block">最新記錄</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-extrabold text-stone-900 font-mono">
                {latestLog.weightKg.toFixed(1)}
              </span>
              <span className="text-[10px] text-stone-400">kg</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 font-medium block">週期變化</span>
            <div className="flex items-center gap-1 mt-0.5">
              {diff < 0 ? (
                <div className="flex items-center text-emerald-600 font-bold text-xs">
                  <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{diff} kg</span>
                </div>
              ) : diff > 0 ? (
                <div className="flex items-center text-amber-600 font-bold text-xs">
                  <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+{diff} kg</span>
                </div>
              ) : (
                <div className="flex items-center text-stone-500 text-xs">
                  <Minus className="w-3.5 h-3.5" />
                  <span>持平</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 font-medium block">區間範圍</span>
            <span className="text-xs font-semibold text-stone-700 font-mono mt-0.5 block">
              {minWeight.toFixed(1)} ~ {maxWeight.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* SVG Trend Chart */}
      {count >= 2 ? (
        <div className="relative pt-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-40 overflow-visible select-none"
          >
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal guidelines & Y-axis labels */}
            {[yMax, (yMax + yMin) / 2, yMin].map((val, idx) => {
              const y = getY(val);
              return (
                <g key={idx}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke="#e7e5e4"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-stone-400 font-mono"
                  >
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#weightGradient)" />

            {/* Main Smooth Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {points.map((pt, i) => {
              const isHovered = hoveredPoint?.id === pt.item.id;
              const isLatest = i === points.length - 1;

              return (
                <g
                  key={pt.item.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectDateToLog?.(pt.item.date)}
                  onMouseEnter={() => setHoveredPoint(pt.item)}
                  onTouchStart={() => setHoveredPoint(pt.item)}
                >
                  {/* Outer pulse for latest point */}
                  {isLatest && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      fill="#fef3c7"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      className="animate-pulse"
                    />
                  )}

                  {/* Inner Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 4}
                    fill={isHovered ? '#b45309' : '#d97706'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />

                  {/* X-axis label (sparse to prevent overlap) */}
                  {(i === 0 || i === points.length - 1 || (count <= 6 && i % 2 === 0)) && (
                    <text
                      x={pt.x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      className="text-[9px] fill-stone-400 font-mono"
                    >
                      {formatShortDate(pt.item.date)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card on point hover/tap */}
          {hoveredPoint && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[11px] py-1 px-3 rounded-xl shadow-lg border border-stone-700 pointer-events-none flex items-center gap-2 animate-in fade-in">
              <span className="font-mono text-stone-300">{hoveredPoint.date}</span>
              <span className="font-extrabold text-amber-400">{hoveredPoint.weightKg.toFixed(1)} kg</span>
              {hoveredPoint.note && (
                <span className="text-[10px] text-stone-400 border-l border-stone-700 pl-1.5 truncate max-w-[120px]">
                  {hoveredPoint.note}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-center bg-stone-50/60 rounded-2xl border border-dashed border-stone-200">
          <Scale className="w-6 h-6 text-stone-300 mx-auto mb-1.5" />
          <p className="text-xs text-stone-600 font-medium">記錄至少 2 天的體重即可生成連續變化趨勢圖</p>
          <p className="text-[10px] text-stone-400 mt-0.5">點選上方日曆中任意日期，即可快速填寫當日體重！</p>
        </div>
      )}
    </div>
  );
};
