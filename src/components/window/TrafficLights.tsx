'use client';

import React from 'react';

export interface TrafficLightsProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  isActive?: boolean;
  className?: string;
}

export function TrafficLights({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
  isActive = true,
  className = '',
}: TrafficLightsProps) {
  return (
    <div
      className={`group flex items-center gap-2 select-none ${className}`}
      role="group"
      aria-label="Window management controls"
    >
      {/* Red: Close */}
      <button
        type="button"
        aria-label="Close window"
        title="Close"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        className={`w-3 h-3 rounded-full flex items-center justify-center border transition-all duration-150 cursor-pointer focus:outline-none ${
          isActive
            ? 'bg-[#FF5F56] border-[#E0443E]'
            : 'bg-[#FF5F56]/60 border-[#E0443E]/60 group-hover:bg-[#FF5F56] group-hover:border-[#E0443E]'
        }`}
      >
        <svg
          className="w-1.5 h-1.5 text-[#4D0000] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          viewBox="0 0 8 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" />
        </svg>
      </button>

      {/* Yellow: Minimize */}
      <button
        type="button"
        aria-label="Minimize window"
        title="Minimize"
        onClick={(e) => {
          e.stopPropagation();
          onMinimize?.();
        }}
        className={`w-3 h-3 rounded-full flex items-center justify-center border transition-all duration-150 cursor-pointer focus:outline-none ${
          isActive
            ? 'bg-[#FFBD2E] border-[#DEA123]'
            : 'bg-[#FFBD2E]/60 border-[#DEA123]/60 group-hover:bg-[#FFBD2E] group-hover:border-[#DEA123]'
        }`}
      >
        <svg
          className="w-1.5 h-1.5 text-[#995700] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          viewBox="0 0 8 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M1.2 4H6.8" />
        </svg>
      </button>

      {/* Green: Maximize / Zoom */}
      <button
        type="button"
        aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
        title={isMaximized ? 'Restore' : 'Maximize'}
        onClick={(e) => {
          e.stopPropagation();
          onMaximize?.();
        }}
        className={`w-3 h-3 rounded-full flex items-center justify-center border transition-all duration-150 cursor-pointer focus:outline-none ${
          isActive
            ? 'bg-[#27C93F] border-[#1AAB29]'
            : 'bg-[#27C93F]/60 border-[#1AAB29]/60 group-hover:bg-[#27C93F] group-hover:border-[#1AAB29]'
        }`}
      >
        {isMaximized ? (
          <svg
            className="w-1.5 h-1.5 text-[#006500] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            viewBox="0 0 8 8"
            fill="currentColor"
          >
            {/* Collapse glyph */}
            <path d="M3.5 1.5v2H1.5M4.5 6.5v-2H6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg
            className="w-1.5 h-1.5 text-[#006500] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            viewBox="0 0 8 8"
            fill="currentColor"
          >
            {/* Expand diagonal opposing triangles */}
            <path d="M1 1.5v3l3-3H1zM7 6.5v-3l-3 3h3z" />
          </svg>
        )}
      </button>
    </div>
  );
}
