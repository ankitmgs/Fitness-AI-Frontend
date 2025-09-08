import React from 'react';
import { WeightLog } from '../../types';

interface WeightChartProps {
  data: WeightLog[];
}

const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  const chartHeight = 200;
  const chartWidth = 500;
  const padding = 40;

  if (data.length < 2) return null;

  const weights = data.map(d => d.weight);
  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);
  const weightRange = maxWeight - minWeight === 0 ? 10 : maxWeight - minWeight;

  const points = data.map((log, i) => {
    const x = (i / (data.length - 1)) * (chartWidth - padding * 2) + padding;
    const y = chartHeight - padding - ((log.weight - minWeight) / weightRange) * (chartHeight - padding * 2);
    return `${x},${y}`;
  }).join(' ');
  
  const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      // add timezone offset to prevent date from shifting
      const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
      return `${adjustedDate.getMonth() + 1}/${adjustedDate.getDate()}`;
  }

  return (
    <div className="w-full overflow-x-auto text-gray-800 dark:text-gray-200">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[500px] h-auto">
            {/* Y-axis labels */}
            <text x={padding - 10} y={padding + 5} textAnchor="end" fontSize="12" fill="currentColor">{Math.ceil(maxWeight)}</text>
            <text x={padding - 10} y={chartHeight - padding + 5} textAnchor="end" fontSize="12" fill="currentColor">{Math.floor(minWeight)}</text>
            
            {/* X-axis labels */}
            <text x={padding} y={chartHeight - padding + 20} textAnchor="start" fontSize="12" fill="currentColor">{formatDate(data[0].date)}</text>
            <text x={chartWidth - padding} y={chartHeight - padding + 20} textAnchor="end" fontSize="12" fill="currentColor">{formatDate(data[data.length - 1].date)}</text>

            {/* Grid lines */}
            <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="currentColor" strokeDasharray="2" strokeOpacity="0.3" />
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="currentColor" strokeOpacity="0.5" />
            
            {/* Data line */}
            <polyline
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2"
                points={points}
            />
            {/* Data points */}
            {data.map((log, i) => {
                const x = (i / (data.length - 1)) * (chartWidth - padding * 2) + padding;
                const y = chartHeight - padding - ((log.weight - minWeight) / weightRange) * (chartHeight - padding * 2);
                return <circle key={i} cx={x} cy={y} r="3" fill="#4f46e5" />;
            })}
        </svg>
    </div>
  );
};

export default WeightChart;
