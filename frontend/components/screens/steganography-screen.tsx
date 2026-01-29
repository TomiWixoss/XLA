/**
 * Steganography Screen - AWWWARDS PREMIUM
 * Full viewport, no scroll, step-based interaction with epic UX
 */
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Upload, Eye, EyeOff, Download, Check, ArrowRight, Sparkles, FileText, X, RotateCcw, Copy, AlertTriangle } from 'lucide-react';
import { useEmbedForm } from '@/hooks';
import { useExtractForm } from '@/hooks/use-extract-form';
import { AnimatedCounter, RippleButton, SkewOnHover, MagneticContainer } from '@/components/ui/micro-interactions';

interface Props {
  isActive: boolean;
}

type Mode = 'embed' | 'extract';

export function SteganographyScreen({ isActive }: Props) {
  const [mode, setMode] = useState<Mode>('embed');
  const [showPassword, setShowPassword] = useState(false);
  
  // Embed form
  const embedForm = useEmbedForm();
  const { 
    form: embedFormState,
    coverImage: embedCoverImage,
    coverPreview: embedCoverPreview,
    handleImageChange: handleEmbedImageChange,
    onSubmit: onEmbedSubmit,
    isPending: isEmbedPending,
    data: embedData,
    error: embedError,
    resetAll: resetEmbedForm,
  } = embedForm;

  // Extract form
  const extractForm = useExtractForm();
  const {
    form: extractFormState,
    stegoImage: extractStegoImage,
    stegoPreview: extractStegoPreview,
    handleImageChange: handleExtractImageChange,
    onSubmit: onExtractSubmit,
    isPending: isExtractPending,
    data: extractData,
    error: extractError,
    resetAll: resetExtractForm,
  } = extractForm;

  // Reset forms when switching mode
  const handleModeChange = useCallback((newMode: Mode) => {
    if (newMode === mode) return;
    setMode(newMode);
    resetEmbedForm();
    resetExtractForm();
  }, [mode, resetEmbedForm, resetExtractForm]);

  // Current form state based on mode
  const currentImage = mode === 'embed' ? embedCoverImage : extractStegoImage;
  const currentPreview = mode === 'embed' ? embedCoverPreview : extractStegoPreview;
  const isPending = mode === 'embed' ? isEmbedPending : isExtractPending;
  const result = mode === 'embed' ? embedData : extractData;

  // Calculate step
  const getStep = () => {
    if (result) return 3;
    if (mode === 'embed') {
      const msg = embedFormState.watch('message');
      if (msg && msg.length > 0) return 2;
      if (embedCoverImage) return 1;
    } else {
      if (extractStegoImage) return 1;
    }
    return 0;
  };

  const step = getStep();

  const embedSteps = [
    { num: 1, label: 'Chọn ảnh' },
    { num: 2, label: 'Nhập tin' },
    { num: 3, label: 'Bảo mật' },
    { num: 4, label: 'Hoàn tất' },
  ];

  const extractSteps = [
    { num: 1, label: 'Chọn ảnh' },
    { num: 2, label: 'Giải mã' },
    { num: 3, label: 'Kết quả' },
  ];

  const steps = mode === 'embed' ? embedSteps : extractSteps;

  return (
    <div className="screen-content">
      {/* Left Panel - Hero Info */}
      <motion.div 
        className="screen-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.3 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          {/* Feature Tag */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[var(--steganography)] text-[var(--steganography)] text-sm font-semibold tracking-wider uppercase mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Feature 01
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            className="heading-xl mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="block">Giấu Tin</span>
            <span className="block text-[var(--steganography)]">Steganography</span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            className="text-lg leading-relaxed text-[var(--muted-foreground)] max-w-md mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Ẩn thông điệp bí mật vào trong ảnh một cách hoàn toàn vô hình. 
            Sử dụng thuật toán <strong className="text-[var(--foreground)]">LSB</strong> kết hợp 
            mã hóa <strong className="text-[var(--foreground)]">AES-256</strong>.
          </motion.p>

          {/* Mode Toggle - Premium Style */}
          <motion.div 
            className="inline-flex border-2 border-[var(--border)] overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button 
              className={`relative px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                mode === 'embed' 
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                  : 'bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
              onClick={() => handleModeChange('embed')}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Nhúng
              </span>
            </button>
            <button 
              className={`relative px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 border-l-2 border-[var(--border)] ${
                mode === 'extract' 
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                  : 'bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
              onClick={() => handleModeChange('extract')}
            >
              <span className="relative z-10 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Trích xuất
              </span>
            </button>
          </motion.div>

          {/* Steps Progress */}
          <motion.div 
            className="mt-10 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {steps.map((s, i) => (
              <div 
                key={s.num}
                className={`flex items-center gap-3 pr-4 ${i < steps.length - 1 ? 'border-r-2 border-[var(--border)]' : ''}`}
              >
                <div className={`
                  w-10 h-10 flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${i < step 
                    ? 'bg-[var(--success)] text-white' 
                    : i === step 
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] scale-110' 
                      : 'border-2 border-[var(--border)] text-[var(--muted-foreground)]'
                  }
                `}>
                  {i < step ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-sm font-medium hidden lg:block ${
                  i <= step ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Interactive Form */}
      <motion.div 
        className="screen-right"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: isActive ? 1 : 0.3, x: isActive ? 0 : 30 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {mode === 'embed' ? (
            <motion.form 
              key="embed"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              onSubmit={embedFormState.handleSubmit(onEmbedSubmit)} 
              className="space-y-5 h-full flex flex-col"
            >
              {/* Upload Card */}
              <SkewOnHover maxSkew={2}>
                <div className="panel-card group hover:border-[var(--steganography)] transition-all">
                <div className="panel-header">
                  <h3 className="panel-title flex items-center gap-2">
                    <div className="w-8 h-8 bg-[var(--steganography)]/10 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-[var(--steganography)]" />
                    </div>
                    Ảnh gốc
                  </h3>
                  {embedCoverImage && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1 bg-[var(--success)] text-white text-xs font-bold"
                    >
                      ✓ Đã chọn
                    </motion.span>
                  )}
                </div>

                <label className={`upload-zone block cursor-pointer group-hover:border-[var(--steganography)] ${embedCoverImage ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    accept="image/png,image/bmp,image/jpeg"
                    onChange={(e) => handleEmbedImageChange(e)}
                    className="hidden"
                  />
                  <AnimatePresence mode="wait">
                    {embedCoverPreview ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative"
                      >
                        <img src={embedCoverPreview} alt="Preview" className="upload-preview mx-auto" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Upload className="w-12 h-12 mx-auto mb-3 text-[var(--muted-foreground)] group-hover:text-[var(--steganography)] transition-colors" />
                        <p className="text-sm text-[var(--muted-foreground)]">
                          <strong className="text-[var(--foreground)] underline">Click để chọn</strong> hoặc kéo thả
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-2">PNG, BMP, JPG • Max 10MB</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </label>
              </div>
              </SkewOnHover>

              {/* Message Input - Animate in when image selected */}
              <AnimatePresence>
                {embedCoverImage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="panel-card"
                  >
                    <div className="panel-header">
                      <h3 className="panel-title flex items-center gap-2">
                        <div className="w-8 h-8 bg-[var(--steganography)]/10 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-[var(--steganography)]" />
                        </div>
                        Tin nhắn bí mật
                      </h3>
                      <span className="text-mono text-sm text-[var(--muted-foreground)]">
                        {embedFormState.watch('message')?.length || 0} ký tự
                      </span>
                    </div>
                    <textarea
                      {...embedFormState.register('message')}
                      placeholder="Nhập nội dung bí mật của bạn tại đây..."
                      className="field-input field-textarea font-medium"
                      rows={4}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Encryption Option */}
              <AnimatePresence>
                {embedFormState.watch('message')?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="panel-card"
                  >
                    <label 
                      className={`checkbox-group cursor-pointer ${embedFormState.watch('useEncryption') ? 'checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        {...embedFormState.register('useEncryption')}
                        className="hidden"
                      />
                      <div className="checkbox-box">
                        {embedFormState.watch('useEncryption') && <Check className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[var(--steganography)]" />
                          Mã hóa AES-256
                        </div>
                        <div className="text-sm text-[var(--muted-foreground)]">Bảo vệ tối đa cho thông tin nhạy cảm</div>
                      </div>
                    </label>

                    {embedFormState.watch('useEncryption') && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        <div className="field-label">
                          <span className="font-semibold">Mật khẩu</span>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            {...embedFormState.register('password')}
                            placeholder="Nhập mật khẩu mạnh..."
                            className="field-input pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <RippleButton
                      type="submit"
                      disabled={isEmbedPending}
                      className="btn btn-primary btn-block mt-6 group btn-split"
                    >
                      {isEmbedPending ? (
                        <div className="flex items-center gap-3">
                          <div className="loading-spinner w-5 h-5" />
                          <span>Đang xử lý...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span>Nhúng Tin Nhắn</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </RippleButton>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Display */}
              <AnimatePresence>
                {embedError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="panel-card border-2 border-[var(--destructive)] bg-[var(--destructive)]/5"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[var(--destructive)] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-[var(--destructive)]">Lỗi nhúng tin</p>
                        <p className="text-sm mt-1">{embedError.message}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              <AnimatePresence>
                {embedData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="result-card mt-auto success-pulse"
                  >
                    <div className="result-header">
                      <div className="result-icon">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="result-title">Nhúng thành công!</div>
                        <div className="result-subtitle">Tin nhắn đã được giấu an toàn trong ảnh</div>
                      </div>
                    </div>

                    <div className="metrics-grid">
                      <div className="metric-box">
                        <div className="metric-value counter">
                          <AnimatedCounter value={embedData.message_length || 0} duration={1} />
                        </div>
                        <div className="metric-label">Ký tự</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-value text-[var(--success)] counter">
                          <AnimatedCounter value={embedData.psnr || 0} duration={1.2} decimals={1} suffix=" dB" />
                        </div>
                        <div className="metric-label">PSNR</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-value counter">
                          <AnimatedCounter value={embedData.ssim || 1} duration={1.4} decimals={4} />
                        </div>
                        <div className="metric-label">SSIM</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <RippleButton
                        type="button"
                        onClick={() => {
                          if (embedData.stego_image) {
                            const link = document.createElement('a');
                            link.href = embedData.stego_image;
                            link.download = 'stego_image.png';
                            link.click();
                          }
                        }}
                        className="btn btn-primary group btn-split"
                      >
                        <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Tải ảnh</span>
                      </RippleButton>
                      <RippleButton
                        type="button"
                        onClick={() => resetEmbedForm()}
                        className="btn btn-outline group"
                      >
                        <RotateCcw className="w-5 h-5 group-hover:rotate-[-180deg] transition-transform duration-500" />
                        <span>Làm lại</span>
                      </RippleButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          ) : (
            /* EXTRACT MODE */
            <motion.form 
              key="extract"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              onSubmit={extractFormState.handleSubmit(onExtractSubmit)} 
              className="space-y-5 h-full flex flex-col"
            >
              {/* Upload Stego Image */}
              <SkewOnHover maxSkew={2}>
                <div className="panel-card group hover:border-[var(--steganography)] transition-all">
                <div className="panel-header">
                  <h3 className="panel-title flex items-center gap-2">
                    <div className="w-8 h-8 bg-[var(--steganography)]/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[var(--steganography)]" />
                    </div>
                    Ảnh Stego
                  </h3>
                  {extractStegoImage && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1 bg-[var(--success)] text-white text-xs font-bold"
                    >
                      ✓ Đã chọn
                    </motion.span>
                  )}
                </div>

                <label className={`upload-zone block cursor-pointer ${extractStegoImage ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    accept="image/png,image/bmp"
                    onChange={(e) => handleExtractImageChange(e)}
                    className="hidden"
                  />
                  <AnimatePresence mode="wait">
                    {extractStegoPreview ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative"
                      >
                        <img src={extractStegoPreview} alt="Stego" className="upload-preview mx-auto" />
                      </motion.div>
                    ) : (
                      <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Upload className="w-12 h-12 mx-auto mb-3 text-[var(--muted-foreground)]" />
                        <p className="text-sm">
                          <strong className="text-[var(--foreground)] underline">Chọn ảnh Stego</strong> để trích xuất tin nhắn
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-2">PNG, BMP (ảnh đã nhúng tin)</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </label>
                </div>
              </SkewOnHover>

              {/* Password if encrypted */}
              <AnimatePresence>
                {extractStegoImage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="panel-card"
                  >
                    <div className="panel-header">
                      <h3 className="panel-title">Giải mã (nếu có)</h3>
                    </div>
                    
                    <div className="field-group">
                      <div className="field-label">
                        <span>Mật khẩu</span>
                        <span className="text-xs text-[var(--muted-foreground)]">Để trống nếu không mã hóa</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...extractFormState.register('password')}
                          placeholder="Nhập mật khẩu..."
                          className="field-input pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <RippleButton
                      type="submit"
                      disabled={isExtractPending}
                      className="btn btn-primary btn-block mt-4 btn-split"
                    >
                      {isExtractPending ? (
                        <div className="flex items-center gap-3">
                          <div className="loading-spinner w-5 h-5" />
                          <span>Đang trích xuất...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5" />
                          <span>Trích Xuất Tin Nhắn</span>
                        </div>
                      )}
                    </RippleButton>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Display */}
              <AnimatePresence>
                {extractError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="panel-card border-2 border-[var(--destructive)] bg-[var(--destructive)]/5"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[var(--destructive)] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-[var(--destructive)]">Lỗi trích xuất</p>
                        <p className="text-sm mt-1">{extractError.message}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Extract Result */}
              <AnimatePresence>
                {extractData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="result-card mt-auto success-pulse"
                  >
                    <div className="result-header">
                      <div className="result-icon">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="result-title">Trích xuất thành công!</div>
                        <div className="result-subtitle">Đã tìm thấy tin nhắn ẩn</div>
                      </div>
                    </div>

                    <div className="p-4 border-2 border-[var(--border)] bg-[var(--secondary)] font-mono text-sm leading-relaxed max-h-40 overflow-auto">
                      {extractData.message || 'Không tìm thấy tin nhắn'}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <RippleButton
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(extractData.message || '');
                        }}
                        className="btn btn-outline group"
                      >
                        <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Copy</span>
                      </RippleButton>
                      <RippleButton
                        type="button"
                        onClick={() => resetExtractForm()}
                        className="btn btn-primary group"
                      >
                        <RotateCcw className="w-5 h-5 group-hover:rotate-[-180deg] transition-transform duration-500" />
                        <span>Làm lại</span>
                      </RippleButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isPending && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loading-overlay"
          >
            <div className="loading-spinner" />
            <div className="loading-text">
              {mode === 'embed' ? 'Đang nhúng tin nhắn...' : 'Đang trích xuất...'}
            </div>
            <div className="loading-progress">
              <div className="loading-progress-bar" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
