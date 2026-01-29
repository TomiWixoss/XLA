/**
 * Steganography Screen - AWWWARDS Style
 * Full viewport, no scroll, step-based interaction
 */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Upload, Eye, EyeOff, Download, Check, ArrowRight } from 'lucide-react';
import { useEmbedForm } from '@/hooks';

interface Props {
  isActive: boolean;
}

export function SteganographyScreen({ isActive }: Props) {
  const [mode, setMode] = useState<'embed' | 'extract'>('embed');
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    form,
    coverImage,
    coverPreview,
    handleImageChange,
    onSubmit,
    isPending,
    data,
  } = useEmbedForm();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const useEncryption = watch('useEncryption');
  const message = watch('message');

  // Auto-advance steps
  useEffect(() => {
    if (data) setStep(3);
    else if (message && message.length > 0) setStep(2);
    else if (coverImage) setStep(1);
    else setStep(0);
  }, [coverImage, message, data]);

  const steps = [
    { num: 1, label: 'Ảnh gốc' },
    { num: 2, label: 'Tin nhắn' },
    { num: 3, label: 'Bảo mật' },
    { num: 4, label: 'Kết quả' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e);
  };

  return (
    <div className="screen-content">
      {/* Left Panel - Info */}
      <div className="screen-left">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: isActive ? 1 : 0.5, x: isActive ? 0 : -20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="feature-number">01 / 03</div>
          <h1 className="heading-lg feature-title">
            Giấu Tin<br />
            <span className="text-[var(--steganography)]">Steganography</span>
          </h1>
          <p className="feature-desc">
            Ẩn thông điệp văn bản bí mật vào trong ảnh sử dụng thuật toán LSB 
            (Least Significant Bit). Hỗ trợ mã hóa AES-256 cho bảo mật tối đa.
          </p>

          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button 
              className={`mode-btn ${mode === 'embed' ? 'active' : ''}`}
              onClick={() => setMode('embed')}
            >
              Nhúng
            </button>
            <button 
              className={`mode-btn ${mode === 'extract' ? 'active' : ''}`}
              onClick={() => setMode('extract')}
            >
              Trích xuất
            </button>
          </div>

          {/* Steps Indicator */}
          <div className="steps-inline">
            {steps.map((s, i) => (
              <div 
                key={s.num} 
                className={`step-item ${i < step ? 'completed' : ''} ${i === step ? 'active' : ''}`}
              >
                <div className="step-number">
                  {i < step ? <Check className="w-3 h-3" /> : s.num}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="screen-right">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: isActive ? 1 : 0.5, x: isActive ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Upload Image */}
            <div className="panel-card">
              <div className="panel-header">
                <h3 className="panel-title flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Chọn ảnh gốc
                </h3>
                {coverImage && (
                  <span className="panel-badge bg-[var(--success)] text-white">Đã chọn</span>
                )}
              </div>

              <label className={`upload-zone block ${coverImage ? 'has-file' : ''}`}>
                <input
                  type="file"
                  accept="image/png,image/bmp,image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {coverPreview ? (
                  <img src={coverPreview} alt="Preview" className="upload-preview mx-auto" />
                ) : (
                  <>
                    <Upload className="upload-icon mx-auto" />
                    <p className="upload-text">
                      <strong>Click để chọn</strong> hoặc kéo thả ảnh
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">PNG, BMP, JPG (Max 10MB)</p>
                  </>
                )}
              </label>
            </div>

            {/* Step 2: Enter Message - Show when image selected */}
            <AnimatePresence>
              {coverImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="panel-card"
                >
                  <div className="panel-header">
                    <h3 className="panel-title flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Tin nhắn bí mật
                    </h3>
                    <span className="text-mono text-sm text-[var(--muted-foreground)]">
                      {message?.length || 0} ký tự
                    </span>
                  </div>

                  <div className="field-group">
                    <textarea
                      {...register('message')}
                      placeholder="Nhập tin nhắn bí mật của bạn..."
                      className="field-input field-textarea"
                    />
                    {errors.message && (
                      <p className="text-sm text-[var(--destructive)] mt-1">{errors.message.message}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Encryption - Show when message entered */}
            <AnimatePresence>
              {message && message.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="panel-card"
                >
                  <div className="panel-header">
                    <h3 className="panel-title">Tùy chọn bảo mật</h3>
                  </div>

                  <label 
                    className={`checkbox-group ${useEncryption ? 'checked' : ''}`}
                    onClick={() => setValue('useEncryption', !useEncryption)}
                  >
                    <div className="checkbox-box">
                      {useEncryption && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <div className="font-medium">Mã hóa AES-256</div>
                      <div className="text-sm text-[var(--muted-foreground)]">Khuyến nghị cho thông tin nhạy cảm</div>
                    </div>
                  </label>

                  {useEncryption && (
                    <div className="field-group mt-4">
                      <div className="field-label">
                        <span>Mật khẩu</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...register('password')}
                          placeholder="Nhập mật khẩu mạnh..."
                          className="field-input pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-[var(--destructive)] mt-1">{errors.password.message}</p>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isPending || !coverImage}
                    className="btn btn-primary btn-block mt-4"
                  >
                    {isPending ? (
                      <>
                        <div className="loading-spinner w-4 h-4" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        Nhúng tin nhắn
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 4: Result */}
            <AnimatePresence>
              {data && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="result-card"
                >
                  <div className="result-header">
                    <div className="result-icon">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="result-title">Nhúng thành công!</div>
                      <div className="result-subtitle">Tin nhắn đã được giấu an toàn</div>
                    </div>
                  </div>

                  <div className="metrics-grid">
                    <div className="metric-box">
                      <div className="metric-value">{data.message_length}</div>
                      <div className="metric-label">Ký tự</div>
                    </div>
                    <div className="metric-box">
                      <div className="metric-value">{data.psnr?.toFixed(1) || 'N/A'}</div>
                      <div className="metric-label">PSNR (dB)</div>
                    </div>
                    <div className="metric-box">
                      <div className="metric-value">{data.ssim?.toFixed(3) || 'N/A'}</div>
                      <div className="metric-label">SSIM</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (data.stego_image) {
                        const link = document.createElement('a');
                        link.href = data.stego_image;
                        link.download = 'stego_image.png';
                        link.click();
                      }
                    }}
                    className="btn btn-primary btn-block"
                  >
                    <Download className="w-4 h-4" />
                    Tải ảnh Stego
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>

      {/* Loading Overlay */}
      {isPending && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <div className="loading-text">Đang nhúng tin nhắn vào ảnh...</div>
          <div className="loading-progress">
            <div className="loading-progress-bar" />
          </div>
        </div>
      )}
    </div>
  );
}
