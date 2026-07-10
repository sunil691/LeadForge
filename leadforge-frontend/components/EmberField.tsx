"use client";

import { useMemo } from "react";

interface Ember {
  left: string;
  size: number;
  delay: string;
  duration: string;
  hue: string;
}

export default function EmberField({ count = 18 }: { count?: number }) {
  const embers = useMemo<Ember[]>(() => {
    return Array.from({ length: count }).map((_, i) => ({
      left: `${(i * 137.5) % 100}%`,
      size: 2 + ((i * 7) % 4),
      delay: `${(i * 0.37) % 6}s`,
      duration: `${5 + ((i * 1.3) % 4)}s`,
      hue: i % 3 === 0 ? "#F2A65A" : "#E8622A",
    }));
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {embers.map((e, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full animate-drift"
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            backgroundColor: e.hue,
            boxShadow: `0 0 ${e.size * 3}px ${e.hue}`,
            animationDelay: e.delay,
            animationDuration: e.duration,
          }}
        />
      ))}
    </div>
  );
}
