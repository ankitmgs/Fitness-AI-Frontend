import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { geminiService } from '../services/geminiService';
import { ActivityLevel, Gender, Goal, UserProfile, DailyGoals } from '../types';
import Spinner from './common/Spinner';
import { useAuth } from '../context/AuthContext';

const ProfileSetup: React.FC = () => {
  const { saveProfile } = useData();
  const { user } = useAuth();

  const getDefaultName = () => {
    if (user?.email) {
      return user.email.split('@')[0]
        .replace(/[._-]/g, ' ') // Replace common separators
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' ');
    }
    return '';
  };

  const [formData, setFormData] = useState({
    name: getDefaultName(),
    age: '',
    weight: '',
    height: '',
    gender: Gender.MALE,
    activityLevel: ActivityLevel.SEDENTARY,
    goal: Goal.MAINTAIN,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const profileData = {
        name: formData.name,
        age: parseInt(formData.age, 10),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        gender: formData.gender as Gender,
        activityLevel: formData.activityLevel as ActivityLevel,
        goal: formData.goal as Goal,
      };

      if (Object.values(profileData).some(v => v === null || v === undefined || (typeof v === 'number' && isNaN(v)))) {
        throw new Error('Please fill out all fields correctly.');
      }

      const macroGoals = await geminiService.calculateDailyGoals(profileData);

      if (!macroGoals) {
        throw new Error('Failed to calculate daily goals. Please try again.');
      }

      const dailyGoals: DailyGoals = {
        ...macroGoals,
        water: 2500, // Default water goal in ml
      };

      const fullProfile: UserProfile = {
        ...profileData,
        dailyGoals,
        reminderSettings: {
          water: { enabled: true, frequency: 120 },
          meal: true,
          goalReached: true,
        },
      };

      await saveProfile(fullProfile);
      // The app will automatically navigate away on successful profile save in App.tsx
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Set Up Your Profile</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
          <input type="number" name="weight" placeholder="Weight (kg)" step="0.1" value={formData.weight} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
          <input type="number" name="height" placeholder="Height (cm)" value={formData.height} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
          
          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
            {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
            {Object.values(ActivityLevel).map(al => <option key={al} value={al}>{al}</option>)}
          </select>

          <select name="goal" value={formData.goal} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
            {Object.values(Goal).map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex justify-center items-center">
            {isLoading ? <Spinner /> : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;