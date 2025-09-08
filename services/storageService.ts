import type { UserProfile, Meal, WeightLog, WaterLog, WorkoutLog, CustomMeal } from '../types';

/**
 * A helper function to make authenticated API requests to the backend.
 * @param method The HTTP method ('GET', 'POST', 'PUT', 'DELETE').
 * @param endpoint The API endpoint (e.g., '/api/profile').
 * @param token The Firebase ID token for authentication.
 * @param body Optional request body for POST/PUT requests.
 * @returns The JSON response from the server.
 */
const apiRequest = async (method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, token: string, body?: any) => {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, options);
    
    if (response.status === 204) {
      return null;
    }

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || `API request failed with status ${response.status}`);
    }
    
    return responseData;
};


class StorageService {
  // Profile
  async getProfile(token: string): Promise<UserProfile | null> {
    try {
      return await apiRequest('GET', '/api/profile', token);
    } catch (error) {
        // A 404 error is expected for new users who haven't set up a profile yet.
        if (error instanceof Error && error.message.includes('Not Found')) {
            return null;
        }
        console.error('Failed to get profile:', error);
        throw error;
    }
  }

  async saveProfile(token: string, profile: UserProfile): Promise<UserProfile> {
    return await apiRequest('POST', '/api/profile', token, profile);
  }
  
  // Meals
  async getAllMeals(token: string): Promise<Meal[]> {
    return await apiRequest('GET', '/api/meals', token);
  }

  async addMeal(token: string, meal: Omit<Meal, 'id'>): Promise<Meal> {
    return await apiRequest('POST', '/api/meals', token, meal);
  }

  async updateMeal(token: string, meal: Meal): Promise<Meal> {
    return await apiRequest('PUT', `/api/meals/${meal.id}`, token, meal);
  }

  async deleteMeal(token: string, mealId: string): Promise<void> {
    await apiRequest('DELETE', `/api/meals/${mealId}`, token);
  }
  
  // Custom Meals
  async getCustomMeals(token: string): Promise<CustomMeal[]> {
     return await apiRequest('GET', '/api/custom-meals', token);
  }

  async addCustomMeal(token: string, customMeal: Omit<CustomMeal, 'id'>): Promise<CustomMeal> {
    return await apiRequest('POST', '/api/custom-meals', token, customMeal);
  }

  async updateCustomMeal(token: string, meal: CustomMeal): Promise<CustomMeal> {
    return await apiRequest('PUT', `/api/custom-meals/${meal.id}`, token, meal);
  }

  async deleteCustomMeal(token: string, mealId: string): Promise<void> {
    await apiRequest('DELETE', `/api/custom-meals/${mealId}`, token);
  }

  // Weight Logs
  async getWeightHistory(token: string): Promise<WeightLog[]> {
    return await apiRequest('GET', '/api/weight-logs', token);
  }

  async addWeightLog(token: string, log: Omit<WeightLog, 'id'>): Promise<WeightLog> {
    return await apiRequest('POST', '/api/weight-logs', token, log);
  }

  async updateWeightLog(token: string, log: WeightLog): Promise<WeightLog> {
    return await apiRequest('PUT', `/api/weight-logs/${log.id}`, token, log);
  }

  async deleteWeightLog(token: string, logId: string): Promise<void> {
    await apiRequest('DELETE', `/api/weight-logs/${logId}`, token);
  }


  // Water Logs
  async getAllWaterLogs(token: string): Promise<WaterLog[]> {
     return await apiRequest('GET', '/api/water-logs', token);
  }

  async saveWaterLog(token: string, log: Omit<WaterLog, 'id'>): Promise<WaterLog> {
    return await apiRequest('POST', '/api/water-logs', token, log);
  }

  async deleteWaterLog(token: string, logId: string): Promise<void> {
    await apiRequest('DELETE', `/api/water-logs/${logId}`, token);
  }

  // Workouts
  async getAllWorkouts(token: string): Promise<WorkoutLog[]> {
    return await apiRequest('GET', '/api/workouts', token);
  }

  async addWorkout(token: string, workout: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog> {
    return await apiRequest('POST', '/api/workouts', token, workout);
  }

  async updateWorkout(token: string, workout: WorkoutLog): Promise<WorkoutLog> {
    return await apiRequest('PUT', `/api/workouts/${workout.id}`, token, workout);
  }

  async deleteWorkout(token: string, workoutId: string): Promise<void> {
    await apiRequest('DELETE', `/api/workouts/${workoutId}`, token);
  }
}

export const storageService = new StorageService();