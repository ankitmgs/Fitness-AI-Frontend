import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../hooks/useData';
import Spinner from './common/Spinner';
import { PencilIcon, CheckIcon, UserCircleIcon } from './common/Icons';
import { DailyGoals, ReminderSettings } from '../types';
import ToggleSwitch from './common/ToggleSwitch';

const Profile: React.FC = () => {
  const { logout, user } = useAuth();
  const { profile, saveProfile, isLoading } = useData();
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [customGoals, setCustomGoals] = useState<DailyGoals | null>(null);
  const [isSavingGoals, setIsSavingGoals] = useState(false);

  // State for custom water reminder frequency
  const [isCustomFrequency, setIsCustomFrequency] = useState(false);
  const [customFrequencyValue, setCustomFrequencyValue] = useState('');
  const [selectedDropdownFrequency, setSelectedDropdownFrequency] = useState('');

  useEffect(() => {
    if (profile) {
      const standardFrequencies = ['60', '120', '180', '240'];
      const currentFreq = String(profile.reminderSettings.water.frequency);
      if (standardFrequencies.includes(currentFreq)) {
        setIsCustomFrequency(false);
        setSelectedDropdownFrequency(currentFreq);
      } else {
        setIsCustomFrequency(true);
        setSelectedDropdownFrequency('custom');
        setCustomFrequencyValue(currentFreq);
      }
    }
  }, [profile?.reminderSettings.water.frequency]);

  if (!profile) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }
  
  const handleEditGoals = () => {
    setCustomGoals(profile.dailyGoals);
    setIsEditingGoals(true);
  };
  
  const handleCancelEditGoals = () => {
    setIsEditingGoals(false);
    setCustomGoals(null);
  }

  const handleGoalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (customGoals) {
        // Allow empty string for typing, but treat it as 0
        const numericValue = value === '' ? 0 : parseInt(value, 10);
        setCustomGoals({
            ...customGoals,
            [name]: isNaN(numericValue) ? 0 : numericValue,
        });
    }
  };

  const handleSaveGoals = async () => {
    if (!profile || !customGoals) return;
    
    setIsSavingGoals(true);
    const updatedProfile = { ...profile, dailyGoals: customGoals };
    await saveProfile(updatedProfile);
    setIsSavingGoals(false);
    setIsEditingGoals(false);
    setCustomGoals(null);
  };

  const handleReminderSettingChange = async (key: keyof ReminderSettings, value: any) => {
    if (!profile) return;

    let newReminderSettings = { ...profile.reminderSettings };

    if (key === 'water') {
      newReminderSettings.water = { ...newReminderSettings.water, ...value };
    } else {
      newReminderSettings[key] = value;
    }

    const updatedProfile = {
      ...profile,
      reminderSettings: newReminderSettings,
    };
    await saveProfile(updatedProfile);
  };

  const handleFrequencyDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDropdownFrequency(value);
    if (value === 'custom') {
      setIsCustomFrequency(true);
    } else {
      setIsCustomFrequency(false);
      handleReminderSettingChange('water', { frequency: parseInt(value, 10) });
    }
  };

  const handleCustomFrequencyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomFrequencyValue(value);
    const minutes = parseInt(value, 10);
    if (!isNaN(minutes) && minutes > 0) {
      handleReminderSettingChange('water', { frequency: minutes });
    }
  };

  const profileDetails = [
    { label: 'Age', value: profile.age },
    { label: 'Weight', value: `${profile.weight} kg` },
    { label: 'Height', value: `${profile.height} cm` },
    { label: 'Gender', value: profile.gender },
    { label: 'Activity Level', value: profile.activityLevel },
    { label: 'Goal', value: profile.goal },
  ];

  const goalDetails = [
    { name: 'calories', label: 'Calories', value: `${Math.round(profile.dailyGoals.calories)} kcal` },
    { name: 'protein', label: 'Protein', value: `${Math.round(profile.dailyGoals.protein)} g` },
    { name: 'carbs', label: 'Carbs', value: `${Math.round(profile.dailyGoals.carbs)} g` },
    { name: 'fat', label: 'Fat', value: `${Math.round(profile.dailyGoals.fat)} g` },
    { name: 'water', label: 'Water', value: `${Math.round(profile.dailyGoals.water)} ml` },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex flex-col items-center">
            {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-24 h-24 rounded-full" referrerPolicy="no-referrer" />
            ) : (
                <UserCircleIcon className="w-24 h-24 text-gray-400" />
            )}
            <h2 className="text-2xl font-bold text-center mt-4">{profile.name}</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{user?.email}</p>
        </div>
        
        <h3 className="text-lg font-semibold mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">Your Details</h3>
        <div className="space-y-2">
          {profileDetails.map(detail => (
            <div key={detail.label} className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{detail.label}</span>
              <span className="font-medium">{detail.value}</span>
            </div>
          ))}
        </div>
      </div>

       <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Daily Goals</h2>
          {!isEditingGoals && (
             <button onClick={handleEditGoals} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center text-sm font-medium">
                <PencilIcon className="w-4 h-4 mr-1"/>
                Edit
            </button>
          )}
        </div>
        {isEditingGoals && customGoals ? (
             <div className="space-y-3">
                {goalDetails.map(goal => (
                     <div key={goal.name} className="flex items-center justify-between">
                         <label htmlFor={`custom-${goal.name}`} className="text-gray-500 dark:text-gray-400 capitalize">{goal.label}</label>
                         <div className="flex items-center">
                            <input
                                id={`custom-${goal.name}`}
                                name={goal.name}
                                type="number"
                                value={customGoals[goal.name as keyof DailyGoals]}
                                onChange={handleGoalInputChange}
                                className="w-28 px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-right"
                            />
                             <span className="ml-2 font-medium w-8 text-left">{goal.name === 'calories' ? 'kcal' : goal.name === 'water' ? 'ml' : 'g'}</span>
                         </div>
                    </div>
                ))}
                 <div className="flex justify-end space-x-2 pt-2">
                    <button onClick={handleCancelEditGoals} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-sm rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSaveGoals} disabled={isSavingGoals || isLoading} className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 disabled:bg-green-300 flex items-center justify-center min-w-[70px]">
                        {isSavingGoals ? <Spinner className="text-white" /> : 'Save'}
                    </button>
                </div>
             </div>
        ) : (
             <div className="space-y-2">
              {goalDetails.map(detail => (
                <div key={detail.label} className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{detail.label}</span>
                  <span className="font-medium">{detail.value}</span>
                </div>
              ))}
            </div>
        )}
      </div>

       <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Reminder Settings</h2>
        <div className="space-y-4">
          {/* Water Reminder Section */}
          <div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Water Intake Reminders</span>
              <ToggleSwitch
                checked={profile.reminderSettings.water.enabled}
                onChange={(value) => handleReminderSettingChange('water', { enabled: value })}
                disabled={isLoading}
              />
            </div>
            {profile.reminderSettings.water.enabled && (
              <div className="pl-4 mt-3 space-y-3">
                <label htmlFor="water-frequency" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Remind me every</label>
                <select
                  id="water-frequency"
                  name="water-frequency"
                  value={selectedDropdownFrequency}
                  onChange={handleFrequencyDropdownChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={60}>1 Hour</option>
                  <option value={120}>2 Hours</option>
                  <option value={180}>3 Hours</option>
                  <option value={240}>4 Hours</option>
                  <option value="custom">Custom...</option>
                </select>
                {isCustomFrequency && (
                     <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={customFrequencyValue}
                            onChange={handleCustomFrequencyInputChange}
                            placeholder="e.g., 90"
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                         <span className="text-gray-500 dark:text-gray-400">minutes</span>
                     </div>
                )}
              </div>
            )}
          </div>

          {/* Other Reminders */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Meal Logging Reminders</span>
            <ToggleSwitch
              checked={profile.reminderSettings.meal}
              onChange={(value) => handleReminderSettingChange('meal', value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Daily Goal Reached Alert</span>
            <ToggleSwitch
              checked={profile.reminderSettings.goalReached}
              onChange={(value) => handleReminderSettingChange('goalReached', value)}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={logout}
        className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Log Out
      </button>
    </div>
  );
};

export default Profile;