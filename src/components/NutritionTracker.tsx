/* ============================================
   Protocol - Nutrition Tracker Component
   Template-based meal logging with one-tap entries
   ============================================ */

import { useState, useMemo } from 'react';
import type { MealCategory, MealTemplate, MealLogEntry, Macros } from '../types/mealTemplates';
import {
  getTemplatesByCategory,
  calculateTotalMacros,
  getCategoryEmoji,
} from '../types/mealTemplates';
import {
  saveMealLog,
  deleteMealLog,
  getMealLogsByDate,
  getNutritionTargets,
  saveNutritionTargets,
  getTodayDate,
  generateId,
} from '../utils/storage';

// ============================================
// Types
// ============================================

type ViewMode = 'log' | 'today';

// ============================================
// Main Component
// ============================================

export default function NutritionTracker() {
  // ============================================
  // State
  // ============================================
  
  const [viewMode, setViewMode] = useState<ViewMode>('log');
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('Breakfast');
  const [todayLogs, setTodayLogs] = useState<MealLogEntry[]>(() => 
    getMealLogsByDate(getTodayDate())
  );
  
  // Targets
  const initialTargets = useMemo(() => getNutritionTargets(), []);
  const [targets, setTargets] = useState(initialTargets);
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  
  // Calculate totals
  const totalMacros = useMemo(() => calculateTotalMacros(todayLogs), [todayLogs]);
  
  // Progress percentages
  const proteinProgress = Math.min((totalMacros.protein / targets.protein) * 100, 100);
  const calorieProgress = Math.min((totalMacros.calories / targets.calories) * 100, 100);
  
  // ============================================
  // Handlers
  // ============================================
  
  function handleLogMeal(template: MealTemplate) {
    const entry: MealLogEntry = {
      id: generateId(),
      date: getTodayDate(),
      templateId: template.id,
      templateName: template.name,
      category: template.category,
      macros: { ...template.macros },
      loggedAt: new Date().toISOString(),
    };
    
    saveMealLog(entry);
    setTodayLogs(getMealLogsByDate(getTodayDate()));
  }
  
  function handleDeleteLog(logId: string) {
    deleteMealLog(logId);
    setTodayLogs(getMealLogsByDate(getTodayDate()));
  }
  
  function handleSaveTargets() {
    saveNutritionTargets(targets);
    setIsEditingTargets(false);
  }
  
  // ============================================
  // Render
  // ============================================
  
  const categories: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  
  return (
    <div className="p-4 pb-24 space-y-4">
      {/* ============================================
          Header
          ============================================ */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Nutrition</h1>
        <p className="text-gray-400 text-sm">Log your meals</p>
      </div>
      
      {/* ============================================
          Daily Summary Card
          ============================================ */}
      <DailySummaryCard
        macros={totalMacros}
        targets={targets}
        proteinProgress={proteinProgress}
        calorieProgress={calorieProgress}
        isEditingTargets={isEditingTargets}
        onEditTargets={() => setIsEditingTargets(true)}
        onSaveTargets={handleSaveTargets}
        onUpdateTargets={setTargets}
      />
      
      {/* ============================================
          View Mode Selector
          ============================================ */}
      <div className="flex gap-2 p-1 bg-[#1a1a1a] rounded-xl">
        <button
          onClick={() => setViewMode('log')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            viewMode === 'log'
              ? 'bg-[#2a2a2a] text-white'
              : 'text-gray-400'
          }`}
        >
          Log Meal
        </button>
        <button
          onClick={() => setViewMode('today')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            viewMode === 'today'
              ? 'bg-[#2a2a2a] text-white'
              : 'text-gray-400'
          }`}
        >
          Today ({todayLogs.length})
        </button>
      </div>
      
      {/* ============================================
          Log Meal View
          ============================================ */}
      {viewMode === 'log' && (
        <>
          {/* Category Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-green-500 text-white'
                    : 'bg-[#1f1f1f] text-gray-400 border border-[#2a2a2a]'
                }`}
              >
                {getCategoryEmoji(category)} {category}
              </button>
            ))}
          </div>
          
          {/* Meal Templates */}
          <div className="space-y-3">
            {getTemplatesByCategory(selectedCategory).map(template => (
              <MealTemplateCard
                key={template.id}
                template={template}
                onLog={handleLogMeal}
              />
            ))}
          </div>
        </>
      )}
      
      {/* ============================================
          Today's Meals View
          ============================================ */}
      {viewMode === 'today' && (
        <div className="space-y-3">
          {todayLogs.length === 0 ? (
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#2a2a2a] text-center">
              <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍽️</span>
              </div>
              <p className="text-gray-400">No meals logged today</p>
              <p className="text-gray-500 text-sm mt-1">Tap "Log Meal" to get started</p>
            </div>
          ) : (
            todayLogs.map(log => (
              <LoggedMealCard
                key={log.id}
                log={log}
                onDelete={handleDeleteLog}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Daily Summary Card Component
// ============================================

interface DailySummaryCardProps {
  macros: Macros;
  targets: { protein: number; calories: number };
  proteinProgress: number;
  calorieProgress: number;
  isEditingTargets: boolean;
  onEditTargets: () => void;
  onSaveTargets: () => void;
  onUpdateTargets: (targets: { protein: number; calories: number }) => void;
}

function DailySummaryCard({
  macros,
  targets,
  proteinProgress,
  calorieProgress,
  isEditingTargets,
  onEditTargets,
  onSaveTargets,
  onUpdateTargets,
}: DailySummaryCardProps) {
  return (
    <div className="bg-[#1f1f1f] rounded-2xl p-5 border border-[#2a2a2a]">
      {/* Targets Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm font-medium">Daily Totals</p>
        {isEditingTargets ? (
          <button
            onClick={onSaveTargets}
            className="text-green-400 text-sm font-medium"
          >
            Save
          </button>
        ) : (
          <button
            onClick={onEditTargets}
            className="text-gray-500 text-xs flex items-center gap-1"
          >
            Edit Targets
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Protein Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Protein</span>
          {isEditingTargets ? (
            <input
              type="number"
              value={targets.protein}
              onChange={(e) => onUpdateTargets({ ...targets, protein: parseInt(e.target.value) || 0 })}
              className="w-16 bg-[#2a2a2a] text-white rounded-lg p-1 border border-[#3a3a3a] text-center text-sm"
            />
          ) : (
            <span className="text-white font-bold">
              {macros.protein}g <span className="text-gray-500 font-normal">/ {targets.protein}g</span>
            </span>
          )}
        </div>
        <div className="w-full h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              proteinProgress >= 100 ? 'bg-green-500' : 'bg-purple-500'
            }`}
            style={{ width: `${proteinProgress}%` }}
          />
        </div>
      </div>
      
      {/* Calories Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Calories</span>
          {isEditingTargets ? (
            <input
              type="number"
              value={targets.calories}
              onChange={(e) => onUpdateTargets({ ...targets, calories: parseInt(e.target.value) || 0 })}
              className="w-20 bg-[#2a2a2a] text-white rounded-lg p-1 border border-[#3a3a3a] text-center text-sm"
            />
          ) : (
            <span className="text-white font-bold">
              {macros.calories} <span className="text-gray-500 font-normal">/ {targets.calories}</span>
            </span>
          )}
        </div>
        <div className="w-full h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              calorieProgress >= 100 ? 'bg-green-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${calorieProgress}%` }}
          />
        </div>
      </div>
      
      {/* Macro Breakdown */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#2a2a2a]">
        <div className="text-center">
          <p className="text-purple-400 font-bold">{macros.protein}g</p>
          <p className="text-gray-500 text-xs">Protein</p>
        </div>
        <div className="text-center">
          <p className="text-cyan-400 font-bold">{macros.carbs}g</p>
          <p className="text-gray-500 text-xs">Carbs</p>
        </div>
        <div className="text-center">
          <p className="text-yellow-400 font-bold">{macros.fat}g</p>
          <p className="text-gray-500 text-xs">Fat</p>
        </div>
        <div className="text-center">
          <p className="text-green-400 font-bold">{macros.fiber}g</p>
          <p className="text-gray-500 text-xs">Fiber</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Meal Template Card Component
// ============================================

interface MealTemplateCardProps {
  template: MealTemplate;
  onLog: (template: MealTemplate) => void;
}

function MealTemplateCard({ template, onLog }: MealTemplateCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="bg-[#1f1f1f] rounded-xl border border-[#2a2a2a] overflow-hidden">
      {/* Main Card - Tappable */}
      <div 
        className="p-4 flex items-center justify-between"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">{template.name}</h3>
          <p className="text-gray-500 text-sm mt-1">
            {template.macros.calories} kcal • {template.macros.protein}g protein
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLog(template);
          }}
          className="bg-green-500 text-white px-5 py-3 rounded-xl font-medium active:scale-95 transition-transform"
        >
          Log
        </button>
      </div>
      
      {/* Expandable Details */}
      {showDetails && (
        <div className="px-4 pb-4 pt-2 border-t border-[#2a2a2a]">
          {/* Items */}
          <div className="mb-3">
            <p className="text-gray-500 text-xs mb-2">Includes:</p>
            <div className="flex flex-wrap gap-2">
              {template.items.map((item, idx) => (
                <span key={idx} className="bg-[#2a2a2a] text-gray-300 text-xs px-2 py-1 rounded-lg">
                  {item}
                </span>
              ))}
            </div>
          </div>
          
          {/* Full Macro Breakdown */}
          <div className="grid grid-cols-5 gap-2">
            <div className="text-center">
              <p className="text-purple-400 text-sm font-bold">{template.macros.protein}g</p>
              <p className="text-gray-500 text-[10px]">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-cyan-400 text-sm font-bold">{template.macros.carbs}g</p>
              <p className="text-gray-500 text-[10px]">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 text-sm font-bold">{template.macros.fat}g</p>
              <p className="text-gray-500 text-[10px]">Fat</p>
            </div>
            <div className="text-center">
              <p className="text-green-400 text-sm font-bold">{template.macros.fiber}g</p>
              <p className="text-gray-500 text-[10px]">Fiber</p>
            </div>
            <div className="text-center">
              <p className="text-orange-400 text-sm font-bold">{template.macros.calories}</p>
              <p className="text-gray-500 text-[10px]">kcal</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Logged Meal Card Component
// ============================================

interface LoggedMealCardProps {
  log: MealLogEntry;
  onDelete: (logId: string) => void;
}

function LoggedMealCard({ log, onDelete }: LoggedMealCardProps) {
  const time = new Date(log.loggedAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  return (
    <div className="bg-[#1f1f1f] rounded-xl p-4 border border-[#2a2a2a]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getCategoryEmoji(log.category)}</span>
            <h3 className="text-white font-medium">{log.templateName}</h3>
          </div>
          <p className="text-gray-500 text-xs">{log.category} • {time}</p>
          
          {/* Macros Row */}
          <div className="flex gap-3 mt-3">
            <span className="text-purple-400 text-sm">{log.macros.protein}g P</span>
            <span className="text-cyan-400 text-sm">{log.macros.carbs}g C</span>
            <span className="text-yellow-400 text-sm">{log.macros.fat}g F</span>
            <span className="text-gray-400 text-sm">{log.macros.calories} kcal</span>
          </div>
        </div>
        
        {/* Delete Button */}
        <button
          onClick={() => onDelete(log.id)}
          className="text-gray-500 hover:text-red-400 p-2 -mr-2 -mt-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
