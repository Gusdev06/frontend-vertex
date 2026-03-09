import { useState, useCallback, useEffect } from 'react';
import { videoService, imageService } from '../services/api';
import { usePolling } from './usePolling';
import type {
  VideoJob,
  GenerateVideoRequest,
  GenerateImageRequest,
  GenerateGeminiImageRequest,
} from '../types';

const STORAGE_KEY = 'gemini-video-jobs';

function loadJobs(): VideoJob[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveJobs(jobs: VideoJob[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    // localStorage may be full with image/video data — save without heavy data
    const light = jobs.map(j => {
      const { imageData, videoBase64, videos, ...rest } = j;
      return rest;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(light));
    } catch {
      // give up persisting
    }
  }
}

export function useVideoGeneration() {
  const [jobs, setJobs] = useState<VideoJob[]>(loadJobs);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const activeJob = jobs.find(j => j.id === activeJobId) || null;
  const pollingEnabled = activeJob?.status === 'processing' && !!activeJob?.operationName;

  const { status: pollStatus, error: pollError } = usePolling(
    activeJob?.operationName || null,
    pollingEnabled,
  );

  useEffect(() => {
    saveJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    if (!activeJobId || !pollStatus) return;

    if (pollStatus.done && !pollStatus.error) {
      const firstVideo = pollStatus.videos?.[0];
      setJobs(prev =>
        prev.map(j =>
          j.id === activeJobId
            ? {
                ...j,
                status: 'completed' as const,
                videoBase64: firstVideo?.base64,
                videoMimeType: firstVideo?.mimeType,
                videoUri: firstVideo?.gcsUri,
                videos: pollStatus.videos,
              }
            : j,
        ),
      );
    }
  }, [activeJobId, pollStatus]);

  useEffect(() => {
    if (!activeJobId || !pollError) return;
    setJobs(prev =>
      prev.map(j =>
        j.id === activeJobId
          ? { ...j, status: 'failed' as const, error: pollError }
          : j,
      ),
    );
  }, [activeJobId, pollError]);

  const createJob = useCallback((operationName: string, prompt: string, mode: VideoJob['mode']): string => {
    const id = crypto.randomUUID();
    const newJob: VideoJob = {
      id,
      operationName,
      prompt,
      mode,
      status: 'processing',
      createdAt: Date.now(),
    };
    setJobs(prev => [newJob, ...prev]);
    setActiveJobId(id);
    return id;
  }, []);

  const generateVideo = useCallback(async (req: GenerateVideoRequest) => {
    const result = await videoService.generate(req);
    createJob(result.operationName, req.prompt, req.image_base64 ? 'image-to-video' : 'text-to-video');
  }, [createJob]);

  const generateGeminiImage = useCallback(async (req: GenerateGeminiImageRequest) => {
    const id = crypto.randomUUID();
    const pendingJob: VideoJob = {
      id,
      prompt: req.prompt,
      mode: 'gemini-image',
      status: 'processing',
      createdAt: Date.now(),
    };
    setJobs(prev => [pendingJob, ...prev]);
    setActiveJobId(id);

    try {
      const result = await imageService.generateGemini(req);
      const imagePart = result.parts.find(p => p.type === 'image');
      if (!imagePart?.base64) {
        throw new Error('No image returned from Gemini');
      }
      setJobs(prev =>
        prev.map(j =>
          j.id === id
            ? {
                ...j,
                status: 'completed' as const,
                imageData: imagePart.base64,
                imageMimeType: imagePart.mimeType || 'image/png',
              }
            : j,
        ),
      );
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Gemini image generation failed';
      setJobs(prev =>
        prev.map(j =>
          j.id === id
            ? { ...j, status: 'failed' as const, error: message }
            : j,
        ),
      );
    }
  }, []);

  const generateImage = useCallback(async (req: GenerateImageRequest) => {
    const id = crypto.randomUUID();
    const pendingJob: VideoJob = {
      id,
      prompt: req.prompt,
      mode: req.imageBase64 ? 'edit-image' : 'text-to-image',
      status: 'processing',
      createdAt: Date.now(),
    };
    setJobs(prev => [pendingJob, ...prev]);
    setActiveJobId(id);

    try {
      const result = await imageService.generate(req);
      setJobs(prev =>
        prev.map(j =>
          j.id === id
            ? {
                ...j,
                status: 'completed' as const,
                imageData: result.imageData,
                imageMimeType: result.mimeType,
              }
            : j,
        ),
      );
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Image generation failed';
      setJobs(prev =>
        prev.map(j =>
          j.id === id
            ? { ...j, status: 'failed' as const, error: message }
            : j,
        ),
      );
    }
  }, []);

  const setActiveJob = useCallback((jobId: string | null) => {
    setActiveJobId(jobId);
  }, []);

  const clearHistory = useCallback(() => {
    setJobs([]);
    setActiveJobId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    jobs,
    activeJob,
    generateVideo,
    generateImage,
    generateGeminiImage,
    setActiveJob,
    clearHistory,
  };
}
