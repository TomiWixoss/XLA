/**
 * Watermarking Extract Form Component - Pure UI
 */
'use client';

import { useWatermarkExtractForm } from '@/hooks/use-watermark-extract-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';

export function WatermarkExtractForm() {
  const {
    form,
    watermarkedImage,
    watermarkedPreview,
    originalImage,
    originalPreview,
    handleWatermarkedImageChange,
    handleOriginalImageChange,
    onSubmit,
    isPending,
    data,
  } = useWatermarkExtractForm();

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="watermarked-image">Ảnh Đã Nhúng Watermark</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="watermarked-image"
                  type="file"
                  accept="image/png,image/jpg,image/jpeg"
                  onChange={handleWatermarkedImageChange}
                  className="cursor-pointer"
                />
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              {watermarkedPreview && (
                <img src={watermarkedPreview} alt="Watermarked" className="mt-4 max-w-full rounded-lg" />
              )}
            </div>

            <div>
              <Label htmlFor="original-image">Ảnh Gốc (Để So Sánh)</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="original-image"
                  type="file"
                  accept="image/png,image/jpg,image/jpeg"
                  onChange={handleOriginalImageChange}
                  className="cursor-pointer"
                />
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              {originalPreview && (
                <img src={originalPreview} alt="Original" className="mt-4 max-w-full rounded-lg" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="watermark-size">Kích Thước Watermark</Label>
              <Input
                id="watermark-size"
                type="number"
                min="16"
                max="128"
                {...register('watermarkSize', { valueAsNumber: true })}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Phải biết trước kích thước (16-128)
              </p>
              {errors.watermarkSize && (
                <p className="text-sm text-red-500 mt-1">{errors.watermarkSize.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="arnold-extract">Số Lần Xáo Trộn Arnold</Label>
              <Input
                id="arnold-extract"
                type="number"
                min="1"
                max="20"
                {...register('arnoldIterations', { valueAsNumber: true })}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Phải giống lúc nhúng
              </p>
              {errors.arnoldIterations && (
                <p className="text-sm text-red-500 mt-1">{errors.arnoldIterations.message}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Button type="submit" disabled={isPending || !watermarkedImage || !originalImage} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang trích xuất...
          </>
        ) : (
          'Trích Xuất Watermark'
        )}
      </Button>

      {data && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-950">
          <h3 className="font-semibold mb-2">Watermark Đã Trích Xuất</h3>
          <p className="text-sm text-muted-foreground mb-2">Kích thước: {data.size}x{data.size}</p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">Matrix data available in console</p>
          </div>
        </Card>
      )}
    </form>
  );
}
