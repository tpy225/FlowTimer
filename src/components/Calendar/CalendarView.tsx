import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  CheckCircle2,
  Trophy,
  Star,
  Plus,
  Trash2,
  Smile,
  Activity
} from 'lucide-react';
import { WorkoutLog, WorkoutRoutine } from '../../types/workout';
import { formatDateKey, formatTime } from '../../utils/storage';

interface CalendarViewProps {
  logs: WorkoutLog[];
  routines: WorkoutRoutine[];
  onAddManualLog?: (log: Omit<WorkoutLog, 'id'>) => void;
  onDeleteLog?: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  logs,
  routines,
  onAddManualLog,
  onDeleteLog,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(formatDateKey(new Date()));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateKey(formatDateKey(today));
  };

  // Build calendar matrix
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map logs by dateKey
  const logsByDate: Record<string, WorkoutLog[]> = {};
  logs.forEach((log) => {
    if (!logsByDate[log.date]) {
      logsByDate[log.date] = [];
    }
    logsByDate[log.date].push(log);
  });

  // Calculate monthly stats
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthLogs = logs.filter((l) => l.date.startsWith(currentMonthPrefix));
  const monthTotalWorkouts = monthLogs.length;
  const monthTotalSeconds = monthLogs.reduce((acc, l) => acc + (l.totalDurationSeconds || 0), 0);

  // Consecutive streak calculation
  const calculateStreak = (): number => {
    let streak = 0;
    const checkDate = new Date();
    // Check if today has a workout
    const todayKey = formatDateKey(checkDate);
    if (!logsByDate[todayKey] || logsByDate[todayKey].length === 0) {
      // check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayKey = formatDateKey(checkDate);
      if (!logsByDate[yesterdayKey] || logsByDate[yesterdayKey].length === 0) {
        return 0;
      }
    }

    while (true) {
      const key = formatDateKey(checkDate);
      if (logsByDate[key] && logsByDate[key].length > 0) {
        streak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streakDays = calculateStreak();
  const selectedLogs = logsByDate[selectedDateKey] || [];

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
            <CalendarIcon className="w-5 h-5 text-amber-600" />
            訓練打卡日曆
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">每次完成組合自動打卡，記錄堅持的每一天</p>
        </div>

        <button
          onClick={goToToday}
          className="text-xs font-semibold px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
        >
          今天
        </button>
      </div>

      {/* Monthly Overview Badges */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-amber-700 font-semibold mb-0.5">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            連續打卡
          </div>
          <span className="text-xl font-extrabold text-stone-900">{streakDays}</span>
          <span className="text-[10px] text-stone-500 ml-0.5">天</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-700 font-semibold mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            本月打卡
          </div>
          <span className="text-xl font-extrabold text-stone-900">{monthTotalWorkouts}</span>
          <span className="text-[10px] text-stone-500 ml-0.5">次</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-sky-700 font-semibold mb-0.5">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            運動時間
          </div>
          <span className="text-lg font-extrabold text-stone-900 font-mono">
            {Math.round(monthTotalSeconds / 60)}
          </span>
          <span className="text-[10px] text-stone-500 ml-0.5">分鐘</span>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs mb-4">
        {/* Month Selector */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-sm text-stone-800">
            {year} 年 {month + 1} 月
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
              title="上個月"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
              title="下個月"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-stone-400 mb-2">
          <span>日</span>
          <span>一</span>
          <span>二</span>
          <span>三</span>
          <span>四</span>
          <span>五</span>
          <span>六</span>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const hasLogs = Boolean(logsByDate[dateStr]?.length);
            const isSelected = selectedDateKey === dateStr;
            const isToday = formatDateKey(new Date()) === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDateKey(dateStr)}
                className={`h-11 rounded-2xl flex flex-col items-center justify-center relative transition-all text-xs ${
                  isSelected
                    ? 'bg-amber-100/90 text-amber-950 font-bold ring-2 ring-amber-300'
                    : isToday
                    ? 'bg-stone-100 text-stone-900 font-bold'
                    : 'hover:bg-stone-50 text-stone-700'
                }`}
              >
                <span>{dayNum}</span>

                {/* Workout check-in indicator dot */}
                {hasLogs && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5 shadow-2xs" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day's Workout Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-stone-400" />
            {selectedDateKey} 訓練打卡記錄
          </h4>
          <span className="text-[11px] text-stone-400">
            {selectedLogs.length > 0 ? `完成 ${selectedLogs.length} 項訓練` : '當日無打卡'}
          </span>
        </div>

        {selectedLogs.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-stone-200/70 text-stone-400">
            <Smile className="w-8 h-8 mx-auto mb-1.5 text-stone-300" />
            <p className="text-xs font-medium text-stone-500">這一天還沒有運動打卡</p>
            <p className="text-[11px] text-stone-400 mt-0.5">挑選一個組合開始運動，完成後將自動記錄在此！</p>
          </div>
        ) : (
          selectedLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl p-3.5 border border-emerald-200/70 shadow-2xs space-y-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500" />

              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    <h5 className="font-bold text-sm text-stone-900">{log.routineTitle}</h5>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-1 pl-6">
                    <span className="font-mono text-emerald-700 font-semibold">
                      {formatTime(log.totalDurationSeconds)}
                    </span>
                    <span>·</span>
                    <span>{log.completedExercisesCount} 項動作</span>
                    <span>·</span>
                    <span>{log.totalSetsCount} 組</span>
                  </div>
                </div>

                {onDeleteLog && (
                  <button
                    onClick={() => {
                      if (window.confirm('確定要刪除這筆打卡記錄嗎？')) {
                        onDeleteLog(log.id);
                      }
                    }}
                    className="p-1 text-stone-300 hover:text-red-500 transition-colors"
                    title="刪除記錄"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Rating stars if any */}
              {log.rating && (
                <div className="flex items-center gap-1 pl-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < (log.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-stone-200'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Note / Reflection */}
              {log.note && (
                <div className="pl-6 text-xs text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-100 italic">
                  “{log.note}”
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
