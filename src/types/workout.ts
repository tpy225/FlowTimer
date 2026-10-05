export interface ExerciseItem {
  id: string;
  name: string;
  category: 'core' | 'legs' | 'upper' | 'cardio' | 'stretch' | 'fullbody';
  defaultSets: number;
  defaultWorkSeconds: number;
  defaultRestSeconds: number;
  videoUrl?: string; // YouTube, MP4, etc.
  imageUrl?: string;
  description?: string;
  isFavorite?: boolean;
  createdAt: number;
}

export interface RoutineExerciseItem {
  id: string; // unique item id inside routine
  exerciseId: string;
  name: string;
  sets: number;
  workSeconds: number;
  restSeconds: number;
  videoUrl?: string;
  imageUrl?: string;
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  description: string;
  tag: string;
  coverImage?: string;
  exercises: RoutineExerciseItem[];
  prepareSeconds: number; // default countdown before starting, e.g. 5s
  createdAt: number;
  isPreset?: boolean;
  isFavorite?: boolean;
}

export interface WorkoutLog {
  id: string;
  routineId: string;
  routineTitle: string;
  date: string; // YYYY-MM-DD
  completedAt: number; // timestamp
  totalDurationSeconds: number;
  completedExercisesCount: number;
  totalSetsCount: number;
  note?: string;
  rating?: number; // 1-5
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  recordedAt: number;
  note?: string;
}

export interface GoalRuleItem {
  id: string;
  routineId: string;
  routineTitle: string;
  timesPerWeek: number; // e.g. 3 times / week
}

export interface WorkoutGoalPlan {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  durationWeeks: number; // e.g. 4 weeks
  rules: GoalRuleItem[];
  isActive: boolean;
  completedAt?: number;
  note?: string;
  createdAt: number;
}

export interface GoalRuleProgressItem {
  ruleId: string;
  routineId: string;
  routineTitle: string;
  completedTimes: number;
  targetTimes: number;
  isMet: boolean;
}

export interface GoalWeekProgress {
  weekIndex: number; // 0-based
  startDateStr: string;
  endDateStr: string;
  isCurrentWeek: boolean;
  isCompleted: boolean;
  ruleProgress: GoalRuleProgressItem[];
}

export interface GoalCalculatedProgress {
  totalTargetWorkouts: number;
  totalCompletedWorkouts: number;
  overallPercent: number;
  currentWeekIndex: number;
  isFullyCompleted: boolean;
  weeks: GoalWeekProgress[];
}

export interface UserSettings {
  speechEnabled: boolean;
  soundBeepEnabled: boolean;
  countdownSeconds: number; // 3 or 5
  autoAdvance: boolean; // true = auto, false = manual next
  speechRate: number; // 0.9 - 1.2
  speechVoice?: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  heightCm: number;
  weightKg: number;
  goal: string;
  weeklyTargetDays?: number;
}

export type WorkoutPhase = 'idle' | 'prepare' | 'work' | 'rest' | 'paused' | 'completed';
