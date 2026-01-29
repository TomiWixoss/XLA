/**
 * Help Tooltip Component
 */
'use client';

import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface HelpTooltipProps {
  content: string;
}

export function HelpTooltip({ content }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-popover border border-border rounded-lg shadow-lg z-50">
          <p className="text-xs text-popover-foreground">{content}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-popover border-r border-b border-border rotate-45" />
        </div>
      )}
    </div>
  );
}
