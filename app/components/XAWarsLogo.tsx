'use client';

import React from 'react';
import Image from 'next/image';

interface XAWarsLogoProps {
  className?: string;
  size?: number;
}

export function XAWarsLogo({ className = '', size = 64 }: XAWarsLogoProps) {
  return (
    <Image
      src="/xawarscol-logo.png"
      alt="Master Siege logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
