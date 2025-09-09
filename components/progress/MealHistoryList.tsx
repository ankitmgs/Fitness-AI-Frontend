import React, { useState } from "react";
import { Meal } from "../../types";
import { formatDate } from "../../utils/dateUtils";
import { PencilIcon, TrashIcon } from "../common/Icons";
import { useData } from "../../hooks/useData";
import EditMealModal from "../EditMealModal";
import Spinner from "../common/Spinner";

interface MealHistoryListProps {
  meals: Meal[];
}

const MealHistoryList: React.FC<MealHistoryListProps> = ({ meals }) => {
  const { deleteMeal } = useData();
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  if (meals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No meals logged in this period.
        </p>
      </div>
    );
  }

  const handleDelete = async (meal: Meal) => {
    if (window.confirm(`Are you sure you want to delete "${meal.name}"?`)) {
      setDeletingMealId(meal.id);
      await deleteMeal(meal.id);
    }
  };

  const groupedMeals = meals.reduce((acc, meal) => {
    (acc[meal.date] = acc[meal.date] || []).push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);

  const sortedDates = Object.keys(groupedMeals).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <>
      {editingMeal && (
        <EditMealModal
          meal={editingMeal}
          onClose={() => setEditingMeal(null)}
        />
      )}
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {sortedDates.map((date) => (
          <div key={date}>
            <h3 className="font-semibold text-lg mb-2 sticky top-0 bg-white dark:bg-gray-800 py-1">
              {formatDate(date)}
            </h3>
            <div className="space-y-3">
              {groupedMeals[date].map((meal) => (
                <div
                  key={meal.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-md w-full"
                >
                  <div className="flex justify-between items-center w-full p-3">
                    <div className="flex-1 mr-4 min-w-0">
                      <p
                        className="font-semibold text-gray-800 dark:text-gray-200 truncate"
                        title={meal.name}
                      >
                        {meal.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {meal.mealType}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-sm">
                          {Math.round(meal.macros.calories)} kcal
                        </p>
                        <p className="text-xs text-gray-500">
                          P:{Math.round(meal.macros.protein)} C:
                          {Math.round(meal.macros.carbs)} F:
                          {Math.round(meal.macros.fat)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setEditingMeal(meal)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                          aria-label={`Edit ${meal.name}`}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(meal)}
                          disabled={deletingMealId === meal.id}
                          className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                          aria-label={`Delete ${meal.name}`}
                        >
                          {deletingMealId === meal.id ? (
                            <Spinner className="h-5 w-5" />
                          ) : (
                            <TrashIcon />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MealHistoryList;
