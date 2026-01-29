/**
 * Video Watermarking API Service
 */
import { apiClient } from './client';

export interface EmbedVideoWatermarkParams {
  video: File;
  watermark: File;
  alpha: number;
  frameSkip: number;
  arnoldIterations: number;
}

export interface EmbedVideoWatermarkResponse {
  success: boolean;
  total_frames: number;
  watermarked_frames: number;
  fps: number;
  resolution: string;
  watermarked_video: string;
}

export interface ExtractVideoWatermarkParams {
  watermarkedVideo: File;
  originalVideo: File;
  frameNumber: number;
  watermarkSize: number;
  arnoldIterations: number;
}

export interface ExtractVideoWatermarkResponse {
  success: boolean;
  extracted_watermark: string;
  frame_number: number;
  watermark_size: number;
}

export const videoApi = {
  embedWatermark: async (params: EmbedVideoWatermarkParams): Promise<EmbedVideoWatermarkResponse> => {
    const formData = new FormData();
    formData.append('video', params.video);
    formData.append('watermark', params.watermark);
    formData.append('alpha', String(params.alpha));
    formData.append('frame_skip', String(params.frameSkip));
    formData.append('arnold_iterations', String(params.arnoldIterations));

    const response = await apiClient.post('/api/video/embed', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes for video processing
    });
    return response.data;
  },

  extractWatermark: async (params: ExtractVideoWatermarkParams): Promise<ExtractVideoWatermarkResponse> => {
    const formData = new FormData();
    formData.append('watermarked_video', params.watermarkedVideo);
    formData.append('original_video', params.originalVideo);
    formData.append('frame_number', String(params.frameNumber));
    formData.append('watermark_size', String(params.watermarkSize));
    formData.append('arnold_iterations', String(params.arnoldIterations));

    const response = await apiClient.post('/api/video/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes for video processing
    });
    return response.data;
  },
};
