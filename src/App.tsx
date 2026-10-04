/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  WorkoutRoutine,
  ExerciseItem,
  WorkoutLog,
  UserSettings
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
  DEFAULT_EXERCISES,
  DEFAULT_ROUTINES,
  formatDateKey
} from './utils/storage';
import { Navbar, ActiveTab } from './components/Navbar';
import { HomeRoutineList } from './components/Home/HomeRoutineList';
import { ActiveWorkoutScreen } from './components/ActiveWorkout/ActiveWorkoutScreen';
import { ExerciseLibraryModal } from './components/ExerciseLibrary/ExerciseLibraryModal';
import { RoutineEditorModal } from './components/RoutineManager/RoutineEditorModal';
import { CalendarView } from './components/Calendar/CalendarView';
import { SettingsModal } from './components/SettingsModal';
import { FloatingVideoPlayer } from './components/VideoPlayer/FloatingVideoPlayer';
import { PWAInstallGuide } from './components/PWAInstallGuide';
import { Timer, Sparkles, Volume2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Persistence State
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [settings, setSettings] = useState<UserSettings>(getSavedSettings());

  // Active training workout state
  const [activeWorkoutRoutine, setActiveWorkoutRoutine] = useState<WorkoutRoutine | null>(null);

  // Routine editor modal
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);

  // Global floating video preview
  const [floatingVideo, setFloatingVideo] = useState<{ url: string; title: string } | null>(null);

  // Load saved data on startup
  useEffect(() => {
    setExercises(getSavedExercises());
    setRoutines(getSavedRoutines());
    setLogs(getSavedLogs());
    setSettings(getSavedSettings());
  }, []);

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

  // Settings mutations
  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
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
    return (
      <ActiveWorkoutScreen
        routine={activeWorkoutRoutine}
        userSettings={settings}
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
            <PWAInstallGuide />
            {settings.speechEnabled && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <Volume2 className="w-3 h-3 text-emerald-700" />
                語音
              </span>
            )}
          </div>
        </header>

        {/* Tab Views */}
        <main className="flex-1">
          {activeTab === 'home' && (
            <HomeRoutineList
              routines={routines}
              streakDays={calculateStreak()}
              todayCompletedCount={todayLogs.length}
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
            />
          )}

          {activeTab === 'library' && (
            <ExerciseLibraryModal
              exercises={exercises}
              onAddExercise={handleAddExercise}
              onUpdateExercise={handleUpdateExercise}
              onDeleteExercise={handleDeleteExercise}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              logs={logs}
              routines={routines}
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
