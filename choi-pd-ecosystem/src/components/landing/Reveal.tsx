'use client';

import { CSSProperties, ReactNode } from 'react';
import { useReveal } from './useReveal';

/**
 * Webflow 스타일 fade-in-up 리빌.
 * delay: ms (stagger 용)
 * from: 초기 변위 방향 ('up' | 'down' | 'left' | 'right' | 'scale')
 */
export function Reveal({
  children,
  delay = 0,
  duration = 700,
  from = 'up',
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  from?: 'up' | 'down' | 'left' | 'right' | 'scale';
  className?: string;
  as?: any;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>(0.1);

  const initial: Record<string, string> = {
    up: 'translateY(24px)',
    down: 'translateY(-24px)',
    left: 'translateX(24px)',
    right: 'translateX(-24px)',
    scale: 'scale(0.94)',
  };

  const style: CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : initial[from],
    transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    willChange: 'opacity, transform',
  };

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
