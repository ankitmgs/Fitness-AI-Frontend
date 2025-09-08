import React from 'react';
import { WorkoutLog } from '../../types';

interface WorkoutSummaryProps {
  workouts: WorkoutLog[];
}

const StatCard: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{unit}</p>
    </div>
);

const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ workouts }) => {
    if (workouts.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No data available for this period.</p>;
    }

    const totalCaloriesBurned = workouts.reduce((acc, w) => acc + w.caloriesBurned, 0);
    const totalDuration = workouts.reduce((acc, w) => acc + w.duration, 0);
    const avgDuration = workouts.length > 0 ? totalDuration / workouts.length : 0;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Total Calories Burned" value={Math.round(totalCaloriesBurned).toLocaleString()} unit="kcal" />
            <StatCard label="Total Workouts" value={workouts.length.toString()} unit="sessions" />
            <StatCard label="Avg Duration" value={Math.round(avgDuration).toString()} unit="minutes" />
        </div>
    );
};

export default WorkoutSummary;
