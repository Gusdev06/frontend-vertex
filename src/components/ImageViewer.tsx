interface ImageViewerProps {
  imageData: string;
  mimeType: string;
  prompt: string;
}

export function ImageViewer({ imageData, mimeType, prompt }: ImageViewerProps) {
  const dataUrl = `data:${mimeType};base64,${imageData}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = dataUrl;
    const ext = mimeType.split('/')[1] || 'png';
    link.download = `gemini-image.${ext}`;
    link.click();
  };

  return (
    <div className="bg-[#1e293b] rounded-lg overflow-hidden">
      <img
        src={dataUrl}
        alt={prompt}
        className="w-full bg-black"
      />
      <div className="p-4 space-y-3">
        <p className="text-sm text-slate-300 line-clamp-2">{prompt}</p>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download image
        </button>
      </div>
    </div>
  );
}
