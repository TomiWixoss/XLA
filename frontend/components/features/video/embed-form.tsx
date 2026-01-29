/**
 * Video Watermarking Embed Form Component - Pure UI
 */
'use client';

import { useVideoEmbedForm } from '@/hooks/use-video-embed-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Upload, Video, AlertCircle } from 'lucide-react';

export function VideoEmbedForm() {
  const {
    form,
    videoFile,
    videoPreview,
    watermarkImage,
    watermarkPreview,
    handleVideoChange,
    handleWatermarkChange,
    onSubmit,
    isPending,
    data,
  } = useVideoEmbedForm();

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6 border-orange-200 dark:border-orange-800">
        <div className="flex items-start gap-2 mb-4 text-orange-600 dark:text-orange-400">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <p className="text-sm">
            Xử lý video có thể mất nhiều thời gian. Khuyến nghị video ngắn (&lt;30s) để demo.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="video-file">Video Gốc</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="video-file"
                  type="file"
                  accept="video/mp4,video/avi"
                  onChange={handleVideoChange}
                  className="cursor-pointer"
                />
                <Video className="w-5 h-5 text-muted-foreground" />
              </div>
              {videoPreview && (
                <video 
                  src={videoPreview} 
                  controls 
                  className="mt-4 max-w-full rounded-lg"
                  style={{ maxHeight: '200px' }}
                />
              )}
            </div>

            <div>
              <Label htmlFor="video-watermark">Logo/Watermark</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="video-watermark"
                  type="file"
                  accept="image/png,image/jpg,image/jpeg"
                  onChange={handleWatermarkChange}
                  className="cursor-pointer"
                />
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              {watermarkPreview && (
                <img src={watermarkPreview} alt="Watermark" className="mt-4 max-w-full rounded-lg" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="video-alpha">Hệ Số Nhúng (Alpha): {form.watch('alpha')}</Label>
              <Input
                id="video-alpha"
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                {...register('alpha', { valueAsNumber: true })}
                className="mt-2"
              />
              {errors.alpha && (
                <p className="text-sm text-red-500 mt-1">{errors.alpha.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="frame-skip">Nhúng Mỗi N Khung Hình: {form.watch('frameSkip')}</Label>
              <Input
                id="frame-skip"
                type="range"
                min="1"
                max="10"
                step="1"
                {...register('frameSkip', { valueAsNumber: true })}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                1 = tất cả khung hình, 5 = mỗi 5 khung hình
              </p>
              {errors.frameSkip && (
                <p className="text-sm text-red-500 mt-1">{errors.frameSkip.message}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Button type="submit" disabled={isPending || !videoFile || !watermarkImage} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang xử lý video... (có thể mất vài phút)
          </>
        ) : (
          'Nhúng Watermark vào Video'
        )}
      </Button>

      {data && (
        <Card className="p-6 bg-green-50 dark:bg-green-950">
          <h3 className="font-semibold mb-2">Xử lý video thành công!</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <p className="text-muted-foreground">Tổng khung hình</p>
              <p className="font-semibold">{data.total_frames}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Đã nhúng</p>
              <p className="font-semibold">{data.watermarked_frames}</p>
            </div>
            <div>
              <p className="text-muted-foreground">FPS</p>
              <p className="font-semibold">{data.fps}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Độ phân giải</p>
              <p className="font-semibold">{data.resolution}</p>
            </div>
          </div>
          <Button 
            type="button"
            onClick={() => {
              const link = document.createElement('a');
              link.href = data.watermarked_video;
              link.download = 'watermarked_video.mp4';
              link.click();
            }}
            className="w-full"
          >
            Tải Video Đã Watermark
          </Button>
        </Card>
      )}
    </form>
  );
}
