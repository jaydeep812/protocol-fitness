/* ============================================
   Protocol - Nutrition Tracker Component
   Track protein intake from various sources
   ============================================ */

import { useState, useMemo } from 'react';
import type { NutritionEntry } from '../types';
import { PROTEIN_VALUES } from '../types';
import {
  saveNutrition,
  getNutritionByDate,
  getNutritionSettings,
  updateNutritionSettings,
  getTodayDate,
  generateId,
} from '../utils/storage';
import { calculateProtein, calculateProteinPercentage } from '../utils/calculations';

export default function NutritionTracker() {
  // ============================================
  // Initialize state from localStorage
  // ============================================
  
  const initialEntry = useMemo(() => {
    const todayEntry = getNutritionByDate(getTodayDate());
    if (todayEntry) {
      return {
        eggs: todayEntry.eggs,
        chickenGrams: todayEntry.chickenGrams,
        paneerGrams: todayEntry.paneerGrams,
        soyaGrams: todayEntry.soyaGrams,
        wheyScoops: todayEntry.wheyScoops,
      };
    }
    return {
      eggs: 0,
      chickenGrams: 0,
      paneerGrams: 0,
      soyaGrams: 0,
      wheyScoops: 0,
    };
  }, []);
  
  const initialTarget = useMemo(() => {
    return getNutritionSettings().dailyProteinTarget;
  }, []);
  
  const initialIsSaved = useMemo(() => {
    return !!getNutritionByDate(getTodayDate());
  }, []);
  
  // ============================================
  // State
  // ============================================
  
  const [entry, setEntry] = useState<Partial<NutritionEntry>>(initialEntry);
  const [dailyTarget, setDailyTarget] = useState(initialTarget);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  
  // Calculate total protein
  const totalProtein = useMemo(() => calculateProtein(entry), [entry]);
  const percentage = useMemo(
    () => calculateProteinPercentage(totalProtein, dailyTarget),
    [totalProtein, dailyTarget]
  );
  
  // ============================================
  // Handlers
  // ============================================
  
  function updateEntry(field: keyof NutritionEntry, value: number) {
    setEntry({ ...entry, [field]: value });
    setIsSaved(false);
  }
  
  function handleSave() {
    const nutritionEntry: NutritionEntry = {
      id: generateId(),
      date: getTodayDate(),
      eggs: entry.eggs || 0,
      chickenGrams: entry.chickenGrams || 0,
      paneerGrams: entry.paneerGrams || 0,
      soyaGrams: entry.soyaGrams || 0,
      wheyScoops: entry.wheyScoops || 0,
      createdAt: new Date().toISOString(),
    };
    
    saveNutrition(nutritionEntry);
    setIsSaved(true);
  }
  
  function handleSaveTarget() {
    updateNutritionSettings({ dailyProteinTarget: dailyTarget });
    setIsEditingTarget(false);
  }
  
  // ============================================
  // Render
  // ============================================
  
  // Food items configuration
  const foodItems = [
    { key: 'eggs', label: 'Eggs', unit: 'eggs', protein: PROTEIN_VALUES.egg, unitLabel: 'per egg' },
    { key: 'chickenGrams', label: 'Chicken', unit: 'g', protein: PROTEIN_VALUES.chicken, unitLabel: 'per 100g' },
    { key: 'paneerGrams', label: 'Paneer', unit: 'g', protein: PROTEIN_VALUES.paneer, unitLabel: 'per 100g' },
    { key: 'soyaGrams', label: 'Soya Chunks', unit: 'g', protein: PROTEIN_VALUES.soya, unitLabel: 'per 100g' },
    { key: 'wheyScoops', label: 'Whey Protein', unit: 'scoops', protein: PROTEIN_VALUES.whey, unitLabel: 'per scoop' },
  ] as const;
  
  return (
    <div className="p-4 pb-24 space-y-4">
      {/* ============================================
          Header
          ============================================ */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Nutrition</h1>
        <p className="text-gray-400 text-sm">Track your protein intake</p>
      </div>
      
      {/* ============================================
          Progress Card
          ============================================ */}
      <div className="bg-[#1f1f1f] rounded-2xl p-5 border border-[#2a2a2a]">
        {/* Target (editable) */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-400 text-sm">Daily Target</p>
          {isEditingTarget ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(parseInt(e.target.value) || 0)}
                className="w-20 bg-[#2a2a2a] text-white rounded-lg p-2 border border-[#3a3a3a] text-center text-sm"
              />
              <button
                onClick={handleSaveTarget}
                className="text-green-400 text-sm font-medium"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTarget(true)}
              className="text-gray-400 text-sm flex items-center gap-1"
            >
              {dailyTarget}g
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Progress Display */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <span className="text-4xl font-bold text-white">{totalProtein}</span>
            <span className="text-gray-400 text-lg ml-1">/ {dailyTarget}g</span>
          </div>
          <span className={`text-2xl font-bold ${
            percentage >= 100 ? 'text-green-400' : 
            percentage >= 70 ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {percentage}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage >= 100 ? 'bg-green-500' :
              percentage >= 70 ? 'bg-yellow-500' : 'bg-purple-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        {/* Status Message */}
        <p className={`text-sm mt-3 ${
          percentage >= 100 ? 'text-green-400' : 'text-gray-500'
        }`}>
          {percentage >= 100 
            ? '🎉 Target reached!' 
            : `${dailyTarget - totalProtein}g remaining`
          }
        </p>
      </div>
      
      {/* ============================================
          Food Input Cards
          ============================================ */}
      <div className="space-y-3">
        {foodItems.map(item => {
          const value = entry[item.key] || 0;
          const itemProtein = item.key === 'eggs' || item.key === 'wheyScoops'
            ? value * item.protein
            : (value / 100) * item.protein;
          
          return (
            <div 
              key={item.key}
              className="bg-[#1f1f1f] rounded-xl p-4 border border-[#2a2a2a]"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-gray-500 text-xs">{item.protein}g protein {item.unitLabel}</p>
                </div>
                <span className="text-purple-400 font-medium">
                  +{Math.round(itemProtein)}g
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Decrement Button */}
                <button
                  onClick={() => updateEntry(item.key, Math.max(0, value - (item.unit === 'g' ? 50 : 1)))}
                  className="w-12 h-12 rounded-xl bg-[#2a2a2a] text-gray-400 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                
                {/* Input */}
                <div className="flex-1">
                  <input
                    type="number"
                    value={value || ''}
                    onChange={(e) => updateEntry(item.key, parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-[#2a2a2a] text-white text-center text-xl font-bold rounded-xl p-3 border border-[#3a3a3a]"
                  />
                </div>
                
                {/* Increment Button */}
                <button
                  onClick={() => updateEntry(item.key, value + (item.unit === 'g' ? 50 : 1))}
                  className="w-12 h-12 rounded-xl bg-[#2a2a2a] text-gray-400 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-500 text-xs text-center mt-2">{item.unit}</p>
            </div>
          );
        })}
      </div>
      
      {/* ============================================
          Save Button
          ============================================ */}
      <button
        onClick={handleSave}
        className={`w-full py-4 px-4 rounded-xl font-bold text-lg transition-all ${
          isSaved
            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
            : 'bg-green-500 text-white active:scale-[0.98]'
        }`}
      >
        {isSaved ? '✓ Saved' : 'Save Nutrition'}
      </button>
    </div>
  );
}
