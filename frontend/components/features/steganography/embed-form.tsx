/**
 * Steganography Embed Form Component - Pure UI
 */
'use client';

import { useEmbedForm } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Upload, Lock } from 'lucide-react';

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="cover-image">Ảnh Gốc</Label>
            <div className="mt-2 flex items-center gap-4">
              <Input
                id="cover-image"
                type="file"
                accept="image/png,image/bmp,image/jpeg"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            {coverPreview && (
              <img src={coverPreview} alt="Cover" className="mt-4 max-w-xs rounded-lg" />
            )}
          </div>

          <div>
            <Label htmlFor="message">Tin Nhắn Bí Mật</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Nhập tin nhắn bí mật của bạn..."
              rows={6}
              className="mt-2"
            />
            {errors.message && (
              <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="use-encryption"
              {...register('useEncryption')}
              className="w-4 h-4"
            />
            <Label htmlFor="use-encryption" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Bật Mã Hóa AES-256
            </Label>
          </div>

          {useEncryption && (
            <div>
              <Label htmlFor="password">Mật Khẩu</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Nhập mật khẩu mã hóa"
                className="mt-2"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
          )}
        </div>
      </Card>

      <Button type="submit" disabled={isPending || !coverImage} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang nhúng...
          </>
        ) : (
          'Nhúng Tin Nhắn'
        )}
      </Button>

      {data && (
        <Card className="p-6 bg-green-50 dark:bg-green-950">
          <h3 className="font-semibold mb-2">Thành công!</h3>
          <div className="space-y-1 text-sm mb-4">
            <p>Độ dài tin nhắn: {data.message_length} ký tự</p>
            <p>PSNR: {data.psnr.toFixed(2)} dB</p>
            <p>SSIM: {data.ssim.toFixed(4)}</p>
          </div>
          <Button 
            type="button"
            onClick={() => {
              if (data.stego_image_blob) {
                const url = URL.createObjectURL(data.stego_image_blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'stego_image.png';
                link.click();
                URL.revokeObjectURL(url);
              }
            }}
            className="w-full"
            disabled={!data.stego_image_blob}
          >
            Tải Ảnh Stego
          </Button>
        </Card>
      )}
    </form>
  );
}
