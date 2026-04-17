'use client';

import { CSSProperties } from 'react';
import { useCountUp } from './useReveal';

export function CountUp({
  target,
  duration = 1600,
  className = '',
  style,
}: {
  target: string;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const { ref, display } = useCountUp(target, { duration });
  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  );
}
