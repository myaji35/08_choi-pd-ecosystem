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
    <section className="bg-muted/20 py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Palette className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">모바일 스케치 갤러리</h2>
          <p className="mt-4 text-muted-foreground">
            스마트폰으로 그린 일상의 감성을 담은 작품들
          </p>
        </div>

        {works.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-12 text-center">
            <Palette className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              곧 멋진 작품들이 업로드될 예정입니다
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
