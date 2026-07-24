"use client";

import { useEffect, useRef, useState } from "react";

export function useAnimatedCounter(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;

    cancelAnimationFrame(rafRef.current);

    if (target === 0) {
      // Animate down to 0 from current value
      const startValue = count;
      const startTime = Date.now();

      const step = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(startValue * (1 - eased)));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      };

      rafRef.current = requestAnimationFrame(step);
      return () => cancelAnimationFrame(rafRef.current);
    }

    const startTime = Date.now();
    const startValue = count;

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startValue + (target - startValue) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return count;
}
