import React from 'react';
import { WaterLog } from '../../types';

interface WaterChartProps {
  data: WaterLog[];
}

const WaterChart: React.FC<WaterChartProps> = ({ data }) => {
  const chartHeight = 200;
  const chartWidth = 500;
  const padding = 40;

  // Aggregate data by date
  const dailyData = data.reduce((acc, log) => {
    acc[log.date] = (acc[log.date] || 0) + log.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(dailyData)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (chartData.length < 2) {
    return (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          Log water intake on at least two different days in this period to see a chart.
        </p>
    );
  }

  const values = chartData.map(d => d.amount);
  const maxValue = Math.max(...values, 0);
  const valueRange = maxValue === 0 ? 1000 : maxValue;

  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * (chartWidth - padding * 2) + padding;
    const y = chartHeight - padding - (d.amount / valueRange) * (chartHeight - padding * 2);
    return `${x},${y}`;
  }).join(' ');
  
  const formatDateLabel = (dateStr: string) => {
      const date = new Date(dateStr);
      const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
      return `${adjustedDate.getMonth() + 1}/${adjustedDate.getDate()}`;
  }

  return (
    <div className="w-full overflow-x-auto text-gray-800 dark:text-gray-200">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[500px] h-auto">
        {/* Y-axis labels */}
        <text x={padding - 10} y={padding + 5} textAnchor="end" fontSize="12" fill="currentColor">{Math.ceil(maxValue)}</text>
        <text x={padding - 10} y={chartHeight - padding + 5} textAnchor="end" fontSize="12" fill="currentColor">0</text>
        
        {/* X-axis labels */}
        <text x={padding} y={chartHeight - padding + 20} textAnchor="start" fontSize="12" fill="currentColor">{formatDateLabel(chartData[0].date)}</text>
        <text x={chartWidth - padding} y={chartHeight - padding + 20} textAnchor="end" fontSize="12" fill="currentColor">{formatDateLabel(chartData[chartData.length - 1].date)}</text>

        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="currentColor" strokeDasharray="2" strokeOpacity="0.3" />
        <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="currentColor" strokeOpacity="0.5" />
        
        {/* Data line */}
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} />
        {/* Data points */}
        {chartData.map((d, i) => {
          const x = (i / (chartData.length - 1)) * (chartWidth - padding * 2) + padding;
          const y = chartHeight - padding - (d.amount / valueRange) * (chartHeight - padding * 2);
          return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />;
        })}
      </svg>
    </div>
  );
};

export default WaterChart;