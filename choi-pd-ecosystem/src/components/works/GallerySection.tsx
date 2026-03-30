'use client';

import { Work } from '@/lib/db/schema';
import { Palette } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface GallerySectionProps {
  works: Work[];
}

export function GallerySection({ works }: GallerySectionProps) {
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  return (
    <section className="py-20" style={{ background: '#F3F2F2' }}>
      <div className="container">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg" style={{ background: '#8b5cf6' }}>
            <Palette className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold" style={{ color: '#16325C' }}>모바일 스케치 갤러리</h2>
          <p className="mt-4 text-gray-500">
            스마트폰으로 그린 일상의 감성을 담은 작품들
          </p>
        </div>

        {works.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-12 md:p-16 text-center">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}>
              <Palette className="h-10 w-10" style={{ color: '#8b5cf6' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#16325C' }}>
              갤러리 작품을 준비 중입니다
            </h3>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              스마트폰으로 그린 일상의 감성 작품들이 곧 공개됩니다.
              기대해 주세요!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {works.map((work) => (
              <button
                key={work.id}
                onClick={() => setSelectedWork(work)}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted transition-transform hover:scale-105"
              >
                <Image
                  src={work.imageUrl}
                  alt={work.title}
                  fill
                  className="object-cover transition-opacity group-hover:opacity-90"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="absolute bottom-0 p-4">
                    <p className="text-sm font-medium text-white">{work.title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selectedWork} onOpenChange={() => setSelectedWork(null)}>
          <DialogContent className="max-w-3xl">
            {selectedWork && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedWork.title}</DialogTitle>
                  {selectedWork.description && (
                    <DialogDescription>{selectedWork.description}</DialogDescription>
                  )}
                </DialogHeader>
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                  <Image
                    src={selectedWork.imageUrl}
                    alt={selectedWork.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
