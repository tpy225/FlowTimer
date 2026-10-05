import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  X,
  Check,
  RotateCcw
} from 'lucide-react';
import { WorkoutGoalPlan, WorkoutRoutine, GoalRuleItem } from '../../types/workout';
import { getStartOfCurrentWeek } from '../../utils/goalTracker';

interface GoalEditorModalProps {
  currentPlan?: WorkoutGoalPlan | null;
  routines: WorkoutRoutine[];
  onSavePlan: (updatedPlan: WorkoutGoalPlan) => void;
  onClose: () => void;
}

export const GoalEditorModal: React.FC<GoalEditorModalProps> = ({
  currentPlan,
  routines,
  onSavePlan,
  onClose,
}) => {
  const [title, setTitle] = useState(currentPlan?.title || '一週3天A組合 + 1天B組合');
  const [durationWeeks, setDurationWeeks] = useState(currentPlan?.durationWeeks || 4);
  const [startDate, setStartDate] = useState(currentPlan?.startDate || getStartOfCurrentWeek());
  const [rules, setRules] = useState<GoalRuleItem[]>(
    currentPlan?.rules && currentPlan.rules.length > 0
      ? currentPlan.rules
      : [
          {
            id: 'rule-' + Date.now() + '-1',
            routineId: routines[0]?.id || 'routine-preset-1',
            routineTitle: routines[0]?.title || '15分鐘全身高效燃脂',
            timesPerWeek: 3,
          },
          {
            id: 'rule-' + Date.now() + '-2',
            routineId: routines[2]?.id || routines[1]?.id || routines[0]?.id || 'routine-preset-3',
            routineTitle: routines[2]?.title || routines[1]?.title || '10分鐘睡前放鬆伸展',
            timesPerWeek: 1,
          },
        ]
  );

  // Quick preset templates
  const handleApplyPreset = (type: '3plus1' | '2plus2' | '4tabata') => {
    const routineA = routines[0] || { id: 'r-1', title: '15分鐘全身高效燃脂' };
    const routineB = routines[2] || routines[1] || routines[0] || { id: 'r-2', title: '10分鐘睡前放鬆伸展' };

    if (type === '3plus1') {
      setTitle('一週3天A組合 + 1天B組合');
      setDurationWeeks(4);
      setRules([
        {
          id: 'rule-pre-1',
          routineId: routineA.id,
          routineTitle: routineA.title,
          timesPerWeek: 3,
        },
        {
          id: 'rule-pre-2',
          routineId: routineB.id,
          routineTitle: routineB.title,
          timesPerWeek: 1,
        },
      ]);
    } else if (type === '2plus2') {
      setTitle('2天核心 + 2天拉伸 平衡養成');
      setDurationWeeks(4);
      setRules([
        {
          id: 'rule-pre-1',
          routineId: routines[1]?.id || routineA.id,
          routineTitle: routines[1]?.title || '15分鐘腹肌核心雕塑',
          timesPerWeek: 2,
        },
        {
          id: 'rule-pre-2',
          routineId: routineB.id,
          routineTitle: routineB.title,
          timesPerWeek: 2,
        },
      ]);
    } else if (type === '4tabata') {
      setTitle('2週極速 TABATA 心肺爆發');
      setDurationWeeks(2);
      setRules([
        {
          id: 'rule-pre-1',
          routineId: routineA.id,
          routineTitle: routineA.title,
          timesPerWeek: 4,
        },
      ]);
    }
  };

  const handleAddRule = () => {
    const defaultRoutine = routines[0];
    const newRule: GoalRuleItem = {
      id: 'rule-' + Date.now(),
      routineId: defaultRoutine ? defaultRoutine.id : '',
      routineTitle: defaultRoutine ? defaultRoutine.title : '自訂組合',
      timesPerWeek: 2,
    };
    setRules([...rules, newRule]);
  };

  const handleUpdateRuleRoutine = (index: number, routineId: string) => {
    const selected = routines.find((r) => r.id === routineId);
    if (!selected) return;

    const updated = [...rules];
    updated[index] = {
      ...updated[index],
      routineId: selected.id,
      routineTitle: selected.title,
    };
    setRules(updated);
  };

  const handleUpdateRuleTimes = (index: number, times: number) => {
    const updated = [...rules];
    updated[index] = {
      ...updated[index],
      timesPerWeek: Math.max(1, Math.min(7, times)),
    };
    setRules(updated);
  };

  const handleDeleteRule = (index: number) => {
    if (rules.length <= 1) {
      alert('請至少保留一項訓練規則！');
      return;
    }
    const updated = rules.filter((_, i) => i !== index);
    setRules(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('請輸入目標計劃名稱');
      return;
    }

    const updatedPlan: WorkoutGoalPlan = {
      id: currentPlan?.id || 'goal-' + Date.now(),
      title: title.trim(),
      durationWeeks: Number(durationWeeks) || 4,
      startDate,
      rules,
      isActive: true,
      createdAt: currentPlan?.createdAt || Date.now(),
    };

    onSavePlan(updatedPlan);
    onClose();
  };

  const totalWeekly = rules.reduce((acc, r) => acc + r.timesPerWeek, 0);
  const totalAllWeeks = totalWeekly * durationWeeks;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 my-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600" />
            <h4 className="font-bold text-sm text-stone-900">設定運動目標與自動打卡規則</h4>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Preset Buttons */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-stone-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            推薦規則預設（一鍵套用）
          </label>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleApplyPreset('3plus1')}
              className="w-full text-left p-2 rounded-xl bg-amber-50/80 hover:bg-amber-100/70 border border-amber-200 text-xs text-amber-950 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="font-bold">⭐ 一週 3天 A組合 + 1天 B組合</div>
                <div className="text-[10px] text-amber-800">持續 1 個月（4 週 · 總共 16 次打卡）</div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-amber-900 border border-amber-200">
                套用
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset('2plus2')}
              className="w-full text-left p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs text-stone-800 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="font-bold">2天核心 + 2天拉伸修復</div>
                <div className="text-[10px] text-stone-500">持續 4 週 · 雕塑與放鬆平衡</div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-stone-600 border border-stone-200">
                套用
              </span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-stone-700">
          {/* Goal Title */}
          <div>
            <label className="block font-semibold mb-1">目標計劃名稱</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：春季規律打卡挑戰"
              className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-400 text-xs"
            />
          </div>

          {/* Duration & Start Date */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold mb-1">計劃週期長度</label>
              <select
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs"
              >
                <option value={1}>1 週（體驗試練）</option>
                <option value={2}>2 週（半月養成）</option>
                <option value={4}>4 週（持續1個月 推薦）</option>
                <option value={8}>8 週（2個月進階）</option>
                <option value={12}>12 週（季度蛻變）</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">開始日期</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs font-mono"
              />
            </div>
          </div>

          {/* Goal Rules Configuration */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-stone-800">
                每週訓練組合規則清單
              </label>
              <button
                type="button"
                onClick={handleAddRule}
                className="text-[10px] text-amber-800 hover:text-amber-950 font-bold flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"
              >
                <Plus className="w-3 h-3" /> 添加組合
              </button>
            </div>

            <div className="space-y-2">
              {rules.map((rule, idx) => (
                <div
                  key={rule.id || idx}
                  className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                      規則 {idx === 0 ? 'A' : idx === 1 ? 'B' : String.fromCharCode(65 + idx)}
                    </span>
                    {rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(idx)}
                        className="text-stone-300 hover:text-red-500 p-0.5"
                        title="刪除此規則"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Routine selector */}
                    <select
                      value={rule.routineId}
                      onChange={(e) => handleUpdateRuleRoutine(idx, e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-stone-200 bg-white text-xs truncate"
                    >
                      {routines.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.tag || '組合'})
                        </option>
                      ))}
                    </select>

                    {/* Frequency stepper */}
                    <div className="flex items-center gap-1 shrink-0 bg-white p-1 rounded-xl border border-stone-200">
                      <button
                        type="button"
                        onClick={() => handleUpdateRuleTimes(idx, rule.timesPerWeek - 1)}
                        className="w-5 h-5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="w-9 text-center font-mono font-bold text-xs text-stone-900">
                        {rule.timesPerWeek}次/週
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateRuleTimes(idx, rule.timesPerWeek + 1)}
                        className="w-5 h-5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Total Summary Pill */}
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 text-center">
            <span className="text-[10px] text-amber-800 font-medium block">
              自動追蹤總目標
            </span>
            <div className="text-stone-900 font-extrabold text-sm mt-0.5">
              持續 {durationWeeks} 週 · 每週 {totalWeekly} 次 · 共須打卡 {totalAllWeeks} 次
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              ✨ 每次完成相應組合的訓練打卡後，系統將自動累計並標記達標！
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl font-medium shadow-xs"
            >
              確認保存目標
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
