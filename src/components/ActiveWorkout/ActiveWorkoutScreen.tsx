import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { WorkoutRoutine, WorkoutPhase, UserSettings, RoutineExerciseItem, WorkoutLog, WorkoutGoalPlan } from '../../types/workout';
import { TimerDisplay } from './TimerDisplay';
import { TimelineList } from './TimelineList';
import { CompletionModal } from './CompletionModal';
import { FloatingVideoPlayer } from '../VideoPlayer/FloatingVideoPlayer';
import { soundEffects, voiceAssistant } from '../../utils/audio';
import { addWorkoutLog, formatDateKey } from '../../utils/storage';

interface ActiveWorkoutScreenProps {
  routine: WorkoutRoutine;
  userSettings: UserSettings;
  onExit: () => void;
  onGoToCalendar: () => void;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onUpdateLogNote: (logId: string, note: string, rating: number) => void;
  goalPlan?: WorkoutGoalPlan;
}

export const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({
  routine,
  userSettings,
  onExit,
  onGoToCalendar,
  onUpdateSettings,
  onUpdateLogNote,
  goalPlan,
}) => {
  // Current position
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<WorkoutPhase>('prepare');
  const [prevPhase, setPrevPhase] = useState<WorkoutPhase>('prepare');

  // Timers
  const prepareSeconds = routine.prepareSeconds || 5;
  const currentExercise: RoutineExerciseItem | null = routine.exercises[currentExerciseIndex] || null;
  const nextExercise: RoutineExerciseItem | null = routine.exercises[currentExerciseIndex + 1] || null;

  const [secondsRemaining, setSecondsRemaining] = useState(prepareSeconds);
  const [phaseTotalSeconds, setPhaseTotalSeconds] = useState(prepareSeconds);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);

  // Completion & History State
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdLogId, setCreatedLogId] = useState<string>('');
  const [totalSetsCount, setTotalSetsCount] = useState(0);

  // Floating video player state
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  // Settings in local state
  const [autoAdvance, setAutoAdvance] = useState(userSettings.autoAdvance);
  const [speechEnabled, setSpeechEnabled] = useState(userSettings.speechEnabled);
  const [soundBeepEnabled, setSoundBeepEnabled] = useState(userSettings.soundBeepEnabled);

  // Exit dialog
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Audio unlock helper
  useEffect(() => {
    soundEffects.unlock();
  }, []);

  // Compute total sets in routine for stats
  useEffect(() => {
    const total = routine.exercises.reduce((acc, ex) => acc + (ex.sets || 1), 0);
    setTotalSetsCount(total);
  }, [routine]);

  // Initial announcement
  useEffect(() => {
    if (speechEnabled && currentExercise) {
      voiceAssistant.speak(
        `準備開始訓練：${routine.title}。倒數 ${prepareSeconds} 秒，第一項：${currentExercise.name}`,
        speechEnabled,
        userSettings.speechRate
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-record completion to calendar
  const handleWorkoutComplete = useCallback(() => {
    setPhase('completed');
    setIsCompleted(true);
    soundEffects.playVictoryChime();

    if (speechEnabled) {
      voiceAssistant.speak('恭喜你！完成全部訓練，已為你自動打卡！', speechEnabled, userSettings.speechRate);
    }

    const today = new Date();
    const newLog = addWorkoutLog({
      routineId: routine.id,
      routineTitle: routine.title,
      date: formatDateKey(today),
      completedAt: Date.now(),
      totalDurationSeconds: totalElapsedSeconds,
      completedExercisesCount: routine.exercises.length,
      totalSetsCount: totalSetsCount,
      rating: 5,
    });

    setCreatedLogId(newLog.id);
  }, [routine, totalElapsedSeconds, totalSetsCount, speechEnabled, userSettings.speechRate]);

  // Transition state logic
  const advanceToNextStep = useCallback(() => {
    if (!currentExercise) return;

    if (phase === 'prepare') {
      // From prepare -> First exercise, set 1, work
      setPhase('work');
      setPhaseTotalSeconds(currentExercise.workSeconds);
      setSecondsRemaining(currentExercise.workSeconds);
      soundEffects.playStartChime();
      if (speechEnabled) {
        voiceAssistant.speak(`開始：${currentExercise.name}，第一組`, speechEnabled, userSettings.speechRate);
      }
      return;
    }

    if (phase === 'work') {
      // Check if more sets in this exercise
      if (currentSet < currentExercise.sets) {
        // Move to rest between sets
        if (currentExercise.restSeconds > 0) {
          setPhase('rest');
          setPhaseTotalSeconds(currentExercise.restSeconds);
          setSecondsRemaining(currentExercise.restSeconds);
          soundEffects.playRestChime();
          if (speechEnabled) {
            voiceAssistant.speak(
              `休息 ${currentExercise.restSeconds} 秒，下一組依然是：${currentExercise.name}`,
              speechEnabled,
              userSettings.speechRate
            );
          }
        } else {
          // No rest, straight to next set
          setCurrentSet((s) => s + 1);
          setPhase('work');
          setPhaseTotalSeconds(currentExercise.workSeconds);
          setSecondsRemaining(currentExercise.workSeconds);
          soundEffects.playStartChime();
          if (speechEnabled) {
            voiceAssistant.speak(`第 ${currentSet + 1} 組開始`, speechEnabled, userSettings.speechRate);
          }
        }
      } else {
        // Exercise completed! Check if next exercise exists
        const nextIndex = currentExerciseIndex + 1;
        if (nextIndex < routine.exercises.length) {
          const nextEx = routine.exercises[nextIndex];
          // Rest before next exercise
          const restTime = currentExercise.restSeconds > 0 ? currentExercise.restSeconds : 20;
          setPhase('rest');
          setPhaseTotalSeconds(restTime);
          setSecondsRemaining(restTime);
          soundEffects.playRestChime();
          if (speechEnabled) {
            voiceAssistant.speak(
              `完成本項！休息 ${restTime} 秒。下一項：${nextEx.name}`,
              speechEnabled,
              userSettings.speechRate
            );
          }
          // Update indices when resting for next exercise
          setCurrentExerciseIndex(nextIndex);
          setCurrentSet(1);
        } else {
          // All done!
          handleWorkoutComplete();
        }
      }
      return;
    }

    if (phase === 'rest') {
      // From rest -> Start next work
      const exToWork = routine.exercises[currentExerciseIndex];
      if (!exToWork) {
        handleWorkoutComplete();
        return;
      }

      setPhase('work');
      setPhaseTotalSeconds(exToWork.workSeconds);
      setSecondsRemaining(exToWork.workSeconds);
      soundEffects.playStartChime();
      if (speechEnabled) {
        voiceAssistant.speak(
          `開始：${exToWork.name}，第 ${currentSet} 組`,
          speechEnabled,
          userSettings.speechRate
        );
      }
    }
  }, [
    currentExercise,
    phase,
    currentSet,
    currentExerciseIndex,
    routine.exercises,
    speechEnabled,
    userSettings.speechRate,
    handleWorkoutComplete,
  ]);

  // Main countdown timer ticker
  useEffect(() => {
    if (phase === 'paused' || phase === 'idle' || phase === 'completed') {
      return;
    }

    const interval = setInterval(() => {
      setTotalElapsedSeconds((prev) => prev + 1);

      setSecondsRemaining((prevSec) => {
        if (prevSec > 1) {
          // Warning countdown beep for last X seconds (e.g. 3, 2, 1)
          const nextSec = prevSec - 1;
          if (soundBeepEnabled && nextSec <= userSettings.countdownSeconds && nextSec > 0) {
            soundEffects.playCountdownPip(700 + (userSettings.countdownSeconds - nextSec) * 120);
          }
          return nextSec;
        }

        // Reaching 0
        if (autoAdvance) {
          advanceToNextStep();
          return 0;
        } else {
          // In manual mode: alert user and pause at 0 until user taps button
          if (soundBeepEnabled) {
            soundEffects.playCountdownPip(1000, 0.3);
          }
          if (speechEnabled) {
            voiceAssistant.speak('時間到，請確認進入下一階段', speechEnabled, userSettings.speechRate);
          }
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    phase,
    autoAdvance,
    soundBeepEnabled,
    speechEnabled,
    userSettings.countdownSeconds,
    userSettings.speechRate,
    advanceToNextStep,
  ]);

  // Controls
  const handleTogglePlayPause = () => {
    soundEffects.unlock();
    if (phase === 'paused') {
      setPhase(prevPhase);
    } else {
      setPrevPhase(phase);
      setPhase('paused');
      voiceAssistant.cancel();
    }
  };

  const handleSkipNext = () => {
    soundEffects.unlock();
    voiceAssistant.cancel();
    advanceToNextStep();
  };

  const handleSkipPrev = () => {
    soundEffects.unlock();
    voiceAssistant.cancel();
    if (currentSet > 1) {
      setCurrentSet((s) => s - 1);
      setPhase('work');
      const workTime = currentExercise?.workSeconds || 30;
      setPhaseTotalSeconds(workTime);
      setSecondsRemaining(workTime);
    } else if (currentExerciseIndex > 0) {
      const prevIdx = currentExerciseIndex - 1;
      setCurrentExerciseIndex(prevIdx);
      const prevEx = routine.exercises[prevIdx];
      setCurrentSet(1);
      setPhase('work');
      setPhaseTotalSeconds(prevEx.workSeconds);
      setSecondsRemaining(prevEx.workSeconds);
    } else {
      // Restart prepare
      setPhase('prepare');
      setPhaseTotalSeconds(prepareSeconds);
      setSecondsRemaining(prepareSeconds);
    }
  };

  const handleJumpToExercise = (index: number) => {
    soundEffects.unlock();
    voiceAssistant.cancel();
    if (index >= 0 && index < routine.exercises.length) {
      setCurrentExerciseIndex(index);
      setCurrentSet(1);
      const targetEx = routine.exercises[index];
      setPhase('work');
      setPhaseTotalSeconds(targetEx.workSeconds);
      setSecondsRemaining(targetEx.workSeconds);
      if (speechEnabled) {
        voiceAssistant.speak(`跳至：${targetEx.name}`, speechEnabled, userSettings.speechRate);
      }
    }
  };

  const handleToggleAutoAdvance = () => {
    const nextVal = !autoAdvance;
    setAutoAdvance(nextVal);
    onUpdateSettings({ autoAdvance: nextVal });
  };

  const handleToggleSpeech = () => {
    const nextVal = !speechEnabled;
    setSpeechEnabled(nextVal);
    onUpdateSettings({ speechEnabled: nextVal });
    if (!nextVal) {
      voiceAssistant.cancel();
    }
  };

  const handleOpenVideo = (url: string, title: string) => {
    soundEffects.unlock();
    setActiveVideo({ url, title });
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 pb-16">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md px-4 py-3 border-b border-stone-200/60 flex items-center justify-between">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="p-2 -ml-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 active:scale-95 transition-all flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>退出</span>
        </button>

        <div className="text-center truncate max-w-[200px]">
          <h2 className="text-sm font-bold text-stone-900 truncate">{routine.title}</h2>
          <p className="text-[11px] text-stone-500 truncate">
            {routine.exercises.length} 項動作 · {routine.tag}
          </p>
        </div>

        <button
          onClick={() => {
            soundEffects.unlock();
            setPhase('prepare');
            setSecondsRemaining(prepareSeconds);
            setPhaseTotalSeconds(prepareSeconds);
            setCurrentExerciseIndex(0);
            setCurrentSet(1);
            setTotalElapsedSeconds(0);
          }}
          title="重新開始訓練"
          className="p-2 -mr-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 active:scale-95 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Upper Big Timer Display */}
        <TimerDisplay
          phase={phase}
          secondsRemaining={secondsRemaining}
          phaseTotalSeconds={phaseTotalSeconds}
          currentExercise={currentExercise}
          nextExercise={nextExercise}
          currentSet={currentSet}
          totalSets={currentExercise?.sets || 1}
          currentExerciseIndex={currentExerciseIndex}
          totalExercises={routine.exercises.length}
          totalElapsedSeconds={totalElapsedSeconds}
          autoAdvance={autoAdvance}
          speechEnabled={speechEnabled}
          soundBeepEnabled={soundBeepEnabled}
          onTogglePlayPause={handleTogglePlayPause}
          onSkipNext={handleSkipNext}
          onSkipPrev={handleSkipPrev}
          onToggleAutoAdvance={handleToggleAutoAdvance}
          onToggleSpeech={handleToggleSpeech}
          onManualAdvanceNow={advanceToNextStep}
        />

        {/* Lower Vertical Timeline List */}
        <TimelineList
          exercises={routine.exercises}
          currentExerciseIndex={currentExerciseIndex}
          currentSet={currentSet}
          phase={phase}
          onOpenVideo={handleOpenVideo}
          onJumpToExercise={handleJumpToExercise}
        />
      </div>

      {/* Floating Video Player (PiP / Modal) */}
      {activeVideo && (
        <FloatingVideoPlayer
          url={activeVideo.url}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}

      {/* Completion Modal with Confetti & Auto Check-in */}
      {isCompleted && (
        <CompletionModal
          routine={routine}
          totalDurationSeconds={totalElapsedSeconds}
          completedExercisesCount={routine.exercises.length}
          totalSetsCount={totalSetsCount}
          onSaveLogNote={onUpdateLogNote}
          createdLogId={createdLogId}
          onGoToCalendar={onGoToCalendar}
          onBackToHome={onExit}
          goalPlan={goalPlan}
        />
      )}

      {/* Confirm Exit Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-center shadow-xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900 text-base">確認結束訓練？</h4>
            <p className="text-xs text-stone-500 mt-1">目前進度尚未完成，提前離開將不會自動打卡。</p>
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 px-3 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-medium"
              >
                繼續訓練
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  voiceAssistant.cancel();
                  onExit();
                }}
                className="py-2.5 px-3 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-medium shadow-xs"
              >
                確定退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
