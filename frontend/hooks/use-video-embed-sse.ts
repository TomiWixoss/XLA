/**
 * Custom Hook for Video Embed with SSE Progress
 */
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { embedVideoWatermarkSchema, type EmbedVideoWatermarkInput } from '@/lib/validations/video.schema';

export interface ProgressState {
  stage: string;
  progress: number;
  message: string;
}

export function useVideoEmbedSSE() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkPreview, setWatermarkPreview] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [progressState, setProgressState] = useState<ProgressState | null>(null);
  
  const form = useForm<EmbedVideoWatermarkInput>({
    resolver: zodResolver(embedVideoWatermarkSchema),
    defaultValues: {
      alpha: 0.1,
      frameSkip: 5,
      arnoldIterations: 10,
      useSceneDetection: true,
      sceneThreshold: 30,
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

  const onSubmit = useCallback(async (formData: EmbedVideoWatermarkInput) => {
    if (!videoFile || !watermarkImage) return;
    
    setIsPending(true);
    setError(null);
    setData(null);
    setProgressState({ stage: 'init', progress: 0, message: 'Đang khởi tạo...' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('video', videoFile);
      formDataToSend.append('watermark', watermarkImage);
      formDataToSend.append('alpha', formData.alpha.toString());
      formDataToSend.append('frame_skip', formData.frameSkip.toString());
      formDataToSend.append('arnold_iterations', formData.arnoldIterations.toString());
      formDataToSend.append('use_scene_detection', formData.useSceneDetection.toString());
      formDataToSend.append('scene_threshold', formData.sceneThreshold.toString());

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/video/embed`, {
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
  }, [videoFile, watermarkImage]);

  const resetAll = useCallback(() => {
    form.reset();
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview('');
    setWatermarkImage(null);
    setWatermarkPreview('');
    setData(null);
    setError(null);
    setProgressState(null);
  }, [form, videoPreview]);

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
    error,
    progressState,
    resetAll,
  };
}
