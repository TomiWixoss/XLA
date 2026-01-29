/**
 * Custom Hook for Video Extract with SSE Progress
 */
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extractVideoWatermarkSchema, type ExtractVideoWatermarkInput } from '@/lib/validations/video.schema';

export interface ProgressState {
  stage: string;
  progress: number;
  message: string;
}

export function useVideoExtractSSE() {
  const [watermarkedVideo, setWatermarkedVideo] = useState<File | null>(null);
  const [watermarkedPreview, setWatermarkedPreview] = useState<string>('');
  const [originalVideo, setOriginalVideo] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [progressState, setProgressState] = useState<ProgressState | null>(null);
  
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

  const onSubmit = useCallback(async (formData: ExtractVideoWatermarkInput) => {
    if (!watermarkedVideo || !originalVideo) return;
    
    setIsPending(true);
    setError(null);
    setData(null);
    setProgressState({ stage: 'init', progress: 0, message: 'Đang khởi tạo...' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('watermarked_video', watermarkedVideo);
      formDataToSend.append('original_video', originalVideo);
      formDataToSend.append('frame_number', formData.frameNumber.toString());
      formDataToSend.append('watermark_size', formData.watermarkSize.toString());
      formDataToSend.append('arnold_iterations', formData.arnoldIterations.toString());

      const response = await fetch('http://localhost:8000/api/video/extract', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const eventData = JSON.parse(line.slice(6));

            if (eventData.stage === 'error') {
              setError(new Error(eventData.message));
              setIsPending(false);
              return;
            }

            if (eventData.stage === 'complete') {
              setProgressState({ stage: 'complete', progress: 100, message: eventData.message });
              setData(eventData.result);
              setIsPending(false);
              return;
            }

            setProgressState({
              stage: eventData.stage,
              progress: eventData.progress,
              message: eventData.message,
            });
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsPending(false);
    }
  }, [watermarkedVideo, originalVideo]);

  const resetAll = useCallback(() => {
    form.reset();
    if (watermarkedPreview) URL.revokeObjectURL(watermarkedPreview);
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    setWatermarkedVideo(null);
    setWatermarkedPreview('');
    setOriginalVideo(null);
    setOriginalPreview('');
    setData(null);
    setError(null);
    setProgressState(null);
  }, [form, watermarkedPreview, originalPreview]);

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
    error,
    progressState,
    resetAll,
  };
}
