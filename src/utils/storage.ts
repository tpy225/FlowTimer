import { ExerciseItem, WorkoutRoutine, WorkoutLog, UserSettings, UserProfile, WeightLog } from '../types/workout';

const STORAGE_KEYS = {
  EXERCISES: 'flowtimer_exercises_v1',
  ROUTINES: 'flowtimer_routines_v1',
  LOGS: 'flowtimer_logs_v1',
  SETTINGS: 'flowtimer_settings_v1',
  PROFILE: 'flowtimer_user_profile_v1',
  WEIGHT_LOGS: 'flowtimer_weight_logs_v1',
};

// Canonical key for exercise-name dedup (CJK/latin, punctuation-insensitive)
export function normalizeExerciseName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s()（）【】「」.,、，\-_.·/]/g, '');
}

// High quality initial default exercises with real form tutorial videos and serene photos
export const DEFAULT_EXERCISES: ExerciseItem[] = [
  {
    id: 'ex-squat',
    name: '徒手深蹲 (Bodyweight Squats)',
    category: 'legs',
    defaultSets: 3,
    defaultWorkSeconds: 40,
    defaultRestSeconds: 20,
    videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
    description: '保持挺胸，臀部後推如坐椅子，膝蓋與腳尖方向一致。',
    createdAt: Date.now() - 100000,
  },
  {
    id: 'ex-pushup',
    name: '俯臥撐 / 跪姿俯臥撐 (Push-ups)',
    category: 'upper',
    defaultSets: 3,
    defaultWorkSeconds: 30,
    defaultRestSeconds: 30,
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80',
    description: '核心收緊，手肘與軀幹呈約45度，胸口下沉貼近地面。',
    createdAt: Date.now() - 90000,
  },
  {
    id: 'ex-plank',
    name: '平板支撐 (Plank)',
    category: 'core',
    defaultSets: 3,
    defaultWorkSeconds: 45,
    defaultRestSeconds: 25,
    videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
    imageUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=600&q=80',
    description: '肘部在肩膀正下方，腹部微收，從頭到腳呈一直線，勿塌腰。',
    createdAt: Date.now() - 80000,
  },
  {
    id: 'ex-glutebridge',
    name: '臀橋 (Glute Bridge)',
    category: 'legs',
    defaultSets: 3,
    defaultWorkSeconds: 40,
    defaultRestSeconds: 20,
    videoUrl: 'https://www.youtube.com/watch?v=wPM8icPu6H8',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    description: '仰臥屈膝，腳跟踩實，收縮臀部向上推起至軀幹成一直線。',
    createdAt: Date.now() - 70000,
  },
  {
    id: 'ex-jumpingjacks',
    name: '開合跳 (Jumping Jacks)',
    category: 'cardio',
    defaultSets: 3,
    defaultWorkSeconds: 35,
    defaultRestSeconds: 15,
    videoUrl: 'https://www.youtube.com/watch?v=c4DAnQ6DtF8',
    imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&w=600&q=80',
    description: '雙腳輕盈跳開，雙手於頭頂擊掌，落地時前腳掌微曲緩衝。',
    createdAt: Date.now() - 60000,
  },
  {
    id: 'ex-mountainclimber',
    name: '登山跑 (Mountain Climbers)',
    category: 'cardio',
    defaultSets: 3,
    defaultWorkSeconds: 30,
    defaultRestSeconds: 25,
    videoUrl: 'https://www.youtube.com/watch?v=nmwgirgXLYM',
    imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=600&q=80',
    description: '俯撐姿勢，核心繃緊，雙腿輪流快速提膝向前。',
    createdAt: Date.now() - 50000,
  },
  {
    id: 'ex-cobrastretch',
    name: '眼鏡蛇與嬰兒式拉伸 (Cobra & Child Pose)',
    category: 'stretch',
    defaultSets: 2,
    defaultWorkSeconds: 45,
    defaultRestSeconds: 15,
    videoUrl: 'https://www.youtube.com/watch?v=JDcdhTuycOI',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    description: '溫和伸展腹部、背部與脊椎，配合深長呼吸放鬆身心。',
    createdAt: Date.now() - 40000,
  },
];

export const DEFAULT_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'routine-core-wake',
    title: '晨間核心喚醒',
    description: '喚醒深層核心與穩定肌群，開啟神清氣爽的一天。',
    tag: '核心溫和',
    coverImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    prepareSeconds: 5,
    isPreset: true,
    createdAt: Date.now() - 200000,
    exercises: [
      {
        id: 'r-1',
        exerciseId: 'ex-plank',
        name: '平板支撐',
        sets: 3,
        workSeconds: 30,
        restSeconds: 20,
        videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
        imageUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=600&q=80',
        notes: '專注收緊腹橫肌，均勻呼吸',
      },
      {
        id: 'r-2',
        exerciseId: 'ex-glutebridge',
        name: '臀橋',
        sets: 3,
        workSeconds: 35,
        restSeconds: 15,
        videoUrl: 'https://www.youtube.com/watch?v=wPM8icPu6H8',
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
        notes: '頂峰停頓 1 秒收緊臀大肌',
      },
      {
        id: 'r-3',
        exerciseId: 'ex-cobrastretch',
        name: '眼鏡蛇與嬰兒式拉伸',
        sets: 2,
        workSeconds: 40,
        restSeconds: 15,
        videoUrl: 'https://www.youtube.com/watch?v=JDcdhTuycOI',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
        notes: '深沉緩慢呼吸，釋放下背壓力',
      },
    ],
  },
  {
    id: 'routine-tabata-burn',
    title: '全身燃脂 TABATA',
    description: '經典高強度間歇，有效提升心肺代謝與全身力量。',
    tag: '高能燃脂',
    coverImage: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&w=800&q=80',
    prepareSeconds: 5,
    isPreset: true,
    createdAt: Date.now() - 150000,
    exercises: [
      {
        id: 'r-4',
        exerciseId: 'ex-jumpingjacks',
        name: '開合跳',
        sets: 3,
        workSeconds: 30,
        restSeconds: 15,
        videoUrl: 'https://www.youtube.com/watch?v=c4DAnQ6DtF8',
        imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&w=600&q=80',
        notes: '節奏穩定，手臂充分伸展',
      },
      {
        id: 'r-5',
        exerciseId: 'ex-squat',
        name: '徒手深蹲',
        sets: 3,
        workSeconds: 35,
        restSeconds: 20,
        videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
        notes: '膝蓋不內扣，下蹲至大腿近水平',
      },
      {
        id: 'r-6',
        exerciseId: 'ex-pushup',
        name: '俯臥撐 / 跪姿俯臥撐',
        sets: 3,
        workSeconds: 25,
        restSeconds: 25,
        videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
        imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80',
        notes: '初學者可採膝蓋著地跪姿進行',
      },
      {
        id: 'r-7',
        exerciseId: 'ex-mountainclimber',
        name: '登山跑',
        sets: 3,
        workSeconds: 25,
        restSeconds: 20,
        videoUrl: 'https://www.youtube.com/watch?v=nmwgirgXLYM',
        imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=600&q=80',
        notes: '維持背部平直，加快步伐頻率',
      },
    ],
  },
  {
    id: 'routine-stretch-relax',
    title: '舒緩身心與伸展拉伸',
    description: '卸下一整天的疲累與肌肉緊張，溫和沉靜放鬆。',
    tag: '放鬆拉伸',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    prepareSeconds: 5,
    isPreset: true,
    createdAt: Date.now() - 120000,
    exercises: [
      {
        id: 'r-8',
        exerciseId: 'ex-glutebridge',
        name: '慢速臀橋放鬆',
        sets: 2,
        workSeconds: 40,
        restSeconds: 20,
        videoUrl: 'https://www.youtube.com/watch?v=wPM8icPu6H8',
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
        notes: '緩緩升起，柔和感知脊椎節節延展',
      },
      {
        id: 'r-9',
        exerciseId: 'ex-cobrastretch',
        name: '眼鏡蛇與嬰兒式拉伸',
        sets: 3,
        workSeconds: 50,
        restSeconds: 15,
        videoUrl: 'https://www.youtube.com/watch?v=JDcdhTuycOI',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
        notes: '每一次吐氣時，讓身體更加下沉放鬆',
      },
    ],
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  speechEnabled: true,
  soundBeepEnabled: true,
  countdownSeconds: 3,
  autoAdvance: true,
  speechRate: 1.0,
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Pui Yee',
  avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
  heightCm: 165,
  weightKg: 52.0,
  goal: '維持體態與核心強化',
  weeklyTargetDays: 4,
};

export function getSavedUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (!raw) {
    saveUserProfile(DEFAULT_USER_PROFILE);
    return DEFAULT_USER_PROFILE;
  }
  try {
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

// Storage helper functions
export function getSavedExercises(): ExerciseItem[] {
  if (typeof window === 'undefined') return DEFAULT_EXERCISES;
  const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
  if (!raw) {
    saveExercises(DEFAULT_EXERCISES);
    return DEFAULT_EXERCISES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_EXERCISES;
  }
}

export function saveExercises(exercises: ExerciseItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
}

export function getSavedRoutines(): WorkoutRoutine[] {
  if (typeof window === 'undefined') return DEFAULT_ROUTINES;
  const raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
  if (!raw) {
    saveRoutines(DEFAULT_ROUTINES);
    return DEFAULT_ROUTINES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ROUTINES;
  }
}

export function saveRoutines(routines: WorkoutRoutine[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
}

export function toggleFavoriteRoutine(id: string): WorkoutRoutine[] {
  const current = getSavedRoutines();
  const updated = current.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
  saveRoutines(updated);
  return updated;
}

export function toggleFavoriteExercise(id: string): ExerciseItem[] {
  const current = getSavedExercises();
  const updated = current.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e));
  saveExercises(updated);
  return updated;
}

export function getSavedLogs(): WorkoutLog[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
  if (!raw) {
    // Generate a couple of demo completion records for the last couple of days so calendar looks active
    const today = new Date();
    const demoLogs: WorkoutLog[] = [
      {
        id: 'demo-log-1',
        routineId: 'routine-core-wake',
        routineTitle: '晨間核心喚醒',
        date: formatDateKey(today),
        completedAt: Date.now() - 1000 * 60 * 60 * 3,
        totalDurationSeconds: 480,
        completedExercisesCount: 3,
        totalSetsCount: 8,
        note: '今天早上感覺很有精神！',
        rating: 5,
      },
    ];
    saveLogs(demoLogs);
    return demoLogs;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLogs(logs: WorkoutLog[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
}

export function addWorkoutLog(log: Omit<WorkoutLog, 'id'>): WorkoutLog {
  const newLog: WorkoutLog = {
    ...log,
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
  };
  const currentLogs = getSavedLogs();
  const updated = [newLog, ...currentLogs];
  saveLogs(updated);
  return newLog;
}

// Weight Logging & Tracking Functions
export function getSavedWeightLogs(): WeightLog[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
  if (!raw) {
    // Generate initial demo data for smooth trend visualization
    const now = new Date();
    const d1 = new Date(now); d1.setDate(now.getDate() - 10);
    const d2 = new Date(now); d2.setDate(now.getDate() - 7);
    const d3 = new Date(now); d3.setDate(now.getDate() - 4);
    const d4 = new Date(now); d4.setDate(now.getDate() - 2);
    const d5 = new Date(now);

    const initialWeights: WeightLog[] = [
      { id: 'w-1', date: formatDateKey(d1), weightKg: 52.8, recordedAt: d1.getTime(), note: '開始規律鍛鍊' },
      { id: 'w-2', date: formatDateKey(d2), weightKg: 52.6, recordedAt: d2.getTime(), note: '早起晨練後' },
      { id: 'w-3', date: formatDateKey(d3), weightKg: 52.3, recordedAt: d3.getTime() },
      { id: 'w-4', date: formatDateKey(d4), weightKg: 52.1, recordedAt: d4.getTime() },
      { id: 'w-5', date: formatDateKey(d5), weightKg: 52.0, recordedAt: d5.getTime(), note: '精神很好，核心收緊' },
    ];
    saveWeightLogs(initialWeights);
    return initialWeights;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWeightLogs(logs: WeightLog[]): void {
  if (typeof window === 'undefined') return;
  // Sort chronologically ascending
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(sorted));
}

export function upsertWeightLog(date: string, weightKg: number, note?: string): WeightLog {
  const current = getSavedWeightLogs();
  const existingIdx = current.findIndex((w) => w.date === date);

  let newOrUpdated: WeightLog;
  if (existingIdx >= 0) {
    newOrUpdated = {
      ...current[existingIdx],
      weightKg,
      recordedAt: Date.now(),
      note: note !== undefined ? note : current[existingIdx].note,
    };
    current[existingIdx] = newOrUpdated;
  } else {
    newOrUpdated = {
      id: 'w-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      date,
      weightKg,
      recordedAt: Date.now(),
      note,
    };
    current.push(newOrUpdated);
  }

  saveWeightLogs(current);

  // If this log is for today, also automatically sync with profile's weightKg
  const todayStr = formatDateKey(new Date());
  if (date === todayStr) {
    const profile = getSavedUserProfile();
    if (profile.weightKg !== weightKg) {
      saveUserProfile({ ...profile, weightKg });
    }
  }

  return newOrUpdated;
}

export function deleteWeightLog(id: string): void {
  const current = getSavedWeightLogs();
  const filtered = current.filter((w) => w.id !== id);
  saveWeightLogs(filtered);
}

export function getSavedSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Calculate total workout routine duration
export function calculateRoutineDuration(routine: WorkoutRoutine): number {
  let total = routine.prepareSeconds || 5;
  routine.exercises.forEach((ex) => {
    // each set has work + rest (except usually the very last set might transition to next exercise)
    total += ex.sets * (ex.workSeconds + ex.restSeconds);
  });
  return total;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Backup and Restore (JSON Export & Import)
export interface FlowTimerBackupData {
  version: number;
  exportedAt: number;
  exercises: ExerciseItem[];
  routines: WorkoutRoutine[];
  logs: WorkoutLog[];
  settings: UserSettings;
  profile?: UserProfile;
  weightLogs?: WeightLog[];
}

export function exportAllDataAsJSON(): void {
  if (typeof window === 'undefined') return;
  const backup: FlowTimerBackupData = {
    version: 1,
    exportedAt: Date.now(),
    exercises: getSavedExercises(),
    routines: getSavedRoutines(),
    logs: getSavedLogs(),
    settings: getSavedSettings(),
    profile: getSavedUserProfile(),
    weightLogs: getSavedWeightLogs(),
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = formatDateKey(new Date());

  const a = document.createElement('a');
  a.href = url;
  a.download = `FlowTimer-Backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importDataFromJSON(jsonText: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonText);
    if (!data || typeof data !== 'object') {
      return { success: false, message: '無效的備份檔案格式。' };
    }

    if (Array.isArray(data.exercises)) {
      saveExercises(data.exercises);
    }
    if (Array.isArray(data.routines)) {
      saveRoutines(data.routines);
    }
    if (Array.isArray(data.logs)) {
      saveLogs(data.logs);
    }
    if (data.settings && typeof data.settings === 'object') {
      saveSettings(data.settings);
    }
    if (data.profile && typeof data.profile === 'object') {
      saveUserProfile(data.profile);
    }
    if (Array.isArray(data.weightLogs)) {
      saveWeightLogs(data.weightLogs);
    }

    return { success: true, message: '備份資料已成功匯入！' };
  } catch (e) {
    return { success: false, message: '解析備份檔案失敗，請確認檔案內容為合法的 JSON。' };
  }
}
