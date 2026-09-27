import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { formatNumber } from '../lib/format';

export interface CountUpProps {
  value: number;
  /** Animate from this value on mount (default: no mount animation). */
  from?: number;
  /** ms (brand board: 900 ms ease-out). */
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

/** Number that counts up when `value` increases (decreases jump). Static under reduced motion. */
export function CountUp({ value, from, duration = 900, format = formatNumber, className }: CountUpProps) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(from ?? value);
  const current = useRef(from ?? value);

  useEffect(() => {
    const start = current.current;
    if (reduce || value <= start) {
      current.current = value;
      setShown(value);
      return;
    }
    const controls = animate(start, value, {
      duration: duration / 1000,
      ease: 'easeOut',
      onUpdate: v => {
        current.current = v;
        setShown(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, duration, reduce]);

  return <span className={className}>{format(shown)}</span>;
}

/** True for ~`ms` after `value` increases. Handy for a bump animation next to a CountUp. */
export function useBumpOnIncrease(value: number, ms = 900) {
  const prev = useRef(value);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (value > prev.current) setBump(b => b + 1);
    prev.current = value;
  }, [value]);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!bump) return;
    setActive(true);
    const t = setTimeout(() => setActive(false), ms);
    return () => clearTimeout(t);
  }, [bump, ms]);
  return active;
}
