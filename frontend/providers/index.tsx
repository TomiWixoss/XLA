/**
 * Providers Wrapper
 */
'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from 'next-themes';
import { CustomCursorWrapper } from '@/components/ui/custom-cursor';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        <CustomCursorWrapper>
          {children}
        </CustomCursorWrapper>
      </QueryProvider>
    </ThemeProvider>
  );
}

