/**
 * Zod Validation Schemas - Watermarking
 */
import { z } from 'zod';

export const embedWatermarkSchema = z.object({
  alpha: z.number().min(0.01).max(0.5),
  arnoldIterations: z.number().min(1).max(20),
});

export const extractWatermarkSchema = z.object({
  watermarkSize: z.number().min(16).max(128),
  arnoldIterations: z.number().min(1).max(20),
});

export type EmbedWatermarkInput = z.infer<typeof embedWatermarkSchema>;
export type ExtractWatermarkInput = z.infer<typeof extractWatermarkSchema>;
