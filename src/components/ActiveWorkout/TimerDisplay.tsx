import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, CheckCircle, Flame } from 'lucide-react';
import { WorkoutPhase, RoutineExerciseItem } from '../../types/workout';
import { formatTime } from '../../utils/storage';

interface TimerDisplayProps {
  phase: WorkoutPhase;
  secondsRemaining: number;
  phaseTotalSeconds: number;
  currentExercise: RoutineExerciseItem | null;
  nextExercise: RoutineExerciseItem | null;
  currentSet: number;
  totalSets: number;
  currentExerciseIndex: number;
  totalExercises: number;
  totalElapsedSeconds: number;
  autoAdvance: boolean;
  speechEnabled: boolean;
  soundBeepEnabled: boolean;
  onTogglePlayPause: () => void;
  onSkipNext: () => void;
  onSkipPrev: () => void;
  onToggleAutoAdvance: () => void;
  onToggleSpeech: () => void;
  onManualAdvanceNow?: () => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  phase,
  secondsRemaining,
  phaseTotalSeconds,
  currentExercise,
  nextExercise,
  currentSet,
  totalSets,
  currentExerciseIndex,
  totalExercises,
  totalElapsedSeconds,
  autoAdvance,
  speechEnabled,
  onTogglePlayPause,
  onSkipNext,
  onSkipPrev,
  onToggleAutoAdvance,
  onToggleSpeech,
  onManualAdvanceNow,
}) => {
  // Calculate circular progress percentage
  const progressRatio = phaseTotalSeconds > 0 ? (phaseTotalSeconds - secondsRemaining) / phaseTotalSeconds : 0;
  const radius = 104;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Visual phase theme colors (gentle & soft)
  const getPhaseTheme = () => {
    switch (phase) {
      case 'work':
        return {
          title: '運動中',
          subtext: '專注動作與呼吸',
          bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          strokeColor: '#34d399',
          accentColor: 'text-emerald-700',
          timerTextClass: 'text-emerald-950',
          glowClass: 'shadow-emerald-100',
        };
      case 'rest':
        return {
          title: '休息中',
          subtext: '調整呼吸，準備下一組',
          bgClass: 'bg-sky-50 text-sky-800 border-sky-200',
          strokeColor: '#38bdf8',
          accentColor: 'text-sky-700',
          timerTextClass: 'text-sky-950',
          glowClass: 'shadow-sky-100',
        };
      case 'prepare':
        return {
          title: '準備就緒',
          subtext: '調整姿勢，即將開始',
          bgClass: 'bg-amber-50 text-amber-800 border-amber-200',
          strokeColor: '#f59e0b',
          accentColor: 'text-amber-700',
          timerTextClass: 'text-amber-950',
          glowClass: 'shadow-amber-100',
        };
      case 'paused':
        return {
          title: '已暫停',
          subtext: '隨時點擊繼續',
          bgClass: 'bg-stone-100 text-stone-700 border-stone-300',
          strokeColor: '#a8a29e',
          accentColor: 'text-stone-600',
          timerTextClass: 'text-stone-800',
          glowClass: 'shadow-stone-100',
        };
      case 'completed':
        return {
          title: '訓練完成！',
          subtext: '身心舒暢，表現出色',
          bgClass: 'bg-teal-50 text-teal-800 border-teal-200',
          strokeColor: '#2dd4bf',
          accentColor: 'text-teal-700',
          timerTextClass: 'text-teal-950',
          glowClass: 'shadow-teal-100',
        };
      default:
        return {
          title: '準備開始',
          subtext: '點擊播放開始計時',
          bgClass: 'bg-stone-50 text-stone-700 border-stone-200',
          strokeColor: '#cbd5e1',
          accentColor: 'text-stone-600',
          timerTextClass: 'text-stone-800',
          glowClass: 'shadow-stone-100',
        };
    }
  };

  const theme = getPhaseTheme();
  const isWaitingManual = !autoAdvance && secondsRemaining === 0 && (phase === 'work' || phase === 'rest');

  return (
    <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-stone-200/80 transition-all">
      {/* Top micro badges */}
      <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-medium bg-stone-100 px-2.5 py-1 rounded-full text-stone-700">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            累積 {formatTime(totalElapsedSeconds)}
          </span>
          <span className="bg-stone-100 px-2.5 py-1 rounded-full text-stone-600">
            項目 {currentExerciseIndex + 1} / {totalExercises}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Voice Toggle */}
          <button
            onClick={onToggleSpeech}
            className={`p-1.5 rounded-full transition-colors ${
              speechEnabled ? 'text-amber-800 bg-amber-100/70 hover:bg-amber-200' : 'text-stone-400 bg-stone-100'
            }`}
            title={speechEnabled ? '語音播報：已開啟' : '語音播報：已關閉'}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Auto vs Manual Mode Switch */}
          <button
            onClick={onToggleAutoAdvance}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1 ${
              autoAdvance
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
            title="點擊切換 自動進行 / 手動下一項目"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
            {autoAdvance ? '自動進行' : '手動下一項'}
          </button>
        </div>
      </div>

      {/* Big Circular Timer Center */}
      <div className="flex flex-col items-center justify-center my-1 relative">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Background circle & Progress circle */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
            <circle
              cx="120"
              cy="120"
              r={radius}
              stroke="#f1efe7"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="120"
              cy="120"
              r={radius}
              stroke={theme.strokeColor}
              strokeWidth="11"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-linear"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none px-4">
            {/* Phase Badge */}
            <div className={`px-3 py-0.5 rounded-full border text-xs font-semibold tracking-wider mb-1 ${theme.bgClass}`}>
              {theme.title}
            </div>

            {/* Huge Seconds / Time Display */}
            <div className={`font-mono text-5xl sm:text-6xl font-extrabold tracking-tight ${theme.timerTextClass}`}>
              {formatTime(secondsRemaining)}
            </div>

            {/* Set info */}
            {currentExercise && phase !== 'completed' && (
              <div className="mt-1 text-xs font-semibold text-stone-600 bg-stone-100/90 px-2.5 py-0.5 rounded-full">
                第 {currentSet} / {totalSets} 組
              </div>
            )}

            {/* Subtitle helper */}
            <p className="text-[11px] text-stone-500 mt-1 max-w-[170px] truncate">
              {isWaitingManual ? '時間到！點擊下方前進' : theme.subtext}
            </p>
          </div>
        </div>
      </div>

      {/* Current Exercise Name & Next Up Ribbon */}
      <div className="text-center mt-1 mb-4">
        <h3 className="text-xl font-bold text-stone-900 tracking-tight flex items-center justify-center gap-1.5">
          {currentExercise ? currentExercise.name : '訓練已就緒'}
        </h3>
        {nextExercise && phase !== 'completed' && (
          <p className="text-xs text-stone-500 mt-1 flex items-center justify-center gap-1">
            <span className="text-stone-400">下一項：</span>
            <span className="font-medium text-stone-700">{nextExercise.name}</span>
            <span className="text-stone-400">({nextExercise.sets}組 × {nextExercise.workSeconds}秒)</span>
          </p>
        )}
      </div>

      {/* Manual Notice when timer zero and waiting manual tap */}
      {isWaitingManual && onManualAdvanceNow && (
        <div className="mb-4 animate-bounce">
          <button
            onClick={onManualAdvanceNow}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            完成當前階段，進入下一階段
          </button>
        </div>
      )}

      {/* Big Controller Buttons for Workout Execution */}
      <div className="flex items-center justify-center gap-6 pt-2 border-t border-stone-100">
        {/* Previous Step */}
        <button
          onClick={onSkipPrev}
          title="回上一項 / 上一組"
          className="p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 active:scale-95 transition-all"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Big Play / Pause */}
        <button
          onClick={onTogglePlayPause}
          title={phase === 'paused' ? '繼續訓練' : '暫停訓練'}
          className={`p-5 rounded-3xl text-white shadow-lg shadow-stone-300/50 active:scale-95 transition-all flex items-center justify-center ${
            phase === 'paused' || phase === 'idle'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-stone-800 hover:bg-stone-900'
          }`}
        >
          {phase === 'paused' || phase === 'idle' ? (
            <Play className="w-8 h-8 fill-current ml-0.5" />
          ) : (
            <Pause className="w-8 h-8 fill-current" />
          )}
        </button>

        {/* Next Step / Skip */}
        <button
          onClick={onSkipNext}
          title="跳至下一項 / 下一組"
          className="p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 active:scale-95 transition-all"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
