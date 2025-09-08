import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile, Macros, Goal, Intensity } from "../types";

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.error("Gemini API key is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// Define a reusable schema for macros
const macrosSchema = {
    type: Type.OBJECT,
    properties: {
        calories: { type: Type.NUMBER, description: "Total calories" },
        protein: { type: Type.NUMBER, description: "Grams of protein" },
        carbs: { type: Type.NUMBER, description: "Grams of carbohydrates" },
        fat: { type: Type.NUMBER, description: "Grams of fat" },
    },
    required: ["calories", "protein", "carbs", "fat"],
};

class GeminiService {
  async analyzeMeal(description: string): Promise<{ name: string; macros: Macros } | null> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following meal description. Provide a short, suitable name for the meal and its estimated nutritional values (calories, protein, carbs, fat). Description: "${description}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "A short, suitable name for the meal." },
              macros: macrosSchema,
            },
            required: ["name", "macros"],
          },
        },
      });

      const jsonString = response.text.trim();
      return JSON.parse(jsonString);

    } catch (error) {
      console.error("Error analyzing meal with Gemini:", error);
      return null;
    }
  }
  
  // FIX: The type for `profile` is relaxed to `Omit<UserProfile, 'dailyGoals' | 'reminderSettings'>` because `reminderSettings` is not needed for this calculation and is not available at the point of profile creation.
  async calculateDailyGoals(profile: Omit<UserProfile, 'dailyGoals' | 'reminderSettings'>): Promise<Macros | null> {
    const prompt = `
      Calculate the daily caloric and macronutrient needs for a person with the following profile.
      - Age: ${profile.age}
      - Gender: ${profile.gender}
      - Weight: ${profile.weight} kg
      - Height: ${profile.height} cm
      - Activity Level: ${profile.activityLevel}
      - Goal: ${profile.goal}

      Provide a balanced macronutrient split (e.g., 40% carbs, 30% protein, 30% fat).
      Return the result as a JSON object with calories, protein, carbs, and fat.
    `;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: macrosSchema,
        },
      });
      
      const jsonString = response.text.trim();
      return JSON.parse(jsonString);

    } catch (error) {
      console.error("Error calculating goals with Gemini:", error);
      return null;
    }
  }

  async getMealRecommendation(remainingMacros: Macros, goal: Goal, preferences: string): Promise<{ name: string; description: string; macros: Macros } | null> {
    const prompt = `
      A user needs a meal suggestion to help them with their goal to "${goal}".
      They have the following macronutrients remaining for the day:
      - Calories: ${Math.round(remainingMacros.calories)}
      - Protein: ${Math.round(remainingMacros.protein)}g
      - Carbohydrates: ${Math.round(remainingMacros.carbs)}g
      - Fat: ${Math.round(remainingMacros.fat)}g
      
      The user has provided the following preferences for the meal: "${preferences}".
      
      Based on their remaining macros and preferences, suggest a single, simple meal. 
      Provide a creative name, a brief description of the meal, and its estimated nutritional values.
    `;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "The creative name of the meal." },
              description: { type: Type.STRING, description: "A brief, appealing description of the meal." },
              macros: macrosSchema,
            },
            required: ["name", "description", "macros"],
          },
        },
      });
      const jsonString = response.text.trim();
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error getting meal recommendation from Gemini:", error);
      return null;
    }
  }

  async estimateCaloriesBurned(details: { exerciseType: string, duration: number, intensity: Intensity, userWeight: number }): Promise<number | null> {
    const prompt = `
      Estimate the calories burned for a workout with the following details for a person weighing ${details.userWeight} kg.
      - Exercise: "${details.exerciseType}"
      - Duration: ${details.duration} minutes
      - Intensity: ${details.intensity}

      Return only the estimated number of calories burned as a single numeric value.
    `;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER, description: "Estimated calories burned" }
            },
            required: ["calories"],
          },
        },
      });
      const jsonString = response.text.trim();
      const result = JSON.parse(jsonString);
      return result.calories;

    } catch (error) {
      console.error("Error estimating calories burned with Gemini:", error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();