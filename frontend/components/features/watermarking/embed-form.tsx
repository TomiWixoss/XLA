/**
 * Watermarking Embed Form Component - Pure UI
 */
'use client';

import { useWatermarkEmbedForm } from '@/hooks/use-watermark-embed-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Upload, Shield } from 'lucide-react';

export function WatermarkEmbedForm() {
  const {
    form,
    hostImage,
    hostPreview,
    watermarkImage,
    watermarkPreview,
    handleHostImageChange,
    handleWatermarkImageChange,
    onSubmit,
    isPending,
    data,
  } = useWatermarkEmbedForm();

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="host-image">Ảnh Gốc (Host Image)</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="host-image"
                  type="file"
                  accept="image/png,image/jpg,image/jpeg,image/bmp"
                  onChange={handleHostImageChange}
                  className="cursor-pointer"
                />
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              {hostPreview && (
                <img src={hostPreview} alt="Host" className="mt-4 max-w-full rounded-lg" />
              )}
            </div>

            <div>
              <Label htmlFor="watermark-image">Logo/Watermark</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="watermark-image"
                  type="file"
                  accept="image/png,image/jpg,image/jpeg,image/bmp"
                  onChange={handleWatermarkImageChange}
                  className="cursor-pointer"
                />
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              {watermarkPreview && (
                <img src={watermarkPreview} alt="Watermark" className="mt-4 max-w-full rounded-lg" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alpha">Hệ Số Nhúng (Alpha): {form.watch('alpha')}</Label>
              <Input
                id="alpha"
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                {...register('alpha', { valueAsNumber: true })}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Càng lớn càng bền nhưng càng rõ
              </p>
              {errors.alpha && (
                <p className="text-sm text-red-500 mt-1">{errors.alpha.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="arnold">Số Lần Xáo Trộn Arnold: {form.watch('arnoldIterations')}</Label>
              <Input
                id="arnold"
                type="range"
                min="1"
                max="20"
                step="1"
                {...register('arnoldIterations', { valueAsNumber: true })}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tăng độ bảo mật watermark
              </p>
              {errors.arnoldIterations && (
                <p className="text-sm text-red-500 mt-1">{errors.arnoldIterations.message}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Button type="submit" disabled={isPending || !hostImage || !watermarkImage} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang nhúng watermark...
          </>
        ) : (
          'Nhúng Watermark'
        )}
      </Button>

      {data && (
        <Card className="p-6 bg-green-50 dark:bg-green-950">
          <h3 className="font-semibold mb-2">Thành công!</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Kích thước WM</p>
              <p className="font-semibold">{data.watermark_size}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Blocks</p>
              <p className="font-semibold">{data.blocks_used}</p>
            </div>
            <div>
              <p className="text-muted-foreground">PSNR</p>
              <p className="font-semibold">{data.psnr.toFixed(2)} dB</p>
            </div>
            <div>
              <p className="text-muted-foreground">SSIM</p>
              <p className="font-semibold">{data.ssim.toFixed(4)}</p>
            </div>
          </div>
        </Card>
      )}
    </form>
  );
}
