import React, { useState } from 'react';
import { X, Maximize2, Minimize2, Video as VideoIcon, ExternalLink } from 'lucide-react';
import { parseVideoUrl } from '../../utils/video';

interface FloatingVideoPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export const FloatingVideoPlayer: React.FC<FloatingVideoPlayerProps> = ({ url, title, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const videoInfo = parseVideoUrl(url);

  if (!videoInfo) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-out shadow-2xl rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 text-white ${
        isExpanded
          ? 'inset-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[640px] md:h-[460px] max-h-[85vh]'
          : 'bottom-20 right-4 w-72 sm:w-80 h-48'
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-stone-900/95 border-b border-stone-800 text-xs">
        <div className="flex items-center gap-1.5 truncate max-w-[70%]">
          <VideoIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate font-medium text-stone-200">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? '縮小為浮窗' : '放大觀看'}
            className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-stone-100 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <a
            href={videoInfo.originalUrl}
            target="_blank"
            rel="noreferrer"
            title="在新視窗開啟"
            className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-stone-100 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            title="關閉影片"
            className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Content */}
      <div className="w-full h-[calc(100%-36px)] bg-black relative flex items-center justify-center">
        {videoInfo.type === 'direct' ? (
          <video
            src={videoInfo.embedUrl}
            controls
            autoPlay
            playsInline
            muted
            loop
            className="w-full h-full object-contain"
          />
        ) : videoInfo.type === 'youtube' || videoInfo.type === 'vimeo' ? (
          <iframe
            src={videoInfo.embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <iframe
            src={videoInfo.embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};
