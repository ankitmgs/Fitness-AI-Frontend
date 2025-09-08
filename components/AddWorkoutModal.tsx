import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Intensity } from '../types';
import Spinner from './common/Spinner';
import { getTodayDateString } from '../utils/dateUtils';

interface AddWorkoutModalProps {
  onClose: () => void;
}

const AddWorkoutModal: React.FC<AddWorkoutModalProps> = ({ onClose }) => {
  const { addWorkout } = useData();
  const [exerciseType, setExerciseType] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<Intensity>(Intensity.MEDIUM);
  const [date, setDate] = useState(getTodayDateString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const durationValue = parseInt(duration, 10);
    if (exerciseType && !isNaN(durationValue) && durationValue > 0) {
      setIsSaving(true);
      await addWorkout({
        exerciseType,
        duration: durationValue,
        intensity,
        date,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Log a Workout</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Exercise (e.g., Running, Weightlifting)"
            value={exerciseType}
            onChange={(e) => setExerciseType(e.target.value)}
            required
            autoFocus
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
           <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <select 
            value={intensity} 
            onChange={(e) => setIntensity(e.target.value as Intensity)} 
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            {Object.values(Intensity).map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400">Cancel</button>
          <button type="submit" disabled={isSaving} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-cyan-400 flex items-center justify-center min-w-[150px]">
            {isSaving ? <Spinner className="text-white" /> : 'Calculate & Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddWorkoutModal;