/**
 * Video Screen - AWWWARDS Style
 * Full viewport, no scroll, step-based interaction
 */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Upload, Download, Check, ArrowRight, Settings, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useVideoEmbedForm } from '@/hooks/use-video-embed-form';

interface Props {
  isActive: boolean;
}

export function VideoScreen({ isActive }: Props) {
  const [mode, setMode] = useState<'embed' | 'extract'>('embed');
  const [step, setStep] = useState(0);
  
  const {
    form,
    videoFile,
    videoPreview,
    watermarkImage,
    watermarkPreview,
    handleVideoChange,
    handleWatermarkChange,
    onSubmit,
    isPending,
    data,
  } = useVideoEmbedForm();

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const alpha = watch('alpha');
  const frameSkip = watch('frameSkip');

  // Auto-advance steps
  useEffect(() => {
    if (data) setStep(3);
    else if (videoFile && watermarkImage) setStep(2);
    else if (videoFile) setStep(1);
    else setStep(0);
  }, [videoFile, watermarkImage, data]);

  const steps = [
    { num: 1, label: 'Video' },
    { num: 2, label: 'Logo' },
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
          <div className="feature-number">03 / 03</div>
          <h1 className="heading-lg feature-title">
            Video<br />
            <span className="text-[var(--video)]">Watermarking</span>
          </h1>
          <p className="feature-desc">
            Bảo vệ bản quyền video số bằng cách nhúng watermark vào từng frame. 
            Hỗ trợ MP4, AVI với tốc độ xử lý được tối ưu.
          </p>

          {/* Warning Notice */}
          <div className="mt-4 p-4 border-2 border-[var(--warning)] bg-[var(--warning)]/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Lưu ý</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Xử lý video có thể mất vài phút. Khuyến nghị video &lt;30 giây để demo nhanh.
                </p>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="mode-toggle mt-4">
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
            {/* Grid: Video + Watermark */}
            <div className="grid grid-cols-2 gap-4">
              {/* Video Upload */}
              <div className="panel-card">
                <div className="panel-header">
                  <h3 className="panel-title text-sm flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Video gốc
                  </h3>
                  {videoFile && (
                    <span className="panel-badge bg-[var(--success)] text-white text-xs">✓</span>
                  )}
                </div>
                <label className={`upload-zone block ${videoFile ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    accept="video/mp4,video/avi"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleVideoChange(e);
                      }
                    }}
                    className="hidden"
                  />
                  {videoPreview ? (
                    <video 
                      src={videoPreview} 
                      className="w-full max-h-32 object-contain"
                      muted
                    />
                  ) : (
                    <>
                      <Film className="upload-icon mx-auto w-8 h-8" />
                      <p className="upload-text text-xs">MP4, AVI (Max 100MB)</p>
                    </>
                  )}
                </label>
                {videoFile && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-2 truncate">
                    {videoFile.name}
                  </p>
                )}
              </div>

              {/* Watermark Upload */}
              <div className="panel-card">
                <div className="panel-header">
                  <h3 className="panel-title text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Logo
                  </h3>
                  {watermarkImage && (
                    <span className="panel-badge bg-[var(--success)] text-white text-xs">✓</span>
                  )}
                </div>
                <label className={`upload-zone block ${watermarkImage ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    accept="image/png,image/jpg,image/jpeg"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleWatermarkChange(e);
                      }
                    }}
                    className="hidden"
                  />
                  {watermarkPreview ? (
                    <img src={watermarkPreview} alt="Watermark" className="upload-preview mx-auto max-h-32" />
                  ) : (
                    <>
                      <ImageIcon className="upload-icon mx-auto w-8 h-8" />
                      <p className="upload-text text-xs">PNG, JPG (Max 5MB)</p>
                    </>
                  )}
                </label>
                {watermarkImage && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-2 truncate">
                    {watermarkImage.name}
                  </p>
                )}
              </div>
            </div>

            {/* Configuration - Show when both files selected */}
            <AnimatePresence>
              {videoFile && watermarkImage && (
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
                      Cấu hình
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Alpha Slider */}
                    <div className="field-group">
                      <div className="field-label">
                        <span>Hệ số nhúng</span>
                        <span className="text-mono font-semibold text-[var(--video)]">
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
                        <span>Yếu</span>
                        <span>Mạnh</span>
                      </div>
                    </div>

                    {/* Frame Skip */}
                    <div className="field-group">
                      <div className="field-label">
                        <span>Mỗi N frame</span>
                        <span className="text-mono font-semibold text-[var(--video)]">
                          {frameSkip || 5}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        {...register('frameSkip', { valueAsNumber: true })}
                        className="field-range w-full"
                      />
                      <div className="range-labels">
                        <span>Mọi frame</span>
                        <span>Nhanh hơn</span>
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
                        Đang xử lý video...
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
                      <div className="result-title">Xử lý thành công!</div>
                      <div className="result-subtitle">Video đã được watermark</div>
                    </div>
                  </div>

                  <div className="metrics-grid">
                    <div className="metric-box">
                      <div className="metric-value">{data.total_frames || 'N/A'}</div>
                      <div className="metric-label">Tổng frame</div>
                    </div>
                    <div className="metric-box">
                      <div className="metric-value">{data.watermarked_frames || 'N/A'}</div>
                      <div className="metric-label">Đã nhúng</div>
                    </div>
                    <div className="metric-box">
                      <div className="metric-value">{data.fps || 'N/A'}</div>
                      <div className="metric-label">FPS</div>
                    </div>
                    <div className="metric-box">
                      <div className="metric-value">{data.resolution || 'N/A'}</div>
                      <div className="metric-label">Resolution</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (data.watermarked_video) {
                        const link = document.createElement('a');
                        link.href = data.watermarked_video;
                        link.download = 'watermarked_video.mp4';
                        link.click();
                      }
                    }}
                    className="btn btn-primary btn-block"
                  >
                    <Download className="w-4 h-4" />
                    Tải video đã watermark
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
          <div className="loading-text">Đang xử lý video... (có thể mất vài phút)</div>
          <div className="loading-progress">
            <div className="loading-progress-bar" />
          </div>
        </div>
      )}
    </div>
  );
}
