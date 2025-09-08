import React, { useState } from 'react';
import { WeightLog } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { PencilIcon, TrashIcon, WeightIcon } from '../common/Icons';
import { useData } from '../../hooks/useData';
import EditWeightModal from '../EditWeightModal';
import Spinner from '../common/Spinner';

interface WeightHistoryListProps {
  weightLogs: WeightLog[];
}

const WeightHistoryList: React.FC<WeightHistoryListProps> = ({ weightLogs }) => {
  const { deleteWeightLog } = useData();
  const [editingLog, setEditingLog] = useState<WeightLog | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);

  if (weightLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No weight logged in this period.</p>
      </div>
    );
  }

  const handleDelete = async (log: WeightLog) => {
    if (window.confirm(`Are you sure you want to delete the weight log for ${formatDate(log.date)}?`)) {
        setDeletingLogId(log.id);
        await deleteWeightLog(log.id);
    }
  };

  const sortedLogs = [...weightLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      {editingLog && <EditWeightModal log={editingLog} onClose={() => setEditingLog(null)} />}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {sortedLogs.map((log) => (
          <div key={log.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <WeightIcon className="w-6 h-6 text-green-500" />
                <p className="font-semibold text-gray-800 dark:text-gray-200">{formatDate(log.date)}</p>
              </div>
              <div className="flex items-center space-x-3">
                  <p className="font-semibold text-lg">{log.weight} kg</p>
                  <button
                      onClick={() => setEditingLog(log)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label={`Edit weight for ${log.date}`}
                  >
                      <PencilIcon />
                  </button>
                  <button
                      onClick={() => handleDelete(log)}
                      disabled={deletingLogId === log.id}
                      className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      aria-label={`Delete weight for ${log.date}`}
                  >
                      {deletingLogId === log.id ? <Spinner /> : <TrashIcon />}
                  </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default WeightHistoryList;
