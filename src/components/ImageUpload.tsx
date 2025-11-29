'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
}

export default function ImageUpload({
  value,
  onChange,
  bucket = 'post-images',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createBrowserClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Featured image"
            className="h-48 w-full rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-surface-700 bg-surface-900/50 transition-colors hover:border-brand-400 hover:bg-surface-800/50"
        >
          {uploading ? (
            <>
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-brand-400" />
              <p className="text-sm text-surface-400">Uploading...</p>
            </>
          ) : (
            <>
              <div className="mb-3 rounded-full bg-surface-800 p-3 transition-colors group-hover:bg-brand-500/20">
                <ImageIcon className="h-6 w-6 text-surface-400 transition-colors group-hover:text-brand-400" />
              </div>
              <p className="mb-1 text-sm font-medium text-surface-200">
                Click to upload featured image
              </p>
              <p className="text-xs text-surface-500">
                PNG, JPG, WebP up to 5MB
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* URL Input as Fallback */}
      <div>
        <label className="mb-2 block text-sm text-surface-400">
          Or paste image URL:
        </label>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="input text-sm"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
