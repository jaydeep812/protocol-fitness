/* ============================================
   Protocol - Calculation Utilities
   Protein calculations and workout scheduling
   ============================================ */

import type { NutritionEntry, WorkoutType } from '../types';
import { PROTEIN_VALUES, WORKOUT_ROTATION } from '../types';

// ============================================
// Protein Calculations
// ============================================

/**
 * Calculate total protein from nutrition entry
 * 
 * Protein values:
 * - Egg: 6g per egg
 * - Chicken: 31g per 100g
 * - Paneer: 18g per 100g
 * - Soya chunks (dry): 52g per 100g
 * - Whey scoop: 24g per scoop
 */
export function calculateProtein(entry: Partial<NutritionEntry>): number {
  const eggs = (entry.eggs || 0) * PROTEIN_VALUES.egg;
  const chicken = ((entry.chickenGrams || 0) / 100) * PROTEIN_VALUES.chicken;
  const paneer = ((entry.paneerGrams || 0) / 100) * PROTEIN_VALUES.paneer;
  const soya = ((entry.soyaGrams || 0) / 100) * PROTEIN_VALUES.soya;
  const whey = (entry.wheyScoops || 0) * PROTEIN_VALUES.whey;
  
  return Math.round(eggs + chicken + paneer + soya + whey);
}

/**
 * Calculate percentage of daily target
 */
export function calculateProteinPercentage(consumed: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((consumed / target) * 100), 100);
}

// ============================================
// Workout Scheduling
// ============================================

/**
 * Get today's suggested workout type based on 7-day rotation
 * Cycle: Push → Pull → Legs → Push → Pull → Legs → Rest
 * 
 * The cycle starts from a reference date and rotates through
 */
export function getTodayWorkoutType(): WorkoutType {
  // Reference date - start of the cycle (can be adjusted)
  const referenceDate = new Date('2024-01-01');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate days since reference
  const diffTime = today.getTime() - referenceDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Get position in rotation (0-6 for 7-day cycle)
  const rotationIndex = ((diffDays % 7) + 7) % 7; // Handle negative modulo
  
  return WORKOUT_ROTATION[rotationIndex];
}

/**
 * Get workout type for a specific date
 */
export function getWorkoutTypeForDate(date: Date): WorkoutType {
  const referenceDate = new Date('2024-01-01');
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - referenceDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const rotationIndex = ((diffDays % 7) + 7) % 7;
  
  return WORKOUT_ROTATION[rotationIndex];
}

// ============================================
// Weight Calculations
// ============================================

/**
 * Calculate weekly average weight
 */
export function calculateWeeklyAverage(weights: { date: string; weight: number }[]): number {
  if (weights.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  
  const weekWeights = weights.filter((w) => {
    const date = new Date(w.date);
    return date >= weekStart && date <= today;
  });
  
  if (weekWeights.length === 0) return 0;
  
  const sum = weekWeights.reduce((acc, w) => acc + w.weight, 0);
  return Math.round((sum / weekWeights.length) * 10) / 10;
}

// ============================================
// Day Name Utilities
// ============================================

/**
 * Get short day name from index (0 = Mon, 6 = Sun)
 */
export function getDayName(index: number): string {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return days[index];
}

/**
 * Get full day name
 */
export function getFullDayName(index: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[index];
}
