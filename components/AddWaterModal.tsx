import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import Spinner from './common/Spinner';

interface AddWaterModalProps {
  onClose: () => void;
}

const AddWaterModal: React.FC<AddWaterModalProps> = ({ onClose }) => {
  const { addWater } = useData();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPreset = (presetAmount: number) => {
    const currentAmount = parseInt(amount, 10) || 0;
    setAmount((currentAmount + presetAmount).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountValue = parseInt(amount, 10);
    if (!isNaN(amountValue) && amountValue > 0) {
      setIsLoading(true);
      await addWater(amountValue);
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Log Water Intake</h2>
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Enter amount in ml"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <div className="flex justify-center space-x-2">
            <button type="button" onClick={() => handleAddPreset(250)} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800">+250 ml</button>
            <button type="button" onClick={() => handleAddPreset(500)} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800">+500 ml</button>
            <button type="button" onClick={() => handleAddPreset(750)} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800">+750 ml</button>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center min-w-[80px]">
            {isLoading ? <Spinner /> : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddWaterModal;