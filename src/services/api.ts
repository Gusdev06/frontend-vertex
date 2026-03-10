import axios from 'axios';
import type {
  GenerateVideoRequest,
  GenerateImageRequest,
  GenerateGeminiImageRequest,
  OperationResponse,
  PollResponse,
  ImageResponse,
  GeminiImageResponse,
  GcpStatusResponse,
  Credential,
  CreateCredentialRequest,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://clip-generator-geraew-api-provider.ernvcw.easypanel.host';
const apiKey = import.meta.env.VITE_GERAEW_API_KEY;

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'x-api-key': apiKey },
});

export const videoService = {
  generateTextToVideo: (data: GenerateVideoRequest) =>
    api.post<OperationResponse>('/video/generate-text-to-video', data).then(r => r.data),

  generateImageToVideo: (data: GenerateVideoRequest) =>
    api.post<OperationResponse>('/video/generate-image-to-video', data).then(r => r.data),

  generateWithReferences: (data: GenerateVideoRequest) =>
    api.post<OperationResponse>('/video/generate-references', data).then(r => r.data),

  checkStatus: (operationName: string) =>
    api.post<PollResponse>('/video/status', { operationName }).then(r => r.data),
};

export const imageService = {
  generate: (data: GenerateImageRequest) =>
    api.post<ImageResponse>('/image/generate', data).then(r => r.data),

  generateGemini: (data: GenerateGeminiImageRequest) =>
    api.post<GeminiImageResponse>('/image/generate-gemini', data).then(r => r.data),
};

export const statusService = {
  getStatus: () =>
    api.get<GcpStatusResponse>('/status').then(r => r.data),
};

export const credentialsService = {
  list: () =>
    api.get<Credential[]>('/credentials').then(r => r.data),

  create: (data: CreateCredentialRequest) =>
    api.post<Credential>('/credentials', data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/credentials/${id}`).then(r => r.data),
};
