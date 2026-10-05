import {
  WorkoutGoalPlan,
  GoalCalculatedProgress,
  GoalWeekProgress,
  WorkoutLog,
  WorkoutRoutine
} from '../types/workout';
import { formatDateKey } from './storage';

const STORAGE_KEY_GOALS_LIST = 'flowtimer_goal_plans_list_v1';
const STORAGE_KEY_GOAL_LEGACY = 'flowtimer_goal_plan_v1';

// Get beginning of current week (Monday)
export function getStartOfCurrentWeek(): string {
  const d = new Date();
  const day = d.getDay();
  // distance to Monday: if Sunday (0), go back 6 days, else go back (day - 1) days
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return formatDateKey(d);
}

export function getDefaultGoalPlans(routines?: WorkoutRoutine[]): WorkoutGoalPlan[] {
  const routineA = routines?.[0];
  const routineB = routines?.[2] || routines?.[1] || routines?.[0];

  const now = new Date();
  const pastWeek = new Date(now);
  pastWeek.setDate(pastWeek.getDate() - 14);

  return [
    {
      id: 'goal-plan-active-1',
      title: '月度規律訓練挑戰 (3天燃脂+1天拉伸)',
      startDate: getStartOfCurrentWeek(),
      durationWeeks: 4, // 1 month
      rules: [
        {
          id: 'rule-a',
          routineId: routineA ? routineA.id : 'routine-preset-1',
          routineTitle: routineA ? routineA.title : '15分鐘全身高效燃脂',
          timesPerWeek: 3, // 3 days / week
        },
        {
          id: 'rule-b',
          routineId: routineB ? routineB.id : 'routine-preset-3',
          routineTitle: routineB ? routineB.title : '10分鐘睡前放鬆伸展',
          timesPerWeek: 1, // 1 day / week
        },
      ],
      isActive: true,
      createdAt: Date.now() - 200000,
    },
    // Seed an archived / completed goal so the history section is immediately visible and demonstrable
    {
      id: 'goal-plan-completed-demo',
      title: '新手 2 週晨間核心雕塑打卡',
      startDate: formatDateKey(pastWeek),
      durationWeeks: 2,
      rules: [
        {
          id: 'rule-demo-1',
          routineId: routines?.[1]?.id || 'routine-preset-2',
          routineTitle: routines?.[1]?.title || '15分鐘腹肌核心雕塑',
          timesPerWeek: 2,
        },
      ],
      isActive: false,
      completedAt: Date.now() - 86400000,
      note: '恭喜！2週打卡全數達標，核心控制力明顯提升。',
      createdAt: pastWeek.getTime(),
    },
  ];
}

export function getSavedGoalPlans(routines?: WorkoutRoutine[]): WorkoutGoalPlan[] {
  if (typeof window === 'undefined') return getDefaultGoalPlans(routines);
  const raw = localStorage.getItem(STORAGE_KEY_GOALS_LIST);
  if (!raw) {
    // Check legacy single plan
    const legacyRaw = localStorage.getItem(STORAGE_KEY_GOAL_LEGACY);
    if (legacyRaw) {
      try {
        const single = JSON.parse(legacyRaw);
        if (single && typeof single === 'object') {
          const list = [single];
          saveGoalPlans(list);
          return list;
        }
      } catch {
        // fallback
      }
    }
    const defaultList = getDefaultGoalPlans(routines);
    saveGoalPlans(defaultList);
    return defaultList;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultGoalPlans(routines);
  } catch {
    return getDefaultGoalPlans(routines);
  }
}

export function saveGoalPlans(plans: WorkoutGoalPlan[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_GOALS_LIST, JSON.stringify(plans));
}

export function upsertGoalPlan(plan: WorkoutGoalPlan): WorkoutGoalPlan[] {
  const current = getSavedGoalPlans();
  const idx = current.findIndex((p) => p.id === plan.id);
  let updated: WorkoutGoalPlan[];
  if (idx >= 0) {
    updated = current.map((p) => (p.id === plan.id ? plan : p));
  } else {
    updated = [plan, ...current];
  }
  saveGoalPlans(updated);
  return updated;
}

export function deleteGoalPlan(id: string): WorkoutGoalPlan[] {
  const current = getSavedGoalPlans();
  const updated = current.filter((p) => p.id !== id);
  saveGoalPlans(updated);
  return updated;
}

export function toggleGoalPlanStatus(id: string, makeActive: boolean): WorkoutGoalPlan[] {
  const current = getSavedGoalPlans();
  const updated = current.map((p) => {
    if (p.id === id) {
      return {
        ...p,
        isActive: makeActive,
        completedAt: makeActive ? undefined : Date.now(),
        startDate: makeActive ? getStartOfCurrentWeek() : p.startDate,
      };
    }
    return p;
  });
  saveGoalPlans(updated);
  return updated;
}

// Compute progress automatically from workout logs
export function calculateGoalProgress(
  plan: WorkoutGoalPlan,
  logs: WorkoutLog[]
): GoalCalculatedProgress {
  if (!plan || !plan.rules || plan.rules.length === 0) {
    return {
      totalTargetWorkouts: 0,
      totalCompletedWorkouts: 0,
      overallPercent: 0,
      currentWeekIndex: 0,
      isFullyCompleted: false,
      weeks: [],
    };
  }

  const durationWeeks = Math.max(1, plan.durationWeeks || 4);
  const startParts = plan.startDate.split('-').map(Number);
  const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);

  const todayStr = formatDateKey(new Date());
  const nowTime = new Date().getTime();

  let totalTarget = 0;
  let totalCompleted = 0;
  let currentWeekIdx = 0;

  const weeklyTarget = plan.rules.reduce((acc, r) => acc + (r.timesPerWeek || 1), 0);
  totalTarget = weeklyTarget * durationWeeks;

  const weeks: GoalWeekProgress[] = [];

  for (let w = 0; w < durationWeeks; w++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + w * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekStartStr = formatDateKey(weekStart);
    const weekEndStr = formatDateKey(weekEnd);

    const isCurrentWeek = todayStr >= weekStartStr && todayStr <= weekEndStr;
    if (isCurrentWeek) {
      currentWeekIdx = w;
    } else if (todayStr > weekEndStr && w === durationWeeks - 1) {
      currentWeekIdx = durationWeeks - 1;
    }

    // Filter logs that occurred in this specific week
    const weekLogs = logs.filter((log) => log.date >= weekStartStr && log.date <= weekEndStr);

    let allRulesMetInWeek = true;

    const ruleProgress = plan.rules.map((rule) => {
      // Match by routineId or loose title match
      const matchedLogs = weekLogs.filter(
        (l) =>
          l.routineId === rule.routineId ||
          l.routineTitle.toLowerCase().includes(rule.routineTitle.toLowerCase()) ||
          rule.routineTitle.toLowerCase().includes(l.routineTitle.toLowerCase())
      );

      const completedTimes = matchedLogs.length;
      const targetTimes = rule.timesPerWeek;
      const isMet = completedTimes >= targetTimes;

      if (!isMet) {
        allRulesMetInWeek = false;
      }

      // Add to total completed (capped at targetTimes for fair percentage calculation)
      totalCompleted += Math.min(completedTimes, targetTimes);

      return {
        ruleId: rule.id,
        routineId: rule.routineId,
        routineTitle: rule.routineTitle,
        completedTimes,
        targetTimes,
        isMet,
      };
    });

    weeks.push({
      weekIndex: w,
      startDateStr: weekStartStr,
      endDateStr: weekEndStr,
      isCurrentWeek,
      isCompleted: allRulesMetInWeek,
      ruleProgress,
    });
  }

  const overallPercent = totalTarget > 0 ? Math.min(100, Math.round((totalCompleted / totalTarget) * 100)) : 0;
  const isFullyCompleted = weeks.every((wk) => wk.isCompleted);

  return {
    totalTargetWorkouts: totalTarget,
    totalCompletedWorkouts: totalCompleted,
    overallPercent,
    currentWeekIndex: currentWeekIdx,
    isFullyCompleted,
    weeks,
  };
}
