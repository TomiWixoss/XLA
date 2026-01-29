/**
 * Steganography Custom Hooks with TanStack Query
 */
import { useMutation } from '@tanstack/react-query';
import { steganographyApi } from '@/lib/api/steganography.api';
import type { EmbedMessageParams, ExtractMessageParams } from '@/lib/api/steganography.api';

export const useEmbedMessage = () => {
  return useMutation({
    mutationFn: (params: EmbedMessageParams) => steganographyApi.embedMessage(params),
    onSuccess: (data) => {
      console.log('Message embedded successfully:', data);
    },
    onError: (error: Error) => {
      console.error('Failed to embed message:', error.message);
    },
  });
};

export const useExtractMessage = () => {
  return useMutation({
    mutationFn: (params: ExtractMessageParams) => steganographyApi.extractMessage(params),
    onSuccess: (data) => {
      console.log('Message extracted successfully:', data);
    },
    onError: (error: Error) => {
      console.error('Failed to extract message:', error.message);
    },
  });
};
