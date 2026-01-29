/**
 * Steganography Extract Form - Enhanced UX
 */
'use client';

import { useExtractForm } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { Stepper } from '@/components/ui/stepper';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { Progress } from '@/components/ui/progress';
import { Loader2, Unlock, Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function ExtractForm() {
  const {
    form,
    stegoImage,
    stegoPreview,
    handleImageChange,
    onSubmit,
    isPending,
    data,
  } = useExtractForm();

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const useDecryption = watch('useDecryption');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const steps = [
    { title: 'Upload ảnh', description: 'Ảnh stego' },
    { title: 'Cấu hình', description: 'Giải mã' },
    { title: 'Kết quả', description: 'Tin nhắn' },
  ];

  const getActiveStep = () => {
    if (data) return 2;
    if (stegoImage) return 1;
    return 0;
  };

  const handleCopy = () => {
    if (data?.message) {
      navigator.clipboard.writeText(data.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Stepper steps={steps} currentStep={getActiveStep()} />

      {/* Step 1: Upload */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">Bước 1: Upload Ảnh Stego</h3>
          <HelpTooltip content="Chọn ảnh đã được nhúng tin nhắn bí mật. Phải là file PNG hoặc BMP gốc, không qua chỉnh sửa." />
        </div>
        
        <FileUpload
          accept="image/png,image/bmp"
          onChange={(file) => {
            if (file) {
              const event = { target: { files: [file] } } as any;
              handleImageChange(event);
            }
          }}
          preview={stegoPreview}
          label="Ảnh Stego"
          maxSize={10}
        />
      </Card>

      {/* Step 2: Decryption */}
      {stegoImage && (
        <Card className="p-6 animate-in">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Bước 2: Cấu Hình Giải Mã</h3>
            <HelpTooltip content="Nếu tin nhắn đã được mã hóa, bạn cần nhập đúng mật khẩu để giải mã." />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="use-decryption"
                {...register('useDecryption')}
                className="w-5 h-5 rounded border-border"
              />
              <div className="flex-1">
                <Label htmlFor="use-decryption" className="flex items-center gap-2 cursor-pointer">
                  <Unlock className="w-4 h-4" />
                  <span className="font-medium">Tin Nhắn Đã Mã Hóa</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Chọn nếu tin nhắn được bảo vệ bằng mật khẩu
                </p>
              </div>
            </div>

            {useDecryption && (
              <div className="animate-in">
                <Label htmlFor="password">Mật Khẩu Giải Mã</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Nhập mật khẩu..."
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
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Submit */}
      {stegoImage && (
        <div className="space-y-4">
          {isPending && <Progress value={50} showLabel />}
          
          <Button 
            type="submit" 
            disabled={isPending || !stegoImage} 
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
                <Unlock className="mr-2 h-5 w-5" />
                Trích Xuất Tin Nhắn
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {data && (
        <Card className="p-6 card-info animate-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Unlock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Tin Nhắn Đã Trích Xuất</h3>
                <p className="text-sm text-muted-foreground">{data.length} ký tự</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? 'Đã copy!' : <><Copy className="w-4 h-4 mr-2" />Copy</>}
            </Button>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
            {data.message}
          </div>
        </Card>
      )}
    </form>
  );
}
