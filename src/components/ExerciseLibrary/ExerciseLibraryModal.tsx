import React, { useState } from 'react';
import {
  Plus,
  Search,
  Video,
  Trash2,
  Edit2,
  ExternalLink,
  Dumbbell,
  Clock,
  Sparkles,
  Check,
  X,
  PlayCircle
} from 'lucide-react';
import { ExerciseItem } from '../../types/workout';
import { parseVideoUrl } from '../../utils/video';
import { FloatingVideoPlayer } from '../VideoPlayer/FloatingVideoPlayer';

interface ExerciseLibraryModalProps {
  exercises: ExerciseItem[];
  onAddExercise: (ex: Omit<ExerciseItem, 'id' | 'createdAt'>) => void;
  onUpdateExercise: (ex: ExerciseItem) => void;
  onDeleteExercise: (id: string) => void;
  onClose?: () => void;
}

const CATEGORIES: { key: ExerciseItem['category'] | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'core', label: '核心' },
  { key: 'legs', label: '下肢/臀腿' },
  { key: 'upper', label: '上肢/胸背' },
  { key: 'cardio', label: '心肺燃脂' },
  { key: 'stretch', label: '伸展拉伸' },
];

const PRESET_IMAGE_TEMPLATES = [
  { label: '深蹲/腿部', url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80' },
  { label: '平板/核心', url: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=600&q=80' },
  { label: '俯臥撐/胸肌', url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80' },
  { label: '開合跳/心肺', url: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&w=600&q=80' },
  { label: '伸展/瑜珈', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80' },
  { label: '臀橋/塑形', url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80' },
];

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  exercises,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<ExerciseItem['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingExercise, setEditingExercise] = useState<ExerciseItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ExerciseItem['category']>('core');
  const [formSets, setFormSets] = useState(3);
  const [formWorkSec, setFormWorkSec] = useState(30);
  const [formRestSec, setFormRestSec] = useState(20);
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const openCreateForm = () => {
    setEditingExercise(null);
    setFormName('');
    setFormCategory('core');
    setFormSets(3);
    setFormWorkSec(35);
    setFormRestSec(20);
    setFormVideoUrl('');
    setFormImageUrl(PRESET_IMAGE_TEMPLATES[0].url);
    setFormDescription('');
    setIsCreatingNew(true);
  };

  const openEditForm = (item: ExerciseItem) => {
    setEditingExercise(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormSets(item.defaultSets);
    setFormWorkSec(item.defaultWorkSeconds);
    setFormRestSec(item.defaultRestSeconds);
    setFormVideoUrl(item.videoUrl || '');
    setFormImageUrl(item.imageUrl || '');
    setFormDescription(item.description || '');
    setIsCreatingNew(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingExercise) {
      onUpdateExercise({
        ...editingExercise,
        name: formName.trim(),
        category: formCategory,
        defaultSets: Number(formSets) || 3,
        defaultWorkSeconds: Number(formWorkSec) || 30,
        defaultRestSeconds: Number(formRestSec) || 20,
        videoUrl: formVideoUrl.trim() || undefined,
        imageUrl: formImageUrl.trim() || undefined,
        description: formDescription.trim() || undefined,
      });
    } else {
      onAddExercise({
        name: formName.trim(),
        category: formCategory,
        defaultSets: Number(formSets) || 3,
        defaultWorkSeconds: Number(formWorkSec) || 30,
        defaultRestSeconds: Number(formRestSec) || 20,
        videoUrl: formVideoUrl.trim() || undefined,
        imageUrl: formImageUrl.trim() || undefined,
        description: formDescription.trim() || undefined,
      });
    }

    setIsCreatingNew(false);
    setEditingExercise(null);
  };

  // Filter exercises
  const filtered = exercises.filter((ex) => {
    const matchesCat = activeCategory === 'all' || ex.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.description && ex.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">動作項目庫</h2>
          <p className="text-xs text-stone-500 mt-0.5">自訂單個訓練項目的時間、組數與示範影片</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-2xl shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          新增動作
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜尋動作名稱或動作說明..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:border-amber-400 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? 'bg-amber-100 text-amber-900 border border-amber-300/80 shadow-2xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Exercises List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200/70 p-6">
            <Dumbbell className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-stone-600">未找到符合條件的動作</p>
            <p className="text-xs text-stone-400 mt-1">點擊上方「新增動作」建立屬於你的專屬訓練庫</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-2.5"
            >
              <div className="flex items-start gap-3">
                {/* Photo Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100 relative group">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <Dumbbell className="w-6 h-6" />
                    </div>
                  )}
                  {item.videoUrl && (
                    <button
                      onClick={() => setPreviewVideo({ url: item.videoUrl!, title: item.name })}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 hover:opacity-100 text-white transition-opacity"
                      title="快速預覽影片"
                    >
                      <PlayCircle className="w-6 h-6 fill-white/20" />
                    </button>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-stone-900 truncate">{item.name}</h4>
                    <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                      {CATEGORIES.find((c) => c.key === item.category)?.label || item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                    <span className="font-medium text-stone-700">{item.defaultSets} 組</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-medium">運動 {item.defaultWorkSeconds}s</span>
                    <span>·</span>
                    <span className="text-sky-700 font-medium">休息 {item.defaultRestSeconds}s</span>
                  </div>

                  {item.description && (
                    <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">{item.description}</p>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                <div className="flex items-center gap-2">
                  {item.videoUrl ? (
                    <button
                      onClick={() => setPreviewVideo({ url: item.videoUrl!, title: item.name })}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors border border-amber-200/60"
                    >
                      <Video className="w-3 h-3 text-amber-600" />
                      預覽示範影片
                    </button>
                  ) : (
                    <span className="text-[11px] text-stone-400 italic">無示範影片</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditForm(item)}
                    className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                    title="編輯動作"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`確定要刪除動作「${item.name}」嗎？`)) {
                        onDeleteExercise(item.id);
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="刪除動作"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal Dialog */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-stone-900">
                {editingExercise ? '編輯訓練動作' : '新增單個訓練動作'}
              </h3>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs text-stone-700">
              {/* Name */}
              <div>
                <label className="block font-semibold mb-1">動作名稱 *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="例如：啞鈴推舉、開合跳、深蹲"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold mb-1">訓練分類</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ExerciseItem['category'])}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-400"
                >
                  <option value="core">核心訓練</option>
                  <option value="legs">下肢/臀腿</option>
                  <option value="upper">上肢/胸背</option>
                  <option value="cardio">心肺燃脂</option>
                  <option value="stretch">伸展放鬆</option>
                  <option value="fullbody">全身綜合</option>
                </select>
              </div>

              {/* Default intervals: Sets, Work, Rest */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">預設組數</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formSets}
                    onChange={(e) => setFormSets(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50 text-center font-mono font-medium focus:bg-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-emerald-800">運動 (秒)</label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    value={formWorkSec}
                    onChange={(e) => setFormWorkSec(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center font-mono font-medium focus:bg-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-sky-800">休息 (秒)</label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={formRestSec}
                    onChange={(e) => setFormRestSec(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-sky-200 bg-sky-50/50 text-center font-mono font-medium focus:bg-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Video URL with test/preview button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-amber-600" />
                    自定義示範影片 URL (選填)
                  </label>
                  {formVideoUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewVideo({ url: formVideoUrl, title: formName || '影片預覽' })}
                      className="text-[11px] text-amber-700 underline hover:text-amber-800"
                    >
                      即時測試播放
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  placeholder="輸入 YouTube、Vimeo 網址或 MP4 直鏈"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-400 font-mono text-[11px]"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  支援 YouTube 影片/Shorts 或任何 MP4 影片網址，訓練時可隨時畫中畫觀看。
                </p>
              </div>

              {/* Image URL & Quick Picker */}
              <div>
                <label className="block font-semibold mb-1">圖片網址 (選填)</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="輸入圖片網址 (https://...)"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-400 font-mono text-[11px] mb-1.5"
                />

                {/* Quick preset images */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[10px] text-stone-400 shrink-0">快速選圖:</span>
                  {PRESET_IMAGE_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.label}
                      type="button"
                      onClick={() => setFormImageUrl(tmpl.url)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors shrink-0 ${
                        formImageUrl === tmpl.url
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold mb-1">動作要點 / 姿勢提示</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="例如：核心收緊、背部挺直、膝蓋不超過腳尖"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-medium shadow-md active:scale-98 transition-all"
                >
                  {editingExercise ? '保存修改' : '建立動作'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Video Player preview */}
      {previewVideo && (
        <FloatingVideoPlayer
          url={previewVideo.url}
          title={previewVideo.title}
          onClose={() => setPreviewVideo(null)}
        />
      )}
    </div>
  );
};
