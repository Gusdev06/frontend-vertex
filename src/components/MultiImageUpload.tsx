import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import type { ReferenceImage } from '../types';

interface MultiImageUploadProps {
  onImagesChanged: (images: ReferenceImage[]) => void;
  maxImages?: number;
}

interface ImagePreview {
  base64: string;
  mimeType: string;
  dataUrl: string;
}

export function MultiImageUpload({ onImagesChanged, maxImages = 3 }: MultiImageUploadProps) {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList) => {
    const remaining = maxImages - images.length;
    if (remaining <= 0) return;

    const filesToProcess = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, remaining);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        const newImage: ImagePreview = { base64, mimeType: file.type, dataUrl };

        setImages(prev => {
          const updated = [...prev, newImage];
          onImagesChanged(updated.map(img => ({ base64: img.base64, mimeType: img.mimeType })));
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onImagesChanged(updated.map(img => ({ base64: img.base64, mimeType: img.mimeType })));
      return updated;
    });
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img src={img.dataUrl} alt={`Ref ${i + 1}`} className="h-24 w-24 object-cover rounded-lg border border-slate-600" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-600 hover:border-slate-500'
          }`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={handleChange}
          />
          <div className="py-3 space-y-1">
            <svg className="w-7 h-7 mx-auto text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-slate-400">Drop images or click to browse ({images.length}/{maxImages})</p>
            <p className="text-xs text-slate-500">PNG, JPEG, WebP</p>
          </div>
        </div>
      )}
    </div>
  );
}
