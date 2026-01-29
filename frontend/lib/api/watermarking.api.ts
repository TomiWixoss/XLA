/**
 * Watermarking API Service
 */
import { apiClient } from './client';

export interface EmbedWatermarkParams {
  hostImage: File;
  watermarkImage: File;
  alpha: number;
  arnoldIterations: number;
}

export interface ExtractWatermarkParams {
  watermarkedImage: File;
  originalImage: File;
  originalWatermark?: File;
  watermarkSize: number;
  arnoldIterations: number;
}

export interface EmbedWatermarkResponse {
  success: boolean;
  watermark_size: string;
  blocks_used: number;
  alpha: number;
  arnold_iterations: number;
  psnr: number;
  ssim: number;
  watermarked_image: string;
}

export interface ExtractWatermarkResponse {
  success: boolean;
  extracted_watermark: string; // base64 encoded image
  size: number;
  nc?: number; // Normalized Cross-correlation
}


export const watermarkingApi = {
  embedWatermark: async (params: EmbedWatermarkParams): Promise<EmbedWatermarkResponse> => {
    const formData = new FormData();
    formData.append('host_image', params.hostImage);
    formData.append('watermark_image', params.watermarkImage);
    formData.append('alpha', String(params.alpha));
    formData.append('arnold_iterations', String(params.arnoldIterations));

    const response = await apiClient.post('/api/watermarking/embed', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  extractWatermark: async (params: ExtractWatermarkParams): Promise<ExtractWatermarkResponse> => {
    const formData = new FormData();
    formData.append('watermarked_image', params.watermarkedImage);
    formData.append('original_image', params.originalImage);
    if (params.originalWatermark) {
      formData.append('original_watermark', params.originalWatermark);
    }
    formData.append('watermark_size', String(params.watermarkSize));
    formData.append('arnold_iterations', String(params.arnoldIterations));

    const response = await apiClient.post('/api/watermarking/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
