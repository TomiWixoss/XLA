/**
 * Watermarking Extract Form - Enhanced UX
 */
'use client';

import { useWatermarkExtractForm } from '@/hooks/use-watermark-extract-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { Stepper } from '@/components/ui/stepper';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { Progress } from '@/components/ui/progress';
import { Loader2, Search } from 'lucide-react';

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

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const watermarkSize = watch('watermarkSize');
  const arnoldIterations = watch('arnoldIterations');

  const steps = [
    { title: 'Ảnh watermarked', description: 'Đã nhúng' },
    { title: 'Ảnh gốc', description: 'So sánh' },
    { title: 'Cấu hình', description: 'Tham số' },
    { title: 'Kết quả', description: 'Watermark' },
  ];

  const getActiveStep = () => {
    if (data) return 3;
    if (watermarkedImage && originalImage) return 2;
    if (watermarkedImage) return 1;
    return 0;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Stepper steps={steps} currentStep={getActiveStep()} />

      {/* Images Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Ảnh Đã Watermark</h3>
            <HelpTooltip content="Ảnh đã được nhúng watermark, có thể đã qua các tấn công như JPEG, noise..." />
          </div>
          <FileUpload
            accept="image/png,image/jpg,image/jpeg"
            onChange={(file) => {
              if (file) {
                const event = { target: { files: [file] } } as any;
                handleWatermarkedImageChange(event);
              }
            }}
            preview={watermarkedPreview}
            label=""
            maxSize={20}
          />
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Ảnh Gốc</h3>
            <HelpTooltip content="Ảnh gốc trước khi nhúng watermark. Cần để so sánh và trích xuất." />
          </div>
          <FileUpload
            accept="image/png,image/jpg,image/jpeg"
            onChange={(file) => {
              if (file) {
                const event = { target: { files: [file] } } as any;
                handleOriginalImageChange(event);
              }
            }}
            preview={originalPreview}
            label=""
            maxSize={20}
          />
        </Card>
      </div>

      {/* Configuration */}
      {watermarkedImage && originalImage && (
        <Card className="p-6 animate-in">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-semibold">Thông Số Trích Xuất</h3>
            <HelpTooltip content="Phải nhập đúng các tham số đã dùng khi nhúng watermark." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Phải giống lúc nhúng (16-128)
              </p>
              {errors.watermarkSize && (
                <p className="text-sm text-destructive mt-1">{errors.watermarkSize.message}</p>
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
                Phải giống lúc nhúng (1-20)
              </p>
              {errors.arnoldIterations && (
                <p className="text-sm text-destructive mt-1">{errors.arnoldIterations.message}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Submit */}
      {watermarkedImage && originalImage && (
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
                Đang trích xuất...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Trích Xuất Watermark
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {data && (
        <Card className="p-6 card-info animate-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Watermark Đã Trích Xuất</h3>
              <p className="text-sm text-muted-foreground">Kích thước: {data.size}x{data.size}</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground text-center">
              Watermark matrix đã được trích xuất thành công
            </p>
          </div>
        </Card>
      )}
    </form>
  );
}
