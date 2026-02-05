/**
 * Zod Validation Schemas - Video Watermarking
 */
import { z } from 'zod';

export const embedVideoWatermarkSchema = z.object({
  alpha: z.number(),
  frameSkip: z.number(),
  arnoldIterations: z.number(),
});

export type EmbedVideoWatermarkInput = z.infer<typeof embedVideoWatermarkSchema>;

export const extractVideoWatermarkSchema = z.object({
  frameNumber: z.number(),
  watermarkSize: z.number(),
  arnoldIterations: z.number(),
});

export type ExtractVideoWatermarkInput = z.infer<typeof extractVideoWatermarkSchema>;
