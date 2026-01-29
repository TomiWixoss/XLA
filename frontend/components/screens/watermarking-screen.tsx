/**
 * Watermarking Screen - AWWWARDS Style
 * Full viewport, no scroll, step-based interaction
 */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Upload, Download, Check, ArrowRight, Settings } from 'lucide-react';
import { useWatermarkEmbedForm } from '@/hooks/use-watermark-embed-form';

interface Props {
  isActive: boolean;
}

export function WatermarkingScreen({ isActive }: Props) {
  const [mode, setMode] = useState<'embed' | 'extract'>('embed');
  const [step, setStep] = useState(0);
  
  const {
    form,
    hostImage,
    hostPreview,
    watermarkImage,
    watermarkPreview,
    handleHostImageChange,
    handleWatermarkImageChange,
    onSubmit,
    isPending,
    data,
  } = useWatermarkEmbedForm();

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const alpha = watch('alpha');
  const arnoldIterations = watch('arnoldIterations');

  // Auto-advance steps
  useEffect(() => {
    if (data) setStep(3);
    else if (hostImage && watermarkImage) setStep(2);
    else if (hostImage) setStep(1);
    else setStep(0);
  }, [hostImage, watermarkImage, data]);

  const steps = [
    { num: 1, label: 'Ảnh gốc' },
    { num: 2, label: 'Watermark' },
    { num: 3, label: 'Cấu hình' },
    { num: 4, label: 'Kết quả' },
  ];

  return (
    <div className="screen-content">
      {/* Left Panel - Info */}
      <div className="screen-left">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: isActive ? 1 : 0.5, x: isActive ? 0 : -20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="feature-number">02 / 03</div>
          <h1 className="heading-lg feature-title">
            Thủy Vân<br />
            <span className="text-[var(--watermarking)]">Watermarking</span>
          </h1>
          <p className="feature-desc">
            Bảo vệ tài sản số của bạn bằng thủy vân vô hình sử dụng thuật toán 
            DCT-SVD kết hợp Arnold Cat Map để tăng cường bảo mật.
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
            {/* Grid: Host Image + Watermark */}
            <div className="grid grid-cols-2 gap-4">
              {/* Host Image Upload */}
              <div className="panel-card">
                <div className="panel-header">
                  <h3 className="panel-title text-sm">Ảnh gốc</h3>
                  {hostImage && (
                    <span className="panel-badge bg-[var(--success)] text-white text-xs">✓</span>
                  )}
                </div>
                <label className={`upload-zone block ${hostImage ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    accept="image/png,image/jpg,image/jpeg,image/bmp"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleHostImageChange(e);
                      }
                    }}
                    className="hidden"
                  />
                  {hostPreview ? (
                    <img src={hostPreview} alt="Host" className="upload-preview mx-auto max-h-32" />
                  ) : (
                    <>
                      <Upload className="upload-icon mx-auto w-8 h-8" />
                      <p className="upload-text text-xs">Host Image</p>
                    </>
                  )}
                </label>
              </div>

              {/* Watermark Upload */}
              <div className="panel-card">
                <div className="panel-header">
                  <h3 className="panel-title text-sm">Watermark</h3>
                  {watermarkImage && (
                    <span className="panel-badge bg-[var(--success)] text-white text-xs">✓</span>
                  )}
                </div>
                <label className={`upload-zone block ${watermarkImage ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    accept="image/png,image/jpg,image/jpeg,image/bmp"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleWatermarkImageChange(e);
                      }
                    }}
                    className="hidden"
                  />
                  {watermarkPreview ? (
                    <img src={watermarkPreview} alt="Watermark" className="upload-preview mx-auto max-h-32" />
                  ) : (
                    <>
                      <Shield className="upload-icon mx-auto w-8 h-8" />
                      <p className="upload-text text-xs">Logo / Watermark</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Configuration - Show when both images selected */}
            <AnimatePresence>
              {hostImage && watermarkImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="panel-card"
                >
                  <div className="panel-header">
                    <h3 className="panel-title flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Cấu hình nâng cao
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Alpha Slider */}
                    <div className="field-group">
                      <div className="field-label">
                        <span>Hệ số nhúng (Alpha)</span>
                        <span className="text-mono font-semibold text-[var(--watermarking)]">
                          {alpha?.toFixed(2) || '0.10'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="0.5"
                        step="0.01"
                        {...register('alpha', { valueAsNumber: true })}
                        className="field-range w-full"
                      />
                      <div className="range-labels">
                        <span>Ẩn hơn</span>
                        <span>Bền hơn</span>
                      </div>
                    </div>

                    {/* Arnold Iterations */}
                    <div className="field-group">
                      <div className="field-label">
                        <span>Xáo trộn Arnold</span>
                        <span className="text-mono font-semibold text-[var(--watermarking)]">
                          {arnoldIterations || 10}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        {...register('arnoldIterations', { valueAsNumber: true })}
                        className="field-range w-full"
                      />
                      <div className="range-labels">
                        <span>Ít bảo mật</span>
                        <span>Cao</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn btn-primary btn-block mt-4"
                  >
                    {isPending ? (
                      <>
                        <div className="loading-spinner w-4 h-4" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        Nhúng Watermark
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
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
                      <div className="result-subtitle">Watermark đã được bảo vệ</div>
                    </div>
                  </div>

                  <div className="metrics-grid">
                    <div className="metric-box">
                      <div className="metric-value">{data.watermark_size || 'N/A'}</div>
                      <div className="metric-label">Kích thước</div>
                    </div>
                    <div className="metric-box">
                      <div className="metric-value">{data.blocks_used || 'N/A'}</div>
                      <div className="metric-label">Blocks</div>
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
                      if (data.watermarked_image) {
                        const link = document.createElement('a');
                        link.href = data.watermarked_image;
                        link.download = 'watermarked_image.png';
                        link.click();
                      }
                    }}
                    className="btn btn-primary btn-block"
                  >
                    <Download className="w-4 h-4" />
                    Tải ảnh đã watermark
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
          <div className="loading-text">Đang nhúng watermark vào ảnh...</div>
          <div className="loading-progress">
            <div className="loading-progress-bar" />
          </div>
        </div>
      )}
    </div>
  );
}
