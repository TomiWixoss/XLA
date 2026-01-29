/**
 * Video Screen - AWWWARDS PREMIUM
 * Full viewport, no scroll, step-based interaction with epic UX
 */
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Download, Check, ArrowRight, Settings, Sparkles, Image as ImageIcon, Search, AlertTriangle, Play, RotateCcw } from 'lucide-react';
import { useVideoEmbedForm } from '@/hooks/use-video-embed-form';
import { useVideoExtractForm } from '@/hooks/use-video-extract-form';
import { AnimatedCounter, RippleButton, SkewOnHover } from '@/components/ui/micro-interactions';

interface Props {
  isActive: boolean;
}

type Mode = 'embed' | 'extract';

export function VideoScreen({ isActive }: Props) {
  const [mode, setMode] = useState<Mode>('embed');
  
  // Embed form
  const embedForm = useVideoEmbedForm();
  const {
    form: embedFormState,
    videoFile: embedVideoFile,
    videoPreview: embedVideoPreview,
    watermarkImage: embedWatermarkImage,
    watermarkPreview: embedWatermarkPreview,
    handleVideoChange: handleEmbedVideoChange,
    handleWatermarkChange: handleEmbedWatermarkChange,
    onSubmit: onEmbedSubmit,
    isPending: isEmbedPending,
    data: embedData,
    error: embedError,
    resetAll: resetEmbedForm,
  } = embedForm;

  // Extract form
  const extractForm = useVideoExtractForm();
  const {
    form: extractFormState,
    watermarkedVideo: extractWatermarkedVideo,
    watermarkedPreview: extractWatermarkedPreview,
    originalVideo: extractOriginalVideo,
    originalPreview: extractOriginalPreview,
    handleWatermarkedChange: handleExtractWatermarkedChange,
    handleOriginalChange: handleExtractOriginalChange,
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

  const isPending = mode === 'embed' ? isEmbedPending : isExtractPending;
  const result = mode === 'embed' ? embedData : extractData;

  const alpha = embedFormState.watch('alpha');
  const frameSkip = embedFormState.watch('frameSkip');
  const arnoldIterations = embedFormState.watch('arnoldIterations');

  // Calculate step
  const getStep = () => {
    if (result) return 3;
    if (embedVideoFile && embedWatermarkImage) return 2;
    if (embedVideoFile) return 1;
    return 0;
  };

  const step = getStep();

  const steps = [
    { num: 1, label: 'Video' },
    { num: 2, label: 'Logo' },
    { num: 3, label: 'Cấu hình' },
    { num: 4, label: 'Kết quả' },
  ];

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
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[var(--video)] text-[var(--video)] text-sm font-semibold tracking-wider uppercase mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Feature 03
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            className="heading-xl mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="block">Video</span>
            <span className="block text-[var(--video)]">Watermarking</span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            className="text-lg leading-relaxed text-[var(--muted-foreground)] max-w-md mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Bảo vệ bản quyền video bằng cách nhúng watermark vào từng frame.
            Hỗ trợ <strong className="text-[var(--foreground)]">MP4</strong> và 
            <strong className="text-[var(--foreground)]"> AVI</strong>.
          </motion.p>

          {/* Warning Notice */}
          <motion.div 
            className="flex items-start gap-3 p-4 border-2 border-[var(--warning)] bg-[var(--warning)]/5 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <AlertTriangle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Lưu ý quan trọng</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Xử lý video có thể mất vài phút. Khuyến nghị video &lt;30 giây để demo nhanh.
              </p>
            </div>
          </motion.div>

          {/* Mode Toggle */}
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
              <span className="flex items-center gap-2">
                <Film className="w-4 h-4" />
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
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Trích xuất
              </span>
            </button>
          </motion.div>

          {/* Steps Progress */}
          <motion.div 
            className="mt-8 flex items-center gap-3"
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
              {/* Dual Upload Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Video Upload */}
                <SkewOnHover maxSkew={2}>
                  <div className="panel-card group hover:border-[var(--video)] transition-colors">
                    <div className="panel-header">
                      <h3 className="panel-title text-sm flex items-center gap-2">
                        <Film className="w-4 h-4 text-[var(--video)]" />
                        Video
                      </h3>
                      {embedVideoFile && (
                        <span className="w-6 h-6 bg-[var(--success)] text-white text-xs flex items-center justify-center font-bold">✓</span>
                      )}
                    </div>
                    <label className={`upload-zone block cursor-pointer min-h-[180px] flex items-center justify-center ${embedVideoFile ? 'has-file p-2' : ''}`}>
                      <input
                        type="file"
                        accept="video/mp4,video/avi"
                        onChange={(e) => handleEmbedVideoChange(e)}
                        className="hidden"
                      />
                      {embedVideoPreview ? (
                        <div className="relative w-full">
                          <video 
                            src={embedVideoPreview} 
                            className="max-h-32 mx-auto object-contain"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center">
                              <Play className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Film className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)] group-hover:text-[var(--video)] transition-colors" />
                          <p className="text-xs text-[var(--muted-foreground)]">MP4, AVI</p>
                          <p className="text-xs text-[var(--muted-foreground)]">Max 100MB</p>
                        </div>
                      )}
                    </label>
                    {embedVideoFile && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-2 truncate text-center">
                        {embedVideoFile.name}
                      </p>
                    )}
                  </div>
                </SkewOnHover>

                {/* Watermark Upload */}
                <SkewOnHover maxSkew={2}>
                  <div className="panel-card group hover:border-[var(--video)] transition-colors">
                    <div className="panel-header">
                      <h3 className="panel-title text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[var(--video)]" />
                        Logo
                      </h3>
                      {embedWatermarkImage && (
                        <span className="w-6 h-6 bg-[var(--success)] text-white text-xs flex items-center justify-center font-bold">✓</span>
                      )}
                    </div>
                    <label className={`upload-zone block cursor-pointer min-h-[180px] flex items-center justify-center ${embedWatermarkImage ? 'has-file p-2' : ''}`}>
                      <input
                        type="file"
                        accept="image/png,image/jpg,image/jpeg"
                        onChange={(e) => handleEmbedWatermarkChange(e)}
                        className="hidden"
                      />
                      {embedWatermarkPreview ? (
                        <div className="relative w-full">
                          <img src={embedWatermarkPreview} alt="Watermark" className="max-h-32 mx-auto object-contain" />
                        </div>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)] group-hover:text-[var(--video)] transition-colors" />
                          <p className="text-xs text-[var(--muted-foreground)]">PNG, JPG</p>
                          <p className="text-xs text-[var(--muted-foreground)]">Max 5MB</p>
                        </div>
                      )}
                    </label>
                    {embedWatermarkImage && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-2 truncate text-center">
                        {embedWatermarkImage.name}
                      </p>
                    )}
                  </div>
                </SkewOnHover>
              </div>

              {/* Configuration */}
              <AnimatePresence>
                {embedVideoFile && embedWatermarkImage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="panel-card"
                  >
                    <div className="panel-header">
                      <h3 className="panel-title flex items-center gap-2">
                        <Settings className="w-4 h-4 text-[var(--video)]" />
                        Cấu hình
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      {/* Alpha */}
                      <div className="field-group mb-0">
                        <div className="field-label">
                          <span>Alpha</span>
                          <span className="text-mono font-bold text-[var(--video)]">{alpha?.toFixed(2) || '0.10'}</span>
                        </div>
                        <input
                          type="range"
                          min="0.01"
                          max="0.5"
                          step="0.01"
                          {...embedFormState.register('alpha', { valueAsNumber: true })}
                          className="field-range w-full"
                        />
                        <div className="range-labels">
                          <span>Yếu</span>
                          <span>Mạnh</span>
                        </div>
                      </div>

                      {/* Frame Skip */}
                      <div className="field-group mb-0">
                        <div className="field-label">
                          <span>Frame</span>
                          <span className="text-mono font-bold text-[var(--video)]">Mỗi {frameSkip || 5}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          {...embedFormState.register('frameSkip', { valueAsNumber: true })}
                          className="field-range w-full"
                        />
                        <div className="range-labels">
                          <span>Tất cả</span>
                          <span>Nhanh</span>
                        </div>
                      </div>

                      {/* Arnold Iterations */}
                      <div className="field-group mb-0">
                        <div className="field-label">
                          <span>Arnold</span>
                          <span className="text-mono font-bold text-[var(--video)]">{arnoldIterations || 10}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="1"
                          {...embedFormState.register('arnoldIterations', { valueAsNumber: true })}
                          className="field-range w-full"
                        />
                        <div className="range-labels">
                          <span>1</span>
                          <span>20</span>
                        </div>
                      </div>
                    </div>

                    <RippleButton
                      type="submit"
                      disabled={isEmbedPending}
                      className="btn btn-primary btn-block mt-6 group"
                    >
                      {isEmbedPending ? (
                        <div className="flex items-center gap-3">
                          <div className="loading-spinner w-5 h-5" />
                          <span>Đang xử lý video...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span>Nhúng Watermark</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </RippleButton>

                    {/* Error Display */}
                    {embedError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-4 border-2 border-[var(--destructive)] bg-[var(--destructive)]/5 mt-4"
                      >
                        <AlertTriangle className="w-5 h-5 text-[var(--destructive)] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-sm text-[var(--destructive)]">Lỗi</p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-1">
                            {embedError instanceof Error ? embedError.message : 'Đã xảy ra lỗi khi nhúng watermark'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              <AnimatePresence>
                {embedData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="result-card mt-auto"
                  >
                    <div className="result-header">
                      <div className="result-icon">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="result-title">Xử lý thành công!</div>
                        <div className="result-subtitle">Video đã được watermark</div>
                      </div>
                    </div>

                    <div className="metrics-grid">
                      <div className="metric-box">
                        <div className="metric-value counter">
                          <AnimatedCounter value={embedData.total_frames || 0} duration={1} />
                        </div>
                        <div className="metric-label">Frames</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-value text-[var(--success)] counter">
                          <AnimatedCounter value={embedData.watermarked_frames || 0} duration={1.2} />
                        </div>
                        <div className="metric-label">Đã WM</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-value counter">
                          <AnimatedCounter value={embedData.fps || 0} duration={1} decimals={1} />
                        </div>
                        <div className="metric-label">FPS</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-value">{embedData.resolution || 'N/A'}</div>
                        <div className="metric-label">Res</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <RippleButton
                        type="button"
                        onClick={() => {
                          if (embedData.watermarked_video) {
                            const link = document.createElement('a');
                            link.href = embedData.watermarked_video;
                            link.download = 'watermarked_video.mp4';
                            link.click();
                          }
                        }}
                        className="btn btn-primary"
                      >
                        <Download className="w-5 h-5" />
                        Tải video
                      </RippleButton>
                      <RippleButton
                        type="button"
                        onClick={() => resetEmbedForm()}
                        className="btn btn-outline group"
                      >
                        <RotateCcw className="w-5 h-5 group-hover:rotate-[-180deg] transition-transform duration-500" />
                        Làm lại
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
              {/* Dual Video Upload Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Watermarked Video */}
                <SkewOnHover maxSkew={2}>
                  <div className="panel-card group hover:border-[var(--video)] transition-colors">
                    <div className="panel-header">
                      <h3 className="panel-title text-sm flex items-center gap-2">
                        <Film className="w-4 h-4 text-[var(--video)]" />
                        Video đã WM
                      </h3>
                      {extractWatermarkedVideo && (
                        <span className="w-6 h-6 bg-[var(--success)] text-white text-xs flex items-center justify-center font-bold">✓</span>
                      )}
                    </div>
                    <label className={`upload-zone block cursor-pointer min-h-[150px] flex items-center justify-center ${extractWatermarkedVideo ? 'has-file p-2' : ''}`}>
                      <input
                        type="file"
                        accept="video/mp4,video/avi"
                        onChange={(e) => handleExtractWatermarkedChange(e)}
                        className="hidden"
                      />
                      {extractWatermarkedPreview ? (
                        <div className="relative w-full">
                          <video 
                            src={extractWatermarkedPreview} 
                            className="max-h-24 mx-auto object-contain"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center">
                              <Play className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Film className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)] group-hover:text-[var(--video)] transition-colors" />
                          <p className="text-xs text-[var(--muted-foreground)]">Video có watermark</p>
                        </div>
                      )}
                    </label>
                  </div>
                </SkewOnHover>

                {/* Original Video */}
                <SkewOnHover maxSkew={2}>
                  <div className="panel-card group hover:border-[var(--video)] transition-colors">
                    <div className="panel-header">
                      <h3 className="panel-title text-sm flex items-center gap-2">
                        <Film className="w-4 h-4 text-[var(--video)]" />
                        Video gốc
                      </h3>
                      {extractOriginalVideo && (
                        <span className="w-6 h-6 bg-[var(--success)] text-white text-xs flex items-center justify-center font-bold">✓</span>
                      )}
                    </div>
                    <label className={`upload-zone block cursor-pointer min-h-[150px] flex items-center justify-center ${extractOriginalVideo ? 'has-file p-2' : ''}`}>
                      <input
                        type="file"
                        accept="video/mp4,video/avi"
                        onChange={(e) => handleExtractOriginalChange(e)}
                        className="hidden"
                      />
                      {extractOriginalPreview ? (
                        <div className="relative w-full">
                          <video 
                            src={extractOriginalPreview} 
                            className="max-h-24 mx-auto object-contain"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center">
                              <Play className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Film className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)] group-hover:text-[var(--video)] transition-colors" />
                          <p className="text-xs text-[var(--muted-foreground)]">Video gốc (chưa WM)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </SkewOnHover>
              </div>

              {/* Configuration */}
              <AnimatePresence>
                {extractWatermarkedVideo && extractOriginalVideo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="panel-card"
                  >
                    <div className="panel-header">
                      <h3 className="panel-title flex items-center gap-2">
                        <Settings className="w-4 h-4 text-[var(--video)]" />
                        Cấu hình trích xuất
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Frame Number */}
                      <div className="field-group mb-0">
                        <div className="field-label">
                          <span>Frame số</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          {...extractFormState.register('frameNumber', { valueAsNumber: true })}
                          className="field-input"
                        />
                      </div>

                      {/* Watermark Size */}
                      <div className="field-group mb-0">
                        <div className="field-label">
                          <span>Size WM</span>
                        </div>
                        <input
                          type="number"
                          min="32"
                          max="256"
                          {...extractFormState.register('watermarkSize', { valueAsNumber: true })}
                          className="field-input"
                        />
                      </div>

                      {/* Arnold Iterations */}
                      <div className="field-group mb-0">
                        <div className="field-label">
                          <span>Arnold</span>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          {...extractFormState.register('arnoldIterations', { valueAsNumber: true })}
                          className="field-input"
                        />
                      </div>
                    </div>

                    <RippleButton
                      type="submit"
                      disabled={isExtractPending}
                      className="btn btn-primary btn-block mt-6 group"
                    >
                      {isExtractPending ? (
                        <div className="flex items-center gap-3">
                          <div className="loading-spinner w-5 h-5" />
                          <span>Đang trích xuất...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Search className="w-5 h-5" />
                          <span>Trích Xuất Watermark</span>
                        </div>
                      )}
                    </RippleButton>

                    {/* Error Display */}
                    {extractError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-4 border-2 border-[var(--destructive)] bg-[var(--destructive)]/5 mt-4"
                      >
                        <AlertTriangle className="w-5 h-5 text-[var(--destructive)] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-sm text-[var(--destructive)]">Lỗi</p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-1">
                            {extractError instanceof Error ? extractError.message : 'Đã xảy ra lỗi khi trích xuất watermark'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Extract Result */}
              <AnimatePresence>
                {extractData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="result-card mt-auto"
                  >
                    <div className="result-header">
                      <div className="result-icon">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="result-title">Trích xuất thành công!</div>
                        <div className="result-subtitle">Đã tìm thấy watermark</div>
                      </div>
                    </div>

                    <div className="p-4 border-2 border-[var(--border)] bg-[var(--secondary)]">
                      {extractData.extracted_watermark && (
                        <img 
                          src={extractData.extracted_watermark} 
                          alt="Extracted Watermark" 
                          className="max-h-32 mx-auto object-contain"
                        />
                      )}
                    </div>

                    <div className="metrics-grid mt-4">
                      <div className="metric-box">
                        <div className="metric-value counter">
                          <AnimatedCounter value={extractData.frame_number || 0} duration={1} />
                        </div>
                        <div className="metric-label">Frame</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-value counter">
                          <AnimatedCounter value={extractData.watermark_size || 0} duration={1} />
                        </div>
                        <div className="metric-label">Size</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <RippleButton
                        type="button"
                        onClick={() => {
                          if (extractData.extracted_watermark) {
                            const link = document.createElement('a');
                            link.href = extractData.extracted_watermark;
                            link.download = 'extracted_watermark.png';
                            link.click();
                          }
                        }}
                        className="btn btn-primary"
                      >
                        <Download className="w-5 h-5" />
                        Tải WM
                      </RippleButton>
                      <RippleButton
                        type="button"
                        onClick={() => resetExtractForm()}
                        className="btn btn-outline group"
                      >
                        <RotateCcw className="w-5 h-5 group-hover:rotate-[-180deg] transition-transform duration-500" />
                        Làm lại
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
            <div className="loading-text">Đang xử lý video... (có thể mất vài phút)</div>
            <div className="loading-progress">
              <div className="loading-progress-bar" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
