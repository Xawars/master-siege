'use client';

import React from 'react';
import Image from 'next/image';

interface MasterSiegeLogoProps {
  className?: string;
  size?: number;
}

export function MasterSiegeLogo({ className = '', size = 64 }: MasterSiegeLogoProps) {
  return (
    <Image
      src="/brand/master-siege-app-icon.svg"
      alt="Master Siege logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
