import { useState, type FormEvent } from 'react';
import { ImageUpload } from './ImageUpload';
import { MultiImageUpload } from './MultiImageUpload';
import type {
  GenerationMode,
  AspectRatio,
  ImageAspectRatio,
  ImageSize,
  Resolution,
  DurationSeconds,
  ReferenceImage,
  GenerateVideoRequest,
  GenerateImageRequest,
  GenerateGeminiImageRequest,
} from '../types';

interface GenerateFormProps {
  onGenerate: (req: GenerateVideoRequest) => Promise<void>;
  onGenerateImage: (req: GenerateImageRequest) => Promise<void>;
  onGenerateGeminiImage: (req: GenerateGeminiImageRequest) => Promise<void>;
  isGenerating: boolean;
}

const modes: { value: GenerationMode; label: string }[] = [
  { value: 'text-to-video', label: 'Text to Video' },
  { value: 'image-to-video', label: 'Image to Video' },
  { value: 'text-to-image', label: 'Text to Image' },
  { value: 'edit-image', label: 'Edit Image' },
  { value: 'gemini-image', label: 'Gemini Image' },
];

const videoModels = [
  'veo-3.1-generate-preview',
  'veo-3.1-fast-generate-preview',
];

const imageAspectRatios: ImageAspectRatio[] = ['1:1', '3:4', '4:3', '9:16', '16:9'];
const imageSizes: ImageSize[] = ['512px', '1K', '2K', '4K'];

const isImageMode = (m: GenerationMode) => m === 'text-to-image' || m === 'edit-image' || m === 'gemini-image';
const isVideoMode = (m: GenerationMode) => m === 'text-to-video' || m === 'image-to-video';

const geminiModels = ['gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview'];
const personGenerationOptions = ['allow_adult', 'dont_allow', 'allow_all'];
const mimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
const locations = ['us-central1', 'us-east4', 'us-west1', 'europe-west1'];

export function GenerateForm({ onGenerate, onGenerateImage, onGenerateGeminiImage, isGenerating }: GenerateFormProps) {
  const [mode, setMode] = useState<GenerationMode>('text-to-video');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [duration, setDuration] = useState<DurationSeconds>(8);
  const [generateAudio, setGenerateAudio] = useState(true);
  const [sampleCount, setSampleCount] = useState(1);
  const [videoModel, setVideoModel] = useState('veo-3.1-generate-preview');
  const [imageBase64, setImageBase64] = useState('');
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');
  const [imageAspectRatio, setImageAspectRatio] = useState<ImageAspectRatio>('1:1');
  const [editImageBase64, setEditImageBase64] = useState('');
  const [editImageMimeType, setEditImageMimeType] = useState('image/png');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [geminiModel, setGeminiModel] = useState('gemini-3.1-flash-image-preview');
  const [geminiMimeType, setGeminiMimeType] = useState('image/png');
  const [personGeneration, setPersonGeneration] = useState('allow_adult');
  const [temperature, setTemperature] = useState(1);
  const [geminiLocation, setGeminiLocation] = useState('us-central1');
  const [geminiImages, setGeminiImages] = useState<ReferenceImage[]>([]);
  const [lastFrameBase64, setLastFrameBase64] = useState('');
  const [lastFrameMimeType, setLastFrameMimeType] = useState('image/jpeg');
  const [refImages, setRefImages] = useState<ReferenceImage[]>([]);
  const [refType, setRefType] = useState<'asset' | 'style'>('asset');

  const handleResolutionChange = (res: Resolution) => {
    setResolution(res);
    if (res === '1080p' || res === '4k') {
      setDuration(8);
    }
  };

  const handleDurationChange = (dur: DurationSeconds) => {
    if (resolution === '1080p' || resolution === '4K') return;
    setDuration(dur);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    if (isVideoMode(mode)) {
      const req: GenerateVideoRequest = {
        prompt,
        model: videoModel,
        aspect_ratio: aspectRatio,
        resolution,
        duration_seconds: duration,
        generate_audio: generateAudio,
        sample_count: sampleCount,
        person_generation: personGeneration,
      };
      if (negativePrompt.trim()) {
        req.negative_prompt = negativePrompt;
      }
      if (mode === 'image-to-video') {
        // image-to-video: first frame + optional last frame (NO reference images)
        if (imageBase64) {
          req.first_frame = imageBase64;
          req.first_frame_mime_type = imageMimeType;
        }
        if (lastFrameBase64) {
          req.last_frame = lastFrameBase64;
          req.last_frame_mime_type = lastFrameMimeType;
        }
      } else if (refImages.length > 0) {
        // text-to-video: reference images (NO first/last frame)
        req.reference_images = refImages.map(img => ({
          base64: img.base64,
          mime_type: img.mimeType,
          reference_type: refType,
        }));
      }
      await onGenerate(req);
    } else if (mode === 'text-to-image') {
      await onGenerateImage({ prompt, aspect_ratio: imageAspectRatio, sample_image_size: imageSize });
    } else if (mode === 'edit-image') {
      if (!editImageBase64) return;
      // Imagen doesn't support image input — route edit-image through Gemini
      await onGenerateGeminiImage({
        prompt,
        aspect_ratio: imageAspectRatio,
        image_size: imageSize,
        images: [{ base64: editImageBase64, mime_type: editImageMimeType }],
      });
    } else if (mode === 'gemini-image') {
      const req: GenerateGeminiImageRequest = {
        prompt,
        model: geminiModel,
        aspect_ratio: imageAspectRatio,
        image_size: imageSize,
        mime_type: geminiMimeType,
        location: geminiLocation,
      };
      if (geminiImages.length > 0) {
        req.images = geminiImages.map(img => ({
          base64: img.base64,
          mime_type: img.mimeType,
        }));
      }
      await onGenerateGeminiImage(req);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-lg p-5 space-y-5">
      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-1 bg-[#0f172a] rounded-lg p-1">
        {modes.map(m => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={`flex-1 min-w-[80px] text-sm py-2 px-3 rounded-md transition-colors ${mode === m.value
              ? 'bg-indigo-500 text-white'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Prompt */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={isImageMode(mode)
            ? 'Describe the image you want to generate...'
            : 'Describe the video you want to generate...'}
          rows={4}
          className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none"
        />
      </div>

      {/* Negative Prompt (video modes) */}
      {isVideoMode(mode) && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Negative Prompt (optional)</label>
          <input
            type="text"
            value={negativePrompt}
            onChange={e => setNegativePrompt(e.target.value)}
            placeholder="Things to avoid: blur, low quality, distortion..."
            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          />
        </div>
      )}

      {/* Image Upload (image-to-video mode) */}
      {mode === 'image-to-video' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">First Frame Image</label>
          <ImageUpload onImageSelected={(b64, mime) => { setImageBase64(b64); setImageMimeType(mime); }} />
        </div>
      )}

      {/* Last Frame Upload (image-to-video only) */}
      {mode === 'image-to-video' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Frame Image (optional)</label>
          <ImageUpload onImageSelected={(b64, mime) => { setLastFrameBase64(b64); setLastFrameMimeType(mime); }} />
          <p className="text-xs text-slate-500 mt-1">Define how the video should end</p>
        </div>
      )}

      {/* Reference Images (text-to-video only — cannot coexist with first/last frame) */}
      {mode === 'text-to-video' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Reference Images (optional)</label>
          <div className="flex gap-1 mb-2">
            {(['asset', 'style'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setRefType(t); setRefImages([]); }}
                className={`flex-1 text-xs py-1.5 rounded transition-colors ${refType === t
                  ? 'bg-indigo-500 text-white'
                  : 'bg-[#0f172a] text-slate-400 hover:text-slate-200'
                  }`}
              >
                {t === 'asset' ? 'Asset (subject)' : 'Style'}
              </button>
            ))}
          </div>
          <MultiImageUpload
            onImagesChanged={setRefImages}
            maxImages={refType === 'asset' ? 3 : 1}
          />
          <p className="text-xs text-slate-500 mt-1">
            {refType === 'asset'
              ? 'Up to 3 images of the same subject (person, character, product)'
              : 'Style image'}
          </p>
        </div>
      )}

      {/* Image Upload (edit-image mode) */}
      {mode === 'edit-image' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Image to Edit</label>
          <ImageUpload onImageSelected={(b64, mime) => { setEditImageBase64(b64); setEditImageMimeType(mime); }} />
          <p className="text-xs text-slate-500 mt-1">Upload the image you want to modify with your prompt instructions</p>
        </div>
      )}

      {/* Reference Images (gemini-image mode) */}
      {mode === 'gemini-image' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Reference Images (optional, up to 3)</label>
          <MultiImageUpload onImagesChanged={setGeminiImages} maxImages={3} />
          <p className="text-xs text-slate-500 mt-1">Upload images to edit or use as reference for generation</p>
        </div>
      )}

      {/* Settings Row - Video modes */}
      {isVideoMode(mode) && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Aspect Ratio</label>
              <div className="flex gap-1">
                {(['16:9', '9:16'] as AspectRatio[]).map(ar => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setAspectRatio(ar)}
                    className={`flex-1 text-xs py-1.5 rounded transition-colors ${aspectRatio === ar
                      ? 'bg-indigo-500 text-white'
                      : 'bg-[#0f172a] text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Resolution</label>
              <div className="flex gap-1">
                {(['720p', '1080p', '4K'] as Resolution[]).map(res => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => handleResolutionChange(res)}
                    className={`flex-1 text-xs py-1.5 rounded transition-colors ${resolution === res
                      ? 'bg-indigo-500 text-white'
                      : 'bg-[#0f172a] text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Duration</label>
              <div className="flex gap-1">
                {([4, 6, 8] as DurationSeconds[]).map(dur => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleDurationChange(dur)}
                    disabled={(resolution === '1080p' || resolution === '4K') && dur !== 8}
                    className={`flex-1 text-xs py-1.5 rounded transition-colors ${duration === dur
                      ? 'bg-indigo-500 text-white'
                      : 'bg-[#0f172a] text-slate-400 hover:text-slate-200'
                      } ${(resolution === '1080p' || resolution === '4K') && dur !== 8 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Model */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Model</label>
              <select
                value={videoModel}
                onChange={e => setVideoModel(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              >
                {videoModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Audio */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Audio</label>
              <div className="flex gap-1">
                {[true, false].map(val => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setGenerateAudio(val)}
                    className={`flex-1 text-xs py-1.5 rounded transition-colors ${generateAudio === val
                      ? 'bg-indigo-500 text-white'
                      : 'bg-[#0f172a] text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {val ? 'On' : 'Off'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sample Count */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Samples</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSampleCount(n)}
                    className={`flex-1 text-xs py-1.5 rounded transition-colors ${sampleCount === n
                      ? 'bg-indigo-500 text-white'
                      : 'bg-[#0f172a] text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Person Generation */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Person Generation</label>
            <div className="flex gap-1">
              {personGenerationOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPersonGeneration(opt)}
                  className={`flex-1 text-xs py-1.5 rounded transition-colors ${personGeneration === opt
                    ? 'bg-indigo-500 text-white'
                    : 'bg-[#0f172a] text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {opt.replace('dont_', 'no ').replace('allow_', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Row - Image modes (non-gemini) */}
      {isImageMode(mode) && mode !== 'gemini-image' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Aspect Ratio</label>
            <div className="flex gap-1">
              {imageAspectRatios.map(ar => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => setImageAspectRatio(ar)}
                  className={`flex-1 text-xs py-1.5 rounded transition-colors ${imageAspectRatio === ar
                    ? 'bg-indigo-500 text-white'
                    : 'bg-[#0f172a] text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Image Size</label>
            <div className="flex gap-1">
              {imageSizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setImageSize(size)}
                  className={`flex-1 text-xs py-1.5 rounded transition-colors ${imageSize === size
                    ? 'bg-indigo-500 text-white'
                    : 'bg-[#0f172a] text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings - Gemini Image mode */}
      {mode === 'gemini-image' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Aspect Ratio</label>
              <div className="flex gap-1">
                {imageAspectRatios.map(ar => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setImageAspectRatio(ar)}
                    className={`flex-1 text-xs py-1.5 rounded transition-colors ${imageAspectRatio === ar
                      ? 'bg-indigo-500 text-white'
                      : 'bg-[#0f172a] text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Image Size</label>
              <div className="flex gap-1">
                {imageSizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setImageSize(size)}
                    className={`flex-1 text-xs py-1.5 rounded transition-colors ${imageSize === size
                      ? 'bg-indigo-500 text-white'
                      : 'bg-[#0f172a] text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Model</label>
              <select
                value={geminiModel}
                onChange={e => setGeminiModel(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              >
                {geminiModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Person Generation</label>
              <div className="flex gap-1">
                {personGenerationOptions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPersonGeneration(opt)}
                    className={`flex-1 text-xs py-1.5 rounded transition-colors ${personGeneration === opt
                      ? 'bg-indigo-500 text-white'
                      : 'bg-[#0f172a] text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {opt.replace('dont_', 'no ').replace('allow_', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">MIME Type</label>
              <div className="flex gap-1">
                {mimeTypes.map(mt => (
                  <button
                    key={mt}
                    type="button"
                    onClick={() => setGeminiMimeType(mt)}
                    className={`flex-1 text-xs py-1.5 rounded transition-colors ${geminiMimeType === mt
                      ? 'bg-indigo-500 text-white'
                      : 'bg-[#0f172a] text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {mt.split('/')[1]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Temperature: {temperature}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={e => setTemperature(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Location</label>
              <select
                value={geminiLocation}
                onChange={e => setGeminiLocation(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isGenerating || !prompt.trim()}
        className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
      >
        {isGenerating
          ? 'Generating...'
          : isImageMode(mode)
            ? 'Generate Image'
            : 'Generate Video'}
      </button>
    </form>
  );
}
