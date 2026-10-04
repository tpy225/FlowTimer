import React from 'react';
import { PlayCircle, Check, Clock, RotateCcw, Video } from 'lucide-react';
import { RoutineExerciseItem, WorkoutPhase } from '../../types/workout';

interface TimelineListProps {
  exercises: RoutineExerciseItem[];
  currentExerciseIndex: number;
  currentSet: number;
  phase: WorkoutPhase;
  onOpenVideo: (url: string, title: string) => void;
  onJumpToExercise: (index: number) => void;
}

export const TimelineList: React.FC<TimelineListProps> = ({
  exercises,
  currentExerciseIndex,
  currentSet,
  phase,
  onOpenVideo,
  onJumpToExercise,
}) => {
  return (
    <div className="w-full mt-4 pb-20">
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-stone-400" />
          訓練項目時間軸 ({exercises.length} 項)
        </h4>
        <span className="text-xs text-stone-400">點選右側影片隨時預覽動作</span>
      </div>

      <div className="relative pl-6 space-y-4">
        {/* Continuous vertical timeline track line */}
        <div className="absolute left-[15px] top-3 bottom-4 w-0.5 bg-stone-200/80 -z-0" />

        {exercises.map((item, idx) => {
          const isPast = idx < currentExerciseIndex;
          const isCurrent = idx === currentExerciseIndex;
          const isFuture = idx > currentExerciseIndex;

          return (
            <div
              key={item.id || idx}
              className={`relative flex items-start gap-3 transition-all duration-300 ${
                isCurrent ? 'scale-[1.01]' : 'opacity-90'
              }`}
            >
              {/* Timeline Node Badge on the left */}
              <div
                className={`absolute -left-6 top-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs z-10 ${
                  isPast
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                    : isCurrent
                    ? phase === 'work'
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 animate-pulse'
                      : phase === 'rest'
                      ? 'bg-sky-500 text-white ring-4 ring-sky-200'
                      : 'bg-amber-500 text-white ring-4 ring-amber-200'
                    : 'bg-stone-100 text-stone-500 border border-stone-300'
                }`}
              >
                {isPast ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <span>{idx + 1}</span>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Exercise Card */}
              <div
                className={`w-full rounded-2xl p-3.5 border transition-all duration-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-white shadow-md border-amber-300/80 ring-2 ring-amber-200/50'
                    : isPast
                    ? 'bg-stone-50/70 border-stone-200 text-stone-600'
                    : 'bg-white/80 border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Left: Thumbnail & Info */}
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => onJumpToExercise(idx)}
                >
                  {/* Thumbnail / Image */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/70">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
                        <RotateCcw className="w-5 h-5 text-stone-300" />
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute inset-0 bg-emerald-600/10 pointer-events-none" />
                    )}
                  </div>

                  {/* Text details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className={`font-bold text-sm truncate ${isCurrent ? 'text-stone-900' : 'text-stone-700'}`}>
                        {item.name}
                      </h5>
                      {isCurrent && (
                        <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          第 {currentSet} / {item.sets} 組
                        </span>
                      )}
                      {isPast && (
                        <span className="shrink-0 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          已完成
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                      <span className="font-medium text-stone-600">{item.sets} 組</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-medium">運動 {item.workSeconds}s</span>
                      <span>·</span>
                      <span className="text-sky-700 font-medium">休息 {item.restSeconds}s</span>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">{item.notes}</p>
                    )}
                  </div>
                </div>

                {/* Right: Video Preview Button (Side-by-side or quick tap) */}
                <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100 justify-end">
                  {item.videoUrl ? (
                    <button
                      onClick={() => onOpenVideo(item.videoUrl!, item.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-medium active:scale-95 transition-all shadow-2xs"
                      title="開啟影片示範 (支援畫中畫播放)"
                    >
                      <Video className="w-3.5 h-3.5 text-amber-600" />
                      <span>動作示範</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-stone-400 italic px-2 py-1">無示範影片</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
