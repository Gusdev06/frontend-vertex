export type AspectRatio = '16:9' | '9:16';
export type ImageAspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9';
export type ImageSize = '512px' | '1K' | '2K' | '4K';
export type Resolution = '720p' | '1080p' | '4k';
export type DurationSeconds = 4 | 6 | 8;
export type GenerationMode = 'text-to-video' | 'image-to-video' | 'text-to-image' | 'edit-image' | 'gemini-image';

export interface VideoReferenceImage {
  base64: string;
  mime_type?: string;
  reference_type: 'asset' | 'style';
}

export interface GenerateVideoRequest {
  prompt: string;
  model?: string;
  location?: string;
  duration_seconds?: DurationSeconds;
  aspect_ratio?: AspectRatio;
  resolution?: Resolution;
  generate_audio?: boolean;
  sample_count?: number;
  negative_prompt?: string;
  person_generation?: string;
  seed?: number;
  storage_uri?: string;
  image_base64?: string;
  image_mime_type?: string;
  last_frame_base64?: string;
  last_frame_mime_type?: string;
  reference_images?: VideoReferenceImage[];
}

export interface ReferenceImage {
  base64: string;
  mimeType: string;
  referenceType?: string;
}

export interface GenerateImageRequest {
  prompt: string;
  imageBase64?: string;
  imageMimeType?: string;
  aspectRatio?: ImageAspectRatio;
  imageSize?: ImageSize;
}

export interface GeminiInputImage {
  base64: string;
  mime_type?: string;
}

export interface GenerateGeminiImageRequest {
  prompt: string;
  system_instruction?: string;
  model?: string;
  aspect_ratio?: string;
  image_size?: string;
  mime_type?: string;


  location?: string;
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
