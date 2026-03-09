import { Layout } from './components/Layout';
import { GenerateForm } from './components/GenerateForm';
import { StatusPoller } from './components/StatusPoller';
import { VideoPlayer } from './components/VideoPlayer';
import { ImageViewer } from './components/ImageViewer';
import { VideoHistory } from './components/VideoHistory';
import { useVideoGeneration } from './hooks/useVideoGeneration';
import type { VideoJob } from './types';

const isImageJob = (job: VideoJob) => job.mode === 'text-to-image' || job.mode === 'edit-image' || job.mode === 'gemini-image';

function App() {
  const {
    jobs,
    activeJob,
    generateVideo,
    generateImage,
    generateGeminiImage,
    setActiveJob,
    clearHistory,
  } = useVideoGeneration();

  const isGenerating = activeJob?.status === 'processing';

  const handleSelect = (job: VideoJob) => {
    setActiveJob(job.id);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <GenerateForm
            onGenerate={generateVideo}
            onGenerateImage={generateImage}
            onGenerateGeminiImage={generateGeminiImage}
            isGenerating={isGenerating}
          />

          {activeJob && activeJob.status === 'processing' && (
            <StatusPoller job={activeJob} />
          )}

          {activeJob && activeJob.status === 'failed' && (
            <StatusPoller job={activeJob} />
          )}

          {activeJob && activeJob.status === 'completed' && isImageJob(activeJob) && activeJob.imageData && (
            <ImageViewer
              imageData={activeJob.imageData}
              mimeType={activeJob.imageMimeType || 'image/png'}
              prompt={activeJob.prompt}
            />
          )}

          {activeJob && activeJob.status === 'completed' && !isImageJob(activeJob) && (
            activeJob.videos && activeJob.videos.length > 1 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">{activeJob.videos.length} videos generated</p>
                {activeJob.videos.map((video, index) => (
                  <VideoPlayer
                    key={index}
                    videoBase64={video.base64}
                    videoMimeType={video.mimeType}
                    videoUri={video.gcsUri}
                    prompt={activeJob.prompt}
                  />
                ))}
              </div>
            ) : (
              <VideoPlayer
                videoBase64={activeJob.videoBase64}
                videoMimeType={activeJob.videoMimeType}
                videoUri={activeJob.videoUri}
                prompt={activeJob.prompt}
              />
            )
          )}
        </div>

        <div>
          <VideoHistory
            jobs={jobs}
            onSelect={handleSelect}
            onClear={clearHistory}
          />
        </div>
      </div>
    </Layout>
  );
}

export default App;
