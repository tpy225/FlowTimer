import React from 'react';
import { Layers, Dumbbell, Calendar, Settings } from 'lucide-react';

export type ActiveTab = 'home' | 'library' | 'calendar' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { key: 'home' as ActiveTab, label: '訓練組合', icon: Layers },
    { key: 'library' as ActiveTab, label: '動作庫', icon: Dumbbell },
    { key: 'calendar' as ActiveTab, label: '打卡日曆', icon: Calendar },
    { key: 'settings' as ActiveTab, label: '設定', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 pb-safe shadow-lg">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => onChangeTab(tab.key)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive ? 'text-stone-900 scale-105' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <div
                className={`p-1.5 rounded-2xl transition-all ${
                  isActive ? 'bg-amber-100/80 text-amber-950 font-bold' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold text-stone-900' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
