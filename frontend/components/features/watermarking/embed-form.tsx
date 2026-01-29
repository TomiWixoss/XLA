/**
 * Watermarking Embed Form - Enhanced UX
 */
'use client';

import { useWatermarkEmbedForm } from '@/hooks/use-watermark-embed-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { Stepper } from '@/components/ui/stepper';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { Progress } from '@/components/ui/progress';
import { Loader2, Shield, Download } from 'lucide-react';

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

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const alpha = watch('alpha');
  const arnoldIterations = watch('arnoldIterations');

  const steps = [
    { title: 'Ảnh gốc', description: 'Host image' },
    { title: 'Logo', description: 'Watermark' },
    { title: 'Cấu hình', description: 'Tham số' },
    { title: 'Kết quả', description: 'Download' },
  ];

  const getActiveStep = () => {
    if (data) return 3;
    if (hostImage && watermarkImage) return 2;
    if (hostImage) return 1;
    return 0;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Stepper steps={steps} currentStep={getActiveStep()} />

      {/* Images Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Ảnh Gốc</h3>
            <HelpTooltip content="Ảnh cần bảo vệ bản quyền. Watermark sẽ được nhúng vào ảnh này." />
          </div>
          <FileUpload
            accept="image/png,image/jpg,image/jpeg,image/bmp"
            onChange={(file) => {
              if (file) {
                const event = { target: { files: [file] } } as any;
                handleHostImageChange(event);
              }
            }}
            preview={hostPreview}
            label=""
            maxSize={20}
          />
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Logo/Watermark</h3>
            <HelpTooltip content="Logo hoặc dấu hiệu bản quyền của bạn. Nên dùng ảnh đơn giản, tương phản cao." />
          </div>
          <FileUpload
            accept="image/png,image/jpg,image/jpeg,image/bmp"
            onChange={(file) => {
              if (file) {
                const event = { target: { files: [file] } } as any;
                handleWatermarkImageChange(event);
              }
            }}
            preview={watermarkPreview}
            label=""
            maxSize={5}
          />
        </Card>
      </div>

      {/* Configuration */}
      {hostImage && watermarkImage && (
        <Card className="p-6 animate-in">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-semibold">Cấu Hình Nâng Cao</h3>
            <HelpTooltip content="Điều chỉnh độ mạnh và bảo mật của watermark. Alpha cao = bền hơn nhưng rõ hơn." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="alpha">Hệ Số Nhúng (Alpha)</Label>
                <span className="text-sm font-mono text-primary">{alpha}</span>
              </div>
              <Input
                id="alpha"
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                {...register('alpha', { valueAsNumber: true })}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Ẩn hơn</span>
                <span>Bền hơn</span>
              </div>
              {errors.alpha && (
                <p className="text-sm text-destructive mt-1">{errors.alpha.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="arnold">Xáo Trộn Arnold</Label>
                <span className="text-sm font-mono text-primary">{arnoldIterations}</span>
              </div>
              <Input
                id="arnold"
                type="range"
                min="1"
                max="20"
                step="1"
                {...register('arnoldIterations', { valueAsNumber: true })}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Ít bảo mật</span>
                <span>Bảo mật cao</span>
              </div>
              {errors.arnoldIterations && (
                <p className="text-sm text-destructive mt-1">{errors.arnoldIterations.message}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Submit */}
      {hostImage && watermarkImage && (
        <div className="space-y-4">
          {isPending && <Progress value={50} showLabel />}
          
          <Button 
            type="submit" 
            disabled={isPending} 
            className="w-full h-12 text-base"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang nhúng watermark...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Nhúng Watermark
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {data && (
        <Card className="p-6 card-success animate-in">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Nhúng Thành Công!</h3>
              <p className="text-sm text-muted-foreground">Watermark đã được bảo vệ</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="metric-display">
              <span className="metric-label">Kích thước</span>
              <span className="metric-value text-lg">{data.watermark_size}</span>
            </div>
            <div className="metric-display">
              <span className="metric-label">Blocks</span>
              <span className="metric-value text-lg">{data.blocks_used}</span>
            </div>
            <div className="metric-display">
              <span className="metric-label">PSNR</span>
              <span className="metric-value text-lg">{data.psnr.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">dB</span>
            </div>
            <div className="metric-display">
              <span className="metric-label">SSIM</span>
              <span className="metric-value text-lg">{data.ssim.toFixed(4)}</span>
            </div>
          </div>

          <Button 
            type="button"
            onClick={() => {
              const link = document.createElement('a');
              link.href = data.watermarked_image;
              link.download = 'watermarked_image.png';
              link.click();
            }}
            className="w-full h-12"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Tải Ảnh Đã Watermark
          </Button>
        </Card>
      )}
    </form>
  );
}
