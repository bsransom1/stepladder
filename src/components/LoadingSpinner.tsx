import React from 'react';
import Image from 'next/image';

interface LoadingSpinnerProps {
  size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 48 }) => {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/sl_logo.png"
        alt="Loading"
        width={size}
        height={size}
        className="animate-spin object-contain"
      />
    </div>
  );
};

