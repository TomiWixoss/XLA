/**
 * Navbar Component
 */
'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold">PyStegoWatermark</span>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="#steganography" className="text-sm hover:text-blue-600 transition-colors">
            Giấu Tin
          </a>
          <a href="#watermarking" className="text-sm hover:text-blue-600 transition-colors">
            Thủy Vân
          </a>
          <a href="#video" className="text-sm hover:text-blue-600 transition-colors">
            Video
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
