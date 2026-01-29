/**
 * Video Watermarking Custom Hooks with TanStack Query
 */
import { useMutation } from '@tanstack/react-query';
import { videoApi } from '@/lib/api/video.api';
import type { EmbedVideoWatermarkParams } from '@/lib/api/video.api';

export const useEmbedVideoWatermark = () => {
  return useMutation({
    mutationFn: (params: EmbedVideoWatermarkParams) => videoApi.embedWatermark(params),
    onSuccess: (data) => {
      console.log('Video watermark embedded successfully:', data);
    },
    onError: (error: Error) => {
      console.error('Failed to embed video watermark:', error.message);
    },
  });
};
