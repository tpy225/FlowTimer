import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  Calendar,
  Sparkles,
  Play,
  Settings,
  ChevronRight,
  Trophy,
  Flame,
  Check
} from 'lucide-react';
import {
  WorkoutGoalPlan,
  GoalCalculatedProgress,
  WorkoutRoutine
} from '../../types/workout';
import { GoalEditorModal } from './GoalEditorModal';

interface GoalPlanCardProps {
  goalPlan: WorkoutGoalPlan;
  calculatedProgress: GoalCalculatedProgress;
  routines: WorkoutRoutine[];
  onSaveGoalPlan: (updated: WorkoutGoalPlan) => void;
  onStartRoutine: (routine: WorkoutRoutine) => void;
}

export const GoalPlanCard: React.FC<GoalPlanCardProps> = ({
  goalPlan,
  calculatedProgress,
  routines,
  onSaveGoalPlan,
  onStartRoutine,
}) => {
  const [showEditor, setShowEditor] = useState(false);

  const {
    totalTargetWorkouts,
    totalCompletedWorkouts,
    overallPercent,
    currentWeekIndex,
    isFullyCompleted,
    weeks,
  } = calculatedProgress;

  const currentWeek = weeks[currentWeekIndex] || weeks[0];

  const handleStartRuleRoutine = (routineId: string) => {
    const target = routines.find((r) => r.id === routineId);
    if (target) {
      onStartRoutine(target);
    }
  };

  return (
    <div className="mb-5">
      <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs relative overflow-hidden space-y-4">
        {/* Soft Background Accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-100/30 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 shadow-2xs">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-stone-900">
                  {goalPlan.title || '運動目標自動追蹤'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                  持續 {goalPlan.durationWeeks} 週
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                系統依打卡規則自動追蹤，完成相應組合即算達標
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowEditor(true)}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors shrink-0"
            title="調整目標規則"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-1.5 relative z-10 bg-stone-50/80 p-3 rounded-2xl border border-stone-200/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
              總週期進度（第 {currentWeekIndex + 1} / {goalPlan.durationWeeks} 週）
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono font-extrabold text-amber-900 text-sm">
                {totalCompletedWorkouts}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">/ {totalTargetWorkouts} 次</span>
              <span className="text-[10px] font-bold text-amber-800 ml-1">({overallPercent}%)</span>
            </div>
          </div>

          {/* Progress bar line */}
          <div className="w-full h-2.5 bg-stone-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${Math.min(100, Math.max(5, overallPercent))}%` }}
            />
          </div>

          {/* Week Milestones Steps */}
          <div className="grid grid-cols-4 gap-1.5 pt-1.5 text-center">
            {weeks.map((wk, i) => {
              const isPastCompleted = wk.isCompleted;
              const isCurrent = i === currentWeekIndex;

              return (
                <div
                  key={i}
                  className={`py-1 px-1 rounded-xl text-[10px] font-medium border transition-colors ${
                    isPastCompleted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                      : isCurrent
                      ? 'bg-amber-100/70 text-amber-950 border-amber-300 font-bold ring-1 ring-amber-200'
                      : 'bg-white text-stone-400 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-0.5">
                    {isPastCompleted ? (
                      <Check className="w-2.5 h-2.5 stroke-[3] text-emerald-600" />
                    ) : null}
                    第 {i + 1} 週
                  </div>
                  <span className="text-[9px] block opacity-80 scale-90">
                    {isPastCompleted ? '已達標' : isCurrent ? '進行中' : '未開始'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Week's Detailed Rules Progress */}
        {currentWeek && (
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between text-xs px-0.5">
              <span className="font-bold text-stone-800 flex items-center gap-1">
                📅 本週運動目標進度
                <span className="text-[10px] font-normal text-stone-400 font-mono">
                  ({currentWeek.startDateStr} ~ {currentWeek.endDateStr})
                </span>
              </span>
              {currentWeek.isCompleted && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" /> 本週已全數達標！
                </span>
              )}
            </div>

            {/* Rules list */}
            <div className="space-y-2">
              {currentWeek.ruleProgress.map((rule) => {
                const percent = Math.min(100, Math.round((rule.completedTimes / rule.targetTimes) * 100));

                return (
                  <div
                    key={rule.ruleId}
                    className={`p-3 rounded-2xl border transition-all ${
                      rule.isMet
                        ? 'bg-emerald-50/50 border-emerald-200/80'
                        : 'bg-stone-50/90 border-stone-200/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="truncate">
                        <span className="text-xs font-bold text-stone-900 block truncate">
                          {rule.routineTitle}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          規則目標：每週需完成 {rule.targetTimes} 次打卡
                        </span>
                      </div>

                      {/* Right status badge or Quick start button */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        <span
                          className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-lg ${
                            rule.isMet
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {rule.completedTimes} / {rule.targetTimes} 次
                        </span>

                        {!rule.isMet ? (
                          <button
                            onClick={() => handleStartRuleRoutine(rule.routineId)}
                            className="px-2.5 py-1 bg-stone-900 hover:bg-black text-white rounded-xl text-[10px] font-semibold flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                            title="立即開始此組合運動並打卡"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            去打卡
                          </button>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-stone-200/70 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          rule.isMet ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(8, percent))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fully completed goal celebration card */}
        {isFullyCompleted && (
          <div className="p-3 bg-gradient-to-r from-amber-100/90 to-yellow-100/90 rounded-2xl border border-amber-300 text-center animate-in zoom-in-95">
            <div className="flex items-center justify-center gap-1.5 text-amber-950 font-extrabold text-sm">
              <Trophy className="w-4 h-4 text-amber-600" />
              恭喜！您已完美達成【{goalPlan.title}】全部目標！
            </div>
            <p className="text-[10px] text-amber-800 mt-0.5">
              連續 {goalPlan.durationWeeks} 週規律訓練，養成了非凡的自律與好體態！
            </p>
          </div>
        )}
      </div>

      {/* Goal Editor Dialog Modal */}
      {showEditor && (
        <GoalEditorModal
          currentPlan={goalPlan}
          routines={routines}
          onSavePlan={onSaveGoalPlan}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};
