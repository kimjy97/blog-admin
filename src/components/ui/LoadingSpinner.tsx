import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => {
  return (
    <div className={`flex items-center justify-center w-full h-full ${className || ''}`}>
      <svg
        className="loading-spinner-container"
        viewBox="0 0 40 40"
        height="40"
        width="40"
      >
        <circle
          className="loading-spinner-track"
          cx="20"
          cy="20"
          r="17.5"
          pathLength="100"
          strokeWidth="5px"
          fill="none"
        />
        <circle
          className="loading-spinner-car"
          cx="20"
          cy="20"
          r="17.5"
          pathLength="100"
          strokeWidth="5px"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default LoadingSpinner;
