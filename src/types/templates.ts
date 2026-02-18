/* ============================================
   Protocol - Workout Templates
   Predefined exercise templates for each workout type
   ============================================ */

import type { WorkoutType } from './index';

// ============================================
// Template Exercise Definition
// ============================================

export interface TemplateExercise {
  id: string;
  name: string;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
}

export interface SetLog {
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  type: WorkoutType;
  exercises: ExerciseLog[];
  createdAt: string;
}

// ============================================
// Workout Templates
// ============================================

export const WORKOUT_TEMPLATES: Record<Exclude<WorkoutType, 'Rest'>, TemplateExercise[]> = {
  Push: [
    { id: 'push-1', name: 'Barbell Bench Press', targetSets: 4, targetRepsMin: 6, targetRepsMax: 8 },
    { id: 'push-2', name: 'Incline Dumbbell Press', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10 },
    { id: 'push-3', name: 'Overhead Shoulder Press', targetSets: 3, targetRepsMin: 6, targetRepsMax: 8 },
    { id: 'push-4', name: 'Lateral Raises', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15 },
    { id: 'push-5', name: 'Tricep Pushdowns', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12 },
  ],
  Pull: [
    { id: 'pull-1', name: 'Lat Pulldown / Pull-ups', targetSets: 4, targetRepsMin: 6, targetRepsMax: 10 },
    { id: 'pull-2', name: 'Barbell / Dumbbell Rows', targetSets: 3, targetRepsMin: 6, targetRepsMax: 8 },
    { id: 'pull-3', name: 'Seated Cable Row', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10 },
    { id: 'pull-4', name: 'Face Pulls', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15 },
    { id: 'pull-5', name: 'Bicep Curls', targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 },
  ],
  Legs: [
    { id: 'legs-1', name: 'Barbell Squats', targetSets: 4, targetRepsMin: 5, targetRepsMax: 8 },
    { id: 'legs-2', name: 'Leg Press', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10 },
    { id: 'legs-3', name: 'Romanian Deadlift', targetSets: 3, targetRepsMin: 6, targetRepsMax: 8 },
    { id: 'legs-4', name: 'Leg Curl', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12 },
    { id: 'legs-5', name: 'Calf Raises', targetSets: 4, targetRepsMin: 12, targetRepsMax: 15 },
  ],
};

// ============================================
// 7-Day Rotation Cycle
// Push → Pull → Legs → Push → Pull → Legs → Rest
// ============================================

export const WEEKLY_ROTATION: WorkoutType[] = [
  'Push',  // Day 1
  'Pull',  // Day 2
  'Legs',  // Day 3
  'Push',  // Day 4
  'Pull',  // Day 5
  'Legs',  // Day 6
  'Rest',  // Day 7
];

// ============================================
// Helper Functions
// ============================================

/**
 * Get template for a workout type
 */
export function getWorkoutTemplate(type: Exclude<WorkoutType, 'Rest'>): TemplateExercise[] {
  return WORKOUT_TEMPLATES[type];
}

/**
 * Initialize empty exercise logs from template
 */
export function initializeExerciseLogs(type: Exclude<WorkoutType, 'Rest'>): ExerciseLog[] {
  const template = WORKOUT_TEMPLATES[type];
  return template.map(exercise => ({
    exerciseId: exercise.id,
    name: exercise.name,
    sets: Array(exercise.targetSets).fill(null).map(() => ({ reps: 0, weight: 0 })),
  }));
}

/**
 * Get rep range display string
 */
export function getRepRangeString(exercise: TemplateExercise): string {
  if (exercise.targetRepsMin === exercise.targetRepsMax) {
    return `${exercise.targetRepsMin}`;
  }
  return `${exercise.targetRepsMin}–${exercise.targetRepsMax}`;
}
