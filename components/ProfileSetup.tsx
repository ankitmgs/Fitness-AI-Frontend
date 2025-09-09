import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { geminiService } from '../services/geminiService';
import { ActivityLevel, Gender, Goal, UserProfile, DailyGoals } from '../types';
import Spinner from './common/Spinner';
import { useAuth } from '../context/AuthContext';

const ProfileSetup: React.FC = () => {
  const { saveProfile } = useData();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.displayName,
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-indigo-200 to-indigo-300 dark:from-gray-900 dark:via-indigo-900 dark:to-gray-800 p-4 animate-fade-in">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl relative overflow-hidden animate-slide-up">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-tr from-indigo-400 via-indigo-600 to-indigo-400 rounded-full blur-2xl opacity-60 animate-pulse-slow z-0" />
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 dark:text-indigo-300 z-10 animate-fade-in">
          Welcome! <span className="block text-lg font-medium text-gray-700 dark:text-gray-200 animate-bounce">Let's set up your profile</span>
        </h2>
        <form className="space-y-5 z-10 relative" onSubmit={handleSubmit}>

          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-indigo-400 transition-all duration-200 text-indigo-700 dark:text-indigo-200"/>
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-indigo-400 transition-all duration-200 text-indigo-700 dark:text-indigo-200"/>
          <input type="number" name="weight" placeholder="Weight (kg)" step="0.1" value={formData.weight} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-indigo-400 transition-all duration-200 text-indigo-700 dark:text-indigo-200"/>
          <input type="number" name="height" placeholder="Height (cm)" value={formData.height} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-indigo-400 transition-all duration-200 text-indigo-700 dark:text-indigo-200"/>

          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-indigo-400 transition-all duration-200 text-indigo-700 dark:text-indigo-200">
            {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full px-4 py-3 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-indigo-400 transition-all duration-200 text-indigo-700 dark:text-indigo-200">
            {Object.values(ActivityLevel).map(al => <option key={al} value={al}>{al}</option>)}
          </select>

          <select name="goal" value={formData.goal} onChange={handleChange} className="w-full px-4 py-3 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-indigo-400 transition-all duration-200 text-indigo-700 dark:text-indigo-200">
            {Object.values(Goal).map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          {error && <p className="text-red-500 text-sm text-center animate-shake">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full px-4 py-3 text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-500 rounded-lg hover:scale-105 hover:shadow-xl transition-all duration-200 disabled:opacity-60 flex justify-center items-center animate-fade-in">
            {isLoading ? <Spinner /> : <span className="tracking-wide font-semibold">Save and Continue</span>}
          </button>
        </form>
        <div className="absolute -bottom-10 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400 via-indigo-600 to-indigo-400 rounded-full blur-2xl opacity-60 animate-pulse-slow z-0" />
      </div>
    </div>
  );
};

export default ProfileSetup;