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
  WorkoutType,
} from '../types';
import { DEFAULT_NUTRITION_SETTINGS } from '../types';
import type { WorkoutLog, SetLog } from '../types/templates';
import type { MealLogEntry, NutritionTargets } from '../types/mealTemplates';
import { DEFAULT_NUTRITION_TARGETS } from '../types/mealTemplates';

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
// Template-Based Workout Log Operations
// ============================================

const WORKOUT_LOGS_KEY = 'protocol_workout_logs';

/**
 * Get all workout logs
 */
export function getWorkoutLogs(): WorkoutLog[] {
  try {
    const data = localStorage.getItem(WORKOUT_LOGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading workout logs:', error);
  }
  return [];
}

/**
 * Save workout log
 */
export function saveWorkoutLog(log: WorkoutLog): void {
  const logs = getWorkoutLogs();
  
  // Check if log for this date already exists
  const existingIndex = logs.findIndex((l) => l.date === log.date && l.type === log.type);
  
  if (existingIndex >= 0) {
    logs[existingIndex] = log;
  } else {
    logs.push(log);
  }
  
  try {
    localStorage.setItem(WORKOUT_LOGS_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving workout log:', error);
  }
}

/**
 * Get workout log for a specific date and type
 */
export function getWorkoutLogByDateAndType(date: string, type: WorkoutType): WorkoutLog | undefined {
  const logs = getWorkoutLogs();
  return logs.find((l) => l.date === date && l.type === type);
}

/**
 * Get previous workout log for a workout type (for comparison)
 * Returns the most recent log before the given date
 */
export function getPreviousWorkoutLog(type: WorkoutType, beforeDate: string): WorkoutLog | undefined {
  const logs = getWorkoutLogs();
  const filteredLogs = logs
    .filter((l) => l.type === type && l.date < beforeDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return filteredLogs[0];
}

/**
 * Get previous exercise data for comparison
 * Returns the sets from the last logged workout for that exercise
 */
export function getPreviousExerciseData(exerciseId: string, type: WorkoutType, beforeDate: string): SetLog[] | undefined {
  const previousLog = getPreviousWorkoutLog(type, beforeDate);
  if (!previousLog) return undefined;
  
  const exercise = previousLog.exercises.find((e) => e.exerciseId === exerciseId);
  return exercise?.sets;
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
// Meal Log Operations (Template-Based)
// ============================================

const MEAL_LOGS_KEY = 'protocol_meal_logs';
const NUTRITION_TARGETS_KEY = 'protocol_nutrition_targets';

/**
 * Get all meal logs
 */
export function getMealLogs(): MealLogEntry[] {
  try {
    const data = localStorage.getItem(MEAL_LOGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading meal logs:', error);
  }
  return [];
}

/**
 * Save a meal log entry
 */
export function saveMealLog(log: MealLogEntry): void {
  const logs = getMealLogs();
  logs.push(log);
  
  try {
    localStorage.setItem(MEAL_LOGS_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving meal log:', error);
  }
}

/**
 * Delete a meal log entry by ID
 */
export function deleteMealLog(logId: string): void {
  const logs = getMealLogs();
  const filtered = logs.filter(l => l.id !== logId);
  
  try {
    localStorage.setItem(MEAL_LOGS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting meal log:', error);
  }
}

/**
 * Get meal logs for a specific date
 */
export function getMealLogsByDate(date: string): MealLogEntry[] {
  const logs = getMealLogs();
  return logs.filter(l => l.date === date).sort(
    (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
  );
}

/**
 * Get meal logs for the last N days
 */
export function getMealLogsForDays(days: number): MealLogEntry[] {
  const logs = getMealLogs();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (days - 1));
  
  return logs.filter(l => {
    const logDate = new Date(l.date);
    return logDate >= startDate && logDate <= today;
  });
}

/**
 * Get nutrition targets
 */
export function getNutritionTargets(): NutritionTargets {
  try {
    const data = localStorage.getItem(NUTRITION_TARGETS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading nutrition targets:', error);
  }
  return DEFAULT_NUTRITION_TARGETS;
}

/**
 * Save nutrition targets
 */
export function saveNutritionTargets(targets: NutritionTargets): void {
  try {
    localStorage.setItem(NUTRITION_TARGETS_KEY, JSON.stringify(targets));
  } catch (error) {
    console.error('Error saving nutrition targets:', error);
  }
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
 * Get date in Indian timezone (IST - UTC+5:30)
 */
export function getIndianDate(): Date {
  const now = new Date();
  // Convert to IST by adding 5:30 hours to UTC
  const istOffset = 5.5 * 60 * 60 * 1000; // 5:30 in milliseconds
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  return new Date(utc + istOffset);
}

/**
 * Get today's date string in Indian timezone (YYYY-MM-DD)
 */
export function getTodayDateIST(): string {
  const ist = getIndianDate();
  return ist.toISOString().split('T')[0];
}

/**
 * Get current month calendar data (Indian timezone)
 * Returns { monthName, year, days: array of day data, startDayOffset }
 */
export function getCurrentMonthCalendar(): {
  monthName: string;
  year: number;
  days: { date: string; dayOfMonth: number; completed: boolean; isToday: boolean; isFuture: boolean }[];
  startDayOffset: number;
} {
  const data = getAppData();
  const workoutLogs = getWorkoutLogs();
  
  // Combine old workout dates and new workout log dates
  const workoutDates = new Set([
    ...data.workouts.map((w) => w.date),
    ...workoutLogs.map((l) => l.date),
  ]);
  
  // Get current date in IST
  const todayIST = getIndianDate();
  const todayStr = getTodayDateIST();
  
  const year = todayIST.getFullYear();
  const month = todayIST.getMonth();
  
  // Get month name
  const monthName = todayIST.toLocaleString('en-IN', { month: 'long' });
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Get what day of week the 1st falls on (0 = Sunday, convert to Monday = 0)
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
  
  const days: { date: string; dayOfMonth: number; completed: boolean; isToday: boolean; isFuture: boolean }[] = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isFuture = dateStr > todayStr;
    
    days.push({
      date: dateStr,
      dayOfMonth: day,
      completed: workoutDates.has(dateStr),
      isToday: dateStr === todayStr,
      isFuture,
    });
  }
  
  return {
    monthName,
    year,
    days,
    startDayOffset: firstDayOfWeek,
  };
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
