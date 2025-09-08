import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Meal, MealType, Macros } from '../types';
import Spinner from './common/Spinner';

interface EditMealModalProps {
  meal: Meal;
  onClose: () => void;
}

const EditMealModal: React.FC<EditMealModalProps> = ({ meal, onClose }) => {
  const { updateMeal } = useData();
  const [formData, setFormData] = useState<Meal>(meal);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMacroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      macros: {
        ...prev.macros,
        [name]: value === '' ? 0 : parseFloat(value),
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await updateMeal(formData);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Meal Log</h2>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Name</label>
            <input
              type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required
              className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">Description</label>
            <textarea
              name="description" id="description" value={formData.description} onChange={handleInputChange} required rows={3}
              className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
           <div>
            <label htmlFor="date" className="block text-sm font-medium">Date</label>
            <input
              type="date" name="date" id="date" value={formData.date} onChange={handleInputChange} required
              className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
           <div>
            <label htmlFor="mealType" className="block text-sm font-medium">Meal Type</label>
            <select name="mealType" id="mealType" value={formData.mealType} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                {Object.values(MealType).map(mt => <option key={mt} value={mt}>{mt}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(formData.macros) as Array<keyof Macros>).map(macro => (
              <div key={macro}>
                <label htmlFor={macro} className="block text-sm font-medium capitalize">{macro}</label>
                <input
                  type="number" step="0.1" name={macro} id={macro} value={formData.macros[macro]} onChange={handleMacroChange} required
                  className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 flex items-center justify-center min-w-[80px]">
            {isLoading ? <Spinner /> : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMealModal;