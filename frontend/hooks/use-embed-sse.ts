/**
 * Custom Hook for Steganography Embed with SSE Progress
 */
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { embedMessageSchema, type EmbedMessageInput } from '@/lib/validations/steganography.schema';

export interface ProgressState {
  stage: string;
  progress: number;
  message: string;
}

export function useEmbedSSE() {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [progressState, setProgressState] = useState<ProgressState | null>(null);
  
  const form = useForm<EmbedMessageInput>({
    resolver: zodResolver(embedMessageSchema),
    defaultValues: {
      message: '',
      useEncryption: false,
      password: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = useCallback(async (formData: EmbedMessageInput) => {
    if (!coverImage) return;
    
    setIsPending(true);
    setError(null);
    setData(null);
    setProgressState({ stage: 'init', progress: 0, message: 'Đang khởi tạo...' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('cover_image', coverImage);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('use_encryption', formData.useEncryption.toString());
      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }

      const response = await fetch('http://localhost:8000/api/steganography/embed', {
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
  }, [coverImage]);

  const resetAll = useCallback(() => {
    form.reset();
    setCoverImage(null);
    setCoverPreview('');
    setData(null);
    setError(null);
    setProgressState(null);
  }, [form]);

  return {
    form,
    coverImage,
    coverPreview,
    handleImageChange,
    onSubmit,
    isPending,
    data,
    error,
    progressState,
    resetAll,
  };
}
