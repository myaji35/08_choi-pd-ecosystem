'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  profileImageTimestamp?: number;
  heroImages?: string[];
}

export function HeroSection({
  profileImageTimestamp = Date.now(),
  heroImages = ['https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1920&h=1080&fit=crop&q=80']
}: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const totalSlides = heroImages.length;

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning, currentIndex]);

  const goNext = useCallback(() => {
    goToSlide((currentIndex + 1) % totalSlides);
  }, [currentIndex, totalSlides, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
  }, [currentIndex, totalSlides, goToSlide]);

  // 자동 슬라이드 (5초)
  useEffect(() => {
    if (totalSlides <= 1) return;
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [totalSlides, goNext]);

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Images with Slide Animation */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background z-10" />

        {heroImages.map((imageUrl, index) => (
          <div
            key={imageUrl}
            className="absolute inset-0 transition-all duration-700 ease-in-out"
            style={{
              opacity: index === currentIndex ? 1 : 0,
              transform: index === currentIndex
                ? 'translateX(0) scale(1)'
                : index < currentIndex
                  ? 'translateX(-8%) scale(1.02)'
                  : 'translateX(8%) scale(1.02)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`배경 ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* 좌우 화살표 */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 z-30 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors group"
            aria-label="이전 이미지"
          >
            <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 z-30 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors group"
            aria-label="다음 이미지"
          >
            <ChevronRight className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

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
              <Link href="/chopd/education">교육 과정 보기</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 shadow-lg font-semibold">
              <Link href="/chopd/works">저서 소개</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {totalSlides > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`슬라이드 ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
