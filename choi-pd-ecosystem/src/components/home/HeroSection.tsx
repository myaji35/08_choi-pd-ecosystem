'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface HeroSectionProps {
  profileImageTimestamp?: number;
  heroImages?: string[];
}

export function HeroSection({
  profileImageTimestamp = Date.now(),
  heroImages = ['https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1920&h=1080&fit=crop&q=80']
}: HeroSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // 5초마다 이미지 전환

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Images with Fade Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background z-10" />
        {heroImages.map((imageUrl, index) => (
          <div
            key={imageUrl}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={imageUrl}
              alt={`배경 ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="container relative z-20 py-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Profile Image */}
          <div className="mb-8 flex justify-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-2xl md:h-40 md:w-40">
              <Image
                src={`/images/profile.jpg?t=${profileImageTimestamp}`}
                alt="최범희 대표"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl drop-shadow-lg">
            스마트폰으로 시작하는
            <br />
            당신의 새로운 도전
          </h1>
          <p className="mb-8 text-xl text-white/90 drop-shadow-md">
            교육자, 저자, 미디어 발행인 최범희와 함께
            <br />
            5060 세대의 스마트폰 창업을 응원합니다
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="shadow-lg bg-white text-primary hover:bg-white/90 font-semibold">
              <Link href="/education">교육 과정 보기</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 shadow-lg font-semibold">
              <Link href="/works">저서 소개</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
