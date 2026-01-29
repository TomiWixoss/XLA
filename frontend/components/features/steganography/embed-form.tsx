/**
 * Steganography Embed Form - Enhanced UX
 */
'use client';

import { useEmbedForm } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { Stepper } from '@/components/ui/stepper';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { Progress } from '@/components/ui/progress';
import { Loader2, Lock, Download, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function EmbedForm() {
  const {
    form,
    coverImage,
    coverPreview,
    handleImageChange,
    onSubmit,
    isPending,
    data,
  } = useEmbedForm();

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const useEncryption = watch('useEncryption');
  const message = watch('message');
  
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-advance steps
  const steps = [
    { title: 'Chọn ảnh', description: 'Upload ảnh gốc' },
    { title: 'Nhập tin nhắn', description: 'Nội dung bí mật' },
    { title: 'Cấu hình', description: 'Tùy chọn mã hóa' },
    { title: 'Hoàn tất', description: 'Tải kết quả' },
  ];

  // Update step based on form state
  const getActiveStep = () => {
    if (data) return 3;
    if (useEncryption !== undefined && message) return 2;
    if (message) return 1;
    if (coverImage) return 1;
    return 0;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Stepper */}
      <Stepper steps={steps} currentStep={getActiveStep()} />

      {/* Step 1: Upload Image */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">Bước 1: Chọn Ảnh Gốc</h3>
          <HelpTooltip content="Chọn ảnh PNG hoặc BMP để đảm bảo chất lượng tốt nhất. Ảnh JPEG có thể mất dữ liệu do nén." />
        </div>
        
        <FileUpload
          accept="image/png,image/bmp,image/jpeg"
          onChange={(file) => {
            if (file) {
              const event = {
                target: { files: [file] }
              } as any;
              handleImageChange(event);
            }
          }}
          preview={coverPreview}
          label="Ảnh Gốc (Cover Image)"
          maxSize={10}
        />
      </Card>

      {/* Step 2: Enter Message */}
      {coverImage && (
        <Card className="p-6 animate-in">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Bước 2: Nhập Tin Nhắn Bí Mật</h3>
            <HelpTooltip content="Tin nhắn sẽ được giấu trong các bit ít quan trọng nhất (LSB) của ảnh. Độ dài tối đa phụ thuộc vào kích thước ảnh." />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="message">Nội dung tin nhắn</Label>
                <span className="text-xs text-muted-foreground">
                  {message?.length || 0} ký tự
                </span>
              </div>
              <Textarea
                id="message"
                {...register('message')}
                placeholder="Nhập tin nhắn bí mật của bạn..."
                rows={6}
                className="resize-none"
              />
              {errors.message && (
                <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setValue('message', '')}
              >
                Xóa
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = form.getValues('message');
                  navigator.clipboard.writeText(text);
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Encryption Options */}
      {message && (
        <Card className="p-6 animate-in">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Bước 3: Cấu Hình Bảo Mật</h3>
            <HelpTooltip content="Mã hóa AES-256 giúp bảo vệ tin nhắn ngay cả khi ai đó phát hiện ra có dữ liệu ẩn trong ảnh." />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="use-encryption"
                {...register('useEncryption')}
                className="w-5 h-5 rounded border-border"
              />
              <div className="flex-1">
                <Label htmlFor="use-encryption" className="flex items-center gap-2 cursor-pointer">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">Bật Mã Hóa AES-256</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Khuyến nghị cho thông tin nhạy cảm
                </p>
              </div>
            </div>

            {useEncryption && (
              <div className="animate-in">
                <Label htmlFor="password">Mật Khẩu Mã Hóa</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Nhập mật khẩu mạnh..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Ghi nhớ mật khẩu này để trích xuất tin nhắn sau
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Submit Button */}
      {message && (
        <div className="space-y-4">
          {isPending && (
            <Progress value={50} showLabel />
          )}
          
          <Button 
            type="submit" 
            disabled={isPending || !coverImage} 
            className="w-full h-12 text-base"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang nhúng tin nhắn...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Nhúng Tin Nhắn Vào Ảnh
              </>
            )}
          </Button>
        </div>
      )}

      {/* Step 4: Results */}
      {data && (
        <Card className="p-6 card-success animate-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Nhúng Thành Công!</h3>
              <p className="text-sm text-muted-foreground">Tin nhắn đã được giấu an toàn trong ảnh</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="metric-display">
              <span className="metric-label">Độ dài</span>
              <span className="metric-value text-lg">{data.message_length}</span>
              <span className="text-xs text-muted-foreground">ký tự</span>
            </div>
            <div className="metric-display">
              <span className="metric-label">PSNR</span>
              <span className="metric-value text-lg">{data.psnr.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">dB</span>
            </div>
            <div className="metric-display">
              <span className="metric-label">SSIM</span>
              <span className="metric-value text-lg">{data.ssim.toFixed(4)}</span>
              <span className="text-xs text-muted-foreground">similarity</span>
            </div>
          </div>

          <Button 
            type="button"
            onClick={() => {
              if (data.stego_image) {
                const link = document.createElement('a');
                link.href = data.stego_image;
                link.download = 'stego_image.png';
                link.click();
              }
            }}
            className="w-full h-12"
            size="lg"
            disabled={!data.stego_image}
          >
            <Download className="mr-2 h-5 w-5" />
            Tải Ảnh Stego
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            ⚠️ Lưu ảnh ở định dạng PNG để tránh mất dữ liệu
          </p>
        </Card>
      )}
    </form>
  );
}
