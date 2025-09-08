import React from 'react';
import { Macros } from '../../types';

interface MacroRingChartProps {
  consumed: Macros;
  goal: Macros;
}

const Ring: React.FC<{
  radius: number;
  stroke: number;
  progress: number;
  color: string;
  size: number;
}> = ({ radius, stroke, progress, color, size }) => {
  const normalizedRadius = radius;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - Math.min(Math.max(progress, 0), 1) * circumference;

  return (
    <>
      <circle
        strokeOpacity="0.2"
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={size/2}
        cy={size/2}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }}
        r={normalizedRadius}
        cx={size/2}
        cy={size/2}
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
    </>
  );
};


const MacroRingChart: React.FC<MacroRingChartProps> = ({ consumed, goal }) => {
  const size = 180;
  const strokeWidth = 10;
  const center = size / 2;

  const ringsConfig = [
    {
      label: 'Protein',
      progress: goal.protein > 0 ? consumed.protein / goal.protein : 0,
      consumed: consumed.protein,
      goal: goal.protein,
      color: '#34D399',
      radius: center - strokeWidth,
    },
    {
      label: 'Carbs',
      progress: goal.carbs > 0 ? consumed.carbs / goal.carbs : 0,
      consumed: consumed.carbs,
      goal: goal.carbs,
      color: '#FBBF24',
      radius: center - strokeWidth * 2.5,
    },
    {
      label: 'Fat',
      progress: goal.fat > 0 ? consumed.fat / goal.fat : 0,
      consumed: consumed.fat,
      goal: goal.fat,
      color: '#F87171',
      radius: center - strokeWidth * 4,
    },
  ];

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg height={size} width={size}>
          {ringsConfig.map(ring => (
             <Ring key={ring.label} {...ring} stroke={strokeWidth} size={size} />
          ))}
        </svg>
         <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold leading-tight">{Math.round(consumed.calories)}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              / {Math.round(goal.calories)} kcal
            </span>
         </div>
      </div>
      <div className="flex justify-around w-full text-center">
          {ringsConfig.map(ring => (
            <div key={ring.label}>
              <p className="font-semibold" style={{ color: ring.color }}>{ring.label}</p>
              <p className="text-sm">{Math.round(ring.consumed)}/{Math.round(ring.goal)}g</p>
            </div>
          ))}
      </div>
    </div>
  );
};


export default MacroRingChart;