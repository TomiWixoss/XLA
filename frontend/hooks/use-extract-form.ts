/**
 * Custom Hook for Extract Form Logic
 */
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extractMessageSchema, type ExtractMessageInput } from '@/lib/validations/steganography.schema';
import { useExtractMessage } from './use-steganography';

export function useExtractForm() {
  const [stegoImage, setStegoImage] = useState<File | null>(null);
  const [stegoPreview, setStegoPreview] = useState<string>('');
  
  const { mutate: extractMessage, isPending, data, reset: resetMutation, error } = useExtractMessage();
  
  const form = useForm<ExtractMessageInput>({
    resolver: zodResolver(extractMessageSchema),
    defaultValues: {
      password: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStegoImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setStegoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (formData: ExtractMessageInput) => {
    if (!stegoImage) return;
    
    // Tự động bật decryption nếu có password
    const useDecryption = !!(formData.password && formData.password.trim().length > 0);
    
    extractMessage({
      stegoImage,
      useDecryption,
      password: formData.password,
    });
  };

  // Complete reset - clears form, image, and mutation data
  const resetAll = useCallback(() => {
    form.reset();
    setStegoImage(null);
    setStegoPreview('');
    resetMutation();
  }, [form, resetMutation]);

  return {
    form,
    stegoImage,
    stegoPreview,
    handleImageChange,
    onSubmit,
    isPending,
    data,
    error,
    resetAll,
  };
}

