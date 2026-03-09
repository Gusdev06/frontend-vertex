import type { VideoJob } from '../types';

interface VideoHistoryProps {
  jobs: VideoJob[];
  onSelect: (job: VideoJob) => void;
  onClear: () => void;
}

const modeLabels: Record<string, string> = {
  'text-to-video': 'Text',
  'image-to-video': 'Image',
  'reference-images': 'Refs',
  'extend': 'Extend',
  'text-to-image': 'Img Gen',
  'edit-image': 'Img Edit',
};

const statusColors: Record<string, string> = {
  processing: 'bg-yellow-500/20 text-yellow-300',
  completed: 'bg-green-500/20 text-green-300',
  failed: 'bg-red-500/20 text-red-300',
};

export function VideoHistory({ jobs, onSelect, onClear }: VideoHistoryProps) {
  if (jobs.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-lg p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2m0 2a2 2 0 012 2v1a2 2 0 01-2 2 2 2 0 01-2-2V6a2 2 0 012-2zm0 10v2m0-2a2 2 0 01-2-2v-1a2 2 0 012-2 2 2 0 012 2v1a2 2 0 01-2 2zM17 4v2m0-2a2 2 0 00-2 2v1a2 2 0 002 2 2 2 0 002-2V6a2 2 0 00-2-2z" />
        </svg>
        <p className="text-sm text-slate-400">No videos generated yet</p>
        <p className="text-xs text-slate-500 mt-1">Your generation history will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        <h3 className="text-sm font-medium text-slate-300">History</h3>
        <button
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-700/30">
        {jobs.map(job => (
          <div
            key={job.id}
            className="p-3 hover:bg-slate-700/20 cursor-pointer transition-colors"
            onClick={() => onSelect(job)}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-slate-300 line-clamp-2 flex-1">{job.prompt}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${statusColors[job.status]}`}>
                {job.status}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded">
                {modeLabels[job.mode]}
              </span>
              <span className="text-[10px] text-slate-500">
                {new Date(job.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
