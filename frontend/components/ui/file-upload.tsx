/**
 * Enhanced File Upload with Drag & Drop
 */
'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileImage } from 'lucide-react';
import { Button } from './button';

interface FileUploadProps {
  accept: string;
  onChange: (file: File | null) => void;
  preview?: string;
  label: string;
  maxSize?: number; // in MB
}

export function FileUpload({ accept, onChange, preview, label, maxSize = 10 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFile = useCallback((file: File) => {
    setError('');
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File quá lớn. Tối đa ${maxSize}MB`);
      return;
    }

    // Validate file type
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const fileType = file.type;
    const isValid = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', ''));
      }
      return fileType === type || file.name.endsWith(type.replace('*', ''));
    });

    if (!isValid) {
      setError('Định dạng file không hợp lệ');
      return;
    }

    onChange(file);
  }, [accept, maxSize, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleClear = useCallback(() => {
    onChange(null);
    setError('');
  }, [onChange]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Kéo thả file vào đây hoặc click để chọn
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tối đa {maxSize}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-lg border border-border"
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={handleClear}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
