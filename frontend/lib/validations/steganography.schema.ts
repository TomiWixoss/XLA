/**
 * Zod Validation Schemas - Steganography
 */
import { z } from 'zod';

export const embedMessageSchema = z.object({
  message: z.string().min(1, 'Tin nhắn không được để trống').max(10000, 'Tin nhắn quá dài'),
  useEncryption: z.boolean(),
  password: z.string().optional(),
}).refine((data) => {
  if (data.useEncryption && !data.password) {
    return false;
  }
  return true;
}, {
  message: 'Mật khẩu bắt buộc khi bật mã hóa',
  path: ['password'],
});

export const extractMessageSchema = z.object({
  useDecryption: z.boolean(),
  password: z.string().optional(),
}).refine((data) => {
  if (data.useDecryption && !data.password) {
    return false;
  }
  return true;
}, {
  message: 'Mật khẩu bắt buộc khi bật giải mã',
  path: ['password'],
});

export type EmbedMessageInput = z.infer<typeof embedMessageSchema>;
export type ExtractMessageInput = z.infer<typeof extractMessageSchema>;
