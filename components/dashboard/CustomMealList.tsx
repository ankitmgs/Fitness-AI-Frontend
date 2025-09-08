import React, { useState } from 'react';
import { CustomMeal, MealType } from '../../types';
import { useData } from '../../hooks/useData';
import Spinner from '../common/Spinner';
import { PencilIcon, TrashIcon } from '../common/Icons';
import EditCustomMealModal from '../EditCustomMealModal';

interface CustomMealListProps {
  customMeals: CustomMeal[];
}

const CustomMealList: React.FC<CustomMealListProps> = ({ customMeals }) => {
  const { addMeal, deleteCustomMeal } = useData();
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.SNACK);
  const [editingMeal, setEditingMeal] = useState<CustomMeal | null>(null);
  const [loggingMealId, setLoggingMealId] = useState<string | null>(null);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  if (customMeals.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">Your favorite meals will appear here once you save them.</p>
      </div>
    );
  }

  const handleLogClick = (mealId: string) => {
    setExpandedMealId(mealId === expandedMealId ? null : mealId);
  };

  const handleConfirmLog = async (meal: CustomMeal) => {
    setLoggingMealId(meal.id);
    await addMeal({
      name: meal.name,
      description: meal.description,
      macros: meal.macros,
      mealType: selectedMealType,
    });
    setLoggingMealId(null);
    setExpandedMealId(null); // Close the selector after logging
  };
  
  const handleDelete = async (meal: CustomMeal) => {
    if (window.confirm(`Are you sure you want to delete "${meal.name}"?`)) {
      setDeletingMealId(meal.id);
      await deleteCustomMeal(meal.id);
    }
  };

  return (
    <>
      {editingMeal && <EditCustomMealModal meal={editingMeal} onClose={() => setEditingMeal(null)} />}
      <div className="space-y-3">
        {customMeals.map(meal => (
          <div key={meal.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{meal.name}</p>
                <p className="text-sm text-gray-500">{Math.round(meal.macros.calories)} kcal</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setEditingMeal(meal)}
                  className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={`Edit ${meal.name}`}
                >
                  <PencilIcon />
                </button>
                 <button 
                  onClick={() => handleDelete(meal)}
                  disabled={deletingMealId === meal.id}
                  className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  aria-label={`Delete ${meal.name}`}
                >
                  {deletingMealId === meal.id ? <Spinner /> : <TrashIcon />}
                </button>
                <button 
                  onClick={() => handleLogClick(meal.id)}
                  className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                >
                  Log
                </button>
              </div>
            </div>
            {expandedMealId === meal.id && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <select 
                    value={selectedMealType} 
                    onChange={(e) => setSelectedMealType(e.target.value as MealType)} 
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  >
                    {Object.values(MealType).map(mt => <option key={mt} value={mt}>{mt}</option>)}
                  </select>
                  <button 
                    onClick={() => handleConfirmLog(meal)} 
                    disabled={loggingMealId === meal.id}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center min-w-[100px]"
                  >
                    {loggingMealId === meal.id ? <Spinner className="text-white" /> : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default CustomMealList;