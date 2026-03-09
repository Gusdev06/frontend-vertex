import { useMemo } from 'react';

interface VideoPlayerProps {
  videoBase64?: string;
  videoMimeType?: string;
  videoUri?: string;
  prompt: string;
}

export function VideoPlayer({ videoBase64, videoMimeType, videoUri, prompt }: VideoPlayerProps) {
  const videoSrc = useMemo(() => {
    if (videoBase64) {
      return `data:${videoMimeType || 'video/mp4'};base64,${videoBase64}`;
    }
    return videoUri || '';
  }, [videoBase64, videoMimeType, videoUri]);

  if (!videoSrc) return null;

  return (
    <div className="bg-[#1e293b] rounded-lg overflow-hidden">
      <video
        controls
        autoPlay
        className="w-full aspect-video bg-black"
        src={videoSrc}
      >
        Your browser does not support the video tag.
      </video>
      <div className="p-4 space-y-3">
        <p className="text-sm text-slate-300 line-clamp-2">{prompt}</p>
        <a
          href={videoSrc}
          download="gemini-video.mp4"
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download video
        </a>
      </div>
    </div>
  );
}
