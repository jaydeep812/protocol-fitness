/* ============================================
   Protocol - Workout Tracker Component
   Template-based workout logging with comparison
   ============================================ */

import { useState, useMemo } from 'react';
import type { WorkoutType } from '../types';
import type { ExerciseLog, SetLog, WorkoutLog, TemplateExercise } from '../types/templates';
import {
  WORKOUT_TEMPLATES,
  getRepRangeString,
  initializeExerciseLogs,
} from '../types/templates';
import {
  saveWorkoutLog,
  getWorkoutLogByDateAndType,
  getPreviousExerciseData,
  getTodayDate,
  generateId,
  formatDate,
  getPreviousWorkoutLog,
} from '../utils/storage';
import { getTodayWorkoutType } from '../utils/calculations';

// ============================================
// Helper Functions
// ============================================

/**
 * Load workout data for a type - either from today's saved log or initialize fresh
 */
function loadWorkoutData(type: Exclude<WorkoutType, 'Rest'>): { 
  exercises: ExerciseLog[]; 
  isSaved: boolean 
} {
  const today = getTodayDate();
  const existingLog = getWorkoutLogByDateAndType(today, type);
  
  if (existingLog) {
    return { exercises: existingLog.exercises, isSaved: true };
  }
  
  return { exercises: initializeExerciseLogs(type), isSaved: false };
}

// ============================================
// Main Component
// ============================================

export default function WorkoutTracker() {
  // ============================================
  // State
  // ============================================
  
  const initialType: Exclude<WorkoutType, 'Rest'> = useMemo(() => {
    const todayType = getTodayWorkoutType();
    return todayType === 'Rest' ? 'Push' : todayType;
  }, []);
  
  const [selectedType, setSelectedType] = useState<Exclude<WorkoutType, 'Rest'>>(initialType);
  
  const initialData = useMemo(() => loadWorkoutData(initialType), [initialType]);
  const [exercises, setExercises] = useState<ExerciseLog[]>(initialData.exercises);
  const [isSaved, setIsSaved] = useState(initialData.isSaved);
  
  // Get template for selected type
  const template = WORKOUT_TEMPLATES[selectedType];
  
  // Get previous workout log for comparison
  const previousLog = useMemo(() => 
    getPreviousWorkoutLog(selectedType, getTodayDate()), 
    [selectedType]
  );
  
  // ============================================
  // Handlers
  // ============================================
  
  function handleTypeChange(type: Exclude<WorkoutType, 'Rest'>) {
    setSelectedType(type);
    const data = loadWorkoutData(type);
    setExercises(data.exercises);
    setIsSaved(data.isSaved);
  }
  
  function updateSet(exerciseIndex: number, setIndex: number, field: keyof SetLog, value: number) {
    const newExercises = [...exercises];
    newExercises[exerciseIndex] = {
      ...newExercises[exerciseIndex],
      sets: newExercises[exerciseIndex].sets.map((set, idx) =>
        idx === setIndex ? { ...set, [field]: value } : set
      ),
    };
    setExercises(newExercises);
    setIsSaved(false);
  }
  
  function handleSave() {
    const log: WorkoutLog = {
      id: generateId(),
      date: getTodayDate(),
      type: selectedType,
      exercises: exercises,
      createdAt: new Date().toISOString(),
    };
    
    saveWorkoutLog(log);
    setIsSaved(true);
  }
  
  // Check if workout has any logged data
  const hasLoggedData = exercises.some(ex => 
    ex.sets.some(set => set.reps > 0 || set.weight > 0)
  );
  
  // ============================================
  // Render
  // ============================================
  
  const workoutTypes: Exclude<WorkoutType, 'Rest'>[] = ['Push', 'Pull', 'Legs'];
  
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
          Previous Workout Summary
          ============================================ */}
      {previousLog && (
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm font-medium">Last {selectedType} Session</p>
            <p className="text-gray-500 text-xs">{formatDate(previousLog.date)}</p>
          </div>
          <p className="text-gray-500 text-xs">Previous weights shown below each set</p>
        </div>
      )}
      
      {/* ============================================
          Exercise Cards
          ============================================ */}
      <div className="space-y-4">
        {template.map((templateExercise, exerciseIndex) => {
          const exerciseLog = exercises[exerciseIndex];
          const previousSets = getPreviousExerciseData(
            templateExercise.id, 
            selectedType, 
            getTodayDate()
          );
          
          return (
            <ExerciseCard
              key={templateExercise.id}
              template={templateExercise}
              exerciseLog={exerciseLog}
              previousSets={previousSets}
              onUpdateSet={(setIndex, field, value) => 
                updateSet(exerciseIndex, setIndex, field, value)
              }
            />
          );
        })}
      </div>
      
      {/* ============================================
          Save Button
          ============================================ */}
      <button
        onClick={handleSave}
        disabled={!hasLoggedData}
        className={`w-full py-4 px-4 rounded-xl font-bold text-lg transition-all ${
          isSaved
            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
            : !hasLoggedData
              ? 'bg-[#2a2a2a] text-gray-500'
              : 'bg-green-500 text-white active:scale-[0.98]'
        }`}
      >
        {isSaved ? '✓ Saved' : 'Save Workout'}
      </button>
    </div>
  );
}

// ============================================
// Exercise Card Component
// ============================================

interface ExerciseCardProps {
  template: TemplateExercise;
  exerciseLog: ExerciseLog;
  previousSets?: SetLog[];
  onUpdateSet: (setIndex: number, field: keyof SetLog, value: number) => void;
}

function ExerciseCard({ template, exerciseLog, previousSets, onUpdateSet }: ExerciseCardProps) {
  const repRange = getRepRangeString(template);
  
  return (
    <div className="bg-[#1f1f1f] rounded-xl p-4 border border-[#2a2a2a]">
      {/* Exercise Header */}
      <div className="mb-4">
        <h3 className="text-white font-semibold text-lg">{template.name}</h3>
        <p className="text-gray-500 text-sm">
          {template.targetSets} sets × {repRange} reps
        </p>
      </div>
      
      {/* Sets Grid Header */}
      <div className="grid grid-cols-[auto_1fr_1fr] gap-2 mb-2 px-1">
        <div className="w-8"></div>
        <p className="text-gray-500 text-xs text-center">Weight (kg)</p>
        <p className="text-gray-500 text-xs text-center">Reps</p>
      </div>
      
      {/* Individual Sets */}
      <div className="space-y-2">
        {exerciseLog.sets.map((set, setIndex) => {
          const prevSet = previousSets?.[setIndex];
          
          return (
            <div key={setIndex} className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
              {/* Set Number */}
              <div className="w-8 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-sm font-medium">{setIndex + 1}</span>
              </div>
              
              {/* Weight Input */}
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={set.weight || ''}
                  onChange={(e) => onUpdateSet(setIndex, 'weight', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#2a2a2a] text-white rounded-lg p-2.5 border border-[#3a3a3a] text-center text-base"
                />
                {prevSet && prevSet.weight > 0 && (
                  <span className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-gray-500">
                    prev: {prevSet.weight}
                  </span>
                )}
              </div>
              
              {/* Reps Input */}
              <div className="relative">
                <input
                  type="number"
                  placeholder={repRange}
                  value={set.reps || ''}
                  onChange={(e) => onUpdateSet(setIndex, 'reps', parseInt(e.target.value) || 0)}
                  className="w-full bg-[#2a2a2a] text-white rounded-lg p-2.5 border border-[#3a3a3a] text-center text-base"
                />
                {prevSet && prevSet.reps > 0 && (
                  <span className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-gray-500">
                    prev: {prevSet.reps}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Previous workout comparison note */}
      {previousSets && previousSets.some(s => s.weight > 0) && (
        <div className="mt-5 pt-3 border-t border-[#2a2a2a]">
          <p className="text-gray-500 text-xs">
            💪 Last session: {previousSets.filter(s => s.weight > 0).length} sets logged
          </p>
        </div>
      )}
    </div>
  );
}
