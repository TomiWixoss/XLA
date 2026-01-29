/**
 * Custom Hook for Watermark Extract Form Logic
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extractWatermarkSchema, type ExtractWatermarkInput } from '@/lib/validations/watermarking.schema';
import { useExtractWatermark } from './use-watermarking';

export function useWatermarkExtractForm() {
  const [watermarkedImage, setWatermarkedImage] = useState<File | null>(null);
  const [watermarkedPreview, setWatermarkedPreview] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  
  const { mutate: extractWatermark, isPending, data } = useExtractWatermark();
  
  const form = useForm<ExtractWatermarkInput>({
    resolver: zodResolver(extractWatermarkSchema),
    defaultValues: {
      watermarkSize: 32,
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

  const onSubmit = (formData: ExtractWatermarkInput) => {
    if (!watermarkedImage || !originalImage) return;
    
    extractWatermark({
      watermarkedImage,
      originalImage,
      watermarkSize: formData.watermarkSize,
      arnoldIterations: formData.arnoldIterations,
    });
  };

  return {
    form,
    watermarkedImage,
    watermarkedPreview,
    originalImage,
    originalPreview,
    handleWatermarkedImageChange,
    handleOriginalImageChange,
    onSubmit,
    isPending,
    data,
  };
}
