/**
 * Custom Hook for Video Extract Form Logic
 */
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extractVideoWatermarkSchema, type ExtractVideoWatermarkInput } from '@/lib/validations/video.schema';
import { useExtractVideoWatermark } from './use-video';

export function useVideoExtractForm() {
  const [watermarkedVideo, setWatermarkedVideo] = useState<File | null>(null);
  const [watermarkedPreview, setWatermarkedPreview] = useState<string>('');
  const [originalVideo, setOriginalVideo] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  
  const { mutate: extractWatermark, isPending, data, reset: resetMutation } = useExtractVideoWatermark();
  
  const form = useForm<ExtractVideoWatermarkInput>({
    resolver: zodResolver(extractVideoWatermarkSchema),
    defaultValues: {
      frameNumber: 0,
      watermarkSize: 64,
      arnoldIterations: 10,
    },
  });

  const handleWatermarkedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWatermarkedVideo(file);
      const url = URL.createObjectURL(file);
      setWatermarkedPreview(url);
    }
  };

  const handleOriginalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalVideo(file);
      const url = URL.createObjectURL(file);
      setOriginalPreview(url);
    }
  };

  const onSubmit = (formData: ExtractVideoWatermarkInput) => {
    if (!watermarkedVideo || !originalVideo) return;
    
    extractWatermark({
      watermarkedVideo,
      originalVideo,
      frameNumber: formData.frameNumber,
      watermarkSize: formData.watermarkSize,
      arnoldIterations: formData.arnoldIterations,
    });
  };

  const resetAll = useCallback(() => {
    form.reset();
    if (watermarkedPreview) URL.revokeObjectURL(watermarkedPreview);
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    setWatermarkedVideo(null);
    setWatermarkedPreview('');
    setOriginalVideo(null);
    setOriginalPreview('');
    resetMutation();
  }, [form, watermarkedPreview, originalPreview, resetMutation]);

  return {
    form,
    watermarkedVideo,
    watermarkedPreview,
    originalVideo,
    originalPreview,
    handleWatermarkedChange,
    handleOriginalChange,
    onSubmit,
    isPending,
    data,
    resetAll,
  };
}

