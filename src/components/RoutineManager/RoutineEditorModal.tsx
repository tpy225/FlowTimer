import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  Sparkles,
  Dumbbell,
  X,
  Check,
  Layers,
  ArrowRight,
  Flame
} from 'lucide-react';
import { WorkoutRoutine, RoutineExerciseItem, ExerciseItem } from '../../types/workout';
import { calculateRoutineDuration, formatTime, normalizeExerciseName } from '../../utils/storage';
import { useAlert, useConfirm } from '../ui/ConfirmProvider';

interface RoutineEditorModalProps {
  routine: WorkoutRoutine | null; // null for creating new
  allExercises: ExerciseItem[];
  onSave: (routine: WorkoutRoutine) => void;
  onClose: () => void;
  onSaveExerciseToLibrary: (ex: {
    name: string;
    sets?: number;
    workSeconds?: number;
    restSeconds?: number;
    videoUrl?: string;
    imageUrl?: string;
    notes?: string;
  }) => boolean;
}

export const RoutineEditorModal: React.FC<RoutineEditorModalProps> = ({
  routine,
  allExercises,
  onSave,
  onClose,
  onSaveExerciseToLibrary,
}) => {
  const showAlert = useAlert();
  const confirm = useConfirm();
  const [title, setTitle] = useState(routine?.title || '');
  const [description, setDescription] = useState(routine?.description || '');
  const [tag, setTag] = useState(routine?.tag || '綜合訓練');
  const [prepareSeconds, setPrepareSeconds] = useState(routine?.prepareSeconds || 5);
  const [coverImage, setCoverImage] = useState(
    routine?.coverImage || 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
  );
  const [exercises, setExercises] = useState<RoutineExerciseItem[]>(routine?.exercises || []);

  // Exercise Picker Drawer state
  const [showPicker, setShowPicker] = useState(false);

  // Add exercise from library into routine
  const handleAddExerciseFromLibrary = (libItem: ExerciseItem) => {
    const newItem: RoutineExerciseItem = {
      id: 're-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      exerciseId: libItem.id,
      name: libItem.name,
      sets: libItem.defaultSets,
      workSeconds: libItem.defaultWorkSeconds,
      restSeconds: libItem.defaultRestSeconds,
      videoUrl: libItem.videoUrl,
      imageUrl: libItem.imageUrl,
      notes: libItem.description,
    };
    setExercises((prev) => [...prev, newItem]);
    setShowPicker(false);
  };

  // Modify exercise inside routine
  const handleUpdateItem = (index: number, updates: Partial<RoutineExerciseItem>) => {
    setExercises((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  // Reorder exercises
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setExercises((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === exercises.length - 1) return;
    setExercises((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Remove exercise from routine
  const handleRemoveItem = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  // Badge: emerald when the exercise already exists in library; click to add when missing
  const isExerciseInLibrary = (name: string) => {
    const norm = normalizeExerciseName(name);
    return allExercises.some((e) => normalizeExerciseName(e.name) === norm);
  };

  const handleBadgeClick = async (item: RoutineExerciseItem) => {
    if (isExerciseInLibrary(item.name)) return;
    const ok = await confirm(`將「${item.name}」加入動作庫嗎？`, {
      title: '加入動作庫',
      confirmText: '加入',
      danger: false,
    });
    if (!ok) return;
    onSaveExerciseToLibrary({
      name: item.name,
      sets: item.sets,
      workSeconds: item.workSeconds,
      restSeconds: item.restSeconds,
      videoUrl: item.videoUrl,
      imageUrl: item.imageUrl,
      notes: item.notes,
    });
  };

  // Temporary mock object to compute duration
  const currentTempRoutine: WorkoutRoutine = {
    id: routine?.id || 'temp',
    title,
    description,
    tag,
    prepareSeconds,
    exercises,
    createdAt: routine?.createdAt || Date.now(),
  };

  const totalDuration = calculateRoutineDuration(currentTempRoutine);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (exercises.length === 0) {
      showAlert('請至少加入一個訓練動作！');
      return;
    }

    const savedRoutine: WorkoutRoutine = {
      id: routine?.id || 'routine-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      tag: tag.trim() || '自訂組合',
      coverImage: coverImage.trim() || undefined,
      prepareSeconds: Number(prepareSeconds) || 5,
      exercises,
      createdAt: routine?.createdAt || Date.now(),
      isPreset: routine?.isPreset || false,
    };

    onSave(savedRoutine);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base text-stone-900">
              {routine ? '編輯訓練組合' : '建立全新訓練組合'}
            </h3>
            <p className="text-[11px] text-stone-500">自訂組合名稱、安排項目順序與個別組數時間</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs text-stone-700">
          {/* Title & Tag */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block font-semibold mb-1">組合名稱 *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：腹肌撕裂者、15分鐘全身燃脂"
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">類別標籤</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="燃脂/核心/放鬆"
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          {/* Description & Prepare Seconds */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block font-semibold mb-1">簡要說明 (選填)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="簡述適合的人群或目的"
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">開始前預備</label>
              <select
                value={prepareSeconds}
                onChange={(e) => setPrepareSeconds(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-400"
              >
                <option value={3}>3 秒</option>
                <option value={5}>5 秒</option>
                <option value={10}>10 秒</option>
              </select>
            </div>
          </div>

          {/* Exercises in Routine List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                已包含的動作清單 ({exercises.length} 項)
              </label>
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/70 hover:bg-amber-200 px-2.5 py-1 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                從動作庫加入
              </button>
            </div>

            {exercises.length === 0 ? (
              <div
                onClick={() => setShowPicker(true)}
                className="text-center py-8 px-4 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-amber-300 bg-stone-50/50 hover:bg-amber-50/20 transition-colors"
              >
                <Dumbbell className="w-7 h-7 text-stone-300 mx-auto mb-1.5" />
                <p className="font-semibold text-stone-700">目前尚未加入任何動作</p>
                <p className="text-[11px] text-stone-400 mt-0.5">點此瀏覽並挑選動作庫中的訓練項目</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {exercises.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2"
                  >
                    {/* Item title and order controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const inLib = isExerciseInLibrary(item.name);
                          return (
                            <button
                              type="button"
                              onClick={() => handleBadgeClick(item)}
                              disabled={inLib}
                              title={inLib ? '已在動作庫中' : '點擊加入動作庫'}
                              className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors active:scale-90 ${
                                inLib
                                  ? 'bg-amber-100/70 text-amber-800 cursor-default'
                                  : 'bg-stone-200 text-stone-700 hover:bg-amber-200'
                              }`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })()}
                        <h4 className="font-bold text-xs text-stone-800 truncate max-w-[170px]">
                          {item.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 rounded"
                          title="上移順序"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === exercises.length - 1}
                          className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 rounded"
                          title="下移順序"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-stone-400 hover:text-red-500 rounded ml-1"
                          title="移除此項"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Override sets, work, rest for this routine */}
                    <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-xl border border-stone-200/60">
                      <div>
                        <span className="text-[10px] text-stone-500 block mb-0.5">組數</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={item.sets}
                          onChange={(e) => handleUpdateItem(idx, { sets: Number(e.target.value) })}
                          className="w-full text-center p-1 rounded-lg border border-stone-200 bg-stone-50 font-mono text-xs focus:outline-hidden focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 block mb-0.5">運動 (秒)</span>
                        <input
                          type="number"
                          min="5"
                          max="600"
                          value={item.workSeconds}
                          onChange={(e) => handleUpdateItem(idx, { workSeconds: Number(e.target.value) })}
                          className="w-full text-center p-1 rounded-lg border border-emerald-200 bg-emerald-50/50 font-mono text-xs focus:outline-hidden focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-sky-700 block mb-0.5">休息 (秒)</span>
                        <input
                          type="number"
                          min="0"
                          max="300"
                          value={item.restSeconds}
                          onChange={(e) => handleUpdateItem(idx, { restSeconds: Number(e.target.value) })}
                          className="w-full text-center p-1 rounded-lg border border-sky-200 bg-sky-50/50 font-mono text-xs focus:outline-hidden focus:border-sky-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Routine Summary Card */}
          <div className="bg-amber-50/80 rounded-2xl p-3 border border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-semibold text-amber-950">預估總時長</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-base font-bold text-amber-900">
                {formatTime(totalDuration)}
              </span>
              <span className="text-[10px] text-amber-700 ml-1">
                ({exercises.length} 項動作)
              </span>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-stone-900 hover:bg-black text-white rounded-2xl font-semibold text-sm shadow-md active:scale-98 transition-all"
            >
              {routine ? '保存組合修改' : '建立訓練組合'}
            </button>
          </div>
        </form>

        {/* Drawer / Sub-modal to Pick Exercise from Library */}
        {showPicker && (
          <div className="absolute inset-0 z-20 bg-stone-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-h-[85vh] flex flex-col p-4 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h4 className="font-bold text-sm text-stone-900">從動作庫挑選項目</h4>
                <button
                  onClick={() => setShowPicker(false)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 py-3 overflow-y-auto flex-1">
                {allExercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-2.5 rounded-2xl border border-stone-200 hover:border-amber-300 bg-stone-50/50 hover:bg-amber-50/20 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                        {ex.imageUrl ? (
                          <img src={ex.imageUrl} alt={ex.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Dumbbell className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="truncate">
                        <h5 className="font-bold text-xs text-stone-900 truncate">{ex.name}</h5>
                        <p className="text-[10px] text-stone-500">
                          {ex.defaultSets}組 · 運動 {ex.defaultWorkSeconds}s / 休息 {ex.defaultRestSeconds}s
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddExerciseFromLibrary(ex)}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shrink-0 active:scale-95 transition-transform"
                    >
                      加入
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
