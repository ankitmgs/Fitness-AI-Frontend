export enum ActivityLevel {
  SEDENTARY = 'Sedentary (little or no exercise)',
  LIGHT = 'Lightly active (light exercise/sports 1-3 days/week)',
  MODERATE = 'Moderately active (moderate exercise/sports 3-5 days/week)',
  ACTIVE = 'Very active (hard exercise/sports 6-7 days a week)',
  EXTRA_ACTIVE = 'Extra active (very hard exercise/sports & physical job)',
}

export enum Goal {
  LOSE = 'Lose weight',
  MAINTAIN = 'Maintain weight',
  GAIN = 'Gain weight',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export interface WaterReminderSetting {
  enabled: boolean;
  frequency: number; // in minutes
}

export interface ReminderSettings {
  water: WaterReminderSetting;
  meal: boolean;
  goalReached: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
  dailyGoals: DailyGoals;
  reminderSettings: ReminderSettings;
}

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyGoals extends Macros {
  water: number; // in ml
}

export enum MealType {
    BREAKFAST = "Breakfast",
    LUNCH = "Lunch",
    DINNER = "Dinner",
    SNACK = "Snack"
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  macros: Macros;
  mealType: MealType;
  date: string; // YYYY-MM-DD
}

export interface CustomMeal {
  id: string;
  name: string;
  description: string;
  macros: Macros;
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // in kg
}

export interface WaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // in ml
}

export enum Intensity {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High"
}

export interface WorkoutLog {
    id: string;
    date: string; // YYYY-MM-DD
    exerciseType: string;
    duration: number; // in minutes
    intensity: Intensity;
    caloriesBurned: number;
}