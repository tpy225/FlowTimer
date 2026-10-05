import React, { useState } from 'react';
import {
  Edit3,
  Target,
  Flame,
  Scale,
  Ruler,
  Activity,
  Sparkles,
  Check,
  X,
  Camera
} from 'lucide-react';
import { UserProfile } from '../../types/workout';

interface UserProfileCardProps {
  profile: UserProfile;
  streakDays: number;
  todayCompletedCount: number;
  onUpdateProfile: (updated: UserProfile) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80', // Yoga woman
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80', // Fitness stretch
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', // Warm smile
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', // Active outdoors
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', // Energetic guy
];

const PRESET_GOALS = [
  '維持健康體態與核心強化',
  '全身燃脂與心肺提升',
  '放鬆拉伸與改善久坐痠痛',
  '每天堅持運動 15 分鐘',
  '腹肌撕裂與下肢塑形',
];

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  profile,
  streakDays,
  todayCompletedCount,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);
  const [editHeight, setEditHeight] = useState(profile.heightCm);
  const [editWeight, setEditWeight] = useState(profile.weightKg);
  const [editGoal, setEditGoal] = useState(profile.goal);

  // Calculate BMI
  const heightM = (profile.heightCm || 165) / 100;
  const bmiValue = heightM > 0 ? (profile.weightKg / (heightM * heightM)).toFixed(1) : '20.0';

  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: '偏苗條', color: 'text-sky-700 bg-sky-50 border-sky-200' };
    if (bmi <= 24) return { label: '標準理想', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (bmi <= 27) return { label: '偏豐滿', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: '健碩', color: 'text-orange-700 bg-orange-50 border-orange-200' };
  };

  const bmiStatus = getBmiStatus(parseFloat(bmiValue));

  const handleOpenEdit = () => {
    setEditName(profile.name);
    setEditAvatar(profile.avatar);
    setEditHeight(profile.heightCm);
    setEditWeight(profile.weightKg);
    setEditGoal(profile.goal);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: editName.trim() || '運動愛好者',
      avatar: editAvatar.trim() || PRESET_AVATARS[0],
      heightCm: Number(editHeight) || 165,
      weightKg: Number(editWeight) || 52,
      goal: editGoal.trim() || '保持良好體能',
    });
    setIsEditing(false);
  };

  return (
    <div className="mb-5">
      {/* Main Profile Dashboard Card */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs relative overflow-hidden transition-all">
        {/* Soft Background Accent Gradient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-100/40 via-orange-50/20 to-transparent rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        {/* Top Header Row: Avatar, Name & Edit Button */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            {/* Avatar with soft ring */}
            <div className="relative group cursor-pointer" onClick={handleOpenEdit}>
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-200/80 shadow-xs bg-stone-100">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-stone-900 rounded-full p-1 shadow-2xs">
                <Edit3 className="w-2.5 h-2.5" />
              </div>
            </div>

            {/* Name & Today's Streak */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-stone-900 tracking-tight">
                  {profile.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center gap-1 shadow-2xs">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                  連續 {streakDays} 天打卡
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {todayCompletedCount > 0
                  ? `今日已打卡 ${todayCompletedCount} 組訓練 · 狀態絕佳 ✨`
                  : '今天尚未打卡，挑選一組開啟好狀態吧！'}
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={handleOpenEdit}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors shrink-0"
            title="編輯個人資料"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Middle: Body Metrics (Height, Weight, BMI) */}
        <div className="grid grid-cols-3 gap-2 mt-4 relative z-10">
          {/* Height */}
          <div className="bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-stone-400 font-medium mb-0.5">
              <Ruler className="w-3 h-3 text-stone-400" />
              身高
            </div>
            <div className="text-stone-900 font-extrabold text-sm font-mono">
              {profile.heightCm} <span className="text-[10px] text-stone-400 font-normal">cm</span>
            </div>
          </div>

          {/* Weight */}
          <div className="bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-stone-400 font-medium mb-0.5">
              <Scale className="w-3 h-3 text-stone-400" />
              體重
            </div>
            <div className="text-stone-900 font-extrabold text-sm font-mono">
              {profile.weightKg} <span className="text-[10px] text-stone-400 font-normal">kg</span>
            </div>
          </div>

          {/* BMI */}
          <div className="bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-stone-400 font-medium mb-0.5">
              <Activity className="w-3 h-3 text-stone-400" />
              BMI
            </div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-stone-900 font-extrabold text-sm font-mono">{bmiValue}</span>
              <span className={`text-[9px] font-semibold px-1 py-0.2 rounded border ${bmiStatus.color}`}>
                {bmiStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom: Fitness Goal Pill */}
        <div
          onClick={handleOpenEdit}
          className="mt-3 p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between gap-2 cursor-pointer hover:bg-amber-100/60 transition-colors relative z-10"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-lg bg-amber-200/70 text-amber-900 flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5 text-amber-800" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-amber-800 font-semibold block leading-none">
                運動目標
              </span>
              <span className="text-xs font-bold text-amber-950 truncate block mt-0.5">
                {profile.goal}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-amber-700 font-medium shrink-0 bg-white/70 px-2 py-0.5 rounded-lg border border-amber-200">
            點此更改
          </span>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 my-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-sm text-stone-900">編輯個人資料與目標</h4>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs text-stone-700">
              {/* Name */}
              <div>
                <label className="block font-semibold mb-1">暱稱 / 姓名</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="輸入你的暱稱"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-400 text-xs"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block font-semibold mb-1">頭像選擇</label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shrink-0">
                    <img src={editAvatar} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="輸入頭像圖片網址 (https://...)"
                    className="flex-1 p-2 rounded-xl border border-stone-200 bg-stone-50 font-mono text-[10px] focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                {/* Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[10px] text-stone-400 shrink-0">快捷頭像:</span>
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditAvatar(url)}
                      className={`w-8 h-8 rounded-lg overflow-hidden border-2 shrink-0 transition-transform ${
                        editAvatar === url ? 'border-amber-500 scale-105' : 'border-stone-200'
                      }`}
                    >
                      <img src={url} alt={`avatar-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold mb-1">身高 (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    step="0.5"
                    required
                    value={editHeight}
                    onChange={(e) => setEditHeight(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50 text-center font-mono font-medium focus:bg-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">體重 (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="250"
                    step="0.1"
                    required
                    value={editWeight}
                    onChange={(e) => setEditWeight(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50 text-center font-mono font-medium focus:bg-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Fitness Goal */}
              <div>
                <label className="block font-semibold mb-1">運動目標 (Goal)</label>
                <input
                  type="text"
                  required
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  placeholder="例如：維持健康體態、腹肌雕塑"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-400 text-xs mb-1.5"
                />

                {/* Preset Goals pills */}
                <div className="flex flex-wrap gap-1">
                  {PRESET_GOALS.map((g, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditGoal(g)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                        editGoal === g
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl font-medium shadow-xs"
                >
                  儲存資料
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
