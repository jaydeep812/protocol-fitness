/* ============================================
   Protocol - LocalStorage Utilities
   Handles all data persistence operations
   ============================================ */

import type {
  AppData,
  WorkoutEntry,
  NutritionEntry,
  WeightEntry,
  NutritionSettings,
} from '../types';
import { DEFAULT_NUTRITION_SETTINGS } from '../types';

const STORAGE_KEY = 'protocol_fitness_data';

// ============================================
// Core Storage Operations
// ============================================

/**
 * Get all app data from localStorage
 */
export function getAppData(): AppData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  // Return default empty state
  return {
    workouts: [],
    nutrition: [],
    weights: [],
    nutritionSettings: DEFAULT_NUTRITION_SETTINGS,
  };
}

/**
 * Save all app data to localStorage
 */
export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// ============================================
// Workout Operations
// ============================================

/**
 * Save a workout entry
 */
export function saveWorkout(workout: WorkoutEntry): void {
  const data = getAppData();
  
  // Check if workout for this date and type already exists
  const existingIndex = data.workouts.findIndex(
    (w) => w.date === workout.date && w.type === workout.type
  );
  
  if (existingIndex >= 0) {
    data.workouts[existingIndex] = workout;
  } else {
    data.workouts.push(workout);
  }
  
  saveAppData(data);
}

/**
 * Get workouts by type (for comparison)
 */
export function getWorkoutsByType(type: string): WorkoutEntry[] {
  const data = getAppData();
  return data.workouts
    .filter((w) => w.type === type)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get workout for a specific date
 */
export function getWorkoutByDate(date: string): WorkoutEntry | undefined {
  const data = getAppData();
  return data.workouts.find((w) => w.date === date);
}

// ============================================
// Nutrition Operations
// ============================================

/**
 * Save a nutrition entry
 */
export function saveNutrition(nutrition: NutritionEntry): void {
  const data = getAppData();
  
  // Check if entry for this date already exists
  const existingIndex = data.nutrition.findIndex((n) => n.date === nutrition.date);
  
  if (existingIndex >= 0) {
    data.nutrition[existingIndex] = nutrition;
  } else {
    data.nutrition.push(nutrition);
  }
  
  saveAppData(data);
}

/**
 * Get nutrition entry for a specific date
 */
export function getNutritionByDate(date: string): NutritionEntry | undefined {
  const data = getAppData();
  return data.nutrition.find((n) => n.date === date);
}

/**
 * Update nutrition settings
 */
export function updateNutritionSettings(settings: NutritionSettings): void {
  const data = getAppData();
  data.nutritionSettings = settings;
  saveAppData(data);
}

/**
 * Get nutrition settings
 */
export function getNutritionSettings(): NutritionSettings {
  const data = getAppData();
  return data.nutritionSettings || DEFAULT_NUTRITION_SETTINGS;
}

// ============================================
// Weight Operations
// ============================================

/**
 * Save a weight entry
 */
export function saveWeight(weight: WeightEntry): void {
  const data = getAppData();
  
  // Check if entry for this date already exists
  const existingIndex = data.weights.findIndex((w) => w.date === weight.date);
  
  if (existingIndex >= 0) {
    data.weights[existingIndex] = weight;
  } else {
    data.weights.push(weight);
  }
  
  saveAppData(data);
}

/**
 * Get all weight entries sorted by date
 */
export function getAllWeights(): WeightEntry[] {
  const data = getAppData();
  return data.weights.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Get latest weight entry
 */
export function getLatestWeight(): WeightEntry | undefined {
  const weights = getAllWeights();
  return weights[weights.length - 1];
}

// ============================================
// Stats & Analytics
// ============================================

/**
 * Calculate workout streak (consecutive days with logged workouts)
 */
export function calculateStreak(): number {
  const data = getAppData();
  const workoutDates = new Set(data.workouts.map((w) => w.date));
  const nutritionDates = new Set(data.nutrition.map((n) => n.date));
  
  // Combine all logged dates
  const allDates = new Set([...workoutDates, ...nutritionDates]);
  
  if (allDates.size === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check consecutive days backwards from today
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (allDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      // Allow today to not be logged yet
      break;
    }
  }
  
  return streak;
}

/**
 * Get weekly completion data (last 7 days)
 */
export function getWeeklyCompletion(): boolean[] {
  const data = getAppData();
  const workoutDates = new Set(data.workouts.map((w) => w.date));
  
  const result: boolean[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 6; i >= 0; i--) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    result.push(workoutDates.has(dateStr));
  }
  
  return result;
}

/**
 * Get weekly stats for overview
 */
export function getWeeklyStats() {
  const data = getAppData();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  
  // Filter data for last 7 days
  const weekWorkouts = data.workouts.filter((w) => {
    const date = new Date(w.date);
    return date >= weekStart && date <= today;
  });
  
  const weekNutrition = data.nutrition.filter((n) => {
    const date = new Date(n.date);
    return date >= weekStart && date <= today;
  });
  
  const weekWeights = data.weights.filter((w) => {
    const date = new Date(w.date);
    return date >= weekStart && date <= today;
  });
  
  // Calculate averages
  const avgWeight = weekWeights.length > 0
    ? weekWeights.reduce((sum, w) => sum + w.weight, 0) / weekWeights.length
    : 0;
  
  return {
    workoutsCompleted: weekWorkouts.length,
    nutritionEntries: weekNutrition,
    avgWeight: Math.round(avgWeight * 10) / 10,
    totalSessions: weekWorkouts.length,
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date for display (long format)
 */
export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
