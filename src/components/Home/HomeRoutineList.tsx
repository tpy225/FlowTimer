import React, { useState } from 'react';
import {
  Play,
  Clock,
  Layers,
  Plus,
  Flame,
  MoreVertical,
  Edit2,
  Trash2,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Video
} from 'lucide-react';
import { WorkoutRoutine } from '../../types/workout';
import { calculateRoutineDuration, formatTime } from '../../utils/storage';

interface HomeRoutineListProps {
  routines: WorkoutRoutine[];
  streakDays: number;
  todayCompletedCount: number;
  onSelectRoutineToStart: (routine: WorkoutRoutine) => void;
  onEditRoutine: (routine: WorkoutRoutine) => void;
  onDeleteRoutine: (id: string) => void;
  onCreateNewRoutine: () => void;
  onOpenVideoPreview: (url: string, title: string) => void;
}

export const HomeRoutineList: React.FC<HomeRoutineListProps> = ({
  routines,
  streakDays,
  todayCompletedCount,
  onSelectRoutineToStart,
  onEditRoutine,
  onDeleteRoutine,
  onCreateNewRoutine,
  onOpenVideoPreview,
}) => {
  const [filterTag, setFilterTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all unique tags
  const allTags = ['all', ...Array.from(new Set(routines.map((r) => r.tag).filter(Boolean)))];

  const filtered = routines.filter((r) => {
    const matchesTag = filterTag === 'all' || r.tag === filterTag;
    const matchesSearch =
      !searchQuery.trim() ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28">
      {/* Top Welcome / Daily Motivation Banner */}
      <div className="bg-gradient-to-br from-amber-100/70 via-orange-50/50 to-emerald-50/60 rounded-3xl p-5 border border-amber-200/60 shadow-xs mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/80 text-amber-900 border border-amber-200/50 shadow-2xs">
            🌸 舒緩與力量
          </span>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-200/50 px-2.5 py-0.5 rounded-full">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            連續 {streakDays} 天打卡
          </div>
        </div>

        <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">
          選擇一組訓練，開始專注呼吸
        </h1>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
          {todayCompletedCount > 0
            ? `太棒了！今天已完成 ${todayCompletedCount} 項訓練打卡，隨時可以再來一組。`
            : '挑選適合當下狀態的訓練組合，點擊即可開啟大字計時與語音引導。'}
        </p>
      </div>

      {/* Routine Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-amber-600" />
          精選與自訂組合 ({filtered.length})
        </h2>
        <button
          onClick={onCreateNewRoutine}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          建立組合
        </button>
      </div>

      {/* Filter Tag Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterTag === tag
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {tag === 'all' ? '全部' : tag}
          </button>
        ))}
      </div>

      {/* Routine Cards List */}
      <div className="space-y-4">
        {filtered.map((routine) => {
          const durationSec = calculateRoutineDuration(routine);
          const totalSets = routine.exercises.reduce((acc, ex) => acc + (ex.sets || 1), 0);

          return (
            <div
              key={routine.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-md transition-all group"
            >
              {/* Cover Image or Header Banner */}
              <div className="relative h-32 w-full overflow-hidden bg-stone-200">
                {routine.coverImage ? (
                  <img
                    src={routine.coverImage}
                    alt={routine.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-amber-100 to-emerald-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Badges on image */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-stone-800 shadow-2xs">
                    {routine.tag}
                  </span>
                  {routine.isPreset && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500 text-white">
                      推薦預設
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                  <div>
                    <h3 className="font-bold text-lg drop-shadow-xs">{routine.title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span className="font-mono">{formatTime(durationSec)}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                {routine.description && (
                  <p className="text-xs text-stone-500 mb-3 line-clamp-1">{routine.description}</p>
                )}

                {/* Exercises preview pills */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[11px] font-semibold text-stone-400">動作清單 ({routine.exercises.length} 項 · 共 {totalSets} 組)：</div>
                  <div className="flex flex-wrap gap-1.5">
                    {routine.exercises.map((ex, i) => (
                      <span
                        key={ex.id || i}
                        className="text-[11px] px-2.5 py-1 bg-stone-50 rounded-xl border border-stone-200/70 text-stone-700 flex items-center gap-1"
                      >
                        <span className="font-semibold">{ex.name}</span>
                        <span className="text-[10px] text-stone-400">({ex.sets}組)</span>
                        {ex.videoUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenVideoPreview(ex.videoUrl!, ex.name);
                            }}
                            className="text-amber-600 hover:text-amber-800 ml-0.5"
                            title="預覽此動作影片"
                          >
                            <Video className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => onSelectRoutineToStart(routine)}
                    className="flex-1 py-3 px-4 bg-stone-900 hover:bg-black text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    開始訓練計時
                  </button>

                  <button
                    onClick={() => onEditRoutine(routine)}
                    className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl transition-colors"
                    title="編輯此組合 (調整動作、組數與時間)"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {!routine.isPreset && (
                    <button
                      onClick={() => {
                        if (window.confirm(`確定要刪除自訂組合「${routine.title}」嗎？`)) {
                          onDeleteRoutine(routine.id);
                        }
                      }}
                      className="p-3 bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-2xl transition-colors"
                      title="刪除此組合"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
