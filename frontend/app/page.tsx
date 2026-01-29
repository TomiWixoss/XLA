/**
 * Home Page - Main Entry Point
 */
'use client';

import { Navbar, HeroSection } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmbedForm, ExtractForm } from '@/components/features/steganography';
import { WatermarkEmbedForm, WatermarkExtractForm } from '@/components/features/watermarking';
import { VideoEmbedForm, VideoExtractForm } from '@/components/features/video';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-20">
        <HeroSection />
        
        {/* Steganography Section */}
        <section id="steganography" className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-4 text-center">Giấu Tin</h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
                Giấu thông điệp văn bản bí mật vào trong ảnh sử dụng thuật toán LSB
              </p>
              
              <Tabs defaultValue="embed" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="embed">Nhúng Tin Nhắn</TabsTrigger>
                  <TabsTrigger value="extract">Trích Xuất Tin Nhắn</TabsTrigger>
                </TabsList>
                
                <TabsContent value="embed">
                  <EmbedForm />
                </TabsContent>
                
                <TabsContent value="extract">
                  <ExtractForm />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>

        {/* Watermarking Section */}
        <section id="watermarking" className="py-20 px-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-4 text-center">Thủy Vân Số</h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
                Bảo vệ ảnh của bạn với thủy vân vô hình sử dụng thuật toán DCT-SVD
              </p>
              
              <Tabs defaultValue="embed" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="embed">Nhúng Watermark</TabsTrigger>
                  <TabsTrigger value="extract">Trích Xuất Watermark</TabsTrigger>
                </TabsList>
                
                <TabsContent value="embed">
                  <WatermarkEmbedForm />
                </TabsContent>
                
                <TabsContent value="extract">
                  <WatermarkExtractForm />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>

        {/* Video Section */}
        <section id="video" className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-4 text-center">Thủy Vân Video</h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
                Nhúng và trích xuất thủy vân từ video để bảo vệ bản quyền
              </p>
              
              <Tabs defaultValue="embed" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="embed">Nhúng Watermark</TabsTrigger>
                  <TabsTrigger value="extract">Trích Xuất Watermark</TabsTrigger>
                </TabsList>
                
                <TabsContent value="embed">
                  <VideoEmbedForm />
                </TabsContent>
                
                <TabsContent value="extract">
                  <VideoExtractForm />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200 dark:border-gray-800">
        <p>© 2026 PyStegoWatermark Suite. Xây dựng với Next.js & FastAPI.</p>
      </footer>
    </div>
  );
}
