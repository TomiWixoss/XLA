/**
 * Zod Validation Schemas - Video Watermarking
 */
import { z } from 'zod';

export const embedVideoWatermarkSchema = z.object({
  alpha: z.number().min(0.01).max(0.5),
  frameSkip: z.number().min(1).max(10),
});

export type EmbedVideoWatermarkInput = z.infer<typeof embedVideoWatermarkSchema>;
