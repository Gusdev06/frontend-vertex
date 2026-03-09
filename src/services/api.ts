import axios from 'axios';
import type {
  GenerateVideoRequest,
  GenerateImageRequest,
  GenerateGeminiImageRequest,
  OperationResponse,
  PollResponse,
  ImageResponse,
  GeminiImageResponse,
} from '../types';

const API_BASE = 'https://clip-generator-geraew-api-provider.ernvcw.easypanel.host';
const apiKey = import.meta.env.VITE_GERAEW_API_KEY;

const videoApi = axios.create({
  baseURL: `${API_BASE}/api/video`,
  headers: { 'x-api-key': apiKey },
});
const imageApi = axios.create({
  baseURL: `${API_BASE}/api/images`,
  headers: { 'x-api-key': apiKey },
});

export const videoService = {
  generate: (data: GenerateVideoRequest) =>
    videoApi.post<OperationResponse>('/generate', data).then(r => r.data),

  checkStatus: (operationName: string) =>
    videoApi.post<PollResponse>('/status', { operationName }).then(r => r.data),
};

export const imageService = {
  generate: (data: GenerateImageRequest) =>
    imageApi.post<ImageResponse>('/generate', data).then(r => r.data),

  generateGemini: (data: GenerateGeminiImageRequest) =>
    axios.post<GeminiImageResponse>(`${API_BASE}/api/image/generate-gemini`, data, {
      headers: { 'x-api-key': apiKey },
    }).then(r => r.data),
};
