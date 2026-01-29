/**
 * Steganography Extract Form Component - Pure UI
 */
'use client';

import { useExtractForm } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Upload, Unlock } from 'lucide-react';

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="stego-image">Ảnh Stego</Label>
            <div className="mt-2 flex items-center gap-4">
              <Input
                id="stego-image"
                type="file"
                accept="image/png,image/bmp"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            {stegoPreview && (
              <img src={stegoPreview} alt="Stego" className="mt-4 max-w-xs rounded-lg" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="use-decryption"
              {...register('useDecryption')}
              className="w-4 h-4"
            />
            <Label htmlFor="use-decryption" className="flex items-center gap-2">
              <Unlock className="w-4 h-4" />
              Tin Nhắn Đã Mã Hóa
            </Label>
          </div>

          {useDecryption && (
            <div>
              <Label htmlFor="password">Mật Khẩu Giải Mã</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Nhập mật khẩu giải mã"
                className="mt-2"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
          )}
        </div>
      </Card>

      <Button type="submit" disabled={isPending || !stegoImage} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang trích xuất...
          </>
        ) : (
          'Trích Xuất Tin Nhắn'
        )}
      </Button>

      {data && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-950">
          <h3 className="font-semibold mb-2">Tin Nhắn Đã Trích Xuất</h3>
          <p className="text-sm whitespace-pre-wrap">{data.message}</p>
          <p className="text-xs text-muted-foreground mt-2">Độ dài: {data.length} ký tự</p>
        </Card>
      )}
    </form>
  );
}
