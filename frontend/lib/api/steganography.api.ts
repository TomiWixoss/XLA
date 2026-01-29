/**
 * Steganography API Service
 */
import { apiClient } from './client';

export interface EmbedMessageParams {
  coverImage: File;
  message: string;
  useEncryption: boolean;
  password?: string;
}

export interface ExtractMessageParams {
  stegoImage: File;
  useDecryption: boolean;
  password?: string;
}

export interface EmbedMessageResponse {
  success: boolean;
  message_length: number;
  bits_used: number;
  capacity: number;
  usage_percent: number;
  encrypted: boolean;
  psnr: number;
  ssim: number;
  stego_image_blob?: Blob;
}

export interface ExtractMessageResponse {
  message: string;
  length: number;
}

export const steganographyApi = {
  embedMessage: async (params: EmbedMessageParams): Promise<EmbedMessageResponse> => {
    const formData = new FormData();
    formData.append('cover_image', params.coverImage);
    formData.append('message', params.message);
    formData.append('use_encryption', String(params.useEncryption));
    if (params.password) {
      formData.append('password', params.password);
    }

    const response = await apiClient.post('/api/steganography/embed', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
    });

    // Extract metadata from headers
    const headers = response.headers;
    const blob = response.data;

    return {
      success: true,
      message_length: parseInt(headers['x-message-length'] || '0'),
      bits_used: parseInt(headers['x-bits-used'] || '0'),
      capacity: 0,
      usage_percent: 0,
      encrypted: params.useEncryption,
      psnr: parseFloat(headers['x-psnr'] || '0'),
      ssim: parseFloat(headers['x-ssim'] || '0'),
      stego_image_blob: blob,
    };
  },

  extractMessage: async (params: ExtractMessageParams): Promise<ExtractMessageResponse> => {
    const formData = new FormData();
    formData.append('stego_image', params.stegoImage);
    formData.append('use_decryption', String(params.useDecryption));
    if (params.password) {
      formData.append('password', params.password);
    }

    const response = await apiClient.post('/api/steganography/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
