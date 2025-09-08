import React from 'react';
import { WorkoutLog } from '../../types';
import { DumbbellIcon } from '../common/Icons';

interface WorkoutListProps {
  workouts: WorkoutLog[];
}

const WorkoutList: React.FC<WorkoutListProps> = ({ workouts }) => {
  if (workouts.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">No workouts logged for today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map(workout => (
        <div key={workout.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <DumbbellIcon className="w-8 h-8 text-cyan-500 mr-4"/>
                    <div>
                        <p className="font-semibold">{workout.exerciseType}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{workout.duration} mins - {workout.intensity}</p>
                    </div>
                </div>
              <div className="text-right">
                <p className="font-semibold text-lg text-cyan-600 dark:text-cyan-400">-{Math.round(workout.caloriesBurned)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">kcal</p>
              </div>
            </div>
        </div>
      ))}
    </div>
  );
};

export default WorkoutList;