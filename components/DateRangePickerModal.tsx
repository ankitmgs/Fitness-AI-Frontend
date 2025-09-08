import React, { useState } from 'react';
import { formatDateForInput } from '../utils/dateUtils';

interface DateRangePickerModalProps {
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  initialStartDate: Date;
  initialEndDate: Date;
}

const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({ onClose, onApply, initialStartDate, initialEndDate }) => {
  const [startDate, setStartDate] = useState(formatDateForInput(initialStartDate));
  const [endDate, setEndDate] = useState(formatDateForInput(initialEndDate));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(startDate, endDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Select Date Range</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Apply</button>
        </div>
      </form>
    </div>
  );
};

export default DateRangePickerModal;
