import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Intensity, WorkoutLog } from '../types';
import Spinner from './common/Spinner';

interface EditWorkoutModalProps {
  workout: WorkoutLog;
  onClose: () => void;
}

const EditWorkoutModal: React.FC<EditWorkoutModalProps> = ({ workout, onClose }) => {
  const { updateWorkout } = useData();
  const [formData, setFormData] = useState<WorkoutLog>(workout);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = ['duration', 'caloriesBurned'].includes(name);
    setFormData(prev => ({
      ...prev,
      [name]: isNumber ? (value === '' ? 0 : parseFloat(value)) : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await updateWorkout(formData);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Workout Log</h2>
        <div className="space-y-4">
          <input
            type="text" name="exerciseType" placeholder="Exercise" value={formData.exerciseType} onChange={handleChange} required autoFocus
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="number" name="duration" placeholder="Duration (minutes)" value={formData.duration} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="number" name="caloriesBurned" placeholder="Calories Burned" value={formData.caloriesBurned} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
           <input
            type="date" name="date" value={formData.date} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <select 
            name="intensity" value={formData.intensity} onChange={handleChange} 
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            {Object.values(Intensity).map(i => <option key={i} value={i}>{i}</option>)}
          </select>
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

export default EditWorkoutModal;