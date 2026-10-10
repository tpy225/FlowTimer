import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Bell,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Check,
  Headphones
} from 'lucide-react';
import { UserSettings } from '../types/workout';
import { soundEffects, voiceAssistant } from '../utils/audio';
import { exportAllDataAsJSON, importDataFromJSON } from '../utils/storage';
import { Download, Upload, Database, FileText } from 'lucide-react';
import { AISettingsCard } from './Settings/AISettingsCard';
import { useConfirm } from './ui/ConfirmProvider';

interface SettingsModalProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onResetToDefaults: () => void;
  onDataImported?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onResetToDefaults,
  onDataImported,
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [testStatus, setTestStatus] = useState<string>('');
  const [importNotice, setImportNotice] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const confirm = useConfirm();

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleTestAudio = () => {
    soundEffects.unlock();
    soundEffects.playCountdownPip(800, 0.15);
    setTimeout(() => {
      soundEffects.playStartChime();
      voiceAssistant.speak(
        '語音播報與音效提示運作正常，祝你訓練順暢！',
        localSettings.speechEnabled,
        localSettings.speechRate
      );
    }, 200);

    setTestStatus('已播放測試音與語音');
    setTimeout(() => setTestStatus(''), 3000);
  };

  const handleExportBackup = () => {
    exportAllDataAsJSON();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importDataFromJSON(content);
        if (result.success) {
          setImportNotice('✓ 資料已成功匯入！');
          if (onDataImported) onDataImported();
          setTimeout(() => window.location.reload(), 800);
        } else {
          setImportNotice('❌ ' + result.message);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24">
      <div className="space-y-4">
        {/* AI API & Provider Configuration Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm px-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            API 設定
          </div>
          <AISettingsCard />
        </div>

        {/* Voice and Speech */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
            <Headphones className="w-4 h-4 text-amber-600" />
            語音提示與輔助 (Voice Assist)
          </div>

          {/* Toggle speech */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-stone-800">朗讀項目名稱與休息時間</div>
              <div className="text-[11px] text-stone-400">換組或換項目時以清晰語音提示</div>
            </div>
            <button
              onClick={() => updateSetting('speechEnabled', !localSettings.speechEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                localSettings.speechEnabled ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  localSettings.speechEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Speech speed */}
          {localSettings.speechEnabled && (
            <div className="pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-stone-600">語音速度</span>
                <span className="text-xs font-mono font-medium text-stone-800">
                  {localSettings.speechRate}x
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[0.9, 1.0, 1.15].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => updateSetting('speechRate', rate)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      localSettings.speechRate === rate
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {rate}x {rate === 1.0 ? '(標準)' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sound Effects & Countdown Beeps */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
            <Bell className="w-4 h-4 text-amber-600" />
            倒數音效 (Countdown Beeps)
          </div>

          {/* Toggle Beeps */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-stone-800">倒數警示音效</div>
              <div className="text-[11px] text-stone-400">計時最後數秒發出柔和清晰提示音</div>
            </div>
            <button
              onClick={() => updateSetting('soundBeepEnabled', !localSettings.soundBeepEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                localSettings.soundBeepEnabled ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  localSettings.soundBeepEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Countdown Warning Seconds */}
          {localSettings.soundBeepEnabled && (
            <div className="pt-2 border-t border-stone-100">
              <div className="text-xs text-stone-600 mb-1.5">倒數幾秒開始提示？</div>
              <div className="grid grid-cols-2 gap-2">
                {[3, 5].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => updateSetting('countdownSeconds', sec)}
                    className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                      localSettings.countdownSeconds === sec
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                        : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    倒數最後 {sec} 秒提示
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progression Mode: Auto vs Manual */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
            <Clock className="w-4 h-4 text-amber-600" />
            進度流程設定 (Progression)
          </div>

          <div className="text-xs text-stone-600 mb-2">
            訓練中每組時間到達時的預設行為：
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateSetting('autoAdvance', true)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                localSettings.autoAdvance
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-300 ring-2 ring-emerald-100'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              <div className="font-bold text-xs mb-0.5">自動進行</div>
              <div className="text-[10px] opacity-80">計時歸零自動切換至休息或下一組</div>
            </button>

            <button
              onClick={() => updateSetting('autoAdvance', false)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                !localSettings.autoAdvance
                  ? 'bg-amber-50 text-amber-950 border-amber-300 ring-2 ring-amber-100'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              <div className="font-bold text-xs mb-0.5">手動下一項</div>
              <div className="text-[10px] opacity-80">時間到後響鈴，等待手動點擊才切換</div>
            </button>
          </div>
        </div>

        {/* Audio Sound Test Button */}
        <div className="bg-amber-50/70 rounded-3xl p-4 border border-amber-200/70 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-950">測試裝置音效與語音</div>
            <div className="text-[11px] text-amber-800">在開始訓練前確認手機喇叭音量已開啟</div>
          </div>
          <button
            onClick={handleTestAudio}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            測試播放
          </button>
        </div>
        {testStatus && (
          <p className="text-xs text-center text-emerald-700 font-medium">{testStatus}</p>
        )}

        {/* Data Persistence, Export & Import */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
            <Database className="w-4 h-4 text-amber-600" />
            資料保存與備份
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            <strong>資料保存在哪裡？</strong><br />
            所有自訂動作、組合與日曆打卡記錄都安全儲存在您<strong>手機瀏覽器的本地空間（LocalStorage）</strong>。
            無需註冊帳號，離線也能隨時訓練。
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleExportBackup}
              className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              匯出備份 (JSON)
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-stone-600" />
              匯入備份還原
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {importNotice && (
            <p className="text-xs text-center font-medium text-emerald-700 bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
              {importNotice}
            </p>
          )}

          <div className="text-[10px] text-stone-400">
            提示：換手機或清理快取前，建議點擊「匯出備份」下載備份檔，之後可隨時匯入復原。
          </div>
        </div>

        {/* Reset Defaults */}
        <div className="pt-2 text-center">
          <button
            onClick={async () => {
              const ok = await confirm('確定要還原預設的訓練項目與組合嗎？', {
                title: '還原預設',
                confirmText: '還原',
              });
              if (ok) onResetToDefaults();
            }}
            className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 p-2 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            還原預設運動動作與組合
          </button>
        </div>
      </div>
    </div>
  );
};
