import { useState, useEffect } from 'react';
import type { VideoJob } from '../types';

interface StatusPollerProps {
  job: VideoJob;
}

export function StatusPoller({ job }: StatusPollerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (job.status !== 'processing') return;
    const start = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [job.status]);

  if (job.status === 'failed') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Generation failed</span>
        </div>
        {job.error && <p className="mt-2 text-sm text-red-300">{job.error}</p>}
      </div>
    );
  }

  if (job.status !== 'processing') return null;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <div>
          <p className="text-sm font-medium text-indigo-300">
            {job.mode === 'text-to-image' || job.mode === 'edit-image' ? 'Generating...' : 'Generating...'}
          </p>
          <p className="text-xs text-slate-400">
            {job.mode === 'text-to-image' || job.mode === 'edit-image'
              ? `Elapsed: ${minutes > 0 ? `${minutes}m ` : ''}${seconds}s — Usually takes a few seconds`
              : `Elapsed: ${minutes > 0 ? `${minutes}m ` : ''}${seconds}s — Usually takes 30s to 6min`}
          </p>
        </div>
      </div>
    </div>
  );
}
