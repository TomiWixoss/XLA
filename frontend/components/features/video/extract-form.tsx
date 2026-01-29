/**
 * Video Watermark Extract Form Component - Pure UI with Enhanced UX
 */
'use client';

import { useState, useEffect } from 'react';
import { useVideoExtractForm } from '@/hooks/use-video-extract-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { Stepper } from '@/components/ui/stepper';
import { Progress } from '@/components/ui/progress';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  Loader2, 
  Download, 
  Video, 
  AlertCircle, 
  CheckCircle2,
  Trash2,
  Search,
  Settings,
  Image as ImageIcon
} from 'lucide-react';

const STEPS = [
  { title: 'Video Đã Watermark', description: 'Tải video đã nhúng' },
  { title: 'Video Gốc', description: 'Tải video gốc' },
  { title: 'Cấu Hình', description: 'Chọn frame & kích thước' },
  { title: 'Trích Xuất', description: 'Lấy watermark' },
];

export function VideoExtractForm() {
  const {
    form,
    watermarkedVideo,
    watermarkedPreview,
    originalVideo,
    originalPreview,
    handleWatermarkedChange,
    handleOriginalChange,
    onSubmit,
    isPending,
    data,
  } = useVideoExtractForm();

  const { register, handleSubmit, formState: { errors }, watch } = form;
  const [currentStep, setCurrentStep] = useState(0);

  // Tự động chuyển bước
  useEffect(() => {
    if (!watermarkedVideo) setCurrentStep(0);
    else if (!originalVideo) setCurrentStep(1);
    else if (!isPending && !data) setCurrentStep(2);
    else if (isPending) setCurrentStep(3);
  }, [watermarkedVideo, originalVideo, isPending, data]);

  const handleWatermarkedFileChange = (file: File | null) => {
    if (file) {
      const event = {
        target: { files: [file] }
      } as any;
      handleWatermarkedChange(event);
    }
  };

  const handleOriginalFileChange = (file: File | null) => {
    if (file) {
      const event = {
        target: { files: [file] }
      } as any;
      handleOriginalChange(event);
    }
  };

  const frameNumber = watch('frameNumber');
  const watermarkSize = watch('watermarkSize');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Stepper */}
      <Stepper steps={STEPS} currentStep={currentStep} />

      {/* Cảnh báo */}
      <Card className="card-info">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">Lưu ý trích xuất watermark từ video</p>
            <p className="text-sm opacity-90">
              Cần cả video đã watermark và video gốc để trích xuất. Watermark sẽ được lấy từ frame cụ thể.
            </p>
          </div>
        </div>
      </Card>

      {/* Bước 1 & 2: Upload Videos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Watermarked Video Upload */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-5 h-5 text-primary" />
            <Label className="text-base font-semibold">Video Đã Watermark</Label>
            <HelpTooltip content="Video đã được nhúng watermark" />
          </div>

          {!watermarkedVideo ? (
            <FileUpload
              accept="video/mp4,video/avi"
              onChange={handleWatermarkedFileChange}
              preview={watermarkedPreview}
              label=""
              maxSize={100}
            />
          ) : (
            <div className="space-y-3">
              <video 
                src={watermarkedPreview} 
                controls 
                className="w-full rounded-lg border border-border"
                style={{ maxHeight: '240px' }}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="truncate">{watermarkedVideo.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleWatermarkedFileChange(null)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Original Video Upload */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-5 h-5 text-primary" />
            <Label className="text-base font-semibold">Video Gốc</Label>
            <HelpTooltip content="Video gốc chưa có watermark" />
          </div>

          {!originalVideo ? (
            <FileUpload
              accept="video/mp4,video/avi"
              onChange={handleOriginalFileChange}
              preview={originalPreview}
              label=""
              maxSize={100}
            />
          ) : (
            <div className="space-y-3">
              <video 
                src={originalPreview} 
                controls 
                className="w-full rounded-lg border border-border"
                style={{ maxHeight: '240px' }}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="truncate">{originalVideo.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOriginalFileChange(null)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Bước 3: Cấu hình */}
      {watermarkedVideo && originalVideo && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-primary" />
            <Label className="text-base font-semibold">Cấu Hình Trích Xuất</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Frame Number */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="frame-number">Số Frame</Label>
                  <HelpTooltip content="Frame nào cần trích xuất watermark (bắt đầu từ 0)" />
                </div>
                <span className="text-sm font-mono font-semibold text-primary">
                  {frameNumber || 0}
                </span>
              </div>
              <Input
                id="frame-number"
                type="number"
                min="0"
                step="1"
                {...register('frameNumber', { valueAsNumber: true })}
                className="w-full"
              />
              {errors.frameNumber && (
                <p className="text-sm text-red-500">{errors.frameNumber.message}</p>
              )}
            </div>

            {/* Watermark Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="watermark-size">Kích Thước Watermark</Label>
                  <HelpTooltip content="Kích thước watermark gốc (32, 64, 128...)" />
                </div>
                <span className="text-sm font-mono font-semibold text-primary">
                  {watermarkSize || 64}px
                </span>
              </div>
              <Input
                id="watermark-size"
                type="number"
                min="16"
                max="256"
                step="16"
                {...register('watermarkSize', { valueAsNumber: true })}
                className="w-full"
              />
              {errors.watermarkSize && (
                <p className="text-sm text-red-500">{errors.watermarkSize.message}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Nút Trích Xuất */}
      {watermarkedVideo && originalVideo && !data && (
        <Button 
          type="submit" 
          disabled={isPending} 
          className="w-full h-12 text-base"
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang trích xuất watermark...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Trích Xuất Watermark
            </>
          )}
        </Button>
      )}

      {/* Progress Bar khi đang xử lý */}
      {isPending && (
        <Card className="card-info">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="font-medium">Đang trích xuất watermark từ frame...</p>
            </div>
            <Progress value={50} className="h-2" showLabel={false} />
          </div>
        </Card>
      )}

      {/* Kết quả */}
      {data && (
        <Card className="card-success">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Trích xuất thành công!</h3>
            </div>

            {/* Extracted Watermark */}
            <div className="space-y-3">
              <Label>Watermark Đã Trích Xuất</Label>
              <div className="flex justify-center p-6 bg-muted/50 rounded-lg">
                <img 
                  src={data.extracted_watermark} 
                  alt="Extracted Watermark" 
                  className="max-w-full rounded border border-border"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="metric-display">
                <p className="text-sm opacity-75">Frame</p>
                <p className="text-2xl font-bold">{data.frame_number}</p>
              </div>
              <div className="metric-display">
                <p className="text-sm opacity-75">Kích thước</p>
                <p className="text-2xl font-bold">{data.watermark_size}px</p>
              </div>
            </div>

            {/* Download Button */}
            <Button 
              type="button"
              onClick={() => {
                const link = document.createElement('a');
                link.href = data.extracted_watermark;
                link.download = 'extracted_watermark.png';
                link.click();
              }}
              className="w-full h-12 text-base"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Tải Watermark
            </Button>

            {/* Reset Button */}
            <Button 
              type="button"
              variant="outline"
              onClick={() => {
                handleWatermarkedFileChange(null);
                handleOriginalFileChange(null);
                setCurrentStep(0);
              }}
              className="w-full"
            >
              Trích xuất video khác
            </Button>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!watermarkedVideo && !originalVideo && !isPending && !data && (
        <EmptyState
          icon={Video}
          title="Bắt đầu trích xuất watermark từ video"
          description="Tải lên video đã watermark và video gốc để trích xuất"
        />
      )}
    </form>
  );
}
