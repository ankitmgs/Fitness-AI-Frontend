import React from 'react';
import { Meal, Macros } from '../../types';

interface ProgressSummaryProps {
  meals: Meal[];
  // FIX: Added 'custom' to the period type to match usage in Progress.tsx
  period: 'today' | 'week' | 'month' | 'custom';
}

const StatCard: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{unit}</p>
    </div>
);


const ProgressSummary: React.FC<ProgressSummaryProps> = ({ meals, period }) => {
    if (meals.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No data available for this period.</p>;
    }

    const uniqueDays = new Set(meals.map(m => m.date)).size;
    const daysInPeriod = period === 'today' ? 1 : uniqueDays > 0 ? uniqueDays : 1;

    const totalMacros = meals.reduce((acc, meal) => {
        acc.calories += meal.macros.calories;
        acc.protein += meal.macros.protein;
        acc.carbs += meal.macros.carbs;
        acc.fat += meal.macros.fat;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    const avgMacros: Macros = {
        calories: totalMacros.calories / daysInPeriod,
        protein: totalMacros.protein / daysInPeriod,
        carbs: totalMacros.carbs / daysInPeriod,
        fat: totalMacros.fat / daysInPeriod
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Avg Daily Calories" value={Math.round(avgMacros.calories).toLocaleString()} unit="kcal" />
            <StatCard label="Avg Daily Protein" value={Math.round(avgMacros.protein).toString()} unit="grams" />
            <StatCard label="Avg Daily Carbs" value={Math.round(avgMacros.carbs).toString()} unit="grams" />
            <StatCard label="Avg Daily Fat" value={Math.round(avgMacros.fat).toString()} unit="grams" />
        </div>
    );
};

export default ProgressSummary;