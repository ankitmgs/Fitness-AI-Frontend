import React, { useState } from 'react';
import { WaterLog } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { TrashIcon, WaterIcon } from '../common/Icons';
import { useData } from '../../hooks/useData';
import Spinner from '../common/Spinner';

interface WaterHistoryListProps {
  waterLogs: WaterLog[];
}

const WaterHistoryList: React.FC<WaterHistoryListProps> = ({ waterLogs }) => {
  const { deleteWaterLog } = useData();
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);

  if (waterLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No water logged in this period.</p>
      </div>
    );
  }
  
  const handleDelete = async (log: WaterLog) => {
    if (window.confirm(`Are you sure you want to delete the water log for ${formatDate(log.date)}?`)) {
        setDeletingLogId(log.id);
        await deleteWaterLog(log.id);
    }
  };

  // FIX: Corrected the sort function to use the `date` property of the log objects.
  const sortedLogs = [...waterLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      {sortedLogs.map((log) => (
        <div key={log.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <WaterIcon className="w-6 h-6 text-blue-500" />
              <p className="font-semibold text-gray-800 dark:text-gray-200">{formatDate(log.date)}</p>
            </div>
             <div className="flex items-center space-x-3">
                <p className="font-semibold text-lg">{log.amount} ml</p>
                 <button
                    onClick={() => handleDelete(log)}
                    disabled={deletingLogId === log.id}
                    className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    aria-label={`Delete water log for ${log.date}`}
                >
                    {deletingLogId === log.id ? <Spinner /> : <TrashIcon />}
                </button>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WaterHistoryList;