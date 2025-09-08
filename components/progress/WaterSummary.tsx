import React from 'react';
import { WaterLog } from '../../types';

interface WaterSummaryProps {
  waterLogs: WaterLog[];
}

const StatCard: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{unit}</p>
    </div>
);

const WaterSummary: React.FC<WaterSummaryProps> = ({ waterLogs }) => {
    if (waterLogs.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No data available for this period.</p>;
    }

    const totalIntake = waterLogs.reduce((acc, w) => acc + w.amount, 0);
    const uniqueDays = new Set(waterLogs.map(w => w.date)).size;
    const avgIntake = uniqueDays > 0 ? totalIntake / uniqueDays : 0;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard label="Total Intake" value={Math.round(totalIntake).toLocaleString()} unit="ml" />
            <StatCard label="Avg Daily Intake" value={Math.round(avgIntake).toLocaleString()} unit="ml" />
        </div>
    );
};

export default WaterSummary;