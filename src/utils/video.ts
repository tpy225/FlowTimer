export interface VideoEmbedInfo {
  type: 'youtube' | 'vimeo' | 'direct' | 'unknown';
  embedUrl: string;
  thumbnailUrl?: string;
  originalUrl: string;
}

export function parseVideoUrl(url: string | undefined): VideoEmbedInfo | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. YouTube
  // Matches:
  // - youtube.com/watch?v=ID
  // - youtu.be/ID
  // - youtube.com/shorts/ID
  // - youtube.com/embed/ID
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      originalUrl: trimmed,
    };
  }

  // 2. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const vimeoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&playsinline=1`,
      originalUrl: trimmed,
    };
  }

  // 3. Direct video format (.mp4, .webm, .ogg, .mov)
  const isDirect = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed);
  if (isDirect) {
    return {
      type: 'direct',
      embedUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  // 4. If user already supplied an embed or iframe URL or generic web link
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      type: 'unknown',
      embedUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  return null;
}
