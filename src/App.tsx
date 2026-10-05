/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  WorkoutRoutine,
  ExerciseItem,
  WorkoutLog,
  UserSettings,
  UserProfile,
  WeightLog,
  WorkoutGoalPlan
} from './types/workout';
import {
  getSavedExercises,
  saveExercises,
  getSavedRoutines,
  saveRoutines,
  getSavedLogs,
  saveLogs,
  getSavedSettings,
  saveSettings,
  getSavedUserProfile,
  saveUserProfile,
  getSavedWeightLogs,
  upsertWeightLog,
  deleteWeightLog,
  toggleFavoriteRoutine,
  toggleFavoriteExercise,
  DEFAULT_EXERCISES,
  DEFAULT_ROUTINES,
  formatDateKey
} from './utils/storage';
import {
  getSavedGoalPlans,
  saveGoalPlans,
  upsertGoalPlan,
  deleteGoalPlan,
  toggleGoalPlanStatus
} from './utils/goalTracker';
import { Navbar, ActiveTab } from './components/Navbar';
import { HomeRoutineList } from './components/Home/HomeRoutineList';
import { ProfileGoalsView } from './components/ProfileGoals/ProfileGoalsView';
import { ActiveWorkoutScreen } from './components/ActiveWorkout/ActiveWorkoutScreen';
import { ExerciseLibraryModal } from './components/ExerciseLibrary/ExerciseLibraryModal';
import { RoutineEditorModal } from './components/RoutineManager/RoutineEditorModal';
import { CalendarView } from './components/Calendar/CalendarView';
import { SettingsModal } from './components/SettingsModal';
import { AICoachView } from './components/AICoach/AICoachView';
import { FloatingVideoPlayer } from './components/VideoPlayer/FloatingVideoPlayer';
import { PWAInstallGuide } from './components/PWAInstallGuide';
import { Timer, Sparkles, Volume2, Settings as SettingsIcon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Persistence State
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [settings, setSettings] = useState<UserSettings>(getSavedSettings());
  const [userProfile, setUserProfile] = useState<UserProfile>(getSavedUserProfile());
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(getSavedWeightLogs());
  const [goalPlans, setGoalPlans] = useState<WorkoutGoalPlan[]>(() => getSavedGoalPlans(DEFAULT_ROUTINES));

  // Active training workout state
  const [activeWorkoutRoutine, setActiveWorkoutRoutine] = useState<WorkoutRoutine | null>(null);

  // Routine editor modal
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);

  // Global floating video preview
  const [floatingVideo, setFloatingVideo] = useState<{ url: string; title: string } | null>(null);

  // Load saved data on startup
  useEffect(() => {
    const savedRoutines = getSavedRoutines();
    setExercises(getSavedExercises());
    setRoutines(savedRoutines);
    setLogs(getSavedLogs());
    setSettings(getSavedSettings());
    setUserProfile(getSavedUserProfile());
    setWeightLogs(getSavedWeightLogs());
    setGoalPlans(getSavedGoalPlans(savedRoutines));
  }, []);

  // Goal Plan mutations (Multiple goals supported!)
  const handleSaveGoalPlan = (updated: WorkoutGoalPlan) => {
    const updatedList = upsertGoalPlan(updated);
    setGoalPlans(updatedList);
  };

  const handleDeleteGoalPlan = (id: string) => {
    const updatedList = deleteGoalPlan(id);
    setGoalPlans(updatedList);
  };

  const handleToggleGoalPlanStatus = (id: string, makeActive: boolean) => {
    const updatedList = toggleGoalPlanStatus(id, makeActive);
    setGoalPlans(updatedList);
  };

  // Exercise library mutations
  const handleAddExercise = (newEx: Omit<ExerciseItem, 'id' | 'createdAt'>) => {
    const item: ExerciseItem = {
      ...newEx,
      id: 'ex-' + Date.now(),
      createdAt: Date.now(),
    };
    const updated = [item, ...exercises];
    setExercises(updated);
    saveExercises(updated);
  };

  const handleUpdateExercise = (updatedEx: ExerciseItem) => {
    const updated = exercises.map((e) => (e.id === updatedEx.id ? updatedEx : e));
    setExercises(updated);
    saveExercises(updated);
  };

  const handleDeleteExercise = (id: string) => {
    const updated = exercises.filter((e) => e.id !== id);
    setExercises(updated);
    saveExercises(updated);
  };

  const handleToggleFavoriteExercise = (id: string) => {
    const updated = toggleFavoriteExercise(id);
    setExercises(updated);
  };

  // Routine mutations
  const handleSaveRoutine = (routineToSave: WorkoutRoutine) => {
    const exists = routines.some((r) => r.id === routineToSave.id);
    let updated: WorkoutRoutine[];
    if (exists) {
      updated = routines.map((r) => (r.id === routineToSave.id ? routineToSave : r));
    } else {
      updated = [routineToSave, ...routines];
    }
    setRoutines(updated);
    saveRoutines(updated);
    setEditingRoutine(null);
    setIsCreatingRoutine(false);
  };

  const handleDeleteRoutine = (id: string) => {
    const updated = routines.filter((r) => r.id !== id);
    setRoutines(updated);
    saveRoutines(updated);
  };

  const handleToggleFavoriteRoutine = (id: string) => {
    const updated = toggleFavoriteRoutine(id);
    setRoutines(updated);
  };

  // Settings mutations
  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
  };

  // Profile mutations
  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    saveUserProfile(updated);
  };

  // Weight Log mutations
  const handleSaveWeightLog = (date: string, weightKg: number, note?: string) => {
    upsertWeightLog(date, weightKg, note);
    setWeightLogs(getSavedWeightLogs());
    // Also sync today's weight to userProfile if date is today
    const todayStr = formatDateKey(new Date());
    if (date === todayStr) {
      const updatedProfile = { ...userProfile, weightKg };
      setUserProfile(updatedProfile);
      saveUserProfile(updatedProfile);
    }
  };

  const handleDeleteWeightLog = (id: string) => {
    deleteWeightLog(id);
    setWeightLogs(getSavedWeightLogs());
  };

  // Reset to default presets
  const handleResetToDefaults = () => {
    setExercises(DEFAULT_EXERCISES);
    saveExercises(DEFAULT_EXERCISES);
    setRoutines(DEFAULT_ROUTINES);
    saveRoutines(DEFAULT_ROUTINES);
    alert('已還原預設動作庫與訓練組合！');
  };

  // Log reflections / notes
  const handleUpdateLogNote = (logId: string, note: string, rating: number) => {
    const updatedLogs = logs.map((l) => (l.id === logId ? { ...l, note, rating } : l));
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter((l) => l.id !== id);
    setLogs(updated);
    saveLogs(updated);
  };

  // Streak calculation
  const todayKey = formatDateKey(new Date());
  const todayLogs = logs.filter((l) => l.date === todayKey);

  // Consecutive days streak
  const calculateStreak = () => {
    let streak = 0;
    const checkDate = new Date();
    const todayStr = formatDateKey(checkDate);
    const hasToday = logs.some((l) => l.date === todayStr);

    if (!hasToday) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = formatDateKey(checkDate);
      if (!logs.some((l) => l.date === yesterdayStr)) return 0;
    }

    while (true) {
      const dateStr = formatDateKey(checkDate);
      if (logs.some((l) => l.date === dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // Active workout execution view takes full control if running
  if (activeWorkoutRoutine) {
    // Find active goal plan that might match this routine or first active goal
    const matchedGoal = goalPlans.find(
      (p) =>
        p.isActive &&
        p.rules.some(
          (r) =>
            r.routineId === activeWorkoutRoutine.id ||
            r.routineTitle.toLowerCase().includes(activeWorkoutRoutine.title.toLowerCase())
        )
    ) || goalPlans.find((p) => p.isActive);

    return (
      <ActiveWorkoutScreen
        routine={activeWorkoutRoutine}
        userSettings={settings}
        goalPlan={matchedGoal}
        onExit={() => setActiveWorkoutRoutine(null)}
        onGoToCalendar={() => {
          setActiveWorkoutRoutine(null);
          setActiveTab('calendar');
          setLogs(getSavedLogs()); // refresh logs
        }}
        onUpdateSettings={handleUpdateSettings}
        onUpdateLogNote={handleUpdateLogNote}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-stone-800 flex justify-center selection:bg-amber-100">
      {/* Mobile Shell Container */}
      <div className="w-full max-w-md bg-[#faf8f5] min-h-screen shadow-2xl relative flex flex-col md:border-x md:border-stone-200">
        {/* Sleek App Top Header */}
        <header className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md px-4 py-3 border-b border-stone-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-2xs">
              <Timer className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-stone-900 block leading-tight">
                FlowTimer
              </span>
              <span className="text-[10px] text-stone-400 block leading-none">
                柔和運動間歇計時器
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-1.5 rounded-xl transition-colors ${
                activeTab === 'settings'
                  ? 'bg-amber-100 text-stone-900'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
              title="系統設定"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab Views */}
        <main className="flex-1">
          {activeTab === 'home' && (
            <HomeRoutineList
              routines={routines}
              streakDays={calculateStreak()}
              todayCompletedCount={todayLogs.length}
              profile={userProfile}
              onToggleFavoriteRoutine={handleToggleFavoriteRoutine}
              onSelectRoutineToStart={(routine) => setActiveWorkoutRoutine(routine)}
              onEditRoutine={(routine) => {
                setEditingRoutine(routine);
                setIsCreatingRoutine(true);
              }}
              onDeleteRoutine={handleDeleteRoutine}
              onCreateNewRoutine={() => {
                setEditingRoutine(null);
                setIsCreatingRoutine(true);
              }}
              onOpenVideoPreview={(url, title) => setFloatingVideo({ url, title })}
              onGoToAICoach={() => setActiveTab('ai')}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileGoalsView
              profile={userProfile}
              streakDays={calculateStreak()}
              todayCompletedCount={todayLogs.length}
              onUpdateProfile={handleUpdateProfile}
              goalPlans={goalPlans}
              routines={routines}
              logs={logs}
              weightLogs={weightLogs}
              onSaveGoalPlan={handleSaveGoalPlan}
              onDeleteGoalPlan={handleDeleteGoalPlan}
              onToggleGoalPlanStatus={handleToggleGoalPlanStatus}
              onStartRoutine={(routine) => setActiveWorkoutRoutine(routine)}
              onSaveWeightLog={handleSaveWeightLog}
              onDeleteWeightLog={handleDeleteWeightLog}
            />
          )}

          {activeTab === 'ai' && (
            <AICoachView
              existingExercises={exercises}
              onAddRoutineFromAI={(routine) => {
                handleSaveRoutine(routine);
              }}
              onStartRoutineDirectly={(routine) => {
                setActiveWorkoutRoutine(routine);
              }}
              onOpenSettings={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'library' && (
            <ExerciseLibraryModal
              exercises={exercises}
              onAddExercise={handleAddExercise}
              onUpdateExercise={handleUpdateExercise}
              onDeleteExercise={handleDeleteExercise}
              onToggleFavoriteExercise={handleToggleFavoriteExercise}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              logs={logs}
              routines={routines}
              weightLogs={weightLogs}
              onSaveWeightLog={handleSaveWeightLog}
              onDeleteWeightLog={handleDeleteWeightLog}
              onDeleteLog={handleDeleteLog}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsModal
              settings={settings}
              onSaveSettings={handleUpdateSettings}
              onResetToDefaults={handleResetToDefaults}
            />
          )}
        </main>

        {/* Bottom Tab Navbar */}
        <Navbar activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* Routine Editor / Creator Modal */}
        {isCreatingRoutine && (
          <RoutineEditorModal
            routine={editingRoutine}
            allExercises={exercises}
            onSave={handleSaveRoutine}
            onClose={() => {
              setIsCreatingRoutine(false);
              setEditingRoutine(null);
            }}
          />
        )}

        {/* Global Floating Video Player */}
        {floatingVideo && (
          <FloatingVideoPlayer
            url={floatingVideo.url}
            title={floatingVideo.title}
            onClose={() => setFloatingVideo(null)}
          />
        )}
      </div>
    </div>
  );
}
