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
  Video,
  Star,
  X
} from 'lucide-react';
import { WorkoutRoutine, UserProfile } from '../../types/workout';
import { calculateRoutineDuration, formatTime } from '../../utils/storage';

interface HomeRoutineListProps {
  routines: WorkoutRoutine[];
  streakDays: number;
  todayCompletedCount: number;
  profile: UserProfile;
  onToggleFavoriteRoutine: (routineId: string) => void;
  onSelectRoutineToStart: (routine: WorkoutRoutine) => void;
  onEditRoutine: (routine: WorkoutRoutine) => void;
  onDeleteRoutine: (id: string) => void;
  onCreateNewRoutine: () => void;
  onOpenVideoPreview: (url: string, title: string) => void;
  onGoToAICoach?: () => void;
}

export const HomeRoutineList: React.FC<HomeRoutineListProps> = ({
  routines,
  streakDays,
  todayCompletedCount,
  profile,
  onToggleFavoriteRoutine,
  onSelectRoutineToStart,
  onEditRoutine,
  onDeleteRoutine,
  onCreateNewRoutine,
  onOpenVideoPreview,
  onGoToAICoach,
}) => {
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all unique tags
  const allTags = ['all', ...Array.from(new Set(routines.map((r) => r.tag).filter(Boolean)))];
  const favoriteCount = routines.filter((r) => r.isFavorite).length;

  const filtered = routines.filter((r) => {
    const matchesTag = filterTag === 'all' || r.tag === filterTag;
    const matchesFav = !showFavoritesOnly || Boolean(r.isFavorite);
    const matchesSearch =
      !searchQuery.trim() ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesFav && matchesSearch;
  });

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28">
      {/* Sleek Compact Top Bar on Home */}
      <div className="flex items-center justify-between mb-4 bg-white/80 p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-amber-200/80 shrink-0 shadow-2xs">
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-stone-900">{profile.name}</span>
              <span className="text-[10px] text-stone-400">· 專注當下</span>
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              {todayCompletedCount > 0
                ? `今日已打卡 ${todayCompletedCount} 組訓練 ✨`
                : '挑選適合當下狀態的訓練組合開始吧！'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-full border border-amber-200/80 shrink-0">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          {streakDays} 天打卡
        </div>
      </div>

      {/* Search Input Bar for Quick Search */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="快捷搜索訓練組合名稱、說明或標籤..."
          className="w-full pl-10 pr-8 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-amber-400 placeholder:text-stone-400 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
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

      {/* Filter Tag & Favorite Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {/* Favorite Quick Filter Pill */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
            showFavoritesOnly
              ? 'bg-amber-500 text-white shadow-2xs ring-2 ring-amber-300'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white text-white' : 'text-amber-500 fill-amber-400'}`} />
          已收藏 ({favoriteCount})
        </button>

        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterTag === tag && !showFavoritesOnly
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
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-200 text-stone-400">
            <Star className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <h4 className="font-bold text-sm text-stone-700">未找到符合條件的組合</h4>
            <p className="text-xs text-stone-400 mt-1">
              {showFavoritesOnly ? '您尚未收藏此類別的組合，點擊卡片右上角星星即可加入收藏！' : '請嘗試清除搜尋關鍵字或切換標籤分類。'}
            </p>
          </div>
        ) : (
          filtered.map((routine) => {
            const durationSec = calculateRoutineDuration(routine);
            const totalSets = routine.exercises.reduce((acc, ex) => acc + (ex.sets || 1), 0);

            return (
              <div
                key={routine.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-md transition-all group relative"
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

                  {/* Favorite Toggle Button on Routine Cover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavoriteRoutine(routine.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 z-10 ${
                      routine.isFavorite
                        ? 'bg-white text-amber-500 shadow-md ring-1 ring-amber-300'
                        : 'bg-black/35 text-white/80 hover:bg-black/55 hover:text-white'
                    }`}
                    title={routine.isFavorite ? '取消收藏' : '加入收藏'}
                  >
                    <Star
                      className={`w-4 h-4 transition-transform ${
                        routine.isFavorite ? 'fill-amber-400 text-amber-500 scale-110' : ''
                      }`}
                    />
                  </button>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white pr-2">
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
        }))}
      </div>
    </div>
  );
};
