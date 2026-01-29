/**
 * Video Watermarking Custom Hooks with TanStack Query
 */
import { useMutation } from '@tanstack/react-query';
import { videoApi } from '@/lib/api/video.api';
import type { EmbedVideoWatermarkParams, ExtractVideoWatermarkParams } from '@/lib/api/video.api';

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

export const useExtractVideoWatermark = () => {
  return useMutation({
    mutationFn: (params: ExtractVideoWatermarkParams) => videoApi.extractWatermark(params),
    onSuccess: (data) => {
      console.log('Video watermark extracted successfully:', data);
    },
    onError: (error: Error) => {
      console.error('Failed to extract video watermark:', error.message);
    },
  });
};
