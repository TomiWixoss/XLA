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
  stego_image: string; // base64 data URL
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
    });
    
    return response.data;
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
