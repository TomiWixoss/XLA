/**
 * Custom Hook for Watermark Extract Form Logic
 */
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extractWatermarkSchema, type ExtractWatermarkInput } from '@/lib/validations/watermarking.schema';
import { useExtractWatermark } from './use-watermarking';

export function useWatermarkExtractForm() {
  const [watermarkedImage, setWatermarkedImage] = useState<File | null>(null);
  const [watermarkedPreview, setWatermarkedPreview] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [originalWatermark, setOriginalWatermark] = useState<File | null>(null);
  const [originalWatermarkPreview, setOriginalWatermarkPreview] = useState<string>('');
  
  const { mutate: extractWatermark, isPending, data, reset: resetMutation, error } = useExtractWatermark();
  
  const form = useForm<ExtractWatermarkInput>({
    resolver: zodResolver(extractWatermarkSchema),
    defaultValues: {
      watermarkSize: 64,
      arnoldIterations: 10,
    },
  });

  const handleWatermarkedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWatermarkedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setWatermarkedPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOriginalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setOriginalPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOriginalWatermarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalWatermark(file);
      const reader = new FileReader();
      reader.onloadend = () => setOriginalWatermarkPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (formData: ExtractWatermarkInput) => {
    if (!watermarkedImage || !originalImage) return;
    
    extractWatermark({
      watermarkedImage,
      originalImage,
      originalWatermark: originalWatermark || undefined,
      watermarkSize: formData.watermarkSize,
      arnoldIterations: formData.arnoldIterations,
    });
  };

  // Complete reset - clears form, images, and mutation data
  const resetAll = useCallback(() => {
    form.reset();
    setWatermarkedImage(null);
    setWatermarkedPreview('');
    setOriginalImage(null);
    setOriginalPreview('');
    setOriginalWatermark(null);
    setOriginalWatermarkPreview('');
    resetMutation();
  }, [form, resetMutation]);

  return {
    form,
    watermarkedImage,
    watermarkedPreview,
    originalImage,
    originalPreview,
    originalWatermark,
    originalWatermarkPreview,
    handleWatermarkedImageChange,
    handleOriginalImageChange,
    handleOriginalWatermarkChange,
    onSubmit,
    isPending,
    data,
    error,
    resetAll,
  };
}

