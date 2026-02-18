/* ============================================
   Protocol - TypeScript Type Definitions
   ============================================ */

// Workout Types
export type WorkoutType = 'Push' | 'Pull' | 'Legs' | 'Rest';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface WorkoutEntry {
  id: string;
  date: string; // ISO date string
  type: WorkoutType;
  exercises: Exercise[];
  createdAt: string;
}

// Nutrition Types
export interface NutritionEntry {
  id: string;
  date: string; // ISO date string
  eggs: number;
  chickenGrams: number;
  paneerGrams: number;
  soyaGrams: number;
  wheyScoops: number;
  createdAt: string;
}

export interface NutritionSettings {
  dailyProteinTarget: number;
}

// Bodyweight Types
export interface WeightEntry {
  id: string;
  date: string; // ISO date string
  weight: number;
  createdAt: string;
}

// App State
export interface AppData {
  workouts: WorkoutEntry[];
  nutrition: NutritionEntry[];
  weights: WeightEntry[];
  nutritionSettings: NutritionSettings;
}

// Navigation
export type TabType = 'dashboard' | 'workout' | 'nutrition' | 'stats';

// Protein calculation constants
export const PROTEIN_VALUES = {
  egg: 6, // per egg
  chicken: 31, // per 100g
  paneer: 18, // per 100g
  soya: 52, // per 100g dry
  whey: 24, // per scoop
} as const;

// Default nutrition settings
export const DEFAULT_NUTRITION_SETTINGS: NutritionSettings = {
  dailyProteinTarget: 180,
};

// Workout rotation (4-day cycle)
export const WORKOUT_ROTATION: WorkoutType[] = ['Push', 'Pull', 'Legs', 'Rest'];
