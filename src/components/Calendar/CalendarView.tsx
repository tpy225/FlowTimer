import React, { useState } from 'react';
import {
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
  Activity,
  Scale,
  Edit3,
  X
} from 'lucide-react';
import { WorkoutLog, WorkoutRoutine, WeightLog } from '../../types/workout';
import { formatDateKey, formatTime } from '../../utils/storage';
import { WeightTrendChart } from './WeightTrendChart';
import { useConfirm } from '../ui/ConfirmProvider';

interface CalendarViewProps {
  logs: WorkoutLog[];
  routines: WorkoutRoutine[];
  weightLogs: WeightLog[];
  onSaveWeightLog: (date: string, weightKg: number, note?: string) => void;
  onDeleteWeightLog?: (id: string) => void;
  onAddManualLog?: (log: Omit<WorkoutLog, 'id'>) => void;
  onDeleteLog?: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  logs,
  routines,
  weightLogs,
  onSaveWeightLog,
  onDeleteWeightLog,
  onAddManualLog,
  onDeleteLog,
}) => {
  const confirm = useConfirm();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(formatDateKey(new Date()));

  // Weight edit modal / drawer state
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [inputWeight, setInputWeight] = useState<number>(52.0);
  const [inputWeightNote, setInputWeightNote] = useState<string>('');

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

  // Map weight logs by dateKey
  const weightByDate: Record<string, WeightLog> = {};
  weightLogs.forEach((w) => {
    weightByDate[w.date] = w;
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
  const selectedWeightLog = weightByDate[selectedDateKey];

  // Open weight editing dialog
  const handleOpenWeightEditor = () => {
    if (selectedWeightLog) {
      setInputWeight(selectedWeightLog.weightKg);
      setInputWeightNote(selectedWeightLog.note || '');
    } else {
      // Default to the latest recorded weight or 52.0
      const lastRecorded = weightLogs[weightLogs.length - 1];
      setInputWeight(lastRecorded ? lastRecorded.weightKg : 52.0);
      setInputWeightNote('');
    }
    setIsEditingWeight(true);
  };

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputWeight > 0) {
      onSaveWeightLog(selectedDateKey, Number(inputWeight.toFixed(1)), inputWeightNote.trim() || undefined);
    }
    setIsEditingWeight(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4">
      {/* Monthly Overview Badges */}
      <div className="grid grid-cols-3 gap-2">
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
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs">
        {/* Month Selector */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-sm text-stone-800">
            {year} 年 {month + 1} 月
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={goToToday}
              className="text-[11px] font-semibold px-2.5 py-1 mr-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
            >
              今天
            </button>
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
            <div key={`empty-${i}`} className="h-11" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const hasLogs = Boolean(logsByDate[dateStr]?.length);
            const dayWeight = weightByDate[dateStr];
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

                {/* Status indicator dots */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {/* Workout check-in indicator (green) */}
                  {hasLogs && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-2xs" title="已完成訓練" />
                  )}
                  {/* Weight recorded indicator (amber) */}
                  {dayWeight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-2xs" title="已記錄體重" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 text-[10px] text-stone-400 border-t border-stone-100 mt-2">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> 訓練打卡
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> 體重記錄
          </span>
        </div>
      </div>

      {/* Selected Date: Weight Logging & Details Card */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block font-mono leading-none">
                {selectedDateKey}
              </span>
              <h4 className="font-bold text-xs text-stone-900 mt-0.5">當日體重記錄</h4>
            </div>
          </div>

          <button
            onClick={handleOpenWeightEditor}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl transition-all active:scale-95 shadow-2xs"
          >
            {selectedWeightLog ? <Edit3 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            <span>{selectedWeightLog ? '修改體重' : '記錄當日體重'}</span>
          </button>
        </div>

        {selectedWeightLog ? (
          <div className="mt-3 p-3 bg-stone-50/80 rounded-2xl border border-stone-200/60 flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-stone-900 font-mono">
                {selectedWeightLog.weightKg.toFixed(1)}
              </span>
              <span className="text-xs text-stone-500 font-medium">kg</span>
              {selectedWeightLog.note && (
                <span className="text-xs text-stone-500 italic ml-2 pl-2 border-l border-stone-200">
                  “{selectedWeightLog.note}”
                </span>
              )}
            </div>

            {onDeleteWeightLog && (
              <button
                onClick={async () => {
                  const ok = await confirm('確定要刪除該日期的體重記錄嗎？', { title: '刪除體重記錄' });
                  if (ok) onDeleteWeightLog(selectedWeightLog.id);
                }}
                className="p-1 text-stone-300 hover:text-red-500 transition-colors"
                title="刪除體重記錄"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div
            onClick={handleOpenWeightEditor}
            className="mt-3 py-3 px-4 bg-stone-50/50 hover:bg-stone-50 rounded-2xl border border-dashed border-stone-200 flex items-center justify-between cursor-pointer transition-colors"
          >
            <span className="text-xs text-stone-400">當日尚未記錄體重</span>
            <span className="text-xs font-semibold text-amber-800">＋ 點擊填寫</span>
          </div>
        )}
      </div>

      {/* Bottom Chart: Weight Trend and Variation */}
      <WeightTrendChart
        weightLogs={weightLogs}
        onSelectDateToLog={(date) => setSelectedDateKey(date)}
      />

      {/* Selected Day's Workout Details */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-stone-400" />
            {selectedDateKey} 訓練打卡記錄
          </h4>
          <span className="text-[11px] text-stone-400">
            {selectedLogs.length > 0 ? `完成 ${selectedLogs.length} 項訓練` : '當日無訓練'}
          </span>
        </div>

        {selectedLogs.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center border border-stone-200/70 text-stone-400">
            <Smile className="w-7 h-7 mx-auto mb-1 text-stone-300" />
            <p className="text-xs font-medium text-stone-500">這一天尚未有訓練打卡記錄</p>
            <p className="text-[11px] text-stone-400 mt-0.5">完成任意組合訓練後，將會自動在此打卡！</p>
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
                    onClick={async () => {
                      const ok = await confirm('確定要刪除這筆打卡記錄嗎？', { title: '刪除打卡記錄' });
                      if (ok) onDeleteLog(log.id);
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

      {/* Edit Weight Dialog Modal */}
      {isEditingWeight && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-sm text-stone-900">
                  記錄 {selectedDateKey} 體重
                </h4>
              </div>
              <button
                onClick={() => setIsEditingWeight(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-4 text-xs text-stone-700">
              {/* Weight Stepper & Input */}
              <div>
                <label className="block font-semibold mb-1.5 text-center text-xs text-stone-600">
                  體重 (kg)
                </label>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInputWeight((prev) => Math.max(30, Number((prev - 0.1).toFixed(1))))}
                    className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-base active:scale-95 transition-all"
                  >
                    -
                  </button>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="30"
                      max="250"
                      required
                      value={inputWeight}
                      onChange={(e) => setInputWeight(Number(e.target.value))}
                      className="w-32 py-2.5 px-3 rounded-2xl border-2 border-amber-300 bg-amber-50/50 text-center font-mono font-extrabold text-2xl text-stone-900 focus:outline-hidden focus:border-amber-500"
                    />
                    <span className="text-[10px] text-stone-400 absolute right-2 bottom-3">kg</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInputWeight((prev) => Math.min(250, Number((prev + 0.1).toFixed(1))))}
                    className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-base active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick adjustment pills */}
              <div className="flex justify-center gap-1.5">
                {[-0.5, -0.2, +0.2, +0.5].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => setInputWeight((prev) => Number((prev + delta).toFixed(1)))}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>

              {/* Optional note */}
              <div>
                <label className="block font-semibold mb-1 text-[11px] text-stone-600">
                  備註（選填，如：晨起空腹、運動後）
                </label>
                <input
                  type="text"
                  value={inputWeightNote}
                  onChange={(e) => setInputWeightNote(e.target.value)}
                  placeholder="例如：早起空腹、水分充足"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-400 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsEditingWeight(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl font-medium shadow-xs"
                >
                  儲存體重
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

