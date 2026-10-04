import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Calendar, Check, Star, ArrowRight, Share2, Sparkles } from 'lucide-react';
import { WorkoutRoutine, WorkoutLog } from '../../types/workout';
import { formatTime } from '../../utils/storage';

interface CompletionModalProps {
  routine: WorkoutRoutine;
  totalDurationSeconds: number;
  completedExercisesCount: number;
  totalSetsCount: number;
  onSaveLogNote: (logId: string, note: string, rating: number) => void;
  createdLogId: string;
  onGoToCalendar: () => void;
  onBackToHome: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  routine,
  totalDurationSeconds,
  completedExercisesCount,
  totalSetsCount,
  onSaveLogNote,
  createdLogId,
  onGoToCalendar,
  onBackToHome,
}) => {
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Fire beautiful soft pastel confetti
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#7FA98A', '#E0A96D', '#7BAE7F', '#A3C9A8', '#F5EE9E'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#7FA98A', '#E0A96D', '#A3C9A8'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#7FA98A', '#E0A96D', '#A3C9A8'],
        });
      }, 300);
    } catch (e) {
      console.warn('Confetti error', e);
    }
  }, []);

  const handleSaveNote = () => {
    if (createdLogId) {
      onSaveLogNote(createdLogId, note, rating);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Trophy icon */}
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Trophy className="w-8 h-8 fill-amber-400" />
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mb-1">
          <Sparkles className="w-3 h-3" />
          恭喜完成訓練！
        </span>

        <h3 className="text-xl font-bold text-stone-900 mt-1">{routine.title}</h3>
        <p className="text-xs text-stone-500 mt-0.5">今天又為自己的健康邁出了一大步</p>

        {/* Auto Check-in banner */}
        <div className="mt-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center gap-2.5 text-left">
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-900">已自動打卡至日曆</div>
            <div className="text-[11px] text-emerald-700">記錄已成功同步，可以在日曆隨時回顧成果</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
            <span className="text-[10px] text-stone-400 block font-medium">總耗時</span>
            <span className="text-base font-bold text-stone-800 font-mono">
              {formatTime(totalDurationSeconds)}
            </span>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
            <span className="text-[10px] text-stone-400 block font-medium">完成動作</span>
            <span className="text-base font-bold text-stone-800">
              {completedExercisesCount} 項
            </span>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
            <span className="text-[10px] text-stone-400 block font-medium">總組數</span>
            <span className="text-base font-bold text-stone-800">
              {totalSetsCount} 組
            </span>
          </div>
        </div>

        {/* Rating and Reflection */}
        <div className="text-left bg-stone-50/70 p-3 rounded-2xl border border-stone-200/60 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-700">本次感受評分</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-0.5 focus:outline-hidden"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="寫下今天的心得或身體感受（選填）..."
            rows={2}
            className="w-full text-xs p-2 rounded-xl bg-white border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-hidden focus:border-amber-400"
          />

          <div className="flex justify-end mt-1.5">
            <button
              onClick={handleSaveNote}
              className="text-[11px] font-medium text-amber-800 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              {savedSuccess ? '✓ 已保存感想' : '保存備註'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onGoToCalendar}
            className="w-full py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-2xl font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Calendar className="w-4 h-4" />
            前往打卡日曆查看
          </button>
          <button
            onClick={onBackToHome}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-medium text-sm transition-all"
          >
            返回主頁
          </button>
        </div>
      </div>
    </div>
  );
};
