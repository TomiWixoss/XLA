/**
 * Custom Hook for Watermark Embed Form Logic
 */
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { embedWatermarkSchema, type EmbedWatermarkInput } from '@/lib/validations/watermarking.schema';
import { useEmbedWatermark } from './use-watermarking';

export function useWatermarkEmbedForm() {
  const [hostImage, setHostImage] = useState<File | null>(null);
  const [hostPreview, setHostPreview] = useState<string>('');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkPreview, setWatermarkPreview] = useState<string>('');
  
  const { mutate: embedWatermark, isPending, data, reset: resetMutation } = useEmbedWatermark();
  
  const form = useForm<EmbedWatermarkInput>({
    resolver: zodResolver(embedWatermarkSchema),
    defaultValues: {
      alpha: 0.1,
      arnoldIterations: 10,
    },
  });

  const handleHostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setHostPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleWatermarkImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWatermarkImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setWatermarkPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (formData: EmbedWatermarkInput) => {
    if (!hostImage || !watermarkImage) return;
    
    embedWatermark({
      hostImage,
      watermarkImage,
      alpha: formData.alpha,
      arnoldIterations: formData.arnoldIterations,
    });
  };

  // Complete reset - clears form, images, and mutation data
  const resetAll = useCallback(() => {
    form.reset();
    setHostImage(null);
    setHostPreview('');
    setWatermarkImage(null);
    setWatermarkPreview('');
    resetMutation();
  }, [form, resetMutation]);

  return {
    form,
    hostImage,
    hostPreview,
    watermarkImage,
    watermarkPreview,
    handleHostImageChange,
    handleWatermarkImageChange,
    onSubmit,
    isPending,
    data,
    resetAll,
  };
}

