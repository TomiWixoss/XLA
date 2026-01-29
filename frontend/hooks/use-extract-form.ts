/**
 * Custom Hook for Extract Form Logic
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extractMessageSchema, type ExtractMessageInput } from '@/lib/validations/steganography.schema';
import { useExtractMessage } from './use-steganography';

export function useExtractForm() {
  const [stegoImage, setStegoImage] = useState<File | null>(null);
  const [stegoPreview, setStegoPreview] = useState<string>('');
  
  const { mutate: extractMessage, isPending, data } = useExtractMessage();
  
  const form = useForm<ExtractMessageInput>({
    resolver: zodResolver(extractMessageSchema),
    defaultValues: {
      useDecryption: false,
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
    
    extractMessage({
      stegoImage,
      useDecryption: formData.useDecryption,
      password: formData.password,
    });
  };

  return {
    form,
    stegoImage,
    stegoPreview,
    handleImageChange,
    onSubmit,
    isPending,
    data,
  };
}
