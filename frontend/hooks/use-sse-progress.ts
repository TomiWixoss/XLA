/**
 * Custom Hook for SSE Progress Tracking
 */
import { useState, useCallback } from 'react';

export interface ProgressState {
  stage: string;
  progress: number;
  message: string;
}

export function useSSEProgress() {
  const [progressState, setProgressState] = useState<ProgressState | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSSE = useCallback(async (
    url: string,
    formData: FormData,
    onComplete: (result: any) => void,
    onError: (error: Error) => void
  ) => {
    setIsStreaming(true);
    setProgressState({ stage: 'init', progress: 0, message: 'Đang khởi tạo...' });

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
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
            const data = JSON.parse(line.slice(6));

            if (data.stage === 'error') {
              setIsStreaming(false);
              onError(new Error(data.message));
              return;
            }

            if (data.stage === 'complete') {
              setProgressState({ stage: 'complete', progress: 100, message: data.message });
              setIsStreaming(false);
              onComplete(data.result);
              return;
            }

            setProgressState({
              stage: data.stage,
              progress: data.progress,
              message: data.message,
            });
          }
        }
      }
    } catch (error) {
      setIsStreaming(false);
      onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, []);

  const resetProgress = useCallback(() => {
    setProgressState(null);
    setIsStreaming(false);
  }, []);

  return {
    progressState,
    isStreaming,
    handleSSE,
    resetProgress,
  };
}
