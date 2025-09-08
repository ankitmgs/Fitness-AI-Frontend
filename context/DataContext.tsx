import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import type { UserProfile, Meal, WeightLog, WaterLog, WorkoutLog, DailyGoals, Intensity, CustomMeal, MealType } from '../types';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { getTodayDateString } from '../utils/dateUtils';
import { useAuth } from './AuthContext';
import { geminiService } from '../services/geminiService';
import { DEV_MODE, mockProfile } from '../config';

interface DataContextState {
  profile: UserProfile | null;
  meals: Meal[]; // Today's meals
  allMeals: Meal[]; // All historical meals
  workouts: WorkoutLog[]; // Today's workouts
  allWorkouts: WorkoutLog[]; // All historical workouts
  customMeals: CustomMeal[];
  weightLogs: WeightLog[];
  waterLog: WaterLog; // Today's water log
  allWaterLogs: WaterLog[]; // All historical water logs
  adjustedDailyGoals: DailyGoals | null;
  isLoading: boolean;
  isInitialized: boolean;
  saveProfile: (profile: UserProfile) => Promise<void>;
  addMeal: (mealData: Omit<Meal, 'id' | 'date'> & { date?: string }) => Promise<void>;
  updateMeal: (meal: Meal) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  addCustomMeal: (customMealData: Omit<CustomMeal, 'id'>) => Promise<void>;
  updateCustomMeal: (meal: CustomMeal) => Promise<void>;
  deleteCustomMeal: (mealId: string) => Promise<void>;
  addWorkout: (workout: Omit<WorkoutLog, 'id' | 'date' | 'caloriesBurned'> & { date?: string }) => Promise<void>;
  updateWorkout: (workout: WorkoutLog) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  addWeightLog: (weight: number, date?: string) => Promise<void>;
  updateWeightLog: (log: WeightLog) => Promise<void>;
  deleteWeightLog: (logId: string) => Promise<void>;
  addWater: (amount: number) => Promise<void>;
  deleteWaterLog: (logId: string) => Promise<void>;
  resetTodaysWaterLog: () => Promise<void>;
}

export const DataContext = createContext<DataContextState | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]); // Today's meals
  const [allMeals, setAllMeals] = useState<Meal[]>([]); // All meals
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]); // Today's workouts
  const [allWorkouts, setAllWorkouts] = useState<WorkoutLog[]>([]); // All workouts
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [waterLog, setWaterLog] = useState<WaterLog>({ id: '', date: getTodayDateString(), amount: 0 });
  const [allWaterLogs, setAllWaterLogs] = useState<WaterLog[]>([]);
  const [adjustedDailyGoals, setAdjustedDailyGoals] = useState<DailyGoals | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const userId = user?.uid;

  const refreshData = useCallback(async () => {
    if (DEV_MODE) {
      console.log("DEV_MODE: Loading mock data.");
      setIsLoading(true);
      setProfile(mockProfile);
      setAdjustedDailyGoals(mockProfile.dailyGoals);
      setWaterLog({ id: 'dev-water-log', date: getTodayDateString(), amount: 1250 });
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    if (!user) return;
    setIsLoading(true);
    const today = getTodayDateString();
    
    try {
      const token = await user.getIdToken();
      const fetchedProfile = await storageService.getProfile(token);
      
      if (fetchedProfile) {
        const [fetchedAllMeals, fetchedWeightLogs, fetchedAllWaterLogs, fetchedAllWorkouts, fetchedCustomMeals] = await Promise.all([
          storageService.getAllMeals(token),
          storageService.getWeightHistory(token),
          storageService.getAllWaterLogs(token),
          storageService.getAllWorkouts(token),
          storageService.getCustomMeals(token),
        ]);

        const todayMeals = fetchedAllMeals.filter(meal => meal.date === today);
        const todayWorkouts = fetchedAllWorkouts.filter(workout => workout.date === today);
        const todayWaterLog = fetchedAllWaterLogs.find(log => log.date === today) || { id: '', date: today, amount: 0 };
        
        setProfile(fetchedProfile);
        setAllMeals(fetchedAllMeals);
        setAllWorkouts(fetchedAllWorkouts);
        setMeals(todayMeals);
        setWorkouts(todayWorkouts);
        setWeightLogs(fetchedWeightLogs);
        setAllWaterLogs(fetchedAllWaterLogs);
        setWaterLog(todayWaterLog);
        setCustomMeals(fetchedCustomMeals);

        // Adjust daily goals based on today's workouts
        const caloriesBurned = todayWorkouts.reduce((acc, w) => acc + w.caloriesBurned, 0);
        setAdjustedDailyGoals({
          ...fetchedProfile.dailyGoals,
          calories: fetchedProfile.dailyGoals.calories + caloriesBurned
        });
      } else {
        // If no profile, reset all data states
        setProfile(null);
        setAllMeals([]);
        setAllWorkouts([]);
        setMeals([]);
        setWorkouts([]);
        setWeightLogs([]);
        setAllWaterLogs([]);
        setWaterLog({ id: '', date: today, amount: 0 });
        setCustomMeals([]);
      }
    } catch (error) {
        console.error("Failed to refresh data:", error);
        // Handle error state if necessary
    } finally {
        setIsLoading(false);
        setIsInitialized(true);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else if (!DEV_MODE) {
      // If user logs out, clear all data and reset state
      setIsInitialized(false);
      setProfile(null);
    }
  }, [user, refreshData]);

  // Handle Notifications
  useEffect(() => {
    if (!profile || !profile.reminderSettings.goalReached || !adjustedDailyGoals) return;

    const consumedCalories = meals.reduce((acc, meal) => acc + meal.macros.calories, 0);
    const goalCalories = adjustedDailyGoals.calories;

    if (consumedCalories >= goalCalories) {
      const today = getTodayDateString();
      const notificationKey = `goalReached_${today}_${userId}`;
      if (!sessionStorage.getItem(notificationKey)) {
        notificationService.sendNotification(
          "Goal Achieved! 🎉",
          { body: `You've reached your daily calorie goal of ${Math.round(goalCalories)} kcal!` }
        );
        sessionStorage.setItem(notificationKey, 'true');
      }
    }
  }, [meals, profile, adjustedDailyGoals, userId]);

  const saveProfile = async (newProfile: UserProfile) => {
    if (DEV_MODE) {
      setProfile(newProfile);
      console.log("DEV_MODE: Profile saved locally", newProfile);
      return;
    }
    if (!user) return;
    setIsLoading(true);
    const token = await user.getIdToken();
    const savedProfile = await storageService.saveProfile(token, newProfile);
    setProfile(savedProfile);
    await refreshData(); // Refresh all data after profile update
    setIsLoading(false);
  };

  const addMeal = async (mealData: Omit<Meal, 'id' | 'date'> & { date?: string }) => {
    if (DEV_MODE) {
      const newMeal: Meal = {
          ...mealData,
          id: `dev-meal-${Date.now()}`,
          date: mealData.date || getTodayDateString(),
      };
      setAllMeals(prev => [...prev, newMeal].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      if (newMeal.date === getTodayDateString()) {
          setMeals(prev => [...prev, newMeal]);
      }
      console.log("DEV_MODE: Meal added locally", newMeal);
      return;
    }
    if (!user) return;
    setIsLoading(true);
    const token = await user.getIdToken();
    const newMealData: Omit<Meal, 'id'> = {
      ...mealData,
      date: mealData.date || getTodayDateString(),
    };
    await storageService.addMeal(token, newMealData);
    await refreshData();
    setIsLoading(false);
  };

  const updateMeal = async (meal: Meal) => {
    if (DEV_MODE) {
      setAllMeals(prev => prev.map(m => m.id === meal.id ? meal : m));
      if(meal.date === getTodayDateString()) {
        setMeals(prev => prev.map(m => m.id === meal.id ? meal : m));
      }
      console.log("DEV_MODE: Meal updated locally", meal);
      return;
    }
    if (!user) return;
    const token = await user.getIdToken();
    const updatedMeal = await storageService.updateMeal(token, meal);
    await refreshData(); // Easiest way to ensure all state is consistent
  };

  const deleteMeal = async (mealId: string) => {
    if (DEV_MODE) {
      setAllMeals(prev => prev.filter(m => m.id !== mealId));
      setMeals(prev => prev.filter(m => m.id !== mealId));
      console.log("DEV_MODE: Meal deleted locally", mealId);
      return;
    }
    if (!user) return;
    const token = await user.getIdToken();
    await storageService.deleteMeal(token, mealId);
    await refreshData();
  };

  const addCustomMeal = async (customMealData: Omit<CustomMeal, 'id'>) => {
    if (DEV_MODE) {
      const newCustomMeal: CustomMeal = {
          ...customMealData,
          id: `dev-custom-meal-${Date.now()}`,
      };
      setCustomMeals(prev => [...prev, newCustomMeal]);
      console.log("DEV_MODE: Custom Meal saved locally", newCustomMeal);
      return;
    }
    if (!user) return;
    const token = await user.getIdToken();
    await storageService.addCustomMeal(token, customMealData);
    const fetchedCustomMeals = await storageService.getCustomMeals(token);
    setCustomMeals(fetchedCustomMeals);
  };

  const updateCustomMeal = async (meal: CustomMeal) => {
    if (DEV_MODE) {
      setCustomMeals(prev => prev.map(m => m.id === meal.id ? meal : m));
      console.log("DEV_MODE: Custom Meal updated locally", meal);
      return;
    }
    if (!user) return;
    const token = await user.getIdToken();
    const updatedMeal = await storageService.updateCustomMeal(token, meal);
    setCustomMeals(prev => prev.map(m => m.id === updatedMeal.id ? updatedMeal : m));
  };
  
  const deleteCustomMeal = async (mealId: string) => {
    if (DEV_MODE) {
      setCustomMeals(prev => prev.filter(m => m.id !== mealId));
      console.log("DEV_MODE: Custom Meal deleted locally", mealId);
      return;
    }
    if (!user) return;
    const token = await user.getIdToken();
    await storageService.deleteCustomMeal(token, mealId);
    setCustomMeals(prev => prev.filter(m => m.id !== mealId));
  };

  const addWorkout = async (workout: Omit<WorkoutLog, 'id' | 'date' | 'caloriesBurned'> & { date?: string }) => {
     if (DEV_MODE) {
      const newWorkout: WorkoutLog = {
          ...workout,
          id: `dev-workout-${Date.now()}`,
          date: workout.date || getTodayDateString(),
          // Mock calorie burn calculation
          caloriesBurned: Math.round(workout.duration * 7.5), 
      };
      setAllWorkouts(prev => [...prev, newWorkout].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
       if (newWorkout.date === getTodayDateString()) {
          setWorkouts(prev => [...prev, newWorkout]);
      }
      console.log("DEV_MODE: Workout added locally", newWorkout);
      return;
    }
    if (!user || !profile) return;
    setIsLoading(true);
    const token = await user.getIdToken();
    const caloriesBurned = await geminiService.estimateCaloriesBurned({
      ...workout,
      userWeight: profile.weight
    });

    if (caloriesBurned !== null) {
      const newWorkoutData: Omit<WorkoutLog, 'id'> = {
        ...workout,
        date: workout.date || getTodayDateString(),
        caloriesBurned: caloriesBurned,
      };
      await storageService.addWorkout(token, newWorkoutData);
      await refreshData();
    } else {
       alert("Could not estimate calories burned. Please try again.");
    }
    setIsLoading(false);
  };

  const updateWorkout = async (workout: WorkoutLog) => {
    if (DEV_MODE) {
        setAllWorkouts(prev => prev.map(w => w.id === workout.id ? workout : w));
        if (workout.date === getTodayDateString()) {
            setWorkouts(prev => prev.map(w => w.id === workout.id ? workout : w));
        } else {
            // If date was changed away from today, remove from today's list
            setWorkouts(prev => prev.filter(w => w.id !== workout.id));
        }
        console.log("DEV_MODE: Workout updated locally", workout);
        return;
    }
    if (!user) return;
    const token = await user.getIdToken();
    await storageService.updateWorkout(token, workout);
    await refreshData();
  };

  const deleteWorkout = async (workoutId: string) => {
    if (DEV_MODE) {
        setAllWorkouts(prev => prev.filter(w => w.id !== workoutId));
        setWorkouts(prev => prev.filter(w => w.id !== workoutId));
        console.log("DEV_MODE: Workout deleted locally", workoutId);
        return;
    }
    if (!user) return;
    const token = await user.getIdToken();
    await storageService.deleteWorkout(token, workoutId);
    await refreshData();
  };


  const addWeightLog = async (weight: number, date?: string) => {
    if (DEV_MODE) {
      const logDate = date || getTodayDateString();
      const newLog: WeightLog = { id: `dev-weight-${Date.now()}`, date: logDate, weight };
      setWeightLogs(prev => [...prev.filter(l => l.date !== logDate), newLog].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      if (logDate === getTodayDateString() && profile) {
          setProfile({ ...profile, weight });
      }
      console.log("DEV_MODE: Weight logged locally", newLog);
      return;
    }
    if (!user) return;
    setIsLoading(true);
    const token = await user.getIdToken();
    const logDate = date || getTodayDateString();
    await storageService.addWeightLog(token, { date: logDate, weight });

    if (logDate === getTodayDateString() && profile) {
      const updatedProfile = { ...profile, weight };
      await storageService.saveProfile(token, updatedProfile);
      setProfile(updatedProfile);
    }
    
    await refreshData();
    setIsLoading(false);
  };
  
  const updateWeightLog = async (log: WeightLog) => {
    if (DEV_MODE) {
      setWeightLogs(prev => prev.map(l => l.id === log.id ? log : l));
      console.log("DEV_MODE: Weight log updated locally", log);
      return;
    }
    if (!user) return;
    const token = await user.getIdToken();
    await storageService.updateWeightLog(token, log);
    await refreshData();
  };

  const deleteWeightLog = async (logId: string) => {
    if (DEV_MODE) {
      setWeightLogs(prev => prev.filter(l => l.id !== logId));
      console.log("DEV_MODE: Weight log deleted locally", logId);
      return;
    }
    if (!user) return;
    const token = await user.getIdToken();
    await storageService.deleteWeightLog(token, logId);
    await refreshData();
  };

  const addWater = async (amount: number) => {
    if (DEV_MODE) {
      const today = getTodayDateString();
      // Ensure waterLog is for today before adding
      const currentAmount = waterLog?.date === today ? waterLog.amount : 0;
      const newAmount = currentAmount + amount;
      const newWaterLog = { id: waterLog?.id || `dev-water-${Date.now()}`, date: today, amount: newAmount };
      setWaterLog(newWaterLog);
      console.log("DEV_MODE: Water added locally", newWaterLog);
      return;
    }
    if (!user) return;
    const token = await user.getIdToken();
    const today = getTodayDateString();
    const newAmount = (waterLog?.amount || 0) + amount;
    const newWaterLog = { date: today, amount: newAmount };
    
    const savedLog = await storageService.saveWaterLog(token, newWaterLog);
    
    setWaterLog(savedLog);
    const existingLogIndex = allWaterLogs.findIndex(item => item.date === today);
    const newAllWaterLogs = [...allWaterLogs];
     if(existingLogIndex > -1){
        newAllWaterLogs[existingLogIndex] = savedLog;
    } else {
        newAllWaterLogs.push(savedLog);
    }
    setAllWaterLogs(newAllWaterLogs);
  };
  
  const resetTodaysWaterLog = async () => {
    const todayLog = allWaterLogs.find(l => l.date === getTodayDateString());
    if (!todayLog || !todayLog.id) return; // Nothing to delete

    if (DEV_MODE) {
        setAllWaterLogs(prev => prev.filter(l => l.id !== todayLog.id));
        setWaterLog({ id: '', date: getTodayDateString(), amount: 0 });
        console.log("DEV_MODE: Today's water log reset");
        return;
    }

    if (!user) return;
    const token = await user.getIdToken();
    await storageService.deleteWaterLog(token, todayLog.id);
    await refreshData();
  };
  
  const deleteWaterLog = async (logId: string) => {
     if (DEV_MODE) {
        setAllWaterLogs(prev => prev.filter(l => l.id !== logId));
        if (waterLog.id === logId) {
             setWaterLog({ id: '', date: getTodayDateString(), amount: 0 });
        }
        console.log("DEV_MODE: Water log deleted", logId);
        return;
    }
    if (!user) return;
    const token = await user.getIdToken();
    await storageService.deleteWaterLog(token, logId);
    await refreshData();
  }


  const contextValue: DataContextState = {
    profile,
    meals,
    allMeals,
    workouts,
    allWorkouts,
    customMeals,
    weightLogs,
    waterLog,
    allWaterLogs,
    adjustedDailyGoals,
    isLoading,
    isInitialized,
    saveProfile,
    addMeal,
    updateMeal,
    deleteMeal,
    addCustomMeal,
    updateCustomMeal,
    deleteCustomMeal,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addWeightLog,
    updateWeightLog,
    deleteWeightLog,
    addWater,
    deleteWaterLog,
    resetTodaysWaterLog
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};