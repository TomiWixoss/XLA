/**
 * Custom Hook for Watermark Extract with SSE Progress
 */
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extractWatermarkSchema, type ExtractWatermarkInput } from '@/lib/validations/watermarking.schema';

export interface ProgressState {
  stage: string;
  progress: number;
  message: string;
}

export function useWatermarkExtractSSE() {
  const [watermarkedImage, setWatermarkedImage] = useState<File | null>(null);
  const [watermarkedPreview, setWatermarkedPreview] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [originalWatermark, setOriginalWatermark] = useState<File | null>(null);
  const [originalWatermarkPreview, setOriginalWatermarkPreview] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [progressState, setProgressState] = useState<ProgressState | null>(null);
  
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

  const onSubmit = useCallback(async (formData: ExtractWatermarkInput) => {
    if (!watermarkedImage || !originalImage) return;
    
    setIsPending(true);
    setError(null);
    setData(null);
    setProgressState({ stage: 'init', progress: 0, message: 'Đang khởi tạo...' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('watermarked_image', watermarkedImage);
      formDataToSend.append('original_image', originalImage);
      if (originalWatermark) {
        formDataToSend.append('original_watermark', originalWatermark);
      }
      formDataToSend.append('watermark_size', formData.watermarkSize.toString());
      formDataToSend.append('arnold_iterations', formData.arnoldIterations.toString());

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/watermarking/extract`, {
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
  }, [watermarkedImage, originalImage, originalWatermark]);

  const resetAll = useCallback(() => {
    form.reset();
    setWatermarkedImage(null);
    setWatermarkedPreview('');
    setOriginalImage(null);
    setOriginalPreview('');
    setOriginalWatermark(null);
    setOriginalWatermarkPreview('');
    setData(null);
    setError(null);
    setProgressState(null);
  }, [form]);

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
    progressState,
    resetAll,
  };
}
