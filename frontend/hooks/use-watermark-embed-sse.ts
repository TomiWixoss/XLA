/**
 * Custom Hook for Watermark Embed with SSE Progress
 */
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { embedWatermarkSchema, type EmbedWatermarkInput } from '@/lib/validations/watermarking.schema';

export interface ProgressState {
  stage: string;
  progress: number;
  message: string;
}

export function useWatermarkEmbedSSE() {
  const [hostImage, setHostImage] = useState<File | null>(null);
  const [hostPreview, setHostPreview] = useState<string>('');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkPreview, setWatermarkPreview] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [progressState, setProgressState] = useState<ProgressState | null>(null);
  
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

  const onSubmit = useCallback(async (formData: EmbedWatermarkInput) => {
    if (!hostImage || !watermarkImage) return;
    
    setIsPending(true);
    setError(null);
    setData(null);
    setProgressState({ stage: 'init', progress: 0, message: 'Đang khởi tạo...' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('host_image', hostImage);
      formDataToSend.append('watermark_image', watermarkImage);
      formDataToSend.append('alpha', formData.alpha.toString());
      formDataToSend.append('arnold_iterations', formData.arnoldIterations.toString());

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/watermarking/embed`, {
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

      let buffer = ''; // Buffer để lưu chunk chưa hoàn chỉnh

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        const lines = buffer.split('\n');
        
        // Giữ lại dòng cuối nếu chưa hoàn chỉnh
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              const eventData = JSON.parse(jsonStr);

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
            } catch (parseError) {
              console.error('JSON parse error:', parseError);
              // Tiếp tục xử lý các dòng khác
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsPending(false);
    }
  }, [hostImage, watermarkImage]);

  const resetAll = useCallback(() => {
    form.reset();
    setHostImage(null);
    setHostPreview('');
    setWatermarkImage(null);
    setWatermarkPreview('');
    setData(null);
    setError(null);
    setProgressState(null);
  }, [form]);

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
    error,
    progressState,
    resetAll,
  };
}
