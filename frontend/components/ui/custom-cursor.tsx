/**
 * Custom Cursor Provider
 * Wraps the app with a custom cursor for AWWWARDS-level UX
 */
'use client';

import { useEffect, useState } from 'react';
import { CursorFollower } from '@/components/ui/micro-interactions';

export function CustomCursorWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Only show custom cursor on desktop with hover capability
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsDesktop(mediaQuery.matches);
    
    if (mediaQuery.matches) {
      document.body.classList.add('custom-cursor');
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
      if (e.matches) {
        document.body.classList.add('custom-cursor');
      } else {
        document.body.classList.remove('custom-cursor');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      document.body.classList.remove('custom-cursor');
    };
  }, []);

  return (
    <>
      {children}
      {isMounted && isDesktop && <CursorFollower />}
    </>
  );
}
