import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Layers,
  Plus,
  Check,
  Play,
  Clock,
  Dumbbell,
  AlertCircle,
  Library
} from 'lucide-react';
import {
  ChatMessage,
  ProposedRoutine
} from '../../types/ai';
import {
  getSavedAIConfig,
  getSavedChatHistory,
  saveChatHistory,
  sendChatMessage,
  extractProposedRoutine,
  CHAT_CLEARED_EVENT
} from '../../utils/ai';
import { WorkoutRoutine, RoutineExerciseItem, ExerciseItem, WorkoutGoalPlan, WorkoutLog, UserProfile } from '../../types/workout';
import { formatTime, normalizeExerciseName } from '../../utils/storage';
import { buildCoachContext } from '../../utils/goalTracker';
import { ProposedRoutineExercise } from '../../types/ai';

interface AICoachViewProps {
  existingExercises: ExerciseItem[];
  onAddRoutineFromAI: (routine: WorkoutRoutine) => void;
  onStartRoutineDirectly: (routine: WorkoutRoutine) => void;
  onOpenSettings?: () => void;
  goalPlans: WorkoutGoalPlan[];
  logs: WorkoutLog[];
  userProfile: UserProfile;
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

const QUICK_PROMPTS = [
  '⚡ 15分鐘核心燃脂，不要跳躍動作，膝蓋友善',
  '🧘 久坐辦公室肩頸與下背放鬆伸展（10分鐘）',
  '🦵 徒手居家臀腿塑形訓練（初階至中階）',
  '🔥 高能 TABATA 心肺爆汗，燃燒全身熱量',
];

export const AICoachView: React.FC<AICoachViewProps> = ({
  existingExercises,
  onAddRoutineFromAI,
  onStartRoutineDirectly,
  onOpenSettings,
  goalPlans,
  logs,
  userProfile,
  onSaveExerciseToLibrary,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Names saved to library during this session (keyed by normalized exercise name)
  const [savedNames, setSavedNames] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat history
  useEffect(() => {
    setMessages(getSavedChatHistory());
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Send message to AI
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    setErrorMsg('');

    const userMessage: ChatMessage = {
      id: 'msg-u-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    saveChatHistory(updatedHistory);
    setIsLoading(true);

    try {
      // Build conversation payload for API
      const apiMessages = updatedHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Always read latest active AI config from Settings
      const currentConfig = getSavedAIConfig();
      const userContext = buildCoachContext({ profile: userProfile, goalPlans, logs });
      const rawResponse = await sendChatMessage(apiMessages, currentConfig, userContext);

      // Parse workout routine block if present
      const { cleanText, routine } = extractProposedRoutine(rawResponse);

      const assistantMessage: ChatMessage = {
        id: 'msg-a-' + Date.now(),
        role: 'assistant',
        content: cleanText || rawResponse,
        timestamp: Date.now(),
        proposedRoutine: routine,
      };

      const finalHistory = [...updatedHistory, assistantMessage];
      setMessages(finalHistory);
      saveChatHistory(finalHistory);
    } catch (err: unknown) {
      console.error('AI chat failed:', err);
      const msg = err instanceof Error ? err.message : '對話失敗，請檢查 API Key 或網路連線';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert proposed routine to app WorkoutRoutine format
  const handleAddProposedRoutine = (msgId: string, proposed: ProposedRoutine) => {
    // Match with existing exercise library if available for photo/video
    const exercises: RoutineExerciseItem[] = proposed.exercises.map((item, idx) => {
      const matched = existingExercises.find(
        (ex) => ex.name.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(ex.name.toLowerCase())
      );

      return {
        id: 're-ai-' + Date.now() + '-' + idx,
        exerciseId: matched ? matched.id : 'ex-custom-' + Date.now() + '-' + idx,
        name: item.name,
        sets: item.sets || 3,
        workSeconds: item.workSeconds || 30,
        restSeconds: item.restSeconds || 20,
        notes: item.notes,
        videoUrl: matched?.videoUrl || item.videoUrl,
        imageUrl: matched?.imageUrl || item.imageUrl || 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
      };
    });

    const newRoutine: WorkoutRoutine = {
      id: 'routine-ai-' + Date.now(),
      title: proposed.title,
      description: proposed.description || 'AI 教練專屬量身設計',
      tag: proposed.tag || 'AI客製',
      prepareSeconds: proposed.prepareSeconds || 5,
      coverImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      exercises,
      createdAt: Date.now(),
      isPreset: false,
    };

    onAddRoutineFromAI(newRoutine);

    // Mark as added in UI
    setMessages((prev) => {
      const updated = prev.map((m) => (m.id === msgId ? { ...m, isAddedToRoutines: true } : m));
      saveChatHistory(updated);
      return updated;
    });
  };

  // Direct start training from AI card
  const handleStartProposedRoutine = (proposed: ProposedRoutine) => {
    const exercises: RoutineExerciseItem[] = proposed.exercises.map((item, idx) => {
      const matched = existingExercises.find(
        (ex) => ex.name.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(ex.name.toLowerCase())
      );
      return {
        id: 're-ai-start-' + Date.now() + '-' + idx,
        exerciseId: matched ? matched.id : 'ex-temp-' + idx,
        name: item.name,
        sets: item.sets || 3,
        workSeconds: item.workSeconds || 30,
        restSeconds: item.restSeconds || 20,
        notes: item.notes,
        videoUrl: matched?.videoUrl,
        imageUrl: matched?.imageUrl,
      };
    });

    const newRoutine: WorkoutRoutine = {
      id: 'routine-ai-quick-' + Date.now(),
      title: proposed.title,
      description: proposed.description,
      tag: proposed.tag || 'AI定制',
      prepareSeconds: proposed.prepareSeconds || 5,
      exercises,
      createdAt: Date.now(),
    };

    onStartRoutineDirectly(newRoutine);
  };

  // Reset to welcome message (triggered from API settings card)
  const buildWelcome = (): ChatMessage[] => [
    {
      id: 'msg-welcome-' + Date.now(),
      role: 'assistant',
      content: '你好！我是你的專屬 AI 運動教練。告訴我你今天想練什麼，隨時為你生成與修改組合！',
      timestamp: Date.now(),
      proposedRoutine: null,
    },
  ];

  useEffect(() => {
    const onCleared = () => {
      const welcome = buildWelcome();
      setMessages(welcome);
      setErrorMsg('');
    };
    window.addEventListener(CHAT_CLEARED_EVENT, onCleared);
    return () => window.removeEventListener(CHAT_CLEARED_EVENT, onCleared);
  }, []);

  // Save every not-yet-in-library exercise from a proposed routine
  const handleSaveAllExercises = (list: ProposedRoutineExercise[]) => {
    let count = 0;
    list.forEach((ex) => {
      if (savedNames.has(normalizeExerciseName(ex.name))) return;
      const ok = onSaveExerciseToLibrary({
        name: ex.name,
        sets: ex.sets,
        workSeconds: ex.workSeconds,
        restSeconds: ex.restSeconds,
        videoUrl: ex.videoUrl,
        imageUrl: ex.imageUrl,
        notes: ex.notes,
      });
      if (ok) {
        count++;
        setSavedNames((prev) => new Set(prev).add(normalizeExerciseName(ex.name)));
      }
    });
    return count;
  };

  return (
    <div className="max-w-md mx-auto flex flex-col h-[calc(100vh-92px)] bg-[#faf8f5]">
      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2.5`}>
                {/* Text bubble */}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-stone-900 text-white rounded-tr-xs'
                      : 'bg-white text-stone-800 border border-stone-200/80 shadow-2xs rounded-tl-xs whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Interactive Proposed Workout Routine Card (If generated by AI) */}
                {msg.proposedRoutine && (
                  <div className="bg-white rounded-2xl p-3.5 border-2 border-amber-300 shadow-md animate-in zoom-in-95 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                            {msg.proposedRoutine.tag || 'AI推薦'}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            共 {msg.proposedRoutine.exercises.length} 項動作
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-stone-900 mt-1">
                          {msg.proposedRoutine.title}
                        </h4>
                        {msg.proposedRoutine.description && (
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            {msg.proposedRoutine.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Exercises Preview list */}
                    <div className="space-y-1.5 bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
                      {/* Header: save all new exercises to library */}
                      {(() => {
                        const list = msg.proposedRoutine.exercises;
                        const allIn = list.every(
                          (ex) =>
                            savedNames.has(normalizeExerciseName(ex.name)) ||
                            existingExercises.some((e) => normalizeExerciseName(e.name) === normalizeExerciseName(ex.name))
                        );
                        return (
                          <div className="flex items-center justify-between pb-1 mb-0.5 border-b border-stone-200/70">
                            <span className="text-[10px] text-stone-400 flex items-center gap-1">
                              <Library className="w-3 h-3" />
                              可逐項存入動作庫
                            </span>
                            <button
                              type="button"
                              disabled={allIn}
                              onClick={() => {
                                const n = handleSaveAllExercises(list);
                                if (n > 0) setErrorMsg('');
                              }}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-colors active:scale-95 ${
                                allIn
                                  ? 'text-emerald-700 bg-emerald-50 cursor-default'
                                  : 'text-stone-700 hover:bg-stone-200'
                              }`}
                            >
                              {allIn ? '✓ 全在庫中' : '＋ 全部存入'}
                            </button>
                          </div>
                        );
                      })()}
                      {msg.proposedRoutine.exercises.map((ex, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] gap-1">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 text-[9px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-stone-800 truncate">{ex.name}</span>
                          </div>
                          <span className="text-stone-500 text-[10px] shrink-0 font-mono">
                            {ex.sets}組 · {ex.workSeconds}s / {ex.restSeconds}s
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                      <button
                        onClick={() => handleAddProposedRoutine(msg.id, msg.proposedRoutine!)}
                        disabled={msg.isAddedToRoutines}
                        className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                          msg.isAddedToRoutines
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-stone-900 hover:bg-black text-white shadow-xs'
                        }`}
                      >
                        {msg.isAddedToRoutines ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            已成功加入組合
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            加入我的組合
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleStartProposedRoutine(msg.proposedRoutine!)}
                        className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                        title="立即跳至大計時開始此訓練"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        立即開始
                      </button>
                    </div>

                    <p className="text-[10px] text-stone-400 text-center">
                      💡 想要調整？直接在下方對話說「把深蹲換掉」或「運動時間改20秒」即可！
                    </p>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-full bg-stone-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-stone-500 text-xs py-2 px-1 animate-pulse">
            <Bot className="w-4 h-4 text-amber-600 animate-spin" />
            <span>AI 教練正在為你量身打造訓練組合...</span>
          </div>
        )}

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="underline font-semibold shrink-0 ml-2 hover:text-red-900"
              >
                前往「設置」配置 API
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips (When not loading) */}
      {!isLoading && (
        <div className="px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 border-t border-stone-200/50 bg-[#faf8f5]">
          <span className="text-[10px] text-stone-400 shrink-0">靈感:</span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-[10px] px-2.5 py-1 bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200/80 rounded-full whitespace-nowrap transition-colors shadow-2xs active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <div className="p-3 bg-white border-t border-stone-200/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="告訴教練你的目標、時間或限制..."
            disabled={isLoading}
            className="flex-1 py-2.5 px-3.5 bg-stone-100 focus:bg-white rounded-2xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:border-amber-400 transition-colors shadow-inner"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-stone-900 hover:bg-black text-white rounded-2xl disabled:opacity-40 disabled:hover:bg-stone-900 shadow-sm active:scale-95 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
