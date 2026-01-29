/**
 * Custom Hook for Video Embed Form Logic
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { embedVideoWatermarkSchema, type EmbedVideoWatermarkInput } from '@/lib/validations/video.schema';
import { useEmbedVideoWatermark } from './use-video';

export function useVideoEmbedForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkPreview, setWatermarkPreview] = useState<string>('');
  
  const { mutate: embedWatermark, isPending, data } = useEmbedVideoWatermark();
  
  const form = useForm<EmbedVideoWatermarkInput>({
    resolver: zodResolver(embedVideoWatermarkSchema),
    defaultValues: {
      alpha: 0.1,
      frameSkip: 5,
    },
  });

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleWatermarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWatermarkImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setWatermarkPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (formData: EmbedVideoWatermarkInput) => {
    if (!videoFile || !watermarkImage) return;
    
    embedWatermark({
      video: videoFile,
      watermark: watermarkImage,
      alpha: formData.alpha,
      frameSkip: formData.frameSkip,
    });
  };

  return {
    form,
    videoFile,
    videoPreview,
    watermarkImage,
    watermarkPreview,
    handleVideoChange,
    handleWatermarkChange,
    onSubmit,
    isPending,
    data,
  };
}
