import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { WeightLog } from '../types';
import Spinner from './common/Spinner';

interface EditWeightModalProps {
  log: WeightLog;
  onClose: () => void;
}

const EditWeightModal: React.FC<EditWeightModalProps> = ({ log, onClose }) => {
  const { updateWeightLog } = useData();
  const [weight, setWeight] = useState(log.weight.toString());
  const [date, setDate] = useState(log.date);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weightValue = parseFloat(weight);
    if (!isNaN(weightValue) && weightValue > 0) {
      setIsLoading(true);
      await updateWeightLog({ ...log, weight: weightValue, date });
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Edit Weight Log</h2>
        <div className="space-y-4">
            <input
              type="number"
              step="0.1"
              placeholder="Enter weight in kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
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

export default EditWeightModal;