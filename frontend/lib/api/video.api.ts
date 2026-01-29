/**
 * Video Watermarking API Service
 */
import { apiClient } from './client';

export interface EmbedVideoWatermarkParams {
  video: File;
  watermark: File;
  alpha: number;
  frameSkip: number;
}

export interface EmbedVideoWatermarkResponse {
  success: boolean;
  total_frames: number;
  watermarked_frames: number;
  fps: number;
  resolution: string;
  watermarked_video: string;
}

export const videoApi = {
  embedWatermark: async (params: EmbedVideoWatermarkParams): Promise<EmbedVideoWatermarkResponse> => {
    const formData = new FormData();
    formData.append('video', params.video);
    formData.append('watermark', params.watermark);
    formData.append('alpha', String(params.alpha));
    formData.append('frame_skip', String(params.frameSkip));

    const response = await apiClient.post('/api/video/embed', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes for video processing
    });
    return response.data;
  },
};
