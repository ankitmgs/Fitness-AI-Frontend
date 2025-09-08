import React from 'react';
import { Meal } from '../../types';

interface MealListProps {
  meals: Meal[];
}

const MealList: React.FC<MealListProps> = ({ meals }) => {
  if (meals.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">No meals logged for today yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meals.map(meal => (
        <div key={meal.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-semibold">{meal.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{meal.mealType}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{meal.description}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="font-semibold">{Math.round(meal.macros.calories)} kcal</p>
              <p className="text-xs text-gray-500">P: {Math.round(meal.macros.protein)}g</p>
              <p className="text-xs text-gray-500">C: {Math.round(meal.macros.carbs)}g</p>
              <p className="text-xs text-gray-500">F: {Math.round(meal.macros.fat)}g</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MealList;
