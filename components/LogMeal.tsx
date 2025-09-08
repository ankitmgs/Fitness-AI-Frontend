import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { useData } from '../hooks/useData';
import { MealType, Macros } from '../types';
import Spinner from './common/Spinner';
import { getTodayDateString } from '../utils/dateUtils';

interface LogMealProps {
  onClose: () => void;
  initialData?: { name: string; description: string; macros: Macros } | null;
}

const LogMeal: React.FC<LogMealProps> = ({ onClose, initialData }) => {
  const { addMeal, addCustomMeal } = useData();
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState<MealType>(MealType.LUNCH);
  const [date, setDate] = useState(getTodayDateString());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ name: string; macros: Macros } | null>(null);
  const [saveAsCustom, setSaveAsCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setAnalysisResult({ name: initialData.name, macros: initialData.macros });
    }
  }, [initialData]);

  const handleAnalyze = async () => {
    if (!description) {
      setError('Please enter a meal description.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    const result = await geminiService.analyzeMeal(description);
    if (result) {
      setAnalysisResult(result);
    } else {
      setError('Could not analyze meal. Please try again or enter macros manually.');
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!analysisResult) {
      setError('Please analyze the meal before saving.');
      return;
    }
    
    setIsSaving(true);

    if (saveAsCustom) {
      await addCustomMeal({
        name: analysisResult.name,
        description,
        macros: analysisResult.macros,
      });
    }

    await addMeal({
      name: analysisResult.name,
      description,
      macros: analysisResult.macros,
      mealType,
      date,
    });
    onClose();
  };
  
  const handleAnalysisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (analysisResult) {
        const isMacro = ['calories', 'protein', 'carbs', 'fat'].includes(name);

        if (isMacro) {
            setAnalysisResult(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    macros: {
                        ...prev.macros,
                        [name]: value === '' ? 0 : parseFloat(value)
                    }
                };
            });
        } else { // It's the 'name' field
             setAnalysisResult(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    [name]: value
                };
            });
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{initialData ? 'AI Meal Suggestion' : 'Log a Meal'}</h2>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          <textarea
            placeholder="Describe your meal... (e.g., 'A bowl of pasta with tomato sauce and meatballs')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
            {Object.values(MealType).map(mt => <option key={mt} value={mt}>{mt}</option>)}
          </select>
          <button onClick={handleAnalyze} disabled={isLoading} className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex justify-center">
            {isLoading ? <Spinner className="text-white" /> : 'Analyze with AI'}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          {analysisResult && (
            <div className="mt-4 space-y-4">
                <div className="p-4 border dark:border-gray-600 rounded-md">
                    <h3 className="font-semibold mb-3">Analysis Result (Editable)</h3>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="mealName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meal Name</label>
                            <input
                                type="text"
                                name="name"
                                id="mealName"
                                value={analysisResult.name}
                                onChange={handleAnalysisChange}
                                className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {(Object.keys(analysisResult.macros) as Array<keyof Macros>).map(macro => (
                                <div key={macro}>
                                    <label htmlFor={macro} className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{macro === 'calories' ? `${macro} (kcal)` : `${macro} (g)`}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name={macro}
                                        id={macro}
                                        value={Math.round(analysisResult.macros[macro] * 10) / 10}
                                        onChange={handleAnalysisChange}
                                        className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="save-custom"
                        checked={saveAsCustom}
                        onChange={(e) => setSaveAsCustom(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="save-custom" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Save as a favorite meal
                    </label>
                </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400">Cancel</button>
          <button onClick={handleSave} disabled={!analysisResult || isSaving} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 flex items-center justify-center min-w-[100px]">
            {isSaving ? <Spinner className="text-white" /> : 'Save Meal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogMeal;