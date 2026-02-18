/* ============================================
   Protocol - Workout Tracker Component
   Log exercises with sets, reps, and weight
   ============================================ */

import { useState, useMemo } from 'react';
import type { WorkoutType, Exercise, WorkoutEntry } from '../types';
import {
  saveWorkout,
  getWorkoutsByType,
  getWorkoutByDate,
  getTodayDate,
  generateId,
  formatDate,
} from '../utils/storage';
import { getTodayWorkoutType } from '../utils/calculations';

// Helper to create empty exercise - defined outside component to avoid recreation
function createEmptyExercise(): Exercise {
  return {
    id: generateId(),
    name: '',
    sets: 0,
    reps: 0,
    weight: 0,
  };
}

// Helper to load exercises for a workout type
function loadExercisesForType(type: WorkoutType): { exercises: Exercise[]; isSaved: boolean } {
  const todayWorkout = getWorkoutByDate(getTodayDate());
  if (todayWorkout && todayWorkout.type === type) {
    return { exercises: todayWorkout.exercises, isSaved: true };
  }
  return { exercises: [createEmptyExercise()], isSaved: false };
}

export default function WorkoutTracker() {
  // ============================================
  // State - Initialize with correct type
  // ============================================
  
  const initialType: WorkoutType = (() => {
    const todayType = getTodayWorkoutType();
    return todayType === 'Rest' ? 'Push' : todayType;
  })();
  
  const [selectedType, setSelectedType] = useState<WorkoutType>(initialType);
  
  const initialData = useMemo(() => loadExercisesForType(initialType), [initialType]);
  const [exercises, setExercises] = useState<Exercise[]>(initialData.exercises);
  const [isSaved, setIsSaved] = useState(initialData.isSaved);
  
  // Get previous workout for comparison
  const previousWorkout = useMemo(() => {
    const workouts = getWorkoutsByType(selectedType);
    // Get the most recent workout that's not today
    return workouts.find(w => w.date !== getTodayDate());
  }, [selectedType]);
  
  // ============================================
  // Helper Functions
  // ============================================
  
  function handleTypeChange(type: WorkoutType) {
    setSelectedType(type);
    const data = loadExercisesForType(type);
    setExercises(data.exercises);
    setIsSaved(data.isSaved);
  }
  
  function addExercise() {
    setExercises([...exercises, createEmptyExercise()]);
    setIsSaved(false);
  }
  
  function removeExercise(id: string) {
    if (exercises.length > 1) {
      setExercises(exercises.filter(e => e.id !== id));
      setIsSaved(false);
    }
  }
  
  function updateExercise(id: string, field: keyof Exercise, value: string | number) {
    setExercises(exercises.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
    setIsSaved(false);
  }
  
  function handleSave() {
    const workout: WorkoutEntry = {
      id: generateId(),
      date: getTodayDate(),
      type: selectedType,
      exercises: exercises.filter(e => e.name.trim() !== ''),
      createdAt: new Date().toISOString(),
    };
    
    saveWorkout(workout);
    setIsSaved(true);
  }
  
  // ============================================
  // Render
  // ============================================
  
  const workoutTypes: WorkoutType[] = ['Push', 'Pull', 'Legs'];
  
  return (
    <div className="p-4 pb-24 space-y-4">
      {/* ============================================
          Header
          ============================================ */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Workout</h1>
        <p className="text-gray-400 text-sm">Log your exercises</p>
      </div>
      
      {/* ============================================
          Workout Type Selector
          ============================================ */}
      <div className="flex gap-2">
        {workoutTypes.map(type => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              selectedType === type
                ? 'bg-green-500 text-white'
                : 'bg-[#1f1f1f] text-gray-400 border border-[#2a2a2a]'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      
      {/* ============================================
          Previous Workout Reference
          ============================================ */}
      {previousWorkout && (
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Previous {selectedType}</p>
            <p className="text-gray-500 text-xs">{formatDate(previousWorkout.date)}</p>
          </div>
          <div className="space-y-2">
            {previousWorkout.exercises.slice(0, 3).map(ex => (
              <div key={ex.id} className="flex justify-between text-sm">
                <span className="text-gray-300">{ex.name}</span>
                <span className="text-gray-500">
                  {ex.sets}×{ex.reps} @ {ex.weight}kg
                </span>
              </div>
            ))}
            {previousWorkout.exercises.length > 3 && (
              <p className="text-gray-500 text-xs">
                +{previousWorkout.exercises.length - 3} more exercises
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* ============================================
          Exercise List
          ============================================ */}
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div 
            key={exercise.id} 
            className="bg-[#1f1f1f] rounded-xl p-4 border border-[#2a2a2a]"
          >
            {/* Exercise Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Exercise {index + 1}</span>
              {exercises.length > 1 && (
                <button
                  onClick={() => removeExercise(exercise.id)}
                  className="text-gray-500 hover:text-red-400 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Exercise Name */}
            <input
              type="text"
              placeholder="Exercise name"
              value={exercise.name}
              onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
              className="w-full bg-[#2a2a2a] text-white rounded-lg p-3 mb-3 border border-[#3a3a3a] placeholder-gray-500"
            />
            
            {/* Sets, Reps, Weight */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-gray-500 text-xs block mb-1">Sets</label>
                <input
                  type="number"
                  placeholder="0"
                  value={exercise.sets || ''}
                  onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 0)}
                  className="w-full bg-[#2a2a2a] text-white rounded-lg p-3 border border-[#3a3a3a] text-center"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1">Reps</label>
                <input
                  type="number"
                  placeholder="0"
                  value={exercise.reps || ''}
                  onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value) || 0)}
                  className="w-full bg-[#2a2a2a] text-white rounded-lg p-3 border border-[#3a3a3a] text-center"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={exercise.weight || ''}
                  onChange={(e) => updateExercise(exercise.id, 'weight', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#2a2a2a] text-white rounded-lg p-3 border border-[#3a3a3a] text-center"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* ============================================
          Add Exercise Button
          ============================================ */}
      <button
        onClick={addExercise}
        className="w-full py-3 px-4 rounded-xl bg-[#1f1f1f] border border-dashed border-[#3a3a3a] text-gray-400 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Exercise
      </button>
      
      {/* ============================================
          Save Button
          ============================================ */}
      <button
        onClick={handleSave}
        disabled={exercises.every(e => !e.name.trim())}
        className={`w-full py-4 px-4 rounded-xl font-bold text-lg transition-all ${
          isSaved
            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
            : exercises.every(e => !e.name.trim())
              ? 'bg-[#2a2a2a] text-gray-500'
              : 'bg-green-500 text-white active:scale-[0.98]'
        }`}
      >
        {isSaved ? '✓ Saved' : 'Save Workout'}
      </button>
    </div>
  );
}
