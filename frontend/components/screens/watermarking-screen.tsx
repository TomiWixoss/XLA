/**
 * Watermarking Screen - AWWWARDS PREMIUM
 * Full viewport, no scroll, step-based interaction with epic UX
 */
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Upload, Download, Check, ArrowRight, Settings, Sparkles, Image as ImageIcon, X, Search, RotateCcw } from 'lucide-react';
import { useWatermarkEmbedForm } from '@/hooks/use-watermark-embed-form';
import { useWatermarkExtractForm } from '@/hooks/use-watermark-extract-form';
import { AnimatedCounter, RippleButton, SkewOnHover, MagneticContainer } from '@/components/ui/micro-interactions';

interface Props {
  isActive: boolean;
}

type Mode = 'embed' | 'extract';

export function WatermarkingScreen({ isActive }: Props) {
  const [mode, setMode] = useState<Mode>('embed');
  
  // Embed form
  const embedForm = useWatermarkEmbedForm();
  const {
    form: embedFormState,
    hostImage: embedHostImage,
    hostPreview: embedHostPreview,
    watermarkImage: embedWatermarkImage,
    watermarkPreview: embedWatermarkPreview,
    handleHostImageChange: handleEmbedHostChange,
    handleWatermarkImageChange: handleEmbedWatermarkChange,
    onSubmit: onEmbedSubmit,
    isPending: isEmbedPending,
    data: embedData,
    resetAll: resetEmbedForm,
  } = embedForm;

  // Extract form
  const extractForm = useWatermarkExtractForm();
  const {
    form: extractFormState,
    watermarkedImage: extractWatermarkedImage,
    watermarkedPreview: extractWatermarkedPreview,
    originalImage: extractOriginalImage,
    originalPreview: extractOriginalPreview,
    originalWatermark: extractOriginalWatermark,
    originalWatermarkPreview: extractOriginalWatermarkPreview,
    handleWatermarkedImageChange: handleExtractWatermarkedChange,
    handleOriginalImageChange: handleExtractOriginalChange,
    handleOriginalWatermarkChange: handleExtractOriginalWatermarkChange,
    onSubmit: onExtractSubmit,
    isPending: isExtractPending,
    data: extractData,
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
  const arnoldIterations = embedFormState.watch('arnoldIterations');

  // Calculate step
  const getStep = () => {
    if (result) return 3;
    if (mode === 'embed') {
      if (embedHostImage && embedWatermarkImage) return 2;
      if (embedHostImage) return 1;
    } else {
      if (extractWatermarkedImage && extractOriginalImage) return 2;
      if (extractWatermarkedImage) return 1;
    }
    return 0;
  };

  const step = getStep();

  const steps = [
    { num: 1, label: mode === 'embed' ? 'Ảnh gốc' : 'Ảnh WM' },
    { num: 2, label: mode === 'embed' ? 'Watermark' : 'Ảnh gốc' },
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
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[var(--watermarking)] text-[var(--watermarking)] text-sm font-semibold tracking-wider uppercase mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Feature 02
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            className="heading-xl mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="block">Thủy Vân</span>
            <span className="block text-[var(--watermarking)]">Watermarking</span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            className="text-lg leading-relaxed text-[var(--muted-foreground)] max-w-md mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Bảo vệ bản quyền ảnh với watermark vô hình. Sử dụng 
            <strong className="text-[var(--foreground)]"> DCT-SVD</strong> kết hợp 
            <strong className="text-[var(--foreground)]"> Arnold Cat Map</strong> để tăng bảo mật.
          </motion.p>

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
                <Shield className="w-4 h-4" />
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
              {/* Dual Upload Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Host Image */}
                <SkewOnHover maxSkew={2}>
                  <div className="panel-card group hover:border-[var(--watermarking)] transition-colors">
                    <div className="panel-header">
                      <h3 className="panel-title text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[var(--watermarking)]" />
                        Ảnh gốc
                      </h3>
                      {embedHostImage && (
                        <span className="w-6 h-6 bg-[var(--success)] text-white text-xs flex items-center justify-center font-bold">✓</span>
                      )}
                    </div>
                    <label className={`upload-zone block cursor-pointer min-h-[180px] flex items-center justify-center ${embedHostImage ? 'has-file p-2' : ''}`}>
                      <input
                        type="file"
                        accept="image/png,image/jpg,image/jpeg,image/bmp"
                        onChange={(e) => handleEmbedHostChange(e)}
                        className="hidden"
                      />
                      {embedHostPreview ? (
                        <div className="relative w-full">
                          <img src={embedHostPreview} alt="Host" className="max-h-32 mx-auto object-contain" />
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); embedFormState.reset(); }}
                            className="absolute top-0 right-0 w-6 h-6 bg-[var(--destructive)] text-white flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                          <p className="text-xs text-[var(--muted-foreground)]">Host Image</p>
                        </div>
                      )}
                    </label>
                  </div>
                </SkewOnHover>

                {/* Watermark Image */}
                <SkewOnHover maxSkew={2}>
                  <div className="panel-card group hover:border-[var(--watermarking)] transition-colors">
                    <div className="panel-header">
                      <h3 className="panel-title text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[var(--watermarking)]" />
                        Logo
                      </h3>
                      {embedWatermarkImage && (
                        <span className="w-6 h-6 bg-[var(--success)] text-white text-xs flex items-center justify-center font-bold">✓</span>
                      )}
                    </div>
                    <label className={`upload-zone block cursor-pointer min-h-[180px] flex items-center justify-center ${embedWatermarkImage ? 'has-file p-2' : ''}`}>
                      <input
                        type="file"
                        accept="image/png,image/jpg,image/jpeg,image/bmp"
                        onChange={(e) => handleEmbedWatermarkChange(e)}
                        className="hidden"
                      />
                      {embedWatermarkPreview ? (
                        <div className="relative w-full">
                          <img src={embedWatermarkPreview} alt="Watermark" className="max-h-32 mx-auto object-contain" />
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); }}
                            className="absolute top-0 right-0 w-6 h-6 bg-[var(--destructive)] text-white flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Shield className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                          <p className="text-xs text-[var(--muted-foreground)]">Watermark</p>
                        </div>
                      )}
                    </label>
                  </div>
                </SkewOnHover>
              </div>

              {/* Configuration */}
              <AnimatePresence>
                {embedHostImage && embedWatermarkImage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="panel-card"
                  >
                    <div className="panel-header">
                      <h3 className="panel-title flex items-center gap-2">
                        <Settings className="w-4 h-4 text-[var(--watermarking)]" />
                        Cấu hình
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Alpha */}
                      <div className="field-group mb-0">
                        <div className="field-label">
                          <span>Alpha</span>
                          <span className="text-mono font-bold text-[var(--watermarking)]">{alpha?.toFixed(2) || '0.10'}</span>
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
                          <span>Ẩn</span>
                          <span>Bền</span>
                        </div>
                      </div>

                      {/* Arnold */}
                      <div className="field-group mb-0">
                        <div className="field-label">
                          <span>Arnold</span>
                          <span className="text-mono font-bold text-[var(--watermarking)]">{arnoldIterations || 10}</span>
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
                          <span>Thấp</span>
                          <span>Cao</span>
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
                          <span>Đang xử lý...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span>Nhúng Watermark</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </RippleButton>
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
                        <div className="result-title">Nhúng thành công!</div>
                        <div className="result-subtitle">Watermark đã được bảo vệ</div>
                      </div>
                    </div>

                    <div className="metrics-grid">
                      <div className="metric-box">
                        <div className="metric-value counter">{embedData.watermark_size || 'N/A'}</div>
                        <div className="metric-label">Size</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-value counter">{embedData.blocks_used || 'N/A'}</div>
                        <div className="metric-label">Blocks</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-value text-[var(--success)] counter">
                          <AnimatedCounter value={embedData.psnr || 0} duration={1.2} decimals={1} suffix=" dB" />
                        </div>
                        <div className="metric-label">PSNR</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-value counter">
                          <AnimatedCounter value={embedData.ssim || 1} duration={1.4} decimals={3} />
                        </div>
                        <div className="metric-label">SSIM</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <RippleButton
                        type="button"
                        onClick={() => {
                          if (embedData.watermarked_image) {
                            const link = document.createElement('a');
                            link.href = embedData.watermarked_image;
                            link.download = 'watermarked.png';
                            link.click();
                          }
                        }}
                        className="btn btn-primary"
                      >
                        <Download className="w-5 h-5" />
                        Tải ảnh
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
              {/* Dual Upload Grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Watermarked Image */}
                <SkewOnHover maxSkew={2}>
                  <div className="panel-card">
                    <div className="panel-header">
                      <h3 className="panel-title text-xs">Ảnh đã WM</h3>
                      {extractWatermarkedImage && <span className="w-5 h-5 bg-[var(--success)] text-white text-xs flex items-center justify-center">✓</span>}
                    </div>
                    <label className={`upload-zone block cursor-pointer min-h-[140px] flex items-center justify-center ${extractWatermarkedImage ? 'has-file p-2' : ''}`}>
                      <input type="file" accept="image/*" onChange={(e) => handleExtractWatermarkedChange(e)} className="hidden" />
                      {extractWatermarkedPreview ? (
                        <img src={extractWatermarkedPreview} alt="WM" className="max-h-24 mx-auto object-contain" />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-6 h-6 mx-auto mb-1 text-[var(--muted-foreground)]" />
                          <p className="text-xs">Có WM</p>
                        </div>
                      )}
                    </label>
                  </div>
                </SkewOnHover>

                {/* Original Image */}
                <SkewOnHover maxSkew={2}>
                  <div className="panel-card">
                    <div className="panel-header">
                      <h3 className="panel-title text-xs">Ảnh gốc</h3>
                      {extractOriginalImage && <span className="w-5 h-5 bg-[var(--success)] text-white text-xs flex items-center justify-center">✓</span>}
                    </div>
                    <label className={`upload-zone block cursor-pointer min-h-[140px] flex items-center justify-center ${extractOriginalImage ? 'has-file p-2' : ''}`}>
                      <input type="file" accept="image/*" onChange={(e) => handleExtractOriginalChange(e)} className="hidden" />
                      {extractOriginalPreview ? (
                        <img src={extractOriginalPreview} alt="Original" className="max-h-24 mx-auto object-contain" />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-6 h-6 mx-auto mb-1 text-[var(--muted-foreground)]" />
                          <p className="text-xs">Gốc</p>
                        </div>
                      )}
                    </label>
                  </div>
                </SkewOnHover>

                {/* Original Watermark (Optional) */}
                <SkewOnHover maxSkew={2}>
                  <div className="panel-card border-dashed">
                    <div className="panel-header">
                      <h3 className="panel-title text-xs">WM gốc</h3>
                      {extractOriginalWatermark && <span className="w-5 h-5 bg-[var(--success)] text-white text-xs flex items-center justify-center">✓</span>}
                    </div>
                    <label className={`upload-zone block cursor-pointer min-h-[140px] flex items-center justify-center ${extractOriginalWatermark ? 'has-file p-2' : ''}`}>
                      <input type="file" accept="image/*" onChange={(e) => handleExtractOriginalWatermarkChange(e)} className="hidden" />
                      {extractOriginalWatermarkPreview ? (
                        <img src={extractOriginalWatermarkPreview} alt="WM gốc" className="max-h-24 mx-auto object-contain" />
                      ) : (
                        <div className="text-center">
                          <Shield className="w-6 h-6 mx-auto mb-1 text-[var(--muted-foreground)]" />
                          <p className="text-xs opacity-75">Tùy chọn</p>
                          <p className="text-xs opacity-50">(để tính NC)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </SkewOnHover>
              </div>

              {/* Extract Button */}
              <AnimatePresence>
                {extractWatermarkedImage && extractOriginalImage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="panel-card"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="field-group mb-0">
                        <div className="field-label">
                          <span>Kích thước WM</span>
                          <span className="text-xs opacity-75">(xem khi nhúng)</span>
                        </div>
                        <input
                          type="number"
                          {...extractFormState.register('watermarkSize', { valueAsNumber: true })}
                          placeholder="64"
                          className="field-input"
                        />
                      </div>

                      <div className="field-group mb-0">
                        <div className="field-label">
                          <span>Arnold Iterations</span>
                          <span className="text-xs opacity-75">(phải giống lúc nhúng)</span>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          {...extractFormState.register('arnoldIterations', { valueAsNumber: true })}
                          placeholder="10"
                          className="field-input"
                        />
                      </div>
                    </div>

                    <RippleButton
                      type="submit"
                      disabled={isExtractPending}
                      className="btn btn-primary btn-block mt-4 group"
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
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </RippleButton>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
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
                        <div className="result-subtitle">Watermark đã được khôi phục</div>
                      </div>
                    </div>

                    {extractData.extracted_watermark && (
                      <div className="p-4 border-2 border-[var(--border)] bg-[var(--secondary)]">
                        <img src={extractData.extracted_watermark} alt="Extracted" className="max-h-40 mx-auto" />
                      </div>
                    )}

                    {extractData.nc !== undefined && (
                      <div className="metrics-grid mt-4">
                        <div className="metric-box">
                          <div className="metric-value text-[var(--success)]">{extractData.nc.toFixed(3)}</div>
                          <div className="metric-label">NC</div>
                        </div>
                      </div>
                    )}

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
            <div className="loading-text">Đang xử lý watermark...</div>
            <div className="loading-progress">
              <div className="loading-progress-bar" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
