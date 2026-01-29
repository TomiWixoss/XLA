/**
 * Custom Hook for Embed Form Logic
 */
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { embedMessageSchema, type EmbedMessageInput } from '@/lib/validations/steganography.schema';
import { useEmbedMessage } from './use-steganography';

export function useEmbedForm() {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  
  const { mutate: embedMessage, isPending, data, reset: resetMutation, error } = useEmbedMessage();
  
  const form = useForm<EmbedMessageInput>({
    resolver: zodResolver(embedMessageSchema),
    defaultValues: {
      message: '',
      useEncryption: false,
      password: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (formData: EmbedMessageInput) => {
    if (!coverImage) return;
    
    embedMessage({
      coverImage,
      message: formData.message,
      useEncryption: formData.useEncryption,
      password: formData.password,
    });
  };

  // Complete reset - clears form, image, and mutation data
  const resetAll = useCallback(() => {
    form.reset();
    setCoverImage(null);
    setCoverPreview('');
    resetMutation();
  }, [form, resetMutation]);

  return {
    form,
    coverImage,
    coverPreview,
    handleImageChange,
    onSubmit,
    isPending,
    data,
    error,
    resetAll,
  };
}

