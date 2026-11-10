import type { CSSProperties } from 'react';

interface DotMatrixLoaderProps {
  /** Rendered width and height in pixels. */
  size?: number;
  className?: string;
}

const GRID = 5;
const DOTS = Array.from({ length: GRID * GRID }, (_, i) => {
  const row = Math.floor(i / GRID);
  const col = i % GRID;
  return { key: i, delay: (row + col) * 90 };
});

/** Dot-matrix loader: a diagonal scan across a 5×5 grid, tinted by `currentColor`. */
export function DotMatrixLoader({ size = 20, className = '' }: DotMatrixLoaderProps) {
  const gap = Math.max(1, Math.round(size / 14));
  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 ${className}`}
      style={{ width: size, height: size, gridTemplateColumns: `repeat(${GRID}, 1fr)`, gap }}
    >
      {DOTS.map(({ key, delay }) => (
        <span
          key={key}
          className="dmx-dot rounded-full bg-current"
          style={{ animationDelay: `${delay}ms` } as CSSProperties}
        />
      ))}
    </span>
  );
}
