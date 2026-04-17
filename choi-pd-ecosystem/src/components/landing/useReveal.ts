'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * IntersectionObserver 기반 1회 리빌 훅.
 * viewport에 일부라도 들어오면 ref.current에 data-reveal="on" 세팅.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, shown]);

  return { ref, shown };
}

/**
 * easeOutCubic: 시작은 빠르고 끝은 부드럽게.
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * 숫자 또는 문자열 타겟을 0에서 target까지 애니메이션.
 * "5분", "₩0", "6개", "99.9%" 같은 단위를 자동 추출.
 */
export interface CountUpOptions {
  duration?: number; // ms
  startOnVisible?: boolean;
}

export function useCountUp(target: string, options: CountUpOptions = {}) {
  const { duration = 1600, startOnVisible = true } = options;

  // "₩0" → prefix:"₩", number:0, suffix:"" / "99.9%" → prefix:"", number:99.9, suffix:"%"
  const parsed = parseTargetValue(target);
  const [display, setDisplay] = useState<string>(
    parsed ? formatValue(parsed.prefix, 0, parsed.decimals, parsed.suffix) : target
  );
  const ref = useRef<HTMLSpanElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!parsed) return;
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        const v = parsed.value * easeOutCubic(p);
        setDisplay(formatValue(parsed.prefix, v, parsed.decimals, parsed.suffix));
        if (p < 1) requestAnimationFrame(tick);
        else setDisplay(target);
      };
      requestAnimationFrame(tick);
    };

    if (!startOnVisible) {
      run();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            run();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration, startOnVisible, parsed]);

  return { ref, display };
}

interface ParsedTarget {
  prefix: string;
  value: number;
  decimals: number;
  suffix: string;
}

function parseTargetValue(raw: string): ParsedTarget | null {
  // 숫자 한 덩어리를 찾고, 그 앞뒤를 prefix/suffix로 분리
  const match = raw.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const numStr = match[0];
  const start = match.index ?? 0;
  const prefix = raw.slice(0, start);
  const suffix = raw.slice(start + numStr.length);
  const value = parseFloat(numStr);
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  return { prefix, value, decimals, suffix };
}

function formatValue(prefix: string, value: number, decimals: number, suffix: string): string {
  const fixed = value.toFixed(decimals);
  // 3자리 콤마 — 정수 부분만
  const [intPart, fracPart] = fixed.split('.');
  const intFmt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const num = fracPart ? `${intFmt}.${fracPart}` : intFmt;
  return `${prefix}${num}${suffix}`;
}
