import React from 'react';

interface PriorityFlagProps {
  level: 'Low' | 'Medium' | 'High';
}

const colorMap = {
  Low: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    fill: 'fill-green-600',
  },
  Medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    fill: 'fill-yellow-600',
  },
  High: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    fill: 'fill-red-600',
  },
};

const PriorityFlag: React.FC<PriorityFlagProps> = ({ level }) => {
  const { bg, text, fill } = colorMap[level];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded ${bg} ${text} text-sm font-medium`}>
      <svg className={`w-4 h-4 mr-1 ${fill}`} viewBox="0 0 20 20">
        <path d="M4 2a1 1 0 0 1 1-1h10.293a1 1 0 0 1 .707 1.707L14.414 5l1.586 1.586A1 1 0 0 1 14.293 8H5v10a1 1 0 1 1-2 0V2h1z" />
      </svg>
      {level}
    </span>
  );
};

export default PriorityFlag;
