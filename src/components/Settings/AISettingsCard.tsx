import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CloudDownload,
  Check,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { AIConfig, AIProfileConfig, AIProvider } from '../../types/ai';
import {
  AI_PROVIDERS,
  getSavedAIProfiles,
  saveAIProfiles,
  getActiveProfileId,
  setActiveProfileId,
  fetchRemoteModels,
  sendChatMessage
} from '../../utils/ai';

interface AISettingsCardProps {
  onConfigChange?: (config: AIConfig) => void;
}

export const AISettingsCard: React.FC<AISettingsCardProps> = ({ onConfigChange }) => {
  const [profiles, setProfiles] = useState<AIProfileConfig[]>([]);
  const [activeId, setActiveId] = useState<string>('profile-default');

  // Active form states
  const [provider, setProvider] = useState<AIProvider>('custom');
  const [baseUrl, setBaseUrl] = useState<string>('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('gpt-4o-mini');

  // UI interaction states
  const [showPassword, setShowPassword] = useState(false);
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [remoteModels, setRemoteModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; msg: string }>({
    type: 'idle',
    msg: '',
  });
  const [saveToast, setSaveToast] = useState(false);

  const providerDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target as Node)) {
        setIsProviderOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load profiles on mount
  useEffect(() => {
    const loadedProfiles = getSavedAIProfiles();
    const currentActiveId = getActiveProfileId();
    setProfiles(loadedProfiles);
    setActiveId(currentActiveId);

    const current = loadedProfiles.find((p) => p.id === currentActiveId) || loadedProfiles[0];
    if (current) {
      setProvider(current.provider);
      setBaseUrl(current.baseUrl);
      setApiKey(current.apiKey);
      setModel(current.model);
    }
  }, []);

  const activeProfile = profiles.find((p) => p.id === activeId) || profiles[0];
  const currentProviderInfo = AI_PROVIDERS.find((p) => p.key === provider) || AI_PROVIDERS[0];

  // Save current form state to profile and localStorage
  const handleSaveCurrent = () => {
    const updatedProfiles = profiles.map((p) => {
      if (p.id === activeId) {
        return {
          ...p,
          provider,
          baseUrl,
          apiKey,
          model,
        };
      }
      return p;
    });

    setProfiles(updatedProfiles);
    saveAIProfiles(updatedProfiles);
    setActiveProfileId(activeId);

    if (onConfigChange) {
      onConfigChange({
        provider,
        baseUrl,
        apiKey,
        model,
        profileId: activeId,
      });
    }

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // Switch active profile
  const handleSelectProfile = (id: string) => {
    // auto save before switching
    handleSaveCurrent();

    const selected = profiles.find((p) => p.id === id);
    if (selected) {
      setActiveId(selected.id);
      setActiveProfileId(selected.id);
      setProvider(selected.provider);
      setBaseUrl(selected.baseUrl);
      setApiKey(selected.apiKey);
      setModel(selected.model);
      setIsProfileOpen(false);
      setTestStatus({ type: 'idle', msg: '' });

      if (onConfigChange) {
        onConfigChange({
          provider: selected.provider,
          baseUrl: selected.baseUrl,
          apiKey: selected.apiKey,
          model: selected.model,
          profileId: selected.id,
        });
      }
    }
  };

  // Add new profile
  const handleAddProfile = () => {
    const name = window.prompt('請輸入新配置名稱：', `配置 ${profiles.length + 1}`);
    if (!name || !name.trim()) return;

    const newProfile: AIProfileConfig = {
      id: 'profile-' + Date.now(),
      name: name.trim(),
      provider: 'custom',
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
    };

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    saveAIProfiles(updated);
    handleSelectProfile(newProfile.id);
  };

  // Rename profile
  const handleRenameProfile = () => {
    if (!activeProfile) return;
    const newName = window.prompt('請輸入新的配置名稱：', activeProfile.name);
    if (!newName || !newName.trim() || newName.trim() === activeProfile.name) return;

    const updated = profiles.map((p) => (p.id === activeId ? { ...p, name: newName.trim() } : p));
    setProfiles(updated);
    saveAIProfiles(updated);
  };

  // Delete profile
  const handleDeleteProfile = () => {
    if (profiles.length <= 1) {
      alert('至少需保留一個 AI 配置檔案。');
      return;
    }
    if (window.confirm(`確定要刪除「${activeProfile?.name}」配置嗎？`)) {
      const remaining = profiles.filter((p) => p.id !== activeId);
      setProfiles(remaining);
      saveAIProfiles(remaining);
      const nextActive = remaining[0];
      handleSelectProfile(nextActive.id);
    }
  };

  // Select provider from dropdown
  const handleSelectProvider = (newProvider: AIProvider) => {
    const info = AI_PROVIDERS.find((p) => p.key === newProvider);
    if (info) {
      setProvider(newProvider);
      setBaseUrl(info.defaultBaseUrl);
      setModel(info.defaultModel);
      setIsProviderOpen(false);
      setRemoteModels([]);
    }
  };

  // Pull / Fetch remote models from Base URL
  const handleFetchModels = async () => {
    if (!baseUrl.trim()) {
      alert('請先填寫 Base URL');
      return;
    }

    setIsFetchingModels(true);
    setTestStatus({ type: 'loading', msg: '正在向服務端拉取模型清單...' });

    try {
      const models = await fetchRemoteModels(baseUrl, apiKey);
      if (models.length > 0) {
        setRemoteModels(models);
        setIsModelDropdownOpen(true);
        setTestStatus({
          type: 'success',
          msg: `✓ 成功拉取 ${models.length} 個模型！`,
        });
      } else {
        setTestStatus({
          type: 'error',
          msg: '未拉取到模型，已使用預設模型列表。',
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '拉取模型失敗';
      setTestStatus({
        type: 'error',
        msg: `❌ ${msg}`,
      });
    } finally {
      setIsFetchingModels(false);
    }
  };

  // Test connection
  const handleTestConnection = async () => {
    setTestStatus({ type: 'loading', msg: '正在測試連線中...' });
    try {
      const testConfig: AIConfig = {
        provider,
        baseUrl,
        apiKey,
        model,
      };

      const reply = await sendChatMessage([{ role: 'user', content: '你好，請回覆四個字「連線成功」。' }], testConfig);

      setTestStatus({
        type: 'success',
        msg: `✓ 連線測試成功！AI 回應: ${reply.slice(0, 30)}`,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '測試失敗';
      setTestStatus({
        type: 'error',
        msg: `❌ ${msg}`,
      });
    }
  };

  // Available models (combine presets and remote fetched models)
  const availableModels = Array.from(new Set([...(remoteModels.length > 0 ? remoteModels : []), ...currentProviderInfo.presetModels]));

  return (
    <div className="bg-[#fcfaf7] rounded-3xl p-4 border border-[#e5decb] shadow-2xs space-y-4 text-stone-800">
      {/* 1. Profile selector row with action buttons */}
      <div className="flex items-center gap-2">
        {/* Profile Dropdown */}
        <div className="relative flex-1" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-[#fdfcf9] rounded-xl border border-[#dcd3be] text-xs font-semibold text-stone-800 hover:bg-[#f6f2e8] transition-colors shadow-2xs"
          >
            <span className="truncate">{activeProfile?.name || '默认配置'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500 shrink-0 ml-1" />
          </button>

          {isProfileOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#fdfcf9] rounded-xl border border-[#dcd3be] shadow-lg z-30 py-1 max-h-48 overflow-y-auto">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProfile(p.id)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                    p.id === activeId ? 'bg-[#d8c7b3] font-bold text-stone-900' : 'text-stone-700 hover:bg-[#f2ece0]'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {p.id === activeId && <Check className="w-3.5 h-3.5 text-stone-800" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action icons: + (Add), Save, Rename, Delete */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleAddProfile}
            className="p-2 bg-[#fdfcf9] hover:bg-[#f6f2e8] text-stone-700 rounded-xl border border-[#dcd3be] shadow-2xs transition-colors active:scale-95"
            title="新建配置"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={handleSaveCurrent}
            className={`p-2 rounded-xl border transition-all active:scale-95 shadow-2xs ${
              saveToast
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-[#fdfcf9] hover:bg-[#f6f2e8] text-stone-700 border-[#dcd3be]'
            }`}
            title="保存當前配置"
          >
            {saveToast ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleRenameProfile}
            className="p-2 bg-[#fdfcf9] hover:bg-[#f6f2e8] text-stone-700 rounded-xl border border-[#dcd3be] shadow-2xs transition-colors active:scale-95"
            title="重命名配置"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDeleteProfile}
            disabled={profiles.length <= 1}
            className="p-2 bg-[#fdfcf9] hover:bg-red-50 text-stone-500 hover:text-red-600 rounded-xl border border-[#dcd3be] shadow-2xs transition-colors disabled:opacity-40 disabled:pointer-events-none active:scale-95"
            title="刪除配置"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Provider Section with custom Dropdown matching user screenshot */}
      <div className="space-y-1.5" ref={providerDropdownRef}>
        <label className="text-xs font-bold text-stone-700 block">Provider</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProviderOpen(!isProviderOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-[#fdfcf9] rounded-xl border border-[#dcd3be] text-xs font-medium text-stone-800 hover:bg-[#f6f2e8] transition-colors shadow-2xs"
          >
            <span className="font-semibold">{currentProviderInfo.name}</span>
            {isProviderOpen ? (
              <ChevronUp className="w-4 h-4 text-stone-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-600" />
            )}
          </button>

          {/* Provider Dropdown matching IMG_1922.jpeg */}
          {isProviderOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#fdfcf9] rounded-xl border border-[#c4b59b] shadow-xl z-30 py-1 max-h-64 overflow-y-auto">
              {AI_PROVIDERS.map((item) => {
                const isSelected = item.key === provider;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectProvider(item.key)}
                    className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#c7b59e] text-stone-900 font-bold'
                        : 'text-stone-700 hover:bg-[#ede5d4]'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] text-stone-500 font-normal">{item.badge}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Base URL and API Key two columns matching IMG_1921.jpeg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Base URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 block">Base URL</label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
            className="w-full px-3 py-2 bg-[#fdfcf9] rounded-xl border border-[#dcd3be] text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500 shadow-2xs font-mono"
          />
        </div>

        {/* API Key with Eye icon toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 block">API Key</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="粘贴 API Key"
              className="w-full pl-3 pr-9 py-2 bg-[#fdfcf9] rounded-xl border border-[#dcd3be] text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500 shadow-2xs font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              title={showPassword ? '隱藏 API Key' : '顯示 API Key'}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Model selector & "拉取模型" button matching IMG_1921.jpeg */}
      <div className="space-y-1.5" ref={modelDropdownRef}>
        <label className="text-xs font-bold text-stone-700 block">Model</label>
        <div className="flex items-center gap-2">
          {/* Model input / dropdown */}
          <div className="relative flex-1">
            <div className="flex items-center bg-[#fdfcf9] rounded-xl border border-[#dcd3be] shadow-2xs focus-within:border-amber-500">
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="例如: gpt-4o-mini 或 deepseek-chat"
                className="w-full px-3 py-2 bg-transparent text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden font-mono"
              />
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="px-2 py-2 text-stone-400 hover:text-stone-600 transition-colors"
                title="選擇預設或拉取的模型"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Model options list */}
            {isModelDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#fdfcf9] rounded-xl border border-[#dcd3be] shadow-xl z-30 py-1 max-h-48 overflow-y-auto">
                <div className="px-2.5 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  {remoteModels.length > 0 ? '拉取到的可用模型' : '預設推薦模型'}
                </div>
                {availableModels.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setModel(m);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors font-mono flex items-center justify-between ${
                      m === model ? 'bg-[#d8c7b3] font-bold text-stone-900' : 'text-stone-700 hover:bg-[#f2ece0]'
                    }`}
                  >
                    <span className="truncate">{m}</span>
                    {m === model && <Check className="w-3.5 h-3.5 text-stone-800" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 拉取模型 (Fetch Models) Button */}
          <button
            type="button"
            onClick={handleFetchModels}
            disabled={isFetchingModels}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#fdfcf9] hover:bg-[#f6f2e8] text-stone-800 rounded-xl border border-[#dcd3be] text-xs font-semibold shadow-2xs transition-colors shrink-0 active:scale-95 disabled:opacity-50"
            title="自動從 API 端點獲取所有可用模型"
          >
            <CloudDownload className={`w-3.5 h-3.5 ${isFetchingModels ? 'animate-bounce text-amber-600' : ''}`} />
            <span>拉取模型</span>
          </button>
        </div>
      </div>

      {/* 5. Feedback status & Test Connection Button */}
      {testStatus.msg && (
        <div
          className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 ${
            testStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : testStatus.type === 'error'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {testStatus.type === 'loading' && <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />}
          {testStatus.type === 'success' && <Check className="w-3.5 h-3.5 shrink-0" />}
          {testStatus.type === 'error' && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
          <span className="truncate">{testStatus.msg}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[#e8dfce]">
        <div className="text-[11px] text-stone-400">
          金鑰加密儲存於瀏覽器，絕不向外部洩露
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestConnection}
            className="px-3 py-1.5 bg-[#eae2d3] hover:bg-[#ded4c3] text-stone-800 rounded-xl text-xs font-semibold transition-colors active:scale-95 shadow-2xs"
          >
            測試連線
          </button>
          <button
            type="button"
            onClick={handleSaveCurrent}
            className="px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors active:scale-95"
          >
            {saveToast ? '已保存！' : '保存設定'}
          </button>
        </div>
      </div>
    </div>
  );
};
