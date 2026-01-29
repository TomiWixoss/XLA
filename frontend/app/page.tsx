/**
 * Home Page - AWWWARDS Style Single-Page No-Scroll Experience
 * 3 Screens: Steganography, Watermarking, Video
 */
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Image as ImageIcon, Film, ChevronRight, Moon, Sun } from 'lucide-react';
import { SteganographyScreen } from '@/components/screens/steganography-screen';
import { WatermarkingScreen } from '@/components/screens/watermarking-screen';
import { VideoScreen } from '@/components/screens/video-screen';
import { useTheme } from 'next-themes';

const SCREENS = [
  { id: 'steganography', label: 'Giấu Tin', icon: Lock },
  { id: 'watermarking', label: 'Thủy Vân', icon: Shield },
  { id: 'video', label: 'Video', icon: Film },
] as const;

export default function HomePage() {
  const [activeScreen, setActiveScreen] = useState(0);
  const { theme, setTheme } = useTheme();

  const handleScreenChange = useCallback((index: number) => {
    setActiveScreen(index);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' && activeScreen < 2) {
      setActiveScreen(prev => prev + 1);
    } else if (e.key === 'ArrowLeft' && activeScreen > 0) {
      setActiveScreen(prev => prev - 1);
    }
  }, [activeScreen]);

  return (
    <div 
      className="screen-container" 
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Fixed Navigation */}
      <nav className="nav-fixed">
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <Shield className="w-4 h-4" />
          </div>
          <span>PyStegoWatermark</span>
        </div>

        <div className="nav-tabs">
          {SCREENS.map((screen, index) => (
            <button
              key={screen.id}
              className={`nav-tab ${activeScreen === index ? 'active' : ''}`}
              onClick={() => handleScreenChange(index)}
            >
              {screen.label}
            </button>
          ))}
        </div>

        <div className="nav-actions">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-outline"
            style={{ padding: '0.5rem 1rem' }}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Screen Indicator (Right Side) */}
      <div className="screen-indicator">
        {SCREENS.map((screen, index) => (
          <button
            key={screen.id}
            className={`indicator-dot ${activeScreen === index ? 'active' : ''}`}
            onClick={() => handleScreenChange(index)}
            aria-label={screen.label}
          />
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="mobile-nav">
        {SCREENS.map((screen, index) => {
          const IconComponent = screen.icon;
          return (
            <button
              key={screen.id}
              className={`mobile-nav-btn ${activeScreen === index ? 'active' : ''}`}
              onClick={() => handleScreenChange(index)}
            >
              <IconComponent />
              {screen.label}
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((activeScreen + 1) / SCREENS.length) * 100}%` }}
        />
      </div>

      {/* Screens Wrapper */}
      <div 
        className="screen-wrapper" 
        data-active={activeScreen}
      >
        {/* Screen 1: Steganography */}
        <div className="screen screen--steganography">
          <SteganographyScreen isActive={activeScreen === 0} />
        </div>

        {/* Screen 2: Watermarking */}
        <div className="screen screen--watermarking">
          <WatermarkingScreen isActive={activeScreen === 1} />
        </div>

        {/* Screen 3: Video */}
        <div className="screen screen--video">
          <VideoScreen isActive={activeScreen === 2} />
        </div>
      </div>
    </div>
  );
}
