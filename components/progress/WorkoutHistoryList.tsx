import React, { useState } from 'react';
import { WorkoutLog } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { PencilIcon, TrashIcon } from '../common/Icons';
import { useData } from '../../hooks/useData';
import EditWorkoutModal from '../EditWorkoutModal';
import Spinner from '../common/Spinner';

interface WorkoutHistoryListProps {
  workouts: WorkoutLog[];
}

const WorkoutHistoryList: React.FC<WorkoutHistoryListProps> = ({ workouts }) => {
  const { deleteWorkout } = useData();
  const [editingWorkout, setEditingWorkout] = useState<WorkoutLog | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);

  if (workouts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No workouts logged in this period.</p>
      </div>
    );
  }

  const handleDelete = async (workout: WorkoutLog) => {
    if (window.confirm(`Are you sure you want to delete the workout: "${workout.exerciseType}"?`)) {
        setDeletingWorkoutId(workout.id);
        await deleteWorkout(workout.id);
    }
  };

  const groupedWorkouts = workouts.reduce((acc, workout) => {
    (acc[workout.date] = acc[workout.date] || []).push(workout);
    return acc;
  }, {} as Record<string, WorkoutLog[]>);

  const sortedDates = Object.keys(groupedWorkouts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <>
      {editingWorkout && <EditWorkoutModal workout={editingWorkout} onClose={() => setEditingWorkout(null)} />}
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {sortedDates.map(date => (
          <div key={date}>
            <h3 className="font-semibold text-lg mb-2 sticky top-0 bg-white dark:bg-gray-800 py-1">{formatDate(date)}</h3>
            <div className="space-y-3">
              {groupedWorkouts[date].map(workout => (
                <div key={workout.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                      <div className="mr-4">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={workout.exerciseType}>{workout.exerciseType}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{workout.duration} mins - {workout.intensity}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-sm text-cyan-600 dark:text-cyan-400">-{Math.round(workout.caloriesBurned)} kcal</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                              onClick={() => setEditingWorkout(workout)}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                              aria-label={`Edit ${workout.exerciseType}`}
                          >
                              <PencilIcon />
                          </button>
                          <button
                              onClick={() => handleDelete(workout)}
                              disabled={deletingWorkoutId === workout.id}
                              className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                              aria-label={`Delete ${workout.exerciseType}`}
                          >
                              {deletingWorkoutId === workout.id ? <Spinner className="h-5 w-5" /> : <TrashIcon />}
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

export default WorkoutHistoryList;
