/**
 * Watermarking Custom Hooks with TanStack Query
 */
import { useMutation } from '@tanstack/react-query';
import { watermarkingApi } from '@/lib/api/watermarking.api';
import type { EmbedWatermarkParams, ExtractWatermarkParams } from '@/lib/api/watermarking.api';

export const useEmbedWatermark = () => {
  return useMutation({
    mutationFn: (params: EmbedWatermarkParams) => watermarkingApi.embedWatermark(params),
    onSuccess: (data) => {
      console.log('Watermark embedded successfully:', data);
    },
    onError: (error: Error) => {
      console.error('Failed to embed watermark:', error.message);
    },
  });
};

export const useExtractWatermark = () => {
  return useMutation({
    mutationFn: (params: ExtractWatermarkParams) => watermarkingApi.extractWatermark(params),
    onSuccess: (data) => {
      console.log('Watermark extracted successfully:', data);
    },
    onError: (error: Error) => {
      console.error('Failed to extract watermark:', error.message);
    },
  });
};
