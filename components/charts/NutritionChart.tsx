import React from 'react';
import { Meal } from '../../types';

interface NutritionChartProps {
  data: Meal[];
}

const NutritionChart: React.FC<NutritionChartProps> = ({ data }) => {
  const chartHeight = 200;
  const chartWidth = 500;
  const padding = 40;

  // Aggregate data by date
  const dailyData = data.reduce((acc, log) => {
    if (!acc[log.date]) {
      acc[log.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    acc[log.date].calories += log.macros.calories;
    acc[log.date].protein += log.macros.protein;
    acc[log.date].carbs += log.macros.carbs;
    acc[log.date].fat += log.macros.fat;
    return acc;
  }, {} as Record<string, { calories: number; protein: number; carbs: number; fat: number }>);

  const chartData = Object.entries(dailyData)
    .map(([date, macros]) => ({ date, ...macros }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (chartData.length < 2) {
      return (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Log meals on at least two different days in this period to see a chart.
          </p>
      );
  }

  const values = chartData.map(d => d.calories);
  const maxValue = Math.max(...values, 0);
  const valueRange = maxValue === 0 ? 1000 : maxValue;

  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * (chartWidth - padding * 2) + padding;
    const y = chartHeight - padding - (d.calories / valueRange) * (chartHeight - padding * 2);
    return `${x},${y}`;
  }).join(' ');
  
  const formatDateLabel = (dateStr: string) => {
      const date = new Date(dateStr);
      const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
      return `${adjustedDate.getMonth() + 1}/${adjustedDate.getDate()}`;
  }

  return (
    <div className="w-full overflow-x-auto text-gray-800 dark:text-gray-200">
      <h3 className="text-center font-semibold mb-2">Daily Calorie Intake (kcal)</h3>
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
        <polyline fill="none" stroke="#FBBF24" strokeWidth="2" points={points} />
        {/* Data points */}
        {chartData.map((d, i) => {
          const x = (i / (chartData.length - 1)) * (chartWidth - padding * 2) + padding;
          const y = chartHeight - padding - (d.calories / valueRange) * (chartHeight - padding * 2);
          return <circle key={i} cx={x} cy={y} r="3" fill="#FBBF24" />;
        })}
      </svg>
    </div>
  );
};

export default NutritionChart;
