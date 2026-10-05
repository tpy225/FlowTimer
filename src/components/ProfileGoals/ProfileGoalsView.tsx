import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trophy,
  History,
  CheckCircle2,
  Calendar,
  Flame,
  Scale,
  Edit3,
  Trash2,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Play,
  Check,
  TrendingDown,
  X
} from 'lucide-react';
import {
  UserProfile,
  WorkoutGoalPlan,
  WorkoutRoutine,
  WorkoutLog,
  WeightLog,
  GoalCalculatedProgress
} from '../../types/workout';
import { UserProfileCard } from '../Home/UserProfileCard';
import { WeightTrendChart } from '../Calendar/WeightTrendChart';
import { GoalEditorModal } from '../Goal/GoalEditorModal';
import { calculateGoalProgress, getStartOfCurrentWeek } from '../../utils/goalTracker';
import { formatDateKey } from '../../utils/storage';

interface ProfileGoalsViewProps {
  profile: UserProfile;
  streakDays: number;
  todayCompletedCount: number;
  onUpdateProfile: (updated: UserProfile) => void;
  goalPlans: WorkoutGoalPlan[];
  routines: WorkoutRoutine[];
  logs: WorkoutLog[];
  weightLogs: WeightLog[];
  onSaveGoalPlan: (updated: WorkoutGoalPlan) => void;
  onDeleteGoalPlan: (id: string) => void;
  onToggleGoalPlanStatus: (id: string, makeActive: boolean) => void;
  onStartRoutine: (routine: WorkoutRoutine) => void;
  onSaveWeightLog: (date: string, weightKg: number, note?: string) => void;
  onDeleteWeightLog?: (id: string) => void;
}

export const ProfileGoalsView: React.FC<ProfileGoalsViewProps> = ({
  profile,
  streakDays,
  todayCompletedCount,
  onUpdateProfile,
  goalPlans,
  routines,
  logs,
  weightLogs,
  onSaveGoalPlan,
  onDeleteGoalPlan,
  onToggleGoalPlanStatus,
  onStartRoutine,
  onSaveWeightLog,
  onDeleteWeightLog,
}) => {
  // Goals tab: 'active' vs 'history'
  const [goalTab, setGoalTab] = useState<'active' | 'history'>('active');

  // Goal editor modal state
  const [editingPlan, setEditingPlan] = useState<WorkoutGoalPlan | null>(null);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  // Quick weight record modal
  const [isLoggingWeight, setIsLoggingWeight] = useState(false);
  const [quickWeight, setQuickWeight] = useState<number>(profile.weightKg || 52.0);
  const [quickWeightNote, setQuickWeightNote] = useState('');

  // Partition goals into active and history
  const activeGoals = goalPlans.filter((p) => p.isActive);
  const historyGoals = goalPlans.filter((p) => !p.isActive);

  // Handle quick weight save
  const handleSaveQuickWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickWeight > 0) {
      const todayStr = formatDateKey(new Date());
      onSaveWeightLog(todayStr, Number(quickWeight.toFixed(1)), quickWeightNote.trim() || undefined);
      setIsLoggingWeight(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-5">
      {/* 1. Personal Profile Card */}
      <div>
        <UserProfileCard
          profile={profile}
          streakDays={streakDays}
          todayCompletedCount={todayCompletedCount}
          onUpdateProfile={onUpdateProfile}
        />
      </div>

      {/* 2. Weight Change Trend Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-stone-900">體重變化與趨勢</h3>
          </div>
          <button
            onClick={() => {
              setQuickWeight(profile.weightKg || 52.0);
              setQuickWeightNote('');
              setIsLoggingWeight(true);
            }}
            className="text-xs font-semibold px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl transition-all shadow-2xs flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3 h-3" /> 記錄今日體重
          </button>
        </div>

        <WeightTrendChart weightLogs={weightLogs} />
      </div>

      {/* 3. Fitness Goals Section (Multiple Goals + Completed History) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-stone-900">運動目標管理</h3>
          </div>

          <button
            onClick={() => {
              setEditingPlan(null);
              setIsCreatingGoal(true);
            }}
            className="text-xs font-semibold px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl shadow-xs flex items-center gap-1 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> 新增目標計劃
          </button>
        </div>

        {/* Goal Sub-Tabs: Active vs History */}
        <div className="flex rounded-2xl bg-stone-100/90 p-1 border border-stone-200/70 text-xs">
          <button
            onClick={() => setGoalTab('active')}
            className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              goalTab === 'active'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-amber-600" />
            進行中目標 ({activeGoals.length})
          </button>

          <button
            onClick={() => setGoalTab('history')}
            className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              goalTab === 'history'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            歷史達成記錄 ({historyGoals.length})
          </button>
        </div>

        {/* --- Tab 1: Active Goals List --- */}
        {goalTab === 'active' && (
          <div className="space-y-3">
            {activeGoals.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-200 text-stone-400">
                <Target className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <h4 className="font-bold text-sm text-stone-700">目前沒有進行中的運動目標</h4>
                <p className="text-xs text-stone-400 mt-1">
                  點擊右上角「新增目標計劃」，可自訂如「一週3天A組合+1天B組合，持續1個月」等規律挑戰！
                </p>
                <button
                  onClick={() => {
                    setEditingPlan(null);
                    setIsCreatingGoal(true);
                  }}
                  className="mt-3 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold shadow-2xs"
                >
                  ＋ 建立第一個目標
                </button>
              </div>
            ) : (
              activeGoals.map((plan) => {
                const prog = calculateGoalProgress(plan, logs);
                const currentWk = prog.weeks[prog.currentWeekIndex] || prog.weeks[0];

                return (
                  <div
                    key={plan.id}
                    className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-2xs space-y-3 relative overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          <Target className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-sm text-stone-900">{plan.title}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                              持續 {plan.durationWeeks} 週
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono">
                            開始於 {plan.startDate}
                          </span>
                        </div>
                      </div>

                      {/* Goal Menu / Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingPlan(plan);
                            setIsCreatingGoal(true);
                          }}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="修改規則"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`確定將【${plan.title}】標記為完成並歸檔至歷史記錄嗎？`)) {
                              onToggleGoalPlanStatus(plan.id, false);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="完成目標並歸檔"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`確定要刪除目標【${plan.title}】嗎？`)) {
                              onDeleteGoalPlan(plan.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="刪除目標"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Milestone Weeks */}
                    <div className="bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] font-bold text-stone-600">
                          總週期進度（第 {prog.currentWeekIndex + 1} / {plan.durationWeeks} 週）
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-amber-900 text-xs">
                            {prog.totalCompletedWorkouts} / {prog.totalTargetWorkouts} 次
                          </span>
                          <span className="text-[10px] font-bold text-amber-800">
                            ({prog.overallPercent}%)
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-stone-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(5, prog.overallPercent))}%` }}
                        />
                      </div>

                      {/* Milestone Dots */}
                      <div className="flex items-center justify-between pt-1 text-[10px] text-stone-400">
                        {prog.weeks.map((wk, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium border ${
                              wk.isCompleted
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                : i === prog.currentWeekIndex
                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                                : 'bg-white text-stone-400 border-stone-200'
                            }`}
                          >
                            {wk.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            第{i + 1}週
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Current Week's Rules */}
                    {currentWk && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-stone-500 block">
                          本週打卡規則明細：
                        </span>
                        {currentWk.ruleProgress.map((rule) => {
                          const percent = Math.min(
                            100,
                            Math.round((rule.completedTimes / rule.targetTimes) * 100)
                          );

                          return (
                            <div
                              key={rule.ruleId}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                                rule.isMet
                                  ? 'bg-emerald-50/50 border-emerald-200'
                                  : 'bg-stone-50 border-stone-200'
                              }`}
                            >
                              <div className="truncate">
                                <span className="font-bold text-stone-900 block truncate">
                                  {rule.routineTitle}
                                </span>
                                <span className="text-[10px] text-stone-400">
                                  每週需完成 {rule.targetTimes} 次打卡
                                </span>
                              </div>

                              <div className="shrink-0 flex items-center gap-1.5">
                                <span
                                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                                    rule.isMet
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-900'
                                  }`}
                                >
                                  {rule.completedTimes} / {rule.targetTimes} 次
                                </span>

                                {!rule.isMet ? (
                                  <button
                                    onClick={() => {
                                      const targetR = routines.find((r) => r.id === rule.routineId);
                                      if (targetR) onStartRoutine(targetR);
                                    }}
                                    className="px-2 py-1 bg-stone-900 hover:bg-black text-white rounded-lg text-[10px] font-semibold flex items-center gap-0.5 shadow-2xs"
                                  >
                                    <Play className="w-2.5 h-2.5 fill-current" /> 去打卡
                                  </button>
                                ) : (
                                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* --- Tab 2: Completed / History Goals --- */}
        {goalTab === 'history' && (
          <div className="space-y-3">
            {historyGoals.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-200 text-stone-400">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-300" />
                <h4 className="font-bold text-sm text-stone-700">尚未有歷史完成目標記錄</h4>
                <p className="text-xs text-stone-400 mt-1">
                  完成進行中的目標或在目標選單中點擊「完成歸檔」，即可記錄於此專屬榮譽殿堂！
                </p>
              </div>
            ) : (
              historyGoals.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-3xl p-4 border border-amber-200/70 shadow-2xs space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 shadow-2xs">
                        <Trophy className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-sm text-stone-900">{plan.title}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" /> 已圓滿達成
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
                          持續 {plan.durationWeeks} 週 · 完成於{' '}
                          {plan.completedAt
                            ? formatDateKey(new Date(plan.completedAt))
                            : plan.startDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleGoalPlanStatus(plan.id, true)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold border border-stone-200"
                        title="再次重啟此挑戰目標"
                      >
                        <RotateCcw className="w-3 h-3" /> 重啟
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`確定要刪除歷史目標【${plan.title}】嗎？`)) {
                            onDeleteGoalPlan(plan.id);
                          }
                        }}
                        className="p-1.5 text-stone-300 hover:text-red-500 transition-colors"
                        title="刪除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rules summary badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {plan.rules.map((r, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 bg-stone-50 border border-stone-200/80 rounded-lg text-stone-600"
                      >
                        {r.routineTitle}: 每週 {r.timesPerWeek} 次
                      </span>
                    ))}
                  </div>

                  {plan.note && (
                    <p className="text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded-xl border border-amber-200 italic">
                      “{plan.note}”
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Goal Editor Dialog Modal */}
      {isCreatingGoal && (
        <GoalEditorModal
          currentPlan={editingPlan}
          routines={routines}
          onSavePlan={(updated) => {
            onSaveGoalPlan(updated);
            setIsCreatingGoal(false);
          }}
          onClose={() => setIsCreatingGoal(false)}
        />
      )}

      {/* Quick Weight Record Modal */}
      {isLoggingWeight && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-sm text-stone-900">記錄今日體重</h4>
              </div>
              <button
                onClick={() => setIsLoggingWeight(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickWeight} className="space-y-4 text-xs text-stone-700">
              <div>
                <label className="block font-semibold mb-1.5 text-center text-xs text-stone-600">
                  今日體重 (kg)
                </label>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuickWeight((prev) => Math.max(30, Number((prev - 0.1).toFixed(1))))}
                    className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-base active:scale-95"
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
                      value={quickWeight}
                      onChange={(e) => setQuickWeight(Number(e.target.value))}
                      className="w-32 py-2.5 px-3 rounded-2xl border-2 border-amber-300 bg-amber-50/50 text-center font-mono font-extrabold text-2xl text-stone-900 focus:outline-hidden focus:border-amber-500"
                    />
                    <span className="text-[10px] text-stone-400 absolute right-2 bottom-3">kg</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuickWeight((prev) => Math.min(250, Number((prev + 0.1).toFixed(1))))}
                    className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-base active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[11px] text-stone-600">
                  備註（選填）
                </label>
                <input
                  type="text"
                  value={quickWeightNote}
                  onChange={(e) => setQuickWeightNote(e.target.value)}
                  placeholder="例如：晨起空腹、運動後"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsLoggingWeight(false)}
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
