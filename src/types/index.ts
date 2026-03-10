export type AspectRatio = '16:9' | '9:16';
export type ImageAspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';
export type ImageSize = '512px' | '1K' | '2K' | '4K';
export type Resolution = '720p' | '1080p' | '4K';
export type DurationSeconds = 4 | 6 | 8;
export type GenerationMode = 'text-to-video' | 'image-to-video' | 'text-to-image' | 'edit-image' | 'gemini-image';

export interface VideoReferenceImage {
  base64: string;
  mime_type?: string;
  reference_type: 'asset' | 'style';
}

// Unified video request type (superset of all three backend DTOs)
export interface GenerateVideoRequest {
  prompt: string;
  model?: string;
  duration_seconds?: DurationSeconds;
  aspect_ratio?: AspectRatio;
  resolution?: Resolution;
  generate_audio?: boolean;
  sample_count?: number;
  negative_prompt?: string;
  // image-to-video fields
  first_frame?: string;
  first_frame_mime_type?: string;
  last_frame?: string;
  last_frame_mime_type?: string;
  // reference images fields
  reference_images?: VideoReferenceImage[];
}

export interface ReferenceImage {
  base64: string;
  mimeType: string;
  referenceType?: string;
}

// Imagen (POST /api/image/generate)
export interface GenerateImageRequest {
  prompt: string;
  count?: number;
  model?: string;
  aspect_ratio?: string;
  negative_prompt?: string;
  language?: string;
  person_generation?: string;
  safety_setting?: string;
  sample_image_size?: string;
  seed?: number;
  enhance_prompt?: boolean;
  add_watermark?: boolean;
  mime_type?: string;
  location?: string;
}

export interface GeminiInputImage {
  base64: string;
  mime_type?: string;
}

// Gemini Image (POST /api/image/generate-gemini)
export interface GenerateGeminiImageRequest {
  prompt: string;
  model?: string;
  aspect_ratio?: string;
  image_size?: string;
  mime_type?: string;
  images?: GeminiInputImage[];
}

export interface GeminiImagePart {
  type: 'text' | 'image';
  text?: string;
  base64?: string;
  mimeType?: string;
}

export interface GeminiImageResponse {
  parts: GeminiImagePart[];
}

export interface ImageResponse {
  imageData: string;
  mimeType: string;
  text?: string;
}

export interface OperationResponse {
  operationName: string;
}

export interface PollVideo {
  base64?: string;
  gcsUri?: string;
  mimeType: string;
}

export interface PollResponse {
  operationName: string;
  done: boolean;
  videos?: PollVideo[];
  error?: {
    code: number;
    message: string;
  };
}

export interface VideoJob {
  id: string;
  operationName?: string;
  prompt: string;
  mode: GenerationMode;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUri?: string;
  videoBase64?: string;
  videoMimeType?: string;
  videos?: PollVideo[];
  imageData?: string;
  imageMimeType?: string;
  error?: string;
  createdAt: number;
}

// GET /api/status
export interface AccountStatusInfo {
  id: string;
  projectId: string;
  isExhausted: boolean;
  isActive: boolean;
}

export interface GcpStatusResponse {
  totalAccounts: number;
  activeAccountId: string;
  exhaustedCount: number;
  availableCount: number;
  accounts: AccountStatusInfo[];
}

// Credentials CRUD
export interface Credential {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  quotaProjectId: string;
}

export interface CreateCredentialRequest {
  name: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  quotaProjectId: string;
}
