import React from 'react';
import { DotMatrixLoader } from './DotMatrixLoader';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'contextual';
  className?: string;
}

export function Spinner({
  size = 'md',
  color = 'primary',
  className = '',
}: SpinnerProps) {
  const sizes = {
    sm: 16,
    md: 20,
    lg: 32,
  };

  const colors = {
    primary: 'text-brand-500',
    white: 'text-white',
    contextual: 'text-current',
  };

  return (
    <span role="status" className={`inline-flex ${className}`}>
      <DotMatrixLoader size={sizes[size]} className={colors[color]} />
      <span className="sr-only">Loading...</span>
    </span>
  );
}
