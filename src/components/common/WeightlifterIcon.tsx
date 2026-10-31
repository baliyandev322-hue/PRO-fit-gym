import React from 'react';

interface WeightlifterIconProps {
  className?: string;
  isLifting?: boolean;
}

export const WeightlifterIcon: React.FC<WeightlifterIconProps> = ({ 
  className = "w-6 h-6", 
  isLifting = false 
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} ${isLifting ? 'animate-bounce' : ''}`}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Weightlifter"
    >
      {/* Barbell Bar */}
      <rect x="12" y="21" width="76" height="4" rx="2" />

      {/* Left Plates */}
      <rect x="20" y="8" width="6.5" height="30" rx="2" />
      <rect x="15" y="13" width="4.5" height="20" rx="1.5" />
      <rect x="27" y="20" width="2" height="6" rx="0.5" />

      {/* Right Plates */}
      <rect x="73.5" y="8" width="6.5" height="30" rx="2" />
      <rect x="80.5" y="13" width="4.5" height="20" rx="1.5" />
      <rect x="71" y="20" width="2" height="6" rx="0.5" />

      {/* Athlete Head */}
      <circle cx="50" cy="35" r="7.5" />

      {/* Arms Holding Bar Overhead */}
      <path
        d="M 32 23 L 42 39 L 46 48"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 68 23 L 58 39 L 54 48"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Athlete Torso */}
      <path d="M 44 48 L 56 48 L 61 74 L 39 74 Z" />

      {/* Athlete Legs in Solid Lifting Stance */}
      <path
        d="M 42 73 L 34 94"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M 58 73 L 66 94"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
};
