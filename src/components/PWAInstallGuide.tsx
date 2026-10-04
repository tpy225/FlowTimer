import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Share2, PlusSquare, CheckCircle, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallGuide: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if running in standalone display mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsStandalone(true);
        setDeferredPrompt(null);
      }
    } else {
      setShowModal(true);
    }
  };

  if (isStandalone) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        已作為手機 App 運行
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-semibold rounded-xl shadow-2xs active:scale-95 transition-all"
        title="將此應用安裝到手機主畫面"
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-700" />
        <span>加入手機主畫面</span>
      </button>

      {/* Instructional modal for iOS / manual install */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 text-stone-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-base text-stone-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-600" />
                直接加到手機主畫面
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              將此網頁保存為獨立 App，打開即可全螢幕使用，離線也能順暢計時與訓練打卡！
            </p>

            {isIOS ? (
              <div className="space-y-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs">
                <div className="font-bold text-stone-800 text-xs mb-1">
                  🍎 iPhone / iPad (Safari) 安裝步驟：
                </div>
                <div className="flex items-start gap-2 text-stone-600">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    點擊瀏覽器底部的 <strong>「分享」按鈕</strong>（帶箭頭的方框圖示 <Share2 className="w-3.5 h-3.5 inline text-blue-600" />）
                  </span>
                </div>
                <div className="flex items-start gap-2 text-stone-600">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    向下滑動選單，點選 <strong>「加入主畫面 (Add to Home Screen)」</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2 text-stone-600">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>點選右上角的「新增」，手機桌面即可像原生 App 一樣一鍵啟動！</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs">
                <div className="font-bold text-stone-800 text-xs mb-1">
                  🤖 Android (Chrome) 安裝步驟：
                </div>
                <div className="flex items-start gap-2 text-stone-600">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>點擊瀏覽器右上角的三個點選單「⋮」</span>
                </div>
                <div className="flex items-start gap-2 text-stone-600">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>點選 <strong>「安裝應用程式」</strong> 或 <strong>「加到主畫面」</strong></span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
};
